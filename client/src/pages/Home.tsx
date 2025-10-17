import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPIRibbon } from "@/components/KPIRibbon";
import { OverviewSection } from "@/components/OverviewSection";
import { Section1InputsSidebar } from "@/components/Section1InputsSidebar";
import { useDashboard } from "@/contexts/DashboardContext";

export default function Home() {
  const { activeSection } = useDashboard();

  // Sidebar content (input controls)
  const renderSidebarContent = () => {
    switch (activeSection) {
      case "inputs":
        return <Section1InputsSidebar />;
      case "revenues":
      case "diagnostics":
      case "costs":
      case "staffing":
      case "growth":
      case "risk":
        return (
          <div className="p-4 text-sm text-muted-foreground">
            Input controls for {activeSection} coming soon...
          </div>
        );
      default:
        return null;
    }
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

