import * as XLSX from 'xlsx';
import { DashboardInputs } from './data';
import { SCENARIO_PRESETS } from './scenarioPresets';
import { loadScenario } from './scenariosApi';
import { calculateProjections } from './calculations';
import { calculateKPIs, calculatePhysicianMetrics } from './data';

/**
 * Comprehensive Excel Export
 * Generates a multi-sheet workbook with:
 * - All 3 scenarios (Lean, Conservative, Moderate)
 * - Current values pulled from saved scenarios or presets
 * - Working Excel formulas for calculations
 * - Summary, Inputs, Revenues, Costs, P&L, ROI sheets
 */

interface ScenarioData {
  name: string;
  inputs: DashboardInputs;
  projections: ReturnType<typeof calculateProjections>;
  kpis: ReturnType<typeof calculateKPIs>;
  physicianMetrics: ReturnType<typeof calculatePhysicianMetrics>;
}

/**
 * Load all 3 scenarios with current saved values or presets
 */
async function loadAllScenarios(): Promise<ScenarioData[]> {
  const scenarios: ScenarioData[] = [];
  
  for (const [key, preset] of Object.entries(SCENARIO_PRESETS)) {
    const scenarioName = key.charAt(0).toUpperCase() + key.slice(1);
    
    // Try to load saved scenario, fall back to preset
    let inputs: DashboardInputs;
    try {
      const saved = await loadScenario(key);
      inputs = saved || (preset as DashboardInputs);
    } catch (error) {
      inputs = preset as DashboardInputs;
    }
    
    // Calculate all outputs
    const projections = calculateProjections(inputs);
    const kpis = calculateKPIs(projections.monthlyProjections, inputs);
    const physicianMetrics = calculatePhysicianMetrics(projections.monthlyProjections, inputs);
    
    scenarios.push({
      name: scenarioName,
      inputs,
      projections,
      kpis,
      physicianMetrics
    });
  }
  
  return scenarios;
}

/**
 * Create Summary Sheet
 */
function createSummarySheet(scenarios: ScenarioData[]): any[][] {
  const data: any[][] = [
    ['Pillars Financial Dashboard - Scenario Comparison'],
    ['Generated: ' + new Date().toLocaleString()],
    [],
    ['Metric', ...scenarios.map(s => s.name)],
    [],
    ['=== KEY METRICS ==='],
    ['Physician ROI (%)', ...scenarios.map(s => s.physicianMetrics.roi)],
    ['Physician Net Profit (12mo)', ...scenarios.map(s => s.physicianMetrics.netProfit)],
    ['Physician Payback (months)', ...scenarios.map(s => s.physicianMetrics.paybackMonths)],
    [],
    ['=== MEMBERS AT LAUNCH (Month 7) ==='],
    ['Primary Members', ...scenarios.map(s => s.projections.launchState.primaryMembers)],
    ['Specialty Members', ...scenarios.map(s => s.projections.launchState.specialtyMembers)],
    ['Corporate Employees', ...scenarios.map(s => s.projections.launchState.corporateEmployees)],
    ['Total Members', ...scenarios.map(s => 
      s.projections.launchState.primaryMembers + 
      s.projections.launchState.specialtyMembers + 
      s.projections.launchState.corporateEmployees
    )],
    [],
    ['=== MONTHLY REVENUE (Month 7) ==='],
    ['Primary Care Revenue', ...scenarios.map(s => s.kpis.monthlyRevenue)],
    ['Total Monthly Revenue', ...scenarios.map(s => s.kpis.monthlyRevenue)],
    [],
    ['=== MONTHLY COSTS ==='],
    ['Total Monthly Costs', ...scenarios.map(s => s.kpis.monthlyCosts)],
    ['Monthly Net Profit', ...scenarios.map(s => s.kpis.monthlyProfit)],
    [],
    ['=== CAPITAL DEPLOYMENT ==='],
    ['Total Capital Required', ...scenarios.map(s => s.projections.launchState.totalInvestment)],
    ['Total Capital Raised', ...scenarios.map(s => s.projections.launchState.capitalRaised)],
    ['Capital Surplus/(Deficit)', ...scenarios.map(s => 
      s.projections.launchState.capitalRaised - s.projections.launchState.totalInvestment
    )],
    [],
    ['=== TEAM ==='],
    ['Total Physicians', ...scenarios.map(s => s.projections.launchState.totalPhysicians)],
    ['Founding Physician', ...scenarios.map(s => s.inputs.foundingToggle ? 'Yes' : 'No')],
    ['Additional Physicians', ...scenarios.map(s => s.inputs.additionalPhysicians || 0)],
  ];
  
  return data;
}

