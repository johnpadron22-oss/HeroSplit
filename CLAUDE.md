# HeroSplit — Project Knowledge Base

HeroSplit is a superhero-themed fitness app. Users browse hero and villain workout programs, track progress through workout logs, earn achievements, and unlock Pro features for villain workouts. The app has a comic-book aesthetic with a pack-opening onboarding flow.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Wouter (routing) |
| State | TanStack React Query (server state) |
| UI | Tailwind CSS + shadcn/ui (Radix UI, New York style) |
| Animations | Framer Motion |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Replit Auth (OpenID Connect) + Passport.js |
| Build | Vite (client) + esbuild (server) |

## Directory Structure

```
client/src/
  pages/          — Route-level page components (Landing, Home, WorkoutView)
  components/     — Shared UI components
    ui/           — shadcn/ui primitives — do NOT modify these directly
  hooks/          — Custom React hooks (useAuth, useWorkouts, useMobile, etc.)
  lib/            — queryClient, utils (cn()), auth-utils

server/
  index.ts        — Express app entry point + middleware
  routes.ts       — All API route handlers
  storage.ts      — All database queries (single data access layer)
  db.ts           — Drizzle ORM connection
  vite.ts         — Dev server integration

shared/
  schema.ts       — Drizzle table definitions + inferred TS types
  routes.ts       — Zod schemas for all API request/response shapes
```

## Core Patterns

### Adding a new API endpoint (full-stack example)
1. Define Zod schemas in `shared/routes.ts`
2. Add a storage method in `server/storage.ts` using Drizzle
3. Register the Express route in `server/routes.ts`
4. Call from the client with React Query + a custom hook in `client/src/hooks/`

### Adding a new page
1. Create `client/src/pages/MyPage.tsx`
2. Register the route in `client/src/main.tsx` using Wouter `<Route>`
3. Use `useAuth()` for auth guards

### Adding a database table
1. Define the table in `shared/schema.ts` using `pgTable`
2. Run `npm run db:push` to sync the schema

## Database Schema

| Table | Key Columns |
|-------|------------|
| `users` | id, username, email, profileImageUrl, createdAt |
| `sessions` | Managed by Replit Auth — do not touch |
| `workouts` | id, slug, name, type (hero/villain/custom), difficulty, isPro, program (JSON), equipment (JSON) |
| `workout_logs` | id, userId, workoutName, date, duration, exercises (JSON), completedAt |
| `achievements` | id, userId, achievementId, unlockedAt |
| `user_settings` | userId, isPro, currentStreak, longestStreak, totalWorkouts |

## API Routes

```
GET  /api/workouts              List workouts (optional ?type= filter)
GET  /api/workouts/:slug        Get a specific workout
POST /api/workouts              Create workout (admin/seed)
GET  /api/logs                  User workout logs (auth required)
POST /api/logs                  Log a completed workout (auth required)
GET  /api/user/progress         User stats + achievements (auth required)
POST /api/user/pro              Toggle Pro status (auth required)
```

## Development Commands

```bash
npm run dev          # Start full-stack dev server on port 5000
npm run check        # TypeScript type check (run this before shipping)
npm run db:push      # Push schema changes to the database
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
- Business logic lives in `server/storage.ts`, not in route handlers
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
