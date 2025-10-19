/**
 * AI-Powered Calculation Validation Tab
 * Uses LLM to validate formulas, values, and coherence
 */

import { useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles, Brain } from 'lucide-react';

interface ValidationReport {
  timestamp: string;
  overallHealth: number;
  formulas: Array<{
    formulaName: string;
    formula: string;
    status: string;
    confidence: number;
    analysis: string;
    industryStandard?: string;
    recommendation?: string;
    risks?: string[];
    improvements?: string[];
  }>;
  values: Array<{
    inputName: string;
    currentValue: any;
    status: string;
    confidence: number;
    analysis: string;
    typicalRange?: { min: number; max: number; typical: number };
    recommendation?: string;
  }>;
  coherence: Array<{
    checkName: string;
    status: string;
    confidence: number;
    analysis: string;
    affectedInputs: string[];
    recommendation?: string;
  }>;
  summary: {
    totalFormulas: number;
    correctFormulas: number;
    questionableFormulas: number;
    incorrectFormulas: number;
    totalInputs: number;
    realisticInputs: number;
    aggressiveInputs: number;
    unrealisticInputs: number;
    coherenceIssues: number;
  };
}

export function AIValidationTab() {
  const { inputs, projections } = useDashboard();
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    setError(null);

    try {
      // Prepare formulas for validation
      const formulas = [
        {
          id: 'totalPhysicians',
          name: 'Total Physicians',
          formula: '(foundingToggle ? 1 : 0) + additionalPhysicians',
          code: 'const totalPhysicians = (inputs.foundingToggle ? 1 : 0) + inputs.additionalPhysicians;',
          context: 'Calculates total number of physicians in the MSO'
        },
        {
          id: 'totalCarryoverPrimary',
          name: 'Total Primary Carryover',
          formula: 'physicianPrimaryCarryover + (additionalPhysicians × otherPhysiciansPrimaryCarryoverPerPhysician)',
          code: 'const totalPrimaryCarryover = inputs.physicianPrimaryCarryover + (inputs.additionalPhysicians * inputs.otherPhysiciansPrimaryCarryoverPerPhysician);',
          context: 'Calculates total primary care members carried over by all physicians'
        },
        {
          id: 'monthlyPrimaryRevenue',
          name: 'Monthly Primary Care Revenue',
          formula: 'primaryMembers × primaryPrice',
          code: 'revenue.primary = primaryMembers * inputs.primaryPrice;',
          context: 'Calculates monthly revenue from primary care subscriptions'
        },
        {
          id: 'monthlyVariableCosts',
          name: 'Monthly Variable Costs',
          formula: 'totalRevenue × variableCostPct',
          code: 'costs.variable = revenue.total * (inputs.variableCostPct / 100);',
          context: 'Calculates variable costs as percentage of revenue'
        },
        {
          id: 'monthlyProfit',
          name: 'Monthly Profit',
          formula: 'totalRevenue - totalCosts',
          code: 'profit = revenue.total - costs.total;',
          context: 'Calculates monthly profit (revenue minus costs)'
        },
        {
          id: 'physicianROI',
          name: 'Physician ROI',
          formula: '(totalProfit12Mo / myCapitalContribution) × 100',
          code: 'const roi = (totalProfit12Mo / capitalContribution) * 100;',
          context: 'Calculates return on investment for physician capital contribution'
        }
      ];

      // Prepare input descriptions
      const inputDescriptions: Record<string, string> = {
        primaryPrice: 'Monthly subscription price for primary care membership',
        specialtyPrice: 'Price per specialty care visit',
        churnPrimary: 'Annual member churn rate for primary care',
        dexafitPrimaryIntakeMonthly: 'New primary members from Dexafit partnership per month',
        diagnosticsMargin: 'Profit margin on diagnostics services',
        variableCostPct: 'Variable costs as percentage of revenue',
        fixedOverheadMonthly: 'Monthly fixed overhead costs'
      };

      // Get month 12 data
      const month12 = projections?.projection?.[11];

      const response = await fetch('/api/validate-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formulas,
          inputs,
          inputDescriptions,
          projections: {
            month12Revenue: month12?.revenue?.total,
            month12Profit: month12?.profit
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }

      const validationReport = await response.json();
      setReport(validationReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
      case 'realistic':
      case 'coherent':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'questionable':
      case 'aggressive':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'incorrect':
      case 'unrealistic':
      case 'incoherent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      correct: 'default',
      realistic: 'default',
      coherent: 'default',
      questionable: 'secondary',
      aggressive: 'secondary',
      incorrect: 'destructive',
      unrealistic: 'destructive',
      incoherent: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI-Powered Calculation Validator
              </CardTitle>
              <CardDescription>
                Uses advanced AI to validate formulas against MSO industry standards and detect logical inconsistencies
              </CardDescription>
            </div>
            <Button
              onClick={runValidation}
              disabled={isValidating}
              size="lg"
              className="gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run AI Validation
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Validation Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Validation Report */}
      {report && (
        <>
          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Model Health</CardTitle>
              <div className="mt-4">
                <div className={`text-6xl font-bold ${getHealthColor(report.overallHealth)}`}>
                  {report.overallHealth}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on formula correctness, value realism, and logical coherence
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium">Formulas</div>
                  <div className="text-2xl font-bold text-green-600">{report.summary.correctFormulas}</div>
                  <div className="text-xs text-muted-foreground">
                    {report.summary.questionableFormulas} questionable, {report.summary.incorrectFormulas} incorrect
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Input Values</div>
                  <div className="text-2xl font-bold text-green-600">{report.summary.realisticInputs}</div>
                  <div className="text-xs text-muted-foreground">
                    {report.summary.aggressiveInputs} aggressive, {report.summary.unrealisticInputs} unrealistic
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Coherence</div>
                  <div className="text-2xl font-bold text-green-600">
                    {report.coherence.length - report.summary.coherenceIssues}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {report.summary.coherenceIssues} issues found
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formula Validation */}
          <Card>
            <CardHeader>
              <CardTitle>Formula Validation</CardTitle>
              <CardDescription>AI analysis of calculation formulas against MSO industry standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.formulas.map((formula, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(formula.status)}
                      <div>
                        <div className="font-semibold">{formula.formulaName}</div>
                        <code className="text-sm text-muted-foreground">{formula.formula}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(formula.status)}
                      <Badge variant="outline">{formula.confidence}% confident</Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm">{formula.analysis}</div>
                  
                  {formula.industryStandard && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="font-medium text-blue-900 text-sm">Industry Standard:</div>
                      <code className="text-sm text-blue-700">{formula.industryStandard}</code>
                    </div>
                  )}
                  
                  {formula.recommendation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="font-medium text-yellow-900 text-sm">Recommendation:</div>
                      <div className="text-sm text-yellow-700">{formula.recommendation}</div>
                    </div>
                  )}
                  
                  {formula.risks && formula.risks.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="font-medium text-red-900 text-sm">Risks:</div>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {formula.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Value Validation */}
          <Card>
            <CardHeader>
              <CardTitle>Input Value Realism</CardTitle>
              <CardDescription>AI assessment of whether input values are realistic for an MSO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.values.map((value, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(value.status)}
                      <div>
                        <div className="font-semibold">{value.inputName}</div>
                        <div className="text-sm text-muted-foreground">Current: {JSON.stringify(value.currentValue)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(value.status)}
                      <Badge variant="outline">{value.confidence}% confident</Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm">{value.analysis}</div>
                  
                  {value.typicalRange && (
                    <div className="bg-gray-50 border rounded p-3">
                      <div className="font-medium text-sm">Industry Range:</div>
                      <div className="text-sm text-muted-foreground">
                        Min: {value.typicalRange.min} | Typical: {value.typicalRange.typical} | Max: {value.typicalRange.max}
                      </div>
                    </div>
                  )}
                  
                  {value.recommendation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="font-medium text-yellow-900 text-sm">Recommendation:</div>
                      <div className="text-sm text-yellow-700">{value.recommendation}</div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Coherence Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Coherence Analysis</CardTitle>
              <CardDescription>AI detection of logical inconsistencies and unrealistic relationships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.coherence.map((check, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-semibold">{check.checkName}</div>
                        {check.affectedInputs.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Affects: {check.affectedInputs.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(check.status)}
                      <Badge variant="outline">{check.confidence}% confident</Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm">{check.analysis}</div>
                  
                  {check.recommendation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="font-medium text-yellow-900 text-sm">Recommendation:</div>
                      <div className="text-sm text-yellow-700">{check.recommendation}</div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Initial State */}
      {!report && !isValidating && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Validate</h3>
            <p className="text-muted-foreground mb-6">
              Click "Run AI Validation" to analyze your financial model using advanced AI
            </p>
            <Button onClick={runValidation} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Run AI Validation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

