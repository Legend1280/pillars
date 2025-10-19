import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowRight, Upload } from "lucide-react";
import { HelpModal } from "./HelpModal";

export function Section1Inputs() {
  const { inputs, updateInputs, activeSection, setActiveSection } = useDashboard();

  const capitalFromPhysicians = calculateCapitalFromPhysicians(inputs);

  const handleNextSection = () => {
    setActiveSection("revenues");
  };

  return (
    <div className="space-y-6">
      {/* Scenario Mode Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Scenario Mode</span>
            <HelpModal title="Scenario Mode">
              <p>
                Select a predefined scenario to automatically adjust growth, pricing, and cost
                assumptions across the entire model.
              </p>
              <ul>
                <li>
                  <strong>Conservative:</strong> Lower growth rates, conservative pricing
                </li>
                <li>
                  <strong>Moderate:</strong> Baseline assumptions (default)
                </li>
                <li>
                  <strong>Aggressive:</strong> Higher growth targets, premium pricing
                </li>
              </ul>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-mode">Scenario</Label>
            <Select
              value={inputs.scenarioMode}
              onValueChange={(value: any) => updateInputs({ scenarioMode: value })}
            >
              <SelectTrigger id="scenario-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-1">
              <Label>Founding Physician Model</Label>
              <p className="text-sm text-muted-foreground">
                {inputs.foundingToggle
                  ? "ON - MSO Fee: 37% | Equity: 10%"
                  : "OFF - MSO Fee: 40% | Equity: 5%"}
              </p>
            </div>
            <Switch
              checked={inputs.foundingToggle}
              onCheckedChange={(checked) => updateInputs({ foundingToggle: checked })}
            />
          </div>

          <Button variant="outline" className="w-full gap-2" disabled>
            <Upload className="h-4 w-4" />
            Load Custom Scenario
            <span className="text-xs text-muted-foreground ml-2">(Coming Soon)</span>
          </Button>
        </CardContent>
      </Card>

      {/* Physician Group Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Physician Group</span>
            <HelpModal title="Physician Group">
              <p>Define the number of physicians participating in the MSO at launch and future cohorts.</p>
              <ul>
                <li>
                  <strong>Physicians at Launch:</strong> Core founding physicians (1-10)
                </li>
                <li>
                  <strong>Additional Physicians:</strong> Future cohorts joining later (0-7)
                </li>
              </ul>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Founding Physicians - now automatic based on toggle */}
          <div className="text-sm font-medium text-teal-700 bg-teal-50 p-3 rounded border border-teal-200">
            Founding Physicians: {inputs.foundingToggle ? 1 : 0} (automatic based on toggle)
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Additional Physicians (Future Cohorts)</Label>
              <span className="text-sm font-medium">{inputs.additionalPhysicians}</span>
            </div>
            <Slider
              value={[inputs.additionalPhysicians]}
              onValueChange={([value]) => updateInputs({ additionalPhysicians: value })}
              min={0}
              max={7}
              step={1}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Capital from Physicians</Label>
              <span className="text-lg font-bold text-primary">
                ${capitalFromPhysicians.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ({inputs.foundingToggle ? 1 : 0} × $600K) + ({inputs.additionalPhysicians} × $750K)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Primary Growth Inputs Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Primary Growth Inputs</span>
            <HelpModal title="Primary Growth Inputs">
              <p>Configure primary care membership growth and retention assumptions.</p>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Initial Primary Members / Physician</Label>
              <span className="text-sm font-medium">{inputs.primaryInitPerPhysician}</span>
            </div>
            <Slider
              value={[inputs.primaryInitPerPhysician]}
              onValueChange={([value]) => updateInputs({ primaryInitPerPhysician: value })}
              min={0}
              max={250}
              step={5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>DexaFit Primary Intake / Month</Label>
              <span className="text-sm font-medium">{inputs.primaryIntakeMonthly}</span>
            </div>
            <Slider
              value={[inputs.primaryIntakeMonthly]}
              onValueChange={([value]) => updateInputs({ primaryIntakeMonthly: value })}
              min={25}
              max={200}
              step={5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Annual Churn Rate (Primary)</Label>
              <span className="text-sm font-medium">{inputs.churnPrimary}%</span>
            </div>
            <Slider
              value={[inputs.churnPrimary]}
              onValueChange={([value]) => updateInputs({ churnPrimary: value })}
              min={0}
              max={20}
              step={0.5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Primary → Specialty Conversion %</Label>
              <span className="text-sm font-medium">{inputs.conversionPrimaryToSpecialty}%</span>
            </div>
            <Slider
              value={[inputs.conversionPrimaryToSpecialty]}
              onValueChange={([value]) => updateInputs({ conversionPrimaryToSpecialty: value })}
              min={0}
              max={25}
              step={0.5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Initial Specialty Visits / Physician (M4 Start)</Label>
              <span className="text-sm font-medium">{inputs.specialtyInitPerPhysician}</span>
            </div>
            <Slider
              value={[inputs.specialtyInitPerPhysician]}
              onValueChange={([value]) => updateInputs({ specialtyInitPerPhysician: value })}
              min={0}
              max={150}
              step={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Corporate Inputs Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Corporate Inputs</span>
            <HelpModal title="Corporate Inputs">
              <p>Configure B2B corporate wellness contract assumptions.</p>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>New Corporate Contracts / Month</Label>
              <span className="text-sm font-medium">{inputs.corporateContractsMonthly}</span>
            </div>
            <Slider
              value={[inputs.corporateContractsMonthly]}
              onValueChange={([value]) => updateInputs({ corporateContractsMonthly: value })}
              min={0}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Initial Corporate Wellness Clients</Label>
              <span className="text-sm font-medium">{inputs.corpInitialClients}</span>
            </div>
            <Slider
              value={[inputs.corpInitialClients]}
              onValueChange={([value]) => updateInputs({ corpInitialClients: value })}
              min={5}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="corp-price">Price / Employee / Month ($)</Label>
            <Input
              id="corp-price"
              type="number"
              min={500}
              max={2500}
              value={inputs.corpPricePerEmployeeMonth}
              onChange={(e) =>
                updateInputs({ corpPricePerEmployeeMonth: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">Range: $500 - $2,500</p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Global Modifiers Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pricing & Global Modifiers</span>
            <HelpModal title="Pricing & Global Modifiers">
              <p>Set pricing for primary and specialty services, plus global cost modifiers.</p>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-price">Primary Price / Member / Month ($)</Label>
              <Input
                id="primary-price"
                type="number"
                min={400}
                max={600}
                value={inputs.primaryPrice}
                onChange={(e) => updateInputs({ primaryPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Range: $400 - $600</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty-price">Specialty Visit Price ($)</Label>
              <Input
                id="specialty-price"
                type="number"
                min={400}
                max={800}
                value={inputs.specialtyPrice}
                onChange={(e) => updateInputs({ specialtyPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Range: $400 - $800</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Inflation % (Costs)</Label>
              <span className="text-sm font-medium">{inputs.inflationRate}%</span>
            </div>
            <Slider
              value={[inputs.inflationRate]}
              onValueChange={([value]) => updateInputs({ inflationRate: value })}
              min={0}
              max={10}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="random-seed">Randomization Seed (Monte Carlo)</Label>
            <Input
              id="random-seed"
              type="number"
              value={inputs.randomSeed}
              onChange={(e) => updateInputs({ randomSeed: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">For replicable risk simulations</p>
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t">
        <Button onClick={handleNextSection} className="w-full gap-2" size="lg">
          Next: Revenues
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

