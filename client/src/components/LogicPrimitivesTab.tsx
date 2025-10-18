import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LogicPrimitivesTab() {
  const { inputs, derivedVariables } = useDashboard();

  // Organize inputs by section
  const sections = [
    {
      id: "physician",
      title: "Physician Setup",
      color: "bg-purple-100 text-purple-800",
      inputs: [
        { id: "foundingToggle", label: "I am a Founding Physician", type: "boolean" },
        // physiciansLaunch removed - now derived from foundingToggle
        { id: "additionalPhysicians", label: "Additional Physicians", suffix: "" },
        { id: "physicianPrimaryCarryover", label: "My Primary Members (Carry-Over)", suffix: "" },
        { id: "physicianSpecialtyCarryover", label: "My Specialty Clients (Carry-Over)", suffix: "" },
        { id: "otherPhysiciansPrimaryCarryoverPerPhysician", label: "Avg Primary Carry-Over (Other Physicians)", suffix: "" },
        { id: "otherPhysiciansSpecialtyCarryoverPerPhysician", label: "Avg Specialty Carry-Over (Other Physicians)", suffix: "" },
      ]
    },
    {
      id: "revenue",
      title: "Revenue Streams",
      color: "bg-green-100 text-green-800",
      inputs: [
        { id: "corpInitialClients", label: "Initial Corporate Wellness Clients", suffix: "" },
        { id: "corpPricePerEmployeeMonth", label: "Price / Employee / Month", suffix: "$" },
        { id: "primaryPrice", label: "Primary Price/Member/Month", suffix: "$" },
        { id: "specialtyPrice", label: "Specialty Visit Price", suffix: "$" },
        { id: "churnPrimary", label: "Annual Churn Rate (Primary)", suffix: "%" },
        { id: "inflationRate", label: "Inflation % (Costs)", suffix: "%" },
      ]
    },
    {
      id: "diagnostics",
      title: "Diagnostics",
      color: "bg-blue-100 text-blue-800",
      inputs: [
        { id: "diagnosticsActive", label: "Diagnostics Active", type: "boolean" },
        { id: "echoPrice", label: "Echo Price", suffix: "$" },
        { id: "echoVolumeMonthly", label: "Echo Volume / Month", suffix: "" },
        { id: "ctPrice", label: "CT Price", suffix: "$" },
        { id: "ctVolumeMonthly", label: "CT Volume / Month", suffix: "" },
        { id: "labTestsPrice", label: "Lab Tests Price", suffix: "$" },
        { id: "labTestsMonthly", label: "Lab Tests / Month", suffix: "" },
        { id: "diagnosticsMargin", label: "Diagnostics Margin %", suffix: "%" },
      ]
    },
    {
      id: "costs",
      title: "Costs & CapEx",
      color: "bg-red-100 text-red-800",
      inputs: [
        { id: "capexBuildoutCost", label: "Buildout Budget (One-Time)", suffix: "$" },
        { id: "officeEquipment", label: "Office Equipment (One-Time)", suffix: "$" },
        { id: "rampStartupCost", label: "Startup Costs (Total)", suffix: "$" },
        { id: "fixedOverheadMonthly", label: "Fixed Overhead / Month", suffix: "$" },
        { id: "marketingBudgetMonthly", label: "Marketing Budget / Month", suffix: "$" },
        { id: "variableCostPct", label: "Variable Cost % of Revenue", suffix: "%" },
        { id: "ctLeaseCost", label: "CT Lease Cost / Month", suffix: "$" },
        { id: "echoLeaseCost", label: "Echo Lease Cost / Month", suffix: "$" },
      ]
    },
    {
      id: "staffing",
      title: "Staffing",
      color: "bg-amber-100 text-amber-800",
      inputs: [
        { id: "founderChiefStrategistSalary", label: "Founder/Chief Strategist Salary", suffix: "$" },
        { id: "directorOperationsSalary", label: "Director Operations Salary", suffix: "$" },
        { id: "gmHourlyRate", label: "GM Hourly Rate", suffix: "$" },
        { id: "gmWeeklyHours", label: "GM Weekly Hours", suffix: "hrs" },
        { id: "fractionalCfoCost", label: "Fractional CFO Cost / Month", suffix: "$" },
        { id: "eventSalespersonCost", label: "Event Salesperson Cost / Month", suffix: "$" },
        { id: "np1Salary", label: "NP 1 Salary", suffix: "$" },
        { id: "np2Salary", label: "NP 2 Salary", suffix: "$" },
        { id: "avgAdminSalary", label: "Avg Admin Salary", suffix: "$" },
      ]
    },
    {
      id: "growth",
      title: "Growth Parameters",
      color: "bg-teal-100 text-teal-800",
      inputs: [
        { id: "dexafitPrimaryIntakeMonthly", label: "Dexafit Primary Intake / Month", suffix: "" },
        { id: "corporateContractSalesMonthly", label: "Corporate Contract Sales / Month", suffix: "" },
        { id: "employeesPerContract", label: "Employees Per Contract", suffix: "" },
        { id: "primaryToSpecialtyConversion", label: "Primary to Specialty Conversion %", suffix: "%" },
        { id: "diagnosticsExpansionRate", label: "Diagnostics Expansion Rate %", suffix: "%" },
      ]
    },
    {
      id: "ramp",
      title: "Ramp to Launch",
      color: "bg-pink-100 text-pink-800",
      inputs: [
        { id: "rampDuration", label: "Ramp Duration (Months)", suffix: "" },
        { id: "corporateStartMonth", label: "Corporate Program Start Month", suffix: "" },
        { id: "rampPrimaryIntakeMonthly", label: "Ramp Primary Intake / Month", suffix: "" },
        { id: "directorOpsStartMonth", label: "Director Ops Start Month", suffix: "" },
        { id: "gmStartMonth", label: "GM Start Month", suffix: "" },
        { id: "fractionalCfoStartMonth", label: "Fractional CFO Start Month", suffix: "" },
        { id: "eventPlannerStartMonth", label: "Event Planner Start Month", suffix: "" },
      ]
    },
  ];

  // Derived variables organized by category
  const derivedSections = [
    {
      id: "physician_derived",
      title: "Physician Metrics (Calculated)",
      color: "bg-purple-50 border-purple-200",
      variables: [
        { id: "totalPhysicians", label: "Total Physicians", suffix: "", formula: "Founding + Additional" },
        { id: "msoFee", label: "My MSO Fee", suffix: "%", formula: "Founding: 37%, Additional: 40%" },
        { id: "equityShare", label: "My Equity Share", suffix: "%", formula: "Founding: 10%, Additional: 5%" },
        { id: "myCapitalContribution", label: "My Capital Contribution", suffix: "$", formula: "Founding: $600k, Additional: $750k" },
        { id: "capitalRaised", label: "Total Capital Raised", suffix: "$", formula: "(Founding × $600k) + (Additional × $750k)" },
      ]
    },
    {
      id: "retention_derived",
      title: "Retention Metrics (Calculated)",
      color: "bg-green-50 border-green-200",
      variables: [
        { id: "retentionRate", label: "Member Retention Rate", suffix: "%", formula: "100% - Churn Rate" },
      ]
    },
    {
      id: "cost_derived",
      title: "Cost Metrics (Calculated)",
      color: "bg-red-50 border-red-200",
      variables: [
        { id: "startupTotal", label: "Ramp Startup Costs", suffix: "$", formula: "Total startup costs during ramp period" },
        { id: "startupMonth0", label: "Startup Allocation — Month 0", suffix: "$", formula: "50% of startup total" },
        { id: "startupMonth1", label: "Startup Allocation — Month 1", suffix: "$", formula: "50% of startup total" },
        { id: "capexMonth0", label: "CapEx Outlay — Month 0", suffix: "$", formula: "Buildout + Office Equipment" },
        { id: "fixedCostMonthly", label: "Fixed Monthly Cost", suffix: "$", formula: "Fixed Overhead + Marketing" },
        { id: "totalEquipmentLease", label: "Total Equipment Lease", suffix: "$", formula: "CT Lease + Echo Lease" },
        { id: "totalInvestment", label: "Total Investment Required", suffix: "$", formula: "CapEx + Equipment + Startup" },
      ]
    },
  ];

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (type === "boolean") {
      return value ? "✓ Yes" : "✗ No";
    }
    if (typeof value === "number") {
      if (suffix === "$") {
        return `$${value.toLocaleString()}`;
      }
      if (suffix === "%") {
        return `${value}%`;
      }
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Logic & Primitives</h2>
        <p className="text-sm text-gray-600 mt-1">
          Complete view of all inputs and calculated values. All metrics update in real-time as you adjust inputs in the sidebar.
        </p>
      </div>

      {/* Input Sections */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Values (Editable)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.map((section) => (
            <Card key={section.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge className={section.color}>{section.title}</Badge>
                  <span className="text-xs text-gray-500">({section.inputs.length} inputs)</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.inputs.map((input) => {
                    const value = (inputs as any)[input.id];
                    return (
                      <div key={input.id} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                        <span className="text-xs text-gray-700">{input.label}</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {formatValue(value, input.type, input.suffix)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Derived Variables Sections */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Derived Variables (Calculated)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {derivedSections.map((section) => (
            <Card key={section.id} className={`border-2 ${section.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
                <CardDescription className="text-xs">Auto-calculated from inputs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.variables.map((variable) => {
                    const value = (derivedVariables as any)[variable.id];
                    return (
                      <div key={variable.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">{variable.label}</span>
                          <span className="text-sm font-bold text-teal-600">
                            {formatValue(value, undefined, variable.suffix)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= {variable.formula}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

