import { DashboardConfig, validateConfig } from './dashboardConfig';

/**
 * Download dashboard configuration as JSON file
 */
export function downloadConfig(config: DashboardConfig, filename: string = 'dashboard-config.json') {
  const jsonString = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload and parse dashboard configuration from JSON file
 */
export function uploadConfig(): Promise<DashboardConfig> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      try {
        const text = await file.text();
        const config = JSON.parse(text) as DashboardConfig;
        
        // Validate the config
        const validation = validateConfig(config);
        if (!validation.valid) {
          reject(new Error(`Invalid config: ${validation.errors.join(', ')}`));
          return;
        }
        
        resolve(config);
      } catch (error) {
        reject(new Error(`Failed to parse config: ${error}`));
      }
    };
    
    input.click();
  });
}

/**
 * Export config to localStorage for persistence
 */
export function saveConfigToStorage(config: DashboardConfig) {
  try {
    localStorage.setItem('dashboard-config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Failed to save config to storage:', error);
    return false;
  }
}

/**
 * Load config from localStorage
 */
export function loadConfigFromStorage(): DashboardConfig | null {
  try {
    const stored = localStorage.getItem('dashboard-config');
    if (!stored) return null;
    
    const config = JSON.parse(stored) as DashboardConfig;
    const validation = validateConfig(config);
    
    if (!validation.valid) {
      console.error('Stored config is invalid:', validation.errors);
      return null;
    }
    
    return config;
  } catch (error) {
    console.error('Failed to load config from storage:', error);
    return null;
  }
}

/**
 * Clear config from localStorage
 */
export function clearConfigFromStorage() {
  localStorage.removeItem('dashboard-config');
}

