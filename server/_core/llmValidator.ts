/**
 * LLM-Powered Calculation Validator
 * 
 * Uses Claude AI to validate financial formulas against industry standards
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || 'sk-dummy-key'
});

// Dr. Chen - AI Financial Validator Persona
const DR_CHEN_PERSONA = `You are Dr. Sarah Chen, a healthcare financial consultant with 15 years of experience specializing in Medical Service Organization (MSO) financial modeling and physician practice economics.

Your expertise includes:
- MSO startup financial planning and capital structure
- Physician compensation models (salary, productivity, equity)
- Healthcare revenue cycle management
- Medical practice operational costs and staffing ratios
- Industry benchmarks for primary care, specialty care, and ancillary services
- Risk assessment and scenario planning for healthcare ventures

Your approach:
- You validate financial models against real-world MSO industry standards
- You cite specific benchmarks when available (e.g., "Typical primary care pricing: $150-$350/month")
- You identify risks and unrealistic assumptions
- You provide specific, actionable recommendations
- You communicate clearly and professionally

Your goal is to help physicians make informed decisions when launching their MSO by ensuring their financial models are realistic, complete, and aligned with industry best practices.`;

// ============================================================================
// TYPES
// ============================================================================

export interface FormulaValidation {
  formulaId: string;
  formulaName: string;
  formula: string;
  code: string;
  status: 'correct' | 'questionable' | 'incorrect' | 'unknown';
  confidence: number; // 0-100
  analysis: string;
  industryStandard?: string;
  recommendation?: string;
  risks?: string[];
  improvements?: string[];
}

export interface ValueValidation {
  inputId: string;
  inputName: string;
  currentValue: any;
  status: 'realistic' | 'aggressive' | 'unrealistic' | 'unknown';
  confidence: number;
  analysis: string;
  typicalRange?: { min: number; max: number; typical: number };
  recommendation?: string;
}

export interface CoherenceCheck {
  checkName: string;
  status: 'coherent' | 'questionable' | 'incoherent' | 'unknown';
  confidence: number;
  analysis: string;
  affectedInputs: string[];
  recommendation?: string;
}

export interface ValidationReport {
  timestamp: string;
  overallHealth: number | null; // 0-100
  formulas: FormulaValidation[];
  values: ValueValidation[];
  coherence: CoherenceCheck[];
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Strip markdown code blocks from Claude responses
 * Claude often wraps JSON in ```json...``` which breaks JSON.parse()
 */
