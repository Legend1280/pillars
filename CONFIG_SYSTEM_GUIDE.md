# Config-Driven Dashboard System Guide

## Overview

The Pillars Financial Dashboard now uses a **config-driven architecture** that allows you to configure the entire dashboard structure through a single JSON configuration file. This makes it easy to add, remove, or reorganize controls without touching the UI code.

## Key Features

✅ **Single Source of Truth** - All controls, sections, and accordions defined in one place  
✅ **Auto-Generated UI** - Sidebar components render automatically from config  
✅ **Auto-Generated Excel Export** - Export structure matches config automatically  
✅ **Upload/Download Config** - Easy configuration management  
✅ **Live Values** - Always uses current slider values, not config defaults  
✅ **Type-Safe** - Full TypeScript support with validation  

---

## Configuration Structure

### File Location
`client/src/lib/dashboardConfig.ts`

### Schema

```typescript
{
  version: string,
  sections: [
    {
      id: string,           // e.g., "inputs", "revenues"
      title: string,        // e.g., "Inputs & Scenarios"
      icon: string,         // Lucide icon name
      accordions: [
        {
          id: string,       // e.g., "physician_setup"
          title: string,    // e.g., "Physician Setup"
          controls: [
            {
              id: string,           // Must match DashboardInputs key
              label: string,        // Display label
              type: ControlType,    // 'slider' | 'toggle' | 'number' | 'select' | 'readonly'
              tooltip: string,      // Help text
              min: number,          // For slider/number
              max: number,          // For slider/number
              step: number,         // For slider
              default: any,         // Default value
              suffix: string,       // e.g., "$", "%"
              formula: string,      // For readonly controls
              description: string,  // Additional help text
              options: [{          // For select controls
                value: string,
                label: string
              }]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## How to Add a New Control

### 1. Add to DashboardInputs Type
First, add the new input to `client/src/lib/data.ts`:

```typescript
export interface DashboardInputs {
  // ... existing inputs
  newControl: number; // Add your new control
}
```

### 2. Add to Config
Then add it to `dashboardConfig` in `client/src/lib/dashboardConfig.ts`:

```typescript
{
  id: 'newControl',
  label: 'New Control Label',
  type: 'slider',
  min: 0,
  max: 100,
  step: 1,
  default: 50,
  tooltip: 'Description of what this control does',
  suffix: '%'
}
```

### 3. Done!
The control will automatically:
- ✅ Appear in the sidebar
- ✅ Be included in Excel exports
- ✅ Work with scenario presets
- ✅ Save/load with other inputs

---

## How to Reorganize Sections

### Move a Control to Different Accordion

1. Find the control in `dashboardConfig.ts`
2. Cut it from its current accordion's `controls` array
3. Paste it into the target accordion's `controls` array
4. Save the file

The UI will automatically update!

### Rename an Accordion

Simply change the `title` field:

```typescript
{
  id: 'physician_setup',
  title: 'Doctor Configuration', // Changed from "Physician Setup"
  controls: [...]
}
```

---

## Config Upload/Download

### Download Current Config

1. Click **"Download Config"** button in the header
2. A `dashboard-config.json` file will be downloaded
3. This file contains the complete dashboard structure

### Upload Modified Config

1. Edit the downloaded JSON file
2. Click **"Upload Config"** button
3. Select your modified JSON file
4. Refresh the page to see changes

**Note:** Config validation ensures uploaded files are valid before applying.

---

## Excel Export

The Excel export is now **automatically generated** from the config:

### Features
- ✅ Organized by sections (matching sidebar structure)
- ✅ Includes current values (not just defaults)
- ✅ Shows control types, ranges, tooltips
- ✅ Includes formulas for derived variables

### Columns
1. **Control Label** - Human-readable name
2. **Primitive ID** - Code identifier
3. **Type / Control** - Control type (Slider, Toggle, etc.)
4. **Default / Range** - Default value and valid range
5. **Current Value** - Live value from dashboard
6. **Formula / Logic** - Calculation or description
7. **Tooltip** - Help text

---

## Control Types

### Slider
```typescript
{
  type: 'slider',
  min: 0,
  max: 100,
  step: 1,
  default: 50
}
```
Renders a draggable slider with min/max range.

### Toggle
```typescript
{
  type: 'toggle',
  default: true
}
```
Renders an ON/OFF switch.

### Number Input
```typescript
{
  type: 'number',
  min: 0,
  max: 150,
  default: 25
}
```
Renders a numeric input field.

### Select Dropdown
```typescript
{
  type: 'select',
  default: 'option1',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]
}
```
Renders a dropdown menu.

### Readonly (Derived)
```typescript
{
  type: 'readonly',
  default: 0,
  formula: 'physiciansLaunch × 600000'
}
```
Displays calculated values (not editable).

---

## Scenario Presets

Scenario presets are still defined in `DashboardContext.tsx`:

```typescript
const scenarioPresets = {
  null: { /* all zeros */ },
  conservative: { /* moderate values */ },
  moderate: { /* optimistic values */ }
};
```

When adding new controls, remember to add them to all scenario presets!

---

## Best Practices

### 1. Use Descriptive IDs
```typescript
// Good
id: 'primaryPricePerMember'

