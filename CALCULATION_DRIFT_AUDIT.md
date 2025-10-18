# Calculation Drift Audit Report
**Date:** October 17, 2025  
**Purpose:** Venture Capital Presentation Data Integrity  
**Status:** 🔴 CRITICAL ISSUES FOUND

## Executive Summary

Found **7 derived values** stored as static data in `DashboardInputs` that should be calculated dynamically. This creates drift where values become out-of-sync with their source inputs, compromising data integrity for VC presentation.

## Critical Drift Issues

### 1. Startup Cost Values (HIGH PRIORITY)

**Location:** `DashboardInputs` lines 73-75

```typescript
startupTotal: number;      // Currently: 75000 (static)
startupMonth0: number;     // Currently: 37500 (static)
startupMonth1: number;     // Currently: 37500 (static)
```

**Problem:**
- Source input: `rampStartupCost: 250000` (line 248)
- Stored values: `startupTotal: 75000` (line 215)
- **Drift:** 233% discrepancy ($250k vs $75k)

**Should Be:**
```typescript
startupTotal = rampStartupCost  // $250,000
startupMonth0 = rampStartupCost / 2  // $125,000
startupMonth1 = rampStartupCost / 2  // $125,000
```

**Impact:** Understates startup costs by $175k, affecting:
- Total capital requirements
- Cash flow projections
- Breakeven analysis
- ROI calculations

---

### 2. CapEx Month 0 (HIGH PRIORITY)

**Location:** `DashboardInputs` line 76

```typescript
capexMonth0: number;  // Currently: 250000 (static)
```

**Problem:**
- Source inputs: 
  - `capexBuildoutCost: 500000` (line 206)
  - `officeEquipment: 50000` (line 207)
- Stored value: `capexMonth0: 250000` (line 218)
- **Drift:** 120% discrepancy ($550k vs $250k)

**Should Be:**
```typescript
capexMonth0 = capexBuildoutCost + officeEquipment  // $550,000
```

**Impact:** Understates initial capital outlay by $300k

---

### 3. Fixed Cost Monthly (MEDIUM PRIORITY)

**Location:** `DashboardInputs` line 77

```typescript
fixedCostMonthly: number;  // Currently: 115000 (static)
```

**Problem:**
- Source inputs:
  - `fixedOverheadMonthly: 80000` (line 209)
  - `marketingBudgetMonthly: 35000` (line 211)
- Stored value: `fixedCostMonthly: 115000` (line 219)
- **Status:** Currently matches, but will drift if inputs change

**Should Be:**
```typescript
fixedCostMonthly = fixedOverheadMonthly + marketingBudgetMonthly  // $115,000
```

**Impact:** Will cause drift when overhead or marketing budgets are adjusted

---

### 4. Variable Cost Monthly (LOW PRIORITY)

**Location:** `DashboardInputs` line 78

```typescript
variableCostMonthly: number;  // Currently: 0 (static)
```

**Problem:**
- Depends on revenue, which varies by month
- Cannot be a single static value
- Currently set to $0 in defaults

**Should Be:**
```typescript
// Calculated per month in projection engine
variableCostMonthly = monthlyRevenue * (variableCostPct / 100)
```

**Impact:** This value is meaningless as a single number; should be removed or calculated per month

---

### 5. Operating Cost Monthly (LOW PRIORITY)

**Location:** `DashboardInputs` line 79

```typescript
operatingCostMonthly: number;  // Currently: 115000 (static)
```

**Problem:**
- Should be sum of all operating costs
- Varies by month due to variable costs and salaries
- Cannot be a single static value

**Should Be:**
```typescript
// Calculated per month in projection engine
operatingCostMonthly = salaries + fixedOverheadMonthly + marketingBudgetMonthly + equipmentLease + variableCosts
```

**Impact:** Misleading single value for a time-varying metric

---

### 6. Equipment Lease Values (MEDIUM PRIORITY)

**Location:** `DashboardInputs` lines 113-115

```typescript
ctLeaseCost: number;           // $5000/month
echoLeaseCost: number;         // $2000/month
totalEquipmentLease: number;   // Sum of CT + Echo
```

**Problem:**
- These are currently inputs, but should be derived
- `totalEquipmentLease` should be calculated from the other two
- Or all three should be inputs (current approach seems correct)

**Current Status:** ✅ Appears correct as inputs
- User can set individual lease costs
- Total is used in calculations

