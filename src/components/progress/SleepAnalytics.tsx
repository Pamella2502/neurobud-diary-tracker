import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

type DailyRecord = {
  record_date: string;
  sleep_data: any;
};

type SleepAnalyticsProps = {
  records: DailyRecord[];
  loading: boolean;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export function SleepAnalytics({ records, loading }: SleepAnalyticsProps) {
  const chartConfig = { primary: { color: "hsl(var(--primary))" } };

  const getSleepTimelineData = () => {
    return records.map(r => ({
      date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: r.sleep_data?.quality ? ['terrible', 'poor', 'fair', 'good', 'excellent'].indexOf(r.sleep_data.quality) + 1 : 0,
      hours: r.sleep_data?.hours || 0,
    }));
  };

  const getSleepQualityDistribution = () => {
    const qualities = records.map(r => r.sleep_data?.quality).filter(Boolean);
    const distribution = ['excellent', 'good', 'fair', 'poor', 'terrible'].map(q => ({
      name: q.charAt(0).toUpperCase() + q.slice(1),
      value: qualities.filter(quality => quality === q).length,
    }));
    return distribution.filter(d => d.value > 0);
  };

  const getSleepScheduleData = () => {
    return records.map(r => {
      const bedtime = r.sleep_data?.bedTime ? parseInt(r.sleep_data.bedTime.split(':')[0]) : null;
      const wakeup = r.sleep_data?.wakeTime ? parseInt(r.sleep_data.wakeTime.split(':')[0]) : null;
      return {
        date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bedtime,
        wakeup,
      };
    }).filter(d => d.bedtime !== null || d.wakeup !== null);
  };

  const getAwakeningsData = () => {
    return records.map(r => {
      const awakenings = r.sleep_data?.awakenings || [];
      const causes = awakenings.reduce((acc: any, a: any) => {
        acc[a.cause] = (acc[a.cause] || 0) + 1;
        return acc;
      }, {});
      return {
        date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...causes,
      };
    }).filter(d => Object.keys(d).length > 1);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sleep analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sleep Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Timeline */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>😴</span> Sleep Quality Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSleepTimelineData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getSleepTimelineData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 6]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} name="Quality Score" />
                    <Line type="monotone" dataKey="hours" stroke="hsl(var(--accent))" strokeWidth={2} name="Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No sleep data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Quality Distribution */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> Sleep Quality Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSleepQualityDistribution().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={getSleepQualityDistribution()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {getSleepQualityDistribution().map((_, index) => (
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
                <p className="text-muted-foreground">No quality data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Schedule */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🕐</span> Sleep Schedule Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSleepScheduleData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getSleepScheduleData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 24]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="bedtime" stroke="hsl(var(--primary))" strokeWidth={2} name="Bedtime" />
                    <Line type="monotone" dataKey="wakeup" stroke="hsl(var(--accent))" strokeWidth={2} name="Wake Time" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No schedule data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Awakenings by Cause */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🌙</span> Awakenings by Cause
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getAwakeningsData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getAwakeningsData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="nightmare" stackId="a" fill="hsl(var(--destructive))" name="Nightmare" />
                    <Bar dataKey="noise" stackId="a" fill="hsl(var(--warning))" name="Noise" />
                    <Bar dataKey="thirst" stackId="a" fill="hsl(var(--accent))" name="Thirst" />
                    <Bar dataKey="other" stackId="a" fill="hsl(var(--primary))" name="Other" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No awakenings data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
