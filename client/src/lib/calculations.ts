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
    equityBuyout: number; // Equity buyout payment
    total: number;
  };
  members: {
    primaryActive: number;
    specialtyActive: number;
    primaryNew: number;
    specialtyNew: number;
    primaryChurned: number;
  };
  corporateEmployees: number; // Track corporate wellness employees
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
    // Legacy KPIs
    totalRampBurn: number;
    launchMRR: number;
    membersAtLaunch: number;
    cashPositionAtLaunch: number;
    totalRevenue12Mo: number;
    totalProfit12Mo: number;
    physicianROI: number; // Individual physician's ROI (specialty retained + equity share / individual capital)
    msoROI: number; // MSO's ROI (total profit / total capital raised)
    breakevenMonth: number | null;
    peakMembers: number;
    
    // 8-Card KPI System
    monthlyIncome: number; // Card 1: Total monthly earnings (specialty + equity + diagnostics + corporate)
    annualizedROI: number; // Card 2: Annualized return on investment (%)
    msoEquityIncome: number; // Card 3: Monthly passive income from equity stake
    equityStakeValue: number; // Card 4: Projected equity value at 2× earnings multiple
    independentRevenueStreams: number; // Card 5: Count of active revenue streams
    specialtyPatientLoad: number; // Card 6: Number of specialty patients (vs hospital baseline)
    qualityOfLifeIndex: number; // Card 7: % time recovered from admin burden
    supportToPhysicianRatio: number; // Card 8: Support staff to physician ratio
    
    // Income breakdown by stream (for donut chart)
    monthlyIncomeBreakdown: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    
    // Break-even analysis
    breakevenAnalysis: {
      breakevenMonth: number | null;      // First month with positive cumulative cash
      monthsToBreakeven: number | null;   // Months from Month 0
      currentCash: number;                // Latest cumulative cash
      cashTrend: number[];                // Sparkline data (all months)
      isBreakeven: boolean;               // true if already profitable
    };
    
    // Unit economics
    unitEconomics: {
      revenuePerMember: number;           // Primary care price
      ltv: number;                        // Lifetime value
      cac: number;                        // Customer acquisition cost
      paybackMonths: number;              // CAC / monthly revenue
      ltvCacRatio: number;                // LTV / CAC (target: 3+)
      grossMargin: number;                // (Revenue - COGS) / Revenue
    };
    
    // Capital deployment
    capitalDeployment: {
      capitalRaised: number;              // Total investment
      buildoutCost: number;               // CapEx buildout
      equipmentCost: number;              // Office equipment
      startupCosts: number;               // Startup costs
      workingCapital: number;             // Operating reserves
      remainingReserve: number;           // Unallocated capital
      deploymentBreakdown: Array<{
        category: string;
        amount: number;
        percentage: number;
      }>;
    }
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
    // MSO only keeps 37% (founding) or 40% (additional) of specialty revenue
    if (month >= 1) {
      const newSpecialty = inputs.rampPrimaryIntakeMonthly * (inputs.primaryToSpecialtyConversion / 100);
      specialtyMembers += newSpecialty;
      // Apply churn to specialty members (same rate as primary)
      const specialtyChurned = specialtyMembers * (inputs.churnPrimary / 100 / 12);
      specialtyMembers -= specialtyChurned;
      const msoFeeRate = getMSOFee(inputs.foundingToggle);
      revenue.specialty = specialtyMembers * inputs.specialtyPrice * msoFeeRate;
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
    
    // Equity Buyout
    let equityBuyoutPayment = 0;
    if (inputs.equityBuyoutStructure === 'all_upfront' && month === 0) {
      // All upfront: $600K at M0
      equityBuyoutPayment = 600000;
    } else if (inputs.equityBuyoutStructure === 'over_18_months' && month >= 1) {
      // Over 18 months: $33,333/month for M1-M18 (18 total payments = $599,994)
      equityBuyoutPayment = 33333;
    }
    
    const costs = {
      salaries: calculateMonthlySalaries(inputs, month),
      equipmentLease: calculateEquipmentLease(inputs, month),
      fixedOverhead: month >= 1 ? inputs.fixedOverheadMonthly : 0,
      marketing: month >= 1 ? inputs.marketingBudgetMonthly : 0,
      variable: revenue.total * (inputs.variableCostPct / 100),
      diagnostics: diagnosticsCOGS,
      capex: 0,
      startup: 0,
      equityBuyout: equityBuyoutPayment,
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
      costs.startup +
      costs.equityBuyout;

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
      corporateEmployees: Math.round(corporateEmployees),
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
  // Use actual corporate employees accumulated during ramp, not just initial clients
  const corporateRevenue = lastRampMonth.corporateEmployees * inputs.corpPricePerEmployeeMonth;
  
  const monthlyRevenue =
    primaryMembers * inputs.primaryPrice +
    specialtyMembers * inputs.specialtyPrice +
    corporateRevenue +
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
    
    // MSO only keeps 37% (founding) or 40% (additional) of specialty revenue
    const msoFeeRate = getMSOFee(inputs.foundingToggle);
    revenue.specialty = specialtyMembers * inputs.specialtyPrice * msoFeeRate;

    // Corporate contracts (with continued monthly growth)
    if (isActive(inputs.corporateStartMonth, month)) {
      corporateEmployees += inputs.corporateContractSalesMonthly * inputs.employeesPerContract;
      revenue.corporate = corporateEmployees * inputs.corpPricePerEmployeeMonth;
    }

    // Diagnostics - with growth (only if active)
    // Apply monthly compound growth from each service's actual start month
    const diagnosticGrowthRate = inputs.annualDiagnosticGrowthRate || 0;
    
    if (isActive(inputs.echoStartMonth, month)) {
      const monthsSinceEchoStart = month - inputs.echoStartMonth;
      const echoGrowthMultiplier = Math.pow(1 + diagnosticGrowthRate / 100 / 12, monthsSinceEchoStart);
      revenue.echo = inputs.echoPrice * inputs.echoVolumeMonthly * echoGrowthMultiplier;
    }
    
    if (isActive(inputs.ctStartMonth, month)) {
      const monthsSinceCTStart = month - inputs.ctStartMonth;
      const ctGrowthMultiplier = Math.pow(1 + diagnosticGrowthRate / 100 / 12, monthsSinceCTStart);
      revenue.ct = inputs.ctPrice * inputs.ctVolumeMonthly * ctGrowthMultiplier;
    }
    
    // Labs are always active from month 1
    if (month >= 1) {
      const monthsSinceLabsStart = month - 1;
      const labsGrowthMultiplier = Math.pow(1 + diagnosticGrowthRate / 100 / 12, monthsSinceLabsStart);
      revenue.labs = inputs.labTestsPrice * inputs.labTestsMonthly * labsGrowthMultiplier;
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
    const monthsSinceM7 = month - 7;
    const marketingGrowthRate = inputs.marketingGrowthRate || 0;
    const overheadGrowthRate = inputs.overheadGrowthRate || 0;
    const costInflationRate = inputs.annualCostInflationRate || 0;
    
    const marketingGrowthMultiplier = Math.pow(1 + marketingGrowthRate / 100 / 12, monthsSinceM7);
    const overheadGrowthMultiplier = Math.pow(1 + overheadGrowthRate / 100 / 12, monthsSinceM7);
    // Salaries escalate with annual cost inflation rate
    const salaryInflationMultiplier = Math.pow(1 + costInflationRate / 100 / 12, monthsSinceM7);
    
    // Calculate diagnostics COGS based on margin
    const diagnosticsRevenue = revenue.echo + revenue.ct + revenue.labs;
    const diagnosticsCOGS = diagnosticsRevenue * (1 - inputs.diagnosticsMargin / 100);
    
    // Equity Buyout
    let equityBuyoutPayment = 0;
    if (inputs.equityBuyoutStructure === 'over_18_months' && month >= 7 && month <= 18) {
      // Continue monthly payments for M7-M18
      // Combined with M1-M6 from ramp = 18 total payments (M1-M18)
      equityBuyoutPayment = 33333;
    }
    // If all_upfront, no payments during projection (already paid at M0)
    
    const costs = {
      salaries: calculateMonthlySalaries(inputs, month) * salaryInflationMultiplier,
      equipmentLease: calculateEquipmentLease(inputs, month),
      fixedOverhead: inputs.fixedOverheadMonthly * overheadGrowthMultiplier,
      marketing: inputs.marketingBudgetMonthly * marketingGrowthMultiplier,
      variable: revenue.total * (inputs.variableCostPct / 100),
      diagnostics: diagnosticsCOGS,
      capex: 0,
      startup: 0,
      equityBuyout: equityBuyoutPayment,
      total: 0,
    };

    costs.total =
      costs.salaries +
      costs.equipmentLease +
      costs.fixedOverhead +
      costs.marketing +
      costs.variable +
      costs.diagnostics +
      costs.equityBuyout;

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
      corporateEmployees: Math.round(corporateEmployees),
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

  // ROI CALCULATIONS - Two separate metrics:
  // 1. Physician ROI: Individual physician's return (specialty + equity / individual capital)
  // 2. MSO ROI: Total practice return (total profit / total capital raised)
  
  // Calculate total capital raised from all physicians
  const foundingCapital = inputs.foundingToggle ? BUSINESS_RULES.FOUNDING_INVESTMENT : 0;
  const additionalCapital = inputs.additionalPhysicians * BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  const totalCapitalRaised = foundingCapital + additionalCapital;
  
  // MSO ROI: Total profit / Total capital raised
  const msoROI = totalCapitalRaised > 0 ? (totalProfit12Mo / totalCapitalRaised) * 100 : 0;
  
  // Physician ROI: Individual physician's return
  // Use founding physician's investment as the baseline (or additional if no founding)
  const individualInvestment = inputs.foundingToggle 
    ? BUSINESS_RULES.FOUNDING_INVESTMENT 
    : BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  
  // Calculate physician-specific annual income by summing actual 12 months
  const msoFee = getMSOFee(inputs.foundingToggle);
  const equityStake = getEquityShare(inputs.foundingToggle);
  
  let totalAnnualIncome = 0;
  for (const month of projection) {
    // Specialty revenue retained after MSO fee
    const specialtyRetained = month.revenue.specialty * (1 - msoFee);
    
    // Equity share of net profit
    const equityIncome = month.profit * equityStake;
    
    // Total monthly income
    totalAnnualIncome += specialtyRetained + equityIncome;
  }
  
  // Physician ROI: (Specialty retained + Equity income) / Individual investment
  const physicianROI = individualInvestment > 0 ? (totalAnnualIncome / individualInvestment) * 100 : 0;

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

  // ========================================================================
  // 8-CARD KPI SYSTEM CALCULATIONS
  // ========================================================================
  
  // Get Month 12 data (last month of projection)
  const month12 = projection[projection.length - 1];
  
  // Card 1: Monthly Income
  // Total aggregated monthly earnings from all sources
  const specialtyRetainedM12 = month12.revenue.specialty * (1 - msoFee);
  const equityIncomeM12 = month12.profit * equityStake;
  const monthlyIncome = specialtyRetainedM12 + equityIncomeM12;
  
  // Card 2: Annualized ROI
  // Same as physicianROI (already calculated above)
  const annualizedROI = physicianROI;
  
  // Card 3: MSO Equity Income
  // Monthly passive income from equity stake
  const msoEquityIncome = equityIncomeM12;
  
  // Card 4: Equity Stake Value
  // Projected equity value at 2× earnings multiple
  const annualNetProfit = totalProfit12Mo;
  const earningsMultiple = 2.0; // Conservative medical practice multiple
  const practiceValuation = annualNetProfit * earningsMultiple;
  const equityStakeValue = practiceValuation * equityStake;
  
  // Card 5: Independent Revenue Streams
  // Count of active revenue streams (> $0)
  const streams = [
    month12.revenue.primary > 0,
    month12.revenue.specialty > 0,
    month12.revenue.corporate > 0,
    month12.revenue.echo > 0,
    month12.revenue.ct > 0,
    month12.revenue.labs > 0,
  ];
  const independentRevenueStreams = streams.filter(Boolean).length;
  
  // Card 6: Specialty Patient Load
  // Number of specialty patients (vs hospital baseline of 730)
  const specialtyPatientLoad = month12.members.specialtyActive;
  
  // Card 7: Quality-of-Life Index
  // % time recovered from admin burden (30% hospital → 10% MSO)
  const hospitalAdminTime = 30; // % of time on admin in hospital
  const msoAdminTime = 10; // % of time on admin with MSO support
  const qualityOfLifeIndex = ((hospitalAdminTime - msoAdminTime) / hospitalAdminTime) * 100;
  
  // Card 8: Support-to-Physician Ratio
  // Ratio of support staff to physicians
  const totalPhysicians = (inputs.foundingToggle ? 1 : 0) + inputs.additionalPhysicians;
  
  // Count support staff from inputs using adminSupportRatio
  // adminSupportRatio represents admin/support staff per physician
  const supportStaff = totalPhysicians * (inputs.adminSupportRatio || 1);
  
  const supportToPhysicianRatio = totalPhysicians > 0 ? supportStaff / totalPhysicians : 0;
  
  // Income breakdown by stream (for donut chart visualization)
  const profitMargin = month12.profit / month12.revenue.total;
  const monthlyIncomeBreakdown = [
    { 
      name: 'Specialty Care', 
      value: month12.revenue.specialty * (1 - msoFee), 
      color: '#3b82f6' 
    },
    { 
      name: 'Primary Care', 
      value: month12.revenue.primary * profitMargin * equityStake, 
      color: '#10b981' 
    },
    { 
      name: 'Echo', 
      value: month12.revenue.echo * profitMargin * equityStake, 
      color: '#f59e0b' 
    },
    { 
      name: 'CT Scan', 
      value: month12.revenue.ct * profitMargin * equityStake, 
      color: '#8b5cf6' 
    },
    { 
      name: 'Labs', 
      value: month12.revenue.labs * profitMargin * equityStake, 
      color: '#ec4899' 
    },
    { 
      name: 'Corporate Wellness', 
      value: month12.revenue.corporate * profitMargin * equityStake, 
      color: '#06b6d4' 
    },
  ];
  
  // ========================================================================
  // BREAK-EVEN ANALYSIS
  // ========================================================================
  
  // Find operating break-even (first month with positive profit)
  let breakevenMonthFound: number | null = null;
  for (const month of allMonths) {
    if (month.profit >= 0) {
      breakevenMonthFound = month.month;
      break;
    }
  }
  
  const monthsToBreakevenCalc = breakevenMonthFound !== null ? breakevenMonthFound : null;
  const currentCash = allMonths[allMonths.length - 1].cumulativeCash;
  const cashTrend = allMonths.map(m => m.cumulativeCash);
  const isBreakevenStatus = currentCash >= 0;
  
  const breakevenAnalysis = {
    breakevenMonth: breakevenMonthFound,
    monthsToBreakeven: monthsToBreakevenCalc,
    currentCash,
    cashTrend,
    isBreakeven: isBreakevenStatus
  };
  
  // ========================================================================
  // UNIT ECONOMICS
  // ========================================================================
  
  const primaryPrice = inputs.primaryPrice;
  // For LTV calculation, use conservative 35% annual churn assumption
  // (independent of operational churn used in revenue projections)
  const conservativeAnnualChurn = 0.35; // 35% annual churn for prudent LTV estimates
  const avgLifetimeYears = 1 / conservativeAnnualChurn; // ~2.86 years
  const avgLifetimeMonths = avgLifetimeYears * 12; // ~34 months
  
  const ltv = primaryPrice * avgLifetimeMonths;
  
  // CAC = Total marketing spend / Total new members acquired
  const totalMarketingSpend = projection.reduce((sum, m) => sum + m.costs.marketing, 0);
  const totalNewMembers = projection.reduce((sum, m) => sum + m.members.primaryNew, 0);
  const cac = totalNewMembers > 0 ? totalMarketingSpend / totalNewMembers : 0;
  
  const paybackMonths = primaryPrice > 0 ? cac / primaryPrice : 0;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  
  // Gross margin = (Revenue - Variable Costs) / Revenue
  const totalRevenue = totalRevenue12Mo;
  const totalVariableCosts = projection.reduce((sum, m) => sum + m.costs.variable + m.costs.diagnostics, 0);
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalVariableCosts) / totalRevenue) * 100 : 0;
  
  const unitEconomics = {
    revenuePerMember: primaryPrice,
    ltv,
    cac,
    paybackMonths,
    ltvCacRatio,
    grossMargin
  };
  
  // ========================================================================
  // CAPITAL DEPLOYMENT
  // ========================================================================
  
  const capitalRaised = seedCapital;
  
  // Sum from ramp period costs
  const buildoutCost = rampPeriod.reduce((sum, m) => sum + m.costs.capex, 0);
  const equipmentCost = inputs.officeEquipment || 0;
  const startupCosts = rampPeriod.reduce((sum, m) => sum + m.costs.startup, 0);
  
  // Working capital = salaries + overhead + marketing during ramp
  const workingCapital = rampPeriod.reduce((sum, m) => 
    sum + m.costs.salaries + m.costs.fixedOverhead + m.costs.marketing, 0
  );
  
  // Equity buyout across full 18 months (M0-M18)
  // Include both ramp period (M0-M6) and projection period (M7-M18)
  const equityBuyoutRamp = rampPeriod.reduce((sum, m) => sum + m.costs.equityBuyout, 0);
  const equityBuyoutProjection = projection.reduce((sum, m) => sum + m.costs.equityBuyout, 0);
  const equityBuyout = equityBuyoutRamp + equityBuyoutProjection;
  
  const totalDeployed = buildoutCost + equipmentCost + startupCosts + workingCapital + equityBuyout;
  const remainingReserve = capitalRaised - totalDeployed;
  
  // Breakdown with percentages
  const deploymentBreakdown = [
    { category: 'Buildout (CapEx)', amount: buildoutCost, percentage: (buildoutCost / capitalRaised) * 100 },
    { category: 'Equipment', amount: equipmentCost, percentage: (equipmentCost / capitalRaised) * 100 },
    { category: 'Startup Costs', amount: startupCosts, percentage: (startupCosts / capitalRaised) * 100 },
    { category: 'Working Capital', amount: workingCapital, percentage: (workingCapital / capitalRaised) * 100 },
    { category: 'Equity Buyout', amount: equityBuyout, percentage: (equityBuyout / capitalRaised) * 100 },
  ];
  
  const capitalDeployment = {
    capitalRaised,
    buildoutCost,
    equipmentCost,
    startupCosts,
    workingCapital,
    equityBuyout,
    remainingReserve,
    deploymentBreakdown
  };

  return {
    // Legacy KPIs
    totalRampBurn,
    launchMRR,
    membersAtLaunch,
    cashPositionAtLaunch,
    totalRevenue12Mo,
    totalProfit12Mo,
    physicianROI,
    msoROI,
    breakevenMonth,
    peakMembers,
    
    // 8-Card KPI System
    monthlyIncome,
    annualizedROI,
    msoEquityIncome,
    equityStakeValue,
    independentRevenueStreams,
    specialtyPatientLoad,
    qualityOfLifeIndex,
    supportToPhysicianRatio,
    monthlyIncomeBreakdown,
    
    // New Quick Win KPIs
    breakevenAnalysis,
    unitEconomics,
    capitalDeployment,
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

