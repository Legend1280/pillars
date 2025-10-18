import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingDown, DollarSign, Users, Calendar } from "lucide-react";

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

  return (
    <div className="space-y-6">
      {/* KPIs for Ramp Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ramp Burn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${Math.round(kpis.totalRampBurn).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Months 0-{rampPeriod.length - 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Launch MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(kpis.launchMRR).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Monthly at Month 7</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members at Launch</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(kpis.membersAtLaunch).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Primary care members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash at Launch</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.cashPositionAtLaunch >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.round(kpis.cashPositionAtLaunch).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">End of Month {rampPeriod.length - 1}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ramp Period Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ramp Period Cash Flow</CardTitle>
          <CardDescription>Revenue, costs, and cumulative cash position (Months 0-{rampPeriod.length - 1})</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={rampChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
              <Line type="monotone" dataKey="cumulativeCash" stroke="#3b82f6" strokeWidth={3} name="Cumulative Cash" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Build-Up by Stream</CardTitle>
          <CardDescription>How revenue grows during ramp period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => `$${Math.round(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="primary" stackId="a" fill="#3b82f6" name="Primary Care" />
              <Bar dataKey="specialty" stackId="a" fill="#8b5cf6" name="Specialty" />
              <Bar dataKey="corporate" stackId="a" fill="#f59e0b" name="Corporate" />
              <Bar dataKey="diagnostics" stackId="a" fill="#10b981" name="Diagnostics" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Member Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Member Growth During Ramp</CardTitle>
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
              <Line type="monotone" dataKey="primary" stroke="#3b82f6" strokeWidth={2} name="Primary Members" />
              <Line type="monotone" dataKey="specialty" stroke="#8b5cf6" strokeWidth={2} name="Specialty Members" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
  );
}

