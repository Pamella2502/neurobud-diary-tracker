import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { HomePage } from "@/components/HomePage";
import { MyKidsPage } from "@/components/MyKidsPage";
import { DailyRecordsPage } from "@/components/DailyRecordsPage";
import { HistoryPage } from "@/components/HistoryPage";
import { ProgressPage } from "@/components/ProgressPage";
import { JourneyPage } from "@/components/JourneyPage";
import { SettingsPage } from "@/components/SettingsPage";
import { SupportPage } from "@/components/SupportPage";
import { TermsPage } from "@/components/TermsPage";
import { Loader2 } from "lucide-react";

export type Child = {
  id: string;
  name: string;
  age: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchChildren();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching children:", error);
    } else {
      setChildren(data || []);
      if (data && data.length > 0) {
        setSelectedChild(data[0]);
      }
    }
    setLoading(false);
  };

  const handleChildAdded = () => {
    fetchChildren();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return <HomePage childrenCount={children.length} />;
      case "mykids":
        return <MyKidsPage onChildAdded={handleChildAdded} />;
      case "records":
        return <DailyRecordsPage children={children} selectedChild={selectedChild} onSelectChild={setSelectedChild} />;
      case "history":
        return <HistoryPage children={children} selectedChild={selectedChild} onSelectChild={setSelectedChild} />;
      case "progress":
        return <ProgressPage children={children} selectedChild={selectedChild} onSelectChild={setSelectedChild} />;
      case "journey":
        return <JourneyPage children={children} selectedChild={selectedChild} onSelectChild={setSelectedChild} />;
      case "settings":
        return <SettingsPage />;
      case "support":
        return <SupportPage />;
      case "terms":
        return <TermsPage />;
      default:
        return <HomePage childrenCount={children.length} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        children={children}
        selectedChild={selectedChild}
        onSelectChild={setSelectedChild}
      />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}