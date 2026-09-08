# 21st-design-sync — Sync Figma Designs to Code via 21st.dev

Use this skill when the user wants to **convert a Figma design into React component code** using the 21st.dev design sync pipeline.

## When to Trigger

- User shares a Figma URL and wants it implemented as a React component
- User says "implement this design", "sync from Figma", "turn this mockup into code"
- User wants design tokens (colors, spacing, typography) from Figma applied to the codebase

## Prerequisites

- `API_KEY_21ST` env var must be set
- Figma access: the user must share a public Figma link, or the Figma MCP server must be available with their credentials

## Workflow

### 1. Get the Figma design context

If the Figma MCP server is available:
```
Use Figma MCP → get_design_context with the Figma URL
```

Otherwise, ask the user to share:
- A screenshot of the design
- A brief description of each section/component

### 2. Map to existing components

Before generating new code, check if registry components already match parts of the design:
```
Use 21st-magic MCP → search_components with description of each UI section
```

Install matching registry components via the `21st-cli-use` skill.

### 3. Generate custom sections

For sections with no registry match:
```
Use 21st-magic MCP → generate_component with:
  - A detailed description derived from the Figma context
  - The relevant design tokens (colors, spacing, typography) from the design
  - framework: "react", styling: "tailwindcss", typescript: true
```

### 4. Apply design tokens

Map Figma colors/typography to the project's Tailwind CSS variables in `client/src/index.css`:

```css
/* Example: map a Figma brand color to a CSS variable */
:root {
  --brand: <hex-from-figma>;
}
```

Then reference as `bg-[hsl(var(--brand))]` in Tailwind classes, or extend `tailwind.config.ts`.

### 5. Compose the page/section

Assemble installed and generated components into the target page/layout file.

### 6. Validate

```bash
npm run check   # TypeScript
```
Review in the browser via `npm run dev`.

## Design Token Conventions (this project)

| Purpose        | CSS Variable           | Tailwind class         |
|----------------|------------------------|------------------------|
| Background     | `--background`         | `bg-background`        |
| Foreground     | `--foreground`         | `text-foreground`      |
| Primary action | `--primary`            | `bg-primary`           |
| Muted text     | `--muted-foreground`   | `text-muted-foreground`|
| Border         | `--border`             | `border-border`        |
| Card surface   | `--card`               | `bg-card`              |

Always prefer these semantic variables over hardcoded Tailwind color classes.
