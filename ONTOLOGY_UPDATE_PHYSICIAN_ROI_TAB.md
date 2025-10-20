# Ontology Update: PhysicianROITab Refactoring

## Change Summary
**Date:** 2025-10-20  
**Component:** `PhysicianROITab.tsx`  
**Change Type:** Refactoring - Replace local calculations with centralized KPI system  
**Impact:** High - Ensures consistency across all dashboard views

---

## Current State (Before)

### Object Structure - PhysicianROITab.tsx
```typescript
// Current implementation (lines 19-54)
const metrics = useMemo(() => {
  // LOCAL CALCULATIONS (duplicated logic)
  const serviceFee = getMSOFee(inputs.foundingToggle) * 100;
  const equityStake = getEquityShare(inputs.foundingToggle) * 100;
  const investment = inputs.foundingToggle ? BUSINESS_RULES.FOUNDING_INVESTMENT : BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  
  // Physician income breakdown
  const specialtyRetained = month12.revenue.specialty * (1 - serviceFee / 100);
  const equityIncome = month12.profit * (equityStake / 100);
  const monthlyIncome = specialtyRetained + equityIncome;
  const annualizedIncome = monthlyIncome * 12;
  const roi = (annualizedIncome / investment) * 100;
  
  // MSO Valuation
  const msoAnnualProfit = month12.profit * 12;
  const msoValuation = msoAnnualProfit * selectedMultiple;
  const equityStakeValue = msoValuation * (equityStake / 100);
  
  // Specialty patients
  const totalSpecialtyPatients = month18.members.specialtyActive;
  
  return {
    serviceFee,
    equityStake,
    investment,
    specialtyRetained,
    equityIncome,
    monthlyIncome,
    annualizedIncome,
    roi,
    msoAnnualProfit,
    msoValuation,
    equityStakeValue,
    totalSpecialtyPatients,
  };
}, [inputs.foundingToggle, month12, selectedMultiple]);
```

### Issues with Current Implementation
1. **Duplicate Logic**: Calculations are duplicated from `calculations.ts`
2. **Inconsistency Risk**: Local calculations may diverge from centralized KPIs
3. **Hardcoded Values**: Cards 5, 7, 8 have hardcoded values ("6", "+66.7%", "1.0:1")
4. **No Single Source of Truth**: Violates ontology-first principle
5. **Maintenance Burden**: Changes must be made in multiple places

---

## Target State (After)

### Object Structure - PhysicianROITab.tsx (Refactored)
```typescript
export function PhysicianROITab() {
  const { inputs, projections } = useDashboard();
  const { kpis } = projections; // ← USE CENTRALIZED KPIs
  
  // Helper functions for formatting
  const formatCurrency = (value: number) => {
    return `$${Math.round(value).toLocaleString()}`;
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  const formatRatio = (value: number) => {
    return `${value.toFixed(1)}:1`;
  };
  
  // Derived values for display (not recalculations)
  const investment = inputs.foundingToggle 
    ? BUSINESS_RULES.FOUNDING_INVESTMENT 
    : BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  
  const equityStake = getEquityShare(inputs.foundingToggle) * 100;
  
  return (
    <div className="space-y-6 p-0 sm:p-6">
      {/* 8-Card KPI System - Using centralized KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Financial Returns */}
        <KPICard
          title="Monthly Income"
          value={formatCurrency(kpis.monthlyIncome)}
          subtitle="Specialty + Equity + Diagnostics"
          icon={DollarSign}
          formula={formulas.physicianMonthlyIncome}
          valueClassName="text-green-600"
        />
        
        <KPICard
          title="Annualized ROI"
          value={formatPercent(kpis.annualizedROI)}
          subtitle={`Annual / ${formatCurrency(investment)} Investment`}
          icon={Percent}
          formula={formulas.physicianROI}
          valueClassName="text-green-600"
        />
        
        <KPICard
          title="MSO Equity Income"
          value={formatCurrency(kpis.msoEquityIncome)}
          subtitle={`${equityStake}% of Net Profit`}
          icon={TrendingUp}
          formula={formulas.msoEquityIncome}
          valueClassName="text-green-600"
        />
        
        <KPICard
          title="Equity Stake Value"
          value={formatCurrency(kpis.equityStakeValue)}
          subtitle="At 2× earnings multiple"
          icon={Gem}
          formula={formulas.equityValue}
          valueClassName="text-green-600"
        />
        
        {/* Row 2: Structure & Lifestyle */}
        <KPICard
          title="Independent Revenue Streams"
          value={kpis.independentRevenueStreams.toString()}
          subtitle="Active income sources"
          icon={Layers}
          valueClassName="text-blue-600"
        />
        
        <KPICard
          title="Specialty Patient Load"
          value={Math.round(kpis.specialtyPatientLoad).toLocaleString()}
          subtitle="≈ ⅕ vs hospital volume"
          icon={Users}
          valueClassName="text-blue-600"
        />
        
        <KPICard
          title="Quality-of-Life Index"
          value={`+${formatPercent(kpis.qualityOfLifeIndex)}`}
          subtitle="Time recovered from admin"
          icon={Heart}
          valueClassName="text-purple-600"
        />
        
        <KPICard
          title="Support-to-Physician Ratio"
          value={formatRatio(kpis.supportToPhysicianRatio)}
          subtitle="Shared staff support"
          icon={UserCheck}
          valueClassName="text-purple-600"
        />
      </div>
      
      {/* Rest of component remains unchanged */}
    </div>
  );
}
```

