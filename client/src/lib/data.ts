// Dashboard data types and schema (v1.0.0)

export interface DashboardInputs {
  // Scenario Mode
  scenarioMode: 'conservative' | 'moderate' | 'aggressive';
  foundingToggle: boolean; // ON = 37% MSO / 10% Equity, OFF = 40% / 5%
  
  // Physician Group
  physiciansLaunch: number; // 1-10, default 3
  additionalPhysicians: number; // 0-7, default 0
  
  // Primary Growth Inputs
  primaryInitPerPhysician: number; // 0-250, default 50
  primaryIntakeMonthly: number; // 25-200, default 25
  churnPrimary: number; // 0-20%, default 8%
  conversionPrimaryToSpecialty: number; // 0-25%, default 10%
  
  // Specialty Inputs
  specialtyInitPerPhysician: number; // 0-150, default 75
  
  // Carry-Over & Peer Volume (NEW in v1.1)
  physicianPrimaryCarryover: number; // 0-150, default 0
  physicianSpecialtyCarryover: number; // 0-150, default 0
  teamSpecialtyMultiplier: number; // 0-3.0, default 1.0
  
  // Corporate Inputs
  corporateContractsMonthly: number; // 0-10, default 1
  corpEmployeesPerContract: number; // 5-100, default 30
  corpPricePerEmployeeMonth: number; // $500-$2500, default $700
  
  // Pricing
  primaryPrice: number; // $400-$600, default $500
  specialtyPrice: number; // $400-$800, default $500
  
  // Global Modifiers
  inflationRate: number; // 0-10%, default 2%
  randomSeed: number; // For Monte Carlo
}

export interface MonthlyProjection {
  month: number;
  primaryRevenue: number;
  specialtyRevenue: number;
  diagnosticsRevenue: number;
  corporateRevenue: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  activePrimaryMembers: number;
  activeSpecialtyVisits: number;
  activeCorporateContracts: number;
}

export interface PhysicianMetrics {
  type: string;
  position: string;
  investment: number;
  equityStake: number;
  serviceFee: number;
  specialtyRetained: number;
  equityIncome: number;
  monthlyIncome: number;
  annualizedIncome: number;
  roi: number;
}

export interface KPIMetrics {
  totalRevenue12Mo: number;
  msoNetProfit: number;
  physicianROI: number;
  activeMembers: number;
}

// Default inputs (Moderate scenario baseline)
export const defaultInputs: DashboardInputs = {
  scenarioMode: 'moderate',
  foundingToggle: true, // 37% MSO / 10% Equity
  
  physiciansLaunch: 3,
  additionalPhysicians: 0,
  
  primaryInitPerPhysician: 50,
  primaryIntakeMonthly: 25,
  churnPrimary: 8,
  conversionPrimaryToSpecialty: 10,
  
  specialtyInitPerPhysician: 75,
  
  physicianPrimaryCarryover: 0,
  physicianSpecialtyCarryover: 0,
  teamSpecialtyMultiplier: 1.0,
  
  corporateContractsMonthly: 1,
  corpEmployeesPerContract: 30,
  corpPricePerEmployeeMonth: 700,
  
  primaryPrice: 500,
  specialtyPrice: 500,
  
  inflationRate: 2,
  randomSeed: 42,
};

// Scenario presets (placeholder - to be defined later)
export const scenarioPresets: Record<string, Partial<DashboardInputs>> = {
  conservative: {
    // To be defined with specific values
  },
  moderate: defaultInputs,
  aggressive: {
    // To be defined with specific values
  },
};

// Calculate capital from physicians
export function calculateCapitalFromPhysicians(inputs: DashboardInputs): number {
  const foundingCount = inputs.physiciansLaunch;
  const additionalCount = inputs.additionalPhysicians;
  return (foundingCount * 600000) + (additionalCount * 750000);
}

