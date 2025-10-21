import { DashboardInputs } from "./data";

// Canonical sectioned format (Pass 2+) with snake_case
export interface SectionedScenarioExport {
  schema_version: string;
  calc_version: string;
  timestamp: string;
  scenario_id: string;
  
  section_1_inputs: {
    scenario_mode: "null" | "conservative" | "moderate";
    founding_toggle: boolean;
    // physicians_launch removed - now derived from foundingToggle
    primary_price: number;
    specialty_price: number;
    inflation_rate: number;
    churn_primary: number;
    initial_corporate_clients: number;
    random_seed: number;
  };
  
  section_2_revenues: {
    primary_init_per_physician: number;
    specialty_init_per_physician: number;
    corporate_contracts_monthly: number;
    corp_initial_clients: number;
    corp_price_per_employee_month: number;
    physician_primary_carryover: number;
    physician_specialty_carryover: number;
    other_physicians_primary_carryover_per_physician: number;
    other_physicians_specialty_carryover_per_physician: number;
  };
  
  section_3_diagnostics: {
    diagnostics_active: boolean;
    echo_start_month: number;
    echo_price: number;
    echo_volume_monthly: number;
    ct_start_month: number;
    ct_price: number;
    ct_volume_monthly: number;
    lab_tests_price: number;
    lab_tests_monthly: number;
    diagnostics_margin: number;
  };
  
  section_4_costs: {
    // Capital Expenditures
    capex_buildout_cost: number;
    office_equipment: number;
    // Startup Costs
    split_startup_across_two_months: boolean;
    startup_legal: number;
    startup_hr: number;
    startup_training: number;
    startup_technology: number;
    startup_permits: number;
    startup_inventory: number;
    startup_insurance: number;
    startup_marketing: number;
    startup_professional_fees: number;
    startup_other: number;
    // Operating Costs
    fixed_overhead_monthly: number;
    equipment_lease: number;
    marketing_budget_monthly: number;
    variable_cost_pct: number;
  };
  
  section_5_staffing: {
    founder_chief_strategist_salary: number;
    director_operations_salary: number;
    gm_hourly_rate: number;
    gm_weekly_hours: number;
    fractional_cfo_cost: number;
    event_salesperson_cost: number;
    np1_start_month: number;
    np1_salary: number;
    np2_start_month: number;
    np2_salary: number;
    admin_support_ratio: number;
    avg_admin_salary: number;
    additional_physicians: number;
  };
  
  section_6_growth: {
    dexafit_primary_intake_monthly: number;
    corporate_contract_sales_monthly: number;
    employees_per_contract: number;
    primary_to_specialty_conversion: number;
    diagnostics_expansion_rate: number;
  };
  
  section_7_risk?: Record<string, any>;
  section_8_governance?: Record<string, any>;
  section_9_export?: Record<string, any>;
  
  derived: {
    mso_fee: string;
    equity_share: string;
    capital_from_physicians: string;
    other_physicians_count: string;
    team_primary_stock_m1: string;
    team_specialty_stock_m1: string;
  };
}

// Legacy flat format (backward compatibility)
export interface LegacyScenarioExport {
  version: string;
  timestamp: string;
  scenarioName: string;
  primitives: DashboardInputs;
}

/**
 * Convert camelCase DashboardInputs to snake_case canonical export
 */
