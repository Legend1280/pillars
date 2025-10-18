import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../../data');
const SCENARIOS_FILE = join(DATA_DIR, 'scenarios.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize scenarios file if it doesn't exist
if (!existsSync(SCENARIOS_FILE)) {
  writeFileSync(SCENARIOS_FILE, JSON.stringify({}), 'utf-8');
}

export interface ScenarioData {
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
}

function loadScenarios(): Record<string, ScenarioData> {
  try {
    const content = readFileSync(SCENARIOS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[DB] Error loading scenarios:', error);
    return {};
  }
}

function saveScenarios(scenarios: Record<string, ScenarioData>): void {
  try {
    writeFileSync(SCENARIOS_FILE, JSON.stringify(scenarios, null, 2), 'utf-8');
  } catch (error) {
    console.error('[DB] Error saving scenarios:', error);
    throw error;
  }
}

export const db = {
  saveScenario(name: string, data: any): void {
    const scenarios = loadScenarios();
    const now = new Date().toISOString();
    
    scenarios[name] = {
      name,
      data,
      created_at: scenarios[name]?.created_at || now,
      updated_at: now,
    };
    
    saveScenarios(scenarios);
  },

  loadScenario(name: string): any | null {
    const scenarios = loadScenarios();
    return scenarios[name]?.data || null;
  },

  listScenarios(): ScenarioData[] {
    const scenarios = loadScenarios();
    return Object.values(scenarios).sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  deleteScenario(name: string): boolean {
    const scenarios = loadScenarios();
    if (scenarios[name]) {
      delete scenarios[name];
      saveScenarios(scenarios);
      return true;
    }
    return false;
  },
};

console.log('[DB] JSON file storage initialized at', SCENARIOS_FILE);

export default db;

