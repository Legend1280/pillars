# Slider Bug Investigation

## Problem Statement

User reports that the **12-Month Projection chart does not update** when slider values change.

## What Should Happen

1. User adjusts slider (e.g., Primary Price: $200 → $250)
2. `updateInputs()` is called with new value
3. `useEffect` in DashboardContext triggers (line 45-48)
4. `calculateProjections(inputs)` runs with new inputs
5. `setProjections()` updates state
6. ProjectionTab re-renders with new data
7. Chart displays updated values

## Code Review

### DashboardContext.tsx (Lines 45-48)
```typescript
useEffect(() => {
  setDerivedVariables(calculateDerivedVariables(inputs));
  setProjections(calculateProjections(inputs));
}, [inputs]);
```

**Status:** ✅ Looks correct - should trigger on input changes

### ProjectionTab.tsx (Lines 7-9)
```typescript
export function ProjectionTab() {
  const { projections } = useDashboard();
  const { projection, kpis, launchState } = projections;
```

**Status:** ✅ Correctly consuming context

## Possible Causes

### 1. **Shallow Comparison Issue**
React's `useEffect` uses shallow comparison for dependencies. If `inputs` object reference doesn't change, the effect won't trigger.

**Check:** Is `updateInputs` creating a new object reference?

```typescript
const updateInputs = (updates: Partial<DashboardInputs>) => {
  setInputs((prev) => ({
    ...prev,      // ✅ Spread creates new object
    ...updates,   // ✅ Merges updates
  }));
};
```

**Status:** ✅ Should work - creates new object

### 2. **Slider Not Calling updateInputs**
Maybe the sliders aren't actually calling `updateInputs()` when changed.

**Need to check:** Slider components in sidebar

### 3. **React StrictMode Double Render**
Development mode might be causing stale closures.

**Status:** Unlikely but possible

### 4. **Memoization Issue**
Chart components might be memoized and not re-rendering.

**Status:** Need to check if ProjectionTab or chart components use React.memo()

## Next Steps

1. ✅ Check if sliders are calling updateInputs
2. ✅ Add console.log to updateInputs to verify it's being called
3. ✅ Add console.log to useEffect to verify it's triggering
4. ✅ Check if projections state is actually updating
5. ✅ Check if ProjectionTab is re-rendering

## Testing Plan

Add debug logging to track the data flow:

```typescript
// In DashboardContext
const updateInputs = (updates: Partial<DashboardInputs>) => {
  console.log('🔄 updateInputs called:', updates);
  setInputs((prev) => {
    const newInputs = { ...prev, ...updates };
    console.log('📊 New inputs:', newInputs);
    return newInputs;
  });
};

useEffect(() => {
  console.log('⚡ useEffect triggered - recalculating projections');
  setDerivedVariables(calculateDerivedVariables(inputs));
  const newProjections = calculateProjections(inputs);
  console.log('📈 New projections calculated:', newProjections.kpis);
  setProjections(newProjections);
}, [inputs]);
```

Then in browser console, adjust a slider and watch for logs.