// Bad
id: 'price1'
```

### 2. Write Clear Tooltips
```typescript
tooltip: 'Monthly subscription fee for primary care membership'
// Better than: "Price for primary"
```

### 3. Set Appropriate Ranges
```typescript
min: 400,  // Reasonable minimum
max: 600,  // Reasonable maximum
step: 10   // Appropriate granularity
```

### 4. Group Related Controls
Put related controls in the same accordion:
```typescript
{
  id: 'pricing_economics',
  title: 'Pricing & Economics',
  controls: [
    // All pricing-related controls together
  ]
}
```

---

## Validation

The config system includes automatic validation:

```typescript
import { validateConfig } from '@/lib/dashboardConfig';

const validation = validateConfig(config);
if (!validation.valid) {
  console.error('Config errors:', validation.errors);
}
```

### Checks:
- ✅ No duplicate control IDs
- ✅ Required fields present
- ✅ Valid control types
- ✅ Proper structure

---

## Migration Guide

### From Old System to Config-Driven

**Before:** Controls hardcoded in `Section1InputsSidebar.tsx`
```tsx
<Slider
  value={[inputs.primaryPrice]}
  onValueChange={([v]) => updateInputs({ primaryPrice: v })}
  min={400}
  max={600}
/>
```

**After:** Controls defined in config
```typescript
{
  id: 'primaryPrice',
  label: 'Primary Price/Member/Month',
  type: 'slider',
  min: 400,
  max: 600,
  default: 500
}
```

The `ConfigDrivenControl` component handles rendering automatically!

---

## Troubleshooting

### Control Not Appearing
1. Check that `id` matches a key in `DashboardInputs`
2. Verify the control is in a non-empty accordion
3. Check browser console for errors

### Excel Export Missing Control
1. Ensure control is in `dashboardConfig.ts`
2. Check that section is included in export
3. Verify control has all required fields

### Upload Config Fails
1. Check JSON syntax (use a validator)
2. Ensure all required fields are present
3. Check for duplicate control IDs

---

## Future Enhancements

Potential improvements to the config system:

- [ ] Visual config editor (GUI)
- [ ] Config versioning and migration
- [ ] Import/export individual sections
- [ ] Conditional control visibility
- [ ] Custom validation rules per control
- [ ] Config templates for common setups

---

## Summary

The config-driven system makes the dashboard:
- **Easier to maintain** - Change structure in one place
- **More flexible** - Add/remove controls without code changes
- **Self-documenting** - Config serves as documentation
- **Exportable** - Share configurations between users
- **Consistent** - UI and exports always match

**Key Files:**
- `client/src/lib/dashboardConfig.ts` - Main configuration
- `client/src/components/ConfigDrivenControl.tsx` - Control renderer
- `client/src/components/ConfigDrivenSidebar.tsx` - Sidebar renderer
- `client/src/lib/configDrivenExcelExport.ts` - Excel export
- `client/src/lib/configManager.ts` - Upload/download utilities

