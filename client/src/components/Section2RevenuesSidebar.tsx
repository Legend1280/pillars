import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDashboard } from "@/contexts/DashboardContext";
import { ChevronRight, HelpCircle } from "lucide-react";
import { useState } from "react";
import { HelpModal } from "./HelpModal";

export function Section2RevenuesSidebar() {
  const { inputs, updateInputs, setActiveSection } = useDashboard();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    primary: false,
    specialty: false,
    corporate: false,
    physician: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const isCurrentlyOpen = prev[section];
      // If closing the current section, just close it
      if (isCurrentlyOpen) {
        return { ...prev, [section]: false };
      }
      // If opening a new section, close all others
      return {
        primary: false,
        specialty: false,
        corporate: false,
        physician: false,
        [section]: true,
      };
    });
  };

  return (
    <div className="space-y-2 p-4">
      {/* Primary Care */}
      <Collapsible open={openSections.primary} onOpenChange={() => toggleSection('primary')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
          <span>Primary Care</span>
          <ChevronRight className={`h-4 w-4 transition-transform ${openSections.primary ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 py-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Initial Members / Physician</Label>
                <HelpModal title="Initial Members / Physician">
                  <p>Starting primary care panel size per physician at launch.</p>
                </HelpModal>
              </div>
              <span className="text-xs font-medium">{inputs.primaryInitPerPhysician}</span>
            </div>
            <Slider
              value={[inputs.primaryInitPerPhysician]}
              onValueChange={([value]) => updateInputs({ primaryInitPerPhysician: value })}
              min={0}
              max={200}
              step={5}
              className="w-full"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Specialty Care */}
      <Collapsible open={openSections.specialty} onOpenChange={() => toggleSection('specialty')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
          <span>Specialty Care</span>
          <ChevronRight className={`h-4 w-4 transition-transform ${openSections.specialty ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 py-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Initial Visits / Physician</Label>
                <HelpModal title="Initial Visits / Physician">
                  <p>Starting specialty visit volume per physician at launch.</p>
                </HelpModal>
              </div>
              <span className="text-xs font-medium">{inputs.specialtyInitPerPhysician}</span>
            </div>
            <Slider
              value={[inputs.specialtyInitPerPhysician]}
              onValueChange={([value]) => updateInputs({ specialtyInitPerPhysician: value })}
              min={0}
              max={200}
              step={5}
              className="w-full"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Corporate Contracts */}
      <Collapsible open={openSections.corporate} onOpenChange={() => toggleSection('corporate')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
          <span>Corporate Contracts</span>
          <ChevronRight className={`h-4 w-4 transition-transform ${openSections.corporate ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 py-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">New Contracts / Month</Label>
                <HelpModal title="New Contracts / Month">
                  <p>Number of new corporate wellness contracts signed per month.</p>
                </HelpModal>
              </div>
              <span className="text-xs font-medium">{inputs.corporateContractsMonthly}</span>
            </div>
            <Slider
              value={[inputs.corporateContractsMonthly]}
              onValueChange={([value]) => updateInputs({ corporateContractsMonthly: value })}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Employees / Contract</Label>
                <HelpModal title="Employees / Contract">
                  <p>Average number of employees covered per corporate contract.</p>
                </HelpModal>
              </div>
              <span className="text-xs font-medium">{inputs.corpEmployeesPerContract}</span>
            </div>
            <Slider
              value={[inputs.corpEmployeesPerContract]}
              onValueChange={([value]) => updateInputs({ corpEmployeesPerContract: value })}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Price / Employee / Month</Label>
                <HelpModal title="Price / Employee / Month">
                  <p>Monthly fee charged per employee in corporate wellness programs.</p>
                </HelpModal>
              </div>
              <span className="text-xs font-medium">${inputs.corpPricePerEmployeeMonth}</span>
            </div>
            <Slider
              value={[inputs.corpPricePerEmployeeMonth]}
              onValueChange={([value]) => updateInputs({ corpPricePerEmployeeMonth: value })}
              min={500}
              max={2500}
              step={50}
              className="w-full"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Physician Lens */}
      <Collapsible open={openSections.physician} onOpenChange={() => toggleSection('physician')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
          <span>Physician Lens</span>
          <ChevronRight className={`h-4 w-4 transition-transform ${openSections.physician ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 py-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Primary Carry-Over</Label>
                <HelpModal title="Primary Carry-Over">
                  <p>Existing primary care members brought by the physician from their previous practice.</p>
                </HelpModal>
              </div>
              <span className="text-xs font-medium">{inputs.physicianPrimaryCarryover}</span>
            </div>
            <Slider
              value={[inputs.physicianPrimaryCarryover]}
              onValueChange={([value]) => updateInputs({ physicianPrimaryCarryover: value })}
              min={0}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Specialty Carry-Over</Label>
                <HelpModal title="Specialty Carry-Over">
                  <p>Existing specialty clients brought by the physician from their previous practice.</p>
                </HelpModal>
              </div>
              <span className="text-xs font-medium">{inputs.physicianSpecialtyCarryover}</span>
            </div>
            <Slider
              value={[inputs.physicianSpecialtyCarryover]}
              onValueChange={([value]) => updateInputs({ physicianSpecialtyCarryover: value })}
              min={0}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

        </CollapsibleContent>
      </Collapsible>

      {/* Next Button */}
      <button
        onClick={() => setActiveSection("diagnostics")}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
      >
        Next: Diagnostics
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