export function exportPrimitives(
  inputs: DashboardInputs,
  scenarioName: string = "Untitled Scenario"
): SectionedScenarioExport {
  return {
    schema_version: "pass2-1.0.1",
    calc_version: "0.3.0",
    timestamp: new Date().toISOString(),
    scenario_id: scenarioName,
    
    section_1_inputs: {
      scenario_mode: inputs.scenarioMode,
      founding_toggle: inputs.foundingToggle,
      // physicians_launch removed - now derived from foundingToggle
      primary_price: inputs.primaryPrice,
      specialty_price: inputs.specialtyPrice,
      inflation_rate: inputs.inflationRate,
      churn_primary: inputs.churnPrimary,
      initial_corporate_clients: inputs.initialCorporateClients || 0,
      random_seed: inputs.randomSeed,
    },
    
    section_2_revenues: {
      specialty_init_per_physician: inputs.specialtyInitPerPhysician,
      corporate_contracts_monthly: inputs.corporateContractsMonthly,
      corp_initial_clients: inputs.corpInitialClients,
      corp_price_per_employee_month: inputs.corpPricePerEmployeeMonth,
      physician_primary_carryover: inputs.physicianPrimaryCarryover,
      physician_specialty_carryover: inputs.physicianSpecialtyCarryover,
      other_physicians_primary_carryover_per_physician: inputs.otherPhysiciansPrimaryCarryoverPerPhysician,
      other_physicians_specialty_carryover_per_physician: inputs.otherPhysiciansSpecialtyCarryoverPerPhysician,
    },
    
    section_3_diagnostics: {
      diagnostics_active: inputs.diagnosticsActive,
      echo_start_month: inputs.echoStartMonth,
      echo_price: inputs.echoPrice,
      echo_volume_monthly: inputs.echoVolumeMonthly,
      ct_start_month: inputs.ctStartMonth,
      ct_price: inputs.ctPrice,
      ct_volume_monthly: inputs.ctVolumeMonthly,
      lab_tests_price: inputs.labTestsPrice,
      lab_tests_monthly: inputs.labTestsMonthly,
      diagnostics_margin: inputs.diagnosticsMargin,
    },
    
    section_4_costs: {
      // Capital Expenditures
      capex_buildout_cost: inputs.capexBuildoutCost,
      office_equipment: inputs.officeEquipment,
      // Startup Costs
      split_startup_across_two_months: inputs.splitStartupAcrossTwoMonths,
      startup_legal: inputs.startupLegal,
      startup_hr: inputs.startupHr,
      startup_training: inputs.startupTraining,
      startup_technology: inputs.startupTechnology,
      startup_permits: inputs.startupPermits,
      startup_inventory: inputs.startupInventory,
      startup_insurance: inputs.startupInsurance,
      startup_marketing: inputs.startupMarketing,
      startup_professional_fees: inputs.startupProfessionalFees,
      startup_other: inputs.startupOther,
      // Operating Costs
      fixed_overhead_monthly: inputs.fixedOverheadMonthly,
      equipment_lease: inputs.equipmentLease,
      marketing_budget_monthly: inputs.marketingBudgetMonthly,
      variable_cost_pct: inputs.variableCostPct,
    },
    
    section_5_staffing: {
      founder_chief_strategist_salary: inputs.founderChiefStrategistSalary,
      director_operations_salary: inputs.directorOperationsSalary,
      gm_hourly_rate: inputs.gmHourlyRate,
      gm_weekly_hours: inputs.gmWeeklyHours,
      fractional_cfo_cost: inputs.fractionalCfoCost,
      event_salesperson_cost: inputs.eventSalespersonCost,
      np1_start_month: inputs.np1StartMonth,
      np1_salary: inputs.np1Salary,
      np2_start_month: inputs.np2StartMonth,
      np2_salary: inputs.np2Salary,
      admin_support_ratio: inputs.adminSupportRatio,
      avg_admin_salary: inputs.avgAdminSalary,
      additional_physicians: inputs.additionalPhysicians,
    },
    
    section_6_growth: {
      dexafit_primary_intake_monthly: inputs.dexafitPrimaryIntakeMonthly,
      corporate_contract_sales_monthly: inputs.corporateContractSalesMonthly,
      employees_per_contract: inputs.employeesPerContract,
      primary_to_specialty_conversion: inputs.primaryToSpecialtyConversion,
      diagnostics_expansion_rate: inputs.diagnosticsExpansionRate,
    },
    
    derived: {
      mso_fee: "0.37 if founding_toggle else 0.40",
      equity_share: "0.10 if founding_toggle else 0.05",
      capital_from_physicians: "(physicians_launch * BUSINESS_RULES.FOUNDING_INVESTMENT) + (additional_physicians * BUSINESS_RULES.ADDITIONAL_INVESTMENT)",
      other_physicians_count: "max(physicians_launch - 1, 0)",
      team_primary_stock_m1: "other_physicians_count * other_physicians_primary_carryover_per_physician",
      team_specialty_stock_m1: "other_physicians_count * other_physicians_specialty_carryover_per_physician",
    },
  };
}

