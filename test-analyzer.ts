import { analyzeCodebase } from './server/services/codeAnalyzer.js';

async function testAnalyzer() {
  console.log('Testing code analyzer...\n');
  
  try {
    const result = await analyzeCodebase();
    
    console.log('✅ Analysis completed successfully!\n');
    console.log('=== SYSTEM ASSESSMENT ===');
    console.log(`Grade: ${result.systemAssessment.grade}/100`);
    console.log(`Maturity: ${result.systemAssessment.maturityLevel}`);
    console.log(`Summary: ${result.systemAssessment.summary.substring(0, 200)}...\n`);
    
    console.log('=== STRENGTHS ===');
    console.log(`Found ${result.strengths.length} strengths`);
    result.strengths.slice(0, 3).forEach((s, i) => {
      console.log(`${i + 1}. ${s.substring(0, 100)}...`);
    });
    
    console.log('\n=== ISSUES ===');
    console.log(`Found ${result.issues.length} issues`);
    const criticalCount = result.issues.filter(i => i.priority === 'CRITICAL').length;
    const highCount = result.issues.filter(i => i.priority === 'HIGH').length;
    const mediumCount = result.issues.filter(i => i.priority === 'MEDIUM').length;
    console.log(`- CRITICAL: ${criticalCount}`);
    console.log(`- HIGH: ${highCount}`);
    console.log(`- MEDIUM: ${mediumCount}`);
    
    console.log('\nTop 3 issues:');
    result.issues.slice(0, 3).forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.priority}] ${issue.title}`);
      console.log(`   Type: ${issue.errorType}`);
      console.log(`   Risk: ${issue.riskDescription.substring(0, 100)}...`);
    });
    
    console.log('\n=== DEBUG PROMPT ===');
    console.log(`Context: ${result.debugPrompt.context.system_type}`);
    console.log(`Files to analyze: ${result.debugPrompt.files_to_analyze.length}`);
    console.log(`Debug focus items: ${result.debugPrompt.debug_focus.length}`);
    
    console.log('\n✅ Test passed! The analyzer is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAnalyzer();

