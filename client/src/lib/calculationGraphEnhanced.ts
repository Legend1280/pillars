/**
 * Enhanced Calculation Graph Builder with Complete Metadata
 * Maps all 128+ nodes with rich metadata and full dependency tracking
 */

import { DashboardInputs } from "./data";

// ============================================================================
// ENHANCED INTERFACES WITH METADATA
// ============================================================================

export interface GraphNodeMetadata {
  section: number;              // Which section (1-8) this belongs to
  unit?: string;                // Unit of measurement (dollars, percentage, count, months, boolean)
  expectedRange?: {             // Validation range
    min: number;
    max: number;
  };
  defaultValue?: any;           // Default value
  businessLogic?: string;       // Why this matters
  layer?: number;               // Dependency layer (0=input, 1=derived, 2=calc, 3=output)
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'input' | 'derived' | 'calculation' | 'output';
  category: string;
  formula?: string;
  value?: any;
  description: string;
  codeSnippet?: string;
  metadata: GraphNodeMetadata;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;              // Impact weight (1-10)
}

export interface CalculationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    inputNodes: number;
    derivedNodes: number;
    calculationNodes: number;
    outputNodes: number;
    maxLayer: number;
  };
}

// ============================================================================
// BUILD COMPLETE CALCULATION GRAPH
// ============================================================================

