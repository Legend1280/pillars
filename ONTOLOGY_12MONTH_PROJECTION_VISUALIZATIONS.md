# Ontology: 12-Month Projection Tab Visualizations
**Date**: 2025-10-20  
**Scope**: Add 2 visualizations to 12-Month Projection Tab  
**Target File**: `client/src/components/ProjectionTab.tsx`

---

## Data Architecture

### Single Source of Truth
All data flows from: `DashboardContext` → `projections` → Components

**No new KPI calculations needed** - all data already exists in `projections.projection[]` (Months 7-18)

### Data Structures Used

```typescript
// From projections.projection[] (already exists)
interface MonthProjection {
  month: number;              // 7-18 (12 operating months)
  revenue: {
    primary: number;          // Primary care revenue
    specialty: number;        // Specialty care revenue
    diagnostics: number;      // Diagnostics revenue (Echo + CT + Labs)
    corporate: number;        // Corporate wellness revenue
    total: number;            // Sum of all revenue streams
  };
  members: {
    primary: number;          // Primary care members
    specialty: number;        // Specialty members
  };
}

// From inputs (already exists)
interface Inputs {
  primaryPrice: number;       // Monthly price per primary member
  specialtyPrice: number;     // Monthly price per specialty member
  conversionRate: number;     // % of leads that convert to members
}
```

---

## Visualization Specifications

### 1. Revenue Mix Pie Chart
**Purpose**: Show revenue distribution by stream (Month 12)  
**Chart Type**: Recharts PieChart  
**Placement**: Right column (50% width), top of 12-Month Projection tab  

**Data Source**:
```typescript
const month12 = projections.projection.find(m => m.month === 12);
const data = [
  { name: 'Primary Care', value: month12.revenue.primary, color: '#3b82f6' },
  { name: 'Specialty Care', value: month12.revenue.specialty, color: '#10b981' },
  { name: 'Diagnostics', value: month12.revenue.diagnostics, color: '#f59e0b' },
  { name: 'Corporate Wellness', value: month12.revenue.corporate, color: '#8b5cf6' }
].filter(item => item.value > 0); // Only show non-zero streams
```

