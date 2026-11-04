import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepOption } from '../types';

interface OptionCardProps {
  option: StepOption;
  selected: boolean;
  onSelect: (value: string) => void;
  multi?: boolean;
}

export function OptionCard({ option, selected, onSelect, multi }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={cn(
        'w-full text-left flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all duration-150 min-h-[64px]',
        'active:scale-[0.98]',
        selected
          ? 'border-cyan-500 bg-cyan-500/10'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]',
      )}
    >
      {option.icon && (
        <span className="text-xl w-7 text-center shrink-0">{option.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className={cn('font-semibold text-sm', selected && 'text-cyan-300')}>
          {option.label}
        </div>
        {option.description && (
          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {option.description}
          </div>
        )}
      </div>
      {multi ? (
        <div
          className={cn(
            'shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
            selected ? 'border-cyan-500 bg-cyan-500' : 'border-white/20',
          )}
        >
          {selected && <Check className="w-3 h-3 text-black" />}
        </div>
      ) : (
        <div
          className={cn(
            'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
            selected ? 'border-cyan-500' : 'border-white/20',
          )}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
        </div>
      )}
    </button>
  );
}
