#!/usr/bin/env python3
import re
import json
import csv

# Read the dashboardConfig.ts file
with open('/home/ubuntu/pillars-dashboard/client/src/lib/dashboardConfig.ts', 'r') as f:
    config_content = f.read()

# Read the data.ts file for defaults
with open('/home/ubuntu/pillars-dashboard/client/src/lib/data.ts', 'r') as f:
    data_content = f.read()

print("Parsing configuration...")

# Extract all control definitions
# This is a simplified parser - we'll extract the key information manually
controls_data = []

# Find all control blocks in the config
control_pattern = r'\{\s*id:\s*[\'"](\w+)[\'"],\s*label:\s*[\'"]([^"\']+)[\'"],\s*type:\s*[\'"](\w+)[\'"]'

matches = re.finditer(control_pattern, config_content, re.MULTILINE | re.DOTALL)

for match in matches:
    control_id = match.group(1)
    label = match.group(2)
    control_type = match.group(3)
    
    # Find the full control block
    start_pos = match.start()
    # Find the closing brace for this control
    brace_count = 0
    end_pos = start_pos
    for i, char in enumerate(config_content[start_pos:], start=start_pos):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                end_pos = i + 1
                break
    
    control_block = config_content[start_pos:end_pos]
    
    # Extract min, max, step, default
    min_match = re.search(r'min:\s*(\d+)', control_block)
    max_match = re.search(r'max:\s*(\d+)', control_block)
    step_match = re.search(r'step:\s*([\d.]+)', control_block)
    default_match = re.search(r'default:\s*([\d.]+|true|false)', control_block)
    tooltip_match = re.search(r'tooltip:\s*[\'"]([^"\']+)[\'"]', control_block)
    formula_match = re.search(r'formula:\s*[\'"]([^"\']+)[\'"]', control_block)
    
    controls_data.append({
        'id': control_id,
        'label': label,
        'type': control_type,
        'min': min_match.group(1) if min_match else '',
        'max': max_match.group(1) if max_match else '',
        'step': step_match.group(1) if step_match else '',
        'default': default_match.group(1) if default_match else '',
        'tooltip': tooltip_match.group(1) if tooltip_match else '',
        'formula': formula_match.group(1) if formula_match else ''
    })

print(f"Found {len(controls_data)} controls")

# Write to CSV
csv_path = '/home/ubuntu/pillars-dashboard/INPUTS_AND_RANGES.csv'
with open(csv_path, 'w', newline='') as csvfile:
    fieldnames = ['id', 'label', 'type', 'default', 'min', 'max', 'step', 'formula', 'tooltip']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for control in controls_data:
        writer.writerow(control)

print(f"Exported to {csv_path}")

# Also create a JSON version
json_path = '/home/ubuntu/pillars-dashboard/INPUTS_AND_RANGES.json'
with open(json_path, 'w') as jsonfile:
    json.dump(controls_data, jsonfile, indent=2)

print(f"Exported to {json_path}")
print(f"\nTotal controls exported: {len(controls_data)}")

