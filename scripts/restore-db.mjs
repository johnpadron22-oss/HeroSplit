#!/usr/bin/env node
/**
 * HeroSplit Database Restore Script
 *
 * Restores data from a backup JSON file created by scripts/backup-db.mjs.
 * Uses the InstantDB Admin SDK (bypasses all permission rules).
 *
 * Usage:
 *   node scripts/restore-db.mjs <backup-file>
 *   node scripts/restore-db.mjs backups/herosplit-backup-2026-09-08T12-00-00.json
 *
 * Options:
 *   --entity=userProfiles    Only restore a specific entity
 *   --skip-workouts          Skip restoring the workouts entity (re-seed instead)
 *   --dry-run                Print what would be done without writing
 *
 * Required env vars:
 *   INSTANT_APP_ID
 *   INSTANT_ADMIN_TOKEN
 *
 * ⚠️  WARNING: This script OVERWRITES existing records by ID. It does NOT
 * delete records that exist in the database but not in the backup file.
 * For a clean restore, coordinate with InstantDB support for a full wipe
 * before running this script.
 */

import { init, id as newId, tx } from "@instantdb/admin";
import fs from "fs";
import path from "path";

// ── Config ─────────────────────────────────────────────────────────────────────

const APP_ID      = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID)      { console.error("❌ INSTANT_APP_ID is required"); process.exit(1); }
if (!ADMIN_TOKEN) { console.error("❌ INSTANT_ADMIN_TOKEN is required"); process.exit(1); }

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// ── Arg parsing ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const backupFile   = args.find((a) => !a.startsWith("--"));
const onlyEntity   = args.find((a) => a.startsWith("--entity="))?.split("=")[1];
const skipWorkouts = args.includes("--skip-workouts");
const dryRun       = args.includes("--dry-run");

if (!backupFile) {
  console.error("Usage: node scripts/restore-db.mjs <backup-file> [--entity=name] [--skip-workouts] [--dry-run]");
  process.exit(1);
}

if (!fs.existsSync(backupFile)) {
  console.error(`❌ Backup file not found: ${backupFile}`);
  process.exit(1);
}

// ── Restore logic ──────────────────────────────────────────────────────────────

const BATCH_SIZE = 25; // InstantDB transaction limit per call

async function restoreEntity(entityName, records) {
  if (!Array.isArray(records) || records.length === 0) {
    console.log(`   ${entityName}: no records to restore`);
    return;
  }

  const total  = records.length;
  let restored = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    if (dryRun) {
      console.log(`   [dry-run] Would write ${batch.length} ${entityName} records (batch ${Math.floor(i/BATCH_SIZE)+1})`);
      restored += batch.length;
      continue;
    }

    const transactions = batch.map((record) => {
      const { id, ...fields } = record;
      if (!id) {
        console.warn(`   ⚠️  Record in ${entityName} missing id — skipping`);
        return null;
      }
      return tx[entityName][id].update(fields);
    }).filter(Boolean);

    if (transactions.length === 0) continue;

    try {
      await db.transact(transactions);
      restored += transactions.length;
      process.stdout.write(`\r   ${entityName}: ${restored}/${total} records`);
    } catch (err) {
      console.error(`\n   ❌ Failed writing batch to ${entityName}: ${err.message}`);
      throw err;
    }
  }

  process.stdout.write(`\r   ${entityName}: ${restored}/${total} records ✅\n`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔄 HeroSplit Database Restore`);
  console.log(`   App ID:      ${APP_ID}`);
  console.log(`   Backup file: ${backupFile}`);
  if (dryRun)       console.log("   Mode:        DRY RUN (no writes)\n");
  if (onlyEntity)   console.log(`   Scope:       only ${onlyEntity}`);
  if (skipWorkouts) console.log("   Skipping:    workouts (re-seed with seed-instant.mjs)");
  console.log();

  const raw    = fs.readFileSync(backupFile, "utf-8");
  const backup = JSON.parse(raw);

  console.log(`   Backup exported: ${backup.meta?.exportedAt ?? "unknown"}`);
  console.log(`   Backup app ID:   ${backup.meta?.appId ?? "unknown"}`);
  if (backup.meta?.appId && backup.meta.appId !== APP_ID) {
    console.error(`\n⚠️  WARNING: Backup was created from app ${backup.meta.appId} but restoring to ${APP_ID}`);
    console.error("   Proceed only if you intend to migrate data between apps.\n");
  }
  console.log();

  const entities = backup.meta?.entities ?? Object.keys(backup.data ?? {});

  for (const entity of entities) {
    if (onlyEntity && entity !== onlyEntity) continue;
    if (skipWorkouts && entity === "workouts") {
      console.log(`   workouts: skipped (re-seed with node scripts/seed-instant.mjs)`);
      continue;
    }
    const records = backup.data?.[entity];
    if (!records) {
      console.log(`   ${entity}: not in backup`);
      continue;
    }
    if (records.error) {
      console.log(`   ${entity}: ⚠️  backup contained error — ${records.error}`);
      continue;
    }
    await restoreEntity(entity, records);
  }

  console.log(`\n✅ Restore complete${dryRun ? " (dry run — nothing was written)" : ""}\n`);
}

main().catch((err) => {
  console.error("\n❌ Restore failed:", err.message ?? err);
  process.exit(1);
});