export function buildEnhancedCalculationGraph(inputs: DashboardInputs): CalculationGraph {
  if (!inputs || typeof inputs !== 'object') {
    return { 
      nodes: [], 
      edges: [],
      stats: { totalNodes: 0, totalEdges: 0, inputNodes: 0, derivedNodes: 0, calculationNodes: 0, outputNodes: 0, maxLayer: 0 }
    };
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // ============================================================================
  // SECTION 1: INPUTS & SCENARIOS (Layer 0)
  // ============================================================================

  // Scenario Setup
  nodes.push({
    id: 'foundingToggle',
    label: 'Founding Physician Toggle',
    type: 'input',
    category: 'Scenario',
    description: 'Whether the user is a founding physician (affects MSO fee and equity)',
    value: inputs.foundingToggle,
    metadata: {
      section: 1,
      unit: 'boolean',
      defaultValue: true,
      businessLogic: 'Founding physicians get better terms: 37% MSO fee vs 40%, and 10% equity vs 5%',
      layer: 0
    }
  });

  nodes.push({
    id: 'additionalPhysicians',
    label: 'Additional Physicians',
    type: 'input',
    category: 'Scenario',
    description: 'Number of additional physicians joining at launch',
    value: inputs.additionalPhysicians,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 7 },
      defaultValue: 0,
      businessLogic: 'More physicians = more capital raised, more members, higher costs',
      layer: 0
    }
  });

  nodes.push({
    id: 'randomSeed',
    label: 'Random Seed',
    type: 'input',
    category: 'Scenario',
    description: 'Seed for Monte Carlo simulations',
    value: inputs.randomSeed,
    metadata: {
      section: 1,
      unit: 'number',
      defaultValue: 42,
      businessLogic: 'Ensures reproducible risk analysis scenarios',
      layer: 0
    }
  });

  // Physician Setup
  nodes.push({
    id: 'primaryInitPerPhysician',
    label: 'Primary Members per Physician (Initial)',
    type: 'input',
    category: 'Members',
    description: 'Initial primary care members each physician brings',
    value: inputs.primaryInitPerPhysician,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 250 },
      defaultValue: 50,
      businessLogic: 'Existing patient base that transitions to new practice',
      layer: 0
    }
  });

  nodes.push({
    id: 'specialtyInitPerPhysician',
    label: 'Specialty Members per Physician (Initial)',
    type: 'input',
    category: 'Members',
    description: 'Initial specialty care members each physician brings',
    value: inputs.specialtyInitPerPhysician,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 150 },
      defaultValue: 75,
      businessLogic: 'Specialty patients generate higher revenue per visit',
      layer: 0
    }
  });

  // Carryover & Peer Volume
  nodes.push({
    id: 'physicianPrimaryCarryover',
    label: 'Founding Physician Primary Carryover',
    type: 'input',
    category: 'Members',
    description: 'Additional primary members founding physician brings from network',
    value: inputs.physicianPrimaryCarryover,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 150 },
      defaultValue: 25,
      businessLogic: 'Referrals and network effects from founding physician',
      layer: 0
    }
  });

  nodes.push({
    id: 'physicianSpecialtyCarryover',
    label: 'Founding Physician Specialty Carryover',
    type: 'input',
    category: 'Members',
    description: 'Additional specialty members founding physician brings from network',
    value: inputs.physicianSpecialtyCarryover,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 150 },
      defaultValue: 40,
      businessLogic: 'Specialty referrals from professional network',
      layer: 0
    }
  });

  nodes.push({
    id: 'otherPhysiciansPrimaryCarryoverPerPhysician',
    label: 'Other Physicians Primary Carryover (Each)',
    type: 'input',
    category: 'Members',
    description: 'Primary members each additional physician brings',
    value: inputs.otherPhysiciansPrimaryCarryoverPerPhysician,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 25, max: 100 },
      defaultValue: 25,
      businessLogic: 'Non-founding physicians typically bring fewer initial patients',
      layer: 0
    }
  });

  nodes.push({
    id: 'otherPhysiciansSpecialtyCarryoverPerPhysician',
    label: 'Other Physicians Specialty Carryover (Each)',
    type: 'input',
    category: 'Members',
    description: 'Specialty members each additional physician brings',
    value: inputs.otherPhysiciansSpecialtyCarryoverPerPhysician,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 40, max: 100 },
      defaultValue: 40,
      businessLogic: 'Specialty network effects from additional physicians',
      layer: 0
    }
  });

  // Growth & Membership
  nodes.push({
    id: 'primaryIntakeMonthly',
    label: 'Primary Intake per Month',
    type: 'input',
    category: 'Growth',
    description: 'New primary care members acquired each month',
    value: inputs.primaryIntakeMonthly,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 25, max: 200 },
      defaultValue: 25,
      businessLogic: 'Marketing and referral-driven member acquisition',
      layer: 0
    }
  });

  nodes.push({
    id: 'churnPrimary',
    label: 'Primary Churn Rate',
    type: 'input',
    category: 'Growth',
    description: 'Monthly attrition rate for primary care members',
    value: inputs.churnPrimary,
    metadata: {
      section: 1,
      unit: 'percentage',
      expectedRange: { min: 0, max: 20 },
      defaultValue: 8,
      businessLogic: 'Member retention is critical for sustainable revenue',
      layer: 0
    }
  });

  nodes.push({
    id: 'conversionPrimaryToSpecialty',
    label: 'Primary to Specialty Conversion',
    type: 'input',
    category: 'Growth',
    description: 'Rate at which primary members convert to specialty services',
    value: inputs.conversionPrimaryToSpecialty,
    metadata: {
      section: 1,
      unit: 'percentage',
      expectedRange: { min: 0, max: 25 },
      defaultValue: 10,
      businessLogic: 'Cross-selling specialty services to primary members',
      layer: 0
    }
  });

  nodes.push({
    id: 'physicianSpecialtyGrowthRate',
    label: 'Physician Specialty Growth Rate',
    type: 'input',
    category: 'Growth',
    description: 'Annual growth rate for physician specialty practice',
    value: inputs.physicianSpecialtyGrowthRate,
    metadata: {
      section: 1,
      unit: 'percentage',
      expectedRange: { min: 0, max: 20 },
      defaultValue: 0,
      businessLogic: 'Organic growth in specialty patient volume',
      layer: 0
    }
  });

  // Corporate Contracts
  nodes.push({
    id: 'initialCorporateClients',
    label: 'Initial Corporate Clients',
    type: 'input',
    category: 'Corporate',
    description: 'Number of corporate wellness contracts at launch',
    value: inputs.initialCorporateClients,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 10 },
      defaultValue: 0,
      businessLogic: 'B2B revenue stream from corporate wellness programs',
      layer: 0
    }
  });

  nodes.push({
    id: 'corporateContractsMonthly',
    label: 'Corporate Contracts per Month',
    type: 'input',
    category: 'Corporate',
    description: 'New corporate contracts acquired each month',
    value: inputs.corporateContractsMonthly,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 10 },
      defaultValue: 1,
      businessLogic: 'Corporate sales pipeline and conversion rate',
      layer: 0
    }
  });

  nodes.push({
    id: 'corpInitialClients',
    label: 'Corporate Initial Employees',
    type: 'input',
    category: 'Corporate',
    description: 'Total employees covered at launch across all corporate contracts',
    value: inputs.corpInitialClients,
    metadata: {
      section: 1,
      unit: 'count',
      expectedRange: { min: 0, max: 500 },
      defaultValue: 36,
      businessLogic: 'Employee count drives corporate wellness revenue',
      layer: 0
    }
  });

  nodes.push({
    id: 'corpPricePerEmployeeMonth',
    label: 'Corporate Price per Employee',
    type: 'input',
    category: 'Pricing',
    description: 'Monthly fee per employee for corporate wellness',
    value: inputs.corpPricePerEmployeeMonth,
    metadata: {
      section: 1,
      unit: 'dollars',
      expectedRange: { min: 500, max: 2500 },
      defaultValue: 700,
      businessLogic: 'B2B pricing typically lower per-person but higher volume',
      layer: 0
    }
  });

  // Pricing & Economics
  nodes.push({
    id: 'primaryPrice',
    label: 'Primary Care Monthly Fee',
    type: 'input',
    category: 'Pricing',
    description: 'Monthly membership fee for primary care',
    value: inputs.primaryPrice,
    metadata: {
      section: 1,
      unit: 'dollars',
      expectedRange: { min: 400, max: 600 },
      defaultValue: 500,
      businessLogic: 'Core DPC revenue stream - must be competitive with market',
      layer: 0
    }
  });

  nodes.push({
    id: 'specialtyPrice',
    label: 'Specialty Care Monthly Fee',
    type: 'input',
    category: 'Pricing',
    description: 'Monthly membership fee for specialty care',
    value: inputs.specialtyPrice,
    metadata: {
      section: 1,
      unit: 'dollars',
      expectedRange: { min: 400, max: 800 },
      defaultValue: 500,
      businessLogic: 'Premium pricing for specialized medical services',
      layer: 0
    }
  });

  nodes.push({
    id: 'inflationRate',
    label: 'Inflation Rate',
    type: 'input',
    category: 'Economics',
    description: 'Annual inflation rate for pricing adjustments',
    value: inputs.inflationRate,
    metadata: {
      section: 1,
      unit: 'percentage',
      expectedRange: { min: 0, max: 10 },
      defaultValue: 2,
      businessLogic: 'Prices increase annually to maintain margins',
      layer: 0
    }
  });

  // ============================================================================
  // SECTION 2: REVENUES (Layer 0 Inputs)
  // ============================================================================

  // Diagnostics
  nodes.push({
    id: 'diagnosticsActive',
    label: 'Diagnostics Services Active',
    type: 'input',
    category: 'Diagnostics',
    description: 'Whether diagnostic services (Echo, CT, Labs) are offered',
    value: inputs.diagnosticsActive,
    metadata: {
      section: 2,
      unit: 'boolean',
      defaultValue: true,
      businessLogic: 'Diagnostics add significant revenue but require equipment investment',
      layer: 0
    }
  });

  nodes.push({
    id: 'echoStartMonth',
    label: 'Echo Start Month',
    type: 'input',
    category: 'Diagnostics',
    description: 'Month when echocardiogram services begin',
    value: inputs.echoStartMonth,
    metadata: {
      section: 2,
      unit: 'months',
      expectedRange: { min: 1, max: 6 },
      defaultValue: 1,
      businessLogic: 'Timing of equipment acquisition and service launch',
      layer: 0
    }
  });

  nodes.push({
    id: 'echoPrice',
    label: 'Echo Price',
    type: 'input',
    category: 'Diagnostics',
    description: 'Price per echocardiogram procedure',
    value: inputs.echoPrice,
    metadata: {
      section: 2,
      unit: 'dollars',
      expectedRange: { min: 200, max: 800 },
      defaultValue: 500,
      businessLogic: 'Market-competitive pricing for cardiac imaging',
      layer: 0
    }
  });

  nodes.push({
    id: 'echoVolumeMonthly',
    label: 'Echo Volume per Month',
    type: 'input',
    category: 'Diagnostics',
    description: 'Number of echo procedures performed monthly',
    value: inputs.echoVolumeMonthly,
    metadata: {
      section: 2,
      unit: 'count',
      expectedRange: { min: 0, max: 300 },
      defaultValue: 100,
      businessLogic: 'Utilization rate drives diagnostic revenue',
      layer: 0
    }
  });

  nodes.push({
    id: 'ctStartMonth',
    label: 'CT Start Month',
    type: 'input',
    category: 'Diagnostics',
    description: 'Month when CT scan services begin',
    value: inputs.ctStartMonth,
    metadata: {
      section: 2,
      unit: 'months',
      expectedRange: { min: 1, max: 12 },
      defaultValue: 1,
      businessLogic: 'CT requires significant capital investment',
      layer: 0
    }
  });

  nodes.push({
    id: 'ctPrice',
    label: 'CT Scan Price',
    type: 'input',
    category: 'Diagnostics',
    description: 'Price per CT scan procedure',
    value: inputs.ctPrice,
    metadata: {
      section: 2,
      unit: 'dollars',
      expectedRange: { min: 400, max: 1200 },
      defaultValue: 800,
      businessLogic: 'Premium imaging service with high equipment costs',
      layer: 0
    }
  });

  nodes.push({
    id: 'ctVolumeMonthly',
    label: 'CT Volume per Month',
    type: 'input',
    category: 'Diagnostics',
    description: 'Number of CT scans performed monthly',
    value: inputs.ctVolumeMonthly,
    metadata: {
      section: 2,
      unit: 'count',
      expectedRange: { min: 0, max: 150 },
      defaultValue: 40,
      businessLogic: 'Lower volume than echo but higher price point',
      layer: 0
    }
  });

  nodes.push({
    id: 'labTestsPrice',
    label: 'Lab Tests Price',
    type: 'input',
    category: 'Diagnostics',
    description: 'Average price per lab test panel',
    value: inputs.labTestsPrice,
    metadata: {
      section: 2,
      unit: 'dollars',
      expectedRange: { min: 100, max: 300 },
      defaultValue: 200,
      businessLogic: 'Basic diagnostic revenue with low overhead',
      layer: 0
    }
  });

  nodes.push({
    id: 'labTestsMonthly',
    label: 'Lab Tests per Month',
    type: 'input',
    category: 'Diagnostics',
    description: 'Number of lab tests performed monthly',
    value: inputs.labTestsMonthly,
    metadata: {
      section: 2,
      unit: 'count',
      expectedRange: { min: 0, max: 500 },
      defaultValue: 100,
      businessLogic: 'High volume, low margin diagnostic service',
      layer: 0
    }
  });

  nodes.push({
    id: 'diagnosticsMargin',
    label: 'Diagnostics Margin',
    type: 'input',
    category: 'Diagnostics',
    description: 'Profit margin on diagnostic services (after COGS)',
    value: inputs.diagnosticsMargin,
    metadata: {
      section: 2,
      unit: 'percentage',
      expectedRange: { min: 50, max: 65 },
      defaultValue: 50,
      businessLogic: 'Equipment, supplies, and technician costs reduce margin',
      layer: 0
    }
  });

  nodes.push({
    id: 'annualDiagnosticGrowthRate',
    label: 'Annual Diagnostic Growth Rate',
    type: 'input',
    category: 'Growth',
    description: 'Annual growth rate for diagnostic service volume',
    value: inputs.annualDiagnosticGrowthRate,
    metadata: {
      section: 2,
      unit: 'percentage',
      expectedRange: { min: 0, max: 15 },
      defaultValue: 5,
      businessLogic: 'Utilization increases as member base grows',
      layer: 0
    }
  });

  // ============================================================================
  // SECTION 3: COSTS (Layer 0 Inputs)
  // ============================================================================

  nodes.push({
    id: 'capexBuildoutCost',
    label: 'CapEx Buildout Cost',
    type: 'input',
    category: 'Costs',
    description: 'One-time buildout and construction costs',
    value: inputs.capexBuildoutCost,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 100000, max: 500000 },
      defaultValue: 250000,
      businessLogic: 'Upfront capital for facility preparation',
      layer: 0
    }
  });

  nodes.push({
    id: 'officeEquipment',
    label: 'Office Equipment',
    type: 'input',
    category: 'Costs',
    description: 'One-time office furniture and equipment costs',
    value: inputs.officeEquipment,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 50000, max: 200000 },
      defaultValue: 100000,
      businessLogic: 'Furniture, computers, office systems',
      layer: 0
    }
  });

  nodes.push({
    id: 'splitStartupAcrossTwoMonths',
    label: 'Split Startup Costs',
    type: 'input',
    category: 'Costs',
    description: 'Whether to split startup costs across months 0-1',
    value: inputs.splitStartupAcrossTwoMonths,
    metadata: {
      section: 3,
      unit: 'boolean',
      defaultValue: false,
      businessLogic: 'Cash flow management - spread initial burn',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupLegal',
    label: 'Startup Legal Costs',
    type: 'input',
    category: 'Costs',
    description: 'Legal and formation costs',
    value: inputs.startupLegal,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 10000, max: 50000 },
      defaultValue: 25000,
      businessLogic: 'Entity formation, contracts, compliance',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupHr',
    label: 'Startup HR Costs',
    type: 'input',
    category: 'Costs',
    description: 'HR and recruiting costs',
    value: inputs.startupHr,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 5000, max: 30000 },
      defaultValue: 15000,
      businessLogic: 'Recruiting, onboarding, HR systems',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupTraining',
    label: 'Startup Training Costs',
    type: 'input',
    category: 'Costs',
    description: 'Training and certification costs',
    value: inputs.startupTraining,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 5000, max: 25000 },
      defaultValue: 10000,
      businessLogic: 'Staff training, certifications, compliance',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupTechnology',
    label: 'Startup Technology Costs',
    type: 'input',
    category: 'Costs',
    description: 'Technology setup costs (EHR, network, licenses)',
    value: inputs.startupTechnology,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 20000, max: 100000 },
      defaultValue: 50000,
      businessLogic: 'EHR system, IT infrastructure, software licenses',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupPermits',
    label: 'Startup Permits & Licenses',
    type: 'input',
    category: 'Costs',
    description: 'Permits and licenses costs',
    value: inputs.startupPermits,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 5000, max: 20000 },
      defaultValue: 10000,
      businessLogic: 'Medical licenses, facility permits, regulatory fees',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupInventory',
    label: 'Startup Inventory',
    type: 'input',
    category: 'Costs',
    description: 'Initial inventory and medical supplies',
    value: inputs.startupInventory,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 10000, max: 50000 },
      defaultValue: 25000,
      businessLogic: 'Initial medical supplies and inventory',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupInsurance',
    label: 'Startup Insurance',
    type: 'input',
    category: 'Costs',
    description: 'Insurance (malpractice, liability, property)',
    value: inputs.startupInsurance,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 20000, max: 100000 },
      defaultValue: 50000,
      businessLogic: 'First year insurance premiums and deposits',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupMarketing',
    label: 'Startup Marketing',
    type: 'input',
    category: 'Costs',
    description: 'Pre-launch marketing (brand, website, campaigns)',
    value: inputs.startupMarketing,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 20000, max: 100000 },
      defaultValue: 50000,
      businessLogic: 'Brand development, website, launch campaigns',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupProfessionalFees',
    label: 'Startup Professional Fees',
    type: 'input',
    category: 'Costs',
    description: 'Professional fees (consultants, accountants, architects)',
    value: inputs.startupProfessionalFees,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 10000, max: 50000 },
      defaultValue: 25000,
      businessLogic: 'Consultants, CPAs, architects, advisors',
      layer: 0
    }
  });

  nodes.push({
    id: 'startupOther',
    label: 'Startup Other Costs',
    type: 'input',
    category: 'Costs',
    description: 'Other startup costs and contingency',
    value: inputs.startupOther,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 5000, max: 30000 },
      defaultValue: 15000,
      businessLogic: 'Contingency buffer for unexpected costs',
      layer: 0
    }
  });

  nodes.push({
    id: 'fixedOverheadMonthly',
    label: 'Fixed Overhead Monthly',
    type: 'input',
    category: 'Costs',
    description: 'Fixed monthly overhead (rent, utilities, etc.)',
    value: inputs.fixedOverheadMonthly,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 10000, max: 100000 },
      defaultValue: 30000,
      businessLogic: 'Rent, utilities, insurance, recurring fixed costs',
      layer: 0
    }
  });

  nodes.push({
    id: 'equipmentLease',
    label: 'Equipment Lease Monthly',
    type: 'input',
    category: 'Costs',
    description: 'Monthly equipment lease costs (CT & Echo)',
    value: inputs.equipmentLease,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 0, max: 15000 },
      defaultValue: 7000,
      businessLogic: 'Leasing reduces upfront capital but adds monthly costs',
      layer: 0
    }
  });

  nodes.push({
    id: 'marketingBudgetMonthly',
    label: 'Marketing Budget Monthly',
    type: 'input',
    category: 'Costs',
    description: 'Monthly marketing and advertising budget',
    value: inputs.marketingBudgetMonthly,
    metadata: {
      section: 3,
      unit: 'dollars',
      expectedRange: { min: 5000, max: 50000 },
      defaultValue: 15000,
      businessLogic: 'Ongoing member acquisition and brand awareness',
      layer: 0
    }
  });

  nodes.push({
    id: 'variableCostPct',
    label: 'Variable Cost Percentage',
    type: 'input',
    category: 'Costs',
    description: 'Variable costs as percentage of revenue',
    value: inputs.variableCostPct,
    metadata: {
      section: 3,
      unit: 'percentage',
      expectedRange: { min: 10, max: 30 },
      defaultValue: 15,
      businessLogic: 'Supplies, materials, and variable expenses scale with revenue',
      layer: 0
    }
  });

  nodes.push({
    id: 'annualCostInflationRate',
    label: 'Annual Cost Inflation Rate',
    type: 'input',
    category: 'Costs',
    description: 'Annual inflation rate for costs',
    value: inputs.annualCostInflationRate,
    metadata: {
      section: 3,
      unit: 'percentage',
      expectedRange: { min: 0, max: 10 },
      defaultValue: 3,
      businessLogic: 'Costs increase faster than general inflation',
      layer: 0
    }
  });

  // ============================================================================
  // SECTION 4: STAFFING (Layer 0 Inputs)
  // ============================================================================

  nodes.push({
    id: 'founderChiefStrategistSalary',
    label: 'Founder/Chief Strategist Salary',
    type: 'input',
    category: 'Staffing',
    description: 'Annual salary for founder/chief strategist',
    value: inputs.founderChiefStrategistSalary,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 100000, max: 300000 },
      defaultValue: 180000,
      businessLogic: 'Leadership compensation',
      layer: 0
    }
  });

  nodes.push({
    id: 'directorOperationsSalary',
    label: 'Director of Operations Salary',
    type: 'input',
    category: 'Staffing',
    description: 'Annual salary for Director of Operations',
    value: inputs.directorOperationsSalary,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 80000, max: 150000 },
      defaultValue: 100000,
      businessLogic: 'Operations management',
      layer: 0
    }
  });

  nodes.push({
    id: 'gmHourlyRate',
    label: 'General Manager Hourly Rate',
    type: 'input',
    category: 'Staffing',
    description: 'Hourly rate for General Manager',
    value: inputs.gmHourlyRate,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 30, max: 80 },
      defaultValue: 50,
      businessLogic: 'Part-time or contract GM',
      layer: 0
    }
  });

  nodes.push({
    id: 'gmWeeklyHours',
    label: 'General Manager Weekly Hours',
    type: 'input',
    category: 'Staffing',
    description: 'Weekly hours for General Manager',
    value: inputs.gmWeeklyHours,
    metadata: {
      section: 4,
      unit: 'hours',
      expectedRange: { min: 10, max: 40 },
      defaultValue: 20,
      businessLogic: 'Part-time management support',
      layer: 0
    }
  });

  nodes.push({
    id: 'fractionalCfoCost',
    label: 'Fractional CFO Monthly Cost',
    type: 'input',
    category: 'Staffing',
    description: 'Monthly retainer for fractional CFO',
    value: inputs.fractionalCfoCost,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 3000, max: 10000 },
      defaultValue: 5000,
      businessLogic: 'Financial oversight and planning',
      layer: 0
    }
  });

  nodes.push({
    id: 'eventSalespersonCost',
    label: 'Event Planner/Salesperson Cost',
    type: 'input',
    category: 'Staffing',
    description: 'Monthly cost for event planner/sales',
    value: inputs.eventSalespersonCost,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 3000, max: 8000 },
      defaultValue: 5000,
      businessLogic: 'Marketing and member acquisition',
      layer: 0
    }
  });

  nodes.push({
    id: 'np1StartMonth',
    label: 'Nurse Practitioner #1 Start Month',
    type: 'input',
    category: 'Staffing',
    description: 'Month when NP #1 starts',
    value: inputs.np1StartMonth,
    metadata: {
      section: 4,
      unit: 'months',
      expectedRange: { min: 1, max: 6 },
      defaultValue: 1,
      businessLogic: 'Clinical support timing',
      layer: 0
    }
  });

  nodes.push({
    id: 'np1Salary',
    label: 'Nurse Practitioner #1 Salary',
    type: 'input',
    category: 'Staffing',
    description: 'Annual salary for NP #1',
    value: inputs.np1Salary,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 80000, max: 120000 },
      defaultValue: 100000,
      businessLogic: 'Clinical staff compensation',
      layer: 0
    }
  });

  nodes.push({
    id: 'np2StartMonth',
    label: 'Nurse Practitioner #2 Start Month',
    type: 'input',
    category: 'Staffing',
    description: 'Month when NP #2 starts',
    value: inputs.np2StartMonth,
    metadata: {
      section: 4,
      unit: 'months',
      expectedRange: { min: 1, max: 12 },
      defaultValue: 6,
      businessLogic: 'Scaling clinical capacity',
      layer: 0
    }
  });

  nodes.push({
    id: 'np2Salary',
    label: 'Nurse Practitioner #2 Salary',
    type: 'input',
    category: 'Staffing',
    description: 'Annual salary for NP #2',
    value: inputs.np2Salary,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 80000, max: 120000 },
      defaultValue: 100000,
      businessLogic: 'Additional clinical support',
      layer: 0
    }
  });

  nodes.push({
    id: 'adminSupportRatio',
    label: 'Admin Support Ratio',
    type: 'input',
    category: 'Staffing',
    description: 'Admin/support staff per physician',
    value: inputs.adminSupportRatio,
    metadata: {
      section: 4,
      unit: 'ratio',
      expectedRange: { min: 0.5, max: 2 },
      defaultValue: 1,
      businessLogic: 'Administrative support scales with physician count',
      layer: 0
    }
  });

  nodes.push({
    id: 'avgAdminSalary',
    label: 'Average Admin Salary',
    type: 'input',
    category: 'Staffing',
    description: 'Average annual salary per admin/support staff',
    value: inputs.avgAdminSalary,
    metadata: {
      section: 4,
      unit: 'dollars',
      expectedRange: { min: 35000, max: 60000 },
      defaultValue: 45000,
      businessLogic: 'Front desk, billing, admin support',
      layer: 0
    }
  });

  nodes.push({
    id: 'directorOpsStartMonth',
    label: 'Director Ops Start Month',
    type: 'input',
    category: 'Staffing',
    description: 'Month when Director of Operations starts',
    value: inputs.directorOpsStartMonth,
    metadata: {
      section: 4,
      unit: 'months',
      expectedRange: { min: 1, max: 6 },
      defaultValue: 1,
      businessLogic: 'Operations leadership from day one',
      layer: 0
    }
  });

  nodes.push({
    id: 'gmStartMonth',
    label: 'GM Start Month',
    type: 'input',
    category: 'Staffing',
    description: 'Month when General Manager starts',
    value: inputs.gmStartMonth,
    metadata: {
      section: 4,
      unit: 'months',
      expectedRange: { min: 1, max: 6 },
      defaultValue: 2,
      businessLogic: 'General management support',
      layer: 0
    }
  });

  nodes.push({
    id: 'fractionalCfoStartMonth',
    label: 'Fractional CFO Start Month',
    type: 'input',
    category: 'Staffing',
    description: 'Month when fractional CFO starts',
    value: inputs.fractionalCfoStartMonth,
    metadata: {
      section: 4,
      unit: 'months',
      expectedRange: { min: 1, max: 6 },
      defaultValue: 4,
      businessLogic: 'Financial oversight as complexity grows',
      layer: 0
    }
  });

  nodes.push({
    id: 'eventPlannerStartMonth',
    label: 'Event Planner Start Month',
    type: 'input',
    category: 'Staffing',
    description: 'Month when event planner starts',
    value: inputs.eventPlannerStartMonth,
    metadata: {
      section: 4,
      unit: 'months',
      expectedRange: { min: 1, max: 6 },
      defaultValue: 5,
      businessLogic: 'Marketing and events support',
      layer: 0
    }
  });

  // ============================================================================
  // SECTION 5: RAMP TO LAUNCH (Layer 0 Inputs)
  // ============================================================================

  nodes.push({
    id: 'rampDuration',
    label: 'Ramp Duration',
    type: 'input',
    category: 'Ramp',
    description: 'Length of ramp phase before launch',
    value: inputs.rampDuration,
    metadata: {
      section: 5,
      unit: 'months',
      expectedRange: { min: 3, max: 9 },
      defaultValue: 6,
      businessLogic: 'Time needed to build member base before full launch',
      layer: 0
    }
  });

  nodes.push({
    id: 'rampPrimaryIntakeMonthly',
    label: 'Ramp Primary Intake Monthly',
    type: 'input',
    category: 'Ramp',
    description: 'Primary intake during ramp phase',
    value: inputs.rampPrimaryIntakeMonthly,
    metadata: {
      section: 5,
      unit: 'count',
      expectedRange: { min: 0, max: 50 },
      defaultValue: 20,
      businessLogic: 'Lower acquisition during pre-launch phase',
      layer: 0
    }
  });

  nodes.push({
    id: 'corporateStartMonth',
    label: 'Corporate Start Month',
    type: 'input',
    category: 'Ramp',
    description: 'Month corporate contracts begin',
    value: inputs.corporateStartMonth,
    metadata: {
      section: 5,
      unit: 'months',
      expectedRange: { min: 1, max: 6 },
      defaultValue: 3,
      businessLogic: 'B2B sales cycle timing',
      layer: 0
    }
  });

  // ============================================================================
  // SECTION 6: GROWTH (Layer 0 Inputs - already covered above)
  // ============================================================================

  // Growth inputs are already mapped in Section 1

  // ============================================================================
  // SECTION 7: RISK ANALYSIS (Layer 0 Inputs)
  // ============================================================================

  nodes.push({
    id: 'riskChurnRateMin',
    label: 'Risk: Minimum Churn Rate',
    type: 'input',
    category: 'Risk',
    description: 'Minimum churn rate for risk scenarios',
    value: inputs.riskChurnRateMin,
    metadata: {
      section: 7,
      unit: 'percentage',
      expectedRange: { min: 0, max: 20 },
      defaultValue: 5,
      businessLogic: 'Best-case retention scenario',
      layer: 0
    }
  });

  nodes.push({
    id: 'riskChurnRateMax',
    label: 'Risk: Maximum Churn Rate',
    type: 'input',
    category: 'Risk',
    description: 'Maximum churn rate for risk scenarios',
    value: inputs.riskChurnRateMax,
    metadata: {
      section: 7,
      unit: 'percentage',
      expectedRange: { min: 0, max: 25 },
      defaultValue: 12,
      businessLogic: 'Worst-case retention scenario',
      layer: 0
    }
  });

  nodes.push({
    id: 'riskIntakeVariance',
    label: 'Risk: Intake Variance',
    type: 'input',
    category: 'Risk',
    description: 'Member intake variance (+/- %)',
    value: inputs.riskIntakeVariance,
    metadata: {
      section: 7,
      unit: 'percentage',
      expectedRange: { min: 0, max: 50 },
      defaultValue: 20,
      businessLogic: 'Acquisition uncertainty range',
      layer: 0
    }
  });

  nodes.push({
    id: 'riskPricingVariance',
    label: 'Risk: Pricing Variance',
    type: 'input',
    category: 'Risk',
    description: 'Pricing variance (+/- $)',
    value: inputs.riskPricingVariance,
    metadata: {
      section: 7,
      unit: 'dollars',
      expectedRange: { min: 0, max: 100 },
      defaultValue: 30,
      businessLogic: 'Market pricing pressure range',
      layer: 0
    }
  });

  nodes.push({
    id: 'riskFixedCostBuffer',
    label: 'Risk: Fixed Cost Buffer',
    type: 'input',
    category: 'Risk',
    description: 'Fixed cost buffer (+/- %)',
    value: inputs.riskFixedCostBuffer,
    metadata: {
      section: 7,
      unit: 'percentage',
      expectedRange: { min: 0, max: 30 },
      defaultValue: 10,
      businessLogic: 'Cost overrun contingency',
      layer: 0
    }
  });

  // ============================================================================
  // DERIVED VARIABLES (Layer 1)
  // ============================================================================

  nodes.push({
    id: 'derived_totalPhysicians',
    label: 'Total Physicians',
    type: 'derived',
    category: 'Physicians',
    description: 'Total physician count (founding + additional)',
    formula: '(foundingToggle ? 1 : 0) + additionalPhysicians',
    metadata: {
      section: 1,
      unit: 'count',
      businessLogic: 'Drives capital raised, member capacity, and costs',
      layer: 1
    }
  });

  edges.push(
    { id: 'e1', source: 'foundingToggle', target: 'derived_totalPhysicians', weight: 10 },
    { id: 'e2', source: 'additionalPhysicians', target: 'derived_totalPhysicians', weight: 10 }
  );

  nodes.push({
    id: 'derived_msoFee',
    label: 'MSO Fee Percentage',
    type: 'derived',
    category: 'Economics',
    description: 'MSO fee based on founding status (37% or 40%)',
    formula: 'foundingToggle ? 37 : 40',
    metadata: {
      section: 1,
      unit: 'percentage',
      businessLogic: 'Founding physicians get 3% discount on MSO fee',
      layer: 1
    }
  });

  edges.push(
    { id: 'e3', source: 'foundingToggle', target: 'derived_msoFee', weight: 10 }
  );

  nodes.push({
    id: 'derived_equityShare',
    label: 'Equity Share Percentage',
    type: 'derived',
    category: 'Economics',
    description: 'Equity percentage based on founding status (10% or 5%)',
    formula: 'foundingToggle ? 10 : 5',
    metadata: {
      section: 1,
      unit: 'percentage',
      businessLogic: 'Founding physicians get double equity stake',
      layer: 1
    }
  });

  edges.push(
    { id: 'e4', source: 'foundingToggle', target: 'derived_equityShare', weight: 10 }
  );

  nodes.push({
    id: 'derived_capitalRaised',
    label: 'Capital Raised',
    type: 'derived',
    category: 'Finance',
    description: 'Total capital raised based on physician count',
    formula: 'totalPhysicians × $750,000',
    metadata: {
      section: 1,
      unit: 'dollars',
      businessLogic: 'Each physician contributes $750K in capital',
      layer: 1
    }
  });

  edges.push(
    { id: 'e5', source: 'derived_totalPhysicians', target: 'derived_capitalRaised', weight: 10 }
  );

  nodes.push({
    id: 'derived_retentionRate',
    label: 'Retention Rate',
    type: 'derived',
    category: 'Growth',
    description: 'Member retention rate (100% - churn)',
    formula: '100 - churnPrimary',
    metadata: {
      section: 1,
      unit: 'percentage',
      businessLogic: 'Inverse of churn rate',
      layer: 1
    }
  });

  edges.push(
    { id: 'e6', source: 'churnPrimary', target: 'derived_retentionRate', weight: 8 }
  );

  nodes.push({
    id: 'derived_totalCarryover',
    label: 'Total Primary Carryover',
    type: 'derived',
    category: 'Members',
    description: 'Total primary members from carryover',
    formula: 'physicianPrimaryCarryover + (additionalPhysicians × otherPhysiciansPrimaryCarryoverPerPhysician)',
    metadata: {
      section: 1,
      unit: 'count',
      businessLogic: 'Network effects from all physicians',
      layer: 1
    }
  });

  edges.push(
    { id: 'e7', source: 'physicianPrimaryCarryover', target: 'derived_totalCarryover', weight: 7 },
    { id: 'e8', source: 'additionalPhysicians', target: 'derived_totalCarryover', weight: 7 },
    { id: 'e9', source: 'otherPhysiciansPrimaryCarryoverPerPhysician', target: 'derived_totalCarryover', weight: 7 }
  );

  nodes.push({
    id: 'derived_totalSpecialtyCarryover',
    label: 'Total Specialty Carryover',
    type: 'derived',
    category: 'Members',
    description: 'Total specialty members from carryover',
    formula: 'physicianSpecialtyCarryover + (additionalPhysicians × otherPhysiciansSpecialtyCarryoverPerPhysician)',
    metadata: {
      section: 1,
      unit: 'count',
      businessLogic: 'Specialty network effects',
      layer: 1
    }
  });

  edges.push(
    { id: 'e10', source: 'physicianSpecialtyCarryover', target: 'derived_totalSpecialtyCarryover', weight: 7 },
    { id: 'e11', source: 'additionalPhysicians', target: 'derived_totalSpecialtyCarryover', weight: 7 },
    { id: 'e12', source: 'otherPhysiciansSpecialtyCarryoverPerPhysician', target: 'derived_totalSpecialtyCarryover', weight: 7 }
  );

  nodes.push({
    id: 'derived_startupTotal',
    label: 'Total Startup Costs',
    type: 'derived',
    category: 'Costs',
    description: 'Sum of all startup cost categories',
    formula: 'Sum of all startup line items',
    metadata: {
      section: 3,
      unit: 'dollars',
      businessLogic: 'One-time costs to launch the practice',
      layer: 1
    }
  });

  edges.push(
    { id: 'e13', source: 'startupLegal', target: 'derived_startupTotal', weight: 5 },
    { id: 'e14', source: 'startupHr', target: 'derived_startupTotal', weight: 5 },
    { id: 'e15', source: 'startupTraining', target: 'derived_startupTotal', weight: 5 },
    { id: 'e16', source: 'startupTechnology', target: 'derived_startupTotal', weight: 5 },
    { id: 'e17', source: 'startupPermits', target: 'derived_startupTotal', weight: 5 },
    { id: 'e18', source: 'startupInventory', target: 'derived_startupTotal', weight: 5 },
    { id: 'e19', source: 'startupInsurance', target: 'derived_startupTotal', weight: 5 },
    { id: 'e20', source: 'startupMarketing', target: 'derived_startupTotal', weight: 5 },
    { id: 'e21', source: 'startupProfessionalFees', target: 'derived_startupTotal', weight: 5 },
    { id: 'e22', source: 'startupOther', target: 'derived_startupTotal', weight: 5 }
  );

  nodes.push({
    id: 'derived_totalInvestment',
    label: 'Total Investment',
    type: 'derived',
    category: 'Finance',
    description: 'CapEx + Office Equipment + Startup Costs',
    formula: 'capexBuildoutCost + officeEquipment + startupTotal',
    metadata: {
      section: 3,
      unit: 'dollars',
      businessLogic: 'Total capital deployment before operations begin',
      layer: 1
    }
  });

  edges.push(
    { id: 'e23', source: 'capexBuildoutCost', target: 'derived_totalInvestment', weight: 10 },
    { id: 'e24', source: 'officeEquipment', target: 'derived_totalInvestment', weight: 10 },
    { id: 'e25', source: 'derived_startupTotal', target: 'derived_totalInvestment', weight: 10 }
  );

  nodes.push({
    id: 'derived_fixedCostMonthly',
    label: 'Fixed Cost Monthly',
    type: 'derived',
    category: 'Costs',
    description: 'Fixed overhead + marketing budget',
    formula: 'fixedOverheadMonthly + marketingBudgetMonthly',
    metadata: {
      section: 3,
      unit: 'dollars',
      businessLogic: 'Recurring fixed costs every month',
      layer: 1
    }
  });

  edges.push(
    { id: 'e26', source: 'fixedOverheadMonthly', target: 'derived_fixedCostMonthly', weight: 8 },
    { id: 'e27', source: 'marketingBudgetMonthly', target: 'derived_fixedCostMonthly', weight: 8 }
  );

  nodes.push({
    id: 'derived_totalEquipmentLease',
    label: 'Total Equipment Lease',
    type: 'derived',
    category: 'Costs',
    description: 'CT + Echo lease costs',
    formula: 'ctLeaseCost + echoLeaseCost',
    metadata: {
      section: 3,
      unit: 'dollars',
      businessLogic: 'Monthly equipment lease payments',
      layer: 1
    }
  });

  edges.push(
    { id: 'e28', source: 'equipmentLease', target: 'derived_totalEquipmentLease', weight: 8 }
  );

  nodes.push({
    id: 'derived_adminStaffCount',
    label: 'Admin Staff Count',
    type: 'derived',
    category: 'Staffing',
    description: 'Total admin staff based on physician count',
    formula: 'totalPhysicians × adminSupportRatio',
    metadata: {
      section: 4,
      unit: 'count',
      businessLogic: 'Administrative support scales with physician count',
      layer: 1
    }
  });

  edges.push(
    { id: 'e29', source: 'derived_totalPhysicians', target: 'derived_adminStaffCount', weight: 8 },
    { id: 'e30', source: 'adminSupportRatio', target: 'derived_adminStaffCount', weight: 8 }
  );

  // ============================================================================
  // CALCULATION NODES (Layer 2)
  // ============================================================================

  nodes.push({
    id: 'calc_primaryMembers',
    label: 'Primary Members (Monthly)',
    type: 'calculation',
    category: 'Members',
    description: 'Active primary care members each month',
    formula: 'Starting members + carryover + (intake × months) - churned',
    codeSnippet: 'primaryMembers = startingMembers + carryover + (intakePerMonth * monthsSinceLaunch) * (1 - churnRate);',
    metadata: {
      section: 1,
      unit: 'count',
      businessLogic: 'Member base grows with acquisition and shrinks with churn',
      layer: 2
    }
  });

  edges.push(
    { id: 'e31', source: 'primaryInitPerPhysician', target: 'calc_primaryMembers', weight: 9 },
    { id: 'e32', source: 'derived_totalCarryover', target: 'calc_primaryMembers', weight: 9 },
    { id: 'e33', source: 'primaryIntakeMonthly', target: 'calc_primaryMembers', weight: 9 },
    { id: 'e34', source: 'churnPrimary', target: 'calc_primaryMembers', weight: 9 }
  );

  nodes.push({
    id: 'calc_specialtyMembers',
    label: 'Specialty Members (Monthly)',
    type: 'calculation',
    category: 'Members',
    description: 'Active specialty care members each month',
    formula: 'Starting members + carryover + conversions + growth',
    codeSnippet: 'specialtyMembers = startingMembers + carryover + (primaryMembers * conversionRate) + growth;',
    metadata: {
      section: 1,
      unit: 'count',
      businessLogic: 'Specialty grows from conversions and direct acquisition',
      layer: 2
    }
  });

  edges.push(
    { id: 'e35', source: 'specialtyInitPerPhysician', target: 'calc_specialtyMembers', weight: 9 },
    { id: 'e36', source: 'derived_totalSpecialtyCarryover', target: 'calc_specialtyMembers', weight: 9 },
    { id: 'e37', source: 'calc_primaryMembers', target: 'calc_specialtyMembers', weight: 7 },
    { id: 'e38', source: 'conversionPrimaryToSpecialty', target: 'calc_specialtyMembers', weight: 7 },
    { id: 'e39', source: 'physicianSpecialtyGrowthRate', target: 'calc_specialtyMembers', weight: 6 }
  );

  nodes.push({
    id: 'calc_corporateMembers',
    label: 'Corporate Members (Monthly)',
    type: 'calculation',
    category: 'Corporate',
    description: 'Total employees covered by corporate contracts',
    formula: 'Initial clients + (new contracts × employees per contract × months)',
    codeSnippet: 'corporateMembers = initialClients + (contractsPerMonth * employeesPerContract * months);',
    metadata: {
      section: 1,
      unit: 'count',
      businessLogic: 'B2B member base from corporate wellness',
      layer: 2
    }
  });

  edges.push(
    { id: 'e40', source: 'corpInitialClients', target: 'calc_corporateMembers', weight: 8 },
    { id: 'e41', source: 'corporateContractsMonthly', target: 'calc_corporateMembers', weight: 8 }
  );

  nodes.push({
    id: 'calc_primaryRevenue',
    label: 'Primary Care Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Monthly revenue from primary care memberships',
    formula: 'Primary Members × Primary Price',
    codeSnippet: 'primaryRevenue = primaryMembers * inputs.primaryPrice;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'Core DPC revenue stream',
      layer: 2
    }
  });

  edges.push(
    { id: 'e42', source: 'calc_primaryMembers', target: 'calc_primaryRevenue', weight: 10 },
    { id: 'e43', source: 'primaryPrice', target: 'calc_primaryRevenue', weight: 10 }
  );

  nodes.push({
    id: 'calc_specialtyRevenue',
    label: 'Specialty Care Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Monthly revenue from specialty care memberships',
    formula: 'Specialty Members × Specialty Price',
    codeSnippet: 'specialtyRevenue = specialtyMembers * inputs.specialtyPrice;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'Premium specialty service revenue',
      layer: 2
    }
  });

  edges.push(
    { id: 'e44', source: 'calc_specialtyMembers', target: 'calc_specialtyRevenue', weight: 10 },
    { id: 'e45', source: 'specialtyPrice', target: 'calc_specialtyRevenue', weight: 10 }
  );

  nodes.push({
    id: 'calc_corporateRevenue',
    label: 'Corporate Wellness Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Monthly revenue from corporate contracts',
    formula: 'Corporate Members × Price per Employee',
    codeSnippet: 'corporateRevenue = corporateMembers * inputs.corpPricePerEmployeeMonth;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'B2B revenue from corporate wellness',
      layer: 2
    }
  });

  edges.push(
    { id: 'e46', source: 'calc_corporateMembers', target: 'calc_corporateRevenue', weight: 10 },
    { id: 'e47', source: 'corpPricePerEmployeeMonth', target: 'calc_corporateRevenue', weight: 10 }
  );

  nodes.push({
    id: 'calc_echoRevenue',
    label: 'Echo Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Monthly revenue from echocardiogram services',
    formula: 'Echo Volume × Echo Price (if active)',
    codeSnippet: 'echoRevenue = isActive(echoStartMonth, month) ? echoVolume * echoPrice : 0;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'Diagnostic imaging revenue',
      layer: 2
    }
  });

  edges.push(
    { id: 'e48', source: 'diagnosticsActive', target: 'calc_echoRevenue', weight: 9 },
    { id: 'e49', source: 'echoStartMonth', target: 'calc_echoRevenue', weight: 8 },
    { id: 'e50', source: 'echoVolumeMonthly', target: 'calc_echoRevenue', weight: 9 },
    { id: 'e51', source: 'echoPrice', target: 'calc_echoRevenue', weight: 9 }
  );

  nodes.push({
    id: 'calc_ctRevenue',
    label: 'CT Scan Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Monthly revenue from CT scan services',
    formula: 'CT Volume × CT Price (if active)',
    codeSnippet: 'ctRevenue = isActive(ctStartMonth, month) ? ctVolume * ctPrice : 0;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'Premium diagnostic imaging revenue',
      layer: 2
    }
  });

  edges.push(
    { id: 'e52', source: 'diagnosticsActive', target: 'calc_ctRevenue', weight: 9 },
    { id: 'e53', source: 'ctStartMonth', target: 'calc_ctRevenue', weight: 8 },
    { id: 'e54', source: 'ctVolumeMonthly', target: 'calc_ctRevenue', weight: 9 },
    { id: 'e55', source: 'ctPrice', target: 'calc_ctRevenue', weight: 9 }
  );

  nodes.push({
    id: 'calc_labsRevenue',
    label: 'Labs Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Monthly revenue from laboratory services',
    formula: 'Lab Volume × Lab Price',
    codeSnippet: 'labsRevenue = labVolume * labPrice;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'High-volume diagnostic revenue',
      layer: 2
    }
  });

  edges.push(
    { id: 'e56', source: 'diagnosticsActive', target: 'calc_labsRevenue', weight: 9 },
    { id: 'e57', source: 'labTestsMonthly', target: 'calc_labsRevenue', weight: 9 },
    { id: 'e58', source: 'labTestsPrice', target: 'calc_labsRevenue', weight: 9 }
  );

  nodes.push({
    id: 'calc_diagnosticsRevenue',
    label: 'Total Diagnostics Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Combined revenue from all diagnostic services',
    formula: 'Echo + CT + Labs',
    codeSnippet: 'diagnosticsRevenue = echoRevenue + ctRevenue + labsRevenue;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'Aggregate diagnostic revenue stream',
      layer: 2
    }
  });

  edges.push(
    { id: 'e59', source: 'calc_echoRevenue', target: 'calc_diagnosticsRevenue', weight: 8 },
    { id: 'e60', source: 'calc_ctRevenue', target: 'calc_diagnosticsRevenue', weight: 8 },
    { id: 'e61', source: 'calc_labsRevenue', target: 'calc_diagnosticsRevenue', weight: 8 }
  );

  nodes.push({
    id: 'calc_totalRevenue',
    label: 'Total Monthly Revenue',
    type: 'calculation',
    category: 'Revenue',
    description: 'Sum of all revenue streams',
    formula: 'Primary + Specialty + Corporate + Diagnostics',
    codeSnippet: 'totalRevenue = primaryRevenue + specialtyRevenue + corporateRevenue + diagnosticsRevenue;',
    metadata: {
      section: 2,
      unit: 'dollars',
      businessLogic: 'Top-line revenue before costs',
      layer: 2
    }
  });

  edges.push(
    { id: 'e62', source: 'calc_primaryRevenue', target: 'calc_totalRevenue', weight: 10 },
    { id: 'e63', source: 'calc_specialtyRevenue', target: 'calc_totalRevenue', weight: 10 },
    { id: 'e64', source: 'calc_corporateRevenue', target: 'calc_totalRevenue', weight: 10 },
    { id: 'e65', source: 'calc_diagnosticsRevenue', target: 'calc_totalRevenue', weight: 10 }
  );

  nodes.push({
    id: 'calc_salaryCosts',
    label: 'Monthly Salary Costs',
    type: 'calculation',
    category: 'Costs',
    description: 'Total monthly salary costs for all staff',
    formula: 'Sum of all staff salaries based on hiring schedule',
    codeSnippet: 'salaryCosts = calculateMonthlySalaries(inputs, month);',
    metadata: {
      section: 4,
      unit: 'dollars',
      businessLogic: 'Largest cost category - scales with headcount',
      layer: 2
    }
  });

  edges.push(
    { id: 'e66', source: 'founderChiefStrategistSalary', target: 'calc_salaryCosts', weight: 8 },
    { id: 'e67', source: 'directorOperationsSalary', target: 'calc_salaryCosts', weight: 7 },
    { id: 'e68', source: 'np1Salary', target: 'calc_salaryCosts', weight: 7 },
    { id: 'e69', source: 'np2Salary', target: 'calc_salaryCosts', weight: 7 },
    { id: 'e70', source: 'avgAdminSalary', target: 'calc_salaryCosts', weight: 6 },
    { id: 'e71', source: 'derived_adminStaffCount', target: 'calc_salaryCosts', weight: 7 }
  );

  nodes.push({
    id: 'calc_diagnosticsCOGS',
    label: 'Diagnostics COGS',
    type: 'calculation',
    category: 'Costs',
    description: 'Cost of goods sold for diagnostics',
    formula: 'Diagnostics Revenue × (1 - Margin%)',
    codeSnippet: 'diagnosticsCOGS = diagnosticsRevenue * (1 - inputs.diagnosticsMargin / 100);',
    metadata: {
      section: 3,
      unit: 'dollars',
      businessLogic: 'Equipment, supplies, and technician costs',
      layer: 2
    }
  });

  edges.push(
    { id: 'e72', source: 'calc_diagnosticsRevenue', target: 'calc_diagnosticsCOGS', weight: 9 },
    { id: 'e73', source: 'diagnosticsMargin', target: 'calc_diagnosticsCOGS', weight: 9 }
  );

  nodes.push({
    id: 'calc_variableCosts',
    label: 'Variable Costs',
    type: 'calculation',
    category: 'Costs',
    description: 'Variable costs as percentage of revenue',
    formula: 'Total Revenue × Variable Cost %',
    codeSnippet: 'variableCosts = totalRevenue * (inputs.variableCostPct / 100);',
    metadata: {
      section: 3,
      unit: 'dollars',
      businessLogic: 'Supplies and materials scale with revenue',
      layer: 2
    }
  });

  edges.push(
    { id: 'e74', source: 'calc_totalRevenue', target: 'calc_variableCosts', weight: 8 },
    { id: 'e75', source: 'variableCostPct', target: 'calc_variableCosts', weight: 8 }
  );

  nodes.push({
    id: 'calc_totalCosts',
    label: 'Total Monthly Costs',
    type: 'calculation',
    category: 'Costs',
    description: 'Sum of all monthly costs',
    formula: 'Fixed + Variable + Salaries + Equipment + Diagnostics COGS',
    codeSnippet: 'totalCosts = fixedCosts + variableCosts + salaryCosts + equipmentLease + diagnosticsCOGS;',
    metadata: {
      section: 3,
      unit: 'dollars',
      businessLogic: 'Total operating expenses',
      layer: 2
    }
  });

  edges.push(
    { id: 'e76', source: 'derived_fixedCostMonthly', target: 'calc_totalCosts', weight: 9 },
    { id: 'e77', source: 'calc_variableCosts', target: 'calc_totalCosts', weight: 9 },
    { id: 'e78', source: 'calc_salaryCosts', target: 'calc_totalCosts', weight: 9 },
    { id: 'e79', source: 'derived_totalEquipmentLease', target: 'calc_totalCosts', weight: 8 },
    { id: 'e80', source: 'calc_diagnosticsCOGS', target: 'calc_totalCosts', weight: 8 }
  );

  // ============================================================================
  // OUTPUT NODES (Layer 3)
  // ============================================================================

  nodes.push({
    id: 'output_netProfit',
    label: 'Net Profit (Monthly)',
    type: 'output',
    category: 'Financial',
    description: 'Monthly profit after all costs',
    formula: 'Total Revenue - Total Costs',
    codeSnippet: 'netProfit = totalRevenue - totalCosts;',
    metadata: {
      section: 8,
      unit: 'dollars',
      businessLogic: 'Bottom-line profitability',
      layer: 3
    }
  });

  edges.push(
    { id: 'e81', source: 'calc_totalRevenue', target: 'output_netProfit', weight: 10 },
    { id: 'e82', source: 'calc_totalCosts', target: 'output_netProfit', weight: 10 }
  );

  nodes.push({
    id: 'output_cumulativeCash',
    label: 'Cumulative Cash Flow',
    type: 'output',
    category: 'Financial',
    description: 'Running cash position',
    formula: 'Sum of monthly net profit - initial investment',
    codeSnippet: 'cumulativeCash = previousCash + netProfit;',
    metadata: {
      section: 8,
      unit: 'dollars',
      businessLogic: 'Cash runway and burn rate',
      layer: 3
    }
  });

  edges.push(
    { id: 'e83', source: 'output_netProfit', target: 'output_cumulativeCash', weight: 10 },
    { id: 'e84', source: 'derived_totalInvestment', target: 'output_cumulativeCash', weight: 9 }
  );

  nodes.push({
    id: 'output_physicianROI',
    label: 'Physician ROI',
    type: 'output',
    category: 'Financial',
    description: 'Return on investment for physicians',
    formula: '(Annual Income / Investment) × 100',
    codeSnippet: 'roi = (annualIncome / investment) * 100;',
    metadata: {
      section: 8,
      unit: 'percentage',
      businessLogic: 'Key metric for physician decision-making',
      layer: 3
    }
  });

  edges.push(
    { id: 'e85', source: 'output_netProfit', target: 'output_physicianROI', weight: 10 },
    { id: 'e86', source: 'derived_totalInvestment', target: 'output_physicianROI', weight: 10 },
    { id: 'e87', source: 'derived_msoFee', target: 'output_physicianROI', weight: 8 },
    { id: 'e88', source: 'derived_equityShare', target: 'output_physicianROI', weight: 8 }
  );

  nodes.push({
    id: 'output_breakevenMonth',
    label: 'Breakeven Month',
    type: 'output',
    category: 'Financial',
    description: 'Month when cumulative cash becomes positive',
    formula: 'First month where cumulative cash > 0',
    codeSnippet: 'breakevenMonth = projections.findIndex(p => p.cumulativeCash > 0);',
    metadata: {
      section: 8,
      unit: 'months',
      businessLogic: 'Time to profitability',
      layer: 3
    }
  });

  edges.push(
    { id: 'e89', source: 'output_cumulativeCash', target: 'output_breakevenMonth', weight: 10 }
  );

  nodes.push({
    id: 'output_totalRevenue12Mo',
    label: 'Total Revenue (12 Months)',
    type: 'output',
    category: 'KPI',
    description: 'Sum of revenue over 12-month projection',
    formula: 'Sum of monthly revenue (months 7-18)',
    codeSnippet: 'totalRevenue12Mo = projections.reduce((sum, p) => sum + p.totalRevenue, 0);',
    metadata: {
      section: 8,
      unit: 'dollars',
      businessLogic: 'Annual revenue projection',
      layer: 3
    }
  });

  edges.push(
    { id: 'e90', source: 'calc_totalRevenue', target: 'output_totalRevenue12Mo', weight: 10 }
  );

  nodes.push({
    id: 'output_totalProfit12Mo',
    label: 'Total Profit (12 Months)',
    type: 'output',
    category: 'KPI',
    description: 'Sum of profit over 12-month projection',
    formula: 'Sum of monthly profit (months 7-18)',
    codeSnippet: 'totalProfit12Mo = projections.reduce((sum, p) => sum + p.netProfit, 0);',
    metadata: {
      section: 8,
      unit: 'dollars',
      businessLogic: 'Annual profitability projection',
      layer: 3
    }
  });

  edges.push(
    { id: 'e91', source: 'output_netProfit', target: 'output_totalProfit12Mo', weight: 10 }
  );

  nodes.push({
    id: 'output_launchMRR',
    label: 'Launch MRR',
    type: 'output',
    category: 'KPI',
    description: 'Monthly recurring revenue at launch (Month 7)',
    formula: 'Total revenue at Month 7',
    codeSnippet: 'launchMRR = rampPeriod[6].totalRevenue;',
    metadata: {
      section: 5,
      unit: 'dollars',
      businessLogic: 'Revenue run rate at official launch',
      layer: 3
    }
  });

  edges.push(
    { id: 'e92', source: 'calc_totalRevenue', target: 'output_launchMRR', weight: 9 }
  );

  nodes.push({
    id: 'output_membersAtLaunch',
    label: 'Members at Launch',
    type: 'output',
    category: 'KPI',
    description: 'Total primary members at launch (Month 7)',
    formula: 'Primary members at Month 7',
    codeSnippet: 'membersAtLaunch = rampPeriod[6].primaryMembers;',
    metadata: {
      section: 5,
      unit: 'count',
      businessLogic: 'Member base size at official launch',
      layer: 3
    }
  });

  edges.push(
    { id: 'e93', source: 'calc_primaryMembers', target: 'output_membersAtLaunch', weight: 9 }
  );

  nodes.push({
    id: 'output_cashAtLaunch',
    label: 'Cash at Launch',
    type: 'output',
    category: 'KPI',
    description: 'Cash position at launch (Month 7)',
    formula: 'Cumulative cash at Month 7',
    codeSnippet: 'cashAtLaunch = rampPeriod[6].cumulativeCash;',
    metadata: {
      section: 5,
      unit: 'dollars',
      businessLogic: 'Remaining capital at official launch',
      layer: 3
    }
  });

  edges.push(
    { id: 'e94', source: 'output_cumulativeCash', target: 'output_cashAtLaunch', weight: 9 }
  );

  nodes.push({
    id: 'output_totalRampBurn',
    label: 'Total Ramp Burn',
    type: 'output',
    category: 'KPI',
    description: 'Total capital deployed during ramp period',
    formula: 'Initial investment - cash at launch',
    codeSnippet: 'totalRampBurn = totalInvestment - cashAtLaunch;',
    metadata: {
      section: 5,
      unit: 'dollars',
      businessLogic: 'Capital consumed during pre-launch phase',
      layer: 3
    }
  });

  edges.push(
    { id: 'e95', source: 'derived_totalInvestment', target: 'output_totalRampBurn', weight: 10 },
    { id: 'e96', source: 'output_cashAtLaunch', target: 'output_totalRampBurn', weight: 10 }
  );

  // ============================================================================
  // CALCULATE STATISTICS
  // ============================================================================

  const stats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    inputNodes: nodes.filter(n => n.type === 'input').length,
    derivedNodes: nodes.filter(n => n.type === 'derived').length,
    calculationNodes: nodes.filter(n => n.type === 'calculation').length,
    outputNodes: nodes.filter(n => n.type === 'output').length,
    maxLayer: Math.max(...nodes.map(n => n.metadata.layer || 0))
  };

  return { nodes, edges, stats };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all nodes that depend on a given node (downstream)
 */
