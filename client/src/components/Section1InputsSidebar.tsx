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
import { ChevronRight, ArrowRight, Upload } from "lucide-react";
import { useState } from "react";

export function Section1InputsSidebar() {
  const { inputs, updateInputs, setActiveSection } = useDashboard();
  const [openSections, setOpenSections] = useState({
    scenario: false,
    physician: false,
    carryover: false,
    growth: false,
    pricing: false,
    derived: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Derived calculations
  const msoFee = inputs.foundingToggle ? 0.37 : 0.40;
  const equityShare = inputs.foundingToggle ? 0.10 : 0.05;
  const retention = 1 - inputs.churnPrimary / 12;
  const capitalRaised = inputs.physiciansLaunch * 600000;

  return (
    <div className="space-y-2 px-2">
      {/* A. Scenario Setup */}
      <Collapsible open={openSections.scenario} onOpenChange={() => toggleSection("scenario")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
          <span>Scenario Setup</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${openSections.scenario ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <Label htmlFor="scenario-mode" className="text-xs">
              Scenario Mode
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
            <p className="text-[10px] text-muted-foreground">
              Applies multipliers to growth, pricing, and costs
            </p>
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs h-8" disabled>
            <Upload className="h-3 w-3 mr-2" />
            Load Custom Scenario
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* B. Physician Setup */}
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
              <Label className="text-xs">Founding Physician Model</Label>
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
            <p className="text-[10px] text-muted-foreground">
              Number of physicians active at launch
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* C. Individual Carry-Over & Peer Volume */}
      <Collapsible open={openSections.carryover} onOpenChange={() => toggleSection("carryover")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
          <span>Carry-Over & Peer Volume</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${openSections.carryover ? "rotate-90" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 px-2">
          <div className="space-y-2">
            <Label htmlFor="primary-carryover" className="text-xs">
              My Primary Members (Carry-Over)
            </Label>
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
            <Label htmlFor="specialty-carryover" className="text-xs">
              My Specialty Clients (Carry-Over)
            </Label>
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
              <Label className="text-xs">Team Specialty Multiplier</Label>
              <span className="text-xs font-medium">
                {(inputs.teamSpecialtyMultiplier || 1.0).toFixed(1)}×
              </span>
            </div>
            <Slider
              value={[inputs.teamSpecialtyMultiplier || 1.0]}
              onValueChange={([value]) => updateInputs({ teamSpecialtyMultiplier: value })}
              min={0}
              max={3.0}
              step={0.1}
              className="py-2"
            />
            <p className="text-[10px] text-muted-foreground">
              Adjusts average specialty volume for other physicians
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* D. Growth & Membership Dynamics */}
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
              <Label className="text-xs">Initial Primary Members/Physician</Label>
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
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Capital Raised</span>
            <span className="font-medium text-primary">
              ${(capitalRaised / 1000000).toFixed(1)}M
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

