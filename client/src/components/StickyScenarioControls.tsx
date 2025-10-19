import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/contexts/DashboardContext";
import { RotateCcw } from "lucide-react";
import { SCENARIO_PRESETS, getZeroedInputs } from "@/lib/scenarioPresets";
import { toast } from "sonner";

export function StickyScenarioControls() {
  const { inputs, updateInputs } = useDashboard();

  return (
    <div className="sticky top-0 z-10 bg-card border-b p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          Scenario Presets
        </Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => {
            const zeroed = getZeroedInputs();
            updateInputs(zeroed);
            toast.success("Reset to zero");
          }}
          title="Reset to Zero"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      <Select
        value={inputs.scenarioMode}
        onValueChange={(value: 'null' | 'conservative' | 'moderate') => {
          // Load the preset values for this scenario
          const preset = SCENARIO_PRESETS[value === 'null' ? 'lean' : value];
          updateInputs({ ...preset, scenarioMode: value });
          toast.success(`Loaded ${value === 'null' ? 'Lean' : value.charAt(0).toUpperCase() + value.slice(1)} scenario`);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">Lean</SelectItem>
          <SelectItem value="conservative">Conservative</SelectItem>
          <SelectItem value="moderate">Moderate</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

