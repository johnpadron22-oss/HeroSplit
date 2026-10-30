import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "./_rateLimit";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`push-sub:${ip}`, 10, 60_000).allowed) {
    return res.status(429).json({ error: "Too many requests" });
  }

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
      const { data: existing } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("endpoint", subscription.endpoint)
        .limit(1);

      if (existing && existing.length > 0) {
        return res.status(200).json({ ok: true, existed: true });
      }

      const { error } = await supabase.from("push_subscriptions").insert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        created_at: Date.now(),
      });
      if (error) throw error;

      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error("[push-subscribe] POST error:", err);
      return res.status(500).json({ error: "Failed to save subscription" });
    }
  }

  if (req.method === "DELETE") {
    const { userId, endpoint } = req.body ?? {};
    if (typeof userId !== "string" || typeof endpoint !== "string") {
      return res.status(400).json({ error: "userId and endpoint required" });
    }

    try {
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint)
        .eq("user_id", userId);
      if (error) throw error;

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[push-subscribe] DELETE error:", err);
      return res.status(500).json({ error: "Failed to remove subscription" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
