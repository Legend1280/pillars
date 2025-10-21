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
    const sourceValue = sourceNode.value;
    if (sourceValue === null || sourceValue === undefined) {
      invalidEdges.push({edge, reason: `Source "${sourceNode.id}" is null/undefined`});
      return false;
    }
    
    // Allow boolean false (disabled features are valid states)
    if (typeof sourceValue === 'boolean') return true;
    
    // Allow 0 for start month fields (means "not activated" which is valid)
    if (sourceNode.id.includes('StartMonth') || sourceNode.id.includes('Month')) return true;
    
    // Allow 0 for toggle/boolean-like fields
    if (sourceNode.id.includes('Toggle') || sourceNode.id.includes('Active')) return true;
    
    // For numeric fields, 0 is only invalid if it's clearly wrong (not a count/rate/percentage)
    if (typeof sourceValue === 'number' && sourceValue === 0) {
      // These can legitimately be 0
      if (sourceNode.id.includes('Rate') || sourceNode.id.includes('Pct') || 
          sourceNode.id.includes('Percentage') || sourceNode.id.includes('Count')) {
        return true;
      }
      invalidEdges.push({edge, reason: `Source "${sourceNode.id}" = 0 (likely missing data)`});
      return false; // Other numeric 0s are likely missing data
    }
    
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
      severity: month12.revenue.total > 0 ? 'success' : 'error'
    },
    {
      name: 'Profitability',
      passed: month12.profit > 0,
      message: month12.profit > 0
        ? `✓ Month 12 profit: $${month12.profit.toLocaleString()}`
        : `✗ Month 12 loss: $${Math.abs(month12.profit).toLocaleString()}`,
      severity: month12.profit > 0 ? 'success' : 'warning'
    },
    {
      name: 'Member Base Growth',
      passed: month12.members.primaryActive > launchState.primaryMembers,
      message: month12.members.primaryActive > launchState.primaryMembers
        ? `✓ Primary members grew from ${launchState.primaryMembers} to ${month12.members.primaryActive}`
        : `✗ Primary members declined from ${launchState.primaryMembers} to ${month12.members.primaryActive}`,
      severity: month12.members.primaryActive > launchState.primaryMembers ? 'success' : 'warning'
    },
    {
      name: 'Positive Cash Flow',
      passed: month12.cashFlow > 0,
      message: month12.cashFlow > 0
        ? `✓ Month 12 cash flow: $${month12.cashFlow.toLocaleString()}`
        : `✗ Month 12 cash burn: $${Math.abs(month12.cashFlow).toLocaleString()}`,
      severity: month12.cashFlow > 0 ? 'success' : 'warning'
    },
    {
      name: 'Cost Efficiency',
      passed: month12.costs.total < month12.revenue.total * 0.85,
      message: month12.costs.total < month12.revenue.total * 0.85
        ? `✓ Costs are ${((month12.costs.total / month12.revenue.total) * 100).toFixed(0)}% of revenue`
        : `✗ Costs are ${((month12.costs.total / month12.revenue.total) * 100).toFixed(0)}% of revenue (high)`,
      severity: month12.costs.total < month12.revenue.total * 0.85 ? 'success' : 'warning'
    },
    {
      name: 'Physician Configuration',
      passed: derivedVariables.totalPhysicians > 0,
      message: `✓ ${derivedVariables.totalPhysicians} physician(s) configured`,
      severity: 'success'
    }
  ];
}

