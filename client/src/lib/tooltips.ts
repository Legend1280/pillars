// Tooltip text for all dashboard controls

export const tooltips = {
  // Section 1: Inputs & Scenarios
  scenarioMode: "Select overall operating assumptions: Null (baseline), Conservative (default), or Moderate (optimistic)",
  foundingToggle: "Founding physicians receive 37% MSO fee and 10% equity. Non-founding receive 40% MSO fee and 5% equity",
  // physiciansLaunch removed - now derived from foundingToggle (1 if true, 0 if false)
  physicianPrimaryCarryover: "Established primary care patients you're bringing from your prior practice",
  physicianSpecialtyCarryover: "Existing specialty clients you'll continue serving at the new practice",
  otherPhysiciansPrimaryCarryoverPerPhysician: "Average number of primary members each additional physician brings to the practice",
  otherPhysiciansSpecialtyCarryoverPerPhysician: "Average number of specialty clients each additional physician brings to the practice",
  
  // Growth & Membership
  churnPrimary: "Annual percentage of primary care members who leave the practice",
  specialtyInitPerPhysician: "Starting specialty client base per physician at launch",
  specialtyIntakeMonthly: "New specialty clients acquired per physician each month",
  churnSpecialty: "Annual percentage of specialty clients who stop using services",
  
  // Pricing & Economics
  primaryPrice: "Monthly membership fee charged to each primary care member",
  specialtyPrice: "Average fee per specialty visit or service",
  corporateContractsMonthly: "Number of new corporate wellness contracts signed each month",
  corporateEmployeesPerContract: "Average number of employees covered per corporate wellness contract",
  corporateEmployeePrice: "Monthly fee charged per employee in corporate wellness programs",
  
  // Section 2: Revenues
  additionalPhysicians: "Number of physicians joining after launch (used for capital calculations)",
  
  // Section 3: Diagnostics
  diagnosticsActive: "Activates imaging and lab revenue streams",
  diagnosticsStartMonth: "Month when diagnostic services begin generating revenue",
  diagnosticsRevenuePerMember: "Average monthly diagnostic revenue per active member",
  
  // Section 4: Costs
  physiciansBaseSalary: "Base annual salary per physician before profit sharing",
  nursePractitionersCount: "Number of nurse practitioners on staff",
  nursePractitionersSalary: "Annual salary per nurse practitioner",
  medicalAssistantsCount: "Number of medical assistants on staff",
  medicalAssistantsSalary: "Annual salary per medical assistant",
  adminStaffCount: "Number of administrative staff members",
  adminStaffSalary: "Annual salary per administrative staff member",
  rentMonthly: "Monthly rent and facility costs",
  utilitiesMonthly: "Monthly utilities (electric, water, internet, etc.)",
  insuranceMonthly: "Monthly malpractice and liability insurance premiums",
  softwareMonthly: "Monthly software subscriptions (EMR, billing, etc.)",
  marketingMonthly: "Monthly marketing and advertising budget",
  suppliesPerMember: "Average monthly medical supplies cost per active member",
  
  // Section 5: Staffing
  staffingRatio: "Target ratio of support staff to physicians",
  
  // Section 6: Growth
  growthMultiplier: "Multiplier applied to monthly growth rates (1.0 = baseline, >1.0 = accelerated growth)",
};

