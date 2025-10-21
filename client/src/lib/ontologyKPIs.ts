/**
 * Ontology-Based KPI Calculator
 * 
 * Calculates health metrics based on the actual ontological data model
 * instead of arbitrary "drift" from hardcoded defaults.
 */

import { DashboardInputs } from './data';
import { buildEnhancedCalculationGraph } from './calculationGraphEnhanced';

export interface OntologyKPIs {
  nodeCoverage: {
    total: number;
    filled: number;
    percentage: number;
  };
  categoryHealth: Array<{
    category: string;
    total: number;
    filled: number;
    percentage: number;
    isCalculated: boolean;
  }>;
  edgeIntegrity: {
    total: number;
    valid: number;
    percentage: number;
    invalidEdges?: Array<{edge: any, reason: string}>;
  };
  calculationCompleteness: {
    requiredInputs: number;
    providedInputs: number;
    percentage: number;
  };
}

/**
 * Calculate ontology-based KPIs from the current inputs
 */
export function calculateOntologyKPIs(inputs: DashboardInputs): OntologyKPIs {
  const graph = buildEnhancedCalculationGraph(inputs);
  
  // 1. Node Coverage - how many nodes have valid (non-zero, non-null) values
  const inputNodes = graph.nodes.filter(n => n.type === 'input');
  const filledNodes = inputNodes.filter(n => {
    const value = n.value;
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return value !== 0 || n.id.includes('Month'); // Allow 0 for month fields
    if (typeof value === 'boolean') return true; // Booleans are always "filled"
    return true;
  });
  
  const nodeCoverage = {
    total: inputNodes.length,
    filled: filledNodes.length,
    percentage: (filledNodes.length / inputNodes.length) * 100
  };
  
  // 2. Category Health - breakdown by ontology category (both input and calculated)
  const categories = new Set(graph.nodes.map(n => n.category));
  const categoryHealth = Array.from(categories).map(category => {
    const allCategoryNodes = graph.nodes.filter(n => n.category === category);
    const categoryInputNodes = inputNodes.filter(n => n.category === category);
    const isCalculated = categoryInputNodes.length === 0; // No input nodes = calculated category
    
    if (isCalculated) {
      // For calculated categories, check if dependencies are satisfied
      const calculatedNodes = allCategoryNodes.filter(n => n.type === 'calculated' || n.type === 'output');
      const validCalculatedNodes = calculatedNodes.filter(n => {
        // A calculated node is "valid" if it has a non-null value
        return n.value !== null && n.value !== undefined;
      });
      
      return {
        category,
        total: calculatedNodes.length,
        filled: validCalculatedNodes.length,
        percentage: calculatedNodes.length > 0 ? (validCalculatedNodes.length / calculatedNodes.length) * 100 : 100,
        isCalculated: true
      };
    } else {
      // For input categories, check if values are provided
      const filledCategoryNodes = categoryInputNodes.filter(n => {
        const value = n.value;
        if (value === null || value === undefined) return false;
        if (typeof value === 'number') return value !== 0 || n.id.includes('Month');
        if (typeof value === 'boolean') return true;
        return true;
      });
      
      return {
        category,
        total: categoryInputNodes.length,
        filled: filledCategoryNodes.length,
        percentage: categoryInputNodes.length > 0 ? (filledCategoryNodes.length / categoryInputNodes.length) * 100 : 0,
        isCalculated: false
      };
    }
  }).sort((a, b) => {
    // Sort: calculated categories last, then by percentage
    if (a.isCalculated !== b.isCalculated) return a.isCalculated ? 1 : -1;
    return b.percentage - a.percentage;
  });
  
  // 3. Edge Integrity - are all dependencies satisfied?
  const invalidEdges: Array<{edge: any, reason: string}> = [];
  const validEdges = graph.edges.filter(edge => {
    const sourceNode = graph.nodes.find(n => n.id === edge.source);
    const targetNode = graph.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) {
      invalidEdges.push({edge, reason: 'Missing source or target node'});
      return false;
    }
    
    // Check if source has a valid value
    // An edge is ONLY invalid if:
    // 1. Source value is null or undefined (truly missing data)
    // 2. That's it! All other values (including 0, false, empty string) are valid
    const sourceValue = sourceNode.value;
    if (sourceValue === null || sourceValue === undefined) {
      invalidEdges.push({edge, reason: `Source "${sourceNode.id}" is null/undefined (missing data)`});
      return false;
    }
    
    // All other values are valid:
    // - 0 is valid (might mean "none", "disabled", or "not applicable")
    // - false is valid (feature disabled)
    // - Empty string is valid (optional field not filled)
    // The semantic meaning of the value is determined by business logic, not edge validation
    
    return true;
  });
  
  // Log invalid edges for debugging
  if (invalidEdges.length > 0) {
    console.log('Invalid edges:', invalidEdges.slice(0, 10)); // Show first 10
  }
  
  const edgeIntegrity = {
    total: graph.edges.length,
    valid: validEdges.length,
    percentage: (validEdges.length / graph.edges.length) * 100,
    invalidEdges: invalidEdges // Include for debugging
  };
  
  // 4. Calculation Completeness - are required inputs provided?
  // Define critical inputs needed for core calculations
  const requiredInputKeys = [
    'specialtyInitPerPhysician',
    'primaryPrice',
    'specialtyPrice',
    'founderChiefStrategistSalary',
    'fixedOverheadMonthly',
    'rampDuration'
  ];
  
  const providedInputs = requiredInputKeys.filter(key => {
    const value = (inputs as any)[key];
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return value !== 0 || key.includes('Month');
    return true;
  });
  
  const calculationCompleteness = {
    requiredInputs: requiredInputKeys.length,
    providedInputs: providedInputs.length,
    percentage: (providedInputs.length / requiredInputKeys.length) * 100
  };
  
  return {
    nodeCoverage,
    categoryHealth,
    edgeIntegrity,
    calculationCompleteness
  };
}

