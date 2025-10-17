import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyProjection } from "@/lib/data";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueChartProps {
  data: MonthlyProjection[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format data for the chart
  const chartData = data.map((d) => ({
    month: `Month ${d.month}`,
    "Primary Revenue": d.primaryRevenue,
    "Specialty MSO": d.specialtyRevenue,
    Diagnostics: d.diagnosticsRevenue,
    Corporate: d.corporateRevenue,
    "Net Profit": d.netProfit,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>12-Month Financial Projection</CardTitle>
        <p className="text-sm text-muted-foreground">Revenue and profit growth over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="rect"
              iconSize={12}
            />
            <Bar dataKey="Primary Revenue" stackId="revenue" fill="hsl(var(--chart-1))" />
            <Bar dataKey="Specialty MSO" stackId="revenue" fill="hsl(var(--chart-2))" />
            <Bar dataKey="Diagnostics" stackId="revenue" fill="hsl(var(--chart-3))" />
            <Bar dataKey="Corporate" stackId="revenue" fill="hsl(var(--chart-4))" />
            <Line
              type="monotone"
              dataKey="Net Profit"
              stroke="hsl(var(--chart-5))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-5))", r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

