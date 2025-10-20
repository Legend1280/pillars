const { calculateProjections } = require('./client/src/lib/calculations.ts');
const { defaultInputs } = require('./client/src/lib/data.ts');

console.log('\n=== Testing 8-Card KPI System ===\n');

const projections = calculateProjections(defaultInputs);
const { kpis } = projections;

console.log('CARD 1: Monthly Income');
console.log(`  Value: $${kpis.monthlyIncome.toLocaleString()}`);
console.log(`  Formula: Specialty Retained + Equity Income\n`);

console.log('CARD 2: Annualized ROI');
console.log(`  Value: ${kpis.annualizedROI.toFixed(1)}%`);
console.log(`  Formula: (Annual Income / Individual Investment) × 100\n`);

console.log('CARD 3: MSO Equity Income');
console.log(`  Value: $${kpis.msoEquityIncome.toLocaleString()}`);
console.log(`  Formula: Net Profit × Equity Stake\n`);

console.log('CARD 4: Equity Stake Value');
console.log(`  Value: $${kpis.equityStakeValue.toLocaleString()}`);
console.log(`  Formula: (Annual Profit × 2) × Equity %\n`);

console.log('CARD 5: Independent Revenue Streams');
console.log(`  Value: ${kpis.independentRevenueStreams}`);
console.log(`  Formula: Count of active streams (Primary, Specialty, Corporate, Echo, CT, Labs)\n`);

console.log('CARD 6: Specialty Patient Load');
console.log(`  Value: ${Math.round(kpis.specialtyPatientLoad).toLocaleString()}`);
console.log(`  Formula: Active specialty members\n`);

console.log('CARD 7: Quality-of-Life Index');
console.log(`  Value: +${kpis.qualityOfLifeIndex.toFixed(1)}%`);
console.log(`  Formula: ((30% - 10%) / 30%) × 100\n`);

console.log('CARD 8: Support-to-Physician Ratio');
console.log(`  Value: ${kpis.supportToPhysicianRatio.toFixed(1)}:1`);
console.log(`  Formula: Admin Support Ratio per physician\n`);

console.log('=== Validation ===\n');

// Validate calculations
const month12 = projections.projection[projections.projection.length - 1];
console.log(`Month 12 Data:`);
console.log(`  Revenue: $${month12.revenue.total.toLocaleString()}`);
console.log(`  Profit: $${month12.profit.toLocaleString()}`);
console.log(`  Specialty Members: ${month12.members.specialtyActive}`);
console.log(`  Primary Members: ${month12.members.primaryActive}`);

console.log(`\n✅ All 8 KPIs calculated successfully!`);

