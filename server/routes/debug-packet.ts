import { Router } from 'express';
import type { Request, Response } from 'express';
import archiver from 'archiver';
import { readFileSync } from 'fs';
import { join } from 'path';
import { analyzeCodebase } from '../services/codeAnalyzer.js';

const router = Router();

router.post('/export-debug-packet', async (req: Request, res: Response) => {
  try {
    const { ontologyGraph, inputs } = req.body;

    if (!ontologyGraph) {
      return res.status(400).json({ error: 'Missing required parameter: ontologyGraph' });
    }

    console.log('[Debug Packet] Starting export with code analysis...');

    // Perform deep code analysis
    const codeAnalysis = await analyzeCodebase();

    // Read the source files synchronously
    const basePath = process.cwd();
    const calculationsPath = join(basePath, 'client', 'src', 'lib', 'calculations.ts');
    const dataPath = join(basePath, 'client', 'src', 'lib', 'data.ts');
    const calculationGraphPath = join(basePath, 'client', 'src', 'lib', 'calculationGraph.ts');
    const enhancedGraphPath = join(basePath, 'client', 'src', 'lib', 'calculationGraphEnhanced.ts');
    
    const calculationsCode = readFileSync(calculationsPath, 'utf-8');
    const dataCode = readFileSync(dataPath, 'utf-8');
    const calculationGraphCode = readFileSync(calculationGraphPath, 'utf-8');
    const enhancedGraphCode = readFileSync(enhancedGraphPath, 'utf-8');

    // Create README
    const readme = `# Pillars Dashboard Debug Packet

Generated: ${new Date().toISOString()}

## Contents

1. **1-ontology-graph.json** - AI-powered code analysis with system assessment, strengths, issues, and debug guidance
2. **2-calculations.ts** - Core calculation logic
3. **3-data-model.ts** - Data model and default values
4. **4-calculation-graph.ts** - Basic calculation graph builder
5. **5-calculation-graph-enhanced.ts** - Enhanced graph builder with stats
6. **6-inputs.json** - Current dashboard inputs

## System Assessment

**Grade:** ${codeAnalysis.systemAssessment.grade}/100
**Maturity Level:** ${codeAnalysis.systemAssessment.maturityLevel}

**Summary:** ${codeAnalysis.systemAssessment.summary}

## Issues Found

- **CRITICAL:** ${codeAnalysis.issues.filter(i => i.priority === 'CRITICAL').length}
- **HIGH:** ${codeAnalysis.issues.filter(i => i.priority === 'HIGH').length}
- **MEDIUM:** ${codeAnalysis.issues.filter(i => i.priority === 'MEDIUM').length}
- **LOW:** ${codeAnalysis.issues.filter(i => i.priority === 'LOW').length}

## Strengths Identified

${codeAnalysis.strengths.length} architectural and implementation strengths documented.

## Purpose

This debug packet contains a comprehensive AI-powered analysis of the Pillars financial modeling system, including:
- Detailed system assessment with quality grade
- Identified strengths and best practices
- Prioritized issues with specific line numbers and fix recommendations
- Structured debug guidance for developers

Use the 1-ontology-graph.json file as your primary reference for understanding system quality and required fixes.
`;

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=debug-packet-${Date.now()}.zip`);
    
    // Create archive using proper syntax
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Handle errors
    archive.on('error', (err) => {
      console.error('[Debug Packet] Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create archive' });
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add files to archive - 1-ontology-graph.json now contains the AI analysis
    archive.append(JSON.stringify(codeAnalysis, null, 2), { name: '1-ontology-graph.json' });
    archive.append(calculationsCode, { name: '2-calculations.ts' });
    archive.append(dataCode, { name: '3-data-model.ts' });
    archive.append(calculationGraphCode, { name: '4-calculation-graph.ts' });
    archive.append(enhancedGraphCode, { name: '5-calculation-graph-enhanced.ts' });
    archive.append(JSON.stringify(inputs || {}, null, 2), { name: '6-inputs.json' });
    archive.append(readme, { name: 'README.md' });

    // Finalize the archive
    await archive.finalize();
    
    console.log('[Debug Packet] Export completed successfully with AI analysis');

  } catch (error) {
    console.error('[Debug Packet] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to export debug packet' });
    }
  }
});

export default router;

