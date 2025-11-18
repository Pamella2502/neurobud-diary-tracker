import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

type DailyRecord = {
  record_date: string;
  crisis_data: any;
};

type CrisisAnalyticsProps = {
  records: DailyRecord[];
  loading: boolean;
};

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'];

export function CrisisAnalytics({ records, loading }: CrisisAnalyticsProps) {
  const chartConfig = { primary: { color: "hsl(var(--primary))" } };

  const getCrisisTypesData = () => {
    const crises = records.flatMap(r => r.crisis_data?.crises || []);
    const types = crises.reduce((acc: any, c: any) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(types).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: types[type],
    }));
  };

  const getCrisisIntensityData = () => {
    return records.map(r => {
      const crises = r.crisis_data?.crises || [];
      const avgIntensity = crises.length > 0 
        ? crises.reduce((sum: number, c: any) => sum + (c.intensity || 0), 0) / crises.length
        : 0;
      
      return {
        date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        intensity: 5 - avgIntensity, // Inverted score
      };
    });
  };

  const getCrisisDurationData = () => {
    return records.map(r => {
      const crises = r.crisis_data?.crises || [];
      const totalDuration = crises.reduce((sum: number, c: any) => sum + (c.duration || 0), 0);
      
      return {
        date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        duration: totalDuration,
      };
    }).filter(d => d.duration > 0);
  };

  const getTriggersData = () => {
    const crises = records.flatMap(r => r.crisis_data?.crises || []);
    const triggers = crises.reduce((acc: any, c: any) => {
      c.triggers?.forEach((t: string) => {
        acc[t] = (acc[t] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.keys(triggers).map(trigger => ({
      trigger: trigger.charAt(0).toUpperCase() + trigger.slice(1),
      count: triggers[trigger],
    }));
  };

  const getCalmingStrategiesData = () => {
    const crises = records.flatMap(r => r.crisis_data?.crises || []);
    const strategies = crises.reduce((acc: any, c: any) => {
      c.calmingStrategies?.forEach((s: string) => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.keys(strategies).map(strategy => ({
      strategy: strategy.charAt(0).toUpperCase() + strategy.slice(1),
      count: strategies[strategy],
    })).sort((a, b) => b.count - a.count);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading crisis analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Crisis Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crisis Types */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚠️</span> Crisis Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getCrisisTypesData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={getCrisisTypesData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {getCrisisTypesData().map((_, index) => (
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
                <p className="text-muted-foreground">No crisis type data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crisis Intensity */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> Crisis Intensity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getCrisisIntensityData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getCrisisIntensityData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="intensity" stroke="hsl(var(--destructive))" strokeWidth={2} name="Intensity" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No intensity data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crisis Duration */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⏱️</span> Crisis Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getCrisisDurationData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCrisisDurationData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="duration" fill="hsl(var(--warning))" name="Duration (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No duration data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Triggers */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔍</span> Most Common Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTriggersData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTriggersData()} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="trigger" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No trigger data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calming Strategies */}
        <Card className="shadow-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧘</span> Most Effective Calming Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getCalmingStrategiesData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCalmingStrategiesData()} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="strategy" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--success))" name="Times Used" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No calming strategies data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
