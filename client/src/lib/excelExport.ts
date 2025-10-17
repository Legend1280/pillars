import * as XLSX from 'xlsx';
import { DashboardInputs } from './data';

interface PrimitiveRow {
  'Control Label': string;
  'Primitive ID': string;
  'Type / Control': string;
  'Default / Range': string;
  'Formula / Logic': string;
  'Tooltip': string;
}

export function exportPrimitivesToExcel(inputs: DashboardInputs) {
  const primitives: PrimitiveRow[] = [
    // Section 1: Inputs & Scenarios
    { 'Control Label': '═══ SECTION 1: INPUTS & SCENARIOS ═══', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    {
      'Control Label': 'Scenario Mode',
      'Primitive ID': 'scenario_mode',
      'Type / Control': 'Dropdown',
      'Default / Range': 'conservative (null | conservative | moderate)',
      'Formula / Logic': 'Preset multipliers',
      'Tooltip': 'Select overall operating assumptions'
    },
    {
      'Control Label': 'Founding Physician Model',
      'Primitive ID': 'founding_toggle',
      'Type / Control': 'Toggle',
      'Default / Range': 'true',
      'Formula / Logic': 'Affects MSO fee (37% vs 40%) and equity (10% vs 5%)',
      'Tooltip': 'Founding physicians get better terms'
    },
    {
      'Control Label': 'Physicians at Launch',
      'Primitive ID': 'physicians_launch',
      'Type / Control': 'Slider',
      'Default / Range': '3 (1-10)',
      'Formula / Logic': 'Used in capital calculation',
      'Tooltip': 'Number of founding physicians'
    },
    {
      'Control Label': 'Primary Price / Member / Month',
      'Primitive ID': 'primary_price',
      'Type / Control': 'Slider',
      'Default / Range': '$500 ($300-$1000)',
      'Formula / Logic': 'Revenue = members × price',
      'Tooltip': 'Monthly membership fee for primary care'
    },
    {
      'Control Label': 'Specialty Visit Price',
      'Primitive ID': 'specialty_price',
      'Type / Control': 'Slider',
      'Default / Range': '$500 ($300-$1500)',
      'Formula / Logic': 'Revenue = visits × price',
      'Tooltip': 'Fee per specialty consultation'
    },
    {
      'Control Label': 'Inflation Rate %',
      'Primitive ID': 'inflation_rate',
      'Type / Control': 'Slider',
      'Default / Range': '2% (0-10%)',
      'Formula / Logic': 'Applied to costs annually',
      'Tooltip': 'Annual cost inflation assumption'
    },
    {
      'Control Label': 'Primary Churn Rate %',
      'Primitive ID': 'churn_primary',
      'Type / Control': 'Slider',
      'Default / Range': '8% (0-30%)',
      'Formula / Logic': 'Monthly member attrition',
      'Tooltip': 'Percentage of members who cancel each month'
    },
    {
      'Control Label': 'Initial Corporate Clients',
      'Primitive ID': 'initial_corporate_clients',
      'Type / Control': 'Slider',
      'Default / Range': '0 (0-20)',
      'Formula / Logic': 'Starting B2B contracts',
      'Tooltip': 'Corporate wellness contracts at launch'
    },
    {
      'Control Label': 'Random Seed',
      'Primitive ID': 'random_seed',
      'Type / Control': 'Number Input',
      'Default / Range': '42',
      'Formula / Logic': 'For Monte Carlo simulations',
      'Tooltip': 'Seed for reproducible randomization'
    },
    
    // Section 2: Revenues
    { 'Control Label': '', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    { 'Control Label': '═══ SECTION 2: REVENUES ═══', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    {
      'Control Label': 'Initial Members / Physician',
      'Primitive ID': 'primary_init_per_physician',
      'Type / Control': 'Slider',
      'Default / Range': '50 (0-200)',
      'Formula / Logic': 'Starting panel size',
      'Tooltip': 'Primary care members per physician at launch'
    },
    {
      'Control Label': 'Initial Visits / Physician',
      'Primitive ID': 'specialty_init_per_physician',
      'Type / Control': 'Slider',
      'Default / Range': '75 (0-200)',
      'Formula / Logic': 'Starting specialty volume',
      'Tooltip': 'Specialty visits per physician at launch'
    },
    {
      'Control Label': 'New Contracts / Month',
      'Primitive ID': 'corporate_contracts_monthly',
      'Type / Control': 'Slider',
      'Default / Range': '1 (0-10)',
      'Formula / Logic': 'B2B growth rate',
      'Tooltip': 'Corporate wellness contracts signed monthly'
    },
    {
      'Control Label': 'Employees / Contract',
      'Primitive ID': 'corp_employees_per_contract',
      'Type / Control': 'Slider',
      'Default / Range': '30 (10-500)',
      'Formula / Logic': 'Contract size',
      'Tooltip': 'Average employees per corporate contract'
    },
    {
      'Control Label': 'Price / Employee / Month',
      'Primitive ID': 'corp_price_per_employee_month',
      'Type / Control': 'Slider',
      'Default / Range': '$700 ($500-$2500)',
      'Formula / Logic': 'Corporate revenue = employees × price',
      'Tooltip': 'Monthly fee per employee in corporate wellness'
    },
    {
      'Control Label': 'My Primary Members (Carry-Over)',
      'Primitive ID': 'physician_primary_carryover',
      'Type / Control': 'Number Input',
      'Default / Range': '25 (0-150)',
      'Formula / Logic': 'Added to Month-1 primary stock',
      'Tooltip': 'Established primary patients from prior practice'
    },
    {
      'Control Label': 'My Specialty Clients (Carry-Over)',
      'Primitive ID': 'physician_specialty_carryover',
      'Type / Control': 'Number Input',
      'Default / Range': '40 (0-150)',
      'Formula / Logic': 'Added to Month-1 specialty stock',
      'Tooltip': 'Existing specialty clients you\'ll continue serving'
    },
    {
      'Control Label': 'Carry-Over Primary per Other Physician',
      'Primitive ID': 'other_physicians_primary_carryover_per_physician',
      'Type / Control': 'Slider',
      'Default / Range': '25 (25-100)',
      'Formula / Logic': 'Team Primary Stock M1 = other_physicians_count × value',
      'Tooltip': 'Average primary members each additional physician brings'
    },
    {
      'Control Label': 'Carry-Over Specialty per Other Physician',
      'Primitive ID': 'other_physicians_specialty_carryover_per_physician',
      'Type / Control': 'Slider',
      'Default / Range': '40 (40-100)',
      'Formula / Logic': 'Team Specialty Stock M1 = other_physicians_count × value',
      'Tooltip': 'Average specialty clients each additional physician brings'
    },
    
    // Section 3: Diagnostics
    { 'Control Label': '', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    { 'Control Label': '═══ SECTION 3: DIAGNOSTICS ═══', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    {
      'Control Label': 'Diagnostics Active',
      'Primitive ID': 'diagnostics_active',
      'Type / Control': 'Toggle',
      'Default / Range': 'true',
      'Formula / Logic': 'Enables diagnostic revenue streams',
      'Tooltip': 'Turn on imaging and lab services'
    },
    {
      'Control Label': 'Start Month',
      'Primitive ID': 'diagnostics_start_month',
      'Type / Control': 'Slider',
      'Default / Range': '5 (1-12)',
      'Formula / Logic': 'Revenue starts this month',
      'Tooltip': 'Month when diagnostics come online'
    },
    {
      'Control Label': 'Echo Price',
      'Primitive ID': 'echo_price',
      'Type / Control': 'Slider',
      'Default / Range': '$500 ($200-$1500)',
      'Formula / Logic': 'Revenue = volume × price',
      'Tooltip': 'Price per echocardiogram'
    },
    {
      'Control Label': 'Echo Volume / Month',
      'Primitive ID': 'echo_volume_monthly',
      'Type / Control': 'Slider',
      'Default / Range': '100 (0-500)',
      'Formula / Logic': 'Monthly procedure count',
      'Tooltip': 'Echocardiograms performed per month'
    },
    {
      'Control Label': 'CT Price',
      'Primitive ID': 'ct_price',
      'Type / Control': 'Slider',
      'Default / Range': '$800 ($400-$2000)',
      'Formula / Logic': 'Revenue = volume × price',
      'Tooltip': 'Price per CT scan'
    },
    {
      'Control Label': 'CT Volume / Month',
      'Primitive ID': 'ct_volume_monthly',
      'Type / Control': 'Slider',
      'Default / Range': '40 (0-200)',
      'Formula / Logic': 'Monthly scan count',
      'Tooltip': 'CT scans performed per month'
    },
    {
      'Control Label': 'Lab Tests Price',
      'Primitive ID': 'lab_tests_price',
      'Type / Control': 'Slider',
      'Default / Range': '$200 ($50-$500)',
      'Formula / Logic': 'Revenue = volume × price',
      'Tooltip': 'Price per lab panel'
    },
    {
      'Control Label': 'Lab Tests / Month',
      'Primitive ID': 'lab_tests_monthly',
      'Type / Control': 'Slider',
      'Default / Range': '100 (0-1000)',
      'Formula / Logic': 'Monthly test count',
      'Tooltip': 'Lab tests performed per month'
    },
    
    // Section 4: Costs
    { 'Control Label': '', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    { 'Control Label': '═══ SECTION 4: COSTS ═══', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    {
      'Control Label': 'Fixed Overhead / Month',
      'Primitive ID': 'fixed_overhead_monthly',
      'Type / Control': 'Slider',
      'Default / Range': '$100,000 ($50k-$500k)',
      'Formula / Logic': 'Rent, utilities, insurance',
      'Tooltip': 'Monthly fixed operating expenses'
    },
    {
      'Control Label': 'Variable Cost %',
      'Primitive ID': 'variable_cost_pct',
      'Type / Control': 'Slider',
      'Default / Range': '30% (10-60%)',
      'Formula / Logic': 'Variable cost = revenue × %',
      'Tooltip': 'Variable costs as percentage of revenue'
    },
    {
      'Control Label': 'Marketing Budget / Month',
      'Primitive ID': 'marketing_budget_monthly',
      'Type / Control': 'Slider',
      'Default / Range': '$15,000 ($0-$100k)',
      'Formula / Logic': 'Monthly marketing spend',
      'Tooltip': 'Monthly marketing and acquisition budget'
    },
    
    // Section 5: Staffing
    { 'Control Label': '', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    { 'Control Label': '═══ SECTION 5: STAFFING ═══', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    {
      'Control Label': 'Executive Comp %',
      'Primitive ID': 'executive_comp_pct',
      'Type / Control': 'Slider',
      'Default / Range': '10% (0-25%)',
      'Formula / Logic': 'Executive comp = net profit × %',
      'Tooltip': 'Executive compensation as % of net profit'
    },
    {
      'Control Label': 'Staff Ramp Curve',
      'Primitive ID': 'staff_ramp_curve',
      'Type / Control': 'Dropdown',
      'Default / Range': 'linear (linear | scurve | stepwise)',
      'Formula / Logic': 'Hiring timeline shape',
      'Tooltip': 'How staff headcount grows over time'
    },
    {
      'Control Label': 'Additional Physicians',
      'Primitive ID': 'additional_physicians',
      'Type / Control': 'Slider',
      'Default / Range': '0 (0-20)',
      'Formula / Logic': 'Added after launch',
      'Tooltip': 'Physicians hired after initial launch'
    },
    
    // Section 6: Growth
    { 'Control Label': '', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    { 'Control Label': '═══ SECTION 6: GROWTH ═══', 'Primitive ID': '', 'Type / Control': '', 'Default / Range': '', 'Formula / Logic': '', 'Tooltip': '' },
    {
      'Control Label': 'Growth Curve Shape',
      'Primitive ID': 'growth_curve_shape',
      'Type / Control': 'Dropdown',
      'Default / Range': 'scurve (linear | scurve | exponential)',
      'Formula / Logic': 'Growth trajectory shape',
      'Tooltip': 'How revenue grows over time'
    },
    {
      'Control Label': 'Primary Growth Rate %',
      'Primitive ID': 'primary_growth_rate',
      'Type / Control': 'Slider',
      'Default / Range': '5% (0-20%)',
      'Formula / Logic': 'Monthly member growth',
      'Tooltip': 'Primary care membership growth rate'
    },
    {
      'Control Label': 'Specialty Growth Rate %',
      'Primitive ID': 'specialty_growth_rate',
      'Type / Control': 'Slider',
      'Default / Range': '8% (0-25%)',
      'Formula / Logic': 'Monthly visit growth',
      'Tooltip': 'Specialty visit volume growth rate'
    },
    {
      'Control Label': 'Corporate Growth Rate %',
      'Primitive ID': 'corporate_growth_rate',
      'Type / Control': 'Slider',
      'Default / Range': '3% (0-15%)',
      'Formula / Logic': 'Monthly contract growth',
      'Tooltip': 'Corporate contract growth rate'
    },
    {
      'Control Label': 'Diagnostic Growth Rate %',
      'Primitive ID': 'diagnostic_growth_rate',
      'Type / Control': 'Slider',
      'Default / Range': '4% (0-20%)',
      'Formula / Logic': 'Monthly volume growth',
      'Tooltip': 'Diagnostic service volume growth rate'
    },
    {
      'Control Label': 'Growth Time Horizon',
      'Primitive ID': 'growth_time_horizon',
      'Type / Control': 'Slider',
      'Default / Range': '24 months (6-60)',
      'Formula / Logic': 'Projection length',
      'Tooltip': 'Number of months to project'
    },
    {
      'Control Label': 'Primary Intake / Month',
      'Primitive ID': 'primary_intake_monthly',
      'Type / Control': 'Slider',
      'Default / Range': '25 (0-200)',
      'Formula / Logic': 'New members from DexaFit',
      'Tooltip': 'New primary members from DexaFit channel monthly'
    },
    {
      'Control Label': 'Conversion Primary → Specialty %',
      'Primitive ID': 'conversion_primary_to_specialty',
      'Type / Control': 'Slider',
      'Default / Range': '10% (0-50%)',
      'Formula / Logic': 'Primary members converting to specialty',
      'Tooltip': 'Percentage of primary members who use specialty services'
    },
  ];

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(primitives);

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Control Label
    { wch: 35 }, // Primitive ID
    { wch: 15 }, // Type/Control
    { wch: 40 }, // Default/Range
    { wch: 35 }, // Formula/Logic
    { wch: 50 }, // Tooltip
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Primitives Reference');

  // Generate Excel file
  XLSX.writeFile(wb, 'Pillars_Primitives_Reference.xlsx');
}

