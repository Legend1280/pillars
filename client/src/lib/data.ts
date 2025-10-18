// Dashboard data types and schema (v1.0.0)

export interface DashboardInputs {
  // Scenario Mode
  scenarioMode: 'null' | 'conservative' | 'moderate';
  foundingToggle: boolean; // ON = 37% MSO / 10% Equity, OFF = 40% / 5%
  
  // Physician Group
  // physiciansLaunch is now DERIVED from foundingToggle (1 if true, 0 if false)
  additionalPhysicians: number; // 0-7, default 0
  
  // Primary Growth Inputs
  primaryInitPerPhysician: number; // 0-250, default 50
  primaryIntakeMonthly: number; // 25-200, default 25
  churnPrimary: number; // 0-20%, default 8%
  conversionPrimaryToSpecialty: number; // 0-25%, default 10%
  
  // Specialty Inputs
  specialtyInitPerPhysician: number; // 0-150, default 75
  
  // Carry-Over & Peer Volume (NEW in v1.1)
  physicianPrimaryCarryover: number; // 0-150, default 25
  physicianSpecialtyCarryover: number; // 0-150, default 40
  otherPhysiciansPrimaryCarryoverPerPhysician: number; // 25-100, default 25
  otherPhysiciansSpecialtyCarryoverPerPhysician: number; // 40-100, default 40
  
  // Corporate Inputs
  initialCorporateClients: number; // 0-10, default 0 (initial stock)
  corporateContractsMonthly: number; // 0-10, default 1
  corpInitialClients: number; // 0-500, default 36 (initial corporate wellness clients at launch)
  corpPricePerEmployeeMonth: number; // $500-$2500, default $700
  
  // Pricing
  primaryPrice: number; // $400-$600, default $500
  specialtyPrice: number; // $400-$800, default $500
  
  // Global Modifiers
  inflationRate: number; // 0-10%, default 2%
  randomSeed: number; // For Monte Carlo
  
  // Section 3: Diagnostics
  diagnosticsActive: boolean; // ON/OFF toggle
  echoStartMonth: number; // 1-6, default 1
  echoPrice: number; // $200-$800, default $500
  echoVolumeMonthly: number; // 0-300, default 100
  ctStartMonth: number; // 1-12, default 1
  ctPrice: number; // $400-$1200, default $800
  ctVolumeMonthly: number; // 0-150, default 40
  labTestsPrice: number; // $100-$300, default $200
  labTestsMonthly: number; // 0-500, default 100
  diagnosticsMargin: number; // 50-65%, default 50%
  
  // Section 4: Costs - Capital Expenditures
  capexBuildoutCost: number; // Buildout budget (one-time)
  officeEquipment: number; // Office equipment (one-time)
  
  // Section 4: Costs - Startup Costs
  splitStartupAcrossTwoMonths: boolean; // Split startup costs across months 0-1
  startupLegal: number; // Legal & formation costs
  startupHr: number; // HR & recruiting costs
  startupTraining: number; // Training & certification costs
  startupTechnology: number; // Technology setup costs (EHR, network, licenses)
  startupPermits: number; // Permits & licenses costs
  startupInventory: number; // Initial inventory & medical supplies
  startupInsurance: number; // Insurance (malpractice, liability, property - first year/deposits)
  startupMarketing: number; // Pre-launch marketing (brand, website, campaigns)
  startupProfessionalFees: number; // Professional fees (consultants, accountants, architects)
  startupOther: number; // Other startup costs & contingency
  
  // Section 4: Costs - Operating Costs
  fixedOverheadMonthly: number; // Fixed overhead per month
  equipmentLease: number; // Equipment lease per month (CT & Echo)
  marketingBudgetMonthly: number; // Marketing budget per month
  variableCostPct: number; // Variable cost % of revenue
  
  // Section 5: Staffing
  founderChiefStrategistSalary: number; // Annual salary for founder/chief strategist
  directorOperationsSalary: number; // Annual salary for Director of Operations
  gmHourlyRate: number; // Hourly rate for General Manager
  gmWeeklyHours: number; // Weekly hours for General Manager
  fractionalCfoCost: number; // Monthly retainer for fractional CFO
  eventSalespersonCost: number; // Monthly cost for event planner/sales
  np1StartMonth: number; // Month when NP #1 starts (1-6)
  np1Salary: number; // Annual salary for NP #1
  np2StartMonth: number; // Month when NP #2 starts (1-12)
  np2Salary: number; // Annual salary for NP #2
  adminSupportRatio: number; // Admin/support staff per physician (0.5-2)
  avgAdminSalary: number; // Average annual salary per admin/support staff
  
