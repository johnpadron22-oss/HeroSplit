# HeroSplit — Project Knowledge Base

HeroSplit is a superhero-themed fitness app. Users browse hero and villain workout programs, track progress through workout logs, earn achievements, and unlock Pro features for villain workouts. The app has a comic-book aesthetic with a pack-opening onboarding flow.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Wouter (routing), built with Vite |
| State | TanStack React Query (server state) |
| UI | Tailwind CSS + shadcn/ui (Radix UI, New York style) |
| Animations | Framer Motion |
| Data | Supabase Postgres, queried from the browser with supabase-js under RLS |
| Server code | Vercel serverless functions in `api/` (Stripe + account deletion only) |
| Auth | Supabase Auth (Google OAuth, PKCE) |
| Payments | Stripe Checkout + Billing Portal + webhook |

## Directory Structure

```
client/src/
  pages/          — Route-level page components (Landing, Home, WorkoutView, Privacy, Terms)
  components/     — Shared UI components
    ui/           — shadcn/ui primitives — do NOT modify these directly
  hooks/          — useAuth, useWorkouts (all Supabase queries + API calls), etc.
  lib/            — supabase client, queryClient, utils (cn())

api/              — Vercel functions (each non-underscore file is a public route)
  _lib/           — auth (JWT verify), http (CORS, zod parsing, safe errors), rateLimit, deps
supabase/
  schema.sql      — base tables
  migrations/     — security hardening (RLS, grants, triggers) — apply in order
  tests/          — RLS test suite (anon / user A / user B / Pro / service_role)
tests/api/        — Vitest tests for api/ routes
```

## Security Rules (do not regress)

- Every table has RLS. API roles get explicit column grants, never `ALL`. See `docs/SECURITY.md`.
- Never send `user_id` from the browser; the database sets it from `auth.uid()`.
- Profile stats (XP, streaks, totals) are computed by a DB trigger — never written by the client.
- Pro gating is `user_subscriptions` (written only by the Stripe webhook). Pro workout programs are only returned by `get_workout()`.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (`api/`). Only `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` may reach the browser.
- API routes: `requireUser()` first, strict zod body, rate limit, `sendError()` for every failure.
- Never disable RLS, widen grants, or use CORS `*` to fix an error — fix the policy/grant instead.

## Core Patterns

### Adding a new API endpoint
1. Create `api/my-route.ts` using `applyCors`, `requireMethod`, `enforceRateLimit`, `requireUser`, `parseBody` (strict zod) and `sendError` from `api/_lib/`
2. Add tests in `tests/api/`
3. Call it from a hook with the Bearer token (see `callApi` in `client/src/hooks/use-workouts.ts`)

### Adding a new page
1. Create `client/src/pages/MyPage.tsx`
2. Register the route in `client/src/App.tsx` using Wouter `<Route>`
3. Use `useAuth()` for auth guards (UI only — the database enforces access)

### Adding a database table
1. Add a new file in `supabase/migrations/` that creates the table, enables RLS, adds own-row policies and explicit grants
2. Add cases to `supabase/tests/rls_test.sql`, run `npm run test:rls`

## Database Schema

| Table | Client access |
|-------|---------------|
| `workouts` | read catalog columns; `program` only via `get_workout(slug)` |
| `workout_logs` | read/insert/delete own; insert validated + max 30/day |
| `achievements` | read own |
| `feedback` | read/insert own; max 5/hour |
| `user_profiles` | read own; insert/update only path, archetype, alias, experience_level |
| `user_subscriptions` | read own (written only by Stripe webhook) |

## API Routes

```
POST /api/create-checkout     { plan: "monthly" | "annual" }   (auth)
POST /api/customer-portal     {}                               (auth)
POST /api/delete-account      { confirm: "DELETE MY ACCOUNT" } (auth)
POST /api/stripe-webhook      Stripe-signed events only
```

## Development Commands

```bash
npm run dev          # Vite dev server (frontend); `npx vercel dev` to include api/
npm run check        # TypeScript type check (run this before shipping)
npm test             # API security tests
npm run test:rls     # RLS tests on a throwaway local Postgres
npm run build        # Production build
```

## Design System

- **Theme:** Comic-book / superhero aesthetic, dark mode primary
- **Components:** 40+ shadcn/ui primitives in `client/src/components/ui/` — use these first
- **Colors:** CSS variables defined in `tailwind.config.ts` — never hardcode hex values
- **Icons:** `lucide-react` — use `lucide-react` icons only
- **Animations:** Framer Motion for transitions; `tw-animate-css` for Tailwind animations
- **Responsive:** Mobile-first; use `useMobile()` hook for breakpoint logic

## Coding Conventions

- All files are TypeScript with strict mode — no `any`
- Validate all external data with Zod
- Access control lives in the database (RLS + grants) and `api/_lib`, never only in the UI
- Use React Query for server state — avoid `useState` for data that comes from the API
- Use `cn()` from `client/src/lib/utils.ts` for conditional class names
- Never modify files in `components/ui/` — extend via composition

## Virtual Engineering Team — Slash Commands

```
/plan-ceo-review [idea]   →  CEO writes a product spec
/design [spec]            →  Designer plans the UI and component structure
/architect [plan]         →  Architect writes a technical implementation plan
/build [plan]             →  Engineer implements the feature end-to-end
/qa [url]                 →  QA runs browser tests and reports bugs
/ship                     →  Release manager opens the PR and checks deployment
```

Each agent is designed to hand off to the next. Run them in sequence for a full feature cycle.

## SPARC Methodology — Slash Commands

```
/sparc [objective]            →  SPARC orchestrator: spec → architect → code → test → ship
/sparc-architect [spec]       →  System design: DB schema, API contracts, file map
/sparc-code [plan]            →  Auto-coder: implements from architectural plan
/sparc-tdd [feature]          →  TDD: writes failing tests, then minimal implementation
/sparc-debug [bug]            →  Debugger: root-cause analysis and fix
/sparc-security-review [scope]→  Security audit: OWASP, secrets, auth, RLS
/sparc-supabase-admin [task]  →  Supabase: migrations, RLS policies, auth config
/sparc-docs [what]            →  Documentation: API docs, ADRs, onboarding
/sparc-optimizer [target]     →  Performance: queries, bundle size, renders
```

SPARC follows: **S**pecification → **P**seudocode → **A**rchitecture → **R**efinement → **C**ompletion

## Agent Definitions

Five specialized agents are defined in `.claude/agents/`:
- `architect.yaml` — system design, API design, documentation
- `coder.yaml` — code generation, refactoring, debugging
- `reviewer.yaml` — code review, quality analysis, best practices
- `security-architect.yaml` — threat modeling, vulnerability analysis
- `tester.yaml` — unit testing, integration testing, coverage

## Concurrency Rules (from Ruflo)

- **One message = all related operations.** Batch all independent reads, writes, and tool calls in a single message.
- **Parallel by default.** Never serialize operations that have no dependencies between them.
- **No status polling.** After spawning background work, wait for results — don't loop-check.
- **Files under 500 lines.** Split into focused modules if a file grows larger.

## Behavioral Rules (Always Enforced)

- Do exactly what was asked — nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER commit `.env` files or credentials
- NEVER hard-code API keys — always use environment variables
- ALWAYS read a file before editing it
