import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/mysql2';
import { scenarios } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

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
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('[API] DATABASE_URL not set');
      return res.status(500).json({ 
        status: 'error',
        error: 'Database not configured',
        details: 'DATABASE_URL environment variable is missing'
      });
    }

    // Create database connection
    const db = drizzle(process.env.DATABASE_URL);
    
    // Generate ID from name (lowercase, replace spaces with hyphens)
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    // Load scenario from database
    const result = await db.select().from(scenarios).where(eq(scenarios.id, id)).limit(1);
    
    if (result.length === 0) {
      console.log('[API] Scenario not found:', name);
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const scenario = result[0];
    const data = JSON.parse(scenario.data);
    
    console.log('[API] Successfully loaded scenario:', name);
    return res.status(200).json({ 
      status: 'ok',
      data,
      created_at: scenario.createdAt,
      updated_at: scenario.updatedAt
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

