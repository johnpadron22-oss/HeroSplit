import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      // Detail 6: stale-while-revalidate — show saved data instantly, then
      // refresh silently in the background after 60s instead of blocking on
      // network. Per-query overrides (e.g. staleTime: 5 * 60 * 1000) win.
      refetchOnWindowFocus: true,
      staleTime: 60_000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
