/**
 * Formula definitions for tooltips throughout the dashboard
 * Each formula shows the exact calculation used
 */

export const formulas = {
  // Ramp & Launch Tab
  capitalDeployed: "Σ(Monthly Costs - Monthly Revenue) for Months 0-6 + Startup Costs",
  launchMRR: "Primary Revenue + Specialty Revenue + Corporate Revenue + Diagnostics Revenue at Month 7",
  membersAtLaunch: "Primary Members at Month 6",
  cashAtLaunch: "Starting Capital - Capital Deployed",
  
  // 12-Month Projection Tab
  totalRevenue12Mo: "Σ(Monthly Revenue) for Months 7-18",
  totalProfit12Mo: "Σ(Monthly Profit) for Months 7-18",
  peakMembers: "Max(Primary Members) across all months",
  finalCashPosition: "Cash at Launch + Σ(Monthly Profit) for Months 7-18",
  
  // Cash Flow & Balance Sheet Tab
  cashRunway: "Months until Cumulative Cash < 0 (or 18+ if always positive)",
  finalCash: "Starting Capital + Σ(Net Cash Flow) for Months 0-18",
  peakCash: "Max(Cumulative Cash) across all months",
  avgMonthlyBurn: "(Starting Capital - Final Cash) / 19 months",
  netCashFlow: "Monthly Revenue - Monthly Costs - CapEx",
  cumulativeCashPosition: "Previous Cumulative Cash + Net Cash Flow",
  
  // Revenue Components
  primaryRevenue: "Primary Members × Primary Price/Month",
  specialtyRevenue: "Specialty Visits × Specialty Price/Visit",
  corporateRevenue: "Corporate Employees × Price/Employee/Month",
  diagnosticsRevenue: "Echo Revenue + CT Revenue + Labs Revenue",
  echoRevenue: "Echo-Eligible Members × $150/visit × Utilization Rate",
  ctRevenue: "CT-Eligible Members × $300/scan × Utilization Rate",
  labsRevenue: "Active Members × $50/month × Utilization Rate",
  totalRevenue: "Primary + Specialty + Corporate + Diagnostics Revenue",
  
  // Cost Components
  salariesCost: "Σ(Physician Salaries + NP Salaries + MA Salaries + Admin Salaries)",
  physicianSalaries: "Physician Count × Base Salary/12",
  fixedOverheadCost: "Rent + Utilities + Insurance + Software + Marketing",
  variableCost: "Active Members × Supplies Cost/Member",
  equipmentLeaseCost: "Echo Lease + CT Lease (if diagnostics active)",
  totalCosts: "Salaries + Fixed Overhead + Variable + Equipment Lease",
  
  // Profitability
  monthlyProfit: "Total Revenue - Total Costs",
  profitMargin: "(Monthly Profit / Total Revenue) × 100%",
  cumulativeCash: "Previous Cash + Monthly Profit",
  
  // Physician ROI Metrics
  physicianMonthlyIncome: "Specialty Revenue Retained + MSO Equity Income",
  specialtyRetained: "Specialty Revenue × (1 - MSO Service Fee %)",
  msoEquityIncome: "MSO Net Profit × Equity Stake %",
  msoServiceFee: "Founding: 37% | Non-Founding: 40%",
  equityStake: "Founding: 10% | Non-Founding: 5%",
  physicianInvestment: "Founding: $600,000 | Non-Founding: $750,000",
  annualizedIncome: "Physician Monthly Income × 12",
  physicianROI: "(Annualized Income / Individual Investment) × 100%",
  msoROI: "(Total Profit / Total Capital Raised) × 100%",
  totalCapitalRaised: "Founding Investment + (Additional Physicians × Additional Investment)",
  equityValue: "MSO Annual Profit × Earnings Multiple × Equity Stake %",
  
  // Member Growth
  primaryMemberGrowth: "Previous Members + (Intake/Physician × Physician Count) - Churn",
  specialtyMemberGrowth: "Previous Members + (Intake/Physician × Physician Count) - Churn",
  churnCalculation: "Active Members × (Annual Churn Rate / 12)",
  
  // Corporate Contracts
  corporateEmployees: "Initial Employees + (Contracts/Month × Employees/Contract × Months Elapsed)",
  corporateContracts: "Contracts Signed/Month × Months Since Launch",
  
  // Risk Analysis
  monteCarloSimulation: "10,000 scenarios with ±20% variance on key inputs",
  p10Value: "10th percentile outcome (pessimistic)",
  p50Value: "50th percentile outcome (median/expected)",
  p90Value: "90th percentile outcome (optimistic)",
  sensitivityAnalysis: "Impact = Δ Output / Δ Input (normalized)",
  
  // Cash Flow
  operatingCashFlow: "Revenue - Operating Costs",
  investingCashFlow: "Equipment Purchases + Facility Buildout",
  financingCashFlow: "Capital Raised - Debt Payments",
  netCashFlow: "Operating + Investing + Financing Cash Flow",
  
  // Balance Sheet
  totalAssets: "Cash + Equipment + Accounts Receivable",
  totalLiabilities: "Accounts Payable + Equipment Leases",
  equity: "Total Assets - Total Liabilities",
  
  // P&L Summary
  grossRevenue: "Sum of all revenue streams",
  grossProfit: "Gross Revenue - Variable Costs",
  ebitda: "Gross Profit - Fixed Costs",
  netIncome: "EBITDA - Depreciation - Interest - Taxes",
  
  // Chart-Specific Formulas
  revenueTrajectory: "Monthly: Primary + Specialty + Corporate + Diagnostics",
  costTrajectory: "Monthly: Salaries + Overhead + Variable + Equipment",
  profitTrajectory: "Monthly: Revenue - Costs",
  cashTrajectory: "Cumulative: Starting Cash + Σ(Monthly Profit)",
  memberTrajectory: "Monthly: Active Primary + Active Specialty Members",
  
  // Breakeven Analysis
  breakevenMonth: "First month where Cumulative Cash > Starting Capital",
  breakevenMembers: "Fixed Costs / (Revenue per Member - Variable Cost per Member)",
  
  // Derived Variables
  totalPhysicians: "Founding Physicians + Additional Physicians",
  foundingPhysicians: "1 if Founding Toggle ON, 0 if OFF",
  msoNetProfit: "Total Revenue - Total Costs",
  averageRevenuePerMember: "Total Revenue / Total Active Members",
};

