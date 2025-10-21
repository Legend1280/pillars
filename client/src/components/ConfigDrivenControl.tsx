import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ControlConfig } from "@/lib/dashboardConfig";
import { useDashboard } from "@/contexts/DashboardContext";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfigDrivenControlProps {
  control: ControlConfig;
}

export function ConfigDrivenControl({ control }: ConfigDrivenControlProps) {
  const { inputs, derivedVariables, updateInputs } = useDashboard();
  
  // For readonly controls, use derivedVariables; for inputs, use inputs object
  const value = control.type === 'readonly' 
    ? (derivedVariables as any)[control.id] ?? control.default
    : (inputs as any)[control.id] ?? control.default;

  const renderControl = () => {
    switch (control.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor={control.id} className="text-xs">
                {control.label}
              </Label>
              {control.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs text-xs">{control.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Switch
              id={control.id}
              checked={value}
              onCheckedChange={(checked) => updateInputs({ [control.id]: checked })}
            />
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label className="text-xs">{control.label}</Label>
                {control.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{control.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span className="text-xs font-medium">
                {control.suffix === '$' && '$'}
                {value}
                {control.suffix && control.suffix !== '$' && control.suffix}
              </span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([newValue]) => updateInputs({ [control.id]: newValue })}
              min={control.min}
              max={control.max}
              step={control.step}
              className="py-2"
            />
            {control.description && (
              <p className="text-[10px] text-muted-foreground">{control.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={control.id} className="text-xs">
                {control.label}
              </Label>
              {control.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs text-xs">{control.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              id={control.id}
              type="number"
              min={control.min}
              max={control.max}
              value={value}
              onChange={(e) => updateInputs({ [control.id]: parseFloat(e.target.value) || 0 })}
              className="h-8 text-xs"
            />
            {control.description && (
              <p className="text-[10px] text-muted-foreground">{control.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={control.id} className="text-xs">
                {control.label}
              </Label>
              {control.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs text-xs">{control.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Select value={value} onValueChange={(newValue) => updateInputs({ [control.id]: newValue })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {control.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {control.description && (
              <p className="text-[10px] text-muted-foreground">{control.description}</p>
            )}
          </div>
        );

      case 'readonly':
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">{control.label}</Label>
                {control.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{control.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span className="text-xs font-medium">
                {control.suffix === '$' && '$'}
                {value}
                {control.suffix && control.suffix !== '$' && control.suffix}
              </span>
            </div>
            {control.formula && (
              <p className="text-[10px] text-muted-foreground italic">= {control.formula}</p>
            )}
          </div>
        );

      case 'button_group':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">{control.label}</Label>
              {control.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs text-xs">{control.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex gap-2">
              {control.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateInputs({ [control.id]: option.value })}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    value === option.value
                      ? 'bg-white border-2 border-teal-600 text-teal-700'
                      : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {control.description && (
              <p className="text-[10px] text-muted-foreground">{control.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <div>{renderControl()}</div>;
}

