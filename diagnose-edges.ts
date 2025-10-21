import { calculationGraph } from './client/src/lib/calculationGraph';
import { defaultInputs } from './client/src/lib/defaults';

// Build nodes from inputs
const nodes = calculationGraph.nodes.map(node => {
  const value = (defaultInputs as any)[node.id];
  return {
    ...node,
    value: value !== undefined ? value : null
  };
});

const graph = {
  nodes,
  edges: calculationGraph.edges
};

// Validate edges
const invalidEdges: Array<{edge: any, reason: string}> = [];

graph.edges.forEach(edge => {
  const sourceNode = graph.nodes.find(n => n.id === edge.source);
  const targetNode = graph.nodes.find(n => n.id === edge.target);
  
  if (!sourceNode || !targetNode) {
    invalidEdges.push({
      edge, 
      reason: !sourceNode ? `Missing source node: ${edge.source}` : `Missing target node: ${edge.target}`
    });
    return;
  }
  
  // Check if source has a valid value
  const sourceValue = sourceNode.value;
  if (sourceValue === null || sourceValue === undefined) {
    invalidEdges.push({edge, reason: `Source "${sourceNode.id}" is null/undefined`});
    return;
  }
  
  // Allow boolean false (disabled features are valid states)
  if (typeof sourceValue === 'boolean') return;
  
  // Allow 0 for start month fields (means "not activated" which is valid)
  if (sourceNode.id.includes('StartMonth') || sourceNode.id.includes('Month')) return;
  
  // Allow 0 for toggle/boolean-like fields
  if (sourceNode.id.includes('Toggle') || sourceNode.id.includes('Active')) return;
  
  // For numeric fields, 0 is only invalid if it's clearly wrong (not a count/rate/percentage)
  if (typeof sourceValue === 'number' && sourceValue === 0) {
    // These can legitimately be 0
    if (sourceNode.id.includes('Rate') || sourceNode.id.includes('Pct') || 
        sourceNode.id.includes('Percentage') || sourceNode.id.includes('Count')) {
      return;
    }
    invalidEdges.push({edge, reason: `Source "${sourceNode.id}" = 0 (likely missing data)`});
    return;
  }
});

console.log(`\n=== EDGE INTEGRITY DIAGNOSTIC ===`);
console.log(`Total edges: ${graph.edges.length}`);
console.log(`Valid edges: ${graph.edges.length - invalidEdges.length}`);
console.log(`Invalid edges: ${invalidEdges.length}`);
console.log(`Integrity: ${((graph.edges.length - invalidEdges.length) / graph.edges.length * 100).toFixed(1)}%\n`);

if (invalidEdges.length > 0) {
  console.log(`\n=== INVALID EDGES (${invalidEdges.length} total) ===\n`);
  
  // Group by reason
  const byReason = invalidEdges.reduce((acc, {edge, reason}) => {
    if (!acc[reason]) acc[reason] = [];
    acc[reason].push(edge);
    return acc;
  }, {} as Record<string, any[]>);
  
  Object.entries(byReason).forEach(([reason, edges]) => {
    console.log(`\n${reason} (${edges.length} edges):`);
    edges.forEach(edge => {
      console.log(`  - ${edge.source} → ${edge.target}`);
    });
  });
}