/**
 * Convert snake_case canonical import back to camelCase DashboardInputs
 */
export function convertSectionedToInputs(data: SectionedScenarioExport): Partial<DashboardInputs> {
  return {
    // Section 1
    scenarioMode: data.section_1_inputs.scenario_mode,
    foundingToggle: data.section_1_inputs.founding_toggle,
    // physiciansLaunch removed - now derived from foundingToggle
    primaryPrice: data.section_1_inputs.primary_price,
    specialtyPrice: data.section_1_inputs.specialty_price,
    inflationRate: data.section_1_inputs.inflation_rate,
    churnPrimary: data.section_1_inputs.churn_primary,
    initialCorporateClients: data.section_1_inputs.initial_corporate_clients,
    randomSeed: data.section_1_inputs.random_seed,
    
    // Section 2
    specialtyInitPerPhysician: data.section_2_revenues.specialty_init_per_physician,
    corporateContractsMonthly: data.section_2_revenues.corporate_contracts_monthly,
    corpInitialClients: data.section_2_revenues.corp_initial_clients,
    corpPricePerEmployeeMonth: data.section_2_revenues.corp_price_per_employee_month,
    physicianPrimaryCarryover: data.section_2_revenues.physician_primary_carryover,
    physicianSpecialtyCarryover: data.section_2_revenues.physician_specialty_carryover,
    otherPhysiciansPrimaryCarryoverPerPhysician: data.section_2_revenues.other_physicians_primary_carryover_per_physician,
    otherPhysiciansSpecialtyCarryoverPerPhysician: data.section_2_revenues.other_physicians_specialty_carryover_per_physician,
    
    // Section 3
    diagnosticsActive: data.section_3_diagnostics.diagnostics_active,
    echoStartMonth: data.section_3_diagnostics.echo_start_month,
    echoPrice: data.section_3_diagnostics.echo_price,
    echoVolumeMonthly: data.section_3_diagnostics.echo_volume_monthly,
    ctStartMonth: data.section_3_diagnostics.ct_start_month,
    ctPrice: data.section_3_diagnostics.ct_price,
    ctVolumeMonthly: data.section_3_diagnostics.ct_volume_monthly,
    labTestsPrice: data.section_3_diagnostics.lab_tests_price,
    labTestsMonthly: data.section_3_diagnostics.lab_tests_monthly,
    diagnosticsMargin: data.section_3_diagnostics.diagnostics_margin,
    
    // Section 4 - Capital Expenditures
    capexBuildoutCost: data.section_4_costs.capex_buildout_cost,
    officeEquipment: data.section_4_costs.office_equipment,
    // Section 4 - Startup Costs
    splitStartupAcrossTwoMonths: data.section_4_costs.split_startup_across_two_months,
    startupLegal: data.section_4_costs.startup_legal,
    startupHr: data.section_4_costs.startup_hr,
    startupTraining: data.section_4_costs.startup_training,
    startupTechnology: data.section_4_costs.startup_technology,
    startupPermits: data.section_4_costs.startup_permits,
    startupInventory: data.section_4_costs.startup_inventory ?? 15000,
    startupInsurance: data.section_4_costs.startup_insurance ?? 45000,
    startupMarketing: data.section_4_costs.startup_marketing ?? 35000,
    startupProfessionalFees: data.section_4_costs.startup_professional_fees ?? 25000,
    startupOther: data.section_4_costs.startup_other ?? 20000,
    // Section 4 - Operating Costs
    fixedOverheadMonthly: data.section_4_costs.fixed_overhead_monthly,
    equipmentLease: data.section_4_costs.equipment_lease,
    marketingBudgetMonthly: data.section_4_costs.marketing_budget_monthly,
    variableCostPct: data.section_4_costs.variable_cost_pct,
    // Section 4 - Derived metrics removed (will be recalculated automatically)
    
    // Section 5
    founderChiefStrategistSalary: data.section_5_staffing.founder_chief_strategist_salary,
    directorOperationsSalary: data.section_5_staffing.director_operations_salary,
    gmHourlyRate: data.section_5_staffing.gm_hourly_rate,
    gmWeeklyHours: data.section_5_staffing.gm_weekly_hours,
    fractionalCfoCost: data.section_5_staffing.fractional_cfo_cost,
    eventSalespersonCost: data.section_5_staffing.event_salesperson_cost,
    np1StartMonth: data.section_5_staffing.np1_start_month,
    np1Salary: data.section_5_staffing.np1_salary,
    np2StartMonth: data.section_5_staffing.np2_start_month,
    np2Salary: data.section_5_staffing.np2_salary,
    adminSupportRatio: data.section_5_staffing.admin_support_ratio,
    avgAdminSalary: data.section_5_staffing.avg_admin_salary,
    additionalPhysicians: data.section_5_staffing.additional_physicians,
    
    // Section 6: Growth Drivers
    dexafitPrimaryIntakeMonthly: data.section_6_growth.dexafit_primary_intake_monthly,
    corporateContractSalesMonthly: data.section_6_growth.corporate_contract_sales_monthly,
    employeesPerContract: data.section_6_growth.employees_per_contract,
    primaryToSpecialtyConversion: data.section_6_growth.primary_to_specialty_conversion,
    diagnosticsExpansionRate: data.section_6_growth.diagnostics_expansion_rate,
  };
}

