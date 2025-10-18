# Ramp to Launch Section Implementation (v1.4.0)

**Date:** October 17, 2025  
**Schema Version:** 1.3.0 → 1.4.0  
**Status:** ✅ Complete

---

## Overview

Implemented a comprehensive "Ramp to Launch" section that centralizes all timeline controls for the 6-month ramp period (Months 0-6) before the practice reaches full operational capacity at Month 7.

This refactor separates **ramp-phase controls** from **steady-state assumptions**, providing a clearer financial model structure.

---

## What Changed

### 1. New Section: "Ramp to Launch"

**Location:** Inserted between "Costs" and "Staffing" sections

**Contains 4 Accordions:**

#### **A. Timeline & Programs**
- **Ramp Duration (Months)** - Default: 6 months
- **Corporate Program Start Month** - Slider (1-6), Default: 3
- **Echocardiogram Start Month** - Slider (1-6), Default: 2
- **CT Start Month** - Slider (1-6), Default: 6
- **Ramp Startup Costs** - Input field, Default: $250,000

#### **B. Hiring Schedule**
- **Director of Operations Start Month** - Slider (1-6), Default: 1
- **General Manager Start Month** - Slider (1-6), Default: 2
- **Fractional CFO Start Month** - Slider (1-6), Default: 4
- **Corporate Event Planner / Sales Start Month** - Slider (1-6), Default: 5
- **Nurse Practitioner 1 Onboard Month** - Slider (1-6), Default: 3
- **Nurse Practitioner 2 Onboard Month** - Slider (1-6), Default: 5

#### **C. Ramp Intake & Acquisition**
- **DexaFit Primary Intake (Ramp)** - Slider (0-50), Default: 20/month
  - Lower than steady-state (25/month) to reflect slower growth during setup

#### **D. Equipment Lease (Derived)**
- **CT Lease Cost / Month** - Read-only, $5,000 (starts when CT starts)
- **Echo Lease Cost / Month** - Read-only, $2,000 (starts when Echo starts)
- **Total Equipment Lease / Month** - Read-only, $7,000 (sum of both)

---

### 2. Controls Moved FROM Other Sections

#### **Removed from Diagnostics:**
- ❌ Echocardiogram Start Month → Moved to Ramp to Launch
- ❌ CT Start Month → Moved to Ramp to Launch

#### **Removed from Staffing:**
- ❌ NP #1 Start Month → Moved to Ramp to Launch
- ❌ NP #2 Start Month → Moved to Ramp to Launch

#### **Removed from Costs:**
- ❌ Equipment Lease (Monthly) → Now derived in Ramp to Launch

---

### 3. Equipment Lease Refactor

**Before:**
- Single slider: "Equipment Lease / Month" = $7,000
- Fixed cost regardless of when diagnostics start

**After:**
- **CT Lease:** $5,000/month (derived, starts when CT starts)
- **Echo Lease:** $2,000/month (derived, starts when Echo starts)
- **Total:** Automatically calculated based on diagnostic timing
- **Formula:** `ctLeaseCost + echoLeaseCost`

**Benefits:**
- Equipment costs now align with diagnostic service start dates
- More accurate cash flow modeling during ramp period
- Clearer cost attribution

---

## Data Model Changes

### New Inputs Added to `DashboardInputs`:

```typescript
// Ramp to Launch
rampDuration: number;                    // Default: 6
corporateStartMonth: number;             // Default: 3
rampStartupCosts: number;                // Default: 250000
directorOpsStartMonth: number;           // Default: 1
gmStartMonth: number;                    // Default: 2
cfoStartMonth: number;                   // Default: 4
eventPlannerStartMonth: number;          // Default: 5
dexafitRampIntake: number;               // Default: 20
ctLeaseCost: number;                     // Derived: 5000
echoLeaseCost: number;                   // Derived: 2000
totalEquipmentLease: number;             // Derived: 7000
```

### Existing Inputs Retained (now in Ramp section):
- `echoStartMonth` - Default changed: 1 → 2
- `ctStartMonth` - Default changed: 1 → 6
- `np1StartMonth` - Default changed: 1 → 3
- `np2StartMonth` - Default changed: 6 → 5

---

## Schema Version Update

