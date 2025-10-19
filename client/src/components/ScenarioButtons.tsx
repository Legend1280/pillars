import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { SCENARIO_PRESETS, getZeroedInputs } from "@/lib/scenarioPresets";
import { saveScenario, loadScenario } from "@/lib/scenariosApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/contexts/DashboardContext";

export function ScenarioButtons() {
  const { inputs, updateInputs } = useDashboard();

  return (
    <div className="sticky top-0 z-10 bg-white space-y-3 p-4 pb-4 border-b shadow-sm">
      <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Scenarios</Label>
      
      {/* Scenario Selection Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={inputs.scenarioMode === 'lean' ? 'default' : 'outline'}
          size="sm"
          className={inputs.scenarioMode === 'lean' ? 'bg-teal-600 hover:bg-teal-700' : ''}
          onClick={async () => {
            const scenarioKey = 'lean';
            try {
              const saved = await loadScenario(scenarioKey);
              if (saved) {
                updateInputs({ ...saved, scenarioMode: 'lean' });
                localStorage.setItem('pillars-last-scenario', scenarioKey);
                toast.success('Loaded Lean (saved)');
              } else {
                const preset = SCENARIO_PRESETS[scenarioKey];
                updateInputs({ ...preset, scenarioMode: 'lean' });
                localStorage.setItem('pillars-last-scenario', scenarioKey);
                toast.success('Loaded Lean (preset)');
              }
            } catch (error) {
              console.error('Failed to load scenario:', error);
              const preset = SCENARIO_PRESETS[scenarioKey];
              updateInputs({ ...preset, scenarioMode: 'lean' });
              localStorage.setItem('pillars-last-scenario', scenarioKey);
              toast.error('Failed to load saved scenario, using preset');
            }
          }}
        >
          Lean
        </Button>
        <Button
          variant={inputs.scenarioMode === 'conservative' ? 'default' : 'outline'}
          size="sm"
          className={inputs.scenarioMode === 'conservative' ? 'bg-teal-600 hover:bg-teal-700' : ''}
          onClick={async () => {
            const scenarioKey = 'conservative';
            try {
              const saved = await loadScenario(scenarioKey);
              if (saved) {
                updateInputs({ ...saved, scenarioMode: 'conservative' });
                localStorage.setItem('pillars-last-scenario', scenarioKey);
                toast.success('Loaded Conservative (saved)');
              } else {
                const preset = SCENARIO_PRESETS[scenarioKey];
                updateInputs({ ...preset, scenarioMode: 'conservative' });
                localStorage.setItem('pillars-last-scenario', scenarioKey);
                toast.success('Loaded Conservative (preset)');
              }
            } catch (error) {
              console.error('Failed to load scenario:', error);
              const preset = SCENARIO_PRESETS[scenarioKey];
              updateInputs({ ...preset, scenarioMode: 'conservative' });
              localStorage.setItem('pillars-last-scenario', scenarioKey);
              toast.error('Failed to load saved scenario, using preset');
            }
          }}
        >
          Conservative
        </Button>
        <Button
          variant={inputs.scenarioMode === 'moderate' ? 'default' : 'outline'}
          size="sm"
          className={inputs.scenarioMode === 'moderate' ? 'bg-teal-600 hover:bg-teal-700' : ''}
          onClick={async () => {
            const scenarioKey = 'moderate';
            try {
              const saved = await loadScenario(scenarioKey);
              if (saved) {
                updateInputs({ ...saved, scenarioMode: 'moderate' });
                localStorage.setItem('pillars-last-scenario', scenarioKey);
                toast.success('Loaded Moderate (saved)');
              } else {
                const preset = SCENARIO_PRESETS[scenarioKey];
                updateInputs({ ...preset, scenarioMode: 'moderate' });
                localStorage.setItem('pillars-last-scenario', scenarioKey);
                toast.success('Loaded Moderate (preset)');
              }
            } catch (error) {
              console.error('Failed to load scenario:', error);
              const preset = SCENARIO_PRESETS[scenarioKey];
              updateInputs({ ...preset, scenarioMode: 'moderate' });
              localStorage.setItem('pillars-last-scenario', scenarioKey);
              toast.error('Failed to load saved scenario, using preset');
            }
          }}
        >
          Moderate
        </Button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex-shrink-0"
          onClick={() => {
            const zeroed = getZeroedInputs();
            updateInputs(zeroed);
            toast.success('Reset to zero');
          }}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Zero
        </Button>
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={async () => {
              const scenarioKey = inputs.scenarioMode === 'lean' ? 'lean' : inputs.scenarioMode;
              const scenarioName = scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1);
              try {
                await saveScenario(scenarioKey, inputs);
                localStorage.setItem('pillars-last-scenario', scenarioKey);
                toast.success(`Saved to ${scenarioName}`);
              } catch (error) {
                console.error('Failed to save scenario:', error);
                toast.error(`Failed to save ${scenarioName}`);
              }
            }}
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={async () => {
              const scenarioKey = inputs.scenarioMode === 'lean' ? 'lean' : inputs.scenarioMode;
              const scenarioName = scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1);
              try {
                const saved = await loadScenario(scenarioKey);
                if (saved) {
                  updateInputs(saved);
                  toast.success(`Reset to saved ${scenarioName}`);
                } else {
                  const preset = SCENARIO_PRESETS[scenarioKey];
                  updateInputs(preset);
                  toast.success(`Reset to ${scenarioName} preset`);
                }
              } catch (error) {
                console.error('Failed to load scenario:', error);
                const preset = SCENARIO_PRESETS[scenarioKey];
                updateInputs(preset);
                toast.error('Failed to load saved scenario, using preset');
              }
            }}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

