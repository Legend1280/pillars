import type { DashboardInputs } from './data';
import { defaultInputs } from './data';

const API_BASE = '/api/scenarios';

export async function saveScenario(name: string, data: DashboardInputs): Promise<void> {
  console.log('[SAVE] Saving scenario:', name);
  console.log('[SAVE] Data being saved:', {
    scenarioMode: data.scenarioMode,
    additionalPhysicians: data.additionalPhysicians,
    primaryPrice: data.primaryPrice,
    // ... other key fields for debugging
  });
  
  const response = await fetch(`${API_BASE}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data }),
  });
  
  console.log('[SAVE] Response status:', response.status);
  
  if (!response.ok) {
    console.error('[SAVE] Failed:', response.statusText);
    throw new Error(`Failed to save scenario: ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('[SAVE] Success:', result);
}

export async function loadScenario(name: string): Promise<DashboardInputs | null> {
  const response = await fetch(`${API_BASE}/load/${name}`);
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`Failed to load scenario: ${response.statusText}`);
  }
  
  const result = await response.json();
  // Merge saved data with defaults to ensure new fields have default values
  return { ...defaultInputs, ...result.data };
}

export async function listScenarios(): Promise<Array<{ name: string; created_at: string; updated_at: string }>> {
  const response = await fetch(`${API_BASE}/list`);
  
  if (!response.ok) {
    throw new Error(`Failed to list scenarios: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.scenarios;
}

export async function deleteScenario(name: string): Promise<void> {
  const response = await fetch(`${API_BASE}/delete/${name}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete scenario: ${response.statusText}`);
  }
}