---

## Data Flow Architecture

### Before (Problematic)
```
DashboardContext
├── inputs
└── projections
    ├── projection[11] (Month 12) ──┐
    └── kpis                         │
                                     │
PhysicianROITab                      │
├── useMemo(() => {                  │
│   // RECALCULATES everything ←────┘
│   const monthlyIncome = ...
│   const roi = ...
│   return { monthlyIncome, roi, ... }
│ })
└── KPICards (use local metrics)
```

### After (Correct)
```
DashboardContext
├── inputs
└── projections
    ├── projection[11] (Month 12)
    └── kpis ← SINGLE SOURCE OF TRUTH
        ├── monthlyIncome
        ├── annualizedROI
        ├── msoEquityIncome
        ├── equityStakeValue
        ├── independentRevenueStreams
        ├── specialtyPatientLoad
        ├── qualityOfLifeIndex
        └── supportToPhysicianRatio

PhysicianROITab
└── KPICards (use projections.kpis directly)
```

---

## Ontological Mapping

### KPI Card Mapping (8 Cards)

| Card # | Title | Data Source | Format | Color |
|--------|-------|-------------|--------|-------|
| 1 | Monthly Income | `kpis.monthlyIncome` | `formatCurrency()` | Green |
| 2 | Annualized ROI | `kpis.annualizedROI` | `formatPercent()` | Green |
| 3 | MSO Equity Income | `kpis.msoEquityIncome` | `formatCurrency()` | Green |
| 4 | Equity Stake Value | `kpis.equityStakeValue` | `formatCurrency()` | Green |
| 5 | Independent Revenue Streams | `kpis.independentRevenueStreams` | `.toString()` | Blue |
| 6 | Specialty Patient Load | `kpis.specialtyPatientLoad` | `Math.round().toLocaleString()` | Blue |
| 7 | Quality-of-Life Index | `kpis.qualityOfLifeIndex` | `+${formatPercent()}` | Purple |
| 8 | Support-to-Physician Ratio | `kpis.supportToPhysicianRatio` | `formatRatio()` | Purple |

### Icon Mapping

| Card # | Icon | Import Source |
|--------|------|---------------|
| 1 | `DollarSign` | lucide-react |
| 2 | `Percent` | lucide-react |
| 3 | `TrendingUp` | lucide-react |
| 4 | `Gem` | lucide-react (NEW) |
| 5 | `Layers` | lucide-react (NEW) |
| 6 | `Users` | lucide-react (NEW) |
| 7 | `Heart` | lucide-react (NEW) |
| 8 | `UserCheck` | lucide-react (NEW) |

---

## Required Changes

### 1. Update Imports
```typescript
// REMOVE (no longer needed)
import { Building2 } from "lucide-react";

// ADD (new icons for cards 4-8)
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Gem,      // Card 4
  Layers,   // Card 5
  Users,    // Card 6
  Heart,    // Card 7
  UserCheck // Card 8
} from "lucide-react";
```

