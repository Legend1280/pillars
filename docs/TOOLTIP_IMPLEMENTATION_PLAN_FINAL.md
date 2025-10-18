# Comprehensive Tooltip Implementation Plan

## Status: Ready for Execution

### ✅ Completed
- **Ramp & Launch Tab** - 4 KPIs + 7 charts (DONE)
- **Tooltip Components** - FormulaTooltip, KPICard, ChartCard (DONE)
- **Formula Library** - formulas.ts with all calculations (DONE)
- **Large Formula Support** - max-w-2xl, scrollable, monospace (DONE)

---

## Remaining Work

### Tab 1: 12-Month Projection (4 KPIs + 6 Charts)

**KPI Cards:**
1. Total Revenue (12mo) - `Σ(Monthly Revenue) for Months 7-18`
2. Total Profit (12mo) - `Σ(Monthly Profit) for Months 7-18`
3. Peak Members - `MAX(Primary Active Members) across all months`
4. Final Cash Position - `Cumulative Cash at Month 18`

**Charts:**
1. Revenue, Costs & Profitability Trajectory
   - Formula: Multi-line showing Revenue, Costs, Profit calculations
2. Cumulative Cash Position
   - Formula: `Starting Cash + Σ(Monthly Profit) - Capital Deployed`
3. Revenue Streams Over Time
   - Formula: `Primary + Specialty + Corporate + Diagnostics`
4. Member Growth Trajectory
   - Formula: `Previous Members + New Members - Churned Members`
5. Monthly Cost Structure
   - Formula: `Salaries + Overhead + Marketing + Equipment + Variable`
6. Member Acquisition & Retention Metrics
   - Formula: `New Members, Churned Members, Net Growth`

---

### Tab 2: Cash Flow & Balance Sheet (3 Charts)

**Charts:**
1. Cash Flow Waterfall
   - Formula: `Opening Cash + Revenue - Costs = Closing Cash`
2. Balance Sheet Evolution
   - Formula: `Assets = Liabilities + Equity`
3. Working Capital Analysis
   - Formula: `Current Assets - Current Liabilities`

---

### Tab 3: Risk Analysis (3 KPIs + 4 Charts)

**KPI Cards:**
1. Median 12-Month Profit - `P50 of Monte Carlo simulation`
2. Breakeven Probability - `% of simulations reaching breakeven`
3. Cash Risk - `% of simulations running out of cash`

**Charts:**
1. Monte Carlo Profit Distribution
   - Formula: `10,000 simulations with ±20% variance on key inputs`
2. Sensitivity Tornado Chart
   - Formula: `Impact = (High Case - Low Case) / Base Case`
3. Risk Heatmap
   - Formula: `Member Count × Pricing → Profit Zones`
4. Scenario Comparison
   - Formula: `Conservative vs Base vs Moderate outcomes`

---

### Tab 4: P&L Summary (2 Charts)

**Charts:**
1. Monthly P&L Table
   - Formula: `Revenue - COGS - Operating Expenses = Net Profit`
2. Profit Margin Trend
   - Formula: `(Net Profit / Revenue) × 100%`

---

### Tab 5: Physician ROI (4 KPIs + 3 Charts)

**KPI Cards:**
1. Monthly Income - `Specialty Retained + MSO Equity Income`
2. Annualized ROI - `(Annual Income / Investment) × 100%`
3. MSO Equity Income - `MSO Net Profit × Equity Stake %`
4. Equity Stake Value - `MSO Net Profit × 12 × Earnings Multiple`

**Charts:**
1. Income Breakdown (Donut)
   - Formula: `Specialty Revenue × (1 - MSO Fee%) + MSO Profit × Equity%`
2. Income Diversity (Bar)
   - Formula: `Physician share from each revenue stream`
3. Equity Valuation Scenarios
   - Formula: `(MSO Annual Profit) × Multiple (2X-6X)`

---

## Implementation Strategy

### Phase 1: Add Formula Definitions (15 min)
- Update `formulas.ts` with all missing formulas
- Ensure multi-line formulas are properly formatted
- Add descriptions for complex calculations

### Phase 2: Update 12-Month Projection Tab (20 min)
- Replace 4 KPI cards with KPICard component
- Replace 6 charts with ChartCard component
- Test tooltip visibility and scrolling

### Phase 3: Update Cash Flow Tab (10 min)
- Replace 3 charts with ChartCard component

### Phase 4: Update Risk Analysis Tab (15 min)
- Replace 3 KPI cards with KPICard component
- Replace 4 charts with ChartCard component

### Phase 5: Update P&L Summary Tab (10 min)
- Replace 2 charts with ChartCard component

### Phase 6: Update Physician ROI Tab (15 min)
- Replace 4 KPI cards with KPICard component
- Replace 3 charts with ChartCard component

### Phase 7: Final Testing & Verification (15 min)
- Navigate through all tabs
- Hover over every tooltip
- Verify formulas are complete and visible
- Check scrolling works for large formulas
- Create completion report

---

## Total Estimated Time: 1.5 - 2 hours

---

## Formula Format Standards

All formulas should follow this format:

**Simple Formula:**
```
Capital Deployed = Σ(Monthly Costs - Monthly Revenue) + Startup Costs
```

**Multi-line Formula:**
```
Total Revenue = 
  Primary Revenue + 
  Specialty Revenue + 
  Corporate Revenue + 
  Diagnostics Revenue

Where:
  Primary Revenue = Members × Price × (1 - Churn Rate)
  Specialty Revenue = Visits × Price per Visit
  Corporate Revenue = Employees × Price per Employee
  Diagnostics Revenue = Echo + CT + Labs
```

**Complex Formula with Breakdown:**
```
Physician Monthly Income = 
  Specialty Revenue Retained + MSO Equity Income

Specialty Revenue Retained = 
  Specialty Revenue × (1 - MSO Service Fee%)
  = Specialty Revenue × (1 - 37%) for Founding
  = Specialty Revenue × (1 - 40%) for Non-Founding

MSO Equity Income = 
  MSO Net Profit × Equity Stake%
  = MSO Net Profit × 10% for Founding
  = MSO Net Profit × 5% for Non-Founding
```

---

## Success Criteria

✅ All 25+ charts have formula tooltips in top-right corner
✅ All 15+ KPI cards have formula tooltips next to title
✅ All tooltips are scrollable for large formulas
✅ All formulas are accurate and match calculations.ts
✅ Tooltips are consistent across all tabs
✅ No TypeScript errors
✅ All tooltips tested and verified

---

## Ready to Execute

This plan is comprehensive and systematic. Proceeding with implementation now.

