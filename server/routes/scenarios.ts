import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Save or update a scenario
router.post('/save', (req, res) => {
  try {
    const { name, data } = req.body;
    
    console.log('[API] Received save request for:', name);
    console.log('[API] Key fields:', {
      scenarioMode: data?.scenarioMode,
      additionalPhysicians: data?.additionalPhysicians,
      primaryPrice: data?.primaryPrice,
    });
    
    if (!name || !data) {
      console.error('[API] Missing name or data');
      return res.status(400).json({ error: 'Name and data are required' });
    }

    // Save scenario
    db.saveScenario(name, data);
    console.log('[API] Successfully saved scenario:', name);
    
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
    
    const data = db.loadScenario(name);
    
    if (!data) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Error loading scenario:', error);
    res.status(500).json({ error: 'Failed to load scenario' });
  }
});

// List all scenarios
router.get('/list', (req, res) => {
  try {
    const scenarios = db.listScenarios();
    res.json({ success: true, scenarios });
  } catch (error) {
    console.error('[API] Error listing scenarios:', error);
    res.status(500).json({ error: 'Failed to list scenarios' });
  }
});

// Delete a scenario
router.delete('/delete/:name', (req, res) => {
  try {
    const { name } = req.params;
    
    const deleted = db.deleteScenario(name);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.json({ success: true, message: `Deleted scenario: ${name}` });
  } catch (error) {
    console.error('[API] Error deleting scenario:', error);
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

export default router;

