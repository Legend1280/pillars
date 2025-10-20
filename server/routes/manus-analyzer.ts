import { Router } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

/**
 * Manus API Integration for Ontology Analysis
 * 
 * This endpoint uses Manus AI to perform deep analysis of the financial model,
 * comparing the ontology graph documentation against the actual calculation code.
 * 
 * Updated: 2025-10-19 - Fixed to accept nodes/edges/stats format
 */

router.post('/analyze-ontology-manus', async (req, res) => {
  try {
    const { nodes, edges, stats } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ error: 'Missing required fields: nodes, edges' });
    }

    console.log('🤖 Manus AI performing deep ontology analysis...');
    console.log(`📊 Stats: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);

    // Read the key context files
    const calculationsPath = join(process.cwd(), 'client', 'src', 'lib', 'calculations.ts');
    const dataModelPath = join(process.cwd(), 'client', 'src', 'lib', 'data.ts');
    const graphPath = join(process.cwd(), 'client', 'src', 'lib', 'calculationGraph.ts');

    const calculationCode = readFileSync(calculationsPath, 'utf-8');
    const dataModelCode = readFileSync(dataModelPath, 'utf-8');
    const graphCode = readFileSync(graphPath, 'utf-8');

    console.log('📄 Loaded context files');

    // Build the analysis prompt for Manus
    const prompt = `You are Dr. Sarah Chen, a senior business analyst and healthcare finance expert.

Perform a rigorous 3-step audit of this MSO financial projection dashboard:

## STEP 1: Assess the Ontology Graph Documentation
Review the calculation graph structure (${stats.totalNodes} nodes, ${stats.totalEdges} edges).
Evaluate completeness, logical flow, and documentation quality.

## STEP 2: Assess the Actual Calculation Code
Audit the TypeScript implementation for:
- Mathematical correctness
- Undefined variables or missing inputs
- Logic errors in formulas
- Incorrect activation checks
- Missing churn/carryover logic
- Edge cases (services starting at different months)

## STEP 3: Identify Inaccuracies
Compare graph documentation vs actual code. Prioritize by risk:
- CRITICAL: Calculation bugs producing wrong numbers
- HIGH: Misleading documentation or wrong formulas
- MEDIUM: Missing edges but calculation works
- LOW: Minor documentation gaps

Provide your analysis in JSON format:

{
  "step1Summary": "3-4 sentences on ontology graph assessment",
  "step2Summary": "3-4 sentences on calculation code assessment",
  "inaccuracies": [
    {
      "title": "Short title",
      "description": "Specific issue with node IDs and function names",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "impact": "Business impact",
      "recommendation": "Specific fix"
    }
  ],
  "strengths": ["What's done well"],
  "overallAssessment": "3-4 sentences with final recommendations"
}

Be thorough, specific, and actionable.`;

    // Prepare attachments for Manus
    const attachments = [
      {
        filename: 'ontology-graph.json',
        fileData: Buffer.from(JSON.stringify({
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
        }, null, 2)).toString('base64'),
        mimeType: 'application/json'
      },
      {
        filename: 'calculations.ts',
        fileData: Buffer.from(calculationCode).toString('base64'),
        mimeType: 'text/plain'
      },
      {
        filename: 'data.ts',
        fileData: Buffer.from(dataModelCode).toString('base64'),
        mimeType: 'text/plain'
      },
      {
        filename: 'calculationGraph.ts',
        fileData: Buffer.from(graphCode).toString('base64'),
        mimeType: 'text/plain'
      }
    ];

    const manusApiKey = process.env.MANUS_API_KEY;
    
    if (!manusApiKey) {
      throw new Error('MANUS_API_KEY environment variable not set');
    }

    console.log('📤 Creating Manus task...');

    // Create Manus task
    const createResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': manusApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        attachments,
        taskMode: 'agent',
        agentProfile: 'quality',
        hideInTaskList: false,
        createShareableLink: true,
        locale: 'en-US'
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Manus API error:', errorText);
      throw new Error(`Manus API error: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.task_id;
    const taskUrl = createData.task_url;
    const shareUrl = createData.share_url;

    console.log(`✅ Manus task created: ${taskId}`);
    console.log(`🔗 Task URL: ${taskUrl}`);
    console.log(`🔗 Share URL: ${shareUrl}`);

    // Poll for task completion
    console.log('⏳ Waiting for Manus to complete analysis...');
    
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let attempts = 0;
    let taskComplete = false;
    let analysisResult = null;

    while (attempts < maxAttempts && !taskComplete) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      const statusResponse = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
        headers: {
          'API_KEY': manusApiKey,
        }
      });

      if (!statusResponse.ok) {
        console.error('❌ Error checking task status');
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`🔄 Attempt ${attempts}: Status = ${statusData.status || 'unknown'}`);

      if (statusData.status === 'completed' || statusData.result) {
        taskComplete = true;
        analysisResult = statusData.result;
        console.log('✅ Manus analysis complete!');
      } else if (statusData.status === 'failed' || statusData.error) {
        throw new Error(`Manus task failed: ${statusData.error || 'Unknown error'}`);
      }
    }

    if (!taskComplete) {
      // Return partial result with task URL for user to check later
      return res.json({
        status: 'processing',
        message: 'Analysis is still in progress. Check the task URL for results.',
        taskId,
        taskUrl,
        shareUrl
      });
    }

    // Try to parse the result as JSON
    let parsedResult;
    try {
      parsedResult = typeof analysisResult === 'string' 
        ? JSON.parse(analysisResult) 
        : analysisResult;
    } catch (e) {
      // If not valid JSON, return raw result
      parsedResult = {
        step1Summary: 'Analysis completed',
        step2Summary: 'See raw result below',
        inaccuracies: [],
        strengths: [],
        overallAssessment: analysisResult,
        rawResult: analysisResult
      };
    }

    res.json({
      ...parsedResult,
      taskUrl,
      shareUrl
    });

  } catch (error) {
    console.error('❌ Error during Manus analysis:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

// Build 1760924640
