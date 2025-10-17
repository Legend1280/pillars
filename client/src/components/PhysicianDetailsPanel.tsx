import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhysicianMetrics } from "@/lib/data";

interface PhysicianDetailsPanelProps {
  metrics: PhysicianMetrics;
}

export function PhysicianDetailsPanel({ metrics }: PhysicianDetailsPanelProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const detailRows = [
    { label: "Physician Type", value: `${metrics.type} (${metrics.position})` },
    { label: "Investment", value: formatCurrency(metrics.investment) },
    { label: "Equity Stake", value: formatPercent(metrics.equityStake) },
    { label: "MSO Service Fee", value: formatPercent(metrics.serviceFee) },
    { label: "Specialty Revenue Retained", value: formatCurrency(metrics.specialtyRetained) },
    { label: "Equity Income from MSO", value: formatCurrency(metrics.equityIncome) },
    { label: "Monthly Income (Month 12)", value: formatCurrency(metrics.monthlyIncome), highlight: true },
    { label: "Annualized Income", value: formatCurrency(metrics.annualizedIncome), highlight: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Physician Type</CardTitle>
        <p className="text-sm text-muted-foreground">{metrics.type} ({metrics.position})</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {detailRows.map((row, index) => (
            <div
              key={index}
              className={`flex justify-between items-center py-2 ${
                row.highlight ? "border-t border-border pt-3" : ""
              }`}
            >
              <span className={`text-sm ${row.highlight ? "font-semibold" : "text-muted-foreground"}`}>
                {row.label}
              </span>
              <span className={`text-sm ${row.highlight ? "font-bold text-lg" : "font-medium"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

