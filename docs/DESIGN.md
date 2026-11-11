# HeroSplit Design System

> **Lock version 1.0.0** — changes to this file require a design review.  
> App mood: *Dark-energy comic book. High contrast, electric accents, earned celebration.*

---

## Palette

All colors are CSS custom properties defined in `client/src/index.css`.  
Never hardcode hex values in component code — always use the token names below.

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 224 71% 4% | Page background, deepest layer |
| `--foreground` | 213 31% 91% | Primary body text |
| `--card` | 224 71% 6% | Card / surface above background |
| `--card-foreground` | 213 31% 91% | Text on cards |
| `--muted` | 223 47% 11% | Subtle backgrounds, dividers |
| `--muted-foreground` | 215 16% 57% | Secondary / placeholder text |
| `--border` | 216 34% 17% | Borders, outlines |
| `--hero` | 190 90% 50% | Hero/cyan accent (free tier, CTAs) |
| `--villain` | 280 80% 60% | Villain/purple accent (Pro tier) |
| `--gold` | 45 90% 60% | Achievements, XP, streaks |
| `--destructive` | 0 63% 31% | Error states, danger actions |

### Minimum contrast ratios (WCAG AA)
- Body text on `--background`: ≥ 4.5 : 1 ✅
- `--hero` on `--background`: verified at ~5.2 : 1 ✅
- `--villain` on `--background`: verified at ~4.8 : 1 ✅
- Muted foreground on background: 3.1 : 1 (acceptable for decorative/secondary text)

### Never use
- Raw hex values in components (use CSS variables)
- `amber-500` for the hero accent (use `--hero`)
- Fully opaque white/black overlays (use `white/5`, `white/10` etc.)

---

## Typography

| Role | Variable | Fallback | Weight |
|------|----------|----------|--------|
| Display / headings | `--font-display` (Outfit) | sans-serif | 700–900 |
| Body copy | `--font-body` (Inter) | sans-serif | 400–600 |

### Scale
Use Tailwind text scale — do NOT introduce custom font-size values.

| Class | Rem | Use |
|-------|-----|-----|
| `text-xs` | 0.75 | Labels, metadata, badges |
| `text-sm` | 0.875 | Secondary body, card descriptions |
| `text-base` | 1 | Primary body copy |
| `text-lg` | 1.125 | Section headings |
| `text-xl` | 1.25 | Card titles, minor headings |
| `text-2xl` | 1.5 | Tab headings |
| `text-3xl+` | 1.875+ | Hero headlines only |

### Rules
- Apply `font-display` (Outfit) to `h1`–`h6` via CSS base layer. ✅ Already configured.
- Apply `text-wrap: balance` to any heading with 2 or fewer lines to prevent orphaned last words. Use `.text-balance` utility.
- Apply `font-variant-numeric: tabular-nums` to numbers that change (stats, timers, XP, weights). Use `.tabular-nums` utility.
- Numbers in stat tiles: `font-display font-bold` with `tabular-nums` applied.

---

## Spacing Scale

Use Tailwind's default scale (multiples of 4px). Prefer named spacings:
- `gap-2` (8px) — tight inline gaps (badge row, icon+text)
- `gap-3` (12px) — card internal gaps
- `gap-4` (16px) — standard content gaps
- `gap-6` (24px) — section gaps within a card
- `gap-8` (32px) — major section separators

Page horizontal padding: `px-4` on mobile, `px-4` with `max-w-5xl mx-auto` container.

---

## Corner Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 2px | Tiny badges, tags |
| `rounded-md` | 6px | Inputs, small buttons |
| `rounded-lg` | 8px | Most cards, standard buttons |
| `rounded-xl` | 12px | Workout log rows, expanded sections, inner tiles |
| `rounded-2xl` | 16px | Cards with headers, dialogs |
| `rounded-3xl` | 24px | Large summary/completion cards |
| `rounded-full` | 9999px | Pills, avatars, circular buttons |

**Rule:** Cards use `rounded-2xl`. Large summary cards use `rounded-3xl`. Dialogs use `rounded-2xl`. Badges use `rounded-full` or `rounded-sm`. Never mix arbitrarily.

### Concentric Corners
When an element is nested inside a padded container, the inner radius must shrink to maintain visual harmony:

```
inner_radius ≈ outer_radius − container_padding
```

| Outer | Padding | Inner |
|-------|---------|-------|
| `rounded-3xl` (24px) | `p-5` (20px) | `rounded-xl` (12px) |
| `rounded-2xl` (16px) | `p-4–p-6` | `rounded-xl` (12px) |
| `rounded-xl` (12px) | `p-3` | `rounded-lg` (8px) |

