import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the exact JSON schema for Dr. Chen's analysis
const analysisSchema = {
  type: "json_schema",
  json_schema: {
    name: "OntologyAnalysis",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["status", "healthScore", "summary", "criticalIssues", "inaccuracies", "recommendations", "strengths"],
      properties: {
        status: { enum: ["ok", "noop"] },
        healthScore: { type: "number", minimum: 0, maximum: 100 },
        summary: { type: "string", maxLength: 400 },
        criticalIssues: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "description", "severity", "category"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              severity: { enum: ["critical", "high", "medium", "low"] },
              category: { enum: ["calculation_bug", "graph_inaccuracy", "missing_documentation", "logic_error"] }
            }
          }
        },
        inaccuracies: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["nodeId", "graphSays", "codeDoes", "risk"],
            properties: {
              nodeId: { type: "string" },
              graphSays: { type: "string" },
              codeDoes: { type: "string" },
              risk: { enum: ["critical", "high", "medium", "low"] }
            }
          }
        },
        recommendations: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "description", "priority", "impact", "fixType"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: { enum: ["critical", "high", "medium", "low"] },
              impact: { type: "string" },
              fixType: { enum: ["fix_calculation", "update_graph", "add_documentation", "refactor_logic"] }
            }
          }
        },
        strengths: {
          type: "array",
          items: { type: "string" }
        }
      }
    },
    strict: true
  }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nodes, edges, stats, calculationCode } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ error: 'Missing nodes or edges in request body' });
    }

    console.log('🧠 Dr. Chen performing 3-step business analyst review...');
    console.log(`📊 Stats: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);

    // Build comprehensive analysis package
    const analysisPackage = {
      stats,
      ontologyGraph: {
        nodesByType: {
          input: nodes.filter((n: any) => n.type === 'input').length,
          derived: nodes.filter((n: any) => n.type === 'derived').length,
          calculation: nodes.filter((n: any) => n.type === 'calculation').length,
          output: nodes.filter((n: any) => n.type === 'output').length,
        },
        inputs: nodes.filter((n: any) => n.type === 'input').map((n: any) => ({
          id: n.id,
          label: n.label
        })),
        calculations: nodes.filter((n: any) => n.type === 'calculation').map((n: any) => ({
          id: n.id,
          label: n.label,
          formula: n.formula,
          codeSnippet: n.codeSnippet?.substring(0, 200)
        })),
        outputs: nodes.filter((n: any) => n.type === 'output').map((n: any) => ({
          id: n.id,
          label: n.label
        })),
        edges: edges.map((e: any) => ({
          from: e.from,
          to: e.to,
          label: e.label
        }))
      },
      calculationCode: calculationCode || "Not provided"
    };

    const systemPrompt = `You are Dr. Sarah Chen, a senior business analyst and healthcare finance expert.

Your role is to audit MSO financial models using a rigorous 3-step process:

**STEP 1: Assess the Ontology Graph**
- Review documented nodes, edges, and relationships
- Check for completeness and logical flow
- Identify missing connections in documentation

**STEP 2: Assess the Actual Calculations**
- Audit the calculation formulas and code snippets
- Verify mathematical correctness
- Check for undefined variables, logic errors, missing inputs
- Validate that calculations match business requirements

**STEP 3: Identify Inaccuracies**
- Compare what the graph documents vs. what the code actually does
- Flag discrepancies and prioritize by risk:
  * CRITICAL: Calculation bugs (wrong math, missing variables, broken logic)
  * HIGH: Graph shows wrong formula (misleading documentation)
  * MEDIUM: Missing graph edges but calculation works (incomplete documentation)
  * LOW: Minor documentation gaps

Focus on finding where the model is actually broken or misleading, not just incomplete.

Output ONLY valid JSON matching the schema. Be specific and actionable.`;

    const userPrompt = `Perform a complete 3-step business analyst audit of this MSO financial model:

${JSON.stringify(analysisPackage, null, 2)}

Provide your analysis with:

- **healthScore** (0-100): Based on calculation correctness AND documentation accuracy
- **summary** (3-4 sentences): Overview of your 3-step findings
- **criticalIssues** (top 5): Prioritize actual calculation bugs over documentation issues
  * Include category: calculation_bug, graph_inaccuracy, missing_documentation, or logic_error
  * Include severity: critical, high, medium, low
- **inaccuracies** (key discrepancies): Where graph documentation doesn't match actual code
  * For each: nodeId, what graph says, what code actually does, risk level
- **recommendations** (prioritized): Actionable fixes with clear fixType
  * fixType: fix_calculation, update_graph, add_documentation, or refactor_logic
- **strengths**: What's working well (both calculations AND documentation)

Be thorough but concise. Reference actual node IDs. Think like a business analyst auditing a financial model for accuracy.`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        temperature: 0.3,  // Lower temperature for more analytical, consistent results
        max_tokens: 4000,
        response_format: analysisSchema,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('✅ Dr. Chen 3-step analysis complete');

    const analysis = JSON.parse(analysisText);

    if (analysis.status === 'noop') {
      return res.json({
        status: 'noop',
        healthScore: 0,
        summary: 'No useful analysis could be generated.',
        criticalIssues: [],
        inaccuracies: [],
        recommendations: [],
        strengths: []
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

