import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDown, FileText, CheckCircle2, Lightbulb } from "lucide-react";
import type { Child } from "@/pages/Dashboard";

type JourneyPageProps = {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

export function JourneyPage({ children, selectedChild, onSelectChild }: JourneyPageProps) {
  if (!selectedChild) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Child Selected</h3>
          <p className="text-muted-foreground">Please select a child to view their journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Journey & Reports</h1>
            <p className="text-muted-foreground">Comprehensive reports for {selectedChild.name}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Report */}
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Daily Report</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Available daily at 11:59 PM with complete day summary
              </p>
              <Button className="w-full">
                <FileDown className="mr-2 h-4 w-4" />
                Generate Daily PDF
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Report */}
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Weekly Report</h3>
              <p className="text-muted-foreground text-sm mb-4">Weekly summaries with trends and patterns</p>
              <Button className="w-full">
                <FileDown className="mr-2 h-4 w-4" />
                Generate Weekly PDF
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Report */}
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Monthly Report</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Comprehensive monthly analysis and insights
              </p>
              <Button className="w-full">
                <FileDown className="mr-2 h-4 w-4" />
                Generate Monthly PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Backup Status */}
        <Card className="shadow-card border-border mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Backup Status</h3>
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="ml-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Auto-backup Active</span>
                  <span className="text-sm text-muted-foreground">
                    Last backup: {new Date().toLocaleDateString("en-US")} 03:30 AM EST ✅
                  </span>
                </div>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-3">
              Your data is automatically backed up every 6 hours and retained for 90 days.
            </p>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="shadow-card border-border mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Reports</h3>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium text-foreground mb-2">No Reports Generated Yet</h4>
              <p className="text-muted-foreground">
                Start generating reports to track {selectedChild.name}'s journey over time
              </p>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-accent/10 border-accent/30">
          <Lightbulb className="h-4 w-4 text-accent" />
          <AlertDescription className="ml-2 text-foreground">
            <strong>Tip:</strong> Reports are automatically generated and include all your recorded data, progress
            analytics, and personalized insights about your child's development journey.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}