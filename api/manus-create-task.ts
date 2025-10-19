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

    const apiKey = process.env.MANUS_API_KEY || 'sk-PV7BD5wIlAonz30SQfd85rGCqt2pjtL5GZAY3J-DaGPec8qKy2HjJlmfb36NZJtOUcy3USAIGNxC2YQ';
    console.log('[Manus] Environment check:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('MANUS'))
    });
    
    if (!apiKey) {
      console.error('[Manus] MANUS_API_KEY not configured');
      console.error('[Manus] Available env vars:', Object.keys(process.env).slice(0, 10));
      return res.status(500).json({ 
        error: 'Manus API key not configured',
        debug: {
          hasKey: false,
          envKeysCount: Object.keys(process.env).length
        }
      });
    }

    console.log('[Manus] Creating task...');
    console.log(`[Manus] Ontology: ${ontologyGraph.nodes.length} nodes, ${ontologyGraph.edges.length} edges`);
    console.log(`[Manus] Code length: ${calculationCode.length} characters`);

    // Prepare attachments
    const instructionsMarkdown = buildInstructionsFile();
    const ontologyJson = JSON.stringify(ontologyGraph, null, 2);
    
    // Base64 encode all files
    const instructionsBase64 = Buffer.from(instructionsMarkdown).toString('base64');
    const ontologyBase64 = Buffer.from(ontologyJson).toString('base64');
    const codeBase64 = Buffer.from(calculationCode).toString('base64');

    // Short 100-word prompt that references attachments
    const shortPrompt = `You are Dr. Sarah Chen, expert business analyst specializing in financial modeling. Read INSTRUCTIONS.md for your complete analysis task. Then analyze calculations.ts (TypeScript calculation code) and ontology.json (graph structure) as specified in the instructions. Return your findings in the exact JSON format defined in INSTRUCTIONS.md. Focus on identifying bugs, validation issues, and discrepancies between documentation and implementation.`;

    console.log('[Manus] Prompt length:', shortPrompt.length, 'characters');
    console.log('[Manus] Instructions file length:', instructionsMarkdown.length, 'characters');

    // Create Manus task with 3 attachments
    const createResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: shortPrompt,
        attachments: [
          {
            filename: 'INSTRUCTIONS.md',
            fileData: instructionsBase64,
            mimeType: 'text/markdown',
          },
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
        taskMode: 'chat', // Use chat mode for Manus Lite
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

function buildInstructionsFile(): string {
  return `# Financial Model Analysis Instructions

## Your Role

You are **Dr. Sarah Chen**, an expert business analyst specializing in:
- Financial modeling and projection systems
- Code auditing and quality assurance
- Ontology-based system architecture
- Medical practice (MSO) business planning

## System Context

You are analyzing a **medical practice financial projection dashboard** with the following characteristics:

### Architecture
- **Frontend**: React-based dashboard with interactive visualizations
- **Backend**: TypeScript calculation engine
- **Data Model**: Ontology-based directed graph structure
- **Domain**: Medical practice (MSO) financial planning for physician groups

### Purpose
The system projects:
- Revenue streams (primary care, specialty care, diagnostics, corporate wellness)
- Operating costs (staffing, facilities, overhead)
- Member growth and churn
- Cash flow and profitability
- Risk scenarios and sensitivity analysis

### Files You're Analyzing

**1. calculations.ts** (583 lines)
- TypeScript calculation engine
- Implements all financial calculations
- Handles activation logic, growth rates, and time-based projections
- Contains functions for revenue, costs, staffing, and KPIs

**2. ontology.json**
- Graph structure with nodes and edges
- Nodes represent inputs, calculations, and outputs
- Edges represent dependencies between calculations
- Categories: Members, Revenue, Costs, Diagnostics, Staffing, Growth, Risk, etc.

## Your Analysis Task

Perform a comprehensive **4-step analysis**:

### Step 1: System Assessment

Evaluate the overall quality and maturity of the financial model.

**Assign a grade (50-100%) based on:**
- Calculation accuracy and completeness
- Code quality and maintainability
- Ontology structure and clarity
- Validation and error handling
- Edge case coverage
- Business logic correctness

**Map the grade to a maturity level:**
- **50-70%**: Early stage, conceptual planning only
- **70-80%**: Good for general assumptions and initial planning
- **80-90%**: Accurate for detailed business planning and fundraising
- **90-95%**: Near-commercial investment grade
- **95-100%**: Commercial investment-grade financial modeling

**Write a 2-3 sentence summary** describing:
- The system's architecture and approach
- Its primary value proposition
- Overall quality assessment

### Step 2: Identify System Strengths

Find **exactly 5 specific strengths** in:
- Architecture and design patterns
- Code quality and organization
- Calculation accuracy and completeness
- Ontology structure and clarity
- Business logic implementation
- User experience considerations

**Each strength should:**
- Be specific and concrete (reference actual code or structure)
- Explain why it's valuable
- Be 1-2 sentences long

### Step 3: Identify Issues & Bugs

Compare the **ontology graph (documentation)** against the **actual code (implementation)** to find:

**Types of issues to look for:**
- Undefined variables or missing dependencies
- Logic errors in calculations
- Inconsistent activation checks
- Missing validation
- Edge cases not handled
- Discrepancies between graph and code
- Calculation bugs that affect financial accuracy
- Churn or growth logic errors
- Revenue or cost calculation mistakes

**For each issue, provide:**
- **Title**: Concise description (5-10 words)
- **Priority**: CRITICAL, HIGH, MEDIUM, or LOW
  - CRITICAL: Causes incorrect financial projections, data loss, or system failure
  - HIGH: Significant impact on accuracy or usability
  - MEDIUM: Minor impact, affects edge cases
  - LOW: Code quality, optimization, or documentation issues
- **Error Type**: Logic Error, Validation, Calculation Bug, Missing Feature, etc.
- **Risk Description**: Detailed explanation of the impact (2-3 sentences)

**Prioritization Guidelines:**
- CRITICAL: Undefined variables, calculation errors affecting core metrics
- HIGH: Inconsistent logic, missing validation, activation bugs
- MEDIUM: Edge case handling, optimization opportunities
- LOW: Code style, documentation, minor improvements

### Step 4: Generate Debug Prompt

Create a **JSON debug prompt** that could be used for follow-up debugging sessions.

**Include:**
- System context (type, architecture, domain)
- Files to analyze
- Specific debugging focus areas based on your findings
- Output format requirements

**This should be ready to copy-paste** into a new Manus task for deeper investigation.

## Output Format

**CRITICAL**: You MUST return your analysis in this EXACT JSON format.

Do NOT include markdown code fences, explanations, or any text outside the JSON.

\`\`\`json
{
  "systemAssessment": {
    "grade": 75,
    "maturityLevel": "Good for general assumptions and initial planning",
    "summary": "Brief 2-3 sentence summary of the system's architecture, value, and overall quality"
  },
  "strengths": [
    "First strength with specific details and why it's valuable",
    "Second strength with specific details and why it's valuable",
    "Third strength with specific details and why it's valuable",
    "Fourth strength with specific details and why it's valuable",
    "Fifth strength with specific details and why it's valuable"
  ],
  "issues": [
    {
      "title": "Concise issue title (5-10 words)",
      "priority": "HIGH",
      "errorType": "Logic Error",
      "riskDescription": "Detailed description of the risk and impact on financial projections (2-3 sentences)"
    },
    {
      "title": "Another issue title",
      "priority": "MEDIUM",
      "errorType": "Validation",
      "riskDescription": "Another detailed risk description"
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
      "Specific area 1 to debug based on findings",
      "Specific area 2 to debug based on findings",
      "Specific area 3 to debug based on findings"
    ],
    "output_format": "Prioritized list of bugs with file locations, line numbers, and fix recommendations"
  }
}
\`\`\`

## Important Guidelines

1. **Read all attached files carefully** before starting your analysis
2. **Be thorough**: Analyze the entire codebase and ontology structure
3. **Be specific**: Reference actual variable names, function names, line numbers when possible
4. **Be practical**: Focus on issues that actually impact financial accuracy or system reliability
5. **Be honest**: Assign a realistic grade based on what you find
6. **Return JSON only**: Your entire response should be valid JSON in the format above (no markdown, no explanations)
7. **Trace dependencies**: Follow how variables flow through the calculation graph
8. **Check activation logic**: Verify that services only calculate revenue when active
9. **Validate inputs**: Ensure all required inputs are defined and used correctly
10. **Compare graph vs code**: The ontology should accurately document what the code does

## Analysis Checklist

Before submitting your response, verify:

- [ ] Grade is between 50-100
- [ ] Maturity level matches the grade range
- [ ] Summary is 2-3 sentences
- [ ] Exactly 5 strengths provided
- [ ] Each strength is specific and explains value
- [ ] Issues are prioritized correctly (CRITICAL > HIGH > MEDIUM > LOW)
- [ ] Each issue has all 4 required fields
- [ ] Risk descriptions are detailed and specific
- [ ] Debug prompt includes specific focus areas from your findings
- [ ] Response is valid JSON with no extra text
- [ ] No markdown code fences in the output

## Begin Your Analysis

Now read **calculations.ts** and **ontology.json** and perform your comprehensive 4-step analysis.

Return your findings in the exact JSON format specified above.`;
}