  // Section 6: Growth Drivers
  dexafitPrimaryIntakeMonthly: number; // 0-200, default 25 - New primary members from DexaFit per month
  corporateContractSalesMonthly: number; // 0-10, default 1 - New corporate contracts per month
  employeesPerContract: number; // 10-100, default 30 - Average employees per corporate contract
  primaryToSpecialtyConversion: number; // 5-15%, default 10% - Conversion rate from primary to specialty
  diagnosticsExpansionRate: number; // 5-20%, default 10% - Monthly growth rate for diagnostics
  
  // Section 7: Ramp to Launch (NEW in v1.4.0)
  rampDuration: number; // 3-9 months, default 6 - Length of ramp phase
  corporateStartMonth: number; // 1-6, default 3 - Month corporate contracts begin
  rampPrimaryIntakeMonthly: number; // 0-50, default 20 - Primary intake during ramp phase
  // rampStartupCost is now derived from sum of startup line items
  // Hiring schedule
  directorOpsStartMonth: number; // 1-6, default 1
  gmStartMonth: number; // 1-6, default 2
  fractionalCfoStartMonth: number; // 1-6, default 4
  eventPlannerStartMonth: number; // 1-6, default 5
  // Equipment lease derived costs
  ctLeaseCost: number; // $5000/month - derived from CT start
  echoLeaseCost: number; // $2000/month - derived from Echo start
  totalEquipmentLease: number; // Sum of CT + Echo leases
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

// Default inputs (Conservative scenario baseline)
export const defaultInputs: DashboardInputs = {
  scenarioMode: 'conservative',
  foundingToggle: true, // 37% MSO / 10% Equity
  
  // physiciansLaunch is now derived from foundingToggle (1 if true, 0 if false)
  additionalPhysicians: 3,
  
  primaryInitPerPhysician: 50,
  primaryIntakeMonthly: 25,
  churnPrimary: 8,
  conversionPrimaryToSpecialty: 10,
  
  specialtyInitPerPhysician: 75,
  
  physicianPrimaryCarryover: 25,
  physicianSpecialtyCarryover: 40,
  otherPhysiciansPrimaryCarryoverPerPhysician: 25,
  otherPhysiciansSpecialtyCarryoverPerPhysician: 40,
  
  initialCorporateClients: 0,
  corporateContractsMonthly: 1,
  corpInitialClients: 36,
  corpPricePerEmployeeMonth: 700,
  
  primaryPrice: 500,
  specialtyPrice: 500,
  
  inflationRate: 2,
  randomSeed: 42,
  
  // Section 3: Diagnostics
  diagnosticsActive: true,
  echoStartMonth: 2,
  echoPrice: 500,
  echoVolumeMonthly: 100,
  ctStartMonth: 6,
  ctPrice: 800,
  ctVolumeMonthly: 40,
  labTestsPrice: 200,
  labTestsMonthly: 100,
  diagnosticsMargin: 50,
  
  // Section 4: Costs - Capital Expenditures
  capexBuildoutCost: 150000,
  officeEquipment: 25000,
  
  // Section 4: Costs - Startup Costs
  splitStartupAcrossTwoMonths: true,
  startupLegal: 35000,
  startupHr: 10000,
  startupTraining: 15000,
  startupTechnology: 20000,
  startupPermits: 5000,
  startupInventory: 15000,
  startupInsurance: 45000,
  startupMarketing: 35000,
  startupProfessionalFees: 25000,
  startupOther: 20000,
  
  // Section 4: Costs - Operating Costs
  fixedOverheadMonthly: 65000,
  equipmentLease: 7000,
  marketingBudgetMonthly: 35000,
  variableCostPct: 30,
  
  // Section 5: Staffing
  founderChiefStrategistSalary: 150000,
  directorOperationsSalary: 150000,
  gmHourlyRate: 50,
  gmWeeklyHours: 30,
  fractionalCfoCost: 5000,
  eventSalespersonCost: 3000,
  np1StartMonth: 3,
  np1Salary: 120000,
  np2StartMonth: 5,
  np2Salary: 120000,
  adminSupportRatio: 1,
  avgAdminSalary: 50000,
  
  // Section 6: Growth Drivers
  dexafitPrimaryIntakeMonthly: 25,
  corporateContractSalesMonthly: 1,
  employeesPerContract: 30,
  primaryToSpecialtyConversion: 10,
  diagnosticsExpansionRate: 10,
  
  // Section 7: Ramp to Launch
  rampDuration: 6,
  corporateStartMonth: 3,
  rampPrimaryIntakeMonthly: 20,
  // rampStartupCost removed - now derived
  directorOpsStartMonth: 1,
  gmStartMonth: 2,
  fractionalCfoStartMonth: 4,
  eventPlannerStartMonth: 5,
  ctLeaseCost: 5000,
  echoLeaseCost: 2000,
  totalEquipmentLease: 7000,
};

// Derived variables interface
export interface DerivedVariables {
  // Physician metrics
  otherPhysiciansCount: number;
  teamPrimaryMembers: number;
  teamSpecialtyClients: number;
  totalPhysicians: number;       // Total physicians (founding + additional)
  
