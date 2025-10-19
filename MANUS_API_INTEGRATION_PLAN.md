# Manus API Integration Plan

## API Documentation Summary

### Endpoint: POST /v1/tasks
**URL**: `https://api.manus.ai/v1/tasks`

### Authentication
- Header: `API_KEY: <api-key>`
- Key provided: `sk-PV7BD5wIlAonz30SQfd85rGCqt2pjtL5GZAY3J-DaGPec8qKy2HjJlmfb36NZJtOUcy3USAIGNxC2YQ`

### Request Body (application/json)

```json
{
  "prompt": "<string>",           // The task instruction for Manus
  "attachments": [                // Optional file attachments
    {
      "filename": "<string>",
      "url": "<string>",
      "mimeType": "<string>",
      "fileData": "<string>"      // Base64 encoded file data
    }
  ],
  "taskMode": "agent",            // Options: "chat", "adaptive", "agent"
  "connectors": ["<string>"],     // List of connector IDs (e.g., Gmail)
  "hideInTaskList": true,         // Hide from webapp task list
  "createShareableLink": false,   // Create public link
  "taskId": "<string>",           // For multi-turn conversations
  "agentProfile": "quality",      // Options: "speed", "quality"
  "locale": "en-US"               // User's locale
}
```

### Response (200 - Success)

```json
{
  "task_id": "<string>",
  "task_title": "<string>",
  "task_url": "<string>",
  "share_url": "<string>"         // Only if createShareableLink=true
}
```

---

## Integration Strategy

### Goal
Replace GPT-4o single-shot analysis with Manus multi-step agent analysis for better bug detection and validation.

### What Manus Will Analyze

1. **Ontology Graph Structure**
   - Nodes (inputs, calculations, outputs)
   - Edges (dependencies)
   - Categories (Members, Revenue, Costs, etc.)

2. **Calculation Code**
   - Full `calculations.ts` file (583 lines)
   - TypeScript implementation
   - Business logic

3. **Data Model**
   - `DashboardInputs` interface
   - Input constraints and ranges
   - Derived variables

4. **Validation Requirements**
   - Find bugs (undefined variables, logic errors)
   - Validate calculations match ontology
   - Identify risks (CRITICAL, HIGH, MEDIUM, LOW)
   - Check edge cases (late service starts, etc.)

---

## Implementation Plan

### Phase 1: Backend API Endpoint (30 minutes)

**File**: `api/analyze-ontology-manus.ts` (new file)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ontologyGraph, calculationCode } = req.body;

  // Build comprehensive context for Manus
  const prompt = buildManusPrompt(ontologyGraph, calculationCode);

  // Call Manus API
  const manusResponse = await fetch('https://api.manus.ai/v1/tasks', {
    method: 'POST',
    headers: {
      'API_KEY': process.env.MANUS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      taskMode: 'agent',
      agentProfile: 'quality',
      hideInTaskList: true,
      createShareableLink: false,
      locale: 'en-US'
    })
  });

  const task = await manusResponse.json();
  
  // Poll for task completion or use webhooks
  const result = await pollTaskCompletion(task.task_id);
  
  return res.status(200).json(result);
}
```

### Phase 2: Context Builder (45 minutes)

**Function**: `buildManusPrompt()`

Create a comprehensive prompt that includes:

```markdown
# Financial Projection Dashboard Analysis Task

## Your Role
You are an expert code auditor analyzing a financial projection dashboard for a medical practice. Your goal is to find bugs, validate calculations, and identify risks.

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

2. **Calculation Code**: TypeScript implementation in `calculations.ts`
   - Ramp period (months 0-6): Pre-launch growth
   - 12-month projection (months 7-18): Post-launch operations
   - Activation logic: Services start at different months

3. **Data Model**: TypeScript interface defining all inputs

## Your Task

### Step 1: Analyze the Ontology Graph
[ONTOLOGY_GRAPH_JSON]

Questions to answer:
- What are the key input categories?
- What are the main calculation flows?
- What dependencies exist between nodes?
- Are there any missing or orphaned nodes?

### Step 2: Analyze the Calculation Code
[CALCULATION_CODE_TYPESCRIPT]

Questions to answer:
- Does the code match the ontology structure?
- Are all ontology nodes referenced in the code?
- Are there undefined variables or missing inputs?
- Are activation checks consistent?
- Are there edge cases that could cause errors?

### Step 3: Identify Bugs and Risks

Provide a prioritized list of issues:

**CRITICAL**: Bugs that cause calculation failures or incorrect results
**HIGH**: Logic errors that significantly affect projections
**MEDIUM**: Inconsistencies or missing validations
**LOW**: Code quality or documentation issues

For each issue, provide:
- Title (concise description)
- Description (detailed explanation)
- Impact (business/financial impact)
- Recommendation (how to fix)
- Code location (file and line numbers if possible)

### Step 4: Validate Key Calculations

Check these critical calculations:
1. Member growth (primary and specialty)
2. Revenue calculations (all streams)
3. Cost calculations (salaries, equipment, overhead)
4. Cash flow and profitability
5. Activation logic for services

### Output Format

Provide your analysis in this JSON structure:

```json
{
  "step1Summary": "Summary of ontology analysis",
  "step2Summary": "Summary of code analysis",
  "inaccuracies": [
    {
      "title": "Bug title",
      "description": "Detailed description",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "impact": "Business impact",
      "recommendation": "How to fix"
    }
  ],
  "strengths": ["What's working well"],
  "overallAssessment": "Overall summary"
}
```

## Important Notes

- Focus on **real bugs**, not style issues
- Trace variable usage through the entire codebase
- Check for edge cases (e.g., services starting late)
- Validate that calculations match business logic
- Consider the ramp period vs 12-month projection differences

Begin your analysis now.
```

### Phase 3: Task Polling (30 minutes)

**Function**: `pollTaskCompletion()`

```typescript
async function pollTaskCompletion(taskId: string): Promise<any> {
  const maxAttempts = 60; // 5 minutes max (5s intervals)
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
      headers: {
        'API_KEY': process.env.MANUS_API_KEY!,
      }
    });

    const task = await response.json();

    if (task.status === 'completed') {
      return parseManusResult(task.result);
    }

    if (task.status === 'failed') {
      throw new Error('Manus task failed');
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Task timeout');
}
```

### Phase 4: Result Parser (20 minutes)

**Function**: `parseManusResult()`

Parse Manus's response and extract the JSON analysis, handling potential markdown formatting.

### Phase 5: Frontend Integration (15 minutes)

Update `AIAnalyzerTab.tsx` to:
1. Add toggle: "Use Manus AI" vs "Use GPT-4o"
2. Call new endpoint when Manus is selected
3. Show loading state (longer wait time)
4. Display results in same format

---

## Total Implementation Time: ~2.5 hours

## Advantages of Manus

1. **Fresh Context**: No cached assumptions
2. **Tool Use**: Can actually read files and search code
3. **Multi-Step**: Can iterate and refine analysis
4. **Better Tracing**: Can follow variable usage through code
5. **Edge Case Detection**: More thorough analysis

## Next Steps

1. Create new API endpoint
2. Build context prompt
3. Implement polling
4. Test with real data
5. Compare results with GPT-4o
6. Deploy if results are better

---

**API Key Location**: Store in Vercel environment variable `MANUS_API_KEY`

