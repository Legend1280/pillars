# Risk Analysis Fix Summary - October 18, 2025

## Issues Identified and Fixed

### 1. **Monte Carlo Simulation Bug - Incorrect Member Calculation**

**Problem:**
- The Risk Analysis Monte Carlo simulation was using only `physicianPrimaryCarryover` (typically 15-25 members) to calculate starting members
- This caused the Lean scenario to show incorrect negative profit (-$0.73M) when it should be positive
- The simulation wasn't accounting for:
  - Members acquired during ramp period (Months 1-6)
  - Additional physicians' carryover members
  - Corporate employees at launch

**Root Cause:**
In `client/src/components/RiskAnalysisTab.tsx`, lines 18-38 (old code):
```typescript
// OLD - INCORRECT
const avgCarryoverPrimary = inputs.physicianPrimaryCarryover || 0;
let startingMembers = totalPhysicians * avgCarryoverPrimary;
```

**Fix Applied:**
```typescript
// NEW - CORRECT
// Calculate ramp period member growth (Months 0-6)
const rampIntakeMonthly = inputs.rampPrimaryIntakeMonthly || 0;
const rampMonths = 6;
const churnRate = (inputs.churnPrimary || 8) / 100;

// Members accumulated during ramp period (Months 1-6)
let rampMembers = 0;
for (let m = 1; m <= rampMonths; m++) {
  rampMembers += rampIntakeMonthly;
  rampMembers *= (1 - churnRate / 12); // Monthly churn
}

// At Month 7 (Launch), physician carry-over members join
const carryOverPrimary = inputs.physicianPrimaryCarryover + 
  (totalPhysicians - 1) * (inputs.otherPhysiciansPrimaryCarryoverPerPhysician || 25);

// Corporate employees at launch
const corporateEmployees = (inputs.corpInitialClients || 0) * (inputs.corpEmployeesPerClient || 30);

// Total members at launch = ramp members + physician carryover + corporate
let startingMembers = rampMembers + carryOverPrimary + corporateEmployees;
```

**Impact:**
- ✅ Risk Analysis now correctly calculates total members at launch
- ✅ Lean scenario should now show positive profit instead of negative
- ✅ All scenarios (Lean, Conservative, Moderate) will have accurate risk projections

---

### 2. **ROI/Profit Labeling Ambiguity**

**Problem:**
- Risk Analysis tab showed "Median Net Profit" and "ROI Range" without specifying whether these were MSO or Physician metrics
- This created confusion about what ROI was being calculated
- The KPI Ribbon correctly showed "Physician ROI" but Risk Analysis didn't specify "MSO"

**Fix Applied:**
Updated all Risk Analysis labels to explicitly specify "MSO":

1. **KPI Cards (lines 218, 227):**
   - `"Median Net Profit (P50)"` → `"MSO Median Net Profit (P50)"`
   - `"ROI Range"` → `"MSO ROI Range"`

2. **Summary Table (lines 372, 378):**
   - `"12-Month Net Profit"` → `"MSO 12-Month Net Profit"`
   - `"ROI"` → `"MSO ROI"`

**Impact:**
- ✅ Clear distinction between MSO financial metrics and Physician ROI
- ✅ Users can now easily understand that Risk Analysis shows MSO business performance
- ✅ Physician ROI remains clearly labeled in the KPI Ribbon and Physician ROI tab

---

## Files Modified

### `client/src/components/RiskAnalysisTab.tsx`
- **Lines 18-45:** Fixed Monte Carlo simulation member calculation
- **Lines 218, 227:** Updated KPI card labels to specify "MSO"
- **Lines 372, 378:** Updated table row labels to specify "MSO"

**Git Commit:**
```
commit 30a459d
Fix Risk Analysis: correct member calculation & add MSO labels

- Fixed Monte Carlo simulation to calculate total members at launch correctly
  - Now includes: ramp members + physician carryover + corporate employees
  - Previously only used physicianPrimaryCarryover (wrong)
- Updated all Risk Analysis labels to specify 'MSO' metrics
  - 'Median Net Profit' -> 'MSO Median Net Profit'
  - 'ROI Range' -> 'MSO ROI Range'
  - Table labels updated to 'MSO 12-Month Net Profit' and 'MSO ROI'
- Fixes Lean scenario showing incorrect negative profit
```

---

## Deployment Instructions

### Option 1: Git Push (Recommended if Git integration is enabled)
```bash
cd /home/ubuntu/pillars-dashboard
git push origin dev
```

If you have Vercel Git integration enabled, this will automatically trigger a deployment.

### Option 2: Manual Vercel Deployment
```bash
cd /home/ubuntu/pillars-dashboard
vercel deploy --prod
```

### Option 3: Vercel Dashboard
1. Go to https://vercel.com/bradys-projects-179e6527/pillars
2. Navigate to "Deployments"
3. Click "Redeploy" on the latest deployment
4. Or connect to GitHub and it will auto-deploy on push

---

## Testing Checklist

After deployment, verify the following:

### ✅ Risk Analysis Tab
1. Navigate to Risk Analysis tab
2. Select **Lean** scenario
3. Verify "MSO Median Net Profit (P50)" shows **positive value** (not -$0.73M)
4. Verify all labels include "MSO" prefix:
   - "MSO Median Net Profit (P50)"
   - "MSO ROI Range"
   - Table shows "MSO 12-Month Net Profit" and "MSO ROI"

### ✅ Conservative & Moderate Scenarios
1. Switch to Conservative scenario
2. Verify MSO metrics are reasonable and positive
3. Switch to Moderate scenario
4. Verify MSO metrics show higher values than Conservative

### ✅ KPI Ribbon
1. Check top KPI ribbon still shows:
   - "Total Revenue (12 mo)"
   - "MSO Net Profit" (already correct)
   - "Physician ROI" (already correct)
   - "Active Members"

---

## Expected Results

### Before Fix (Lean Scenario):
- MSO Median Net Profit: **-$0.73M** ❌
- Members at Launch: ~15 (wrong - only carryover)

### After Fix (Lean Scenario):
- MSO Median Net Profit: **Positive** ✅ (exact value depends on inputs)
- Members at Launch: Correctly calculated from ramp + carryover + corporate

---

## Technical Notes

### Why the Bug Occurred
The Monte Carlo simulation was using a simplified member calculation that didn't match the actual calculation engine in `calculations.ts`. The main calculation engine correctly computes:
1. Ramp period growth (Months 0-6)
2. Physician carryover at launch (Month 7)
3. Corporate employees
4. Additional physicians' contributions

The Monte Carlo simulation was missing steps 1, 3, and 4.

### Alignment with Main Calculation Engine
The fix aligns the Monte Carlo simulation with the logic in `client/src/lib/calculations.ts` (lines 293-342) which correctly calculates launch state members.

---

## Related Metrics

### MSO Metrics (Risk Analysis Tab):
- MSO Net Profit
- MSO ROI
- MSO Revenue
- MSO Costs

### Physician Metrics (Physician ROI Tab & KPI Ribbon):
- Physician ROI (Annual income / Investment)
- Specialty Income Retained
- Equity Income
- Total Physician Income

Both are now clearly labeled to avoid confusion.

---

## Status

- ✅ Code fixes completed
- ✅ Git commit created
- ⏳ Awaiting deployment to production
- ⏳ Awaiting verification testing

**Next Step:** Deploy to Vercel and verify fixes in production environment.

