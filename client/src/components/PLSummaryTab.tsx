import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Revenue (18mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totals.revenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Costs (18mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totals.costs)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Net Profit (18mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.profit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Table */}
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
    </div>
  );
}

