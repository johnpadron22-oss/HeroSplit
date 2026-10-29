#!/usr/bin/env node
/**
 * HeroSplit Database Backup Script (Supabase)
 *
 * Exports all data from Supabase using the service role key and writes it to
 * a timestamped JSON file in the ./backups/ directory.
 *
 * Usage:
 *   node scripts/backup-db.mjs
 *
 * Required env vars (can be in .env or set directly):
 *   SUPABASE_URL              — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS)
 *
 * Output:
 *   backups/herosplit-backup-YYYY-MM-DDTHH-mm-ss.json
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Config ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, "..", "backups");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) { console.error("❌ SUPABASE_URL is required"); process.exit(1); }
if (!SERVICE_KEY)  { console.error("❌ SUPABASE_SERVICE_ROLE_KEY is required"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Tables to export ───────────────────────────────────────────────────────────

// workouts are seeded from scripts/seed-supabase.mjs and can be re-seeded
// rather than restored from backup. They're included here for completeness.
const TABLES = [
  "user_subscriptions",
  "user_profiles",
  "workout_logs",
  "achievements",
  "feedback",
  "workouts",
];

// ── Export ─────────────────────────────────────────────────────────────────────

async function exportTable(table) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data ?? [];
}

async function main() {
  console.log("\n🗄️  HeroSplit Database Backup (Supabase)");
  console.log(`   URL:    ${SUPABASE_URL}`);
  console.log(`   Tables: ${TABLES.join(", ")}\n`);

  const backup = {
    meta: {
      exportedAt: new Date().toISOString(),
      supabaseUrl: SUPABASE_URL,
      tables: TABLES,
    },
    data: {},
  };

  for (const table of TABLES) {
    process.stdout.write(`   Exporting ${table}...`);
    try {
      const rows = await exportTable(table);
      backup.data[table] = rows;
      console.log(` ✅ ${rows.length} records`);
    } catch (err) {
      console.log(` ❌ Failed: ${err.message}`);
      backup.data[table] = { error: err.message };
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
