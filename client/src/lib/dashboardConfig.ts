// Dashboard Configuration Schema
import { BUSINESS_RULES } from "./constants";
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
  version: '1.4.0',
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
              label: 'I am a Founding Physician',
              type: 'toggle',
              default: true,
              tooltip: 'Founding physicians contribute $600k and get 37% MSO fee / 10% equity. Additional physicians contribute $750k and get 40% MSO fee / 5% equity.'
            },
            // physiciansLaunch is now derived from foundingToggle (1 if true, 0 if false) - no slider needed
            {
              id: 'additionalPhysicians',
              label: 'Additional Physicians',
              type: 'slider',
              min: 0,
              max: 7,
              step: 1,
              default: 3,
              tooltip: 'Number of additional (non-founding) physicians (each contributes $750k capital)'
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
              label: 'Avg Primary Carry-Over (Other Physicians)',
              type: 'slider',
              min: 25,
              max: 100,
              step: 5,
              default: 25,
              tooltip: 'Average primary care members each other physician brings'
            },
            {
              id: 'otherPhysiciansSpecialtyCarryoverPerPhysician',
              label: 'Avg Specialty Carry-Over (Other Physicians)',
              type: 'slider',
              min: 40,
              max: 100,
              step: 5,
              default: 40,
              tooltip: 'Average specialty clients each other physician brings'
            }
          ]
        },
        {
          id: 'derived_variables',
          title: 'Key Metrics (Calculated)',
          controls: [
            {
              id: 'msoFee',
              label: 'My MSO Fee',
              type: 'readonly',
              default: 37,
              suffix: '%',
              formula: 'foundingToggle ? 37 : 40',
              tooltip: 'Your MSO fee rate: Founding physicians = 37%, Additional physicians = 40%'
            },
            {
              id: 'equityShare',
              label: 'My Equity Share',
              type: 'readonly',
              default: 10,
              suffix: '%',
              formula: 'foundingToggle ? 10 : 5',
              tooltip: 'Your equity stake in the MSO: Founding physicians = 10%, Additional physicians = 5%'
            },
            {
              id: 'retentionRate',
              label: 'Member Retention Rate',
              type: 'readonly',
              default: 100,
              suffix: '%',
              formula: '100 - churnPrimary',
              tooltip: 'Annual member retention rate (100% - churn rate)'
            },
            {
              id: 'totalPhysicians',
              label: 'Total Physicians',
              type: 'readonly',
              default: 4,
              format: 'number',
              formula: '(foundingToggle ? 1 : 0) + additionalPhysicians',
              tooltip: 'Total number of physicians at launch (founding + additional)'
            },
            {
              id: 'capitalRaised',
              label: 'Total Capital Raised',
              type: 'readonly',
              default: 2850000,
              suffix: '$',
              format: 'currency_short',
              formula: '((foundingToggle ? 1 : 0) * BUSINESS_RULES.FOUNDING_INVESTMENT) + (additionalPhysicians * BUSINESS_RULES.ADDITIONAL_INVESTMENT)',
              tooltip: 'Total investment: Founding physicians contribute $600k each, additional physicians contribute $750k each'
            },
            {
              id: 'myCapitalContribution',
              label: 'My Capital Contribution',
              type: 'readonly',
              default: BUSINESS_RULES.FOUNDING_INVESTMENT,
              suffix: '$',
              format: 'currency_short',
              formula: 'foundingToggle ? BUSINESS_RULES.FOUNDING_INVESTMENT : BUSINESS_RULES.ADDITIONAL_INVESTMENT',
              tooltip: 'Your personal capital investment: $600k if founding, $750k if additional'
            },
            {
              id: 'totalInvestment',
              label: 'Total Investment Required',
              type: 'readonly',
              default: 800000,
              suffix: '$',
              format: 'currency_short',
              formula: 'capexBuildoutCost + officeEquipment + rampStartupCost',
              tooltip: 'Total capital deployment: CapEx + Office Equipment + Startup Costs'
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
              id: 'annualDiagnosticGrowthRate',
              label: 'Annual Diagnostic Growth Rate',
              type: 'slider',
              min: 0,
              max: 15,
              step: 0.5,
              default: 5,
              suffix: '%',
              tooltip: 'Annual growth rate for diagnostic revenue (Labs, Echo, CT)'
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
              default: 35000,
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
              id: 'startupInventory',
              label: 'Initial Inventory & Supplies',
              type: 'number',
              min: 0,
              max: 50000,
              default: 15000,
              suffix: '$',
              tooltip: 'Medical supplies, office supplies, first 2-3 months stock'
            },
            {
              id: 'startupInsurance',
              label: 'Insurance (First Year/Deposits)',
              type: 'number',
              min: 0,
              max: 100000,
              default: 45000,
              suffix: '$',
              tooltip: 'Malpractice, general liability, property insurance - first year or deposits'
            },
            {
              id: 'startupMarketing',
              label: 'Pre-Launch Marketing',
              type: 'number',
              min: 0,
              max: 100000,
              default: 35000,
              suffix: '$',
              tooltip: 'Brand development, website, initial marketing campaigns'
            },
            {
              id: 'startupProfessionalFees',
              label: 'Professional Fees',
              type: 'number',
              min: 0,
              max: 100000,
              default: 25000,
              suffix: '$',
              tooltip: 'Consultants, accountants, architects, advisors'
            },
            {
              id: 'startupOther',
              label: 'Other Startup Costs & Contingency',
              type: 'number',
              min: 0,
              max: 100000,
              default: 20000,
              suffix: '$',
              tooltip: 'Catch-all for unexpected startup expenses and contingency buffer'
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
              min: 50000,
              max: 170000,
              default: 65000,
              suffix: '$',
              tooltip: 'Lease, utilities, insurance, IT/SaaS, ops overhead.'
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
            },
            {
              id: 'annualCostInflationRate',
              label: 'Annual Cost Inflation Rate',
              type: 'slider',
              min: 0,
              max: 10,
              step: 0.5,
              default: 3,
              suffix: '%',
              tooltip: 'Annual inflation rate applied to Marketing, Overhead, and Salaries'
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
              formula: 'startupLegal + startupHr + startupTraining + startupTechnology + startupPermits + startupInventory + startupInsurance + startupMarketing + startupProfessionalFees + startupOther',
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
      id: 'ramp',
      title: 'Ramp to Launch',
      icon: 'TrendingUp',
      accordions: [
        {
          id: 'timeline_programs',
          title: 'Timeline & Programs',
          controls: [
            {
              id: 'rampDuration',
              label: 'Ramp Duration (Months)',
              type: 'slider',
              min: 3,
              max: 9,
              step: 1,
              default: 6,
              tooltip: 'Length of the ramp phase in months before steady-state operations.'
            },
            {
              id: 'corporateStartMonth',
              label: 'Corporate Program Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 3,
              tooltip: 'Month corporate wellness contracts begin contributing revenue.'
            },
            {
              id: 'echoStartMonth',
              label: 'Echocardiogram Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 2,
              tooltip: 'Month echocardiogram services begin generating revenue.'
            },
            {
              id: 'ctStartMonth',
              label: 'CT Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 6,
              tooltip: 'Month CT imaging services go live.'
            },
            {
              id: 'rampStartupCost',
              label: 'Ramp Startup Costs',
              type: 'number',
              min: 0,
              max: 1000000,
              default: 250000,
              suffix: '$',
              tooltip: 'One-time startup expenditures incurred prior to full revenue activation.'
            }
          ]
        },
        {
          id: 'hiring_schedule',
          title: 'Hiring Schedule',
          controls: [
            {
              id: 'directorOpsStartMonth',
              label: 'Director of Operations Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 1,
              tooltip: 'Month the Director of Operations is hired or active full time.'
            },
            {
              id: 'gmStartMonth',
              label: 'General Manager Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 2,
              tooltip: 'Month the General Manager role becomes active (hourly).'
            },
            {
              id: 'fractionalCfoStartMonth',
              label: 'Fractional CFO Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 4,
              tooltip: 'Month fractional CFO support begins.'
            },
            {
              id: 'eventPlannerStartMonth',
              label: 'Corporate Event Planner / Sales Start Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 5,
              tooltip: 'Month the corporate event planner / sales role is hired.'
            },
            {
              id: 'np1StartMonth',
              label: 'Nurse Practitioner 1 Onboard Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 3,
              tooltip: 'Month first Nurse Practitioner joins; activates salary and overhead.'
            },
            {
              id: 'np2StartMonth',
              label: 'Nurse Practitioner 2 Onboard Month',
              type: 'slider',
              min: 1,
              max: 6,
              step: 1,
              default: 5,
              tooltip: 'Month second Nurse Practitioner joins team.'
            }
          ]
        },
        {
          id: 'ramp_intake',
          title: 'Ramp Intake & Acquisition',
          controls: [
            {
              id: 'rampPrimaryIntakeMonthly',
              label: 'DexaFit Primary Intake (Ramp)',
              type: 'slider',
              min: 0,
              max: 50,
              step: 1,
              default: 20,
              tooltip: 'Expected new primary members per month during ramp phase. During ramp, slower acquisition is expected while systems and processes are being defined.'
            }
          ]
        },
        {
          id: 'equipment_lease_derived',
          title: 'Equipment Lease (Derived)',
          controls: [
            {
              id: 'ctLeaseCost',
              label: 'CT Lease Cost / Month',
              type: 'readonly',
              default: 5000,
              suffix: '$',
              formula: '5000',
              tooltip: 'Monthly lease cost for CT scanner, starts when CT services begin.'
            },
            {
              id: 'echoLeaseCost',
              label: 'Echo Lease Cost / Month',
              type: 'readonly',
              default: 2000,
              suffix: '$',
              formula: '2000',
              tooltip: 'Monthly lease cost for Echo equipment, starts when Echo services begin.'
            },
            {
              id: 'totalEquipmentLease',
              label: 'Total Equipment Lease / Month',
              type: 'readonly',
              default: 7000,
              suffix: '$',
              formula: 'ctLeaseCost + echoLeaseCost',
              tooltip: 'Combined monthly lease cost for all diagnostic equipment.'
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

