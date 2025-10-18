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
  physicianROI: "(Annualized Income / Investment) × 100%",
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

