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
              label: 'Carry-Over Primary per Other Physician',
              type: 'slider',
              min: 25,
              max: 100,
              step: 5,
              default: 25,
              tooltip: 'Average primary care members each additional physician brings'
            },
            {
              id: 'otherPhysiciansSpecialtyCarryoverPerPhysician',
              label: 'Carry-Over Specialty per Other Physician',
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
          id: 'growth_membership',
          title: 'Growth & Membership',
          controls: [
            {
              id: 'primaryInitPerPhysician',
              label: 'Initial Primary Members/Physician',
              type: 'slider',
              min: 0,
              max: 150,
              step: 5,
              default: 50,
              tooltip: 'Starting primary care panel size per physician at launch'
            },
            {
              id: 'specialtyInitPerPhysician',
              label: 'Initial Specialty Visits/Physician',
              type: 'slider',
              min: 0,
              max: 150,
              step: 5,
              default: 75,
              tooltip: 'Starting specialty visit volume per physician (begins Month 4)'
            },
            {
              id: 'primaryIntakeMonthly',
              label: 'DexaFit Primary Intake/Month',
              type: 'slider',
              min: 25,
              max: 200,
              step: 5,
              default: 25,
              tooltip: 'New primary care members acquired monthly through DexaFit partnership'
            },
            {
              id: 'conversionPrimaryToSpecialty',
              label: 'Primary → Specialty Conversion',
              type: 'slider',
              min: 0,
              max: 25,
              step: 0.5,
              default: 10,
              suffix: '%',
              tooltip: 'Percentage of primary members who also use specialty services'
            },
            {
              id: 'corporateContractsMonthly',
              label: 'Corporate Contracts/Month',
              type: 'slider',
              min: 0,
              max: 10,
              step: 1,
              default: 1,
              tooltip: 'New corporate wellness contracts signed per month'
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
              suffix: 'M',
              formula: 'physiciansLaunch × 600000',
              tooltip: 'Total capital raised based on $600K per physician'
            },
            {
              id: 'otherPhysiciansCount',
              label: 'Other Physicians Count',
              type: 'readonly',
              default: 0,
              formula: 'max(physiciansLaunch - 1, 0)',
              tooltip: 'Number of physicians excluding yourself'
            },
            {
              id: 'teamPrimaryStock',
              label: 'Team Primary Stock (M1)',
              type: 'readonly',
              default: 0,
              formula: 'otherPhysiciansCount × otherPhysiciansPrimaryCarryoverPerPhysician',
              tooltip: 'Total primary care members brought by other physicians'
            },
            {
              id: 'teamSpecialtyStock',
              label: 'Team Specialty Stock (M1)',
              type: 'readonly',
              default: 0,
              formula: 'otherPhysiciansCount × otherPhysiciansSpecialtyCarryoverPerPhysician',
              tooltip: 'Total specialty clients brought by other physicians'
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
              id: 'corpEmployeesPerContract',
              label: 'Employees / Contract',
              type: 'slider',
              min: 10,
              max: 500,
              step: 10,
              default: 30,
              tooltip: 'Average number of employees covered per corporate contract'
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
              id: 'diagnosticsStartMonth',
              label: 'Start Month',
              type: 'slider',
              min: 1,
              max: 12,
              step: 1,
              default: 5,
              tooltip: 'Month when diagnostics services come online'
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
              max: 1000,
              step: 10,
              default: 100,
              tooltip: 'Number of lab tests performed per month'
            }
          ]
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

