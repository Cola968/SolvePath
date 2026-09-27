import type { CommonMistake, ProblemAnalysis } from '../problem/schema';
import { parseQuantity, sameQuantity, unitInfo } from './quantity';

export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ');
}

function expectedUnit(problem: ProblemAnalysis): string | null {
  return problem.correctResult.unit ?? parseQuantity(problem.correctResult.display)?.unit ?? null;
}

function approximate(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.max(1e-10, Math.abs(b) * 0.005);
}

function matchesCode(problem: ProblemAnalysis, mistake: CommonMistake, input: string): boolean {
  const parsed = parseQuantity(input);
  const target = problem.correctResult.numericValue;
  if (!parsed || target === undefined) return false;
  const expected = unitInfo(expectedUnit(problem));
  const actual = unitInfo(parsed.unit);
  if (parsed.unit && expected && actual?.dimension !== expected.dimension) return false;
  const value = parsed.value * (actual?.scale ?? 1);
  const correct = target * (expected?.scale ?? 1);
  switch (mistake.code ?? mistake.id) {
    case 'wrong_unit_conversion':
      return approximate(value, correct * 1000) || approximate(value, correct / 1000);
    case 'sign_error':
      return approximate(value, -correct);
    case 'wrong_exponent':
      return [10, 100, 1000].some(
        (factor) => approximate(value, correct * factor) || approximate(value, correct / factor),
      );
    default:
      return false;
  }
}

export function detectMisconception(problem: ProblemAnalysis, input: string): CommonMistake | null {
  const normalized = normalizeAnswer(input);
  const parsed = parseQuantity(input);
  return (
    problem.commonMistakes.find((mistake) => {
      if (matchesCode(problem, mistake, input)) return true;
      return mistake.triggers.some((trigger) => {
        const clean = normalizeAnswer(trigger);
        const triggerQuantity = parseQuantity(trigger);
        if (parsed && triggerQuantity) {
          if (
            triggerQuantity.unit &&
            parsed.unit &&
            !sameQuantity(
              parsed,
              triggerQuantity.value,
              triggerQuantity.unit,
              Math.abs(triggerQuantity.value) * 0.005,
            )
          )
            return false;
          return approximate(parsed.value, triggerQuantity.value);
        }
        return clean.length >= 4 && normalized.includes(clean);
      });
    }) ?? null
  );
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
  const numeric = parseQuantity(input);
  if (
    numeric &&
    correctResult.numericValue !== undefined &&
    sameQuantity(
      numeric,
      correctResult.numericValue,
      expectedUnit(problem),
      correctResult.tolerance ?? 0,
    )
  ) {
    return { status: 'correct', message: correctResult.explanation };
  }
  const mistake = detectMisconception(problem, input);
  if (mistake) return { status: 'misconception', message: mistake.explanation, mistake };
  return {
    status: 'retry',
    message:
      'Das passt noch nicht. Prüfe deinen Ansatz, die Einheiten und den letzten Rechenschritt.',
  };
}

export function checkStepAnswer(expected: string, input: string): boolean {
  const clean = (value: string) => normalizeAnswer(value).replace(/\s/g, '');
  return clean(expected) === clean(input);
}
