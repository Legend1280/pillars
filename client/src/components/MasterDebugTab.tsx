import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { CalculationFlowVisualization } from "./CalculationFlowVisualization";
import { AIAnalyzerTab } from "./AIAnalyzerTab";
import { Network, AlertTriangle, CheckCircle2, TrendingUp, Database, Brain, GitBranch, Layers, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateOntologyKPIs, getOntologyValidations } from "@/lib/ontologyKPIs";

export function MasterDebugTab() {
  const { inputs, projections, derivedVariables } = useDashboard();

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
  
  // Get validation checks
  const validations = useMemo(() => 
    getOntologyValidations(inputs, projections, derivedVariables),
    [inputs, projections, derivedVariables]
  );

  const passedValidations = validations.filter(v => v.passed).length;
  const [isExporting, setIsExporting] = useState(false);

  const handleExportDebugPacket = async () => {
    setIsExporting(true);
    try {
      const { buildEnhancedCalculationGraph } = await import('@/lib/calculationGraphEnhanced');
      const ontologyGraph = buildEnhancedCalculationGraph(inputs);
      
      const response = await fetch('/api/export-debug-packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ontologyGraph, inputs }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export failed:', response.status, errorText);
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-packet-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export debug packet. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Debug Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Ontological data model health: Node coverage, category completeness, and edge integrity
          </p>
        </div>
        <button
          onClick={handleExportDebugPacket}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Debug Packet'}
        </button>
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Ontology</span>
          </TabsTrigger>
          <TabsTrigger value="category-health" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
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

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="mt-6">
          <AIAnalyzerTab />
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Validation Checks</CardTitle>
              <CardDescription>
                Automated checks to ensure calculations are producing reasonable results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validations.map((validation, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    {validation.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{validation.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{validation.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Data Tab */}
        <TabsContent value="data" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Input Values</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Derived Variables</CardTitle>
                <CardDescription>
                  Calculated values from your inputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(derivedVariables).map(([key, value]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm font-mono">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

