const https = require('https');
const fs = require('fs');

// Read all 4 code files
const calculationsTs = fs.readFileSync('client/src/lib/calculations.ts', 'utf-8');
const dataTs = fs.readFileSync('client/src/lib/data.ts', 'utf-8');
const calculationGraphTs = fs.readFileSync('client/src/lib/calculationGraph.ts', 'utf-8');
const calculationGraphEnhancedTs = fs.readFileSync('client/src/lib/calculationGraphEnhanced.ts', 'utf-8');

console.log('Files loaded:');
console.log('- calculations.ts:', calculationsTs.length, 'chars');
console.log('- data.ts:', dataTs.length, 'chars');
console.log('- calculationGraph.ts:', calculationGraphTs.length, 'chars');
console.log('- calculationGraphEnhanced.ts:', calculationGraphEnhancedTs.length, 'chars');

// Build the complete prompt with files attached
const prompt = `You are an expert code auditor specializing in financial modeling systems. Analyze the following TypeScript codebase for a medical practice financial projection dashboard.

I have attached 4 key files:
- calculations.ts: Core calculation engine
- data.ts: Data model and interfaces
- calculationGraph.ts: Basic graph builder
- calculationGraphEnhanced.ts: Enhanced graph with metadata

**FILES:**

=== calculations.ts ===
${calculationsTs}

=== data.ts ===
${dataTs}

=== calculationGraph.ts ===
${calculationGraphTs}

=== calculationGraphEnhanced.ts ===
${calculationGraphEnhancedTs}

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

const data = JSON.stringify({
  prompt: prompt,
  taskMode: 'agent'
});

const options = {
  hostname: 'api.manus.ai',
  port: 443,
  path: '/v1/tasks',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API_KEY': process.env.MANUS_API_KEY || '',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('\nSending complete analysis packet to Manus AI...');
console.log('Total prompt size:', prompt.length, 'chars\n');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      if (result.task_id) {
        console.log('✅ Manus AI analysis task created!');
        console.log('Task ID:', result.task_id);
        console.log('Task URL:', result.task_url);
        console.log('\nThe blind study analysis is running...');
      } else {
        console.log('Response:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(data);
req.end();

