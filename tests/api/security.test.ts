import { beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import { USERS, TOKENS, SUBSCRIPTIONS, makeReq, makeRes, bearer } from "./testkit.js";

// ── Fakes for Supabase (service role) and Stripe ─────────────────────────────
const state = vi.hoisted(() => ({
  hits: new Map<string, number>(),
  calls: [] as Array<{ kind: string; args: unknown[] }>,
  failDb: false,
  stripeError: null as Error | null,
}));

vi.mock("../../api/_lib/deps.js", async () => {
  const { USERS, TOKENS, SUBSCRIPTIONS } = await import("./testkit.js");
  const StripeLib = (await import("stripe")).default;
  class ConfigError extends Error {}
  const realStripe = new StripeLib("sk_test_dummy");

  const admin = {
    auth: {
      getUser: async (token: string) => {
        const key = TOKENS[token];
        return key ? { data: { user: USERS[key] }, error: null } : { data: { user: null }, error: new Error("bad jwt") };
      },
      admin: {
        deleteUser: async (id: string) => { state.calls.push({ kind: "deleteUser", args: [id] }); return { error: null }; },
      },
    },
    rpc: async (fn: string, args: Record<string, unknown>) => {
      state.calls.push({ kind: `rpc:${fn}`, args: [args] });
      if (fn === "hit_rate_limit") {
        const n = (state.hits.get(args.p_key as string) ?? 0) + 1;
        state.hits.set(args.p_key as string, n);
        return { data: n <= (args.p_limit as number), error: null };
      }
      return { data: null, error: null };
    },
    from: (table: string) => {
      let filter: [string, unknown] | null = null;
      const builder = {
        select: () => builder,
        eq: (col: string, val: unknown) => { filter = [col, val]; return builder; },
        maybeSingle: async () => ({ data: table === "user_subscriptions" && filter ? SUBSCRIPTIONS[filter[1] as string] ?? null : null, error: null }),
        upsert: async (row: unknown) => { state.calls.push({ kind: `upsert:${table}`, args: [row] }); return { error: state.failDb ? new Error("db down: postgres://secret") : null }; },
        update: (row: unknown) => {
          state.calls.push({ kind: `update:${table}`, args: [row] });
          return { eq: async (col: string, val: unknown) => { state.calls.push({ kind: `update-where:${table}`, args: [col, val] }); return { error: null }; } };
        },
      };
      return builder;
    },
  };

  const stripe = {
    webhooks: realStripe.webhooks,
    checkout: { sessions: { create: async (params: unknown) => {
      if (state.stripeError) throw state.stripeError;
      state.calls.push({ kind: "checkout.create", args: [params] });
      return { url: "https://checkout.stripe.test/session" };
    } } },
    billingPortal: { sessions: { create: async (params: unknown) => {
      state.calls.push({ kind: "portal.create", args: [params] });
      return { url: "https://billing.stripe.test/portal" };
    } } },
    customers: { del: async (id: string) => { state.calls.push({ kind: "customers.del", args: [id] }); return { deleted: true }; } },
  };

  return {
    ConfigError,
    getAdmin: () => admin,
    getStripe: () => stripe,
    frontendUrl: () => "https://herosplit.vercel.app",
  };
});

import checkout from "../../api/create-checkout.js";
import portal from "../../api/customer-portal.js";
import webhook from "../../api/stripe-webhook.js";
import deleteAccount from "../../api/delete-account.js";

const WEBHOOK_SECRET = "whsec_test_secret";

beforeEach(() => {
  state.hits.clear();
  state.calls.length = 0;
  state.failDb = false;
  state.stripeError = null;
  process.env.STRIPE_PRO_PRICE_ID = "price_monthly";
  process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_annual";
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

const called = (kind: string) => state.calls.filter((c) => c.kind === kind);

// ── Auth on every route ──────────────────────────────────────────────────────
describe.each([
  ["create-checkout", checkout, { plan: "monthly" }],
  ["customer-portal", portal, {}],
  ["delete-account", deleteAccount, { confirm: "DELETE MY ACCOUNT" }],
] as const)("%s auth", (_name, handler, body) => {
  it("rejects logged-out requests with 401", async () => {
    const res = makeRes();
    await handler(makeReq({ body }), res);
    expect(res.captured.statusCode).toBe(401);
  });
  it("rejects forged/invalid tokens with 401", async () => {
    const res = makeRes();
    await handler(makeReq({ headers: bearer("forged.jwt.token"), body }), res);
    expect(res.captured.statusCode).toBe(401);
  });
  it("rejects users without a confirmed email with 403", async () => {
    const res = makeRes();
    await handler(makeReq({ headers: bearer("token-unconfirmed"), body }), res);
    expect(res.captured.statusCode).toBe(403);
  });
  it("rejects non-POST methods with 405", async () => {
    const res = makeRes();
    await handler(makeReq({ method: "GET", headers: bearer("token-a") }), res);
    expect(res.captured.statusCode).toBe(405);
  });
});

// ── create-checkout ──────────────────────────────────────────────────────────
describe("create-checkout", () => {
  it("rejects a client-supplied userId (unexpected field) with 400", async () => {
    const res = makeRes();
    await checkout(makeReq({ headers: bearer("token-a"), body: { plan: "monthly", userId: USERS.B.id } }), res);
    expect(res.captured.statusCode).toBe(400);
    expect(called("checkout.create")).toHaveLength(0);
  });

  it("rejects an invalid plan with 400", async () => {
    const res = makeRes();
    await checkout(makeReq({ headers: bearer("token-a"), body: { plan: "lifetime" } }), res);
    expect(res.captured.statusCode).toBe(400);
  });

  it("creates the session for the user from the verified token", async () => {
    const res = makeRes();
    await checkout(makeReq({ headers: bearer("token-b"), body: { plan: "annual" } }), res);
    expect(res.captured.statusCode).toBe(200);
    const params = called("checkout.create")[0].args[0] as Record<string, unknown>;
    expect(params.client_reference_id).toBe(USERS.B.id);
    expect(params.metadata).toEqual({ userId: USERS.B.id, plan: "annual" });
    expect(params.line_items).toEqual([{ price: "price_annual", quantity: 1 }]);
  });

  it("reuses the caller's own Stripe customer, never another user's", async () => {
    const res = makeRes();
    await checkout(makeReq({ headers: bearer("token-a"), body: { plan: "monthly" } }), res);
    const params = called("checkout.create")[0].args[0] as Record<string, unknown>;
    expect(params.customer).toBe("cus_A_OLD");
  });

  it("refuses a second subscription for an existing Pro user (409)", async () => {
    const res = makeRes();
    await checkout(makeReq({ headers: bearer("token-pro"), body: { plan: "monthly" } }), res);
    expect(res.captured.statusCode).toBe(409);
  });

  it("rate limits: 6th attempt by one user in a minute returns 429", async () => {
    const codes: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = makeRes();
      await checkout(makeReq({ headers: bearer("token-b"), body: { plan: "monthly" } }), res);
      codes.push(res.captured.statusCode);
    }
    expect(codes).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it("rejects non-JSON bodies with 415", async () => {
    const res = makeRes();
    await checkout(makeReq({ headers: { ...bearer("token-a"), "content-type": "text/plain" }, body: "plan=monthly" }), res);
    expect(res.captured.statusCode).toBe(415);
  });

  it("does not leak provider error details to the client or logs", async () => {
    state.stripeError = Object.assign(new Error("Invalid API Key provided: sk_live_SECRET123"), { type: "StripeAuthenticationError" });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = makeRes();
    await checkout(makeReq({ headers: bearer("token-b"), body: { plan: "monthly" } }), res);
    expect(res.captured.statusCode).toBe(500);
    expect(JSON.stringify(res.captured.body)).not.toContain("sk_live");
    expect(log.mock.calls.flat().join(" ")).not.toContain("sk_live");
    log.mockRestore();
  });
});

// ── CORS ─────────────────────────────────────────────────────────────────────
describe("CORS", () => {
  it("answers preflight only for the exact HeroSplit origin", async () => {
    const ok = makeRes();
    await checkout(makeReq({ method: "OPTIONS", headers: { origin: "https://herosplit.vercel.app" } }), ok);
    expect(ok.captured.statusCode).toBe(204);
    expect(ok.captured.headers["access-control-allow-origin"]).toBe("https://herosplit.vercel.app");

    const evil = makeRes();
    await checkout(makeReq({ method: "OPTIONS", headers: { origin: "https://evil.example" } }), evil);
    expect(evil.captured.statusCode).toBe(403);
    expect(evil.captured.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("never sends a wildcard origin", async () => {
    const res = makeRes();
    await portal(makeReq({ headers: { ...bearer("token-pro"), origin: "https://herosplit.vercel.app.evil.example" }, body: {} }), res);
    expect(res.captured.headers["access-control-allow-origin"]).toBeUndefined();
    expect(Object.values(res.captured.headers)).not.toContain("*");
  });
});

// ── customer-portal ──────────────────────────────────────────────────────────
describe("customer-portal", () => {
  it("rejects a client-supplied customerId (unexpected field) with 400", async () => {
    const res = makeRes();
    await portal(makeReq({ headers: bearer("token-a"), body: { customerId: "cus_PRO" } }), res);
    expect(res.captured.statusCode).toBe(400);
    expect(called("portal.create")).toHaveLength(0);
  });

  it("opens the portal only for the caller's own customer", async () => {
    const res = makeRes();
    await portal(makeReq({ headers: bearer("token-pro"), body: {} }), res);
    expect(res.captured.statusCode).toBe(200);
    expect((called("portal.create")[0].args[0] as { customer: string }).customer).toBe("cus_PRO");
  });

  it("returns 404 for a user with no billing account", async () => {
    const res = makeRes();
    await portal(makeReq({ headers: bearer("token-b"), body: {} }), res);
    expect(res.captured.statusCode).toBe(404);
  });
});

// ── stripe-webhook ───────────────────────────────────────────────────────────
function signed(payload: object) {
  const raw = JSON.stringify(payload);
  const header = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({ payload: raw, secret: WEBHOOK_SECRET });
  return { raw, header };
}

const completedEvent = {
  id: "evt_1", object: "event", type: "checkout.session.completed",
  data: { object: { object: "checkout.session", mode: "subscription", payment_status: "paid",
    client_reference_id: USERS.A.id, customer: "cus_NEW", metadata: { userId: USERS.A.id, plan: "monthly" } } },
};

describe("stripe-webhook", () => {
  it("rejects unsigned webhooks with 400", async () => {
    const res = makeRes();
    await webhook(makeReq({ raw: JSON.stringify(completedEvent) }), res);
    expect(res.captured.statusCode).toBe(400);
    expect(state.calls.filter((c) => c.kind.startsWith("upsert"))).toHaveLength(0);
  });

  it("rejects webhooks signed with the wrong secret with 400", async () => {
    const raw = JSON.stringify(completedEvent);
    const header = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({ payload: raw, secret: "whsec_attacker" });
    const res = makeRes();
    await webhook(makeReq({ raw, headers: { "stripe-signature": header } }), res);
    expect(res.captured.statusCode).toBe(400);
    expect(state.calls.filter((c) => c.kind.startsWith("upsert"))).toHaveLength(0);
  });

  it("rejects a valid signature over a tampered body with 400", async () => {
    const { header } = signed(completedEvent);
    const tampered = JSON.stringify({ ...completedEvent, data: { object: { ...completedEvent.data.object, client_reference_id: USERS.B.id } } });
    const res = makeRes();
    await webhook(makeReq({ raw: tampered, headers: { "stripe-signature": header } }), res);
    expect(res.captured.statusCode).toBe(400);
  });

  it("grants Pro for a correctly signed checkout.session.completed", async () => {
    const { raw, header } = signed(completedEvent);
    const res = makeRes();
    await webhook(makeReq({ raw, headers: { "stripe-signature": header } }), res);
    expect(res.captured.statusCode).toBe(200);
    const row = called("upsert:user_subscriptions")[0].args[0] as Record<string, unknown>;
    expect(row).toMatchObject({ user_id: USERS.A.id, is_pro: true, stripe_customer_id: "cus_NEW", plan: "monthly" });
  });

  it("revokes Pro when a subscription becomes unpaid", async () => {
    const { raw, header } = signed({ id: "evt_2", object: "event", type: "customer.subscription.updated",
      data: { object: { object: "subscription", status: "unpaid", customer: "cus_PRO" } } });
    const res = makeRes();
    await webhook(makeReq({ raw, headers: { "stripe-signature": header } }), res);
    expect(res.captured.statusCode).toBe(200);
    expect(called("update:user_subscriptions")[0].args[0]).toMatchObject({ is_pro: false });
  });

  it("returns a generic 500 (so Stripe retries) when the DB write fails, without leaking details", async () => {
    state.failDb = true;
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { raw, header } = signed(completedEvent);
    const res = makeRes();
    await webhook(makeReq({ raw, headers: { "stripe-signature": header } }), res);
    expect(res.captured.statusCode).toBe(500);
    expect(JSON.stringify(res.captured.body)).not.toContain("postgres://");
    expect(log.mock.calls.flat().join(" ")).not.toContain("postgres://");
    log.mockRestore();
  });
});

// ── delete-account ───────────────────────────────────────────────────────────
describe("delete-account", () => {
  it("requires the exact confirmation phrase", async () => {
    const res = makeRes();
    await deleteAccount(makeReq({ headers: bearer("token-pro"), body: { confirm: "yes" } }), res);
    expect(res.captured.statusCode).toBe(400);
    expect(called("deleteUser")).toHaveLength(0);
  });

  it("rejects attempts to name a different user", async () => {
    const res = makeRes();
    await deleteAccount(makeReq({ headers: bearer("token-a"), body: { confirm: "DELETE MY ACCOUNT", userId: USERS.B.id } }), res);
    expect(res.captured.statusCode).toBe(400);
    expect(called("deleteUser")).toHaveLength(0);
  });

  it("cancels billing and erases only the caller's data and login", async () => {
    const res = makeRes();
    await deleteAccount(makeReq({ headers: bearer("token-pro"), body: { confirm: "DELETE MY ACCOUNT" } }), res);
    expect(res.captured.statusCode).toBe(200);
    expect(called("customers.del")[0].args).toEqual(["cus_PRO"]);
    expect(called("rpc:delete_user_data")[0].args).toEqual([{ p_user_id: USERS.PRO.id }]);
    expect(called("deleteUser")[0].args).toEqual([USERS.PRO.id]);
  });
});
