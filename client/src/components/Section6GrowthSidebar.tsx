import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useDashboard } from "@/contexts/DashboardContext";
import { ArrowRight } from "lucide-react";

export function Section6GrowthSidebar() {
  const { inputs, updateInputs } = useDashboard();

  return (
    <div className="space-y-4 px-2">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold">Growth Configuration</h4>
        
        <div className="space-y-2">
          <Label htmlFor="growth-curve" className="text-xs">
            Growth Curve Shape
          </Label>
          <Select
            value={inputs.growthCurveShape}
            onValueChange={(value: any) => updateInputs({ growthCurveShape: value })}
          >
            <SelectTrigger id="growth-curve" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="scurve">S-Curve</SelectItem>
              <SelectItem value="exponential">Exponential</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            Selects interpolation method for growth over time
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Growth Time Horizon</Label>
            <span className="text-xs font-medium">{inputs.growthTimeHorizon} months</span>
          </div>
          <Slider
            value={[inputs.growthTimeHorizon]}
            onValueChange={([value]) => updateInputs({ growthTimeHorizon: value })}
            min={6}
            max={60}
            step={6}
            className="py-2"
          />
          <p className="text-[10px] text-muted-foreground">
            Total months to simulate for growth modeling
          </p>
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="text-xs font-semibold">Stream Growth Rates</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Primary Membership Growth</Label>
            <span className="text-xs font-medium">{inputs.primaryGrowthRate}% / mo</span>
          </div>
          <Slider
            value={[inputs.primaryGrowthRate]}
            onValueChange={([value]) => updateInputs({ primaryGrowthRate: value })}
            min={0}
            max={20}
            step={0.5}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Specialty Visits Growth</Label>
            <span className="text-xs font-medium">{inputs.specialtyGrowthRate}% / mo</span>
          </div>
          <Slider
            value={[inputs.specialtyGrowthRate]}
            onValueChange={([value]) => updateInputs({ specialtyGrowthRate: value })}
            min={0}
            max={20}
            step={0.5}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Corporate Contracts Growth</Label>
            <span className="text-xs font-medium">{inputs.corporateGrowthRate}% / mo</span>
          </div>
          <Slider
            value={[inputs.corporateGrowthRate]}
            onValueChange={([value]) => updateInputs({ corporateGrowthRate: value })}
            min={0}
            max={10}
            step={0.5}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Diagnostics Utilization Growth</Label>
            <span className="text-xs font-medium">{inputs.diagnosticGrowthRate}% / mo</span>
          </div>
          <Slider
            value={[inputs.diagnosticGrowthRate]}
            onValueChange={([value]) => updateInputs({ diagnosticGrowthRate: value })}
            min={0}
            max={15}
            step={0.5}
            className="py-2"
          />
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="p-3 bg-primary/10 rounded-md text-xs space-y-1">
          <p className="font-medium text-primary">Growth Multipliers (Month 12)</p>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Primary:</span>
              <span>{(Math.pow(1 + inputs.primaryGrowthRate / 100, 12)).toFixed(2)}×</span>
            </div>
            <div className="flex justify-between">
              <span>Specialty:</span>
              <span>{(Math.pow(1 + inputs.specialtyGrowthRate / 100, 12)).toFixed(2)}×</span>
            </div>
            <div className="flex justify-between">
              <span>Corporate:</span>
              <span>{(Math.pow(1 + inputs.corporateGrowthRate / 100, 12)).toFixed(2)}×</span>
            </div>
            <div className="flex justify-between">
              <span>Diagnostics:</span>
              <span>{(Math.pow(1 + inputs.diagnosticGrowthRate / 100, 12)).toFixed(2)}×</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={() => alert("All sections complete! Charts coming in Pass 3.")}
          className="w-full gap-2"
          size="sm"
          variant="outline"
        >
          All Inputs Complete
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

