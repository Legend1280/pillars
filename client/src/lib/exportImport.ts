import { DashboardInputs } from "./data";

// New sectioned format (Pass 2+)
export interface SectionedScenarioExport {
  schema_version: string;
  calc_version: string;
  timestamp: string;
  scenario_id: string;
  
  section_1_inputs: {
    scenarioMode: "conservative" | "moderate" | "aggressive";
    foundingToggle: boolean;
    physiciansLaunch: number;
    additionalPhysicians: number;
    primaryInitPerPhysician: number;
    primaryIntakeMonthly: number;
    churnPrimary: number;
    conversionPrimaryToSpecialty: number;
    specialtyInitPerPhysician: number;
    physicianPrimaryCarryover: number;
    physicianSpecialtyCarryover: number;
    teamSpecialtyMultiplier: number;
    corporateContractsMonthly: number;
    corpEmployeesPerContract: number;
    corpPricePerEmployeeMonth: number;
    primaryPrice: number;
    specialtyPrice: number;
    inflationRate: number;
    randomSeed: number;
  };
  
  section_2_revenues: Record<string, any>; // Placeholder
  
  section_3_diagnostics: {
    diagnosticsActive: boolean;
    diagnosticsStartMonth: number;
    echoPrice: number;
    echoVolumeMonthly: number;
    ctPrice: number;
    ctVolumeMonthly: number;
    labTestsPrice: number;
    labTestsMonthly: number;
  };
  
  section_4_costs: {
    fixedOverheadMonthly: number;
    variableCostPct: number;
    marketingBudgetMonthly: number;
  };
  
  section_5_staffing: {
    executiveCompPct: number;
    staffRampCurve: "linear" | "scurve" | "stepwise";
  };
  
  section_6_growth: {
    growthCurveShape: "linear" | "scurve" | "exponential";
    primaryGrowthRate: number;
    specialtyGrowthRate: number;
    corporateGrowthRate: number;
    diagnosticGrowthRate: number;
    growthTimeHorizon: number;
  };
  
  section_7_risk?: Record<string, any>;
  section_8_governance?: Record<string, any>;
  section_9_export?: Record<string, any>;
  
  derived: {
    mso_fee: string;
    equity_share: string;
    capital_from_physicians: string;
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
 * Export to new sectioned JSON format
 */
export function exportPrimitives(
  inputs: DashboardInputs,
  scenarioName: string = "Untitled Scenario"
): SectionedScenarioExport {
  return {
    schema_version: "pass2-1.0.0",
    calc_version: "0.3.0",
    timestamp: new Date().toISOString(),
    scenario_id: scenarioName,
    
    section_1_inputs: {
      scenarioMode: inputs.scenarioMode,
      foundingToggle: inputs.foundingToggle,
      physiciansLaunch: inputs.physiciansLaunch,
      additionalPhysicians: inputs.additionalPhysicians,
      primaryInitPerPhysician: inputs.primaryInitPerPhysician,
      primaryIntakeMonthly: inputs.primaryIntakeMonthly,
      churnPrimary: inputs.churnPrimary,
      conversionPrimaryToSpecialty: inputs.conversionPrimaryToSpecialty,
      specialtyInitPerPhysician: inputs.specialtyInitPerPhysician,
      physicianPrimaryCarryover: inputs.physicianPrimaryCarryover,
      physicianSpecialtyCarryover: inputs.physicianSpecialtyCarryover,
      teamSpecialtyMultiplier: inputs.teamSpecialtyMultiplier,
      corporateContractsMonthly: inputs.corporateContractsMonthly,
      corpEmployeesPerContract: inputs.corpEmployeesPerContract,
      corpPricePerEmployeeMonth: inputs.corpPricePerEmployeeMonth,
      primaryPrice: inputs.primaryPrice,
      specialtyPrice: inputs.specialtyPrice,
      inflationRate: inputs.inflationRate,
      randomSeed: inputs.randomSeed,
    },
    
    section_2_revenues: {},
    
    section_3_diagnostics: {
      diagnosticsActive: inputs.diagnosticsActive,
      diagnosticsStartMonth: inputs.diagnosticsStartMonth,
      echoPrice: inputs.echoPrice,
      echoVolumeMonthly: inputs.echoVolumeMonthly,
      ctPrice: inputs.ctPrice,
      ctVolumeMonthly: inputs.ctVolumeMonthly,
      labTestsPrice: inputs.labTestsPrice,
      labTestsMonthly: inputs.labTestsMonthly,
    },
    
    section_4_costs: {
      fixedOverheadMonthly: inputs.fixedOverheadMonthly,
      variableCostPct: inputs.variableCostPct,
      marketingBudgetMonthly: inputs.marketingBudgetMonthly,
    },
    
    section_5_staffing: {
      executiveCompPct: inputs.executiveCompPct,
      staffRampCurve: inputs.staffRampCurve,
    },
    
    section_6_growth: {
      growthCurveShape: inputs.growthCurveShape,
      primaryGrowthRate: inputs.primaryGrowthRate,
      specialtyGrowthRate: inputs.specialtyGrowthRate,
      corporateGrowthRate: inputs.corporateGrowthRate,
      diagnosticGrowthRate: inputs.diagnosticGrowthRate,
      growthTimeHorizon: inputs.growthTimeHorizon,
    },
    
    derived: {
      mso_fee: "0.37 if founding_toggle else 0.40",
      equity_share: "0.10 if founding_toggle else 0.05",
      capital_from_physicians: "(physicians_launch * 600000) + (additional_physicians * 750000)",
    },
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
 * Convert sectioned format back to flat DashboardInputs
 */
function convertSectionedToInputs(data: SectionedScenarioExport): Partial<DashboardInputs> {
  return {
    ...data.section_1_inputs,
    ...data.section_3_diagnostics,
    ...data.section_4_costs,
    ...data.section_5_staffing,
    ...data.section_6_growth,
  };
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