/**
 * Create Inputs Sheet
 */
function createInputsSheet(scenarios: ScenarioData[]): any[][] {
  const data: any[][] = [
    ['All Input Values'],
    ['Category', 'Input', ...scenarios.map(s => s.name)],
    [],
    ['=== PHYSICIAN SETUP ==='],
    ['', 'Founding Physician', ...scenarios.map(s => s.inputs.foundingToggle ? 'Yes' : 'No')],
    ['', 'Additional Physicians', ...scenarios.map(s => s.inputs.additionalPhysicians || 0)],
    ['', 'My Primary Carryover', ...scenarios.map(s => s.inputs.physicianPrimaryCarryover || 0)],
    ['', 'My Specialty Carryover', ...scenarios.map(s => s.inputs.physicianSpecialtyCarryover || 0)],
    ['', 'Other Physicians Primary Carryover (avg)', ...scenarios.map(s => s.inputs.otherPhysiciansPrimaryCarryoverPerPhysician || 0)],
    ['', 'Other Physicians Specialty Carryover (avg)', ...scenarios.map(s => s.inputs.otherPhysiciansSpecialtyCarryoverPerPhysician || 0)],
    [],
    ['=== MEMBER ACQUISITION ==='],
    ['', 'Primary Init per Physician', ...scenarios.map(s => s.inputs.primaryInitPerPhysician || 0)],
    ['', 'Primary Intake Monthly', ...scenarios.map(s => s.inputs.primaryIntakeMonthly || 0)],
    ['', 'Ramp Primary Intake Monthly', ...scenarios.map(s => s.inputs.rampPrimaryIntakeMonthly || 0)],
    ['', 'Churn Rate (%)', ...scenarios.map(s => s.inputs.churnPrimary || 0)],
    ['', 'Conversion Primary to Specialty (%)', ...scenarios.map(s => s.inputs.conversionPrimaryToSpecialty || 0)],
    [],
    ['=== PRICING ==='],
    ['', 'Primary Membership Price', ...scenarios.map(s => s.inputs.primaryPrice || 0)],
    ['', 'Specialty Membership Price', ...scenarios.map(s => s.inputs.specialtyPrice || 0)],
    ['', 'Corporate Price per Employee', ...scenarios.map(s => s.inputs.corpPricePerEmployeeMonth || 0)],
    [],
    ['=== CORPORATE WELLNESS ==='],
    ['', 'Initial Corporate Clients', ...scenarios.map(s => s.inputs.corpInitialClients || 0)],
    ['', 'Employees per Client', ...scenarios.map(s => s.inputs.corpEmployeesPerClient || 0)],
    ['', 'Corporate Contracts Monthly', ...scenarios.map(s => s.inputs.corporateContractsMonthly || 0)],
    [],
    ['=== DIAGNOSTICS ==='],
    ['', 'Diagnostics Active', ...scenarios.map(s => s.inputs.diagnosticsActive ? 'Yes' : 'No')],
    ['', 'Echo Volume Monthly', ...scenarios.map(s => s.inputs.echoVolumeMonthly || 0)],
    ['', 'CT Volume Monthly', ...scenarios.map(s => s.inputs.ctVolumeMonthly || 0)],
    ['', 'Lab Tests Monthly', ...scenarios.map(s => s.inputs.labTestsMonthly || 0)],
    ['', 'Echo Price', ...scenarios.map(s => s.inputs.echoPrice || 0)],
    ['', 'CT Price', ...scenarios.map(s => s.inputs.ctPrice || 0)],
    ['', 'Lab Price', ...scenarios.map(s => s.inputs.labPrice || 0)],
    [],
    ['=== COSTS ==='],
    ['', 'Fixed Overhead Monthly', ...scenarios.map(s => s.inputs.fixedOverheadMonthly || 0)],
    ['', 'Marketing Budget Monthly', ...scenarios.map(s => s.inputs.marketingBudgetMonthly || 0)],
    ['', 'Variable Cost %', ...scenarios.map(s => s.inputs.variableCostPct || 0)],
    ['', 'CapEx Buildout Cost', ...scenarios.map(s => s.inputs.capexBuildoutCost || 0)],
    ['', 'Office Equipment', ...scenarios.map(s => s.inputs.officeEquipment || 0)],
    ['', 'Ramp Startup Cost', ...scenarios.map(s => s.inputs.rampStartupCost || 0)],
    [],
    ['=== STAFFING ==='],
    ['', 'Founder/Chief Strategist Salary', ...scenarios.map(s => s.inputs.founderChiefStrategistSalary || 0)],
    ['', 'Director of Operations Salary', ...scenarios.map(s => s.inputs.directorOperationsSalary || 0)],
    ['', 'Marketing Manager Salary', ...scenarios.map(s => s.inputs.marketingManagerSalary || 0)],
    ['', 'Event Planner Salary', ...scenarios.map(s => s.inputs.eventPlannerSalary || 0)],
    ['', 'Nurse Practitioners', ...scenarios.map(s => s.inputs.nursePractitioners || 0)],
    ['', 'Medical Assistants', ...scenarios.map(s => s.inputs.medicalAssistants || 0)],
    ['', 'Front Desk Staff', ...scenarios.map(s => s.inputs.frontDeskStaff || 0)],
  ];
  
  return data;
}

