import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type DailyRecord = {
  record_date: string;
  nutrition_data: any;
};

type NutritionAnalyticsProps = {
  records: DailyRecord[];
  loading: boolean;
};

const COLORS = ['hsl(var(--success))', 'hsl(var(--primary))', 'hsl(var(--warning))'];

export function NutritionAnalytics({ records, loading }: NutritionAnalyticsProps) {
  const chartConfig = { primary: { color: "hsl(var(--primary))" } };

  const getMealQualityData = () => {
    return records.map(r => {
      const meals = r.nutrition_data?.meals || [];
      const qualityScores: { [key: string]: number } = { excellent: 3, good: 2, fair: 1 };
      const avgQuality = meals.length > 0 
        ? meals.reduce((sum: number, m: any) => sum + (qualityScores[m.quality] || 0), 0) / meals.length
        : 0;
      
      return {
        date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        quality: avgQuality,
        count: meals.length,
      };
    });
  };

  const getFoodCategoriesData = () => {
    const categories = records.reduce((acc: any, r) => {
      const meals = r.nutrition_data?.meals || [];
      meals.forEach((meal: any) => {
        meal.foods?.forEach((food: string) => {
          const category = categorizeFood(food);
          acc[category] = (acc[category] || 0) + 1;
        });
      });
      return acc;
    }, {});

    return Object.keys(categories).map(cat => ({
      category: cat,
      count: categories[cat],
    }));
  };

  const categorizeFood = (food: string): string => {
    const lower = food.toLowerCase();
    if (lower.includes('fruit') || lower.includes('apple') || lower.includes('banana')) return 'Fruits';
    if (lower.includes('vegetable') || lower.includes('carrot') || lower.includes('broccoli')) return 'Vegetables';
    if (lower.includes('bread') || lower.includes('rice') || lower.includes('pasta')) return 'Grains';
    if (lower.includes('meat') || lower.includes('chicken') || lower.includes('fish')) return 'Proteins';
    if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt')) return 'Dairy';
    return 'Beverages';
  };

  const getWaterIntakeData = () => {
    return records.map(r => ({
      date: new Date(r.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      water: r.nutrition_data?.water || 0,
    }));
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading nutrition analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Nutrition Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Quality */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🍽️</span> Meal Quality & Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getMealQualityData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMealQualityData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="quality" fill="hsl(var(--success))" name="Avg Quality" />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Meal Count" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No meal data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Food Categories Radar */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🥗</span> Food Variety
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getFoodCategoriesData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getFoodCategoriesData()}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Food Count" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No food variety data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water Intake */}
        <Card className="shadow-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💧</span> Daily Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getWaterIntakeData().length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getWaterIntakeData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="water" stroke="hsl(var(--primary))" strokeWidth={2} name="Water (glasses)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="bg-secondary rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No water intake data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
