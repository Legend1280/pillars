import { Button } from "@/components/ui/button";
import { BUSINESS_RULES, calculateSeedCapital } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDashboard } from "@/contexts/DashboardContext";
import { ArrowRight } from "lucide-react";

export function Section4CostsSidebar() {
  const { inputs, updateInputs, setActiveSection } = useDashboard();

  // Calculate capital from physicians
  // physiciansLaunch is derived from foundingToggle: 1 if true, 0 if false
  const physiciansLaunch = inputs.foundingToggle ? 1 : 0;
  const capitalFromPhysicians = calculateSeedCapital(inputs.foundingToggle, inputs.additionalPhysicians);

  return (
    <div className="space-y-4 px-2">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold">Fixed Operating Costs</h4>
        
        <div className="space-y-2">
          <Label htmlFor="fixed-overhead" className="text-xs">
            Fixed Overhead / Month ($)
          </Label>
          <Input
            id="fixed-overhead"
            type="number"
            min={80000}
            max={150000}
            step={1000}
            value={inputs.fixedOverheadMonthly}
            onChange={(e) => updateInputs({ fixedOverheadMonthly: parseFloat(e.target.value) || 0 })}
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Baseline fixed monthly expenses (rent, insurance, utilities)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marketing-budget" className="text-xs">
            Marketing Budget / Month ($)
          </Label>
          <Input
            id="marketing-budget"
            type="number"
            min={10000}
            max={30000}
            step={1000}
            value={inputs.marketingBudgetMonthly}
            onChange={(e) => updateInputs({ marketingBudgetMonthly: parseFloat(e.target.value) || 0 })}
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Monthly marketing allocation
          </p>
        </div>

        <div className="flex justify-between py-2 px-3 bg-muted rounded-md text-xs">
          <span className="text-muted-foreground">Total Fixed Costs/Month</span>
          <span className="font-medium">
            ${((inputs.fixedOverheadMonthly + inputs.marketingBudgetMonthly) / 1000).toFixed(0)}K
          </span>
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="text-xs font-semibold">Variable Costs</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Variable Cost % of Revenue</Label>
            <span className="text-xs font-medium">{inputs.variableCostPct}%</span>
          </div>
          <Slider
            value={[inputs.variableCostPct]}
            onValueChange={([value]) => updateInputs({ variableCostPct: value })}
            min={10}
            max={40}
            step={1}
            className="py-2"
          />
          <p className="text-[10px] text-muted-foreground">
            Percentage of total revenue applied as variable operating cost
          </p>
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="text-xs font-semibold">Cost Escalation Rates</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Marketing Growth Rate (Annual)</Label>
            <span className="text-xs font-medium">{inputs.marketingGrowthRate}%</span>
          </div>
          <Slider
            value={[inputs.marketingGrowthRate]}
            onValueChange={([value]) => updateInputs({ marketingGrowthRate: value })}
            min={0}
            max={15}
            step={0.5}
            className="py-2"
          />
          <p className="text-[10px] text-muted-foreground">
            Annual rate at which marketing costs increase over time
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Overhead Growth Rate (Annual)</Label>
            <span className="text-xs font-medium">{inputs.overheadGrowthRate}%</span>
          </div>
          <Slider
            value={[inputs.overheadGrowthRate]}
            onValueChange={([value]) => updateInputs({ overheadGrowthRate: value })}
            min={0}
            max={15}
            step={0.5}
            className="py-2"
          />
          <p className="text-[10px] text-muted-foreground">
            Annual rate at which fixed overhead costs increase over time
          </p>
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="text-xs font-semibold">Founder Equity Buyout</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="founder-buyout-toggle" className="text-xs">
              Enable Founder Equity Buyout
            </Label>
            <input
              id="founder-buyout-toggle"
              type="checkbox"
              checked={inputs.founderEquityBuyoutEnabled}
              onChange={(e) => updateInputs({ founderEquityBuyoutEnabled: e.target.checked })}
              className="h-4 w-4"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            $600K total buyout payment to founding physician
          </p>
        </div>

        {inputs.founderEquityBuyoutEnabled && (
          <div className="space-y-2">
            <Label className="text-xs">Payment Structure</Label>
            <div className="space-y-1">
              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="radio"
                  name="buyout-structure"
                  value="lump_sum"
                  checked={inputs.founderEquityBuyoutStructure === 'lump_sum'}
                  onChange={() => updateInputs({ founderEquityBuyoutStructure: 'lump_sum' })}
                  className="h-3 w-3"
                />
                <span>Lump Sum ($300K M0 + $300K M7)</span>
              </label>
              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="radio"
                  name="buyout-structure"
                  value="monthly"
                  checked={inputs.founderEquityBuyoutStructure === 'monthly'}
                  onChange={() => updateInputs({ founderEquityBuyoutStructure: 'monthly' })}
                  className="h-3 w-3"
                />
                <span>Monthly ($50K/month for 12 months)</span>
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Choose payment timing: upfront or spread over time
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-3 space-y-2">
        <h4 className="text-xs font-semibold">Capital (Auto-Calculated)</h4>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Founding Physicians</span>
            <span>{physiciansLaunch} × $600K</span>
          </div>
          {inputs.additionalPhysicians > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Additional Physicians</span>
              <span>{inputs.additionalPhysicians} × $750K</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t font-medium text-primary">
            <span>Total Capital from Physicians</span>
            <span>${(capitalFromPhysicians / 1000000).toFixed(2)}M</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={() => setActiveSection("staffing")}
          className="w-full gap-2"
          size="sm"
        >
          Next: Staffing
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Force rebuild Tue Oct 21 01:43:15 EDT 2025
