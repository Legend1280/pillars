import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingDown, DollarSign, Users, Calendar, AlertCircle, TrendingUp, Scissors } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartCard, KPICard } from "./ChartCard";
import { formulas } from "@/lib/formulas";


export function RampLaunchTab() {
  const { projections } = useDashboard();
  const { rampPeriod, launchState, kpis } = projections;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  // Prepare chart data for ramp period
  const rampChartData = rampPeriod.map((month) => ({
    month: `M${month.month}`,
    revenue: month.revenue.total,
    costs: month.costs.total,
    profit: month.profit,
    cumulativeCash: month.cumulativeCash,
  }));

  // Prepare revenue breakdown data
  const revenueBreakdownData = rampPeriod.map((month) => ({
    month: `M${month.month}`,
    primary: month.revenue.primary,
    specialty: month.revenue.specialty,
    corporate: month.revenue.corporate,
    diagnostics: month.revenue.echo + month.revenue.ct + month.revenue.labs,
  }));

  // Prepare member growth data
  const memberGrowthData = rampPeriod.map((month) => ({
    month: `M${month.month}`,
    primary: month.members.primaryActive,
    specialty: month.members.specialtyActive,
  }));

  // ============================================================================
  // COST ANALYSIS DATA PREPARATION
  // ============================================================================

  // Calculate total costs by category across entire ramp period
  const totalCostsByCategory = rampPeriod.reduce(
    (acc, month) => ({
      salaries: acc.salaries + month.costs.salaries,
      equipmentLease: acc.equipmentLease + month.costs.equipmentLease,
      fixedOverhead: acc.fixedOverhead + month.costs.fixedOverhead,
      marketing: acc.marketing + month.costs.marketing,
      variable: acc.variable + month.costs.variable,
      capex: acc.capex + month.costs.capex,
      startup: acc.startup + month.costs.startup,
      equityBuyout: acc.equityBuyout + month.costs.equityBuyout,
    }),
    {
      salaries: 0,
      equipmentLease: 0,
      fixedOverhead: 0,
      marketing: 0,
      variable: 0,
      capex: 0,
      startup: 0,
      equityBuyout: 0,
    }
  );

  // Prepare pie chart data for cost breakdown
  const costBreakdownPieData = [
    { name: "Salaries & Staff", value: totalCostsByCategory.salaries, color: "#3b82f6" },
    { name: "CapEx & Buildout", value: totalCostsByCategory.capex, color: "#ef4444" },
    { name: "Startup Costs", value: totalCostsByCategory.startup, color: "#f59e0b" },
    { name: "Fixed Overhead", value: totalCostsByCategory.fixedOverhead, color: "#8b5cf6" },
    { name: "Marketing", value: totalCostsByCategory.marketing, color: "#10b981" },
    { name: "Equipment Lease", value: totalCostsByCategory.equipmentLease, color: "#06b6d4" },
    { name: "Variable Costs", value: totalCostsByCategory.variable, color: "#ec4899" },
    { name: "Equity Buyout", value: totalCostsByCategory.equityBuyout, color: "#a855f7" },
  ].filter((item) => item.value > 0); // Only show categories with actual costs

  // Month-by-month cost breakdown for stacked bar chart
  const monthlyCoststackData = rampPeriod.map((month) => ({
    month: `M${month.month}`,
    salaries: month.costs.salaries,
    equipmentLease: month.costs.equipmentLease,
    fixedOverhead: month.costs.fixedOverhead,
    marketing: month.costs.marketing,
    variable: month.costs.variable,
    capex: month.costs.capex,
    startup: month.costs.startup,
    equityBuyout: month.costs.equityBuyout,
  }));

  // Identify top cost drivers (sorted by total spend)
  const topCostDrivers = Object.entries(totalCostsByCategory)
    .map(([category, amount]) => ({
      category: category
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim(),
      amount,
      percentage: (amount / kpis.totalRampBurn) * 100,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Calculate burn rate by month
  const burnRateData = rampPeriod.map((month) => ({
    month: `M${month.month}`,
    burnRate: month.costs.total,
    avgBurn: kpis.totalRampBurn / rampPeriod.length,
  }));

  // ============================================================================
  // COST OPTIMIZATION INSIGHTS
  // ============================================================================

  const optimizationInsights: Array<{
    title: string;
    description: string;
    potentialSavings: number;
    impact: "high" | "medium" | "low";
  }> = [];

  // Analyze CapEx timing
  if (totalCostsByCategory.capex > 0) {
    optimizationInsights.push({
      title: "Phased CapEx Deployment",
      description: "Consider staging buildout costs across 2-3 months instead of Month 0 to preserve early cash runway",
      potentialSavings: totalCostsByCategory.capex * 0.15, // Potential 15% savings through better vendor negotiations
      impact: "high",
    });
  }

  // Analyze marketing spend
  if (totalCostsByCategory.marketing > 0) {
    const avgMonthlyMarketing = totalCostsByCategory.marketing / rampPeriod.filter(m => m.costs.marketing > 0).length;
    if (avgMonthlyMarketing > 10000) {
      optimizationInsights.push({
        title: "Optimize Marketing Channels",
        description: "Focus on highest-ROI channels (referrals, local partnerships) and reduce low-performing paid ads",
        potentialSavings: totalCostsByCategory.marketing * 0.25,
        impact: "medium",
      });
    }
  }

  // Analyze staffing timing
  if (totalCostsByCategory.salaries > 0) {
    optimizationInsights.push({
      title: "Delay Non-Critical Hires",
      description: "Consider delaying Director of Operations or Event Planner by 1-2 months until member base stabilizes",
      potentialSavings: 15000, // Approximate 1-2 month salary delay
      impact: "medium",
    });
  }

  // Analyze equipment lease
  if (totalCostsByCategory.equipmentLease > 0) {
    optimizationInsights.push({
      title: "Equipment Lease Negotiation",
      description: "Negotiate longer-term leases for CT/Echo equipment to reduce monthly payments by 10-15%",
      potentialSavings: totalCostsByCategory.equipmentLease * 0.12,
      impact: "low",
    });
  }

  // Analyze equity buyout structure
  if (totalCostsByCategory.equityBuyout > 0) {
    const isAllUpfront = inputs.equityBuyoutStructure === 'all_upfront';
    optimizationInsights.push({
      title: isAllUpfront ? "Consider Spreading Equity Buyout" : "Equity Buyout Cash Flow",
      description: isAllUpfront 
        ? "Spreading the $600K equity buyout over 18 months ($33K/month) reduces upfront cash impact and improves liquidity during ramp period"
        : "Monthly $33K equity buyout payments continue through M17. Ensure cash reserves can support this commitment alongside operational costs",
      potentialSavings: isAllUpfront ? 0 : 0, // No savings, just cash flow timing
      impact: isAllUpfront ? "high" : "medium",
    });
  }

  // Analyze fixed overhead
  if (totalCostsByCategory.fixedOverhead > 50000) {
    optimizationInsights.push({
      title: "Shared Office Space",
      description: "Consider co-working or shared medical office space for first 3-6 months to reduce overhead",
      potentialSavings: totalCostsByCategory.fixedOverhead * 0.3,
      impact: "high",
    });
  }

  // Sort by impact and potential savings
  optimizationInsights.sort((a, b) => {
    const impactWeight = { high: 3, medium: 2, low: 1 };
    return impactWeight[b.impact] - impactWeight[a.impact] || b.potentialSavings - a.potentialSavings;
  });

  return (
    <div className="relative">
      
      <div id="ramp-launch-content" className="space-y-6">
      {/* KPIs for Ramp Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Capital Deployed"
          value={`$${Math.round(kpis.totalRampBurn).toLocaleString()}`}
          subtitle={`Months 0-${rampPeriod.length - 1}`}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          formula={formulas.capitalDeployed}
          affects={["Ramp Duration", "Fixed Overhead", "Physician Count", "Marketing Spend", "Startup Costs"]}
          valueClassName="text-red-600"
        />

        <KPICard
          title="Launch MRR (Monthly Recurring Revenue)"
          value={`$${Math.round(kpis.launchMRR).toLocaleString()}`}
          subtitle={`Monthly at Month ${rampPeriod.length} (includes diagnostics)`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          formula={formulas.launchMRR}
          affects={["Primary Price", "Specialty Price", "Member Count", "Corporate Contracts", "Diagnostics"]}
          valueClassName="text-green-600"
        />

        <KPICard
          title="Members at Launch"
          value={Math.round(kpis.membersAtLaunch)}
          subtitle="Primary care members"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          formula={formulas.membersAtLaunch}
          affects={["Primary Intake Rate", "Physician Count", "Ramp Duration", "Churn Rate"]}
        />

        <KPICard
          title="Cash at Launch"
          value={`$${Math.round(kpis.cashPositionAtLaunch).toLocaleString()}`}
          subtitle={`End of Month ${rampPeriod.length - 1}`}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          formula={formulas.cashAtLaunch}
          affects={["Starting Capital", "Capital Deployed"]}
          valueClassName={kpis.cashPositionAtLaunch >= 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* Cost Optimization Alert */}
      {optimizationInsights.length > 0 && (
        <Alert>
          <Scissors className="h-4 w-4" />
          <AlertTitle>Cost Optimization Opportunities Identified</AlertTitle>
          <AlertDescription>
            We've identified {optimizationInsights.length} potential areas to reduce capital deployment by up to{" "}
            <strong>${Math.round(optimizationInsights.reduce((sum, item) => sum + item.potentialSavings, 0)).toLocaleString()}</strong>.
            See details below.
          </AlertDescription>
        </Alert>
      )}

      {/* Ramp Period Cash Flow Chart */}
      <ChartCard
        title="Ramp Period Cash Flow"
        description={`Revenue, costs, and cumulative cash position (Months 0-${rampPeriod.length - 1})`}
        formula="Revenue = Primary + Specialty + Corporate + Diagnostics\nCosts = Salaries + Overhead + Variable + Equipment\nCash = Starting Capital + Σ(Revenue - Costs)"
        formulaDescription="Shows monthly revenue, costs, and cumulative cash burn during ramp period"
      >
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={rampChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" isAnimationActive={false} />
            <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" isAnimationActive={false} />
            <Line type="monotone" dataKey="cumulativeCash" stroke="#3b82f6" strokeWidth={3} name="Cumulative Cash" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cost Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Pie Chart */}
        <ChartCard
          title="Total Cost Breakdown"
          description={`Where your $${Math.round(kpis.totalRampBurn / 1000)}k capital is deployed`}
          formula="Total Costs = Salaries + CapEx + Startup + Fixed Overhead + Marketing + Equipment Lease + Variable"
          formulaDescription="Breakdown of capital deployment by cost category during ramp period"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                  data={costBreakdownPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdownPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
        </ChartCard>

        {/* Top Cost Drivers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Cost Drivers</CardTitle>
            <CardDescription>Ranked by total spend during ramp period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCostDrivers.slice(0, 5).map((driver, index) => (
                <div key={driver.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{driver.category}</div>
                      <div className="text-sm text-muted-foreground">{driver.percentage.toFixed(1)}% of total</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${Math.round(driver.amount).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month-by-Month Cost Breakdown */}
      <ChartCard
        title="Monthly Cost Breakdown"
        description="Detailed spending by category each month"
        formula="Monthly Total = CapEx + Startup + Salaries + Overhead + Marketing + Equipment + Variable"
        formulaDescription="Stacked bar chart showing cost composition for each month of ramp period"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyCoststackData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="capex" stackId="a" fill="#ef4444" name="CapEx" isAnimationActive={false} />
            <Bar dataKey="startup" stackId="a" fill="#f59e0b" name="Startup" isAnimationActive={false} />
            <Bar dataKey="salaries" stackId="a" fill="#3b82f6" name="Salaries" isAnimationActive={false} />
            <Bar dataKey="fixedOverhead" stackId="a" fill="#8b5cf6" name="Overhead" isAnimationActive={false} />
            <Bar dataKey="marketing" stackId="a" fill="#10b981" name="Marketing" isAnimationActive={false} />
            <Bar dataKey="equipmentLease" stackId="a" fill="#06b6d4" name="Equipment" isAnimationActive={false} />
            <Bar dataKey="variable" stackId="a" fill="#ec4899" name="Variable" isAnimationActive={false} />
            <Bar dataKey="equityBuyout" stackId="a" fill="#a855f7" name="Equity Buyout" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Burn Rate Analysis */}
      <ChartCard
        title="Monthly Burn Rate Analysis"
        description="Track spending patterns to identify cost spikes"
        formula="Monthly Burn = Total Costs - Total Revenue"
        formulaDescription="Shows net cash burn (negative profit) for each month during ramp"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={burnRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
            <Bar dataKey="burnRate" fill="#ef4444" name="Monthly Burn" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cost Optimization Recommendations */}
      {optimizationInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Cost Optimization Recommendations
            </CardTitle>
            <CardDescription>Actionable strategies to reduce capital deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationInsights.map((insight, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            insight.impact === "high"
                              ? "bg-red-100 text-red-700"
                              : insight.impact === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Potential Savings</div>
                      <div className="text-lg font-bold text-green-600">
                        ${Math.round(insight.potentialSavings).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Breakdown */}
      <ChartCard
        title="Revenue Build-Up by Stream"
        description="How revenue grows during ramp period"
        formula="Total Revenue = Primary + Specialty + Corporate + Diagnostics\nPrimary = Members × Price/Month\nSpecialty = Visits × Price/Visit\nCorporate = Employees × Price/Employee\nDiagnostics = Echo + CT + Labs"
        formulaDescription="Stacked bar showing revenue composition from each stream during ramp"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={revenueBreakdownData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="primary" stackId="a" fill="#3b82f6" name="Primary Care" isAnimationActive={false} />
            <Bar dataKey="specialty" stackId="a" fill="#8b5cf6" name="Specialty" isAnimationActive={false} />
            <Bar dataKey="corporate" stackId="a" fill="#f59e0b" name="Corporate" isAnimationActive={false} />
            <Bar dataKey="diagnostics" stackId="a" fill="#10b981" name="Diagnostics" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Member Growth */}
      <ChartCard
        title="Member Growth During Ramp"
        description="Primary and specialty member acquisition"
        formula="Primary Members = Previous + (Intake/Physician × Physicians) - Churn\nSpecialty Members = Previous + (Intake/Physician × Physicians) - Churn\nChurn = Active Members × (Annual Churn Rate / 12)"
        formulaDescription="Member growth trajectory accounting for intake and churn"
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={memberGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="primary" stroke="#3b82f6" strokeWidth={2} name="Primary Members" isAnimationActive={false} />
            <Line type="monotone" dataKey="specialty" stroke="#8b5cf6" strokeWidth={2} name="Specialty Members" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Launch State Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Launch State (Month 7)</CardTitle>
          <CardDescription>Practice state at the end of ramp period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Members</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Members:</span>
                  <span className="font-medium">{Math.round(launchState.primaryMembers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialty Members:</span>
                  <span className="font-medium">{Math.round(launchState.specialtyMembers).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Financials</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Revenue:</span>
                  <span className="font-medium text-green-600">${Math.round(launchState.monthlyRevenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Costs:</span>
                  <span className="font-medium text-red-600">${Math.round(launchState.monthlyCosts).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment Lease:</span>
                  <span className="font-medium">${Math.round(launchState.equipmentLease).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Team</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Headcount:</span>
                  <span className="font-medium">{launchState.teamHeadcount}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Active Services</h4>
              <div className="flex flex-wrap gap-2">
                {launchState.activeServices.map((service) => (
                  <span key={service} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

