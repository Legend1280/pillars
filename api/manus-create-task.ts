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

    // Build comprehensive context for Manus
    const prompt = buildManusPrompt(ontologyGraph, calculationCode);

    console.log('[Manus] Creating task...');
    console.log(`[Manus] Ontology: ${ontologyGraph.nodes.length} nodes, ${ontologyGraph.edges.length} edges`);
    console.log(`[Manus] Code length: ${calculationCode.length} characters`);

    // Create Manus task
    const createResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
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

function buildManusPrompt(ontologyGraph: OntologyGraph, calculationCode: string): string {
  const inputNodes = ontologyGraph.nodes.filter(n => n.type === 'input');
  const calculatedNodes = ontologyGraph.nodes.filter(n => n.type === 'calculated');
  const categories = [...new Set(ontologyGraph.nodes.map(n => n.category))];

  return `# Financial Model Analysis Task

You are Dr. Sarah Chen, an expert business analyst specializing in financial modeling and code auditing. Your task is to perform a comprehensive analysis of a medical practice (MSO) financial projection system.

## System Overview

**Type**: Ontology-based financial projection dashboard
**Architecture**: React frontend + TypeScript calculations + directed graph data model
**Domain**: Medical practice (MSO) financial planning for physician groups
**Purpose**: Project revenue, costs, staffing, and profitability during practice launch and growth phases

## Ontology Graph Structure

The system uses a directed graph to model relationships between inputs, calculations, and outputs:

- **Total Nodes**: ${ontologyGraph.nodes.length}
- **Input Nodes**: ${inputNodes.length} (user-configurable parameters)
- **Calculated Nodes**: ${calculatedNodes.length} (derived values)
- **Edges**: ${ontologyGraph.edges.length} (dependencies between nodes)
- **Categories**: ${categories.join(', ')}

**Ontology Graph (JSON)**:
\`\`\`json
${JSON.stringify(ontologyGraph, null, 2)}
\`\`\`

## Calculation Code (TypeScript)

This is the actual implementation that performs all financial calculations:

\`\`\`typescript
${calculationCode}
\`\`\`

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
  * Affected area (which part of the code/ontology)

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
      "/client/src/lib/calculations.ts",
      "/client/src/lib/calculationGraphEnhanced.ts"
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

1. **Be thorough**: Analyze the entire codebase and ontology structure
2. **Be specific**: Reference actual variable names, function names, and line numbers when possible
3. **Be practical**: Focus on issues that actually impact financial accuracy
4. **Be honest**: Assign a realistic grade based on what you find
5. **Return JSON only**: Your entire response should be valid JSON in the format above

Begin your analysis now.`;
}

