// Dashboard Configuration Schema
// This file defines the structure and controls for the entire dashboard

export type ControlType = 'slider' | 'toggle' | 'number' | 'select' | 'readonly';

export interface ControlConfig {
  id: string; // Matches DashboardInputs key
  label: string;
  type: ControlType;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  default: any;
  options?: { value: string; label: string }[]; // For select controls
  formula?: string; // For derived/readonly controls
  suffix?: string; // e.g., "%", "$"
  format?: string; // e.g., "currency_short", "percentage"
  description?: string; // Additional help text
}

export interface AccordionConfig {
  id: string;
  title: string;
  controls: ControlConfig[];
}

export interface SectionConfig {
  id: string;
  title: string;
  icon: string;
  accordions: AccordionConfig[];
}

export interface DashboardConfig {
  version: string;
  sections: SectionConfig[];
}

// Current dashboard configuration
export const dashboardConfig: DashboardConfig = {
  version: '1.3.0',
  sections: [
    {
      id: 'inputs',
      title: 'Inputs & Scenarios',
      icon: 'Settings',
      accordions: [
        {
          id: 'physician_setup',
          title: 'Physician Setup',
          controls: [
            {
              id: 'foundingToggle',
              label: 'Founding Physician Model',
              type: 'toggle',
              default: true,
              tooltip: 'Founding physicians get better terms (37% MSO fee / 10% equity vs 40% / 5%)'
            },
            {
              id: 'physiciansLaunch',
              label: 'Physicians at Launch',
              type: 'slider',
              min: 1,
              max: 10,
              step: 1,
              default: 3,
              tooltip: 'Number of founding physicians at practice launch'
            },
            {
              id: 'physicianPrimaryCarryover',
              label: 'My Primary Members (Carry-Over)',
              type: 'number',
              min: 0,
              max: 150,
              default: 25,
              tooltip: 'Established primary care patients you bring from your previous practice'
            },
            {
              id: 'physicianSpecialtyCarryover',
              label: 'My Specialty Clients (Carry-Over)',
              type: 'number',
              min: 0,
              max: 150,
              default: 40,
              tooltip: 'Existing specialty clients you will continue serving'
            },
            {
              id: 'otherPhysiciansPrimaryCarryoverPerPhysician',
              label: 'Additional Physicians Primary Carry-Over',
              type: 'slider',
              min: 25,
              max: 100,
              step: 5,
              default: 25,
              tooltip: 'Average primary care members each additional physician brings'
            },
            {
              id: 'otherPhysiciansSpecialtyCarryoverPerPhysician',
              label: 'Additional Physicians Specialty Carry-Over',
              type: 'slider',
              min: 40,
              max: 100,
              step: 5,
              default: 40,
              tooltip: 'Average specialty clients each additional physician brings'
            }
          ]
        },
        {
          id: 'derived_variables',
          title: 'Derived Variables',
          controls: [
            {
              id: 'msoFee',
              label: 'MSO Fee',
              type: 'readonly',
              default: 37,
              suffix: '%',
              formula: 'foundingToggle ? 37 : 40',
              tooltip: 'Management services organization fee percentage'
            },
            {
              id: 'equityShare',
              label: 'Equity Share',
              type: 'readonly',
              default: 10,
              suffix: '%',
              formula: 'foundingToggle ? 10 : 5',
              tooltip: 'Physician equity stake in the MSO'
            },
            {
              id: 'retentionRate',
              label: 'Retention Rate',
              type: 'readonly',
              default: 100,
              suffix: '%',
              formula: '100 - churnPrimary',
              tooltip: 'Percentage of members retained annually'
            },
            {
              id: 'capitalRaised',
              label: 'Capital Raised',
              type: 'readonly',
              default: 1800000,
              suffix: '$',
              format: 'currency_short',
              formula: '600000 + ((physiciansLaunch - 1) * 750000)',
              tooltip: 'Assumes one founder at $600k; all additional physicians at $750k.'
            },
            {
              id: 'otherPhysiciansCount',
              label: 'Other Physicians Count',
              type: 'readonly',
              default: 0,
              formula: 'physiciansLaunch - 1',
              tooltip: 'Number of physicians excluding yourself'
            },
            {
              id: 'teamPrimaryStock',
              label: 'Team Primary Stock (M1)',
              type: 'readonly',
              default: 0,
              formula: 'physicianPrimaryCarryover + ((physiciansLaunch - 1) * otherPhysiciansPrimaryCarryoverPerPhysician)',
              tooltip: 'Total primary care members: your carryover + other physicians carryover'
            },
            {
              id: 'teamSpecialtyStock',
              label: 'Team Specialty Stock (M1)',
              type: 'readonly',
              default: 0,
              formula: 'physicianSpecialtyCarryover + ((physiciansLaunch - 1) * otherPhysiciansSpecialtyCarryoverPerPhysician)',
              tooltip: 'Total specialty clients: your carryover + other physicians carryover'
            }
          ]
        }
      ]
    },
    {
      id: 'revenues',
      title: 'Revenues',
      icon: 'DollarSign',
      accordions: [
        {
          id: 'primary_care',
          title: 'Primary Care',
          controls: []
        },
        {
          id: 'specialty_care',
          title: 'Specialty Care',
          controls: []
        },
        {
          id: 'corporate_contracts',
          title: 'Corporate Contracts',
          controls: [
            {
              id: 'corpInitialClients',
              label: 'Initial Corporate Wellness Clients',
              type: 'slider',
              min: 0,
              max: 500,
              step: 10,
              default: 36,
              tooltip: 'Number of corporate wellness clients you start with at launch'
            },
            {
              id: 'corpPricePerEmployeeMonth',
              label: 'Price / Employee / Month',
              type: 'slider',
              min: 500,
              max: 2500,
              step: 50,
              default: 700,
              suffix: '$',
              tooltip: 'Monthly fee charged per employee in corporate wellness programs'
            }
          ]
        },
        {
          id: 'physician_lens',
          title: 'Physician Lens',
          controls: []
        },
        {
          id: 'pricing_economics',
          title: 'Pricing & Economics',
          controls: [
            {
              id: 'primaryPrice',
              label: 'Primary Price/Member/Month',
              type: 'slider',
              min: 400,
              max: 600,
              step: 10,
              default: 500,
              suffix: '$',
              tooltip: 'Monthly subscription fee for primary care membership'
            },
            {
              id: 'specialtyPrice',
              label: 'Specialty Visit Price',
              type: 'slider',
              min: 400,
              max: 800,
              step: 10,
              default: 500,
              suffix: '$',
              tooltip: 'Fee charged per specialty visit or procedure'
            },
            {
              id: 'churnPrimary',
              label: 'Annual Churn Rate (Primary)',
              type: 'slider',
              min: 0,
              max: 20,
              step: 0.5,
              default: 8,
              suffix: '%',
              tooltip: 'Percentage of primary care members who leave annually'
            },
            {
              id: 'inflationRate',
              label: 'Inflation % (Costs)',
              type: 'slider',
              min: 0,
              max: 10,
              step: 0.5,
              default: 2,
              suffix: '%',
              tooltip: 'Annual inflation rate applied to operating costs'
            }
          ]
        }
      ]
    },
    {
      id: 'diagnostics',
      title: 'Diagnostics',
      icon: 'Activity',
      accordions: [
        {
          id: 'diagnostics_settings',
          title: 'Diagnostics Settings',
          controls: [
            {
              id: 'diagnosticsActive',
              label: 'Diagnostics Active',
              type: 'toggle',
              default: true,
              tooltip: 'Enable diagnostic revenue streams (imaging and lab services)'
            },
            {
              id: 'echoStartMonth',
              label: 'Echo Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 1,
              tooltip: 'Month when echocardiogram services begin'
            },
            {
              id: 'echoPrice',
              label: 'Echo Price',
              type: 'slider',
              min: 200,
              max: 1500,
              step: 50,
              default: 500,
              suffix: '$',
              tooltip: 'Price per echocardiogram procedure'
            },
            {
              id: 'echoVolumeMonthly',
              label: 'Echo Volume / Month',
              type: 'slider',
              min: 0,
              max: 500,
              step: 10,
              default: 100,
              tooltip: 'Number of echocardiograms performed per month'
            },
            {
              id: 'ctStartMonth',
              label: 'CT Start Month',
              type: 'slider',
              min: 1,
              max: 12,
              step: 1,
              default: 1,
              tooltip: 'Month when CT scan services begin'
            },
            {
              id: 'ctPrice',
              label: 'CT Price',
              type: 'slider',
              min: 400,
              max: 2000,
              step: 50,
              default: 800,
              suffix: '$',
              tooltip: 'Price per CT scan'
            },
            {
              id: 'ctVolumeMonthly',
              label: 'CT Volume / Month',
              type: 'slider',
              min: 0,
              max: 200,
              step: 10,
              default: 40,
              tooltip: 'Number of CT scans performed per month'
            },
            {
              id: 'labTestsPrice',
              label: 'Lab Tests Price',
              type: 'slider',
              min: 50,
              max: 500,
              step: 10,
              default: 200,
              suffix: '$',
              tooltip: 'Price per lab panel or test'
            },
            {
              id: 'labTestsMonthly',
              label: 'Lab Tests / Month',
              type: 'slider',
              min: 0,
              max: 500,
              step: 10,
              default: 100,
              tooltip: 'Number of lab tests performed per month'
            },
            {
              id: 'diagnosticsMargin',
              label: 'Diagnostics Margin %',
              type: 'slider',
              min: 50,
              max: 65,
              step: 1,
              default: 50,
              suffix: '%',
              tooltip: 'Profit margin on diagnostic services (contract technician costs factored into margin)'
            }
          ]
        }
      ]
    },
    {
      id: 'costs',
      title: 'Costs',
      icon: 'Receipt',
      accordions: [
        {
          id: 'capex',
          title: 'Capital Expenditures (One-Time)',
          controls: [
            {
              id: 'capexBuildoutCost',
              label: 'Buildout Budget (One-Time)',
              type: 'number',
              min: 0,
              max: 2000000,
              default: 150000,
              suffix: '$',
              tooltip: 'Facility renovation, infrastructure, initial equipment bundled with buildout (default from plan).'
            },
            {
              id: 'officeEquipment',
              label: 'Office Equipment (One-Time)',
              type: 'slider',
              min: 15000,
              max: 35000,
              step: 1000,
              default: 25000,
              suffix: '$',
              tooltip: 'One-time office equipment and furniture costs'
            }
          ]
        },
        {
          id: 'startup_costs',
          title: 'Startup Costs (Month 0–1)',
          controls: [
            {
              id: 'splitStartupAcrossTwoMonths',
              label: 'Split Startup Costs Across Months 0–1',
              type: 'toggle',
              default: true,
              tooltip: 'If ON, startup total is split evenly between Month 0 and Month 1.'
            },
            {
              id: 'startupLegal',
              label: 'Legal & Formation',
              type: 'number',
              min: 0,
              max: 100000,
              default: 25000,
              suffix: '$',
              tooltip: 'Entity setup, contracts, compliance.'
            },
            {
              id: 'startupHr',
              label: 'HR & Recruiting',
              type: 'number',
              min: 0,
              max: 100000,
              default: 10000,
              suffix: '$',
              tooltip: 'Job postings, background checks, onboarding.'
            },
            {
              id: 'startupTraining',
              label: 'Training & Certification',
              type: 'number',
              min: 0,
              max: 100000,
              default: 15000,
              suffix: '$',
              tooltip: 'Staff training and credentialing.'
            },
            {
              id: 'startupTechnology',
              label: 'Technology Setup',
              type: 'number',
              min: 0,
              max: 150000,
              default: 20000,
              suffix: '$',
              tooltip: 'EHR, network setup, initial licenses.'
            },
            {
              id: 'startupPermits',
              label: 'Permits & Licenses',
              type: 'number',
              min: 0,
              max: 50000,
              default: 5000,
              suffix: '$',
              tooltip: 'State/local permits, DEA, etc.'
            },
            {
              id: 'variableStartupCosts',
              label: 'Variable Startup Costs',
              type: 'slider',
              min: 25000,
              max: 50000,
              step: 1000,
              default: 37500,
              suffix: '$',
              tooltip: 'Additional variable startup expenses'
            }
          ]
        },
        {
          id: 'operating_costs',
          title: 'Monthly Operating Costs',
          controls: [
            {
              id: 'fixedOverheadMonthly',
              label: 'Fixed Overhead / Month',
              type: 'number',
              min: 0,
              max: 300000,
              default: 100000,
              suffix: '$',
              tooltip: 'Lease, utilities, insurance, IT/SaaS, ops overhead.'
            },
            {
              id: 'equipmentLease',
              label: 'Equipment Lease / Month (CT & Echo)',
              type: 'slider',
              min: 5000,
              max: 25000,
              step: 1000,
              default: 15000,
              suffix: '$',
              tooltip: 'Monthly lease cost for CT scanner and Echo equipment'
            },
            {
              id: 'marketingBudgetMonthly',
              label: 'Marketing Budget / Month',
              type: 'number',
              min: 0,
              max: 100000,
              default: 35000,
              suffix: '$',
              tooltip: 'Fixed monthly marketing budget. Growth-related marketing is covered by Variable Cost % of Revenue.'
            },
            {
              id: 'variableCostPct',
              label: 'Variable Cost % of Revenue',
              type: 'slider',
              min: 0,
              max: 60,
              step: 1,
              default: 30,
              suffix: '%',
              tooltip: 'COGS and per-transaction costs as a percentage of revenue.'
            }
          ]
        },
        {
          id: 'derived_costs',
          title: 'Derived Cost Metrics (Read-Only)',
          controls: [
            {
              id: 'startupTotal',
              label: 'Startup Costs Total',
              type: 'readonly',
              default: 75000,
              suffix: '$',
              formula: 'startupLegal + startupHr + startupTraining + startupTechnology + startupPermits',
              tooltip: 'Sum of startup categories.'
            },
            {
              id: 'startupMonth0',
              label: 'Startup Allocation — Month 0',
              type: 'readonly',
              default: 37500,
              suffix: '$',
              formula: 'splitStartupAcrossTwoMonths ? startupTotal / 2 : startupTotal',
              tooltip: 'If split is ON, half in Month 0; otherwise all in Month 0.'
            },
            {
              id: 'startupMonth1',
              label: 'Startup Allocation — Month 1',
              type: 'readonly',
              default: 37500,
              suffix: '$',
              formula: 'splitStartupAcrossTwoMonths ? startupTotal / 2 : 0',
              tooltip: 'If split is ON, half in Month 1; otherwise zero.'
            },
            {
              id: 'capexMonth0',
              label: 'CapEx Outlay — Month 0',
              type: 'readonly',
              default: 250000,
              suffix: '$',
              formula: '(capexBuildoutMonth === 0 ? capexBuildoutCost : 0) + (equipmentCapexMonth === 0 ? equipmentCapex : 0)',
              tooltip: 'One-time capex outlay recognized in Month 0.'
            },
            {
              id: 'fixedCostMonthly',
              label: 'Fixed Monthly Cost',
              type: 'readonly',
              default: 115000,
              suffix: '$',
              formula: 'fixedOverheadMonthly + marketingBudgetMonthly',
              tooltip: 'Fixed overhead plus marketing.'
            },
            {
              id: 'variableCostMonthly',
              label: 'Variable Cost (Monthly, depends on revenue)',
              type: 'readonly',
              default: 0,
              suffix: '$',
              formula: 'totalRevenueMonthly * (variableCostPct / 100)',
              tooltip: 'Calculated as a percentage of total revenue for the selected month.'
            },
            {
              id: 'operatingCostMonthly',
              label: 'Total Operating Cost / Month',
              type: 'readonly',
              default: 115000,
              suffix: '$',
              formula: 'fixedCostMonthly + variableCostMonthly',
              tooltip: 'Sum of fixed and variable operating costs.'
            }
          ]
        }
      ]
    },
    {
      id: 'staffing',
      title: 'Staffing',
      icon: 'Users',
      accordions: [
        {
          id: 'executive_team',
          title: 'Executive & Leadership',
          controls: [
            {
              id: 'founderChiefStrategistSalary',
              label: 'Founder / Chief Strategist (Annual Salary)',
              type: 'number',
              min: 0,
              max: 500000,
              default: 150000,
              suffix: '$',
              tooltip: 'Annual compensation for Founder / Chief Strategist'
            },
            {
              id: 'directorOperationsSalary',
              label: 'Director of Operations (Annual Salary)',
              type: 'number',
              min: 0,
              max: 500000,
              default: 150000,
              suffix: '$',
              tooltip: 'Annual compensation for Director of Operations'
            },
            {
              id: 'gmHourlyRate',
              label: 'General Manager Hourly Rate',
              type: 'number',
              min: 0,
              max: 200,
              default: 50,
              suffix: '$/hr',
              tooltip: 'Hourly rate for General Manager'
            },
            {
              id: 'gmWeeklyHours',
              label: 'General Manager Hours per Week',
              type: 'slider',
              min: 10,
              max: 40,
              step: 1,
              default: 30,
              tooltip: 'Weekly hours for General Manager'
            },
            {
              id: 'fractionalCfoCost',
              label: 'Fractional CFO (Monthly Retainer)',
              type: 'number',
              min: 0,
              max: 20000,
              default: 5000,
              suffix: '$',
              tooltip: 'Estimated monthly cost for fractional CFO support'
            },
            {
              id: 'eventSalespersonCost',
              label: 'Corporate Event Planner / Sales (Monthly)',
              type: 'number',
              min: 0,
              max: 10000,
              default: 3000,
              suffix: '$',
              tooltip: 'Monthly salary for event planner / sales role'
            }
          ]
        },
        {
          id: 'clinical_team',
          title: 'Clinical Team',
          controls: [
            {
              id: 'np1StartMonth',
              label: 'NP #1 Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 1,
              tooltip: 'Month when first nurse practitioner starts'
            },
            {
              id: 'np1Salary',
              label: 'NP #1 Annual Salary',
              type: 'number',
              min: 0,
              max: 200000,
              default: 120000,
              suffix: '$',
              tooltip: 'Annual salary for first nurse practitioner'
            },
            {
              id: 'np2StartMonth',
              label: 'NP #2 Start Month',
              type: 'slider',
              min: 1,
              max: 12,
              step: 1,
              default: 6,
              tooltip: 'Month when second nurse practitioner starts'
            },
            {
              id: 'np2Salary',
              label: 'NP #2 Annual Salary',
              type: 'number',
              min: 0,
              max: 200000,
              default: 120000,
              suffix: '$',
              tooltip: 'Annual salary for second nurse practitioner'
            }
          ]
        },
        {
          id: 'admin_support',
          title: 'Administrative & Shared Support',
          controls: [
            {
              id: 'adminSupportRatio',
              label: 'Admin/Support Staff per Physician',
              type: 'slider',
              min: 0.5,
              max: 2,
              step: 0.25,
              default: 1,
              tooltip: 'Number of admin/support staff per physician (e.g., 1.0 = 4 staff for 4 physicians)'
            },
            {
              id: 'avgAdminSalary',
              label: 'Average Admin/Support Salary',
              type: 'number',
              min: 0,
              max: 100000,
              default: 50000,
              suffix: '$',
              tooltip: 'Average annual salary per admin/support staff member'
            }
          ]
        }
      ]
    },
    {
      id: 'growth',
      title: 'Growth',
      icon: 'TrendingUp',
      accordions: [
        {
          id: 'growth_drivers',
          title: 'Growth Drivers',
          controls: [
            {
              id: 'dexafitPrimaryIntakeMonthly',
              label: 'DexaFit New Primary Members / Month',
              type: 'slider',
              min: 0,
              max: 200,
              step: 5,
              default: 25,
              tooltip: 'New primary care members acquired monthly through DexaFit partnership'
            },
            {
              id: 'corporateContractSalesMonthly',
              label: 'Corporate Contract Sales / Month',
              type: 'slider',
              min: 0,
              max: 10,
              step: 1,
              default: 1,
              tooltip: 'New corporate wellness contracts signed per month'
            },
            {
              id: 'employeesPerContract',
              label: 'Employees per Contract',
              type: 'slider',
              min: 10,
              max: 100,
              step: 5,
              default: 30,
              tooltip: 'Average number of employees covered per corporate contract'
            },
            {
              id: 'primaryToSpecialtyConversion',
              label: 'Primary → Specialty Conversion',
              type: 'slider',
              min: 5,
              max: 15,
              step: 0.5,
              default: 10,
              suffix: '%',
              tooltip: 'Percentage of primary members who convert to specialty services'
            },
            {
              id: 'diagnosticsExpansionRate',
              label: 'Diagnostics Expansion Rate',
              type: 'slider',
              min: 5,
              max: 20,
              step: 1,
              default: 10,
              suffix: '%',
              tooltip: 'Monthly growth rate for diagnostic services volume'
            }
          ]
        }
      ]
    },
    {
      id: 'risk',
      title: 'Risk',
      icon: 'AlertTriangle',
      accordions: [
        {
          id: 'risk_settings',
          title: 'Risk Settings',
          controls: []
        }
      ]
    }
  ]
};

// Helper function to get control by ID
export function getControlById(controlId: string): ControlConfig | undefined {
  for (const section of dashboardConfig.sections) {
    for (const accordion of section.accordions) {
      const control = accordion.controls.find(c => c.id === controlId);
      if (control) return control;
    }
  }
  return undefined;
}

// Helper function to get all controls
export function getAllControls(): ControlConfig[] {
  const controls: ControlConfig[] = [];
  for (const section of dashboardConfig.sections) {
    for (const accordion of section.accordions) {
      controls.push(...accordion.controls);
    }
  }
  return controls;
}

// Helper function to validate config
export function validateConfig(config: DashboardConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.version) errors.push('Missing version');
  if (!config.sections || config.sections.length === 0) errors.push('No sections defined');
  
  // Check for duplicate control IDs
  const controlIds = new Set<string>();
  for (const section of config.sections) {
    for (const accordion of section.accordions) {
      for (const control of accordion.controls) {
        if (controlIds.has(control.id)) {
          errors.push(`Duplicate control ID: ${control.id}`);
        }
        controlIds.add(control.id);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

