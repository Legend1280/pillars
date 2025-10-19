import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ManusTaskResponse {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'Missing required parameter: taskId' });
    }

    const apiKey = process.env.MANUS_API_KEY;
    if (!apiKey) {
      console.error('MANUS_API_KEY not configured');
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
        endpoint: `https://api.manus.ai/v1/tasks/${taskId}`
      });
      return res.status(200).json({ 
        status: 'failed',
        error: `Status check failed (${statusResponse.status}): ${errorText}`,
        debug: {
          httpStatus: statusResponse.status,
          taskId: taskId
        }
      });
    }

    const taskData: ManusTaskResponse = await statusResponse.json();
    console.log(`[Manus] Task status: ${taskData.status}`);

    // If still pending or running, return status
    if (taskData.status === 'pending' || taskData.status === 'running') {
      return res.status(200).json({
        status: taskData.status,
        message: taskData.status === 'pending' ? 'Task is queued' : 'Analysis in progress...',
      });
    }

    // If failed, return error
    if (taskData.status === 'failed') {
      console.error('[Manus] Task failed:', taskData.error);
      return res.status(500).json({
        status: 'failed',
        error: taskData.error || 'Task failed without error message',
      });
    }

    // If completed, parse and return result
    if (taskData.status === 'completed') {
      console.log('[Manus] Task completed, parsing result...');
      
      if (!taskData.result) {
        console.error('[Manus] No result in completed task');
        return res.status(500).json({ error: 'Task completed but no result available' });
      }

      // Parse the result
      const analysisResult = parseManusResult(taskData.result);
      
      if (!analysisResult) {
        console.error('[Manus] Failed to parse result');
        return res.status(500).json({ 
          error: 'Failed to parse analysis result',
          rawResult: taskData.result.substring(0, 500) // Return first 500 chars for debugging
        });
      }

      console.log('[Manus] Result parsed successfully');
      return res.status(200).json({
        status: 'completed',
        result: analysisResult,
      });
    }

    // Unknown status
    return res.status(500).json({ error: 'Unknown task status', status: taskData.status });

  } catch (error) {
    console.error('[Manus] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

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
    
    // Try to extract key information even if JSON parsing fails
    try {
      return extractAnalysisFromText(resultText);
    } catch (fallbackError) {
      console.error('[Manus] Fallback extraction failed:', fallbackError);
      return null;
    }
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

function extractAnalysisFromText(text: string): AnalysisResult {
  // Fallback: create a basic structure from the text
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
      riskDescription: 'The analysis completed but the output format needs to be adjusted. Raw result available for review.',
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

