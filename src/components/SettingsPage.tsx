import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { User, Mail, Lock, Globe, CreditCard, Settings, Loader2, CheckCircle2, Eye } from "lucide-react";

type SettingsSection = "profile" | "email" | "password" | "timezone" | "subscription" | "account" | "accessibility";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "This will permanently delete all your data. Are you sure you want to delete your account?"
      )
    ) {
      return;
    }

    toast({
      title: "Account Deletion",
      description: "Account deletion would be processed here. This feature requires additional backend setup.",
    });
  };

  const settingsSections = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "password" as const, label: "Password", icon: Lock },
    { id: "timezone" as const, label: "Timezone", icon: Globe },
    { id: "accessibility" as const, label: "Accessibility", icon: Eye },
    { id: "subscription" as const, label: "Subscription", icon: CreditCard },
    { id: "account" as const, label: "Account", icon: Settings },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Profile Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Your first name" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Your last name" className="mt-1" />
              </div>
            </div>
            <Button>Update Profile</Button>
          </div>
        );

      case "email":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Email Settings</h3>
            <div>
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input id="currentEmail" type="email" value={user?.email || ""} readOnly className="mt-1 bg-muted" />
            </div>
            <div>
              <Label htmlFor="newEmail">New Email</Label>
              <Input id="newEmail" type="email" placeholder="Enter new email" className="mt-1" />
            </div>
            <Button>Update Email</Button>
          </div>
        );

      case "password":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Password Settings</h3>
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" placeholder="Enter current password" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Enter new password" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm new password" className="mt-1" />
            </div>
            <Button>Update Password</Button>
          </div>
        );

      case "timezone":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Timezone Settings</h3>
            <div>
              <Label htmlFor="timezone">Current Timezone</Label>
              <Input
                id="timezone"
                value={user?.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                readOnly
                className="mt-1 bg-muted"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Timezone is set during registration and cannot be changed. This ensures data consistency across all
              your records.
            </p>
          </div>
        );

      case "accessibility":
        return <AccessibilitySettings />;

      case "subscription":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Subscription</h3>
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="ml-2">
                <p className="font-medium text-foreground">Active Subscription - $19.99/month</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </AlertDescription>
            </Alert>
            <Button variant="outline">Cancel Subscription</Button>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>

            <Card className="border-destructive/30">
              <CardContent className="p-6">
                <h4 className="font-semibold text-destructive mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all your data, including children profiles and all records. This
                  action cannot be undone.
                </p>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <Card className="lg:w-64 shadow-card border-border">
            <CardContent className="p-4">
              <nav 
                className="space-y-2"
                aria-label="Settings navigation"
              >
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                      aria-current={activeSection === section.id ? "page" : undefined}
                      aria-label={`${section.label} settings`}
                    >
                      <Icon className="mr-3 h-4 w-4" aria-hidden="true" />
                      {section.label}
                    </Button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="flex-1 shadow-card border-border">
            <CardContent className="p-6">{renderSectionContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}