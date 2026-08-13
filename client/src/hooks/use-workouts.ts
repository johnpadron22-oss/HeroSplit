import { useState } from "react";
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
}

export interface UserProfile {
  id: string;
  userId: string;
  isPro: boolean;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  stripeCustomerId?: string;
  path?: "hero" | "villain";
  archetype?: string;
  alias?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeStreak(logs: WorkoutLog[]): number {
  if (!logs.length) return 0;
  const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
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

  const mutate = async (
    data: {
      workoutId?: string | number;
      workoutName: string;
      duration: number;
      date: string;
      userId?: string;
    },
    options?: { onSuccess?: () => void; onError?: (e: Error) => void }
  ) => {
    if (!user) return;
    setIsPending(true);
    try {
      await db.transact([
        db.tx.workoutLogs[id()].update({
          userId: user.id,
          workoutName: data.workoutName,
          duration: data.duration,
          date: data.date,
          completedAt: Date.now(),
          ...(data.workoutId ? { workoutId: String(data.workoutId) } : {}),
        }),
      ]);
      toast({
        title: "Workout Complete!",
        description: "Your progress has been saved.",
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

  return {
    data: {
      stats: {
        isPro: profile?.isPro ?? false,
        currentStreak: computeStreak(logs),
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

  const upgrade = async () => {
    if (!user) return;
    setIsPending(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast({
        title: "Error",
        description: "Could not start checkout. Please try again.",
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
