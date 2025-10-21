# Ontology: P&L Summary Tab Visualizations
**Date**: 2025-10-20  
**Scope**: Add 4 high-impact visualizations to P&L Summary Tab  
**Target File**: `client/src/components/PLSummaryTab.tsx`

---

## Data Architecture

### Single Source of Truth
All data flows from: `DashboardContext` → `projections` → Components

**No new KPI calculations needed** - all data already exists in `projections.months[]`

### Data Structures Used

```typescript
// From projections.months[] (already exists)
interface MonthProjection {
  month: number;              // 0-17 (ramp + 12 months)
  revenue: {
    primary: number;
    specialty: number;
    diagnostics: number;
    corporate: number;
    total: number;
  };
  costs: {
    salaries: number;
    marketing: number;
    overhead: number;
    variable: number;
    equipment: number;
    startup: number;
    total: number;
  };
  profit: number;             // revenue.total - costs.total
  profitMargin: number;       // (profit / revenue.total) * 100
}
```

---

## Visualization Specifications

### 1. Monthly P&L Trend (Line Chart)
**Purpose**: Show revenue, costs, and profit trends over 18 months  
**Chart Type**: Recharts LineChart  
**Placement**: Full width, below existing visualizations  

**Data Source**:
```typescript
const data = projections.months.map(m => ({
  month: `M${m.month}`,
  revenue: m.revenue.total,
  costs: m.costs.total,
  profit: m.profit
}));
```

