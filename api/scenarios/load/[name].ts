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
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Scenario name is required' });
    }

    console.log('[API] Loading scenario:', name);
    
    const key = `scenario:${name}`;
    const scenario = await kv.get<ScenarioData>(key);
    
    if (!scenario) {
      console.log('[API] Scenario not found:', name);
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    console.log('[API] Successfully loaded scenario:', name);
    return res.status(200).json({ 
      status: 'ok',
      data: scenario.data,
      created_at: scenario.created_at,
      updated_at: scenario.updated_at
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

