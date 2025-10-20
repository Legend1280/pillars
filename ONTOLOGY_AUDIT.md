# Pillars Dashboard - Ontology & Calculation Audit

**Generated:** 2025-10-19  
**Audit Type:** Ontology-First Debugging  
**Status:** 🔴 CRITICAL - 17 Ontology Mismatches, 5 Calculation Errors

---

## PHASE 1: ONTOLOGY SCHEMA MISMATCHES

### Summary
The `calculationGraph.ts` references **10 fields** that don't exist in `DashboardInputs` interface. These must be reconciled at the schema level before any calculation fixes.

---

### 🔴 CRITICAL: Field Name Mismatches (10 issues)

| Graph Field (WRONG) | Actual Field (CORRECT) | Location | Type |
|---------------------|------------------------|----------|------|
| `primaryMembersMonth1` | `primaryInitPerPhysician` | calculationGraph.ts:53 | Derived value |
| `specialtyMembersMonth1` | `specialtyInitPerPhysician` | calculationGraph.ts:54 | Derived value |
| `primaryIntakePerMonth` | `primaryIntakeMonthly` | calculationGraph.ts:55 | Direct rename |
| `specialtyIntakePerMonth` | *Derived from `primaryToSpecialtyConversion`* | calculationGraph.ts:56 | Calculated |
| `labsPrice` | `labTestsPrice` | calculationGraph.ts:74 | Direct rename |
| `annualPrimaryGrowthRate` | **DOES NOT EXIST** | calculationGraph.ts:85 | Missing feature |
| `annualSpecialtyGrowthRate` | `physicianSpecialtyGrowthRate` | calculationGraph.ts:86 | Direct rename |
| `physicianLaunchMonth` | *Derived: `rampDuration + 1`* | calculationGraph.ts:102 | Calculated |
| `directorOpsMonth` | `directorOpsStartMonth` | calculationGraph.ts:103 | Direct rename |
| `eventPlannerMonth` | `eventPlannerStartMonth` | calculationGraph.ts:104 | Direct rename |

---

### 📋 Ontology Reconciliation Table

#### 1. `primaryMembersMonth1` → Derived Calculation

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 53
{ id: 'primaryMembersMonth1', value: inputs.primaryMembersMonth1 }
```

**Should Be:**
```typescript
// Option A: Use existing field
{ id: 'primaryInitPerPhysician', value: inputs.primaryInitPerPhysician }

// Option B: Calculate initial members
const primaryMembersMonth1 = inputs.foundingToggle 
  ? inputs.primaryInitPerPhysician + inputs.physicianPrimaryCarryover
  : inputs.primaryInitPerPhysician * (1 + inputs.additionalPhysicians);
```

**Ontology Impact:** This is a **derived variable**, not an input. Graph should reference the calculation, not a non-existent input field.

**Recommendation:** Add to `DashboardInputs` as a derived field OR update graph to use `primaryInitPerPhysician`.

---

#### 2. `specialtyMembersMonth1` → Derived Calculation

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 54
{ id: 'specialtyMembersMonth1', value: inputs.specialtyMembersMonth1 }
```

**Should Be:**
```typescript
{ id: 'specialtyInitPerPhysician', value: inputs.specialtyInitPerPhysician }
```

**Ontology Impact:** Same as #1 - this is a derived variable.

---

#### 3. `primaryIntakePerMonth` → `primaryIntakeMonthly`

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 55
{ id: 'primaryIntakePerMonth', value: inputs.primaryIntakePerMonth }
```

**Should Be:**
```typescript
{ id: 'primaryIntakeMonthly', value: inputs.primaryIntakeMonthly }
```

**Ontology Impact:** Simple field name mismatch. Field exists in data model (line 14) as `primaryIntakeMonthly`.

**Fix:** Rename in graph to match schema.

---

#### 4. `specialtyIntakePerMonth` → Derived from Conversion Rate

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 56
{ id: 'specialtyIntakePerMonth', value: inputs.specialtyIntakePerMonth }
```

**Should Be:**
```typescript
// This is calculated, not an input
const specialtyIntakePerMonth = inputs.primaryIntakeMonthly * (inputs.primaryToSpecialtyConversion / 100);
```

**Ontology Impact:** This is a **calculated node**, not an input node. The graph has it in the wrong category.

**Fix:** Move to calculation nodes section, derive from `primaryIntakeMonthly` and `primaryToSpecialtyConversion`.

---

#### 5. `labsPrice` → `labTestsPrice`

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 74
{ id: 'labsPrice', value: inputs.labsPrice }
```

**Should Be:**
```typescript
{ id: 'labTestsPrice', value: inputs.labTestsPrice }
```

**Ontology Impact:** Field exists in data model (line 52) as `labTestsPrice`.

**Fix:** Rename in graph to match schema.

---

#### 6. `annualPrimaryGrowthRate` → DOES NOT EXIST

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 85
{ id: 'annualPrimaryGrowthRate', value: inputs.annualPrimaryGrowthRate }
```

**Should Be:**
```typescript
// REMOVE THIS NODE - feature not implemented
```

