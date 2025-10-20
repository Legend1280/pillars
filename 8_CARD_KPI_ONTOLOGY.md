# 8-Card KPI System - Ontology Definition

## Overview
This document defines the ontological structure for the 8-card Physician ROI Dashboard KPI layout, ensuring all calculations, data flows, and dependencies are properly documented.

---

## Card 1: Monthly Income
**Category:** Income Performance  
**Ontological Name:** `monthlyIncome`  
**Type:** Currency (USD)  
**Update Frequency:** Per month calculation

### Definition
Total aggregated monthly earnings from all revenue sources attributable to the physician.

### Formula
```typescript
monthlyIncome = specialtyRetained + equityIncome + diagnosticsShare + corporateShare
```

### Dependencies
- `specialtyRetained`: Specialty revenue after MSO fee
- `equityIncome`: Physician's equity share of net profit
- `diagnosticsShare`: Physician's share of diagnostic revenue (if applicable)
- `corporateShare`: Physician's share of corporate wellness revenue (if applicable)

### Data Source
- Calculated from Month 12 projection data
- Uses `MonthlyFinancials.revenue` breakdown

---

## Card 2: Annualized ROI
**Category:** Capital Efficiency  
**Ontological Name:** `annualizedROI`  
**Type:** Percentage  
**Update Frequency:** Per calculation cycle

### Definition
Total return on invested capital, measuring physician's financial performance against initial investment.

### Formula
```typescript
annualizedROI = ((annualIncome - initialInvestment) / initialInvestment) × 100
```

Where:
```typescript
annualIncome = sum(monthlyIncome for months 1-12)
initialInvestment = foundingToggle ? 600000 : 750000
```

### Dependencies
- `monthlyIncome`: From Card 1
- `foundingToggle`: Boolean indicating founding vs additional physician
- `BUSINESS_RULES.FOUNDING_INVESTMENT`: $600K
- `BUSINESS_RULES.ADDITIONAL_INVESTMENT`: $750K

### Data Source
- Calculated from 12-month projection
- Uses existing `physicianROI` calculation as base

---

## Card 3: MSO Equity Income
**Category:** Equity Participation  
**Ontological Name:** `msoEquityIncome`  
**Type:** Currency (USD) per month  
**Update Frequency:** Per month calculation

### Definition
Monthly passive income from physician's equity stake in MSO net profit.

### Formula
```typescript
msoEquityIncome = netProfit × equityPercentage
```

Where:
```typescript
equityPercentage = foundingToggle ? 0.10 : 0.05
netProfit = totalRevenue - totalCosts
```

### Dependencies
- `netProfit`: From `MonthlyFinancials.profit`
- `foundingToggle`: Determines equity stake (10% vs 5%)
- `totalRevenue`: All revenue streams
- `totalCosts`: All operational costs

### Data Source
- Month 12 `MonthlyFinancials.profit`
- Equity percentage from business rules

---

## Card 4: Equity Stake Value
**Category:** Asset Growth  
**Ontological Name:** `equityStakeValue`  
**Type:** Currency (USD)  
**Update Frequency:** Per calculation cycle

### Definition
Projected value of physician's equity stake based on practice valuation using earnings multiple.

### Formula
```typescript
equityStakeValue = (annualNetProfit × earningsMultiple) × equityPercentage
```

Where:
```typescript
annualNetProfit = sum(monthlyProfit for months 1-12)
earningsMultiple = 2.0  // Conservative medical practice multiple
equityPercentage = foundingToggle ? 0.10 : 0.05
```

### Dependencies
- `annualNetProfit`: Sum of 12 months profit
- `earningsMultiple`: Constant (2×)
- `equityPercentage`: From founding status

### Data Source
- Calculated from 12-month projection totals
- Uses standard medical practice valuation methodology

---

## Card 5: Independent Revenue Streams
**Category:** Practice Autonomy  
**Ontological Name:** `independentRevenueStreams`  
**Type:** Integer count  
**Update Frequency:** Per calculation cycle

### Definition
Number of active, independent revenue streams generating income for the practice.

### Formula
```typescript
independentRevenueStreams = count([
  primaryRevenue > 0,
  specialtyRevenue > 0,
  corporateRevenue > 0,
  echoRevenue > 0,
  ctRevenue > 0,
  labsRevenue > 0
])
```

### Dependencies
- `primaryRevenue`: Primary care membership revenue
- `specialtyRevenue`: Specialty care revenue
- `corporateRevenue`: Corporate wellness contracts
- `echoRevenue`: Echo diagnostic revenue
- `ctRevenue`: CT diagnostic revenue
- `labsRevenue`: Lab testing revenue

### Data Source
- Month 12 `MonthlyFinancials.revenue` breakdown
- Counts streams with revenue > $0

---

## Card 6: Specialty Patient Load
**Category:** Patient Load & Efficiency  
**Ontological Name:** `specialtyPatientLoad`  
**Type:** Integer count  
**Update Frequency:** Per month calculation

### Definition
Number of specialty patients managed per month, demonstrating lower volume/higher value model vs. hospital employment.