// Mock 12-month projection data (will be replaced with calculation engine)
export const mockMonthlyProjections: MonthlyProjection[] = [
  { month: 1, primaryRevenue: 150000, specialtyRevenue: 45000, diagnosticsRevenue: 50000, corporateRevenue: 25000, totalRevenue: 270000, totalCosts: 180000, netProfit: 90000, activePrimaryMembers: 150, activeSpecialtyVisits: 90, activeCorporateContracts: 1 },
  { month: 2, primaryRevenue: 165000, specialtyRevenue: 52000, diagnosticsRevenue: 52000, corporateRevenue: 25000, totalRevenue: 294000, totalCosts: 185000, netProfit: 109000, activePrimaryMembers: 175, activeSpecialtyVisits: 104, activeCorporateContracts: 1 },
  { month: 3, primaryRevenue: 180000, specialtyRevenue: 60000, diagnosticsRevenue: 54000, corporateRevenue: 50000, totalRevenue: 344000, totalCosts: 190000, netProfit: 154000, activePrimaryMembers: 200, activeSpecialtyVisits: 120, activeCorporateContracts: 2 },
  { month: 4, primaryRevenue: 195000, specialtyRevenue: 68000, diagnosticsRevenue: 56000, corporateRevenue: 50000, totalRevenue: 369000, totalCosts: 195000, netProfit: 174000, activePrimaryMembers: 225, activeSpecialtyVisits: 136, activeCorporateContracts: 2 },
  { month: 5, primaryRevenue: 210000, specialtyRevenue: 77000, diagnosticsRevenue: 58000, corporateRevenue: 75000, totalRevenue: 420000, totalCosts: 200000, netProfit: 220000, activePrimaryMembers: 250, activeSpecialtyVisits: 154, activeCorporateContracts: 3 },
  { month: 6, primaryRevenue: 225000, specialtyRevenue: 86000, diagnosticsRevenue: 60000, corporateRevenue: 75000, totalRevenue: 446000, totalCosts: 205000, netProfit: 241000, activePrimaryMembers: 275, activeSpecialtyVisits: 172, activeCorporateContracts: 3 },
  { month: 7, primaryRevenue: 240000, specialtyRevenue: 96000, diagnosticsRevenue: 62000, corporateRevenue: 100000, totalRevenue: 498000, totalCosts: 210000, netProfit: 288000, activePrimaryMembers: 300, activeSpecialtyVisits: 192, activeCorporateContracts: 4 },
  { month: 8, primaryRevenue: 255000, specialtyRevenue: 106000, diagnosticsRevenue: 64000, corporateRevenue: 100000, totalRevenue: 525000, totalCosts: 215000, netProfit: 310000, activePrimaryMembers: 325, activeSpecialtyVisits: 212, activeCorporateContracts: 4 },
  { month: 9, primaryRevenue: 270000, specialtyRevenue: 117000, diagnosticsRevenue: 66000, corporateRevenue: 125000, totalRevenue: 578000, totalCosts: 220000, netProfit: 358000, activePrimaryMembers: 350, activeSpecialtyVisits: 234, activeCorporateContracts: 5 },
  { month: 10, primaryRevenue: 285000, specialtyRevenue: 128000, diagnosticsRevenue: 68000, corporateRevenue: 125000, totalRevenue: 606000, totalCosts: 225000, netProfit: 381000, activePrimaryMembers: 375, activeSpecialtyVisits: 256, activeCorporateContracts: 5 },
  { month: 11, primaryRevenue: 300000, specialtyRevenue: 140000, diagnosticsRevenue: 70000, corporateRevenue: 150000, totalRevenue: 660000, totalCosts: 230000, netProfit: 430000, activePrimaryMembers: 400, activeSpecialtyVisits: 280, activeCorporateContracts: 6 },
  { month: 12, primaryRevenue: 315000, specialtyRevenue: 152000, diagnosticsRevenue: 72000, corporateRevenue: 150000, totalRevenue: 689000, totalCosts: 235000, netProfit: 454000, activePrimaryMembers: 425, activeSpecialtyVisits: 304, activeCorporateContracts: 6 },
];

// Calculate KPI metrics from monthly projections
export function calculateKPIs(projections: MonthlyProjection[], inputs: DashboardInputs): KPIMetrics {
  const month12 = projections[11]; // Last month
  const totalRevenue12Mo = month12.totalRevenue;
  const msoNetProfit = month12.netProfit;
  
  // Physician ROI calculation
  const serviceFee = inputs.foundingToggle ? 37 : 40;
  const equityStake = inputs.foundingToggle ? 10 : 5;
  const investment = 600000; // Founding physician investment
  
  const specialtyRetained = month12.specialtyRevenue * (1 - serviceFee / 100);
  const equityIncome = msoNetProfit * (equityStake / 100);
  const physicianIncome = specialtyRetained + equityIncome;
  const annualizedIncome = physicianIncome * 12;
  const physicianROI = (annualizedIncome / investment) * 100;
  
  return {
    totalRevenue12Mo,
    msoNetProfit,
    physicianROI,
    activeMembers: month12.activePrimaryMembers,
  };
}

// Calculate physician metrics
export function calculatePhysicianMetrics(projections: MonthlyProjection[], inputs: DashboardInputs): PhysicianMetrics {
  const month12 = projections[11];
  const investment = 600000;
  
  const serviceFee = inputs.foundingToggle ? 37 : 40;
  const equityStake = inputs.foundingToggle ? 10 : 5;
  
  const specialtyRetained = month12.specialtyRevenue * (1 - serviceFee / 100);
  const equityIncome = month12.netProfit * (equityStake / 100);
  const monthlyIncome = specialtyRetained + equityIncome;
  const annualizedIncome = monthlyIncome * 12;
  const roi = (annualizedIncome / investment) * 100;
  
  return {
    type: 'Founding',
    position: '1 of 4',
    investment,
    equityStake,
    serviceFee,
    specialtyRetained,
    equityIncome,
    monthlyIncome,
    annualizedIncome,
    roi,
  };
}

// Section navigation
export interface DashboardSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export const dashboardSections: DashboardSection[] = [
  { id: 'inputs', title: 'Inputs & Scenarios', icon: 'Settings', description: 'Define all base assumptions — growth, pricing, churn, scenario mode' },
  { id: 'revenues', title: 'Revenues', icon: 'DollarSign', description: 'Primary Care, Specialty Care, and Corporate revenue streams' },
  { id: 'diagnostics', title: 'Diagnostics', icon: 'Activity', description: 'Imaging, lab, echo, and CT projections' },
  { id: 'costs', title: 'Costs', icon: 'TrendingDown', description: 'Initial, fixed, and variable cost inputs' },
  { id: 'staffing', title: 'Staffing', icon: 'Users', description: 'Role-based salary, FTE timelines, and onboarding months' },
  { id: 'growth', title: 'Growth', icon: 'TrendingUp', description: 'Cumulative membership, contract, and diagnostic expansion' },
  { id: 'risk', title: 'Risk', icon: 'AlertTriangle', description: 'Monte Carlo variability and sensitivity analysis' },
];

// Top header tabs
export interface HeaderTab {
  id: string;
  title: string;
}

export const headerTabs: HeaderTab[] = [
  { id: '12-month', title: '12-Month Projection' },
  { id: 'ramp', title: 'Ramp & Launch' },
  { id: 'risk-analysis', title: 'Risk Analysis' },
  { id: 'pl-summary', title: 'P&L Summary' },
];

