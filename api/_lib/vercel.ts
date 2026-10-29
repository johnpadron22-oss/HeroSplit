import type { IncomingMessage, ServerResponse } from "node:http";

// The request/response helpers Vercel's Node runtime adds to every function.
// Declared locally so the app doesn't depend on the @vercel/node package.
export type VercelRequest = IncomingMessage & {
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
  body: unknown;
};

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
  send: (body: unknown) => VercelResponse;
};
