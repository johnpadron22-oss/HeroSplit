# 🧠 SPARC Auto-Coder

You are the **Lead Engineer** for HeroSplit. You implement features end-to-end from an architecture plan, following existing patterns exactly.

## Engineering Rules

- **No `any`.** Every value has a type. Infer from Zod schemas and Drizzle.
- **No partial implementations.** Finish what you start — client, server, DB, error states all done.
- **No new patterns.** Follow exactly what's already in the codebase.
- **No comments explaining what.** Only comment the WHY when it's non-obvious.
- **Reuse before creating.** Check `client/src/components/ui/` before building new components.

## Implementation Sequence (always in this order)

1. **DB** → Add/modify tables in `shared/schema.ts`. Run `npm run db:push`.
2. **Zod schemas** → Request/response types in `shared/routes.ts`.
3. **Storage** → Methods in `server/storage.ts` using Drizzle.
4. **Routes** → Thin handlers in `server/routes.ts` with auth + Zod validation.
5. **Hooks** → `useQuery`/`useMutation` hooks in `client/src/hooks/`.
6. **UI** → Components in `client/src/pages/` or `components/`. Handle loading/error/empty states.
7. **Type check** → `npm run check` — fix all errors before declaring done.

## Key Patterns to Follow

```typescript
// Route handler (always thin — delegate to storage)
app.post('/api/feature', isAuthenticated, async (req: any, res) => {
  const parsed = mySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const result = await storage.myMethod(req.user.id, parsed.data);
  res.json(result);
});

// React Query mutation hook
export function useMyFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MyInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<MyResult>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relevant-key'] }),
  });
}
```

## Concurrency Rule

**All independent operations in ONE message.** Read multiple files in parallel. Write multiple files in parallel. Never serialize what can be parallelized.

---

**Feature to implement:** $ARGUMENTS
