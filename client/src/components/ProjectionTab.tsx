import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

export function ProjectionTab() {
  const { projections } = useDashboard();
  const { projection, kpis } = projections;

  // Format currency for charts
  const formatCurrency = (value: number) => {
    return `$${Math.round(value / 1000)}k`;
  };

  // Prepare chart data
  const projectionChartData = projection.map((month) => ({
    month: `M${month.month}`,
    revenue: month.revenue.total,
    costs: month.costs.total,
    profit: month.profit,
  }));

  const memberGrowthData = projection.map((month) => ({
    month: `M${month.month}`,
    primary: month.members.primaryActive,
    specialty: month.members.specialtyActive,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs for 12-Month Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(kpis.totalRevenue12Mo).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Months 7-18</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(kpis.totalProfit12Mo).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">12-month total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(kpis.peakMembers).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Maximum primary members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breakeven</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Month {kpis.breakevenMonth}
            </div>
            <p className="text-xs text-muted-foreground">First profitable month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Profit Chart */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Revenue & Profit Projection</CardTitle>
          <CardDescription>Financial performance (Months 7-18)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Member Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Member Growth</CardTitle>
          <CardDescription>Primary and specialty member acquisition (Months 7-18)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="primary" stroke="#3b82f6" strokeWidth={2} name="Primary Members" />
              <Line type="monotone" dataKey="specialty" stroke="#8b5cf6" strokeWidth={2} name="Specialty Members" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

