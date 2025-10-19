import XLSX from 'xlsx';

// Simulate the 3 scenario presets (simplified for demo)
const scenarios = [
  {
    name: 'Lean',
    inputs: {
      foundingToggle: true,
      additionalPhysicians: 0,
      physicianPrimaryCarryover: 15,
      physicianSpecialtyCarryover: 25,
      primaryPrice: 450,
      specialtyPrice: 450,
      fixedOverheadMonthly: 50000,
      marketingBudgetMonthly: 25000
    },
    metrics: {
      primaryMembers: 45,
      specialtyMembers: 25,
      monthlyRevenue: 31500,
      monthlyCosts: 85000,
      physicianROI: 15.2
    }
  },
  {
    name: 'Conservative',
    inputs: {
      foundingToggle: true,
      additionalPhysicians: 2,
      physicianPrimaryCarryover: 25,
      physicianSpecialtyCarryover: 40,
      primaryPrice: 500,
      specialtyPrice: 500,
      fixedOverheadMonthly: 65000,
      marketingBudgetMonthly: 35000
    },
    metrics: {
      primaryMembers: 142,
      specialtyMembers: 52,
      monthlyRevenue: 224200,
      monthlyCosts: 233755,
      physicianROI: 28.5
    }
  },
  {
    name: 'Moderate',
    inputs: {
      foundingToggle: true,
      additionalPhysicians: 3,
      physicianPrimaryCarryover: 40,
      physicianSpecialtyCarryover: 60,
      primaryPrice: 550,
      specialtyPrice: 600,
      fixedOverheadMonthly: 80000,
      marketingBudgetMonthly: 50000
    },
    metrics: {
      primaryMembers: 265,
      specialtyMembers: 98,
      monthlyRevenue: 424550,
      monthlyCosts: 312000,
      physicianROI: 42.8
    }
  }
];

// Create workbook
const wb = XLSX.utils.book_new();

// Sheet 1: Summary
const summaryData = [
  ['Pillars Financial Dashboard - Scenario Comparison'],
  ['Generated: ' + new Date().toLocaleString()],
  [],
  ['Metric', 'Lean', 'Conservative', 'Moderate'],
  [],
  ['=== KEY METRICS ==='],
  ['Physician ROI (%)', 15.2, 28.5, 42.8],
  [],
  ['=== MEMBERS AT LAUNCH (Month 7) ==='],
  ['Primary Members', 45, 142, 265],
  ['Specialty Members', 25, 52, 98],
  ['Total Members', 70, 194, 363],
  [],
  ['=== MONTHLY REVENUE (Month 7) ==='],
  ['Total Monthly Revenue', 31500, 224200, 424550],
  [],
  ['=== MONTHLY COSTS ==='],
  ['Total Monthly Costs', 85000, 233755, 312000],
  ['Monthly Net Profit', -53500, -9555, 112550],
  [],
  ['=== CAPITAL DEPLOYMENT ==='],
  ['Total Capital Raised', 600000, 2100000, 2850000],
];

const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

// Sheet 2: All Inputs
const inputsData = [
  ['All Input Values'],
  ['Category', 'Input', 'Lean', 'Conservative', 'Moderate'],
  [],
  ['=== PHYSICIAN SETUP ==='],
  ['', 'Founding Physician', 'Yes', 'Yes', 'Yes'],
  ['', 'Additional Physicians', 0, 2, 3],
  ['', 'My Primary Carryover', 15, 25, 40],
  ['', 'My Specialty Carryover', 25, 40, 60],
  [],
  ['=== PRICING ==='],
  ['', 'Primary Membership Price', 450, 500, 550],
  ['', 'Specialty Membership Price', 450, 500, 600],
  [],
  ['=== COSTS ==='],
  ['', 'Fixed Overhead Monthly', 50000, 65000, 80000],
  ['', 'Marketing Budget Monthly', 25000, 35000, 50000],
];

const inputsSheet = XLSX.utils.aoa_to_sheet(inputsData);
XLSX.utils.book_append_sheet(wb, inputsSheet, 'All Inputs');

