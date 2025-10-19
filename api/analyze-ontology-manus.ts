import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OntologyNode {
  id: string;
  label: string;
  type: 'input' | 'calculated' | 'output';
  category: string;
  value?: any;
}

interface OntologyEdge {
  source: string;
  target: string;
  label?: string;
}

interface OntologyGraph {
  nodes: OntologyNode[];
  edges: OntologyEdge[];
}

interface ManusTaskResponse {
  task_id: string;
  task_title: string;
  task_url: string;
  share_url?: string;
}

interface ManusTaskStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface AnalysisResult {
  step1Summary: string;
  step2Summary: string;
  inaccuracies: Array<{
    title: string;
    description: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    impact: string;
    recommendation: string;
  }>;
  strengths: string[];
  overallAssessment: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ontologyGraph, calculationCode } = req.body as {
      ontologyGraph: OntologyGraph;
      calculationCode: string;
    };

    if (!ontologyGraph || !calculationCode) {
      return res.status(400).json({ error: 'Missing required fields: ontologyGraph, calculationCode' });
    }

    console.log('[Manus] Starting analysis...');
    console.log('[Manus] Ontology nodes:', ontologyGraph.nodes.length);
    console.log('[Manus] Ontology edges:', ontologyGraph.edges.length);
    console.log('[Manus] Calculation code length:', calculationCode.length);

    // Build comprehensive prompt for Manus
    const prompt = buildManusPrompt(ontologyGraph, calculationCode);

    // Call Manus API to create task
    const manusApiKey = process.env.MANUS_API_KEY;
    if (!manusApiKey) {
      throw new Error('MANUS_API_KEY environment variable not set');
    }

    console.log('[Manus] Creating task...');
    const createTaskResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': manusApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        taskMode: 'agent',
        agentProfile: 'quality',
        hideInTaskList: true,
        createShareableLink: false,
        locale: 'en-US'
      })
    });

    if (!createTaskResponse.ok) {
      const errorText = await createTaskResponse.text();
      console.error('[Manus] Task creation failed:', errorText);
      throw new Error(`Manus API error: ${createTaskResponse.status} ${errorText}`);
    }

    const task: ManusTaskResponse = await createTaskResponse.json();
    console.log('[Manus] Task created:', task.task_id);
    console.log('[Manus] Task URL:', task.task_url);

    // Poll for task completion
    const result = await pollTaskCompletion(task.task_id, manusApiKey);
    
    console.log('[Manus] Analysis complete!');
    return res.status(200).json(result);

  } catch (error: any) {
    console.error('[Manus] Error:', error);
    return res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
}

function buildManusPrompt(ontologyGraph: OntologyGraph, calculationCode: string): string {
  const ontologyJson = JSON.stringify(ontologyGraph, null, 2);
  
  return `# Financial Projection Dashboard Analysis Task

## Your Role
You are an expert code auditor analyzing a financial projection dashboard for a medical practice. Your goal is to find bugs, validate calculations, and identify risks.

## Project Context

### What This Is
A TypeScript-based financial projection dashboard that uses an ontology-based calculation graph to model:
- Member growth (primary and specialty patients)
- Revenue streams (memberships, diagnostics, corporate contracts)
- Cost structure (salaries, equipment, overhead)
- Cash flow and profitability projections

### Architecture
1. **Ontology Graph**: Defines the data model structure
   - Nodes: Input parameters, calculated values, outputs
   - Edges: Dependencies between nodes
   - Categories: Members, Revenue, Costs, Diagnostics, etc.

2. **Calculation Code**: TypeScript implementation in \`calculations.ts\`
   - Ramp period (months 0-6): Pre-launch growth
   - 12-month projection (months 7-18): Post-launch operations
   - Activation logic: Services start at different months

3. **Data Model**: TypeScript interface defining all inputs

## Your Task

### Step 1: Analyze the Ontology Graph

Here is the complete ontology graph structure:

\`\`\`json
${ontologyJson}
\`\`\`

Questions to answer:
- What are the key input categories?
- What are the main calculation flows?
- What dependencies exist between nodes?
- Are there any missing or orphaned nodes?

### Step 2: Analyze the Calculation Code

Here is the complete TypeScript calculation code:

\`\`\`typescript
${calculationCode}
\`\`\`

Questions to answer:
- Does the code match the ontology structure?
- Are all ontology nodes referenced in the code?
- Are there undefined variables or missing inputs?
- Are activation checks consistent?
- Are there edge cases that could cause errors?

### Step 3: Identify Bugs and Risks

Provide a prioritized list of issues:

**CRITICAL**: Bugs that cause calculation failures or incorrect results
**HIGH**: Logic errors that significantly affect projections
**MEDIUM**: Inconsistencies or missing validations
**LOW**: Code quality or documentation issues

For each issue, provide:
- Title (concise description)
- Description (detailed explanation)
- Impact (business/financial impact)
- Recommendation (how to fix)

### Step 4: Validate Key Calculations

Check these critical calculations:
1. Member growth (primary and specialty)
2. Revenue calculations (all streams)
3. Cost calculations (salaries, equipment, overhead)
4. Cash flow and profitability
5. Activation logic for services

## Output Format

**IMPORTANT**: You MUST respond with ONLY a valid JSON object in this exact format. Do not include any markdown formatting, code blocks, or additional text. Just the raw JSON:

{
  "step1Summary": "Summary of ontology analysis findings",
  "step2Summary": "Summary of code analysis findings",
  "inaccuracies": [
    {
      "title": "Bug title",
      "description": "Detailed description of the issue",
      "priority": "CRITICAL",
      "impact": "Business impact explanation",
      "recommendation": "How to fix this issue"
    }
  ],
  "strengths": ["What's working well in the codebase"],
  "overallAssessment": "Overall summary of the analysis"
}

## Important Notes

- Focus on **real bugs**, not style issues
- Trace variable usage through the entire codebase
- Check for edge cases (e.g., services starting late)
- Validate that calculations match business logic
- Consider the ramp period vs 12-month projection differences
- **Output ONLY valid JSON** - no markdown, no code blocks, no additional text

Begin your analysis now and respond with the JSON output.`;
}

