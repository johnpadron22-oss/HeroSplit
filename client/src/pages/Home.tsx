import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkouts, useUserProgress, useManageBilling } from "@/hooks/use-workouts";
import { useAuth } from "@/hooks/use-auth";
import { WorkoutCard } from "@/components/WorkoutCard";
import { PaywallDialog } from "@/components/PaywallDialog";
import { OnboardingModal } from "@/components/OnboardingModal";
import { ProgressChart } from "@/components/ProgressChart";
import { ProfileCard } from "@/components/ProfileCard";
import { Loader2, Flame, Trophy, Calendar, Dumbbell, LogOut, TrendingUp, ChevronDown, ChevronUp, Zap, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { db, id } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const { openPortal, isPending: portalPending } = useManageBilling();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { data: heroWorkouts, isLoading: loadingHero } = useWorkouts("hero");
  const { data: villainWorkouts, isLoading: loadingVillain } = useWorkouts("villain");
  const { data: animeWorkouts, isLoading: loadingAnime } = useWorkouts("anime");
  const { data: progress, isLoading: loadingProgress } = useUserProgress();

  const isPro = progress?.stats?.isPro ?? false;

  // Show success toast when returning from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({
        title: "Welcome to Pro!",
        description: "Villain Mode is now unlocked. Time to dominate.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  // Auto-create userProfile on first login
  useEffect(() => {
    if (!user || loadingProgress) return;
    if (!progress?.profile) {
      db.transact([
        db.tx.userProfiles[id()].update({
          userId: user.id,
          isPro: false,
          currentStreak: 0,
          longestStreak: 0,
          totalWorkouts: 0,
        }),
      ]);
    }
  }, [user, loadingProgress, progress?.profile]);

  // Derive display name from email (e.g. "jonathan@gmail.com" → "Jonathan")
  const displayName = user?.email
    ? user.email.split("@")[0].replace(/[._-]/g, " ").split(" ")[0]
    : "Hero";
  const avatarInitial = displayName[0]?.toUpperCase() ?? "H";

  // Show onboarding if profile exists but no archetype chosen yet
  const needsOnboarding =
    !loadingProgress &&
    progress?.profile &&
    !progress.profile.archetype;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-display font-black italic tracking-tighter text-xl">
            <span className="text-hero">HERO</span>
            <span className="text-foreground">SPLIT</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
            </Button>

            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold capitalize">{displayName}</div>
                <div className="text-xs text-muted-foreground">
                  {isPro ? "Villain Tier" : "Hero Tier"}
                </div>
              </div>
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-xl mx-auto p-1 bg-white/5 rounded-full">
            <TabsTrigger value="browse" className="rounded-full data-[state=active]:bg-hero data-[state=active]:text-black font-semibold">
              Heroes
            </TabsTrigger>
            <TabsTrigger value="anime" className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-black font-semibold">
              Anime
            </TabsTrigger>
            <TabsTrigger value="villains" className="rounded-full data-[state=active]:bg-villain data-[state=active]:text-white font-semibold">
              Villains
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
              Progress
            </TabsTrigger>
          </TabsList>

          {/* === HERO WORKOUTS === */}
          <TabsContent value="browse" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-hero">Hero Workouts</h2>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                Free Access
              </span>
            </div>

            {loadingHero ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} experienceLevel={progress?.profile?.experienceLevel} />
                ))}
                {heroWorkouts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No workouts found. Run the seed script.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* === ANIME WORKOUTS === */}
          <TabsContent value="anime" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-amber-400">Anime Arc</h2>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest border border-amber-500/20 px-2 py-1 rounded bg-amber-500/10">
                Pro Only
              </span>
            </div>

            {!isPro && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-900/40 to-background border border-amber-500/30 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Unlock Anime Mode</h3>
                  <p className="text-sm text-amber-200/70">
                    Train like the legends — DBZ, Naruto, JJK, One Piece, and more.
                  </p>
                </div>
                <Button
                  onClick={() => setShowPaywall(true)}
                  className="bg-amber-500 text-black hover:bg-amber-400 font-bold"
                >
                  Unlock
                </Button>
              </div>
            )}

            {loadingAnime ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {animeWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    isLocked={!isPro}
                    onUnlock={() => setShowPaywall(true)}
                    experienceLevel={progress?.profile?.experienceLevel}
                  />
                ))}
                {animeWorkouts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No anime workouts found.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* === VILLAIN WORKOUTS === */}
          <TabsContent value="villains" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-villain">Villain Arc</h2>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest border border-purple-500/20 text-purple-400 px-2 py-1 rounded bg-purple-500/10">
                Pro Only
              </span>
            </div>

            {!isPro && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-background border border-purple-500/30 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Unlock Villain Mode</h3>
                  <p className="text-sm text-purple-200/70">
                    Access advanced splits and god-level intensity.
                  </p>
                </div>
                <Button
                  onClick={() => setShowPaywall(true)}
                  className="bg-white text-purple-900 hover:bg-purple-100 font-bold"
                >
                  Unlock
                </Button>
              </div>
            )}

            {loadingVillain ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {villainWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    isLocked={!isPro}
                    onUnlock={() => setShowPaywall(true)}
                    experienceLevel={progress?.profile?.experienceLevel}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* === PROGRESS === */}
          <TabsContent value="progress" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingProgress ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Profile / Identity Card */}
                {progress?.profile && (
                  <ProfileCard
                    profile={progress.profile}
                    totalWorkouts={progress.stats.totalWorkouts}
                    currentStreak={progress.stats.currentStreak}
                  />
                )}

                {/* Quick stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Flame className="w-4 h-4 text-orange-500" /> Streak
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {progress?.stats?.currentStreak ?? 0}
                    </div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-500" /> Best
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {progress?.stats?.longestStreak ?? 0}
                    </div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Dumbbell className="w-4 h-4 text-cyan-500" /> Sessions
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {progress?.stats?.totalWorkouts ?? 0}
                    </div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-400" /> Total XP
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {(progress?.profile?.totalXP ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Activity chart */}
                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-6">Workout Activity</h3>
                  <ProgressChart logs={progress?.logs ?? []} />
                </div>

                {/* Workout History with expandable sets detail */}
                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-4">Workout History</h3>
                  <div className="space-y-2">
                    {(progress?.logs ?? [])
                      .slice()
                      .sort((a, b) => b.completedAt - a.completedAt)
                      .slice(0, 10)
                      .map((log) => {
                        const isExpanded = expandedLog === log.id;
                        const hasSets = Array.isArray(log.setsData) && log.setsData.length > 0;
                        return (
                          <div
                            key={log.id}
                            className="rounded-xl border border-white/5 overflow-hidden"
                          >
                            {/* Log header row */}
                            <button
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                              onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                            >
                              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">{log.workoutName}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <span>{log.date}</span>
                                  <span>·</span>
                                  <span>{log.duration}m</span>
                                  {log.xpEarned ? (
                                    <>
                                      <span>·</span>
                                      <span className="text-yellow-400 font-semibold">+{log.xpEarned} XP</span>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                              {hasSets && (
                                <div className="shrink-0 text-muted-foreground">
                                  {isExpanded
                                    ? <ChevronUp className="w-4 h-4" />
                                    : <ChevronDown className="w-4 h-4" />}
                                </div>
                              )}
                            </button>

                            {/* Expanded sets detail */}
                            {isExpanded && hasSets && (
                              <div className="border-t border-white/5 px-3 pb-3 pt-2 space-y-3">
                                {log.setsData!.map((exercise, ei) => (
                                  <div key={ei}>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                                      {exercise.name}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {exercise.sets.map((s, si) => (
                                        <div
                                          key={si}
                                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono"
                                        >
                                          {s.weight !== "BW" ? `${s.weight} × ` : ""}{s.reps}
                                          {s.weight === "BW" ? " reps" : ""}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                    })}
                    {(!progress?.logs || progress.logs.length === 0) && (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        No workouts logged yet. Start your first battle!
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscription management — Pro users only */}
                {isPro && progress?.profile?.stripeCustomerId && (
                  <div className="bg-card border border-purple-500/20 p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Pro Subscription</div>
                        <div className="text-xs text-muted-foreground">Manage billing, cancel, or view invoices</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
                      onClick={() => openPortal(progress.profile!.stripeCustomerId!)}
                      disabled={portalPending}
                    >
                      {portalPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Manage</>}
                    </Button>
                  </div>
                )}

                {/* Training system guide */}
                <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-bold">Training System</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        tier: "Foundation",
                        color: "text-green-400 bg-green-500/10 border-green-500/20",
                        sessions: "3x / week",
                        time: "40–60 min",
                        style: "Full Body A/B/C",
                        desc: "Machines, dumbbells, stable patterns. Build confidence & technique.",
                      },
                      {
                        tier: "Blueprint",
                        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                        sessions: "4x / week",
                        time: "55–75 min",
                        style: "Upper / Lower Split",
                        desc: "Free weights introduced. Split training builds muscle and strength.",
                      },
                      {
                        tier: "Nemesis",
                        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                        sessions: "5–6x / week",
                        time: "60–90 min",
                        style: "Push / Pull / Legs",
                        desc: "Planned intensity, specialization, fatigue monitoring, deloads.",
                      },
                    ].map(({ tier, color, sessions, time, style, desc }) => (
                      <div key={tier} className={cn("p-4 rounded-xl border", color.split(" ").slice(1).join(" "))}>
                        <div className={cn("text-xs font-bold uppercase tracking-widest mb-1", color.split(" ")[0])}>
                          {tier} Series
                        </div>
                        <div className="font-bold text-sm mb-1">{style}</div>
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{sessions}</span>
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-white/5 pt-3">
                    <strong>Double progression:</strong> add reps each session until you hit the top of the range across all sets, then add weight next time. Never jump tiers for XP alone — advance when technique is solid.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />

      {needsOnboarding && progress?.profile && (
        <OnboardingModal
          profile={progress.profile}
          defaultAlias={displayName}
        />
      )}
    </div>
  );
}
