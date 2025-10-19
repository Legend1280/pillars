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
                selectedNode.type === 'input' ? 'bg-blue-100 text-blue-700' :
                selectedNode.type === 'calculation' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {selectedNode.type}
              </span>
            </CardTitle>
            <CardDescription>{selectedNode.category}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

