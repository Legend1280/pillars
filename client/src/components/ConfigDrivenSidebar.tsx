import { useState } from "react";
import { ChevronRight, RotateCcw, Save } from "lucide-react";
import { SCENARIO_PRESETS, getZeroedInputs } from "@/lib/scenarioPresets";
import { saveScenario, loadScenario } from "@/lib/scenariosApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { dashboardConfig, SectionConfig } from "@/lib/dashboardConfig";
import { ConfigDrivenControl } from "./ConfigDrivenControl";
import { useDashboard } from "@/contexts/DashboardContext";

interface ConfigDrivenSidebarProps {
  sectionId: string;
}

export function ConfigDrivenSidebar({ sectionId }: ConfigDrivenSidebarProps) {
  const { inputs, updateInputs, navigateToSection } = useDashboard();
  const section = dashboardConfig.sections.find(s => s.id === sectionId);

  if (!section) {
    return <div className="p-4 text-sm text-muted-foreground">Section not found</div>;
  }

  // Initialize open sections state - all accordions open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    section.accordions.forEach(accordion => {
      initial[accordion.id] = true;
    });
    return initial;
  });

  const toggleSection = (accordionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [accordionId]: !prev[accordionId]
    }));
  };

  // Get next section for navigation
  const currentIndex = dashboardConfig.sections.findIndex(s => s.id === sectionId);
  const nextSection = dashboardConfig.sections[currentIndex + 1];

  return (
    <div className="h-full flex flex-col">
      {/* Scenario Management (only for inputs section) - Sticky at top */}
      {sectionId === 'inputs' && (
        <div className="sticky top-0 z-10 bg-white space-y-3 p-4 pb-4 border-b shadow-sm">
          <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Scenarios</Label>
          
          {/* Scenario Selection Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={inputs.scenarioMode === 'null' ? 'default' : 'outline'}
              size="sm"
              className={inputs.scenarioMode === 'null' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              onClick={async () => {
                const scenarioKey = 'lean';
                try {
                  const saved = await loadScenario(scenarioKey);
                  if (saved) {
                    updateInputs({ ...saved, scenarioMode: 'null' });
                    toast.success('Loaded Lean (saved)');
                  } else {
                    const preset = SCENARIO_PRESETS[scenarioKey];
                    updateInputs({ ...preset, scenarioMode: 'null' });
                    toast.success('Loaded Lean (preset)');
                  }
                } catch (error) {
                  console.error('Failed to load scenario:', error);
                  const preset = SCENARIO_PRESETS[scenarioKey];
                  updateInputs({ ...preset, scenarioMode: 'null' });
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
                    toast.success('Loaded Conservative (saved)');
                  } else {
                    const preset = SCENARIO_PRESETS[scenarioKey];
                    updateInputs({ ...preset, scenarioMode: 'conservative' });
                    toast.success('Loaded Conservative (preset)');
                  }
                } catch (error) {
                  console.error('Failed to load scenario:', error);
                  const preset = SCENARIO_PRESETS[scenarioKey];
                  updateInputs({ ...preset, scenarioMode: 'conservative' });
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
                    toast.success('Loaded Moderate (saved)');
                  } else {
                    const preset = SCENARIO_PRESETS[scenarioKey];
                    updateInputs({ ...preset, scenarioMode: 'moderate' });
                    toast.success('Loaded Moderate (preset)');
                  }
                } catch (error) {
                  console.error('Failed to load scenario:', error);
                  const preset = SCENARIO_PRESETS[scenarioKey];
                  updateInputs({ ...preset, scenarioMode: 'moderate' });
                  toast.error('Failed to load saved scenario, using preset');
                }
              }}
            >
              Moderate
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                const zeroed = getZeroedInputs();
                updateInputs(zeroed);
                toast.success('Reset to zero');
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Zero
            </Button>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  const scenarioKey = inputs.scenarioMode === 'null' ? 'lean' : inputs.scenarioMode;
                  const scenarioName = scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1);
                  try {
                    await saveScenario(scenarioKey, inputs);
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
                  const scenarioKey = inputs.scenarioMode === 'null' ? 'lean' : inputs.scenarioMode;
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
      )}

      {/* Scrollable Accordions */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
      {section.accordions.map((accordion) => {
        // Skip empty accordions
        if (accordion.controls.length === 0) {
          return null;
        }

        return (
          <div key={accordion.id} className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
            <Collapsible
              open={openSections[accordion.id]}
              onOpenChange={() => toggleSection(accordion.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 text-sm font-medium transition-colors">
                <span>{accordion.title}</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-500 ease-in-out ${
                    openSections[accordion.id] ? 'rotate-90' : ''
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 p-3 pt-2 bg-gray-50/50">
                {accordion.controls.map((control) => (
                  <ConfigDrivenControl key={control.id} control={control} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}

      {/* Next Button */}
      {nextSection && (
        <button
          onClick={() => navigateToSection(nextSection.id)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
        >
          Next: {nextSection.title}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
      </div>
    </div>
  );
}

