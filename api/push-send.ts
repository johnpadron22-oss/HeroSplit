import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

type PushSub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const isTest = req.headers["x-push-test"] === "true";
  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const today = todayUTC();

    const { data: allSubs } = await supabase.from("push_subscriptions").select("*");
    const subs: PushSub[] = allSubs ?? [];

    if (subs.length === 0) return res.status(200).json({ ok: true, sent: 0, message: "No subscribers" });

    if (isTest) {
      const testUserId = (req.body as { userId?: string })?.userId;
      const targets = testUserId ? subs.filter((s) => s.user_id === testUserId) : subs.slice(0, 1);
      const results = await sendToSubs(targets, { title: "🧪 HeroSplit Test", body: "Push notifications are working.", url: "/", tag: "herosplit-test" });
      return res.status(200).json({ ok: true, ...results });
    }

    const { data: profiles } = await supabase.from("user_profiles").select("user_id, current_streak");
    const streakByUser: Record<string, number> = {};
    for (const p of profiles ?? []) {
      streakByUser[(p as Record<string, unknown>).user_id as string] = (p as Record<string, unknown>).current_streak as number ?? 0;
    }

    const { data: todayLogs } = await supabase.from("workout_logs").select("user_id").eq("date", today);
    const trainedToday = new Set((todayLogs ?? []).map((l) => (l as Record<string, unknown>).user_id as string));

    const eligible = subs.filter((s) => {
      const streak = streakByUser[s.user_id] ?? 0;
      return streak > 0 && !trainedToday.has(s.user_id);
    });

    if (eligible.length === 0) return res.status(200).json({ ok: true, sent: 0, message: "All streaks safe" });

    const streakMsg = (userId: string) => {
      const streak = streakByUser[userId] ?? 0;
      return streak >= 7
        ? `🔥 ${streak}-day streak! Don't let it end tonight.`
        : `🔥 Keep your ${streak}-day streak alive — log a session today.`;
    };

    let sent = 0, failed = 0;
    const expired: string[] = [];

    await Promise.all(eligible.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: "HeroSplit", body: streakMsg(sub.user_id), url: "/", tag: "herosplit-streak" })
        );
        sent++;
      } catch (err: unknown) {
        if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
          expired.push(sub.id);
        }
        failed++;
      }
    }));

    if (expired.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", expired);
    }

    return res.status(200).json({ ok: true, sent, failed, expiredRemoved: expired.length });
  } catch (err) {
    console.error("[push-send] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function sendToSubs(subs: PushSub[], data: { title: string; body: string; url: string; tag: string }) {
  let sent = 0, failed = 0;
  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(data));
      sent++;
    } catch { failed++; }
  }));
  return { sent, failed };
}