export type FormulaKey = keyof typeof formulas;



// Detailed Chart Formulas (Multi-line)

export const detailedFormulas = {
  rampPeriodCashFlow: `Ramp Period Cash Flow (Months 0-6):

Month 0: Starting Capital - Startup Costs
Month 1-6: Previous Cash + Revenue - Costs

Revenue = Primary + Specialty + Corporate + Diagnostics
Costs = Salaries + Fixed Overhead + Variable + Equipment Lease`,

  revenueCostsProfitability: `Revenue, Costs & Profitability (Months 7-18):

Revenue = Primary + Specialty + Corporate + Diagnostics
  Primary = Members × $500/month
  Specialty = Visits × $500/visit
  Corporate = Employees × $700/month
  Diagnostics = Echo + CT + Labs

Costs = Salaries + Overhead + Variable + Equipment
  Salaries = Physicians + NPs + MAs + Admin
  Overhead = Rent + Utilities + Insurance + Software
  Variable = Members × Supplies Cost
  Equipment = Echo Lease + CT Lease

Profit = Revenue - Costs
Profit Margin = (Profit / Revenue) × 100%`,

  cumulativeCashPosition: `Cumulative Cash Position:

Starting Cash = Capital Deployed at Launch
Monthly Change = Monthly Profit (Revenue - Costs)
Cumulative Cash = Starting Cash + Σ(Monthly Profit)

Breakeven Month = First month where Cumulative Cash > 0`,

  revenueStreamsOverTime: `Revenue Streams Over Time:

Primary Revenue = Active Members × $500/month
  Growth = Intake Rate - Churn Rate

Specialty Revenue = Specialty Visits × $500/visit
  Visits = Specialty Members × Visit Frequency

Corporate Revenue = Corporate Employees × $700/month
  Employees = Contracts × Employees per Contract

Diagnostics Revenue = Echo + CT + Labs
  Echo = Eligible Members × $150 × Utilization
  CT = Eligible Members × $300 × Utilization
  Labs = Active Members × $50 × Utilization`,

  memberGrowthTrajectory: `Member Growth Trajectory:

Primary Members (Month N) = 
  Primary Members (Month N-1) +
  New Members -
  Churned Members

New Members = Intake Rate × Physician Count
Churned Members = Active Members × (Churn Rate / 12)

Specialty Members follow similar pattern with specialty intake rates`,

  monthlyCostStructure: `Monthly Cost Structure:

Salaries = 
  Physicians × $250k/year / 12 +
  NPs × $120k/year / 12 +
  MAs × $45k/year / 12 +
  Admin × $60k/year / 12

Fixed Overhead = $65,000/month
  (Rent, Utilities, Insurance, Software, etc.)

Marketing = Variable based on growth phase

Equipment Lease = 
  Echo: $3,000/month +
  CT: $2,000/month (if diagnostics active)

Variable Costs = Active Members × $25/member`,

  memberAcquisitionRetention: `Member Acquisition & Retention:

New Members = Intake Rate × Physician Count
Churned Members = Active Members × (Annual Churn / 12)
Net Growth = New Members - Churned Members

Revenue per Member = Total Revenue / Total Active Members`,

  physicianIncomeBreakdown: `Physician Income Breakdown:

Specialty Revenue Retained = 
  Specialty Revenue × (1 - MSO Service Fee%)
  Founding: 63% retained (37% to MSO)
  Non-Founding: 60% retained (40% to MSO)

MSO Equity Income = 
  MSO Net Profit × Equity Stake%
  Founding: 10% equity
  Non-Founding: 5% equity

Total Monthly Income = 
  Specialty Retained + MSO Equity Income`,

  incomeDiversityByStream: `Income Diversity by Revenue Stream:

Physician receives income from:

1. Specialty Care (Direct):
   Specialty Revenue × (1 - MSO Fee%)

2. Primary Care (Equity Share):
   Primary Revenue → MSO Profit × Equity%

3. Corporate Wellness (Equity Share):
   Corporate Revenue → MSO Profit × Equity%

4. Diagnostics (Equity Share):
   Diagnostics Revenue → MSO Profit × Equity%`,

  equityValuationScenarios: `Equity Valuation at Exit:

MSO Annual Profit = Monthly Profit × 12

Equity Value = 
  MSO Annual Profit × 
  Earnings Multiple × 
  Equity Stake%

Earnings Multiples:
  2X = Conservative (early stage)
  3X = Standard MSO valuation
  4X = Healthcare industry average
  5X = Integrated platform premium
  6X = Premium exit (strategic buyer)`,

  monteCarloDistribution: `Monte Carlo Simulation (10,000 scenarios):

Randomized Inputs (±20% variance):
  - Primary Intake Rate
  - Specialty Intake Rate
  - Primary Price
  - Specialty Price
  - Corporate Contract Sales
  - Churn Rate
  - Fixed Overhead
  - Variable Costs

Output Distribution:
  P10 = 10th percentile (pessimistic)
  P50 = 50th percentile (expected)
  P90 = 90th percentile (optimistic)`,

  sensitivityTornado: `Sensitivity Analysis (Tornado Chart):

Impact = (High Case - Low Case) / Base Case

Ranked by absolute impact on 12-month profit:
  1. Primary Intake Rate (±20%)
  2. Primary Price (±20%)
  3. Specialty Intake Rate (±20%)
  4. Fixed Overhead (±20%)
  5. Churn Rate (±20%)
  6. Corporate Contract Sales (±20%)
  7. Variable Costs (±20%)
  8. Specialty Price (±20%)`,

  riskHeatmap: `Risk Heatmap (Member Count vs Pricing):

Member Count Range: 50 - 500
Primary Price Range: $300 - $800

For each combination:
  Revenue = Members × Price
  Costs = Fixed + (Members × Variable)
  Profit = Revenue - Costs

Color Coding:
  Red = Negative profit (loss)
  Orange = 0-20% profit margin
  Yellow = 20-30% profit margin
  Green = 30%+ profit margin`,

  scenarioComparison: `Scenario Comparison:

Conservative (Null):
  - 0 additional physicians
  - 0 initial members
  - Lower pricing
  - Higher costs

Base (Current):
  - Current input values
  - Expected growth rates

Moderate (Optimistic):
  - 4 additional physicians
  - Higher intake rates
  - Higher pricing
  - Lower churn`,
  
  incomeDiversity: `For each revenue stream:
• Specialty: Physician keeps (100 - Service Fee)% directly
• Primary/Diagnostics/Corporate: Physician receives Equity Stake% of profit

Physician Profit = Revenue Stream × Profit Margin × Equity Stake%`,
};

