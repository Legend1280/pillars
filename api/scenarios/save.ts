import type { VercelRequest, VercelResponse } from '@vercel/node';

// Storage helper using Forge API
async function storagePut(
  relKey: string,
  data: string,
  contentType = 'application/json'
): Promise<{ key: string; url: string }> {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('Storage credentials missing');
  }

  const key = relKey.replace(/^\/+/, '');
  const uploadUrl = new URL('v1/storage/upload', baseUrl.replace(/\/+$/, '') + '/');
  uploadUrl.searchParams.set('path', key);

  const blob = new Blob([data], { type: contentType });
  const formData = new FormData();
  formData.append('file', blob, key.split('/').pop() ?? key);

  const response = await fetch(uploadUrl.toString(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed: ${message}`);
  }

  const result = await response.json();
  return { key, url: result.url };
}

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

async function saveScenarios(scenarios: Record<string, ScenarioData>): Promise<void> {
  try {
    const content = JSON.stringify(scenarios, null, 2);
    await storagePut(SCENARIOS_KEY, content, 'application/json');
  } catch (error) {
    console.error('[Storage] Error saving scenarios:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, data } = req.body;
    
    console.log('[API] Received save request for:', name);
    
    if (!name || !data) {
      console.error('[API] Missing name or data');
      return res.status(400).json({ error: 'Name and data are required' });
    }

    // Load existing scenarios
    const scenarios = await loadScenarios();
    const now = new Date().toISOString();
    
    // Save scenario
    scenarios[name] = {
      name,
      data,
      created_at: scenarios[name]?.created_at || now,
      updated_at: now,
    };
    
    await saveScenarios(scenarios);
    console.log('[API] Successfully saved scenario:', name);
    
    return res.status(200).json({ 
      status: 'ok',
      success: true, 
      message: `Saved scenario: ${name}` 
    });
  } catch (error) {
    console.error('[API] Error saving scenario:', error);
    return res.status(500).json({ 
      status: 'error',
      error: 'Failed to save scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

