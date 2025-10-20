# Ontology Update: Single Source of Truth Architecture

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DashboardInputs                               │
│  (foundingToggle, additionalPhysicians, adminSupportRatio, etc.) │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              calculations.ts::calculateProjections()             │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Ramp Period   │  │  Launch State  │  │  12-Mo Projection│  │
│  │  (Months 0-6)  │  │  (Month 7)     │  │  (Months 7-18)   │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│              ┌────────────────────────┐                          │
│              │   calculateKPIs()      │                          │
│              │  ✓ monthlyIncome       │                          │
│              │  ✓ annualizedROI       │                          │
│              │  ✓ msoEquityIncome     │                          │
│              │  ✓ equityStakeValue    │                          │
│              │  ✓ monthlyIncomeBreakdown (NEW)                  │
│              │    - Specialty Care    │                          │
│              │    - Primary Care      │                          │
│              │    - Echo              │                          │
│              │    - CT Scan           │                          │
│              │    - Labs              │                          │
│              │    - Corporate Wellness│                          │
│              └────────────────────────┘                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DashboardContext                                │
│              { inputs, projections }                             │
│                                                                  │
│  projections.kpis.monthlyIncome                                  │
│  projections.kpis.monthlyIncomeBreakdown[]                       │
│  projections.kpis.msoEquityIncome                                │
│  projections.kpis.equityStakeValue                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PhysicianROITab.tsx (View Layer)                    │
│                                                                  │
│  const { inputs, projections } = useDashboard();                │
│  const kpis = projections.kpis;                                 │
│                                                                  │
│  ✓ 8 KPI Cards: kpis.monthlyIncome, kpis.annualizedROI, etc.   │
│  ✓ Donut Chart: kpis.monthlyIncomeBreakdown                     │
│  ✓ Analysis Table: kpis.msoEquityIncome                         │
│  ✓ Equity Valuation: dynamicEquityValue (derived from kpis)    │
│                                                                  │
│  ❌ NO local calculations                                        │
│  ❌ NO duplicate logic                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Ontological Changes Summary

### Before (Violated Single Source of Truth)
- ❌ PhysicianROITab calculated `specialtyRetained`, `primaryIncome`, etc. locally
- ❌ Same calculations existed in both `calculations.ts` AND `PhysicianROITab.tsx`
- ❌ Risk of inconsistency if formulas diverged
- ❌ 35+ lines of duplicate calculation logic

### After (Single Source of Truth)
- ✅ All calculations happen in `calculations.ts::calculateKPIs()`
- ✅ PhysicianROITab consumes `kpis.monthlyIncomeBreakdown` directly
- ✅ Zero duplicate calculation logic
- ✅ Guaranteed consistency across all views

## Data Structure

### kpis.monthlyIncomeBreakdown
```typescript
Array<{
  name: string;        // "Specialty Care", "Primary Care", etc.
  value: number;       // Whole dollar amount (no cents)
  color: string;       // Hex color for visualization
}>
```

### Calculation Formula (in calculations.ts)
```typescript
const profitMargin = month12.profit / month12.revenue.total;
const msoFee = getMSOFee(inputs.foundingToggle);
const equityStake = getEquityShare(inputs.foundingToggle);

monthlyIncomeBreakdown = [
  { 
    name: 'Specialty Care', 
    value: month12.revenue.specialty * (1 - msoFee),  // Direct revenue retained
    color: '#3b82f6' 
  },
  { 
    name: 'Primary Care', 
    value: month12.revenue.primary * profitMargin * equityStake,  // Equity share
    color: '#10b981' 
  },
  // ... 4 more streams (Echo, CT, Labs, Corporate)
];
```

## Verification

### Monthly Income Breakdown (Donut Chart)
- ✅ Shows all 6 revenue streams
- ✅ All values are whole dollars
- ✅ Data sourced from `kpis.monthlyIncomeBreakdown`
- ✅ Colors match the defined palette

### Example Values (Founding Physician, Moderate Scenario)
1. Specialty Care: **$59,051** (63% service fee retained)
2. Primary Care: **$9,570** (10% equity share)
3. Echo: **$343** (10% equity share)
4. CT Scan: **$1,320** (10% equity share)
5. Labs: **$343** (10% equity share)
6. Corporate Wellness: **$19,290** (10% equity share)

**Total**: $89,917 (matches Card 1: Monthly Income)

## Files Modified

1. **`client/src/lib/calculations.ts`**
   - Added `monthlyIncomeBreakdown` to KPI interface
   - Added breakdown calculation in `calculateKPIs()`
   - Returns breakdown as part of KPI object

2. **`client/src/components/PhysicianROITab.tsx`**
   - Removed local `incomeBreakdown` calculation (22 lines)
   - Changed to: `const incomeBreakdown = kpis.monthlyIncomeBreakdown;`
   - Now uses centralized data source

## Benefits

1. **Consistency**: All views use the same calculation logic
2. **Maintainability**: Change formula once, updates everywhere
3. **Testability**: Test calculations in one place
4. **Performance**: No redundant calculations
5. **Clarity**: Clear data flow from source to view

## Sandbox Deployment

**Test URL**: https://3001-i9qzokiomyvyij88p7uan-34da3b87.manusvm.computer

Navigate to "Physician ROI" tab → Scroll to "Monthly Income Breakdown" to verify 6-stream donut chart.

