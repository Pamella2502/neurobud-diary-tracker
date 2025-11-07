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
import { Loader2, AlertCircle, Save, Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Child } from "@/pages/Dashboard";

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
    breakfast: { quality: string; foods: string[]; notes: string };
    morningSnack: { quality: string; foods: string[]; notes: string };
    lunch: { quality: string; foods: string[]; notes: string };
    afternoonSnack: { quality: string; foods: string[]; notes: string };
    dinner: { quality: string; foods: string[]; notes: string };
    nightSnack: { quality: string; foods: string[]; notes: string };
    waterIntake: string;
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
  extraNotes: string;
};

export function DailyRecordsPage({ children, selectedChild, onSelectChild }: DailyRecordsPageProps) {
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
      breakfast: { quality: "", foods: [], notes: "" },
      morningSnack: { quality: "", foods: [], notes: "" },
      lunch: { quality: "", foods: [], notes: "" },
      afternoonSnack: { quality: "", foods: [], notes: "" },
      dinner: { quality: "", foods: [], notes: "" },
      nightSnack: { quality: "", foods: [], notes: "" },
      waterIntake: "",
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

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadTodayRecords();
    }
  }, [selectedChild]);

  const loadTodayRecords = async () => {
    if (!selectedChild) return;

    const today = new Date().toISOString().split("T")[0];
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
        extraNotes: data.extra_notes || "",
      });
    }
  };

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("daily_records").upsert(
      {
        child_id: selectedChild.id,
        record_date: today,
        user_id: user.id,
        sleep_data: records.sleep,
        mood_data: records.mood,
        nutrition_data: records.nutrition,
        medication_data: records.medication,
        activity_data: records.activities,
        extra_notes: records.extraNotes,
      },
      {
        onConflict: "child_id,record_date",
      }
    );

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Records saved successfully for ${selectedChild.name}!`,
      });
    }
    setSaving(false);
  };

  const addMedication = (period: "morning" | "afternoon" | "evening") => {
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

  const updateMedication = (
    period: "morning" | "afternoon" | "evening",
    index: number,
    field: keyof MedicationEntry,
    value: string
  ) => {
    setRecords((prev) => ({
      ...prev,
      medication: {
        ...prev.medication,
        [period]: prev.medication[period].map((med, i) => (i === index ? { ...med, [field]: value } : med)),
      },
    }));
  };

  const removeMedication = (period: "morning" | "afternoon" | "evening", index: number) => {
    setRecords((prev) => ({
      ...prev,
      medication: {
        ...prev.medication,
        [period]: prev.medication[period].filter((_, i) => i !== index),
      },
    }));
  };

  const addActivity = (period: "morning" | "afternoon" | "evening") => {
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

  const updateActivity = (
    period: "morning" | "afternoon" | "evening",
    index: number,
    field: keyof ActivityEntry,
    value: string
  ) => {
    setRecords((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [period]: prev.activities[period].map((act, i) => (i === index ? { ...act, [field]: value } : act)),
      },
    }));
  };

  const removeActivity = (period: "morning" | "afternoon" | "evening", index: number) => {
    setRecords((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [period]: prev.activities[period].filter((_, i) => i !== index),
      },
    }));
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
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Water Intake (ml)</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      placeholder="e.g., 500"
                      value={records.nutrition.waterIntake}
                      onChange={(e) =>
                        setRecords((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, waterIntake: e.target.value },
                        }))
                      }
                    />
                  </div>

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
                            <Label>Type</Label>
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

                          <div>
                            <Label>Subtype</Label>
                            <Input
                              className="mt-1"
                              placeholder="Activity subtype"
                              value={activity.subtype}
                              onChange={(e) => updateActivity(period, index, "subtype", e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Details</Label>
                            <Textarea
                              className="mt-1"
                              rows={2}
                              placeholder="Activity details..."
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
                  <Label>Activity Notes</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="General activity notes..."
                    value={records.activities.notes}
                    onChange={(e) =>
                      setRecords((prev) => ({ ...prev, activities: { ...prev.activities, notes: e.target.value } }))
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
