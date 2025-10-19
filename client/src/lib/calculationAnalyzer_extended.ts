/**
 * Extended Calculation Analyzer with Section Metadata
 * 
 * This extends calculationAnalyzer.ts with:
 * - Section assignments (1-7)
 * - Unit metadata for validation
 * - Expected ranges for inputs
 * - Enhanced descriptions
 */

import type { CalculationNode } from './calculationAnalyzer';

// Extended node interface with additional metadata
export interface ExtendedCalculationNode extends CalculationNode {
  section: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  unit?: 'dollars' | 'percentage' | 'count' | 'months' | 'boolean' | 'rate';
  expectedRange?: { min: number; max: number };
}

// Section definitions
export const SECTIONS = {
  1: { id: 1, name: 'Inputs & Scenarios', description: 'Core assumptions and physician setup' },
  2: { id: 2, name: 'Revenues', description: 'Revenue streams and pricing' },
  3: { id: 3, name: 'Diagnostics', description: 'Diagnostic services and volumes' },
  4: { id: 4, name: 'Costs', description: 'Operating costs and expenses' },
  5: { id: 5, name: 'Staffing', description: 'Team structure and compensation' },
  6: { id: 6, name: 'Growth', description: 'Member acquisition and scaling' },
  7: { id: 7, name: 'Risk', description: 'Scenarios and sensitivity analysis' }
} as const;

// Map node IDs to sections
export const NODE_SECTION_MAP: Record<string, number> = {
  // Section 1: Inputs & Scenarios
  'foundingToggle': 1,
  'additionalPhysicians': 1,
  'physicianPrimaryCarryover': 1,
  'physicianSpecialtyCarryover': 1,
  'otherPhysiciansPrimaryCarryoverPerPhysician': 1,
  'otherPhysiciansSpecialtyCarryoverPerPhysician': 1,
  'primaryMembersMonth1': 1,
  'specialtyMembersMonth1': 1,
  'primaryIntakePerMonth': 1,
  'specialtyIntakePerMonth': 1,
  'primaryPrice': 1,
  'specialtyPrice': 1,
  'churnPrimary': 1,
  'churnSpecialty': 1,
  'corpInitialClients': 1,
  'corpEmployeesPerContract': 1,
  'corpPricePerEmployeeMonth': 1,
  'primaryToSpecialtyConversion': 1,
  
  // Section 2: Revenues
  'diagnosticsActive': 2,
  'corpWellnessActive': 2,
  'diagnosticsMargin': 2,
  'corporateContractSalesMonthly': 2,
  'diagnosticsExpansionRate': 2,
  
  // Section 3: Diagnostics
  'echoPrice': 3,
  'echoVolumeMonthly': 3,
  'ctPrice': 3,
  'ctVolumeMonthly': 3,
  'labTestsPrice': 3,
  'labTestsMonthly': 3,
  
  // Section 4: Costs
  'capexBuildout': 4,
  'startupCosts': 4,
  'facilityRent': 4,
  'utilities': 4,
  'insurance': 4,
  'software': 4,
  'supplies': 4,
  'marketingBudgetMonthly': 4,
  'variableCostPerMember': 4,
  'ctLeaseCost': 4,
  'echoLeaseCost': 4,
  'inflationRate': 4,
  
  // Section 5: Staffing
  'founderChiefStrategistSalary': 5,
  'directorOperationsSalary': 5,
  'gmHourlyRate': 5,
  'gmWeeklyHours': 5,
  'fractionalCfoCost': 5,
  'eventSalespersonCost': 5,
  'eventPlannerCost': 5,
  'benefitsPercentage': 5,
  'np1Salary': 5,
  'np2Salary': 5,
  'avgAdminSalary': 5,
  'adminSupportRatio': 5,
  
  // Section 6: Growth
  'rampMonths': 6,
  'corporateStartMonth': 6,
  'rampPrimaryIntakeMonthly': 6,
  'directorOpsStartMonth': 6,
  'gmStartMonth': 6,
  'fractionalCfoStartMonth': 6,
  'eventPlannerStartMonth': 6,
  
  // Derived variables
  'totalPhysicians': 1,
  'msoFee': 1,
  'equityShare': 1,
  'myCapitalContribution': 1,
  'capitalRaised': 1,
  'retentionRate': 6,
  'totalCarryoverPrimary': 1,
  'totalCarryoverSpecialty': 1,
  'adminStaffCount': 5,
  
  // Calculations
  'monthlyPrimaryRevenue': 2,
  'monthlySpecialtyRevenue': 2,
  'monthlyCorporateRevenue': 2,
  'monthlyDiagnosticsRevenue': 3,
  'totalMonthlyRevenue': 2,
  'monthlySalaryCosts': 5,
  'monthlyEquipmentLease': 4,
  'monthlyVariableCosts': 4,
  'monthlyFixedOverhead': 4,
  'monthlyMarketingCosts': 4,
  'totalMonthlyCosts': 4,
  'monthlyProfit': 2,
  
  // Outputs
  'month12Revenue': 2,
  'month12Profit': 2,
  'totalRevenue12Mo': 2,
  'totalProfit12Mo': 2,
  'physicianROI': 1,
  'breakevenMonth': 4,
  'peakMembers': 6,
};

