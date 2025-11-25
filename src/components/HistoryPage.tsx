import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VirtualizedList } from "./VirtualizedList";
import { BackToTop } from "./BackToTop";
import { SkeletonCard } from "./SkeletonCard";
import { PullToRefresh } from "./PullToRefresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalendarIcon, Clock, LayoutGrid, List } from "lucide-react";
import type { Child } from "@/pages/Dashboard";
import { getTodayInUserTimezone, formatDateInUserTimezone } from "@/lib/timezone";

// Define types for the data structures
type SleepData = {
  bedtime: string;
  wake_up: string;
  total_sleep: number;
  quality: string;
  notes: string;
};

type MoodData = {
  mood_level: number;
  factors: string;
  notes: string;
};

type NutritionData = {
  meals: string;
  snacks: string;
  hydration: string;
  notes: string;
};

type MedicationData = {
  medications: string;
  dosage: string;
  time: string;
  notes: string;
};

type ActivityData = {
  activity_type: string;
  duration: number;
  intensity: string;
  notes: string;
};

type CrisisData = {
  triggers: string;
  strategies: string;
  outcome: string;
  notes: string;
};

type IncidentData = {
  type: string;
  description: string;
  resolution: string;
  notes: string;
};

type HyperfocusData = {
  topic: string;
  duration: number;
  outcome: string;
  notes: string;
};

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

const hasData = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  
  return Object.values(obj).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return hasData(value);
    return value !== null && value !== undefined && value !== '';
  });
};