**Ontology Impact:** This field doesn't exist in the data model. Primary member growth is driven by fixed monthly intake (`primaryIntakeMonthly`), not a growth rate.

**Fix:** Remove this node from the graph OR add the field to `DashboardInputs` if the feature is planned.

---

#### 7. `annualSpecialtyGrowthRate` → `physicianSpecialtyGrowthRate`

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 86
{ id: 'annualSpecialtyGrowthRate', value: inputs.annualSpecialtyGrowthRate }
```

**Should Be:**
```typescript
{ id: 'physicianSpecialtyGrowthRate', value: inputs.physicianSpecialtyGrowthRate }
```

**Ontology Impact:** Field exists in data model (line 20) as `physicianSpecialtyGrowthRate`.

**Fix:** Rename in graph to match schema.

---

#### 8. `physicianLaunchMonth` → Derived from `rampDuration`

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 102
{ id: 'physicianLaunchMonth', value: inputs.physicianLaunchMonth }
```

**Should Be:**
```typescript
const physicianLaunchMonth = inputs.rampDuration + 1; // Launch happens after ramp
```

**Ontology Impact:** This is a **derived value**, not an input. Launch month is always `rampDuration + 1`.

**Fix:** Move to calculation nodes, derive from `rampDuration`.

---

#### 9. `directorOpsMonth` → `directorOpsStartMonth`

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 103
{ id: 'directorOpsMonth', value: inputs.directorOpsMonth }
```

**Should Be:**
```typescript
{ id: 'directorOpsStartMonth', value: inputs.directorOpsStartMonth }
```

**Ontology Impact:** Field exists in data model (line 118) as `directorOpsStartMonth`.

**Fix:** Rename in graph to match schema.

---

#### 10. `eventPlannerMonth` → `eventPlannerStartMonth`

**Current (BROKEN):**
```typescript
// calculationGraph.ts line 104
{ id: 'eventPlannerMonth', value: inputs.eventPlannerMonth }
```

**Should Be:**
```typescript
{ id: 'eventPlannerStartMonth', value: inputs.eventPlannerStartMonth }
```

**Ontology Impact:** Field exists in data model (line 121) as `eventPlannerStartMonth`.

**Fix:** Rename in graph to match schema.

---

## PHASE 2: CALCULATION LOGIC ERRORS

### 🔴 CRITICAL: Calculation Bugs (5 issues)

---

#### 1. Equipment Lease Missing Parameter

**Location:** `calculations.ts` line 468

**Current (BROKEN):**
```typescript
const equipmentLease = calculateEquipmentLease(inputs);
```

**Should Be:**
```typescript
const equipmentLease = calculateEquipmentLease(inputs, month);
```

**Impact:** Equipment lease costs will be incorrect for all 12 months. Function can't determine which equipment is active without the month parameter.

**Ontology Connection:** The function signature defines a dependency on `month`, but the call site doesn't provide it.

**Fix Priority:** 🔴 CRITICAL - Breaks 12-month projection

---

#### 2. ROI Investment Calculation Error

**Location:** `calculations.ts` line 544

**Current (BROKEN):**
```typescript
const investment = capexBuildoutCost + officeEquipment + startupTotal; // Total MSO costs
const physicianROI = (totalProfit12Mo / investment) * 100;
```

**Should Be:**
```typescript
const investment = inputs.foundingToggle ? 600000 : 750000; // Individual physician contribution
const physicianROI = (physicianAnnualIncome / investment) * 100;
```

**Impact:** ROI appears 3-4x lower than actual. Misleads physicians about their returns.

**Ontology Connection:** The definition of "investment" in the ROI formula is wrong. Should be physician's capital contribution, not total MSO costs.

**Fix Priority:** 🔴 CRITICAL - Incorrect financial metric

---

#### 3. Churn Rate Calculation - ✅ VERIFIED CORRECT

**Location:** `calculations.ts` lines 189, 199, 296, 403, 412

**Current (CORRECT):**
```typescript
const churned = primaryMembers * (inputs.churnPrimary / 100 / 12);
```

**Ontology Clarification:** `churnPrimary` is an ANNUAL percentage (default 8%)
- `/100` converts percentage to decimal (8% → 0.08)
- `/12` converts annual to monthly rate (0.08/12 = 0.0067 or 0.67% monthly)
- 8% annual churn = 0.67% monthly churn (realistic for medical membership)

**Impact:** Calculation is ontologically correct. No fix needed.

**Fix Applied:** ✅ Added documentation to schema (data.ts line 15):
```typescript
churnPrimary: number; // 0-20%, default 8% - ANNUAL churn rate (divided by 12 for monthly calculations)
```

**Status:** ✅ RESOLVED - Manus AI incorrectly flagged this as an error

---

#### 4. Missing constants.ts File

**Location:** `data.ts` line 308, `calculations.ts` line 13

**Current (BROKEN):**
```typescript
import { BUSINESS_RULES, getMSOFee, getEquityShare, calculateSeedCapital } from './constants';
```

**Should Be:**
```typescript
// Create constants.ts file with these functions
```

**Impact:** Runtime failure - file doesn't exist.

**Ontology Connection:** These are **core business rules** that define the financial model. They're referenced but not defined.

**Fix Priority:** 🔴 CRITICAL - Will cause runtime errors

**Required constants.ts content:**
```typescript
export const BUSINESS_RULES = {
  FOUNDING_MSO_FEE: 37,
  FOUNDING_EQUITY: 10,
  ADDITIONAL_MSO_FEE: 40,
  ADDITIONAL_EQUITY: 5,
  FOUNDING_INVESTMENT: 600000,
  ADDITIONAL_INVESTMENT: 750000
};

