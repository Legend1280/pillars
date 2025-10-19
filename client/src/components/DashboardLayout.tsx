import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/contexts/DashboardContext";
import { dashboardSections } from "@/lib/data";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Menu,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { KPIRibbon } from "./KPIRibbon";
import { OverviewSection } from "./OverviewSection";
import { ScenarioButtons } from "./ScenarioButtons";

const iconMap: Record<string, any> = {
  Settings,
  DollarSign,
  Activity,
  TrendingDown,
  Users,
  TrendingUp,
  AlertTriangle,
};

interface DashboardLayoutProps {
  children: ReactNode; // Sidebar content
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { activeSection, setActiveSection, expandedSections, setExpandedSections, sidebarCollapsed, setSidebarCollapsed } = useDashboard();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar - Responsive drawer on mobile, fixed column on desktop */}
      <aside
        className={cn(
          "border-r bg-card transition-all duration-300 flex flex-col",
          "fixed md:relative z-50 md:z-auto h-full",
          sidebarCollapsed 
            ? "w-0 overflow-hidden -translate-x-full md:translate-x-0" 
            : "w-full md:w-96 translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="border-b p-6 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo-bars.jpeg" alt="Pillars" className="h-8 w-auto" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">pillars</h1>
              <p className="text-xs text-muted-foreground">Financial Dashboard</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(true)}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {dashboardSections.map((section) => {
            const Icon = iconMap[section.icon];
            const isActive = activeSection === section.id;
            const isExpanded = expandedSections[section.id] || false;
            
            const toggleSection = () => {
              // Set as active section
              setActiveSection(section.id);
              // Toggle expanded state
              setExpandedSections(prev => ({
                ...prev,
                [section.id]: !prev[section.id]
              }));
            };
            
            return (
              <div key={section.id}>
                <button
                  onClick={toggleSection}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span className="flex-1 text-left">{section.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                </button>
                
                {/* Render section content in sidebar when expanded */}
                {isActive && isExpanded && (
                  <div className="mt-2 mb-4">
                    {children}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 Pillars Framework
          </p>
        </div>
      </aside>

      {/* Main Content - Charts only */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Hamburger */}
        <div className="border-b bg-card p-4 flex items-center gap-4 shrink-0">
          {/* Always show hamburger on mobile, only when collapsed on desktop */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          {sidebarCollapsed && (
            <div className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Content Area - Charts */}
        <div className="flex-1 overflow-auto">
          <DashboardHeader />
          <div className="container py-8">
            <OverviewSection />
          </div>
        </div>
      </main>
    </div>
  );
}

