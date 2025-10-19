/**
 * Calculation Analyzer - Deep Analysis of Calculation Engine
 * 
 * This module analyzes calculations.ts to extract:
 * - All formulas and their dependencies
 * - Complete calculation flow
 * - Node metadata for ontological mapping
 */

import type { DashboardInputs } from './data';

// ============================================================================
// TYPES
// ============================================================================

export type NodeType = 'input' | 'derived' | 'calculation' | 'output';
export type NodeLayer = 1 | 2 | 3 | 4 | 5;
export type ImpactLevel = 'low' | 'medium' | 'high';

export interface CalculationNode {
  id: string;
  label: string;
  type: NodeType;
  layer: NodeLayer;
  category: string;
  formula?: string; // Human-readable formula
  code?: string; // TypeScript code snippet
  description?: string;
  dependencies: string[]; // Node IDs this depends on
  dependents: string[]; // Node IDs that depend on this (filled during graph build)
  metadata: {
    file: string;
    lineNumber?: number;
    complexity: number; // 1-10
    impact: ImpactLevel;
    isIntermediate: boolean; // True if used in other calculations but not final output
  };
}

export interface CalculationInventory {
  nodes: CalculationNode[];
  edges: Array<{ from: string; to: string; label?: string }>;
  layers: {
    inputs: CalculationNode[];
    derived: CalculationNode[];
    calculations: CalculationNode[];
    outputs: CalculationNode[];
  };
  stats: {
    totalNodes: number;
    totalEdges: number;
    maxComplexity: number;
    avgComplexity: number;
  };
}

// ============================================================================
// INPUT NODES (Layer 1)
// ============================================================================

