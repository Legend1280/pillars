import { KPICard } from "@/components/KPICard";
import { useDashboard } from "@/contexts/DashboardContext";
import { calculateKPIs, mockMonthlyProjections } from "@/lib/data";
import { DollarSign, Percent, TrendingUp } from "lucide-react";

export function KPIRibbon() {
  const { inputs } = useDashboard();
  const kpis = calculateKPIs(mockMonthlyProjections, inputs);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="border-b bg-muted/30">
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="MSO Total Revenue"
            value={formatCurrency(kpis.msoTotalRevenue)}
            subtitle="All Sources Month 12"
            icon={DollarSign}
          />
          <KPICard
            title="MSO Net Profit"
            value={formatCurrency(kpis.msoNetProfit)}
            subtitle="Revenue - Costs"
            icon={TrendingUp}
          />
          <KPICard
            title="Physician Income"
            value={formatCurrency(kpis.physicianIncome)}
            subtitle="Specialty + Equity"
            icon={DollarSign}
          />
          <KPICard
            title="Physician ROI"
            value={formatPercent(kpis.physicianROI)}
            subtitle="Annual / Investment"
            icon={Percent}
          />
          <KPICard
            title="Physician MSO Income"
            value={formatCurrency(kpis.physicianMSOIncome)}
            subtitle="10% of Net Profit"
            icon={DollarSign}
          />
        </div>
      </div>
    </div>
  );
}

