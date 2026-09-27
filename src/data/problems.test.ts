import { describe, expect, it } from 'vitest';
import { demoProblems } from './problems';
import { problemAnalysisSchema } from '../domain/problem/schema';
import { MockProblemAnalyzer, UnsupportedProblemError } from '../services/problem-analyzer';

describe('demo data and analyzer', () => {
  it('validates eight complete tasks with all required hint levels', () => {
    expect(demoProblems).toHaveLength(8);
    expect(problemAnalysisSchema.array().safeParse(demoProblems).success).toBe(true);
    expect(demoProblems.filter((problem) => problem.subject === 'physics')).toHaveLength(4);
    expect(demoProblems.filter((problem) => problem.subject === 'math')).toHaveLength(4);
  });

  it('rejects an invalid hint ladder', () => {
    const invalid = { ...demoProblems[0], hints: demoProblems[0]!.hints.slice(1) };
    expect(problemAnalysisSchema.safeParse(invalid).success).toBe(false);
  });

  it('analyzes a selected demo text through the replaceable service', async () => {
    const analyzer = new MockProblemAnalyzer();
    expect((await analyzer.analyze(demoProblems[1]!.originalText)).id).toBe('satellite-orbit');
    await expect(analyzer.analyze('Eine völlig andere Aufgabe über Quantenoptik')).rejects.toBeInstanceOf(UnsupportedProblemError);
  });
});