**Recommendation:** Keep as inputs, but validate `totalEquipmentLease = ctLeaseCost + echoLeaseCost`

---

## Additional Derived Values (Currently Correct)

These are properly calculated in `calculateDerivedVariables()`:

```typescript
✅ otherPhysiciansCount = physiciansLaunch - 1
✅ teamPrimaryMembers = otherPhysiciansCount * otherPhysiciansPrimaryCarryoverPerPhysician
✅ teamSpecialtyClients = otherPhysiciansCount * otherPhysiciansSpecialtyCarryoverPerPhysician
```

---

## Recommendations

### Immediate Actions (Before VC Presentation)

1. **Expand `DerivedVariables` Interface**
   ```typescript
   export interface DerivedVariables {
     // Existing
     otherPhysiciansCount: number;
     teamPrimaryMembers: number;
     teamSpecialtyClients: number;
     
     // Add these
     startupTotal: number;
     startupMonth0: number;
     startupMonth1: number;
     capexMonth0: number;
     fixedCostMonthly: number;
     totalEquipmentLease: number;
   }
   ```

2. **Update `calculateDerivedVariables()` Function**
   - Add calculations for all derived values
   - Ensure formulas match business logic

3. **Remove from `DashboardInputs` Interface**
   - Remove lines 73-79 (derived cost metrics)
   - Keep only primitive inputs

4. **Update Scenario Export/Import**
   - Exclude derived values from exports
   - Recalculate on import

5. **Add Validation**
   - Verify all derived values are calculated
   - Add tests to catch future drift

---

## Impact on VC Presentation

### Current State (With Drift):
- ❌ Startup costs understated by $175k
- ❌ CapEx understated by $300k
- ❌ Total capital requirement understated by $475k
- ❌ Numbers don't tie together when audited
- ❌ Credibility risk if VCs find discrepancies

### After Fix:
- ✅ All numbers calculated from primitives
- ✅ Perfect consistency across all views
- ✅ Audit trail is clean
- ✅ Changes to inputs propagate correctly
- ✅ VCs can trust the model

---

## Files Requiring Changes

1. `/client/src/lib/data.ts`
   - Expand `DerivedVariables` interface
   - Update `calculateDerivedVariables()` function
   - Remove derived fields from `DashboardInputs`

2. `/client/src/lib/calculations.ts`
   - Verify all calculations use derived values correctly
   - Ensure no hardcoded values

3. `/client/src/lib/exportImport.ts`
   - Exclude derived values from exports
   - Recalculate on import

4. `/client/src/components/*`
   - Update any components referencing `inputs.startupTotal` etc.
   - Change to `derivedVariables.startupTotal`

---

## Testing Checklist

After fixes:
- [ ] Change `rampStartupCost` → verify `startupTotal` updates
- [ ] Change `capexBuildoutCost` → verify `capexMonth0` updates
- [ ] Change `fixedOverheadMonthly` → verify `fixedCostMonthly` updates
- [ ] Export scenario → verify derived values not in JSON
- [ ] Import scenario → verify derived values recalculated
- [ ] Excel export → verify all numbers tie together
- [ ] 12-month projection → verify cash flow is correct

---

## Priority Matrix

| Issue | Priority | Impact | Effort | Fix Order |
|-------|----------|--------|--------|-----------|
| Startup costs drift | 🔴 HIGH | $175k error | Low | 1 |
| CapEx drift | 🔴 HIGH | $300k error | Low | 2 |
| Fixed cost drift | 🟡 MEDIUM | Future drift | Low | 3 |
| Equipment lease | 🟡 MEDIUM | Validation | Low | 4 |
| Variable cost | 🟢 LOW | Conceptual | Medium | 5 |
| Operating cost | 🟢 LOW | Conceptual | Medium | 6 |

---

## Conclusion

**Status:** 🔴 NOT READY FOR VC PRESENTATION

**Required Actions:** Fix drift in startup costs and CapEx (Issues #1 and #2) before presenting to investors.

**Estimated Fix Time:** 2-3 hours for complete audit fix

**Risk if Not Fixed:** VCs will find $475k discrepancy in capital requirements, damaging credibility.

---

**Next Steps:**
1. Approve this audit report
2. Implement fixes in priority order
3. Run validation tests
4. Generate clean scenario exports
5. Review final numbers before VC meeting

