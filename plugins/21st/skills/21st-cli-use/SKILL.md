# 21st-cli-use — Install Components via CLI

Use this skill whenever the user wants to **add or install a UI component** from the 21st.dev registry into the codebase.

## When to Trigger

- User asks to "install", "add", or "get" a component by name
- User wants to use `npx shadcn@latest add` for a 21st.dev component
- User references a 21st.dev component URL (e.g. `https://21st.dev/r/some-component`)

## Project Context

This repo uses **shadcn/ui** (new-york style) with Tailwind CSS and TypeScript (TSX). Components live under `client/src/components/ui/`.

`components.json` is already configured:
- Aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`
- Tailwind CSS variables: enabled
- RSC: disabled (Vite + React SPA)

## Workflow

### 1. Identify the component

If the user gives a name (e.g. "animated button"), search the registry first:

```
Use the 21st-magic MCP → search_components tool with the component name.
```

### 2. Get the install command

21st.dev components are installed with:

```bash
npx shadcn@latest add "https://21st.dev/r/<component-slug>"
```

### 3. Run the install

```bash
cd /home/user/HeroSplit
npx shadcn@latest add "https://21st.dev/r/<component-slug>"
```

The CLI writes the component file(s) into `client/src/components/ui/` automatically based on `components.json`.

### 4. Verify

After install, confirm the new file exists and import it in the relevant page/component.

## Notes

- Always prefer `npx shadcn@latest add <url>` over manually copying component code.
- If the component requires additional dependencies, the CLI installs them automatically.
- For components not in the 21st.dev registry, fall back to the standard shadcn registry at `https://ui.shadcn.com/r/<name>`.
- Environment variable `API_KEY_21ST` must be set for registry queries via MCP.
