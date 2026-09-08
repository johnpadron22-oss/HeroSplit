#!/usr/bin/env node
/**
 * HeroSplit Database Restore Script (Supabase)
 *
 * Restores data from a backup JSON file created by scripts/backup-db.mjs.
 * Uses the Supabase service role key (bypasses all RLS policies).
 *
 * Usage:
 *   node scripts/restore-db.mjs <backup-file>
 *   node scripts/restore-db.mjs backups/herosplit-backup-2026-09-08T12-00-00.json
 *
 * Options:
 *   --table=user_profiles    Only restore a specific table
 *   --skip-workouts          Skip restoring the workouts table (re-seed instead)
 *   --dry-run                Print what would be done without writing
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * ⚠️  WARNING: This script uses UPSERT (insert or update by primary key).
 * It does NOT delete records that exist in the database but not in the backup.
 * For a clean restore, truncate tables in the Supabase SQL editor first.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// ── Config ─────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) { console.error("❌ SUPABASE_URL is required"); process.exit(1); }
if (!SERVICE_KEY)  { console.error("❌ SUPABASE_SERVICE_ROLE_KEY is required"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Arg parsing ────────────────────────────────────────────────────────────────

const args        = process.argv.slice(2);
const backupFile  = args.find((a) => !a.startsWith("--"));
const onlyTable   = args.find((a) => a.startsWith("--table="))?.split("=")[1];
const skipWorkouts = args.includes("--skip-workouts");
const dryRun      = args.includes("--dry-run");

if (!backupFile) {
  console.error("Usage: node scripts/restore-db.mjs <backup-file> [--table=name] [--skip-workouts] [--dry-run]");
  process.exit(1);
}

if (!fs.existsSync(backupFile)) {
  console.error(`❌ Backup file not found: ${backupFile}`);
  process.exit(1);
}

// ── Restore logic ──────────────────────────────────────────────────────────────

const BATCH_SIZE = 100; // Supabase handles larger batches than InstantDB

async function restoreTable(tableName, records) {
  if (!Array.isArray(records) || records.length === 0) {
    console.log(`   ${tableName}: no records to restore`);
    return;
  }

  const total  = records.length;
  let restored = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    if (dryRun) {
      console.log(`   [dry-run] Would upsert ${batch.length} ${tableName} records (batch ${Math.floor(i/BATCH_SIZE)+1})`);
      restored += batch.length;
      continue;
    }

    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`\n   ❌ Failed writing batch to ${tableName}: ${error.message}`);
      throw error;
    }

    restored += batch.length;
    process.stdout.write(`\r   ${tableName}: ${restored}/${total} records`);
  }

  process.stdout.write(`\r   ${tableName}: ${restored}/${total} records ✅\n`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔄 HeroSplit Database Restore (Supabase)`);
  console.log(`   URL:         ${SUPABASE_URL}`);
  console.log(`   Backup file: ${backupFile}`);
  if (dryRun)       console.log("   Mode:        DRY RUN (no writes)\n");
  if (onlyTable)    console.log(`   Scope:       only ${onlyTable}`);
  if (skipWorkouts) console.log("   Skipping:    workouts (re-seed with seed-supabase.mjs)");
  console.log();

  const raw    = fs.readFileSync(backupFile, "utf-8");
  const backup = JSON.parse(raw);

  console.log(`   Backup exported: ${backup.meta?.exportedAt ?? "unknown"}`);
  console.log(`   Backup URL:      ${backup.meta?.supabaseUrl ?? backup.meta?.appId ?? "unknown"}`);
  console.log();

  const tables = backup.meta?.tables ?? backup.meta?.entities ?? Object.keys(backup.data ?? {});

  for (const table of tables) {
    if (onlyTable && table !== onlyTable) continue;
    if (skipWorkouts && table === "workouts") {
      console.log(`   workouts: skipped (re-seed with node scripts/seed-supabase.mjs)`);
      continue;
    }
    const records = backup.data?.[table];
    if (!records) {
      console.log(`   ${table}: not in backup`);
      continue;
    }
    if (records.error) {
      console.log(`   ${table}: ⚠️  backup contained error — ${records.error}`);
      continue;
    }
    await restoreTable(table, records);
  }

  console.log(`\n✅ Restore complete${dryRun ? " (dry run — nothing was written)" : ""}\n`);
}

main().catch((err) => {
  console.error("\n❌ Restore failed:", err.message ?? err);
  process.exit(1);
});
