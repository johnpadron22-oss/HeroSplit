# HeroSplit Security

How access control works, how to apply and verify it, and the dashboard settings code cannot change.

## Architecture in one paragraph

The browser talks to Supabase directly with the public anon key, so **the database is the security boundary**: every table has RLS, the API roles get explicit column-level grants (never `ALL`), ownership is set from `auth.uid()` by triggers, and profile stats are computed by the database. The four Vercel functions in `api/` are the only code that holds `SUPABASE_SERVICE_ROLE_KEY`; each verifies the caller's JWT with Supabase Auth, validates a strict zod body, rate-limits, and scopes every query to the verified user id.

## Applying the database changes

1. Run `supabase/discovery.sql` in **SQL Editor** and save the output (your "before" snapshot).
2. On a **staging** project first: run `supabase/schema.sql` (if it's a fresh project), then each file in `supabase/migrations/` in name order.
3. Still on staging, run `supabase/tests/rls_test.sql`. It ends with `ALL RLS TESTS PASSED` or raises an error naming the failure count; it rolls back, so it leaves no data.
4. Deploy the app code to a preview pointing at staging and click through: sign in, onboarding, log a workout, open a Pro workout as a free user (locked), feedback, upgrade with a Stripe test card, Manage billing, Delete account.
5. Apply the same migration files to production. They are idempotent and delete no rows.
6. Re-run `supabase/discovery.sql` and compare with step 1.

The app code and the migration must ship together: the new client selects explicit workout columns and calls `get_workout()`, and no longer writes stats.

## SECURITY DEFINER functions (and why)

| Function | Why it needs definer rights | Guard inside |
|---|---|---|
| `public.get_workout(slug)` | `authenticated` has no SELECT on `workouts.program` (paid content) | Requires `auth.uid()`; returns `program` only if the workout is free or the caller's `user_subscriptions.is_pro` is true |
| `private.refresh_profile_stats()` (trigger) | `authenticated` cannot UPDATE stats columns | Fires only for a `workout_logs` row that already passed RLS; updates only that row owner's profile |

Both set `search_path = ''`. Every other function is `SECURITY INVOKER`. `hit_rate_limit` and `delete_user_data` are executable by `service_role` only.

## Manual steps (Supabase dashboard)

- **Rotate keys if they were ever shared**: Settings → API Keys → roll the secret/service-role key, then update `SUPABASE_SERVICE_ROLE_KEY` in Vercel and redeploy.
- **Authentication → Providers → Email**: if you only use Google sign-in, disable the Email provider. If you keep it: enable *Confirm email*, minimum password length 10+, require lowercase/uppercase/digits/symbols, and enable *Leaked password protection*.
- **Authentication → URL Configuration**: Site URL = your production domain; Redirect URLs = production domain plus your staging domain only (no wildcards across all `*.vercel.app`).
- **Authentication → Rate Limits**: keep sign-in/sign-up/OTP/token-refresh limits at defaults or lower; enable CAPTCHA (Attack Protection) if you add email sign-up.
- **Authentication → Sessions / JWT**: access-token expiry 3600s or less; enable *Detect and revoke potentially compromised refresh tokens*; set inactivity timeout (e.g. 30 days) if your plan supports it.
- **Database → Backups**: confirm daily backups are listed; enable Point-in-Time Recovery (Pro plan add-on) for production.
- **Storage**: confirm no bucket is public (the migration flips any public bucket to private; the app uploads nothing).
- **Advisors → Security Advisor**: run it after migrating and resolve anything it flags.

## Manual steps (Vercel dashboard)

- Settings → Environment Variables: set every server variable **separately** for Production and for Preview/Development. Preview gets a staging Supabase project and `sk_test_` Stripe keys; the API refuses `sk_live_` outside production.
- Settings → Deployment Protection: enable **Vercel Authentication** (or password protection) for Preview deployments.
- `FRONTEND_URL` must be the exact production origin (used for CORS and Stripe redirects).

## Manual steps (Stripe dashboard)

- Webhook endpoint `https://<domain>/api/stripe-webhook` with events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; put its signing secret in `STRIPE_WEBHOOK_SECRET`.
- Customer portal: enable cancellation and invoice history.

## Restoring a backup (to staging only)

1. Create or reset a **staging** Supabase project; apply `schema.sql` and all migrations.
2. Either restore a dashboard backup into it (Database → Backups → Restore to new project), or run
   `SUPABASE_URL=<staging> SUPABASE_SERVICE_ROLE_KEY=<staging key> node scripts/restore-db.mjs backups/<file>.json --dry-run`, then without `--dry-run`.
3. Run `supabase/tests/rls_test.sql` on staging and spot-check data. Never test a restore against production.

Backups written by `scripts/backup-db.mjs` contain personal data: they are gitignored (`backups/`); store them encrypted and delete old ones.

## Verifying locally

```bash
npm run check      # types
npm test           # API: 401/403/405/415/400/409/429, CORS, webhook signatures, error scrubbing, deletion
npm run test:rls   # DB: anon, user A, user B, Pro user, service_role — needs local Postgres
```

## Known limitations

- **Session tokens live in browser storage**, not httpOnly cookies: the app is a single-page app that queries Supabase directly, which requires the token in JavaScript. Mitigations: strict CSP (`script-src 'self'`, no inline scripts), PKCE, short access-token expiry, refresh-token rotation. Moving to httpOnly cookies means routing every data call through server functions.
- In-app purchases: Apple/Google rules for selling digital subscriptions inside native apps (e.g. via Median.co) are separate from this document.
