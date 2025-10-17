import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { dashboardConfig, SectionConfig } from "@/lib/dashboardConfig";
import { ConfigDrivenControl } from "./ConfigDrivenControl";
import { useDashboard } from "@/contexts/DashboardContext";

interface ConfigDrivenSidebarProps {
  sectionId: string;
}

export function ConfigDrivenSidebar({ sectionId }: ConfigDrivenSidebarProps) {
  const { inputs, updateInputs, setActiveSection } = useDashboard();
  const section = dashboardConfig.sections.find(s => s.id === sectionId);

  if (!section) {
    return <div className="p-4 text-sm text-muted-foreground">Section not found</div>;
  }

  // Initialize open sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    section.accordions.forEach(accordion => {
      initial[accordion.id] = false;
    });
    return initial;
  });

  const toggleSection = (accordionId: string) => {
    setOpenSections(prev => {
      const isCurrentlyOpen = prev[accordionId];
      
      // If clicking an open section, close it
      if (isCurrentlyOpen) {
        return { ...prev, [accordionId]: false };
      }
      
      // If opening a new section, close all others
      const newState: Record<string, boolean> = {};
      section.accordions.forEach(accordion => {
        newState[accordion.id] = accordion.id === accordionId;
      });
      return newState;
    });
  };

  // Get next section for navigation
  const currentIndex = dashboardConfig.sections.findIndex(s => s.id === sectionId);
  const nextSection = dashboardConfig.sections[currentIndex + 1];

  return (
    <div className="space-y-2 p-4">
      {/* Scenario Mode Buttons (only for inputs section) */}
      {sectionId === 'inputs' && (
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Scenario Mode
          </label>
          <div className="flex gap-2">
            {['null', 'conservative', 'moderate'].map((mode) => (
              <button
                key={mode}
                onClick={() => updateInputs({ scenarioMode: mode as any })}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  inputs.scenarioMode === mode
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Accordions */}
      {section.accordions.map((accordion) => {
        // Skip empty accordions
        if (accordion.controls.length === 0) {
          return null;
        }

        return (
          <Collapsible
            key={accordion.id}
            open={openSections[accordion.id]}
            onOpenChange={() => toggleSection(accordion.id)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
              <span>{accordion.title}</span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  openSections[accordion.id] ? 'rotate-90' : ''
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2 px-2">
              {accordion.controls.map((control) => (
                <ConfigDrivenControl key={control.id} control={control} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Next Button */}
      {nextSection && (
        <button
          onClick={() => setActiveSection(nextSection.id)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
        >
          Next: {nextSection.title}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

