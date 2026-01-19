import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Loader2 } from "lucide-react";
import { useTogglePro } from "@/hooks/use-workouts";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaywallDialog({ open, onOpenChange }: PaywallDialogProps) {
  const { mutate: togglePro, isPending } = useTogglePro();

  const handleSubscribe = () => {
    togglePro(true, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-background border-purple-500/20">
        <DialogHeader className="text-center space-y-4 pt-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
            <Crown className="w-6 h-6 text-purple-400" />
          </div>
          <DialogTitle className="text-2xl font-display">Unlock Villain Mode</DialogTitle>
          <DialogDescription className="text-base">
            Push your limits with intense, high-volume workouts designed for absolute power.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {[
            "Access all Villain Tier workouts",
            "Advanced analytics & progress tracking",
            "God-level difficulty challenges",
            "Custom workout builder"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-sm font-medium">{feature}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-3 sm:gap-0">
          <Button 
            size="lg" 
            className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/25 transition-all"
            onClick={handleSubscribe}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "Get Pro Access - $4.99/mo"
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            This is a demo. No actual payment will be processed.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
