// Simple test to check revenue pattern
// We'll manually inspect the calculations.ts logic instead

const fs = require('fs');
const path = require('path');

// Read the calculations file
const calcFile = fs.readFileSync(path.join(__dirname, 'client/src/lib/calculations.ts'), 'utf8');

// Look for revenue calculation patterns
console.log('\n=== Searching for revenue calculation logic ===\n');

// Find primary care revenue calculation
const primaryMatch = calcFile.match(/revenue\.primary\s*=[\s\S]{0,200}/g);
if (primaryMatch) {
  console.log('PRIMARY REVENUE CALCULATION:');
  primaryMatch.forEach(m => console.log(m.substring(0, 300)));
}

// Find specialty revenue calculation  
const specialtyMatch = calcFile.match(/revenue\.specialty\s*=[\s\S]{0,200}/g);
if (specialtyMatch) {
  console.log('\nSPECIALTY REVENUE CALCULATION:');
  specialtyMatch.forEach(m => console.log(m.substring(0, 300)));
}

// Find corporate revenue calculation
const corporateMatch = calcFile.match(/revenue\.corporate\s*=[\s\S]{0,200}/g);
if (corporateMatch) {
  console.log('\nCORPORATE REVENUE CALCULATION:');
  corporateMatch.forEach(m => console.log(m.substring(0, 300)));
}
