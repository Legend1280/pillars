import { Router, Request, Response } from 'express';

const router = Router();

interface ManusTaskResponse {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: Array<{
    role: string;
    type: string;
    content: Array<{
      type: string;
      text?: string;
    }>;
  }>;
  error?: string;
}

interface AnalysisResult {
  systemAssessment: {
    grade: number;
    maturityLevel: string;
    summary: string;
  };
  strengths: string[];
  issues: Array<{
    title: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    errorType: string;
    riskDescription: string;
  }>;
  debugPrompt: {
    context: Record<string, string>;
    files_to_analyze: string[];
    debug_focus: string[];
    output_format: string;
  };
}

// POST /api/manus-create-task
router.post('/manus-create-task', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.MANUS_API_KEY || 'sk-PV7BD5wIlAonz30SQfd85rGCqt2pjtL5GZAY3J-DaGPec8qKy2HjJlmfb36NZJtOUcy3USAIGNxC2YQ';
    if (!apiKey) {
      console.error('[Manus] MANUS_API_KEY not configured');
      return res.status(500).json({ error: 'Manus API key not configured' });
    }

    console.log('[Manus] Creating analysis task...');

    // Read the calculation files
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const calculationsPath = path.join(process.cwd(), 'client', 'src', 'lib', 'calculations.ts');
    const dataPath = path.join(process.cwd(), 'client', 'src', 'lib', 'data.ts');
    
    const calculationsCode = await fs.readFile(calculationsPath, 'utf-8');
    const dataCode = await fs.readFile(dataPath, 'utf-8');

    // Get ontology from request body
    const ontologyGraph = req.body.ontologyGraph;
    
    // Convert ontology to base64
    const ontologyJson = JSON.stringify(ontologyGraph, null, 2);
    const ontologyBase64 = Buffer.from(ontologyJson).toString('base64');

    // Create the comprehensive prompt
    const prompt = `You are Dr. Sarah Chen, a senior business analyst specializing in financial model auditing.

## PROJECT CONTEXT
This is a physician practice financial planning dashboard. The system uses:
- **Data Model** (data.ts): Defines all input parameters and types
- **Ontology Graph** (calculationGraph.ts): Documents calculation relationships
- **Calculation Implementation** (calculations.ts): Actual TypeScript code

## YOUR TASK
Perform a comprehensive 3-step audit to identify inaccuracies between documentation and implementation.

## STEP 1: Analyze Ontology Graph Structure
Review the calculation graph (attached as ontology.json) and assess:
- Node coverage and completeness
- Edge integrity and dependencies
- Category organization
- Missing or orphaned nodes

## STEP 2: Audit Calculation Code
Review the TypeScript implementation (calculations.ts) and check:
- Does each calculation match its documented formula?
- Are dependencies correctly implemented?
- Are there calculations in code not in the ontology?
- Are there ontology nodes without implementations?

## STEP 3: Identify Inaccuracies
Cross-reference Steps 1 & 2 to find:
- **CRITICAL**: Wrong formulas, missing dependencies, incorrect data types
- **HIGH**: Undocumented calculations, orphaned nodes, broken references
- **MEDIUM**: Inconsistent naming, missing descriptions
- **LOW**: Style issues, documentation gaps

## REQUIRED OUTPUT FORMAT
Respond with ONLY valid JSON (no markdown, no code blocks):

{
  "systemAssessment": {
    "grade": <number 0-100>,
    "maturityLevel": "<string: e.g., 'Production Ready', 'Needs Review', etc.>",
    "summary": "<brief overall assessment>"
  },
  "strengths": [
    "<what's working well>",
    "<another strength>"
  ],
  "issues": [
    {
      "title": "<concise issue title>",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "errorType": "Formula Error|Missing Dependency|Type Mismatch|etc.",
      "riskDescription": "<specific description with node IDs and function names>"
    }
  ],
  "debugPrompt": {
    "context": {
      "note": "Additional context if needed"
    },
    "files_to_analyze": ["calculations.ts", "calculationGraph.ts", "data.ts"],
    "debug_focus": ["<specific areas to investigate>"],
    "output_format": "JSON as specified above"
  }
}

## ATTACHED FILES
1. ontology.json - The calculation graph structure
2. calculations.ts - The actual TypeScript implementation
3. data.ts - The data model interface

Focus on REAL BUGS and INACCURACIES, not style preferences. Be specific with node IDs and function names.`;

    // Call Manus API
    const response = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        attachments: [
          {
            filename: 'calculations.ts',
            fileData: Buffer.from(calculationsCode).toString('base64'),
            mimeType: 'text/plain',
          },
          {
            filename: 'data.ts',
            fileData: Buffer.from(dataCode).toString('base64'),
            mimeType: 'text/plain',
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Manus] Task creation failed:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to create Manus task',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('[Manus] Task created:', data.task_id);

    res.json({
      task_id: data.task_id,
      task_url: data.task_url,
    });

  } catch (error) {
    console.error('[Manus] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/manus-check-status
router.get('/manus-check-status', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'Missing required parameter: taskId' });
    }

    const apiKey = process.env.MANUS_API_KEY || 'sk-PV7BD5wIlAonz30SQfd85rGCqt2pjtL5GZAY3J-DaGPec8qKy2HjJlmfb36NZJtOUcy3USAIGNxC2YQ';
    if (!apiKey) {
      console.error('[Manus] MANUS_API_KEY not configured');
      return res.status(500).json({ error: 'Manus API key not configured' });
    }

    console.log(`[Manus] Checking status for task: ${taskId}`);

    // Check task status
    const statusResponse = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'API_KEY': apiKey,
      },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('[Manus] Status check failed:', {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        errorBody: errorText,
        taskId: taskId,
      });
      
      return res.status(200).json({ 
        status: 'failed',
        error: `Status check failed (${statusResponse.status}): ${errorText || statusResponse.statusText}`,
      });
    }

    const taskData: ManusTaskResponse = await statusResponse.json();
    console.log(`[Manus] Task status: ${taskData.status}`);

    // If still pending or running
    if (taskData.status === 'pending' || taskData.status === 'running') {
      return res.status(200).json({
        status: taskData.status,
        message: taskData.status === 'pending' ? 'Task is queued...' : 'Analysis in progress...',
      });
    }

    // If failed
    if (taskData.status === 'failed') {
      console.error('[Manus] Task failed:', taskData.error);
      return res.status(200).json({
        status: 'failed',
        error: taskData.error || 'Task failed without error message',
      });
    }

    // If completed
    if (taskData.status === 'completed') {
      console.log('[Manus] Task completed, parsing result...');
      
      if (!taskData.output || taskData.output.length === 0) {
        console.error('[Manus] No output in completed task');
        return res.status(200).json({ 
          status: 'failed',
          error: 'Task completed but no output available' 
        });
      }

      // Extract text from the last assistant message
      const lastMessage = taskData.output[taskData.output.length - 1];
      let resultText = '';
      
      if (lastMessage.content && lastMessage.content.length > 0) {
        for (const content of lastMessage.content) {
          if (content.type === 'output_text' && content.text) {
            resultText += content.text;
          }
        }
      }

      if (!resultText) {
        console.error('[Manus] No text content in output');
        return res.status(200).json({ 
          status: 'failed',
          error: 'Task completed but no text output found',
        });
      }

      console.log('[Manus] Result text length:', resultText.length);

      // Parse the result
      const analysisResult = parseManusResult(resultText);
      
      if (!analysisResult) {
        console.error('[Manus] Failed to parse result');
        return res.status(200).json({ 
          status: 'failed',
          error: 'Failed to parse analysis result',
          rawResult: resultText.substring(0, 500)
        });
      }

      console.log('[Manus] Result parsed successfully');
      return res.status(200).json({
        status: 'completed',
        result: analysisResult,
      });
    }

    // Unknown status
    return res.status(200).json({ 
      status: 'failed',
      error: 'Unknown task status', 
    });

  } catch (error) {
    console.error('[Manus] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function parseManusResult(resultText: string): AnalysisResult | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return validateAnalysisResult(parsed) ? parsed : null;
    }

    // Try to parse as direct JSON
    const parsed = JSON.parse(resultText);
    return validateAnalysisResult(parsed) ? parsed : null;
  } catch (error) {
    console.error('[Manus] JSON parse error:', error);
    
    // Fallback: create a basic structure
    return {
      systemAssessment: {
        grade: 75,
        maturityLevel: 'Analysis in progress',
        summary: 'The analysis result could not be fully parsed. Please review the raw output.',
      },
      strengths: ['Analysis completed but format needs adjustment'],
      issues: [{
        title: 'Result parsing issue',
        priority: 'MEDIUM',
        errorType: 'Format Error',
        riskDescription: 'The analysis completed but the output format needs to be adjusted.',
      }],
      debugPrompt: {
        context: {
          note: 'This is a fallback response due to parsing issues',
        },
        files_to_analyze: [],
        debug_focus: ['Review raw analysis output'],
        output_format: 'JSON format as specified',
      },
    };
  }
}

function validateAnalysisResult(obj: any): obj is AnalysisResult {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.systemAssessment &&
    typeof obj.systemAssessment.grade === 'number' &&
    typeof obj.systemAssessment.maturityLevel === 'string' &&
    typeof obj.systemAssessment.summary === 'string' &&
    Array.isArray(obj.strengths) &&
    Array.isArray(obj.issues) &&
    obj.debugPrompt &&
    typeof obj.debugPrompt === 'object'
  );
}

export default router;

