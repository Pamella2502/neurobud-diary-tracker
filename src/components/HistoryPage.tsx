import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar } from "lucide-react";
import type { Child } from "@/pages/Dashboard";

type HistoryPageProps = {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

export function HistoryPage({ children, selectedChild, onSelectChild }: HistoryPageProps) {
  const [records, setRecords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (selectedChild) {
      fetchRecords();
    }
  }, [selectedChild, selectedDate]);

  const fetchRecords = async () => {
    if (!selectedChild) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("daily_records")
      .select("*")
      .eq("child_id", selectedChild.id)
      .eq("record_date", selectedDate)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching records:", error);
    } else {
      setRecords(data || null);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!selectedChild) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Child Selected</h3>
          <p className="text-muted-foreground">Please select a child to view their history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">History</h1>
            <p className="text-muted-foreground">View past records for {selectedChild.name}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            <Select
              value={selectedChild?.id || ""}
              onValueChange={(value) => {
                const child = children.find((c) => c.id === value);
                if (child) onSelectChild(child);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {loading ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading records...</p>
            </CardContent>
          </Card>
        ) : !records ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Records Found</h3>
              <p className="text-muted-foreground">No records found for {formatDate(selectedDate)}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Sleep Record */}
            {records.sleep_data && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">😴</span> Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Quality</label>
                      <p className="text-foreground">{(records.sleep_data as any).quality || "Not recorded"}</p>
                    </div>
                    {(records.sleep_data as any).notes && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                        <p className="text-foreground">{(records.sleep_data as any).notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mood Record */}
            {records.mood_data && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">😊</span> Mood
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Morning</label>
                      <p className="text-foreground">{(records.mood_data as any).morning || "Not recorded"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Afternoon</label>
                      <p className="text-foreground">{(records.mood_data as any).afternoon || "Not recorded"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Evening</label>
                      <p className="text-foreground">{(records.mood_data as any).evening || "Not recorded"}</p>
                    </div>
                  </div>
                  {(records.mood_data as any).notes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                      <p className="text-foreground">{(records.mood_data as any).notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Nutrition Record */}
            {records.nutrition_data && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🍎</span> Nutrition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Breakfast</label>
                      <p className="text-foreground">{(records.nutrition_data as any).breakfast || "Not recorded"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Lunch</label>
                      <p className="text-foreground">{(records.nutrition_data as any).lunch || "Not recorded"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Dinner</label>
                      <p className="text-foreground">{(records.nutrition_data as any).dinner || "Not recorded"}</p>
                    </div>
                  </div>
                  {(records.nutrition_data as any).notes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                      <p className="text-foreground">{(records.nutrition_data as any).notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Extra Notes */}
            {records.extra_notes && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">📝</span> Extra Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{records.extra_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}