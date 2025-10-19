# OpenAI API Key Setup for Vercel

## Issue
The AI Analyzer (Dr. Sarah Chen's 3-step Business Analyst audit) requires the `OPENAI_API_KEY` environment variable to be set in Vercel.

## Current Status
- ✅ Frontend updated to send calculation code to backend
- ✅ Backend updated with 3-step Business Analyst process
- ✅ Code deployed to Vercel successfully
- ❌ OPENAI_API_KEY environment variable not set in Vercel

## Error Observed
When clicking "Run 3-Step Audit", the browser console shows:
```
error: Failed to load resource: net::ERR_HTTP2_PROTOCOL_ERROR
```

This is because the backend is throwing an error: "OPENAI_API_KEY environment variable not set"

## Solution Required
The user needs to add the OPENAI_API_KEY environment variable to their Vercel project:

### Steps:
1. Go to https://vercel.com/bradys-projects-179e6527/pillars/settings/environment-variables
2. Add a new environment variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (your OpenAI API key)
   - **Environments**: Production, Preview, Development (select all)
3. Click "Save"
4. Redeploy the project (or trigger a new deployment by pushing to GitHub)

### Alternative: Use Vercel CLI
```bash
# Set the environment variable using Vercel CLI
vercel env add OPENAI_API_KEY production
# Enter your OpenAI API key when prompted
```

## Testing After Setup
Once the OPENAI_API_KEY is set:
1. Navigate to https://pillars-liard.vercel.app
2. Click "Master Debug" tab
3. Click "AI Analysis" sub-tab
4. Click "Run 3-Step Audit"
5. Wait 60-90 seconds for Dr. Chen's analysis
6. Review the 3-step results:
   - Step 1: Ontology Graph Assessment
   - Step 2: Actual Calculations Assessment
   - Step 3: Inaccuracies Identified (prioritized by risk)

## Current Environment Variables in Vercel
- ✅ REDIS_URL (already set for Save/Set Default functionality)
- ❌ OPENAI_API_KEY (needs to be added)
- ❌ DATABASE_URL (optional, not currently used)

