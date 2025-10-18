# Physician-Centric ROI Features Analysis

## From Previous Dashboard (dashboard.pillars.care)

### Key Physician Metrics (Top KPI Cards)
1. **Physician Income** - $72,273/month (Specialty + Equity)
2. **Physician ROI** - 144.5% (Annual / Investment)
3. **Physician MSO Income** - $28,287 (10% of Net Profit)

### Physician ROI Analysis Table
- **Investment**: $600,000
- **Equity Stake**: 10%
- **MSO Service Fee**: 37%
- **Specialty Revenue Retained**: $44,233
- **Equity Income from MSO**: $28,287
- **Monthly Income (Month 12)**: $72,273
- **Annualized Income**: $867,270
- **Annualized ROI**: 144.5%

### Physician Income Breakdown (Donut Chart)
- **Specialty Retained** (63% of specialty revenue)
- **MSO Equity Income** (10% of MSO net profit)

### Equity Stake Valuation
- **Equity Percentage**: 10%
- **MSO Valuation** (2X Earnings): $6,788,922
- **Equity Stake Value**: $678,892

### Valuation Model Scenarios
- 2X Earnings (Conservative)
- 3X Earnings (Standard MSO)
- 4X Earnings (Healthcare Avg)
- 5X Earnings (Integrated Platform)
- 6X Earnings (Premium)

## What's Missing in Current Dashboard (100% / 100% Issue)

The current Risk Analysis shows:
- **Breakeven Probability**: 100%
- **Profit Probability**: 100%

This is unrealistic and suggests the Monte Carlo simulation needs better variance modeling. Real-world scenarios should show:
- 70-85% breakeven probability (more realistic)
- 60-75% profit probability
- Clear downside risk scenarios

## New Physician-Centric Risk Dashboard Features

### Replace Generic Metrics With:

1. **Physician Monthly Income (P10/P50/P90)**
   - Conservative: $45K/month
   - Base Case: $72K/month
   - Optimistic: $95K/month

2. **Physician Annualized ROI (P10/P50/P90)**
   - Conservative: 90% ROI
   - Base Case: 144% ROI
   - Optimistic: 190% ROI

3. **Months to Breakeven**
   - Best Case: 8 months
   - Median: 12 months
   - Worst Case: 18 months

4. **Equity Stake Value at Exit (P10/P50/P90)**
   - Conservative: $450K
   - Base Case: $679K
   - Optimistic: $950K

### Income Diversity Chart (Keep This!)
Show physician's profit breakdown across revenue streams:
- **Specialty Revenue Retained** (63% of specialty fees)
- **MSO Equity Distribution** (10% of MSO net profit)
- **Primary Care Revenue** (if applicable)
- **Diagnostics Revenue Share** (if applicable)

### Sensitivity Analysis (Physician-Focused)
Which inputs most impact **physician income**:
1. Specialty patient volume
2. MSO service fee %
3. MSO net profit (affects equity income)
4. Specialty pricing
5. Primary care member growth
6. Corporate contract growth

### Risk Heatmap (Physician ROI)
- X-axis: Specialty Patient Volume (60-180 patients/month)
- Y-axis: MSO Net Profit ($150K - $400K/month)
- Color: Physician Monthly Income
  - Red: <$40K/month (below target)
  - Orange: $40-60K/month (moderate)
  - Green: >$60K/month (strong)

### Scenario Comparison (Physician-Centric)
| Metric | Conservative (P10) | Base Case (P50) | Optimistic (P90) |
|--------|-------------------|-----------------|------------------|
| Monthly Income | $45,000 | $72,273 | $95,000 |
| Annualized Income | $540,000 | $867,270 | $1,140,000 |
| ROI % | 90% | 144.5% | 190% |
| Equity Value (2X) | $450,000 | $678,892 | $950,000 |
| Months to Breakeven | 18 | 12 | 8 |

## Implementation Plan

1. **Remove**: Generic 12-month projection (duplicate)
2. **Keep**: Monte Carlo distribution, Sensitivity tornado, Risk heatmap
3. **Add**: Physician income diversity chart
4. **Update**: All metrics to be physician-centric (income, ROI, equity value)
5. **Fix**: Monte Carlo variance to show realistic 70-85% probabilities
6. **Add**: Months to breakeven metric
7. **Add**: Equity stake value scenarios

## Key Calculations Needed

```typescript
// Physician Monthly Income
physicianMonthlyIncome = specialtyRevenueRetained + msoEquityIncome

// Specialty Revenue Retained (63% if founding, 63% if not)
specialtyRevenueRetained = (foundingPhysicianPatients * specialtyPrice * (1 - msoServiceFee/100))

// MSO Equity Income (10% if founding, 0% if not)
msoEquityIncome = msoNetProfit * (equityStake / 100)

// Physician Annualized ROI
physicianROI = (physicianMonthlyIncome * 12 / investment) * 100

// Equity Stake Value
equityValue = (msoAnnualProfit * earningsMultiple) * (equityStake / 100)
```

This makes the dashboard **physician-centric** and shows the founding physician exactly what they care about: their personal ROI, income streams, and equity value.

