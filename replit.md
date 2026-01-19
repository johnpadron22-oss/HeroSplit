# HeroSplit - Fitness Workout Application

## Overview

HeroSplit is a fitness workout application that provides hero and villain-themed workout programs. Users can browse character-based workout routines, track their progress, log completed workouts, and earn achievements. The app features a freemium model where "Hero" workouts are free while "Villain" workouts require a Pro subscription.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and workout card animations
- **Charts**: Recharts for progress visualization
- **Build Tool**: Vite with custom path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod schema validation
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: shared/schema.ts contains all table definitions
- **Key Tables**:
  - `users` and `sessions` (Replit Auth - mandatory)
  - `workouts` (hero/villain workout programs with JSON program data)
  - `workout_logs` (user workout history for streaks)
  - `achievements` (unlockable user achievements)
  - `user_settings` (Pro status, streak tracking)

### Authentication Flow
- Uses Replit's OpenID Connect provider
- Session-based authentication with 7-day expiry
- Protected routes check authentication via `isAuthenticated` middleware
- User data synchronized on login via upsert pattern

### Build System
- Development: tsx for TypeScript execution with Vite dev server
- Production: esbuild bundles server code, Vite builds client to dist/public
- Server dependencies are selectively bundled to reduce cold start times

## External Dependencies

### Database
- PostgreSQL (provisioned via Replit, connection via DATABASE_URL)
- Drizzle Kit for migrations (`npm run db:push`)

### Authentication
- Replit Auth (OIDC provider at replit.com/oidc)
- Requires REPL_ID, SESSION_SECRET, and ISSUER_URL environment variables

### UI Framework
- shadcn/ui components (Radix UI primitives)
- Tailwind CSS with custom CSS variables for theming
- Custom fonts: Outfit (display), Inter (body)

### Third-Party Libraries
- canvas-confetti for workout completion celebrations
- date-fns for date formatting and streak calculations
- recharts for progress visualization
- framer-motion for animations