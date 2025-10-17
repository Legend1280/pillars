# Pillars Dashboard - Changelog v1.2

## Release Date: October 17, 2025

### Major Changes

#### 1. Scenario Mode Update
- **Changed scenario options** from "Conservative/Moderate/Aggressive" to "Null/Conservative/Moderate"
- **New default scenario**: Conservative (previously Moderate)
- **Null scenario**: Sets all values to zero or base defaults for baseline modeling
- **Conservative scenario**: Uses the original moderate values as the new conservative baseline
- **Moderate scenario**: More optimistic assumptions for growth and revenue projections

#### 2. Carry-Over Primitives
Added 4 new primitives to Section 1 "Physician Setup" accordion:

| Primitive ID | Control Label | Type | Range | Default |
|--------------|---------------|------|-------|---------|
| `physician_primary_carryover` | My Primary Members (Carry-Over) | Number Input | 0-150 | 25 |
| `physician_specialty_carryover` | My Specialty Clients (Carry-Over) | Number Input | 0-150 | 40 |
| `other_physicians_primary_carryover_per_physician` | Carry-Over Primary per Other Physician | Slider | 25-100 | 25 |
| `other_physicians_specialty_carryover_per_physician` | Carry-Over Specialty per Other Physician | Slider | 40-100 | 40 |

#### 3. Derived Variables Calculation Engine
Implemented automatic calculation of derived variables:

| Variable | Formula | Description |
|----------|---------|-------------|
| `other_physicians_count` | `max(physicians_launch - 1, 0)` | Number of non-founding physicians |
| `team_primary_stock_m1` | `other_physicians_count × other_physicians_primary_carryover_per_physician` | Team primary patient stock at Month-1 |
| `team_specialty_stock_m1` | `other_physicians_count × other_physicians_specialty_carryover_per_physician` | Team specialty client stock at Month-1 |

Additional existing derived variables:
- `mso_fee`: 37% if founding_toggle else 40%
- `equity_share`: 10% if founding_toggle else 5%
- `retention_rate`: Calculated from churn rate
- `capital_raised`: (physicians_launch × $600K) + (additional_physicians × $750K)

#### 4. Removed Primitives
- **Removed**: `team_specialty_multiplier` - This primitive was removed as it was redundant with the new carry-over logic

### Technical Implementation

#### Files Modified
1. **client/src/lib/data.ts**
   - Updated `scenarioMode` type to `'null' | 'conservative' | 'moderate'`
   - Added `DerivedVariables` interface
   - Implemented `calculateDerivedVariables()` function
   - Created scenario presets for Null, Conservative, and Moderate scenarios
   - Removed `teamSpecialtyMultiplier` from `DashboardInputs` interface

2. **client/src/contexts/DashboardContext.tsx**
   - Added `derivedVariables` to context state
   - Implemented automatic recalculation of derived variables when inputs change
   - Added scenario preset switching logic with infinite loop prevention

3. **client/src/components/Section1InputsSidebar.tsx**
   - Updated scenario mode dropdown to show Null/Conservative/Moderate options
   - Removed `teamSpecialtyMultiplier` control
   - Carry-over controls already in place and working

4. **client/src/components/Section2RevenuesSidebar.tsx**
   - Removed `teamSpecialtyMultiplier` control

5. **client/src/lib/exportImport.ts**
   - Updated `scenario_mode` type in export schema
   - Removed `team_specialty_multiplier` from export/import
   - Derived variables already included in export as formulas

6. **client/src/lib/excelExport.ts**
   - Updated scenario mode documentation
   - Updated carry-over primitive descriptions
   - Added formulas for team stock calculations
   - Removed `team_specialty_multiplier` entry

### Scenario Preset Values

#### Null Scenario
- Physicians at Launch: 1
- All growth rates: 0%
- All carry-over values: 0
- Minimal pricing and costs
- Diagnostics: OFF

#### Conservative Scenario (Default)
- Physicians at Launch: 3
- Primary Init per Physician: 50
- Primary Intake Monthly: 25
- Churn Primary: 8%
- Specialty Init per Physician: 75
- Physician Primary Carryover: 25
- Physician Specialty Carryover: 40
- Corporate Contracts Monthly: 1
- Primary Price: $500
- Specialty Price: $500

#### Moderate Scenario
- Physicians at Launch: 4
- Additional Physicians: 1
- Primary Init per Physician: 75
- Primary Intake Monthly: 40
- Churn Primary: 6%
- Specialty Init per Physician: 100
- Physician Primary Carryover: 40
- Physician Specialty Carryover: 60
- Other Physicians Primary Carryover: 40
- Other Physicians Specialty Carryover: 60
- Corporate Contracts Monthly: 2
- Primary Price: $550
- Specialty Price: $600

### Testing Results
✅ Scenario switching works correctly (Null → Conservative → Moderate)
✅ Derived variables calculate automatically based on input changes
✅ Carry-over primitives display and update correctly
✅ Export/import maintains data integrity
✅ Excel export includes updated primitive documentation

### Breaking Changes
- **Removed**: `teamSpecialtyMultiplier` primitive
- **Changed**: Default scenario is now "Conservative" instead of "Moderate"
- **Changed**: Scenario options no longer include "Aggressive"

### Migration Notes
For existing scenarios:
- Scenarios with `scenarioMode: 'aggressive'` will need to be manually updated to one of the new options
- The `teamSpecialtyMultiplier` value will be ignored on import
- Conservative scenario now uses the values previously assigned to Moderate

### Next Steps
- Build visualizations for Ramp & Launch tab
- Implement Risk Analysis tab with Monte Carlo simulation
- Complete P&L Summary tab
- Add backend API for scenario registry (optional Phase 2)

