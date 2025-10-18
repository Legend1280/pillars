import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormulaTooltipProps {
  formula: string;
  description?: string;
  position?: "top-right" | "inline";
}

/**
 * Reusable component for displaying formula tooltips
 * Can be positioned in top-right of charts or inline with text
 */
export function FormulaTooltip({ formula, description, position = "inline" }: FormulaTooltipProps) {
  const positionClasses = position === "top-right" 
    ? "absolute top-2 right-2 z-10" 
    : "inline-flex items-center";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={positionClasses}>
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-2xl max-h-96 overflow-y-auto" side="left">
          <div className="space-y-2">
            {description && (
              <p className="text-sm font-medium">{description}</p>
            )}
            <div className="bg-muted/50 p-2 rounded">
              <p className="text-xs font-mono whitespace-pre-wrap">{formula}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Specialized component for KPI card tooltips
 */
export function KPITooltip({ title, formula, affects }: { 
  title: string; 
  formula: string; 
  affects?: string[];
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help transition-colors ml-2" />
        </TooltipTrigger>
        <TooltipContent className="max-w-2xl max-h-96 overflow-y-auto">
          <div className="space-y-2">
            <p className="text-sm font-semibold">{title}</p>
            <div className="bg-muted/50 p-2 rounded">
              <p className="text-xs font-mono whitespace-pre-wrap">{formula}</p>
            </div>
            {affects && affects.length > 0 && (
              <div className="text-xs">
                <p className="font-medium mb-1">Affected by:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {affects.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

