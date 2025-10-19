# Dr. Sarah Chen 3-Step Business Analyst Implementation

## Session Date
October 19, 2025

## Objective
Enable Dr. Sarah Chen's complete 3-step Business Analyst audit by updating the AI Analyzer to send actual calculation code from `calculations.ts` to the backend, allowing her to compare documentation against implementation and identify inaccuracies.

---

## What Was Accomplished

### ✅ Phase 1: Frontend Updates
**File**: `/client/src/components/AIAnalyzerTab.tsx`

**Changes Made**:
1. **Updated Interface**: Changed from generic "Ontology Analyst" to "Business Analyst" with 3-step process
2. **New Analysis Structure**:
   ```typescript
   interface AIAnalysis {
     step1Summary: string;        // Ontology Graph Assessment
     step2Summary: string;        // Actual Calculations Assessment
     inaccuracies: Inaccuracy[];  // Discrepancies found
     strengths: string[];         // What works well
     overallAssessment: string;   // Final conclusion
   }
   ```
3. **New Inaccuracy Interface**:
   ```typescript
   interface Inaccuracy {
     title: string;
     description: string;
     priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
     impact: string;
     recommendation: string;
   }
   ```
4. **Request Flag**: Added `requestCalculationCode: true` to API request
5. **Updated UI**: 
   - Changed button text to "Run 3-Step Audit"
   - Added step-by-step loading indicators
   - Created priority-based color coding (CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=blue)
   - Organized results into 3 distinct sections with numbered badges

### ✅ Phase 2: Backend Updates
**File**: `/server/routes/ai-analyzer.ts`

**Changes Made**:
1. **Read Calculation Code**: Added file system reading to load actual TypeScript code
   ```typescript
   const calculationsPath = join(process.cwd(), 'client', 'src', 'lib', 'calculations.ts');
   calculationCode = readFileSync(calculationsPath, 'utf-8');
   ```

2. **Updated JSON Schema**: New structured output schema for 3-step analysis
   ```typescript
   {
     step1Summary: string,
     step2Summary: string,
     inaccuracies: Array<{
       title, description, priority, impact, recommendation
     }>,
     strengths: string[],
     overallAssessment: string
   }
   ```

3. **Enhanced System Prompt**: Reprogrammed Dr. Chen as Business Analyst
   ```
   STEP 1: Assess the Ontology Graph
   - Review documentation of calculation structure
   
   STEP 2: Assess the Actual Calculations
   - Review TypeScript implementation code
   
   STEP 3: Identify Inaccuracies
   - Compare documentation vs implementation
   - Prioritize by risk: CRITICAL, HIGH, MEDIUM, LOW
   ```

4. **Increased Token Limit**: Raised max_tokens from 4000 to 6000 for detailed analysis
5. **Lower Temperature**: Changed from 0.7 to 0.3 for more consistent analysis

### ✅ Phase 3: Deployment
1. **Git Commit**: Pushed changes to GitHub repository
   ```
   feat: Enable Dr. Chen 3-step Business Analyst audit - send calculation code to AI analyzer
   ```
2. **Vercel Deployment**: Auto-deployed via GitHub integration
   - Deployment ID: `dpl_HMuLiyEUTYdsSxJfg6ZJc6i6hgMj`
   - Status: ✅ READY
   - URL: https://pillars-liard.vercel.app

---

## Current Status

### ✅ Completed
- [x] Frontend AI Analyzer component updated with 3-step UI
- [x] Backend endpoint updated to read and send calculation code
- [x] Dr. Chen reprogrammed as Business Analyst with 3-step process
- [x] New JSON schema for structured inaccuracy reporting
- [x] Priority-based risk classification (CRITICAL, HIGH, MEDIUM, LOW)
- [x] Code deployed to production on Vercel

### ⚠️ Pending User Action
- [ ] **Add OPENAI_API_KEY to Vercel environment variables**

