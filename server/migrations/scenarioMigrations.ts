/**
 * Scenario Data Migration System
 * 
 * This module handles automatic migration of saved scenarios when the data model changes.
 * Each migration is versioned and applied only once.
 */

import type { DashboardInputs } from '../../client/src/lib/data';
import { defaultInputs } from '../../client/src/lib/data';

export interface Migration {
  version: number;
  name: string;
  description: string;
  migrate: (data: any) => DashboardInputs;
}

/**
 * List of all migrations in chronological order
 * Add new migrations to the end of this array
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'add_cost_escalation_rates',
    description: 'Add marketingGrowthRate and overheadGrowthRate fields',
    migrate: (data: any): DashboardInputs => {
      return {
        ...defaultInputs,
        ...data,
        // Ensure new fields have defaults if missing
        marketingGrowthRate: data.marketingGrowthRate ?? defaultInputs.marketingGrowthRate,
        overheadGrowthRate: data.overheadGrowthRate ?? defaultInputs.overheadGrowthRate,
      };
    },
  },
  // Add future migrations here:
  // {
  //   version: 2,
  //   name: 'add_new_feature',
  //   description: 'Description of what this migration does',
  //   migrate: (data: any): DashboardInputs => {
  //     return {
  //       ...defaultInputs,
  //       ...data,
  //       newField: data.newField ?? defaultInputs.newField,
  //     };
  //   },
  // },
];

/**
 * Get the latest migration version
 */
export function getLatestVersion(): number {
  return migrations.length > 0 ? migrations[migrations.length - 1].version : 0;
}

/**
 * Apply all necessary migrations to scenario data
 * @param data - The saved scenario data
 * @param currentVersion - The version of the saved data (0 if no version)
 * @returns Migrated data with updated version
 */
export function migrateScenarioData(
  data: any,
  currentVersion: number = 0
): { data: DashboardInputs; version: number } {
  let migratedData = data;
  let appliedMigrations: string[] = [];

  // Apply all migrations newer than the current version
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`[MIGRATION] Applying v${migration.version}: ${migration.name}`);
      console.log(`[MIGRATION] ${migration.description}`);
      migratedData = migration.migrate(migratedData);
      appliedMigrations.push(migration.name);
    }
  }

  if (appliedMigrations.length > 0) {
    console.log(`[MIGRATION] Applied ${appliedMigrations.length} migration(s):`, appliedMigrations);
  }

  return {
    data: migratedData,
    version: getLatestVersion(),
  };
}

/**
 * Migrate all scenarios in a scenario storage object
 * @param scenarios - Object with scenario names as keys
 * @returns Migrated scenarios with version metadata
 */
export function migrateAllScenarios(scenarios: Record<string, any>): Record<string, any> {
  const migrated: Record<string, any> = {};

  for (const [name, scenario] of Object.entries(scenarios)) {
    const currentVersion = scenario.version ?? 0;
    const { data, version } = migrateScenarioData(scenario.data, currentVersion);
    
    migrated[name] = {
      ...scenario,
      data,
      version,
      migrated_at: new Date().toISOString(),
    };
  }

  return migrated;
}

