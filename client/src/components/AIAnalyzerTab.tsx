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

interface AnalysisReport {
  id: string;
  timestamp: number;
  scenario: string;
  analysis: AIAnalysis;
  provenance: {
    totalPhysicians: number;
    launchMonth: number;
    capitalDeployed: number;
  };
}

const STORAGE_KEY = 'ai_analysis_reports';

export function AIAnalyzerTab() {
  const { inputs } = useDashboard();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentReport = reports.find(r => r.id === currentReportId);
  const analysis = currentReport?.analysis || null;

  // Load reports from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const loadedReports = JSON.parse(stored) as AnalysisReport[];
        setReports(loadedReports);
        if (loadedReports.length > 0) {
          setCurrentReportId(loadedReports[0].id); // Show most recent
        }
      } catch (e) {
        console.error('Failed to load reports:', e);
      }
    }
  }, []);
  
  // Save reports to localStorage whenever they change
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }
  }, [reports]);

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
    setStatusMessage('Starting Manus AI analysis...');

    try {
      // Build the enhanced calculation graph
      const graph = buildEnhancedCalculationGraph(inputs);
      
      console.log('🚀 Calling Manus API...');
      setStatusMessage('Calling Manus API (this may take 3-5 minutes)...');

      // Call the Manus API endpoint (handles task creation, polling, and result parsing)
      const response = await fetch('/api/manus-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: graph.nodes,
          edges: graph.edges,
          stats: {
            totalNodes: graph.nodes.length,
            totalEdges: graph.edges.length,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Manus API error: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Manus analysis complete:', result);

      // Check if task is still processing
      if (result.status === 'processing') {
        setStatusMessage('Analysis is still processing. Check the task URL.');
        setError(`Analysis taking longer than expected. View progress at: ${result.taskUrl}`);
        setIsAnalyzing(false);
        return;
      }

      // Prepare provenance data
      const reportId = `report_${Date.now()}`;
      const provenance = {
        reportId,
        scenario: inputs.scenarioMode || 'Custom',
        totalNodes: graph.nodes.length,
        totalEdges: graph.edges.length,
        totalPhysicians: (inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0),
        launchMonth: inputs.rampDuration || 6,
        capitalDeployed: 0,
        manusTaskUrl: result.taskUrl,
        manusShareUrl: result.shareUrl,
      };

      // Save to server (persisted storage)
      try {
        const saveResponse = await fetch('/api/analysis-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provenance,
            analysis: {
              step1Summary: result.step1Summary || '',
              step2Summary: result.step2Summary || '',
              inaccuracies: result.inaccuracies || [],
              strengths: result.strengths || [],
              overallAssessment: result.overallAssessment || '',
            },
          }),
        });

        if (saveResponse.ok) {
          console.log('✅ Report saved to server');
        }
      } catch (saveError) {
        console.error('⚠️ Failed to save report to server:', saveError);
        // Continue anyway - local storage will still work
      }

      // Create new report for local display
      const newReport: AnalysisReport = {
        id: reportId,
        timestamp: Date.now(),
        scenario: inputs.scenarioMode || 'Custom',
        analysis: {
          systemAssessment: {
            grade: 85, // Default grade
            maturityLevel: 'Production',
            summary: result.step1Summary || 'Analysis completed',
          },
          strengths: result.strengths || [],
          issues: (result.inaccuracies || []).map((inaccuracy: any) => ({
            title: inaccuracy.title,
            priority: inaccuracy.priority,
            errorType: inaccuracy.impact,
            riskDescription: inaccuracy.description,
          })),
          debugPrompt: {
            context: {
              taskUrl: result.taskUrl || '',
              shareUrl: result.shareUrl || '',
            },
            files_to_analyze: ['calculations.ts', 'data.ts', 'calculationGraph.ts'],
            debug_focus: ['calculation accuracy', 'ontology completeness'],
            output_format: 'JSON',
          },
        },
        provenance: {
          totalPhysicians: provenance.totalPhysicians,
          launchMonth: provenance.launchMonth,
          capitalDeployed: provenance.capitalDeployed,
        },
      };

      // Add to reports (most recent first)
      setReports(prev => [newReport, ...prev]);
      setCurrentReportId(newReport.id);
      
      setStatusMessage('✅ Analysis complete!');
      setIsAnalyzing(false);

    } catch (err) {
      console.error('❌ Analysis error:', err);
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
          // 404 means task not found yet (still indexing), keep polling
          if (statusResponse.status === 404) {
            setStatusMessage('Task indexing, retrying...');
            return; // Continue polling
          }
          throw new Error(`Status check failed (${statusResponse.status}): ${statusResponse.statusText}`);
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
          
          // Create new report with provenance
          const newReport: AnalysisReport = {
            id: `report_${Date.now()}`,
            timestamp: Date.now(),
            scenario: inputs.scenarioName || 'Custom',
            analysis: statusData.result,
            provenance: {
              totalPhysicians: inputs.totalPhysicians || 0,
              launchMonth: inputs.launchMonth || 0,
              capitalDeployed: inputs.totalPhysicians ? inputs.totalPhysicians * 750000 : 0,
            },
          };
          
          // Add to reports (most recent first)
          setReports(prev => [newReport, ...prev]);
          setCurrentReportId(newReport.id);
          
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
      {analysis && currentReport && (
        <>
          {/* Provenance Card */}
          <Card className="bg-gray-50 border-gray-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Report Provenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Generated</div>
                  <div className="font-semibold">
                    {new Date(currentReport.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Scenario</div>
                  <div className="font-semibold">{currentReport.scenario}</div>
                </div>
                <div>
                  <div className="text-gray-500">Physicians</div>
                  <div className="font-semibold">{currentReport.provenance.totalPhysicians}</div>
                </div>
                <div>
                  <div className="text-gray-500">Launch Month</div>
                  <div className="font-semibold">Month {currentReport.provenance.launchMonth}</div>
                </div>
              </div>
              
              {reports.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="text-gray-500 text-xs mb-2">Previous Reports ({reports.length - 1})</div>
                  <div className="flex flex-wrap gap-2">
                    {reports.slice(1, 6).map(report => (
                      <button
                        key={report.id}
                        onClick={() => setCurrentReportId(report.id)}
                        className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                      >
                        {new Date(report.timestamp).toLocaleTimeString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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

