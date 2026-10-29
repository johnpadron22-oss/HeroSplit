import type { VercelRequest } from "./vercel.js";
import { getAdmin } from "./deps.js";
import { HttpError } from "./http.js";

export interface AuthedUser {
  id: string;
  email: string | null;
}

/**
 * Verifies the Supabase access token with the Auth server on every request
 * (no trust in client-decoded JWTs) and requires a confirmed email.
 */
export async function requireUser(req: VercelRequest): Promise<AuthedUser> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Sign in required");
  const token = header.slice(7).trim();
  if (!token || token.length > 4096) throw new HttpError(401, "Sign in required");

  const { data, error } = await getAdmin().auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Sign in required");

  const user = data.user;
  if (!user.email_confirmed_at) throw new HttpError(403, "Please confirm your email first");

  return { id: user.id, email: user.email ?? null };
}
