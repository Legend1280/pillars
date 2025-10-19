/**
 * Calculation Code Extractor for AI Analysis
 * 
 * Extracts key calculation functions and formulas from calculations.ts
 * for Dr. Chen's Business Analyst audit
 */

import { DashboardInputs } from './data';

export interface CalculationCodeSnippet {
  functionName: string;
  purpose: string;
  code: string;
  relatedNodes: string[];
}

/**
 * Extract calculation code snippets for AI analysis
 * This provides Dr. Chen with the actual implementation to audit
 */
export function extractCalculationCode(): CalculationCodeSnippet[] {
  return [
    {
      functionName: 'calculateMonthlySalaries',
      purpose: 'Calculate total monthly salary costs based on hiring schedule',
      relatedNodes: ['founderChiefStrategistSalary', 'directorOperationsSalary', 'gmHourlyRate', 'fractionalCfoCost', 'np1Salary', 'np2Salary', 'adminSupportRatio', 'avgAdminSalary'],
      code: `function calculateMonthlySalaries(inputs: DashboardInputs, month: number): number {
  let total = 0;

  // Founder - always active from Month 1
  if (month >= 1) {
    total += inputs.founderChiefStrategistSalary / 12;
  }

  // Director of Operations
  if (isActive(inputs.directorOpsStartMonth, month)) {
    total += inputs.directorOperationsSalary / 12;
  }

  // General Manager (hourly)
  if (isActive(inputs.gmStartMonth, month)) {
    total += inputs.gmHourlyRate * inputs.gmWeeklyHours * 4.33; // 4.33 weeks/month
  }

  // Fractional CFO
  if (isActive(inputs.fractionalCfoStartMonth, month)) {
    total += inputs.fractionalCfoCost;
  }

  // Event Planner
  if (isActive(inputs.eventPlannerStartMonth, month)) {
    total += inputs.eventSalespersonCost;
  }

  // NP #1
  if (isActive(inputs.np1StartMonth, month)) {
    total += inputs.np1Salary / 12;
  }

  // NP #2
  if (isActive(inputs.np2StartMonth, month)) {
    total += inputs.np2Salary / 12;
  }

  // Admin/Support Staff (starts Month 1)
  // Number of staff = totalPhysicians * adminSupportRatio
  if (month >= 1) {
    const totalPhysicians = (inputs.foundingToggle ? 1 : 0) + (inputs.additionalPhysicians || 0);
    const adminStaff = totalPhysicians * (inputs.adminSupportRatio || 0);
    total += (adminStaff * (inputs.avgAdminSalary || 0)) / 12;
  }

  return total;
}`
    },
    {
      functionName: 'calculateEquipmentLease',
      purpose: 'Calculate monthly equipment lease costs based on diagnostic service activation',
      relatedNodes: ['ctStartMonth', 'ctLeaseCost', 'echoStartMonth', 'echoLeaseCost', 'labsStartMonth', 'labsLeaseCost'],
      code: `function calculateEquipmentLease(inputs: DashboardInputs, month: number): number {
  let total = 0;

  if (isActive(inputs.ctStartMonth, month)) {
    total += inputs.ctLeaseCost;
  }

  if (isActive(inputs.echoStartMonth, month)) {
    total += inputs.echoLeaseCost;
  }

  if (isActive(inputs.labsStartMonth, month)) {
    total += inputs.labsLeaseCost;
  }

  return total;
}`
    },
    {
      functionName: 'calculatePrimaryRevenue',
      purpose: 'Calculate primary care revenue from active members',
      relatedNodes: ['primaryMembers', 'primaryCareRevenuePerMember', 'primaryRevenue'],
      code: `function calculatePrimaryRevenue(primaryMembers: number, revenuePerMember: number): number {
  return primaryMembers * revenuePerMember;
}`
    },
    {
      functionName: 'calculateSpecialtyRevenue',
      purpose: 'Calculate specialty care revenue from active members',
      relatedNodes: ['specialtyMembers', 'specialtyCareRevenuePerMember', 'specialtyRevenue'],
      code: `function calculateSpecialtyRevenue(specialtyMembers: number, revenuePerMember: number): number {
  return specialtyMembers * revenuePerMember;
}`
    },
    {
      functionName: 'calculateCorporateRevenue',
      purpose: 'Calculate corporate wellness revenue',
      relatedNodes: ['corporateWellnessStartMonth', 'corporateWellnessRevenue', 'corporateRevenue'],
      code: `function calculateCorporateRevenue(inputs: DashboardInputs, month: number): number {
  if (isActive(inputs.corporateWellnessStartMonth, month)) {
    return inputs.corporateWellnessRevenue;
  }
  return 0;
}`
    },
    {
      functionName: 'calculateEchoRevenue',
      purpose: 'Calculate echocardiogram diagnostic revenue',
      relatedNodes: ['echoStartMonth', 'echoVolume', 'echoRevenuePerTest', 'echoRevenue'],
      code: `function calculateEchoRevenue(inputs: DashboardInputs, month: number): number {
  if (isActive(inputs.echoStartMonth, month)) {
    // NOTE: echoVolume is not defined in inputs - this is a potential bug
    const volume = inputs.echoVolume || 0;
    return volume * inputs.echoRevenuePerTest;
  }
  return 0;
}`
    },
    {
      functionName: 'calculateCTRevenue',
      purpose: 'Calculate CT scan diagnostic revenue',
      relatedNodes: ['ctStartMonth', 'ctVolume', 'ctRevenuePerTest', 'ctRevenue'],
      code: `function calculateCTRevenue(inputs: DashboardInputs, month: number): number {
  if (isActive(inputs.ctStartMonth, month)) {
    // NOTE: ctVolume is not defined in inputs - this is a potential bug
    const volume = inputs.ctVolume || 0;
    return volume * inputs.ctRevenuePerTest;
  }
  return 0;
}`
    },
    {
      functionName: 'calculateLabsRevenue',
      purpose: 'Calculate laboratory testing revenue',
      relatedNodes: ['labsStartMonth', 'labsVolume', 'labsRevenuePerTest', 'labsRevenue'],
      code: `function calculateLabsRevenue(inputs: DashboardInputs, month: number): number {
  if (isActive(inputs.labsStartMonth, month)) {
    // NOTE: labsVolume is not defined in inputs - this is a potential bug
    const volume = inputs.labsVolume || 0;
    return volume * inputs.labsRevenuePerTest;
  }
  return 0;
}`
    },
    {
      functionName: 'calculateMemberGrowth',
      purpose: 'Calculate member growth during ramp period',
      relatedNodes: ['primaryMembers', 'specialtyMembers', 'rampMonths', 'primaryMemberTarget', 'specialtyMemberTarget', 'primaryChurnRate'],
      code: `// During ramp period (months 1-6)
function calculateRampMemberGrowth(inputs: DashboardInputs, month: number) {
  const rampMonths = inputs.rampMonths || 6;
  
  if (month <= 0) {
    return { primaryActive: 0, specialtyActive: 0, primaryNew: 0, specialtyNew: 0, primaryChurned: 0 };
  }
  
  if (month <= rampMonths) {
    // Linear growth during ramp
    const primaryTarget = inputs.primaryMemberTarget || 0;
    const specialtyTarget = inputs.specialtyMemberTarget || 0;
    
    const primaryNew = Math.round(primaryTarget / rampMonths);
    const specialtyNew = Math.round(specialtyTarget / rampMonths);
    
    // Calculate churn
    const previousPrimaryActive = primaryNew * (month - 1);
    const primaryChurned = Math.round(previousPrimaryActive * (inputs.primaryChurnRate || 0) / 100);
    
    const primaryActive = (primaryNew * month) - (primaryChurned * month);
    const specialtyActive = specialtyNew * month;
    
    return { primaryActive, specialtyActive, primaryNew, specialtyNew, primaryChurned };
  }
  
  // Post-ramp growth handled separately
  return { primaryActive: 0, specialtyActive: 0, primaryNew: 0, specialtyNew: 0, primaryChurned: 0 };
}`
    },
    {
      functionName: 'calculateMonthlyGrowth',
      purpose: 'Calculate member growth during 12-month projection period',
      relatedNodes: ['primaryGrowthRate', 'specialtyGrowthRate', 'primaryChurnRate', 'primaryMembers', 'specialtyMembers'],
      code: `// During projection period (months 7-18)
function calculateMonthlyGrowth(
  currentPrimary: number,
  currentSpecialty: number,
  primaryGrowthRate: number,
  specialtyGrowthRate: number,
  primaryChurnRate: number
) {
  // New members based on growth rate
  const primaryNew = Math.round(currentPrimary * (primaryGrowthRate / 100));
  const specialtyNew = Math.round(currentSpecialty * (specialtyGrowthRate / 100));
  
  // Churn only applies to primary members
  const primaryChurned = Math.round(currentPrimary * (primaryChurnRate / 100));
  
  // Net active members
  const primaryActive = currentPrimary + primaryNew - primaryChurned;
  const specialtyActive = currentSpecialty + specialtyNew;
  
  return { primaryActive, specialtyActive, primaryNew, specialtyNew, primaryChurned };
}`
    },
    {
      functionName: 'calculateVariableCosts',
      purpose: 'Calculate variable costs based on revenue',
      relatedNodes: ['variableCostPercentage', 'totalRevenue', 'variableCosts'],
      code: `function calculateVariableCosts(totalRevenue: number, variableCostPercentage: number): number {
  return totalRevenue * (variableCostPercentage / 100);
}`
    },
    {
      functionName: 'calculateDiagnosticsCOGS',
      purpose: 'Calculate cost of goods sold for diagnostics based on margin',
      relatedNodes: ['echoRevenue', 'ctRevenue', 'labsRevenue', 'diagnosticsMargin', 'diagnosticsCosts'],
      code: `function calculateDiagnosticsCOGS(
  echoRevenue: number,
  ctRevenue: number,
  labsRevenue: number,
  diagnosticsMargin: number
): number {
  const totalDiagnosticsRevenue = echoRevenue + ctRevenue + labsRevenue;
  // COGS = Revenue * (1 - Margin)
  return totalDiagnosticsRevenue * (1 - diagnosticsMargin / 100);
}`
    },
    {
      functionName: 'calculatePhysicianROI',
      purpose: 'Calculate return on investment for founding physician',
      relatedNodes: ['seedCapital', 'totalProfit12Mo', 'msoFee', 'equityShare', 'physicianROI'],
      code: `function calculatePhysicianROI(
  seedCapital: number,
  totalProfit12Mo: number,
  msoFee: number,
  equityShare: number
): number {
  // MSO profit share
  const msoProfit = totalProfit12Mo * (msoFee / 100);
  
  // Physician equity value
  const equityValue = msoProfit * (equityShare / 100);
  
  // ROI = (Equity Value - Investment) / Investment * 100
  const roi = ((equityValue - seedCapital) / seedCapital) * 100;
  
  return roi;
}`
    },
    {
      functionName: 'calculateBreakevenMonth',
      purpose: 'Find the first month where cumulative cash flow becomes positive',
      relatedNodes: ['cumulativeCash', 'breakevenMonth'],
      code: `function calculateBreakevenMonth(monthlyFinancials: MonthlyFinancials[]): number | null {
  for (let i = 0; i < monthlyFinancials.length; i++) {
    if (monthlyFinancials[i].cumulativeCash >= 0) {
      return monthlyFinancials[i].month;
    }
  }
  return null; // Never breaks even in the projection period
}`
    }
  ];
}

/**
 * Get a summary of calculation code for AI analysis
 */
export function getCalculationCodeSummary(): string {
  const snippets = extractCalculationCode();
  
  return snippets.map(snippet => {
    return `
### ${snippet.functionName}
**Purpose:** ${snippet.purpose}
**Related Nodes:** ${snippet.relatedNodes.join(', ')}

\`\`\`typescript
${snippet.code}
\`\`\`
`;
  }).join('\n\n---\n');
}