// Map node IDs to units
export const NODE_UNIT_MAP: Record<string, string> = {
  // Dollar amounts
  'primaryPrice': 'dollars',
  'specialtyPrice': 'dollars',
  'corpPricePerEmployeeMonth': 'dollars',
  'echoPrice': 'dollars',
  'ctPrice': 'dollars',
  'labTestsPrice': 'dollars',
  'capexBuildout': 'dollars',
  'startupCosts': 'dollars',
  'facilityRent': 'dollars',
  'utilities': 'dollars',
  'insurance': 'dollars',
  'software': 'dollars',
  'supplies': 'dollars',
  'marketingBudgetMonthly': 'dollars',
  'variableCostPerMember': 'dollars',
  'ctLeaseCost': 'dollars',
  'echoLeaseCost': 'dollars',
  'founderChiefStrategistSalary': 'dollars',
  'directorOperationsSalary': 'dollars',
  'gmHourlyRate': 'dollars',
  'fractionalCfoCost': 'dollars',
  'eventSalespersonCost': 'dollars',
  'eventPlannerCost': 'dollars',
  'np1Salary': 'dollars',
  'np2Salary': 'dollars',
  'avgAdminSalary': 'dollars',
  'myCapitalContribution': 'dollars',
  'capitalRaised': 'dollars',
  'monthlyPrimaryRevenue': 'dollars',
  'monthlySpecialtyRevenue': 'dollars',
  'monthlyCorporateRevenue': 'dollars',
  'monthlyDiagnosticsRevenue': 'dollars',
  'totalMonthlyRevenue': 'dollars',
  'monthlySalaryCosts': 'dollars',
  'monthlyEquipmentLease': 'dollars',
  'monthlyVariableCosts': 'dollars',
  'monthlyFixedOverhead': 'dollars',
  'monthlyMarketingCosts': 'dollars',
  'totalMonthlyCosts': 'dollars',
  'monthlyProfit': 'dollars',
  'month12Revenue': 'dollars',
  'month12Profit': 'dollars',
  'totalRevenue12Mo': 'dollars',
  'totalProfit12Mo': 'dollars',
  
  // Percentages
  'churnPrimary': 'percentage',
  'churnSpecialty': 'percentage',
  'primaryToSpecialtyConversion': 'percentage',
  'diagnosticsMargin': 'percentage',
  'inflationRate': 'percentage',
  'benefitsPercentage': 'percentage',
  'msoFee': 'percentage',
  'equityShare': 'percentage',
  'retentionRate': 'percentage',
  'physicianROI': 'percentage',
  
  // Counts
  'additionalPhysicians': 'count',
  'physicianPrimaryCarryover': 'count',
  'physicianSpecialtyCarryover': 'count',
  'otherPhysiciansPrimaryCarryoverPerPhysician': 'count',
  'otherPhysiciansSpecialtyCarryoverPerPhysician': 'count',
  'primaryMembersMonth1': 'count',
  'specialtyMembersMonth1': 'count',
  'primaryIntakePerMonth': 'count',
  'specialtyIntakePerMonth': 'count',
  'corpInitialClients': 'count',
  'corpEmployeesPerContract': 'count',
  'echoVolumeMonthly': 'count',
  'ctVolumeMonthly': 'count',
  'labTestsMonthly': 'count',
  'gmWeeklyHours': 'count',
  'totalPhysicians': 'count',
  'totalCarryoverPrimary': 'count',
  'totalCarryoverSpecialty': 'count',
  'adminStaffCount': 'count',
  'peakMembers': 'count',
  'rampPrimaryIntakeMonthly': 'count',
  'corporateContractSalesMonthly': 'count',
  
  // Months
  'rampMonths': 'months',
  'corporateStartMonth': 'months',
  'directorOpsStartMonth': 'months',
  'gmStartMonth': 'months',
  'fractionalCfoStartMonth': 'months',
  'eventPlannerStartMonth': 'months',
  'breakevenMonth': 'months',
  
  // Booleans
  'foundingToggle': 'boolean',
  'diagnosticsActive': 'boolean',
  'corpWellnessActive': 'boolean',
  
  // Rates/Ratios
  'adminSupportRatio': 'rate',
  'diagnosticsExpansionRate': 'rate',
};