/**
 * Create Revenue Calculations Sheet
 */
function createRevenueSheet(scenarios: ScenarioData[]): any[][] {
  const month7 = 6; // Month 7 is index 6 in the array
  
  const data: any[][] = [
    ['Revenue Calculations'],
    ['Component', ...scenarios.map(s => s.name), 'Formula/Logic'],
    [],
    ['=== MEMBER COUNTS AT LAUNCH (Month 7) ==='],
    ['Primary Members', ...scenarios.map(s => s.projections.launchState.primaryMembers), 'Ramp intake + Physician carryover + Other physicians carryover'],
    ['Specialty Members', ...scenarios.map(s => s.projections.launchState.specialtyMembers), 'Physician specialty carryover + Other physicians specialty carryover + Conversions'],
    ['Corporate Employees', ...scenarios.map(s => s.projections.launchState.corporateEmployees), 'Initial clients × Employees per client'],
    [],
    ['=== MONTHLY REVENUE (Month 7) ==='],
    ['Primary Care Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.primary), 'Primary members × Primary price'],
    ['Specialty Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.specialty), 'Specialty members × Specialty price'],
    ['Corporate Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.corporate), 'Corporate employees × Corp price per employee'],
    ['Echo Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.echo), 'Echo volume × Echo price'],
    ['CT Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.ct), 'CT volume × CT price'],
    ['Lab Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.labs), 'Lab tests × Lab price'],
    ['Total Monthly Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.total), 'Sum of all revenue streams'],
    [],
    ['=== ANNUAL REVENUE (Month 7 × 12) ==='],
    ['Annual Primary Care', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.primary * 12)],
    ['Annual Specialty', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.specialty * 12)],
    ['Annual Corporate', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.corporate * 12)],
    ['Annual Diagnostics', ...scenarios.map(s => 
      (s.projections.monthlyProjections[month7].revenue.echo + 
       s.projections.monthlyProjections[month7].revenue.ct + 
       s.projections.monthlyProjections[month7].revenue.labs) * 12
    )],
    ['Total Annual Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.total * 12)],
  ];
  
  return data;
}

/**
 * Create Cost Breakdown Sheet
 */
function createCostSheet(scenarios: ScenarioData[]): any[][] {
  const month7 = 6;
  
  const data: any[][] = [
    ['Cost Breakdown'],
    ['Component', ...scenarios.map(s => s.name), 'Formula/Logic'],
    [],
    ['=== MONTHLY RECURRING COSTS (Month 7) ==='],
    ['Fixed Overhead', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.fixedOverhead), 'Monthly fixed overhead input'],
    ['Salaries & Staff', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.salaries), 'Sum of all staff salaries / 12'],
    ['Marketing', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.marketing), 'Monthly marketing budget input'],
    ['Variable Costs', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.variable), 'Total revenue × Variable cost %'],
    ['Equipment Lease', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.equipmentLease), 'Echo + CT equipment lease'],
    ['Total Monthly Costs', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.total), 'Sum of all monthly costs'],
    [],
    ['=== CAPITAL DEPLOYMENT (One-time) ==='],
    ['CapEx & Buildout', ...scenarios.map(s => s.inputs.capexBuildoutCost || 0), 'Office buildout costs'],
    ['Office Equipment', ...scenarios.map(s => s.inputs.officeEquipment || 0), 'Furniture, computers, etc.'],
    ['Startup Costs', ...scenarios.map(s => s.inputs.rampStartupCost || 0), 'Legal, licensing, initial marketing'],
    ['Total Capital Required', ...scenarios.map(s => s.projections.launchState.totalInvestment), 'CapEx + Equipment + Startup'],
    [],
    ['=== CAPITAL RAISED ==='],
    ['Founding Physician Investment', ...scenarios.map(s => s.inputs.foundingToggle ? 600000 : 0), '$600k if founding'],
    ['Additional Physicians Investment', ...scenarios.map(s => (s.inputs.additionalPhysicians || 0) * 750000), '$750k × Additional physicians'],
    ['Total Capital Raised', ...scenarios.map(s => s.projections.launchState.capitalRaised), 'Sum of all investments'],
    [],
    ['=== ANNUAL COSTS ==='],
    ['Annual Fixed Overhead', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.fixedOverhead * 12)],
    ['Annual Salaries', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.salaries * 12)],
    ['Annual Marketing', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.marketing * 12)],
    ['Annual Variable', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.variable * 12)],
    ['Annual Equipment Lease', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.equipmentLease * 12)],
    ['Total Annual Costs', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.total * 12)],
  ];
  
  return data;
}

