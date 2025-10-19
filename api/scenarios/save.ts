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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let redis: Redis | null = null;

  try {
    const { name, data } = req.body;
    
    console.log('[API] Received save request for:', name);
    
    if (!name || !data) {
      console.error('[API] Missing name or data');
      return res.status(400).json({ error: 'Name and data are required' });
    }

    redis = getRedisClient();
    const now = new Date().toISOString();
    const key = `scenario:${name}`;
    
    // Check if scenario already exists to preserve created_at
    const existingData = await redis.get(key);
    const existing = existingData ? JSON.parse(existingData) : null;
    
    // Save scenario to Redis
    const scenarioData: ScenarioData = {
      name,
      data,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    
    await redis.set(key, JSON.stringify(scenarioData));
    console.log('[API] Successfully saved scenario to Redis:', name);
    
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
  } finally {
    // Close Redis connection
    if (redis) {
      redis.disconnect();
    }
  }
}

