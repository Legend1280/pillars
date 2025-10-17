import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDashboard } from "@/contexts/DashboardContext";
import { ChevronRight, DollarSign, Users, Building2 } from "lucide-react";
import { useState } from "react";

export function Section2RevenuesSidebar() {
  const { inputs, updateInputs } = useDashboard();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    primary: false,
    specialty: false,
    corporate: false,
    physician: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-3 p-4">
      {/* Primary Care Revenue */}
      <Collapsible open={openSections.primary} onOpenChange={() => toggleSection('primary')}>
        <Card className="border-l-4 border-l-blue-500">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm">Primary Care</CardTitle>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${openSections.primary ? 'rotate-90' : ''}`} />
              </div>
              <CardDescription className="text-xs text-left">
                Initial primary care members per physician
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Initial Members / Physician</Label>
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
                <p className="text-[10px] text-muted-foreground">
                  Starting primary care panel size per physician
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Specialty Care Revenue */}
      <Collapsible open={openSections.specialty} onOpenChange={() => toggleSection('specialty')}>
        <Card className="border-l-4 border-l-purple-500">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-sm">Specialty Care</CardTitle>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${openSections.specialty ? 'rotate-90' : ''}`} />
              </div>
              <CardDescription className="text-xs text-left">
                Initial specialty visits per physician
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Initial Visits / Physician</Label>
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
                <p className="text-[10px] text-muted-foreground">
                  Starting specialty visit volume per physician
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Corporate Contracts */}
      <Collapsible open={openSections.corporate} onOpenChange={() => toggleSection('corporate')}>
        <Card className="border-l-4 border-l-orange-500">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-500" />
                  <CardTitle className="text-sm">Corporate Contracts</CardTitle>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${openSections.corporate ? 'rotate-90' : ''}`} />
              </div>
              <CardDescription className="text-xs text-left">
                B2B corporate wellness parameters
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">New Contracts / Month</Label>
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
                  <Label className="text-xs">Employees / Contract</Label>
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
                  <Label className="text-xs">Price / Employee / Month</Label>
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
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Physician Lens (Carryover & Multiplier) */}
      <Collapsible open={openSections.physician} onOpenChange={() => toggleSection('physician')}>
        <Card className="border-l-4 border-l-teal-500">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  <CardTitle className="text-sm">Physician Lens</CardTitle>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${openSections.physician ? 'rotate-90' : ''}`} />
              </div>
              <CardDescription className="text-xs text-left">
                Individual physician carry-over and team multiplier
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Primary Carry-Over</Label>
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
                <p className="text-[10px] text-muted-foreground">
                  Existing primary members brought by physician
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Specialty Carry-Over</Label>
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
                <p className="text-[10px] text-muted-foreground">
                  Existing specialty clients brought by physician
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Team Specialty Multiplier</Label>
                  <span className="text-xs font-medium">{inputs.teamSpecialtyMultiplier.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[inputs.teamSpecialtyMultiplier]}
                  onValueChange={([value]) => updateInputs({ teamSpecialtyMultiplier: value })}
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-[10px] text-muted-foreground">
                  Specialty volume boost from team collaboration
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Next Button */}
      <button
        onClick={() => {/* Navigate to next section */}}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        Next: Diagnostics
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