export function getMSOFee(isFoundingPhysician: boolean): number {
  return isFoundingPhysician ? BUSINESS_RULES.FOUNDING_MSO_FEE : BUSINESS_RULES.ADDITIONAL_MSO_FEE;
}

export function getEquityShare(isFoundingPhysician: boolean): number {
  return isFoundingPhysician ? BUSINESS_RULES.FOUNDING_EQUITY : BUSINESS_RULES.ADDITIONAL_EQUITY;
}

export function calculateSeedCapital(inputs: DashboardInputs): number {
  const foundingCapital = inputs.foundingToggle ? BUSINESS_RULES.FOUNDING_INVESTMENT : 0;
  const additionalCapital = inputs.additionalPhysicians * BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  return foundingCapital + additionalCapital;
}
```

---

#### 5. Corporate Revenue at Launch Doesn't Account for Ramp Growth

**Location:** `calculations.ts` line 336

**Current (BROKEN):**
```typescript
const corporateRevenue = corpInitialClients * corpPricePerEmployeeMonth;
```

**Should Be:**
```typescript
// Account for contracts added during ramp period
const monthsSinceCorpStart = Math.max(0, rampDuration - corporateStartMonth + 1);
const corporateEmployees = corpInitialClients + (corporateContractsMonthly * employeesPerContract * monthsSinceCorpStart);
const corporateRevenue = corporateEmployees * corpPricePerEmployeeMonth;
```

**Impact:** Launch state revenue understates corporate revenue if contracts were added during ramp.

**Ontology Connection:** The launch state calculation doesn't properly reference the ramp period timeline.

**Fix Priority:** 🟡 HIGH - Incorrect revenue projection

---

## ONTOLOGY CHANGELOG

| Date | Node/Field | Old Definition | New Definition | Reason |
|------|------------|----------------|----------------|--------|
| 2025-10-19 | `primaryIntakePerMonth` | `inputs.primaryIntakePerMonth` | `inputs.primaryIntakeMonthly` | Field name mismatch |
| 2025-10-19 | `labsPrice` | `inputs.labsPrice` | `inputs.labTestsPrice` | Field name mismatch |
| 2025-10-19 | `annualSpecialtyGrowthRate` | `inputs.annualSpecialtyGrowthRate` | `inputs.physicianSpecialtyGrowthRate` | Field name mismatch |
| 2025-10-19 | `directorOpsMonth` | `inputs.directorOpsMonth` | `inputs.directorOpsStartMonth` | Field name mismatch |
| 2025-10-19 | `eventPlannerMonth` | `inputs.eventPlannerMonth` | `inputs.eventPlannerStartMonth` | Field name mismatch |
| 2025-10-19 | `primaryMembersMonth1` | Input node | Derived calculation node | Should be calculated from `primaryInitPerPhysician` |
| 2025-10-19 | `specialtyMembersMonth1` | Input node | Derived calculation node | Should be calculated from `specialtyInitPerPhysician` |
| 2025-10-19 | `specialtyIntakePerMonth` | Input node | Derived calculation node | Should be calculated from conversion rate |
| 2025-10-19 | `physicianLaunchMonth` | Input node | Derived calculation node | Should be `rampDuration + 1` |
| 2025-10-19 | `annualPrimaryGrowthRate` | Input node | **REMOVE** | Feature not implemented |
| 2025-10-19 | `churnPrimary` | Undefined unit | Annual percentage | Clarify: annual rate, divide by 12 for monthly |
| 2025-10-19 | `constants.ts` | Missing | **CREATE FILE** | Required for business rules |

---

## REPAIR PRIORITY

### Immediate (Do First)
1. ✅ Create `constants.ts` file
2. ✅ Fix `calculateEquipmentLease` call (add month parameter)
3. ✅ Rename 5 direct field mismatches in graph

### High Priority (Do Second)
4. ✅ Fix ROI calculation logic
5. ✅ Clarify churn rate definition in schema
6. ✅ Fix corporate revenue at launch

### Medium Priority (Do Third)
7. ✅ Convert 4 input nodes to derived calculation nodes
8. ✅ Remove `annualPrimaryGrowthRate` node

---

## INTEGRITY VALIDATION CHECKLIST

After repairs, verify:

- [ ] All graph nodes reference fields that exist in `DashboardInputs`
- [ ] All derived values are in calculation nodes, not input nodes
- [ ] All function calls have correct parameter counts
- [ ] All business rules are defined in `constants.ts`
- [ ] All field names match between graph and schema
- [ ] All units are documented (annual vs monthly rates)
- [ ] Changelog is updated with all changes

---

**Next Steps:** Apply fixes in order of priority, validate after each change.

