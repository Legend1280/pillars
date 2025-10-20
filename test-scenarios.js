// Real-World Scenario Testing for Pillars Dashboard
// Tests actual calculations with realistic business scenarios

import { calculateProjections } from './client/src/lib/calculations.js';
import { defaultInputs, conservativeScenario, moderateScenario } from './client/src/lib/data.js';

console.log('='.repeat(80));
console.log('PILLARS DASHBOARD - REAL SCENARIO TESTING');
console.log('='.repeat(80));
console.log('');

// Test Scenario 1: Single Founding Physician (Conservative)
console.log('SCENARIO 1: Single Founding Physician - Conservative Growth');
console.log('-'.repeat(80));
const scenario1 = {
  ...conservativeScenario,
  foundingToggle: true,
  additionalPhysicians: 0,
};

try {
  const results1 = calculateProjections(scenario1);
  console.log('✅ Calculation successful');
  console.log('');
  console.log('Key Metrics:');
  console.log(`  Launch MRR (Month 7): $${results1.kpis.launchMRR.toLocaleString()}`);
  console.log(`  Members at Launch: ${results1.kpis.membersAtLaunch}`);
  console.log(`  12-Month Revenue: $${results1.kpis.totalRevenue12Mo.toLocaleString()}`);
  console.log(`  12-Month Profit: $${results1.kpis.totalProfit12Mo.toLocaleString()}`);
  console.log(`  Physician ROI: ${results1.kpis.physicianROI.toFixed(1)}%`);
  console.log(`  Breakeven Month: ${results1.kpis.breakevenMonth || 'Not reached'}`);
  console.log(`  Cash at Launch: $${results1.launchState.monthlyCash.toLocaleString()}`);
  console.log('');
  
  // Sanity checks
  const checks1 = [];
  if (results1.kpis.launchMRR < 10000) checks1.push('⚠️  Launch MRR seems low (< $10K)');
  if (results1.kpis.launchMRR > 200000) checks1.push('⚠️  Launch MRR seems high (> $200K)');
  if (results1.kpis.physicianROI < 0) checks1.push('⚠️  Negative ROI');
  if (results1.kpis.physicianROI > 200) checks1.push('⚠️  ROI > 200% seems unrealistic');
  if (results1.kpis.totalRevenue12Mo < 0) checks1.push('❌ Negative revenue');
  if (results1.kpis.membersAtLaunch < 0) checks1.push('❌ Negative members');
  
  if (checks1.length > 0) {
    console.log('Sanity Check Results:');
    checks1.forEach(check => console.log(`  ${check}`));
  } else {
    console.log('✅ All sanity checks passed');
  }
} catch (error) {
  console.log('❌ Calculation failed:', error.message);
}

console.log('');
console.log('='.repeat(80));
console.log('');

// Test Scenario 2: Multi-Physician Group (Moderate)
console.log('SCENARIO 2: 4-Physician Group - Moderate Growth');
console.log('-'.repeat(80));
const scenario2 = {
  ...moderateScenario,
  foundingToggle: true,
  additionalPhysicians: 3,
};

try {
  const results2 = calculateProjections(scenario2);
  console.log('✅ Calculation successful');
  console.log('');
  console.log('Key Metrics:');
  console.log(`  Launch MRR (Month 7): $${results2.kpis.launchMRR.toLocaleString()}`);
  console.log(`  Members at Launch: ${results2.kpis.membersAtLaunch}`);
  console.log(`  12-Month Revenue: $${results2.kpis.totalRevenue12Mo.toLocaleString()}`);
  console.log(`  12-Month Profit: $${results2.kpis.totalProfit12Mo.toLocaleString()}`);
  console.log(`  Physician ROI: ${results2.kpis.physicianROI.toFixed(1)}%`);
  console.log(`  Breakeven Month: ${results2.kpis.breakevenMonth || 'Not reached'}`);
  console.log('');
  
  // Sanity checks
  const checks2 = [];
  if (results2.kpis.launchMRR < results1.kpis.launchMRR) {
    checks2.push('⚠️  4-physician MRR lower than 1-physician (unexpected)');
  }
  if (results2.kpis.membersAtLaunch < results1.kpis.membersAtLaunch) {
    checks2.push('⚠️  4-physician members lower than 1-physician (unexpected)');
  }
  if (results2.kpis.physicianROI < 0) checks2.push('⚠️  Negative ROI');
  if (results2.kpis.physicianROI > 200) checks2.push('⚠️  ROI > 200% seems unrealistic');
  
  if (checks2.length > 0) {
    console.log('Sanity Check Results:');
    checks2.forEach(check => console.log(`  ${check}`));
  } else {
    console.log('✅ All sanity checks passed');
  }
} catch (error) {
  console.log('❌ Calculation failed:', error.message);
}

console.log('');
console.log('='.repeat(80));
console.log('');

