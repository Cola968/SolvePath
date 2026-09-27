import { describe, expect, it } from 'vitest';
import { demoProblems } from '../../data/problems';
import { checkResult, detectMisconception } from './check';

const byId = (id: string) => demoProblems.find((problem) => problem.id === id)!;

describe('answer diagnostics', () => {
  it('recognizes radius versus height in the satellite task', () => {
    expect(detectMisconception(byId('satellite-orbit'), 'r = 400 km')?.id).toBe('radius_vs_height');
  });

  it('accepts rounded numeric results', () => {
    expect(checkResult(byId('satellite-orbit'), '7670 m/s').status).toBe('correct');
  });

  it('records a specific misconception instead of a generic wrong flag', () => {
    const result = checkResult(byId('rate-of-change'), '15 m/s');
    expect(result.status).toBe('misconception');
    if (result.status === 'misconception')
      expect(result.mistake.id).toBe('average_vs_instantaneous');
  });

  it('accepts both roots independent of their order', () => {
    expect(checkResult(byId('quadratic-equation'), '3 und 2').status).toBe('correct');
  });
});
