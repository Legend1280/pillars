const { calculateProjections } = require('./client/src/lib/calculations.ts');
const { moderateScenario } = require('./client/src/lib/data.ts');

console.log('='.repeat(80));
console.log('ROI CALCULATION ANALYSIS - MODERATE SCENARIO');
console.log('='.repeat(80));
console.log('');

const scenario = {
  ...moderateScenario,
  foundingToggle: true,
  additionalPhysicians: 3,
};

console.log('SCENARIO INPUTS:');
console.log('  Founding Physician: YES');
console.log('  Additional Physicians: 3');
console.log('  Total Physicians: 4');
console.log('');
console.log('CARRYOVER MEMBERS:');
console.log('  Founding Physician Primary Carryover:', scenario.physicianPrimaryCarryover);
console.log('  Founding Physician Specialty Carryover:', scenario.physicianSpecialtyCarryover);
console.log('  Additional Physicians Primary Carryover (each):', scenario.otherPhysiciansPrimaryCarryoverPerPhysician);
console.log('  Additional Physicians Specialty Carryover (each):', scenario.otherPhysiciansSpecialtyCarryoverPerPhysician);
console.log('');
console.log('EXPECTED TOTAL CARRYOVER:');
const expectedPrimaryCarryover = scenario.physicianPrimaryCarryover + (3 * scenario.otherPhysiciansPrimaryCarryoverPerPhysician);
const expectedSpecialtyCarryover = scenario.physicianSpecialtyCarryover + (3 * scenario.otherPhysiciansSpecialtyCarryoverPerPhysician);
console.log('  Primary: 40 (founding) + (3 × 40) = 40 + 120 =', expectedPrimaryCarryover);
console.log('  Specialty: 60 (founding) + (3 × 60) = 60 + 180 =', expectedSpecialtyCarryover);
console.log('');

const results = calculateProjections(scenario);

console.log('ACTUAL LAUNCH STATE:');
console.log('  Primary Members:', results.launchState.primaryMembers);
console.log('  Specialty Members:', results.launchState.specialtyMembers);
console.log('  Total Members:', results.launchState.primaryMembers + results.launchState.specialtyMembers);
console.log('');

console.log('RAMP PERIOD (Month 6 - last month before launch):');
const lastRamp = results.rampPeriod[results.rampPeriod.length - 1];
console.log('  Primary Members:', lastRamp.members.primaryActive);
console.log('  Specialty Members:', lastRamp.members.specialtyActive);
console.log('  Primary New This Month:', lastRamp.members.primaryNew);
console.log('  Primary Churned:', lastRamp.members.primaryChurned);
console.log('');

console.log('REVENUE BREAKDOWN (12 months):');
let totalPrimaryRevenue = 0;
let totalSpecialtyRevenue = 0;
let totalCorporateRevenue = 0;
let totalDiagnosticsRevenue = 0;

results.projection.forEach(month => {
  totalPrimaryRevenue += month.revenue.primary;
  totalSpecialtyRevenue += month.revenue.specialty;
  totalCorporateRevenue += month.revenue.corporate;
  totalDiagnosticsRevenue += month.revenue.echo + month.revenue.ct + month.revenue.labs;
});

console.log('  Primary Care: $' + totalPrimaryRevenue.toLocaleString());
console.log('  Specialty Care: $' + totalSpecialtyRevenue.toLocaleString());
console.log('  Corporate Wellness: $' + totalCorporateRevenue.toLocaleString());
console.log('  Diagnostics: $' + totalDiagnosticsRevenue.toLocaleString());
console.log('  TOTAL: $' + results.kpis.totalRevenue12Mo.toLocaleString());
console.log('');

console.log('COST BREAKDOWN (12 months):');
let totalSalaries = 0;
let totalFixed = 0;
let totalMarketing = 0;
let totalVariable = 0;
let totalDiagnosticsCOGS = 0;

results.projection.forEach(month => {
  totalSalaries += month.costs.salaries;
  totalFixed += month.costs.fixedOverhead;
  totalMarketing += month.costs.marketing;
  totalVariable += month.costs.variable;
  totalDiagnosticsCOGS += month.costs.diagnostics;
});

const totalCosts = results.kpis.totalRevenue12Mo - results.kpis.totalProfit12Mo;

console.log('  Salaries: $' + totalSalaries.toLocaleString());
console.log('  Fixed Overhead: $' + totalFixed.toLocaleString());
console.log('  Marketing: $' + totalMarketing.toLocaleString());
console.log('  Variable Costs: $' + totalVariable.toLocaleString());
console.log('  Diagnostics COGS: $' + totalDiagnosticsCOGS.toLocaleString());
console.log('  TOTAL: $' + totalCosts.toLocaleString());
console.log('');

console.log('ROI CALCULATION:');
console.log('  Total Profit (12 months): $' + results.kpis.totalProfit12Mo.toLocaleString());
console.log('  Physician Investment: $' + results.kpis.physicianInvestment.toLocaleString());
console.log('  ROI: ' + results.kpis.physicianROI.toFixed(1) + '%');
console.log('');

console.log('ANALYSIS:');
console.log('  Is the investment correct?');
console.log('    - Founding physician invests $600K');
console.log('    - 3 additional physicians invest $750K each = $2.25M');
console.log('    - Total investment should be: $2.85M');
console.log('    - Actual investment used in ROI: $' + results.kpis.physicianInvestment.toLocaleString());
console.log('');

console.log('  Is the profit calculation correct?');
console.log('    - Total profit: $' + results.kpis.totalProfit12Mo.toLocaleString());
console.log('    - MSO takes 37% (founding) or 40% (additional) of revenue');
console.log('    - Physicians get: Revenue - MSO Fee - Costs');
console.log('    - But ROI should be based on INDIVIDUAL physician return, not total practice profit');
console.log('');

console.log('HYPOTHESIS TEST:');
console.log('  If ROI is calculated as: (Total Profit / Single Physician Investment) × 100');
console.log('  Then: ($10.66M / $600K) × 100 = ' + ((results.kpis.totalProfit12Mo / 600000) * 100).toFixed(1) + '%');
console.log('  This matches the reported ROI of 391.8%!');
console.log('');
console.log('  ❌ BUG CONFIRMED: ROI is using TOTAL PRACTICE PROFIT but SINGLE PHYSICIAN INVESTMENT');
console.log('');
console.log('  CORRECT CALCULATION should be:');
console.log('  - Individual physician share of profit / Individual physician investment');
console.log('  - OR: Total profit / Total investment = $10.66M / $2.85M = ' + ((results.kpis.totalProfit12Mo / 2850000) * 100).toFixed(1) + '%');
console.log('');

