// Default values for all dashboard inputs (for double-click reset)

export const defaultValues = {
  // Scenario
  scenarioMode: 'conservative' as const,
  
  // Physician Setup
  foundingToggle: true,
  // physiciansLaunch removed - now derived from foundingToggle
  physicianPrimaryCarryover: 25,
  physicianSpecialtyCarryover: 40,
  otherPhysiciansPrimaryCarryoverPerPhysician: 25,
  otherPhysiciansSpecialtyCarryoverPerPhysician: 40,
  
  // Growth & Membership
  churnPrimary: 8,
  specialtyInitPerPhysician: 75,
  specialtyIntakeMonthly: 15,
  churnSpecialty: 10,
  physicianSpecialtyGrowthRate: 0,
  
  // Pricing & Economics
  primaryPrice: 500,
  specialtyPrice: 500,
  corporateContractsMonthly: 1,
  employeesPerContract: 50,
  corpInitialClients: 36,
  corpPricePerEmployeeMonth: 700,
  
  // Revenues
  additionalPhysicians: 0,
  
  // Diagnostics
  diagnosticsActive: false,
  diagnosticsStartMonth: 6,
  diagnosticsRevenuePerMember: 50,
  echoStartMonth: 1,
  echoPrice: 500,
  ctStartMonth: 1,
  ctPrice: 800,
  labTestsPrice: 200,
  annualDiagnosticGrowthRate: 5,
  
  // Costs
  fixedOverheadMonthly: 25000,
  variableCostPct: 15,
  diagnosticsMargin: 50,
  avgAdminSalary: 50000,
  adminSupportRatio: 1,
  physiciansBaseSalary: 200000,
  nursePractitionersCount: 2,
  nursePractitionersSalary: 110000,
  medicalAssistantsCount: 3,
  medicalAssistantsSalary: 45000,
  adminStaffCount: 2,
  adminStaffSalary: 50000,
  directorOpsStartMonth: 0,
  eventPlannerStartMonth: 0,
  rentMonthly: 15000,
  utilitiesMonthly: 2000,
  insuranceMonthly: 5000,
  softwareMonthly: 3000,
  marketingMonthly: 5000,
  suppliesPerMember: 20,
};

