import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { formulas } from "@/lib/formulas";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { BreakEvenIndicator } from "./visualizations/BreakEvenIndicator";
import { UnitEconomicsCard } from "./visualizations/UnitEconomicsCard";
import { CapitalWaterfall } from "./visualizations/CapitalWaterfall";
import { MonthlyPLTrend } from "./visualizations/MonthlyPLTrend";
import { RevenueWaterfall } from "./visualizations/RevenueWaterfall";
import { CostBreakdownPie } from "./visualizations/CostBreakdownPie";
import { ProfitGauge } from "./visualizations/ProfitGauge";


export function PLSummaryTab() {
  const { projections } = useDashboard();
  const { rampPeriod, projection } = projections;

  // Combine ramp and projection periods
  const allMonths = [...rampPeriod, ...projection];

  // Format currency - round to nearest dollar
  const formatCurrency = (value: number) => {
    const rounded = Math.round(value);
    const formatted = `$${Math.abs(rounded).toLocaleString()}`;
    return rounded < 0 ? `(${formatted})` : formatted;
  };

  // Calculate totals
  const totals = {
    revenue: allMonths.reduce((sum, m) => sum + m.revenue.total, 0),
    costs: allMonths.reduce((sum, m) => sum + m.costs.total, 0),
    profit: allMonths.reduce((sum, m) => sum + m.profit, 0),
  };

  // Get KPI data for visualizations
  const { breakevenAnalysis, unitEconomics, capitalDeployment } = projections.kpis;
  
  // Calculate profit margin for the final month
  const finalMonth = allMonths[allMonths.length - 1];
  const profitMargin = finalMonth.revenue.total > 0 
    ? (finalMonth.profit / finalMonth.revenue.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards with Tooltips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Revenue (18mo)"
          value={formatCurrency(totals.revenue)}
          subtitle="All revenue streams"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          valueColor="text-green-600"
          formula={formulas.totalRevenue}
          affects={["Primary Revenue", "Specialty Revenue", "Corporate Revenue", "Diagnostics Revenue"]}
        />

        <KPICard
          title="Total Costs (18mo)"
          value={formatCurrency(totals.costs)}
          subtitle="All operating costs"
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          valueColor="text-red-600"
          formula={formulas.totalCosts}
          affects={["Salaries", "Fixed Overhead", "Variable Costs", "Equipment Lease"]}
        />

        <KPICard
          title="Net Profit (18mo)"
          value={formatCurrency(totals.profit)}
          subtitle="Total profit/loss"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          valueColor={totals.profit >= 0 ? "text-green-600" : "text-red-600"}
          formula={formulas.monthlyProfit}
          affects={["Revenue Growth", "Cost Management", "Break-Even Timing"]}
        />
      </div>

      {/* P&L Table - Moved here, right after KPI cards */}
      <Card>
        <CardHeader>
          <CardTitle>18-Month Profit & Loss Statement</CardTitle>
          <CardDescription>Complete financial breakdown from ramp through 12-month projection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Month</th>
                  <th className="text-right p-2 font-semibold">Primary</th>
                  <th className="text-right p-2 font-semibold">Specialty</th>
                  <th className="text-right p-2 font-semibold">Corporate</th>
                  <th className="text-right p-2 font-semibold">Diagnostics</th>
                  <th className="text-right p-2 font-semibold bg-green-50">Total Revenue</th>
                  <th className="text-right p-2 font-semibold">Salaries</th>
                  <th className="text-right p-2 font-semibold">Equipment</th>
                  <th className="text-right p-2 font-semibold">Overhead</th>
                  <th className="text-right p-2 font-semibold">Marketing</th>
                  <th className="text-right p-2 font-semibold">Variable</th>
                  <th className="text-right p-2 font-semibold">CapEx</th>
                  <th className="text-right p-2 font-semibold">Startup</th>
                  <th className="text-right p-2 font-semibold bg-red-50">Total Costs</th>
                  <th className="text-right p-2 font-semibold bg-blue-50">Net Profit</th>
                  <th className="text-right p-2 font-semibold bg-blue-100">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {allMonths.map((month) => {
                  const isRamp = month.month <= 6;
                  const diagnosticsTotal = month.revenue.echo + month.revenue.ct + month.revenue.labs;
                  
                  return (
                    <tr key={month.month} className={`border-b hover:bg-muted/50 ${isRamp ? 'bg-amber-50/30' : ''}`}>
                      <td className="p-2 font-medium">
                        {isRamp && month.month === 0 && <span className="text-xs text-amber-600 mr-2">RAMP</span>}
                        {!isRamp && month.month === 7 && <span className="text-xs text-green-600 mr-2">LAUNCH</span>}
                        M{month.month}
                      </td>
                      <td className="text-right p-2">{formatCurrency(month.revenue.primary)}</td>
                      <td className="text-right p-2">{formatCurrency(month.revenue.specialty)}</td>
                      <td className="text-right p-2">{formatCurrency(month.revenue.corporate)}</td>
                      <td className="text-right p-2">{formatCurrency(diagnosticsTotal)}</td>
                      <td className="text-right p-2 font-semibold bg-green-50">{formatCurrency(month.revenue.total)}</td>
                      <td className="text-right p-2">{formatCurrency(month.costs.salaries)}</td>
                      <td className="text-right p-2">{formatCurrency(month.costs.equipmentLease)}</td>
                      <td className="text-right p-2">{formatCurrency(month.costs.fixedOverhead)}</td>
                      <td className="text-right p-2">{formatCurrency(month.costs.marketing)}</td>
                      <td className="text-right p-2">{formatCurrency(month.costs.variable)}</td>
                      <td className="text-right p-2">{formatCurrency(month.costs.capex)}</td>
                      <td className="text-right p-2">{formatCurrency(month.costs.startup)}</td>
                      <td className="text-right p-2 font-semibold bg-red-50">{formatCurrency(month.costs.total)}</td>
                      <td className={`text-right p-2 font-semibold bg-blue-50 ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(month.profit)}
                      </td>
                      <td className={`text-right p-2 font-semibold bg-blue-100 ${month.cumulativeCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(month.cumulativeCash)}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="border-t-2 font-bold bg-muted">
                  <td className="p-2">TOTAL</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.revenue.primary, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.revenue.specialty, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.revenue.corporate, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.revenue.echo + m.revenue.ct + m.revenue.labs, 0))}</td>
                  <td className="text-right p-2 bg-green-100">{formatCurrency(totals.revenue)}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.costs.salaries, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.costs.equipmentLease, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.costs.fixedOverhead, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.costs.marketing, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.costs.variable, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.costs.capex, 0))}</td>
                  <td className="text-right p-2">{formatCurrency(allMonths.reduce((s, m) => s + m.costs.startup, 0))}</td>
                  <td className="text-right p-2 bg-red-100">{formatCurrency(totals.costs)}</td>
                  <td className={`text-right p-2 bg-blue-100 ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.profit)}
                  </td>
                  <td className="text-right p-2 bg-blue-200">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Win Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Capital Waterfall (2/3 width) */}
        <div className="lg:col-span-2">
          <CapitalWaterfall {...capitalDeployment} />
        </div>
        
        {/* Right column - Break-Even and Unit Economics (1/3 width) */}
        <div className="space-y-6">
          <BreakEvenIndicator {...breakevenAnalysis} />
          <UnitEconomicsCard {...unitEconomics} />
        </div>
      </div>

      {/* Monthly P&L Trend - Full Width */}
      <MonthlyPLTrend months={allMonths} />

      {/* Revenue Waterfall + Cost Breakdown - 50/50 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueWaterfall months={allMonths} />
        <CostBreakdownPie costs={allMonths.find(m => m.month === 12)?.costs || allMonths[allMonths.length - 1].costs} />
      </div>

      {/* Profit Gauge - 50% Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfitGauge profitMargin={profitMargin} />
        <div></div> {/* Empty space */}
      </div>
    </div>
  );
}

