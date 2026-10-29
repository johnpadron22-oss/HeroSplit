import { Readable } from "node:stream";
import type { VercelRequest, VercelResponse } from "../../api/_lib/vercel.js";

export const USERS = {
  A: { id: "11111111-1111-1111-1111-111111111111", email: "a@example.com", email_confirmed_at: "2026-01-01T00:00:00Z" },
  B: { id: "22222222-2222-2222-2222-222222222222", email: "b@example.com", email_confirmed_at: "2026-01-01T00:00:00Z" },
  PRO: { id: "33333333-3333-3333-3333-333333333333", email: "c@example.com", email_confirmed_at: "2026-01-01T00:00:00Z" },
  UNCONFIRMED: { id: "44444444-4444-4444-4444-444444444444", email: "d@example.com", email_confirmed_at: null },
} as const;

export const TOKENS: Record<string, keyof typeof USERS> = {
  "token-a": "A",
  "token-b": "B",
  "token-pro": "PRO",
  "token-unconfirmed": "UNCONFIRMED",
};

export const SUBSCRIPTIONS: Record<string, { is_pro: boolean; stripe_customer_id: string | null }> = {
  [USERS.PRO.id]: { is_pro: true, stripe_customer_id: "cus_PRO" },
  [USERS.A.id]: { is_pro: false, stripe_customer_id: "cus_A_OLD" },
};

interface ReqInit {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  raw?: string;
}

export function makeReq({ method = "POST", headers = {}, body, raw }: ReqInit = {}): VercelRequest {
  const stream = Readable.from(raw !== undefined ? [Buffer.from(raw)] : []) as unknown as VercelRequest;
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  if (body !== undefined && !lower["content-type"]) lower["content-type"] = "application/json";
  Object.assign(stream, { method, headers: { "x-forwarded-for": "203.0.113.7", ...lower }, body, query: {}, cookies: {} });
  return stream;
}

export interface CapturedRes {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  ended: boolean;
}

export function makeRes(): VercelResponse & { captured: CapturedRes } {
  const captured: CapturedRes = { statusCode: 200, body: undefined, headers: {}, ended: false };
  const res = {
    captured,
    setHeader(name: string, value: string | number) { captured.headers[name.toLowerCase()] = String(value); return res; },
    getHeader(name: string) { return captured.headers[name.toLowerCase()]; },
    status(code: number) { captured.statusCode = code; return res; },
    json(body: unknown) { captured.body = body; captured.ended = true; return res; },
    send(body: unknown) { captured.body = body; captured.ended = true; return res; },
    end() { captured.ended = true; return res; },
  };
  return res as unknown as VercelResponse & { captured: CapturedRes };
}

export const bearer = (token: string) => ({ authorization: `Bearer ${token}` });