// Expected ranges for key inputs (for validation)
export const NODE_EXPECTED_RANGES: Record<string, { min: number; max: number }> = {
  'primaryPrice': { min: 50, max: 350 },
  'specialtyPrice': { min: 150, max: 800 },
  'churnPrimary': { min: 5, max: 25 },
  'churnSpecialty': { min: 10, max: 30 },
  'primaryIntakePerMonth': { min: 5, max: 50 },
  'specialtyIntakePerMonth': { min: 3, max: 30 },
  'additionalPhysicians': { min: 0, max: 10 },
  'diagnosticsMargin': { min: 20, max: 60 },
  'benefitsPercentage': { min: 15, max: 35 },
  'inflationRate': { min: 0, max: 10 },
  'adminSupportRatio': { min: 0.5, max: 3 },
};

/**
 * Enhance a calculation node with section and unit metadata
 */
export function enhanceNode(node: CalculationNode): ExtendedCalculationNode {
  return {
    ...node,
    section: (NODE_SECTION_MAP[node.id] || 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
    unit: NODE_UNIT_MAP[node.id] as any,
    expectedRange: NODE_EXPECTED_RANGES[node.id]
  };
}

/**
 * Get all nodes for a specific section
 */
export function getNodesBySection(section: number): ExtendedCalculationNode[] {
  const { buildCalculationInventory } = require('./calculationAnalyzer');
  const inventory = buildCalculationInventory();
  
  return inventory.nodes
    .filter((node: CalculationNode) => NODE_SECTION_MAP[node.id] === section)
    .map(enhanceNode);
}

/**
 * Get ontology summary with section breakdown
 */
export function getOntologySummary() {
  const { buildCalculationInventory } = require('./calculationAnalyzer');
  const inventory = buildCalculationInventory();
  
  const sectionCounts: Record<number, number> = {};
  const typeCounts: Record<string, number> = {};
  
  inventory.nodes.forEach((node: CalculationNode) => {
    const section = NODE_SECTION_MAP[node.id] || 1;
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
  });
  
  return {
    totalNodes: inventory.nodes.length,
    totalEdges: inventory.edges.length,
    bySection: sectionCounts,
    byType: typeCounts,
    sections: SECTIONS
  };
}