/**
 * Get validation checks based on actual data model
 * Enhanced with detailed audit trail for formula verification
 */
export function getOntologyValidations(inputs: DashboardInputs, projections: any, derivedVariables: any) {
  const month12 = projections.projection?.[11];
  const launchState = projections.launchState;
  
  if (!month12 || !launchState) {
    return [];
  }
  
  return [
    {
      name: 'Revenue Generation',
      passed: month12.revenue.total > 0,
      message: month12.revenue.total > 0 
        ? `✓ Month 12 revenue: $${month12.revenue.total.toLocaleString()}`
        : '✗ Month 12 revenue is zero',
      severity: month12.revenue.total > 0 ? 'success' : 'error',
      // Enhanced audit information
      formula: 'Total Revenue = Primary Revenue + Specialty Revenue + Corporate Revenue + Diagnostics Revenue',
      breakdown: {
        'Primary Revenue': `$${month12.revenue.primary?.toLocaleString() || '0'}`,
        'Specialty Revenue': `$${month12.revenue.specialty?.toLocaleString() || '0'}`,
        'Corporate Revenue': `$${month12.revenue.corporate?.toLocaleString() || '0'}`,
        'Diagnostics Revenue': `$${month12.revenue.diagnostics?.toLocaleString() || '0'}`,
        'Total': `$${month12.revenue.total.toLocaleString()}`
      },
      inputs: {
        'Primary Price': `$${inputs.primaryPrice}`,
        'Specialty Price': `$${inputs.specialtyPrice}`,
        'Corporate Price': `$${inputs.corpPricePerEmployeeMonth}/employee/month`,
        'Primary Members (M12)': month12.members?.primaryActive || 0,
        'Specialty Members (M12)': month12.members?.specialtyActive || 0
      },
      calculation: `Primary: ${month12.members?.primaryActive || 0} members × $${inputs.primaryPrice} = $${month12.revenue.primary?.toLocaleString() || '0'}\n` +
                   `Specialty: ${month12.members?.specialtyActive || 0} members × $${inputs.specialtyPrice} = $${month12.revenue.specialty?.toLocaleString() || '0'}\n` +
                   `Corporate + Diagnostics = $${((month12.revenue.corporate || 0) + (month12.revenue.diagnostics || 0)).toLocaleString()}`,
      expectedRange: '> $0 (must generate revenue)',
      dataSource: 'projections.projection[11].revenue'
    },
    {
      name: 'Profitability',
      passed: month12.profit > 0,
      message: month12.profit > 0
        ? `✓ Month 12 profit: $${month12.profit.toLocaleString()}`
        : `✗ Month 12 loss: $${Math.abs(month12.profit).toLocaleString()}`,
      severity: month12.profit > 0 ? 'success' : 'warning',
      formula: 'Net Profit = Total Revenue - Total Costs',
      breakdown: {
        'Total Revenue': `$${month12.revenue.total.toLocaleString()}`,
        'Total Costs': `$${month12.costs.total.toLocaleString()}`,
        'Net Profit': `$${month12.profit.toLocaleString()}`
      },
      inputs: {
        'Fixed Overhead': `$${inputs.fixedOverheadMonthly}/month`,
        'Variable Cost %': `${inputs.variableCostPct}%`,
        'Marketing Budget': `$${inputs.marketingBudgetMonthly}/month`
      },
      calculation: `Revenue: $${month12.revenue.total.toLocaleString()}\n` +
                   `- Costs: $${month12.costs.total.toLocaleString()}\n` +
                   `= Profit: $${month12.profit.toLocaleString()}\n` +
                   `Margin: ${((month12.profit / month12.revenue.total) * 100).toFixed(1)}%`,
      expectedRange: '> $0 (profitable by month 12)',
      dataSource: 'projections.projection[11].profit'
    },
    {
      name: 'Member Base Growth',
      passed: month12.members.primaryActive > launchState.primaryMembers,
      message: month12.members.primaryActive > launchState.primaryMembers
        ? `✓ Primary members grew from ${launchState.primaryMembers} to ${month12.members.primaryActive}`
        : `✗ Primary members declined from ${launchState.primaryMembers} to ${month12.members.primaryActive}`,
      severity: month12.members.primaryActive > launchState.primaryMembers ? 'success' : 'warning',
      formula: 'Growth = (Month 12 Members - Launch Members) / Launch Members × 100%',
      breakdown: {
        'Launch Members': launchState.primaryMembers,
        'Month 12 Members': month12.members.primaryActive,
        'Net Growth': month12.members.primaryActive - launchState.primaryMembers,
        'Growth %': `${(((month12.members.primaryActive - launchState.primaryMembers) / launchState.primaryMembers) * 100).toFixed(1)}%`
      },
      inputs: {
        'DexaFit Intake': `${inputs.dexafitPrimaryIntakeMonthly} members/month`,
        'Churn Rate': `${inputs.churnPrimary}% annually`,
        'Physician Carryover': inputs.physicianPrimaryCarryover
      },
      calculation: `Launch: ${launchState.primaryMembers} members\n` +
                   `Monthly Intake: ${inputs.dexafitPrimaryIntakeMonthly} new members\n` +
                   `Monthly Churn: ~${(inputs.churnPrimary / 12).toFixed(1)}%\n` +
                   `Month 12: ${month12.members.primaryActive} members\n` +
                   `Growth: ${month12.members.primaryActive - launchState.primaryMembers} members (${(((month12.members.primaryActive - launchState.primaryMembers) / launchState.primaryMembers) * 100).toFixed(1)}%)`,
      expectedRange: '> Launch Members (positive growth)',
      dataSource: 'projections.projection[11].members.primaryActive vs projections.launchState.primaryMembers'
    },
    {
      name: 'Positive Cash Flow',
      passed: month12.cashFlow > 0,
      message: month12.cashFlow > 0
        ? `✓ Month 12 cash flow: $${month12.cashFlow.toLocaleString()}`
        : `✗ Month 12 cash burn: $${Math.abs(month12.cashFlow).toLocaleString()}`,
      severity: month12.cashFlow > 0 ? 'success' : 'warning',
      formula: 'Cash Flow = Revenue - Costs (operating cash flow for the month)',
      breakdown: {
        'Revenue': `$${month12.revenue.total.toLocaleString()}`,
        'Costs': `$${month12.costs.total.toLocaleString()}`,
        'Cash Flow': `$${month12.cashFlow.toLocaleString()}`
      },
      inputs: {
        'Revenue Drivers': 'Member counts × Pricing',
        'Cost Drivers': 'Fixed + Variable + Salaries'
      },
      calculation: `Revenue: $${month12.revenue.total.toLocaleString()}\n` +
                   `- Operating Costs: $${month12.costs.total.toLocaleString()}\n` +
                   `= Cash Flow: $${month12.cashFlow.toLocaleString()}\n` +
                   `${month12.cashFlow > 0 ? 'Positive (generating cash)' : 'Negative (burning cash)'}`,
      expectedRange: '> $0 (cash positive by month 12)',
      dataSource: 'projections.projection[11].cashFlow'
    },
    {
      name: 'Cost Efficiency',
      passed: month12.costs.total < month12.revenue.total * 0.85,
      message: month12.costs.total < month12.revenue.total * 0.85
        ? `✓ Costs are ${((month12.costs.total / month12.revenue.total) * 100).toFixed(0)}% of revenue`
        : `✗ Costs are ${((month12.costs.total / month12.revenue.total) * 100).toFixed(0)}% of revenue (high)`,
      severity: month12.costs.total < month12.revenue.total * 0.85 ? 'success' : 'warning',
      formula: 'Cost Ratio = (Total Costs / Total Revenue) × 100%',
      breakdown: {
        'Total Costs': `$${month12.costs.total.toLocaleString()}`,
        'Total Revenue': `$${month12.revenue.total.toLocaleString()}`,
        'Cost Ratio': `${((month12.costs.total / month12.revenue.total) * 100).toFixed(1)}%`,
        'Target': '< 85%'
      },
      inputs: {
        'Fixed Overhead': `$${inputs.fixedOverheadMonthly}/month`,
        'Variable Cost %': `${inputs.variableCostPct}%`,
        'Marketing': `$${inputs.marketingBudgetMonthly}/month`
      },
      calculation: `Costs: $${month12.costs.total.toLocaleString()}\n` +
                   `÷ Revenue: $${month12.revenue.total.toLocaleString()}\n` +
                   `= ${((month12.costs.total / month12.revenue.total) * 100).toFixed(1)}%\n` +
                   `Target: < 85% (efficient operation)\n` +
                   `${month12.costs.total < month12.revenue.total * 0.85 ? '✓ Within target' : '✗ Above target'}`,
      expectedRange: '< 85% of revenue (efficient operation)',
      dataSource: 'projections.projection[11].costs.total / projections.projection[11].revenue.total'
    },
    {
      name: 'Physician Configuration',
      passed: derivedVariables.totalPhysicians > 0,
      message: `✓ ${derivedVariables.totalPhysicians} physician(s) configured`,
      severity: 'success',
      formula: 'Total Physicians = Founding Physicians + Additional Physicians',
      breakdown: {
        'Founding Physicians': inputs.foundingToggle ? 1 : 0,
        'Additional Physicians': inputs.additionalPhysicians,
        'Total': derivedVariables.totalPhysicians
      },
      inputs: {
        'Founding Toggle': inputs.foundingToggle ? 'ON' : 'OFF',
        'Additional Physicians': inputs.additionalPhysicians
      },
      calculation: `Founding: ${inputs.foundingToggle ? 1 : 0}\n` +
                   `+ Additional: ${inputs.additionalPhysicians}\n` +
                   `= Total: ${derivedVariables.totalPhysicians} physician(s)`,
      expectedRange: '> 0 (at least one physician required)',
      dataSource: 'derivedVariables.totalPhysicians'
    }
  ];
}


