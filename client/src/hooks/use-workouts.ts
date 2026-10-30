import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
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

// ── Row mappers ───────────────────────────────────────────────────────────────

function mapWorkout(r: Record<string, unknown>): Workout {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    description: (r.description as string) ?? "",
    type: r.type as string,
    difficulty: (r.difficulty as string) ?? "",
    program: (r.program as Record<string, unknown>) ?? {},
    imageUrl: r.image_url as string | undefined,
    avatarEmoji: r.avatar_emoji as string | undefined,
    equipment: r.equipment as string | undefined,
    series: r.series as string | undefined,
    workoutStyle: r.workout_style as string | undefined,
    isPro: Boolean(r.is_pro),
  };
}

function mapLog(r: Record<string, unknown>): WorkoutLog {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    workoutId: r.workout_id as string | undefined,
    workoutName: r.workout_name as string,
    date: r.date as string,
    duration: r.duration as number,
    completedAt: r.completed_at as number,
    xpEarned: r.xp_earned as number | undefined,
    setsData: r.sets_data as WorkoutLog["setsData"],
  };
}

function mapProfile(r: Record<string, unknown>): UserProfile {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    isPro: Boolean(r.is_pro),
    currentStreak: (r.current_streak as number) ?? 0,
    longestStreak: (r.longest_streak as number) ?? 0,
    totalWorkouts: (r.total_workouts as number) ?? 0,
    totalXP: r.total_xp as number | undefined,
    stripeCustomerId: r.stripe_customer_id as string | undefined,
    path: r.path as UserProfile["path"],
    archetype: r.archetype as string | undefined,
    alias: r.alias as string | undefined,
    experienceLevel: r.experience_level as UserProfile["experienceLevel"],
  };
}

// ── Streak helpers ────────────────────────────────────────────────────────────

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
    } else break;
  }
  return streak;
}

// ── Workouts ─────────────────────────────────────────────────────────────────

export function useWorkouts(type?: "hero" | "villain" | "custom" | "anime") {
  const [data, setData] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = supabase.from("workouts").select("*");
    if (type) q = q.eq("type", type);
    q.then(({ data: rows, error: err }) => {
      if (err) setError(new Error(err.message));
      else setData((rows ?? []).map((r) => mapWorkout(r as Record<string, unknown>)));
      setIsLoading(false);
    });
  }, [type]);

  return { data, isLoading, error };
}

export function useWorkout(slug: string) {
  const [data, setData] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) { setIsLoading(false); return; }
    supabase.from("workouts").select("*").eq("slug", slug).maybeSingle()
      .then(({ data: row, error: err }) => {
        if (err) setError(new Error(err.message));
        else setData(row ? mapWorkout(row as Record<string, unknown>) : null);
        setIsLoading(false);
      });
  }, [slug]);

  return { data, isLoading, error };
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export function useCreateLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    data: {
      workoutId?: string;
      workoutName: string;
      duration: number;
      date: string;
      xpEarned?: number;
      setsData?: WorkoutLog["setsData"];
    },
    options?: { onSuccess?: () => void; onError?: (e: Error) => void }
  ) => {
    if (!user) return;
    setIsPending(true);
    try {
      // Insert the log
      const { error: logErr } = await supabase.from("workout_logs").insert({
        user_id: user.id,
        workout_name: data.workoutName,
        duration: data.duration,
        date: data.date,
        completed_at: Date.now(),
        ...(data.workoutId ? { workout_id: data.workoutId } : {}),
        ...(data.xpEarned !== undefined ? { xp_earned: data.xpEarned } : {}),
        ...(data.setsData ? { sets_data: data.setsData } : {}),
      });
      if (logErr) throw new Error(logErr.message);

      // Fetch current profile + all logs to compute new stats
      const [{ data: profileRows }, { data: logRows }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", user.id),
        supabase.from("workout_logs").select("date").eq("user_id", user.id),
      ]);

      const profile = profileRows?.[0] ? mapProfile(profileRows[0] as Record<string, unknown>) : null;
      const allDates = [...(logRows ?? []).map((l) => (l as Record<string, unknown>).date as string), data.date];
      const newStreak = computeStreakFromDates(allDates);

      if (profile) {
        await supabase.from("user_profiles").update({
          total_xp: (profile.totalXP ?? 0) + (data.xpEarned ?? 0),
          total_workouts: profile.totalWorkouts + 1,
          current_streak: newStreak,
          longest_streak: Math.max(profile.longestStreak, newStreak),
        }).eq("id", profile.id);
      }

      toast({
        title: "Workout Complete!",
        description: `+${data.xpEarned ?? 0} XP earned. Your progress has been saved.`,
      });
      options?.onSuccess?.();
    } catch (e) {
      toast({ title: "Error", description: "Failed to save workout log.", variant: "destructive" });
      options?.onError?.(e as Error);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

// ── User Progress ─────────────────────────────────────────────────────────────

export function useUserProgress() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    stats: { isPro: boolean; currentStreak: number; longestStreak: number; totalWorkouts: number };
    logs: WorkoutLog[];
    achievements: { id: string; achievementId: string; unlockedAt: number }[];
    profile: UserProfile | null;
  }>({
    stats: { isPro: false, currentStreak: 0, longestStreak: 0, totalWorkouts: 0 },
    logs: [],
    achievements: [],
    profile: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    const [logsRes, achRes, profRes] = await Promise.all([
      supabase.from("workout_logs").select("*").eq("user_id", user.id),
      supabase.from("achievements").select("*").eq("user_id", user.id),
      supabase.from("user_profiles").select("*").eq("user_id", user.id),
    ]);

    const logs = (logsRes.data ?? []).map((r) => mapLog(r as Record<string, unknown>));
    const achievements = (achRes.data ?? []).map((r) => ({
      id: (r as Record<string, unknown>).id as string,
      achievementId: (r as Record<string, unknown>).achievement_id as string,
      unlockedAt: (r as Record<string, unknown>).unlocked_at as number,
    }));
    const profile = profRes.data?.[0] ? mapProfile(profRes.data[0] as Record<string, unknown>) : null;

    const computedStreak = computeStreakFromDates(logs.map((l) => l.date));

    // Sync stored streak if it drifted
    if (profile && profile.currentStreak !== computedStreak) {
      await supabase.from("user_profiles")
        .update({ current_streak: computedStreak })
        .eq("id", profile.id);
      profile.currentStreak = computedStreak;
    }

    setData({
      stats: {
        isPro: profile?.isPro ?? false,
        currentStreak: computedStreak,
        longestStreak: profile?.longestStreak ?? 0,
        totalWorkouts: logs.length,
      },
      logs,
      achievements,
      profile,
    });
    setIsLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, isLoading, refresh };
}

// ── Pro (Stripe Checkout) ─────────────────────────────────────────────────────

export function useUpgradePro() {
  const { user } = useAuth();
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
      if (!res.ok || json.error) throw new Error(json.error ?? "Checkout failed");
      window.location.href = json.url;
    } catch (e: unknown) {
      toast({
        title: "Payment Error",
        description: (e as Error).message ?? "Could not start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return { upgrade, isPending };
}

export const useTogglePro = useUpgradePro;

// ── Quick Pro check ───────────────────────────────────────────────────────────

export function useIsPro(): boolean {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_profiles").select("is_pro").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setIsPro(Boolean((data as Record<string, unknown>).is_pro));
      });
  }, [user]);

  return isPro;
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
    } catch (e: unknown) {
      toast({
        title: "Billing Error",
        description: (e as Error).message ?? "Could not open billing portal.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return { openPortal, isPending };
}
