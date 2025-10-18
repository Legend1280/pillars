import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon?: LucideIcon;
  formula?: string;
  valueClassName?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function KPICard({ title, value, subtitle, icon: Icon, formula, valueClassName, trend }: KPICardProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {formula && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-md">
                      <div className="text-xs whitespace-pre-wrap">{formula}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-3xl font-bold ${valueClassName || 'text-foreground'}`}>{value}</h3>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.value}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {Icon && (
            <div className="ml-4 p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