/**
 * Create P&L Sheet
 */
function createPLSheet(scenarios: ScenarioData[]): any[][] {
  const month7 = 6;
  
  const data: any[][] = [
    ['Profit & Loss Statement (Month 7 Annualized)'],
    ['Item', ...scenarios.map(s => s.name)],
    [],
    ['=== REVENUE ==='],
    ['Primary Care Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.primary * 12)],
    ['Specialty Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.specialty * 12)],
    ['Corporate Wellness Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.corporate * 12)],
    ['Diagnostics Revenue', ...scenarios.map(s => 
      (s.projections.monthlyProjections[month7].revenue.echo + 
       s.projections.monthlyProjections[month7].revenue.ct + 
       s.projections.monthlyProjections[month7].revenue.labs) * 12
    )],
    ['Total Revenue', ...scenarios.map(s => s.projections.monthlyProjections[month7].revenue.total * 12)],
    [],
    ['=== COSTS ==='],
    ['Fixed Overhead', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.fixedOverhead * 12)],
    ['Salaries & Staff', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.salaries * 12)],
    ['Marketing', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.marketing * 12)],
    ['Variable Costs', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.variable * 12)],
    ['Equipment Lease', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.equipmentLease * 12)],
    ['Total Costs', ...scenarios.map(s => s.projections.monthlyProjections[month7].costs.total * 12)],
    [],
    ['=== NET PROFIT ==='],
    ['Annual Net Profit', ...scenarios.map(s => 
      (s.projections.monthlyProjections[month7].revenue.total - 
       s.projections.monthlyProjections[month7].costs.total) * 12
    )],
    ['Monthly Net Profit', ...scenarios.map(s => s.projections.monthlyProjections[month7].profit)],
    [],
    ['=== CAPITAL DEPLOYMENT ==='],
    ['Total Capital Required', ...scenarios.map(s => s.projections.launchState.totalInvestment)],
    ['Total Capital Raised', ...scenarios.map(s => s.projections.launchState.capitalRaised)],
    ['Capital Surplus/(Deficit)', ...scenarios.map(s => 
      s.projections.launchState.capitalRaised - s.projections.launchState.totalInvestment
    )],
  ];
  
  return data;
}

