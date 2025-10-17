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
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { KPIRibbon } from "./KPIRibbon";
import { OverviewSection } from "./OverviewSection";

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
  const { activeSection, setActiveSection, sidebarCollapsed, setSidebarCollapsed } = useDashboard();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Wider for input controls */}
      <aside
        className={cn(
          "border-r bg-card transition-all duration-300 flex flex-col overflow-y-auto",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-96"
        )}
      >
        {/* Logo Header */}
        <div className="border-b p-6 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo-bars.jpeg" alt="Pillars" className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-foreground">pillars</h1>
              <p className="text-xs text-muted-foreground">Financial Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {dashboardSections.map((section) => {
            const Icon = iconMap[section.icon];
            const isActive = activeSection === section.id;
            
            return (
              <div key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span className="flex-1 text-left">{section.title}</span>
                  {isActive ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                </button>
                
                {/* Render section content in sidebar when active */}
                {isActive && (
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        {/* Content Area - Charts */}
        <div className="flex-1 overflow-auto">
          <DashboardHeader />
          <KPIRibbon />
          <div className="container py-8">
            <OverviewSection />
          </div>
        </div>
      </main>
    </div>
  );
}

