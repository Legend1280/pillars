import { DashboardInputs } from './data';
import { SCENARIO_PRESETS } from './scenarioPresets';
import { loadScenario } from './scenariosApi';

/**
 * Export all 3 scenarios as JSON
 * Pulls current saved values or falls back to presets
 */
export async function exportScenariosJSON() {
  try {
    const scenarios: Record<string, DashboardInputs> = {};
    
    // Load all 3 scenarios
    for (const key of ['lean', 'conservative', 'moderate']) {
      try {
        const saved = await loadScenario(key);
        scenarios[key] = saved || (SCENARIO_PRESETS[key] as DashboardInputs);
      } catch (error) {
        scenarios[key] = SCENARIO_PRESETS[key] as DashboardInputs;
      }
    }
    
    // Create export object
    const exportData = {
      exported: new Date().toISOString(),
      version: '1.0',
      scenarios
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `pillars-scenarios-${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('JSON export failed:', error);
    throw error;
  }
}

