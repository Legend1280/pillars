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
  const { inputs, updateInputs, setActiveSection } = useDashboard();
  const [openSections, setOpenSections] = useState({
    physician: false,
    growth: false,
    pricing: false,
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
        pricing: false,
        derived: false,
        [section]: true,
      };
    });
  };

  // Derived calculations
  const msoFee = inputs.foundingToggle ? 0.37 : 0.40;
  const equityShare = inputs.foundingToggle ? 0.10 : 0.05;
  const retention = 1 - inputs.churnPrimary / 12;
  const capitalRaised = inputs.physiciansLaunch * 600000;
  const otherPhysiciansCount = Math.max(inputs.physiciansLaunch - 1, 0);
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <LabelWithTooltip label="Physicians at Launch" tooltip={tooltips.physiciansLaunch} />
              <span className="text-xs font-medium">{inputs.physiciansLaunch}</span>
            </div>
            <SliderWithReset
              value={[inputs.physiciansLaunch]}
              onValueChange={([value]) => updateInputs({ physiciansLaunch: value })}
              defaultValue={defaultValues.physiciansLaunch}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
            <p className="text-[10px] text-muted-foreground">
              Number of physicians active at launch
            </p>
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

      {/* E. Pricing & Economics */}
      <Collapsible open={openSections.pricing} onOpenChange={() => toggleSection("pricing")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
          <span>Pricing & Economics</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${openSections.pricing ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <Label htmlFor="primary-price" className="text-xs">
              Primary Price/Member/Month ($)
            </Label>
            <Input
              id="primary-price"
              type="number"
              min={400}
              max={600}
              value={inputs.primaryPrice}
              onChange={(e) => updateInputs({ primaryPrice: parseFloat(e.target.value) || 0 })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty-price" className="text-xs">
              Specialty Visit Price ($)
            </Label>
            <Input
              id="specialty-price"
              type="number"
              min={400}
              max={800}
              value={inputs.specialtyPrice}
              onChange={(e) => updateInputs({ specialtyPrice: parseFloat(e.target.value) || 0 })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Employees/Contract</Label>
              <span className="text-xs font-medium">{inputs.corpEmployeesPerContract}</span>
            </div>
            <Slider
              value={[inputs.corpEmployeesPerContract]}
              onValueChange={([value]) => updateInputs({ corpEmployeesPerContract: value })}
              min={5}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="corp-price" className="text-xs">
              Price/Employee/Month ($)
            </Label>
            <Input
              id="corp-price"
              type="number"
              min={500}
              max={2500}
              value={inputs.corpPricePerEmployeeMonth}
              onChange={(e) =>
                updateInputs({ corpPricePerEmployeeMonth: parseFloat(e.target.value) || 0 })
              }
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Annual Churn Rate (Primary)</Label>
              <span className="text-xs font-medium">{inputs.churnPrimary}%</span>
            </div>
            <Slider
              value={[inputs.churnPrimary]}
              onValueChange={([value]) => updateInputs({ churnPrimary: value })}
              min={0}
              max={20}
              step={0.5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Inflation % (Costs)</Label>
              <span className="text-xs font-medium">{inputs.inflationRate}%</span>
            </div>
            <Slider
              value={[inputs.inflationRate]}
              onValueChange={([value]) => updateInputs({ inflationRate: value })}
              min={0}
              max={10}
              step={0.5}
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
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">MSO Fee</span>
            <span className="font-medium">{(msoFee * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Equity Share</span>
            <span className="font-medium">{(equityShare * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Retention Rate</span>
            <span className="font-medium">{(retention * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Capital Raised</span>
            <span className="font-medium text-primary">
              ${(capitalRaised / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Other Physicians Count</span>
            <span className="font-medium">{otherPhysiciansCount}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Team Primary Stock (M1)</span>
            <span className="font-medium">{teamPrimaryStockM1}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Team Specialty Stock (M1)</span>
            <span className="font-medium">{teamSpecialtyStockM1}</span>
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

