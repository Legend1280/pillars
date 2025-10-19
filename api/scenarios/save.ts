import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/kv';

// Create KV client with explicit Redis URL
const kv = createClient({
  url: process.env.REDIS_URL || process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

interface ScenarioData {
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
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

    const now = new Date().toISOString();
    const key = `scenario:${name}`;
    
    // Check if scenario already exists to preserve created_at
    const existing = await kv.get<ScenarioData>(key);
    
    // Save scenario to Vercel KV
    const scenarioData: ScenarioData = {
      name,
      data,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    
    await kv.set(key, scenarioData);
    console.log('[API] Successfully saved scenario to Vercel KV:', name);
    
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

