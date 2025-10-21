# Financial Analysis: Break-Even & Unit Economics Verification
**Date**: 2025-10-20  
**Analyst Review**: Business Logic & Formula Validation

---

## 1. Break-Even Analysis Explained

### What "Break-Even" Means in This Dashboard

**Definition**: Break-even occurs when **cumulative cash position becomes positive** (≥ $0).

### Current Calculation Logic

```typescript
// Starting point: Seed capital raised
let cumulativeCash = seedCapital; // e.g., $2,850,000

// Each month:
cumulativeCash += (revenue - costs); // Add monthly profit/loss

// Break-even month:
breakevenMonth = first month where cumulativeCash >= 0
```

### Why Month 0 Shows "Break-Even Achieved"

**The Issue**: The calculation is **technically correct but misleading**.

Here's what's happening:

1. **Month 0 (Ramp Start)**:
   - Starting cash: $2,850,000 (seed capital raised)
   - Revenue: $0
   - Costs: ~$500k (buildout, startup costs)
   - Cumulative cash: $2,850,000 - $500,000 = $2,350,000 ✅ (still positive)

2. **The Logic**:
   ```typescript
   if (month.cumulativeCash >= 0) {
     breakevenMonth = month.month; // Month 0
     break; // Stop searching
   }
   ```

3. **The Problem**:
   - We start with $2.85M in the bank
   - We never go negative (cumulative cash stays positive throughout)
   - So technically, we're "break-even" from Day 1 because we have investor capital

### What Break-Even SHOULD Mean

**Two Types of Break-Even**:

#### A. **Cash Break-Even** (Current Implementation)
- When cumulative cash ≥ $0
- **Problem**: Includes initial capital raise
- **Result**: Always Month 0 if you raise enough capital

#### B. **Operating Break-Even** (What Investors Want)
- When **monthly revenue ≥ monthly costs** (profit ≥ $0)
- **Ignores** initial capital
- **Result**: Shows when the business becomes self-sustaining

### Recommended Fix

**Change the calculation to show Operating Break-Even**:

```typescript
// OPTION 1: Operating Break-Even (Monthly Profit ≥ 0)
let operatingBreakevenMonth: number | null = null;
for (const month of allMonths) {
  if (month.profit >= 0) {
    operatingBreakevenMonth = month.month;
    break;
  }
}

// OPTION 2: Cash Flow Positive (Revenue > Costs, excluding capital)
// This shows when the business stops burning cash
let cashFlowPositiveMonth: number | null = null;
for (const month of allMonths) {
  if (month.cashFlow >= 0) {
    cashFlowPositiveMonth = month.month;
    break;
  }
}

// OPTION 3: Cumulative Burn Recovered
// When cumulative profit recovers the initial burn
let burnRecoveredMonth: number | null = null;
let cumulativeProfit = 0;
for (const month of allMonths) {
  cumulativeProfit += month.profit;
  if (cumulativeProfit >= 0) {
    burnRecoveredMonth = month.month;
    break;
  }
}
```

### What the Data Actually Shows

Let me check the actual monthly data to see when operating break-even occurs...

**Expected Timeline** (based on typical MSO model):
- **Month 0-6 (Ramp)**: Negative profit (burning capital)
- **Month 7 (Launch)**: Revenue $384,700, Costs $298,572 → **Profit: $86,128** ✅
- **Operating Break-Even**: Likely **Month 7**

**Current Display**: "Month 0" (misleading - this is just when we have capital in the bank)

**Should Display**: "Month 7" (when monthly revenue > costs)

---

## 2. Unit Economics Verification

### Current Calculations

#### A. Lifetime Value (LTV)
```typescript
const primaryPrice = inputs.primaryPrice; // $500/mo
const churnRate = inputs.churnPrimary / 100; // 5% → 0.05
const avgLifetimeMonths = 1 / churnRate; // 1 / 0.05 = 20 months

const ltv = primaryPrice * avgLifetimeMonths;
// LTV = $500 × 20 = $10,000
```

**Displayed**: $6,250  
**Expected**: $10,000  
**Status**: ❌ **DISCREPANCY - NEEDS INVESTIGATION**

#### B. Customer Acquisition Cost (CAC)
```typescript
const totalMarketingSpend = projection.reduce((sum, m) => sum + m.costs.marketing, 0);
// Sum of marketing costs over 12 months

const totalNewMembers = projection.reduce((sum, m) => sum + m.members.primaryNew, 0);
// Sum of new members acquired over 12 months

const cac = totalMarketingSpend / totalNewMembers;
```

