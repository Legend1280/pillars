# AI Validation Quick Start Guide

## ✅ System Status: WORKING!

Your Claude API key is configured and Dr. Sarah Chen is ready to analyze your financial models!

---

## How to Access AI Validation

### Option 1: Dashboard UI (Recommended)

1. **Open the dashboard:**
   ```
   https://3000-ieckjw0xr3yxrruoggv85-101dcc1f.manusvm.computer
   ```

2. **Navigate to Master Debug:**
   - Look for the "Master Debug" tab in the main header tabs
   - Click on it to open the debug dashboard

3. **Choose your analysis type:**
   - **"AI Validation" tab:** Run full validation of all formulas and inputs
   - **"Ontology" tab:** Visualize the calculation graph, then click "Analyze with AI"

4. **Click the button and wait:**
   - Analysis takes 10-15 seconds
   - Dr. Chen will provide comprehensive feedback

### Option 2: Direct API Call (For Testing)

```bash
curl -X POST http://localhost:3000/api/analyze-ontology \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [
      {"id": "test1", "type": "input", "label": "Monthly Fee", "data": {"value": 200}},
      {"id": "test2", "type": "calculation", "label": "Annual Revenue", "data": {"formula": "test1 * 12"}}
    ],
    "edges": [
      {"source": "test1", "target": "test2"}
    ]
  }'
```

---

## What You'll Get

Dr. Sarah Chen provides:

### 📊 **Overall Health Score** (0-100%)
How complete and realistic your financial model is

### ⚠️ **Structural Issues**
Problems with how the model is architected
- Severity: Critical / Warning / Info
- Affected components
- Specific recommendations

### 🔗 **Missing Connections**
What should be connected but isn't
- From/To nodes
- Reason why it's needed
- Priority level

### 📐 **Formula Issues**
Problems with specific calculations
- Which formula has the issue
- What the correct formula should be
- Impact on the model

### 🌊 **Data Flow Issues**
Problems with how data moves through the system
- Which path has the problem
- Why it's an issue
- How to fix it

### ✨ **Strengths**
What you're doing well (positive feedback!)

### 🚨 **Critical Risks**
The biggest threats to your model's validity

### 💡 **Prioritized Recommendations**
Top 5 improvements ranked by importance

### 📝 **Summary**
Overall assessment in plain English

---

## Example Analysis

Here's what Dr. Chen said about a simple revenue model:

**Health Score:** 15%

**Critical Risks:**
- "Fatal Flaw - No Expense Modeling: Cannot determine if business is viable. With typical MSO margins of 5-15%, this $1.2M revenue could yield $60k-$180k profit or significant losses."
- "Cash Flow Crisis Risk: No working capital modeling. MSOs typically need $300k-$500k in startup capital plus 6-12 months of operating reserves."

**Top Recommendation:**
"PRIORITY 1 - Build Comprehensive Expense Model: Immediately add major cost categories with industry-standard percentages: Physician compensation (40-50% of revenue), Support staff salaries (15-20%), Facility costs (8-12%)..."

---

## Server Configuration

### Current Setup
- **Model:** Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **API Key:** Configured and working
- **Port:** 3000
- **Status:** Running

### To Restart Server (if needed)

```bash
cd /home/ubuntu/pillars-dashboard

# Build the latest code
npm run build

# Start with API key
ANTHROPIC_API_KEY='YOUR_ANTHROPIC_API_KEY_HERE' \
NODE_ENV=production \
node dist/index.js
```

---

## Troubleshooting

### "Authentication Error" or "Invalid API Key"
- Make sure the server was started with the `ANTHROPIC_API_KEY` environment variable
- Check that the key hasn't expired or run out of credits

### "Model Not Found" Error
- Verify the model name is `claude-sonnet-4-5-20250929`
- Check the Anthropic API documentation for the latest model names

### "JSON Parse Error"
- This should be fixed now with the `stripMarkdownCodeBlocks()` helper
- If it happens, check that the helper is being applied to all JSON.parse() calls

### Analysis Takes Too Long
- Normal analysis time is 10-15 seconds
- If it takes longer than 30 seconds, check your internet connection
- Large models (50+ nodes) may take longer

---

## Cost Tracking

**Claude Sonnet 4.5 Pricing:**
- $3 per million input tokens
- $15 per million output tokens

**Estimated Costs:**
- Each ontology analysis: ~$0.02-$0.05
- 100 analyses: ~$2-$5
- 1,000 analyses: ~$20-$50

Very affordable! You can run hundreds of analyses without significant cost.

---

## Next Steps

1. **Test it out!** Run an analysis on your current financial model
2. **Review recommendations** from Dr. Chen
3. **Implement improvements** based on priority
4. **Re-analyze** to see your health score improve
5. **Deploy to production** when ready (add API key to Vercel env vars)

---

## Need Help?

- Check the full report: `AI_VALIDATION_SUCCESS_REPORT.md`
- Review server logs for detailed error messages
- Test the API endpoint directly with curl to isolate issues
- Check the browser console for frontend errors

---

**Happy analyzing!** 🎉

