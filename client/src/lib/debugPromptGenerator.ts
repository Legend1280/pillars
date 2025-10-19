/**
 * Debug Prompt Generator
 * 
 * Generates comprehensive debug prompts for AI analysis (Manus, Claude, etc.)
 */

import { DashboardInputs } from './data';
import { FinancialProjections } from './calculations';

export interface DebugPromptData {
  inputs: DashboardInputs;
  projections: FinancialProjections;
  ontologyGraph?: {
    nodes: any[];
    edges: any[];
  };
  aiAnalysis?: any;
  timestamp: string;
}

export function generateDebugPrompt(data: DebugPromptData): string {
  const { inputs, projections, ontologyGraph, aiAnalysis } = data;
  
  // Calculate key metrics
  const month12 = projections.projection[11];
  const totalInputs = Object.keys(inputs).length;
  const changedInputs = countChangedInputs(inputs);
  const driftScore = ((changedInputs / totalInputs) * 100).toFixed(1);
  
  return `# Pillars Financial Dashboard - Debug Analysis Request

## Context
I'm working on a Medical Service Organization (MSO) financial planning dashboard. I need you to analyze the current state, validate calculations, and identify issues.

## Dashboard Overview
- **Generated:** ${new Date(data.timestamp).toLocaleString()}
- **Total Inputs:** ${totalInputs} parameters
- **Modified Inputs:** ${changedInputs} (${driftScore}% drift from defaults)
- **Ontology Nodes:** ${ontologyGraph?.nodes.length || 'N/A'}
- **Ontology Connections:** ${ontologyGraph?.edges.length || 'N/A'}

## Key Financial Metrics (Month 12)
- **Total Revenue:** $${month12.revenue.toLocaleString()}
- **Total Costs:** $${month12.totalCosts.toLocaleString()}
- **Net Profit:** $${month12.netProfit.toLocaleString()}
- **Total Members:** ${month12.totalMembers.toLocaleString()}
- **Profit Margin:** ${((month12.netProfit / month12.revenue) * 100).toFixed(1)}%

## Current Input Values

### Physician Configuration
- Founding Physician: ${inputs.foundingToggle ? 'Yes' : 'No'}
- Additional Physicians: ${inputs.additionalPhysicians}
- Total Physicians: ${inputs.foundingToggle ? inputs.additionalPhysicians + 1 : inputs.additionalPhysicians}

### Pricing Structure
- Primary Care Price: $${inputs.primaryPrice}/month
- Specialty Visit Price: $${inputs.specialtyVisitPrice}/visit
- Corporate Price: $${inputs.corporatePricePerEmployee}/employee/month
- Diagnostics Margin: ${inputs.diagnosticsMargin}%

### Member Carryover
- Physician Primary Carryover: ${inputs.physicianPrimaryCarryover} members
- Other Physicians Carryover (avg): ${inputs.otherPhysiciansPrimaryCarryoverPerPhysician} members/physician
- Corporate Clients Carryover: ${inputs.corporateClientsCarryover} clients

### Growth Rates
- Primary Care Growth: ${inputs.primaryGrowthRate}% per month
- Specialty Care Growth: ${inputs.specialtyGrowthRate}% per month
- Corporate Growth: ${inputs.corporateGrowthRate}% per month
- Diagnostics Growth: ${inputs.diagnosticsExpansionRate}% per month

### Cost Structure
- Variable Cost %: ${inputs.variableCostPercentage}%
- Fixed Overhead: $${inputs.fixedCostMonthly.toLocaleString()}/month
- Diagnostics Margin: ${inputs.diagnosticsMargin}%

### Staffing
- Physician Salary: $${inputs.physicianSalary.toLocaleString()}/month
- Admin Staff Salary: $${inputs.avgAdminSalary.toLocaleString()}/month
- Admin Support Ratio: ${inputs.adminSupportRatio} staff per physician

### Timing
- Ramp Start Month: ${inputs.rampStartMonth}
- Ramp Duration: ${inputs.rampDuration} months
- Launch Month: ${inputs.rampStartMonth + inputs.rampDuration}

${aiAnalysis ? `
## AI Analysis Results
${aiAnalysis.overallHealth ? `- **Overall Health Score:** ${aiAnalysis.overallHealth}/100` : ''}

${aiAnalysis.structuralIssues?.length > 0 ? `
### Structural Issues Found:
${aiAnalysis.structuralIssues.map((issue: any, i: number) => 
  `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.issue}
   - Recommendation: ${issue.recommendation}`
).join('\n')}
` : ''}

${aiAnalysis.missingConnections?.length > 0 ? `
### Missing Connections:
${aiAnalysis.missingConnections.map((conn: any, i: number) =>
  `${i + 1}. ${conn.from} → ${conn.to} (${conn.priority} priority)
   - Reason: ${conn.reason}`
).join('\n')}
` : ''}

${aiAnalysis.criticalRisks?.length > 0 ? `
### Critical Risks:
${aiAnalysis.criticalRisks.map((risk: string, i: number) => `${i + 1}. ${risk}`).join('\n')}
` : ''}
` : ''}

## What I Need From You

Please analyze this dashboard and provide:

1. **Formula Validation**
   - Are all calculations correct for MSO financial modeling?
   - Are there any mathematical errors?
   - Do formulas align with industry standards?

2. **Value Realism Check**
   - Are input values realistic for an MSO?
   - Are growth rates sustainable?
   - Are profit margins achievable?
   - Are costs properly estimated?

3. **Structural Analysis**
   - Is the model architecture sound?
   - Are there missing calculations or connections?
   - Are dependencies properly modeled?

4. **Risk Assessment**
   - What are the biggest risks in this model?
   - What assumptions are most likely to be wrong?
   - What could cause the model to fail?

5. **Recommendations**
   - What should be fixed immediately?
   - What improvements would add the most value?
   - Are there industry best practices we're missing?

6. **Code Fixes** (if needed)
   - If you find calculation errors, provide corrected TypeScript code
   - If formulas are wrong, show the correct implementation

## Additional Context

This dashboard is used by physicians to model their MSO launch. Accuracy is critical for:
- Capital raising decisions
- Physician recruitment
- Operational planning
- Risk assessment

Please be thorough and specific in your analysis. Cite industry benchmarks where applicable.

---

**End of Debug Prompt**
`;
}

function countChangedInputs(inputs: DashboardInputs): number {
  // This would compare against defaults - simplified for now
  // In reality, you'd import defaultInputs and compare
  return Math.floor(Object.keys(inputs).length * 0.8); // Placeholder
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadAsFile(text: string, filename: string = 'debug-prompt.md'): void {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

