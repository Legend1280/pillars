// Dashboard data types and mock data

export interface DashboardInputs {
  foundingPhysician: {
    enabled: boolean;
    serviceFee: number;
    equityStake: number;
  };
  monthlyGrowth: {
    newDexafitMembers: number;
    newCorporateContracts: number;
    conversionToSpecialty: number;
  };
  primaryCare: {
    membershipFee: number;
    startingMembers: number;
  };
  specialtyCare: {
    avgVisitFee: number;
    visitsPerMember: number;
  };
  diagnostics: {
    dexaScanFee: number;
    scansPerMonth: number;
  };
  corporate: {
    avgContractValue: number;
    contractsPerMonth: number;
  };
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
  msoTotalRevenue: number;
  msoNetProfit: number;
  physicianIncome: number;
  physicianROI: number;
  physicianMSOIncome: number;
}

// Default inputs matching the reference dashboard
export const defaultInputs: DashboardInputs = {
  foundingPhysician: {
    enabled: true,
    serviceFee: 37,
    equityStake: 10,
  },
  monthlyGrowth: {
    newDexafitMembers: 25,
    newCorporateContracts: 1,
    conversionToSpecialty: 10.0,
  },
  primaryCare: {
    membershipFee: 150,
    startingMembers: 100,
  },
  specialtyCare: {
    avgVisitFee: 350,
    visitsPerMember: 2,
  },
  diagnostics: {
    dexaScanFee: 125,
    scansPerMonth: 400,
  },
  corporate: {
    avgContractValue: 25000,
    contractsPerMonth: 1,
  },
};

// Mock 12-month projection data
export const mockMonthlyProjections: MonthlyProjection[] = [
  { month: 1, primaryRevenue: 150000, specialtyRevenue: 45000, diagnosticsRevenue: 50000, corporateRevenue: 25000, totalRevenue: 270000, totalCosts: 180000, netProfit: 90000 },
  { month: 2, primaryRevenue: 165000, specialtyRevenue: 52000, diagnosticsRevenue: 52000, corporateRevenue: 25000, totalRevenue: 294000, totalCosts: 185000, netProfit: 109000 },
  { month: 3, primaryRevenue: 180000, specialtyRevenue: 60000, diagnosticsRevenue: 54000, corporateRevenue: 50000, totalRevenue: 344000, totalCosts: 190000, netProfit: 154000 },
  { month: 4, primaryRevenue: 195000, specialtyRevenue: 68000, diagnosticsRevenue: 56000, corporateRevenue: 50000, totalRevenue: 369000, totalCosts: 195000, netProfit: 174000 },
  { month: 5, primaryRevenue: 210000, specialtyRevenue: 77000, diagnosticsRevenue: 58000, corporateRevenue: 75000, totalRevenue: 420000, totalCosts: 200000, netProfit: 220000 },
  { month: 6, primaryRevenue: 225000, specialtyRevenue: 86000, diagnosticsRevenue: 60000, corporateRevenue: 75000, totalRevenue: 446000, totalCosts: 205000, netProfit: 241000 },
  { month: 7, primaryRevenue: 240000, specialtyRevenue: 96000, diagnosticsRevenue: 62000, corporateRevenue: 100000, totalRevenue: 498000, totalCosts: 210000, netProfit: 288000 },
  { month: 8, primaryRevenue: 255000, specialtyRevenue: 106000, diagnosticsRevenue: 64000, corporateRevenue: 100000, totalRevenue: 525000, totalCosts: 215000, netProfit: 310000 },
  { month: 9, primaryRevenue: 270000, specialtyRevenue: 117000, diagnosticsRevenue: 66000, corporateRevenue: 125000, totalRevenue: 578000, totalCosts: 220000, netProfit: 358000 },
  { month: 10, primaryRevenue: 285000, specialtyRevenue: 128000, diagnosticsRevenue: 68000, corporateRevenue: 125000, totalRevenue: 606000, totalCosts: 225000, netProfit: 381000 },
  { month: 11, primaryRevenue: 300000, specialtyRevenue: 140000, diagnosticsRevenue: 70000, corporateRevenue: 150000, totalRevenue: 660000, totalCosts: 230000, netProfit: 430000 },
  { month: 12, primaryRevenue: 315000, specialtyRevenue: 152000, diagnosticsRevenue: 72000, corporateRevenue: 150000, totalRevenue: 689000, totalCosts: 235000, netProfit: 454000 },
];

// Calculate KPI metrics from monthly projections
export function calculateKPIs(projections: MonthlyProjection[], inputs: DashboardInputs): KPIMetrics {
  const month12 = projections[11]; // Last month
  const msoTotalRevenue = month12.totalRevenue;
  const msoNetProfit = month12.netProfit;
  
  // Physician calculations
  const specialtyRetained = month12.specialtyRevenue * (1 - inputs.foundingPhysician.serviceFee / 100);
  const equityIncome = msoNetProfit * (inputs.foundingPhysician.equityStake / 100);
  const physicianIncome = specialtyRetained + equityIncome;
  const physicianMSOIncome = equityIncome;
  
  // ROI calculation (annualized income / investment)
  const investment = 600000; // Founding physician investment
  const annualizedIncome = physicianIncome * 12;
  const physicianROI = (annualizedIncome / investment) * 100;
  
  return {
    msoTotalRevenue,
    msoNetProfit,
    physicianIncome,
    physicianROI,
    physicianMSOIncome,
  };
}

// Calculate physician metrics
export function calculatePhysicianMetrics(projections: MonthlyProjection[], inputs: DashboardInputs): PhysicianMetrics {
  const month12 = projections[11];
  const investment = 600000;
  
  const specialtyRetained = month12.specialtyRevenue * (1 - inputs.foundingPhysician.serviceFee / 100);
  const equityIncome = month12.netProfit * (inputs.foundingPhysician.equityStake / 100);
  const monthlyIncome = specialtyRetained + equityIncome;
  const annualizedIncome = monthlyIncome * 12;
  const roi = (annualizedIncome / investment) * 100;
  
  return {
    type: 'Founding',
    position: '1 of 4',
    investment,
    equityStake: inputs.foundingPhysician.equityStake,
    serviceFee: inputs.foundingPhysician.serviceFee,
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
  { id: 'inputs', title: 'Inputs & Scenarios', icon: 'Settings', description: 'Baseline drivers and assumptions' },
  { id: 'revenues', title: 'Revenues', icon: 'DollarSign', description: 'Revenue streams and growth' },
  { id: 'diagnostics', title: 'Diagnostics', icon: 'Activity', description: 'Diagnostic services modeling' },
  { id: 'costs', title: 'Costs', icon: 'TrendingDown', description: 'Build-out and operational costs' },
  { id: 'staffing', title: 'Staffing', icon: 'Users', description: 'Roles, salaries, and timing' },
  { id: 'summary', title: 'Financial Summary', icon: 'FileText', description: 'P&L, ROI, and capital analysis' },
  { id: 'risk', title: 'Risk & Sensitivity', icon: 'AlertTriangle', description: 'Scenario testing and variance' },
  { id: 'export', title: 'Export', icon: 'Download', description: 'Generate reports and summaries' },
];

