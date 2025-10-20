const https = require('https');

const prompt = `Analyze this TypeScript financial dashboard codebase for ontology and calculation errors.

RECENT FIXES APPLIED:
- Fixed equipment lease calculation (added month parameter)
- Fixed ROI calculation (uses physician investment not MSO costs)
- Fixed 5 field name mismatches
- Removed 5 undefined input nodes
- Added 4 derived calculation nodes

TASK: Verify these fixes are correct and identify any remaining issues.

Generate JSON analysis with:
- systemAssessment (grade 0-100, maturityLevel, summary)
- strengths (array of strings)
- issues (array with title, priority, errorType, riskDescription)
- debugPrompt (context, files_to_analyze, debug_focus, output_format)`;

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

console.log('Calling Manus AI analyzer...\n');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      if (result.id) {
        console.log('✅ Manus AI task created successfully!');
        console.log('Task ID:', result.id);
        console.log('Status:', result.status);
        console.log('\nThe analysis is running. Check the Manus dashboard for results.');
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