### 2. Remove Local Calculations
```typescript
// DELETE lines 19-54 (entire metrics useMemo)
// DELETE lines 56-60 (incomeBreakdown - will recalculate from kpis)
```

### 3. Add Format Helpers
```typescript
// ADD after component declaration
const formatCurrency = (value: number) => {
  return `$${Math.round(value).toLocaleString()}`;
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatRatio = (value: number) => {
  return `${value.toFixed(1)}:1`;
};
```

### 4. Update KPI Cards (lines 130-200)
Replace all card implementations to use `projections.kpis.*` instead of `metrics.*`

### 5. Update Dependent Visualizations
```typescript
// Income breakdown for donut chart (recalculate from kpis)
const incomeBreakdown = [
  { 
    name: 'Specialty Retained', 
    value: projections.kpis.monthlyIncome - projections.kpis.msoEquityIncome, 
    color: '#3b82f6' 
  },
  { 
    name: 'MSO Equity Income', 
    value: projections.kpis.msoEquityIncome, 
    color: '#10b981' 
  },
];
```

---

## Validation Rules

### Dollar Formatting (All Currency Values)
- **Rule:** All dollar amounts MUST be rounded to whole dollars (no cents)
- **Implementation:** `Math.round(value).toLocaleString()`
- **Applies to:** Cards 1, 3, 4

### Percentage Formatting
- **Rule:** Show 1 decimal place for percentages
- **Implementation:** `value.toFixed(1)%`
- **Applies to:** Cards 2, 7

### Ratio Formatting
- **Rule:** Show 1 decimal place with `:1` suffix
- **Implementation:** `value.toFixed(1):1`
- **Applies to:** Card 8

### Integer Formatting
- **Rule:** Show whole numbers with thousand separators
- **Implementation:** `Math.round(value).toLocaleString()`
- **Applies to:** Card 6

### Count Formatting
- **Rule:** Show as plain integer string
- **Implementation:** `.toString()`
- **Applies to:** Card 5

---

## Testing Checklist

### Pre-Commit Verification
- [ ] All 8 KPI cards display correct values from `projections.kpis`
- [ ] Dollar amounts are whole numbers (no cents)
- [ ] Percentages show 1 decimal place
- [ ] Icons match the ontology specification
- [ ] Color coding: Row 1 = green, Row 2 (cards 5-6) = blue, Row 2 (cards 7-8) = purple
- [ ] Grid layout: 4×2 responsive (4 cols on desktop, 2 on tablet, 1 on mobile)
- [ ] Formula tooltips display correctly
- [ ] No console errors
- [ ] Values update when inputs change
- [ ] Dev server displays correctly
- [ ] Vercel deployment works

### Regression Testing
- [ ] Income breakdown chart still works
- [ ] Revenue diversity table still works
- [ ] Valuation scenarios still work
- [ ] ROI analysis table still works
- [ ] All other tabs still function

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate:** Revert commit using `git revert <commit-hash>`
2. **Investigation:** Compare calculations between old and new implementation
3. **Fix:** Update `calculations.ts` if KPI calculations are incorrect
4. **Redeploy:** Push fix and verify in staging before production

---

## References

- **Ontology Document:** `/home/ubuntu/pillars-dashboard/8_CARD_KPI_ONTOLOGY.md`
- **Calculation Engine:** `/home/ubuntu/pillars-dashboard/client/src/lib/calculations.ts` (lines 544-700)
- **Reference Implementation:** `/home/ubuntu/pillars-dashboard/client/src/components/KPIRibbon.tsx`
- **Target Component:** `/home/ubuntu/pillars-dashboard/client/src/components/PhysicianROITab.tsx`

---

## Approval Required

**Status:** ⏳ Awaiting Review  
**Reviewer:** User  
**Action:** Please review this ontology update in the sandbox before code changes are committed.

Once approved, the following files will be modified:
1. `client/src/components/PhysicianROITab.tsx` - Refactor to use centralized KPIs
2. Commit message: "refactor: PhysicianROITab to use centralized 8-card KPI system"
3. Push to GitHub (triggers Vercel + Cloudflare deployments)

