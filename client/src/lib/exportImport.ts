import { DashboardInputs } from "./data";

export interface ScenarioExport {
  version: string;
  timestamp: string;
  scenarioName: string;
  primitives: DashboardInputs;
  metadata?: {
    author?: string;
    notes?: string;
  };
}

/**
 * Export current primitives to JSON
 */
export function exportPrimitives(inputs: DashboardInputs, scenarioName: string = "Untitled Scenario"): ScenarioExport {
  return {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    scenarioName,
    primitives: inputs,
  };
}

/**
 * Download JSON file
 */
export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported scenario structure
 */
export function validateScenario(data: any): { valid: boolean; error?: string } {
  if (!data.version) {
    return { valid: false, error: "Missing version field" };
  }
  if (!data.primitives) {
    return { valid: false, error: "Missing primitives field" };
  }
  // Add more validation as needed
  return { valid: true };
}

/**
 * Import primitives from JSON
 */
export function importPrimitives(file: File): Promise<ScenarioExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const validation = validateScenario(data);
        if (!validation.valid) {
          reject(new Error(validation.error));
          return;
        }
        resolve(data as ScenarioExport);
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Save scenario to localStorage
 */
export function saveScenarioToLocal(scenario: ScenarioExport) {
  const saved = getSavedScenarios();
  saved.push(scenario);
  localStorage.setItem("pillars_scenarios", JSON.stringify(saved));
}

/**
 * Get all saved scenarios from localStorage
 */
export function getSavedScenarios(): ScenarioExport[] {
  const data = localStorage.getItem("pillars_scenarios");
  return data ? JSON.parse(data) : [];
}

/**
 * Delete a saved scenario
 */
export function deleteScenario(timestamp: string) {
  const saved = getSavedScenarios();
  const filtered = saved.filter((s) => s.timestamp !== timestamp);
  localStorage.setItem("pillars_scenarios", JSON.stringify(filtered));
}

