import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

type DailyRecord = {
  record_date: string;
  hyperfocus_data: any;
};

type HyperfocusAnalyticsProps = {
  records: DailyRecord[];
  loading: boolean;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export function HyperfocusAnalytics({ records, loading }: HyperfocusAnalyticsProps) {
  const chartConfig = { primary: { color: "hsl(var(--primary))" } };

  const getFrequencyData = () => {
    return records.map(r => {
      const episodes = r.hyperfocus_data?.episodes || [];
      const byTime = episodes.reduce((acc: any, e: any) => {
        acc[e.timeOfDay] = (acc[e.timeOfDay] || 0) + 1;
        return acc;
      }, {});

      return {
        date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        morning: byTime.morning || 0,
        afternoon: byTime.afternoon || 0,
        evening: byTime.evening || 0,
        total: episodes.length,
      };
    });
  };

  const getIntensityData = () => {
    const episodes = records.flatMap(r => r.hyperfocus_data?.episodes || []);
    const intensities = episodes.reduce((acc: any, e: any) => {
      acc[e.intensity] = (acc[e.intensity] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(intensities).map(intensity => ({
      name: intensity.charAt(0).toUpperCase() + intensity.slice(1),
      value: intensities[intensity],
    }));
  };

  const getImpactData = () => {
    const episodes = records.flatMap(r => r.hyperfocus_data?.episodes || []);
    const impacts = episodes.reduce((acc: any, e: any) => {
      acc[e.impact] = (acc[e.impact] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(impacts).map(impact => ({
      name: impact.charAt(0).toUpperCase() + impact.slice(1),
      value: impacts[impact],
    }));
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading hyperfocus analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Hyperfocus Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency by Time of Day */}
        <Card className="shadow-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎯</span> Hyperfocus Frequency by Time of Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getFrequencyData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getFrequencyData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="morning" fill="hsl(var(--primary))" name="Morning" />
                    <Bar dataKey="afternoon" fill="hsl(var(--accent))" name="Afternoon" />
                    <Bar dataKey="evening" fill="hsl(var(--warning))" name="Evening" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No hyperfocus frequency data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intensity Distribution */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💪</span> Intensity Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getIntensityData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={getIntensityData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {getIntensityData().map((_, index) => (
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
                <p className="text-muted-foreground">No intensity data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Impact Assessment */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📈</span> Impact Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getImpactData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={getImpactData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {getImpactData().map((_, index) => (
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
                <p className="text-muted-foreground">No impact data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
