import { useState, useCallback } from 'react';
import type { OnboardingAnswers } from './types';

const KEY = 'hs_onboarding_v1';

function load(): Partial<OnboardingAnswers> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<OnboardingAnswers>) : {};
  } catch {
    return {};
  }
}

function save(answers: Partial<OnboardingAnswers>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // ignore storage errors
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function useOnboardingStore() {
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>(load);

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K],
  ) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers({});
    clear();
  }, []);

  return { answers, setAnswer, reset };
}
