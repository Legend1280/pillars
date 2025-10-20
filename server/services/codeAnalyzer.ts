import { readFileSync } from 'fs';
import { join } from 'path';

interface AnalysisIssue {
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  errorType: string;
  riskDescription: string;
}

interface SystemAssessment {
  grade: number;
  maturityLevel: string;
  summary: string;
}

interface DebugPrompt {
  context: {
    system_type: string;
    architecture: string;
    domain: string;
  };
  files_to_analyze: string[];
  debug_focus: string[];
  output_format: string;
}

interface CodeAnalysisResult {
  systemAssessment: SystemAssessment;
  strengths: string[];
  issues: AnalysisIssue[];
  debugPrompt: DebugPrompt;
}

export async function analyzeCodebase(): Promise<CodeAnalysisResult> {
  try {
    // Read the source files
    const basePath = process.cwd();
    const calculationsPath = join(basePath, 'client', 'src', 'lib', 'calculations.ts');
    const dataPath = join(basePath, 'client', 'src', 'lib', 'data.ts');
    const calculationGraphPath = join(basePath, 'client', 'src', 'lib', 'calculationGraph.ts');
    const enhancedGraphPath = join(basePath, 'client', 'src', 'lib', 'calculationGraphEnhanced.ts');
    
    const calculationsCode = readFileSync(calculationsPath, 'utf-8');
    const dataCode = readFileSync(dataPath, 'utf-8');
    const calculationGraphCode = readFileSync(calculationGraphPath, 'utf-8');
    const enhancedGraphCode = readFileSync(enhancedGraphPath, 'utf-8');

    console.log('[Code Analyzer] Starting deep code analysis with Manus AI...');

    // Prepare the analysis prompt for Manus
    const analysisPrompt = `You are an expert code auditor specializing in financial modeling systems. Analyze the following TypeScript codebase for a medical practice financial projection dashboard.

I have attached 4 key files:
- calculations.ts: Core calculation engine
- data.ts: Data model and interfaces
- calculationGraph.ts: Basic graph builder
- calculationGraphEnhanced.ts: Enhanced graph with metadata

**ANALYSIS REQUIREMENTS:**

Provide a comprehensive analysis in the following JSON format:

{
  "systemAssessment": {
    "grade": <number 0-100>,
    "maturityLevel": "<string describing production readiness>",
    "summary": "<detailed 3-4 sentence summary of system quality, architecture, and critical issues>"
  },
  "strengths": [
    "<detailed strength 1 with specific code references>",
    "<detailed strength 2 with specific code references>",
    ...at least 8 strengths
  ],
  "issues": [
    {
      "title": "<concise issue title>",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "errorType": "<Function Call Error|Data Model Mismatch|Logic Error|etc>",
      "riskDescription": "<detailed description with line numbers, impact analysis, and potential consequences>"
    },
    ...prioritized list of all issues found
  ],
  "debugPrompt": {
    "context": {
      "system_type": "<brief system description>",
      "architecture": "<architecture pattern description>",
      "domain": "<business domain description>"
    },
    "files_to_analyze": [
      "<file 1 - description>",
      "<file 2 - description>",
      ...
    ],
    "debug_focus": [
      "<CRITICAL: specific fix with line numbers>",
      "<HIGH: specific fix with line numbers>",
      ...
    ],
    "output_format": "Prioritized bug fix list with specific file locations, line numbers, and exact code changes needed for each issue. Include unit tests for critical calculations to prevent regression."
  }
}

**FOCUS AREAS:**
1. Function signature mismatches and missing parameters
2. Data model inconsistencies between interfaces and usage
3. Calculation logic errors (especially churn, ROI, equipment costs)
4. Undefined variables in calculation graphs
5. Field name mismatches between graph and data model
6. Missing feature implementations
7. Incorrect timing/sequencing in calculations
8. Type safety issues

Provide specific line numbers, actual vs expected behavior, and concrete fix recommendations.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, just the raw JSON object.`;

    // Get Manus API key from environment
    const manusApiKey = process.env.MANUS_API_KEY;
    if (!manusApiKey) {
      throw new Error('MANUS_API_KEY environment variable is not set');
    }

    // Prepare attachments for Manus
    const attachments = [
      {
        filename: 'calculations.ts',
        fileData: Buffer.from(calculationsCode).toString('base64'),
        mimeType: 'text/plain'
      },
      {
        filename: 'data.ts',
        fileData: Buffer.from(dataCode).toString('base64'),
        mimeType: 'text/plain'
      },
      {
        filename: 'calculationGraph.ts',
        fileData: Buffer.from(calculationGraphCode).toString('base64'),
        mimeType: 'text/plain'
      },
      {
        filename: 'calculationGraphEnhanced.ts',
        fileData: Buffer.from(enhancedGraphCode).toString('base64'),
        mimeType: 'text/plain'
      }
    ];

    console.log('[Code Analyzer] Creating Manus task...');

    // Call Manus API using the correct format
    const createResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': manusApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: analysisPrompt,
        attachments,
        taskMode: 'agent',
        agentProfile: 'quality',
        hideInTaskList: false,
        createShareableLink: true
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[Code Analyzer] Manus API error:', createResponse.status, errorText);
      throw new Error(`Manus API error: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.task_id;
    const taskUrl = createData.task_url;
    
    if (!taskId) {
      throw new Error('No task ID returned from Manus API');
    }

    console.log(`[Code Analyzer] Task created: ${taskId}`);
    console.log(`[Code Analyzer] Task URL: ${taskUrl}`);
    console.log(`[Code Analyzer] Waiting for completion...`);

    // Poll for task completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    let taskResult: any = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
      
      const statusResponse = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
        headers: {
          'API_KEY': manusApiKey
        }
      });

      if (!statusResponse.ok) {
        console.error('[Code Analyzer] Failed to check task status');
        continue;
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed' || statusData.result) {
        taskResult = statusData;
        console.log('[Code Analyzer] Task completed!');
        break;
      } else if (statusData.status === 'failed' || statusData.error) {
        throw new Error(`Manus task failed: ${statusData.error || 'Unknown error'}`);
      }
      
      console.log(`[Code Analyzer] Status: ${statusData.status || 'processing'}, attempt ${attempts}/${maxAttempts}`);
    }

    if (!taskResult) {
      throw new Error('Task did not complete within timeout period (5 minutes)');
    }

    // Extract the analysis from the result
    const analysisText = taskResult.result;
    
    if (!analysisText) {
      throw new Error('No analysis text in task result');
    }

    // Try to parse JSON from the response
    let analysis: CodeAnalysisResult;
    try {
      // Remove markdown code blocks if present
      const cleanedText = typeof analysisText === 'string' 
        ? analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        : JSON.stringify(analysisText);
      
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[Code Analyzer] Failed to parse analysis as JSON:', parseError);
      console.error('[Code Analyzer] Raw response type:', typeof analysisText);
      console.error('[Code Analyzer] Raw response preview:', JSON.stringify(analysisText).substring(0, 500));
      throw new Error('Failed to parse analysis result as JSON');
    }
    
    console.log('[Code Analyzer] Analysis completed successfully');
    console.log(`[Code Analyzer] Grade: ${analysis.systemAssessment.grade}/100`);
    console.log(`[Code Analyzer] Found ${analysis.issues.length} issues`);
    console.log(`[Code Analyzer] Found ${analysis.strengths.length} strengths`);

    return analysis;

  } catch (error) {
    console.error('[Code Analyzer] Error during analysis:', error);
    throw error;
  }
}