  // Physician terms (dynamic based on founding status)
  msoFee: number;                // MSO fee percentage (37% or 40%)
  equityShare: number;           // Equity percentage (10% or 5%)
  myCapitalContribution: number; // Personal capital investment ($600k or $750k)
  
  // Retention metrics
  retentionRate: number;         // Member retention rate (100% - churn)
  
  // Cost metrics (calculated from inputs)
  startupTotal: number;          // Total startup costs
  startupMonth0: number;         // Startup costs allocated to Month 0
  startupMonth1: number;         // Startup costs allocated to Month 1
  capexMonth0: number;           // Total CapEx outlay in Month 0
  fixedCostMonthly: number;      // Fixed overhead + marketing
  totalEquipmentLease: number;   // CT + Echo lease costs
  
  // Capital metrics
  capitalRaised: number;         // Total capital raised based on physician count
  totalInvestment: number;       // CapEx + Office Equipment + Startup Costs
}

// Calculate derived variables from inputs
export function calculateDerivedVariables(inputs: DashboardInputs): DerivedVariables {
  // Physician metrics
  const otherPhysiciansCount = inputs.additionalPhysicians;
  const teamPrimaryMembers = otherPhysiciansCount * inputs.otherPhysiciansPrimaryCarryoverPerPhysician;
  const teamSpecialtyClients = otherPhysiciansCount * inputs.otherPhysiciansSpecialtyCarryoverPerPhysician;
  
  // physiciansLaunch is always 1 if foundingToggle is true, 0 otherwise
  const physiciansLaunch = inputs.foundingToggle ? 1 : 0;
  const totalPhysicians = physiciansLaunch + inputs.additionalPhysicians;
  
  // Physician terms (dynamic based on founding status)
  const msoFee = inputs.foundingToggle ? 37 : 40;
  const equityShare = inputs.foundingToggle ? 10 : 5;
  const myCapitalContribution = inputs.foundingToggle ? 600000 : 750000;
  
  // Retention metrics
  const retentionRate = 100 - inputs.churnPrimary;
  
  // Startup cost calculations - sum all startup line items
  const startupTotal = inputs.startupLegal + inputs.startupHr + inputs.startupTraining + 
                       inputs.startupTechnology + inputs.startupPermits + inputs.startupInventory +
                       inputs.startupInsurance + inputs.startupMarketing + inputs.startupProfessionalFees +
                       inputs.startupOther;
  const startupMonth0 = inputs.splitStartupAcrossTwoMonths ? startupTotal / 2 : startupTotal;
  const startupMonth1 = inputs.splitStartupAcrossTwoMonths ? startupTotal / 2 : 0;
  
  // CapEx calculations
  const capexMonth0 = inputs.capexBuildoutCost + inputs.officeEquipment;
  
  // Fixed cost calculations
  const fixedCostMonthly = inputs.fixedOverheadMonthly + inputs.marketingBudgetMonthly;
  
  // Equipment lease total
  const totalEquipmentLease = inputs.ctLeaseCost + inputs.echoLeaseCost;
  
  // Capital calculations
  // Formula: Founding physician(s) at $600k each, additional physicians at $750k each
  const capitalRaised = (physiciansLaunch * 600000) + (inputs.additionalPhysicians * 750000);
  
  // Total investment calculation
  const totalInvestment = capexMonth0 + startupTotal;
  
  return {
    otherPhysiciansCount,
    teamPrimaryMembers,
    teamSpecialtyClients,
    totalPhysicians,
    msoFee,
    equityShare,
    myCapitalContribution,
    retentionRate,
    startupTotal,
    startupMonth0,
    startupMonth1,
    capexMonth0,
    fixedCostMonthly,
    totalEquipmentLease,
    capitalRaised,
    totalInvestment,
  };
}

// Null scenario preset (all values at zero or base defaults)
export const nullScenario: Partial<DashboardInputs> = {
  // physiciansLaunch is now derived from foundingToggle
  additionalPhysicians: 0,
  primaryInitPerPhysician: 0,
  primaryIntakeMonthly: 0,
  churnPrimary: 0,
  conversionPrimaryToSpecialty: 0,
  specialtyInitPerPhysician: 0,
  physicianPrimaryCarryover: 0,
  physicianSpecialtyCarryover: 0,
  otherPhysiciansPrimaryCarryoverPerPhysician: 25,
  otherPhysiciansSpecialtyCarryoverPerPhysician: 40,
  initialCorporateClients: 0,
  corporateContractsMonthly: 0,
  corpInitialClients: 0,
  corpPricePerEmployeeMonth: 500,
  primaryPrice: 400,
  specialtyPrice: 400,
  inflationRate: 0,
  diagnosticsActive: false,
  echoStartMonth: 1,
  echoPrice: 200,
  echoVolumeMonthly: 0,
  ctStartMonth: 1,
  ctPrice: 400,
  ctVolumeMonthly: 0,
  labTestsPrice: 100,
  labTestsMonthly: 0,
  diagnosticsMargin: 50,
  
  // Costs - Capital Expenditures
  capexBuildoutCost: 0,
  officeEquipment: 15000,
  
  // Costs - Startup Costs
  splitStartupAcrossTwoMonths: false,
  startupLegal: 0,
  startupHr: 0,
  startupTraining: 0,
  startupTechnology: 0,
  startupPermits: 0,
  startupInventory: 10000,
  startupInsurance: 30000,
  startupMarketing: 20000,
  startupProfessionalFees: 15000,
  startupOther: 10000,
  
  // Costs - Operating Costs
  fixedOverheadMonthly: 80000,
  equipmentLease: 10000,
  marketingBudgetMonthly: 25000,
  variableCostPct: 10,
  
  // Staffing
  founderChiefStrategistSalary: 0,
  directorOperationsSalary: 0,
  gmHourlyRate: 0,
  gmWeeklyHours: 0,
  fractionalCfoCost: 0,
  eventSalespersonCost: 0,
  np1StartMonth: 1,
  np1Salary: 0,
  np2StartMonth: 6,
  np2Salary: 0,
  adminSupportRatio: 0,
  avgAdminSalary: 0,
  
  // Growth Drivers
  dexafitPrimaryIntakeMonthly: 0,
  corporateContractSalesMonthly: 0,
  employeesPerContract: 10,
  primaryToSpecialtyConversion: 5,
  diagnosticsExpansionRate: 5,
  
  // Ramp to Launch
  rampDuration: 6,
  corporateStartMonth: 6,
  rampPrimaryIntakeMonthly: 0,
  // rampStartupCost removed - now derived
  directorOpsStartMonth: 1,
  gmStartMonth: 6,
  fractionalCfoStartMonth: 6,
  eventPlannerStartMonth: 6,
  ctLeaseCost: 5000,
  echoLeaseCost: 2000,
  totalEquipmentLease: 7000,
};

// Moderate scenario preset (more optimistic assumptions)
export const moderateScenario: Partial<DashboardInputs> = {
  // physiciansLaunch is now derived from foundingToggle
  additionalPhysicians: 4,
  primaryInitPerPhysician: 75,
  primaryIntakeMonthly: 40,
  churnPrimary: 6,
  conversionPrimaryToSpecialty: 15,
  specialtyInitPerPhysician: 100,
  physicianPrimaryCarryover: 40,
  physicianSpecialtyCarryover: 60,
  otherPhysiciansPrimaryCarryoverPerPhysician: 40,
  otherPhysiciansSpecialtyCarryoverPerPhysician: 60,
  initialCorporateClients: 1,
  corporateContractsMonthly: 2,
  corpInitialClients: 50,
  corpPricePerEmployeeMonth: 900,
  primaryPrice: 550,
  specialtyPrice: 600,
  inflationRate: 3,
  diagnosticsActive: true,
  echoStartMonth: 3,
  echoPrice: 600,
  echoVolumeMonthly: 150,
  ctStartMonth: 6,
  ctPrice: 1000,
  ctVolumeMonthly: 60,
  labTestsPrice: 250,
  labTestsMonthly: 150,
  diagnosticsMargin: 55,
  
  // Costs - Capital Expenditures
  capexBuildoutCost: 200000,
  officeEquipment: 30000,
  
  // Costs - Startup Costs
  splitStartupAcrossTwoMonths: true,
  startupLegal: 35000,
  startupHr: 15000,
  startupTraining: 20000,
  startupTechnology: 30000,
  startupPermits: 10000,
  startupInventory: 20000,
  startupInsurance: 50000,
  startupMarketing: 40000,
  startupProfessionalFees: 30000,
  startupOther: 25000,
  
  // Costs - Operating Costs
  fixedOverheadMonthly: 120000,
  equipmentLease: 20000,
  marketingBudgetMonthly: 40000,
  variableCostPct: 25,
  
  // Staffing
  founderChiefStrategistSalary: 250000,
  directorOperationsSalary: 180000,
  gmHourlyRate: 60,
  gmWeeklyHours: 40,
  fractionalCfoCost: 7000,
  eventSalespersonCost: 5000,
  np1StartMonth: 1,
  np1Salary: 130000,
  np2StartMonth: 3,
  np2Salary: 130000,
  adminSupportRatio: 1.5,
  avgAdminSalary: 60000,
  
  // Growth Drivers
  dexafitPrimaryIntakeMonthly: 40,
  corporateContractSalesMonthly: 2,
  employeesPerContract: 50,
  primaryToSpecialtyConversion: 12,
  diagnosticsExpansionRate: 15,
  
  // Ramp to Launch
  rampDuration: 6,
  corporateStartMonth: 2,
  rampPrimaryIntakeMonthly: 30,
  // rampStartupCost removed - now derived
  directorOpsStartMonth: 1,
  gmStartMonth: 1,
  fractionalCfoStartMonth: 2,
  eventPlannerStartMonth: 3,
  ctLeaseCost: 5000,
  echoLeaseCost: 2000,
  totalEquipmentLease: 7000,
};

// Conservative scenario preset (conservative growth assumptions)
const conservativeScenario: Partial<DashboardInputs> = {
  ...defaultInputs,
  otherPhysiciansPrimaryCarryoverPerPhysician: 25,
  otherPhysiciansSpecialtyCarryoverPerPhysician: 25,
};

// Scenario presets
export const scenarioPresets: Record<string, Partial<DashboardInputs>> = {
  null: nullScenario,
  conservative: conservativeScenario,
  moderate: moderateScenario,
};

// Calculate capital from physicians
export function calculateCapitalFromPhysicians(inputs: DashboardInputs): number {
  // physiciansLaunch is derived from foundingToggle: 1 if true, 0 if false
  const foundingCount = inputs.foundingToggle ? 1 : 0;
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
  { id: 'ramp', title: 'Ramp to Launch', icon: 'TrendingUp', description: 'Timeline controls for ramp phase (Months 0-6): hiring, diagnostics activation, and intake rates' },
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
  { id: 'ramp', title: 'Ramp & Launch' },
  { id: '12-month', title: '12-Month Projection' },
  { id: 'risk-analysis', title: 'Risk Analysis' },
  { id: 'pl-summary', title: 'P&L Summary' },
];

