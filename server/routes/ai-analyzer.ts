import { Router } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

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

router.post('/analyze-ontology', async (req, res) => {
  try {
    const { nodes, edges, stats, calculationCode, calculationSnippets } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ error: 'Missing nodes or edges in request body' });
    }

    console.log('🧠 Dr. Chen performing 3-step business analyst review...');
    console.log(`📊 Stats: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);
    console.log(`💻 Calculation snippets: ${calculationSnippets?.length || 0} functions`);

    // Read the three key context documents
    let fullCalculationCode = calculationCode;
    let dataModelInterface = '';
    let calculationGraphCode = '';

    try {
      // Document 1: Full calculation implementation
      if (!fullCalculationCode) {
        const calculationsPath = join(process.cwd(), 'client', 'src', 'lib', 'calculations.ts');
        fullCalculationCode = readFileSync(calculationsPath, 'utf-8');
        console.log('📄 Loaded calculations.ts');
      }

      // Document 2: Data model interface
      const dataModelPath = join(process.cwd(), 'client', 'src', 'lib', 'data.ts');
      dataModelInterface = readFileSync(dataModelPath, 'utf-8');
      console.log('📄 Loaded data.ts (data model interface)');

      // Document 3: Calculation graph definition
      const graphPath = join(process.cwd(), 'client', 'src', 'lib', 'calculationGraph.ts');
      calculationGraphCode = readFileSync(graphPath, 'utf-8');
      console.log('📄 Loaded calculationGraph.ts');
    } catch (fileError) {
      console.error('⚠️ Error loading context files:', fileError);
      // Continue with whatever we have
    }

    // Build comprehensive analysis package with all three documents
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
      }
    };

    const systemPrompt = `You are Dr. Sarah Chen, a senior business analyst and healthcare finance expert specializing in MSO financial model audits.

Your role is to perform a rigorous 3-step audit of a financial projection dashboard for a medical practice.

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

## Your 3-Step Audit Process

**STEP 1: Assess the Ontology Graph**
- Review the documented calculation graph (nodes, edges, formulas)
- Evaluate completeness, logical flow, and documentation quality
- Note any missing connections or unclear relationships
- Check if the graph accurately represents the business logic

**STEP 2: Assess the Actual Calculations**
- Audit the TypeScript calculation functions provided
- Verify mathematical correctness and business logic
- Check for:
  * Undefined variables or missing inputs
  * Logic errors in formulas
  * Incorrect activation checks (isActive functions)
  * Missing churn calculations or carryover logic
  * Hardcoded values that should be inputs
  * Edge cases (e.g., services starting at different months)

**STEP 3: Identify Inaccuracies**
Compare what the graph documents vs. what the code actually does. Prioritize by risk:

- **CRITICAL**: Calculation bugs that produce wrong numbers (missing variables, broken math, logic errors)
- **HIGH**: Graph shows wrong formula or misleading documentation
- **MEDIUM**: Graph missing edges but calculation works (incomplete documentation)
- **LOW**: Minor documentation gaps or style issues

Focus on finding actual problems that affect accuracy, not just documentation completeness.

## Key Calculations to Validate

1. **Member Growth**
   - Primary member calculations (initial, intake, churn, carryover)
   - Specialty member calculations
   - Conversion from primary to specialty

2. **Revenue Calculations**
   - Primary membership revenue
   - Specialty revenue
   - Diagnostics revenue (Echo, CT, Labs with activation logic)
   - Corporate contract revenue

3. **Cost Calculations**
   - Startup costs (one-time and split across months)
   - Capital expenditures
   - Staffing costs (with different start months)
   - Equipment leases (with activation logic)
   - Fixed and variable costs

4. **Cash Flow & Profitability**
   - Net profit calculations
   - Cumulative cash flow
   - Break-even analysis

5. **Activation Logic**
   - Services starting at different months
   - Staff hiring schedules
   - Equipment lease start dates

Provide specific, actionable findings with clear recommendations.`;

    const userPrompt = `Perform a complete 3-step business analyst audit of this MSO financial model.

I'm providing you with THREE key context documents:

## DOCUMENT 1: Data Model Interface (DashboardInputs)

This defines all input parameters and their types:

\`\`\`typescript
${dataModelInterface}
\`\`\`

## DOCUMENT 2: Ontology Graph Structure

This is the documented calculation graph showing relationships:

\`\`\`json
${JSON.stringify(analysisPackage.ontologyGraph, null, 2)}
\`\`\`

## DOCUMENT 3: Calculation Graph Definition

This is the source code that defines the ontology graph:

\`\`\`typescript
${calculationGraphCode.substring(0, 15000)}
\`\`\`

## DOCUMENT 4: Actual Calculation Implementation

This is the TypeScript code that performs the actual calculations:

\`\`\`typescript
${fullCalculationCode}
\`\`\`

---

Now perform your 3-step audit and provide your analysis with:

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
        max_tokens: 6000,
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
});

export default router;

