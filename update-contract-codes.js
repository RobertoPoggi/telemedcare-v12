/**
 * Script to update existing contract codes to simple sequential format
 * Run with: node update-contract-codes.js
 */

const fs = require('fs');
const path = require('path');

// Find the SQLite database
const dbDir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const dbFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.sqlite'));

if (dbFiles.length === 0) {
  console.error('No database file found');
  process.exit(1);
}

const dbPath = path.join(dbDir, dbFiles[0]);
console.log(`Database: ${dbPath}`);

// Read and execute the migration
const migrationPath = 'migrations/0024_simplify_contract_codes.sql';
const migration = fs.readFileSync(migrationPath, 'utf8');

console.log('Migration SQL:', migration);
console.log('\n⚠️  Manual execution required:');
console.log('The database is managed by wrangler/miniflare.');
console.log('We need to update via the admin API or restart with fresh migrations.\n');

// Alternative: Update via API
console.log('Alternative: We can update contracts one by one via direct SQL in a test endpoint');
