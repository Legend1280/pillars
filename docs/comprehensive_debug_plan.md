# Comprehensive Dashboard Debug Plan

## Phase 1: Slider Functionality Testing

### Section 1: Inputs & Scenarios
- [ ] Founding Physician toggle
- [ ] Additional Physicians slider
- [ ] Primary Init Per Physician
- [ ] Primary Intake Monthly
- [ ] Churn Primary
- [ ] Conversion Primary to Specialty
- [ ] Specialty Init Per Physician
- [ ] Physician Primary Carryover
- [ ] Physician Specialty Carryover
- [ ] Other Physicians Primary Carryover
- [ ] Other Physicians Specialty Carryover

### Section 2: Revenues
- [ ] Primary Price
- [ ] Specialty Price

### Section 3: Diagnostics
- [ ] Diagnostics Active toggle
- [ ] Echo Start Month
- [ ] Echo Price
- [ ] Echo Volume Monthly
- [ ] CT Start Month
- [ ] CT Price
- [ ] CT Volume Monthly
- [ ] Lab Tests Price
- [ ] Lab Tests Monthly
- [ ] Diagnostics Margin

### Section 4: Costs
- [ ] CapEx Buildout Cost
- [ ] Office Equipment
- [ ] Split Startup Across Two Months toggle
- [ ] All startup cost sliders (10 items)
- [ ] Fixed Overhead Monthly
- [ ] Equipment Lease
- [ ] Marketing Budget Monthly
- [ ] Variable Cost Pct

### Section 5: Ramp to Launch
- [ ] Ramp Duration
- [ ] Corporate Start Month
- [ ] Ramp Primary Intake Monthly
- [ ] Ramp Specialty Intake Monthly

### Section 6: Staffing
- [ ] All salary sliders
- [ ] Start month sliders
- [ ] Admin support ratio

### Section 7: Growth
- [ ] DexaFit Primary Intake Monthly
- [ ] Corporate Contract Sales Monthly
- [ ] Employees Per Contract
- [ ] Primary to Specialty Conversion
- [ ] Diagnostics Expansion Rate

### Section 8: Corporate (REPORTED BROKEN)
- [ ] Initial Corporate Clients
- [ ] Corporate Contracts Monthly
- [ ] Corp Initial Clients
- [ ] Corp Price Per Employee Month

## Phase 2: Math Verification

### Revenue Calculations
- [ ] Primary revenue = members × price
- [ ] Specialty revenue = patients × price × physicians
- [ ] Corporate revenue = contracts × employees × price
- [ ] Diagnostics revenue = (echo + ct + labs) × volume × price × margin

### Cost Calculations
- [ ] Salaries calculation
- [ ] Fixed overhead
- [ ] Variable costs = revenue × variable%
- [ ] Equipment lease
- [ ] Marketing costs
- [ ] Startup costs distribution

### Profit Calculations
- [ ] Net profit = total revenue - total costs
- [ ] Cash flow = profit - capex
- [ ] Cumulative cash tracking

### Physician ROI Calculations
- [ ] Specialty retained = specialty revenue × (1 - MSO fee%)
- [ ] Equity income = MSO profit × equity stake%
- [ ] Monthly income = specialty retained + equity income
- [ ] Annualized ROI = (monthly × 12 / investment) × 100

## Phase 3: Data Flow Verification

### Input → Calculation → Display
- [ ] Inputs update DashboardContext
- [ ] Context triggers calculateProjections()
- [ ] Projections update all tabs
- [ ] Charts re-render with new data

### Specific Issues to Check
1. **Corporate slider not working**
   - Check if corporate inputs are in DashboardInputs interface
   - Check if calculateProjections uses corporate inputs
   - Check if corporate revenue calculation is correct
   - Check if charts display corporate data

2. **All sliders**
   - Verify each slider ID matches input field
   - Verify updateInputs() is called on change
   - Verify calculations use the input
   - Verify charts display the result

## Phase 4: Fix Implementation

For each broken slider:
1. Identify the root cause
2. Fix the calculation
3. Test the fix
4. Document the change

## Phase 5: Final Verification

- [ ] Test all sliders one more time
- [ ] Verify all charts update
- [ ] Check console for errors
- [ ] Verify ROI calculations are accurate
- [ ] Create summary report

## Expected Issues to Find

Based on user report:
1. Corporate slider not updating charts
2. Possibly other sliders with similar issues
3. Potential calculation errors
4. Data flow disconnects

## Tools to Use

- Browser console for errors
- React DevTools for state inspection
- Manual slider testing
- Calculation verification with calculator

