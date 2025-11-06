import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import type { Child } from "@/pages/Dashboard";

type ProgressPageProps = {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

export function ProgressPage({ children, selectedChild, onSelectChild }: ProgressPageProps) {
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
              <div className="bg-secondary rounded-xl p-8 text-center">
                <div className="text-5xl mb-3">📈</div>
                <p className="text-muted-foreground font-medium">Sleep analytics coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">Track patterns and improvements over time</p>
              </div>
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
              <div className="bg-secondary rounded-xl p-8 text-center">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-muted-foreground font-medium">Mood analytics coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">Visualize emotional patterns and triggers</p>
              </div>
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
              <div className="bg-secondary rounded-xl p-8 text-center">
                <div className="text-5xl mb-3">🥗</div>
                <p className="text-muted-foreground font-medium">Nutrition analytics coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">Monitor eating habits and preferences</p>
              </div>
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
              <div className="bg-secondary rounded-xl p-8 text-center">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-muted-foreground font-medium">Activity analytics coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">Track therapy and activity participation</p>
              </div>
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
                <span className="font-medium text-foreground">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Mood Stability</span>
                <span className="font-medium text-foreground">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Nutrition Quality</span>
                <span className="font-medium text-foreground">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Continue recording daily data to unlock detailed progress analytics and insights
          </p>
        </div>
      </div>
    </div>
  );
}