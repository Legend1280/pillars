import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { buildEnhancedCalculationGraph } from '@/lib/calculationGraphEnhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Shuffle, RefreshCw } from 'lucide-react';

export function RandomCalculationValidator() {
  const { inputs } = useDashboard();
  const [randomSeed, setRandomSeed] = useState(0);

  // Build the calculation graph with current inputs
  const graph = useMemo(() => buildEnhancedCalculationGraph(inputs), [inputs]);

  // Get all computed nodes (derived, calculation, output)
  const computedNodes = useMemo(() => {
    return graph.nodes.filter(n => 
      n.type === 'derived' || n.type === 'calculation' || n.type === 'output'
    );
  }, [graph]);

  // Randomly select 6 nodes
  const selectedNodes = useMemo(() => {
    // Use randomSeed to ensure we get different selections on each click
    const shuffled = [...computedNodes].sort(() => {
      // Use randomSeed in the sort to make it deterministic but different each time
      return Math.sin(randomSeed * 9999) - 0.5;
    });
    return shuffled.slice(0, 6);
  }, [computedNodes, randomSeed]);

  const randomize = () => {
    setRandomSeed(Math.random());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Random Calculation Validator
            </CardTitle>
            <CardDescription>
              Randomly test 6 calculations from the model with live input values
            </CardDescription>
          </div>
          <Button onClick={randomize} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Randomize
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedNodes.map((node, idx) => (
            <div key={`${node.id}-${randomSeed}`} className="border rounded-lg p-4 bg-gray-50">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-lg">{node.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {node.category} • {node.type}
                  </div>
                </div>
                <Badge 
                  variant={
                    node.type === 'output' ? 'default' :
                    node.type === 'calculation' ? 'secondary' :
                    'outline'
                  }
                >
                  {node.type}
                </Badge>
              </div>

              {/* Current Value */}
              {node.value !== undefined && (
                <div className="mb-3 p-3 bg-white rounded border">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Current Value</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof node.value === 'number' 
                      ? node.value.toLocaleString(undefined, { 
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2 
                        })
                      : String(node.value)
                    }
                    {node.metadata?.unit && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        {node.metadata.unit === 'dollars' && '$'}
                        {node.metadata.unit === 'percentage' && '%'}
                        {node.metadata.unit === 'count' && ' people'}
                        {node.metadata.unit === 'months' && ' months'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Formula */}
              {node.formula && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Formula</div>
                  <div className="text-sm font-mono bg-white p-2 rounded border">
                    {node.formula}
                  </div>
                </div>
              )}

              {/* Code Snippet */}
              {node.codeSnippet && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Code</div>
                  <div className="text-xs font-mono bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                    {node.codeSnippet}
                  </div>
                </div>
              )}

              {/* Description */}
              {node.description && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Description</div>
                  <div className="text-sm text-gray-700">
                    {node.description}
                  </div>
                </div>
              )}

              {/* Metadata Grid */}
              {node.metadata && (
                <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t">
                  {node.metadata.unit && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Unit</div>
                      <div className="text-gray-900 capitalize">{node.metadata.unit}</div>
                    </div>
                  )}
                  
                  {node.metadata.section !== undefined && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Section</div>
                      <div className="text-gray-900">Section {node.metadata.section}</div>
                    </div>
                  )}
                  
                  {node.metadata.layer !== undefined && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Layer</div>
                      <div className="text-gray-900">
                        Layer {node.metadata.layer} 
                        {node.metadata.layer === 0 ? ' (Input)' : 
                         node.metadata.layer === 1 ? ' (Derived)' : 
                         node.metadata.layer === 2 ? ' (Calc)' : 
                         ' (Output)'}
                      </div>
                    </div>
                  )}
                  
                  {node.metadata.businessLogic && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Business Logic</div>
                      <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        {node.metadata.businessLogic}
                      </div>
                    </div>
                  )}
                  
                  {node.metadata.expectedRange && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-500">Expected Range</div>
                      <div className="text-sm text-gray-900">
                        {node.metadata.expectedRange.min.toLocaleString()} - {node.metadata.expectedRange.max.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
            <div>
              Showing 6 of {computedNodes.length} total computed nodes
            </div>
            <div>
              Click "Randomize" to test different calculations
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

