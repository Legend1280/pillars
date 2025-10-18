import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, DollarSign, Users, Target, Calendar, Award, Zap, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ProjectionTab() {
  const { projections } = useDashboard();
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (12mo)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(kpis.totalRevenue12Mo).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${Math.round(avgMonthlyRevenue).toLocaleString()}/mo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit (12mo)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.totalProfit12Mo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.round(kpis.totalProfit12Mo).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${Math.round(avgMonthlyProfit).toLocaleString()}/mo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(kpis.peakMembers).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Primary care members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Cash Position</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${finalCashPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.round(finalCashPosition).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">End of Month 18</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Runway Alert */}
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

      {/* Revenue & Profitability Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue, Costs & Profitability Trajectory</CardTitle>
          <CardDescription>Monthly financial performance over 12-month projection (Months 7-18)</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Cumulative Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Cash Position</CardTitle>
          <CardDescription>Track cash runway and path to breakeven</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Revenue Streams Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Streams Over Time</CardTitle>
          <CardDescription>How different revenue sources contribute to total revenue</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Member Growth & Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Member Growth Trajectory</CardTitle>
            <CardDescription>Primary and specialty member acquisition</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost Structure</CardTitle>
            <CardDescription>Operating costs by category</CardDescription>
          </CardHeader>
          <CardContent>
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Milestones */}
      {milestones.length > 0 && (
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
      )}

      {/* Monthly Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Member Acquisition & Retention Metrics</CardTitle>
          <CardDescription>Track new member growth and churn patterns</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

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

