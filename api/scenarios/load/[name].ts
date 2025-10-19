import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';

interface ScenarioData {
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
}

// Create Redis client
function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  return new Redis(redisUrl);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let redis: Redis | null = null;

  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Scenario name is required' });
    }

    console.log('[API] Loading scenario:', name);
    
    redis = getRedisClient();
    const key = `scenario:${name}`;
    const data = await redis.get(key);
    
    if (!data) {
      console.log('[API] Scenario not found:', name);
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const scenario: ScenarioData = JSON.parse(data);
    
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
  } finally {
    // Close Redis connection
    if (redis) {
      redis.disconnect();
    }
  }
}

