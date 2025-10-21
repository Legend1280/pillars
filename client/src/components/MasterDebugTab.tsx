import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CalculationFlowVisualization } from "./CalculationFlowVisualization";
import { AIAnalyzerTab } from "./AIAnalyzerTab";
import { Network, AlertTriangle, CheckCircle2, TrendingUp, Database, Brain, GitBranch, Layers, ChevronDown, ChevronRight, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateOntologyKPIs, getOntologyValidations } from "@/lib/ontologyKPIs";
import { buildEnhancedCalculationGraph } from "@/lib/calculationGraphEnhanced";

export function MasterDebugTab() {
  const { inputs, projections, derivedVariables } = useDashboard();
  const [expandedValidations, setExpandedValidations] = useState<Set<number>>(new Set());
  const [randomSeed, setRandomSeed] = useState(0);
  
  const toggleValidation = (idx: number) => {
    setExpandedValidations(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Loading state
  if (!inputs || !projections) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Network className="h-12 w-12 mx-auto mb-4 text-teal-600 animate-pulse" />
          <div className="text-lg font-semibold">Loading Debug Dashboard...</div>
          <div className="text-sm text-gray-600 mt-2">Preparing ontological analysis</div>
        </div>
      </div>
    );
  }

  // Calculate ontology-based KPIs
  const ontologyKPIs = useMemo(() => calculateOntologyKPIs(inputs), [inputs]);
  
  // Build calculation graph for random validation
  const graph = useMemo(() => buildEnhancedCalculationGraph(inputs), [inputs]);
  
  // Get all computed nodes for random validation
  const computedNodes = useMemo(() => {
    return graph.nodes.filter(n => 
      n.type === 'derived' || n.type === 'calculation' || n.type === 'output'
    );
  }, [graph]);
  
  // Randomly select 6 nodes for validation
  const randomCalculations = useMemo(() => {
    const shuffled = [...computedNodes].sort(() => {
      return Math.sin(randomSeed * 9999) - 0.5;
    });
    return shuffled.slice(0, 6);
  }, [computedNodes, randomSeed]);
  
  // Get validation checks (keep for other tabs)
  const validations = useMemo(() => 
    getOntologyValidations(inputs, projections, derivedVariables),
    [inputs, projections, derivedVariables]
  );

  const passedValidations = validations.filter(v => v.passed).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900">Ontological Validation Engine</h2>
        <p className="text-base text-gray-700 mt-3 leading-relaxed">
          This dashboard validates your financial model through a comprehensive <strong>ontology</strong> — a structured knowledge graph of 114 interconnected nodes representing every input, calculation, and output in your business model.
        </p>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          Our validation engine continuously monitors <strong>node coverage</strong> (data completeness), <strong>edge integrity</strong> (dependency accuracy), and <strong>calculation consistency</strong> across all 8 sections of your model. Each assumption is traced through its dependencies, ensuring mathematical correctness and business logic alignment.
        </p>
        <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-600 font-semibold text-sm">How It Works:</div>
          <div className="text-xs text-blue-800 leading-relaxed">
            Every input you change triggers validation across the entire ontology. The engine checks that derived values compute correctly, dependencies remain valid, and outputs stay within expected ranges. Use the tabs below to inspect node health, validate random calculations, visualize the dependency graph, and export complete data snapshots.
          </div>
        </div>
      </div>

      {/* Quick Stats - Ontology-Based KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Node Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              ontologyKPIs.nodeCoverage.percentage >= 80 ? 'text-green-600' :
              ontologyKPIs.nodeCoverage.percentage >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {ontologyKPIs.nodeCoverage.percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {ontologyKPIs.nodeCoverage.filled} of {ontologyKPIs.nodeCoverage.total} input nodes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Edge Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              ontologyKPIs.edgeIntegrity.percentage >= 80 ? 'text-green-600' :
              ontologyKPIs.edgeIntegrity.percentage >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {ontologyKPIs.edgeIntegrity.percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {ontologyKPIs.edgeIntegrity.valid} of {ontologyKPIs.edgeIntegrity.total} dependencies valid
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              passedValidations === validations.length ? 'text-green-600' :
              passedValidations >= validations.length * 0.7 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {passedValidations}/{validations.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Checks passed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Dependencies Valid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              ontologyKPIs.edgeIntegrity.percentage >= 80 ? 'text-green-600' :
              ontologyKPIs.edgeIntegrity.percentage >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {ontologyKPIs.edgeIntegrity.valid}/{ontologyKPIs.edgeIntegrity.total}
            </div>
            <div className="text-xs text-gray-500 mt-1">Calculation dependencies</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Ontology</span>
          </TabsTrigger>
          <TabsTrigger value="category-health" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="edge-integrity" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Edges</span>
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Validation</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">All Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Ontological Visualization Tab */}
        <TabsContent value="visualization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calculation Flow Ontology</CardTitle>
              <CardDescription>
                Interactive network graph showing how inputs flow through calculations to produce outputs.
                Click nodes to explore dependencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalculationFlowVisualization />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Health Tab */}
        <TabsContent value="category-health" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Category Health
              </CardTitle>
              <CardDescription>
                Ontology node coverage by category - input categories show data completeness, calculated categories show computation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ontologyKPIs.categoryHealth.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        {category.category}
                        {category.isCalculated && (
                          <Badge variant="secondary" className="text-xs">Calculated</Badge>
                        )}
                      </span>
                      <span className="text-gray-600">
                        {category.filled}/{category.total} nodes ({category.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          category.isCalculated ? 'bg-blue-600' :
                          category.percentage >= 80 ? 'bg-green-600' :
                          category.percentage >= 60 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edge Integrity Tab */}
        <TabsContent value="edge-integrity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Edge Integrity Analysis</CardTitle>
              <CardDescription>
                {ontologyKPIs.edgeIntegrity.valid} of {ontologyKPIs.edgeIntegrity.total} dependency edges are valid ({ontologyKPIs.edgeIntegrity.percentage.toFixed(1)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ontologyKPIs.edgeIntegrity.invalidEdges && ontologyKPIs.edgeIntegrity.invalidEdges.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-yellow-900">Found {ontologyKPIs.edgeIntegrity.invalidEdges.length} Invalid Edges</div>
                        <div className="text-sm text-yellow-800 mt-1">
                          These dependency edges have missing or invalid source nodes. Fix these to improve edge integrity.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ontologyKPIs.edgeIntegrity.invalidEdges.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-mono text-sm text-red-900">
                              {item.edge.source} → {item.edge.target}
                            </div>
                            <div className="text-xs text-red-700 mt-1">
                              {item.reason}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="text-green-900 font-semibold">All edges are valid!</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="mt-6">
          <AIAnalyzerTab />
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Random Calculation Validator</CardTitle>
                  <CardDescription>
                    Randomly tests 6 calculations from the ontology (114 total nodes) with live input values. Click randomize to validate different parts of the system.
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setRandomSeed(Math.random())} 
                  variant="outline" 
                  className="gap-2 flex-shrink-0"
                >
                  <Shuffle className="h-4 w-4" />
                  Randomize
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {randomCalculations.map((node, idx) => {
                  const isExpanded = expandedValidations.has(idx);
                  return (
                    <div key={`${node.id}-${randomSeed}`} className="border rounded-lg overflow-hidden bg-gray-50">
                      {/* Header - Always Visible */}
                      <div 
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors bg-white"
                        onClick={() => toggleValidation(idx)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-base">{node.label}</div>
                            <Badge variant={
                              node.type === 'output' ? 'default' :
                              node.type === 'calculation' ? 'secondary' :
                              'outline'
                            }>
                              {node.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {node.category} • {node.description}
                          </div>
                          {node.value !== undefined && !isExpanded && (
                            <div className="text-sm font-mono text-gray-900 mt-2">
                              Value: {typeof node.value === 'number' 
                                ? node.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                : String(node.value)
                              }
                              {node.metadata?.unit && (
                                <span className="text-gray-600 ml-1">
                                  {node.metadata.unit === 'dollars' && '$'}
                                  {node.metadata.unit === 'percentage' && '%'}
                                  {node.metadata.unit === 'count' && ' people'}
                                  {node.metadata.unit === 'months' && ' months'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0 space-y-3 bg-gray-50 border-t">
                          {/* Current Value */}
                          {node.value !== undefined && (
                            <div className="p-3 bg-white rounded border">
                              <div className="text-xs font-semibold text-gray-600 mb-1">Current Value</div>
                              <div className="text-2xl font-bold text-gray-900">
                                {typeof node.value === 'number' 
                                  ? node.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                  : String(node.value)
                                }
                                {node.metadata?.unit && (
                                  <span className="text-sm font-normal text-gray-600 ml-2">
                                    {node.metadata.unit === 'dollars' && 'dollars'}
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
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Formula</div>
                              <div className="text-sm font-mono bg-white p-2 rounded border">
                                {node.formula}
                              </div>
                            </div>
                          )}

                          {/* Code Snippet */}
                          {node.codeSnippet && (
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Code</div>
                              <div className="text-xs font-mono bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                                {node.codeSnippet}
                              </div>
                            </div>
                          )}

                          {/* Metadata Grid */}
                          {node.metadata && (
                            <div className="grid grid-cols-2 gap-3 text-sm">
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
                      )}
                    </div>
                  );
                })}

                {/* Stats Footer */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                  <div>
                    Showing 6 of {computedNodes.length} total computed nodes from the ontology
                  </div>
                  <div className="text-xs text-gray-500">
                    Click any calculation to see full details
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Data Tab */}
        <TabsContent value="data" className="mt-6">
          <div className="space-y-6">
            {/* Derived Variables Section - At Top */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Derived Variables (Calculated)</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Physician Metrics */}
                <Card className="border-2 bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Physician Metrics (Calculated)</CardTitle>
                    <CardDescription className="text-xs">Auto-calculated from inputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Total Physicians</span>
                          <span className="text-sm font-bold text-teal-600">
                            {derivedVariables.totalPhysicians}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= Founding + Additional</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">My MSO Fee</span>
                          <span className="text-sm font-bold text-teal-600">
                            {derivedVariables.msoFee}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= Founding: 37%, Additional: 40%</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">My Equity Share</span>
                          <span className="text-sm font-bold text-teal-600">
                            {derivedVariables.equityShare}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= Founding: 10%, Additional: 5%</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">My Capital Contribution</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.myCapitalContribution?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= Founding: $600k, Additional: $750k</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Total Capital Raised</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.capitalRaised?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= (Founding × $600k) + (Additional × $750k)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Retention Metrics */}
                <Card className="border-2 bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Retention Metrics (Calculated)</CardTitle>
                    <CardDescription className="text-xs">Auto-calculated from inputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Member Retention Rate</span>
                          <span className="text-sm font-bold text-teal-600">
                            {derivedVariables.retentionRate}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= 100% - Churn Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Metrics */}
                <Card className="border-2 bg-red-50 border-red-200 lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Cost Metrics (Calculated)</CardTitle>
                    <CardDescription className="text-xs">Auto-calculated from inputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Ramp Startup Costs</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.startupTotal?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= Total startup costs during ramp period</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Startup Allocation — Month 0</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.startupMonth0?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= 50% of startup total</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Startup Allocation — Month 1</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.startupMonth1?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= 50% of startup total</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">CapEx Outlay — Month 0</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.capexMonth0?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= Buildout + Office Equipment</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Fixed Monthly Cost</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.fixedCostMonthly?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= Fixed Overhead + Marketing</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Total Equipment Lease</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.totalEquipmentLease?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= CT Lease + Echo Lease</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Total Investment Required</span>
                          <span className="text-sm font-bold text-teal-600">
                            ${derivedVariables.totalInvestment?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">= CapEx + Equipment + Startup</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Complete Input Values Section - Below */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Input Values</h3>
              <Card>
                <CardHeader>
                  <CardDescription>
                    All {Object.keys(inputs).length} input parameters with current values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(inputs).map(([key, value]) => (
                      <div key={key} className="p-3 border rounded-lg">
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="text-sm font-mono">
                          {typeof value === 'boolean' ? (
                            <Badge variant={value ? "default" : "secondary"}>
                              {value ? 'ON' : 'OFF'}
                            </Badge>
                          ) : typeof value === 'number' ? (
                            value.toLocaleString()
                          ) : (
                            String(value)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

