# UI/UX Fixes Ontology

## Overview
This document defines the UI/UX improvements to enhance user experience without changing data or calculations.

---

## 1. Scenario Dialog Fix

### Current Behavior
- Dialog appears when switching between Lean/Conservative/Moderate scenarios
- Causes interruption and requires user confirmation

### Target Behavior
- **Remove dialog** for scenario switching (instant switch)
- **Keep dialog** only for Save and Reset actions (destructive operations)

### Implementation
**File**: `client/src/components/DashboardHeader.tsx`

**Changes**:
- Remove `onClick` confirmation dialog for scenario buttons
- Add direct `setScenario()` call
- Keep confirmation dialogs for Save/Reset buttons

---

## 2. Tooltip Jolt Fix

### Current Behavior
- Tooltips on charts "jump" or "jolt" when hovering
- Caused by tooltip repositioning or content changes

### Target Behavior
- Smooth, stable tooltip display
- No jumping or repositioning

### Solution Options

#### Option A: Fixed Position
```tsx
<Tooltip 
  position="top"
  wrapperStyle={{ position: 'fixed' }}
/>
```

#### Option B: Prevent Reflow
```tsx
<Tooltip
  allowEscapeViewBox={{ x: false, y: false }}
  isAnimationActive={false}
/>
```

### Implementation
**Files**: All chart components using Recharts `<Tooltip>`
- MonthlyPLTrend.tsx
- RevenueWaterfall.tsx
- CostBreakdownPie.tsx
- (Any other charts with tooltips)

---

## 3. Tab Visual Enhancement

### Current Behavior
- Active tab has simple border-bottom
- No depth or visual hierarchy

### Target Behavior
- **Beveled border** effect on active tab
- Creates depth and modern look

### CSS Implementation
```tsx
className={`
  px-4 py-2 font-medium transition-colors
  ${activeTab === tab.id
    ? 'border-b-2 border-teal-600 text-teal-600 shadow-sm bg-gradient-to-b from-white to-teal-50'
    : 'text-gray-600 hover:text-gray-900'
  }
`}
```

**File**: `client/src/components/OverviewSection.tsx`

---

## Implementation Order

1. **Scenario Dialog** (5 min) - Highest user impact
2. **Tab Beveled Border** (5 min) - Visual polish
3. **Tooltip Jolt Fix** (15 min) - Requires testing across charts

**Total Time**: ~25 minutes

---

## Testing Checklist

- [ ] Scenario switching is instant (no dialog)
- [ ] Save button still shows confirmation dialog
- [ ] Reset button still shows confirmation dialog
- [ ] Active tab has beveled border effect
- [ ] Tooltips don't jump when hovering over charts
- [ ] All tabs still function correctly

---

## Ontological Impact

**Data Flow**: No changes (UI only)
**State Management**: No changes
**Calculations**: No changes
**Single Source of Truth**: Maintained

This is purely presentational - no business logic affected.

