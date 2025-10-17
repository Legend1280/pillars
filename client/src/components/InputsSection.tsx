import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useDashboard } from "@/contexts/DashboardContext";
import { RotateCcw } from "lucide-react";
import { HelpModal } from "@/components/HelpModal";

export function InputsSection() {
  const { inputs, updateInputs, resetInputs } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inputs & Scenarios</h2>
        <Button variant="outline" onClick={resetInputs} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Founding Physician */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Founding Physician</span>
            <HelpModal title="Founding Physician">
              <p>Configure the founding physician's equity stake and MSO service fee structure.</p>
              <ul>
                <li><strong>Service Fee:</strong> Percentage of specialty revenue paid to the MSO for administrative services</li>
                <li><strong>Equity Stake:</strong> Ownership percentage in the MSO entity</li>
              </ul>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="founding-physician">Status</Label>
              <p className="text-sm text-muted-foreground">
                {inputs.foundingPhysician.enabled ? "ON" : "OFF"} - Fee: {inputs.foundingPhysician.serviceFee}% | Equity: {inputs.foundingPhysician.equityStake}%
              </p>
            </div>
            <Switch
              id="founding-physician"
              checked={inputs.foundingPhysician.enabled}
              onCheckedChange={(checked) =>
                updateInputs({
                  foundingPhysician: { ...inputs.foundingPhysician, enabled: checked },
                })
              }
            />
          </div>

          {inputs.foundingPhysician.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="service-fee">MSO Service Fee (%)</Label>
                <Input
                  id="service-fee"
                  type="number"
                  value={inputs.foundingPhysician.serviceFee}
                  onChange={(e) =>
                    updateInputs({
                      foundingPhysician: {
                        ...inputs.foundingPhysician,
                        serviceFee: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equity-stake">Equity Stake (%)</Label>
                <Input
                  id="equity-stake"
                  type="number"
                  value={inputs.foundingPhysician.equityStake}
                  onChange={(e) =>
                    updateInputs({
                      foundingPhysician: {
                        ...inputs.foundingPhysician,
                        equityStake: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Growth */}
      <Card className="border-2 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monthly Growth</span>
            <HelpModal title="Founding Physician">
              <p>Configure the founding physician's equity stake and MSO service fee structure.</p>
              <ul>
                <li><strong>Service Fee:</strong> Percentage of specialty revenue paid to the MSO for administrative services</li>
                <li><strong>Equity Stake:</strong> Ownership percentage in the MSO entity</li>
              </ul>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>New Dexafit Members/Month</Label>
              <span className="text-sm font-medium">{inputs.monthlyGrowth.newDexafitMembers}</span>
            </div>
            <Slider
              value={[inputs.monthlyGrowth.newDexafitMembers]}
              onValueChange={([value]) =>
                updateInputs({
                  monthlyGrowth: { ...inputs.monthlyGrowth, newDexafitMembers: value },
                })
              }
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>New Corporate Contracts/Month</Label>
              <span className="text-sm font-medium">{inputs.monthlyGrowth.newCorporateContracts}</span>
            </div>
            <Slider
              value={[inputs.monthlyGrowth.newCorporateContracts]}
              onValueChange={([value]) =>
                updateInputs({
                  monthlyGrowth: { ...inputs.monthlyGrowth, newCorporateContracts: value },
                })
              }
              min={0}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>% Conversion to Specialty</Label>
              <span className="text-sm font-medium">{inputs.monthlyGrowth.conversionToSpecialty.toFixed(1)}%</span>
            </div>
            <Slider
              value={[inputs.monthlyGrowth.conversionToSpecialty]}
              onValueChange={([value]) =>
                updateInputs({
                  monthlyGrowth: { ...inputs.monthlyGrowth, conversionToSpecialty: value },
                })
              }
              min={0}
              max={30}
              step={0.5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Primary Care */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Primary Care</span>
            <HelpModal title="Founding Physician">
              <p>Configure the founding physician's equity stake and MSO service fee structure.</p>
              <ul>
                <li><strong>Service Fee:</strong> Percentage of specialty revenue paid to the MSO for administrative services</li>
                <li><strong>Equity Stake:</strong> Ownership percentage in the MSO entity</li>
              </ul>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="membership-fee">Monthly Membership Fee ($)</Label>
              <Input
                id="membership-fee"
                type="number"
                value={inputs.primaryCare.membershipFee}
                onChange={(e) =>
                  updateInputs({
                    primaryCare: {
                      ...inputs.primaryCare,
                      membershipFee: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starting-members">Starting Members</Label>
              <Input
                id="starting-members"
                type="number"
                value={inputs.primaryCare.startingMembers}
                onChange={(e) =>
                  updateInputs({
                    primaryCare: {
                      ...inputs.primaryCare,
                      startingMembers: parseInt(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialty Care */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Specialty Care</span>
            <HelpModal title="Founding Physician">
              <p>Configure the founding physician's equity stake and MSO service fee structure.</p>
              <ul>
                <li><strong>Service Fee:</strong> Percentage of specialty revenue paid to the MSO for administrative services</li>
                <li><strong>Equity Stake:</strong> Ownership percentage in the MSO entity</li>
              </ul>
            </HelpModal>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit-fee">Average Visit Fee ($)</Label>
              <Input
                id="visit-fee"
                type="number"
                value={inputs.specialtyCare.avgVisitFee}
                onChange={(e) =>
                  updateInputs({
                    specialtyCare: {
                      ...inputs.specialtyCare,
                      avgVisitFee: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visits-per-member">Visits per Member/Month</Label>
              <Input
                id="visits-per-member"
                type="number"
                value={inputs.specialtyCare.visitsPerMember}
                onChange={(e) =>
                  updateInputs({
                    specialtyCare: {
                      ...inputs.specialtyCare,
                      visitsPerMember: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

