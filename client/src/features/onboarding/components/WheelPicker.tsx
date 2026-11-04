import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface WheelPickerProps {
  values: number[];
  selected: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

const ITEM_H = 56;
const VISIBLE = 5;

export function WheelPicker({ values, selected, onChange, label, className }: WheelPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const ignoreRef = useRef(false);

  const scrollToValue = useCallback((v: number, smooth = true) => {
    const el = listRef.current;
    if (!el) return;
    const idx = values.indexOf(v);
    if (idx === -1) return;
    ignoreRef.current = true;
    el.scrollTo({
      top: idx * ITEM_H,
      behavior: smooth ? 'smooth' : 'instant',
    });
    setTimeout(() => { ignoreRef.current = false; }, 400);
  }, [values]);

  useEffect(() => {
    scrollToValue(selected, false);
  }, []); // only on mount

  const onScroll = useCallback(() => {
    if (ignoreRef.current) return;
    const el = listRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, values.length - 1));
    const newVal = values[clamped];
    if (newVal !== selected) {
      onChange(newVal);
    }
  }, [values, selected, onChange]);

  const containerH = ITEM_H * VISIBLE;
  const padH = ITEM_H * Math.floor(VISIBLE / 2);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        style={{ height: containerH, width: 120 }}
      >
        {/* center highlight */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10 border-y border-cyan-500/40 bg-cyan-500/5"
          style={{ top: padH, height: ITEM_H }}
        />
        {/* fades */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        <div
          ref={listRef}
          className="overflow-y-scroll h-full"
          style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
          onScroll={onScroll}
        >
          {/* top padding */}
          <div style={{ height: padH }} />
          {values.map((v) => (
            <div
              key={v}
              onClick={() => { onChange(v); scrollToValue(v); }}
              className={cn(
                'flex items-center justify-center cursor-pointer select-none transition-all',
                v === selected ? 'text-white font-bold text-2xl' : 'text-muted-foreground text-lg opacity-50',
              )}
              style={{ height: ITEM_H, scrollSnapAlign: 'start' }}
            >
              {v}
            </div>
          ))}
          {/* bottom padding */}
          <div style={{ height: padH }} />
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
    </div>
  );
}
