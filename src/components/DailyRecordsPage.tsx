import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Save, Plus, X, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Child } from "@/pages/Dashboard";
import { formatDateInUserTimezone, getTodayInUserTimezone } from "@/lib/timezone";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";

type DailyRecordsPageProps = {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

type MedicationEntry = {
  id: number;
  type: string;
  name: string;
  dosage: string;
  time: string;
  sideEffects: string;
};

type ActivityEntry = {
  id: number;
  type: string;
  subtype: string;
  details: string;
};

type CrisisEntry = {
  id: number;
  type: string;
  customType: string;
  intensity: string;
  duration: string;
  triggers: string[];
  customTrigger: string;
  strategies: string[];
  notes: string;
};

type IncidentEntry = {
  id: number;
  type: string;
  customType: string;
  consequences: string[];
  notes: string;
};

type HyperfocusEntry = {
  id: number;
  occurred: string;
  topic: string;
  intensity: string;
  impact: string;
  notes: string;
};

type Period = "morning" | "afternoon" | "evening";

type RecordsState = {
  sleep: {
    quality: string;
    bedtime: string;
    wakeTime: string;
    timeToSleep: string;
    wokeUpDuringSleep: boolean;
    wakeUpReason: string;
    notes: string;
  };
  mood: {
    morning: { mood: string; notes: string };
    afternoon: { mood: string; notes: string };
    evening: { mood: string; notes: string };
  };
  nutrition: {
    breakfast: { quality: string; foods: string[]; notes: string; waterIntake: string };
    morningSnack: { quality: string; foods: string[]; notes: string; waterIntake: string };
    lunch: { quality: string; foods: string[]; notes: string; waterIntake: string };
    afternoonSnack: { quality: string; foods: string[]; notes: string; waterIntake: string };
    dinner: { quality: string; foods: string[]; notes: string; waterIntake: string };
    nightSnack: { quality: string; foods: string[]; notes: string; waterIntake: string };
    generalNotes: string;
  };
  medication: {
    morning: MedicationEntry[];
    afternoon: MedicationEntry[];
    evening: MedicationEntry[];
    notes: string;
  };
  activities: {
    morning: ActivityEntry[];
    afternoon: ActivityEntry[];
    evening: ActivityEntry[];
    notes: string;
  };
  crises: {
    morning: CrisisEntry[];
    afternoon: CrisisEntry[];
    evening: CrisisEntry[];
    notes: string;
  };
  incidents: {
    morning: IncidentEntry[];
    afternoon: IncidentEntry[];
    evening: IncidentEntry[];
    notes: string;
  };
  hyperfocus: {
    morning: HyperfocusEntry[];
    afternoon: HyperfocusEntry[];
    evening: HyperfocusEntry[];
    notes: string;
  };
  extraNotes: string;
};

export function DailyRecordsPage({ children, selectedChild, onSelectChild }: DailyRecordsPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [originalRecords, setOriginalRecords] = useState<RecordsState | null>(null);
  const [records, setRecords] = useState<RecordsState>({
    sleep: {
      quality: "",
      bedtime: "",
      wakeTime: "",
      timeToSleep: "",
      wokeUpDuringSleep: false,
      wakeUpReason: "",
      notes: "",
    },
    mood: {
      morning: { mood: "", notes: "" },
      afternoon: { mood: "", notes: "" },
      evening: { mood: "", notes: "" },
    },
    nutrition: {
      breakfast: { quality: "", foods: [], notes: "", waterIntake: "" },
      morningSnack: { quality: "", foods: [], notes: "", waterIntake: "" },
      lunch: { quality: "", foods: [], notes: "", waterIntake: "" },
      afternoonSnack: { quality: "", foods: [], notes: "", waterIntake: "" },
      dinner: { quality: "", foods: [], notes: "", waterIntake: "" },
      nightSnack: { quality: "", foods: [], notes: "", waterIntake: "" },
      generalNotes: "",
    },
    medication: {
      morning: [],
      afternoon: [],
      evening: [],
      notes: "",
    },
    activities: {
      morning: [],
      afternoon: [],
      evening: [],
      notes: "",
    },
    crises: {
      morning: [],
      afternoon: [],
      evening: [],
      notes: "",
    },
    incidents: {
      morning: [],
      afternoon: [],
      evening: [],
      notes: "",
    },
    hyperfocus: {
      morning: [],
      afternoon: [],
      evening: [],
      notes: "",
    },
    extraNotes: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sleepOptions = ["Excellent", "Good", "Regular", "Poor", "Terrible", "Did not sleep"];
  const moodOptions = ["Happy", "Sad", "Calm", "Irritated", "Anxious", "Agitated", "Tired", "Sensitive", "Normal"];
  const nutritionOptions = ["Excellent", "Good", "Poor", "Terrible", "Did not eat"];
  const foodCategories = ["Grains", "Fruits", "Vegetables", "Proteins", "Dairy", "Beverages", "Water"];
  const medicationTypes = [
    "Atypical Antipsychotics",
    "Stimulants",
    "SSRI",
    "Mood Stabilizers",
    "Sleep Supplements",
    "Acute Crisis Medication",
    "Homeopathic/Natural",
    "None",
    "Other Type",
  ];
  const activityTypes = [
    "ABA Therapy",
    "Occupational Therapy",
    "Speech Therapy",
    "Psychotherapy",
    "Physiotherapy/Motor Skills",
    "Recreation/Physical Exercise",
    "None",
    "Other Type",
  ];
  const crisisTypes = [
    "Meltdown",
    "Shutdown",
    "Emotional",
    "Behavioral",
    "Sensory",
    "Social Anxiety",
    "None",
    "Other Type",
  ];
  const triggerCategories = {
    sensorial: {
      label: "Sensorial",
      subOptions: [
        "Barulho alto",
        "Luz forte",
        "Cheiro forte",
        "Textura de roupa ou objeto",
        "Multidão / Ambiente agitado",
      ],
    },
    rotina_tempo: {
      label: "Rotina / Tempo",
      subOptions: [
        "Mudança inesperada na rotina",
        "Atraso em uma atividade esperada",
        "Transição entre atividades",
        "Fim de algo que a criança gosta",
      ],
    },
    fisico: {
      label: "Físico",
      subOptions: [
        "Fome",
        "Sede",
        "Sono / cansaço",
        "Dor ou desconforto",
        "Doença (febre, gripe)",
      ],
    },
    emocional_psicologico: {
      label: "Emocional / Psicológico",
      subOptions: [
        "Frustração",
        "Espera prolongada",
        "Não conseguiu se comunicar",
        "Não entendeu uma instrução",
        "Contrariado (\"alguém disse não\")",
      ],
    },
    social: {
      label: "Social",
      subOptions: [
        "Interação com desconhecidos",
        "Repreensão / bronca",
        "Brincadeiras com outras crianças",
        "Separação dos pais / cuidadores",
        "Falta de atenção",
      ],
    },
    ambiente: {
      label: "Ambiente",
      subOptions: [
        "Lugar novo ou desconhecido",
        "Mudança de temperatura (calor/frio)",
        "Muito estímulo visual ou auditivo",
        "Falta de estrutura / previsibilidade",
      ],
    },
    nao_identificado: {
      label: "Não identificado",
      subOptions: [],
    },
    outro: {
      label: "Outro",
      subOptions: [],
    },
  };
  const incidentTypes = [
    "Routine change",
    "Excessive noise",
    "Crowded environment",
    "Visitors or strangers",
    "Illness or discomfort",
    "Activity cancellation",
    "None",
    "Other Type",
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadTodayRecords();
    }
  }, [selectedChild]);

  const loadTodayRecords = async () => {
    if (!selectedChild) return;

    const today = getTodayInUserTimezone();
    const { data, error } = await supabase
      .from("daily_records")
      .select("*")
      .eq("child_id", selectedChild.id)
      .eq("record_date", today)
      .maybeSingle();

    if (error) {
      console.error("Error loading records:", error);
    } else if (data) {
      setRecords({
        sleep: (data.sleep_data as any) || records.sleep,
        mood: (data.mood_data as any) || records.mood,
        nutrition: (data.nutrition_data as any) || records.nutrition,
        medication: (data.medication_data as any) || records.medication,
        activities: (data.activity_data as any) || records.activities,
        crises: (data.crisis_data as any) || records.crises,
        incidents: (data.incident_data as any) || records.incidents,
        hyperfocus: (data.hyperfocus_data as any) || records.hyperfocus,
        extraNotes: data.extra_notes || "",
      });
    }
  };

  const { performUpdate } = useOptimisticUpdate({
    onUpdate: async (data: RecordsState) => {
      if (!selectedChild) throw new Error("No child selected");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = getTodayInUserTimezone();

      const { error } = await supabase.from("daily_records").upsert(
        {
          child_id: selectedChild.id,
          record_date: today,
          user_id: user.id,
          sleep_data: data.sleep,
          mood_data: data.mood,
          nutrition_data: data.nutrition,
          medication_data: data.medication,
          activity_data: data.activities,
          crisis_data: data.crises,
          incident_data: data.incidents,
          hyperfocus_data: data.hyperfocus,
          extra_notes: data.extraNotes,
        },
        {
          onConflict: "child_id,record_date",
        }
      );

      if (error) throw error;
    },
    successMessage: `Records saved successfully for ${selectedChild?.name}!`,
    errorMessage: "Failed to save records. Please try again.",
  });

  const saveRecords = async () => {
    if (!selectedChild) {
      toast({
        title: "Error",
        description: "Please select a child first",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    // Store original state for potential revert
    setOriginalRecords({ ...records });

    await performUpdate(
      records,
      // Optimistic update (already applied)
      () => {},
      // Revert on error
      () => {
        if (originalRecords) {
          setRecords(originalRecords);
        }
      }
    );

    setSaving(false);
  };

  const addMedication = (period: Period) => {
    const newMedication: MedicationEntry = {
      id: Date.now() + Math.random(),
      type: "",
      name: "",
      dosage: "",
      time: "",
      sideEffects: "",
    };
    setRecords((prev) => ({
      ...prev,
      medication: {
        ...prev.medication,
        [period]: [...prev.medication[period], newMedication],
      },
    }));
  };

  const updateMedication = (period: Period, index: number, field: keyof MedicationEntry, value: string) => {
    setRecords((prev) => ({
      ...prev,
      medication: {
        ...prev.medication,
        [period]: prev.medication[period].map((med, i) => (i === index ? { ...med, [field]: value } : med)),
      },
    }));
  };

  const removeMedication = (period: Period, index: number) => {
    setRecords((prev) => ({
      ...prev,
      medication: {
        ...prev.medication,
        [period]: prev.medication[period].filter((_, i) => i !== index),
      },
    }));
  };

  const addActivity = (period: Period) => {
    const newActivity: ActivityEntry = {
      id: Date.now() + Math.random(),
      type: "",
      subtype: "",
      details: "",
    };
    setRecords((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [period]: [...prev.activities[period], newActivity],
      },
    }));
  };

  const updateActivity = (period: Period, index: number, field: keyof ActivityEntry, value: string) => {
    setRecords((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [period]: prev.activities[period].map((act, i) => (i === index ? { ...act, [field]: value } : act)),
      },
    }));
  };

  const removeActivity = (period: Period, index: number) => {
    setRecords((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [period]: prev.activities[period].filter((_, i) => i !== index),
      },
    }));
  };

  // Crisis functions
  const addCrisis = (period: Period) => {
    const newCrisis: CrisisEntry = {
      id: Date.now() + Math.random(),
      type: "",
      customType: "",
      intensity: "",
      duration: "",
      triggers: [],
      customTrigger: "",
      strategies: [],
      notes: "",
    };
    setRecords((prev) => ({
      ...prev,
      crises: {
        ...prev.crises,
        [period]: [...prev.crises[period], newCrisis],
      },
    }));
  };

  const updateCrisis = (period: Period, index: number, field: string, value: any) => {
    setRecords((prev) => ({
      ...prev,
      crises: {
        ...prev.crises,
        [period]: prev.crises[period].map((crisis, i) => (i === index ? { ...crisis, [field]: value } : crisis)),
      },
    }));
  };

  const removeCrisis = (period: Period, index: number) => {
    setRecords((prev) => ({
      ...prev,
      crises: {
        ...prev.crises,
        [period]: prev.crises[period].filter((_, i) => i !== index),
      },
    }));
  };

  // Incident functions
  const addIncident = (period: Period) => {
    const newIncident: IncidentEntry = {
      id: Date.now() + Math.random(),
      type: "",
      customType: "",
      consequences: [],
      notes: "",
    };
    setRecords((prev) => ({
      ...prev,
      incidents: {
        ...prev.incidents,
        [period]: [...prev.incidents[period], newIncident],
      },
    }));
  };

  const updateIncident = (period: Period, index: number, field: string, value: any) => {
    setRecords((prev) => ({
      ...prev,
      incidents: {
        ...prev.incidents,
        [period]: prev.incidents[period].map((incident, i) => (i === index ? { ...incident, [field]: value } : incident)),
      },
    }));
  };

  const removeIncident = (period: Period, index: number) => {
    setRecords((prev) => ({
      ...prev,
      incidents: {
        ...prev.incidents,
        [period]: prev.incidents[period].filter((_, i) => i !== index),
      },
    }));
  };

  // Hyperfocus functions
  const addHyperfocus = (period: Period) => {
    const newHyperfocus: HyperfocusEntry = {
      id: Date.now() + Math.random(),
      occurred: "",
      topic: "",
      intensity: "",
      impact: "",
      notes: "",
    };
    setRecords((prev) => ({
      ...prev,
      hyperfocus: {
        ...prev.hyperfocus,
        [period]: [...prev.hyperfocus[period], newHyperfocus],
      },
    }));
  };

  const updateHyperfocus = (period: Period, index: number, field: string, value: any) => {
    setRecords((prev) => ({
      ...prev,
      hyperfocus: {
        ...prev.hyperfocus,
        [period]: prev.hyperfocus[period].map((hf, i) => (i === index ? { ...hf, [field]: value } : hf)),
      },
    }));
  };

  const removeHyperfocus = (period: Period, index: number) => {
    setRecords((prev) => ({
      ...prev,
      hyperfocus: {
        ...prev.hyperfocus,
        [period]: prev.hyperfocus[period].filter((_, i) => i !== index),
      },
    }));
  };

  // Helper function for activity subtypes
  const getActivitySubtypes = (activityType: string): string[] => {
    const subtypes: Record<string, string[]> = {
      "ABA Therapy": [
        "Social skills training",
        "Functional communication training",
        "Self-control training",
        "Visual/auditory discrimination training",
        "Positive reinforcement / Motivational activity",
      ],
      "Occupational Therapy": [
        "Fine motor coordination (buttons, puzzles)",
        "Gross motor coordination (jumping, stairs)",
        "Daily living skills (dressing, hygiene)",
        "Sensory training (textures, weight, proprioception)",
        "Motor planning / Task sequencing",
      ],
      "Speech Therapy": [
        "Articulation exercises (specific sounds)",
        "Receptive language training (comprehension)",
        "Expressive language training (speech)",
        "Rhythm and intonation exercises",
        "Breathing and swallowing training",
      ],
      "Psychotherapy": [
        "Emotional regulation activities",
        "Self-awareness and feeling identification training",
        "Therapeutic games",
        "Relaxation / breathing techniques",
        "Coping strategies (coping skills)",
      ],
      "Physiotherapy/Motor Skills": [
        "Joint stretching and mobility",
        "Muscle strengthening",
        "Balance and motor coordination",
        "Gait and posture",
        "Breathing exercises",
      ],
      "Recreation/Physical Exercise": [
        "Running/jumping/outdoor games",
        "Dance or rhythm",
        "Ball / light sports",
        "Motor activity circuit",
        "Sensory play activities (water, sand, playdough)",
      ],
    };
    return subtypes[activityType] || [];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading children data...</p>
        </div>
      </div>
    );
  }

  if (!selectedChild && children.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">👶</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Children Added</h3>
          <p className="text-muted-foreground">Please add a child first to start tracking records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Records</h1>
            <p className="text-muted-foreground">Track today's progress and activities</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <Select
              value={selectedChild?.id || ""}
              onValueChange={(value) => {
                const child = children.find((c) => c.id === value);
                if (child) onSelectChild(child);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} ({child.age} years)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={saveRecords} disabled={saving || !selectedChild}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Records
            </Button>
          </div>
        </div>

        {/* Date and Time Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatDateInUserTimezone(getTodayInUserTimezone())}
                </p>
                <p className="text-lg font-bold text-primary">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedChild ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a Child</h3>
              <p className="text-muted-foreground">Please select a child to start recording daily information</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Warning Banner */}
            <Alert className="mb-6 border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                <strong>Recording for {selectedChild.name}:</strong> You can add or edit today's records at any time
                until 11:58 PM. Make sure to save each change correctly. After 12:00 AM, records become part of the
                new day.
              </AlertDescription>
            </Alert>

            {/* Sleep Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>😴 Sleep</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Sleep Quality</Label>
                    <Select
                      value={records.sleep.quality}
                      onValueChange={(value) =>
                        setRecords((prev) => ({ ...prev, sleep: { ...prev.sleep, quality: value } }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        {sleepOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Bedtime</Label>
                    <Input
                      type="time"
                      className="mt-1"
                      value={records.sleep.bedtime}
                      onChange={(e) =>
                        setRecords((prev) => ({ ...prev, sleep: { ...prev.sleep, bedtime: e.target.value } }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Wake Time</Label>
                    <Input
                      type="time"
                      className="mt-1"
                      value={records.sleep.wakeTime}
                      onChange={(e) =>
                        setRecords((prev) => ({ ...prev, sleep: { ...prev.sleep, wakeTime: e.target.value } }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Time to Fall Asleep (minutes)</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      placeholder="e.g., 30"
                      value={records.sleep.timeToSleep}
                      onChange={(e) =>
                        setRecords((prev) => ({ ...prev, sleep: { ...prev.sleep, timeToSleep: e.target.value } }))
                      }
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Checkbox
                      id="woke-up"
                      checked={records.sleep.wokeUpDuringSleep}
                      onCheckedChange={(checked) =>
                        setRecords((prev) => ({
                          ...prev,
                          sleep: { ...prev.sleep, wokeUpDuringSleep: checked as boolean },
                        }))
                      }
                    />
                    <Label htmlFor="woke-up" className="cursor-pointer">
                      Woke up during sleep
                    </Label>
                  </div>

                  {records.sleep.wokeUpDuringSleep && (
                    <div className="md:col-span-2">
                      <Label>Reason for waking up</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g., Nightmare, Noise, etc."
                        value={records.sleep.wakeUpReason}
                        onChange={(e) =>
                          setRecords((prev) => ({ ...prev, sleep: { ...prev.sleep, wakeUpReason: e.target.value } }))
                        }
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Label>Sleep Notes</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Additional notes about sleep..."
                      value={records.sleep.notes}
                      onChange={(e) =>
                        setRecords((prev) => ({ ...prev, sleep: { ...prev.sleep, notes: e.target.value } }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mood Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>😊 Mood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(["morning", "afternoon", "evening"] as const).map((period) => (
                    <div key={period} className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-foreground capitalize">{period}</h4>

                      <div>
                        <Label>Mood</Label>
                        <Select
                          value={records.mood[period].mood}
                          onValueChange={(value) =>
                            setRecords((prev) => ({
                              ...prev,
                              mood: { ...prev.mood, [period]: { ...prev.mood[period], mood: value } },
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select mood" />
                          </SelectTrigger>
                          <SelectContent>
                            {moodOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          className="mt-1"
                          rows={2}
                          placeholder={`${period} mood notes...`}
                          value={records.mood[period].notes}
                          onChange={(e) =>
                            setRecords((prev) => ({
                              ...prev,
                              mood: { ...prev.mood, [period]: { ...prev.mood[period], notes: e.target.value } },
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>🍎 Nutrition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: "breakfast" as const, label: "Breakfast" },
                    { key: "morningSnack" as const, label: "Morning Snack" },
                    { key: "lunch" as const, label: "Lunch" },
                    { key: "afternoonSnack" as const, label: "Afternoon Snack" },
                    { key: "dinner" as const, label: "Dinner" },
                    { key: "nightSnack" as const, label: "Night Snack" },
                  ].map((meal) => (
                    <div key={meal.key} className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-foreground">{meal.label}</h4>

                      <div>
                        <Label>Quality</Label>
                        <Select
                          value={records.nutrition[meal.key].quality}
                          onValueChange={(value) =>
                            setRecords((prev) => ({
                              ...prev,
                              nutrition: {
                                ...prev.nutrition,
                                [meal.key]: { ...prev.nutrition[meal.key], quality: value },
                              },
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                            {nutritionOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Food Categories</Label>
                        <div className="space-y-2 mt-2">
                          {foodCategories.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${meal.key}-${category}`}
                                checked={records.nutrition[meal.key].foods.includes(category)}
                                onCheckedChange={(checked) => {
                                  const newFoods = checked
                                    ? [...records.nutrition[meal.key].foods, category]
                                    : records.nutrition[meal.key].foods.filter((f) => f !== category);
                                  setRecords((prev) => ({
                                    ...prev,
                                    nutrition: {
                                      ...prev.nutrition,
                                      [meal.key]: { ...prev.nutrition[meal.key], foods: newFoods },
                                    },
                                  }));
                                }}
                              />
                              <Label htmlFor={`${meal.key}-${category}`} className="text-sm cursor-pointer">
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>What was eaten</Label>
                        <Input
                          className="mt-1"
                          placeholder="Describe what was eaten..."
                          value={records.nutrition[meal.key].notes}
                          onChange={(e) =>
                            setRecords((prev) => ({
                              ...prev,
                              nutrition: {
                                ...prev.nutrition,
                                [meal.key]: { ...prev.nutrition[meal.key], notes: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>

                      {records.nutrition[meal.key].foods.includes("Water") && (
                        <div>
                          <Label>Water Intake (ml)</Label>
                          <Input
                            type="number"
                            className="mt-1"
                            placeholder="e.g., 500"
                            value={records.nutrition[meal.key].waterIntake}
                            onChange={(e) =>
                              setRecords((prev) => ({
                                ...prev,
                                nutrition: {
                                  ...prev.nutrition,
                                  [meal.key]: { ...prev.nutrition[meal.key], waterIntake: e.target.value },
                                },
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>General Nutrition Notes</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Overall nutrition notes..."
                      value={records.nutrition.generalNotes}
                      onChange={(e) =>
                        setRecords((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, generalNotes: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medication Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>💊 Medication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(["morning", "afternoon", "evening"] as const).map((period) => (
                  <div key={period}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground capitalize">{period}</h4>
                      <Button type="button" size="sm" onClick={() => addMedication(period)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Medication
                      </Button>
                    </div>

                    {records.medication[period].map((med, index) => (
                      <div key={med.id} className="border rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-muted-foreground">Medication #{index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedication(period, index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={med.type}
                              onValueChange={(value) => updateMedication(period, index, "type", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {medicationTypes.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Medication Name</Label>
                            <Input
                              className="mt-1"
                              placeholder="Medication name"
                              value={med.name}
                              onChange={(e) => updateMedication(period, index, "name", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label>Dosage</Label>
                            <Input
                              className="mt-1"
                              placeholder="e.g., 10mg"
                              value={med.dosage}
                              onChange={(e) => updateMedication(period, index, "dosage", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label>Time</Label>
                            <Input
                              type="time"
                              className="mt-1"
                              value={med.time}
                              onChange={(e) => updateMedication(period, index, "time", e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Side Effects</Label>
                            <Textarea
                              className="mt-1"
                              rows={2}
                              placeholder="Any side effects observed..."
                              value={med.sideEffects}
                              onChange={(e) => updateMedication(period, index, "sideEffects", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {records.medication[period].length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No medications added for {period}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <Label>Medication Notes</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="General medication notes..."
                    value={records.medication.notes}
                    onChange={(e) =>
                      setRecords((prev) => ({ ...prev, medication: { ...prev.medication, notes: e.target.value } }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Activities Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>🏃 Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(["morning", "afternoon", "evening"] as const).map((period) => (
                  <div key={period}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground capitalize">{period}</h4>
                      <Button type="button" size="sm" onClick={() => addActivity(period)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Activity
                      </Button>
                    </div>

                    {records.activities[period].map((activity, index) => (
                      <div key={activity.id} className="border rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-muted-foreground">Activity #{index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(period, index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Activity Type</Label>
                            <Select
                              value={activity.type}
                              onValueChange={(value) => updateActivity(period, index, "type", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {activityTypes.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {activity.type && activity.type !== "None" && activity.type !== "Other Type" && (
                            <div>
                              <Label>Specific Activity</Label>
                              <Select
                                value={activity.subtype}
                                onValueChange={(value) => updateActivity(period, index, "subtype", value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select specific activity" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getActivitySubtypes(activity.type).map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {activity.type === "Other Type" && (
                            <div>
                              <Label>Specify Activity Type</Label>
                              <Input
                                className="mt-1"
                                placeholder="Describe the activity type..."
                                value={activity.subtype}
                                onChange={(e) => updateActivity(period, index, "subtype", e.target.value)}
                              />
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <Label>Activity Details & Notes</Label>
                            <Textarea
                              className="mt-1"
                              rows={3}
                              placeholder="Details about the activity, duration, response, etc."
                              value={activity.details}
                              onChange={(e) => updateActivity(period, index, "details", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {records.activities[period].length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No activities added for {period}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <Label>General Activity Notes</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="Overall activity notes and observations..."
                    value={records.activities.notes}
                    onChange={(e) =>
                      setRecords((prev) => ({ ...prev, activities: { ...prev.activities, notes: e.target.value } }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Crises Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>🚨 Crises</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(["morning", "afternoon", "evening"] as Period[]).map((period) => (
                  <div key={period}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground capitalize">{period}</h4>
                      <Button type="button" size="sm" onClick={() => addCrisis(period)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Crisis
                      </Button>
                    </div>

                    {records.crises[period].map((crisis, index) => (
                      <div key={crisis.id} className="border rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-muted-foreground">Crisis #{index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCrisis(period, index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Crisis Type</Label>
                            <Select
                              value={crisis.type}
                              onValueChange={(value) => updateCrisis(period, index, "type", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {crisisTypes.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {crisis.type === "Other Type" && (
                            <div>
                              <Label>Specify Crisis Type</Label>
                              <Input
                                className="mt-1"
                                placeholder="Describe the crisis type..."
                                value={crisis.customType}
                                onChange={(e) => updateCrisis(period, index, "customType", e.target.value)}
                              />
                            </div>
                          )}

                          <div>
                            <Label>Intensity</Label>
                            <Select
                              value={crisis.intensity}
                              onValueChange={(value) => updateCrisis(period, index, "intensity", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select intensity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mild">Mild</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Intense">Intense</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Duration (minutes)</Label>
                            <Input
                              type="number"
                              className="mt-1"
                              placeholder="e.g., 30"
                              value={crisis.duration}
                              onChange={(e) => updateCrisis(period, index, "duration", e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Triggers</Label>
                            <div className="space-y-4 mt-2">
                              {Object.entries(triggerCategories).map(([categoryKey, category]) => {
                                // Check if this category is selected
                                const categoryTriggers = crisis.triggers || [];
                                const isCategorySelected = categoryTriggers.some((t) => 
                                  typeof t === 'string' && t.startsWith(`${categoryKey}:`)
                                );
                                
                                console.log('Category:', categoryKey, 'Selected:', isCategorySelected, 'Triggers:', categoryTriggers);
                                
                                return (
                                  <div key={categoryKey} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${period}-crisis-${index}-trigger-cat-${categoryKey}`}
                                        checked={isCategorySelected}
                                        onCheckedChange={(checked) => {
                                          const currentTriggers = crisis.triggers || [];
                                          console.log('Checkbox changed:', categoryKey, checked, currentTriggers);
                                          if (checked) {
                                            // Add category marker
                                            const newTriggers = [...currentTriggers, `${categoryKey}:`];
                                            console.log('Adding category, new triggers:', newTriggers);
                                            updateCrisis(period, index, "triggers", newTriggers);
                                          } else {
                                            // Remove all triggers from this category
                                            const newTriggers = currentTriggers.filter((t) => 
                                              typeof t === 'string' && !t.startsWith(`${categoryKey}:`)
                                            );
                                            console.log('Removing category, new triggers:', newTriggers);
                                            updateCrisis(period, index, "triggers", newTriggers);
                                          }
                                        }}
                                      />
                                      <Label 
                                        htmlFor={`${period}-crisis-${index}-trigger-cat-${categoryKey}`} 
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {category.label}
                                      </Label>
                                    </div>
                                    
                                    {isCategorySelected && category.subOptions.length > 0 && (
                                      <div className="ml-6 space-y-2 border-l-2 border-border pl-4">
                                        {category.subOptions.map((subOption) => {
                                          const triggerValue = `${categoryKey}:${subOption}`;
                                          const isSubOptionChecked = categoryTriggers.includes(triggerValue);
                                          return (
                                            <div key={subOption} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`${period}-crisis-${index}-trigger-${categoryKey}-${subOption}`}
                                                checked={isSubOptionChecked}
                                                onCheckedChange={(checked) => {
                                                  const currentTriggers = crisis.triggers || [];
                                                  const categoryMarker = `${categoryKey}:`;
                                                  let newTriggers;
                                                  
                                                  if (checked) {
                                                    newTriggers = [...currentTriggers, triggerValue];
                                                  } else {
                                                    newTriggers = currentTriggers.filter((t) => t !== triggerValue);
                                                  }
                                                  
                                                  // Ensure category marker exists if we have sub-options selected
                                                  const hasSubOptions = newTriggers.some((t) => 
                                                    typeof t === 'string' && t.startsWith(`${categoryKey}:`) && t !== categoryMarker
                                                  );
                                                  if (hasSubOptions && !newTriggers.includes(categoryMarker)) {
                                                    newTriggers.push(categoryMarker);
                                                  }
                                                  
                                                  console.log('Sub-option changed:', subOption, checked, newTriggers);
                                                  updateCrisis(period, index, "triggers", newTriggers);
                                                }}
                                              />
                                              <Label 
                                                htmlFor={`${period}-crisis-${index}-trigger-${categoryKey}-${subOption}`} 
                                                className="text-sm cursor-pointer"
                                              >
                                                {subOption}
                                              </Label>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    
                                    {isCategorySelected && categoryKey === "outro" && (
                                      <div className="ml-6">
                                        <Input
                                          className="mt-1"
                                          placeholder="Descreva o gatilho..."
                                          value={crisis.customTrigger || ""}
                                          onChange={(e) => updateCrisis(period, index, "customTrigger", e.target.value)}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <Label>Calming Strategies</Label>
                            <div className="space-y-2 mt-2">
                              {[
                                "Breathing technique",
                                "Comfort object",
                                "Alone time",
                                "Physical contact",
                                "Music or visual stimulus",
                                "Reduced stimuli",
                                "Nothing worked",
                                "Other type",
                              ].map((strategy) => (
                                <div key={strategy} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${period}-crisis-${index}-strategy-${strategy}`}
                                    checked={crisis.strategies?.includes(strategy) || false}
                                    onCheckedChange={(checked) => {
                                      const currentStrategies = crisis.strategies || [];
                                      const newStrategies = checked
                                        ? [...currentStrategies, strategy]
                                        : currentStrategies.filter((s) => s !== strategy);
                                      updateCrisis(period, index, "strategies", newStrategies);
                                    }}
                                  />
                                  <Label htmlFor={`${period}-crisis-${index}-strategy-${strategy}`} className="text-sm cursor-pointer">
                                    {strategy}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <Label>Crisis Notes</Label>
                            <Textarea
                              className="mt-1"
                              rows={3}
                              placeholder="Detailed notes about the crisis..."
                              value={crisis.notes}
                              onChange={(e) => updateCrisis(period, index, "notes", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {records.crises[period].length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">No crises recorded for {period}</p>
                    )}
                  </div>
                ))}

                <div>
                  <Label>General Crisis Notes</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="Overall crisis patterns and observations..."
                    value={records.crises.notes}
                    onChange={(e) =>
                      setRecords((prev) => ({ ...prev, crises: { ...prev.crises, notes: e.target.value } }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Unexpected Occurrences Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>🔄 Unexpected Occurrences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(["morning", "afternoon", "evening"] as Period[]).map((period) => (
                  <div key={period}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground capitalize">{period}</h4>
                      <Button type="button" size="sm" onClick={() => addIncident(period)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Occurrence
                      </Button>
                    </div>

                    {records.incidents[period].map((incident, index) => (
                      <div key={incident.id} className="border rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-muted-foreground">Occurrence #{index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIncident(period, index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Occurrence Type</Label>
                            <Select
                              value={incident.type}
                              onValueChange={(value) => updateIncident(period, index, "type", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {incidentTypes.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {incident.type === "Other Type" && (
                            <div>
                              <Label>Specify Occurrence Type</Label>
                              <Input
                                className="mt-1"
                                placeholder="Describe the occurrence..."
                                value={incident.customType}
                                onChange={(e) => updateIncident(period, index, "customType", e.target.value)}
                              />
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <Label>Consequences</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                              {[
                                "Mood change",
                                "Increased anxiety",
                                "Triggered crisis",
                                "Activity refusal",
                                "Appetite change",
                                "Sleep change",
                                "Communication difficulty",
                                "Isolation",
                                "Regressive behavior",
                                "None",
                                "Other type",
                              ].map((consequence) => (
                                <div key={consequence} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${period}-incident-${index}-consequence-${consequence}`}
                                    checked={incident.consequences?.includes(consequence) || false}
                                    onCheckedChange={(checked) => {
                                      const currentConsequences = incident.consequences || [];
                                      const newConsequences = checked
                                        ? [...currentConsequences, consequence]
                                        : currentConsequences.filter((c) => c !== consequence);
                                      updateIncident(period, index, "consequences", newConsequences);
                                    }}
                                  />
                                  <Label htmlFor={`${period}-incident-${index}-consequence-${consequence}`} className="text-sm cursor-pointer">
                                    {consequence}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <Label>Occurrence Notes</Label>
                            <Textarea
                              className="mt-1"
                              rows={3}
                              placeholder="Details about the occurrence and impact..."
                              value={incident.notes}
                              onChange={(e) => updateIncident(period, index, "notes", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {records.incidents[period].length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No occurrences recorded for {period}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <Label>General Occurrence Notes</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="Overall patterns and observations about unexpected occurrences..."
                    value={records.incidents.notes}
                    onChange={(e) =>
                      setRecords((prev) => ({ ...prev, incidents: { ...prev.incidents, notes: e.target.value } }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hyperfocus Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>🎯 Hyperfocus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(["morning", "afternoon", "evening"] as Period[]).map((period) => (
                  <div key={period}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground capitalize">{period}</h4>
                      <Button type="button" size="sm" onClick={() => addHyperfocus(period)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Hyperfocus
                      </Button>
                    </div>

                    {records.hyperfocus[period].map((hyperfocus, index) => (
                      <div key={hyperfocus.id} className="border rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-muted-foreground">Hyperfocus #{index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHyperfocus(period, index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Hyperfocus Occurred?</Label>
                            <Select
                              value={hyperfocus.occurred}
                              onValueChange={(value) => updateHyperfocus(period, index, "occurred", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {hyperfocus.occurred === "Yes" && (
                            <>
                              <div>
                                <Label>Hyperfocus Topic</Label>
                                <Input
                                  className="mt-1"
                                  placeholder="What was the focus topic?"
                                  value={hyperfocus.topic}
                                  onChange={(e) => updateHyperfocus(period, index, "topic", e.target.value)}
                                />
                              </div>

                              <div>
                                <Label>Intensity</Label>
                                <Select
                                  value={hyperfocus.intensity}
                                  onValueChange={(value) => updateHyperfocus(period, index, "intensity", value)}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select intensity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Mild">Mild</SelectItem>
                                    <SelectItem value="Moderate">Moderate</SelectItem>
                                    <SelectItem value="Intense">Intense</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Impact</Label>
                                <Select
                                  value={hyperfocus.impact}
                                  onValueChange={(value) => updateHyperfocus(period, index, "impact", value)}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select impact" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Positive">Positive</SelectItem>
                                    <SelectItem value="Neutral">Neutral</SelectItem>
                                    <SelectItem value="Challenging">Challenging</SelectItem>
                                    <SelectItem value="Negative">Negative</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}

                          <div className="md:col-span-2">
                            <Label>Hyperfocus Notes</Label>
                            <Textarea
                              className="mt-1"
                              rows={3}
                              placeholder="Details about the hyperfocus experience..."
                              value={hyperfocus.notes}
                              onChange={(e) => updateHyperfocus(period, index, "notes", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {records.hyperfocus[period].length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No hyperfocus recorded for {period}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <Label>General Hyperfocus Notes</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="Overall hyperfocus patterns and observations..."
                    value={records.hyperfocus.notes}
                    onChange={(e) =>
                      setRecords((prev) => ({ ...prev, hyperfocus: { ...prev.hyperfocus, notes: e.target.value } }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Extra Notes */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>📝 Extra Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={6}
                  placeholder="Any additional notes, observations, or important information for today..."
                  value={records.extraNotes}
                  onChange={(e) => setRecords((prev) => ({ ...prev, extraNotes: e.target.value }))}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={saveRecords} disabled={saving} size="lg">
                {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Save All Records
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
