import XLSX from 'xlsx';

// Simple test data
const scenarios = [
  { name: 'Lean', value: 100 },
  { name: 'Conservative', value: 200 },
  { name: 'Moderate', value: 300 }
];

// Create test workbook
const wb = XLSX.utils.book_new();

const summaryData = [
  ['Test Summary'],
  ['Scenario', 'Value'],
  ...scenarios.map(s => [s.name, s.value])
];

const ws = XLSX.utils.aoa_to_sheet(summaryData);
XLSX.utils.book_append_sheet(wb, ws, 'Summary');

// Write file
const filename = '/home/ubuntu/Test_Export.xlsx';
XLSX.writeFile(wb, filename);
console.log('✅ Test export created:', filename);
