/**
 * Calculation Graph Builder
 * Analyzes the calculation flow and builds a dependency graph
 */

import { DashboardInputs } from "./data";

export interface GraphNode {
  id: string;
  label: string;
  type: 'input' | 'calculation' | 'output';
  category?: string;
  formula?: string;
  value?: any;
  description?: string;
  codeSnippet?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface CalculationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Build the complete calculation dependency graph
 */
export function buildCalculationGraph(inputs: DashboardInputs): CalculationGraph {
  // Safety check: return empty graph if inputs are not ready
  if (!inputs || typeof inputs !== 'object') {
    return { nodes: [], edges: [] };
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // ============================================
  // INPUT NODES
  // ============================================
  
  // Physician & Member Inputs
  nodes.push(
    { id: 'foundingToggle', label: 'Founding Physician', type: 'input', category: 'Physicians', value: inputs.foundingToggle },
    { id: 'additionalPhysicians', label: 'Additional Physicians', type: 'input', category: 'Physicians', value: inputs.additionalPhysicians },
    { id: 'physicianPrimaryCarryover', label: 'Founding Physician Carryover', type: 'input', category: 'Physicians', value: inputs.physicianPrimaryCarryover },
    { id: 'otherPhysiciansPrimaryCarryoverPerPhysician', label: 'Other Physicians Carryover (per physician)', type: 'input', category: 'Physicians', value: inputs.otherPhysiciansPrimaryCarryoverPerPhysician },
    { id: 'churnPrimary', label: 'Annual Churn Rate', type: 'input', category: 'Members', value: inputs.churnPrimary }
  );

  // Corporate Inputs
  nodes.push(
    { id: 'corpInitialClients', label: 'Corporate Initial Clients', type: 'input', category: 'Corporate', value: inputs.corpInitialClients },
    { id: 'corporateContractsMonthly', label: 'Corporate Contracts/Month', type: 'input', category: 'Corporate', value: inputs.corporateContractsMonthly },
    { id: 'employeesPerContract', label: 'Employees per Contract', type: 'input', category: 'Corporate', value: inputs.employeesPerContract },
    { id: 'corpPricePerEmployeeMonth', label: 'Corporate Price per Employee', type: 'input', category: 'Corporate', value: inputs.corpPricePerEmployeeMonth }
  );

  // Revenue Inputs
  nodes.push(
    { id: 'primaryPrice', label: 'Primary Care Price', type: 'input', category: 'Revenue', value: inputs.primaryPrice },
    { id: 'specialtyPrice', label: 'Specialty Care Price', type: 'input', category: 'Revenue', value: inputs.specialtyPrice },
    { id: 'echoPrice', label: 'Echo Price', type: 'input', category: 'Revenue', value: inputs.echoPrice },
    { id: 'ctPrice', label: 'CT Scan Price', type: 'input', category: 'Revenue', value: inputs.ctPrice },
    { id: 'labTestsPrice', label: 'Labs Price', type: 'input', category: 'Revenue', value: inputs.labTestsPrice }
  );

  // Diagnostics Activation Inputs
  nodes.push(
    { id: 'echoStartMonth', label: 'Echo Start Month', type: 'input', category: 'Diagnostics', value: inputs.echoStartMonth },
    { id: 'ctStartMonth', label: 'CT Start Month', type: 'input', category: 'Diagnostics', value: inputs.ctStartMonth }
  );

  // Growth Inputs
  nodes.push(
    // annualPrimaryGrowthRate removed - feature not implemented, growth driven by fixed monthly intake
    { id: 'physicianSpecialtyGrowthRate', label: 'Specialty Growth Rate', type: 'input', category: 'Growth', value: inputs.physicianSpecialtyGrowthRate },
    { id: 'annualDiagnosticGrowthRate', label: 'Diagnostic Growth Rate', type: 'input', category: 'Growth', value: inputs.annualDiagnosticGrowthRate }
  );

  // Cost Inputs
  nodes.push(
    { id: 'fixedOverheadMonthly', label: 'Fixed Overhead', type: 'input', category: 'Costs', value: inputs.fixedOverheadMonthly },
    // equipmentLease removed - calculated from ctLeaseCost + echoLeaseCost
    { id: 'variableCostPct', label: 'Variable Cost %', type: 'input', category: 'Costs', value: inputs.variableCostPct },
    { id: 'avgAdminSalary', label: 'Admin Salary', type: 'input', category: 'Costs', value: inputs.avgAdminSalary },
    { id: 'adminSupportRatio', label: 'Admin Support Ratio', type: 'input', category: 'Costs', value: inputs.adminSupportRatio },
    { id: 'diagnosticsMargin', label: 'Diagnostics Margin %', type: 'input', category: 'Costs', value: inputs.diagnosticsMargin }
  );

  // Staffing Inputs
  nodes.push(
    // physicianLaunchMonth removed - derived as rampDuration + 1
    { id: 'directorOpsStartMonth', label: 'Director Ops Start Month', type: 'input', category: 'Staffing', value: inputs.directorOpsStartMonth },
    { id: 'eventPlannerStartMonth', label: 'Event Planner Start Month', type: 'input', category: 'Staffing', value: inputs.eventPlannerStartMonth }
  );

  // ============================================
  // CALCULATION NODES
  // ============================================

  // Physician Count Calculation
  nodes.push({
    id: 'calc_physicianCount',
    label: 'Total Physician Count',
    type: 'calculation',
    category: 'Physicians',
    formula: '(foundingToggle ? 1 : 0) + additionalPhysicians',
    codeSnippet: 'const totalPhysicians = (inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0);'
  });
  edges.push(
    { id: 'e1', source: 'foundingToggle', target: 'calc_physicianCount' },
    { id: 'e2', source: 'additionalPhysicians', target: 'calc_physicianCount' }
  );

  // Total Carryover Calculation
  nodes.push({
    id: 'calc_totalCarryover',
    label: 'Total Primary Carryover',
    type: 'calculation',
    category: 'Members',
    formula: 'physicianPrimaryCarryover + (additionalPhysicians × otherPhysiciansCarryover)',
    codeSnippet: 'const totalCarryover = inputs.physicianPrimaryCarryover + (inputs.additionalPhysicians * inputs.otherPhysiciansPrimaryCarryoverPerPhysician);'
  });
  edges.push(
    { id: 'e3', source: 'physicianPrimaryCarryover', target: 'calc_totalCarryover' },
    { id: 'e4', source: 'additionalPhysicians', target: 'calc_totalCarryover' },
    { id: 'e5', source: 'otherPhysiciansPrimaryCarryoverPerPhysician', target: 'calc_totalCarryover' }
  );

  // DERIVED: Specialty Members Month 1 (from carryover)
  nodes.push({
    id: 'calc_specialtyMembersMonth1',
    label: 'Specialty Members (Month 1)',
    type: 'calculation',
    category: 'Members',
    formula: 'specialtyInitPerPhysician + physicianSpecialtyCarryover',
    codeSnippet: 'const specialtyMembersMonth1 = inputs.specialtyInitPerPhysician + inputs.physicianSpecialtyCarryover;'
  });

  // DERIVED: Physician Launch Month (from ramp duration)
  nodes.push({
    id: 'calc_physicianLaunchMonth',
    label: 'Physician Launch Month',
    type: 'calculation',
    category: 'Staffing',
    formula: 'rampDuration + 1',
    codeSnippet: 'const physicianLaunchMonth = inputs.rampDuration + 1;'
  });

  // Member Growth Calculations
  nodes.push({
    id: 'calc_primaryMembers',
    label: 'Primary Members (Monthly)',
    type: 'calculation',
    category: 'Members',
    formula: 'Starting members + carryover + (monthly intake × months) - churn',
    codeSnippet: 'primaryMembers = startingMembers + carryover + (intakePerMonth * monthsSinceLaunch) * (1 - churnRate);'
  });
  edges.push(
    { id: 'e7', source: 'calc_totalCarryover', target: 'calc_primaryMembers' },
    { id: 'e_churn_primary', source: 'churnPrimary', target: 'calc_primaryMembers' }
  );

  nodes.push({
    id: 'calc_specialtyMembers',
    label: 'Specialty Members (Monthly)',
    type: 'calculation',
    category: 'Members',
    formula: 'Starting members + (monthly intake × months) - churn',
    codeSnippet: 'specialtyMembers = startingMembers + (intakePerMonth * monthsSinceLaunch) - (currentMembers * monthlyChurnRate);'
  });
  edges.push(
    { id: 'e9', source: 'calc_specialtyMembersMonth1', target: 'calc_specialtyMembers' },
    { id: 'e_churn1', source: 'churnPrimary', target: 'calc_specialtyMembers' }
  );

  // Revenue Calculations
  nodes.push({
    id: 'calc_primaryRevenue',
    label: 'Primary Care Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'Primary Members × Primary Price',
    codeSnippet: 'primaryRevenue = primaryMembers * inputs.primaryPrice;'
  });
  edges.push(
    { id: 'e11', source: 'calc_primaryMembers', target: 'calc_primaryRevenue' },
    { id: 'e12', source: 'primaryPrice', target: 'calc_primaryRevenue' }
  );

  nodes.push({
    id: 'calc_specialtyRevenue',
    label: 'Specialty Care Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'Specialty Members × Specialty Price',
    codeSnippet: 'specialtyRevenue = specialtyMembers * inputs.specialtyPrice;'
  });
  edges.push(
    { id: 'e13', source: 'calc_specialtyMembers', target: 'calc_specialtyRevenue' },
    { id: 'e14', source: 'specialtyPrice', target: 'calc_specialtyRevenue' }
  );

  // Corporate Members Calculation
  nodes.push({
    id: 'calc_corporateMembers',
    label: 'Corporate Members (Employees)',
    type: 'calculation',
    category: 'Members',
    formula: 'Initial clients + (monthly contracts × employees per contract)',
    codeSnippet: 'corporateEmployees = corpInitialClients + (corporateContractsMonthly * employeesPerContract * monthsSinceLaunch);'
  });
  edges.push(
    { id: 'e_corp1', source: 'corpInitialClients', target: 'calc_corporateMembers' },
    { id: 'e_corp2', source: 'corporateContractsMonthly', target: 'calc_corporateMembers' },
    { id: 'e_corp3', source: 'employeesPerContract', target: 'calc_corporateMembers' }
  );

  // Corporate Revenue Calculation
  nodes.push({
    id: 'calc_corporateRevenue',
    label: 'Corporate Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'Corporate Employees × Price per Employee',
    codeSnippet: 'corporateRevenue = corporateEmployees * corpPricePerEmployeeMonth;'
  });
  edges.push(
    { id: 'e_corp4', source: 'calc_corporateMembers', target: 'calc_corporateRevenue' },
    { id: 'e_corp5', source: 'corpPricePerEmployeeMonth', target: 'calc_corporateRevenue' }
  );

  // Individual diagnostic revenue streams
  nodes.push({
    id: 'calc_echoRevenue',
    label: 'Echo Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'Echo volume × Echo price (if active)',
    codeSnippet: 'echoRevenue = echoVolume * echoPrice;'
  });
  edges.push(
    { id: 'e_echo_price', source: 'echoPrice', target: 'calc_echoRevenue' },
    { id: 'e_echo_start', source: 'echoStartMonth', target: 'calc_echoRevenue', label: 'activation' }
  );

  nodes.push({
    id: 'calc_ctRevenue',
    label: 'CT Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'CT volume × CT price (if active)',
    codeSnippet: 'ctRevenue = ctVolume * ctPrice;'
  });
  edges.push(
    { id: 'e_ct_price', source: 'ctPrice', target: 'calc_ctRevenue' },
    { id: 'e_ct_start', source: 'ctStartMonth', target: 'calc_ctRevenue', label: 'activation' }
  );

  nodes.push({
    id: 'calc_labsRevenue',
    label: 'Labs Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'Labs volume × Labs price',
    codeSnippet: 'labsRevenue = labsVolume * labsPrice;'
  });
  edges.push(
    { id: 'e_labs_price', source: 'labTestsPrice', target: 'calc_labsRevenue' }
  );

  nodes.push({
    id: 'calc_diagnosticsRevenue',
    label: 'Total Diagnostics Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'Echo + CT + Labs revenue',
    codeSnippet: 'diagnosticsRevenue = echoRevenue + ctRevenue + labsRevenue;'
  });
  edges.push(
    { id: 'e_echo_to_diag', source: 'calc_echoRevenue', target: 'calc_diagnosticsRevenue' },
    { id: 'e_ct_to_diag', source: 'calc_ctRevenue', target: 'calc_diagnosticsRevenue' },
    { id: 'e_labs_to_diag', source: 'calc_labsRevenue', target: 'calc_diagnosticsRevenue' },
    { id: 'e18', source: 'annualDiagnosticGrowthRate', target: 'calc_diagnosticsRevenue' }
  );

  nodes.push({
    id: 'calc_totalRevenue',
    label: 'Total Monthly Revenue',
    type: 'calculation',
    category: 'Revenue',
    formula: 'Primary + Specialty + Corporate + Diagnostics',
    codeSnippet: 'totalRevenue = primaryRevenue + specialtyRevenue + corporateRevenue + diagnosticsRevenue;'
  });
  edges.push(
    { id: 'e19', source: 'calc_primaryRevenue', target: 'calc_totalRevenue' },
    { id: 'e20', source: 'calc_specialtyRevenue', target: 'calc_totalRevenue' },
    { id: 'e_corp6', source: 'calc_corporateRevenue', target: 'calc_totalRevenue' },
    { id: 'e21', source: 'calc_diagnosticsRevenue', target: 'calc_totalRevenue' }
  );

  // Cost Calculations
  nodes.push({
    id: 'calc_adminStaffCount',
    label: 'Admin Staff Count',
    type: 'calculation',
    category: 'Staffing',
    formula: 'Total Physicians × Admin Support Ratio',
    codeSnippet: 'adminStaff = totalPhysicians * inputs.adminSupportRatio;'
  });
  edges.push(
    { id: 'e22', source: 'calc_physicianCount', target: 'calc_adminStaffCount' },
    { id: 'e23', source: 'adminSupportRatio', target: 'calc_adminStaffCount' }
  );

  nodes.push({
    id: 'calc_adminSalaryCost',
    label: 'Admin Salary Costs',
    type: 'calculation',
    category: 'Costs',
    formula: 'Admin Staff Count × Avg Admin Salary / 12',
    codeSnippet: 'adminCost = adminStaff * inputs.avgAdminSalary / 12;'
  });
  edges.push(
    { id: 'e24', source: 'calc_adminStaffCount', target: 'calc_adminSalaryCost' },
    { id: 'e25', source: 'avgAdminSalary', target: 'calc_adminSalaryCost' }
  );

  nodes.push({
    id: 'calc_diagnosticsCOGS',
    label: 'Diagnostics COGS',
    type: 'calculation',
    category: 'Costs',
    formula: 'Diagnostics Revenue × (1 - Margin%)',
    codeSnippet: 'diagnosticsCOGS = diagnosticsRevenue * (1 - inputs.diagnosticsMargin / 100);'
  });
  edges.push(
    { id: 'e26', source: 'calc_diagnosticsRevenue', target: 'calc_diagnosticsCOGS' },
    { id: 'e27', source: 'diagnosticsMargin', target: 'calc_diagnosticsCOGS' }
  );

  nodes.push({
    id: 'calc_variableCosts',
    label: 'Variable Costs',
    type: 'calculation',
    category: 'Costs',
    formula: 'Total Revenue × Variable Cost %',
    codeSnippet: 'variableCosts = totalRevenue * (inputs.variableCostPct / 100);'
  });
  edges.push(
    { id: 'e28', source: 'calc_totalRevenue', target: 'calc_variableCosts' },
    { id: 'e29', source: 'variableCostPct', target: 'calc_variableCosts' }
  );

  nodes.push({
    id: 'calc_totalCosts',
    label: 'Total Monthly Costs',
    type: 'calculation',
    category: 'Costs',
    formula: 'Fixed Overhead + Equipment Lease + Variable Costs + Admin Salaries + Diagnostics COGS',
    codeSnippet: 'totalCosts = fixedOverhead + equipmentLease + variableCosts + adminSalaryCost + diagnosticsCOGS;'
  });
  edges.push(
    { id: 'e30', source: 'fixedOverheadMonthly', target: 'calc_totalCosts' },
    { id: 'e31', source: 'calc_variableCosts', target: 'calc_totalCosts' },
    { id: 'e32', source: 'calc_adminSalaryCost', target: 'calc_totalCosts' },
    { id: 'e33', source: 'calc_diagnosticsCOGS', target: 'calc_totalCosts' }
  );

  // ============================================
  // OUTPUT NODES
  // ============================================

  nodes.push({
    id: 'output_netProfit',
    label: 'Net Profit (Monthly)',
    type: 'output',
    category: 'Financial',
    formula: 'Total Revenue - Total Costs',
    codeSnippet: 'netProfit = totalRevenue - totalCosts;'
  });
  edges.push(
    { id: 'e34', source: 'calc_totalRevenue', target: 'output_netProfit' },
    { id: 'e35', source: 'calc_totalCosts', target: 'output_netProfit' }
  );

  nodes.push({
    id: 'output_cashFlow',
    label: 'Cumulative Cash Flow',
    type: 'output',
    category: 'Financial',
    formula: 'Sum of monthly net profit - initial investment',
    codeSnippet: 'cumulativeCash = previousCash + netProfit;'
  });
  edges.push(
    { id: 'e36', source: 'output_netProfit', target: 'output_cashFlow' }
  );

  nodes.push({
    id: 'output_roi',
    label: 'Physician ROI',
    type: 'output',
    category: 'Financial',
    formula: '(Annual Income / Investment) × 100',
    codeSnippet: 'roi = (annualIncome / investment) * 100;'
  });
  edges.push(
    { id: 'e37', source: 'calc_specialtyRevenue', target: 'output_roi' },
    { id: 'e38', source: 'output_netProfit', target: 'output_roi' }
  );

  return { nodes, edges };
}

/**
 * Get all nodes that depend on a given node (downstream)
 */
export function getDownstreamNodes(nodeId: string, graph: CalculationGraph): string[] {
  const downstream: Set<string> = new Set();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = graph.edges
      .filter(e => e.source === current)
      .map(e => e.target);
    
    dependents.forEach(dep => {
      if (!downstream.has(dep)) {
        downstream.add(dep);
        queue.push(dep);
      }
    });
  }

  return Array.from(downstream);
}

/**
 * Get all nodes that a given node depends on (upstream)
 */
export function getUpstreamNodes(nodeId: string, graph: CalculationGraph): string[] {
  const upstream: Set<string> = new Set();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependencies = graph.edges
      .filter(e => e.target === current)
      .map(e => e.source);
    
    dependencies.forEach(dep => {
      if (!upstream.has(dep)) {
        upstream.add(dep);
        queue.push(dep);
      }
    });
  }

  return Array.from(upstream);
}