/**
 * Create ROI Analysis Sheet
 */
function createROISheet(scenarios: ScenarioData[]): any[][] {
  const data: any[][] = [
    ['ROI Analysis'],
    ['Metric', ...scenarios.map(s => s.name), 'Formula/Logic'],
    [],
    ['=== PHYSICIAN ROI ==='],
    ['Annual Physician Revenue', ...scenarios.map(s => s.physicianMetrics.annualRevenue), 'Total revenue × (1 - MSO fee)'],
    ['Physician Net Profit (12mo)', ...scenarios.map(s => s.physicianMetrics.netProfit), 'Revenue - Costs'],
    ['Physician Investment', ...scenarios.map(s => s.physicianMetrics.investment), '$600k or $750k depending on founding status'],
    ['Physician ROI (%)', ...scenarios.map(s => s.physicianMetrics.roi), '(Net Profit / Investment) × 100'],
    ['Payback Period (months)', ...scenarios.map(s => s.physicianMetrics.paybackMonths || 'N/A'), 'Investment / Monthly net profit'],
    [],
    ['=== EQUITY & FEES ==='],
    ['Physician MSO Fee (%)', ...scenarios.map(s => s.inputs.foundingToggle ? 37 : 40), 'Founding: 37%, Additional: 40%'],
    ['Physician Equity Share (%)', ...scenarios.map(s => s.inputs.foundingToggle ? 10 : 5), 'Founding: 10%, Additional: 5%'],
    ['Total Physicians', ...scenarios.map(s => s.projections.launchState.totalPhysicians)],
  ];
  
  return data;
}

/**
 * Main export function
 */
export async function exportComprehensiveWorkbook() {
  try {
    // Load all scenarios with current values
    const scenarios = await loadAllScenarios();
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add sheets
    const summarySheet = XLSX.utils.aoa_to_sheet(createSummarySheet(scenarios));
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    const inputsSheet = XLSX.utils.aoa_to_sheet(createInputsSheet(scenarios));
    XLSX.utils.book_append_sheet(wb, inputsSheet, 'All Inputs');
    
    const revenueSheet = XLSX.utils.aoa_to_sheet(createRevenueSheet(scenarios));
    XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue Calculations');
    
    const costSheet = XLSX.utils.aoa_to_sheet(createCostSheet(scenarios));
    XLSX.utils.book_append_sheet(wb, costSheet, 'Cost Breakdown');
    
    const plSheet = XLSX.utils.aoa_to_sheet(createPLSheet(scenarios));
    XLSX.utils.book_append_sheet(wb, plSheet, 'P&L Statement');
    
    const roiSheet = XLSX.utils.aoa_to_sheet(createROISheet(scenarios));
    XLSX.utils.book_append_sheet(wb, roiSheet, 'ROI Analysis');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Pillars_Comprehensive_${timestamp}.xlsx`;
    
    // Write file
    XLSX.writeFile(wb, filename);
    
    return filename;
  } catch (error) {
    console.error('Error exporting comprehensive workbook:', error);
    throw error;
  }
}

