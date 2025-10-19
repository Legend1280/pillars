import { SCENARIO_PRESETS } from './client/src/lib/scenarioPresets.ts';
import fs from 'fs';

// Create export object with actual scenario data
const exportData = {
  exported: new Date().toISOString(),
  version: '1.0',
  scenarios: {
    lean: SCENARIO_PRESETS.lean,
    conservative: SCENARIO_PRESETS.conservative,
    moderate: SCENARIO_PRESETS.moderate
  }
};

// Write to file
const jsonString = JSON.stringify(exportData, null, 2);
fs.writeFileSync('/home/ubuntu/pillars-scenarios-actual.json', jsonString);

console.log('✅ Actual JSON export created');
console.log('📊 File size:', (jsonString.length / 1024).toFixed(2), 'KB');
console.log('📋 Number of fields per scenario:', Object.keys(SCENARIO_PRESETS.lean).length);
