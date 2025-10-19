import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { buildCalculationGraph, getDownstreamNodes, getUpstreamNodes } from '@/lib/calculationGraph';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';

export function CalculationFlowVisualization() {
  const { inputs, projections } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Build the calculation graph
  const graph = useMemo(() => buildCalculationGraph(inputs), [inputs]);

  // Convert graph to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    // Return empty arrays if graph is not ready
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }
    const nodeTypeColors = {
      input: '#3b82f6',      // Blue
      calculation: '#f59e0b', // Orange
      output: '#10b981',      // Green
    };

    const categoryPositions: Record<string, { x: number, y: number }> = {
      'Physicians': { x: 100, y: 100 },
      'Members': { x: 100, y: 300 },
      'Revenue': { x: 400, y: 100 },
      'Growth': { x: 100, y: 500 },
      'Costs': { x: 400, y: 400 },
      'Staffing': { x: 700, y: 300 },
      'Financial': { x: 1000, y: 300 },
    };

    const categoryCounters: Record<string, number> = {};

    const flowNodes: Node[] = graph.nodes.map((node) => {
      const category = node.category || 'Other';
      categoryCounters[category] = (categoryCounters[category] || 0) + 1;
      const basePos = categoryPositions[category] || { x: 500, y: 500 };

      return {
        id: node.id,
        type: 'default',
        data: { 
          label: (
            <div className="text-xs">
              <div className="font-semibold">{node.label}</div>
              {node.value !== undefined && (
                <div className="text-gray-600 text-[10px]">
                  {typeof node.value === 'number' ? node.value.toLocaleString() : String(node.value)}
                </div>
              )}
            </div>
          ),
          ...node
        },
        position: {
          x: basePos.x + (categoryCounters[category] % 3) * 200,
          y: basePos.y + Math.floor(categoryCounters[category] / 3) * 100,
        },
        style: {
          background: nodeTypeColors[node.type],
          color: 'white',
          border: '2px solid #fff',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          minWidth: '150px',
        },
      };
    });

    const flowEdges: Edge[] = graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
    }));

    return { initialNodes: flowNodes, initialEdges: flowEdges };
  }, [graph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeData = graph.nodes.find(n => n.id === node.id);
    setSelectedNode(nodeData);

    // Highlight connected nodes
    const downstream = getDownstreamNodes(node.id, graph);
    const upstream = getUpstreamNodes(node.id, graph);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: n.id === node.id || downstream.includes(n.id) || upstream.includes(n.id) ? 1 : 0.3,
          border: n.id === node.id ? '3px solid #fbbf24' : n.style?.border,
        },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: {
          ...e.style,
          opacity: e.source === node.id || e.target === node.id || 
                   downstream.includes(e.target) || upstream.includes(e.source) ? 1 : 0.1,
        },
      }))
    );
  }, [graph, setNodes, setEdges]);

  // Reset highlighting
  const resetHighlight = useCallback(() => {
    setSelectedNode(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: 1,
          border: n.style?.border?.includes('3px') ? '2px solid #fff' : n.style?.border,
        },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: {
          ...e.style,
          opacity: 1,
        },
      }))
    );
  }, [setNodes, setEdges]);

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    if (!nodes || !Array.isArray(nodes)) return [];
    if (!searchTerm && filterCategory === 'all') return nodes;

    return nodes.map(node => {
      const nodeData = graph.nodes.find(n => n.id === node.id);
      const matchesSearch = !searchTerm || 
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nodeData?.label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || nodeData?.category === filterCategory;

      return {
        ...node,
        hidden: !(matchesSearch && matchesCategory),
      };
    });
  }, [nodes, searchTerm, filterCategory, graph]);

  const categories = useMemo(() => {
    if (!graph || !graph.nodes || !Array.isArray(graph.nodes)) {
      return ['all'];
    }
    const cats = new Set(graph.nodes.map(n => n.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [graph]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Flow Visualization</CardTitle>
          <CardDescription>
            Interactive graph showing how all inputs, calculations, and outputs connect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={filterCategory === cat ? 'default' : 'outline'}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Reset */}
            <Button size="sm" variant="ghost" onClick={resetHighlight}>
              Reset View
            </Button>
            
            {/* AI Analysis */}
            <Button 
              size="sm" 
              variant="default"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={async () => {
                try {
                  const response = await fetch('/api/analyze-ontology', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      nodes: graph.nodes.map(n => ({ id: n.id, type: n.type, label: n.label, data: n })),
                      edges: graph.edges.map(e => ({ source: e.from, target: e.to, label: e.label }))
                    })
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `API error: ${response.status}`);
                  }
                  
                  const analysis = await response.json();
                  console.log('AI Analysis received:', analysis);
                  
                  // Store analysis in state to display
                  setSelectedNode({ type: 'ai-analysis', data: analysis, label: 'AI Analysis Results' });
                } catch (error) {
                  console.error('AI analysis failed:', error);
                  alert('AI analysis failed. Check console for details.');
                }
              }}
            >
              🧠 Analyze with AI
            </Button>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span>Inputs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span>Calculations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>Outputs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph */}
      <div className="h-[800px] border rounded-lg bg-gray-50">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={resetHighlight}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedNode.label}</span>
              <span className={`text-sm px-3 py-1 rounded-full ${
                selectedNode.type === 'ai-analysis' ? 'bg-purple-100 text-purple-700' :
                selectedNode.type === 'input' ? 'bg-blue-100 text-blue-700' :
                selectedNode.type === 'calculation' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {selectedNode.type === 'ai-analysis' ? '🧠 AI Analysis' : selectedNode.type}
              </span>
            </CardTitle>
            <CardDescription>{selectedNode.category}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Analysis Results */}
            {selectedNode.type === 'ai-analysis' && selectedNode.data && (
              <div className="space-y-6">
                {/* Overall Health */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Overall Health Score</div>
                  <div className="text-4xl font-bold text-purple-600">{selectedNode.data.overallHealth}%</div>
                  <div className="text-sm text-gray-600 mt-1">{selectedNode.data.summary}</div>
                </div>

                {/* Structural Issues */}
                {selectedNode.data.structuralIssues && selectedNode.data.structuralIssues.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-2">Structural Issues</div>
                    <div className="space-y-2">
                      {selectedNode.data.structuralIssues.map((issue: any, i: number) => (
                        <div key={i} className={`p-3 rounded border-l-4 ${
                          issue.severity === 'critical' ? 'bg-red-50 border-red-500' :
                          issue.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}>
                          <div className="font-semibold text-sm">{issue.category}</div>
                          <div className="text-sm mt-1">{issue.issue}</div>
                          {issue.recommendation && (
                            <div className="text-xs mt-2 text-gray-600">💡 {issue.recommendation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Risks */}
                {selectedNode.data.criticalRisks && selectedNode.data.criticalRisks.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-2">🚨 Critical Risks</div>
                    <ul className="space-y-1 text-sm">
                      {selectedNode.data.criticalRisks.map((risk: string, i: number) => (
                        <li key={i} className="text-red-700">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {selectedNode.data.recommendations && selectedNode.data.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-2">💡 Top Recommendations</div>
                    <ol className="space-y-2 text-sm">
                      {selectedNode.data.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="bg-green-50 p-2 rounded">
                          <span className="font-semibold text-green-700">#{i + 1}</span> {rec}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Strengths */}
                {selectedNode.data.strengths && selectedNode.data.strengths.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-2">✨ Strengths</div>
                    <ul className="space-y-1 text-sm">
                      {selectedNode.data.strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-green-700">✓ {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedNode.value !== undefined && (
              <div>
                <div className="text-sm font-semibold text-gray-600">Current Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  {typeof selectedNode.value === 'number' 
                    ? selectedNode.value.toLocaleString() 
                    : String(selectedNode.value)}
                </div>
              </div>
            )}

            {selectedNode.formula && (
              <div>
                <div className="text-sm font-semibold text-gray-600">Formula</div>
                <div className="text-sm bg-gray-100 p-3 rounded font-mono">
                  {selectedNode.formula}
                </div>
              </div>
            )}

            {selectedNode.codeSnippet && (
              <div>
                <div className="text-sm font-semibold text-gray-600">Code</div>
                <div className="text-xs bg-gray-900 text-green-400 p-3 rounded font-mono overflow-x-auto">
                  {selectedNode.codeSnippet}
                </div>
              </div>
            )}

            {selectedNode.description && (
              <div>
                <div className="text-sm font-semibold text-gray-600">Description</div>
                <div className="text-sm text-gray-700">
                  {selectedNode.description}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm font-semibold text-gray-600">Depends On</div>
                <div className="text-sm text-gray-700">
                  {getUpstreamNodes(selectedNode.id, graph).length} nodes
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600">Affects</div>
                <div className="text-sm text-gray-700">
                  {getDownstreamNodes(selectedNode.id, graph).length} nodes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

