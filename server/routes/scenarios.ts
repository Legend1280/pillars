import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Save or update a scenario
router.post('/save', (req, res) => {
  try {
    const { name, data } = req.body;
    
    if (!name || !data) {
      return res.status(400).json({ error: 'Name and data are required' });
    }

    // Upsert scenario
    const stmt = db.prepare(`
      INSERT INTO scenarios (name, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(name) DO UPDATE SET
        data = excluded.data,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(name, JSON.stringify(data));
    
    res.json({ success: true, message: `Saved scenario: ${name}` });
  } catch (error) {
    console.error('[API] Error saving scenario:', error);
    res.status(500).json({ error: 'Failed to save scenario' });
  }
});

// Load a scenario by name
router.get('/load/:name', (req, res) => {
  try {
    const { name } = req.params;
    
    const stmt = db.prepare('SELECT data FROM scenarios WHERE name = ?');
    const row = stmt.get(name) as { data: string } | undefined;
    
    if (!row) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.json({ success: true, data: JSON.parse(row.data) });
  } catch (error) {
    console.error('[API] Error loading scenario:', error);
    res.status(500).json({ error: 'Failed to load scenario' });
  }
});

// List all scenarios
router.get('/list', (req, res) => {
  try {
    const stmt = db.prepare('SELECT name, created_at, updated_at FROM scenarios ORDER BY updated_at DESC');
    const rows = stmt.all();
    
    res.json({ success: true, scenarios: rows });
  } catch (error) {
    console.error('[API] Error listing scenarios:', error);
    res.status(500).json({ error: 'Failed to list scenarios' });
  }
});

// Delete a scenario
router.delete('/delete/:name', (req, res) => {
  try {
    const { name } = req.params;
    
    const stmt = db.prepare('DELETE FROM scenarios WHERE name = ?');
    const result = stmt.run(name);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.json({ success: true, message: `Deleted scenario: ${name}` });
  } catch (error) {
    console.error('[API] Error deleting scenario:', error);
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

export default router;

