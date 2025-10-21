// Quick check of what data is being calculated
const fs = require('fs');

// Read the calculations file to find where capitalDeployment is created
const calcFile = fs.readFileSync('./client/src/lib/calculations.ts', 'utf8');

// Find the capitalDeployment object construction
const match = calcFile.match(/const capitalDeployment = \{[\s\S]{0,500}\};/);
if (match) {
  console.log('=== Capital Deployment Object Construction ===\n');
  console.log(match[0]);
}

// Find where equityBuyout is calculated
const equityMatch = calcFile.match(/const equityBuyout = [\s\S]{0,200};/);
if (equityMatch) {
  console.log('\n=== Equity Buyout Calculation ===\n');
  console.log(equityMatch[0]);
}

// Check if equityBuyout is included in capitalDeployment
if (calcFile.includes('equityBuyout') && calcFile.includes('capitalDeployment')) {
  console.log('\n✓ equityBuyout is referenced in calculations.ts');
  
  // Check if it's in the capitalDeployment object
  const cdSection = calcFile.substring(
    calcFile.indexOf('const capitalDeployment'),
    calcFile.indexOf('const capitalDeployment') + 500
  );
  
  if (cdSection.includes('equityBuyout')) {
    console.log('✓ equityBuyout IS included in capitalDeployment object');
  } else {
    console.log('✗ equityBuyout is NOT included in capitalDeployment object');
  }
}
