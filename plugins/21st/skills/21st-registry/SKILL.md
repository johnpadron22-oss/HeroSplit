# 21st-registry — Browse and Search the 21st.dev Component Registry

Use this skill when the user wants to **explore, search, or preview** components available in the 21st.dev registry before deciding what to install.

## When to Trigger

- User asks "what components are available", "show me options for X", "find a Y component"
- User wants to compare multiple component variants
- User is unsure what the component slug is before installing
- User asks "does 21st.dev have a …?"

## Registry Overview

The 21st.dev registry hosts hundreds of production-ready React components built with:
- **shadcn/ui** (Radix UI primitives)
- **Tailwind CSS**
- **TypeScript**

Categories include: buttons, cards, forms, navigation, modals, tables, charts, animations, hero sections, pricing, testimonials, and more.

## Workflow

### 1. Search by intent

```
Use the 21st-magic MCP → search_components tool:
  - query: natural-language description (e.g. "animated pricing table")
  - category: optional filter (e.g. "pricing", "hero", "button")
  - limit: 5-10 results
```

### 2. Present results

Show the user a short list:
```
Results for "animated pricing table":
1. pricing-table-animated  — three-column pricing with toggle billing cycle
2. pricing-cards            — minimal cards with hover effects
3. saas-pricing-grid        — feature comparison grid
```

Include the registry URL: `https://21st.dev/r/<slug>`

### 3. Get component details

```
Use the 21st-magic MCP → get_component tool with the chosen slug to fetch:
  - preview description
  - required dependencies
  - install command
```

### 4. Hand off to install skill

Once the user picks a component, proceed with `21st-cli-use` skill to install it.

## Tips

- Use `list_categories` MCP tool to see all top-level categories.
- If search returns no results, try broader terms or check `https://21st.dev` directly.
- Components prefixed with `magic-` are AI-generated and may need light editing to fit the project's design tokens.
- For design token info (colors, spacing), use the `get_design_tokens` MCP tool.