function stripMarkdownCodeBlocks(text: string): string {
  // Remove ```json and ``` markers
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

async function validateFormula(
  formula: { id: string; name: string; formula: string; code: string; context: string }
): Promise<FormulaValidation> {
  try {
    const prompt = `You are a financial modeling expert specializing in Medical Service Organizations (MSOs) and healthcare business planning.

Analyze this calculation formula:

**Formula Name:** ${formula.name}
**Formula:** ${formula.formula}
**Code:** ${formula.code}
**Context:** ${formula.context}

Evaluate:
1. Is this formula correct for MSO financial modeling?
2. Does it follow industry best practices?
3. Are there any missing considerations (e.g., churn, retention, seasonality)?
4. What are the risks of using this formula?
5. How could it be improved?

Respond in JSON format:
{
  "status": "correct" | "questionable" | "incorrect",
  "confidence": 0-100,
  "analysis": "Brief analysis",
  "industryStandard": "What the standard formula should be (if different)",
  "recommendation": "Specific recommendation",
  "risks": ["risk1", "risk2"],
  "improvements": ["improvement1", "improvement2"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: DR_CHEN_PERSONA,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const result = JSON.parse(stripMarkdownCodeBlocks(responseText));

    return {
      formulaId: formula.id,
      formulaName: formula.name,
      formula: formula.formula,
      code: formula.code,
      ...result
    };
  } catch (error) {
    console.error(`Error validating formula ${formula.id}:`, error);
    return {
      formulaId: formula.id,
      formulaName: formula.name,
      formula: formula.formula,
      code: formula.code,
      status: 'unknown',
      confidence: 0,
      analysis: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function validateValue(
  inputId: string,
  inputName: string,
  value: any,
  description: string
): Promise<ValueValidation> {
  try {
    const prompt = `You are a financial modeling expert for Medical Service Organizations (MSOs).

Evaluate this input value:

**Input:** ${inputName}
**Description:** ${description}
**Current Value:** ${value}

Is this value realistic for an MSO? Provide:
1. Status: realistic, aggressive, or unrealistic
2. Typical range for this metric in the MSO industry
3. Analysis of whether this value makes sense
4. Recommendation if it should be adjusted

Respond in JSON format:
{
  "status": "realistic" | "aggressive" | "unrealistic",
  "confidence": 0-100,
  "analysis": "Brief analysis",
  "typicalRange": {"min": number, "max": number, "typical": number},
  "recommendation": "Specific recommendation if needed"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 400,
      system: DR_CHEN_PERSONA,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const result = JSON.parse(stripMarkdownCodeBlocks(responseText));

    return {
      inputId,
      inputName,
      currentValue: value,
      ...result
    };
  } catch (error) {
    console.error(`Error validating value ${inputId}:`, error);
    return {
      inputId,
      inputName,
      currentValue: value,
      status: 'unknown',
      confidence: 0,
      analysis: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function validateCoherence(
  inputs: Record<string, any>,
  projections: Record<string, any>
): Promise<CoherenceCheck[]> {
  try {
    const prompt = `You are a financial modeling expert for Medical Service Organizations (MSOs).

Analyze the coherence and logical consistency of this financial model:

**Inputs:** ${JSON.stringify(inputs, null, 2)}
**Projections:** ${JSON.stringify(projections, null, 2)}

Check for:
1. Logical inconsistencies (e.g., revenue growing but costs flat)
2. Unrealistic relationships (e.g., 10 physicians but 1 admin staff)
3. Missing considerations
4. Red flags

Return an array of coherence checks in JSON format:
[
  {
    "checkName": "Name of the check",
    "status": "coherent" | "questionable" | "incoherent",
    "confidence": 0-100,
    "analysis": "What you found",
    "affectedInputs": ["input1", "input2"],
    "recommendation": "How to fix it"
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: DR_CHEN_PERSONA,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return JSON.parse(stripMarkdownCodeBlocks(responseText));
  } catch (error) {
    console.error('Error validating coherence:', error);
    return [{
      checkName: 'Coherence Validation Error',
      status: 'unknown',
      confidence: 0,
      analysis: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      affectedInputs: []
    }];
  }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

// ============================================================================
// ONTOLOGY ANALYSIS
// ============================================================================

export interface OntologyAnalysis {
  timestamp: string;
  overallHealth: number; // 0-100
  structuralIssues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    issue: string;
    affectedNodes: string[];
    recommendation: string;
  }>;
  missingConnections: Array<{
    from: string;
    to: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  formulaIssues: Array<{
    nodeId: string;
    nodeName: string;
    issue: string;
    correctFormula: string;
    impact: string;
  }>;
  dataFlowIssues: Array<{
    path: string[];
    issue: string;
    recommendation: string;
  }>;
  strengths: string[];
  criticalRisks: string[];
  recommendations: string[];
  summary: string;
}

export async function analyzeOntology(
  nodes: Array<{ id: string; type: string; label: string; data: any }>,
  edges: Array<{ source: string; target: string; label?: string }>
): Promise<OntologyAnalysis> {
  try {
    console.log('🧠 Dr. Chen analyzing ontological structure...');
    
    const prompt = `You are analyzing the complete ontological structure of an MSO financial model.

**NODES (${nodes.length} total):**
${JSON.stringify(nodes.slice(0, 50), null, 2)}

**EDGES (${edges.length} connections):**
${JSON.stringify(edges.slice(0, 100), null, 2)}

As Dr. Sarah Chen, perform a comprehensive system-level analysis:

1. **Structural Issues**: Are there problems with how the model is architected?
2. **Missing Connections**: What should be connected but isn't?
3. **Formula Issues**: Are formulas correct given their dependencies?
4. **Data Flow Issues**: Does data flow logically through the system?
5. **Critical Risks**: What are the biggest risks in this model structure?
6. **Strengths**: What's done well?
7. **Recommendations**: Top 5 improvements

Respond in JSON format:
{
  "overallHealth": 0-100,
  "structuralIssues": [{"severity": "critical|warning|info", "category": "string", "issue": "string", "affectedNodes": ["node1"], "recommendation": "string"}],
  "missingConnections": [{"from": "nodeId", "to": "nodeId", "reason": "string", "priority": "high|medium|low"}],
  "formulaIssues": [{"nodeId": "id", "nodeName": "name", "issue": "string", "correctFormula": "string", "impact": "string"}],
  "dataFlowIssues": [{"path": ["node1", "node2"], "issue": "string", "recommendation": "string"}],
  "strengths": ["strength1", "strength2"],
  "criticalRisks": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"],
  "summary": "Overall assessment in 2-3 sentences"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: DR_CHEN_PERSONA,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const result = JSON.parse(stripMarkdownCodeBlocks(responseText));

    console.log(`✅ Ontology analysis complete! Health: ${result.overallHealth}%`);

    return {
      timestamp: new Date().toISOString(),
      ...result
    };
  } catch (error) {
    console.error('Error analyzing ontology:', error);
    return {
      timestamp: new Date().toISOString(),
      overallHealth: 0,
      structuralIssues: [{
        severity: 'critical',
        category: 'Analysis Error',
        issue: `Failed to analyze ontology: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedNodes: [],
        recommendation: 'Check API key and try again'
      }],
      missingConnections: [],
      formulaIssues: [],
      dataFlowIssues: [],
      strengths: [],
      criticalRisks: [],
      recommendations: [],
      summary: 'Analysis failed due to an error.'
    };
  }
}

// ============================================================================
// FORMULA VALIDATION REPORT
// ============================================================================

export async function generateValidationReport(
  formulas: Array<{ id: string; name: string; formula: string; code: string; context: string }>,
  inputs: Record<string, any>,
  inputDescriptions: Record<string, string>,
  projections: Record<string, any>
): Promise<ValidationReport> {
  console.log('🤖 Starting AI validation with Claude...');
  
  // Validate formulas
  console.log(`Validating ${formulas.length} formulas...`);
  const formulaValidations = await Promise.all(
    formulas.map(f => validateFormula(f))
  );

  // Validate key input values
  console.log(`Validating ${Object.keys(inputs).length} input values...`);
  const valueValidations = await Promise.all(
    Object.entries(inputs).slice(0, 7).map(([key, value]) =>
      validateValue(key, key, value, inputDescriptions[key] || 'No description')
    )
  );

  // Validate coherence
  console.log('Validating model coherence...');
  const coherenceChecks = await validateCoherence(inputs, projections);

  // Calculate summary
  const summary = {
    totalFormulas: formulaValidations.length,
    correctFormulas: formulaValidations.filter(f => f.status === 'correct').length,
    questionableFormulas: formulaValidations.filter(f => f.status === 'questionable').length,
    incorrectFormulas: formulaValidations.filter(f => f.status === 'incorrect').length,
    totalInputs: valueValidations.length,
    realisticInputs: valueValidations.filter(v => v.status === 'realistic').length,
    aggressiveInputs: valueValidations.filter(v => v.status === 'aggressive').length,
    unrealisticInputs: valueValidations.filter(v => v.status === 'unrealistic').length,
    coherenceIssues: coherenceChecks.filter(c => c.status !== 'coherent').length
  };

  // Calculate overall health score
  const totalChecks = summary.totalFormulas + summary.totalInputs + coherenceChecks.length;
  const passedChecks = summary.correctFormulas + summary.realisticInputs + 
                       coherenceChecks.filter(c => c.status === 'coherent').length;
  const overallHealth = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : null;

  console.log(`✅ Validation complete! Overall health: ${overallHealth}%`);

  return {
    timestamp: new Date().toISOString(),
    overallHealth,
    formulas: formulaValidations,
    values: valueValidations,
    coherence: coherenceChecks,
    summary
  };
}

