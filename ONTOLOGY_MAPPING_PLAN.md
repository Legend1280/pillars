# Complete Ontology Mapping Plan

## Current Status
- ✅ **77 INPUT nodes** mapped (Layer 1)
- ⏳ **DERIVED nodes** partially mapped (Layer 2)
- ⏳ **CALCULATION nodes** need mapping (Layer 3-4)
- ⏳ **OUTPUT nodes** need mapping (Layer 5)

## Node Categories by Section

### Section 1: Inputs & Scenarios (17 primitives) ✅
**Already Mapped:**
- foundingToggle, additionalPhysicians
- physicianPrimaryCarryover, physicianSpecialtyCarryover
- otherPhysiciansPrimaryCarryoverPerPhysician, otherPhysiciansSpecialtyCarryoverPerPhysician
- primaryMembersMonth1, specialtyMembersMonth1
- primaryIntakePerMonth, specialtyIntakePerMonth
- primaryPrice, specialtyPrice
- churnPrimary, churnSpecialty
- corpInitialClients, corpEmployeesPerContract, corpPricePerEmployeeMonth
- primaryToSpecialtyConversion

### Section 2: Revenues (15 primitives) ✅
**Already Mapped:**
- diagnosticsActive
- echoPrice, echoVolumeMonthly
- ctPrice, ctVolumeMonthly
- labTestsPrice, labTestsMonthly
- corpWellnessActive, corpInitialClients, corpEmployeesPerContract, corpPricePerEmployeeMonth
- diagnosticsMargin

**Need to Add - Derived/Calculations:**
- primaryRevenueMonth7 (calculation)
- specialtyRevenueMonth7 (calculation)
- diagnosticsRevenueMonth7 (calculation)
- corporateRevenueMonth7 (calculation)
- totalRevenueMonth7 (output)
- monthlyRevenue[] (time series)

### Section 3: Diagnostics (12 primitives) ✅
**Already Mapped:**
- All diagnostic inputs covered in Section 2

**Need to Add - Calculations:**
- echoRevenueMonth7
- ctRevenueMonth7
- labRevenueMonth7
- diagnosticsCostMonth7 (COGS)
- diagnosticsMarginMonth7

### Section 4: Costs (18 primitives) ✅
**Already Mapped:**
- capexBuildout, startupCosts
- facilityRent, utilities, insurance, software, supplies
- marketingBudgetMonthly
- variableCostPerMember
- ctLeaseCost, echoLeaseCost
- inflationRate

**Need to Add - Calculations:**
- totalFixedCostsMonth7
- totalVariableCostsMonth7
- totalMarketingCostsMonth7
- equipmentLeaseCostsMonth7
- totalCostsMonth7 (output)
- monthlyCosts[] (time series)

### Section 5: Staffing (10 primitives) ✅
**Already Mapped:**
- founderChiefStrategistSalary
- directorOperationsSalary
- gmHourlyRate, gmWeeklyHours
- fractionalCfoCost
- eventSalespersonCost
- eventPlannerCost
- benefitsPercentage

**Need to Add - Calculations:**
- totalSalariesMonth7
- totalBenefitsMonth7
- teamHeadcountMonth7
- monthlySalaries[] (time series)

### Section 6: Growth (8 primitives) ✅
**Already Mapped:**
- rampMonths
- corporateStartMonth
- rampPrimaryIntakeMonthly
- directorOpsStartMonth, gmStartMonth
- fractionalCfoStartMonth, eventPlannerStartMonth

**Need to Add - Calculations:**
- memberGrowthProjection[] (time series)
- primaryMembersMonth[0-18]
- specialtyMembersMonth[0-18]
- churnedMembersMonth[]

### Section 7: Risk (6 primitives)
**Need to Add - Inputs:**
- conservativeScenarioMultiplier
- aggressiveScenarioMultiplier
- sensitivityVariable
- stressTestVariable

**Need to Add - Calculations:**
- scenarioComparison
- sensitivityAnalysis
- stressTestResults
- riskScore

## Derived Variables (Layer 2)

### Physician Calculations
- totalPhysicians = (foundingToggle ? 1 : 0) + additionalPhysicians
- msoFee = getMSOFee(totalPhysicians)
- equityShare = getEquityShare(totalPhysicians)
- seedCapital = calculateSeedCapital(inputs)

### Member Calculations (Month 7)
- totalPrimaryCarryover = physicianPrimaryCarryover + (otherPhysiciansPrimaryCarryoverPerPhysician * additionalPhysicians)
- totalSpecialtyCarryover = physicianSpecialtyCarryover + (otherPhysiciansSpecialtyCarryoverPerPhysician * additionalPhysicians)
- primaryMembersMonth7 = calculated from growth model
- specialtyMembersMonth7 = calculated from growth model

