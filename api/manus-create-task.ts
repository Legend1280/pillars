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

    const apiKey = process.env.MANUS_API_KEY;
    if (!apiKey) {
      console.error('MANUS_API_KEY not configured');
      return res.status(500).json({ error: 'Manus API key not configured' });
    }

    console.log('[Manus] Creating task...');
    console.log(`[Manus] Ontology: ${ontologyGraph.nodes.length} nodes, ${ontologyGraph.edges.length} edges`);
    console.log(`[Manus] Code length: ${calculationCode.length} characters`);

    // Prepare attachments (Base64 encode the files)
    const ontologyJson = JSON.stringify(ontologyGraph, null, 2);
    const ontologyBase64 = Buffer.from(ontologyJson).toString('base64');
    const codeBase64 = Buffer.from(calculationCode).toString('base64');

    // Build concise prompt (under 3000 chars) that references attachments
    const prompt = buildManusPrompt();

    // Create Manus task with attachments
    const createResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        attachments: [
          {
            filename: 'calculations.ts',
            fileData: codeBase64,
            mimeType: 'text/typescript',
          },
          {
            filename: 'ontology.json',
            fileData: ontologyBase64,
            mimeType: 'application/json',
          },
        ],
        taskMode: 'agent',
        agentProfile: 'quality', // Use quality profile for thorough analysis
        hideInTaskList: true,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[Manus] Task creation failed:', errorText);
      return res.status(500).json({ error: 'Failed to create Manus task', details: errorText });
    }

    const taskData = await createResponse.json();
    console.log('[Manus] Task created:', taskData.task_id);

    // Return task_id immediately - no waiting!
    return res.status(200).json({
      task_id: taskData.task_id,
      task_url: taskData.task_url,
    });

  } catch (error) {
    console.error('[Manus] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function buildManusPrompt(): string {
  return `# Financial Model Analysis Task

You are Dr. Sarah Chen, an expert business analyst specializing in financial modeling and code auditing.

## Task Overview

Analyze the attached files to audit a medical practice (MSO) financial projection system:

**Attached Files:**
1. **calculations.ts** - The actual TypeScript calculation code (583 lines)
2. **ontology.json** - The ontology graph structure showing nodes, edges, and dependencies

## System Context

- **Type**: Ontology-based financial projection dashboard
- **Architecture**: React frontend + TypeScript calculations + directed graph data model  
- **Domain**: Medical practice (MSO) financial planning for physician groups
- **Purpose**: Project revenue, costs, staffing, and profitability during practice launch and growth

## Your Analysis Task

Perform a comprehensive 4-step analysis:

### Step 1: System Assessment
- Evaluate the overall quality and maturity of the financial model
- Assign a grade (50-100%) based on accuracy, completeness, and reliability
- Map the grade to a maturity level:
  * 50-70%: Early stage, conceptual planning
  * 70-80%: Good for general assumptions and initial planning
  * 80-90%: Accurate for detailed business planning
  * 90-95%: Near-commercial investment grade
  * 95-100%: Commercial investment-grade financial modeling

### Step 2: Identify System Strengths
- Find 5 specific strengths in the architecture, code quality, or modeling approach
- Focus on what makes this system valuable and reliable

### Step 3: Identify Issues & Bugs
- Compare the ontology graph (documentation) against the actual code (implementation)
- Find discrepancies, bugs, validation issues, edge cases, and calculation errors
- Prioritize by risk level: CRITICAL, HIGH, MEDIUM, LOW
- For each issue, specify:
  * Title (concise description)
  * Priority level
  * Error type (Logic Error, Validation, Calculation Bug, etc.)
  * Risk description (impact on financial projections)

### Step 4: Generate Debug Prompt
- Create a JSON prompt that could be used to debug specific issues
- Include file paths, debugging focus areas, and output requirements
- This should be a ready-to-use prompt for follow-up analysis

## Output Format

**CRITICAL**: You MUST return your analysis in this EXACT JSON format:

\`\`\`json
{
  "systemAssessment": {
    "grade": 75,
    "maturityLevel": "Good for general assumptions and initial planning",
    "summary": "Brief 2-3 sentence summary of the system's architecture, value, and overall quality"
  },
  "strengths": [
    "First strength with specific details",
    "Second strength with specific details",
    "Third strength with specific details",
    "Fourth strength with specific details",
    "Fifth strength with specific details"
  ],
  "issues": [
    {
      "title": "Issue title",
      "priority": "HIGH",
      "errorType": "Logic Error",
      "riskDescription": "Detailed description of the risk and impact"
    }
  ],
  "debugPrompt": {
    "context": {
      "system_type": "Ontology-based financial projection dashboard",
      "architecture": "React frontend + TypeScript calculations + directed graph data model",
      "domain": "Medical practice (MSO) financial planning"
    },
    "files_to_analyze": [
      "calculations.ts",
      "ontology.json"
    ],
    "debug_focus": [
      "Specific area 1 to debug",
      "Specific area 2 to debug"
    ],
    "output_format": "Prioritized list of bugs with file locations and fix recommendations"
  }
}
\`\`\`

## Important Guidelines

1. **Read the attached files carefully** - All code and structure is in the attachments
2. **Be thorough**: Analyze the entire codebase and ontology structure
3. **Be specific**: Reference actual variable names, function names when possible
4. **Be practical**: Focus on issues that actually impact financial accuracy
5. **Be honest**: Assign a realistic grade based on what you find
6. **Return JSON only**: Your entire response should be valid JSON in the format above

Begin your analysis now by reading the attached files.`;
}

