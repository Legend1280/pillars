# Scenario Data Migration System

This directory contains the automatic migration system for scenario data. When you add new fields to the `DashboardInputs` interface, the migration system ensures that all saved scenarios are automatically updated with default values.

## How It Works

1. **On Server Startup**: The migration runner checks all saved scenarios
2. **Version Tracking**: Each scenario has a version number
3. **Automatic Migration**: Scenarios older than the current version are automatically migrated
4. **Backup Creation**: A backup is created before any migration
5. **Merge with Defaults**: New fields get default values from `defaultInputs`

## Adding a New Migration

When you add new fields to `DashboardInputs`, create a migration:

```typescript
// In scenarioMigrations.ts, add to the migrations array:
{
  version: 2, // Increment version number
  name: 'add_my_new_field',
  description: 'Add myNewField to support XYZ feature',
  migrate: (data: any): DashboardInputs => {
    return {
      ...defaultInputs,
      ...data,
      // Explicitly set default for new field
      myNewField: data.myNewField ?? defaultInputs.myNewField,
    };
  },
}
```

## Migration Log

Migrations are logged to `data/migrations.log` with timestamps.

## Backups

Before each migration, a backup is created:
- Location: `data/scenarios.json.backup.<timestamp>`
- These can be used to restore if something goes wrong

## Safety Features

1. **Non-Destructive**: Migrations only add/update fields, never remove data
2. **Idempotent**: Running migrations multiple times is safe
3. **Fallback**: If migrations fail, the app still works (merge-with-defaults in scenariosApi.ts)
4. **Versioned**: Each scenario tracks which migrations have been applied

## Example Migration Flow

### Before (Old Scenario Data)
```json
{
  "lean": {
    "data": {
      "scenarioMode": "lean",
      "primaryPrice": 500
      // Missing: marketingGrowthRate, overheadGrowthRate
    },
    "version": 0
  }
}
```

### After Migration v1
```json
{
  "lean": {
    "data": {
      "scenarioMode": "lean",
      "primaryPrice": 500,
      "marketingGrowthRate": 3,  // Added from defaults
      "overheadGrowthRate": 2     // Added from defaults
    },
    "version": 1,
    "migrated_at": "2025-10-19T21:15:00.000Z"
  }
}
```

## Troubleshooting

**Q: What if a migration fails?**
A: The server will still start. The backup file can be restored manually, and the merge-with-defaults approach in `scenariosApi.ts` provides a safety net.

**Q: How do I know if migrations ran?**
A: Check the server console logs for `[MIGRATION]` messages, or check `data/migrations.log`.

**Q: Can I skip migrations?**
A: Not recommended. Migrations ensure data consistency. If you need to, you can manually edit `scenarios.json` and set the version number.

