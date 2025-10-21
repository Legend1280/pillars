# Visualization Placement Map
**CRITICAL**: This document defines EXACTLY where each new visualization goes in the dashboard.

---

## Current Dashboard Tabs (in order)

1. **Inputs & Scenarios** - No changes
2. **Revenues** - No changes (for now)
3. **Diagnostics** - No changes
4. **Costs** - No changes
5. **Ramp to Launch** - No changes (for now)
6. **Staffing** - No changes
7. **Growth** - No changes
8. **Risk** - No changes
9. **12-Month Projection** - No changes (for now)
10. **Cash Flow & Balance Sheet** - No changes (for now)
11. **Risk Analysis** - No changes (will move later)
12. **P&L Summary** ⭐ **TARGET TAB FOR PHASE 1**
13. **Physician ROI** - Already completed
14. **Logic & Primitives** - No changes
15. **Master Debug** - No changes

---

## Phase 1: Quick Wins - ALL GO TO P&L SUMMARY TAB

### Target Tab: **P&L Summary** (Tab #12)
**File**: `/home/ubuntu/pillars-dashboard/client/src/components/PLSummaryTab.tsx`

### Current P&L Summary Tab Layout
```
┌─────────────────────────────────────────────────────────┐
│ P&L Summary Tab (Current)                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Existing P&L Table - Full Width]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### NEW P&L Summary Tab Layout (After Phase 1)
```
┌─────────────────────────────────────────────────────────┐
│ P&L Summary Tab (NEW)                                   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────┬─────────────────────────────┐   │
│ │ LEFT COLUMN (60%)   │ RIGHT COLUMN (40%)         │   │
│ │                     │                             │   │
│ │                     │ 1. Break-Even Indicator     │   │
│ │                     │    [NEW COMPONENT]          │   │
│ │                     │                             │   │
│ │                     ├─────────────────────────────┤   │
│ │                     │                             │   │
│ │                     │ 2. Unit Economics Card      │   │
│ │                     │    [NEW COMPONENT]          │   │
│ │                     │                             │   │
│ └─────────────────────┴─────────────────────────────┘   │
│                                                         │
│ [Existing P&L Table - Moved to Bottom, Collapsible]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Exact Placement in Code

**File to Modify**: `client/src/components/PLSummaryTab.tsx`

**Add These Imports**:
```typescript
import { BreakEvenIndicator } from './visualizations/BreakEvenIndicator';
import { UnitEconomicsCard } from './visualizations/UnitEconomicsCard';
```

**Add This Layout** (at the top of the tab content):
```tsx
export function PLSummaryTab() {
  const { projections } = useDashboard();
  const { breakevenAnalysis, unitEconomics } = projections.kpis;
  
  return (
    <div className="space-y-6">
      {/* NEW: Quick Win Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - empty for now (will add charts in Phase 3) */}
        <div className="lg:col-span-2">
          {/* Placeholder for future charts */}
        </div>
        
        {/* Right column - Break-Even and Unit Economics */}
        <div className="space-y-6">
          <BreakEvenIndicator {...breakevenAnalysis} />
          <UnitEconomicsCard {...unitEconomics} />
        </div>
      </div>
      
      {/* Existing P&L Table */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* ... existing table code ... */}
      </div>
    </div>
  );
}
```

---

## Phase 1.5: Capital Waterfall - NEW TAB

### Create New Tab: **Capital** (Between Inputs & Revenues)
**File**: `/home/ubuntu/pillars-dashboard/client/src/components/tabs/CapitalTab.tsx` (NEW FILE)

### New Tab Order After Adding Capital Tab
1. **Inputs & Scenarios**
2. **Capital** ⭐ **NEW TAB**
3. **Revenues**
4. ... (rest unchanged)

### Capital Tab Layout
```
┌─────────────────────────────────────────────────────────┐
│ Capital Tab (NEW)                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 3. Capital Deployment Waterfall                         │
│    [NEW COMPONENT - Full Width]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Files to Modify for New Tab

**1. Create Tab Component**: `client/src/components/tabs/CapitalTab.tsx`
**2. Register Tab**: `client/src/lib/dashboardConfig.ts` or wherever tabs are defined
**3. Add Route**: Main routing file

---

## Summary: Where Things Go

### ✅ PHASE 1 - P&L Summary Tab
- **Tab**: P&L Summary (#12)
- **File**: `client/src/components/PLSummaryTab.tsx`
- **Components**:
  1. BreakEvenIndicator (right column, top)
  2. UnitEconomicsCard (right column, bottom)

### ✅ PHASE 1.5 - New Capital Tab
- **Tab**: Capital (NEW - position #2)
- **File**: `client/src/components/tabs/CapitalTab.tsx` (CREATE NEW)
- **Components**:
  3. CapitalWaterfall (full width)

### 🔜 PHASE 3 - Additional Visualizations (Later)
- **P&L Summary Tab** (left column):
  - Monthly P&L Trend
  - Revenue Waterfall
  - Cost Breakdown Bar
  - Profit Margin Gauge

- **Revenues Tab**:
  - Revenue Mix Pie Chart

- **12-Month Projection Tab**:
  - Member Growth Funnel

---

## Current Status

✅ Created: `BreakEvenIndicator.tsx`
✅ Created: `UnitEconomicsCard.tsx`
⏳ Next: Modify `PLSummaryTab.tsx` to add these 2 components
⏳ Then: Create `CapitalWaterfall.tsx`
⏳ Then: Create new `CapitalTab.tsx`

---

**QUESTION FOR YOU**: Should I proceed with modifying `PLSummaryTab.tsx` now to add the Break-Even and Unit Economics cards?

