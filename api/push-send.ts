/**
 * POST /api/push-send
 *
 * Called by Vercel Cron at 8 PM UTC daily.
 * Sends a streak-reminder push notification to every subscriber
 * whose currentStreak > 0 AND who hasn't logged a workout today.
 *
 * Also accepts X-Push-Test: true header to send a test to a single userId
 * without the streak/today check (useful for manual testing).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";
import { init } from "@instantdb/admin";

const db = init({
  appId: process.env.INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

/** YYYY-MM-DD in UTC */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

type PushSub = {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type UserProfile = {
  userId: string;
  currentStreak: number;
};

type WorkoutLog = {
  userId: string;
  date: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Auth: Vercel cron sends CRON_SECRET in Authorization header ──────────────
  const isTest = req.headers["x-push-test"] === "true";
  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const today = todayUTC();

    // Fetch all subscriptions
    const subsResult = await db.query({
      pushSubscriptions: {},
    });
    const allSubs: PushSub[] = subsResult.pushSubscriptions ?? [];

    if (allSubs.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: "No subscribers" });
    }

    // In test mode — send immediately to all, skip streak/today check
    if (isTest) {
      const testUserId = req.body?.userId as string | undefined;
      const targets = testUserId ? allSubs.filter((s) => s.userId === testUserId) : allSubs.slice(0, 1);
      const results = await sendToSubscriptions(targets, {
        title: "🧪 HeroSplit Test",
        body: "Push notifications are working.",
        url: "/",
        tag: "herosplit-test",
      });
      return res.status(200).json({ ok: true, ...results });
    }

    // Fetch user profiles to check streaks
    const profilesResult = await db.query({ userProfiles: {} });
    const profiles: UserProfile[] = profilesResult.userProfiles ?? [];
    const streakByUser: Record<string, number> = {};
    for (const p of profiles) {
      streakByUser[p.userId] = p.currentStreak ?? 0;
    }

    // Fetch today's workout logs to find who already trained
    const logsResult = await db.query({
      workoutLogs: { $: { where: { date: today } } },
    });
    const todayLogs: WorkoutLog[] = logsResult.workoutLogs ?? [];
    const trainedTodaySet = new Set(todayLogs.map((l) => l.userId));

    // Filter to subs where user has a streak AND hasn't trained today
    const eligible = allSubs.filter((sub) => {
      const streak = streakByUser[sub.userId] ?? 0;
      return streak > 0 && !trainedTodaySet.has(sub.userId);
    });

    if (eligible.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: "All streaks safe or no active streaks" });
    }

    const streakMsg = (userId: string) => {
      const streak = streakByUser[userId] ?? 0;
      return streak >= 7
        ? `🔥 ${streak}-day streak! Don't let it end tonight.`
        : `🔥 Keep your ${streak}-day streak alive — log a session today.`;
    };

    // Send individually (so per-user message can vary)
    let sent = 0;
    let failed = 0;
    const expired: string[] = [];

    await Promise.all(
      eligible.map(async (sub) => {
        const payload = JSON.stringify({
          title: "HeroSplit",
          body: streakMsg(sub.userId),
          url: "/",
          tag: "herosplit-streak",
        });

        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sent++;
        } catch (err: unknown) {
          // 410 Gone = subscription expired; remove it
          if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
            expired.push(sub.id);
          }
          failed++;
        }
      })
    );

    // Clean up expired subscriptions
    if (expired.length > 0) {
      const { tx } = await import("@instantdb/admin");
      await db.transact(expired.map((subId) => tx.pushSubscriptions[subId].delete()));
    }

    return res.status(200).json({ ok: true, sent, failed, expiredRemoved: expired.length });
  } catch (err) {
    console.error("[push-send] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function sendToSubscriptions(
  subs: PushSub[],
  data: { title: string; body: string; url: string; tag: string }
) {
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(data)
        );
        sent++;
      } catch {
        failed++;
      }
    })
  );
  return { sent, failed };
}
