import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Loader2, Zap } from "lucide-react";
import { useUpgradePro } from "@/hooks/use-workouts";
import { cn } from "@/lib/utils";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  "All Villain Tier workouts",
  "All Anime Arc workouts (DBZ, Naruto, JJK, One Piece…)",
  "Nemesis Series: Push / Pull / Legs + Hypertrophy",
  "Full workout history with sets & weights",
  "XP tracking & rank progression",
];

export function PaywallDialog({ open, onOpenChange }: PaywallDialogProps) {
  const { upgrade, isPending } = useUpgradePro();
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-background border-purple-500/20 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center space-y-3 bg-gradient-to-b from-purple-950/60 to-transparent">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
            <Crown className="w-7 h-7 text-purple-400" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Unlock Villain Mode</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Push your limits with intense workouts designed for absolute power.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Features */}
          <div className="space-y-2.5">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-2">
            {/* Annual */}
            <button
              onClick={() => setSelected("annual")}
              className={cn(
                "relative p-3 rounded-xl border-2 text-left transition-all",
                selected === "annual"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              )}
            >
              {/* Best value badge */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-0.5 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Zap className="w-2.5 h-2.5" /> BEST VALUE
                </div>
              </div>
              <div className="text-sm font-bold mt-1">Annual</div>
              <div className="text-xl font-display font-black">$39.99</div>
              <div className="text-[10px] text-muted-foreground">per year · save 33%</div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => setSelected("monthly")}
              className={cn(
                "p-3 rounded-xl border-2 text-left transition-all",
                selected === "monthly"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              )}
            >
              <div className="text-sm font-bold">Monthly</div>
              <div className="text-xl font-display font-black">$4.99</div>
              <div className="text-[10px] text-muted-foreground">per month</div>
            </button>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/25 font-bold text-base"
            onClick={() => upgrade(selected)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <>
                {selected === "annual"
                  ? "Get Pro — $39.99/yr"
                  : "Get Pro — $4.99/mo"}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secured by Stripe · Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