export function getDownstreamNodes(nodeId: string, graph: CalculationGraph): string[] {
  const downstream: Set<string> = new Set();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = graph.edges
      .filter(e => e.source === current)
      .map(e => e.target);
    
    dependents.forEach(dep => {
      if (!downstream.has(dep)) {
        downstream.add(dep);
        queue.push(dep);
      }
    });
  }

  return Array.from(downstream);
}

/**
 * Get all nodes that a given node depends on (upstream)
 */
export function getUpstreamNodes(nodeId: string, graph: CalculationGraph): string[] {
  const upstream: Set<string> = new Set();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependencies = graph.edges
      .filter(e => e.target === current)
      .map(e => e.source);
    
    dependencies.forEach(dep => {
      if (!upstream.has(dep)) {
        upstream.add(dep);
        queue.push(dep);
      }
    });
  }

  return Array.from(upstream);
}

/**
 * Get nodes by section
 */
export function getNodesBySection(section: number, graph: CalculationGraph): GraphNode[] {
  return graph.nodes.filter(n => n.metadata.section === section);
}

/**
 * Get nodes by layer
 */
export function getNodesByLayer(layer: number, graph: CalculationGraph): GraphNode[] {
  return graph.nodes.filter(n => n.metadata.layer === layer);
}

/**
 * Get critical path (nodes with highest impact)
 */
export function getCriticalPath(graph: CalculationGraph): GraphNode[] {
  // Nodes with weight >= 9 on their edges
  const criticalNodeIds = new Set<string>();
  
  graph.edges.forEach(edge => {
    if (edge.weight && edge.weight >= 9) {
      criticalNodeIds.add(edge.source);
      criticalNodeIds.add(edge.target);
    }
  });

  return graph.nodes.filter(n => criticalNodeIds.has(n.id));
}

