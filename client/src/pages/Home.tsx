import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkouts, useUserProgress, useTogglePro } from "@/hooks/use-workouts";
import { useAuth } from "@/hooks/use-auth";
import { WorkoutCard } from "@/components/WorkoutCard";
import { PaywallDialog } from "@/components/PaywallDialog";
import { ProgressChart } from "@/components/ProgressChart";
import { Loader2, Flame, Trophy, Calendar, Dumbbell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Home() {
  const [showPaywall, setShowPaywall] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();
  const { data: heroWorkouts, isLoading: loadingHero } = useWorkouts('hero');
  const { data: villainWorkouts, isLoading: loadingVillain } = useWorkouts('villain');
  const { data: progress, isLoading: loadingProgress } = useUserProgress();
  const { mutate: togglePro } = useTogglePro(); // For testing purposes to cancel
  const { toast } = useToast();

  const isPro = user?.is_pro || progress?.stats?.isPro || false;

  const handleVillainUnlock = () => {
    setShowPaywall(true);
  };

  // DEBUG: Secret way to downgrade for testing
  const handleDowngrade = () => {
    togglePro(false);
  };

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
             {/* Mobile only logout button (icon) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>

            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold">{user?.firstName || 'Hero'}</div>
                <div className="text-xs text-muted-foreground">{isPro ? 'Villain Tier' : 'Hero Tier'}</div>
              </div>
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {(user?.firstName?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                disabled={isLoggingOut}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto p-1 bg-white/5 rounded-full">
            <TabsTrigger value="browse" className="rounded-full data-[state=active]:bg-hero data-[state=active]:text-black font-semibold">
              Browse
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
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-1 rounded">Free Access</span>
            </div>

            {loadingHero ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroWorkouts?.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {(!heroWorkouts || heroWorkouts.length === 0) && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No workouts found. Run seed script.</div>
                )}
              </div>
            )}
          </TabsContent>

          {/* === VILLAIN WORKOUTS === */}
          <TabsContent value="villains" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-villain">Villain Arc</h2>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest border border-purple-500/20 text-purple-400 px-2 py-1 rounded bg-purple-500/10">Pro Only</span>
            </div>

            {!isPro && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-background border border-purple-500/30 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Unlock Villain Mode</h3>
                  <p className="text-sm text-purple-200/70">Access advanced splits and god-level intensity.</p>
                </div>
                <Button onClick={() => setShowPaywall(true)} className="bg-white text-purple-900 hover:bg-purple-100 font-bold">
                  Unlock
                </Button>
              </div>
            )}

            {loadingVillain ? (
               <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {villainWorkouts?.map((workout) => (
                  <WorkoutCard 
                    key={workout.id} 
                    workout={workout} 
                    isLocked={!isPro}
                    onUnlock={handleVillainUnlock}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* === PROGRESS === */}
          <TabsContent value="progress" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingProgress ? (
               <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Flame className="w-4 h-4 text-orange-500" /> Current Streak
                    </div>
                    <div className="text-3xl font-display font-bold">{progress?.stats?.currentStreak || 0}</div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-500" /> Best Streak
                    </div>
                    <div className="text-3xl font-display font-bold">{progress?.stats?.longestStreak || 0}</div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Dumbbell className="w-4 h-4 text-cyan-500" /> Total Workouts
                    </div>
                    <div className="text-3xl font-display font-bold">{progress?.stats?.totalWorkouts || 0}</div>
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                      <Calendar className="w-4 h-4 text-purple-500" /> Active Days
                    </div>
                    <div className="text-3xl font-display font-bold">{progress?.logs.length || 0}</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-6">Workout Activity</h3>
                  <ProgressChart logs={progress?.logs || []} />
                </div>

                {/* Recent History */}
                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-4">Recent Logs</h3>
                  <div className="space-y-3">
                    {progress?.logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
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
                      <div className="text-center text-muted-foreground py-4 text-sm">No workout history yet.</div>
                    )}
                  </div>
                </div>

                {isPro && (
                  <div className="text-center">
                    <Button variant="link" className="text-red-400 text-xs" onClick={handleDowngrade}>
                      Cancel Subscription (Debug)
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
}