// Test Scenario 3: MSO-Only (No Founding Physician)
console.log('SCENARIO 3: MSO-Only Model - No Founding Physician');
console.log('-'.repeat(80));
const scenario3 = {
  ...defaultInputs,
  foundingToggle: false,
  additionalPhysicians: 2,
};

try {
  const results3 = calculateProjections(scenario3);
  console.log('✅ Calculation successful');
  console.log('');
  console.log('Key Metrics:');
  console.log(`  Launch MRR (Month 7): $${results3.kpis.launchMRR.toLocaleString()}`);
  console.log(`  Members at Launch: ${results3.kpis.membersAtLaunch}`);
  console.log(`  12-Month Revenue: $${results3.kpis.totalRevenue12Mo.toLocaleString()}`);
  console.log(`  12-Month Profit: $${results3.kpis.totalProfit12Mo.toLocaleString()}`);
  console.log(`  Physician ROI: ${results3.kpis.physicianROI.toFixed(1)}%`);
  console.log(`  MSO Fee: 40% (no founding physician)`);
  console.log(`  Equity Share: 5% (no founding physician)`);
  console.log('');
  
  // Sanity checks
  const checks3 = [];
  if (results3.kpis.physicianROI > results1.kpis.physicianROI) {
    checks3.push('⚠️  MSO-only ROI higher than founding physician (unexpected - higher fees/lower equity)');
  }
  
  if (checks3.length > 0) {
    console.log('Sanity Check Results:');
    checks3.forEach(check => console.log(`  ${check}`));
  } else {
    console.log('✅ All sanity checks passed');
  }
} catch (error) {
  console.log('❌ Calculation failed:', error.message);
}

console.log('');
console.log('='.repeat(80));
console.log('');

// Test Scenario 4: Growth Rate Sensitivity
console.log('SCENARIO 4: Growth Rate Sensitivity Test');
console.log('-'.repeat(80));
console.log('Testing: Does higher churn reduce members?');

const scenario4a = { ...defaultInputs, churnPrimary: 5 };  // Low churn
const scenario4b = { ...defaultInputs, churnPrimary: 15 }; // High churn

try {
  const results4a = calculateProjections(scenario4a);
  const results4b = calculateProjections(scenario4b);
  
  console.log(`  Low churn (5%):  ${results4a.kpis.membersAtLaunch} members, $${results4a.kpis.launchMRR.toLocaleString()} MRR`);
  console.log(`  High churn (15%): ${results4b.kpis.membersAtLaunch} members, $${results4b.kpis.launchMRR.toLocaleString()} MRR`);
  console.log('');
  
  if (results4b.kpis.membersAtLaunch >= results4a.kpis.membersAtLaunch) {
    console.log('❌ LOGIC ERROR: Higher churn should reduce members!');
  } else {
    const reduction = ((results4a.kpis.membersAtLaunch - results4b.kpis.membersAtLaunch) / results4a.kpis.membersAtLaunch * 100).toFixed(1);
    console.log(`✅ Higher churn reduces members by ${reduction}%`);
  }
} catch (error) {
  console.log('❌ Calculation failed:', error.message);
}

console.log('');
console.log('='.repeat(80));
console.log('');

// Test Scenario 5: Month-by-Month Validation
console.log('SCENARIO 5: Month-by-Month Growth Validation');
console.log('-'.repeat(80));

try {
  const results5 = calculateProjections(defaultInputs);
  
  console.log('Checking: Do members grow month-over-month?');
  console.log('');
  console.log('Month | Primary | Specialty | Total Revenue');
  console.log('-'.repeat(50));
  
  let previousMembers = 0;
  let growthIssues = 0;
  
  results5.projection.slice(0, 6).forEach((month, idx) => {
    const totalMembers = month.members.primaryActive + month.members.specialtyActive;
    const growth = idx > 0 ? totalMembers - previousMembers : 0;
    const growthSymbol = growth > 0 ? '↑' : growth < 0 ? '↓' : '→';
    
    console.log(`  ${month.month}   | ${month.members.primaryActive.toString().padStart(7)} | ${month.members.specialtyActive.toString().padStart(9)} | $${Math.round(month.revenue.total).toLocaleString().padStart(10)} ${growthSymbol}`);
    
    if (idx > 0 && growth < 0) growthIssues++;
    previousMembers = totalMembers;
  });
  
  console.log('');
  if (growthIssues > 0) {
    console.log(`⚠️  Found ${growthIssues} months with negative growth (may be valid due to churn)`);
  } else {
    console.log('✅ Consistent month-over-month growth');
  }
} catch (error) {
  console.log('❌ Calculation failed:', error.message);
}

console.log('');
console.log('='.repeat(80));
console.log('');
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log('If all scenarios ran without crashes and sanity checks passed,');
console.log('the system is producing reasonable outputs and is ready for UAT.');
console.log('');

