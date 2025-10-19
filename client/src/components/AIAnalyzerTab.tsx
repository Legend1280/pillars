import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, Loader2, AlertCircle, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { buildEnhancedCalculationGraph } from '@/lib/calculationGraphEnhanced';
import { extractCalculationCode, getCalculationCodeSummary } from '@/lib/calculationCodeExtractor';

interface Inaccuracy {
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  recommendation: string;
}

interface AIAnalysis {
  step1Summary: string;
  step2Summary: string;
  inaccuracies: Inaccuracy[];
  strengths: string[];
  overallAssessment: string;
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

      // Extract actual calculation code for analysis
      const calculationCode = getCalculationCodeSummary();
      const calculationSnippets = extractCalculationCode();

      // Send both graph and actual code to Dr. Chen for 3-step analysis
      const response = await fetch('/api/analyze-ontology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: graph.nodes,
          edges: graph.edges,
          stats: graph.stats,
          calculationCode,
          calculationSnippets,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'HIGH':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'LOW':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertCircle className="h-5 w-5" />;
      case 'MEDIUM':
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
                Dr. Sarah Chen - Business Analyst
              </CardTitle>
              <CardDescription className="mt-2">
                Expert 3-step analysis: (1) Assess Ontology Graph documentation, (2) Assess Actual Calculations in TypeScript code, 
                (3) Identify Inaccuracies between documentation and implementation, prioritized by risk level.
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
                  Run 3-Step Audit
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
              <div className="text-lg font-semibold text-gray-900">Dr. Chen is performing 3-step analysis...</div>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div>Step 1: Assessing Ontology Graph (128 nodes, 96 edges)</div>
                <div>Step 2: Assessing Actual Calculations (TypeScript code)</div>
                <div>Step 3: Identifying Inaccuracies (prioritized by risk)</div>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                This may take 60-90 seconds depending on API response time
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Step 1: Ontology Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">1</span>
                Ontology Graph Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">{analysis.step1Summary}</p>
            </CardContent>
          </Card>

          {/* Step 2: Calculation Code Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">2</span>
                Actual Calculations Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">{analysis.step2Summary}</p>
            </CardContent>
          </Card>

          {/* Step 3: Inaccuracies */}
          {analysis.inaccuracies && analysis.inaccuracies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">3</span>
                  Inaccuracies Identified ({analysis.inaccuracies.length})
                </CardTitle>
                <CardDescription>
                  Discrepancies between documentation and implementation, prioritized by risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.inaccuracies.map((inaccuracy, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${getPriorityColor(inaccuracy.priority)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getPriorityIcon(inaccuracy.priority)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm uppercase tracking-wide">
                                {inaccuracy.priority}
                              </span>
                              <span className="text-lg font-semibold">{inaccuracy.title}</span>
                            </div>
                            <div className="text-sm mt-2 space-y-2">
                              <div>
                                <strong>Issue:</strong> {inaccuracy.description}
                              </div>
                              <div>
                                <strong>Impact:</strong> {inaccuracy.impact}
                              </div>
                              <div>
                                <strong>Recommendation:</strong> {inaccuracy.recommendation}
                              </div>
                            </div>
                          </div>
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
                  What your implementation does well
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

          {/* Overall Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">{analysis.overallAssessment}</p>
            </CardContent>
          </Card>
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
                Click "Run 3-Step Audit" to have Dr. Sarah Chen perform a comprehensive Business Analyst review:
                comparing your ontology documentation against actual TypeScript implementation to identify inaccuracies.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

