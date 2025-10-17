import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPIRibbon } from "@/components/KPIRibbon";
import { OverviewSection } from "@/components/OverviewSection";
import { Section1InputsSidebar } from "@/components/Section1InputsSidebar";
import { Section3DiagnosticsSidebar } from "@/components/Section3DiagnosticsSidebar";
import { Section4CostsSidebar } from "@/components/Section4CostsSidebar";
import { Section5StaffingSidebar } from "@/components/Section5StaffingSidebar";
import { Section6GrowthSidebar } from "@/components/Section6GrowthSidebar";
import { useDashboard } from "@/contexts/DashboardContext";

export default function Home() {
  const { activeSection } = useDashboard();

  // Sidebar content (input controls)
  const renderSidebarContent = () => {
    switch (activeSection) {
      case "inputs":
        return <Section1InputsSidebar />;
      case "revenues":
        return (
          <div className="p-4 text-sm text-muted-foreground">
            Revenue input controls coming soon...
          </div>
        );
      case "diagnostics":
        return <Section3DiagnosticsSidebar />;
      case "costs":
        return <Section4CostsSidebar />;
      case "staffing":
        return <Section5StaffingSidebar />;
      case "growth":
        return <Section6GrowthSidebar />;
      case "risk":
        return (
          <div className="p-4 text-sm text-muted-foreground">
            Risk analysis controls coming in Pass 3...
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

