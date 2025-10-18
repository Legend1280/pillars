import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CashFlowTab() {
  const { projections, derivedVariables } = useDashboard();

  // Get all 19 months of data (0-18)
  const allMonths = [
    ...projections.rampPeriod.map((m: any, idx: number) => ({ ...m, month: idx })),
    ...projections.projection.map((m: any, idx: number) => ({ ...m, month: idx + 7 })),
  ];

  // Calculate cash flow metrics
  const cashFlowData = allMonths.map((m: any) => {
    const revenue = m.revenue.total;
    const totalCosts = m.costs.total;
    const operatingCashFlow = revenue - totalCosts;
    const investingCashFlow = -(m.costs.capex || 0);
    const netCashFlow = operatingCashFlow + investingCashFlow;

    return {
      month: m.month,
      monthLabel: `M${m.month}`,
      revenue,
      costs: totalCosts,
      operatingCashFlow,
      investingCashFlow,
      netCashFlow,
      capex: m.costs.capex || 0,
    };
  });

  // Calculate cumulative cash position
  let cumulativeCash = derivedVariables.capitalRaised;
  const cumulativeCashData = cashFlowData.map((cf: any) => {
    cumulativeCash += cf.netCashFlow;
    return {
      ...cf,
      cumulativeCash,
    };
  });

  // Calculate key metrics
  const finalCash = cumulativeCashData[cumulativeCashData.length - 1].cumulativeCash;
  const peakCash = Math.max(...cumulativeCashData.map((d: any) => d.cumulativeCash));
  const minCash = Math.min(...cumulativeCashData.map((d: any) => d.cumulativeCash));
  
  // Find breakeven month (first month with positive cumulative cash flow from operations)
  let cumulativeOperatingCF = 0;
  const breakevenMonth = cashFlowData.findIndex((cf: any) => {
    cumulativeOperatingCF += cf.operatingCashFlow;
    return cumulativeOperatingCF > 0;
  });

  // Calculate runway (months until cash runs out)
  const runwayMonths = cumulativeCashData.findIndex((d: any) => d.cumulativeCash < 0);
  const runway = runwayMonths === -1 ? "18+" : runwayMonths;

  // Total burn during ramp (Months 0-6)
  const rampBurn = derivedVariables.capitalRaised - cumulativeCashData[6].cumulativeCash;

  // Average monthly burn rate
  const totalBurn = derivedVariables.capitalRaised - finalCash;
  const avgMonthlyBurn = totalBurn / 19; // 19 months (0-18)

  // Prepare monthly cash flow table data
  const monthlyBreakdown = cumulativeCashData.map((d: any) => ({
    month: d.monthLabel,
    revenue: d.revenue,
    costs: d.costs,
    capex: d.capex,
    netCashFlow: d.netCashFlow,
    cumulativeCash: d.cumulativeCash,
  }));

  // Balance sheet snapshot (end of Month 18)
  const finalMonth = allMonths[allMonths.length - 1];
  const totalCapex = cashFlowData.reduce((sum: number, cf: any) => sum + cf.capex, 0);
  const equipmentValue = totalCapex * 0.7; // Assume 30% depreciation over 18 months
  const totalAssets = finalCash + equipmentValue;
  const totalEquity = derivedVariables.capitalRaised + (finalCash - derivedVariables.capitalRaised);
  const retainedEarnings = finalCash - derivedVariables.capitalRaised;

  return (
    <div className="space-y-6 p-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Runway</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {typeof runway === 'number' ? `${runway} months` : runway}
            </div>
            <p className="text-xs text-muted-foreground">
              Until cash depleted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Cash (M18)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${finalCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(finalCash / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              End of Month 18
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Cash</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${(peakCash / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Highest cash position
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Burn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(avgMonthlyBurn / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              Across 19 months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Runway Alert */}
      {typeof runway === 'number' && runway < 12 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cash Runway Warning:</strong> Current projections show cash depletion in {runway} months.
            Consider reducing costs or planning additional capital raise.
          </AlertDescription>
        </Alert>
      )}

      {finalCash >= 0 && (
        <Alert className="border-green-500 bg-green-50">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Positive Cash Position:</strong> Projections show ${(finalCash / 1000).toFixed(0)}k remaining at Month 18.
            Practice is on track for sustainability.
          </AlertDescription>
        </Alert>
      )}

      {/* Cumulative Cash Position Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Cash Position (18 Months)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your cash runway from launch through Month 18
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={cumulativeCashData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                labelFormatter={(label) => `Month ${label.replace('M', '')}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label="Zero Cash" />
              <Line
                type="monotone"
                dataKey="cumulativeCash"
                stroke="#0d9488"
                strokeWidth={3}
                name="Cash Position"
                dot={{ fill: '#0d9488', r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Cash Flow Waterfall */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Net Cash Flow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Positive (green) and negative (red) cash flow by month
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                labelFormatter={(label) => `Month ${label.replace('M', '')}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="netCashFlow" name="Net Cash Flow" isAnimationActive={false}>
                {cashFlowData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.netCashFlow >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Operating vs Investing Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Operating cash flow (revenue - costs) vs investing cash flow (CapEx)
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                labelFormatter={(label) => `Month ${label.replace('M', '')}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="operatingCashFlow" fill="#3b82f6" name="Operating CF" isAnimationActive={false} />
              <Bar dataKey="investingCashFlow" fill="#f59e0b" name="Investing CF" isAnimationActive={false} />
              <Line
                type="monotone"
                dataKey="netCashFlow"
                stroke="#10b981"
                strokeWidth={2}
                name="Net CF"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Balance Sheet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Balance Sheet Snapshot (Month 18)</CardTitle>
            <p className="text-sm text-muted-foreground">Simplified balance sheet at end of projection period</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-semibold text-sm mb-2">Assets</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash & Equivalents</span>
                    <span className="font-medium">${(finalCash / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equipment (net)</span>
                    <span className="font-medium">${(equipmentValue / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total Assets</span>
                    <span className="text-primary">${(totalAssets / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>

              <div className="border-b pb-3">
                <h4 className="font-semibold text-sm mb-2">Liabilities</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accounts Payable</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total Liabilities</span>
                    <span>$0</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Equity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital Raised</span>
                    <span className="font-medium">${(derivedVariables.capitalRaised / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retained Earnings</span>
                    <span className={`font-medium ${retainedEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(retainedEarnings / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total Equity</span>
                    <span className="text-primary">${(totalEquity / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Financial Metrics</CardTitle>
            <p className="text-sm text-muted-foreground">Critical indicators for investor review</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Capital Raised</span>
                <span className="font-semibold text-primary">
                  ${(derivedVariables.capitalRaised / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Total Burn (Ramp Period)</span>
                <span className="font-semibold">${(rampBurn / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Total CapEx Deployed</span>
                <span className="font-semibold">${(totalCapex / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Operating Breakeven</span>
                <span className="font-semibold">
                  {breakevenMonth >= 0 ? `Month ${breakevenMonth}` : 'Not Reached'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Cash Runway</span>
                <span className={`font-semibold ${typeof runway === 'number' && runway < 12 ? 'text-red-600' : 'text-green-600'}`}>
                  {typeof runway === 'number' ? `${runway} months` : runway}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">ROI (Month 18)</span>
                <span className={`font-semibold ${retainedEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((retainedEarnings / derivedVariables.capitalRaised) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Cash Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow Detail</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete month-by-month breakdown of cash flows
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="py-2 px-3 font-semibold">Month</th>
                  <th className="py-2 px-3 font-semibold text-right">Revenue</th>
                  <th className="py-2 px-3 font-semibold text-right">Costs</th>
                  <th className="py-2 px-3 font-semibold text-right">CapEx</th>
                  <th className="py-2 px-3 font-semibold text-right">Net CF</th>
                  <th className="py-2 px-3 font-semibold text-right">Cash Balance</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{row.month}</td>
                    <td className="py-2 px-3 text-right">${(row.revenue / 1000).toFixed(0)}k</td>
                    <td className="py-2 px-3 text-right">${(row.costs / 1000).toFixed(0)}k</td>
                    <td className="py-2 px-3 text-right">${(row.capex / 1000).toFixed(0)}k</td>
                    <td className={`py-2 px-3 text-right font-medium ${row.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(row.netCashFlow / 1000).toFixed(0)}k
                    </td>
                    <td className={`py-2 px-3 text-right font-semibold ${row.cumulativeCash >= 0 ? 'text-primary' : 'text-red-600'}`}>
                      ${(row.cumulativeCash / 1000).toFixed(0)}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

