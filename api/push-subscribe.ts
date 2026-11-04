import type { VercelRequest, VercelResponse } from "./_lib/vercel.js";
import { z } from "zod";
import { getAdmin } from "./_lib/deps.js";
import { applyCors, clientIp, HttpError, parseBody, requireMethod, sendError } from "./_lib/http.js";
import { requireUser } from "./_lib/auth.js";
import { enforceRateLimit } from "./_lib/rateLimit.js";

const SubscribeBody = z.object({
  subscription: z.object({
    endpoint: z.string().url().max(2048),
    keys: z.object({
      p256dh: z.string().min(1).max(256),
      auth:   z.string().min(1).max(64),
    }),
  }),
}).strict();

const UnsubscribeBody = z.object({
  endpoint: z.string().url().max(2048),
}).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, ["POST", "DELETE"])) return;
  try {
    requireMethod(req, ["POST", "DELETE"]);
    await enforceRateLimit("push-sub-ip", clientIp(req), 10, 60);
    // userId always comes from the verified JWT — never trusted from the body.
    const user = await requireUser(req);
    await enforceRateLimit("push-sub-user", user.id, 5, 60);

    const admin = getAdmin();

    if (req.method === "POST") {
      const { subscription } = parseBody(req, SubscribeBody);

      const { data: existing } = await admin
        .from("push_subscriptions")
        .select("id")
        .eq("endpoint", subscription.endpoint)
        .limit(1);

      if (existing && existing.length > 0) {
        return res.status(200).json({ ok: true, existed: true });
      }

      const { error } = await admin.from("push_subscriptions").insert({
        user_id:    user.id,
        endpoint:   subscription.endpoint,
        p256dh:     subscription.keys.p256dh,
        auth:       subscription.keys.auth,
        created_at: Date.now(),
      });
      if (error) throw error;

      return res.status(201).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { endpoint } = parseBody(req, UnsubscribeBody);

      const { error } = await admin
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint)
        .eq("user_id", user.id);
      if (error) throw error;

      return res.status(200).json({ ok: true });
    }

    throw new HttpError(405, "Method not allowed");
  } catch (err) {
    return sendError(res, "push-subscribe", err);
  }
}
