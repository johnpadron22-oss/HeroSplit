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
| Build | Vite + esbuild |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (requires PostgreSQL running)
npm run dev

# Type check
npm run check

# Push schema to database
npm run db:push
```

The dev server starts on `http://localhost:5000`.

## Environment Variables

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## License

MIT
