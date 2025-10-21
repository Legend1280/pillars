import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, DollarSign, Users, Target, Calendar, Award, Zap, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { formulas, detailedFormulas } from "@/lib/formulas";


export function ProjectionTab() {
  const { projections, inputs } = useDashboard();
  const { projection, kpis, launchState } = projections;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  // Prepare chart data for 12-month projection
  const projectionChartData = projection.map((month) => ({
    month: `M${month.month}`,
    revenue: month.revenue.total,
    costs: month.costs.total,
    profit: month.profit,
    cumulativeCash: month.cumulativeCash,
    profitMargin: month.revenue.total > 0 ? (month.profit / month.revenue.total) * 100 : 0,
  }));

  // Revenue breakdown by stream
  const revenueStreamData = projection.map((month) => ({
    month: `M${month.month}`,
    primary: month.revenue.primary,
    specialty: month.revenue.specialty,
    corporate: month.revenue.corporate,
    diagnostics: month.revenue.echo + month.revenue.ct + month.revenue.labs,
  }));

  // Member growth trajectory
  const memberGrowthData = projection.map((month) => ({
    month: `M${month.month}`,
    primary: month.members.primaryActive,
    specialty: month.members.specialtyActive,
    total: month.members.primaryActive + month.members.specialtyActive,
  }));

  // Cost breakdown over time
  const costBreakdownData = projection.map((month) => ({
    month: `M${month.month}`,
    salaries: month.costs.salaries,
    overhead: month.costs.fixedOverhead,
    marketing: month.costs.marketing,
    equipment: month.costs.equipmentLease,
    variable: month.costs.variable,
    equityBuyout: month.costs.equityBuyout,
  }));

  // Monthly metrics for analysis
  const monthlyMetricsData = projection.map((month) => ({
    month: `M${month.month}`,
    revenuePerMember: month.members.primaryActive > 0 
      ? month.revenue.total / (month.members.primaryActive + month.members.specialtyActive)
      : 0,
    newMembers: month.members.primaryNew + month.members.specialtyNew,
    churnedMembers: month.members.primaryChurned,
  }));

  // Calculate key insights
  const firstProfitableMonth = projection.find(m => m.profit > 0);
  const breakevenMonth = kpis.breakevenMonth;
  const peakRevenue = Math.max(...projection.map(m => m.revenue.total));
  const peakProfit = Math.max(...projection.map(m => m.profit));
  const avgMonthlyRevenue = kpis.totalRevenue12Mo / 12;
  const avgMonthlyProfit = kpis.totalProfit12Mo / 12;
  const finalCashPosition = projection[projection.length - 1].cumulativeCash;
  const revenueGrowthRate = projection.length > 1 
    ? ((projection[projection.length - 1].revenue.total - projection[0].revenue.total) / projection[0].revenue.total) * 100
    : 0;

  // Identify milestones
  const milestones = [];
  
  if (firstProfitableMonth) {
    milestones.push({
      month: firstProfitableMonth.month,
      title: "First Profitable Month",
      description: `Monthly profit: $${Math.round(firstProfitableMonth.profit).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
    });
  }

  if (breakevenMonth && breakevenMonth >= 7 && breakevenMonth <= 18) {
    milestones.push({
      month: breakevenMonth,
      title: "Cash Breakeven",
      description: "Cumulative cash position turns positive",
      icon: Target,
      color: "text-blue-600",
    });
  }

  // Find month when members hit 200
  const members200Month = projection.find(m => m.members.primaryActive >= 200);
  if (members200Month) {
    milestones.push({
      month: members200Month.month,
      title: "200 Primary Members",
      description: `Total members: ${members200Month.members.primaryActive + members200Month.members.specialtyActive}`,
      icon: Users,
      color: "text-purple-600",
    });
  }

  // Find peak revenue month
  const peakRevenueMonth = projection.find(m => m.revenue.total === peakRevenue);
  if (peakRevenueMonth) {
    milestones.push({
      month: peakRevenueMonth.month,
      title: "Peak Monthly Revenue",
      description: `$${Math.round(peakRevenue).toLocaleString()}`,
      icon: Award,
      color: "text-amber-600",
    });
  }

  // Calculate runway (months until cash runs out if negative)
  const negativeMonths = projection.filter(m => m.cumulativeCash < 0);
  const hasNegativeCash = negativeMonths.length > 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue (12mo @ m18)"
          value={`$${Math.round(kpis.totalRevenue12Mo).toLocaleString()}`}
          subtitle={`Avg: $${Math.round(avgMonthlyRevenue).toLocaleString()}/mo`}
          icon={DollarSign}
          formula={formulas.totalRevenue12Mo}
          valueClassName="text-green-600"
        />

        <KPICard
          title="Total Profit (12mo)"
          value={`$${Math.round(kpis.totalProfit12Mo).toLocaleString()}`}
          subtitle={`Avg: $${Math.round(avgMonthlyProfit).toLocaleString()}/mo`}
          icon={TrendingUp}
          formula={formulas.totalProfit12Mo}
          valueClassName={kpis.totalProfit12Mo >= 0 ? 'text-green-600' : 'text-red-600'}
        />

        <KPICard
          title="Peak Members"
          value={Math.round(kpis.peakMembers).toLocaleString()}
          subtitle="Primary care members"
          icon={Users}
          formula={formulas.peakMembers}
        />

        <KPICard
          title="Final Cash Position"
          value={`$${Math.round(finalCashPosition).toLocaleString()}`}
          subtitle="End of Month 18"
          icon={Calendar}
          formula={formulas.finalCashPosition}
          valueClassName={finalCashPosition >= 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* Alerts Section */}
      <>
      {hasNegativeCash && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cash Runway Warning</AlertTitle>
          <AlertDescription>
            Cumulative cash position remains negative through Month {negativeMonths[negativeMonths.length - 1].month}. 
            Consider reducing costs or increasing revenue to achieve positive cash flow sooner.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {!hasNegativeCash && breakevenMonth && breakevenMonth <= 18 && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertTitle>Strong Financial Performance</AlertTitle>
          <AlertDescription>
            Cash breakeven achieved at Month {breakevenMonth}. Revenue growth rate: {revenueGrowthRate.toFixed(1)}% over 12 months.
          </AlertDescription>
        </Alert>
      )}
      </>

      {/* Revenue & Profitability Chart */}
      <ChartCard
        title="Revenue, Costs & Profitability Trajectory"
        description="Monthly financial performance over 12-month projection (Months 7-18)"
        formula={detailedFormulas.revenueCostsProfitability}
      >
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={projectionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={formatCurrency} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Margin %', angle: -90, position: 'insideRight' }} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Profit Margin %') return `${value.toFixed(1)}%`;
                  return `$${Math.round(value).toLocaleString()}`;
                }}
              />
              <Legend />
              <ReferenceLine yAxisId="left" y={0} stroke="#666" strokeDasharray="3 3" />
              <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#10b981" stroke="#10b981" fillOpacity={0.3} name="Revenue" isAnimationActive={false} />
              <Area yAxisId="left" type="monotone" dataKey="costs" fill="#ef4444" stroke="#ef4444" fillOpacity={0.3} name="Costs" isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Profit" isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="profitMargin" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Profit Margin %" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
      </ChartCard>

      {/* Cumulative Cash Flow */}
      <ChartCard
        title="Cumulative Cash Position"
        description="Track cash runway and path to breakeven"
        formula={detailedFormulas.cumulativeCashPosition}
      >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projectionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" label="Breakeven" />
              <Area 
                type="monotone" 
                dataKey="cumulativeCash" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.4}
                name="Cumulative Cash"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
      </ChartCard>

      {/* Revenue Streams Breakdown */}
      <ChartCard
        title="Revenue Streams Over Time"
        description="How different revenue sources contribute to total revenue"
        formula={detailedFormulas.revenueStreamsOverTime}
      >
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueStreamData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="primary" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Primary Care" isAnimationActive={false} />
              <Area type="monotone" dataKey="specialty" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Specialty" isAnimationActive={false} />
              <Area type="monotone" dataKey="corporate" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Corporate" isAnimationActive={false} />
              <Area type="monotone" dataKey="diagnostics" stackId="1" stroke="#10b981" fill="#10b981" name="Diagnostics" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
      </ChartCard>

      {/* Member Growth & Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth */}
        <ChartCard
          title="Member Growth Trajectory"
          description="Primary and specialty member acquisition"
          formula={detailedFormulas.memberGrowthTrajectory}
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
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Total Members" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
        </ChartCard>

        {/* Cost Breakdown */}
        <ChartCard
          title="Monthly Cost Structure"
          description="Operating costs by category"
          formula={detailedFormulas.monthlyCostStructure}
        >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="salaries" stackId="a" fill="#3b82f6" name="Salaries" isAnimationActive={false} />
                <Bar dataKey="overhead" stackId="a" fill="#8b5cf6" name="Overhead" isAnimationActive={false} />
                <Bar dataKey="marketing" stackId="a" fill="#10b981" name="Marketing" isAnimationActive={false} />
                <Bar dataKey="equipment" stackId="a" fill="#f59e0b" name="Equipment" isAnimationActive={false} />
                <Bar dataKey="variable" stackId="a" fill="#ec4899" name="Variable" isAnimationActive={false} />
                <Bar dataKey="equityBuyout" stackId="a" fill="#a855f7" name="Equity Buyout" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Key Milestones */}
      {milestones.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Key Milestones & Achievements</CardTitle>
            <CardDescription>Important events during the 12-month projection period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 ${milestone.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          Month {milestone.month}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Monthly Performance Metrics */}
      <ChartCard
        title="Member Acquisition & Retention Metrics"
        description="Track new member growth and churn patterns"
        formula={detailedFormulas.memberAcquisitionRetention}
      >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} label={{ value: 'Revenue/Member', angle: -90, position: 'insideRight' }} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Revenue per Member') return `$${Math.round(value).toLocaleString()}`;
                  return Math.round(value);
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="newMembers" fill="#10b981" name="New Members" isAnimationActive={false} />
              <Bar yAxisId="left" dataKey="churnedMembers" fill="#ef4444" name="Churned Members" isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="revenuePerMember" stroke="#3b82f6" strokeWidth={2} name="Revenue per Member" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
      </ChartCard>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Performance Summary</CardTitle>
          <CardDescription>Key metrics and growth indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Revenue Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-medium">${Math.round(kpis.totalRevenue12Mo).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Monthly:</span>
                  <span className="font-medium">${Math.round(avgMonthlyRevenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Monthly:</span>
                  <span className="font-medium">${Math.round(peakRevenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Growth Rate:</span>
                  <span className="font-medium text-green-600">{revenueGrowthRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Profitability</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Profit:</span>
                  <span className={`font-medium ${kpis.totalProfit12Mo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.round(kpis.totalProfit12Mo).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Monthly:</span>
                  <span className="font-medium">${Math.round(avgMonthlyProfit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Monthly:</span>
                  <span className="font-medium">${Math.round(peakProfit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First Profit:</span>
                  <span className="font-medium">
                    {firstProfitableMonth ? `Month ${firstProfitableMonth.month}` : 'Not achieved'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Member Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Members:</span>
                  <span className="font-medium">{Math.round(launchState.primaryMembers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Members:</span>
                  <span className="font-medium">{Math.round(kpis.peakMembers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Members:</span>
                  <span className="font-medium">
                    {Math.round(projection[projection.length - 1].members.primaryActive).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Growth:</span>
                  <span className="font-medium text-green-600">
                    {Math.round(projection[projection.length - 1].members.primaryActive - launchState.primaryMembers).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

