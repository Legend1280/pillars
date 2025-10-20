/**
 * Migration Runner
 * 
 * This module runs migrations on server startup to ensure all saved scenarios
 * are compatible with the current data model.
 */

import fs from 'fs/promises';
import path from 'path';
import { migrateAllScenarios, getLatestVersion } from './scenarioMigrations';

const SCENARIOS_FILE = path.join(process.cwd(), 'data', 'scenarios.json');
const MIGRATION_LOG_FILE = path.join(process.cwd(), 'data', 'migrations.log');

/**
 * Run all pending migrations on saved scenarios
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('[MIGRATION] Starting scenario data migrations...');
    console.log(`[MIGRATION] Latest migration version: ${getLatestVersion()}`);

    // Check if scenarios file exists
    try {
      await fs.access(SCENARIOS_FILE);
    } catch {
      console.log('[MIGRATION] No scenarios file found, skipping migrations');
      return;
    }

    // Read scenarios file
    const scenariosRaw = await fs.readFile(SCENARIOS_FILE, 'utf-8');
    const scenarios = JSON.parse(scenariosRaw);

    // Check if any migrations are needed
    const needsMigration = Object.values(scenarios).some((scenario: any) => {
      const currentVersion = scenario.version ?? 0;
      return currentVersion < getLatestVersion();
    });

    if (!needsMigration) {
      console.log('[MIGRATION] All scenarios are up to date');
      return;
    }

    // Create backup before migration
    const backupFile = SCENARIOS_FILE + `.backup.${Date.now()}`;
    await fs.copyFile(SCENARIOS_FILE, backupFile);
    console.log(`[MIGRATION] Created backup: ${backupFile}`);

    // Run migrations
    const migratedScenarios = migrateAllScenarios(scenarios);

    // Write migrated data back to file
    await fs.writeFile(
      SCENARIOS_FILE,
      JSON.stringify(migratedScenarios, null, 2),
      'utf-8'
    );

    // Log migration
    const logEntry = `${new Date().toISOString()} - Migrated to version ${getLatestVersion()}\n`;
    await fs.appendFile(MIGRATION_LOG_FILE, logEntry, 'utf-8');

    console.log('[MIGRATION] ✅ Migrations completed successfully');
    console.log(`[MIGRATION] Migrated ${Object.keys(scenarios).length} scenario(s)`);
  } catch (error) {
    console.error('[MIGRATION] ❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Initialize migrations (call this on server startup)
 */
export async function initMigrations(): Promise<void> {
  try {
    await runMigrations();
  } catch (error) {
    console.error('[MIGRATION] Failed to run migrations on startup:', error);
    // Don't crash the server if migrations fail
    // The merge-with-defaults approach in scenariosApi.ts will handle it
  }
}

