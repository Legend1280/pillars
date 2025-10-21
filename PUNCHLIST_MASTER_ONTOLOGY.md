# Punchlist Master Ontology
**Date**: 2025-10-20  
**Goal**: Transform dashboard from "good" to "investor-ready"  
**Methodology**: Ontology-first development with pre-commit reviews

---

## Table of Contents
1. [Data Architecture](#data-architecture)
2. [UI/UX Fixes](#uiux-fixes)
3. [New Visualizations](#new-visualizations)
4. [New Capital Tab](#new-capital-tab)
5. [Formula Tooltips](#formula-tooltips)
6. [Implementation Order](#implementation-order)

---

## 1. Data Architecture

### Current Data Flow
```
DashboardInputs
    ↓
calculateProjections()
    ↓
ProjectionResults {
  rampPeriod: MonthlyFinancials[]
  launchState: LaunchState
  projection: MonthlyFinancials[]
  kpis: {
    // 8-card KPI system
    monthlyIncome, annualizedROI, msoEquityIncome, etc.
    monthlyIncomeBreakdown[]
  }
}
    ↓
DashboardContext
    ↓
Tab Components (consume data)
```

### New Data Requirements

#### A. Break-Even Analysis
**Location**: `calculations.ts::calculateKPIs()`
```typescript
// Add to KPI interface
breakevenAnalysis: {
  breakevenMonth: number | null;      // First month with positive cumulative cash
  monthsToBreakeven: number | null;   // Months from Month 0
  currentCash: number;                // Latest cumulative cash
  cashTrend: number[];                // Sparkline data (all months)
  isBreakeven: boolean;               // true if already profitable
}
```

#### B. Unit Economics
**Location**: `calculations.ts::calculateKPIs()`
```typescript
// Add to KPI interface
unitEconomics: {
  revenuePerMember: number;           // Primary care price
  ltv: number;                        // Lifetime value
  cac: number;                        // Customer acquisition cost
  paybackMonths: number;              // CAC / monthly revenue
  ltvCacRatio: number;                // LTV / CAC (target: 3+)
  grossMargin: number;                // (Revenue - COGS) / Revenue
}
```

**Calculation Logic**:
```typescript
const month12 = projection[projection.length - 1];
const primaryPrice = inputs.primaryPrice;
const churnRate = inputs.churnPrimary / 100;
const avgLifetimeMonths = 1 / churnRate; // e.g., 5% churn = 20 months

const ltv = primaryPrice * avgLifetimeMonths;

// CAC = Total marketing spend / Total new members acquired
const totalMarketingSpend = projection.reduce((sum, m) => sum + m.costs.marketing, 0);
const totalNewMembers = projection.reduce((sum, m) => sum + m.members.primaryNew, 0);
const cac = totalNewMembers > 0 ? totalMarketingSpend / totalNewMembers : 0;

const paybackMonths = primaryPrice > 0 ? cac / primaryPrice : 0;
const ltvCacRatio = cac > 0 ? ltv / cac : 0;
```

#### C. Capital Deployment Waterfall
**Location**: `calculations.ts::calculateKPIs()`
```typescript
// Add to KPI interface
capitalDeployment: {
  capitalRaised: number;              // Total investment
  buildoutCost: number;               // CapEx buildout
  equipmentCost: number;              // Office equipment
  startupCosts: number;               // Startup costs
  workingCapital: number;             // Operating reserves
  remainingReserve: number;           // Unallocated capital
  deploymentBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}
```

**Calculation Logic**:
```typescript
const capitalRaised = calculateSeedCapital(inputs.foundingToggle, inputs.additionalPhysicians);

// Sum from ramp period costs
const buildoutCost = rampPeriod.reduce((sum, m) => sum + m.costs.capex, 0);
const equipmentCost = inputs.officeEquipment || 0;
const startupCosts = rampPeriod.reduce((sum, m) => sum + m.costs.startup, 0);

// Working capital = salaries + overhead + marketing during ramp
const workingCapital = rampPeriod.reduce((sum, m) => 
  sum + m.costs.salaries + m.costs.fixedOverhead + m.costs.marketing, 0
);

const totalDeployed = buildoutCost + equipmentCost + startupCosts + workingCapital;
const remainingReserve = capitalRaised - totalDeployed;
```

#### D. Monthly P&L Trend Data
**Location**: Already exists in `rampPeriod` and `projection`
```typescript
// Combine ramp + projection for full 18-month view
const allMonths = [...rampPeriod, ...projection];
const plTrendData = allMonths.map(m => ({
  month: m.month,
  revenue: m.revenue.total,
  costs: m.costs.total,
  profit: m.profit,
  cumulativeCash: m.cumulativeCash
}));
```

#### E. Revenue Waterfall Data
**Location**: Month 12 revenue breakdown
```typescript
// Already available in month12.revenue
const revenueWaterfallData = [
  { name: 'Primary Care', value: month12.revenue.primary, type: 'increase' },
  { name: 'Specialty Care', value: month12.revenue.specialty, type: 'increase' },
  { name: 'Corporate Wellness', value: month12.revenue.corporate, type: 'increase' },
  { name: 'Echo', value: month12.revenue.echo, type: 'increase' },
  { name: 'CT Scan', value: month12.revenue.ct, type: 'increase' },
  { name: 'Labs', value: month12.revenue.labs, type: 'increase' },
  { name: 'Total Revenue', value: month12.revenue.total, type: 'total' }
];
```

#### F. Cost Breakdown Data
**Location**: Month 12 cost breakdown
```typescript
// Already available in month12.costs
const costBreakdownData = [
  { category: 'Salaries', amount: month12.costs.salaries, color: '#3b82f6' },
  { category: 'Fixed Overhead', amount: month12.costs.fixedOverhead, color: '#10b981' },
  { category: 'Marketing', amount: month12.costs.marketing, color: '#f59e0b' },
  { category: 'Equipment Lease', amount: month12.costs.equipmentLease, color: '#8b5cf6' },
  { category: 'Variable Costs', amount: month12.costs.variable, color: '#ec4899' }
];

// Calculate percentages
const totalCosts = month12.costs.total;
const costBreakdownWithPercentages = costBreakdownData.map(item => ({
  ...item,
  percentage: (item.amount / totalCosts) * 100
}));
```

#### G. Profit Margin Gauge
**Location**: Derived from Month 12 data
```typescript
const profitMargin = (month12.profit / month12.revenue.total) * 100;
const targetMargin = 50; // Target profit margin
const marginColor = profitMargin > 40 ? 'green' : profitMargin > 30 ? 'yellow' : 'red';
```

---

## 2. UI/UX Fixes

### A. Scenario Switching Lag (Remove Dialog)

**Current Behavior**:
- Dialog appears on every scenario switch
- Shows "Conservative scenario loaded from save"
- Creates UI friction

**Target Behavior**:
- **Remove dialog** for scenario switches
- **Keep dialog** only for:
  - Save action: "Scenario saved successfully"
  - Reset action: "Loaded from default"
- **Add tooltip** on scenario buttons: "Lean Saved" / "Lean (Default)"

**Files to Modify**:
```
client/src/components/TopMenu.tsx
client/src/contexts/DashboardContext.tsx
```

**Ontology**:
```typescript
// State management
interface ScenarioState {
  currentScenario: 'lean' | 'conservative' | 'moderate';
  savedScenarios: {
    lean: DashboardInputs | null;
    conservative: DashboardInputs | null;
    moderate: DashboardInputs | null;
  };
  showNotification: boolean;
  notificationMessage: string;
  notificationType: 'save' | 'reset' | null;
}

// Actions
- switchScenario(scenario): void  // No notification
- saveScenario(): void            // Show "Saved" notification
- resetScenario(): void           // Show "Loaded from default" notification
```

**Implementation**:
1. Remove `toast.success()` from scenario switch handler
2. Add tooltip to scenario buttons showing save status
3. Keep notifications only for save/reset actions

---

### B. Tooltip Jolt Fix

**Current Issue**:
- Menu collapses/jolts when hovering off tooltip
- Animation timing issue causing jarring UX

**Root Cause**:
- Tooltip triggers layout reflow
- Menu animation conflicts with tooltip hide animation

**Solution Options**:

**Option 1: Fix Current Animation**
```typescript
// Add pointer-events: none during animation
.menu-item {
  transition: all 0.2s ease-in-out;
}

.tooltip {
  pointer-events: none; // Prevent layout shift
  position: absolute;
  z-index: 1000;
}
```

**Option 2: Use Different Tooltip Library**
- Replace current tooltip with Radix UI Tooltip
- Better animation handling
- No layout reflow

**Files to Modify**:
```
client/src/components/SideMenu.tsx
client/src/components/Tooltip.tsx (if exists)
```

**Recommended**: Try Option 1 first (5 min), if fails, use Option 2 (15 min)

---

### C. Tab Visual Enhancement

**Current**: Highlighted tab has background color only
**Target**: Add beveled border to make it look like a physical tab

**Visual Design**:
```
┌─────────────┐
│ Ramp & Launch │  ← Active tab (beveled top border)
├─────────────┴──────────────────────────────┐
│                                             │
│           Tab Content Area                  │
│                                             │
└─────────────────────────────────────────────┘
```

**CSS Changes**:
```css
/* Active tab */
.tab-active {
  background: white;
  border-top: 3px solid #3b82f6;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  border-bottom: 3px solid white; /* Connects to content area */
  border-radius: 8px 8px 0 0;
  position: relative;
  bottom: -2px; /* Overlap with content border */
  z-index: 10;
}

/* Inactive tabs */
.tab-inactive {
  background: #f3f4f6;
  border-bottom: 2px solid #e5e7eb;
}

/* Content area */
.tab-content {
  border: 2px solid #e5e7eb;
  border-radius: 0 8px 8px 8px;
}
```

**Files to Modify**:
```
client/src/components/TabNavigation.tsx
client/src/styles/tabs.css (or inline styles)
```

---

## 3. New Visualizations

### Visualization 1: Break-Even Indicator 🔴 CRITICAL

**Location**: P&L Tab, Right Column, Position 1  
**Type**: Card with Large Number + Sparkline  
**Priority**: CRITICAL (answers #1 investor question)

**Component Structure**:
```typescript
// client/src/components/visualizations/BreakEvenIndicator.tsx
interface BreakEvenIndicatorProps {
  breakevenMonth: number | null;
  monthsToBreakeven: number | null;
  currentCash: number;
  cashTrend: number[];
  isBreakeven: boolean;
}

export function BreakEvenIndicator({
  breakevenMonth,
  monthsToBreakeven,
  currentCash,
  cashTrend,
  isBreakeven
}: BreakEvenIndicatorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Break-Even Analysis</h3>
      
      {isBreakeven ? (
        <div className="text-center">
          <div className="text-5xl font-bold text-green-600 mb-2">
            Month {breakevenMonth}
          </div>
          <p className="text-gray-600">Break-even achieved</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-5xl font-bold text-orange-600 mb-2">
            {monthsToBreakeven ? `${monthsToBreakeven} mo` : 'N/A'}
          </div>
          <p className="text-gray-600">To break-even</p>
        </div>
      )}
      
      {/* Sparkline showing cash trend */}
      <div className="mt-4">
        <Sparkline data={cashTrend} color={isBreakeven ? 'green' : 'orange'} />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        Current Cash: {formatCurrency(currentCash)}
      </div>
    </div>
  );
}
```

**Data Source**: `kpis.breakevenAnalysis`

---

### Visualization 2: Unit Economics Card 🔴 CRITICAL

**Location**: P&L Tab, Right Column, Position 2  
**Type**: KPI Grid Card  
**Priority**: CRITICAL (proves business model scales)

**Component Structure**:
```typescript
// client/src/components/visualizations/UnitEconomicsCard.tsx
interface UnitEconomicsCardProps {
  revenuePerMember: number;
  ltv: number;
  cac: number;
  paybackMonths: number;
  ltvCacRatio: number;
  grossMargin: number;
}

export function UnitEconomicsCard({
  revenuePerMember,
  ltv,
  cac,
  paybackMonths,
  ltvCacRatio,
  grossMargin
}: UnitEconomicsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Unit Economics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">LTV</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(ltv)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">CAC</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(cac)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">LTV:CAC Ratio</p>
          <p className={`text-2xl font-bold ${ltvCacRatio >= 3 ? 'text-green-600' : 'text-red-600'}`}>
            {ltvCacRatio.toFixed(1)}:1
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Payback Period</p>
          <p className="text-2xl font-bold text-purple-600">
            {paybackMonths.toFixed(1)} mo
          </p>
        </div>
        
        <div className="col-span-2">
          <p className="text-sm text-gray-600">Gross Margin</p>
          <p className="text-2xl font-bold text-green-600">
            {grossMargin.toFixed(1)}%
          </p>
        </div>
      </div>
      
      {/* Health indicator */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm">
          {ltvCacRatio >= 3 
            ? '✅ Healthy unit economics (LTV:CAC ≥ 3:1)' 
            : '⚠️ Improve CAC efficiency (target LTV:CAC ≥ 3:1)'}
        </p>
      </div>
    </div>
  );
}
```

**Data Source**: `kpis.unitEconomics`

---

### Visualization 3: Capital Deployment Waterfall 🔴 CRITICAL

**Location**: New Capital Tab, Full Width  
**Type**: Waterfall Chart  
**Priority**: CRITICAL (shows where $2.85M goes)

**Component Structure**:
```typescript
// client/src/components/visualizations/CapitalWaterfall.tsx
interface CapitalWaterfallProps {
  capitalRaised: number;
  deploymentBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  remainingReserve: number;
}

export function CapitalWaterfall({
  capitalRaised,
  deploymentBreakdown,
  remainingReserve
}: CapitalWaterfallProps) {
  // Waterfall data structure
  const waterfallData = [
    { name: 'Capital Raised', value: capitalRaised, type: 'start' },
    ...deploymentBreakdown.map(item => ({
      name: item.category,
      value: -item.amount, // Negative for decreases
      type: 'decrease'
    })),
    { name: 'Reserve', value: remainingReserve, type: 'end' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Capital Deployment</h3>
      
      {/* Recharts Waterfall */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={waterfallData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="value" fill="#3b82f6" />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Summary table */}
      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Category</th>
              <th className="text-right py-2">Amount</th>
              <th className="text-right py-2">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {deploymentBreakdown.map(item => (
              <tr key={item.category} className="border-b">
                <td className="py-2">{item.category}</td>
                <td className="text-right">{formatCurrency(item.amount)}</td>
                <td className="text-right">{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Data Source**: `kpis.capitalDeployment`

---

### Visualization 4: Monthly P&L Trend

**Location**: P&L Tab, Left Column, Position 3  
**Type**: Area Chart (3 layers)

**Component Structure**:
```typescript
// client/src/components/visualizations/MonthlyPLTrend.tsx
interface MonthlyPLTrendProps {
  data: Array<{
    month: number;
    revenue: number;
    costs: number;
    profit: number;
  }>;
}

export function MonthlyPLTrend({ data }: MonthlyPLTrendProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Monthly P&L Trend</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          
          {/* Revenue area */}
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stackId="1"
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.6}
            name="Revenue"
          />
          
          {/* Costs area */}
          <Area 
            type="monotone" 
            dataKey="costs" 
            stackId="2"
            stroke="#ef4444" 
            fill="#ef4444" 
            fillOpacity={0.6}
            name="Costs"
          />
          
          {/* Profit line */}
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Data Source**: Combine `rampPeriod` + `projection`

---

### Visualization 5-9: Additional Charts

**(Abbreviated for brevity - full specs available on request)**

5. **Revenue Waterfall** - Shows revenue build-up by stream
6. **Cost Breakdown Bar** - Horizontal stacked bar showing cost composition
7. **Profit Margin Gauge** - Radial gauge showing profit margin vs target
8. **Revenue Mix Pie** - Donut chart showing revenue diversification
9. **Member Growth Funnel** - Funnel chart showing acquisition pipeline

---

## 4. New Capital Tab

### Tab Configuration

**Location**: Between "Inputs & Scenarios" and "Revenues"  
**Icon**: DollarSign or Wallet  
**Route**: `/capital`

**File Structure**:
```
client/src/components/
├── tabs/
│   └── CapitalTab.tsx (NEW)
client/src/lib/
└── dashboardConfig.ts (MODIFY - add Capital tab)
```

**Tab Content**:
```typescript
// client/src/components/tabs/CapitalTab.tsx
export function CapitalTab() {
  const { projections } = useDashboard();
  const { capitalDeployment } = projections.kpis;
  
  return (
    <div className="space-y-6">
      {/* Capital Deployment Waterfall */}
      <CapitalWaterfall {...capitalDeployment} />
      
      {/* Sources & Uses Table */}
      <SourcesUsesTable {...capitalDeployment} />
      
      {/* Investment Timeline */}
      <InvestmentTimeline rampPeriod={projections.rampPeriod} />
      
      {/* Burn Rate Metric */}
      <BurnRateCard rampPeriod={projections.rampPeriod} />
    </div>
  );
}
```

**Dashboard Config Update**:
```typescript
// client/src/lib/dashboardConfig.ts
export const tabs = [
  { id: 'inputs', label: 'Inputs & Scenarios', icon: Settings },
  { id: 'capital', label: 'Capital', icon: DollarSign }, // NEW
  { id: 'revenues', label: 'Revenues', icon: DollarSign },
  // ... rest of tabs
];
```

---

## 5. Formula Tooltips

### Current State
- Some tabs have formula tooltips (Physician ROI)
- Cash Flow / Balance tab missing tooltips

### Target State
- **All KPI cards** have formula tooltips
- **Consistent format** across all tabs

### Formula Tooltip Structure
```typescript
interface FormulaTooltip {
  title: string;
  formula: string;
  variables: Array<{
    symbol: string;
    description: string;
    value?: number;
  }>;
  example?: string;
}
```

### Example: Monthly Burn Rate
```typescript
const monthlyBurnFormula: FormulaTooltip = {
  title: "Monthly Burn Rate",
  formula: "Burn Rate = Total Monthly Costs - Total Monthly Revenue",
  variables: [
    { symbol: "Total Costs", description: "Salaries + Overhead + Marketing + Equipment", value: 298572 },
    { symbol: "Total Revenue", description: "All revenue streams", value: 384700 },
  ],
  example: "$298,572 - $384,700 = -$86,128 (positive cash flow)"
};
```

### Files to Modify
```
client/src/components/tabs/CashFlowTab.tsx
client/src/lib/formulas.ts (centralized formula definitions)
```

### Implementation
1. Create centralized `formulas.ts` with all formula definitions
2. Add `<InfoTooltip formula={formulas.monthlyBurn} />` to each KPI card
3. Verify calculations match formula descriptions

---

## 6. Implementation Order

### Phase 1: Quick Wins (90 min) ⚡
**Goal**: Immediate investor-ready status

1. **Break-Even Indicator** (25 min)
   - Add `breakevenAnalysis` to `calculations.ts`
   - Create `BreakEvenIndicator.tsx`
   - Add to P&L Tab

2. **Unit Economics Card** (20 min)
   - Add `unitEconomics` to `calculations.ts`
   - Create `UnitEconomicsCard.tsx`
   - Add to P&L Tab

3. **Capital Deployment Waterfall** (45 min)
   - Add `capitalDeployment` to `calculations.ts`
   - Create `CapitalWaterfall.tsx`
   - Create new Capital Tab

### Phase 2: UI/UX Fixes (60 min) 🎯
**Goal**: Smooth, professional UX

4. **Remove Scenario Dialog** (15 min)
   - Modify `TopMenu.tsx` to remove toast on switch
   - Add tooltips to scenario buttons

5. **Fix Tooltip Jolt** (20 min)
   - Try CSS fix first
   - If fails, replace with Radix UI Tooltip

6. **Tab Visual Enhancement** (25 min)
   - Add beveled border CSS
   - Update active/inactive tab styles

### Phase 3: High Impact Visualizations (2 hours) 📊
**Goal**: Professional polish

7. **Monthly P&L Trend** (40 min)
8. **Revenue Waterfall** (45 min)
9. **Revenue Mix Pie** (20 min)
10. **Cost Breakdown Bar** (30 min)

### Phase 4: Polish & Formulas (1 hour) ✨
**Goal**: Executive presentation quality

11. **Profit Margin Gauge** (35 min)
12. **Formula Tooltips** (25 min)
   - Create `formulas.ts`
   - Add tooltips to Cash Flow tab
   - Verify all calculations

### Phase 5: Final Items (30 min) 🏁

13. **Spell out MRR** in Ramp & Launch tab
14. **Add Total Revenue KPI** to 12-Month tab
15. **Move Risk Analysis tab** after Physician ROI
16. **Fix Monthly Burn calculation** in Cash Flow tab

---

## 7. Testing Checklist

### Pre-Commit Verification
- [ ] All new visualizations render correctly
- [ ] Data flows from `calculations.ts` → context → components
- [ ] No duplicate calculations in components
- [ ] All dollar amounts are whole dollars
- [ ] All percentages have 1 decimal place
- [ ] Formula tooltips display correct calculations
- [ ] Scenario switching works without dialog
- [ ] Tooltips don't cause menu jolt
- [ ] Tabs have beveled border styling
- [ ] Break-even indicator shows correct month
- [ ] Unit economics LTV:CAC ratio is accurate
- [ ] Capital waterfall adds up to total capital raised
- [ ] All charts responsive on mobile

### Sandbox Testing
- [ ] Test on sandbox deployment
- [ ] Switch between scenarios (Lean, Conservative, Moderate)
- [ ] Verify all 8 new visualizations
- [ ] Check Capital tab loads correctly
- [ ] Hover over all tooltips
- [ ] Click through all tabs

---

## 8. File Manifest

### New Files to Create
```
client/src/components/visualizations/
├── BreakEvenIndicator.tsx
├── UnitEconomicsCard.tsx
├── CapitalWaterfall.tsx
├── MonthlyPLTrend.tsx
├── RevenueWaterfall.tsx
├── RevenueMixPie.tsx
├── CostBreakdownBar.tsx
├── ProfitMarginGauge.tsx
└── MemberGrowthFunnel.tsx

client/src/components/tabs/
└── CapitalTab.tsx

client/src/lib/
└── formulas.ts
```

### Files to Modify
```
client/src/lib/calculations.ts
  - Add breakevenAnalysis to KPI interface
  - Add unitEconomics to KPI interface
  - Add capitalDeployment to KPI interface
  - Calculate new KPIs in calculateKPIs()

client/src/components/TopMenu.tsx
  - Remove toast notification on scenario switch
  - Add tooltips to scenario buttons

client/src/components/SideMenu.tsx
  - Fix tooltip jolt animation

client/src/components/TabNavigation.tsx
  - Add beveled border styling to active tab

client/src/components/tabs/PLSummaryTab.tsx
  - Add BreakEvenIndicator
  - Add UnitEconomicsCard
  - Add MonthlyPLTrend
  - Add RevenueWaterfall
  - Add CostBreakdownBar
  - Add ProfitMarginGauge

client/src/components/tabs/RevenuesTab.tsx
  - Add RevenueMixPie

client/src/components/tabs/ProjectionTab.tsx
  - Add MemberGrowthFunnel

client/src/components/tabs/CashFlowTab.tsx
  - Add formula tooltips
  - Fix Monthly Burn calculation

client/src/components/tabs/RampLaunchTab.tsx
  - Spell out MRR as "Monthly Recurring Revenue (MRR)"

client/src/lib/dashboardConfig.ts
  - Add Capital tab
  - Reorder tabs (move Risk Analysis after Physician ROI)
```

---

## 9. Success Metrics

### Before (Current State)
- ❌ No break-even visibility
- ❌ No unit economics metrics
- ❌ No capital deployment visualization
- ❌ Scenario switching causes dialog friction
- ❌ Tooltip jolt creates jarring UX
- ❌ Tabs don't look like tabs
- ❌ Missing formula tooltips on some tabs

### After (Target State)
- ✅ Break-even month prominently displayed
- ✅ Unit economics prove business model scales
- ✅ Capital deployment shows investor where money goes
- ✅ Smooth scenario switching (no dialog)
- ✅ Smooth tooltip animations
- ✅ Professional tab styling
- ✅ Complete formula tooltips across all tabs
- ✅ 8 new investor-ready visualizations
- ✅ Dashboard transforms from "good" to "investor-ready"

---

## 10. Next Steps

1. **Review this ontology** - Confirm data structures and approach
2. **Implement Phase 1** - Quick Wins (90 min)
3. **Test in sandbox** - Verify before committing
4. **Create pre-commit summary** - Bullet points + sandbox link
5. **Get approval** - Review changes before pushing to git
6. **Implement Phase 2-5** - Continue with remaining items
7. **Deploy to production** - Push to Vercel/Cloudflare

---

**Ready to begin implementation?**

