import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getStripe environment guard", () => {
  it("refuses a live Stripe key on preview deployments", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_example");
    const { getStripe, ConfigError } = await import("../../api/_lib/deps.js");
    expect(() => getStripe()).toThrow(ConfigError);
  });

  it("allows a test key on preview deployments", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_example");
    const { getStripe } = await import("../../api/_lib/deps.js");
    expect(() => getStripe()).not.toThrow();
  });

  it("fails closed when the service-role key is missing", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { getAdmin, ConfigError } = await import("../../api/_lib/deps.js");
    expect(() => getAdmin()).toThrow(ConfigError);
  });
});
