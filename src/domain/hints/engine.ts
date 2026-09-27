import type { Hint, ProblemAnalysis } from '../problem/schema';

export type HintState = { revealedLevels: number[] };

export function getNextHint(problem: ProblemAnalysis, state: HintState): Hint | null {
  return problem.hints.find((hint) => !state.revealedLevels.includes(hint.level)) ?? null;
}

export function revealNextHint(problem: ProblemAnalysis, state: HintState): HintState {
  const next = getNextHint(problem, state);
  return next ? { revealedLevels: [...state.revealedLevels, next.level] } : state;
}

export function visibleHints(problem: ProblemAnalysis, state: HintState): Hint[] {
  return problem.hints.filter((hint) => state.revealedLevels.includes(hint.level));
}
