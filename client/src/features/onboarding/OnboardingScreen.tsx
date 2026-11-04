import { useState, useEffect } from 'react';
import { OptionCard } from './components/OptionCard';
import { WheelPicker } from './components/WheelPicker';
import { UnitToggle } from './components/UnitToggle';
import { DayChips } from './components/DayChips';
import { StickyCTA } from './components/StickyCTA';
import { cn } from '@/lib/utils';
import type { StepConfig, OnboardingAnswers, Day } from './types';
import { Bell, BellOff } from 'lucide-react';

// range helper
function range(from: number, to: number): number[] {
  const arr: number[] = [];
  for (let i = from; i <= to; i++) arr.push(i);
  return arr;
}

function cmToFtIn(cm: number): [number, number] {
  const totalIn = cm / 2.54;
  return [Math.floor(totalIn / 12), Math.round(totalIn % 12)];
}
function ftInToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}
function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}
function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462);
}

interface OnboardingScreenProps {
  step: StepConfig;
  answers: Partial<OnboardingAnswers>;
  onAnswer: (field: keyof OnboardingAnswers, value: OnboardingAnswers[typeof field]) => void;
  onContinue: () => void;
  stepIndex: number;
  totalSteps: number;
}

export function OnboardingScreen({
  step,
  answers,
  onAnswer,
  onContinue,
  stepIndex,
  totalSteps,
}: OnboardingScreenProps) {
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>(
    answers.unitSystem ?? 'imperial',
  );

  const handleUnitChange = (u: 'imperial' | 'metric') => {
    setUnitSystem(u);
    onAnswer('unitSystem', u);
  };

  // ── Single select ──────────────────────────────────────────────────────────
  if (step.kind === 'single') {
    const currentVal = answers[step.field] as string | undefined;

    const handleSelect = (val: string) => {
      onAnswer(step.field, val as OnboardingAnswers[typeof step.field]);
      // auto-advance after short delay for single select
      setTimeout(onContinue, 250);
    };

    return (
      <div className="space-y-3">
        {step.options?.map((opt) => (
          <OptionCard
            key={opt.value}
            option={opt}
            selected={currentVal === opt.value}
            onSelect={handleSelect}
            multi={false}
          />
        ))}
      </div>
    );
  }

  // ── Multi select ───────────────────────────────────────────────────────────
  if (step.kind === 'multi') {
    const currentVal = (answers[step.field] as string[] | undefined) ??
      (Array.isArray(step.defaultValue) ? (step.defaultValue as string[]) : []);

    const handleSelect = (val: string) => {
      const opt = step.options?.find((o) => o.value === val);
      if (!opt) return;

      if (opt.exclusive) {
        // selecting an exclusive option clears the rest
        onAnswer(step.field, [val] as OnboardingAnswers[typeof step.field]);
      } else {
        const withoutExclusives = currentVal.filter((v) => {
          const o = step.options?.find((x) => x.value === v);
          return !o?.exclusive;
        });
        const isSelected = withoutExclusives.includes(val);
        const next = isSelected
          ? withoutExclusives.filter((v) => v !== val)
          : [...withoutExclusives, val];
        onAnswer(step.field, next as OnboardingAnswers[typeof step.field]);
      }
    };

    const isValid = currentVal.length >= 1;

    return (
      <div className="space-y-3">
        {step.options?.map((opt) => (
          <OptionCard
            key={opt.value}
            option={opt}
            selected={currentVal.includes(opt.value)}
            onSelect={handleSelect}
            multi
          />
        ))}
        <StickyCTA
          label="Continue"
          onClick={onContinue}
          disabled={!isValid}
          helperText="Select at least one option"
        />
      </div>
    );
  }

  // ── Wheel (age / weight) ───────────────────────────────────────────────────
  if (step.kind === 'wheel') {
    const isWeight = step.field === 'weightKg' || step.field === 'targetWeightKg';

    if (isWeight) {
      const storedKg = (answers[step.field] as number | undefined) ??
        (step.field === 'targetWeightKg' ? (answers.weightKg ?? 75) : (typeof step.defaultValue === 'number' ? step.defaultValue : 75));
      const isImperial = unitSystem === 'imperial';
      const displayVal = isImperial ? kgToLbs(storedKg) : storedKg;
      const vals = isImperial ? range(66, 440) : range(30, 200);

      const handleChange = (v: number) => {
        const kg = isImperial ? lbsToKg(v) : v;
        onAnswer(step.field, kg as OnboardingAnswers[typeof step.field]);
      };

      const isValid = !!(answers[step.field] ?? step.defaultValue !== undefined);
      const validationError = step.validate?.(answers);

      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <UnitToggle
              unit={unitSystem}
              onChange={handleUnitChange}
              imperialLabel="lbs"
              metricLabel="kg"
            />
            <WheelPicker
              values={vals}
              selected={displayVal}
              onChange={handleChange}
              label={isImperial ? 'lbs' : 'kg'}
            />
            {validationError && (
              <p className="text-xs text-amber-400">{validationError}</p>
            )}
          </div>
          {step.required ? (
            <StickyCTA label="Continue" onClick={onContinue} disabled={!isValid || !!validationError} />
          ) : (
            <div className="space-y-3">
              <StickyCTA label="Continue" onClick={onContinue} disabled={!!validationError} />
              <button
                type="button"
                onClick={onContinue}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      );
    }

    // Age wheel
    const ageVal = (answers.age as number | undefined) ?? (typeof step.defaultValue === 'number' ? step.defaultValue : 25);
    const validationError = step.validate?.(answers);

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <WheelPicker
            values={range(13, 90)}
            selected={ageVal}
            onChange={(v) => onAnswer('age', v)}
            label="years"
          />
          {validationError && (
            <p className="mt-3 text-xs text-amber-400">{validationError}</p>
          )}
        </div>
        <StickyCTA label="Continue" onClick={onContinue} disabled={!!validationError} />
      </div>
    );
  }

  // ── Height ─────────────────────────────────────────────────────────────────
  if (step.kind === 'height') {
    const storedCm = (answers.heightCm as number | undefined) ?? 170;
    const isImperial = unitSystem === 'imperial';
    const [ft, inch] = cmToFtIn(storedCm);

    const handleFtChange = (v: number) => {
      onAnswer('heightCm', ftInToCm(v, inch));
    };
    const handleInChange = (v: number) => {
      onAnswer('heightCm', ftInToCm(ft, v));
    };
    const handleCmChange = (v: number) => {
      onAnswer('heightCm', v);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <UnitToggle
            unit={unitSystem}
            onChange={handleUnitChange}
            imperialLabel="ft/in"
            metricLabel="cm"
          />
          {isImperial ? (
            <div className="flex gap-6">
              <WheelPicker values={range(3, 8)} selected={ft} onChange={handleFtChange} label="ft" />
              <WheelPicker values={range(0, 11)} selected={inch} onChange={handleInChange} label="in" />
            </div>
          ) : (
            <WheelPicker values={range(100, 250)} selected={storedCm} onChange={handleCmChange} label="cm" />
          )}
        </div>
        <StickyCTA label="Continue" onClick={onContinue} />
      </div>
    );
  }

  // ── Schedule ───────────────────────────────────────────────────────────────
  if (step.kind === 'schedule') {
    const daysPerWeek = (answers.daysPerWeek as number | undefined) ?? (typeof step.defaultValue === 'number' ? step.defaultValue : 4);
    const trainingDays = (answers.trainingDays as Day[] | undefined) ?? [];
    const reminders = answers.remindersEnabled ?? true;

    const handleDaysPerWeek = (v: number) => {
      onAnswer('daysPerWeek', v);
      // trim selected days if over new limit
      if (trainingDays.length > v) {
        onAnswer('trainingDays', trainingDays.slice(0, v) as OnboardingAnswers['trainingDays']);
      }
    };

    const isValid = trainingDays.length === daysPerWeek;

    return (
      <div className="space-y-6">
        {/* Days per week slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Days per week</span>
            <span className="text-5xl font-display font-black text-cyan-400">{daysPerWeek}x</span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            value={daysPerWeek}
            onChange={(e) => handleDaysPerWeek(Number(e.target.value))}
            className="w-full accent-cyan-500 h-2 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span>
            <span>6</span>
          </div>
        </div>

        {/* Day chips */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Pick exactly {daysPerWeek} day{daysPerWeek > 1 ? 's' : ''}
          </p>
          <DayChips
            selected={trainingDays}
            maxDays={daysPerWeek}
            onChange={(days) => onAnswer('trainingDays', days as OnboardingAnswers['trainingDays'])}
          />
        </div>

        {/* Reminder toggle */}
        <button
          type="button"
          onClick={() => onAnswer('remindersEnabled', !reminders)}
          className={cn(
            'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
            reminders ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 bg-white/[0.02]',
          )}
        >
          <div className="flex items-center gap-3">
            {reminders ? (
              <Bell className="w-4 h-4 text-cyan-400" />
            ) : (
              <BellOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={cn('text-sm font-semibold', reminders ? 'text-cyan-300' : 'text-muted-foreground')}>
              Workout reminders
            </span>
          </div>
          <div
            className={cn(
              'w-11 h-6 rounded-full transition-all relative',
              reminders ? 'bg-cyan-500' : 'bg-white/10',
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
                reminders ? 'left-6' : 'left-1',
              )}
            />
          </div>
        </button>

        <StickyCTA
          label="Build my plan →"
          onClick={onContinue}
          disabled={!isValid}
          helperText={`Select ${daysPerWeek - trainingDays.length} more day${daysPerWeek - trainingDays.length !== 1 ? 's' : ''}`}
        />
      </div>
    );
  }

  return null;
}
