# 21st-ai — Generate UI Components with Magic AI

Use this skill when the user wants to **generate a new UI component** using 21st.dev's Magic AI, or when no existing component in the registry matches the need.

## When to Trigger

- User says "generate", "create", or "build" a component with AI
- No existing registry component fits the requirement
- User wants a custom variant of an existing component
- User describes a UI pattern from scratch (e.g. "a hero section with animated text")

## Project Context

This repo (HeroSplit) is a React + TypeScript SPA built with Vite, shadcn/ui (new-york), and Tailwind CSS. Components live in `client/src/components/ui/` and pages in `client/src/`.

## Workflow

### 1. Clarify the component spec

Before generating, confirm:
- **What does it do?** (behavior, state, interactivity)
- **Where will it be used?** (which page or layout)
- **What does it look like?** (layout, colors, animation — use the project's `neutral` base color and CSS variable tokens)

### 2. Generate via MCP

```
Use the 21st-magic MCP → generate_component tool with:
  - description: detailed natural-language spec
  - framework: "react"
  - styling: "tailwindcss"
  - typescript: true
  - style: "new-york"
```

### 3. Review and save

- Review the generated code for correctness.
- Save to `client/src/components/ui/<component-name>.tsx` (kebab-case filename).
- Add any required imports (`cn`, Radix primitives, hooks).

### 4. Wire it up

Import and use the new component in the target page.

## Code Standards for Generated Components

```tsx
// ✅ Use cn() for conditional classes
import { cn } from "@/lib/utils"

// ✅ Use CSS variable tokens (not hardcoded colors)
className="bg-background text-foreground"

// ✅ Forward refs where applicable
const Component = React.forwardRef<HTMLDivElement, Props>(...)

// ✅ Export named + default
export { Component }
export default Component
```

## Notes

- Keep generated components composable and stateless where possible — lift state to parent.
- For animated components, prefer `tailwindcss-animate` (already in the project) over framer-motion unless the animation is complex.
- Run `npm run check` after adding a component to catch TypeScript errors early.
