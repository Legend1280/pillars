import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const redis = new Redis(process.env.REDIS_URL!);

  try {
    const { name, data } = req.body;
    
    if (!name || !data) {
      return res.status(400).json({ error: 'Name and data are required' });
    }

    const key = `scenario:${name}`;
    const value = JSON.stringify({
      name,
      data,
      updated_at: new Date().toISOString()
    });
    
    await redis.set(key, value);
    
    return res.status(200).json({ 
      status: 'ok',
      success: true, 
      message: `Saved scenario: ${name}` 
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      status: 'error',
      error: 'Failed to save scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    redis.disconnect();
  }
}

