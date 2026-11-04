import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useWorkouts } from "@/hooks/use-workouts";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dumbbell, TrendingUp, LogOut, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CommandMenuProps {
  isPro: boolean;
  onNavigate?: (tab: string) => void;
  onUpgrade?: () => void;
}

export function CommandMenu({ isPro, onNavigate, onUpgrade }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { data: heroWorkouts } = useWorkouts("hero");
  const { data: villainWorkouts } = useWorkouts("villain");

  // Detail 3: Cmd/Ctrl+K opens the command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((fn: () => void) => {
    setOpen(false);
    fn();
  }, []);

  const freeWorkouts = heroWorkouts.filter((w) => !w.isPro);
  const proWorkouts = [...heroWorkouts.filter((w) => w.isPro), ...villainWorkouts].slice(0, 8);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search workouts or actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Free Workouts">
          {freeWorkouts.map((w) => (
            <CommandItem
              key={w.id}
              onSelect={() => runCommand(() => navigate(`/workout/${w.slug}`))}
              className="gap-2"
            >
              <span className="text-base">{w.avatarEmoji ?? "🏋️"}</span>
              <span>{w.name}</span>
              <CommandShortcut>{w.difficulty}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        {isPro && proWorkouts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pro Workouts">
              {proWorkouts.map((w) => (
                <CommandItem
                  key={w.id}
                  onSelect={() => runCommand(() => navigate(`/workout/${w.slug}`))}
                  className="gap-2"
                >
                  <span className="text-base">{w.avatarEmoji ?? "⚡"}</span>
                  <span>{w.name}</span>
                  <CommandShortcut>{w.difficulty}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => onNavigate?.("browse"))} className="gap-2">
            <Dumbbell className="w-4 h-4" />
            <span>Hero Workouts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate?.("progress"))} className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>My Progress</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          {!isPro && onUpgrade && (
            <CommandItem onSelect={() => runCommand(onUpgrade)} className="gap-2 text-purple-400">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Upgrade to Pro</span>
            </CommandItem>
          )}
          <CommandItem
            onSelect={() => runCommand(async () => { await supabase.auth.signOut(); })}
            className="gap-2 text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
