# Phase 1: Complete Ontological Map - Development Roadmap

**Status:** 🚧 IN PROGRESS  
**Branch:** `feature/ontological-map`  
**Estimated Time:** 16-20 hours  
**Started:** October 18, 2025

---

## 🎯 Goal

Build a complete, interactive ontological map of the entire Pillars Financial Dashboard calculation system, showing all 200+ nodes across all layers with full dependency tracking.

---

## 📊 Current State (v1 - DEPLOYED)

✅ **Master Debug Dashboard Live**
- 4 interactive tabs (Ontology, Drift, Validation, All Data)
- Basic network visualization (~40 nodes)
- Drift detection engine (80% drift score)
- 6 automated validation checks
- Complete input/output data tables

**Production URL:** https://pillars-liard.vercel.app

---

## 🗺️ Phase 1 Milestones

### Milestone 1: Deep Calculation Analysis (4-6 hours)
**Status:** 📋 PLANNED

**Objectives:**
- Parse `calculations.ts` completely
- Extract every formula and dependency
- Map all intermediate calculations
- Build comprehensive node/edge data structure
- Document every calculation with metadata

**Deliverables:**
- [ ] Complete calculation inventory (JSON)
- [ ] Formula extraction utility
- [ ] Dependency mapping utility
- [ ] Metadata schema for all nodes

**Files to Create/Modify:**
- `lib/calculationAnalyzer.ts` - New parser
- `lib/calculationInventory.json` - Complete map
- `lib/formulaExtractor.ts` - Formula parser

---

### Milestone 2: Enhanced Graph Builder (6-8 hours)
**Status:** 📋 PLANNED

**Objectives:**
- Expand `calculationGraph.ts` to include ALL nodes
- Add layer classification (Input/Derived/Calculation/Output)
- Add formula extraction for each node
- Add code snippet extraction
- Build upstream/downstream dependency chains
- Add impact analysis capabilities

**Deliverables:**
- [ ] Full 200+ node graph builder
- [ ] Layer classification system
- [ ] Formula metadata for each node
- [ ] Impact analysis engine
- [ ] Dependency chain tracer

**Files to Modify:**
- `lib/calculationGraph.ts` - Major expansion
- `lib/impactAnalysis.ts` - New feature

---

### Milestone 3: Advanced Visualization (4-6 hours)
**Status:** 📋 PLANNED

**Objectives:**
- Implement layer-based layout (hierarchical)
- Add advanced filtering (by layer, category, impact)
- Add search with autocomplete
- Add click-to-trace functionality
- Add node detail panel with formula/code/value
- Add minimap for navigation
- Performance optimization for 200+ nodes

**Deliverables:**
- [ ] Layer-based graph layout
- [ ] Advanced filter controls
- [ ] Search functionality
- [ ] Trace visualization
- [ ] Detail panel component
- [ ] Minimap component
- [ ] Performance benchmarks

**Files to Modify:**
- `components/CalculationFlowVisualization.tsx` - Major upgrade
- `components/NodeDetailPanel.tsx` - New component
- `components/GraphMinimap.tsx` - New component

---

### Milestone 4: Export & Documentation (2-3 hours)
**Status:** 📋 PLANNED

**Objectives:**
- Export graph as JSON
- Export as CSV (for Excel analysis)
- Export visualization as PNG/SVG
- Generate markdown documentation
- Add help/tutorial overlay

**Deliverables:**
- [ ] JSON export functionality
- [ ] CSV export functionality
- [ ] Image export (PNG/SVG)
- [ ] Auto-generated documentation
- [ ] Interactive tutorial

**Files to Create:**
- `lib/graphExporter.ts` - Export utilities
- `lib/documentationGenerator.ts` - Auto-docs
- `components/TutorialOverlay.tsx` - Help system

---

## 🎨 Technical Architecture

### Data Flow
```
calculations.ts (source code)
    ↓
calculationAnalyzer.ts (parser)
    ↓
calculationInventory.json (complete map)
    ↓
calculationGraph.ts (graph builder)
    ↓
CalculationFlowVisualization.tsx (renderer)
    ↓
Interactive Graph (user sees)
```

### Node Structure
```typescript
interface OntologicalNode {
  id: string;
  label: string;
  type: 'input' | 'derived' | 'calculation' | 'output';
  layer: number; // 1-5
  category: string;
  formula?: string; // Human-readable
  code?: string; // TypeScript code
  value?: any; // Current computed value
  dependencies: string[]; // Node IDs this depends on
  dependents: string[]; // Node IDs that depend on this
  metadata: {
    file: string;
    line: number;
    complexity: number;
    impact: 'low' | 'medium' | 'high';
  };
}
```

---

## 📈 Success Metrics

### Completeness
- [ ] 100% of inputs mapped (82 inputs)
- [ ] 100% of derived variables mapped (~20 variables)
- [ ] 100% of calculations mapped (~100 calculations)
- [ ] 100% of outputs mapped (~30 outputs)
- [ ] **Total: 200+ nodes**

### Accuracy
- [ ] All dependencies correctly identified
- [ ] All formulas extracted correctly
- [ ] All code snippets accurate
- [ ] Zero broken links in graph

### Performance
- [ ] Graph renders in < 2 seconds
- [ ] Smooth interaction (60 FPS)
- [ ] Search responds in < 100ms
- [ ] Handles 200+ nodes without lag

### Usability
- [ ] Intuitive navigation
- [ ] Clear visual hierarchy
- [ ] Helpful tooltips and labels
- [ ] Export works reliably

---

## 🚀 Deployment Strategy

### Development
- All work on `feature/ontological-map` branch
- Regular commits with descriptive messages
- Test locally before pushing

### Testing
- Manual testing of all features
- Performance profiling
- Cross-browser testing
- Mobile responsiveness check

### Merge to Production
- Create pull request when complete
- Review all changes
- Merge to `dev` first
- Test on dev deployment
- Merge to `master`
- Deploy to production

---

## 📝 Next Steps After Phase 1

### Phase 2: LLM Formula Validator (12-16 hours)
- Integrate OpenAI/Anthropic API
- Validate each formula against business logic
- Flag suspicious calculations
- Generate improvement suggestions

### Phase 3: Interactive Debugging Assistant (12-16 hours)
- Chat interface for debugging
- Natural language queries
- AI-powered explanations
- "What if" scenario analysis

---

## 📚 Resources

### Documentation
- React Flow: https://reactflow.dev/
- TypeScript AST: https://ts-ast-viewer.com/
- Graph Theory: https://en.wikipedia.org/wiki/Graph_theory

### Tools
- React Flow for visualization
- TypeScript Compiler API for parsing
- D3.js for advanced layouts (if needed)

---

## 🎯 Current Focus

**NOW:** Milestone 1 - Deep Calculation Analysis

**Starting with:** Parsing calculations.ts to extract all formulas

---

**Last Updated:** October 18, 2025  
**Developer:** Manus AI  
**Project:** Pillars Financial Dashboard

