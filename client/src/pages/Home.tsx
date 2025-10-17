import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { InputsSection } from "@/components/InputsSection";
import { KPIRibbon } from "@/components/KPIRibbon";
import { OverviewSection } from "@/components/OverviewSection";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { useDashboard } from "@/contexts/DashboardContext";
import { dashboardSections } from "@/lib/data";

export default function Home() {
  const { activeSection } = useDashboard();

  const renderSection = () => {
    switch (activeSection) {
      case "inputs":
        return <InputsSection />;
      case "revenues":
        return <OverviewSection />;
      case "diagnostics":
        return (
          <PlaceholderSection
            title="Diagnostics"
            description="Echo, Lab, CT, and diagnostic service assumptions and revenue modeling."
          />
        );
      case "costs":
        return (
          <PlaceholderSection
            title="Costs"
            description="Initial build-out costs, ongoing operational expenses, and cost projections."
          />
        );
      case "staffing":
        return (
          <PlaceholderSection
            title="Staffing"
            description="Detailed role modeling, salaries by position, and start-month triggers."
          />
        );
      case "summary":
        return (
          <PlaceholderSection
            title="Financial Summary"
            description="Complete P&L view, ROI analysis, and capital structure breakdown."
          />
        );
      case "risk":
        return (
          <PlaceholderSection
            title="Risk & Sensitivity"
            description="Scenario testing, variance analysis, and sensitivity modeling."
          />
        );
      case "export":
        return (
          <PlaceholderSection
            title="Export"
            description="Generate investor summaries, partner reports, and Excel exports."
          />
        );
      default:
        return <OverviewSection />;
    }
  };

  const currentSection = dashboardSections.find((s) => s.id === activeSection);

  return (
    <DashboardLayout>
      <DashboardHeader />
      <KPIRibbon />
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{currentSection?.title}</h1>
          <p className="text-muted-foreground mt-1">{currentSection?.description}</p>
        </div>
        {renderSection()}
      </div>
    </DashboardLayout>
  );
}
