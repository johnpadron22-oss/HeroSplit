import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquarePlus, Sparkles, Bug, Dumbbell, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { db, id } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/hooks/use-workouts";

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "character",
    label: "Character Request",
    icon: Users,
    placeholder: "Which character should we add? (e.g. 'Goku Ultra Instinct workout', 'Spider-Man parkour program'...) What makes them special for training?",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    activeColor: "border-amber-500 bg-amber-500/20",
  },
  {
    id: "fitness",
    label: "My Fitness Journey",
    icon: Dumbbell,
    placeholder: "How is HeroSplit helping your training? What results have you seen? What would make it even better for your goals?",
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    activeColor: "border-cyan-500 bg-cyan-500/20",
  },
  {
    id: "general",
    label: "General Feedback",
    icon: Sparkles,
    placeholder: "What do you love? What's missing? What would make HeroSplit the app you use every single day?",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    activeColor: "border-purple-500 bg-purple-500/20",
  },
  {
    id: "bug",
    label: "Bug Report",
    icon: Bug,
    placeholder: "What went wrong? What did you expect to happen vs what actually happened? Steps to reproduce?",
    color: "border-red-500/40 bg-red-500/10 text-red-300",
    activeColor: "border-red-500 bg-red-500/20",
  },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

// ── Props ──────────────────────────────────────────────────────────────────────

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: UserProfile | null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function FeedbackDialog({ open, onOpenChange, profile }: FeedbackDialogProps) {
  const { user } = db.useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryId>("character");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedCat = CATEGORIES.find((c) => c.id === category)!;

  const handleSubmit = async () => {
    if (!user || !message.trim()) return;
    setIsPending(true);
    try {
      await db.transact([
        db.tx.feedback[id()].update({
          userId: user.id,
          category,
          message: message.trim(),
          submittedAt: Date.now(),
          ...(profile?.path           ? { path: profile.path }                     : {}),
          ...(profile?.archetype      ? { archetype: profile.archetype }           : {}),
          ...(profile?.experienceLevel ? { experienceLevel: profile.experienceLevel } : {}),
        }),
      ]);
      setSubmitted(true);
    } catch {
      toast({
        title: "Couldn't send feedback",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setMessage("");
      setCategory("character");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-white/10 p-0 overflow-hidden">
        {submitted ? (
          /* ── Thank you screen ── */
          <div className="p-8 text-center space-y-5">
            <div className="text-5xl">🙏</div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-black">Thanks for the intel!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every piece of feedback shapes what HeroSplit becomes next. We read every single one.
              </p>
            </div>
            <Button className="w-full rounded-full font-bold" onClick={handleClose}>
              Back to Training
            </Button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <div className="px-6 pt-6 pb-4 border-b border-white/5">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquarePlus className="w-5 h-5 text-purple-400" />
                  <DialogTitle className="text-lg font-display font-black">Share Your Insights</DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Characters you want. How we can improve. Your training wins. We want to hear it all.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-xs font-semibold",
                        isActive ? cat.activeColor : "border-white/10 bg-white/[0.02] hover:border-white/20 text-muted-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? cat.color.split(" ")[2] : "")} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedCat.placeholder}
                  className="min-h-[140px] resize-none bg-white/[0.02] border-white/10 focus:border-white/30 text-sm leading-relaxed"
                  maxLength={1000}
                />
                <div className="text-right text-[10px] text-muted-foreground">
                  {message.length}/1000
                </div>
              </div>

              <Button
                className="w-full h-11 font-bold rounded-full bg-white text-black hover:bg-gray-100"
                onClick={handleSubmit}
                disabled={!message.trim() || isPending}
              >
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : "Send Feedback →"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
