import { useState, useEffect } from "react";
import { db, id } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Workout {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  program: Record<string, unknown>;
  imageUrl?: string;
  avatarEmoji?: string;
  equipment?: string;
  series?: string;
  workoutStyle?: string;
  isPro: boolean;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutId?: string;
  workoutName: string;
  date: string;
  duration: number;
  completedAt: number;
  xpEarned?: number;
  setsData?: Array<{ name: string; sets: Array<{ weight: string; reps: string }> }>;
}

export interface UserProfile {
  id: string;
  userId: string;
  isPro: boolean;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalXP?: number;
  stripeCustomerId?: string;
  path?: "hero" | "villain";
  archetype?: string;
  alias?: string;
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "veteran";
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeStreakFromDates(rawDates: string[]): number {
  if (!rawDates.length) return 0;
  const dates = [...new Set(rawDates)].sort().reverse();
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 0;
  let expected = dates[0];
  for (const date of dates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = format(d, "yyyy-MM-dd");
    } else {
      break;
    }
  }
  return streak;
}

function computeStreak(logs: WorkoutLog[]): number {
  return computeStreakFromDates(logs.map((l) => l.date));
}

// ── Workouts ─────────────────────────────────────────────────────────────────

export function useWorkouts(type?: "hero" | "villain" | "custom" | "anime") {
  const query = type
    ? { workouts: { $: { where: { type } } } }
    : { workouts: {} };

  const { data, isLoading, error } = db.useQuery(query);

  return {
    data: (data?.workouts ?? []) as Workout[],
    isLoading,
    error,
  };
}

export function useWorkout(slug: string) {
  const { data, isLoading, error } = db.useQuery(
    slug ? { workouts: { $: { where: { slug } } } } : null
  );

  return {
    data: (data?.workouts?.[0] ?? null) as Workout | null,
    isLoading,
    error,
  };
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export function useCreateLog() {
  const { user } = db.useAuth();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  // Query profile + existing logs so we can update XP, totalWorkouts, longestStreak
  const { data: profileData } = db.useQuery(
    user
      ? {
          userProfiles: { $: { where: { userId: user.id } } },
          workoutLogs:  { $: { where: { userId: user.id } } },
        }
      : null
  );
  const profile      = profileData?.userProfiles?.[0] ?? null;
  const existingLogs = (profileData?.workoutLogs ?? []) as WorkoutLog[];

  const mutate = async (
    data: {
      workoutId?: string | number;
      workoutName: string;
      duration: number;
      date: string;
      userId?: string;
      xpEarned?: number;
      setsData?: Array<{ name: string; sets: Array<{ weight: string; reps: string }> }>;
    },
    options?: { onSuccess?: () => void; onError?: (e: Error) => void }
  ) => {
    if (!user) return;
    setIsPending(true);
    try {
      const transactions: any[] = [
        db.tx.workoutLogs[id()].update({
          userId: user.id,
          workoutName: data.workoutName,
          duration: data.duration,
          date: data.date,
          completedAt: Date.now(),
          ...(data.workoutId ? { workoutId: String(data.workoutId) } : {}),
          ...(data.xpEarned !== undefined ? { xpEarned: data.xpEarned } : {}),
          ...(data.setsData ? { setsData: data.setsData } : {}),
        }),
      ];

      // Update profile: totalXP + totalWorkouts + longestStreak
      if (profile) {
        // Compute streak including today's new log date
        const allDates = [...existingLogs.map((l) => l.date), data.date];
        const newStreak = computeStreakFromDates(allDates);
        const newLongest = Math.max(profile.longestStreak ?? 0, newStreak);

        transactions.push(
          db.tx.userProfiles[profile.id].update({
            totalXP:       (profile.totalXP      ?? 0) + (data.xpEarned ?? 0),
            totalWorkouts: (profile.totalWorkouts ?? 0) + 1,
            currentStreak: newStreak,
            longestStreak: newLongest,
          })
        );
      }

      await db.transact(transactions);
      toast({
        title: "Workout Complete!",
        description: `+${data.xpEarned ?? 0} XP earned. Your progress has been saved.`,
      });
      options?.onSuccess?.();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save workout log.",
        variant: "destructive",
      });
      options?.onError?.(e as Error);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

// ── User Progress ─────────────────────────────────────────────────────────────

export function useUserProgress() {
  const { user } = db.useAuth();

  const { data, isLoading } = db.useQuery(
    user
      ? {
          workoutLogs: { $: { where: { userId: user.id } } },
          achievements: { $: { where: { userId: user.id } } },
          userProfiles: { $: { where: { userId: user.id } } },
        }
      : null
  );

  const logs = (data?.workoutLogs ?? []) as WorkoutLog[];
  const achievements = (data?.achievements ?? []) as {
    id: string;
    achievementId: string;
    unlockedAt: number;
  }[];
  const profile = (data?.userProfiles?.[0] ?? null) as UserProfile | null;

  // Live-computed streak (always accurate — resets if a day was missed)
  const computedStreak = computeStreak(logs);

  // Sync stored streak whenever it diverges from the live value.
  // This handles the case where a user misses a day — their stored
  // currentStreak stays non-zero until this effect fires on next load.
  useEffect(() => {
    if (!profile) return;
    if (profile.currentStreak === computedStreak) return;
    db.transact([
      db.tx.userProfiles[profile.id].update({ currentStreak: computedStreak }),
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, computedStreak]);

  return {
    data: {
      stats: {
        isPro: profile?.isPro ?? false,
        currentStreak: computedStreak,
        longestStreak: profile?.longestStreak ?? 0,
        totalWorkouts: logs.length,
      },
      logs,
      achievements,
      profile,
    },
    isLoading,
  };
}

// ── Pro (Stripe Checkout) ─────────────────────────────────────────────────────

export function useUpgradePro() {
  const { user } = db.useAuth();
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const upgrade = async (plan: "monthly" | "annual" = "monthly") => {
    if (!user) return;
    setIsPending(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email, plan }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Checkout failed");
      }
      window.location.href = json.url;
    } catch (e: any) {
      toast({
        title: "Payment Error",
        description: e.message ?? "Could not start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return { upgrade, isPending };
}

// Keep useTogglePro as alias so PaywallDialog compiles until it's updated
export const useTogglePro = useUpgradePro;

// ── Quick Pro check (lightweight — avoids pulling full progress) ──────────────

export function useIsPro(): boolean {
  const { user } = db.useAuth();
  const { data } = db.useQuery(
    user ? { userProfiles: { $: { where: { userId: user.id } } } } : null
  );
  return (data?.userProfiles?.[0] as UserProfile | undefined)?.isPro ?? false;
}

// ── Billing Portal ────────────────────────────────────────────────────────────

export function useManageBilling() {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const openPortal = async (customerId: string) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Portal error");
      window.location.href = json.url;
    } catch (e: any) {
      toast({
        title: "Billing Error",
        description: e.message ?? "Could not open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return { openPortal, isPending };
}
