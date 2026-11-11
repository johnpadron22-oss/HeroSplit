import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Lock, Loader2, Zap, Crown } from "lucide-react";
import { useUpgradePro } from "@/hooks/use-workouts";
import { cn } from "@/lib/utils";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FREE_SPLITS = [
  { name: "Night Acrobat",  emoji: "🦅", focus: "Bodyweight · Agility" },
  { name: "Night Detective", emoji: "🔍", focus: "Full body · Conditioning" },
  { name: "Agile Climber",  emoji: "🧗", focus: "Upper/Lower · Athletic" },
  { name: "Solar Sentinel", emoji: "☀️", focus: "Push/Pull/Lower · Hypertrophy" },
];

const PRO_TIERS = [
  { label: "Villain Arc",    count: "6 elite programs",  emoji: "💀", color: "text-purple-300" },
  { label: "Anime Arc",      count: "10 programs",       emoji: "⚡", color: "text-amber-300" },
  { label: "Nemesis Series", count: "Push / Pull / Legs", emoji: "🔥", color: "text-red-300" },
];

export function PaywallDialog({ open, onOpenChange }: PaywallDialogProps) {
  const { upgrade, isPending } = useUpgradePro();
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        High-contrast navy dark mode — intentionally distinct from the rest of the
        app to break scroll autopilot. Navy-tinted black (#0a0e1a) + warm white (#f5f0e8).
      */}
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-0"
        style={{ background: "#0a0e1a", color: "#f5f0e8" }}
      >
        {/* Screenreader-only title/description for accessibility */}
        <DialogTitle className="sr-only">Unlock HeroSplit Pro</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a plan to unlock all Pro workout programs.
        </DialogDescription>

        {/* ── Header ── */}
        <div
          className="px-6 pt-6 pb-5 text-center space-y-3"
          style={{ background: "linear-gradient(to bottom, #131929, #0a0e1a)" }}
        >
          <div
            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}
          >
            <Crown className="w-7 h-7" style={{ color: "#c084fc" }} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black" style={{ color: "#f5f0e8" }}>
              Unlock Villain Mode
            </h2>
            <p className="text-sm mt-1" style={{ color: "#a8a09a" }}>
              35+ elite programs. One subscription.
            </p>
          </div>
        </div>

        <div className="px-5 pb-6 space-y-5">

          {/* ── FREE tier — already yours ── */}
          <div>
            <p
              className="text-[10px] font-mono uppercase tracking-widest mb-2"
              style={{ color: "#6ee7b7" }}
            >
              ✓ Yours free — always
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {FREE_SPLITS.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2 p-2.5 rounded-lg"
                  style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}
                >
                  <span className="text-base">{s.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight truncate" style={{ color: "#d1fae5" }}>
                      {s.name}
                    </div>
                    <div className="text-[10px] truncate" style={{ color: "#6b7280" }}>
                      {s.focus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PRO tier — locked ── */}
          <div>
            <p
              className="text-[10px] font-mono uppercase tracking-widest mb-2"
              style={{ color: "#c084fc" }}
            >
              <Lock className="w-3 h-3 inline mr-1" />Pro only
            </p>
            <div className="space-y-1.5">
              {PRO_TIERS.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.15)" }}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-sm font-semibold", t.color)}>{t.label}</span>
                    <span className="text-xs ml-2" style={{ color: "#6b7280" }}>{t.count}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: "#6b7280" }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Plan selector ── */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Annual */}
            <button
              onClick={() => setSelected("annual")}
              className="relative p-3 rounded-xl text-left transition-all"
              style={{
                border: selected === "annual" ? "2px solid #9333ea" : "2px solid rgba(255,255,255,0.1)",
                background: selected === "annual" ? "rgba(147,51,234,0.12)" : "rgba(255,255,255,0.03)",
              }}
            >
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="flex items-center gap-0.5 bg-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#f5f0e8" }}>
                  <Zap className="w-2.5 h-2.5" /> BEST VALUE
                </div>
              </div>
              <div className="text-sm font-bold mt-1" style={{ color: "#f5f0e8" }}>Annual</div>
              <div className="text-xl font-display font-black tabular-nums" style={{ color: "#f5f0e8" }}>$39.99</div>
              <div className="text-[10px]" style={{ color: "#a8a09a" }}>per year · $3.33/mo</div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => setSelected("monthly")}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                border: selected === "monthly" ? "2px solid #9333ea" : "2px solid rgba(255,255,255,0.1)",
                background: selected === "monthly" ? "rgba(147,51,234,0.12)" : "rgba(255,255,255,0.03)",
              }}
            >
              <div className="text-sm font-bold" style={{ color: "#f5f0e8" }}>Monthly</div>
              <div className="text-xl font-display font-black tabular-nums" style={{ color: "#f5f0e8" }}>$4.99</div>
              <div className="text-[10px]" style={{ color: "#a8a09a" }}>per month</div>
            </button>
          </div>

          {/* ── Disclosure — full price, renewal, cancel ── */}
          <div
            className="rounded-xl px-4 py-3 space-y-1.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-start gap-2 text-xs" style={{ color: "#c8bfb0" }}>
              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#6ee7b7" }} />
              <span>
                <strong style={{ color: "#f5f0e8" }}>
                  {selected === "annual" ? "Charged $39.99 today" : "Charged $4.99 today"}
                </strong>
                {selected === "annual"
                  ? " · renews yearly at $39.99"
                  : " · renews monthly at $4.99"}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs" style={{ color: "#c8bfb0" }}>
              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#6ee7b7" }} />
              <span>Cancel anytime from your profile — keep Pro until period ends</span>
            </div>
            <div className="flex items-start gap-2 text-xs" style={{ color: "#c8bfb0" }}>
              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#6ee7b7" }} />
              <span>Prices in USD + applicable tax · Processed by Stripe</span>
            </div>
          </div>

          {/* ── CTA ── */}
          <Button
            size="lg"
            className="w-full h-12 font-bold text-base"
            style={{ background: "#7c3aed", color: "#f5f0e8" }}
            onClick={() => upgrade(selected)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              selected === "annual" ? "Get Pro — $39.99/yr" : "Get Pro — $4.99/mo"
            )}
          </Button>

          <p className="text-[10px] text-center leading-relaxed" style={{ color: "#6b7280" }}>
            See our{" "}
            <a href="/terms" className="underline hover:opacity-80">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:opacity-80">Privacy Policy</a>
            . No hidden fees, no fake discounts, no fake reviews.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
