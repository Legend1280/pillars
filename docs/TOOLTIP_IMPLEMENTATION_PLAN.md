# Comprehensive Tooltip Implementation Plan

## Goal
Add hover tooltips throughout the entire dashboard to explain how every metric, chart, and input is calculated.

## Tooltip System

We already have a tooltip component available. Need to use:
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
```

## Implementation Strategy

### Phase 1: KPI Cards (All Tabs)
Add tooltips to every KPI card showing:
- What the metric means
- How it's calculated (formula)
- What inputs affect it

**Files to update:**
- `RampLaunchTab.tsx` - Capital Deployed, Launch MRR, Members at Launch, Cash at Launch
- `ProjectionTab.tsx` - Total Revenue, Total Profit, Peak Members, Final Cash Position
- `PhysicianROITab.tsx` - Monthly Income, ROI, Equity Income, Equity Value
- `RiskAnalysisTab.tsx` - Risk metrics

### Phase 2: Chart Titles & Legends
Add tooltips to:
- Chart titles explaining what the visualization shows
- Legend items explaining each line/area/bar

**Files to update:**
- All tab components with charts

### Phase 3: Sidebar Sliders
Add tooltips to every slider label explaining:
- What this input controls
- Typical range/values
- How it affects the model

**Files to update:**
- `Section1InputsSidebar.tsx`
- `Section2RevenuesSidebar.tsx`
- `Section3DiagnosticsSidebar.tsx`
- `Section4CostsSidebar.tsx`
- `Section5RampSidebar.tsx`
- `Section6StaffingSidebar.tsx`
- `Section7GrowthSidebar.tsx`

### Phase 4: Table Headers
Add tooltips to table column headers

**Files to update:**
- `PLSummaryTab.tsx`
- `LogicPrimitivesTab.tsx`
- `CashFlowTab.tsx`

### Phase 5: Section Headers
Add tooltips to major section titles

## Tooltip Content Structure

Each tooltip should include:

1. **Brief Description** (1 sentence)
2. **Formula** (if applicable)
3. **Example Calculation** (with current values)
4. **Affected By** (list of inputs that change this metric)

Example:
```
Capital Deployed

The total amount of money needed from Month 0 through Month 6 to reach launch.

Formula: Σ(Monthly Costs - Monthly Revenue) for Months 0-6

Current: $2,170,793
- Startup Costs: $225,000
- Monthly Burn: ~$324,000/mo × 6 months
- Minus: Early Revenue

Affected by:
• Ramp Duration
• Fixed Overhead
• Physician Count
• Marketing Spend
• Startup Costs
```

## Priority Order

1. **HIGH**: KPI cards on main tabs (most visible)
2. **HIGH**: Slider labels (users interact with these)
3. **MEDIUM**: Chart titles and legends
4. **MEDIUM**: Table headers
5. **LOW**: Section headers (less critical)

## Implementation Approach

For each component:
1. Import Tooltip components
2. Wrap element with TooltipProvider → Tooltip → TooltipTrigger
3. Add TooltipContent with detailed explanation
4. Test hover behavior

## Example Implementation

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex items-center gap-2">
        <h3>Capital Deployed</h3>
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
      </div>
    </TooltipTrigger>
    <TooltipContent className="max-w-sm">
      <p className="font-semibold">Capital Deployed</p>
      <p className="text-sm mt-1">
        Total funding needed from Month 0 through Month 6 to reach launch.
      </p>
      <p className="text-xs mt-2 font-mono">
        Formula: Σ(Costs - Revenue) for Months 0-6
      </p>
      <p className="text-xs mt-2">
        <strong>Affected by:</strong> Ramp Duration, Fixed Overhead, Physician Count, Marketing Spend
      </p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Next Steps

1. Start with Ramp & Launch tab KPI cards
2. Move to 12-Month Projection tab
3. Continue through all tabs
4. Then tackle sidebar sliders
5. Finish with tables and charts

Estimated time: 2-3 hours for complete implementation

