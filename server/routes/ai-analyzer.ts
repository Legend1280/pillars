import { Router } from 'express';

const router = Router();

// Define the exact JSON schema for Dr. Chen's analysis
const analysisSchema = {
  type: "json_schema",
  json_schema: {
    name: "OntologyAnalysis",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["status"],
      properties: {
        status: { enum: ["ok", "noop"] },
        healthScore: { type: "number", minimum: 0, maximum: 100 },
        summary: { type: "string", maxLength: 300 },
        criticalIssues: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "severity"],
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
            required: ["title", "priority"],
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

router.post('/analyze-ontology', async (req, res) => {
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
        formula: n.formula?.substring(0, 100), // Truncate long formulas
      })),
      outputs: nodes.filter((n: any) => n.type === 'output').map((n: any) => n.id),
      criticalEdges: edges.filter((e: any) => e.weight >= 9).length,
    };

    // Dr. Sarah Chen's system prompt
    const systemPrompt = `You are Dr. Sarah Chen, healthcare finance expert analyzing MSO financial models.
Focus on: MSO requirements, financial completeness, ontological integrity, industry best practices.
Output ONLY valid JSON matching the schema. Keep responses concise.`;

    const userPrompt = `Analyze this MSO financial model ontology:

${JSON.stringify(ontologySummary, null, 2)}

Provide concise analysis with:
- healthScore (0-100)
- summary (2-3 sentences)
- criticalIssues (top 3-5, with severity)
- missingConnections (key missing relationships)
- recommendations (prioritized, with impact)
- strengths (what works well)

Reference actual node IDs. Be specific and actionable.`;

    // Call OpenAI with structured outputs
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
        model: 'gpt-4o-2024-08-06', // Required for structured outputs
        temperature: 0.7,
        max_tokens: 4000,
        response_format: analysisSchema, // Structured outputs
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

    // Parse the JSON response (guaranteed valid by structured outputs)
    const analysis = JSON.parse(analysisText);

    // If status is "noop", return a default response
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
});

export default router;

