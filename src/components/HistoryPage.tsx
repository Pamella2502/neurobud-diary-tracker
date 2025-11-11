import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { Child } from "@/pages/Dashboard";

type HistoryPageProps = {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

type DailyRecord = {
  id: string;
  record_date: string;
  sleep_data: any;
  mood_data: any;
  nutrition_data: any;
  medication_data: any;
  activity_data: any;
  crisis_data: any;
  incident_data: any;
  hyperfocus_data: any;
  extra_notes: string;
};

export function HistoryPage({ children, selectedChild, onSelectChild }: HistoryPageProps) {
  const [records, setRecords] = useState<DailyRecord | null>(null);
  const [allRecordDates, setAllRecordDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (selectedChild) {
      fetchAllRecordDates();
      fetchRecords();
    }
  }, [selectedChild]);

  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchRecords();
    }
  }, [selectedDate]);

  const fetchAllRecordDates = async () => {
    if (!selectedChild) return;

    const { data, error } = await supabase
      .from("daily_records")
      .select("record_date")
      .eq("child_id", selectedChild.id)
      .order("record_date", { ascending: false });

    if (error) {
      console.error("Error fetching record dates:", error);
    } else {
      setAllRecordDates(data?.map((r) => r.record_date) || []);
    }
  };

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

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = allRecordDates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex < allRecordDates.length - 1) {
      setSelectedDate(allRecordDates[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(allRecordDates[currentIndex - 1]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString("en-US", {
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
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Child Selected</h3>
          <p className="text-muted-foreground">Please select a child to view their history</p>
        </div>
      </div>
    );
  }

  const hasRecords = allRecordDates.length > 0;
  const currentIndex = allRecordDates.indexOf(selectedDate);
  const canGoPrev = currentIndex < allRecordDates.length - 1;
  const canGoNext = currentIndex > 0;

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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('prev')}
                disabled={!canGoPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-48"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('next')}
                disabled={!canGoNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading records...</p>
            </CardContent>
          </Card>
        ) : !hasRecords ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Records Yet</h3>
              <p className="text-muted-foreground">No records have been saved for {selectedChild.name} yet.</p>
              <p className="text-muted-foreground mt-2">Start tracking by going to Daily Records page.</p>
            </CardContent>
          </Card>
        ) : !records ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Records Found</h3>
              <p className="text-muted-foreground">No records found for {formatDate(selectedDate)}</p>
              {hasRecords && (
                <p className="text-muted-foreground mt-2">
                  You have {allRecordDates.length} day{allRecordDates.length > 1 ? 's' : ''} with records. 
                  Use the date picker to view them.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                <strong>Viewing records for:</strong> {formatDate(selectedDate)}
              </p>
              {hasRecords && (
                <p className="text-sm text-muted-foreground mt-1">
                  Record {currentIndex + 1} of {allRecordDates.length} days tracked
                </p>
              )}
            </div>

            {/* Sleep Record */}
            {records.sleep_data && Object.keys(records.sleep_data).length > 0 && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">😴</span> Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {records.sleep_data.quality && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Quality</label>
                        <p className="text-foreground">{records.sleep_data.quality}</p>
                      </div>
                    )}
                    {records.sleep_data.bedtime && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Bedtime</label>
                        <p className="text-foreground">{records.sleep_data.bedtime}</p>
                      </div>
                    )}
                    {records.sleep_data.wakeTime && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Wake Time</label>
                        <p className="text-foreground">{records.sleep_data.wakeTime}</p>
                      </div>
                    )}
                    {records.sleep_data.timeToSleep && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Time to Fall Asleep</label>
                        <p className="text-foreground">{records.sleep_data.timeToSleep} minutes</p>
                      </div>
                    )}
                    {records.sleep_data.wokeUpDuringSleep && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Woke Up During Sleep</label>
                        <p className="text-foreground">Yes</p>
                      </div>
                    )}
                    {records.sleep_data.wakeUpReason && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Wake Up Reason</label>
                        <p className="text-foreground">{records.sleep_data.wakeUpReason}</p>
                      </div>
                    )}
                  </div>
                  {records.sleep_data.notes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                      <p className="text-foreground whitespace-pre-wrap">{records.sleep_data.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mood Record */}
            {records.mood_data && Object.keys(records.mood_data).length > 0 && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">😊</span> Mood
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['morning', 'afternoon', 'evening'].map((period) => (
                      records.mood_data[period] && (
                        <div key={period} className="border rounded-lg p-3">
                          <label className="block text-sm font-medium text-muted-foreground mb-2 capitalize">{period}</label>
                          <p className="text-foreground font-semibold">{records.mood_data[period].mood || "Not recorded"}</p>
                          {records.mood_data[period].notes && (
                            <p className="text-sm text-muted-foreground mt-2">{records.mood_data[period].notes}</p>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nutrition Record */}
            {records.nutrition_data && Object.keys(records.nutrition_data).length > 0 && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🍎</span> Nutrition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'nightSnack'].map((meal) => {
                      const mealData = records.nutrition_data[meal];
                      if (!mealData || !mealData.quality) return null;
                      
                      const mealLabels: { [key: string]: string } = {
                        breakfast: 'Breakfast',
                        morningSnack: 'Morning Snack',
                        lunch: 'Lunch',
                        afternoonSnack: 'Afternoon Snack',
                        dinner: 'Dinner',
                        nightSnack: 'Night Snack'
                      };
                      
                      return (
                        <div key={meal} className="border rounded-lg p-3">
                          <label className="block text-sm font-medium text-muted-foreground mb-2">{mealLabels[meal]}</label>
                          <p className="text-foreground font-semibold mb-1">{mealData.quality}</p>
                          {mealData.foods && mealData.foods.length > 0 && (
                            <p className="text-xs text-muted-foreground mb-1">Categories: {mealData.foods.join(', ')}</p>
                          )}
                          {mealData.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{mealData.notes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {records.nutrition_data.waterIntake && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Water Intake</label>
                      <p className="text-foreground">{records.nutrition_data.waterIntake} ml</p>
                    </div>
                  )}
                  {records.nutrition_data.generalNotes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">General Notes</label>
                      <p className="text-foreground whitespace-pre-wrap">{records.nutrition_data.generalNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medication Record */}
            {records.medication_data && Object.keys(records.medication_data).some(key => 
              Array.isArray(records.medication_data[key]) && records.medication_data[key].length > 0
            ) && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">💊</span> Medication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {['morning', 'afternoon', 'evening'].map((period) => {
                    const meds = records.medication_data[period];
                    if (!meds || meds.length === 0) return null;
                    
                    return (
                      <div key={period} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-foreground mb-3 capitalize">{period}</h4>
                        <div className="space-y-3">
                          {meds.map((med: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {med.type && <div><span className="text-muted-foreground">Type:</span> {med.type}</div>}
                                {med.name && <div><span className="text-muted-foreground">Name:</span> {med.name}</div>}
                                {med.dosage && <div><span className="text-muted-foreground">Dosage:</span> {med.dosage}</div>}
                                {med.time && <div><span className="text-muted-foreground">Time:</span> {med.time}</div>}
                              </div>
                              {med.sideEffects && (
                                <p className="text-sm text-muted-foreground mt-2">Side effects: {med.sideEffects}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {records.medication_data.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">General Notes</label>
                      <p className="text-foreground whitespace-pre-wrap">{records.medication_data.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activities Record */}
            {records.activity_data && Object.keys(records.activity_data).some(key => 
              Array.isArray(records.activity_data[key]) && records.activity_data[key].length > 0
            ) && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🏃</span> Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {['morning', 'afternoon', 'evening'].map((period) => {
                    const activities = records.activity_data[period];
                    if (!activities || activities.length === 0) return null;
                    
                    return (
                      <div key={period} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-foreground mb-3 capitalize">{period}</h4>
                        <div className="space-y-3">
                          {activities.map((activity: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                              <p className="font-medium text-foreground">{activity.type}</p>
                              {activity.subtype && <p className="text-sm text-muted-foreground">Subtype: {activity.subtype}</p>}
                              {activity.details && <p className="text-sm mt-2">{activity.details}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Crises Record */}
            {records.crisis_data && Object.keys(records.crisis_data).some(key => 
              Array.isArray(records.crisis_data[key]) && records.crisis_data[key].length > 0
            ) && (
              <Card className="shadow-card border-border border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🚨</span> Crises
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {['morning', 'afternoon', 'evening'].map((period) => {
                    const crises = records.crisis_data[period];
                    if (!crises || crises.length === 0) return null;
                    
                    return (
                      <div key={period} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-foreground mb-3 capitalize">{period}</h4>
                        <div className="space-y-3">
                          {crises.map((crisis: any, idx: number) => (
                            <div key={idx} className="border border-red-200 dark:border-red-900 rounded-lg p-3 bg-red-50 dark:bg-red-950/20">
                              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                <div><span className="text-muted-foreground">Type:</span> {crisis.type || crisis.customType}</div>
                                {crisis.intensity && <div><span className="text-muted-foreground">Intensity:</span> {crisis.intensity}</div>}
                                {crisis.duration && <div><span className="text-muted-foreground">Duration:</span> {crisis.duration} min</div>}
                              </div>
                              {crisis.triggers && crisis.triggers.length > 0 && (
                                <p className="text-sm text-muted-foreground">Triggers: {crisis.triggers.join(', ')}</p>
                              )}
                              {crisis.strategies && crisis.strategies.length > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">Strategies: {crisis.strategies.join(', ')}</p>
                              )}
                              {crisis.notes && (
                                <p className="text-sm mt-2">{crisis.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Incidents Record */}
            {records.incident_data && Object.keys(records.incident_data).some(key => 
              Array.isArray(records.incident_data[key]) && records.incident_data[key].length > 0
            ) && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🔄</span> Unexpected Occurrences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {['morning', 'afternoon', 'evening'].map((period) => {
                    const incidents = records.incident_data[period];
                    if (!incidents || incidents.length === 0) return null;
                    
                    return (
                      <div key={period} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-foreground mb-3 capitalize">{period}</h4>
                        <div className="space-y-3">
                          {incidents.map((incident: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                              <p className="font-medium text-foreground">{incident.type || incident.customType}</p>
                              {incident.consequences && incident.consequences.length > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">Consequences: {incident.consequences.join(', ')}</p>
                              )}
                              {incident.notes && (
                                <p className="text-sm mt-2">{incident.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Hyperfocus Record */}
            {records.hyperfocus_data && Object.keys(records.hyperfocus_data).some(key => 
              Array.isArray(records.hyperfocus_data[key]) && records.hyperfocus_data[key].length > 0
            ) && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🎯</span> Hyperfocus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {['morning', 'afternoon', 'evening'].map((period) => {
                    const hyperfocusItems = records.hyperfocus_data[period];
                    if (!hyperfocusItems || hyperfocusItems.length === 0) return null;
                    
                    return (
                      <div key={period} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-foreground mb-3 capitalize">{period}</h4>
                        <div className="space-y-3">
                          {hyperfocusItems.map((hf: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                              <p className="font-medium text-foreground">Occurred: {hf.occurred}</p>
                              {hf.occurred === 'Yes' && (
                                <>
                                  {hf.topic && <p className="text-sm mt-1"><span className="text-muted-foreground">Topic:</span> {hf.topic}</p>}
                                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                    {hf.intensity && <div><span className="text-muted-foreground">Intensity:</span> {hf.intensity}</div>}
                                    {hf.impact && <div><span className="text-muted-foreground">Impact:</span> {hf.impact}</div>}
                                  </div>
                                </>
                              )}
                              {hf.notes && (
                                <p className="text-sm mt-2">{hf.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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