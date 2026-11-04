import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Day } from '../types';

const ALL_DAYS: { key: Day; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

interface DayChipsProps {
  selected: Day[];
  maxDays: number;
  onChange: (days: Day[]) => void;
}

export function DayChips({ selected, maxDays, onChange }: DayChipsProps) {
  const [shaking, setShaking] = useState<Day | null>(null);

  const toggle = (day: Day) => {
    const isSelected = selected.includes(day);
    if (isSelected) {
      onChange(selected.filter((d) => d !== day));
    } else if (selected.length < maxDays) {
      onChange([...selected, day]);
    } else {
      setShaking(day);
      setTimeout(() => setShaking(null), 500);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {ALL_DAYS.map(({ key, label }) => {
        const isSelected = selected.includes(key);
        const isShaking = shaking === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={cn(
              'h-12 w-14 rounded-xl text-sm font-bold border-2 transition-all duration-150',
              'active:scale-95',
              isSelected
                ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25',
              isShaking && 'animate-[shake_0.4s_ease-in-out]',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
