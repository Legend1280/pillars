import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPIRibbon } from "@/components/KPIRibbon";
import { OverviewSection } from "@/components/OverviewSection";
import { ConfigDrivenSidebar } from "@/components/ConfigDrivenSidebar";
import { dashboardConfig } from "@/lib/dashboardConfig";
import { useDashboard } from "@/contexts/DashboardContext";

export default function Home() {
  const { activeSection } = useDashboard();

  // Sidebar content (input controls) - now config-driven
  const renderSidebarContent = () => {
    // Check if section exists in config
    const section = dashboardConfig.sections.find(s => s.id === activeSection);
    
    if (section) {
      return <ConfigDrivenSidebar sectionId={activeSection} />;
    }
    
    // Fallback for sections not yet in config
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Section configuration coming soon...
      </div>
    );
  };

  // Main canvas content (charts and visualizations)
  const renderMainContent = () => {
    return (
      <>
        <DashboardHeader />
        <KPIRibbon />
        <div className="container py-8">
          <OverviewSection />
        </div>
      </>
    );
  };

  return (
    <DashboardLayout>
      {/* Pass sidebar content to layout */}
      {renderSidebarContent()}
      {/* Main canvas renders separately in layout */}
    </DashboardLayout>
  );
}

