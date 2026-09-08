#!/usr/bin/env node
/**
 * HeroSplit Database Backup Script
 *
 * Exports all data from InstantDB using the Admin SDK and writes it to a
 * timestamped JSON file in the ./backups/ directory.
 *
 * Usage:
 *   node scripts/backup-db.mjs
 *
 * Required env vars (can be in .env or set directly):
 *   INSTANT_APP_ID      — your InstantDB App ID
 *   INSTANT_ADMIN_TOKEN — your InstantDB Admin Token
 *
 * Output:
 *   backups/herosplit-backup-YYYY-MM-DDTHH-mm-ss.json
 *
 * Each backup file contains:
 *   {
 *     "meta": { "exportedAt": ..., "appId": ..., "entities": [...] },
 *     "data": {
 *       "userSubscriptions": [...],
 *       "userProfiles": [...],
 *       "workoutLogs": [...],
 *       "achievements": [...],
 *       "feedback": [...],
 *       "workouts": [...]   // seeded data — optional to restore
 *     }
 *   }
 */

import { init } from "@instantdb/admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Config ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, "..", "backups");

const APP_ID      = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID)      { console.error("❌ INSTANT_APP_ID is required"); process.exit(1); }
if (!ADMIN_TOKEN) { console.error("❌ INSTANT_ADMIN_TOKEN is required"); process.exit(1); }

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// ── Entities to export ─────────────────────────────────────────────────────────

// NOTE: workouts are seeded from scripts/seed-instant.mjs and can be re-seeded
// rather than restored from backup. They're included here for completeness.
const ENTITIES = [
  "userSubscriptions",
  "userProfiles",
  "workoutLogs",
  "achievements",
  "feedback",
  "workouts",
];

// ── Export ─────────────────────────────────────────────────────────────────────

async function exportEntity(entity) {
  // InstantDB admin SDK supports full table scans via query without filters
  const result = await db.query({ [entity]: {} });
  return result[entity] ?? [];
}

async function main() {
  console.log("\n🗄️  HeroSplit Database Backup");
  console.log(`   App ID: ${APP_ID}`);
  console.log(`   Entities: ${ENTITIES.join(", ")}\n`);

  const backup = {
    meta: {
      exportedAt: new Date().toISOString(),
      appId: APP_ID,
      entities: ENTITIES,
    },
    data: {},
  };

  for (const entity of ENTITIES) {
    process.stdout.write(`   Exporting ${entity}...`);
    try {
      const rows = await exportEntity(entity);
      backup.data[entity] = rows;
      console.log(` ✅ ${rows.length} records`);
    } catch (err) {
      console.log(` ❌ Failed: ${err.message}`);
      backup.data[entity] = { error: err.message };
    }
  }

  // ── Write to file ────────────────────────────────────────────────────────────

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename  = `herosplit-backup-${timestamp}.json`;
  const filepath  = path.join(BACKUP_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

  const sizeMB = (fs.statSync(filepath).size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Backup complete: backups/${filename} (${sizeMB} MB)`);
  console.log(`   To restore: node scripts/restore-db.mjs backups/${filename}\n`);
}

main().catch((err) => {
  console.error("❌ Backup failed:", err.message ?? err);
  process.exit(1);
});
