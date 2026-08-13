import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkouts, useUserProgress } from "@/hooks/use-workouts";
import { useAuth } from "@/hooks/use-auth";
import { WorkoutCard } from "@/components/WorkoutCard";
import { PaywallDialog } from "@/components/PaywallDialog";
import { OnboardingModal } from "@/components/OnboardingModal";
import { ProgressChart } from "@/components/ProgressChart";
import { Loader2, Flame, Trophy, Calendar, Dumbbell, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { db, id } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showPaywall, setShowPaywall] = useState(false);
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
          <TabsContent value="progress" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingProgress ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Flame className="w-4 h-4 text-orange-500" /> Current Streak
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {progress?.stats?.currentStreak ?? 0}
                    </div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-500" /> Best Streak
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {progress?.stats?.longestStreak ?? 0}
                    </div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Dumbbell className="w-4 h-4 text-cyan-500" /> Total Workouts
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {progress?.stats?.totalWorkouts ?? 0}
                    </div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Calendar className="w-4 h-4 text-purple-500" /> Active Days
                    </div>
                    <div className="text-3xl font-display font-bold">
                      {progress?.logs?.length ?? 0}
                    </div>
                  </div>
                </div>

                {/* Training tiers guide */}
                <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-bold">Training System</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        tier: "Foundation",
                        tag: "Beginner",
                        color: "text-green-400 bg-green-500/10 border-green-500/20",
                        sessions: "3x / week",
                        time: "40–60 min",
                        style: "Full Body A/B/C",
                        desc: "Machines, dumbbells, stable patterns. Build confidence & technique.",
                      },
                      {
                        tier: "Blueprint",
                        tag: "Intermediate",
                        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                        sessions: "4x / week",
                        time: "55–75 min",
                        style: "Upper / Lower Split",
                        desc: "Free weights introduced. Split training builds muscle and strength.",
                      },
                      {
                        tier: "Nemesis",
                        tag: "Advanced",
                        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                        sessions: "5–6x / week",
                        time: "60–90 min",
                        style: "Push / Pull / Legs",
                        desc: "Planned intensity, specialization, fatigue monitoring, deloads.",
                      },
                    ].map(({ tier, tag, color, sessions, time, style, desc }) => (
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
                    Use <strong>double progression</strong>: add reps each session until you hit the top of the range across all sets, then increase weight next time. Never jump tiers solely based on XP — advance when technique is solid and sessions feel manageable.
                  </p>
                </div>

                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-6">Workout Activity</h3>
                  <ProgressChart logs={progress?.logs ?? []} />
                </div>

                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-4">Recent Logs</h3>
                  <div className="space-y-3">
                    {(progress?.logs ?? []).slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{log.workoutName}</div>
                            <div className="text-xs text-muted-foreground">{log.date}</div>
                          </div>
                        </div>
                        <div className="font-mono text-sm">{log.duration}m</div>
                      </div>
                    ))}
                    {(!progress?.logs || progress.logs.length === 0) && (
                      <div className="text-center text-muted-foreground py-4 text-sm">
                        No workout history yet.
                      </div>
                    )}
                  </div>
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
