const { buildCalculationInventory } = require('./client/src/lib/calculationAnalyzer.ts');

const inventory = buildCalculationInventory();

console.log('\n📊 ONTOLOGY SUMMARY\n');
console.log(`Total Nodes: ${inventory.nodes.length}`);
console.log(`Total Edges: ${inventory.edges.length}`);
console.log(`\nBy Type:`);
console.log(`  Inputs: ${inventory.layers.inputs.length}`);
console.log(`  Derived: ${inventory.layers.derived.length}`);
console.log(`  Calculations: ${inventory.layers.calculations.length}`);
console.log(`  Outputs: ${inventory.layers.outputs.length}`);

console.log(`\nComplexity:`);
console.log(`  Max: ${inventory.stats.maxComplexity}`);
console.log(`  Avg: ${inventory.stats.avgComplexity.toFixed(2)}`);

console.log('\n✅ Ontology loaded successfully!\n');