### Formula
```typescript
specialtyPatientLoad = specialtyMembers
hospitalComparison = specialtyPatientLoad / 730  // Typical hospital specialty load
```

Where:
```typescript
specialtyMembers = count of active specialty care members
```

### Dependencies
- `specialtyMembers`: From `MonthlyFinancials.specialtyMembers`
- Hospital baseline: 730 patients/month (industry standard)

### Data Source
- Month 12 `MonthlyFinancials.specialtyMembers`
- Comparison ratio calculated against hospital baseline

---

## Card 7: Quality-of-Life Index
**Category:** Lifestyle & Work Balance  
**Ontological Name:** `qualityOfLifeIndex`  
**Type:** Percentage  
**Update Frequency:** Static (based on model assumptions)

### Definition
Percentage of time recovered from administrative burden through MSO integration.

### Formula
```typescript
qualityOfLifeIndex = ((hospitalAdminTime - msoAdminTime) / hospitalAdminTime) × 100
```

Where:
```typescript
hospitalAdminTime = 30  // % of time on admin in hospital setting
msoAdminTime = 10       // % of time on admin with MSO support
```

### Dependencies
- `hospitalAdminTime`: Industry baseline (30%)
- `msoAdminTime`: MSO model assumption (10%)

### Data Source
- Static assumptions based on MSO operational model
- Could be made dynamic with `inputs.adminTimeReduction` parameter

---

## Card 8: Support-to-Physician Ratio
**Category:** Ecosystem Leverage  
**Ontological Name:** `supportToPhysicianRatio`  
**Type:** Ratio (X:1)  
**Update Frequency:** Per calculation cycle

### Definition
Ratio of shared support staff to physicians, demonstrating operational leverage.

### Formula
```typescript
supportToPhysicianRatio = totalSupportStaff / totalPhysicians
```

Where:
```typescript
totalSupportStaff = nursePractitioners + adminStaff + marketingStaff + diagnosticsTechs
totalPhysicians = physicianCount
```

### Dependencies
- `nursePractitioners`: Count of NPs
- `adminStaff`: Count of admin personnel
- `marketingStaff`: Count of marketing personnel
- `diagnosticsTechs`: Count of diagnostic technicians
- `physicianCount`: From `inputs.physicianCount`

### Data Source
- Calculated from staffing inputs
- Month 12 staffing levels

---

## Ontological Relationships

### Primary Calculations
```
MonthlyFinancials (Month 12)
├── revenue
│   ├── primary → Card 5 (stream count)
│   ├── specialty → Card 5, Card 6
│   ├── corporate → Card 5
│   ├── echo → Card 5
│   ├── ct → Card 5
│   └── labs → Card 5
├── costs
│   └── total → Card 3 (net profit calc)
├── profit → Card 3, Card 4
├── specialtyMembers → Card 6
└── equityIncome → Card 1, Card 3
```

### Derived Calculations
```
Card 1 (monthlyIncome)
└── feeds into → Card 2 (annualizedROI)

Card 3 (msoEquityIncome)
└── feeds into → Card 1 (monthlyIncome)

Card 4 (equityStakeValue)
└── depends on → Card 3 (profit calculation)

Card 7 (qualityOfLifeIndex)
└── static calculation (no dependencies)

Card 8 (supportToPhysicianRatio)
└── depends on → staffing inputs
```

---

## Data Validation Rules

### Card 1: Monthly Income
- Must be ≥ $0
- Should be > $50,000 for viable practice
- Warning if < physician investment / 12

### Card 2: Annualized ROI
- Can be negative (loss)
- Warning if < 0%
- Success if > 50%
- Exceptional if > 100%

### Card 3: MSO Equity Income
- Must be ≥ $0
- Should be 5-10% of net profit
- Validates against equity percentage

### Card 4: Equity Stake Value
- Must be ≥ initial investment
- Validates earnings multiple (typically 1.5-3×)

### Card 5: Independent Revenue Streams
- Min: 1 (at least primary care)
- Max: 6 (all streams active)
- Optimal: 4-6 (diversification)

### Card 6: Specialty Patient Load
- Must be > 0 if specialty revenue exists
- Ratio should be < 0.5 (less than half hospital load)

### Card 7: Quality-of-Life Index
- Range: 0-100%
- Typical: 30-70%
- Current model: 66.7% ((30-10)/30)

### Card 8: Support-to-Physician Ratio
- Min: 1:1 (basic support)
- Optimal: 3:1 to 7:1
- Warning if < 2:1 (understaffed)

---

## Implementation Checklist

- [ ] Add 8 new fields to `KPIs` interface in calculations.ts
- [ ] Create calculation functions for each KPI
- [ ] Update `calculateKPIs()` to include all 8 metrics
- [ ] Create 8 individual card components
- [ ] Update KPIRibbon to use 4×2 grid layout
- [ ] Add formulas to formulas.ts
- [ ] Add nodes to calculationGraphEnhanced.ts
- [ ] Create unit tests for each calculation
- [ ] Document in user guide
- [ ] Add tooltips with calculation details

