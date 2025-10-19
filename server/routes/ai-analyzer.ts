import { Router } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';

const router = Router();

// Define the exact JSON schema for Dr. Chen's 3-step analysis
const analysisSchema = {
  type: "json_schema",
  json_schema: {
    name: "ThreeStepAnalysis",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["status", "step1Summary", "step2Summary", "inaccuracies", "strengths", "overallAssessment"],
      properties: {
        status: { enum: ["ok", "noop"] },
        step1Summary: { 
          type: "string",
          description: "Summary of ontology graph assessment - what the documentation says"
        },
        step2Summary: { 
          type: "string",
          description: "Summary of actual calculation code assessment - what the implementation does"
        },
        inaccuracies: {
          type: "array",
          description: "Discrepancies between documentation and implementation, prioritized by risk",
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
          description: "What the implementation does well",
          items: { type: "string" }
        },
        overallAssessment: {
          type: "string",
          description: "Overall summary and conclusion"
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

    console.log('🧠 Dr. Chen performing 3-step business analyst audit...');
    console.log(`📊 Stats: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);

    // Read the actual calculation code from the filesystem
    let calculationCode = '';
    try {
      // In production on Vercel, the client code is in the dist folder
      // Try multiple possible paths
      const possiblePaths = [
        join(process.cwd(), 'client/src/lib/calculations.ts'),
        join(process.cwd(), 'src/lib/calculations.ts'),
        join(__dirname, '../../client/src/lib/calculations.ts'),
      ];

      for (const path of possiblePaths) {
        try {
          calculationCode = await readFile(path, 'utf-8');
          console.log(`✅ Successfully read calculations.ts from: ${path}`);
          break;
        } catch (err) {
          // Try next path
          continue;
        }
      }

      if (!calculationCode) {
        throw new Error('Could not find calculations.ts in any expected location');
      }
    } catch (err) {
      console.error('❌ Error reading calculations.ts:', err);
      return res.status(500).json({ 
        error: 'Failed to read calculation code',
        message: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Build concise ontology summary
    const ontologySummary = {
      stats,
      nodesByType: {
        input: nodes.filter((n: any) => n.type === 'input').length,
        derived: nodes.filter((n: any) => n.type === 'derived').length,
        calculation: nodes.filter((n: any) => n.type === 'calculation').length,
        output: nodes.filter((n: any) => n.type === 'output').length,
      },
      sampleNodes: nodes.slice(0, 20).map((n: any) => ({
        id: n.id,
        label: n.label,
        type: n.type,
        formula: n.formula,
        dependencies: edges.filter((e: any) => e.target === n.id).map((e: any) => e.source),
      })),
      allCalculationNodes: nodes.filter((n: any) => n.type === 'calculation' || n.type === 'derived').map((n: any) => ({
        id: n.id,
        label: n.label,
        formula: n.formula,
      })),
    };

    // Dr. Sarah Chen's system prompt for 3-step analysis
    const systemPrompt = `You are Dr. Sarah Chen, a senior healthcare finance business analyst with 15+ years of experience auditing MSO financial models.

Your role is to perform a rigorous 3-step audit comparing documentation against actual implementation to identify calculation inaccuracies.

CRITICAL INSTRUCTIONS:
1. You MUST compare the ontology graph formulas against the actual TypeScript code
2. Focus on finding REAL BUGS where documentation doesn't match implementation
3. Prioritize findings by risk: CRITICAL > HIGH > MEDIUM > LOW
4. Be specific - reference actual node IDs, variable names, and line numbers when possible
5. Output ONLY valid JSON matching the schema

RISK LEVELS:
- CRITICAL: Will cause major financial misstatements or system failures
- HIGH: Significant impact on accuracy, affects key metrics
- MEDIUM: Moderate impact, may cause confusion or minor errors
- LOW: Documentation gaps or minor inconsistencies with minimal impact`;

    const userPrompt = `Perform a 3-step Business Analyst audit of this MSO financial model:

**STEP 1: ASSESS THE ONTOLOGY GRAPH**
Review the ontology documentation below. What does it SAY the system should calculate?

Ontology Summary:
${JSON.stringify(ontologySummary, null, 2)}

**STEP 2: ASSESS THE ACTUAL CALCULATIONS**
Review the TypeScript implementation below. What does the code ACTUALLY calculate?

Calculation Code (calculations.ts):
\`\`\`typescript
${calculationCode}
\`\`\`

**STEP 3: IDENTIFY INACCURACIES**
Compare Step 1 vs Step 2. Where do they differ? What are the REAL BUGS?

For each inaccuracy:
- Title: Brief description
- Description: What's wrong (be specific - reference node IDs, variable names, line numbers)
- Priority: CRITICAL | HIGH | MEDIUM | LOW (based on financial impact)
- Impact: What happens because of this bug
- Recommendation: How to fix it

Also identify:
- Strengths: What the implementation does well
- Overall Assessment: Summary and conclusion

Output your analysis as JSON matching the schema.`;

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
        temperature: 0.3, // Lower temperature for more analytical consistency
        max_tokens: 8000, // Increased for detailed analysis
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

    console.log('✅ Dr. Chen 3-step analysis complete');

    // Parse the JSON response (guaranteed valid by structured outputs)
    const analysis = JSON.parse(analysisText);

    // If status is "noop", return a default response
    if (analysis.status === 'noop') {
      return res.json({
        status: 'noop',
        step1Summary: 'No useful analysis could be generated.',
        step2Summary: 'No useful analysis could be generated.',
        inaccuracies: [],
        strengths: [],
        overallAssessment: 'Analysis could not be completed.'
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

