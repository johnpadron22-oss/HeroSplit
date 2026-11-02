# HeroSplit — App Store Optimization & SEO Notes

> **Hard rule:** All public-facing copy uses only original, app-safe names.
> Never use original character names (Batman, Spider-Man, Goku, Deku, Naruto, etc.)
> in store listings, screenshots, keywords, or marketing copy.

---

## App Store Metadata (Google Play)

### Title (30 chars max)
```
HeroSplit: Fitness RPG
```
*(22 chars — room to A/B test with "HeroSplit: Hero Workouts")*

### Subtitle / Short Description (80 chars max — Google Play)
```
Train like a hero. Earn XP, rank up, unlock villain workouts.
```
*(61 chars)*

### Long Description (4 000 chars max)

```
TRAIN LIKE A HERO. LEVEL UP FOR REAL.

HeroSplit is the fitness RPG that turns every workout into a quest. Pick a hero-themed program, log your sets, earn XP after every session, and watch your rank climb from F all the way to SSS.

──────────────────────────────────────
FREE TIER — NO CREDIT CARD NEEDED
──────────────────────────────────────
▸ 4 Comics Hero programs (Night Acrobat · Agile Climber · Night Detective · Solar Sentinel)
▸ Progressive overload built-in — double progression for every lift
▸ XP & rank system: F → E → D → C → B → A → S → SS → SSS
▸ Daily streak tracker + loot drops for consistency
▸ Workout history & personal records

──────────────────────────────────────
PRO TIER — UNLOCK EVERYTHING
──────────────────────────────────────
▸ 36 additional programs across three villain & anime-inspired arcs
▸ Full Villain Tier: 12 dark-side programs built around power, strength & intimidation
▸ Anime Arc: 12 programs — energy blasts, speed trials, cursed-energy training, titan strength
▸ Nemesis Series: 6 hypertrophy & push/pull/legs splits
▸ Weekly set & weight logging with progressive load tracking
▸ Priority feature access

──────────────────────────────────────
HOW IT WORKS
──────────────────────────────────────
1. Sign up with your email — no password needed (magic link)
2. Choose your archetype: Dark Vigilante, Void Sorcerer, Iron Warden, Solar Champion …
3. Pick a program matched to your experience level
4. Log each workout — XP lands instantly
5. Hit your streak — loot drops unlock cosmetic rewards
6. When you're ready, go Pro and access the villain side

──────────────────────────────────────
DESIGNED FOR REAL GAINS
──────────────────────────────────────
Every program uses proven hypertrophy principles: progressive overload, RPE guidance, rest intervals, and periodization. No gimmicks — just training structured around the theme you love.

──────────────────────────────────────
PRIVACY & SECURITY
──────────────────────────────────────
▸ No ads, no third-party trackers
▸ Your workout data stays yours — export or delete at any time
▸ Passwordless sign-in — magic link, no password to steal
▸ Stripe-secured payments — we never see your card number

Subscriptions auto-renew monthly ($4.99/mo) or annually ($39.99/yr). Cancel any time from your profile — access continues until the end of the paid period. Terms & Privacy at hero-split.vercel.app.
```

---

## Keywords (Google Play — 100 chars each tag, comma-separated; aim for 30–50 tags)

**Primary cluster — fitness & workout:**
`workout app`, `fitness RPG`, `gym tracker`, `weight training`, `progressive overload`, `workout log`

**Secondary cluster — RPG / gamification:**
`XP fitness`, `level up workout`, `fitness game`, `gamified fitness`, `rank up`, `fitness tracker RPG`

**Long-tail / niche:**
`hero workout`, `anime fitness`, `comic book workout`, `superhero training`, `villain workout`, `anime workout`

**Competitor displacement:**
`fitness app free`, `gym app no subscription`, `workout planner free`, `bodybuilding tracker`

---

## Google Play Categories

1. **Primary:** Health & Fitness
2. **Secondary:** Sports
3. Tags: Workout tracker, Gym, Strength training, Gamification, Progressive overload

---

## Apple App Store Metadata

### Title (30 chars)
```
HeroSplit: Fitness RPG
```

### Subtitle (30 chars)
```
Train. Rank Up. Go Pro.
```
*(23 chars)*

### Keywords field (100 chars — comma-separated, no spaces after commas)
```
workout,fitness RPG,gym tracker,XP,hero,villain,anime,level up,progressive overload,strength
```
*(91 chars)*

### What's New (first release)
```
HeroSplit launches with 40 hero- and anime-inspired workout programs, XP ranks, daily streaks, and loot drops. 4 programs free — no card required.
```

---

## SEO (Web / PWA)

### Current `<title>` tag
`HeroSplit — Train Like Your Favorite Hero`

### Recommended meta description (already set in index.html)
`Anime-inspired fitness RPG. Earn XP, rank up F→SSS, get loot drops. Free to start.`

### Open Graph
- `og:title`: HeroSplit — Train Like Your Favorite Hero
- `og:description`: Anime-inspired fitness RPG. Earn XP, rank up F→SSS, get loot drops. Free to start.
- `og:image`: https://hero-split.vercel.app/screenshot-wide.png  *(1280×720 PNG already in public/)*
- `og:url`: https://hero-split.vercel.app  *(canonical — herosplit.vercel.app is orphaned)*

### Twitter Card
- `twitter:card`: summary_large_image
- `twitter:title`: HeroSplit — Train Like Your Favorite Hero
- `twitter:description`: Anime fitness RPG. XP, streaks, loot drops. 4 free programs.
- `twitter:image`: https://hero-split.vercel.app/screenshot-wide.png

> **TODO (manual):** Update `twitter:card` value from `summary` → `summary_large_image` in index.html for better link previews.

---

## Screenshot Descriptions (for store listing)

1. **Home screen — Hero Workouts** — "4 free hero programs. Pick your archetype, pick your level."
2. **Active workout** — "Log sets and reps. XP drops the second you finish."
3. **Progress tab** — "Rank F→SSS. Daily streak. Total XP. All yours."
4. **Loot drop animation** — "Finish a workout, get a drop. Consistency rewarded."
5. **Pro unlock screen** — "Go villain. 36 programs. One upgrade."

---

## TWA (Trusted Web Activity) Checklist for Play Store

- [x] `manifest.json` present at `/manifest.json`
- [x] `id` field set to `/` (required for TWA identity)
- [x] `scope` field set to `/`
- [x] `start_url` set to `/`
- [x] `display: "standalone"`
- [x] Icons: 192×192 and 512×512 PNG
- [x] Maskable icon: 512×512 (`icon-512-maskable.png`)
- [ ] Digital Asset Links file: `/.well-known/assetlinks.json` — **must be added manually** with your Play Console SHA-256 fingerprint before submitting to the store
- [ ] HTTPS on canonical domain — verify hero-split.vercel.app is serving HTTPS (Vercel does this automatically)

---

## Pre-publish SEO Fixes Applied

| Item | Status |
|------|--------|
| `og:url` corrected to hero-split.vercel.app | ✅ Fixed |
| `og:image` and `twitter:image` added | ✅ Fixed |
| `robots.txt` created | ✅ Fixed |
| `sitemap.xml` created | ✅ Fixed |
| `manifest.json` — added `id`, `scope`, `display_override` | ✅ Fixed |
| `twitter:card` → `summary_large_image` | ⚠️ TODO (low-risk) |
| Digital Asset Links for TWA | ⚠️ Manual step — needs Play Console fingerprint |
