import { DashboardInputs } from './data';

/**
 * Scenario Presets
 * Three predefined financial scenarios with different assumptions
 */

export const SCENARIO_PRESETS: Record<string, Partial<DashboardInputs>> = {
  lean: {
    // Conservative growth assumptions
    scenarioMode: 'null',
    foundingToggle: true,
    additionalPhysicians: 0,
    
    // Primary care - lean
    primaryInitPerPhysician: 30,
    primaryIntakeMonthly: 15,
    churnPrimary: 10,
    conversionPrimaryToSpecialty: 8,
    physicianPrimaryCarryover: 15,
    physicianSpecialtyCarryover: 25,
    
    // Pricing - lower
    primaryPrice: 450,
    specialtyPrice: 450,
    
    // Corporate - minimal
    initialCorporateClients: 0,
    corporateContractsMonthly: 0,
    corpInitialClients: 0,
    corpPricePerEmployeeMonth: 600,
    
    // Diagnostics - minimal
    diagnosticsActive: false,
    echoVolumeMonthly: 50,
    ctVolumeMonthly: 20,
    labTestsMonthly: 50,
    
    // Costs - lean
    fixedOverheadMonthly: 50000,
    marketingBudgetMonthly: 25000,
    variableCostPct: 15,
    
    // Staffing - minimal
    founderChiefStrategistSalary: 120000,
    directorOperationsSalary: 80000,
  },
  
  conservative: {
    // Moderate growth assumptions
    scenarioMode: 'conservative',
    foundingToggle: true,
    additionalPhysicians: 2,
    
    // Primary care - moderate
    primaryInitPerPhysician: 50,
    primaryIntakeMonthly: 25,
    churnPrimary: 8,
    conversionPrimaryToSpecialty: 10,
    physicianPrimaryCarryover: 25,
    physicianSpecialtyCarryover: 40,
    
    // Pricing - standard
    primaryPrice: 500,
    specialtyPrice: 500,
    
    // Corporate - moderate
    initialCorporateClients: 1,
    corporateContractsMonthly: 1,
    corpInitialClients: 36,
    corpPricePerEmployeeMonth: 700,
    
    // Diagnostics - active
    diagnosticsActive: true,
    echoVolumeMonthly: 100,
    ctVolumeMonthly: 40,
    labTestsMonthly: 100,
    
    // Costs - moderate
    fixedOverheadMonthly: 65000,
    marketingBudgetMonthly: 35000,
    variableCostPct: 20,
    
    // Staffing - standard
    founderChiefStrategistSalary: 150000,
    directorOperationsSalary: 95000,
  },
  
  moderate: {
    // Optimistic growth assumptions
    scenarioMode: 'moderate',
    foundingToggle: true,
    additionalPhysicians: 3,
    
    // Primary care - aggressive
    primaryInitPerPhysician: 75,
    primaryIntakeMonthly: 40,
    churnPrimary: 5,
    conversionPrimaryToSpecialty: 12,
    physicianPrimaryCarryover: 40,
    physicianSpecialtyCarryover: 60,
    
    // Pricing - premium
    primaryPrice: 550,
    specialtyPrice: 550,
    
    // Corporate - aggressive
    initialCorporateClients: 2,
    corporateContractsMonthly: 2,
    corpInitialClients: 72,
    corpPricePerEmployeeMonth: 800,
    
    // Diagnostics - robust
    diagnosticsActive: true,
    echoVolumeMonthly: 150,
    ctVolumeMonthly: 60,
    labTestsMonthly: 150,
    
    // Costs - higher investment
    fixedOverheadMonthly: 75000,
    marketingBudgetMonthly: 50000,
    variableCostPct: 25,
    
    // Staffing - robust
    founderChiefStrategistSalary: 180000,
    directorOperationsSalary: 110000,
  },
};

/**
 * Get a zero-ed out inputs object (all numeric values set to 0)
 */
export function getZeroedInputs(): Partial<DashboardInputs> {
  return {
    // Physician setup
    foundingToggle: false,
    additionalPhysicians: 0,
    
    // Primary care
    primaryInitPerPhysician: 0,
    primaryIntakeMonthly: 0,
    churnPrimary: 0,
    conversionPrimaryToSpecialty: 0,
    physicianPrimaryCarryover: 0,
    physicianSpecialtyCarryover: 0,
    otherPhysiciansPrimaryCarryoverPerPhysician: 0,
    otherPhysiciansSpecialtyCarryoverPerPhysician: 0,
    
    // Specialty
    specialtyInitPerPhysician: 0,
    
    // Corporate
    initialCorporateClients: 0,
    corporateContractsMonthly: 0,
    corpInitialClients: 0,
    corpPricePerEmployeeMonth: 0,
    
    // Pricing
    primaryPrice: 0,
    specialtyPrice: 0,
    
    // Diagnostics
    diagnosticsActive: false,
    echoStartMonth: 1,
    echoPrice: 0,
    echoVolumeMonthly: 0,
    ctStartMonth: 1,
    ctPrice: 0,
    ctVolumeMonthly: 0,
    labTestsPrice: 0,
    labTestsMonthly: 0,
    diagnosticsMargin: 0,
    
    // Costs
    capexBuildoutCost: 0,
    officeEquipment: 0,
    fixedOverheadMonthly: 0,
    equipmentLease: 0,
    marketingBudgetMonthly: 0,
    variableCostPct: 0,
    
    // Startup costs
    splitStartupAcrossTwoMonths: false,
    startupLegal: 0,
    startupHr: 0,
    startupTraining: 0,
    startupTechnology: 0,
    startupPermits: 0,
    startupInventory: 0,
    startupInsurance: 0,
    startupMarketing: 0,
    startupProfessionalFees: 0,
    startupOther: 0,
    
    // Staffing
    founderChiefStrategistSalary: 0,
    directorOperationsSalary: 0,
    gmHourlyRate: 0,
    gmWeeklyHours: 0,
    fractionalCfoCost: 0,
    eventSalespersonCost: 0,
    np1StartMonth: 1,
    np1Salary: 0,
    np2StartMonth: 1,
    np2Salary: 0,
    adminSupportRatio: 0,
    avgAdminSalary: 0,
    
    // Growth
    dexafitPrimaryIntakeMonthly: 0,
    corporateContractSalesMonthly: 0,
    employeesPerContract: 0,
    primaryToSpecialtyConversion: 0,
    diagnosticsExpansionRate: 0,
    
    // Global
    inflationRate: 0,
    annualDiagnosticGrowthRate: 0,
    annualCostInflationRate: 0,
  };
}

