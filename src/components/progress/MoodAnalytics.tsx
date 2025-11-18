import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type DailyRecord = {
  record_date: string;
  mood_data: any;
};

type MoodAnalyticsProps = {
  records: DailyRecord[];
  loading: boolean;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export function MoodAnalytics({ records, loading }: MoodAnalyticsProps) {
  const chartConfig = { primary: { color: "hsl(var(--primary))" } };

  const getMoodRadarData = () => {
    const moodValues: { [key: string]: number } = {
      'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1
    };
    
    const byTime = records.reduce((acc: any, r) => {
      const morning = r.mood_data?.morning || 'neutral';
      const afternoon = r.mood_data?.afternoon || 'neutral';
      const evening = r.mood_data?.evening || 'neutral';
      
      acc.morning += moodValues[morning] || 3;
      acc.afternoon += moodValues[afternoon] || 3;
      acc.evening += moodValues[evening] || 3;
      acc.count++;
      
      return acc;
    }, { morning: 0, afternoon: 0, evening: 0, count: 0 });

    if (byTime.count === 0) return [];

    return [
      { timeOfDay: 'Morning', score: Math.round(byTime.morning / byTime.count) },
      { timeOfDay: 'Afternoon', score: Math.round(byTime.afternoon / byTime.count) },
      { timeOfDay: 'Evening', score: Math.round(byTime.evening / byTime.count) },
    ];
  };

  const getEmotionalStatesDistribution = () => {
    const states = records.flatMap(r => [
      r.mood_data?.morning,
      r.mood_data?.afternoon,
      r.mood_data?.evening
    ]).filter(Boolean);

    const distribution = ['very-happy', 'happy', 'neutral', 'sad', 'very-sad'].map(state => ({
      name: state.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value: states.filter(s => s === state).length,
    }));

    return distribution.filter(d => d.value > 0);
  };

  const getMoodHeatmapData = () => {
    return records.slice(-7).map(r => {
      const moodValues: { [key: string]: number } = {
        'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1
      };
      return {
        date: new Date(r.record_date).toLocaleDateString('en-US', { weekday: 'short' }),
        morning: moodValues[r.mood_data?.morning] || 0,
        afternoon: moodValues[r.mood_data?.afternoon] || 0,
        evening: moodValues[r.mood_data?.evening] || 0,
      };
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading mood analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Mood Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Mood Radar */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>😊</span> Average Mood by Time of Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getMoodRadarData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getMoodRadarData()}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="timeOfDay" stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Mood Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No mood data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emotional States Distribution */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💭</span> Emotional States Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEmotionalStatesDistribution().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={getEmotionalStatesDistribution()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {getEmotionalStatesDistribution().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No emotional states data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Mood Heatmap */}
        <Card className="shadow-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📅</span> Weekly Mood Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getMoodHeatmapData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMoodHeatmapData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="morning" fill="hsl(var(--primary))" name="Morning" />
                    <Bar dataKey="afternoon" fill="hsl(var(--accent))" name="Afternoon" />
                    <Bar dataKey="evening" fill="hsl(var(--success))" name="Evening" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No mood heatmap data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
