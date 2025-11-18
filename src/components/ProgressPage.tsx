import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import type { Child } from "@/pages/Dashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

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
  activity_data: any;
};

export function ProgressPage({ children, selectedChild, onSelectChild }: ProgressPageProps) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedChild) {
      fetchRecords();
    }
  }, [selectedChild]);

  const fetchRecords = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_records")
      .select("record_date, sleep_data, mood_data, nutrition_data, activity_data")
      .eq("child_id", selectedChild.id)
      .order("record_date", { ascending: true })
      .limit(30);

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };

  const getSleepChartData = () => {
    return records.map(record => ({
      date: new Date(record.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      hours: record.sleep_data?.hours || 0,
    })).slice(-7);
  };

  const getMoodChartData = () => {
    const moodValues: { [key: string]: number } = {
      'very-happy': 5,
      'happy': 4,
      'neutral': 3,
      'sad': 2,
      'very-sad': 1
    };
    return records.map(record => ({
      date: new Date(record.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      score: moodValues[record.mood_data?.overall as string] || 3,
    })).slice(-7);
  };

  const getMealsChartData = () => {
    return records.map(record => ({
      date: new Date(record.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      meals: (record.nutrition_data?.meals || []).length,
    })).slice(-7);
  };

  const getActivitiesChartData = () => {
    return records.map(record => ({
      date: new Date(record.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      activities: (record.activity_data?.activities || []).length,
    })).slice(-7);
  };

  const calculateSleepConsistency = () => {
    if (records.length === 0) return 0;
    const sleepHours = records.map(r => r.sleep_data?.hours || 0).filter(h => h > 0);
    if (sleepHours.length === 0) return 0;
    const avg = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
    return Math.min(100, Math.round((avg / 10) * 100));
  };

  const calculateMoodStability = () => {
    if (records.length === 0) return 0;
    const moods = records.map(r => r.mood_data?.overall).filter(Boolean);
    if (moods.length === 0) return 0;
    const happyMoods = moods.filter(m => m === 'happy' || m === 'very-happy').length;
    return Math.round((happyMoods / moods.length) * 100);
  };

  const calculateNutritionQuality = () => {
    if (records.length === 0) return 0;
    const meals = records.map(r => (r.nutrition_data?.meals || []).length).filter(m => m > 0);
    if (meals.length === 0) return 0;
    const avg = meals.reduce((a, b) => a + b, 0) / meals.length;
    return Math.min(100, Math.round((avg / 5) * 100));
  };

  const chartConfig = {
    primary: {
      color: "hsl(var(--primary))",
    },
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Progress Analytics</h1>
            <p className="text-muted-foreground">Track {selectedChild.name}'s development over time</p>
          </div>

          <Select
            value={selectedChild?.id || ""}
            onValueChange={(value) => {
              const child = children.find((c) => c.id === value);
              if (child) onSelectChild(child);
            }}
          >
            <SelectTrigger className="mt-4 sm:mt-0 w-full sm:w-48">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sleep Progress */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">😴</span> Sleep Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : getSleepChartData().length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getSleepChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} name="Horas" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <div className="text-5xl mb-3">📈</div>
                  <p className="text-muted-foreground font-medium">Nenhum dado de sono registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Progress */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">😊</span> Mood Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : getMoodChartData().length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getMoodChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={[1, 5]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} name="Humor" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-muted-foreground font-medium">Nenhum dado de humor registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Progress */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🍎</span> Nutrition Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : getMealsChartData().length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMealsChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="meals" fill="hsl(var(--primary))" name="Refeições" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <div className="text-5xl mb-3">🥗</div>
                  <p className="text-muted-foreground font-medium">Nenhum dado de nutrição registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activities Progress */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🏃</span> Activities Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : getActivitiesChartData().length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getActivitiesChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="activities" fill="hsl(var(--primary))" name="Atividades" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="bg-secondary rounded-xl p-8 text-center">
                  <div className="text-5xl mb-3">🎯</div>
                  <p className="text-muted-foreground font-medium">Nenhum dado de atividades registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Sleep Consistency</span>
                <span className="font-medium text-foreground">{calculateSleepConsistency()}%</span>
              </div>
              <Progress value={calculateSleepConsistency()} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Mood Stability</span>
                <span className="font-medium text-foreground">{calculateMoodStability()}%</span>
              </div>
              <Progress value={calculateMoodStability()} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Nutrition Quality</span>
                <span className="font-medium text-foreground">{calculateNutritionQuality()}%</span>
              </div>
              <Progress value={calculateNutritionQuality()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {records.length === 0 
              ? "Continue recording daily data to unlock detailed progress analytics and insights"
              : `Showing analytics based on ${records.length} day${records.length > 1 ? 's' : ''} of recorded data`
            }
          </p>
        </div>
      </div>
    </div>
  );
}