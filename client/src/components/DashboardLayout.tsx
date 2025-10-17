import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useDashboard } from "@/contexts/DashboardContext";
import { dashboardSections } from "@/lib/data";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  Download,
  FileText,
  Settings,
  TrendingDown,
  Users,
} from "lucide-react";
import { ReactNode } from "react";

const iconMap: Record<string, any> = {
  Settings,
  DollarSign,
  Activity,
  TrendingDown,
  Users,
  FileText,
  AlertTriangle,
  Download,
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { activeSection, setActiveSection } = useDashboard();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-end gap-0.5">
                <div className="w-1.5 h-6 bg-primary rounded-sm"></div>
                <div className="w-1.5 h-8 bg-chart-2 rounded-sm"></div>
                <div className="w-1.5 h-5 bg-chart-4 rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">pillars</h1>
                <p className="text-xs text-muted-foreground">Financial Dashboard</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {dashboardSections.map((section) => {
                const Icon = iconMap[section.icon];
                return (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      isActive={activeSection === section.id}
                      onClick={() => setActiveSection(section.id)}
                      className="w-full"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{section.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <p className="text-xs text-muted-foreground text-center">
              © 2025 Pillars Framework
            </p>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

