const fs = require('fs');

// Read the dashboardConfig file
const configPath = './client/src/lib/dashboardConfig.ts';
const dataPath = './client/src/lib/data.ts';

console.log('Reading configuration files...');

const configContent = fs.readFileSync(configPath, 'utf8');
const dataContent = fs.readFileSync(dataPath, 'utf8');

console.log('Files read successfully');
console.log('Config file size:', configContent.length);
console.log('Data file size:', dataContent.length);

// We'll parse this manually since it's TypeScript
// Output the files for manual inspection
fs.writeFileSync('/home/ubuntu/config_export.txt', configContent);
fs.writeFileSync('/home/ubuntu/data_export.txt', dataContent);

console.log('Exported to /home/ubuntu/config_export.txt and /home/ubuntu/data_export.txt');
