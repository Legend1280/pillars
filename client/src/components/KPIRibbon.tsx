import { KPICard } from "@/components/KPICard";
import { useDashboard } from "@/contexts/DashboardContext";
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Users, 
  Layers,
  Heart,
  UserCheck,
  Gem
} from "lucide-react";

export function KPIRibbon() {
  const { projections } = useDashboard();
  const { kpis } = projections;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatRatio = (value: number) => {
    return `${value.toFixed(1)}:1`;
  };

  return (
    <div className="border-b bg-muted/30">
      <div className="container py-6">
        {/* 4x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ROW 1: Financial KPIs */}
          <KPICard
            title="Monthly Income"
            value={formatCurrency(kpis.monthlyIncome)}
            subtitle="Specialty + Equity + Diagnostics"
            icon={DollarSign}
            valueClassName="text-green-600 dark:text-green-400"
            formula="Monthly Income = Specialty Retained + Equity Income + Diagnostics Share + Corporate Share"
          />
          
          <KPICard
            title="Annualized ROI"
            value={formatPercent(kpis.annualizedROI)}
            subtitle={`On ${formatCurrency(kpis.annualizedROI > 0 ? 600000 : 750000)} investment`}
            icon={Percent}
            valueClassName="text-green-600 dark:text-green-400"
            formula="ROI = (Annual Income / Individual Investment) × 100"
          />
          
          <KPICard
            title="MSO Equity Income"
            value={formatCurrency(kpis.msoEquityIncome)}
            subtitle="Monthly passive earnings"
            icon={TrendingUp}
            valueClassName="text-green-600 dark:text-green-400"
            formula="Equity Income = Net Profit × Equity Stake (10% founding, 5% additional)"
          />
          
          <KPICard
            title="Equity Stake Value"
            value={formatCurrency(kpis.equityStakeValue)}
            subtitle="At 2× earnings multiple"
            icon={Gem}
            valueClassName="text-green-600 dark:text-green-400"
            formula="Equity Value = (Annual Profit × 2) × Equity Percentage"
          />

          {/* ROW 2: Structural & Quality-of-Life KPIs */}
          <KPICard
            title="Independent Revenue Streams"
            value={kpis.independentRevenueStreams.toString()}
            subtitle="Active income sources"
            icon={Layers}
            valueClassName="text-blue-600 dark:text-blue-400"
            formula="Count of: Primary, Specialty, Corporate, Echo, CT, Labs (where revenue > $0)"
          />
          
          <KPICard
            title="Specialty Patient Load"
            value={Math.round(kpis.specialtyPatientLoad).toLocaleString()}
            subtitle="≈ ⅕ vs hospital volume"
            icon={Users}
            valueClassName="text-blue-600 dark:text-blue-400"
            formula="Active specialty members (hospital baseline: 730 patients/month)"
          />
          
          <KPICard
            title="Quality-of-Life Index"
            value={`+${formatPercent(kpis.qualityOfLifeIndex)}`}
            subtitle="Time recovered from admin"
            icon={Heart}
            valueClassName="text-purple-600 dark:text-purple-400"
            formula="QoL = ((Hospital Admin 30% - MSO Admin 10%) / 30%) × 100"
          />
          
          <KPICard
            title="Support-to-Physician Ratio"
            value={formatRatio(kpis.supportToPhysicianRatio)}
            subtitle="Shared staff support"
            icon={UserCheck}
            valueClassName="text-purple-600 dark:text-purple-400"
            formula="Support Ratio = (NPs + Admin + Marketing + Diagnostics) / Total Physicians"
          />
        </div>
      </div>
    </div>
  );
}

