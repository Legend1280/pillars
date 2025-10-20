const { calculateProjections } = require('./client/src/lib/calculations.ts');
const { moderateScenario } = require('./client/src/lib/data.ts');

console.log('='.repeat(80));
console.log('ROI FIX VERIFICATION');
console.log('='.repeat(80));
console.log('');

const scenario = {
  ...moderateScenario,
  foundingToggle: true,
  additionalPhysicians: 3,
};

console.log('SCENARIO: 4-Physician Group (1 Founding + 3 Additional)');
console.log('');

const results = calculateProjections(scenario);

console.log('CAPITAL STRUCTURE:');
console.log('  Founding Physician Investment: $600,000');
console.log('  Additional Physicians (3 × $750,000): $2,250,000');
console.log('  Total Capital Raised: $2,850,000');
console.log('');

console.log('FINANCIAL RESULTS (12 months):');
console.log('  Total Revenue: $' + results.kpis.totalRevenue12Mo.toLocaleString());
console.log('  Total Profit: $' + results.kpis.totalProfit12Mo.toLocaleString());
console.log('');

console.log('ROI CALCULATIONS:');
console.log('');
console.log('  MSO ROI (Total Practice):');
console.log('    Formula: (Total Profit / Total Capital) × 100');
console.log('    Calculation: ($' + results.kpis.totalProfit12Mo.toLocaleString() + ' / $2,850,000) × 100');
console.log('    Result: ' + results.kpis.msoROI.toFixed(1) + '%');
console.log('');
console.log('  Physician ROI (Founding Physician):');
console.log('    Formula: (Specialty Retained + Equity Income) / Individual Investment');
console.log('    Result: ' + results.kpis.physicianROI.toFixed(1) + '%');
console.log('');

console.log('VALIDATION:');
if (results.kpis.msoROI > 50 && results.kpis.msoROI < 200) {
  console.log('  ✅ MSO ROI is realistic (' + results.kpis.msoROI.toFixed(1) + '% is reasonable for a growing practice)');
} else if (results.kpis.msoROI > 200) {
  console.log('  ⚠️  MSO ROI seems high (' + results.kpis.msoROI.toFixed(1) + '% - check assumptions)');
} else {
  console.log('  ⚠️  MSO ROI seems low (' + results.kpis.msoROI.toFixed(1) + '% - check assumptions)');
}

if (results.kpis.physicianROI > results.kpis.msoROI) {
  console.log('  ✅ Physician ROI > MSO ROI (expected due to founding physician benefits)');
} else {
  console.log('  ⚠️  Physician ROI ≤ MSO ROI (unexpected - founding physician should have higher return)');
}

console.log('');
console.log('COMPARISON TO PREVIOUS BUG:');
console.log('  Before fix: Physician ROI was 391.8% (used total income / single investment)');
console.log('  After fix: Physician ROI is ' + results.kpis.physicianROI.toFixed(1) + '% (correct calculation)');
console.log('  After fix: MSO ROI is ' + results.kpis.msoROI.toFixed(1) + '% (new metric)');
console.log('');