export function HistoryPage({ children, selectedChild, onSelectChild }: HistoryPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const todayDate = getTodayInUserTimezone();
  const PAGE_SIZE = 20;
  const [isCompactView, setIsCompactView] = useState(() => {
    const saved = localStorage.getItem("historyViewMode");
    return saved === "compact";
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleViewMode = () => {
    const newMode = !isCompactView;
    setIsCompactView(newMode);
    localStorage.setItem("historyViewMode", newMode ? "compact" : "normal");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = window.innerHeight - containerRef.current.offsetTop - 100;
        setContainerHeight(Math.max(400, height));
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const fetchRecords = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!selectedChild) return;

    if (!append) {
      setLoading(true);
    }
    
    let query = supabase
      .from("daily_records")
      .select("*", { count: 'exact' })
      .eq("child_id", selectedChild.id)
      .order("record_date", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (startDate && endDate) {
      query = query.gte("record_date", startDate).lte("record_date", endDate);
    }

    const { data, error, count } = await query;

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching records:", error);
    } else {
      const newRecords = (data as DailyRecord[]) || [];
      setRecords(prev => append ? [...prev, ...newRecords] : newRecords);
      setHasMore(count ? (pageNum + 1) * PAGE_SIZE < count : false);
      setPage(pageNum);
    }
    setLoading(false);
  }, [selectedChild, startDate, endDate, PAGE_SIZE]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchRecords(page + 1, true);
    }
  }, [loading, hasMore, page, fetchRecords]);

  const handleRefresh = async () => {
    setPage(0);
    setRecords([]);
    setHasMore(true);
    await fetchRecords(0, false);
  };

  useEffect(() => {
    if (selectedChild) {
      setPage(0);
      setRecords([]);
      setHasMore(true);
      fetchRecords(0, false);
    }
  }, [selectedChild, startDate, endDate]);

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

  return (
    <PullToRefresh onRefresh={handleRefresh} isOffline={isOffline}>
      <div className="p-6 md:p-8">
        <BackToTop />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">History</h1>
              <p className="text-muted-foreground">Today's records for {selectedChild.name}</p>
            </div>

            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleViewMode}
                aria-label={isCompactView ? "Switch to normal view" : "Switch to compact view"}
                className="gap-2"
              >
                {isCompactView ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                {isCompactView ? "Normal" : "Compact"}
              </Button>

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
            </div>
          </div>

          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className={isCompactView ? "p-3" : "p-4"}>
              <div className="flex items-center gap-3">
                <Clock className={isCompactView ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"} />
                <div>
                  <p className={`font-medium text-muted-foreground ${isCompactView ? "text-xs" : "text-sm"}`}>Current Time</p>
                  <p className={`font-bold text-primary ${isCompactView ? "text-base" : "text-lg"}`}>
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

          <Card className="mb-6 border-border">
            <CardContent className={isCompactView ? "p-3" : "p-4"}>
              <div className="flex gap-4">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
                <Button onClick={() => {
                  setPage(0);
                  setRecords([]);
                  setHasMore(true);
                  fetchRecords(0, false);
                }}>Apply</Button>
              </div>
            </CardContent>
          </Card>

          {loading && records.length === 0 ? (
            <div 
              className="space-y-4"
              role="status"
              aria-busy="true"
              aria-live="polite"
            >
              <span className="sr-only">Loading records...</span>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} variant="record" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <Card className="shadow-card border-border">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  TODAY'S RECORDS WILL APPEAR HERE WHEN SAVED
                </h3>
                <p className="text-muted-foreground text-lg">
                  {formatDateInUserTimezone(todayDate)}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div ref={containerRef}>
              <VirtualizedList
                items={records}
                estimatedItemHeight={isCompactView ? 600 : 800}
                containerHeight={containerHeight}
                overscan={1}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoading={loading}
                renderItem={(record) => (
                  <Card key={record.id} className={`shadow-card border-border mb-4 ${isCompactView ? "compact-view" : ""}`}>
                    <div className={`bg-primary/5 border-b border-primary/20 ${isCompactView ? "p-2" : "p-4"}`}>
                      <p className={`font-medium text-foreground ${isCompactView ? "text-sm" : "text-base"}`}>
                        <strong>Record Date:</strong> {formatDateInUserTimezone(record.record_date)}
                      </p>
                    </div>
                    <CardContent className={isCompactView ? "p-3 space-y-3" : "p-6 space-y-6"}>
                      {record.sleep_data && hasData(record.sleep_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Sleep Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Bedtime:</strong> {record.sleep_data.bedtime}</p>
                            <p><strong>Wake Up:</strong> {record.sleep_data.wake_up}</p>
                            <p><strong>Total Sleep:</strong> {record.sleep_data.total_sleep} hours</p>
                            <p><strong>Quality:</strong> {record.sleep_data.quality}</p>
                            <p><strong>Notes:</strong> {record.sleep_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.mood_data && hasData(record.mood_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Mood Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Mood Level:</strong> {record.mood_data.mood_level}</p>
                            <p><strong>Factors:</strong> {record.mood_data.factors}</p>
                            <p><strong>Notes:</strong> {record.mood_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.nutrition_data && hasData(record.nutrition_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Nutrition Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Meals:</strong> {record.nutrition_data.meals}</p>
                            <p><strong>Snacks:</strong> {record.nutrition_data.snacks}</p>
                            <p><strong>Hydration:</strong> {record.nutrition_data.hydration}</p>
                            <p><strong>Notes:</strong> {record.nutrition_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.medication_data && hasData(record.medication_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Medication Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Medications:</strong> {record.medication_data.medications}</p>
                            <p><strong>Dosage:</strong> {record.medication_data.dosage}</p>
                            <p><strong>Time:</strong> {record.medication_data.time}</p>
                            <p><strong>Notes:</strong> {record.medication_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.activity_data && hasData(record.activity_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Activity Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Activity Type:</strong> {record.activity_data.activity_type}</p>
                            <p><strong>Duration:</strong> {record.activity_data.duration} minutes</p>
                            <p><strong>Intensity:</strong> {record.activity_data.intensity}</p>
                            <p><strong>Notes:</strong> {record.activity_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.crisis_data && hasData(record.crisis_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Crisis Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Triggers:</strong> {record.crisis_data.triggers}</p>
                            <p><strong>Strategies:</strong> {record.crisis_data.strategies}</p>
                            <p><strong>Outcome:</strong> {record.crisis_data.outcome}</p>
                            <p><strong>Notes:</strong> {record.crisis_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.incident_data && hasData(record.incident_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Incident Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Type:</strong> {record.incident_data.type}</p>
                            <p><strong>Description:</strong> {record.incident_data.description}</p>
                            <p><strong>Resolution:</strong> {record.incident_data.resolution}</p>
                            <p><strong>Notes:</strong> {record.incident_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.hyperfocus_data && hasData(record.hyperfocus_data) && (
                        <div className="mb-4">
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Hyperfocus Data</h4>
                          <div className="text-muted-foreground">
                            <p><strong>Topic:</strong> {record.hyperfocus_data.topic}</p>
                            <p><strong>Duration:</strong> {record.hyperfocus_data.duration} minutes</p>
                            <p><strong>Outcome:</strong> {record.hyperfocus_data.outcome}</p>
                            <p><strong>Notes:</strong> {record.hyperfocus_data.notes}</p>
                          </div>
                        </div>
                      )}

                      {record.extra_notes && (
                        <div>
                          <h4 className={`text-lg font-semibold text-foreground ${isCompactView ? "text-base" : ""}`}>Extra Notes</h4>
                          <div className="text-muted-foreground">
                            {record.extra_notes}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
