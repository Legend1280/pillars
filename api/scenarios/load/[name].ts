import type { VercelRequest, VercelResponse } from '@vercel/node';

// Storage helper using Forge API
async function storageGet(relKey: string): Promise<string | null> {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('Storage credentials missing');
  }

  const key = relKey.replace(/^\/+/, '');
  const downloadApiUrl = new URL('v1/storage/downloadUrl', baseUrl.replace(/\/+$/, '') + '/');
  downloadApiUrl.searchParams.set('path', key);

  const response = await fetch(downloadApiUrl.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Storage download URL failed: ${response.statusText}`);
  }

  const { url } = await response.json();
  
  // Fetch the actual content
  const contentResponse = await fetch(url);
  if (!contentResponse.ok) {
    return null;
  }

  return await contentResponse.text();
}

interface ScenarioData {
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
}

const SCENARIOS_KEY = 'pillars/scenarios.json';

async function loadScenarios(): Promise<Record<string, ScenarioData>> {
  try {
    const content = await storageGet(SCENARIOS_KEY);
    if (!content) {
      return {};
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('[Storage] Error loading scenarios:', error);
    return {};
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Scenario name is required' });
    }
    
    const scenarios = await loadScenarios();
    const scenario = scenarios[name];
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    return res.status(200).json({ 
      status: 'ok',
      success: true, 
      data: scenario.data 
    });
  } catch (error) {
    console.error('[API] Error loading scenario:', error);
    return res.status(500).json({ 
      status: 'error',
      error: 'Failed to load scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

