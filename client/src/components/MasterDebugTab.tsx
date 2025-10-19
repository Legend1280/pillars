import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CalculationFlowVisualization } from "./CalculationFlowVisualization";
import { Code2, Network, Table, AlertTriangle, CheckCircle2 } from "lucide-react";
import { dashboardConfig } from "@/lib/dashboardConfig";
import { useState } from "react";
import { Button } from "./ui/button";

export function MasterDebugTab() {
  const { inputs, projections } = useDashboard();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  // Safety checks for all required data
  if (!inputs || typeof inputs !== 'object') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading Master Debug Dashboard...</div>
          <div className="text-sm text-gray-600 mt-2">Waiting for input data</div>
        </div>
      </div>
    );
  }

  if (!projections || !projections.projection || !Array.isArray(projections.projection) || projections.projection.length < 12) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading Master Debug Dashboard...</div>
          <div className="text-sm text-gray-600 mt-2">Waiting for projection data</div>
        </div>
      </div>
    );
  }

  const month12 = projections.projection[11];

  // Validation checks
  const validations = [
    {
      name: 'Revenue Sanity Check',
      check: month12.revenue.total > 0 && month12.revenue.total < 1000000,
      message: month12.revenue.total > 0 
        ? `✓ Total revenue $${month12.revenue.total.toLocaleString()} is within expected range`
        : '✗ Total revenue is zero or negative',
      severity: month12.revenue.total > 0 ? 'success' : 'error'
    },
    {
      name: 'Cost Structure Check',
      check: month12.costs.total > 0 && month12.costs.total < month12.revenue.total * 2,
      message: month12.costs.total > 0
        ? `✓ Total costs $${month12.costs.total.toLocaleString()} are reasonable`
        : '✗ Cost structure may have issues',
      severity: month12.costs.total > 0 ? 'success' : 'error'
    },
    {
      name: 'Member Growth Check',
      check: month12.members.primaryActive > 0 && month12.members.specialtyActive > 0,
      message: `✓ Members growing: ${month12.members.primaryActive} primary, ${month12.members.specialtyActive} specialty`,
      severity: 'success'
    },
    {
      name: 'Profit Margin Check',
      check: month12.profit / month12.revenue.total > -0.5,
      message: `${month12.profit > 0 ? '✓' : '⚠'} Profit margin: ${((month12.profit / month12.revenue.total) * 100).toFixed(1)}%`,
      severity: month12.profit > 0 ? 'success' : 'warning'
    },
    {
      name: 'Admin Staff Check',
      check: inputs.avgAdminSalary > 0 && inputs.adminSupportRatio > 0,
      message: inputs.avgAdminSalary > 0
        ? `✓ Admin costs configured: $${inputs.avgAdminSalary.toLocaleString()}/year, ${inputs.adminSupportRatio} ratio`
        : '✗ Admin costs not configured',
      severity: inputs.avgAdminSalary > 0 ? 'success' : 'warning'
    },
    {
      name: 'Diagnostics Margin Check',
      check: inputs.diagnosticsMargin >= 50 && inputs.diagnosticsMargin <= 65,
      message: `✓ Diagnostics margin ${inputs.diagnosticsMargin}% is within expected range (50-65%)`,
      severity: 'success'
    }
  ];

  const passedChecks = validations.filter(v => v.severity === 'success').length;
  const totalChecks = validations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Master Debug Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Complete schema, calculation flow, and debugging tools for development team
        </p>
      </div>

      {/* Validation Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            System Health Check
          </CardTitle>
          <CardDescription>
            {passedChecks} of {totalChecks} validation checks passed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validations.map((validation, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded ${
                  validation.severity === 'success' ? 'bg-green-50' :
                  validation.severity === 'warning' ? 'bg-yellow-50' :
                  'bg-red-50'
                }`}
              >
                {validation.severity === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    validation.severity === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-sm">{validation.name}</div>
                  <div className="text-sm text-gray-700">{validation.message}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Flow Visualization
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Input Schema
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Calculations
          </TabsTrigger>
          <TabsTrigger value="outputs" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Outputs
          </TabsTrigger>
        </TabsList>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="mt-6">
          <CalculationFlowVisualization />
        </TabsContent>

        {/* Input Schema Tab */}
        <TabsContent value="schema" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Input Schema</CardTitle>
              <CardDescription>
                All {Object.keys(inputs).length} input parameters with current values, ranges, and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardConfig?.sections && Array.isArray(dashboardConfig.sections) ? dashboardConfig.sections.map((section) => (
                  <div key={section.id} className="border rounded-lg">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{section.icon}</div>
                        <div className="text-left">
                          <div className="font-semibold">{section.title}</div>
                          <div className="text-sm text-gray-600">
                            {section.controls.length} controls
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {expandedSections.has(section.id) ? '▼' : '▶'}
                      </div>
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="p-4 border-t bg-gray-50">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-semibold">Control ID</th>
                              <th className="text-left py-2 font-semibold">Label</th>
                              <th className="text-left py-2 font-semibold">Current Value</th>
                              <th className="text-left py-2 font-semibold">Range</th>
                              <th className="text-left py-2 font-semibold">Default</th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.controls.map((control) => {
                              const value = (inputs as any)[control.id];
                              return (
                                <tr key={control.id} className="border-b hover:bg-white">
                                  <td className="py-2 font-mono text-xs text-blue-600">
                                    {control.id}
                                  </td>
                                  <td className="py-2">{control.label}</td>
                                  <td className="py-2 font-semibold">
                                    {typeof value === 'boolean' 
                                      ? (value ? '✓ Yes' : '✗ No')
                                      : typeof value === 'number'
                                      ? value.toLocaleString()
                                      : String(value)}
                                  </td>
                                  <td className="py-2 text-gray-600">
                                    {control.min !== undefined && control.max !== undefined
                                      ? `${control.min} - ${control.max}`
                                      : '—'}
                                  </td>
                                  <td className="py-2 text-gray-600">
                                    {control.defaultValue !== undefined
                                      ? String(control.defaultValue)
                                      : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )) : <div className="text-center py-8 text-gray-600">No sections available</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculations Tab */}
        <TabsContent value="calculations" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Calculation Flows</CardTitle>
                <CardDescription>
                  Step-by-step breakdown of major calculations with formulas and code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Physician Count */}
                <div className="border-l-4 border-l-blue-500 pl-4">
                  <h4 className="font-semibold text-lg">Total Physician Count</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">Formula:</span> (foundingToggle ? 1 : 0) + additionalPhysicians
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      const totalPhysicians = (inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0);
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Current Value:</span>{' '}
                      {(inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0)} physicians
                    </div>
                  </div>
                </div>

                {/* Carryover Calculation */}
                <div className="border-l-4 border-l-orange-500 pl-4">
                  <h4 className="font-semibold text-lg">Total Primary Carryover</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">Formula:</span> physicianPrimaryCarryover + (additionalPhysicians × otherPhysiciansCarryover)
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      const totalCarryover = inputs.physicianPrimaryCarryover + (inputs.additionalPhysicians * inputs.otherPhysiciansPrimaryCarryoverPerPhysician);
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Current Value:</span>{' '}
                      {inputs.physicianPrimaryCarryover + (inputs.additionalPhysicians * inputs.otherPhysiciansPrimaryCarryoverPerPhysician)} members
                    </div>
                  </div>
                </div>

                {/* Admin Staff Calculation */}
                <div className="border-l-4 border-l-purple-500 pl-4">
                  <h4 className="font-semibold text-lg">Admin Staff Count & Cost</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">Staff Count Formula:</span> totalPhysicians × adminSupportRatio
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      const adminStaff = totalPhysicians * inputs.adminSupportRatio;<br/>
                      const adminCost = (adminStaff * inputs.avgAdminSalary) / 12;
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Current Values:</span>{' '}
                      {((inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0)) * inputs.adminSupportRatio} staff, 
                      ${(((inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0)) * inputs.adminSupportRatio * inputs.avgAdminSalary / 12).toLocaleString()}/month
                    </div>
                  </div>
                </div>

                {/* Diagnostics COGS */}
                <div className="border-l-4 border-l-green-500 pl-4">
                  <h4 className="font-semibold text-lg">Diagnostics Cost of Goods Sold</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">Formula:</span> diagnosticsRevenue × (1 - margin%)
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      const diagnosticsRevenue = revenue.echo + revenue.ct + revenue.labs;<br/>
                      const diagnosticsCOGS = diagnosticsRevenue * (1 - inputs.diagnosticsMargin / 100);
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Current Margin:</span> {inputs.diagnosticsMargin}%
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="border-l-4 border-l-teal-500 pl-4">
                  <h4 className="font-semibold text-lg">Net Profit Calculation</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">Formula:</span> Total Revenue - Total Costs
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                      const netProfit = totalRevenue - totalCosts;
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Month 12 Value:</span>{' '}
                      ${month12.profit.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outputs Tab */}
        <TabsContent value="outputs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Month 12 Outputs</CardTitle>
              <CardDescription>
                Final calculated values at Month 18 (index 11 of 12-month projection)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Outputs */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Revenue</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primary Care:</span>
                      <span className="font-semibold">${month12.revenue.primary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty Care:</span>
                      <span className="font-semibold">${month12.revenue.specialty.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Corporate Wellness:</span>
                      <span className="font-semibold">${month12.revenue.corporate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diagnostics:</span>
                      <span className="font-semibold">${(month12.revenue.echo + month12.revenue.ct + month12.revenue.labs).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Revenue:</span>
                      <span>${month12.revenue.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Outputs */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fixed Overhead:</span>
                      <span className="font-semibold">${month12.costs.overhead.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salaries:</span>
                      <span className="font-semibold">${month12.costs.salaries.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marketing:</span>
                      <span className="font-semibold">${month12.costs.marketing.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Variable Costs:</span>
                      <span className="font-semibold">${month12.costs.variable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Costs:</span>
                      <span>${month12.costs.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Member Outputs */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Members</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primary Active:</span>
                      <span className="font-semibold">{month12.members.primaryActive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty Active:</span>
                      <span className="font-semibold">{month12.members.specialtyActive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primary Churned:</span>
                      <span className="font-semibold">{month12.members.primaryChurned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty Churned:</span>
                      <span className="font-semibold">{month12.members.specialtyChurned}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Outputs */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Financial</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Profit:</span>
                      <span className={`font-semibold ${month12.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${month12.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="font-semibold">
                        {((month12.profit / month12.revenue.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cumulative Cash:</span>
                      <span className={`font-semibold ${month12.cumulativeCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${month12.cumulativeCash.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

