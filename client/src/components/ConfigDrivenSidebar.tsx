import { useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { SCENARIO_PRESETS, getZeroedInputs } from "@/lib/scenarioPresets";
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
    <div className="h-full overflow-y-auto space-y-2 p-4">
      {/* Scenario Selector (only for inputs section) */}
      {sectionId === 'inputs' && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Select Scenario</Label>
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
              const scenarioKey = value === 'null' ? 'lean' : value;
              const scenarioName = scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1);
              
              // Try to load saved scenario from localStorage first
              const storageKey = `pillars-scenario-${scenarioKey}`;
              const saved = localStorage.getItem(storageKey);
              console.log('LOADING:', storageKey, 'Found:', !!saved);
              
              if (saved) {
                // Load saved scenario
                const savedInputs = JSON.parse(saved);
                console.log('Loading saved inputs:', savedInputs);
                updateInputs({ ...savedInputs, scenarioMode: value });
                toast.success(`Loaded ${scenarioName} (saved)`);
                alert(`Loaded ${scenarioName} (saved)!`);
              } else {
                // Load preset if no saved version exists
                const preset = SCENARIO_PRESETS[scenarioKey];
                console.log('Loading preset:', preset);
                updateInputs({ ...preset, scenarioMode: value });
                toast.success(`Loaded ${scenarioName} (preset)`);
                alert(`Loaded ${scenarioName} (preset)!`);
              }
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
      )}

      {/* Accordions */}
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
  );
}