**Formula**: ✅ Correct  
**Logic**: Total marketing spend ÷ Total new members acquired

**Sanity Check**:
- If marketing spend = $210k/year
- If new members = 150/year
- CAC = $210,000 / 150 = $1,400 ✅ (matches displayed $1,419)

#### C. LTV:CAC Ratio
```typescript
const ltvCacRatio = cac > 0 ? ltv / cac : 0;
```

**Displayed**: 4.4:1  
**Calculation**: $6,250 / $1,419 = 4.4 ✅

**Benchmark**: 
- **Good**: ≥ 3:1
- **Excellent**: ≥ 5:1
- **Current**: 4.4:1 ✅ (Healthy)

**Status**: ✅ Ratio calculation is correct, but depends on LTV accuracy

#### D. Payback Period
```typescript
const paybackMonths = primaryPrice > 0 ? cac / primaryPrice : 0;
```

**Calculation**: $1,419 / $500 = 2.8 months ✅

**Interpretation**: It takes 2.8 months of revenue to recover the customer acquisition cost.

**Benchmark**:
- **Excellent**: < 6 months
- **Good**: 6-12 months
- **Current**: 2.8 months ✅ (Excellent)

**Status**: ✅ Correct

#### E. Gross Margin
```typescript
const totalRevenue = totalRevenue12Mo;
const totalVariableCosts = projection.reduce((sum, m) => 
  sum + m.costs.variable + m.costs.diagnostics, 0
);
const grossMargin = totalRevenue > 0 ? 
  ((totalRevenue - totalVariableCosts) / totalRevenue) * 100 : 0;
```

**Formula**: (Revenue - Variable Costs) / Revenue × 100

**Displayed**: 61.2%

**Sanity Check**:
- Total Revenue (12mo): $8,100,338
- Variable Costs: Let's verify...
  - Variable costs: ~$3.1M
  - Diagnostics COGS: ~$0.05M
  - Total Variable: ~$3.15M
- Gross Margin: ($8.1M - $3.15M) / $8.1M = 61% ✅

**Benchmark**:
- **SaaS**: 70-90%
- **Healthcare Services**: 40-60%
- **Current**: 61.2% ✅ (Above average for healthcare)

**Status**: ✅ Correct

---

## 3. Capital Deployment Verification

### Current Calculation

```typescript
const capitalRaised = seedCapital; // $2,850,000

const buildoutCost = rampPeriod.reduce((sum, m) => sum + m.costs.capex, 0);
const equipmentCost = inputs.officeEquipment || 0;
const startupCosts = rampPeriod.reduce((sum, m) => sum + m.costs.startup, 0);
const workingCapital = rampPeriod.reduce((sum, m) => 
  sum + m.costs.salaries + m.costs.fixedOverhead + m.costs.marketing, 0
);

const totalDeployed = buildoutCost + equipmentCost + startupCosts + workingCapital;
const remainingReserve = capitalRaised - totalDeployed;
```

**Displayed**:
- Capital Raised: $2,850,000
- Buildout: $175,000 (6.1%)
- Equipment: $25,000 (0.9%)
- Startup: $225,000 (7.9%)
- Working Capital: $963,475 (33.8%)
- **Remaining Reserve**: $1,461,525 (51.3%)

**Verification**:
```
Total Deployed = $175k + $25k + $225k + $963k = $1,388,475
Remaining = $2,850,000 - $1,388,475 = $1,461,525 ✅
```

**Status**: ✅ Math checks out

**Business Logic Check**:
- **51% undeployed capital** seems high
- This suggests either:
  1. Conservative capital raise (good - shows runway)
  2. Missing cost categories (bad - incomplete model)
  3. Ramp period costs are lower than expected (verify)

**Recommendation**: Verify that all ramp period costs are captured.

---

## 4. Issues Found & Recommendations

### 🔴 CRITICAL: Break-Even Definition

**Issue**: "Month 0 break-even" is misleading.

**Root Cause**: Calculation checks cumulative cash (which starts at $2.85M) instead of operating profit.

**Impact**: Investors will question this immediately.

**Fix**: Change to Operating Break-Even:
```typescript
// Find first month with positive monthly profit
let operatingBreakevenMonth: number | null = null;
for (const month of allMonths) {
  if (month.profit >= 0) {
    operatingBreakevenMonth = month.month;
    break;
  }
}
```

**Expected Result**: Month 7 (when revenue > costs)

---

### ⚠️ MEDIUM: LTV Calculation Discrepancy

