import { useState } from "react";
import { useLeaderboard } from "@/hooks/use-workouts";
import { useUserProgress } from "@/hooks/use-workouts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Flame, Trophy, Zap } from "lucide-react";

type LeaderboardPath = "hero" | "villain";

export function Leaderboard() {
  const [path, setPath] = useState<LeaderboardPath>("hero");
  const { data: rows, isLoading } = useLeaderboard(path);
  const { data: progress } = useUserProgress();

  const myAlias = progress?.profile?.alias;
  const isVillain = path === "villain";

  return (
    <div className="space-y-5">
      {/* Path selector */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-full max-w-xs mx-auto">
        <button
          onClick={() => setPath("hero")}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-full transition-all",
            path === "hero"
              ? "bg-cyan-500 text-black shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ⚡ Hero Path
        </button>
        <button
          onClick={() => setPath("villain")}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-full transition-all",
            path === "villain"
              ? "bg-purple-600 text-white shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          💀 Villain Path
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className={cn("text-2xl font-display font-black", isVillain ? "text-purple-400" : "text-cyan-400")}>
          {isVillain ? "Villain" : "Hero"} Rankings
        </h2>
        <p className="text-xs text-muted-foreground">Weekly XP · resets every Monday</p>
      </div>

      {/* Top-3 podium */}
      {!isLoading && rows && rows.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd */}
          <PodiumSlot row={rows[1]} position={2} isVillain={isVillain} isMe={rows[1].alias === myAlias} />
          {/* 1st */}
          <PodiumSlot row={rows[0]} position={1} isVillain={isVillain} isMe={rows[0].alias === myAlias} />
          {/* 3rd */}
          <PodiumSlot row={rows[2]} position={3} isVillain={isVillain} isMe={rows[2].alias === myAlias} />
        </div>
      )}

      {/* Full table */}
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <span>#</span>
          <span>Alias</span>
          <span className="text-right">Wk XP</span>
          <span className="text-right">🔥</span>
        </div>

        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : rows && rows.length > 0 ? (
          <div>
            {rows.map((row) => {
              const isMe = row.alias === myAlias;
              const rankColors: Record<number, string> = {
                1: "text-amber-400",
                2: "text-zinc-300",
                3: "text-amber-700",
              };
              return (
                <div
                  key={row.rank}
                  className={cn(
                    "grid grid-cols-[2rem_1fr_auto_auto] gap-2 px-4 py-3 items-center border-b border-white/[0.03] last:border-0 transition-colors",
                    isMe
                      ? isVillain
                        ? "bg-purple-500/10 border-purple-500/10"
                        : "bg-cyan-500/10 border-cyan-500/10"
                      : "hover:bg-white/[0.03]"
                  )}
                >
                  <span className={cn("text-sm font-black tabular-nums", rankColors[row.rank] ?? "text-muted-foreground")}>
                    {row.rank}
                  </span>
                  <div className="min-w-0">
                    <div className={cn("text-sm font-semibold truncate", isMe && (isVillain ? "text-purple-300" : "text-cyan-300"))}>
                      {row.alias}
                      {isMe && <span className="ml-1.5 text-[10px] opacity-60">(you)</span>}
                    </div>
                  </div>
                  <div className="text-sm font-mono font-bold tabular-nums text-right">
                    {row.weeklyXp > 0 ? `+${row.weeklyXp.toLocaleString()}` : "—"}
                  </div>
                  <div className={cn("text-sm font-mono tabular-nums text-right", row.streak > 0 ? "text-orange-400" : "text-muted-foreground")}>
                    {row.streak > 0 ? row.streak : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <div className="text-4xl mb-3">{isVillain ? "💀" : "⚔️"}</div>
            No ranked players yet. Be the first to claim the top spot.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> Weekly XP earned Mon–Sun
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-orange-400" /> Current day streak
        </div>
      </div>
    </div>
  );
}

function PodiumSlot({
  row, position, isVillain, isMe,
}: {
  row: { alias: string; weeklyXp: number };
  position: 1 | 2 | 3;
  isVillain: boolean;
  isMe: boolean;
}) {
  const heights = { 1: "h-20", 2: "h-14", 3: "h-10" } as const;
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;
  const accent = isVillain ? "bg-purple-500/20 border-purple-500/30" : "bg-cyan-500/20 border-cyan-500/30";

  return (
    <div className="flex flex-col items-center gap-1 w-24">
      <div className="text-xs font-bold truncate max-w-full text-center">
        {row.alias.length > 8 ? row.alias.slice(0, 8) + "…" : row.alias}
        {isMe && <span className="block text-[9px] opacity-60">you</span>}
      </div>
      <div className="text-sm font-mono font-bold tabular-nums text-muted-foreground">
        {row.weeklyXp > 0 ? `+${row.weeklyXp}` : "0"} XP
      </div>
      <div className="text-xl">{medals[position]}</div>
      <div className={cn("w-full rounded-t-xl border flex items-end justify-center pt-2 text-lg", heights[position], accent)}>
        <Trophy className={cn("w-5 h-5 mb-1", position === 1 ? "text-amber-400" : "text-muted-foreground")} />
      </div>
    </div>
  );
}
