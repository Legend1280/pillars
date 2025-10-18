import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

export function ProjectionTab() {
  const { projections } = useDashboard();
  const { projection, kpis } = projections;

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
  }));

  // Prepare revenue breakdown data
  const revenueBreakdownData = projection.map((month) => ({
    month: `M${month.month}`,
    primary: month.revenue.primary,
    specialty: month.revenue.specialty,
    corporate: month.revenue.corporate,
    diagnostics: month.revenue.echo + month.revenue.ct + month.revenue.labs,
  }));

  // Prepare cost breakdown data
  const costBreakdownData = projection.map((month) => ({
    month: `M${month.month}`,
    salaries: month.costs.salaries,
    equipment: month.costs.equipmentLease,
    overhead: month.costs.fixedOverhead,
    marketing: month.costs.marketing,
    variable: month.costs.variable,
  }));

  // Prepare member growth data
  const memberGrowthData = projection.map((month) => ({
    month: `M${month.month}`,
    primary: month.members.primaryActive,
    specialty: month.members.specialtyActive,
    newPrimary: month.members.primaryNew,
    churned: month.members.primaryChurned,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs for 12-Month Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (12mo)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${kpis.totalRevenue12Mo.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Months 7-18</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit (12mo)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.totalProfit12Mo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${kpis.totalProfit12Mo.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Revenue - Costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.peakMembers}</div>
            <p className="text-xs text-muted-foreground">Primary care members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breakeven Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.breakevenMonth !== null ? `M${kpis.breakevenMonth}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">First positive cash</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Profit Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Profit Projection</CardTitle>
          <CardDescription>Monthly revenue, costs, and profit (Months 7-18)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={projectionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Revenue" />
              <Area type="monotone" dataKey="costs" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Costs" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Profit" dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cumulative Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Cash Position</CardTitle>
          <CardDescription>Running cash balance over 12-month period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="cumulativeCash" stroke="#3b82f6" strokeWidth={3} name="Cumulative Cash" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Stream</CardTitle>
          <CardDescription>Monthly revenue breakdown by source</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="primary" stackId="a" fill="#3b82f6" name="Primary Care" />
              <Bar dataKey="specialty" stackId="a" fill="#8b5cf6" name="Specialty" />
              <Bar dataKey="corporate" stackId="a" fill="#f59e0b" name="Corporate" />
              <Bar dataKey="diagnostics" stackId="a" fill="#10b981" name="Diagnostics" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Monthly operating costs by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={costBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="salaries" stackId="a" fill="#ef4444" name="Salaries" />
              <Bar dataKey="equipment" stackId="a" fill="#f97316" name="Equipment Lease" />
              <Bar dataKey="overhead" stackId="a" fill="#f59e0b" name="Fixed Overhead" />
              <Bar dataKey="marketing" stackId="a" fill="#eab308" name="Marketing" />
              <Bar dataKey="variable" stackId="a" fill="#84cc16" name="Variable Costs" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Member Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Member Growth Trajectory</CardTitle>
          <CardDescription>Primary and specialty member growth over 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="primary" stroke="#3b82f6" strokeWidth={3} name="Primary Members" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="specialty" stroke="#8b5cf6" strokeWidth={2} name="Specialty Members" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Member Dynamics */}
      <Card>
        <CardHeader>
          <CardTitle>Member Acquisition & Churn</CardTitle>
          <CardDescription>New members vs churned members each month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newPrimary" fill="#10b981" name="New Members" />
              <Bar dataKey="churned" fill="#ef4444" name="Churned Members" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

