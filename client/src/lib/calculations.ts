import { DashboardInputs } from './data';

/**
 * Comprehensive Calculation Engine for Pillars Financial Dashboard
 * 
 * This module calculates:
 * - Ramp period financials (Months 0-6)
 * - Launch state variables (Month 7 snapshot)
 * - 12-month projection (Months 7-18)
 * - KPIs and metrics
 */

import { BUSINESS_RULES, calculateSeedCapital, getMSOFee, getEquityShare } from './constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MonthlyFinancials {
  month: number;
  revenue: {
    primary: number;
    specialty: number;
    corporate: number;
    echo: number;
    ct: number;
    labs: number;
    total: number;
  };
  costs: {
    salaries: number;
    equipmentLease: number;
    fixedOverhead: number;
    marketing: number;
    variable: number;
    diagnostics: number; // Cost of goods sold for diagnostics (based on margin)
    capex: number;
    startup: number;
    total: number;
  };
  members: {
    primaryActive: number;
    specialtyActive: number;
    primaryNew: number;
    specialtyNew: number;
    primaryChurned: number;
  };
  profit: number;
  cashFlow: number;
  cumulativeCash: number;
}

export interface LaunchState {
  primaryMembers: number;
  specialtyMembers: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  teamHeadcount: number;
  activeServices: string[];
  equipmentLease: number;
}

