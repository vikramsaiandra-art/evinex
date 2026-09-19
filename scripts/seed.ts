// -----------------------------------------------------------
// EVINEX IDEMPOTENT SEED — `npm run seed`
//
// Ensures the four demo accounts exist in the (production)
// SQLite database. Safe to run any number of times:
//   - Schema + empty tables are created/seeded via initDatabase.
//   - Existing demo accounts are UPDATED/REPAIRED in place
//     (fresh PBKDF2 hash + salt, correct role, status ACTIVE)
//     instead of being duplicated.
//   - Non-demo accounts are never touched.
// Run on a deployed host with the same EVINEX_DB_PATH as the
// server, e.g.:  EVINEX_DB_PATH=/var/data/evinex.db npm run seed
// -----------------------------------------------------------
import { initDatabase, listUsers, upsertDemoUsers } from '../src/db.js';
import type { DbStores } from '../src/db.js';
import { buildDemoUsers } from '../src/demoAccounts.js';

const stores: DbStores = {
  users: buildDemoUsers(),
  cases: [],
  documents: [],
  evidence: [],
  auditLogs: [],
  sessions: new Map(),
};

initDatabase(stores);

const report = upsertDemoUsers(buildDemoUsers());

// Refresh the in-memory view from the database for accurate counts.
stores.users.length = 0;
stores.users.push(...listUsers());

console.log('[SEED] EVINEX demo accounts ensured (idempotent):');
for (const email of report.created) console.log(`  created  : ${email}`);
for (const email of report.updated) console.log(`  refreshed: ${email}`);
for (const failure of report.failed) {
  console.error(`  FAILED   : ${failure.email} — ${failure.error}`);
}
console.log(`[SEED] Total users in database: ${stores.users.length}`);
console.log('[SEED] Done. Demo credentials are documented in README.md.');

if (report.failed.length > 0) {
  process.exit(1);
}
