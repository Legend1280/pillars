/**
 * Calculation Graph Builder
 * Uses the comprehensive calculation analyzer to build the dependency graph
 */

import { DashboardInputs } from "./data";
import { buildCalculationInventory, type CalculationNode } from "./calculationAnalyzer";

export interface GraphNode {
  id: string;
  label: string;
  type: 'input' | 'derived' | 'calculation' | 'output';
  category?: string;
  formula?: string;
  value?: any;
  description?: string;
  codeSnippet?: string;
  layer?: number;
  complexity?: number;
  impact?: string;
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
 * Build the complete calculation dependency graph using the analyzer
 */
export function buildCalculationGraph(inputs: DashboardInputs): CalculationGraph {
  // Safety check: return empty graph if inputs are not ready
  if (!inputs || typeof inputs !== 'object') {
    return { nodes: [], edges: [] };
  }

  // Get the complete inventory from the analyzer
  const inventory = buildCalculationInventory();

  // Convert CalculationNodes to GraphNodes and add current values
  const nodes: GraphNode[] = inventory.nodes.map((node: CalculationNode) => ({
    id: node.id,
    label: node.label,
    type: node.type === 'derived' ? 'calculation' : node.type, // Map 'derived' to 'calculation' for visualization
    category: node.category,
    formula: node.formula,
    value: (inputs as any)[node.id], // Get current value from inputs
    description: node.description,
    codeSnippet: node.code,
    layer: node.layer,
    complexity: node.metadata.complexity,
    impact: node.metadata.impact
  }));

  // Convert edges from the inventory
  const edges: GraphEdge[] = inventory.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.label
  }));

  return {
    nodes,
    edges
  };
}

/**
 * Get statistics about the graph
 */
export function getGraphStats(graph: CalculationGraph) {
  const inputNodes = graph.nodes.filter(n => n.type === 'input');
  const calcNodes = graph.nodes.filter(n => n.type === 'calculation');
  const outputNodes = graph.nodes.filter(n => n.type === 'output');

  return {
    totalNodes: graph.nodes.length,
    totalEdges: graph.edges.length,
    inputNodes: inputNodes.length,
    calculationNodes: calcNodes.length,
    outputNodes: outputNodes.length,
    avgComplexity: graph.nodes.reduce((sum, n) => sum + (n.complexity || 0), 0) / graph.nodes.length,
    maxComplexity: Math.max(...graph.nodes.map(n => n.complexity || 0))
  };
}

/**
 * Get all nodes that depend on a given node (downstream)
 */
export function getDownstreamNodes(graph: CalculationGraph, nodeId: string): string[] {
  const visited = new Set<string>();
  const downstream: string[] = [];

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const dependentEdges = graph.edges.filter(e => e.source === id);
    dependentEdges.forEach(edge => {
      downstream.push(edge.target);
      traverse(edge.target);
    });
  }

  traverse(nodeId);
  return downstream;
}

/**
 * Get all nodes that a given node depends on (upstream)
 */
export function getUpstreamNodes(graph: CalculationGraph, nodeId: string): string[] {
  const visited = new Set<string>();
  const upstream: string[] = [];

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const dependencyEdges = graph.edges.filter(e => e.target === id);
    dependencyEdges.forEach(edge => {
      upstream.push(edge.source);
      traverse(edge.source);
    });
  }

  traverse(nodeId);
  return upstream;
}

