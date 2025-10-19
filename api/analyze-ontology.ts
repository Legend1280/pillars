import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the exact JSON schema for Dr. Chen's analysis
const analysisSchema = {
  type: "json_schema",
  json_schema: {
    name: "OntologyAnalysis",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["status", "healthScore", "summary", "criticalIssues", "missingConnections", "recommendations", "strengths"],
      properties: {
        status: { enum: ["ok", "noop"] },
        healthScore: { type: "number", minimum: 0, maximum: 100 },
        summary: { type: "string", maxLength: 300 },
        criticalIssues: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "description", "severity"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              severity: { enum: ["high", "medium", "low"] }
            }
          }
        },
        missingConnections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["from", "to", "reason"],
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              reason: { type: "string" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "description", "priority", "impact"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: { enum: ["critical", "high", "medium", "low"] },
              impact: { type: "string" }
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
    const { nodes, edges, stats } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ error: 'Missing nodes or edges in request body' });
    }

    console.log('🧠 Dr. Chen analyzing ontological structure with GPT-4...');
    console.log(`📊 Stats: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);

    // Build concise ontology summary
    const ontologySummary = {
      stats,
      nodesByType: {
        input: nodes.filter((n: any) => n.type === 'input').length,
        derived: nodes.filter((n: any) => n.type === 'derived').length,
        calculation: nodes.filter((n: any) => n.type === 'calculation').length,
        output: nodes.filter((n: any) => n.type === 'output').length,
      },
      sampleInputs: nodes.filter((n: any) => n.type === 'input').slice(0, 10).map((n: any) => `${n.id}: ${n.label}`),
      calculations: nodes.filter((n: any) => n.type === 'calculation').map((n: any) => ({
        id: n.id,
        label: n.label,
        formula: n.formula?.substring(0, 100),
      })),
      outputs: nodes.filter((n: any) => n.type === 'output').map((n: any) => n.id),
      criticalEdges: edges.filter((e: any) => e.weight >= 9).length,
    };

    const systemPrompt = `You are Dr. Sarah Chen, healthcare finance expert analyzing MSO financial models.
You analyze BOTH the ontology graph structure (documented relationships) AND the actual calculation formulas (implementation).
Focus on: MSO requirements, financial completeness, ontological integrity, discrepancies between documentation and implementation, industry best practices.
Output ONLY valid JSON matching the schema. Keep responses concise.`;

    const userPrompt = `Analyze this MSO financial model:

${JSON.stringify(ontologySummary, null, 2)}

You are analyzing TWO aspects:
1. **Ontology Graph Structure**: The documented nodes and edges showing relationships
2. **Calculation Formulas**: The actual implementation logic in the formula and codeSnippet fields

Provide concise analysis with:
- healthScore (0-100) - based on BOTH graph completeness AND calculation correctness
- summary (2-3 sentences) - mention both structural and computational aspects
- criticalIssues (top 3-5, with severity) - include BOTH missing graph connections AND actual calculation errors
- missingConnections (key relationships) - focus on connections that are missing in BOTH graph AND calculations
- recommendations (prioritized, with impact) - prioritize actual calculation fixes over graph documentation
- strengths (what works well) - acknowledge both well-documented AND correctly implemented aspects

When identifying issues:
- If a connection exists in formulas but not in the graph: LOW priority (documentation issue)
- If a connection is missing in both graph AND formulas: HIGH priority (actual bug)
- If a formula has errors regardless of graph: CRITICAL priority

Reference actual node IDs. Be specific and actionable.`;

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
        temperature: 0.7,
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

    console.log('✅ Dr. Chen analysis complete (GPT-4)');

    const analysis = JSON.parse(analysisText);

    if (analysis.status === 'noop') {
      return res.json({
        status: 'noop',
        healthScore: 0,
        summary: 'No useful analysis could be generated.',
        criticalIssues: [],
        missingConnections: [],
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

