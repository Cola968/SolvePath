import type { CommonMistake, ProblemAnalysis } from '../problem/schema';

export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ');
}

function numericAnswer(input: string): number | null {
  const normalized = normalizeAnswer(input).replace(/\s/g, '');
  const match = normalized.match(/^[a-z]?\s*=?\s*(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)/);
  return match ? Number(match[1]) : null;
}

export function detectMisconception(problem: ProblemAnalysis, input: string): CommonMistake | null {
  const normalized = normalizeAnswer(input);
  return problem.commonMistakes.find((mistake) =>
    mistake.triggers.some((trigger) => normalized.includes(normalizeAnswer(trigger))),
  ) ?? null;
}

export type AnswerCheck =
  | { status: 'correct'; message: string }
  | { status: 'misconception'; message: string; mistake: CommonMistake }
  | { status: 'retry'; message: string };

export function checkResult(problem: ProblemAnalysis, input: string): AnswerCheck {
  const normalized = normalizeAnswer(input);
  if (!normalized) return { status: 'retry', message: 'Gib zuerst dein eigenes Ergebnis ein.' };

  const { correctResult } = problem;
  if (correctResult.acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalized)) {
    return { status: 'correct', message: correctResult.explanation };
  }
  const numeric = numericAnswer(input);
  if (
    numeric !== null &&
    correctResult.numericValue !== undefined &&
    Math.abs(numeric - correctResult.numericValue) <= (correctResult.tolerance ?? 0)
  ) {
    return { status: 'correct', message: correctResult.explanation };
  }
  const mistake = detectMisconception(problem, input);
  if (mistake) return { status: 'misconception', message: mistake.explanation, mistake };
  return { status: 'retry', message: 'Das passt noch nicht. Prüfe deinen Ansatz, die Einheiten und den letzten Rechenschritt.' };
}

export function checkStepAnswer(expected: string, input: string): boolean {
  const clean = (value: string) => normalizeAnswer(value).replace(/\s/g, '');
  return clean(expected) === clean(input);
}
