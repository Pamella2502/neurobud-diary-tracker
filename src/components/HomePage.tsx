import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, TrendingUp, FileDown } from "lucide-react";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { BackToTop } from "./BackToTop";
import { SkeletonCard } from "./SkeletonCard";
import { useState, useEffect } from "react";

type HomePageProps = {
  childrenCount: number;
};

export function HomePage({ childrenCount }: HomePageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Children Registered", value: childrenCount, color: "primary", icon: Users },
    { label: "Today's Records", value: "0", color: "success", icon: FileText },
    { label: "Weekly Progress", value: "0%", color: "accent", icon: TrendingUp },
  ];

  const quickActions = [
    { label: "Add Child", icon: Users, description: "Register a new child profile" },
    { label: "Daily Records", icon: FileText, description: "Track today's activities" },
    { label: "View Progress", icon: TrendingUp, description: "See development insights" },
    { label: "Generate Report", icon: FileDown, description: "Export data to PDF" },
  ];

  return (
    <div className="p-6 md:p-8">
      <BackToTop />
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to NeuroBud!</h1>
          <p className="text-xl text-muted-foreground">
            Let's register today's flourishing.
          </p>
        </header>

        {/* Quick Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Quick Statistics</h2>
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            aria-busy={isLoading}
            role="status"
          >
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} variant="stat" />
                ))}
              </>
            ) : (
              stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="shadow-card border-border hover:shadow-lg transition-all duration-300"
                  role="article"
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p 
                          className="text-3xl font-bold text-foreground mt-2"
                          aria-label={`${stat.value} ${stat.label.toLowerCase()}`}
                        >
                          {stat.value}
                        </p>
                      </div>
                      <div 
                        className="p-3 bg-primary/10 rounded-xl"
                        aria-hidden="true"
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section aria-labelledby="actions-heading">
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <h2 id="actions-heading" className="text-2xl font-semibold mb-6 text-foreground">Quick Actions</h2>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                role="group"
                aria-label="Quick action buttons"
              >
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      className="p-6 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 text-center group min-h-[120px]"
                      aria-label={`${action.label}: ${action.description}`}
                    >
                      <div 
                        className="mb-3 inline-block p-3 bg-gradient-primary rounded-xl shadow-soft group-hover:scale-110 transition-transform"
                        aria-hidden="true"
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{action.label}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* PWA Install Prompt */}
        <div className="mt-6">
          <PWAInstallPrompt />
        </div>

        {/* Recent Activity */}
        <section aria-labelledby="activity-heading">
          <Card className="shadow-card border-border mt-6">
            <CardContent className="p-6">
              <h2 id="activity-heading" className="text-2xl font-semibold mb-4 text-foreground">Recent Activity</h2>
              <div 
                className="text-center py-12 text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                <p>No recent activity. Start by adding your first child!</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}