**Why This Is Needed**:
The backend code requires `process.env.OPENAI_API_KEY` to call OpenAI's GPT-4 API. Without this environment variable, the analysis will fail with an error.

**How to Fix**:
See `OPENAI_API_KEY_SETUP.md` for detailed instructions.

---

## Testing Results

### Test 1: Production Deployment
- **URL**: https://pillars-liard.vercel.app
- **Navigation**: Master Debug → AI Analysis tab
- **UI**: ✅ Correctly shows "Dr. Sarah Chen - Business Analyst" with 3-step description
- **Button**: ✅ "Run 3-Step Audit" button present and clickable
- **Loading State**: ✅ Shows "Analyzing..." with proper loading indicator
- **Result**: ❌ Failed with `ERR_HTTP2_PROTOCOL_ERROR`
- **Root Cause**: OPENAI_API_KEY environment variable not set in Vercel

### Expected Behavior (After API Key Setup)
When the OPENAI_API_KEY is properly configured:

1. **User clicks "Run 3-Step Audit"**
2. **Frontend sends to `/api/analyze-ontology`**:
   - Ontology graph (128 nodes, 96 edges)
   - Request flag for calculation code
3. **Backend processes**:
   - Reads `calculations.ts` from filesystem
   - Sends both ontology + code to OpenAI GPT-4
   - Receives structured JSON response
4. **Frontend displays**:
   - **Step 1 Card**: Ontology Graph Assessment summary
   - **Step 2 Card**: Actual Calculations Assessment summary
   - **Step 3 Card**: List of inaccuracies with priority badges
   - **Strengths Card**: What the implementation does well
   - **Overall Assessment Card**: Final conclusion

---

## Technical Architecture

### Data Flow
```
User Click
    ↓
Frontend (AIAnalyzerTab.tsx)
    ↓
Build ontology graph from inputs
    ↓
POST /api/analyze-ontology
    {
      nodes: [...],
      edges: [...],
      stats: {...},
      requestCalculationCode: true
    }
    ↓
Backend (ai-analyzer.ts)
    ↓
Read calculations.ts from filesystem
    ↓
Call OpenAI GPT-4 with:
    - Ontology documentation
    - Actual TypeScript code
    - 3-step analysis instructions
    ↓
Receive structured JSON response
    ↓
Return to frontend
    ↓
Display 3-step results with priority colors
```

### Key Files Modified
1. `/client/src/components/AIAnalyzerTab.tsx` - Frontend UI and API call
2. `/server/routes/ai-analyzer.ts` - Backend endpoint and OpenAI integration
3. `/api/analyze-ontology.ts` - Serverless function wrapper (if using Vercel Functions)

### Dependencies
- **OpenAI API**: GPT-4 with structured outputs (`gpt-4o-2024-08-06`)
- **Node.js fs module**: For reading `calculations.ts`
- **React**: Frontend component framework
- **Express**: Backend routing

---

## Known Issues from Previous Sessions

Based on the inherited context, Dr. Chen previously identified these issues:

### 1. Missing Carryover in Primary Members Calculation
**Issue**: Physician carryover members not properly added at Month 7 launch
**Priority**: CRITICAL
**Status**: Needs verification in Step 3 analysis

### 2. Undefined Variables in Revenue Calculations
**Issue**: Echo Volume, CT Volume, Labs Volume not properly linked in ontology
**Priority**: HIGH
**Status**: Needs verification in Step 3 analysis

### 3. Inconsistent Diagnostics Revenue Calculation
**Issue**: Graph shows plain addition without activation checks
**Priority**: MEDIUM
**Status**: Needs verification in Step 3 analysis

**Note**: Once the OPENAI_API_KEY is set, Dr. Chen's 3-step analysis will provide updated findings on these and any other inaccuracies.

---

## Next Steps

