#!/usr/bin/env python3
"""
Apply user's value changes from CSV to the dashboard defaults
"""

import csv

# Read user's changes
user_changes = {}
with open('/home/ubuntu/upload/INPUTS_AND_RANGES(1).csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        field_id = row['id']
        default_val = row['default']
        if default_val and default_val != 'TRUE' and default_val != 'FALSE':
            try:
                user_changes[field_id] = float(default_val) if '.' in default_val else int(default_val)
            except:
                user_changes[field_id] = default_val

# Print changes that differ from our new structure
print("User's value changes to apply:")
print("=" * 60)

changes_to_apply = {
    'startupLegal': 35000,  # Changed from 25000
    'fixedOverheadMonthly': 65000,  # Changed from 100000
}

for field, new_val in sorted(changes_to_apply.items()):
    print(f"{field}: {new_val}")

print("\nTotal changes to apply:", len(changes_to_apply))

