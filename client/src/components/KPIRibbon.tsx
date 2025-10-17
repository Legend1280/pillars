import { KPICard } from "@/components/KPICard";
import { useDashboard } from "@/contexts/DashboardContext";
import { calculateKPIs, mockMonthlyProjections } from "@/lib/data";
import { DollarSign, Percent, TrendingUp, Users } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue (12 mo)"
            value={formatCurrency(kpis.totalRevenue12Mo)}
            subtitle="All revenue streams"
            icon={DollarSign}
          />
          <KPICard
            title="MSO Net Profit"
            value={formatCurrency(kpis.msoNetProfit)}
            subtitle="Revenue - Costs"
            icon={TrendingUp}
          />
          <KPICard
            title="Physician ROI"
            value={formatPercent(kpis.physicianROI)}
            subtitle="Annual / Investment"
            icon={Percent}
          />
          <KPICard
            title="Active Members"
            value={kpis.activeMembers.toString()}
            subtitle="Primary care members"
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
}

