import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { CalculationFlowVisualization } from "./CalculationFlowVisualization";
import { Network, AlertTriangle, CheckCircle2, TrendingUp, Database } from "lucide-react";
import { useMemo } from "react";

export function MasterDebugTab() {
  const { inputs, projections, derivedVariables } = useDashboard();

  // Loading state
  if (!inputs || !projections) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Network className="h-12 w-12 mx-auto mb-4 text-teal-600 animate-pulse" />
          <div className="text-lg font-semibold">Loading Debug Dashboard...</div>
          <div className="text-sm text-gray-600 mt-2">Preparing ontological analysis</div>
        </div>
      </div>
    );
  }

  // Default values for drift detection
  const defaults: Record<string, any> = {
    foundingToggle: true,
    additionalPhysicians: 2,
    physicianPrimaryCarryover: 100,
    physicianSpecialtyCarryover: 50,
    otherPhysiciansPrimaryCarryoverPerPhysician: 75,
    otherPhysiciansSpecialtyCarryoverPerPhysician: 40,
    primaryMembersMonth1: 0,
    specialtyMembersMonth1: 0,
    primaryIntakePerMonth: 15,
    specialtyIntakePerMonth: 10,
    primaryPrice: 250,
    specialtyPrice: 500,
    churnPrimary: 10,
    churnSpecialty: 15,
    corpInitialClients: 2,
    corpPricePerEmployeeMonth: 50,
    diagnosticsActive: true,
    echoPrice: 500,
    echoVolumeMonthly: 20,
    ctPrice: 1000,
    ctVolumeMonthly: 15,
    labTestsPrice: 150,
    labTestsMonthly: 50,
    diagnosticsMargin: 50,
    capexBuildoutCost: 75000,
    officeEquipment: 35000,
    rampStartupCost: 50000,
    fixedOverheadMonthly: 15000,
    marketingBudgetMonthly: 10000,
    variableCostPct: 15,
    ctLeaseCost: 3500,
    echoLeaseCost: 3500,
    founderChiefStrategistSalary: 120000,
    directorOperationsSalary: 85000,
    gmHourlyRate: 50,
    gmWeeklyHours: 40,
    fractionalCfoCost: 5000,
    eventSalespersonCost: 4000,
    np1Salary: 110000,
    np2Salary: 110000,
    avgAdminSalary: 50000,
    adminSupportRatio: 0.33,
    dexafitPrimaryIntakeMonthly: 10,
    corporateContractSalesMonthly: 1,
    employeesPerContract: 100,
    primaryToSpecialtyConversion: 20,
    diagnosticsExpansionRate: 5,
    inflationRate: 3,
    rampDuration: 7,
    corporateStartMonth: 3,
    rampPrimaryIntakeMonthly: 10,
    directorOpsStartMonth: 0,
    gmStartMonth: 0,
    fractionalCfoStartMonth: 0,
    eventPlannerStartMonth: 3,
  };

  // Calculate drift metrics
  const driftAnalysis = useMemo(() => {
    const changes: Array<{
      key: string;
      label: string;
      default: any;
      current: any;
      delta: number | null;
      percentChange: number | null;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    let totalInputs = 0;
    let changedInputs = 0;

    Object.keys(defaults).forEach(key => {
      totalInputs++;
      const defaultVal = defaults[key];
      const currentVal = (inputs as any)[key];

      if (defaultVal !== currentVal) {
        changedInputs++;
        
        let delta = null;
        let percentChange = null;
        let severity: 'low' | 'medium' | 'high' = 'low';

        if (typeof defaultVal === 'number' && typeof currentVal === 'number') {
          delta = currentVal - defaultVal;
          percentChange = defaultVal !== 0 ? ((delta / defaultVal) * 100) : 0;
          
          // Determine severity based on percent change
          if (Math.abs(percentChange) > 50) severity = 'high';
          else if (Math.abs(percentChange) > 20) severity = 'medium';
        } else if (typeof defaultVal === 'boolean') {
          severity = 'medium'; // Boolean changes are always medium impact
        }

        changes.push({
          key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          default: defaultVal,
          current: currentVal,
          delta,
          percentChange,
          severity
        });
      }
    });

    const driftScore = (changedInputs / totalInputs) * 100;

    return {
      changes,
      totalInputs,
      changedInputs,
      driftScore,
      riskLevel: driftScore > 50 ? 'high' : driftScore > 25 ? 'medium' : 'low'
    };
  }, [inputs]);

  // Validation checks
  const validations = useMemo(() => {
    const month12 = projections.projection?.[11];
    if (!month12) return [];

    return [
      {
        name: 'Revenue Positive',
        passed: month12.revenue.total > 0,
        message: month12.revenue.total > 0 
          ? `✓ Month 12 revenue: $${month12.revenue.total.toLocaleString()}`
          : '✗ Month 12 revenue is zero or negative',
        severity: month12.revenue.total > 0 ? 'success' : 'error'
      },
      {
        name: 'Profitable',
        passed: month12.revenue.total > month12.costs.total,
        message: month12.revenue.total > month12.costs.total
          ? `✓ Profit: $${(month12.revenue.total - month12.costs.total).toLocaleString()}`
          : `✗ Loss: $${(month12.costs.total - month12.revenue.total).toLocaleString()}`,
        severity: month12.revenue.total > month12.costs.total ? 'success' : 'warning'
      },
      {
        name: 'Member Growth',
        passed: month12.members.primary > (inputs.primaryMembersMonth1 || 0),
        message: month12.members.primary > (inputs.primaryMembersMonth1 || 0)
          ? `✓ Primary members grew to ${month12.members.primary}`
          : '✗ No primary member growth',
        severity: month12.members.primary > (inputs.primaryMembersMonth1 || 0) ? 'success' : 'warning'
      },
      {
        name: 'Cost Structure',
        passed: month12.costs.total < month12.revenue.total * 1.5,
        message: month12.costs.total < month12.revenue.total * 1.5
          ? '✓ Costs are reasonable relative to revenue'
          : '✗ Costs are very high relative to revenue',
        severity: month12.costs.total < month12.revenue.total * 1.5 ? 'success' : 'warning'
      },
      {
        name: 'Physician Count',
        passed: derivedVariables.totalPhysicians > 0,
        message: `✓ ${derivedVariables.totalPhysicians} physician(s) configured`,
        severity: 'success'
      },
      {
        name: 'Capital Raised',
        passed: derivedVariables.capitalRaised > 0,
        message: `✓ Capital raised: $${derivedVariables.capitalRaised.toLocaleString()}`,
        severity: 'success'
      }
    ];
  }, [projections, inputs, derivedVariables]);

  const passedValidations = validations.filter(v => v.passed).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Master Debug Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Three-dimensional ontological analysis: Structure, Semantics, and Temporal drift detection
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Drift Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              driftAnalysis.riskLevel === 'high' ? 'text-red-600' :
              driftAnalysis.riskLevel === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {driftAnalysis.driftScore.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {driftAnalysis.changedInputs} of {driftAnalysis.totalInputs} inputs modified
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {passedValidations}/{validations.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Checks passed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {Object.keys(inputs).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Parameters tracked</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Month 12 Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">
              ${projections.projection?.[11]?.revenue?.total?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Projected monthly</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Ontology</span>
          </TabsTrigger>
          <TabsTrigger value="drift" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Drift</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Validation</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">All Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Ontological Visualization Tab */}
        <TabsContent value="visualization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calculation Flow Ontology</CardTitle>
              <CardDescription>
                Interactive network graph showing how inputs flow through calculations to produce outputs.
                Click nodes to explore dependencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalculationFlowVisualization />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drift Detection Tab */}
        <TabsContent value="drift" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Drift Analysis</CardTitle>
                <CardDescription>
                  Comparing current configuration against default values. {driftAnalysis.changedInputs} inputs have been modified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {driftAnalysis.changes.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <div className="font-semibold">No Drift Detected</div>
                    <div className="text-sm">All inputs are using default values</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {driftAnalysis.changes.map(change => (
                      <div key={change.key} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{change.label}</span>
                              <Badge variant={
                                change.severity === 'high' ? 'destructive' :
                                change.severity === 'medium' ? 'default' :
                                'secondary'
                              }>
                                {change.severity}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-mono">Default: {String(change.default)}</span>
                              {' → '}
                              <span className="font-mono font-semibold">Current: {String(change.current)}</span>
                            </div>
                            {change.percentChange !== null && (
                              <div className="text-xs text-gray-500 mt-1">
                                Change: {change.percentChange > 0 ? '+' : ''}{change.percentChange.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Validation Checks</CardTitle>
              <CardDescription>
                Automated checks to ensure calculations are producing reasonable results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validations.map((validation, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    {validation.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{validation.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{validation.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Data Tab */}
        <TabsContent value="data" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Input Values</CardTitle>
                <CardDescription>
                  All {Object.keys(inputs).length} input parameters with current values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(inputs).map(([key, value]) => (
                    <div key={key} className="border rounded p-2">
                      <div className="text-xs font-mono text-gray-500">{key}</div>
                      <div className="text-sm font-semibold mt-1">
                        {typeof value === 'boolean' ? (value ? '✓ Yes' : '✗ No') :
                         typeof value === 'number' ? value.toLocaleString() :
                         String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Derived Variables</CardTitle>
                <CardDescription>
                  Calculated values based on inputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(derivedVariables).map(([key, value]) => (
                    <div key={key} className="border rounded p-2">
                      <div className="text-xs font-mono text-gray-500">{key}</div>
                      <div className="text-sm font-semibold mt-1">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