**Visual Specs**:
- **Type**: Donut chart (inner radius 60%)
- **Colors**:
  - Primary Care: Blue (#3b82f6)
  - Specialty Care: Green (#10b981)
  - Diagnostics: Orange (#f59e0b)
  - Corporate Wellness: Purple (#8b5cf6)
- **Labels**: Stream name + percentage
- **Tooltip**: Show dollar amount
- **Legend**: Bottom
- **Footer**: Total monthly revenue

**Size**: 50% width, 350px height

---

### 2. Member Acquisition Funnel
**Purpose**: Show conversion from leads to members  
**Chart Type**: Custom SVG funnel  
**Placement**: Left column (50% width), top of 12-Month Projection tab  

**Data Source**:
```typescript
// Calculate funnel metrics
const totalMembers = projections.projection[projections.projection.length - 1].members.primary;
const conversionRate = inputs.conversionRate / 100; // e.g., 0.20 for 20%
const leads = totalMembers / conversionRate; // Work backwards from members
const qualified = leads * 0.6; // Assume 60% of leads are qualified
const engaged = qualified * 0.7; // Assume 70% of qualified engage
const converted = totalMembers; // Final members

const funnelData = [
  { stage: 'Leads', count: Math.round(leads), color: '#e5e7eb', percentage: 100 },
  { stage: 'Qualified', count: Math.round(qualified), color: '#93c5fd', percentage: 60 },
  { stage: 'Engaged', count: Math.round(engaged), color: '#60a5fa', percentage: 42 },
  { stage: 'Members', count: converted, color: '#3b82f6', percentage: conversionRate * 100 }
];
```

**Visual Specs**:
- **Type**: Trapezoid funnel (SVG paths)
- **Stages**: 4 levels (Leads → Qualified → Engaged → Members)
- **Colors**: Gradient from light gray to blue
- **Labels**: Stage name + count + percentage
- **Width**: Narrows from 100% (top) to final conversion % (bottom)
- **Tooltip**: Show conversion rate between stages

**Size**: 50% width, 350px height

---

## Layout Structure

### Current 12-Month Projection Tab Layout
```
[Existing projection content - charts, tables, etc.]
```

### New Layout (After Adding 2 Visualizations)
```
[Member Acquisition Funnel (50%)] [Revenue Mix Pie (50%)] ← NEW (at top)

[Existing projection content below]
```

---

## Component Structure

### New Components to Create

1. **`RevenueMixPie.tsx`**
   - Props: `revenue: { primary, specialty, diagnostics, corporate, total }`
   - Size: ~80 lines
   - Uses: Recharts PieChart

2. **`MemberAcquisitionFunnel.tsx`**
   - Props: `totalMembers: number, conversionRate: number`
   - Size: ~150 lines
   - Uses: Custom SVG funnel

### Modifications to Existing Files

**`client/src/components/ProjectionTab.tsx`**:
- Import 2 new components
- Add grid section at top with 50/50 layout
- Pass appropriate props from `projections` and `inputs`

---

## Implementation Checklist

### Phase 1: Create Components ✅
- [ ] Create `RevenueMixPie.tsx`
- [ ] Create `MemberAcquisitionFunnel.tsx`

### Phase 2: Integrate into ProjectionTab ✅
- [ ] Import 2 new components
- [ ] Add grid section at top (50/50 layout)
- [ ] Pass revenue data to RevenueMixPie
- [ ] Pass member/conversion data to MemberAcquisitionFunnel

### Phase 3: Test & Verify ✅
- [ ] Build and start dev server
- [ ] Navigate to 12-Month Projection tab
- [ ] Verify both visualizations render correctly
- [ ] Verify data accuracy
- [ ] Verify responsive layout
- [ ] Verify existing content intact below

### Phase 4: Pre-Commit Review ✅
- [ ] Create ontology update summary
- [ ] Screenshot both visualizations
- [ ] Verify sandbox deployment
- [ ] Get user approval

### Phase 5: Commit & Deploy ✅
- [ ] Commit with descriptive message
- [ ] Push to GitHub
- [ ] Verify production deployments

---

## Data Validation Rules

### Revenue Mix Pie
- All slices should add up to 100%
- Primary Care should be largest slice (typically 40-50%)
- No slice should be 0% (filter out zero-value streams)
- Total revenue should match Month 12 total

### Member Acquisition Funnel
- Leads (top) > Qualified > Engaged > Members (bottom)
- Each stage should be smaller than the previous
- Final conversion rate should match input conversion rate
- Member count should match Month 12 primary members

---

## Formatting Standards

### Currency
- All dollar amounts: `$XXX,XXX` (whole dollars, no cents)
- Use `formatCurrency()` helper

### Percentages
- Format: `XX.X%` (1 decimal place)
- Use `toFixed(1)` for consistency

### Numbers
- Format: `XXX` (no decimals for member counts)
- Use `Math.round()` for whole numbers

---

## Color Palette

### Revenue Mix Pie
- **Primary Care**: Blue (#3b82f6)
- **Specialty Care**: Green (#10b981)
- **Diagnostics**: Orange (#f59e0b)
- **Corporate Wellness**: Purple (#8b5cf6)

### Member Acquisition Funnel
- **Leads**: Light Gray (#e5e7eb)
- **Qualified**: Light Blue (#93c5fd)
- **Engaged**: Medium Blue (#60a5fa)
- **Members**: Dark Blue (#3b82f6)

---

## Technical Notes

### Recharts Configuration
- Use `ResponsiveContainer` for Revenue Mix Pie
- Set `margin={{ top: 20, right: 30, left: 20, bottom: 5 }}`
- Enable tooltips with custom formatters

### SVG Funnel
- Use trapezoid paths for funnel stages
- Calculate width based on conversion percentages
- Add smooth transitions between stages
- Center-align all text labels

### Performance
- All data is pre-calculated in `projections`
- No expensive computations in render
- Memoize funnel calculations if needed

### Accessibility
- Add `aria-label` to both visualizations
- Use semantic HTML structure
- Ensure color contrast meets WCAG AA standards

---

## Success Criteria

✅ Both visualizations render correctly  
✅ Data accuracy verified against projections  
✅ Professional styling consistent with existing components  
✅ Responsive layout works on all screen sizes  
✅ Existing projection content remains intact below  
✅ No performance degradation  
✅ Single source of truth maintained  

---

**Estimated Implementation Time**: 60-75 minutes  
**Complexity**: Medium (custom SVG funnel is more complex)  
**Risk**: Low (all data already available, no new calculations)

