import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useDashboard } from "@/contexts/DashboardContext";
import { ArrowRight } from "lucide-react";

export function Section3DiagnosticsSidebar() {
  const { inputs, updateInputs, setActiveSection } = useDashboard();

  return (
    <div className="space-y-4 px-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium">Diagnostics Module</Label>
            <p className="text-[10px] text-muted-foreground">
              Activates imaging and lab revenue streams
            </p>
          </div>
          <Switch
            checked={inputs.diagnosticsActive}
            onCheckedChange={(checked) => updateInputs({ diagnosticsActive: checked })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Diagnostics Start Month</Label>
            <span className="text-xs font-medium">Month {inputs.diagnosticsStartMonth}</span>
          </div>
          <Slider
            value={[inputs.diagnosticsStartMonth]}
            onValueChange={([value]) => updateInputs({ diagnosticsStartMonth: value })}
            min={1}
            max={12}
            step={1}
            className="py-2"
            disabled={!inputs.diagnosticsActive}
          />
          <p className="text-[10px] text-muted-foreground">
            Month when imaging begins revenue generation
          </p>
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="text-xs font-semibold">Echocardiography</h4>
        
        <div className="space-y-2">
          <Label htmlFor="echo-price" className="text-xs">
            Echo Revenue / Scan ($)
          </Label>
          <Input
            id="echo-price"
            type="number"
            min={200}
            max={800}
            value={inputs.echoPrice}
            onChange={(e) => updateInputs({ echoPrice: parseFloat(e.target.value) || 0 })}
            className="h-8 text-xs"
            disabled={!inputs.diagnosticsActive}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Echo Scans / Month</Label>
            <span className="text-xs font-medium">{inputs.echoVolumeMonthly}</span>
          </div>
          <Slider
            value={[inputs.echoVolumeMonthly]}
            onValueChange={([value]) => updateInputs({ echoVolumeMonthly: value })}
            min={0}
            max={300}
            step={10}
            className="py-2"
            disabled={!inputs.diagnosticsActive}
          />
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="text-xs font-semibold">CT Imaging</h4>
        
        <div className="space-y-2">
          <Label htmlFor="ct-price" className="text-xs">
            CT Revenue / Scan ($)
          </Label>
          <Input
            id="ct-price"
            type="number"
            min={400}
            max={1200}
            value={inputs.ctPrice}
            onChange={(e) => updateInputs({ ctPrice: parseFloat(e.target.value) || 0 })}
            className="h-8 text-xs"
            disabled={!inputs.diagnosticsActive}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">CT Scans / Month</Label>
            <span className="text-xs font-medium">{inputs.ctVolumeMonthly}</span>
          </div>
          <Slider
            value={[inputs.ctVolumeMonthly]}
            onValueChange={([value]) => updateInputs({ ctVolumeMonthly: value })}
            min={0}
            max={150}
            step={5}
            className="py-2"
            disabled={!inputs.diagnosticsActive}
          />
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="text-xs font-semibold">Laboratory Testing</h4>
        
        <div className="space-y-2">
          <Label htmlFor="lab-price" className="text-xs">
            Lab Revenue / Panel ($)
          </Label>
          <Input
            id="lab-price"
            type="number"
            min={100}
            max={300}
            value={inputs.labTestsPrice}
            onChange={(e) => updateInputs({ labTestsPrice: parseFloat(e.target.value) || 0 })}
            className="h-8 text-xs"
            disabled={!inputs.diagnosticsActive}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Lab Panels / Month</Label>
            <span className="text-xs font-medium">{inputs.labTestsMonthly}</span>
          </div>
          <Slider
            value={[inputs.labTestsMonthly]}
            onValueChange={([value]) => updateInputs({ labTestsMonthly: value })}
            min={0}
            max={500}
            step={10}
            className="py-2"
            disabled={!inputs.diagnosticsActive}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={() => setActiveSection("costs")}
          className="w-full gap-2"
          size="sm"
        >
          Next: Costs
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

