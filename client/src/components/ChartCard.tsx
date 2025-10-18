import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaTooltip } from "./FormulaTooltip";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  formula: string;
  formulaDescription?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Standardized chart card component with built-in formula tooltip
 * Ensures consistent tooltip placement across all charts
 */
export function ChartCard({ 
  title, 
  description, 
  formula, 
  formulaDescription,
  children,
  className 
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <FormulaTooltip 
            formula={formula} 
            description={formulaDescription}
            position="inline"
          />
        </div>
      </CardHeader>
      <CardContent className="relative">
        {children}
      </CardContent>
    </Card>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  formula: string;
  affects?: string[];
  valueClassName?: string;
}

/**
 * Standardized KPI card component with built-in formula tooltip
 */
export function KPICard({
  title,
  value,
  subtitle,
  icon,
  formula,
  affects,
  valueClassName = ""
}: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <FormulaTooltip 
            formula={formula}
            description={affects ? `Affected by: ${affects.join(", ")}` : undefined}
          />
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

