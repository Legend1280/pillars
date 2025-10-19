import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the exact JSON schema for Dr. Chen's 3-step analysis
const analysisSchema = {
  type: "json_schema",
  json_schema: {
    name: "BusinessAnalystAudit",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["step1Summary", "step2Summary", "inaccuracies", "strengths", "overallAssessment"],
      properties: {
        step1Summary: { 
          type: "string",
          description: "Summary of ontology graph assessment (3-4 sentences)"
        },
        step2Summary: { 
          type: "string",
          description: "Summary of actual calculation code assessment (3-4 sentences)"
        },
        inaccuracies: {
          type: "array",
          description: "List of inaccuracies found between graph and code, prioritized by risk",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "description", "priority", "impact", "recommendation"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: { enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
              impact: { type: "string" },
              recommendation: { type: "string" }
            }
          }
        },
        strengths: {
          type: "array",
          description: "List of strengths in the implementation",
          items: { type: "string" }
        },
        overallAssessment: {
          type: "string",
          description: "Overall assessment and final recommendations (3-4 sentences)"
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
    const { nodes, edges, stats, calculationCode, calculationSnippets } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ error: 'Missing nodes or edges in request body' });
    }

    if (!calculationCode) {
      return res.status(400).json({ error: 'Missing calculation code in request body' });
    }

    console.log('🧠 Dr. Chen performing 3-step business analyst review...');
    console.log(`📊 Stats: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);
    console.log(`💻 Calculation snippets: ${calculationSnippets?.length || 0} functions`);

    // Build comprehensive analysis package
    const analysisPackage = {
      ontologyGraph: {
        stats,
        nodesByType: {
          input: nodes.filter((n: any) => n.type === 'input').length,
          derived: nodes.filter((n: any) => n.type === 'derived').length,
          calculation: nodes.filter((n: any) => n.type === 'calculation').length,
          output: nodes.filter((n: any) => n.type === 'output').length,
        },
        sampleNodes: {
          inputs: nodes.filter((n: any) => n.type === 'input').slice(0, 15).map((n: any) => ({
            id: n.id,
            label: n.label,
            description: n.description
          })),
          calculations: nodes.filter((n: any) => n.type === 'calculation').slice(0, 20).map((n: any) => ({
            id: n.id,
            label: n.label,
            formula: n.formula,
            description: n.description
          })),
          outputs: nodes.filter((n: any) => n.type === 'output').slice(0, 10).map((n: any) => ({
            id: n.id,
            label: n.label,
            description: n.description
          }))
        },
        edgeSummary: {
          totalEdges: edges.length,
          sampleEdges: edges.slice(0, 20).map((e: any) => ({
            from: e.source,
            to: e.target,
            label: e.label
          }))
        }
      },
      actualCalculations: {
        summary: `${calculationSnippets?.length || 0} key calculation functions extracted`,
        functions: calculationSnippets || [],
        fullCode: calculationCode
      }
    };

    const systemPrompt = `You are Dr. Sarah Chen, a senior business analyst and healthcare finance expert specializing in MSO financial model audits.

Your role is to perform a rigorous 3-step audit:

**STEP 1: Assess the Ontology Graph**
- Review the documented calculation graph (nodes, edges, formulas)
- Evaluate completeness, logical flow, and documentation quality
- Note any missing connections or unclear relationships

**STEP 2: Assess the Actual Calculations**
- Audit the TypeScript calculation functions provided
- Verify mathematical correctness and business logic
- Check for:
  * Undefined variables or missing inputs
  * Logic errors in formulas
  * Incorrect activation checks (isActive functions)
  * Missing churn calculations or carryover logic
  * Hardcoded values that should be inputs

**STEP 3: Identify Inaccuracies**
Compare what the graph documents vs. what the code actually does. Prioritize by risk:

- **CRITICAL**: Calculation bugs that produce wrong numbers (missing variables, broken math, logic errors)
- **HIGH**: Graph shows wrong formula or misleading documentation
- **MEDIUM**: Graph missing edges but calculation works (incomplete documentation)
- **LOW**: Minor documentation gaps or style issues

Focus on finding actual problems that affect accuracy, not just documentation completeness.

Provide specific, actionable findings with clear recommendations.`;

    const userPrompt = `Perform a complete 3-step business analyst audit of this MSO financial model:

${JSON.stringify(analysisPackage, null, 2)}

Provide your analysis with:

**step1Summary**: 3-4 sentences summarizing your assessment of the ontology graph documentation
**step2Summary**: 3-4 sentences summarizing your assessment of the actual calculation code
**inaccuracies**: Array of issues found, each with:
  - title: Short descriptive title
  - description: What's wrong (be specific, reference node IDs and function names)
  - priority: CRITICAL, HIGH, MEDIUM, or LOW
  - impact: Business impact of this issue
  - recommendation: Specific action to fix it

**strengths**: Array of strings noting what's done well
**overallAssessment**: 3-4 sentences with final recommendations

Be thorough but concise. Reference actual node IDs and function names. Think like a business analyst auditing a financial model for accuracy.`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }

    console.log('📤 Sending request to OpenAI API...');

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
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('✅ Dr. Chen 3-step analysis complete');

    const analysis = JSON.parse(analysisText);

    // Log summary for debugging
    console.log(`📋 Found ${analysis.inaccuracies?.length || 0} inaccuracies`);
    console.log(`💪 Found ${analysis.strengths?.length || 0} strengths`);

    res.json(analysis);
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

