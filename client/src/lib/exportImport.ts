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
    physicians_launch: number;
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
    corp_employees_per_contract: number;
    corp_price_per_employee_month: number;
    physician_primary_carryover: number;
    physician_specialty_carryover: number;
    other_physicians_primary_carryover_per_physician: number;
    other_physicians_specialty_carryover_per_physician: number;
  };
  
  section_3_diagnostics: {
    diagnostics_active: boolean;
    diagnostics_start_month: number;
    echo_price: number;
    echo_volume_monthly: number;
    ct_price: number;
    ct_volume_monthly: number;
    lab_tests_price: number;
    lab_tests_monthly: number;
  };
  
  section_4_costs: {
    fixed_overhead_monthly: number;
    variable_cost_pct: number;
    marketing_budget_monthly: number;
  };
  
  section_5_staffing: {
    executive_comp_pct: number;
    staff_ramp_curve: "linear" | "scurve" | "stepwise";
    additional_physicians: number;
  };
  
  section_6_growth: {
    growth_curve_shape: "linear" | "scurve" | "exponential";
    primary_growth_rate: number;
    specialty_growth_rate: number;
    corporate_growth_rate: number;
    diagnostic_growth_rate: number;
    growth_time_horizon: number;
    primary_intake_monthly: number;
    conversion_primary_to_specialty: number;
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
      physicians_launch: inputs.physiciansLaunch,
      primary_price: inputs.primaryPrice,
      specialty_price: inputs.specialtyPrice,
      inflation_rate: inputs.inflationRate,
      churn_primary: inputs.churnPrimary,
      initial_corporate_clients: inputs.initialCorporateClients || 0,
      random_seed: inputs.randomSeed,
    },
    
    section_2_revenues: {
      primary_init_per_physician: inputs.primaryInitPerPhysician,
      specialty_init_per_physician: inputs.specialtyInitPerPhysician,
      corporate_contracts_monthly: inputs.corporateContractsMonthly,
      corp_employees_per_contract: inputs.corpEmployeesPerContract,
      corp_price_per_employee_month: inputs.corpPricePerEmployeeMonth,
      physician_primary_carryover: inputs.physicianPrimaryCarryover,
      physician_specialty_carryover: inputs.physicianSpecialtyCarryover,
      other_physicians_primary_carryover_per_physician: inputs.otherPhysiciansPrimaryCarryoverPerPhysician,
      other_physicians_specialty_carryover_per_physician: inputs.otherPhysiciansSpecialtyCarryoverPerPhysician,
    },
    
    section_3_diagnostics: {
      diagnostics_active: inputs.diagnosticsActive,
      diagnostics_start_month: inputs.diagnosticsStartMonth,
      echo_price: inputs.echoPrice,
      echo_volume_monthly: inputs.echoVolumeMonthly,
      ct_price: inputs.ctPrice,
      ct_volume_monthly: inputs.ctVolumeMonthly,
      lab_tests_price: inputs.labTestsPrice,
      lab_tests_monthly: inputs.labTestsMonthly,
    },
    
    section_4_costs: {
      fixed_overhead_monthly: inputs.fixedOverheadMonthly,
      variable_cost_pct: inputs.variableCostPct,
      marketing_budget_monthly: inputs.marketingBudgetMonthly,
    },
    
    section_5_staffing: {
      executive_comp_pct: inputs.executiveCompPct,
      staff_ramp_curve: inputs.staffRampCurve,
      additional_physicians: inputs.additionalPhysicians,
    },
    
    section_6_growth: {
      growth_curve_shape: inputs.growthCurveShape,
      primary_growth_rate: inputs.primaryGrowthRate,
      specialty_growth_rate: inputs.specialtyGrowthRate,
      corporate_growth_rate: inputs.corporateGrowthRate,
      diagnostic_growth_rate: inputs.diagnosticGrowthRate,
      growth_time_horizon: inputs.growthTimeHorizon,
      primary_intake_monthly: inputs.primaryIntakeMonthly,
      conversion_primary_to_specialty: inputs.conversionPrimaryToSpecialty,
    },
    
    derived: {
      mso_fee: "0.37 if founding_toggle else 0.40",
      equity_share: "0.10 if founding_toggle else 0.05",
      capital_from_physicians: "(physicians_launch * 600000) + (additional_physicians * 750000)",
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
    physiciansLaunch: data.section_1_inputs.physicians_launch,
    primaryPrice: data.section_1_inputs.primary_price,
    specialtyPrice: data.section_1_inputs.specialty_price,
    inflationRate: data.section_1_inputs.inflation_rate,
    churnPrimary: data.section_1_inputs.churn_primary,
    initialCorporateClients: data.section_1_inputs.initial_corporate_clients,
    randomSeed: data.section_1_inputs.random_seed,
    
    // Section 2
    primaryInitPerPhysician: data.section_2_revenues.primary_init_per_physician,
    specialtyInitPerPhysician: data.section_2_revenues.specialty_init_per_physician,
    corporateContractsMonthly: data.section_2_revenues.corporate_contracts_monthly,
    corpEmployeesPerContract: data.section_2_revenues.corp_employees_per_contract,
    corpPricePerEmployeeMonth: data.section_2_revenues.corp_price_per_employee_month,
    physicianPrimaryCarryover: data.section_2_revenues.physician_primary_carryover,
    physicianSpecialtyCarryover: data.section_2_revenues.physician_specialty_carryover,
    otherPhysiciansPrimaryCarryoverPerPhysician: data.section_2_revenues.other_physicians_primary_carryover_per_physician,
    otherPhysiciansSpecialtyCarryoverPerPhysician: data.section_2_revenues.other_physicians_specialty_carryover_per_physician,
    
    // Section 3
    diagnosticsActive: data.section_3_diagnostics.diagnostics_active,
    diagnosticsStartMonth: data.section_3_diagnostics.diagnostics_start_month,
    echoPrice: data.section_3_diagnostics.echo_price,
    echoVolumeMonthly: data.section_3_diagnostics.echo_volume_monthly,
    ctPrice: data.section_3_diagnostics.ct_price,
    ctVolumeMonthly: data.section_3_diagnostics.ct_volume_monthly,
    labTestsPrice: data.section_3_diagnostics.lab_tests_price,
    labTestsMonthly: data.section_3_diagnostics.lab_tests_monthly,
    
    // Section 4
    fixedOverheadMonthly: data.section_4_costs.fixed_overhead_monthly,
    variableCostPct: data.section_4_costs.variable_cost_pct,
    marketingBudgetMonthly: data.section_4_costs.marketing_budget_monthly,
    
    // Section 5
    executiveCompPct: data.section_5_staffing.executive_comp_pct,
    staffRampCurve: data.section_5_staffing.staff_ramp_curve,
    additionalPhysicians: data.section_5_staffing.additional_physicians,
    
    // Section 6
    growthCurveShape: data.section_6_growth.growth_curve_shape,
    primaryGrowthRate: data.section_6_growth.primary_growth_rate,
    specialtyGrowthRate: data.section_6_growth.specialty_growth_rate,
    corporateGrowthRate: data.section_6_growth.corporate_growth_rate,
    diagnosticGrowthRate: data.section_6_growth.diagnostic_growth_rate,
    growthTimeHorizon: data.section_6_growth.growth_time_horizon,
    primaryIntakeMonthly: data.section_6_growth.primary_intake_monthly,
    conversionPrimaryToSpecialty: data.section_6_growth.conversion_primary_to_specialty,
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

