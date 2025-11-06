import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Child } from "@/pages/Dashboard";

type DailyRecordsPageProps = {
  child: Child;
};

export function DailyRecordsPage({ child }: DailyRecordsPageProps) {
  const [records, setRecords] = useState({
    sleep: { quality: "", notes: "" },
    mood: { morning: "", afternoon: "", evening: "", notes: "" },
    nutrition: { breakfast: "", lunch: "", dinner: "", notes: "" },
    extraNotes: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const sleepOptions = ["Excellent", "Good", "Regular", "Poor", "Terrible", "Did not sleep"];
  const moodOptions = ["Happy", "Sad", "Calm", "Irritated", "Anxious", "Agitated", "Tired", "Sensitive", "Normal"];
  const nutritionOptions = ["Excellent", "Good", "Poor", "Terrible", "Did not eat"];

  useEffect(() => {
    loadTodayRecords();
  }, [child]);

  const loadTodayRecords = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("daily_records")
      .select("*")
      .eq("child_id", child.id)
      .eq("record_date", today)
      .maybeSingle();

    if (error) {
      console.error("Error loading records:", error);
    } else if (data) {
      setRecords({
        sleep: (data.sleep_data as any) || { quality: "", notes: "" },
        mood: (data.mood_data as any) || { morning: "", afternoon: "", evening: "", notes: "" },
        nutrition: (data.nutrition_data as any) || { breakfast: "", lunch: "", dinner: "", notes: "" },
        extraNotes: data.extra_notes || "",
      });
    }
  };

  const saveRecords = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("daily_records").upsert(
      {
        child_id: child.id,
        record_date: today,
        sleep_data: records.sleep,
        mood_data: records.mood,
        nutrition_data: records.nutrition,
        extra_notes: records.extraNotes,
        user_id: user.id,
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
        description: "Records saved successfully!",
      });
    }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Daily Records</h1>
            <p className="text-muted-foreground">for {child.name}</p>
          </div>
          <Button onClick={saveRecords} disabled={saving} className="shadow-soft">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Records
          </Button>
        </div>

        {/* Warning Banner */}
        <Alert className="mb-6 border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Important:</strong> You can add or edit today's records at any time until 11:58 PM. Make sure
            to save each change correctly. After 12:00 AM, records become part of the new day.
          </AlertDescription>
        </Alert>

        {/* Sleep Section */}
        <Card className="mb-6 shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sleep</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sleep-quality">Quality</Label>
              <Select
                value={records.sleep.quality}
                onValueChange={(value) => setRecords({ ...records, sleep: { ...records.sleep, quality: value } })}
              >
                <SelectTrigger id="sleep-quality" className="mt-1">
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
              <Label htmlFor="sleep-notes">Notes</Label>
              <Textarea
                id="sleep-notes"
                placeholder="Sleep notes..."
                className="mt-1"
                value={records.sleep.notes}
                onChange={(e) => setRecords({ ...records, sleep: { ...records.sleep, notes: e.target.value } })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mood Section */}
        <Card className="mb-6 shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Mood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mood-morning">Morning</Label>
                <Select
                  value={records.mood.morning}
                  onValueChange={(value) => setRecords({ ...records, mood: { ...records.mood, morning: value } })}
                >
                  <SelectTrigger id="mood-morning" className="mt-1">
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
                <Label htmlFor="mood-afternoon">Afternoon</Label>
                <Select
                  value={records.mood.afternoon}
                  onValueChange={(value) => setRecords({ ...records, mood: { ...records.mood, afternoon: value } })}
                >
                  <SelectTrigger id="mood-afternoon" className="mt-1">
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
                <Label htmlFor="mood-evening">Evening</Label>
                <Select
                  value={records.mood.evening}
                  onValueChange={(value) => setRecords({ ...records, mood: { ...records.mood, evening: value } })}
                >
                  <SelectTrigger id="mood-evening" className="mt-1">
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
            </div>
            <div>
              <Label htmlFor="mood-notes">Mood Notes</Label>
              <Textarea
                id="mood-notes"
                placeholder="Mood notes..."
                className="mt-1"
                value={records.mood.notes}
                onChange={(e) => setRecords({ ...records, mood: { ...records.mood, notes: e.target.value } })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Section */}
        <Card className="mb-6 shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Nutrition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nutrition-breakfast">Breakfast</Label>
                <Select
                  value={records.nutrition.breakfast}
                  onValueChange={(value) =>
                    setRecords({ ...records, nutrition: { ...records.nutrition, breakfast: value } })
                  }
                >
                  <SelectTrigger id="nutrition-breakfast" className="mt-1">
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
                <Label htmlFor="nutrition-lunch">Lunch</Label>
                <Select
                  value={records.nutrition.lunch}
                  onValueChange={(value) =>
                    setRecords({ ...records, nutrition: { ...records.nutrition, lunch: value } })
                  }
                >
                  <SelectTrigger id="nutrition-lunch" className="mt-1">
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
                <Label htmlFor="nutrition-dinner">Dinner</Label>
                <Select
                  value={records.nutrition.dinner}
                  onValueChange={(value) =>
                    setRecords({ ...records, nutrition: { ...records.nutrition, dinner: value } })
                  }
                >
                  <SelectTrigger id="nutrition-dinner" className="mt-1">
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
            </div>
            <div>
              <Label htmlFor="nutrition-notes">Nutrition Notes</Label>
              <Textarea
                id="nutrition-notes"
                placeholder="Nutrition notes..."
                className="mt-1"
                value={records.nutrition.notes}
                onChange={(e) =>
                  setRecords({ ...records, nutrition: { ...records.nutrition, notes: e.target.value } })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Extra Notes */}
        <Card className="mb-6 shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Extra Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional notes for today..."
              rows={4}
              value={records.extraNotes}
              onChange={(e) => setRecords({ ...records, extraNotes: e.target.value })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveRecords} disabled={saving} size="lg" className="shadow-card">
            {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save All Records
          </Button>
        </div>
      </div>
    </div>
  );
}