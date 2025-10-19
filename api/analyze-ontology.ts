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
    const { nodes, edges, stats, calculationCode, validationPackage } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ error: 'Missing nodes or edges in request body' });
    }

    if (!calculationCode) {
      return res.status(400).json({ error: 'Missing calculation code in request body' });
    }

    console.log('🧠 Dr. Chen performing enhanced 3-step business analyst review...');
    console.log(`📊 Stats: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);
    console.log(`💻 Calculation code: ${calculationCode ? `${calculationCode.length} characters` : 'not provided'}`);
    console.log(`✅ Validation package: ${validationPackage ? 'included' : 'not included'}`);

    const systemPrompt = `You are Dr. Sarah Chen, a senior business analyst and healthcare finance expert specializing in MSO financial model audits.

Your role is to perform a rigorous 3-step audit focusing on MATHEMATICAL CORRECTNESS and BUSINESS LOGIC, not just code syntax.

**STEP 1: Assess the Ontology Graph (Relationship Validation)**
Review the documented calculation graph and validate:
- Do the relationships (edges) make business sense?
- Are there missing dependencies? (e.g., if code uses variable X to calculate Y, is there an edge X → Y?)
- Are there spurious edges? (edges that don't exist in actual code)
- Is the documentation complete and accurate?

**STEP 2: Assess the Actual Calculations (Formula & Logic Validation)**
Audit the TypeScript calculation functions for:

A. **Formula Correctness** - Compare ontology formulas vs. code formulas:
   - Are the operators correct? (× not +, ÷ not -)
   - Are all terms present? (revenue = price × volume, not just price)
   - Is the order of operations correct?
   - Are percentages handled correctly? (divide by 100)

B. **Logic Correctness** - Check business logic:
   - Activation: Do services start at the right month?
   - Accumulation: Do cumulative values carry forward correctly?
   - Boundaries: Are edge cases handled? (negative values, zero division)
   - Dependencies: Does the function use ALL required inputs?

C. **Mathematical Consistency**:
   - Do totals equal sum of parts? (totalRevenue = primary + specialty + corporate + diagnostics)
   - Do member balances work? (active = previous + new - churned - converted)
   - Are growth rates applied correctly? (compound vs. linear)

**STEP 3: Identify Inaccuracies (Prioritized by Business Impact)**

Focus on finding REAL PROBLEMS that affect accuracy:

- **CRITICAL**: Wrong formula produces incorrect numbers
  Example: "Revenue uses addition instead of multiplication"
  Example: "Churn is calculated but not subtracted from member count"
  Example: "Missing term in formula (forgot to subtract conversions)"

- **HIGH**: Formula is correct but missing business logic
  Example: "Conversion rate not applied to specialty member growth"
  Example: "Activation check missing (service starts before intended month)"
  
- **MEDIUM**: Documentation doesn't match working code
  Example: "Graph shows formula A but code implements formula B (both mathematically valid)"
  Example: "Missing edges in graph but code works correctly"

- **LOW**: Minor documentation gaps that don't affect calculations
  Example: "Graph could show intermediate calculation nodes for clarity"

**VALIDATION RULES TO PREVENT FALSE POSITIVES:**

1. **Variable Names**: Check exact names before reporting "undefined"
   - Variables may have suffixes: "echoVolumeMonthly" not "echoVolume"
   - Check the TypeScript interface for actual names

2. **Formula Equivalence**: These are the SAME:
   - "a × b" === "b × a" (commutative)
   - "a + b + c" === "c + a + b" (order doesn't matter for addition)
   - "Math.round(x)" is just rounding, not a different formula

3. **Implementation Details**: Don't report these as bugs:
   - "Math.max(0, x)" is boundary protection, not wrong logic
   - "isActive(month, start)" is activation check, not missing logic
   - Variable names in code vs. graph (primaryMembers vs. activePrimaryMembers)

4. **Verify Before Reporting**: For each potential issue:
   - Is the variable actually undefined? Check the TypeScript interface
   - Is the formula actually wrong? Compare operators and terms
   - Is the logic actually missing? Check if it's implemented differently
   - Would this actually cause incorrect results?

**OUTPUT REQUIREMENTS:**

- Be specific: Reference actual node IDs, function names, and line numbers
- Be accurate: Only report real issues that affect calculations
- Be actionable: Provide clear recommendations to fix
- Be concise: 3-4 sentences per summary, focused findings only

Think like a business analyst auditing a financial model for accuracy. Your goal is to catch mathematical errors and logic bugs that would produce wrong financial projections.`;

    // Build comprehensive analysis package
    const analysisPackage = {
      ontologyGraph: {
        stats,
        nodes: nodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          label: n.label,
          formula: n.formula,
          description: n.description
        })),
        edges: edges.map((e: any) => ({
          source: e.source,
          target: e.target,
          label: e.label
        }))
      },
      actualCalculations: {
        summary: 'Full calculations.ts file provided for analysis',
        fullCode: calculationCode
      },
      validationData: validationPackage || {
        note: "Validation package not provided - using basic analysis"
      }
    };

    const userPrompt = `Perform a complete 3-step business analyst audit of this MSO financial model.

${validationPackage ? `
## PRE-VALIDATED DATA

I've already checked these formulas and logic:

**Formula Validations (${validationPackage.summary.totalFormulas}):**
${validationPackage.formulas.map((f: any) => `
- ${f.nodeName}
  Ontology: ${f.ontologyFormula}
  Code: ${f.codeFormula}
  Match: ${f.match ? '✅' : '❌'}
`).join('')}

**Relationship Validations (${validationPackage.summary.totalRelationships}):**
${validationPackage.relationships.map((r: any) => `
- ${r.source} → ${r.target}
  Logic: ${r.businessLogic}
  Valid: ${r.isValid ? '✅' : '❌'}
`).join('')}

**Logic Checks (${validationPackage.summary.totalLogicChecks}):**
${validationPackage.logicChecks.map((l: any) => `
- ${l.functionName} (${l.checkType})
  ${l.description}
  Passed: ${l.passed ? '✅' : '❌'}
`).join('')}

Use this pre-validated data to focus your analysis on REAL issues, not false positives.
` : ''}

## COMPLETE MODEL DATA

${JSON.stringify(analysisPackage, null, 2)}

## YOUR ANALYSIS

Provide your analysis with:

**step1Summary**: 3-4 sentences on ontology graph quality (relationships, completeness, documentation)

**step2Summary**: 3-4 sentences on calculation code quality (formulas, logic, correctness)

**inaccuracies**: Array of REAL issues found (not false positives), each with:
  - title: Short descriptive title
  - description: What's wrong (be specific, reference node IDs and function names)
  - priority: CRITICAL (wrong math), HIGH (missing logic), MEDIUM (doc mismatch), LOW (minor gaps)
  - impact: Business impact of this issue
  - recommendation: Specific action to fix it

**strengths**: Array of strings noting what's done well

**overallAssessment**: 3-4 sentences with final recommendations

Focus on mathematical correctness and business logic. Avoid false positives.`;

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
        temperature: 0.2,  // Even lower for more analytical precision
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

    console.log('✅ Dr. Chen enhanced 3-step analysis complete');

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