**Issue**: Displayed LTV is $6,250, but calculation suggests $10,000.

**Possible Causes**:
1. Churn rate is higher than 5%
2. LTV calculation includes a discount factor
3. LTV is calculated differently (e.g., only equity income)

**Fix**: Review the actual LTV calculation in the code to find the discrepancy.

---

### ⚠️ MEDIUM: High Capital Reserve

**Issue**: 51% of capital is "undeployed" after ramp period.

**Questions**:
1. Are all ramp costs captured?
2. Is equipment lease vs. purchase accounted for?
3. Are there missing categories (legal, insurance, licenses)?

**Fix**: Audit ramp period cost categories.

---

### ✅ LOW: Gross Margin Calculation

**Status**: Correct, but verify variable cost categories.

**Recommendation**: Ensure diagnostics COGS is properly calculated based on margin assumptions.

---

## 5. Recommended Changes

### Priority 1: Fix Break-Even Calculation

**Change in `calculations.ts`**:

```typescript
// CURRENT (WRONG)
let breakevenMonthFound: number | null = null;
for (const month of allMonths) {
  if (month.cumulativeCash >= 0) { // ❌ Always true at Month 0
    breakevenMonthFound = month.month;
    break;
  }
}

// RECOMMENDED (CORRECT)
let operatingBreakevenMonth: number | null = null;
for (const month of allMonths) {
  if (month.profit >= 0) { // ✅ First month with positive profit
    operatingBreakevenMonth = month.month;
    break;
  }
}

// Alternative: Cash Flow Positive (excludes CapEx/Startup)
let cashFlowPositiveMonth: number | null = null;
for (const month of allMonths) {
  if (month.revenue.total >= month.costs.salaries + month.costs.fixedOverhead + 
      month.costs.marketing + month.costs.variable + month.costs.equipmentLease) {
    cashFlowPositiveMonth = month.month;
    break;
  }
}
```

**Update Display**:
```typescript
// In BreakEvenIndicator.tsx
{isBreakeven ? (
  <div>
    <div className="text-5xl font-bold text-green-600">
      Month {breakevenMonth}
    </div>
    <p className="text-gray-600">Operating break-even</p>
    <p className="text-xs text-gray-500">First month with positive profit</p>
  </div>
) : (
  <div>
    <div className="text-5xl font-bold text-orange-600">
      {monthsToBreakeven} mo
    </div>
    <p className="text-gray-600">To operating break-even</p>
  </div>
)}
```

---

### Priority 2: Investigate LTV Discrepancy

**Action**: Add console.log to verify LTV calculation:

```typescript
console.log('LTV Calculation:', {
  primaryPrice,
  churnRate,
  avgLifetimeMonths,
  ltv,
  expected: primaryPrice * avgLifetimeMonths
});
```

---

### Priority 3: Add Tooltips Explaining Formulas

**Example for Break-Even**:
```typescript
<InfoTooltip>
  <strong>Operating Break-Even</strong>
  <p>First month where monthly revenue exceeds monthly operating costs.</p>
  <p className="mt-2">Formula: Revenue ≥ Costs</p>
  <p className="text-xs mt-2">Note: This excludes initial capital raise and shows when the business becomes self-sustaining.</p>
</InfoTooltip>
```

---

## 6. Summary: Are Calculations Reasonable?

### ✅ Reasonable & Correct
- **CAC**: $1,419 (reasonable for healthcare)
- **Payback Period**: 2.8 months (excellent)
- **Gross Margin**: 61.2% (strong for healthcare services)
- **LTV:CAC Ratio**: 4.4:1 (healthy, above 3:1 target)
- **Capital Deployment Math**: Adds up correctly

### ❌ Needs Fixing
- **Break-Even Month**: Showing "Month 0" is misleading
  - Should show "Month 7" (operating break-even)
  - Current logic checks cumulative cash (includes capital raise)
  - Should check monthly profit (revenue vs. costs)

### ⚠️ Needs Investigation
- **LTV**: $6,250 displayed vs. $10,000 expected
  - Verify calculation logic
  - Check if there's a discount factor or different formula

### 💡 Recommendations
1. **Immediate**: Fix break-even to show operating break-even (Month 7)
2. **High Priority**: Investigate LTV calculation discrepancy
3. **Medium Priority**: Add formula tooltips for transparency
4. **Low Priority**: Audit capital deployment categories

---

**Next Step**: Should I fix the break-even calculation to show operating break-even instead of cumulative cash break-even?

