import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LootItem {
  emoji: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
}

const HERO_LOOT: LootItem[] = [
  { emoji: "⚔️", name: "Iron Sword",        rarity: "common",    description: "+5 STR" },
  { emoji: "🛡️", name: "Rookie Shield",      rarity: "common",    description: "+5 DEF" },
  { emoji: "🧪", name: "Recovery Potion",    rarity: "common",    description: "Restore 20 HP" },
  { emoji: "🏹", name: "Swift Bow",          rarity: "rare",      description: "+10 AGI" },
  { emoji: "🪄", name: "Focus Wand",         rarity: "rare",      description: "+15 WIS" },
  { emoji: "💎", name: "Power Crystal",      rarity: "epic",      description: "+25 all stats" },
  { emoji: "🦅", name: "Eagle Emblem",       rarity: "epic",      description: "+30 STR" },
  { emoji: "⚡", name: "Lightning Gauntlet", rarity: "legendary", description: "+50 STR" },
];

const VILLAIN_LOOT: LootItem[] = [
  { emoji: "🗡️", name: "Shadow Dagger",     rarity: "common",    description: "+5 STR" },
  { emoji: "💀", name: "Bone Charm",         rarity: "common",    description: "+5 PWR" },
  { emoji: "🧿", name: "Dark Elixir",        rarity: "common",    description: "+20 HP" },
  { emoji: "🌀", name: "Void Orb",           rarity: "rare",      description: "+10 MGC" },
  { emoji: "🩸", name: "Blood Ring",         rarity: "rare",      description: "+15 STR" },
  { emoji: "☠️", name: "Cursed Artifact",    rarity: "epic",      description: "+25 all stats" },
  { emoji: "🔮", name: "Sorcerer's Eye",     rarity: "epic",      description: "+30 MGC" },
  { emoji: "👑", name: "Villain Crown",      rarity: "legendary", description: "+50 all stats" },
];

const RARITY_STYLES = {
  common:    { label: "Common",    border: "border-gray-500/40",   bg: "bg-gray-500/10",   text: "text-gray-300",   glow: "" },
  rare:      { label: "Rare",      border: "border-blue-500/50",   bg: "bg-blue-500/10",   text: "text-blue-300",   glow: "shadow-blue-500/30" },
  epic:      { label: "Epic",      border: "border-purple-500/60", bg: "bg-purple-500/15", text: "text-purple-300", glow: "shadow-purple-500/40" },
  legendary: { label: "Legendary", border: "border-yellow-500/70", bg: "bg-yellow-500/15", text: "text-yellow-300", glow: "shadow-yellow-500/50" },
};

function weightedRandom(pool: LootItem[]): LootItem {
  const weights = { common: 55, rare: 30, epic: 12, legendary: 3 };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  const rarities = (["legendary", "epic", "rare", "common"] as const).sort(
    (a, b) => weights[a] - weights[b]
  );
  // Pick rarity
  const rarityWeights = (["common", "rare", "epic", "legendary"] as const);
  let picked: LootItem["rarity"] = "common";
  for (const r of rarityWeights) {
    rand -= weights[r];
    if (rand <= 0) { picked = r; break; }
  }
  const inRarity = pool.filter((l) => l.rarity === picked);
  if (!inRarity.length) return pool[Math.floor(Math.random() * pool.length)];
  return inRarity[Math.floor(Math.random() * inRarity.length)];
}

interface LootDropProps {
  isVillain?: boolean;
  onClose: () => void;
}

export function LootDrop({ isVillain, onClose }: LootDropProps) {
  const [loot] = useState<LootItem>(() =>
    weightedRandom(isVillain ? VILLAIN_LOOT : HERO_LOOT)
  );
  const style = RARITY_STYLES[loot.rarity];

  // Auto-dismiss after 4s
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-64"
        onClick={onClose}
      >
        <div className={cn(
          "rounded-2xl border-2 p-4 text-center shadow-xl cursor-pointer select-none",
          style.border,
          style.bg,
          loot.rarity !== "common" ? `shadow-lg ${style.glow}` : ""
        )}>
          {/* Shimmer for rare+ */}
          {loot.rarity !== "common" && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.5 }}
            />
          )}

          <div className="relative z-10 space-y-2">
            {/* Drop label */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Loot Drop!
            </div>

            {/* Emoji */}
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl"
            >
              {loot.emoji}
            </motion.div>

            {/* Rarity badge */}
            <div className={cn("text-xs font-bold uppercase tracking-wider", style.text)}>
              {style.label}
            </div>

            {/* Item name + stat */}
            <div>
              <div className="font-display font-black text-lg leading-tight">{loot.name}</div>
              <div className={cn("text-sm font-semibold", style.text)}>{loot.description}</div>
            </div>

            <div className="text-[10px] text-muted-foreground mt-1">tap to dismiss</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
