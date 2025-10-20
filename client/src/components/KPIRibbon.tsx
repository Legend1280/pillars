import { KPICard } from "@/components/KPICard";
import { useDashboard } from "@/contexts/DashboardContext";
import { DollarSign, Percent, TrendingUp, Users } from "lucide-react";

export function KPIRibbon() {
  const { projections } = useDashboard();
  const { kpis } = projections;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="border-b bg-muted/30">
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Revenue (12 mo)"
            value={formatCurrency(kpis.totalRevenue12Mo)}
            subtitle="All revenue streams"
            icon={DollarSign}
          />
          <KPICard
            title="MSO Net Profit"
            value={formatCurrency(kpis.totalProfit12Mo)}
            subtitle="Revenue - Costs"
            icon={TrendingUp}
          />
          <KPICard
            title="MSO ROI"
            value={formatPercent(kpis.msoROI)}
            subtitle="Profit / Total Capital"
            icon={Percent}
          />
          <KPICard
            title="Physician ROI"
            value={formatPercent(kpis.physicianROI)}
            subtitle="Income / Individual Capital"
            icon={Percent}
          />
          <KPICard
            title="Active Members"
            value={Math.round(kpis.peakMembers).toLocaleString()}
            subtitle="Primary care members"
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
}

