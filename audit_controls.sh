#!/bin/bash

echo "# COMPLETE CONTROL AUDIT"
echo "## Checking all 117 controls..."
echo ""

# Extract all control IDs
controls=$(grep -E "^\s+id: '[a-zA-Z]" client/src/lib/dashboardConfig.ts | sed "s/.*id: '//;s/',//" | sort -u)

total=0
used=0
unused=0

for control in $controls; do
  total=$((total + 1))
  
  # Check calculations.ts
  calc_count=$(grep -c "inputs\.$control" client/src/lib/calculations.ts 2>/dev/null || echo "0")
  
  # Check all tab components
  tab_count=$(grep -r "inputs\.$control" client/src/components/*Tab.tsx 2>/dev/null | wc -l)
  
  # Check context
  ctx_count=$(grep -c "inputs\.$control" client/src/contexts/DashboardContext.tsx 2>/dev/null || echo "0")
  
  total_uses=$((calc_count + tab_count + ctx_count))
  
  if [ "$total_uses" -gt 0 ]; then
    used=$((used + 1))
    echo "✅ $control (calc:$calc_count, tabs:$tab_count, ctx:$ctx_count)"
  else
    unused=$((unused + 1))
    echo "❌ $control - NOT USED ANYWHERE"
  fi
done

echo ""
echo "## Summary"
echo "Total: $total"
echo "Used: $used"
echo "Unused: $unused"
