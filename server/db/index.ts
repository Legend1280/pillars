import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(__dirname, '../../data/scenarios.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

// Initialize database
export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
const schema = readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

console.log('[DB] Database initialized at', DB_PATH);

export default db;

