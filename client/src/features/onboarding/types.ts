export type Sex = 'male' | 'female' | 'unspecified';
export type Goal = 'build_muscle' | 'lose_fat' | 'get_stronger' | 'stay_in_shape';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Archetype = 'powerhouse' | 'speedster' | 'warrior' | 'all_rounder';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Limitation = 'none' | 'knees' | 'hips' | 'lower_back' | 'shoulders' | 'wrists' | 'no_jumping';
export type Equipment = 'bodyweight' | 'full_gym' | 'barbell' | 'dumbbells' | 'kettlebells' | 'machines' | 'bands';

export interface OnboardingAnswers {
  sex?: Sex;
  goal?: Goal;
  motivations?: string[];
  focusAreas?: string[];
  fitnessLevel?: FitnessLevel;
  archetype?: Archetype;
  activityLevel?: ActivityLevel;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  unitSystem?: 'imperial' | 'metric';
  limitations?: Limitation[];
  equipment?: Equipment[];
  daysPerWeek?: number;
  trainingDays?: Day[];
  remindersEnabled?: boolean;
}

export type StepKind = 'single' | 'multi' | 'wheel' | 'height' | 'schedule';

export interface StepOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  exclusive?: boolean;
}

export interface StepConfig {
  id: string;
  title: string;
  subtitle?: string;
  kind: StepKind;
  field: keyof OnboardingAnswers;
  options?: StepOption[];
  defaultValue?: unknown;
  required: boolean;
  skipIf?: (a: Partial<OnboardingAnswers>) => boolean;
  validate?: (a: Partial<OnboardingAnswers>) => string | null;
}

export interface PlanResult {
  archetype: Archetype;
  archetypeName: string;
  archetypeEmoji: string;
  splitName: string;
  daysPerWeek: number;
  trainingDays: Day[];
  calorieTarget: number;
  goalLabel: string;
}