export interface ProjectionResults {
  rampPeriod: MonthlyFinancials[];
  launchState: LaunchState;
  projection: MonthlyFinancials[];
  kpis: {
    totalRampBurn: number;
    launchMRR: number;
    membersAtLaunch: number;
    cashPositionAtLaunch: number;
    totalRevenue12Mo: number;
    totalProfit12Mo: number;
    physicianROI: number;
    breakevenMonth: number | null;
    peakMembers: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a service/staff is active in a given month
 */
function isActive(startMonth: number, currentMonth: number): boolean {
  return currentMonth >= startMonth;
}

/**
 * Calculate monthly salary costs based on hiring schedule
 */
function calculateMonthlySalaries(inputs: DashboardInputs, month: number): number {
  let total = 0;

  // Founder - always active from Month 1
  if (month >= 1) {
    total += inputs.founderChiefStrategistSalary / 12;
  }

  // Director of Operations
  if (isActive(inputs.directorOpsStartMonth, month)) {
    total += inputs.directorOperationsSalary / 12;
  }

  // General Manager (hourly)
  if (isActive(inputs.gmStartMonth, month)) {
    total += inputs.gmHourlyRate * inputs.gmWeeklyHours * 4.33; // 4.33 weeks/month
  }

  // Fractional CFO
  if (isActive(inputs.fractionalCfoStartMonth, month)) {
    total += inputs.fractionalCfoCost;
  }

  // Event Planner
  if (isActive(inputs.eventPlannerStartMonth, month)) {
    total += inputs.eventSalespersonCost;
  }

  // NP #1
  if (isActive(inputs.np1StartMonth, month)) {
    total += inputs.np1Salary / 12;
  }

  // NP #2
  if (isActive(inputs.np2StartMonth, month)) {
    total += inputs.np2Salary / 12;
  }

  // Admin/Support Staff (starts Month 1)
  // Number of staff = totalPhysicians * adminSupportRatio
  if (month >= 1) {
    const totalPhysicians = (inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0);
    const adminStaff = totalPhysicians * (inputs.adminSupportRatio || 0);
    total += (adminStaff * (inputs.avgAdminSalary || 0)) / 12;
  }

  return total;
}

/**
 * Calculate equipment lease based on which diagnostics are active
 */
function calculateEquipmentLease(inputs: DashboardInputs, month: number): number {
  let total = 0;

  if (isActive(inputs.ctStartMonth, month)) {
    total += inputs.ctLeaseCost;
  }

  if (isActive(inputs.echoStartMonth, month)) {
    total += inputs.echoLeaseCost;
  }

  return total;
}

// ============================================================================
// RAMP PERIOD CALCULATIONS (Months 0-6)
// ============================================================================

function calculateRampPeriod(inputs: DashboardInputs): MonthlyFinancials[] {
  const rampMonths: MonthlyFinancials[] = [];
  // Start with seed capital from physician investments
  const seedCapital = calculateSeedCapital(inputs.foundingToggle, inputs.additionalPhysicians);
  let cumulativeCash = seedCapital;
  let primaryMembers = 0;
  let specialtyMembers = 0;
  let corporateEmployees = 0;

  for (let month = 0; month <= inputs.rampDuration; month++) {
    // REVENUE CALCULATIONS
    const revenue = {
      primary: 0,
      specialty: 0,
      corporate: 0,
      echo: 0,
      ct: 0,
      labs: 0,
      total: 0,
    };

    // Primary care revenue (DexaFit intake during ramp)
    if (month >= 1) {
      primaryMembers += inputs.rampPrimaryIntakeMonthly;
      // Apply churn
      const churned = primaryMembers * (inputs.churnPrimary / 100 / 12);
      primaryMembers -= churned;
      revenue.primary = primaryMembers * inputs.primaryPrice;
    }

    // Specialty revenue (retained from primary)
    if (month >= 1) {
      const newSpecialty = inputs.rampPrimaryIntakeMonthly * (inputs.primaryToSpecialtyConversion / 100);
      specialtyMembers += newSpecialty;
      // Apply churn to specialty members (same rate as primary)
      const specialtyChurned = specialtyMembers * (inputs.churnPrimary / 100 / 12);
      specialtyMembers -= specialtyChurned;
      revenue.specialty = specialtyMembers * inputs.specialtyPrice;
    }

    // Corporate contracts (with monthly growth)
    if (isActive(inputs.corporateStartMonth, month)) {
      // Add initial employees in the start month
      if (month === inputs.corporateStartMonth) {
        corporateEmployees = inputs.corpInitialClients;
      }
      // Add new contracts each month after start (each contract adds employeesPerContract employees)
      if (month > inputs.corporateStartMonth) {
        corporateEmployees += inputs.corporateContractSalesMonthly * inputs.employeesPerContract;
      }
      // Calculate revenue: total employees × price per employee per month
      revenue.corporate = corporateEmployees * inputs.corpPricePerEmployeeMonth;
    }

    // Diagnostics
    if (isActive(inputs.echoStartMonth, month)) {
      revenue.echo = inputs.echoPrice * inputs.echoVolumeMonthly;
    }

    if (isActive(inputs.ctStartMonth, month)) {
      revenue.ct = inputs.ctPrice * inputs.ctVolumeMonthly;
    }

    if (month >= 1) {
      revenue.labs = inputs.labTestsPrice * inputs.labTestsMonthly;
    }

    revenue.total =
      revenue.primary +
      revenue.specialty +
      revenue.corporate +
      revenue.echo +
      revenue.ct +
      revenue.labs;

    // COST CALCULATIONS
    // Calculate diagnostics COGS based on margin
    const diagnosticsRevenue = revenue.echo + revenue.ct + revenue.labs;
    const diagnosticsCOGS = diagnosticsRevenue * (1 - inputs.diagnosticsMargin / 100);
    
    const costs = {
      salaries: calculateMonthlySalaries(inputs, month),
      equipmentLease: calculateEquipmentLease(inputs, month),
      fixedOverhead: month >= 1 ? inputs.fixedOverheadMonthly : 0,
      marketing: month >= 1 ? inputs.marketingBudgetMonthly : 0,
      variable: revenue.total * (inputs.variableCostPct / 100),
      diagnostics: diagnosticsCOGS,
      capex: 0,
      startup: 0,
      total: 0,
    };

    // CapEx in Month 0
    if (month === 0) {
      costs.capex = inputs.capexBuildoutCost + inputs.officeEquipment;
    }

    // Startup costs split across Months 0-1 (or all in Month 0)
    const startupTotal = inputs.startupLegal + inputs.startupHr + inputs.startupTraining + 
                         inputs.startupTechnology + inputs.startupPermits + inputs.startupInventory +
                         inputs.startupInsurance + inputs.startupMarketing + inputs.startupProfessionalFees +
                         inputs.startupOther;
    if (month === 0) {
      costs.startup = inputs.splitStartupAcrossTwoMonths ? startupTotal / 2 : startupTotal;
    } else if (month === 1 && inputs.splitStartupAcrossTwoMonths) {
      costs.startup = startupTotal / 2;
    }

    costs.total =
      costs.salaries +
      costs.equipmentLease +
      costs.fixedOverhead +
      costs.marketing +
      costs.variable +
      costs.diagnostics +
      costs.capex +
      costs.startup;

    // PROFIT & CASH FLOW
    const profit = revenue.total - costs.total;
    const cashFlow = profit;
    cumulativeCash += cashFlow;

    rampMonths.push({
      month,
      revenue,
      costs,
      members: {
        primaryActive: Math.round(primaryMembers),
        specialtyActive: Math.round(specialtyMembers),
        primaryNew: Math.round(month >= 1 ? inputs.rampPrimaryIntakeMonthly : 0),
        specialtyNew: Math.round(month >= 1 ? inputs.rampPrimaryIntakeMonthly * (inputs.primaryToSpecialtyConversion / 100) : 0),
        primaryChurned: Math.round(month >= 1 ? primaryMembers * (inputs.churnPrimary / 100 / 12) : 0),
      },
      profit,
      cashFlow,
      cumulativeCash,
    });
  }

  return rampMonths;
}

// ============================================================================
// LAUNCH STATE (Month 7 Snapshot)
// ============================================================================

function calculateLaunchState(inputs: DashboardInputs, rampPeriod: MonthlyFinancials[]): LaunchState {
  const lastRampMonth = rampPeriod[rampPeriod.length - 1];

  // At Month 7, all physician carry-over members join
  // Total physicians = founding (1 if true, 0 if false) + additional physicians
  const physiciansLaunch = inputs.foundingToggle ? 1 : 0;
  const totalPhysicians = physiciansLaunch + (inputs.additionalPhysicians || 0);
  
  // Primary carryover: founding physician's carryover (only if foundingToggle is true) + other physicians' average carryover
  const carryOverPrimary =
    (inputs.foundingToggle ? inputs.physicianPrimaryCarryover : 0) +
    (inputs.additionalPhysicians || 0) * (inputs.otherPhysiciansPrimaryCarryoverPerPhysician || 0);

  // Specialty carryover: founding physician's carryover (only if foundingToggle is true) + other physicians' average carryover
  const carryOverSpecialty =
    (inputs.foundingToggle ? inputs.physicianSpecialtyCarryover : 0) +
    (inputs.additionalPhysicians || 0) * (inputs.otherPhysiciansSpecialtyCarryoverPerPhysician || 0);

  const primaryMembers = lastRampMonth.members.primaryActive + carryOverPrimary;
  const specialtyMembers = lastRampMonth.members.specialtyActive + carryOverSpecialty;

  // Calculate Month 7 MRR
  const monthlyRevenue =
    primaryMembers * inputs.primaryPrice +
    specialtyMembers * inputs.specialtyPrice +
    (inputs.corpInitialClients * inputs.corpPricePerEmployeeMonth) +
    (inputs.echoPrice * inputs.echoVolumeMonthly) +
    (inputs.ctPrice * inputs.ctVolumeMonthly) +
    (inputs.labTestsPrice * inputs.labTestsMonthly);

  // Calculate Month 7 costs
  const monthlyCosts =
    calculateMonthlySalaries(inputs, 7) +
    calculateEquipmentLease(inputs, 7) +
    inputs.fixedOverheadMonthly +
    inputs.marketingBudgetMonthly +
    monthlyRevenue * (inputs.variableCostPct / 100);

  // Active services
  const activeServices: string[] = ['Primary Care', 'Labs'];
  if (inputs.echoStartMonth <= 7) activeServices.push('Echo');
  if (inputs.ctStartMonth <= 7) activeServices.push('CT');
  if (inputs.corporateStartMonth <= 7) activeServices.push('Corporate Wellness');

  return {
    primaryMembers,
    specialtyMembers,
    monthlyRevenue,
    monthlyCosts,
    teamHeadcount: 7 + physiciansLaunch, // All staff + physicians
    activeServices,
    equipmentLease: calculateEquipmentLease(inputs, 7),
  };
}

// ============================================================================
// 12-MONTH PROJECTION (Months 7-18)
// ============================================================================

function calculate12MonthProjection(
  inputs: DashboardInputs,
  launchState: LaunchState,
  rampEndCash: number
): MonthlyFinancials[] {
  const projectionMonths: MonthlyFinancials[] = [];
  let cumulativeCash = rampEndCash;
  let primaryMembers = launchState.primaryMembers;
  let specialtyMembers = launchState.specialtyMembers;
  
  // Calculate corporate employees at launch (end of ramp)
  let corporateEmployees = 0;
  if (inputs.corporateStartMonth <= inputs.rampDuration) {
    corporateEmployees = inputs.corpInitialClients;
    const monthsSinceStart = inputs.rampDuration - inputs.corporateStartMonth;
    corporateEmployees += monthsSinceStart * inputs.corporateContractSalesMonthly * inputs.employeesPerContract;
  }

  for (let month = 7; month <= 18; month++) {
    // REVENUE CALCULATIONS
    const revenue = {
      primary: 0,
      specialty: 0,
      corporate: 0,
      echo: 0,
      ct: 0,
      labs: 0,
      total: 0,
    };

    // Primary care revenue (DexaFit intake switches to steady-state)
    const newPrimary = inputs.dexafitPrimaryIntakeMonthly; // 25/month
    primaryMembers += newPrimary;
    const churned = primaryMembers * (inputs.churnPrimary / 100 / 12);
    primaryMembers -= churned;
    revenue.primary = primaryMembers * inputs.primaryPrice;

    // Specialty revenue
    const newSpecialty = newPrimary * (inputs.primaryToSpecialtyConversion / 100);
    specialtyMembers += newSpecialty;
    
    // Apply physician's specialty practice growth rate (compounded monthly) BEFORE churn
    // This represents organic growth of existing member base
    if (inputs.physicianSpecialtyGrowthRate > 0) {
      const monthlyGrowthRate = inputs.physicianSpecialtyGrowthRate / 100 / 12;
      specialtyMembers *= (1 + monthlyGrowthRate);
    }
    
    // Apply churn to specialty members (same rate as primary) AFTER growth
    const specialtyChurned = specialtyMembers * (inputs.churnPrimary / 100 / 12);
    specialtyMembers -= specialtyChurned;
    
    revenue.specialty = specialtyMembers * inputs.specialtyPrice;

    // Corporate contracts (with continued monthly growth)
    if (isActive(inputs.corporateStartMonth, month)) {
      corporateEmployees += inputs.corporateContractSalesMonthly * inputs.employeesPerContract;
      revenue.corporate = corporateEmployees * inputs.corpPricePerEmployeeMonth;
    }

    // Diagnostics - with growth (only if active)
    // Apply monthly compound growth: (1 + annualRate/12)^monthsSinceM7
    const monthsSinceM7 = month - 7;
    const diagnosticGrowthMultiplier = Math.pow(1 + inputs.annualDiagnosticGrowthRate / 100 / 12, monthsSinceM7);
    
    if (isActive(inputs.echoStartMonth, month)) {
      revenue.echo = inputs.echoPrice * inputs.echoVolumeMonthly * diagnosticGrowthMultiplier;
    }
    
    if (isActive(inputs.ctStartMonth, month)) {
      revenue.ct = inputs.ctPrice * inputs.ctVolumeMonthly * diagnosticGrowthMultiplier;
    }
    
    // Labs are always active from month 1
    if (month >= 1) {
      revenue.labs = inputs.labTestsPrice * inputs.labTestsMonthly * diagnosticGrowthMultiplier;
    }

    revenue.total =
      revenue.primary +
      revenue.specialty +
      revenue.corporate +
      revenue.echo +
      revenue.ct +
      revenue.labs;

    // COST CALCULATIONS - with specific growth rates
    // Apply monthly compound growth: (1 + annualRate/12)^monthsSinceM7
    const marketingGrowthMultiplier = Math.pow(1 + inputs.marketingGrowthRate / 100 / 12, monthsSinceM7);
    const overheadGrowthMultiplier = Math.pow(1 + inputs.overheadGrowthRate / 100 / 12, monthsSinceM7);
    // Salaries escalate with annual cost inflation rate
    const salaryInflationMultiplier = Math.pow(1 + inputs.annualCostInflationRate / 100 / 12, monthsSinceM7);
    
    // Calculate diagnostics COGS based on margin
    const diagnosticsRevenue = revenue.echo + revenue.ct + revenue.labs;
    const diagnosticsCOGS = diagnosticsRevenue * (1 - inputs.diagnosticsMargin / 100);
    
    const costs = {
      salaries: calculateMonthlySalaries(inputs, month) * salaryInflationMultiplier,
      equipmentLease: calculateEquipmentLease(inputs, month),
      fixedOverhead: inputs.fixedOverheadMonthly * overheadGrowthMultiplier,
      marketing: inputs.marketingBudgetMonthly * marketingGrowthMultiplier,
      variable: revenue.total * (inputs.variableCostPct / 100),
      diagnostics: diagnosticsCOGS,
      capex: 0,
      startup: 0,
      total: 0,
    };

    costs.total =
      costs.salaries +
      costs.equipmentLease +
      costs.fixedOverhead +
      costs.marketing +
      costs.variable +
      costs.diagnostics;

    // PROFIT & CASH FLOW
    const profit = revenue.total - costs.total;
    const cashFlow = profit;
    cumulativeCash += cashFlow;

    projectionMonths.push({
      month,
      revenue,
      costs,
      members: {
        primaryActive: Math.round(primaryMembers),
        specialtyActive: Math.round(specialtyMembers),
        primaryNew: Math.round(newPrimary),
        specialtyNew: Math.round(newSpecialty),
        primaryChurned: Math.round(churned),
      },
      profit,
      cashFlow,
      cumulativeCash,
    });
  }

  return projectionMonths;
}

// ============================================================================
// KPI CALCULATIONS
// ============================================================================

function calculateKPIs(
  inputs: DashboardInputs,
  rampPeriod: MonthlyFinancials[],
  launchState: LaunchState,
  projection: MonthlyFinancials[]
): ProjectionResults['kpis'] {
  // Total ramp burn (capital deployed = starting capital - ending cash)
  const seedCapital = calculateSeedCapital(inputs.foundingToggle, inputs.additionalPhysicians);
  const totalRampBurn = seedCapital - rampPeriod[rampPeriod.length - 1].cumulativeCash;

  // Launch MRR
  const launchMRR = launchState.monthlyRevenue;

  // Members at launch
  const membersAtLaunch = launchState.primaryMembers;

  // Cash position at launch
  const cashPositionAtLaunch = rampPeriod[rampPeriod.length - 1].cumulativeCash;

  // 12-month totals
  const totalRevenue12Mo = projection.reduce((sum, m) => sum + m.revenue.total, 0);
  const totalProfit12Mo = projection.reduce((sum, m) => sum + m.profit, 0);

  // Physician ROI (Annual income / Individual physician investment)
  // ONTOLOGY FIX: Use individual physician's capital contribution, not total MSO costs
  // Investment should be the physician's actual capital at risk
  const investment = inputs.foundingToggle 
    ? BUSINESS_RULES.FOUNDING_INVESTMENT 
    : BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  
  // Calculate physician-specific annual income
  // Get month 12 data for income calculation
  const month12 = projection[projection.length - 1];
  const msoFee = getMSOFee(inputs.foundingToggle);
  const equityStake = getEquityShare(inputs.foundingToggle);
  
  // Specialty revenue retained after MSO fee
  const specialtyRetained = month12.revenue.specialty * (1 - msoFee);
  
  // Equity share of net profit
  const equityIncome = month12.profit * equityStake;
  
  // Total monthly income
  const monthlyIncome = specialtyRetained + equityIncome;
  
  // Annualize and calculate ROI
  const annualIncome = monthlyIncome * 12;
  const physicianROI = (annualIncome / investment) * 100;

  // Breakeven month (first month with positive cumulative cash)
  let breakevenMonth: number | null = null;
  const allMonths = [...rampPeriod, ...projection];
  for (const month of allMonths) {
    if (month.cumulativeCash >= 0) {
      breakevenMonth = month.month;
      break;
    }
  }

  // Peak members
  const peakMembers = Math.max(...projection.map((m) => m.members.primaryActive));

  return {
    totalRampBurn,
    launchMRR,
    membersAtLaunch,
    cashPositionAtLaunch,
    totalRevenue12Mo,
    totalProfit12Mo,
    physicianROI,
    breakevenMonth,
    peakMembers,
  };
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export function calculateProjections(inputs: DashboardInputs): ProjectionResults {
  // Step 1: Calculate ramp period (Months 0-6)
  const rampPeriod = calculateRampPeriod(inputs);

  // Step 2: Calculate launch state (Month 7 snapshot)
  const launchState = calculateLaunchState(inputs, rampPeriod);

  // Step 3: Calculate 12-month projection (Months 7-18)
  const rampEndCash = rampPeriod[rampPeriod.length - 1].cumulativeCash;
  const projection = calculate12MonthProjection(inputs, launchState, rampEndCash);

  // Step 4: Calculate KPIs
  const kpis = calculateKPIs(inputs, rampPeriod, launchState, projection);

  return {
    rampPeriod,
    launchState,
    projection,
    kpis,
  };
}

