import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/mysql2';
import { scenarios } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

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
    
    // Save scenario to database (upsert)
    await db.insert(scenarios)
      .values({
        id,
        name,
        data: JSON.stringify(data),
      })
      .onDuplicateKeyUpdate({
        set: {
          data: JSON.stringify(data),
          updatedAt: new Date(),
        },
      });
    
    console.log('[API] Successfully saved scenario to database:', name);
    
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

