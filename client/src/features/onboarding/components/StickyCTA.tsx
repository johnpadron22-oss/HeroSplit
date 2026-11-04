import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StickyCTAProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  helperText?: string;
}

export function StickyCTA({ label, onClick, disabled, loading, helperText }: StickyCTAProps) {
  return (
    <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-background via-background/90 to-transparent">
      {helperText && disabled && (
        <p className="text-center text-xs text-muted-foreground mb-3">{helperText}</p>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200',
          disabled || loading
            ? 'bg-white/[0.08] text-white/40 cursor-not-allowed opacity-40'
            : 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-[0.98] shadow-lg shadow-cyan-900/30',
        )}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {label}
      </button>
    </div>
  );
}