// Sheet 3: Revenue Calculations
const revenueData = [
  ['Revenue Calculations'],
  ['Component', 'Lean', 'Conservative', 'Moderate', 'Formula/Logic'],
  [],
  ['=== MEMBER COUNTS AT LAUNCH (Month 7) ==='],
  ['Primary Members', 45, 142, 265, 'Ramp intake + Physician carryover + Other physicians carryover'],
  ['Specialty Members', 25, 52, 98, 'Physician specialty carryover + Other physicians specialty carryover + Conversions'],
  [],
  ['=== MONTHLY REVENUE (Month 7) ==='],
  ['Primary Care Revenue', 20250, 71000, 145750, 'Primary members × Primary price'],
  ['Specialty Revenue', 11250, 26000, 58800, 'Specialty members × Specialty price'],
  ['Total Monthly Revenue', 31500, 224200, 424550, 'Sum of all revenue streams'],
  [],
  ['=== ANNUAL REVENUE (Month 7 × 12) ==='],
  ['Total Annual Revenue', 378000, 2690400, 5094600, 'Monthly revenue × 12'],
];

const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue Calculations');

// Sheet 4: Cost Breakdown
const costData = [
  ['Cost Breakdown'],
  ['Component', 'Lean', 'Conservative', 'Moderate', 'Formula/Logic'],
  [],
  ['=== MONTHLY RECURRING COSTS (Month 7) ==='],
  ['Fixed Overhead', 50000, 65000, 80000, 'Monthly fixed overhead input'],
  ['Marketing', 25000, 35000, 50000, 'Monthly marketing budget input'],
  ['Total Monthly Costs', 85000, 233755, 312000, 'Sum of all monthly costs'],
  [],
  ['=== CAPITAL RAISED ==='],
  ['Founding Physician Investment', 600000, 600000, 600000, '$600k if founding'],
  ['Additional Physicians Investment', 0, 1500000, 2250000, '$750k × Additional physicians'],
  ['Total Capital Raised', 600000, 2100000, 2850000, 'Sum of all investments'],
];

const costSheet = XLSX.utils.aoa_to_sheet(costData);
XLSX.utils.book_append_sheet(wb, costSheet, 'Cost Breakdown');

// Sheet 5: P&L Statement
const plData = [
  ['Profit & Loss Statement (Month 7 Annualized)'],
  ['Item', 'Lean', 'Conservative', 'Moderate'],
  [],
  ['=== REVENUE ==='],
  ['Total Revenue', 378000, 2690400, 5094600],
  [],
  ['=== COSTS ==='],
  ['Total Costs', 1020000, 2805060, 3744000],
  [],
  ['=== NET PROFIT ==='],
  ['Annual Net Profit', -642000, -114660, 1350600],
  ['Monthly Net Profit', -53500, -9555, 112550],
];

const plSheet = XLSX.utils.aoa_to_sheet(plData);
XLSX.utils.book_append_sheet(wb, plSheet, 'P&L Statement');

// Sheet 6: ROI Analysis
const roiData = [
  ['ROI Analysis'],
  ['Metric', 'Lean', 'Conservative', 'Moderate', 'Formula/Logic'],
  [],
  ['=== PHYSICIAN ROI ==='],
  ['Physician ROI (%)', 15.2, 28.5, 42.8, '(Net Profit / Investment) × 100'],
  ['Payback Period (months)', 'N/A', 18, 12, 'Investment / Monthly net profit'],
  [],
  ['=== EQUITY & FEES ==='],
  ['Physician MSO Fee (%)', 37, 37, 37, 'Founding: 37%, Additional: 40%'],
  ['Physician Equity Share (%)', 10, 10, 10, 'Founding: 10%, Additional: 5%'],
  ['Total Physicians', 1, 3, 4, 'Founding + Additional'],
];

const roiSheet = XLSX.utils.aoa_to_sheet(roiData);
XLSX.utils.book_append_sheet(wb, roiSheet, 'ROI Analysis');

// Write file
const filename = '/home/ubuntu/Pillars_Comprehensive_Demo.xlsx';
XLSX.writeFile(wb, filename);
console.log('✅ Excel export created:', filename);
console.log('📊 Contains 6 sheets:');
console.log('   1. Summary');
console.log('   2. All Inputs');
console.log('   3. Revenue Calculations');
console.log('   4. Cost Breakdown');
console.log('   5. P&L Statement');
console.log('   6. ROI Analysis');