async function pollTaskCompletion(taskId: string, apiKey: string): Promise<AnalysisResult> {
  const maxAttempts = 120; // 10 minutes max (5s intervals)
  const pollInterval = 5000; // 5 seconds
  let attempts = 0;

  console.log('[Manus] Starting to poll for task completion...');

  while (attempts < maxAttempts) {
    attempts++;
    
    const response = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
      headers: {
        'API_KEY': apiKey,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Manus] Poll failed:', errorText);
      throw new Error(`Failed to poll task: ${response.status} ${errorText}`);
    }

    const taskStatus: ManusTaskStatus = await response.json();
    console.log(`[Manus] Poll attempt ${attempts}: status = ${taskStatus.status}`);

    if (taskStatus.status === 'completed') {
      console.log('[Manus] Task completed! Parsing result...');
      return parseManusResult(taskStatus.result);
    }

    if (taskStatus.status === 'failed') {
      console.error('[Manus] Task failed:', taskStatus.error);
      throw new Error(`Manus task failed: ${taskStatus.error || 'Unknown error'}`);
    }

    // Still pending or running, wait and try again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Task timeout: Analysis took longer than 10 minutes');
}

function parseManusResult(result: any): AnalysisResult {
  console.log('[Manus] Parsing result...');
  console.log('[Manus] Result type:', typeof result);
  
  // If result is already an object with the right structure, return it
  if (result && typeof result === 'object' && result.step1Summary) {
    console.log('[Manus] Result is already structured correctly');
    return result as AnalysisResult;
  }

  // If result is a string, try to parse it as JSON
  if (typeof result === 'string') {
    console.log('[Manus] Result is a string, attempting to parse...');
    
    // Try to extract JSON from markdown code blocks
    let jsonString = result;
    
    // Remove markdown code blocks if present
    const codeBlockMatch = result.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
      console.log('[Manus] Extracted JSON from code block');
    }
    
    try {
      const parsed = JSON.parse(jsonString);
      console.log('[Manus] Successfully parsed JSON');
      return parsed as AnalysisResult;
    } catch (parseError) {
      console.error('[Manus] Failed to parse JSON:', parseError);
      console.error('[Manus] Raw result:', result.substring(0, 500));
      
      // Return a fallback structure
      return {
        step1Summary: 'Failed to parse Manus response',
        step2Summary: 'The response was not in the expected JSON format',
        inaccuracies: [{
          title: 'Analysis Parsing Error',
          description: 'Manus returned a response that could not be parsed. Raw response: ' + result.substring(0, 200),
          priority: 'HIGH',
          impact: 'Unable to complete analysis',
          recommendation: 'Check Manus API response format'
        }],
        strengths: [],
        overallAssessment: 'Analysis failed due to parsing error'
      };
    }
  }

  // Unexpected result format
  console.error('[Manus] Unexpected result format:', result);
  return {
    step1Summary: 'Unexpected response format',
    step2Summary: 'Manus returned an unexpected response type',
    inaccuracies: [],
    strengths: [],
    overallAssessment: 'Analysis completed but response format was unexpected'
  };
}

