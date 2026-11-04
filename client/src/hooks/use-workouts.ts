import { useState } from "react";
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
  // Only present when loaded through get_workout and the caller may see it.
  program: Record<string, unknown> | null;
  estDuration?: string;
  exerciseCount: number;
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
    program:      (row.program ?? null) as Record<string, unknown> | null,
    estDuration:  (row.est_duration as string | null) ?? undefined,
    exerciseCount: (row.exercise_count as number | null) ?? 0,
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
    } else break;
  }
  return streak;
}

function computeStreak(logs: WorkoutLog[]): number {
  return computeStreakFromDates(logs.map((l) => l.date));
}

// ── API helper ───────────────────────────────────────────────────────────────

async function callApi(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Request failed");
  return json;
}

// ── Workouts ─────────────────────────────────────────────────────────────────

// Every column except `program` — paid content is only served by get_workout().
const WORKOUT_LIST_COLUMNS =
  "id, slug, name, description, type, difficulty, image_url, avatar_emoji, equipment, series, workout_style, is_pro, est_duration, exercise_count";

export function useWorkouts(type?: "hero" | "villain" | "custom" | "anime") {
  const { data, isLoading, error } = useQuery({
    queryKey: ["workouts", type ?? "all"],
    queryFn: async () => {
      let q = supabase.from("workouts").select(WORKOUT_LIST_COLUMNS);
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
      const { data, error } = await supabase.rpc("get_workout", { p_slug: slug });
      if (error) throw error;
      return data ? rowToWorkout(data as Record<string, unknown>) : null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return { data: data ?? null, isLoading, error };
}

// ── Logs ─────────────────────────────────────────────────────────────────────

// Detail 19: idempotency — track in-flight log keys so a double-tap doesn't
// insert twice. The set is cleared on success/error.
const _pendingLogKeys = new Set<string>();

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

      // Detail 19: idempotency key — one log per workout-name + date combination.
      // Prevents double-logging if the button is tapped twice or the component
      // re-renders while the request is in flight.
      const idempotencyKey = `${user.id}:${data.workoutName}:${data.date}`;
      if (_pendingLogKeys.has(idempotencyKey)) return;
      _pendingLogKeys.add(idempotencyKey);

      try {
        // user_id and completed_at are set by the database from the session.
        // XP, streaks and totals are recomputed by a database trigger.
        const { error: logError } = await supabase.from("workout_logs").insert({
          workout_name: data.workoutName,
          duration:     data.duration,
          date:         data.date,
          ...(data.workoutId ? { workout_id: String(data.workoutId) } : {}),
          ...(data.xpEarned !== undefined ? { xp_earned: data.xpEarned } : {}),
          ...(data.setsData ? { sets_data: data.setsData } : {}),
        });
        if (logError) throw logError;
      } finally {
        _pendingLogKeys.delete(idempotencyKey);
      }
    },
    // Detail 2: optimistic update — add a fake log immediately so the progress
    // tab reflects the workout before the server round-trip completes.
    onMutate: async (data) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ["userProgress", user.id] });
      const previous = queryClient.getQueryData(["userProgress", user.id]);

      queryClient.setQueryData(["userProgress", user.id], (old: ReturnType<typeof queryClient.getQueryData>) => {
        if (!old || typeof old !== "object") return old;
        const prev = old as { logs?: WorkoutLog[]; [k: string]: unknown };
        const optimisticLog: WorkoutLog = {
          id: `optimistic-${Date.now()}`,
          userId: user.id,
          workoutName: data.workoutName,
          date: data.date,
          duration: data.duration,
          completedAt: Date.now(),
          xpEarned: data.xpEarned,
          setsData: data.setsData,
        };
        return { ...prev, logs: [optimisticLog, ...(prev.logs ?? [])] };
      });

      return { previous };
    },
    onSuccess: () => {
      toast({
        title: "Workout Complete!",
        description: `Your progress has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
    // Detail 2: rollback the optimistic update on failure
    onError: (_err, _data, context) => {
      if (user && context?.previous !== undefined) {
        queryClient.setQueryData(["userProgress", user.id], context.previous);
      }
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
        supabase.from("workout_logs")      .select("*").eq("user_id", user.id),
        supabase.from("achievements")      .select("*").eq("user_id", user.id),
        supabase.from("user_profiles")     .select("*").eq("user_id", user.id).maybeSingle(),
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
      const json = await callApi("/api/create-checkout", { plan });
      window.location.href = String(json.url);
    } catch (e) {
      toast({
        title: "Payment Error",
        description: e instanceof Error ? e.message : "Could not start checkout. Please try again.",
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

  // The server finds the Stripe customer from the signed-in user.
  const openPortal = async () => {
    setIsPending(true);
    try {
      const json = await callApi("/api/customer-portal", {});
      window.location.href = String(json.url);
    } catch (e) {
      toast({
        title: "Billing Error",
        description: e instanceof Error ? e.message : "Could not open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return { openPortal, isPending };
}

// ── Account deletion ──────────────────────────────────────────────────────────

// Detail 7: pre-fetch workout on card hover so the page is ready before the click
export function usePrefetchWorkout() {
  const queryClient = useQueryClient();
  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ["workout", slug],
      queryFn: async () => {
        const { data, error } = await supabase.rpc("get_workout", { p_slug: slug });
        if (error) throw error;
        return data ? rowToWorkout(data as Record<string, unknown>) : null;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export interface LeaderboardRow {
  rank: number;
  alias: string;
  path: string;
  weeklyXp: number;
  totalXp: number;
  streak: number;
}

export function useLeaderboard(path: "hero" | "villain" | "all" = "hero") {
  return useQuery<LeaderboardRow[]>({
    queryKey: ["leaderboard", path],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", { p_path: path });
      if (error) throw error;
      return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
        rank: Number(row.rank),
        alias: String(row.alias ?? "Anonymous"),
        path: String(row.path ?? path),
        weeklyXp: Number(row.weekly_xp ?? 0),
        totalXp: Number(row.total_xp ?? 0),
        streak: Number(row.streak ?? 0),
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDeleteAccount() {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteAccount = async () => {
    setIsPending(true);
    try {
      await callApi("/api/delete-account", { confirm: "DELETE MY ACCOUNT" });
      queryClient.clear();
      await supabase.auth.signOut({ scope: "local" });
      window.location.replace("/landing");
    } catch (e) {
      toast({
        title: "Couldn't delete account",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
      setIsPending(false);
    }
  };

  return { deleteAccount, isPending };
}
