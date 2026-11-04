import type { OnboardingAnswers, PlanResult, Day, Archetype } from './types';

const ARCHETYPE_META: Record<Archetype, { name: string; emoji: string }> = {
  powerhouse:   { name: 'Powerhouse',  emoji: '⚡' },
  speedster:    { name: 'Speedster',   emoji: '💨' },
  warrior:      { name: 'Warrior',     emoji: '⚔️' },
  all_rounder:  { name: 'All-Rounder', emoji: '🌟' },
};

const SPLIT_NAMES: Record<number, string> = {
  2: 'Full Body A/B',
  3: 'Full Body A/B/C',
  4: 'Upper / Lower',
  5: 'Push / Pull / Legs + Upper / Lower',
  6: 'Push / Pull / Legs ×2',
};

const ACTIVITY_MULTIPLIER: Record<string, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  very_active: 1.725,
};

const GOAL_ADJUSTMENT: Record<string, number> = {
  build_muscle:  300,
  lose_fat:      -400,
  get_stronger:  150,
  stay_in_shape: 0,
};

const GOAL_LABELS: Record<string, string> = {
  build_muscle:  'Build Muscle',
  lose_fat:      'Lose Fat',
  get_stronger:  'Get Stronger',
  stay_in_shape: 'Stay in Shape',
};

function bmr(a: Partial<OnboardingAnswers>): number {
  const w = a.weightKg ?? 75;
  const h = a.heightCm ?? 170;
  const age = a.age ?? 25;
  const maleBmr   = 10 * w + 6.25 * h - 5 * age + 5;
  const femaleBmr = 10 * w + 6.25 * h - 5 * age - 161;
  if (a.sex === 'male')   return maleBmr;
  if (a.sex === 'female') return femaleBmr;
  return (maleBmr + femaleBmr) / 2;
}

const DEFAULT_DAYS_FOR_COUNT: Record<number, Day[]> = {
  2: ['mon', 'thu'],
  3: ['mon', 'wed', 'fri'],
  4: ['mon', 'tue', 'thu', 'fri'],
  5: ['mon', 'tue', 'wed', 'fri', 'sat'],
  6: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
};

export function generatePlan(a: Partial<OnboardingAnswers>): PlanResult {
  const archetype = a.archetype ?? 'all_rounder';
  const meta = ARCHETYPE_META[archetype];
  const days = a.daysPerWeek ?? 4;
  const splitName = SPLIT_NAMES[days] ?? 'Upper / Lower';
  const trainingDays: Day[] = a.trainingDays?.length === days
    ? a.trainingDays
    : DEFAULT_DAYS_FOR_COUNT[days] ?? ['mon', 'wed', 'fri', 'sat'];

  const actMult = ACTIVITY_MULTIPLIER[a.activityLevel ?? 'moderate'];
  const goalAdj = GOAL_ADJUSTMENT[a.goal ?? 'build_muscle'];
  const calorieTarget = Math.round(bmr(a) * actMult + goalAdj);

  return {
    archetype,
    archetypeName: meta.name,
    archetypeEmoji: meta.emoji,
    splitName,
    daysPerWeek: days,
    trainingDays,
    calorieTarget: Math.max(1200, calorieTarget),
    goalLabel: GOAL_LABELS[a.goal ?? 'build_muscle'] ?? 'Build Muscle',
  };
}