const INPUT_NODES: CalculationNode[] = [
  // Physician Setup
  {
    id: 'foundingToggle',
    label: 'Founding Physician',
    type: 'input',
    layer: 1,
    category: 'Physicians',
    description: 'Whether user is a founding physician',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'additionalPhysicians',
    label: 'Additional Physicians',
    type: 'input',
    layer: 1,
    category: 'Physicians',
    description: 'Number of additional physicians joining',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'physicianPrimaryCarryover',
    label: 'My Primary Members (Carry-Over)',
    type: 'input',
    layer: 1,
    category: 'Members',
    description: 'Primary care members carried over by founding physician',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'physicianSpecialtyCarryover',
    label: 'My Specialty Clients (Carry-Over)',
    type: 'input',
    layer: 1,
    category: 'Members',
    description: 'Specialty care clients carried over by founding physician',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'otherPhysiciansPrimaryCarryoverPerPhysician',
    label: 'Avg Primary Carry-Over (Other Physicians)',
    type: 'input',
    layer: 1,
    category: 'Members',
    description: 'Average primary members per additional physician',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'otherPhysiciansSpecialtyCarryoverPerPhysician',
    label: 'Avg Specialty Carry-Over (Other Physicians)',
    type: 'input',
    layer: 1,
    category: 'Members',
    description: 'Average specialty clients per additional physician',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  
  // Revenue Streams
  {
    id: 'primaryPrice',
    label: 'Primary Price/Member/Month',
    type: 'input',
    layer: 1,
    category: 'Revenue',
    description: 'Monthly subscription price for primary care',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'specialtyPrice',
    label: 'Specialty Visit Price',
    type: 'input',
    layer: 1,
    category: 'Revenue',
    description: 'Price per specialty care visit',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'corpPricePerEmployeeMonth',
    label: 'Corporate Price / Employee / Month',
    type: 'input',
    layer: 1,
    category: 'Revenue',
    description: 'Corporate wellness pricing per employee',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'corpInitialClients',
    label: 'Initial Corporate Wellness Clients',
    type: 'input',
    layer: 1,
    category: 'Revenue',
    description: 'Number of corporate clients at start',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  
  // Growth Parameters
  {
    id: 'dexafitPrimaryIntakeMonthly',
    label: 'Dexafit Primary Intake / Month',
    type: 'input',
    layer: 1,
    category: 'Growth',
    description: 'New primary members from Dexafit partnership per month',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'corporateContractSalesMonthly',
    label: 'Corporate Contract Sales / Month',
    type: 'input',
    layer: 1,
    category: 'Growth',
    description: 'New corporate contracts signed per month',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'employeesPerContract',
    label: 'Employees Per Contract',
    type: 'input',
    layer: 1,
    category: 'Growth',
    description: 'Average employees per corporate contract',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'primaryToSpecialtyConversion',
    label: 'Primary to Specialty Conversion %',
    type: 'input',
    layer: 1,
    category: 'Growth',
    description: 'Percentage of primary members who become specialty clients',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'churnPrimary',
    label: 'Annual Churn Rate (Primary)',
    type: 'input',
    layer: 1,
    category: 'Growth',
    description: 'Annual member churn rate for primary care',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  
  // Diagnostics
  {
    id: 'diagnosticsActive',
    label: 'Diagnostics Active',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Whether diagnostics services are enabled',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'echoPrice',
    label: 'Echo Price',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Price per echocardiogram',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'echoVolumeMonthly',
    label: 'Echo Volume / Month',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Number of echos performed per month',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'ctPrice',
    label: 'CT Price',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Price per CT scan',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'ctVolumeMonthly',
    label: 'CT Volume / Month',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Number of CT scans per month',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'labTestsPrice',
    label: 'Lab Tests Price',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Price per lab test',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'labTestsMonthly',
    label: 'Lab Tests / Month',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Number of lab tests per month',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'diagnosticsMargin',
    label: 'Diagnostics Margin %',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Profit margin on diagnostics services',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'diagnosticsExpansionRate',
    label: 'Diagnostics Expansion Rate %',
    type: 'input',
    layer: 1,
    category: 'Diagnostics',
    description: 'Monthly growth rate for diagnostics volume',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  
  // Costs & CapEx
  {
    id: 'capexBuildoutCost',
    label: 'Buildout Budget (One-Time)',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'One-time buildout cost',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'officeEquipment',
    label: 'Office Equipment (One-Time)',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'One-time office equipment cost',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'rampStartupCost',
    label: 'Startup Costs (Total)',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'Total startup costs during ramp period',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'fixedOverheadMonthly',
    label: 'Fixed Overhead / Month',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'Monthly fixed overhead costs',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'marketingBudgetMonthly',
    label: 'Marketing Budget / Month',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'Monthly marketing budget',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'variableCostPct',
    label: 'Variable Cost % of Revenue',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'Variable costs as percentage of revenue',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'ctLeaseCost',
    label: 'CT Lease Cost / Month',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'Monthly CT equipment lease cost',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'echoLeaseCost',
    label: 'Echo Lease Cost / Month',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'Monthly echo equipment lease cost',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'inflationRate',
    label: 'Inflation % (Costs)',
    type: 'input',
    layer: 1,
    category: 'Costs',
    description: 'Annual inflation rate for costs',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  
  // Staffing
  {
    id: 'founderChiefStrategistSalary',
    label: 'Founder/Chief Strategist Salary',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Annual salary for founder/chief strategist',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'directorOperationsSalary',
    label: 'Director Operations Salary',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Annual salary for director of operations',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'gmHourlyRate',
    label: 'GM Hourly Rate',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Hourly rate for general manager',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'gmWeeklyHours',
    label: 'GM Weekly Hours',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Weekly hours for general manager',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'fractionalCfoCost',
    label: 'Fractional CFO Cost / Month',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Monthly cost for fractional CFO',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'eventSalespersonCost',
    label: 'Event Salesperson Cost / Month',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Monthly cost for event salesperson',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'np1Salary',
    label: 'NP 1 Salary',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Annual salary for nurse practitioner 1',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'np2Salary',
    label: 'NP 2 Salary',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Annual salary for nurse practitioner 2',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'avgAdminSalary',
    label: 'Average Admin/Support Salary',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Average annual salary for admin/support staff',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'adminSupportRatio',
    label: 'Admin/Support Staff per Physician',
    type: 'input',
    layer: 1,
    category: 'Staffing',
    description: 'Number of admin/support staff per physician',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  
  // Ramp to Launch
  {
    id: 'rampDuration',
    label: 'Ramp Duration (Months)',
    type: 'input',
    layer: 1,
    category: 'Ramp',
    description: 'Number of months in ramp period',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'corporateStartMonth',
    label: 'Corporate Program Start Month',
    type: 'input',
    layer: 1,
    category: 'Ramp',
    description: 'Month when corporate wellness program starts',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'rampPrimaryIntakeMonthly',
    label: 'Ramp Primary Intake / Month',
    type: 'input',
    layer: 1,
    category: 'Ramp',
    description: 'New primary members per month during ramp',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'medium', isIntermediate: false }
  },
  {
    id: 'directorOpsStartMonth',
    label: 'Director Ops Start Month',
    type: 'input',
    layer: 1,
    category: 'Ramp',
    description: 'Month when director of operations starts',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'gmStartMonth',
    label: 'GM Start Month',
    type: 'input',
    layer: 1,
    category: 'Ramp',
    description: 'Month when general manager starts',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'fractionalCfoStartMonth',
    label: 'Fractional CFO Start Month',
    type: 'input',
    layer: 1,
    category: 'Ramp',
    description: 'Month when fractional CFO starts',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
  {
    id: 'eventPlannerStartMonth',
    label: 'Event Planner Start Month',
    type: 'input',
    layer: 1,
    category: 'Ramp',
    description: 'Month when event planner starts',
    dependencies: [],
    dependents: [],
    metadata: { file: 'dashboardConfig.ts', complexity: 1, impact: 'low', isIntermediate: false }
  },
];

// ============================================================================
// DERIVED VARIABLE NODES (Layer 2)
// ============================================================================

const DERIVED_NODES: CalculationNode[] = [
  {
    id: 'totalPhysicians',
    label: 'Total Physicians',
    type: 'derived',
    layer: 2,
    category: 'Physicians',
    formula: '(foundingToggle ? 1 : 0) + additionalPhysicians',
    code: 'const totalPhysicians = (inputs.foundingToggle ? 1 : 0) + inputs.additionalPhysicians;',
    description: 'Total number of physicians (founding + additional)',
    dependencies: ['foundingToggle', 'additionalPhysicians'],
    dependents: [],
    metadata: { file: 'constants.ts', lineNumber: 45, complexity: 2, impact: 'high', isIntermediate: true }
  },
  {
    id: 'msoFee',
    label: 'MSO Fee %',
    type: 'derived',
    layer: 2,
    category: 'Financial',
    formula: 'foundingToggle ? 37% : 40%',
    code: 'const msoFee = getMSOFee(inputs.foundingToggle);',
    description: 'MSO fee percentage (37% for founding, 40% for additional)',
    dependencies: ['foundingToggle'],
    dependents: [],
    metadata: { file: 'constants.ts', lineNumber: 60, complexity: 2, impact: 'high', isIntermediate: true }
  },
  {
    id: 'equityShare',
    label: 'Equity Share %',
    type: 'derived',
    layer: 2,
    category: 'Financial',
    formula: 'foundingToggle ? 10% : 5%',
    code: 'const equityShare = getEquityShare(inputs.foundingToggle);',
    description: 'Equity share percentage (10% for founding, 5% for additional)',
    dependencies: ['foundingToggle'],
    dependents: [],
    metadata: { file: 'constants.ts', lineNumber: 65, complexity: 2, impact: 'medium', isIntermediate: true }
  },
  {
    id: 'myCapitalContribution',
    label: 'My Capital Contribution',
    type: 'derived',
    layer: 2,
    category: 'Financial',
    formula: 'foundingToggle ? $600,000 : $750,000',
    code: 'const myCapital = inputs.foundingToggle ? 600000 : 750000;',
    description: 'Capital contribution required ($600k for founding, $750k for additional)',
    dependencies: ['foundingToggle'],
    dependents: [],
    metadata: { file: 'constants.ts', lineNumber: 70, complexity: 2, impact: 'high', isIntermediate: true }
  },
  {
    id: 'capitalRaised',
    label: 'Total Capital Raised',
    type: 'derived',
    layer: 2,
    category: 'Financial',
    formula: '(foundingCount × $600k) + (additionalPhysicians × $750k)',
    code: 'const capitalRaised = calculateSeedCapital(inputs);',
    description: 'Total capital raised from all physicians',
    dependencies: ['foundingToggle', 'additionalPhysicians'],
    dependents: [],
    metadata: { file: 'constants.ts', lineNumber: 50, complexity: 3, impact: 'high', isIntermediate: true }
  },
  {
    id: 'retentionRate',
    label: 'Member Retention Rate',
    type: 'derived',
    layer: 2,
    category: 'Growth',
    formula: '100% - (churnPrimary / 12)',
    code: 'const retentionRate = 1 - (inputs.churnPrimary / 100 / 12);',
    description: 'Monthly member retention rate',
    dependencies: ['churnPrimary'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 200, complexity: 2, impact: 'high', isIntermediate: true }
  },
  {
    id: 'totalCarryoverPrimary',
    label: 'Total Primary Carryover',
    type: 'derived',
    layer: 2,
    category: 'Members',
    formula: 'physicianPrimaryCarryover + (additionalPhysicians × otherPhysiciansPrimaryCarryoverPerPhysician)',
    code: 'const totalPrimaryCarryover = inputs.physicianPrimaryCarryover + (inputs.additionalPhysicians * inputs.otherPhysiciansPrimaryCarryoverPerPhysician);',
    description: 'Total primary members carried over by all physicians',
    dependencies: ['physicianPrimaryCarryover', 'additionalPhysicians', 'otherPhysiciansPrimaryCarryoverPerPhysician'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 175, complexity: 3, impact: 'high', isIntermediate: true }
  },
  {
    id: 'totalCarryoverSpecialty',
    label: 'Total Specialty Carryover',
    type: 'derived',
    layer: 2,
    category: 'Members',
    formula: 'physicianSpecialtyCarryover + (additionalPhysicians × otherPhysiciansSpecialtyCarryoverPerPhysician)',
    code: 'const totalSpecialtyCarryover = inputs.physicianSpecialtyCarryover + (inputs.additionalPhysicians * inputs.otherPhysiciansSpecialtyCarryoverPerPhysician);',
    description: 'Total specialty clients carried over by all physicians',
    dependencies: ['physicianSpecialtyCarryover', 'additionalPhysicians', 'otherPhysiciansSpecialtyCarryoverPerPhysician'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 180, complexity: 3, impact: 'medium', isIntermediate: true }
  },
  {
    id: 'adminStaffCount',
    label: 'Admin Staff Count',
    type: 'derived',
    layer: 2,
    category: 'Staffing',
    formula: 'totalPhysicians × adminSupportRatio',
    code: 'const adminStaff = Math.ceil(totalPhysicians * inputs.adminSupportRatio);',
    description: 'Number of admin/support staff based on physician count',
    dependencies: ['totalPhysicians', 'adminSupportRatio'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 131, complexity: 2, impact: 'medium', isIntermediate: true }
  },
];

// ============================================================================
// CALCULATION NODES (Layer 3)
// ============================================================================

const CALCULATION_NODES: CalculationNode[] = [
  {
    id: 'monthlyPrimaryRevenue',
    label: 'Monthly Primary Care Revenue',
    type: 'calculation',
    layer: 3,
    category: 'Revenue',
    formula: 'primaryMembers × primaryPrice',
    code: 'revenue.primary = primaryMembers * inputs.primaryPrice;',
    description: 'Monthly revenue from primary care subscriptions',
    dependencies: ['primaryPrice', 'totalCarryoverPrimary', 'dexafitPrimaryIntakeMonthly', 'retentionRate'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 215, complexity: 4, impact: 'high', isIntermediate: true }
  },
  {
    id: 'monthlySpecialtyRevenue',
    label: 'Monthly Specialty Care Revenue',
    type: 'calculation',
    layer: 3,
    category: 'Revenue',
    formula: 'specialtyVisits × specialtyPrice',
    code: 'revenue.specialty = specialtyVisits * inputs.specialtyPrice;',
    description: 'Monthly revenue from specialty care visits',
    dependencies: ['specialtyPrice', 'totalCarryoverSpecialty', 'primaryToSpecialtyConversion'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 220, complexity: 4, impact: 'high', isIntermediate: true }
  },
  {
    id: 'monthlyCorporateRevenue',
    label: 'Monthly Corporate Wellness Revenue',
    type: 'calculation',
    layer: 3,
    category: 'Revenue',
    formula: 'totalEmployees × corpPricePerEmployeeMonth',
    code: 'revenue.corporate = totalEmployees * inputs.corpPricePerEmployeeMonth;',
    description: 'Monthly revenue from corporate wellness contracts',
    dependencies: ['corpPricePerEmployeeMonth', 'corpInitialClients', 'corporateContractSalesMonthly', 'employeesPerContract'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 225, complexity: 5, impact: 'medium', isIntermediate: true }
  },
  {
    id: 'monthlyDiagnosticsRevenue',
    label: 'Monthly Diagnostics Revenue',
    type: 'calculation',
    layer: 3,
    category: 'Revenue',
    formula: '(echo × echoPrice) + (ct × ctPrice) + (labs × labTestsPrice)',
    code: 'revenue.echo = echoVolume * inputs.echoPrice; revenue.ct = ctVolume * inputs.ctPrice; revenue.labs = labVolume * inputs.labTestsPrice;',
    description: 'Monthly revenue from diagnostics services',
    dependencies: ['diagnosticsActive', 'echoPrice', 'echoVolumeMonthly', 'ctPrice', 'ctVolumeMonthly', 'labTestsPrice', 'labTestsMonthly', 'diagnosticsExpansionRate'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 230, complexity: 6, impact: 'medium', isIntermediate: true }
  },
  {
    id: 'totalMonthlyRevenue',
    label: 'Total Monthly Revenue',
    type: 'calculation',
    layer: 3,
    category: 'Revenue',
    formula: 'primary + specialty + corporate + diagnostics',
    code: 'revenue.total = revenue.primary + revenue.specialty + revenue.corporate + revenue.echo + revenue.ct + revenue.labs;',
    description: 'Total monthly revenue from all sources',
    dependencies: ['monthlyPrimaryRevenue', 'monthlySpecialtyRevenue', 'monthlyCorporateRevenue', 'monthlyDiagnosticsRevenue'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 245, complexity: 3, impact: 'high', isIntermediate: true }
  },
  {
    id: 'monthlySalaryCosts',
    label: 'Monthly Salary Costs',
    type: 'calculation',
    layer: 3,
    category: 'Costs',
    formula: 'Sum of all staff salaries based on hiring schedule',
    code: 'costs.salaries = calculateMonthlySalaries(inputs, month);',
    description: 'Total monthly salary costs for all staff',
    dependencies: ['founderChiefStrategistSalary', 'directorOperationsSalary', 'gmHourlyRate', 'gmWeeklyHours', 'fractionalCfoCost', 'eventSalespersonCost', 'np1Salary', 'np2Salary', 'avgAdminSalary', 'adminStaffCount'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 94, complexity: 8, impact: 'high', isIntermediate: true }
  },
  {
    id: 'monthlyEquipmentLease',
    label: 'Monthly Equipment Lease',
    type: 'calculation',
    layer: 3,
    category: 'Costs',
    formula: 'ctLeaseCost + echoLeaseCost (if diagnostics active)',
    code: 'costs.equipmentLease = calculateEquipmentLease(inputs, month);',
    description: 'Monthly equipment lease costs',
    dependencies: ['diagnosticsActive', 'ctLeaseCost', 'echoLeaseCost'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 146, complexity: 3, impact: 'low', isIntermediate: true }
  },
  {
    id: 'monthlyVariableCosts',
    label: 'Monthly Variable Costs',
    type: 'calculation',
    layer: 3,
    category: 'Costs',
    formula: 'totalRevenue × variableCostPct',
    code: 'costs.variable = revenue.total * (inputs.variableCostPct / 100);',
    description: 'Variable costs as percentage of revenue',
    dependencies: ['totalMonthlyRevenue', 'variableCostPct'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 260, complexity: 2, impact: 'high', isIntermediate: true }
  },
  {
    id: 'monthlyDiagnosticsCOGS',
    label: 'Monthly Diagnostics COGS',
    type: 'calculation',
    layer: 3,
    category: 'Costs',
    formula: 'diagnosticsRevenue × (1 - diagnosticsMargin)',
    code: 'costs.diagnostics = diagnosticsRevenue * (1 - inputs.diagnosticsMargin / 100);',
    description: 'Cost of goods sold for diagnostics services',
    dependencies: ['monthlyDiagnosticsRevenue', 'diagnosticsMargin'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 237, complexity: 3, impact: 'medium', isIntermediate: true }
  },
  {
    id: 'totalMonthlyCosts',
    label: 'Total Monthly Costs',
    type: 'calculation',
    layer: 3,
    category: 'Costs',
    formula: 'salaries + equipmentLease + fixedOverhead + marketing + variable + diagnosticsCOGS + capex + startup',
    code: 'costs.total = costs.salaries + costs.equipmentLease + costs.fixedOverhead + costs.marketing + costs.variable + costs.diagnostics + costs.capex + costs.startup;',
    description: 'Total monthly costs from all sources',
    dependencies: ['monthlySalaryCosts', 'monthlyEquipmentLease', 'fixedOverheadMonthly', 'marketingBudgetMonthly', 'monthlyVariableCosts', 'monthlyDiagnosticsCOGS'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 265, complexity: 5, impact: 'high', isIntermediate: true }
  },
  {
    id: 'monthlyProfit',
    label: 'Monthly Profit',
    type: 'calculation',
    layer: 3,
    category: 'Financial',
    formula: 'totalRevenue - totalCosts',
    code: 'profit = revenue.total - costs.total;',
    description: 'Monthly profit (revenue minus costs)',
    dependencies: ['totalMonthlyRevenue', 'totalMonthlyCosts'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 270, complexity: 2, impact: 'high', isIntermediate: true }
  },
];

// ============================================================================
// OUTPUT NODES (Layer 4-5)
// ============================================================================

const OUTPUT_NODES: CalculationNode[] = [
  {
    id: 'month12Revenue',
    label: 'Month 12 Total Revenue',
    type: 'output',
    layer: 4,
    category: 'Financial',
    description: 'Total revenue in month 12 of projection',
    dependencies: ['totalMonthlyRevenue'],
    dependents: [],
    metadata: { file: 'calculations.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'month12Profit',
    label: 'Month 12 Profit',
    type: 'output',
    layer: 4,
    category: 'Financial',
    description: 'Profit in month 12 of projection',
    dependencies: ['monthlyProfit'],
    dependents: [],
    metadata: { file: 'calculations.ts', complexity: 1, impact: 'high', isIntermediate: false }
  },
  {
    id: 'totalRevenue12Mo',
    label: 'Total Revenue (12 Months)',
    type: 'output',
    layer: 5,
    category: 'Financial',
    formula: 'Sum of all monthly revenue',
    description: 'Total revenue across entire 12-month projection',
    dependencies: ['totalMonthlyRevenue'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 510, complexity: 2, impact: 'high', isIntermediate: false }
  },
  {
    id: 'totalProfit12Mo',
    label: 'Total Profit (12 Months)',
    type: 'output',
    layer: 5,
    category: 'Financial',
    formula: 'Sum of all monthly profit',
    description: 'Total profit across entire 12-month projection',
    dependencies: ['monthlyProfit'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 515, complexity: 2, impact: 'high', isIntermediate: false }
  },
  {
    id: 'physicianROI',
    label: 'Physician ROI',
    type: 'output',
    layer: 5,
    category: 'Financial',
    formula: '(totalProfit12Mo / myCapitalContribution) × 100',
    description: 'Return on investment for physician',
    dependencies: ['totalProfit12Mo', 'myCapitalContribution'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 520, complexity: 3, impact: 'high', isIntermediate: false }
  },
  {
    id: 'breakevenMonth',
    label: 'Breakeven Month',
    type: 'output',
    layer: 5,
    category: 'Financial',
    formula: 'First month where cumulativeCash > 0',
    description: 'Month when cumulative cash flow becomes positive',
    dependencies: ['monthlyProfit'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 525, complexity: 4, impact: 'high', isIntermediate: false }
  },
  {
    id: 'peakMembers',
    label: 'Peak Member Count',
    type: 'output',
    layer: 5,
    category: 'Members',
    formula: 'Max(primaryMembers) across all months',
    description: 'Maximum number of primary members reached',
    dependencies: ['monthlyPrimaryRevenue'],
    dependents: [],
    metadata: { file: 'calculations.ts', lineNumber: 530, complexity: 2, impact: 'medium', isIntermediate: false }
  },
];

// ============================================================================
// BUILD COMPLETE INVENTORY
// ============================================================================

export function buildCalculationInventory(): CalculationInventory {
  const allNodes = [
    ...INPUT_NODES,
    ...DERIVED_NODES,
    ...CALCULATION_NODES,
    ...OUTPUT_NODES
  ];

  // Build edges from dependencies
  const edges: Array<{ from: string; to: string; label?: string }> = [];
  
  allNodes.forEach(node => {
    node.dependencies.forEach(depId => {
      edges.push({
        from: depId,
        to: node.id,
        label: undefined
      });
    });
  });

  // Fill in dependents (reverse dependencies)
  allNodes.forEach(node => {
    node.dependents = edges
      .filter(edge => edge.from === node.id)
      .map(edge => edge.to);
  });

  // Calculate stats
  const complexities = allNodes.map(n => n.metadata.complexity);
  const maxComplexity = Math.max(...complexities);
  const avgComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;

  return {
    nodes: allNodes,
    edges,
    layers: {
      inputs: INPUT_NODES,
      derived: DERIVED_NODES,
      calculations: CALCULATION_NODES,
      outputs: OUTPUT_NODES
    },
    stats: {
      totalNodes: allNodes.length,
      totalEdges: edges.length,
      maxComplexity,
      avgComplexity
    }
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getNodeById(id: string): CalculationNode | undefined {
  const inventory = buildCalculationInventory();
  return inventory.nodes.find(n => n.id === id);
}

export function getNodesByCategory(category: string): CalculationNode[] {
  const inventory = buildCalculationInventory();
  return inventory.nodes.filter(n => n.category === category);
}

export function getNodesByLayer(layer: NodeLayer): CalculationNode[] {
  const inventory = buildCalculationInventory();
  return inventory.nodes.filter(n => n.layer === layer);
}

export function getDependencyChain(nodeId: string): string[] {
  const inventory = buildCalculationInventory();
  const visited = new Set<string>();
  const chain: string[] = [];

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    
    const node = inventory.nodes.find(n => n.id === id);
    if (!node) return;
    
    node.dependencies.forEach(depId => traverse(depId));
    chain.push(id);
  }

  traverse(nodeId);
  return chain;
}

export function getImpactedNodes(nodeId: string): string[] {
  const inventory = buildCalculationInventory();
  const visited = new Set<string>();
  const impacted: string[] = [];

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    
    const node = inventory.nodes.find(n => n.id === id);
    if (!node) return;
    
    impacted.push(id);
    node.dependents.forEach(depId => traverse(depId));
  }

  traverse(nodeId);
  return impacted.slice(1); // Exclude the starting node
}

