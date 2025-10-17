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
import { Switch } from "@/components/ui/switch";
import { useDashboard } from "@/contexts/DashboardContext";
import { calculateCapitalFromPhysicians } from "@/lib/data";
import { ArrowRight, ChevronDown, Upload } from "lucide-react";
import { useState } from "react";

export function Section1InputsSidebar() {
  const { inputs, updateInputs, setActiveSection } = useDashboard();
  const [openSections, setOpenSections] = useState({
    scenario: false,
    physician: false,
    primary: false,
    corporate: false,
    pricing: false,
  });

  const capitalFromPhysicians = calculateCapitalFromPhysicians(inputs);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-3 px-2">
      {/* Scenario Mode */}
      <Collapsible open={openSections.scenario} onOpenChange={() => toggleSection("scenario")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
          <span className="font-medium text-sm">Scenario Mode</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.scenario ? "" : "-rotate-90"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <Label htmlFor="scenario-mode" className="text-xs">
              Scenario
            </Label>
            <Select
              value={inputs.scenarioMode}
              onValueChange={(value: any) => updateInputs({ scenarioMode: value })}
            >
              <SelectTrigger id="scenario-mode" className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2 border-t">
            <div className="space-y-0.5">
              <Label className="text-xs">Founding Physician</Label>
              <p className="text-[10px] text-muted-foreground">
                {inputs.foundingToggle ? "37% MSO / 10% Equity" : "40% MSO / 5% Equity"}
              </p>
            </div>
            <Switch
              checked={inputs.foundingToggle}
              onCheckedChange={(checked) => updateInputs({ foundingToggle: checked })}
            />
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs h-8" disabled>
            <Upload className="h-3 w-3 mr-2" />
            Load Custom
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Physician Group */}
      <Collapsible open={openSections.physician} onOpenChange={() => toggleSection("physician")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
          <span className="font-medium text-sm">Physician Group</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.physician ? "" : "-rotate-90"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Physicians at Launch</Label>
              <span className="text-xs font-medium">{inputs.physiciansLaunch}</span>
            </div>
            <Slider
              value={[inputs.physiciansLaunch]}
              onValueChange={([value]) => updateInputs({ physiciansLaunch: value })}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Additional Physicians</Label>
              <span className="text-xs font-medium">{inputs.additionalPhysicians}</span>
            </div>
            <Slider
              value={[inputs.additionalPhysicians]}
              onValueChange={([value]) => updateInputs({ additionalPhysicians: value })}
              min={0}
              max={7}
              step={1}
              className="py-2"
            />
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">Capital</Label>
              <span className="text-sm font-bold text-primary">
                ${(capitalFromPhysicians / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Primary Growth Inputs */}
      <Collapsible open={openSections.primary} onOpenChange={() => toggleSection("primary")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
          <span className="font-medium text-sm">Primary Growth</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.primary ? "" : "-rotate-90"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Initial Members/Physician</Label>
              <span className="text-xs font-medium">{inputs.primaryInitPerPhysician}</span>
            </div>
            <Slider
              value={[inputs.primaryInitPerPhysician]}
              onValueChange={([value]) => updateInputs({ primaryInitPerPhysician: value })}
              min={0}
              max={250}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">DexaFit Intake/Month</Label>
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
              <Label className="text-xs">Churn Rate</Label>
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
              <Label className="text-xs">Primary→Specialty %</Label>
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
              <Label className="text-xs">Initial Specialty Visits</Label>
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
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Corporate Inputs */}
      <Collapsible open={openSections.corporate} onOpenChange={() => toggleSection("corporate")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
          <span className="font-medium text-sm">Corporate</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.corporate ? "" : "-rotate-90"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Contracts/Month</Label>
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
        </CollapsibleContent>
      </Collapsible>

      {/* Pricing & Global Modifiers */}
      <Collapsible open={openSections.pricing} onOpenChange={() => toggleSection("pricing")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
          <span className="font-medium text-sm">Pricing & Modifiers</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.pricing ? "" : "-rotate-90"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <Label htmlFor="primary-price" className="text-xs">
              Primary Price ($)
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
              Specialty Price ($)
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
              <Label className="text-xs">Inflation %</Label>
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

          <div className="space-y-2">
            <Label htmlFor="random-seed" className="text-xs">
              Random Seed
            </Label>
            <Input
              id="random-seed"
              type="number"
              value={inputs.randomSeed}
              onChange={(e) => updateInputs({ randomSeed: parseInt(e.target.value) || 0 })}
              className="h-8 text-xs"
            />
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

