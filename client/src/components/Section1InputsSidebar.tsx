import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SliderWithReset } from "@/components/ui/slider-with-reset";
import { Switch } from "@/components/ui/switch";
import { useDashboard } from "@/contexts/DashboardContext";
import { ChevronRight, ArrowRight, Upload } from "lucide-react";
import { useState } from "react";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { tooltips } from "@/lib/tooltips";
import { defaultValues } from "@/lib/defaults";

export function Section1InputsSidebar() {
  const { inputs, updateInputs, setActiveSection, derivedVariables } = useDashboard();
  const [openSections, setOpenSections] = useState({
    physician: false,
    growth: false,
    derived: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = prev[section];
      // If closing the current section, just close it
      if (isCurrentlyOpen) {
        return { ...prev, [section]: false };
      }
      // If opening a new section, close all others
      return {
        physician: false,
        growth: false,
        derived: false,
        [section]: true,
      };
    });
  };

  // Derived calculations
  const msoFee = inputs.foundingToggle ? 0.37 : 0.40;
  const equityShare = inputs.foundingToggle ? 0.10 : 0.05;
  const retention = 1 - inputs.churnPrimary / 12;
  // physiciansLaunch is derived from foundingToggle: 1 if true, 0 if false
  const physiciansLaunch = inputs.foundingToggle ? 1 : 0;
  const capitalRaised = physiciansLaunch * 600000;
  const otherPhysiciansCount = Math.max(physiciansLaunch - 1, 0);
  const teamPrimaryStockM1 = otherPhysiciansCount * (inputs.otherPhysiciansPrimaryCarryoverPerPhysician || 25);
  const teamSpecialtyStockM1 = otherPhysiciansCount * (inputs.otherPhysiciansSpecialtyCarryoverPerPhysician || 40);

  return (
    <div className="space-y-4 px-2">
      {/* Scenario Mode Selector */}
      <div className="space-y-2 pt-2">
        <Label className="text-xs font-medium text-muted-foreground">Scenario Mode</Label>
        <div className="flex items-center gap-1 border border-teal-500/30 rounded-md p-1 bg-teal-50/50">
          <button
            className={`flex-1 h-8 px-3 text-xs font-medium rounded transition-all ${
              inputs.scenarioMode === 'null'
                ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm'
                : 'hover:bg-teal-100 text-teal-700'
            }`}
            onClick={() => updateInputs({ scenarioMode: 'null' })}
          >
            Null
          </button>
          <button
            className={`flex-1 h-8 px-3 text-xs font-medium rounded transition-all ${
              inputs.scenarioMode === 'conservative'
                ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm'
                : 'hover:bg-teal-100 text-teal-700'
            }`}
            onClick={() => updateInputs({ scenarioMode: 'conservative' })}
          >
            Conservative
          </button>
          <button
            className={`flex-1 h-8 px-3 text-xs font-medium rounded transition-all ${
              inputs.scenarioMode === 'moderate'
                ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm'
                : 'hover:bg-teal-100 text-teal-700'
            }`}
            onClick={() => updateInputs({ scenarioMode: 'moderate' })}
          >
            Moderate
          </button>
        </div>
      </div>

      {/* Physician Setup (includes carry-over) */}
      <Collapsible open={openSections.physician} onOpenChange={() => toggleSection("physician")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
          <span>Physician Setup</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${openSections.physician ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <LabelWithTooltip label="Founding Physician Model" tooltip={tooltips.foundingToggle} />
              <p className="text-[10px] text-muted-foreground">
                {inputs.foundingToggle ? "37% MSO / 10% Equity" : "40% MSO / 5% Equity"}
              </p>
            </div>
            <Switch
              checked={inputs.foundingToggle}
              onCheckedChange={(checked) => updateInputs({ foundingToggle: checked })}
            />
          </div>

          {/* Founding Physicians - now automatic based on toggle */}
          <div className="text-[10px] font-medium text-teal-700 bg-teal-50 p-2 rounded border border-teal-200">
            Founding Physicians: {physiciansLaunch} (automatic based on toggle)
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <LabelWithTooltip label="Additional Physicians" tooltip="Number of additional (non-founding) physicians (each contributes $750k)" />
              <span className="text-xs font-medium">{inputs.additionalPhysicians}</span>
            </div>
            <SliderWithReset
              value={[inputs.additionalPhysicians]}
              onValueChange={([value]) => updateInputs({ additionalPhysicians: value })}
              defaultValue={defaultValues.additionalPhysicians}
              min={0}
              max={7}
              step={1}
              className="py-2"
            />
            <p className="text-[10px] text-muted-foreground">
              Additional physicians at launch (each contributes $750k)
            </p>
          </div>

          <div className="text-[10px] font-medium text-teal-700 bg-teal-50 p-2 rounded border border-teal-200">
            Total Physicians: {physiciansLaunch + inputs.additionalPhysicians}
          </div>

          {/* Carry-Over Inputs */}
          <div className="space-y-2">
            <LabelWithTooltip htmlFor="primary-carryover" label="My Primary Members (Carry-Over)" tooltip={tooltips.physicianPrimaryCarryover} />
            <Input
              id="primary-carryover"
              type="number"
              min={0}
              max={150}
              value={inputs.physicianPrimaryCarryover || 0}
              onChange={(e) =>
                updateInputs({ physicianPrimaryCarryover: parseInt(e.target.value) || 0 })
              }
              className="h-8 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Established primary patients from prior practice
            </p>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip htmlFor="specialty-carryover" label="My Specialty Clients (Carry-Over)" tooltip={tooltips.physicianSpecialtyCarryover} />
            <Input
              id="specialty-carryover"
              type="number"
              min={0}
              max={150}
              value={inputs.physicianSpecialtyCarryover || 0}
              onChange={(e) =>
                updateInputs({ physicianSpecialtyCarryover: parseInt(e.target.value) || 0 })
              }
              className="h-8 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Existing specialty clients you'll continue serving
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <LabelWithTooltip label="Carry-Over Primary per Other Physician" tooltip={tooltips.otherPhysiciansPrimaryCarryoverPerPhysician} />
              <span className="text-xs font-medium">
                {inputs.otherPhysiciansPrimaryCarryoverPerPhysician || 25}
              </span>
            </div>
            <SliderWithReset
              value={[inputs.otherPhysiciansPrimaryCarryoverPerPhysician || 25]}
              onValueChange={([value]) => updateInputs({ otherPhysiciansPrimaryCarryoverPerPhysician: value })}
              defaultValue={defaultValues.otherPhysiciansPrimaryCarryoverPerPhysician}
              min={25}
              max={100}
              step={5}
              className="py-2"
            />
            <p className="text-[10px] text-muted-foreground">
              Average primary members each additional physician brings
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <LabelWithTooltip label="Carry-Over Specialty per Other Physician" tooltip={tooltips.otherPhysiciansSpecialtyCarryoverPerPhysician} />
              <span className="text-xs font-medium">
                {inputs.otherPhysiciansSpecialtyCarryoverPerPhysician || 40}
              </span>
            </div>
            <SliderWithReset
              value={[inputs.otherPhysiciansSpecialtyCarryoverPerPhysician || 40]}
              onValueChange={([value]) => updateInputs({ otherPhysiciansSpecialtyCarryoverPerPhysician: value })}
              defaultValue={defaultValues.otherPhysiciansSpecialtyCarryoverPerPhysician}
              min={40}
              max={100}
              step={5}
              className="py-2"
            />
            <p className="text-[10px] text-muted-foreground">
              Average specialty clients each additional physician brings
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Growth & Membership Dynamics */}
      <Collapsible open={openSections.growth} onOpenChange={() => toggleSection("growth")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
          <span>Growth & Membership</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${openSections.growth ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <LabelWithTooltip label="Initial Primary Members/Physician" tooltip={tooltips.primaryInitPerPhysician} />
              <span className="text-xs font-medium">{inputs.primaryInitPerPhysician}</span>
            </div>
            <Slider
              value={[inputs.primaryInitPerPhysician]}
              onValueChange={([value]) => updateInputs({ primaryInitPerPhysician: value })}
              min={0}
              max={150}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Initial Specialty Visits/Physician</Label>
              <span className="text-xs font-medium">{inputs.specialtyInitPerPhysician}</span>
            </div>
            <Slider
              value={[inputs.specialtyInitPerPhysician]}
              onValueChange={([value]) => updateInputs({ specialtyInitPerPhysician: value })}
              min={0}
              max={150}
              step={5}
              className="py-2"
            />
            <p className="text-[10px] text-muted-foreground">Month 4 start</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">DexaFit Primary Intake/Month</Label>
              <span className="text-xs font-medium">{inputs.primaryIntakeMonthly}</span>
            </div>
            <Slider
              value={[inputs.primaryIntakeMonthly]}
              onValueChange={([value]) => updateInputs({ primaryIntakeMonthly: value })}
              min={25}
              max={200}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Primary → Specialty Conversion</Label>
              <span className="text-xs font-medium">{inputs.conversionPrimaryToSpecialty}%</span>
            </div>
            <Slider
              value={[inputs.conversionPrimaryToSpecialty]}
              onValueChange={([value]) => updateInputs({ conversionPrimaryToSpecialty: value })}
              min={0}
              max={25}
              step={0.5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Corporate Contracts/Month</Label>
              <span className="text-xs font-medium">{inputs.corporateContractsMonthly}</span>
            </div>
            <Slider
              value={[inputs.corporateContractsMonthly]}
              onValueChange={([value]) => updateInputs({ corporateContractsMonthly: value })}
              min={0}
              max={10}
              step={1}
              className="py-2"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* F. Derived Variables (Read-Only) */}
      <Collapsible open={openSections.derived} onOpenChange={() => toggleSection("derived")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
          <span>Derived Variables</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${openSections.derived ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2 px-2 text-xs">
          {/* Physician & Business Metrics */}
          <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide pt-1 pb-2">Physician & Business</div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="MSO Fee" tooltip="Founding physicians: 37%, Non-founding: 40%" />
            <span className="font-medium">{(msoFee * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Equity Share" tooltip="Founding physicians: 10%, Non-founding: 5%" />
            <span className="font-medium">{(equityShare * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Retention Rate" tooltip="100% - Annual Churn Rate" />
            <span className="font-medium">{(retention * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Other Physicians" tooltip="Total physicians - 1 (you)" />
            <span className="font-medium">{otherPhysiciansCount}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Team Primary (M1)" tooltip="Primary members other physicians bring" />
            <span className="font-medium">{teamPrimaryStockM1}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Team Specialty (M1)" tooltip="Specialty clients other physicians bring" />
            <span className="font-medium">{teamSpecialtyStockM1}</span>
          </div>

          {/* Capital & Investment Metrics */}
          <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide pt-3 pb-2">Capital & Investment</div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Capital Raised" tooltip={`Founding: ${physiciansLaunch} × $600k = $${(physiciansLaunch * 600000).toLocaleString()}\nAdditional: ${inputs.additionalPhysicians} × $750k = $${(inputs.additionalPhysicians * 750000).toLocaleString()}\nTotal: $${derivedVariables.capitalRaised.toLocaleString()}`} />
            <span className="font-medium text-primary">
              ${(derivedVariables.capitalRaised / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Total Investment" tooltip="CapEx + Office Equipment + Startup Costs" />
            <span className="font-medium text-primary">
              ${(derivedVariables.totalInvestment / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="CapEx (Month 0)" tooltip="Buildout Cost + Office Equipment" />
            <span className="font-medium">
              ${(derivedVariables.capexMonth0 / 1000).toFixed(0)}k
            </span>
          </div>

          {/* Startup Cost Metrics */}
          <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide pt-3 pb-2">Startup Costs</div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Startup Total" tooltip="From 'Ramp Startup Cost' input" />
            <span className="font-medium">
              ${(derivedVariables.startupTotal / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Startup (Month 0)" tooltip="50% of total startup costs" />
            <span className="font-medium">
              ${(derivedVariables.startupMonth0 / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Startup (Month 1)" tooltip="50% of total startup costs" />
            <span className="font-medium">
              ${(derivedVariables.startupMonth1 / 1000).toFixed(0)}k
            </span>
          </div>

          {/* Operating Cost Metrics */}
          <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide pt-3 pb-2">Monthly Operating Costs</div>
          <div className="flex justify-between py-1 border-b">
            <LabelWithTooltip label="Fixed Costs" tooltip="Fixed Overhead + Marketing Budget" />
            <span className="font-medium">
              ${(derivedVariables.fixedCostMonthly / 1000).toFixed(0)}k/mo
            </span>
          </div>
          <div className="flex justify-between py-1">
            <LabelWithTooltip label="Equipment Lease" tooltip="CT Lease + Echo Lease" />
            <span className="font-medium">
              ${(derivedVariables.totalEquipmentLease / 1000).toFixed(0)}k/mo
            </span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Next Button */}
      <div className="pt-4">
        <Button
          onClick={() => setActiveSection("revenues")}
          className="w-full gap-2"
          size="sm"
        >
          Next: Revenues
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

