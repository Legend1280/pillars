import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, Loader2, AlertCircle, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { buildEnhancedCalculationGraph } from '@/lib/calculationGraphEnhanced';

interface AIAnalysis {
  healthScore: number;
  criticalIssues: Array<{
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  missingConnections: Array<{
    from: string;
    to: string;
    reason: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    impact: string;
  }>;
  strengths: string[];
  summary: string;
}

export function AIAnalyzerTab() {
  const { inputs } = useDashboard();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Build the enhanced calculation graph
      const graph = buildEnhancedCalculationGraph(inputs);

      // Send to backend for AI analysis
      const response = await fetch('/api/analyze-ontology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: graph.nodes,
          edges: graph.edges,
          stats: graph.stats,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze ontology');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-teal-600" />
                Dr. Sarah Chen - AI Ontology Analyst
              </CardTitle>
              <CardDescription className="mt-2">
                Expert analysis of your financial model's ontological structure, dependencies, and completeness.
                Dr. Chen will evaluate all 128 nodes and 96 edges to identify gaps, validate formulas, and recommend improvements.
              </CardDescription>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Ontology
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <div className="font-semibold">Analysis Failed</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="h-16 w-16 text-teal-600 animate-pulse mb-4" />
              <div className="text-lg font-semibold text-gray-900">Dr. Chen is analyzing your ontology...</div>
              <div className="text-sm text-gray-600 mt-2">
                Examining 128 nodes, 96 edges, and their relationships
              </div>
              <div className="text-xs text-gray-500 mt-4">
                This may take 30-60 seconds depending on API response time
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Health Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold text-teal-600">
                  {analysis.healthScore}
                  <span className="text-3xl text-gray-400">/100</span>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-500"
                      style={{ width: `${analysis.healthScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{analysis.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {analysis.criticalIssues && analysis.criticalIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Critical Issues ({analysis.criticalIssues.length})
                </CardTitle>
                <CardDescription>
                  Issues that need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.criticalIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="font-semibold">{issue.title}</div>
                          <div className="text-sm mt-1">{issue.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Missing Connections */}
          {analysis.missingConnections && analysis.missingConnections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Missing Ontological Connections</CardTitle>
                <CardDescription>
                  Relationships that should exist but are not currently mapped
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.missingConnections.map((conn, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-mono text-sm">
                        <span className="text-blue-600">{conn.from}</span>
                        {' → '}
                        <span className="text-green-600">{conn.to}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{conn.reason}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Prioritized improvements to enhance your financial model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${getSeverityColor(rec.priority)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-semibold">{rec.title}</div>
                          <div className="text-sm mt-1">{rec.description}</div>
                          <div className="text-xs mt-2 opacity-75">
                            <strong>Impact:</strong> {rec.impact}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getSeverityColor(rec.priority)}`}>
                          {rec.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
                <CardDescription>
                  What your model does well
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isAnalyzing && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="h-16 w-16 text-gray-300 mb-4" />
              <div className="text-lg font-semibold text-gray-900">Ready to Analyze</div>
              <div className="text-sm text-gray-600 mt-2 max-w-md">
                Click "Analyze Ontology" to have Dr. Sarah Chen review your financial model's structure,
                identify gaps, validate formulas, and provide expert recommendations.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