**Visual Specs**:
- **X-Axis**: Month (M0-M17)
- **Y-Axis**: Dollar amount (formatted as $XXk)
- **Lines**:
  - Revenue: Green (#10b981)
  - Costs: Red (#ef4444)
  - Profit: Blue (#3b82f6)
- **Grid**: Light gray dotted
- **Tooltip**: Show all 3 values
- **Legend**: Top right

**Size**: Full width, 300px height

---

### 2. Revenue Waterfall (Waterfall Chart)
**Purpose**: Show month-over-month revenue growth  
**Chart Type**: Recharts BarChart (custom waterfall)  
**Placement**: Left column (50% width), below P&L trend  

**Data Source**:
```typescript
const monthlyRevenue = projections.months.map(m => m.revenue.total);
const data = monthlyRevenue.map((rev, i) => ({
  month: `M${i}`,
  value: i === 0 ? rev : rev - monthlyRevenue[i-1],
  cumulative: rev,
  isPositive: i === 0 || rev >= monthlyRevenue[i-1]
}));
```

**Visual Specs**:
- **X-Axis**: Month (M0-M17)
- **Y-Axis**: Revenue change ($)
- **Bars**: Green (positive), Red (negative)
- **Connector lines**: Between bars
- **Tooltip**: Show change and cumulative

**Size**: 50% width, 300px height

---

### 3. Cost Breakdown Pie (Pie Chart)
**Purpose**: Show operating costs by category (Month 12)  
**Chart Type**: Recharts PieChart  
**Placement**: Right column (50% width), below P&L trend  

**Data Source**:
```typescript
const month12 = projections.months.find(m => m.month === 12);
const data = [
  { name: 'Salaries', value: month12.costs.salaries, color: '#3b82f6' },
  { name: 'Marketing', value: month12.costs.marketing, color: '#10b981' },
  { name: 'Overhead', value: month12.costs.overhead, color: '#f59e0b' },
  { name: 'Variable', value: month12.costs.variable, color: '#8b5cf6' },
  { name: 'Equipment', value: month12.costs.equipment, color: '#ec4899' }
];
```

**Visual Specs**:
- **Type**: Donut chart (inner radius 60%)
- **Colors**: As specified above
- **Labels**: Category name + percentage
- **Tooltip**: Show dollar amount
- **Legend**: Bottom

**Size**: 50% width, 300px height

---

### 4. Profit Gauge (Gauge Chart)
**Purpose**: Visual gauge showing profit margin % (Month 12)  
**Chart Type**: Custom SVG gauge  
**Placement**: Below cost breakdown pie  

**Data Source**:
```typescript
const month12 = projections.months.find(m => m.month === 12);
const profitMargin = month12.profitMargin; // Already calculated
```

**Visual Specs**:
- **Range**: -50% to +50%
- **Zones**:
  - Red: -50% to 0% (loss)
  - Yellow: 0% to 15% (low margin)
  - Green: 15% to 50% (healthy margin)
- **Needle**: Points to current profit margin
- **Label**: Large text showing percentage
- **Size**: 50% width, 200px height

---

## Layout Structure

### Current P&L Summary Tab Layout
```
[3 Summary Cards: Revenue, Costs, Profit]

[Capital Waterfall (66%)] [Break-Even (33%)]
                          [Unit Economics (33%)]

[P&L Table - Full Width]
```

### New Layout (After Adding 4 Visualizations)
```
[3 Summary Cards: Revenue, Costs, Profit]

[Capital Waterfall (66%)] [Break-Even (33%)]
                          [Unit Economics (33%)]

[Monthly P&L Trend - Full Width]

[Revenue Waterfall (50%)] [Cost Breakdown Pie (50%)]

[Profit Gauge (50%)]      [Empty Space (50%)]

[P&L Table - Full Width]
```

---

## Component Structure

### New Components to Create

1. **`MonthlyPLTrend.tsx`**
   - Props: `months: MonthProjection[]`
   - Size: ~80 lines
   - Uses: Recharts LineChart

2. **`RevenueWaterfall.tsx`**
   - Props: `months: MonthProjection[]`
   - Size: ~120 lines
   - Uses: Recharts BarChart (custom waterfall logic)

3. **`CostBreakdownPie.tsx`**
   - Props: `costs: CostBreakdown`
   - Size: ~70 lines
   - Uses: Recharts PieChart

4. **`ProfitGauge.tsx`**
   - Props: `profitMargin: number`
   - Size: ~100 lines
   - Uses: Custom SVG gauge

### Modifications to Existing Files

**`client/src/components/PLSummaryTab.tsx`**:
- Import 4 new components
- Add 3 new grid sections below existing visualizations
- Pass appropriate props from `projections`

---

## Implementation Checklist

### Phase 1: Create Components ✅
- [ ] Create `MonthlyPLTrend.tsx`
- [ ] Create `RevenueWaterfall.tsx`
- [ ] Create `CostBreakdownPie.tsx`
- [ ] Create `ProfitGauge.tsx`

### Phase 2: Integrate into PLSummaryTab ✅
- [ ] Import 4 new components
- [ ] Add Monthly P&L Trend (full width)
- [ ] Add Revenue Waterfall + Cost Breakdown (50/50 grid)
- [ ] Add Profit Gauge (50% width)

### Phase 3: Test & Verify ✅
- [ ] Build and start dev server
- [ ] Navigate to P&L Summary tab
- [ ] Verify all 4 visualizations render correctly
- [ ] Verify data accuracy
- [ ] Verify responsive layout
- [ ] Verify P&L table still intact below

### Phase 4: Pre-Commit Review ✅
- [ ] Create ontology update summary
- [ ] Screenshot all 4 new visualizations
- [ ] Verify sandbox deployment
- [ ] Get user approval

### Phase 5: Commit & Deploy ✅
- [ ] Commit with descriptive message
- [ ] Push to GitHub
- [ ] Verify Vercel/Cloudflare deployments

---

## Data Validation Rules

### Monthly P&L Trend
- Revenue line should always be above costs (after Month 7)
- Profit line should cross zero at Month 7 (break-even)
- All values should be positive (except profit in ramp period)

### Revenue Waterfall
- First bar (M0) should be $0 (no revenue during ramp)
- Bars should show steady growth after Month 7
- Cumulative revenue at M17 should match total revenue

### Cost Breakdown Pie
- All slices should add up to 100%
- Salaries should be largest slice (~40-50%)
- No slice should be 0% (all categories have costs)

### Profit Gauge
- Should show positive margin (15-20% range)
- Needle should be in green zone
- Percentage should match Month 12 profit margin

---

## Formatting Standards

### Currency
- All dollar amounts: `$XXX,XXX` (whole dollars, no cents)
- Use `formatCurrency()` helper

### Percentages
- Format: `XX.X%` (1 decimal place)
- Use `toFixed(1)` for consistency

### Month Labels
- Format: `M0`, `M1`, `M2`, ... `M17`
- Ramp period: M0-M6
- Operating period: M7-M17

---

## Color Palette

### Standard Colors
- **Revenue/Positive**: Green (#10b981)
- **Costs/Negative**: Red (#ef4444)
- **Profit/Info**: Blue (#3b82f6)
- **Warning**: Yellow (#f59e0b)
- **Purple**: (#8b5cf6)
- **Pink**: (#ec4899)

### Chart-Specific Colors
**Cost Breakdown Pie**:
- Salaries: Blue (#3b82f6)
- Marketing: Green (#10b981)
- Overhead: Orange (#f59e0b)
- Variable: Purple (#8b5cf6)
- Equipment: Pink (#ec4899)

**Profit Gauge Zones**:
- Loss (-50% to 0%): Red (#ef4444)
- Low (0% to 15%): Yellow (#f59e0b)
- Healthy (15% to 50%): Green (#10b981)

---

## Technical Notes

### Recharts Configuration
- Use `ResponsiveContainer` for all charts
- Set `margin={{ top: 20, right: 30, left: 20, bottom: 5 }}`
- Enable tooltips with custom formatters
- Use `CartesianGrid` with `strokeDasharray="3 3"`

### Performance
- All data is pre-calculated in `projections`
- No expensive computations in render
- Memoize chart data if needed

### Accessibility
- Add `aria-label` to all charts
- Use semantic HTML structure
- Ensure color contrast meets WCAG AA standards

---

## Success Criteria

✅ All 4 visualizations render correctly  
✅ Data accuracy verified against projections  
✅ Professional styling consistent with existing components  
✅ Responsive layout works on all screen sizes  
✅ P&L table remains intact below visualizations  
✅ No performance degradation  
✅ Single source of truth maintained  

---

**Estimated Implementation Time**: 60-90 minutes  
**Complexity**: Medium (using existing Recharts library)  
**Risk**: Low (all data already available, no new calculations)

