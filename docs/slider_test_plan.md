# Systematic Slider Testing Plan

## Approach

For each section, I will:
1. Test 2-3 key sliders that should have significant impact
2. Record baseline values
3. Change slider values
4. Verify charts/KPIs update
5. Document results

## Baseline Values (Current State)

- **Capital Deployed**: $2,170,793
- **Launch MRR**: $224,200
- **Members at Launch**: 142
- **Cash at Launch**: $2,170,793

---

## Section 1: Inputs & Scenarios

### Test 1: Additional Physicians (currently 3)
- **Change**: 3 → 5
- **Expected Impact**: Higher capital (more $750K investments), more capacity
- **Test**: Change and observe Capital Deployed

### Test 2: Primary Price (currently $200)
- **Change**: $200 → $300
- **Expected Impact**: Higher revenue, higher Launch MRR
- **Test**: Change and observe Launch MRR

### Test 3: Churn Primary (currently 15%)
- **Change**: 15% → 25%
- **Expected Impact**: Lower members at launch
- **Test**: Change and observe Members at Launch

---

## Section 2: Revenues

### Test 4: Specialty Price (currently $500)
- **Change**: $500 → $700
- **Expected Impact**: Higher revenue, higher Launch MRR
- **Test**: Change and observe Launch MRR

---

## Section 3: Diagnostics

### Test 5: Echo Price (currently $300)
- **Change**: $300 → $500
- **Expected Impact**: Higher diagnostics revenue
- **Test**: Change and observe Launch MRR

### Test 6: CT Start Month (currently 2)
- **Change**: 2 → 5
- **Expected Impact**: Lower capital deployed (delayed equipment)
- **Test**: Change and observe Capital Deployed

---

## Section 4: Costs

### Test 7: Fixed Overhead Monthly (currently $65,000)
- **Change**: $65,000 → $80,000
- **Expected Impact**: Higher capital deployed
- **Test**: Change and observe Capital Deployed

### Test 8: Marketing Budget Monthly (currently $35,000)
- **Change**: $35,000 → $50,000
- **Expected Impact**: Higher capital deployed
- **Test**: Change and observe Capital Deployed

---

## Section 5: Ramp to Launch

### Test 9: Ramp Duration (currently 6)
- **Change**: 6 → 9
- **Expected Impact**: Higher capital deployed (more months of burn)
- **Test**: Change and observe Capital Deployed

---

## Section 6: Staffing

### Test 10: Medical Director Salary (currently $25,000)
- **Change**: $25,000 → $35,000
- **Expected Impact**: Higher capital deployed
- **Test**: Change and observe Capital Deployed

---

## Section 7: Growth

### Test 11: DexaFit Primary Intake Monthly (currently 25)
- **Change**: 25 → 50
- **Expected Impact**: Higher members at launch
- **Test**: Change and observe Members at Launch

### Test 12: Corporate Contract Sales / Month (currently 1)
- **Change**: 1 → 5
- **Expected Impact**: Much higher corporate revenue
- **Test**: Change and observe Launch MRR and Capital Deployed

---

## Testing Method

For each test:
1. Navigate to the section
2. Record current value
3. Change slider to new value
4. Wait 2 seconds for React update
5. Check if KPI cards updated
6. Record result (✅ Working / ❌ Not Working)
7. Reset to original value if needed

---

## Success Criteria

- **Pass**: At least 10/12 sliders update charts correctly
- **Partial**: 7-9 sliders work
- **Fail**: Less than 7 sliders work

If failures found, will investigate root cause and fix.

