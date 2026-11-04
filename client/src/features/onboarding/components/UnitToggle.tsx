import { cn } from '@/lib/utils';

interface UnitToggleProps {
  unit: 'imperial' | 'metric';
  onChange: (unit: 'imperial' | 'metric') => void;
  imperialLabel: string;
  metricLabel: string;
}

export function UnitToggle({ unit, onChange, imperialLabel, metricLabel }: UnitToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/10">
      <button
        type="button"
        onClick={() => onChange('imperial')}
        className={cn(
          'px-4 py-1.5 rounded-full text-xs font-bold transition-all min-w-[44px]',
          unit === 'imperial' ? 'bg-cyan-500 text-black shadow' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {imperialLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('metric')}
        className={cn(
          'px-4 py-1.5 rounded-full text-xs font-bold transition-all min-w-[44px]',
          unit === 'metric' ? 'bg-cyan-500 text-black shadow' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {metricLabel}
      </button>
    </div>
  );
}
