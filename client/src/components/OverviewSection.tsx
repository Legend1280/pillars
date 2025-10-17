import { PhysicianDetailsPanel } from "@/components/PhysicianDetailsPanel";
import { PhysicianROIChart } from "@/components/PhysicianROIChart";
import { RevenueChart } from "@/components/RevenueChart";
import { useDashboard } from "@/contexts/DashboardContext";
import { calculatePhysicianMetrics, mockMonthlyProjections } from "@/lib/data";

export function OverviewSection() {
  const { inputs } = useDashboard();
  const physicianMetrics = calculatePhysicianMetrics(mockMonthlyProjections, inputs);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - spans 2 columns */}
        <RevenueChart data={mockMonthlyProjections} />

        {/* Physician ROI Chart */}
        <PhysicianROIChart
          specialtyRetained={physicianMetrics.specialtyRetained}
          equityIncome={physicianMetrics.equityIncome}
          monthlyIncome={physicianMetrics.monthlyIncome}
        />
      </div>

      {/* Physician Details Panel */}
      <PhysicianDetailsPanel metrics={physicianMetrics} />
    </div>
  );
}

