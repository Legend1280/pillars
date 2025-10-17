import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PhysicianROIChartProps {
  specialtyRetained: number;
  equityIncome: number;
  monthlyIncome: number;
}

export function PhysicianROIChart({
  specialtyRetained,
  equityIncome,
  monthlyIncome,
}: PhysicianROIChartProps) {
  const data = [
    { name: "Specialty Retained", value: specialtyRetained },
    { name: "MSO Equity Income", value: equityIncome },
  ];

  const COLORS = ["#60a5fa", "#34d399"]; // Blue and Green

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Physician ROI Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">Income breakdown (Month 12)</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Total: {formatCurrency(monthlyIncome)}/month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

