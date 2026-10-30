<p align="center">
  <img src="client/public/logo.webp" alt="HeroSplit" width="120" height="120" style="border-radius:20%">
</p>

<h1 align="center">HeroSplit</h1>

<p align="center">
  <strong>The #1 anime-inspired workout app.</strong><br>
  Train like your favorite hero. Unlock villain-tier intensity.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square" alt="Drizzle ORM">
</p>

---

## Features

- **Hero Workouts** — calisthenics & weight training programs inspired by anime protagonists
- **Villain Intensity** — Pro-tier brutal high-volume splits for max power
- **Stat Tracking** — streaks, heatmaps, and achievement badges
- **Comic-book UI** — dark mode aesthetic with Framer Motion animations
- **Pack-opening onboarding** — discover your workout program like unlocking a card

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Wouter |
| State | TanStack React Query |
| UI | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Supabase Auth (JWT) |
| Build | Vite |

## Getting Started

```bash
npm install
npm run dev          # frontend only (Vite)
npx vercel dev       # frontend + api/ serverless functions
npm run check        # TypeScript
npm test             # API security tests (Vitest)
npm run test:rls     # database RLS tests against a throwaway local Postgres
```

Database: apply `supabase/schema.sql`, then every file in `supabase/migrations/` in order, in the Supabase SQL Editor. See [docs/SECURITY.md](docs/SECURITY.md).

## Environment Variables

See `.env.example`. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` reach the browser. Everything else (`SUPABASE_SERVICE_ROLE_KEY`, Stripe keys, `FRONTEND_URL`) is server-only and must be set per environment in Vercel. Preview deployments must use Stripe **test** keys; the API refuses live keys outside production.

## License

MIT
