import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import type { Child } from "@/pages/Dashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeFilter } from "./progress/DateRangeFilter";
import { SleepAnalytics } from "./progress/SleepAnalytics";
import { MoodAnalytics } from "./progress/MoodAnalytics";
import { NutritionAnalytics } from "./progress/NutritionAnalytics";
import { CrisisAnalytics } from "./progress/CrisisAnalytics";
import { HyperfocusAnalytics } from "./progress/HyperfocusAnalytics";
import { OverallProgress } from "./progress/OverallProgress";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

type ProgressPageProps = {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

type DailyRecord = {
  record_date: string;
  sleep_data: any;
  mood_data: any;
  nutrition_data: any;
  medication_data: any;
  activity_data: any;
  crisis_data: any;
  hyperfocus_data: any;
};

export function ProgressPage({ children, selectedChild, onSelectChild }: ProgressPageProps) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  useEffect(() => {
    if (selectedChild) {
      fetchRecords();
    }
  }, [selectedChild, filterType, selectedDate, customStartDate, customEndDate]);

  const getDateRange = () => {
    if (filterType === 'custom' && customStartDate && customEndDate) {
      return {
        start: customStartDate.toISOString().split('T')[0],
        end: customEndDate.toISOString().split('T')[0],
      };
    }

    const today = selectedDate;
    let start: Date, end: Date;

    switch (filterType) {
      case 'day':
        start = end = today;
        break;
      case 'week':
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'year':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      default:
        start = startOfWeek(today);
        end = endOfWeek(today);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const fetchRecords = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    const { start, end } = getDateRange();
    
    const { data, error } = await supabase
      .from("daily_records")
      .select("*")
      .eq("child_id", selectedChild.id)
      .gte("record_date", start)
      .lte("record_date", end)
      .order("record_date", { ascending: true });

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };


  if (!selectedChild) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Child Selected</h3>
          <p className="text-muted-foreground">Please select a child to view their progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Progress Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights into {selectedChild.name}'s development</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangeFilter
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomRangeChange={(start, end) => {
                setCustomStartDate(start);
                setCustomEndDate(end);
              }}
            />
            
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

        <Tabs defaultValue="overall" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="overall">Overview</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="crisis">Crisis</TabsTrigger>
            <TabsTrigger value="hyperfocus">Hyperfocus</TabsTrigger>
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-6">
            <OverallProgress records={records} loading={loading} />
          </TabsContent>

          <TabsContent value="sleep" className="space-y-6">
            <SleepAnalytics records={records} loading={loading} />
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            <MoodAnalytics records={records} loading={loading} />
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <NutritionAnalytics records={records} loading={loading} />
          </TabsContent>

          <TabsContent value="crisis" className="space-y-6">
            <CrisisAnalytics records={records} loading={loading} />
          </TabsContent>

          <TabsContent value="hyperfocus" className="space-y-6">
            <HyperfocusAnalytics records={records} loading={loading} />
          </TabsContent>

          <TabsContent value="more" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Additional analytics sections coming soon:</p>
              <ul className="mt-4 space-y-2">
                <li>• Medication Adherence</li>
                <li>• Activities & Therapy Progress</li>
                <li>• Unexpected Events Analysis</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            {records.length === 0 
              ? "Continue recording daily data to unlock detailed progress analytics and insights"
              : `Displaying analytics from ${records.length} day${records.length > 1 ? 's' : ''} of recorded data • ${filterType.charAt(0).toUpperCase() + filterType.slice(1)} view`
            }
          </p>
        </div>
      </div>
    </div>
  );
}