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

export function Section5StaffingSidebar() {
  const { inputs, updateInputs, setActiveSection } = useDashboard();

  return (
    <div className="space-y-4 px-2">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold">Staffing Configuration</h4>
        
        <div className="space-y-2">
          <Label htmlFor="staff-ramp" className="text-xs">
            Staff Ramp Curve
          </Label>
          <Select
            value={inputs.staffRampCurve}
            onValueChange={(value: any) => updateInputs({ staffRampCurve: value })}
          >
            <SelectTrigger id="staff-ramp" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="scurve">S-Curve</SelectItem>
              <SelectItem value="stepwise">Stepwise</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            Determines how quickly staff scale up over time
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Executive Compensation %</Label>
            <span className="text-xs font-medium">{inputs.executiveCompPct}%</span>
          </div>
          <Slider
            value={[inputs.executiveCompPct]}
            onValueChange={([value]) => updateInputs({ executiveCompPct: value })}
            min={0}
            max={25}
            step={1}
            className="py-2"
          />
          <p className="text-[10px] text-muted-foreground">
            Executive team compensation as a percentage of total payroll
          </p>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="p-3 bg-muted rounded-md text-xs space-y-2">
          <p className="font-medium">Staffing Roles Table</p>
          <p className="text-muted-foreground">
            Detailed role-by-role staffing configuration (FTE, salary, start month) will be implemented in Pass 3.
          </p>
          <p className="text-muted-foreground">
            For now, staffing costs are calculated based on executive compensation percentage.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={() => setActiveSection("growth")}
          className="w-full gap-2"
          size="sm"
        >
          Next: Growth
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

