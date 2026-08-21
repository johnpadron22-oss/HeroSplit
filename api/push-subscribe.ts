import type { VercelRequest, VercelResponse } from "@vercel/node";
import { init, id, tx } from "@instantdb/admin";
import { checkRateLimit } from "./_rateLimit";

const db = init({
  appId: process.env.INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limiting — 10 subscribe/unsubscribe actions per minute per IP
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`push-sub:${ip}`, 10, 60_000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  // ── POST /api/push-subscribe — save a new push subscription ─────────────────
  if (req.method === "POST") {
    const { userId, subscription } = req.body ?? {};

    if (
      typeof userId !== "string" ||
      typeof subscription?.endpoint !== "string" ||
      typeof subscription?.keys?.p256dh !== "string" ||
      typeof subscription?.keys?.auth !== "string"
    ) {
      return res.status(400).json({ error: "Invalid subscription payload" });
    }

    try {
      // Check if this endpoint is already stored (idempotent)
      const existing = await db.query({
        pushSubscriptions: {
          $: { where: { endpoint: subscription.endpoint } },
        },
      });

      if (existing.pushSubscriptions.length > 0) {
        // Already stored — nothing to do
        return res.status(200).json({ ok: true, existed: true });
      }

      await db.transact([
        tx.pushSubscriptions[id()].update({
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          createdAt: Date.now(),
        }),
      ]);

      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error("[push-subscribe] POST error:", err);
      return res.status(500).json({ error: "Failed to save subscription" });
    }
  }

  // ── DELETE /api/push-subscribe — remove a subscription ──────────────────────
  if (req.method === "DELETE") {
    const { userId, endpoint } = req.body ?? {};

    if (typeof userId !== "string" || typeof endpoint !== "string") {
      return res.status(400).json({ error: "userId and endpoint required" });
    }

    try {
      const existing = await db.query({
        pushSubscriptions: {
          $: { where: { endpoint, userId } },
        },
      });

      if (existing.pushSubscriptions.length === 0) {
        return res.status(200).json({ ok: true, existed: false });
      }

      await db.transact(
        existing.pushSubscriptions.map((sub: { id: string }) =>
          tx.pushSubscriptions[sub.id].delete()
        )
      );

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[push-subscribe] DELETE error:", err);
      return res.status(500).json({ error: "Failed to remove subscription" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
