import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  isPro: boolean;       // display only — do NOT use for access gating
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

// The authoritative, write-locked subscription record (only the Stripe
// webhook can write this via the service role — clients cannot self-grant Pro).
export interface UserSubscription {
  id: string;
  userId: string;
  isPro: boolean;
  stripeCustomerId?: string;
  plan?: "monthly" | "annual";
  subscribedAt?: number;
  cancelledAt?: number;
}

// ── DB row → TS interface helpers ─────────────────────────────────────────────

function rowToWorkout(row: Record<string, unknown>): Workout {
  return {
    id:           row.id as string,
    slug:         row.slug as string,
    name:         row.name as string,
    description:  row.description as string,
    type:         row.type as string,
    difficulty:   row.difficulty as string,
    program:      (row.program ?? {}) as Record<string, unknown>,
    imageUrl:     row.image_url as string | undefined,
    avatarEmoji:  row.avatar_emoji as string | undefined,
    equipment:    row.equipment as string | undefined,
    series:       row.series as string | undefined,
    workoutStyle: row.workout_style as string | undefined,
    isPro:        Boolean(row.is_pro),
  };
}

function rowToLog(row: Record<string, unknown>): WorkoutLog {
  return {
    id:          row.id as string,
    userId:      row.user_id as string,
    workoutId:   row.workout_id as string | undefined,
    workoutName: row.workout_name as string,
    date:        row.date as string,
    duration:    row.duration as number,
    completedAt: row.completed_at as number,
    xpEarned:   row.xp_earned as number | undefined,
    setsData:   row.sets_data as WorkoutLog["setsData"],
  };
}

function rowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id:              row.id as string,
    userId:          row.user_id as string,
    isPro:           Boolean(row.is_pro),
    currentStreak:   (row.current_streak as number) ?? 0,
    longestStreak:   (row.longest_streak as number) ?? 0,
    totalWorkouts:   (row.total_workouts as number) ?? 0,
    totalXP:         (row.total_xp as number) ?? 0,
    stripeCustomerId: row.stripe_customer_id as string | undefined,
    path:            row.path as UserProfile["path"],
    archetype:       row.archetype as string | undefined,
    alias:           row.alias as string | undefined,
    experienceLevel: row.experience_level as UserProfile["experienceLevel"],
  };
}

function rowToSubscription(row: Record<string, unknown>): UserSubscription {
  return {
    id:              row.id as string,
    userId:          row.user_id as string,
    isPro:           Boolean(row.is_pro),
    stripeCustomerId: row.stripe_customer_id as string | undefined,
    plan:            row.plan as UserSubscription["plan"],
    subscribedAt:    row.subscribed_at as number | undefined,
    cancelledAt:     row.cancelled_at as number | undefined,
  };
}

// ── Streak helpers ────────────────────────────────────────────────────────────

function computeStreakFromDates(rawDates: string[]): number {
  if (!rawDates.length) return 0;
  const dates = Array.from(new Set(rawDates)).sort().reverse();
  const today     = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak   = 0;
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
  const { data, isLoading, error } = useQuery({
    queryKey: ["workouts", type ?? "all"],
    queryFn: async () => {
      let q = supabase.from("workouts").select("*");
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(rowToWorkout);
    },
    staleTime: 5 * 60 * 1000, // workouts rarely change — cache 5 min
  });

  return { data: data ?? [], isLoading, error };
}

export function useWorkout(slug: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["workout", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data ? rowToWorkout(data) : null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return { data: data ?? null, isLoading, error };
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export function useCreateLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: {
      workoutId?: string | number;
      workoutName: string;
      duration: number;
      date: string;
      xpEarned?: number;
      setsData?: Array<{ name: string; sets: Array<{ weight: string; reps: string }> }>;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Insert workout log
      const { error: logError } = await supabase.from("workout_logs").insert({
        user_id:      user.id,
        workout_name: data.workoutName,
        duration:     data.duration,
        date:         data.date,
        completed_at: Date.now(),
        ...(data.workoutId ? { workout_id: String(data.workoutId) } : {}),
        ...(data.xpEarned !== undefined ? { xp_earned: data.xpEarned } : {}),
        ...(data.setsData ? { sets_data: data.setsData } : {}),
      });
      if (logError) throw logError;

      // Fetch existing profile + logs to update streak/XP
      const [profileRes, logsRes] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("workout_logs").select("date").eq("user_id", user.id),
      ]);

      if (profileRes.data) {
        const profile   = profileRes.data;
        const allDates  = [...(logsRes.data ?? []).map((l: {date: string}) => l.date), data.date];
        const newStreak = computeStreakFromDates(allDates);
        const newLongest = Math.max(profile.longest_streak ?? 0, newStreak);

        await supabase
          .from("user_profiles")
          .update({
            total_xp:       (profile.total_xp      ?? 0) + (data.xpEarned ?? 0),
            total_workouts: (profile.total_workouts ?? 0) + 1,
            current_streak: newStreak,
            longest_streak: newLongest,
          })
          .eq("user_id", user.id);
      }
    },
    onSuccess: () => {
      toast({
        title: "Workout Complete!",
        description: `Your progress has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save workout log.",
        variant: "destructive",
      });
    },
  });

  return { mutate: mutation.mutateAsync, isPending: mutation.isPending };
}

// ── User Progress ─────────────────────────────────────────────────────────────

export function useUserProgress() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["userProgress", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [logsRes, achRes, profileRes, subRes] = await Promise.all([
        supabase.from("workout_logs")    .select("*").eq("user_id", user.id),
        supabase.from("achievements")    .select("*").eq("user_id", user.id),
        supabase.from("user_profiles")   .select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      const logs         = (logsRes.data ?? []).map(rowToLog);
      const achievements = (achRes.data ?? []) as { id: string; achievementId: string; unlockedAt: number }[];
      const profile      = profileRes.data ? rowToProfile(profileRes.data) : null;
      const subscription = subRes.data ? rowToSubscription(subRes.data) : null;

      const computedStreak = computeStreak(logs);

      return { logs, achievements, profile, subscription, computedStreak };
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const queryClient = useQueryClient();

  // Sync stored streak whenever it diverges from the live value
  useEffect(() => {
    if (!user || !data?.profile) return;
    if (data.profile.currentStreak === data.computedStreak) return;
    supabase
      .from("user_profiles")
      .update({ current_streak: data.computedStreak })
      .eq("user_id", user.id)
      .then(() => queryClient.invalidateQueries({ queryKey: ["userProgress"] }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.profile?.id, data?.computedStreak]);

  if (!data) {
    return { data: null, isLoading };
  }

  const { logs, achievements, profile, subscription, computedStreak } = data;

  return {
    data: {
      stats: {
        // isPro is sourced from user_subscriptions (write-locked, authoritative).
        // Never use profile.isPro for access gating — it's for display only.
        isPro: subscription?.isPro ?? false,
        currentStreak: computedStreak,
        longestStreak: profile?.longestStreak ?? 0,
        totalWorkouts: logs.length,
      },
      logs,
      achievements,
      profile,
      subscription,
    },
    isLoading,
  };
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

// Keep useTogglePro as alias so PaywallDialog compiles without changes
export const useTogglePro = useUpgradePro;

// ── Quick Pro check (lightweight) ─────────────────────────────────────────────
// Reads from user_subscriptions (write-locked to service role — authoritative).
// Never reads from user_profiles.is_pro for access gating.

export function useIsPro(): boolean {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["isPro", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_subscriptions")
        .select("is_pro")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.is_pro ?? false;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
  return data ?? false;
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
