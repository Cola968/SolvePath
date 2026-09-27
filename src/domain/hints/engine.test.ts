import { describe, expect, it } from 'vitest';
import { demoProblems } from '../../data/problems';
import { getNextHint, revealNextHint, visibleHints } from './engine';

const problem = demoProblems.find((item) => item.id === 'satellite-orbit')!;

describe('Hint Ladder', () => {
  it('reveals exactly one next hint at a time', () => {
    const first = revealNextHint(problem, { revealedLevels: [] });
    expect(first.revealedLevels).toEqual([1]);
    expect(visibleHints(problem, first)).toHaveLength(1);
    expect(getNextHint(problem, first)?.level).toBe(2);
  });

  it('ends after six ordered levels', () => {
    let state = { revealedLevels: [] as number[] };
    for (let index = 0; index < 6; index++) state = revealNextHint(problem, state);
    expect(state.revealedLevels).toEqual([1, 2, 3, 4, 5, 6]);
    expect(getNextHint(problem, state)).toBeNull();
    expect(revealNextHint(problem, state)).toBe(state);
  });
});