/**
 * Download JSON file
 */
export function downloadJSON(data: SectionedScenarioExport | LegacyScenarioExport, filename?: string) {
  const name = filename || `pillars_${'scenario_id' in data ? data.scenario_id : 'scenarioName' in data ? data.scenarioName : 'export'}_${Date.now()}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name.replace(/\s+/g, "_");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported scenario (supports both formats)
 */
export function validateScenario(data: any): { valid: boolean; error?: string; format?: 'sectioned' | 'legacy' } {
  // Check for sectioned format
  if (data.section_1_inputs && data.schema_version) {
    return { valid: true, format: 'sectioned' };
  }
  
  // Check for legacy format
  if (data.primitives && data.version) {
    return { valid: true, format: 'legacy' };
  }
  
  return { valid: false, error: "Unknown format. Expected sectioned (Pass 2+) or legacy format." };
}

/**
 * Import primitives from JSON (supports both formats)
 */
export function importPrimitives(file: File): Promise<Partial<DashboardInputs>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const validation = validateScenario(data);
        
        if (!validation.valid) {
          reject(new Error(validation.error));
          return;
        }
        
        if (validation.format === 'sectioned') {
          const imported = convertSectionedToInputs(data as SectionedScenarioExport);
          resolve(imported);
        } else if (validation.format === 'legacy') {
          resolve(data.primitives as Partial<DashboardInputs>);
        } else {
          reject(new Error("Unknown format"));
        }
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Save scenario to localStorage
 */
export function saveScenarioToLocal(inputs: DashboardInputs, scenarioName: string) {
  const saved = getSavedScenarios();
  const scenario = exportPrimitives(inputs, scenarioName);
  saved.push(scenario);
  localStorage.setItem("pillars_scenarios", JSON.stringify(saved));
}

/**
 * Get all saved scenarios from localStorage
 */
export function getSavedScenarios(): SectionedScenarioExport[] {
  const data = localStorage.getItem("pillars_scenarios");
  return data ? JSON.parse(data) : [];
}

/**
 * Delete a saved scenario
 */
export function deleteScenario(timestamp: string) {
  const saved = getSavedScenarios();
  const filtered = saved.filter((s) => s.timestamp !== timestamp);
  localStorage.setItem("pillars_scenarios", JSON.stringify(filtered));
}

