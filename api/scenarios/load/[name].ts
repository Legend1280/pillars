import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const redis = new Redis(process.env.REDIS_URL!);

  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Scenario name is required' });
    }

    const key = `scenario:${name}`;
    const value = await redis.get(key);
    
    if (!value) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const scenario = JSON.parse(value);
    
    return res.status(200).json({ 
      status: 'ok',
      data: scenario.data,
      updated_at: scenario.updated_at
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      status: 'error',
      error: 'Failed to load scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    redis.disconnect();
  }
}

