import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteAccount } from "@/hooks/use-workouts";

const CONFIRM_PHRASE = "DELETE";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const { deleteAccount, isPending } = useDeleteAccount();

  return (
    <div className="bg-card border border-destructive/20 p-5 rounded-2xl flex items-center justify-between gap-4">
      <div>
        <div className="font-semibold text-sm">Delete account</div>
        <div className="text-xs text-muted-foreground">
          Permanently erase your profile, workout history and feedback, and cancel any subscription.
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 border-destructive/40 text-destructive" onClick={() => setOpen(true)}>
        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
      </Button>

      <AlertDialog open={open} onOpenChange={(o) => { if (!isPending) { setOpen(o); setTyped(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your HeroSplit account?</AlertDialogTitle>
            <AlertDialogDescription>
              This erases your profile, every workout log, XP, streaks and feedback, cancels your Pro
              subscription immediately with no further charges, and removes your sign-in. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label htmlFor="delete-confirm" className="text-sm">
            Type <strong>{CONFIRM_PHRASE}</strong> to confirm
          </label>
          <Input id="delete-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Keep my account</AlertDialogCancel>
            <Button variant="destructive" disabled={typed !== CONFIRM_PHRASE || isPending} onClick={deleteAccount}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete permanently"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