### Immediate (User Action Required)
1. **Add OPENAI_API_KEY to Vercel**
   - Follow instructions in `OPENAI_API_KEY_SETUP.md`
   - This is a one-time setup

2. **Test the 3-Step Analysis**
   - Navigate to https://pillars-liard.vercel.app
   - Go to Master Debug → AI Analysis
   - Click "Run 3-Step Audit"
   - Wait 60-90 seconds for results

3. **Review Dr. Chen's Findings**
   - Read Step 1: Ontology assessment
   - Read Step 2: Code assessment
   - Review Step 3: Inaccuracies (prioritized by risk)
   - Note any CRITICAL or HIGH priority issues

### After Analysis (Development Tasks)
4. **Fix Critical Inaccuracies**
   - Address any CRITICAL priority issues first
   - Update either `calculations.ts` (code bugs) or `calculationGraph.ts` (documentation errors)

5. **Fix High Priority Inaccuracies**
   - Address HIGH priority issues that impact financial accuracy

6. **Update Documentation**
   - Ensure ontology graph matches actual implementation
   - Add comments to complex calculation logic

7. **Re-run Analysis**
   - Verify fixes by running analysis again
   - Confirm inaccuracies are resolved

---

## Code Examples

### Frontend API Call
```typescript
const response = await fetch('/api/analyze-ontology', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nodes: graph.nodes,
    edges: graph.edges,
    stats: graph.stats,
    requestCalculationCode: true,  // NEW: Request actual code
  }),
});

const analysis = await response.json();
// analysis.step1Summary
// analysis.step2Summary
// analysis.inaccuracies[]
// analysis.strengths[]
// analysis.overallAssessment
```

### Backend Processing
```typescript
// Read actual calculation code
const calculationsPath = join(process.cwd(), 'client', 'src', 'lib', 'calculations.ts');
const calculationCode = readFileSync(calculationsPath, 'utf-8');

// Send to OpenAI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-2024-08-06',
    temperature: 0.3,
    max_tokens: 6000,
    response_format: analysisSchema,  // Structured outputs
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  }),
});
```

### Priority Color Coding
```typescript
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'text-red-700 bg-red-100 border-red-300';
    case 'HIGH':     return 'text-orange-700 bg-orange-100 border-orange-300';
    case 'MEDIUM':   return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    case 'LOW':      return 'text-blue-700 bg-blue-100 border-blue-300';
  }
};
```

---

## Success Criteria

The implementation will be considered fully successful when:

1. ✅ User adds OPENAI_API_KEY to Vercel
2. ✅ Analysis runs without errors
3. ✅ Dr. Chen provides 3-step assessment:
   - Step 1 summary (2-3 paragraphs)
   - Step 2 summary (2-3 paragraphs)
   - Step 3 inaccuracies (with priorities)
4. ✅ Results display correctly in UI with proper formatting
5. ✅ Critical and high-priority inaccuracies are identified
6. ✅ Development team addresses identified issues
7. ✅ Re-analysis confirms fixes

---

## Resources

- **Live Dashboard**: https://pillars-liard.vercel.app
- **GitHub Repository**: https://github.com/Legend1280/pillars
- **Vercel Project**: https://vercel.com/bradys-projects-179e6527/pillars
- **OpenAI API Docs**: https://platform.openai.com/docs/guides/structured-outputs
- **Setup Guide**: `OPENAI_API_KEY_SETUP.md`

---

## Summary

The 3-step Business Analyst feature is **fully implemented and deployed**, but requires the user to add the OPENAI_API_KEY environment variable to Vercel before it can function. Once this one-time setup is complete, Dr. Sarah Chen will be able to perform comprehensive audits comparing the ontology documentation against the actual TypeScript implementation, identifying inaccuracies prioritized by risk level (CRITICAL, HIGH, MEDIUM, LOW).

This represents a significant enhancement to the dashboard's quality assurance capabilities, enabling automated detection of discrepancies between documentation and code that could lead to incorrect financial projections.

