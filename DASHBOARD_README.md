# Pillars Financial Dashboard

An interactive, assumption-driven business modeling tool designed to visualize MSO (Management Services Organization) performance and physician ROI in real time.

## Overview

The Pillars Financial Dashboard provides a comprehensive framework for modeling physician-led healthcare businesses. It enables users to input business parameters and dynamically see updated projections, charts, and financial summaries across multiple scenarios.

## Features

### ✅ Implemented (Phase 1)

- **Responsive Dashboard Layout**
  - Collapsible sidebar navigation with 8 sections
  - Global header with projection tabs (12-Month Plan, Ramp & Launch, Risk Analysis)
  - Persistent KPI ribbon showing key metrics across all views
  - Professional Pillars brand styling (teal/green color scheme)

- **Interactive Input Controls**
  - Founding Physician configuration (equity stake, service fee)
  - Monthly growth sliders (new members, corporate contracts, conversion rates)
  - Primary care settings (membership fees, starting members)
  - Specialty care parameters (visit fees, frequency)
  - Reset to defaults functionality

- **Data Visualizations**
  - 12-Month Financial Projection (stacked bar chart with line overlay)
  - Physician ROI Analysis (donut chart)
  - Real-time KPI calculations

- **Physician Metrics Panel**
  - Investment and equity breakdown
  - Monthly and annualized income projections
  - ROI calculations

### 🚧 Coming Soon (Future Phases)

- **Diagnostics Section**: Echo, Lab, CT service modeling
- **Costs Section**: Build-out and operational expense tracking
- **Staffing Section**: Role-based salary and timing models
- **Financial Summary**: Complete P&L and capital analysis
- **Risk & Sensitivity**: Scenario testing and variance analysis
- **Export Functionality**: Excel and PDF report generation
- **Help System**: Video walkthroughs and detailed documentation

## Architecture

### Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Charts**: Recharts
- **State Management**: React Context API
- **Routing**: Wouter (lightweight client-side routing)

### Project Structure

```
client/src/
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── DashboardLayout.tsx      # Main layout with sidebar
│   ├── DashboardHeader.tsx      # Top header with tabs
│   ├── KPIRibbon.tsx           # Persistent metrics ribbon
│   ├── KPICard.tsx             # Individual KPI card
│   ├── RevenueChart.tsx        # 12-month projection chart
│   ├── PhysicianROIChart.tsx   # ROI donut chart
│   ├── PhysicianDetailsPanel.tsx # Metrics breakdown
│   ├── InputsSection.tsx       # Input controls
│   ├── OverviewSection.tsx     # Charts overview
│   ├── PlaceholderSection.tsx  # Coming soon sections
│   └── HelpModal.tsx           # Help documentation modal
├── contexts/
│   └── DashboardContext.tsx    # Global state management
├── lib/
│   └── data.ts                 # Data types, calculations, mock data
└── pages/
    └── Home.tsx                # Main dashboard page
```

## Data Model

### Key Types

```typescript
DashboardInputs {
  foundingPhysician: { enabled, serviceFee, equityStake }
  monthlyGrowth: { newDexafitMembers, newCorporateContracts, conversionToSpecialty }
  primaryCare: { membershipFee, startingMembers }
  specialtyCare: { avgVisitFee, visitsPerMember }
  diagnostics: { dexaScanFee, scansPerMonth }
  corporate: { avgContractValue, contractsPerMonth }
}

MonthlyProjection {
  month, primaryRevenue, specialtyRevenue, diagnosticsRevenue,
  corporateRevenue, totalRevenue, totalCosts, netProfit
}

PhysicianMetrics {
  type, position, investment, equityStake, serviceFee,
  specialtyRetained, equityIncome, monthlyIncome, annualizedIncome, roi
}
```

## Business Model Context

The dashboard models the **Pillars Framework** - a physician-anchored MSO structure that:

- Separates clinical practice (physician-owned PLLCs) from business operations (MSO)
- Enables founding physicians to invest $600K for 10% equity stake
- Charges 37% MSO service fee on specialty revenue
- Projects recurring membership revenue + specialty add-ons
- Integrates DexaFit diagnostic services (400+ monthly scans, 2000+ active clients)
- Targets 4 founding physicians with decreasing equity stakes (10%, 5%, 5%, 5%)

## Usage

### Running Locally

```bash
cd pillars-dashboard
pnpm install
pnpm dev
```

### Customizing Inputs

All default values are defined in `client/src/lib/data.ts`:

```typescript
export const defaultInputs: DashboardInputs = {
  foundingPhysician: { enabled: true, serviceFee: 37, equityStake: 10 },
  monthlyGrowth: { newDexafitMembers: 25, newCorporateContracts: 1, conversionToSpecialty: 10.0 },
  // ... etc
};
```

### Adding New Sections

1. Create a new component in `client/src/components/`
2. Add section metadata to `dashboardSections` in `data.ts`
3. Update the switch statement in `Home.tsx` to render your component

### Extending Calculations

Financial calculations are centralized in `client/src/lib/data.ts`:

- `calculateKPIs()` - Top-level KPI metrics
- `calculatePhysicianMetrics()` - Detailed physician breakdown
- Add new calculation functions as needed

## Design System

### Colors

- **Primary (Teal)**: `oklch(0.58 0.14 174)` - Main brand color
- **Chart 1 (Blue)**: Primary Revenue
- **Chart 2 (Green)**: Specialty MSO
- **Chart 3 (Purple)**: Diagnostics
- **Chart 4 (Yellow)**: Corporate
- **Chart 5 (Teal)**: Net Profit line

### Typography

- **Headings**: Bold, dark navy (`text-foreground`)
- **Body**: Regular, system sans-serif
- **Muted text**: `text-muted-foreground` for secondary info

## Roadmap

### Phase 2: Enhanced Interactivity
- [ ] Real-time chart updates when inputs change
- [ ] Scenario comparison (side-by-side projections)
- [ ] Custom projection timeframes (6-month, 18-month, 24-month)

### Phase 3: Complete Sections
- [ ] Diagnostics revenue modeling
- [ ] Detailed cost breakdown
- [ ] Staffing timeline and salary projections
- [ ] Full P&L financial summary

### Phase 4: Advanced Features
- [ ] Risk analysis and sensitivity testing
- [ ] Monte Carlo simulations
- [ ] Export to Excel with formulas
- [ ] PDF report generation
- [ ] Save/load scenarios

### Phase 5: Backend Integration
- [ ] User authentication
- [ ] Save scenarios to database
- [ ] Multi-user collaboration
- [ ] API for external integrations

## License

© 2025 Pillars Framework. All rights reserved.

## Support

For questions or feature requests, contact the Pillars team.

