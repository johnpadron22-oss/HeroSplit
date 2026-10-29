// ── InstantDB → Supabase migration shim ──────────────────────────────────────
// This file is intentionally left minimal. All data access now goes through
// @/lib/supabase (client) or the service role key (server/API routes).
// Remove this file once all component imports of "@/lib/db" have been updated.

export {};