**Version:** 1.3.0 → **1.4.0**

**Migration Notes:**
- Existing configs with schema 1.3.0 will auto-upgrade
- New ramp fields will use default values if not present
- Equipment lease value will be split into CT ($5k) + Echo ($2k)

---

## Financial Model Logic

### Ramp Period (Months 0-6)

**Revenue Drivers:**
1. **Corporate Contracts** - Start at month specified by `corporateStartMonth`
2. **Diagnostics:**
   - Echo starts at `echoStartMonth` (Month 2)
   - CT starts at `ctStartMonth` (Month 6)
   - Labs always start Month 1
3. **Primary Care:**
   - DexaFit intake: 20/month during ramp (vs 25 steady-state)
   - Physician carry-over members: ALL join at **Month 6** (practice full opening)

**Cost Drivers:**
1. **One-Time:**
   - CapEx: $150k buildout (Month 0)
   - Startup: $250k (split across Months 0-1)
2. **Recurring:**
   - Salaries phased in per hiring schedule
   - Equipment lease starts when diagnostics start
   - Fixed overhead: $100k/month
   - Marketing: $35k/month

### Steady State (Months 7-18)

**All assumptions from main sections apply:**
- Full team in place
- All services operational
- DexaFit intake: 25/month
- Corporate contracts: 36 employees × $700/month
- All physician carry-over members active

---

## Testing Results

### ✅ Verified Functionality

1. **Ramp to Launch Section:**
   - All 4 accordions expand/collapse correctly
   - All sliders functional with correct ranges
   - Default values load correctly
   - Derived equipment lease calculates properly

2. **Diagnostics Section:**
   - Echo/CT start month sliders removed ✓
   - Price and volume controls remain ✓
   - No broken references ✓

3. **Staffing Section:**
   - NP start month sliders removed ✓
   - Salary controls remain ✓
   - No broken references ✓

4. **Costs Section:**
   - Equipment lease slider removed ✓
   - All other cost controls remain ✓
   - No broken references ✓

5. **Navigation:**
   - Section appears between Costs and Staffing ✓
   - Auto-opens when clicking "Next: Ramp to Launch" ✓
   - Smooth 500ms animations ✓

---

## Files Modified

1. **`client/src/lib/data.ts`**
   - Added ramp inputs to `DashboardInputs` interface
   - Added ramp defaults to `defaultInputs`
   - Added ramp values to scenario presets
   - Added "Ramp to Launch" to `dashboardSections` array

2. **`client/src/lib/dashboardConfig.ts`**
   - Updated schema version: 1.3.0 → 1.4.0
   - Inserted new "Ramp to Launch" section (4 accordions, 14 controls)
   - Removed `echoStartMonth` and `ctStartMonth` from Diagnostics
   - Removed `np1StartMonth` and `np2StartMonth` from Staffing
   - Removed `equipmentLease` from Costs

---

## Next Steps for Calculation Engine

When building the calculation engine, the ramp model should:

1. **Month 0-6 Calculations:**
   - Check each month which services/staff are active based on start months
   - Calculate revenue only from active services
   - Calculate costs only from active staff/equipment
   - Track cumulative burn and cash position

2. **Month 6 Transition:**
   - Add all physician carry-over members
   - Verify all services are operational
   - Confirm full team is hired

3. **Month 7-18 Projections:**
   - Use steady-state assumptions from main sections
   - Apply growth rates and churn
   - Project 12-month financials

4. **Visualizations:**
   - **Ramp Period Chart:** Month-by-month revenue, costs, burn (Months 0-6)
   - **Transition Marker:** Visual indicator at Month 6 (full opening)
   - **Projection Chart:** 12-month forecast (Months 7-18)
   - **Key Metrics:** Total ramp burn, Month 6 cash position, breakeven month

---

## Summary

✅ **Ramp to Launch section implemented**  
✅ **14 controls centralized** (timeline, hiring, intake, equipment)  
✅ **Equipment lease refactored** to be derived from diagnostic timing  
✅ **Schema version updated** to 1.4.0  
✅ **All controls tested** and verified working  
✅ **Clean separation** between ramp phase and steady-state assumptions  

**Ready for:** Calculation engine implementation (Phase 2)