## Calculation Nodes (Layer 3-4)

### Revenue Calculations
- primaryRevenueMonth7 = primaryMembersMonth7 * primaryPrice
- specialtyRevenueMonth7 = specialtyMembersMonth7 * specialtyPrice
- echoRevenueMonth7 = echoVolumeMonthly * echoPrice
- ctRevenueMonth7 = ctVolumeMonthly * ctPrice
- labRevenueMonth7 = labTestsMonthly * labTestsPrice
- diagnosticsRevenueMonth7 = echoRevenueMonth7 + ctRevenueMonth7 + labRevenueMonth7
- corporateRevenueMonth7 = corpEmployees * corpPricePerEmployeeMonth
- totalRevenueMonth7 = primary + specialty + diagnostics + corporate

### Cost Calculations
- salariesMonth7 = sum of all active staff salaries
- benefitsMonth7 = salariesMonth7 * benefitsPercentage
- fixedOverheadMonth7 = facilityRent + utilities + insurance + software + supplies
- marketingCostsMonth7 = marketingBudgetMonthly
- variableCostsMonth7 = (primaryMembers + specialtyMembers) * variableCostPerMember
- equipmentLeaseMonth7 = ctLeaseCost + echoLeaseCost
- diagnosticsCostMonth7 = diagnosticsRevenueMonth7 * (1 - diagnosticsMargin)
- totalCostsMonth7 = salaries + benefits + fixedOverhead + marketing + variable + equipmentLease + diagnosticsCost

### Profitability Calculations
- netIncomeMonth7 = totalRevenueMonth7 - totalCostsMonth7
- profitMarginMonth7 = (netIncomeMonth7 / totalRevenueMonth7) * 100
- ebitdaMonth7 = netIncomeMonth7 (simplified, no D&A)

## Output Nodes (Layer 5)

### KPIs
- totalRampBurn = sum of negative cash flows during ramp
- launchMRR = totalRevenueMonth7
- membersAtLaunch = primaryMembersMonth7 + specialtyMembersMonth7
- cashPositionAtLaunch = seedCapital - totalRampBurn
- totalRevenue12Mo = sum of months 7-18
- totalProfit12Mo = sum of profit months 7-18
- physicianROI = (annualDistribution / initialInvestment) * 100
- breakevenMonth = first month where cumulative cash > 0
- peakMembers = max(primaryMembers + specialtyMembers)

### Launch State
- primaryMembersAtLaunch
- specialtyMembersAtLaunch
- monthlyRevenueAtLaunch
- monthlyCostsAtLaunch
- teamHeadcountAtLaunch
- activeServicesAtLaunch
- equipmentLeaseAtLaunch

## Time Series Arrays (Projections)

### Ramp Period (Months 0-6)
For each month:
- revenue.primary, revenue.specialty, revenue.corporate, revenue.diagnostics
- costs.salaries, costs.overhead, costs.marketing, costs.variable, costs.equipment
- members.primaryActive, members.specialtyActive
- profit, cashFlow, cumulativeCash

### 12-Month Projection (Months 7-18)
Same structure as ramp period, extended to 18 months

## Metadata to Add

For each node, include:
```typescript
{
  id: string,
  label: string,
  type: 'input' | 'derived' | 'calculation' | 'output',
  layer: 1-5,
  category: string,
  section: 1-7,
  formula?: string,
  code?: string,
  description: string,
  dependencies: string[],
  dependents: string[],
  metadata: {
    file: string,
    lineNumber?: number,
    complexity: 1-10,
    impact: 'low' | 'medium' | 'high',
    isIntermediate: boolean,
    unit?: 'dollars' | 'percentage' | 'count' | 'months' | 'boolean',
    expectedRange?: { min: number, max: number }
  }
}
```

## Implementation Strategy

1. **Extend calculationAnalyzer.ts** with:
   - Complete DERIVED_NODES array (Layer 2)
   - Complete CALCULATION_NODES array (Layer 3-4)
   - Complete OUTPUT_NODES array (Layer 5)

2. **Add section metadata** to each node (1-7)

3. **Add unit metadata** for validation

4. **Build dependency edges** automatically

5. **Test with AI validation** to verify completeness

## Estimated Node Count

- Layer 1 (Inputs): 77 nodes ✅
- Layer 2 (Derived): ~30 nodes
- Layer 3-4 (Calculations): ~100 nodes (including time series)
- Layer 5 (Outputs): ~20 nodes

**Total: ~227 nodes**

## Next Steps

1. Add all derived variable nodes
2. Add all calculation nodes
3. Add all output nodes
4. Add section and unit metadata
5. Test complete ontology with Dr. Chen
6. Commit to GitHub

