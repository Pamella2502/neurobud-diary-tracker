import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Users, FileText, History, TrendingUp, FileDown, Settings as SettingsIcon, HelpCircle, FileTextIcon, LogOut } from "lucide-react";
import type { Child } from "@/pages/Dashboard";

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "mykids", label: "My Kids", icon: Users },
  { id: "records", label: "Daily Records", icon: FileText },
  { id: "history", label: "History", icon: History },
  { id: "journey", label: "Journey", icon: FileDown },
  { id: "settings", label: "Settings", icon: SettingsIcon },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "terms", label: "Terms & Policies", icon: FileTextIcon },
];

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

export function Sidebar({
  activeTab,
  onTabChange,
  children,
  selectedChild,
  onSelectChild,
}: SidebarProps) {
  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out from NeuroBud Autism Diary?")) {
      await supabase.auth.signOut();
    }
  };

  return (
    <aside 
      className="w-72 bg-primary text-white shadow-xl flex flex-col"
      role="navigation"
      aria-label="Main navigation sidebar"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center">
          <div 
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-card"
            role="img"
            aria-label="NeuroBud logo"
          >
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold">NeuroBud</h1>
            <p className="text-sm text-white/80">Autism Diary</p>
          </div>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="p-4 border-b border-white/20">
          <label 
            htmlFor="child-selector"
            className="block text-sm font-medium mb-2 text-white/90"
          >
            Select Child
          </label>
          <Select
            value={selectedChild?.id || ""}
            onValueChange={(value) => {
              const child = children.find((c) => c.id === value);
              if (child) onSelectChild(child);
            }}
          >
            <SelectTrigger 
              id="child-selector"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors"
              aria-label="Select which child to view records for"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} ({child.age} years)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Main menu">
        <ul className="space-y-2" role="menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} role="none">
                <Button
                  variant="ghost"
                  onClick={() => onTabChange(item.id)}
                  className={`w-full justify-start text-white hover:bg-white/20 transition-colors ${
                    activeTab === item.id ? "bg-white/20 shadow-soft" : ""
                  }`}
                  role="menuitem"
                  aria-current={activeTab === item.id ? "page" : undefined}
                  aria-label={item.label}
                >
                  <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-white hover:bg-white/20 transition-colors"
          aria-label="Sign out from NeuroBud"
        >
          <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}