import * as XLSX from 'xlsx';
import { DashboardInputs } from './data';
import { dashboardConfig, ControlConfig } from './dashboardConfig';

interface PrimitiveRow {
  'Control Label': string;
  'Primitive ID': string;
  'Type / Control': string;
  'Default / Range': string;
  'Current Value': string;
  'Formula / Logic': string;
  'Tooltip': string;
}

/**
 * Format control value for display
 */
function formatControlValue(control: ControlConfig, value: any): string {
  if (value === undefined || value === null) return '';
  
  if (control.type === 'toggle') {
    return value ? 'ON' : 'OFF';
  }
  
  if (control.suffix === '$') {
    return `$${value}`;
  }
  
  if (control.suffix === '%') {
    return `${value}%`;
  }
  
  if (control.suffix) {
    return `${value}${control.suffix}`;
  }
  
  return String(value);
}

/**
 * Format control default/range for display
 */
function formatDefaultRange(control: ControlConfig): string {
  const parts: string[] = [];
  
  // Add default value
  if (control.suffix === '$') {
    parts.push(`$${control.default}`);
  } else if (control.suffix === '%') {
    parts.push(`${control.default}%`);
  } else {
    parts.push(String(control.default));
  }
  
  // Add range if applicable
  if (control.type === 'slider' && control.min !== undefined && control.max !== undefined) {
    parts.push(`(${control.min}-${control.max})`);
  } else if (control.type === 'number' && control.min !== undefined && control.max !== undefined) {
    parts.push(`(${control.min}-${control.max})`);
  } else if (control.type === 'select' && control.options) {
    const optionValues = control.options.map(o => o.value).join(' | ');
    parts.push(`(${optionValues})`);
  }
  
  return parts.join(' ');
}

/**
 * Export dashboard primitives to Excel based on config
 */
export function exportConfigToExcel(inputs: DashboardInputs) {
  const primitives: PrimitiveRow[] = [];
  
  // Iterate through all sections in config
  for (const section of dashboardConfig.sections) {
    // Add section header
    primitives.push({
      'Control Label': `═══ ${section.title.toUpperCase()} ═══`,
      'Primitive ID': '',
      'Type / Control': '',
      'Default / Range': '',
      'Current Value': '',
      'Formula / Logic': '',
      'Tooltip': ''
    });
    
    // Add all controls from all accordions in this section
    for (const accordion of section.accordions) {
      // Skip empty accordions
      if (accordion.controls.length === 0) continue;
      
      // Optionally add accordion subtitle (commented out for cleaner output)
      // primitives.push({
      //   'Control Label': `--- ${accordion.title} ---`,
      //   'Primitive ID': '',
      //   'Type / Control': '',
      //   'Default / Range': '',
      //   'Current Value': '',
      //   'Formula / Logic': '',
      //   'Tooltip': ''
      // });
      
      for (const control of accordion.controls) {
        const currentValue = (inputs as any)[control.id] ?? control.default;
        
        primitives.push({
          'Control Label': control.label,
          'Primitive ID': control.id,
          'Type / Control': control.type.charAt(0).toUpperCase() + control.type.slice(1),
          'Default / Range': formatDefaultRange(control),
          'Current Value': formatControlValue(control, currentValue),
          'Formula / Logic': control.formula || control.description || '',
          'Tooltip': control.tooltip || ''
        });
      }
    }
    
    // Add blank row between sections
    primitives.push({
      'Control Label': '',
      'Primitive ID': '',
      'Type / Control': '',
      'Default / Range': '',
      'Current Value': '',
      'Formula / Logic': '',
      'Tooltip': ''
    });
  }
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(primitives);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Control Label
    { wch: 35 }, // Primitive ID
    { wch: 15 }, // Type / Control
    { wch: 20 }, // Default / Range
    { wch: 15 }, // Current Value
    { wch: 40 }, // Formula / Logic
    { wch: 50 }  // Tooltip
  ];
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Primitives Reference');
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Pillars_Config_${timestamp}.xlsx`;
  
  // Download
  XLSX.writeFile(wb, filename);
}

