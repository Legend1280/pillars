import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, Loader2, AlertCircle, CheckCircle2, TrendingUp, AlertTriangle, Copy, Check } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { buildEnhancedCalculationGraph } from '@/lib/calculationGraphEnhanced';
// Import the full calculations.ts file as raw text
import calculationsFileContent from '@/lib/calculations.ts?raw';

interface Issue {
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  errorType: string;
  riskDescription: string;
}

interface DebugPrompt {
  context: Record<string, string>;
  files_to_analyze: string[];
  debug_focus: string[];
  output_format: string;
}

interface AIAnalysis {
  systemAssessment: {
    grade: number;
    maturityLevel: string;
    summary: string;
  };
  strengths: string[];
  issues: Issue[];
  debugPrompt: DebugPrompt;
}

export function AIAnalyzerTab() {
  const { inputs } = useDashboard();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setStatusMessage('Creating analysis task...');

    try {
      // Build the enhanced calculation graph
      const graph = buildEnhancedCalculationGraph(inputs);
      const calculationCode = calculationsFileContent;

      // Step 1: Create the task
      const createResponse = await fetch('/api/manus-create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ontologyGraph: {
            nodes: graph.nodes,
            edges: graph.edges,
          },
          calculationCode,
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create task: ${createResponse.statusText}`);
      }

      const responseData = await createResponse.json();
      console.log('[Manus] Response:', responseData);
      
      if (!responseData.task_id) {
        throw new Error('No task_id received from server');
      }
      
      const { task_id } = responseData;
      console.log('[Manus] Task created:', task_id);
      setStatusMessage('✓ Task created! Analysis in progress (3-5 minutes)...');

      // Step 2: Poll for completion
      await pollForCompletion(task_id);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze ontology');
      setIsAnalyzing(false);
    }
  };

  const pollForCompletion = async (taskId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max (5s intervals)

    const checkStatus = async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        clearInterval(pollingIntervalRef.current!);
        setError('Analysis timed out after 10 minutes');
        setIsAnalyzing(false);
        return;
      }

      try {
        const statusResponse = await fetch(`/api/manus-check-status?taskId=${taskId}`);
        
        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'pending' || statusData.status === 'running') {
          setStatusMessage(statusData.message || 'Analysis in progress...');
          return; // Continue polling
        }

        if (statusData.status === 'failed') {
          clearInterval(pollingIntervalRef.current!);
          setError(statusData.error || 'Analysis failed');
          setIsAnalyzing(false);
          return;
        }

        if (statusData.status === 'completed') {
          clearInterval(pollingIntervalRef.current!);
          setAnalysis(statusData.result);
          setStatusMessage('Analysis complete!');
          setIsAnalyzing(false);
          return;
        }

      } catch (err) {
        console.error('Polling error:', err);
        // Don't stop polling on network errors - keep trying
        setStatusMessage('Connection issue, retrying...');
        // Only stop after max attempts
      }
    };

    // Initial check
    await checkStatus();

    // Set up polling interval (every 5 seconds)
    pollingIntervalRef.current = setInterval(checkStatus, 5000);
  };

  const copyDebugPrompt = () => {
    if (!analysis?.debugPrompt) return;
    
    const jsonString = JSON.stringify(analysis.debugPrompt, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-700';
    if (grade >= 80) return 'text-teal-700';
    if (grade >= 70) return 'text-yellow-700';
    return 'text-orange-700';
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
                Dr. Sarah Chen - AI Business Analyst
              </CardTitle>
              <CardDescription className="mt-2">
                Expert analysis of your financial model's ontological structure, dependencies, and completeness. Dr. Chen will evaluate all 128 nodes and 96 edges to identify gaps, validate formulas, and recommend improvements.
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
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status Message */}
      {isAnalyzing && statusMessage && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-blue-800">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div>
                <div className="font-semibold">Analysis in Progress</div>
                <div className="text-sm mt-1">{statusMessage}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* System Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>System Assessment</span>
                <span className={`text-4xl font-bold ${getGradeColor(analysis.systemAssessment.grade)}`}>
                  {analysis.systemAssessment.grade}%
                </span>
              </CardTitle>
              <CardDescription className="text-base font-semibold text-gray-700">
                {analysis.systemAssessment.maturityLevel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.systemAssessment.summary}</p>
            </CardContent>
          </Card>

          {/* System Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                System Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Issues Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Issues & Recommendations ({analysis.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <p className="font-semibold">No issues found!</p>
                  <p className="text-sm">Your financial model is in excellent shape.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Error Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.issues.map((issue, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{issue.title}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(issue.priority)}`}>
                              {getPriorityIcon(issue.priority)}
                              {issue.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{issue.errorType}</td>
                          <td className="py-3 px-4 text-gray-700">{issue.riskDescription}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Debug Prompt (Copy & Paste into Manus)
                </span>
                <Button
                  onClick={copyDebugPrompt}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                Use this JSON prompt to perform deeper debugging in Manus AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(analysis.debugPrompt, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

