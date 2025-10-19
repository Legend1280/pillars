import { Router } from 'express';
import type { Request, Response } from 'express';
import archiver from 'archiver';

const router = Router();

router.post('/export-debug-packet', async (req: Request, res: Response) => {
  try {
    const { ontologyGraph, inputs } = req.body;

    if (!ontologyGraph) {
      return res.status(400).json({ error: 'Missing required parameter: ontologyGraph' });
    }

    // Read the source files
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const calculationsPath = path.join(process.cwd(), 'client', 'src', 'lib', 'calculations.ts');
    const dataPath = path.join(process.cwd(), 'client', 'src', 'lib', 'data.ts');
    const calculationGraphPath = path.join(process.cwd(), 'client', 'src', 'lib', 'calculationGraph.ts');
    const primitivesPath = path.join(process.cwd(), 'client', 'src', 'lib', 'primitives.ts');
    
    const [calculationsCode, dataCode, calculationGraphCode, primitivesCode] = await Promise.all([
      fs.readFile(calculationsPath, 'utf-8'),
      fs.readFile(dataPath, 'utf-8'),
      fs.readFile(calculationGraphPath, 'utf-8'),
      fs.readFile(primitivesPath, 'utf-8').catch(() => '// Primitives file not found'),
    ]);

    // Extract default ranges from data.ts comments
    const defaultRanges = extractDefaultRanges(dataCode);

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=debug-packet.zip');
    
    archive.pipe(res);

    // Add files to archive
    archive.append(JSON.stringify(ontologyGraph, null, 2), { name: '1-ontology-graph.json' });
    archive.append(calculationsCode, { name: '2-calculations.ts' });
    archive.append(dataCode, { name: '3-data-model.ts' });
    archive.append(calculationGraphCode, { name: '4-calculation-graph.ts' });
    archive.append(primitivesCode, { name: '5-primitives.ts' });
    archive.append(JSON.stringify(defaultRanges, null, 2), { name: '6-default-ranges.json' });
    
    // Add current inputs if provided
    if (inputs) {
      archive.append(JSON.stringify(inputs, null, 2), { name: '7-current-inputs.json' });
    }

    // Add README
    const readme = `# Financial Model Debug Packet

This package contains a comprehensive snapshot of your financial model for analysis and debugging.

## Contents

1. **ontology-graph.json** - Visual structure showing all 128 nodes and 96 edges with their relationships
2. **calculations.ts** - TypeScript implementation of all calculation functions
3. **data-model.ts** - Type definitions and interfaces for all data structures
4. **calculation-graph.ts** - Dependency graph showing how calculations flow
5. **primitives.ts** - Primitive values and formulas used throughout the model
6. **default-ranges.json** - Min/max/default values for all input parameters
7. **current-inputs.json** - Your current input values (if included)

## Use Cases

- **Code Review**: Audit calculation logic and formulas
- **Documentation**: Understand model structure and dependencies
- **Debugging**: Identify issues in calculation flow
- **Analysis**: Review default ranges and input constraints
- **Integration**: Provide context to AI agents or developers

Generated: ${new Date().toISOString()}
`;
    archive.append(readme, { name: 'README.md' });

    await archive.finalize();

  } catch (err) {
    console.error('[Debug Packet] Error:', err);
    res.status(500).json({ 
      error: 'Failed to generate debug packet', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
});

function extractDefaultRanges(dataCode: string): Record<string, any> {
  const ranges: Record<string, any> = {};
  
  // Parse comments like: "// 0-250, default 50"
  const lines = dataCode.split('\n');
  let currentField = '';
  
  for (const line of lines) {
    // Match field name
    const fieldMatch = line.match(/^\s*(\w+):\s*\w+;/);
    if (fieldMatch) {
      currentField = fieldMatch[1];
    }
    
    // Match range comment
    const rangeMatch = line.match(/\/\/\s*([^,]+),\s*default\s+(.+)/);
    if (rangeMatch && currentField) {
      const rangeStr = rangeMatch[1].trim();
      const defaultStr = rangeMatch[2].trim();
      
      // Parse range like "0-250" or "$400-$600"
      const minMaxMatch = rangeStr.match(/\$?(\d+)-\$?(\d+)(%)?/);
      if (minMaxMatch) {
        ranges[currentField] = {
          min: parseFloat(minMaxMatch[1]),
          max: parseFloat(minMaxMatch[2]),
          default: parseFloat(defaultStr.replace(/[^0-9.-]/g, '')),
          unit: rangeStr.includes('$') ? 'currency' : rangeStr.includes('%') ? 'percentage' : 'number',
          description: line.split('//')[1]?.trim() || ''
        };
      }
    }
  }
  
  return ranges;
}

export default router;