Never use `rounded-2xl` or larger inside a `rounded-3xl` container. Never use `rounded-xl` inside a `rounded-xl` container.

---

## Shadows

Use Tailwind shadow utilities. Never invent custom box-shadow values.

| Utility | Use |
|---------|-----|
| `shadow-lg` | Elevated cards |
| `shadow-cyan-900/10` | Hero card glow (subtle) |
| `shadow-purple-900/20` | Villain card glow (hover) |

Avoid heavy box shadows — the dark background renders them nearly invisible. Use border + glow instead.

---

## Buttons

| Variant | Style | Use |
|---------|-------|-----|
| Primary (default) | `bg-primary text-primary-foreground` | Main CTA |
| Hero CTA | `bg-cyan-600 hover:bg-cyan-500 text-black` | Start workout (free) |
| Villain CTA | `bg-purple-600 hover:bg-purple-500 text-white` | Start workout (Pro) |
| Outline | `border border-white/20 hover:bg-white/10` | Secondary actions |
| Ghost | `hover:bg-white/5` | Tertiary, icon-only buttons |
| Destructive | `bg-destructive text-destructive-foreground` | Delete, remove |
| Upgrade | `bg-white text-black hover:bg-gray-100` | Paywall unlock |

### Sizing rules
- Minimum touch target: `min-h-[44px] min-w-[44px]` on all tappable elements (critical for gym use — sweaty fingers, shaking hands).
- Icon-only buttons: add `size-11` (44px × 44px) even if the icon is 20px. Use `size="icon"` with `className="size-11"`.
- Primary CTAs in workout view: use `h-13` (52px) for extra tap confidence during a workout.

---

## Cards

Standard workout card: `rounded-2xl border bg-card shadow-lg flex flex-col`.  
Accent border: `border-cyan-500/20` (hero) or `border-purple-500/20` (villain).  
Never use a plain gray border on accent cards.

**Skeleton state:** Use `Skeleton` component (gray pulsing shape) — never a spinner — for content loading inside a card.

---

## Loading, Empty, Error, Success States

| State | Pattern |
|-------|---------|
| Loading | `Skeleton` shapes matching the eventual content (never `Loader2` spinner for in-page content) |
| Empty | Emoji + headline + 1-line description + single CTA button |
| Error | Destructive-styled inline notice + retry action |
| Success | Toast notification; for major completions (workout done) use confetti + trophy animation |

---

## Animations

Rule of thumb: **~0.2s** for micro-interactions (hover, focus), **~0.3–0.5s** for content entrance, **~0.8–1.2s** for celebration animations.

| Situation | Approach |
|-----------|---------|
| Card hover lift | `whileHover={{ y: -4 }}` (Framer Motion, 0.3s) |
| Page tab content | `animate-in fade-in slide-in-from-bottom-4 duration-500` |
| Number/stat counting | `spring` transition, `stiffness: 100, damping: 20` |
| Workout completion | Confetti burst + LootDrop screen — **one time only** |
| Modal entrance | Radix built-in (`data-[state=open]:animate-in`, 200ms) |

### Reduced-motion
All Framer Motion animations must respect `useReducedMotion()`.  
CSS animations must be wrapped in `@media (prefers-reduced-motion: no-preference)`.  
See `client/src/index.css` `.reduce-motion` section.

---

## Brand Do's and Don'ts

| ✅ Do | ❌ Don't |
|-------|---------|
| Use comic-book energy (bold font, tight tracking) | Add emojis in production copy without intent |
| Celebrate PRs and completions with animation | Animate every micro-interaction (fatigue) |
| Use dark background as default; no light mode | Add a light mode toggle |
| Keep Pro accents purple; free accents cyan | Mix accent colors within a single card |
| Screen reader labels on all icon-only buttons | Rely on placeholder text as a label |

---

## Accessibility Checklist (ship-gate)
- [ ] All interactive elements have `aria-label` or visible text
- [ ] All icon buttons meet 44px tap target
- [ ] Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text
- [ ] `prefers-reduced-motion` respected in all CSS/Framer animations
- [ ] Focus rings visible on keyboard navigation
- [ ] Safe-area insets applied for notch/home-bar clearance on iOS/Android

---

## File Structure Conventions

```
client/src/
  index.css                 — All CSS variables, base layer, utility layer
  components/
    WorkoutCard.tsx          — Uses design tokens; no hardcoded colors
    WorkoutCardSkeleton.tsx  — Skeleton version for loading state
    CommandMenu.tsx          — Cmd/Ctrl+K command palette
  pages/
    Home.tsx                 — Tab-based shell; delegates to child components
```

Do NOT modify `components/ui/*` directly. Extend via composition.
