const { calculateProjections } = require('./client/src/lib/calculations.ts');
const { defaultInputs } = require('./client/src/lib/data.ts');

const results = calculateProjections(defaultInputs);
const allMonths = [...results.rampPeriod, ...results.projection];

console.log('\n=== REVENUE BY MONTH ===');
allMonths.forEach(m => {
  console.log(`M${m.month}: $${m.revenue.total.toFixed(0)} (Primary: $${m.revenue.primary.toFixed(0)}, Specialty: $${m.revenue.specialty.toFixed(0)}, Corporate: $${m.revenue.corporate.toFixed(0)})`);
});

console.log('\n=== MONTH-OVER-MONTH CHANGES ===');
allMonths.forEach((m, i) => {
  if (i > 0) {
    const change = m.revenue.total - allMonths[i-1].revenue.total;
    console.log(`M${m.month}: ${change >= 0 ? '+' : ''}$${change.toFixed(0)} (${((change / allMonths[i-1].revenue.total) * 100).toFixed(1)}%)`);
  }
});
