const fs = require('fs');
const https = require('https');

// Read all source files
const dataTs = fs.readFileSync('client/src/lib/data.ts', 'utf-8');
const calculationsTs = fs.readFileSync('client/src/lib/calculations.ts', 'utf-8');
const calculationGraphTs = fs.readFileSync('client/src/lib/calculationGraph.ts', 'utf-8');

console.log('Files loaded:');
console.log('- data.ts:', dataTs.length, 'chars');
console.log('- calculations.ts:', calculationsTs.length, 'chars');
console.log('- calculationGraph.ts:', calculationGraphTs.length, 'chars');

const prompt = `You are a senior software architect conducting a post-repair code audit. 

CONTEXT: We just completed ontology-first debugging on this medical practice financial projection dashboard.

RECENT FIXES APPLIED (commit 269b9d5):
✅ Fixed equipment lease calculation (added month parameter)
✅ Fixed ROI calculation (now uses physician investment, not total MSO costs)
✅ Fixed 5 field name mismatches in graph
✅ Removed 5 undefined input nodes
✅ Added 4 derived calculation nodes
✅ Clarified churn rate as ANNUAL in documentation

ANALYZE THESE FILES:

=== data.ts (${dataTs.length} chars) ===
${dataTs}

=== calculations.ts (${calculationsTs.length} chars) ===
${calculationsTs}

=== calculationGraph.ts (${calculationGraphTs.length} chars) ===
${calculationGraphTs}

VERIFICATION TASKS:
1. Confirm all ontology fixes are correctly implemented
2. Verify no undefined field references remain
3. Check that ROI calculation uses physician investment
4. Verify equipment lease has month parameter
5. Confirm all graph nodes reference existing fields
6. Identify any remaining issues

Generate analysis in this EXACT JSON format:
{
  "systemAssessment": {
    "grade": <number 0-100>,
    "maturityLevel": "<string>",
    "summary": "<detailed summary mentioning the fixes>"
  },
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "issues": [{"title": "<title>", "priority": "CRITICAL|HIGH|MEDIUM|LOW", "errorType": "<type>", "riskDescription": "<description>"}],
  "debugPrompt": {
    "context": {"system_type": "<type>", "architecture": "<arch>", "domain": "<domain>"},
    "files_to_analyze": ["<file descriptions>"],
    "debug_focus": ["<remaining issues if any>"],
    "output_format": "<format>"
  }
}`;

const data = JSON.stringify({
  prompt: prompt,
  taskMode: 'auto'
});

const options = {
  hostname: 'api.manus.ai',
  port: 443,
  path: '/v1/tasks',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API_KEY': process.env.MANUS_API_KEY || '',
    'Content-Length': data.length
  }
};

console.log('\nSending analysis request to Manus AI...\n');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response received:');
    console.log(responseData);
    
    try {
      const result = JSON.parse(responseData);
      console.log('\nTask created successfully!');
      console.log('Task ID:', result.id);
      console.log('Status:', result.status);
      console.log('\nThe analysis is running. Results will be available when the task completes.');
    } catch (e) {
      console.log('\nRaw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();

