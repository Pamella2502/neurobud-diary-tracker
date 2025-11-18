import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

type DailyRecord = {
  record_date: string;
  sleep_data: any;
  mood_data: any;
  nutrition_data: any;
  medication_data: any;
  activity_data: any;
  crisis_data: any;
};

type OverallProgressProps = {
  records: DailyRecord[];
  loading: boolean;
};

export function OverallProgress({ records, loading }: OverallProgressProps) {
  const chartConfig = { primary: { color: "hsl(var(--primary))" } };

  const calculateOverallScore = (record: DailyRecord): number => {
    let score = 0;
    let maxScore = 0;

    // Sleep (0-20 points)
    if (record.sleep_data?.hours) {
      score += Math.min(20, (record.sleep_data.hours / 10) * 20);
      maxScore += 20;
    }

    // Mood (0-20 points)
    if (record.mood_data) {
      const moodValues: { [key: string]: number } = {
        'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1
      };
      const avgMood = [record.mood_data.morning, record.mood_data.afternoon, record.mood_data.evening]
        .filter(Boolean)
        .map(m => moodValues[m] || 3)
        .reduce((a, b) => a + b, 0) / 3;
      score += (avgMood / 5) * 20;
      maxScore += 20;
    }

    // Nutrition (0-20 points)
    if (record.nutrition_data?.meals) {
      score += Math.min(20, (record.nutrition_data.meals.length / 5) * 20);
      maxScore += 20;
    }

    // Medication (0-20 points)
    if (record.medication_data?.medications) {
      const adherence = record.medication_data.medications.filter((m: any) => m.taken).length / 
                       Math.max(1, record.medication_data.medications.length);
      score += adherence * 20;
      maxScore += 20;
    }

    // Activities (0-20 points)
    if (record.activity_data?.activities) {
      score += Math.min(20, (record.activity_data.activities.length / 3) * 20);
      maxScore += 20;
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  };

  const getOverallScoreData = () => {
    return records.map(r => ({
      date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: calculateOverallScore(r),
    }));
  };

  const calculateSectionScore = (section: string): number => {
    if (records.length === 0) return 0;

    switch (section) {
      case 'sleep': {
        const sleepHours = records.map(r => r.sleep_data?.hours || 0).filter(h => h > 0);
        if (sleepHours.length === 0) return 0;
        const avg = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
        return Math.min(100, Math.round((avg / 10) * 100));
      }
      case 'mood': {
        const moodValues: { [key: string]: number } = {
          'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1
        };
        const allMoods = records.flatMap(r => 
          [r.mood_data?.morning, r.mood_data?.afternoon, r.mood_data?.evening]
        ).filter(Boolean);
        if (allMoods.length === 0) return 0;
        const happyMoods = allMoods.filter(m => m === 'happy' || m === 'very-happy').length;
        return Math.round((happyMoods / allMoods.length) * 100);
      }
      case 'nutrition': {
        const meals = records.map(r => (r.nutrition_data?.meals || []).length).filter(m => m > 0);
        if (meals.length === 0) return 0;
        const avg = meals.reduce((a, b) => a + b, 0) / meals.length;
        return Math.min(100, Math.round((avg / 5) * 100));
      }
      case 'medication': {
        const meds = records.flatMap(r => r.medication_data?.medications || []);
        if (meds.length === 0) return 0;
        const taken = meds.filter((m: any) => m.taken).length;
        return Math.round((taken / meds.length) * 100);
      }
      default:
        return 0;
    }
  };

  const getAlerts = () => {
    const alerts: string[] = [];
    
    if (calculateSectionScore('sleep') < 50) alerts.push('Sleep quality needs attention');
    if (calculateSectionScore('mood') < 50) alerts.push('Mood stability is low');
    if (calculateSectionScore('medication') < 80) alerts.push('Medication adherence needs improvement');
    
    const recentCrises = records.slice(-7).filter(r => (r.crisis_data?.crises || []).length > 0).length;
    if (recentCrises > 3) alerts.push('High frequency of crisis episodes');

    return alerts;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'hsl(var(--success))';
    if (score >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading overall progress...</div>;
  }

  const overallScoreData = getOverallScoreData();
  const currentScore = overallScoreData[overallScoreData.length - 1]?.score || 0;
  const alerts = getAlerts();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overall Progress Dashboard</h2>
      
      {/* Overall Score Chart */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📈</span> Overall Well-being Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overallScoreData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overallScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="score" stroke={getScoreColor(currentScore)} strokeWidth={3} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="bg-secondary rounded-xl p-8 text-center">
              <p className="text-muted-foreground">No overall score data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Scores */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Key Areas Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Sleep Quality</span>
              <span className="font-medium text-foreground">{calculateSectionScore('sleep')}%</span>
            </div>
            <Progress value={calculateSectionScore('sleep')} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Mood Stability</span>
              <span className="font-medium text-foreground">{calculateSectionScore('mood')}%</span>
            </div>
            <Progress value={calculateSectionScore('mood')} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Nutrition Quality</span>
              <span className="font-medium text-foreground">{calculateSectionScore('nutrition')}%</span>
            </div>
            <Progress value={calculateSectionScore('nutrition')} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Medication Adherence</span>
              <span className="font-medium text-foreground">{calculateSectionScore('medication')}%</span>
            </div>
            <Progress value={calculateSectionScore('medication')} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="shadow-card border-border border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Areas Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, index) => (
              <Alert key={index} className="border-warning/50">
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
