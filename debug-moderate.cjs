const { calculateProjections } = require('./client/src/lib/calculations.ts');
const { moderateScenario } = require('./client/src/lib/data.ts');

const scenario = {
  ...moderateScenario,
  foundingToggle: true,
  additionalPhysicians: 3,
};

console.log('Testing moderate scenario...');
console.log('');

try {
  const results = calculateProjections(scenario);
  
  console.log('Ramp Period (last month):');
  const lastRamp = results.rampPeriod[results.rampPeriod.length - 1];
  console.log('  Revenue:', lastRamp.revenue.total);
  console.log('  Costs:', lastRamp.costs.total);
  console.log('  Profit:', lastRamp.profit);
  console.log('  Cumulative Cash:', lastRamp.cumulativeCash);
  console.log('');
  
  console.log('Launch State:');
  console.log('  Monthly Revenue:', results.launchState.monthlyRevenue);
  console.log('  Monthly Costs:', results.launchState.monthlyCosts);
  console.log('  Primary Members:', results.launchState.primaryMembers);
  console.log('  Specialty Members:', results.launchState.specialtyMembers);
  console.log('');
  
  console.log('Projection (first 3 months):');
  results.projection.slice(0, 3).forEach(month => {
    console.log(`  Month ${month.month}:`);
    console.log(`    Revenue: ${month.revenue.total}`);
    console.log(`    Costs: ${month.costs.total}`);
    console.log(`    Profit: ${month.profit}`);
    console.log(`    Primary: ${month.members.primaryActive}, Specialty: ${month.members.specialtyActive}`);
  });
  console.log('');
  
  console.log('KPIs:');
  console.log('  Total Revenue 12Mo:', results.kpis.totalRevenue12Mo);
  console.log('  Total Profit 12Mo:', results.kpis.totalProfit12Mo);
  console.log('  Physician ROI:', results.kpis.physicianROI);
  console.log('');
  
  // Check for NaN values
  const hasNaN = results.projection.some(m => 
    isNaN(m.revenue.total) || 
    isNaN(m.costs.total) || 
    isNaN(m.profit)
  );
  
  if (hasNaN) {
    console.log('❌ Found NaN values in projection!');
    console.log('');
    console.log('Months with NaN:');
    results.projection.forEach(month => {
      if (isNaN(month.revenue.total) || isNaN(month.costs.total) || isNaN(month.profit)) {
        console.log(`  Month ${month.month}:`);
        console.log(`    Revenue: ${month.revenue.total}`);
        console.log(`    Revenue breakdown:`, month.revenue);
        console.log(`    Costs: ${month.costs.total}`);
        console.log(`    Costs breakdown:`, month.costs);
        console.log(`    Profit: ${month.profit}`);
      }
    });
  }
  
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log(error.stack);
}

