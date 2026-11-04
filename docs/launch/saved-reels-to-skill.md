# Workflow: Saved Reels → HeroSplit Skills

A repeatable process for turning saved fitness/bodyweight reels into workout skill additions or program refinements.

---

## Step 1: Collect

Save any reel that shows:
- A novel exercise variation not in current programs
- A cue that simplifies a movement in an existing program
- A progression sequence (beginner → advanced) for a bodyweight skill
- A structure idea (superset, finisher, challenge) worth testing

Organize saved reels into folders:
- `exercises/` — single movement demonstrations
- `structure/` — program structure or periodization ideas
- `cues/` — verbal or visual coaching cues
- `challenges/` — viral fitness challenges worth adapting

---

## Step 2: Triage (weekly)

Every Monday, go through the saved folder. For each reel, ask:
1. Is this original enough to avoid IP issues? (no branded programs, no verbatim scripts)
2. Does it fit HeroSplit's app-safe naming and tone?
3. Which program would it improve, or does it warrant a new program?

Assign one of:
- **Add**: Include this exercise in an existing program (note which one + where)
- **Adapt**: Use the structure idea but write original exercise descriptions
- **Skip**: Not relevant or too similar to existing content

---

## Step 3: Convert to Exercise Entry

For each "Add" or "Adapt" item, create an entry in this format:

```
Exercise: [App-safe name, no franchise references]
Target: [muscle groups]
Type: [compound | isolation | plyometric | mobility]
Equipment: [none | dumbbells | barbell | cable | resistance band]
Sets/Reps (default): [e.g., 3×12]
Cue: [one sentence that makes the movement click]
Program slot: [which program, which day, which position in workout]
Progression: [easier variation → standard → harder variation]
```

Example:
```
Exercise: Lateral Hinge Press
Target: Shoulders, triceps, lateral delts
Type: compound
Equipment: dumbbells
Sets/Reps: 3×10 each side
Cue: "Lead with your elbow, not your wrist"
Program slot: Night Acrobat — Day 2 (Strength Phase) — position 3
Progression: Seated → standing → single-arm
```

---

## Step 4: Seed the Program Update

Once you have 3+ exercises ready for a program:
1. Open `scripts/seed-supabase.mjs`
2. Find the program's `program.exercises` array
3. Add the new exercise in the slot from Step 3
4. Run `npm run seed` against the staging Supabase project
5. Test the workout flow end-to-end in the app
6. Push to production Supabase after QA sign-off

---

## Step 5: Create Content From the Same Reel

If a saved reel inspired a program change, it's also content:
- Record a "how I adapted this" video (without showing or crediting the original)
- Use the hook structure from `docs/content-plan.md`
- Post with the split's program as the CTA

---

## IP Guardrails

- **Never copy** exercise descriptions verbatim from another creator
- **Never credit** a specific creator's program as an inspiration in public posts
- **Never use** franchise names, character names, or branded program names
- **Always** write original exercise cues in your own words
- If you're unsure, skip the exercise entirely
