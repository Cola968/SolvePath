import { demoProblems } from '../data/problems';
import type { ProblemAnalysis } from '../domain/problem/schema';

export interface ProblemAnalyzer {
  analyze(text: string): Promise<ProblemAnalysis>;
}

export class UnsupportedProblemError extends Error {
  constructor() {
    super('Diese Aufgabe ist in der lokalen Demo noch nicht enthalten. Wähle eine der Beispielaufgaben.');
  }
}

const normalized = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export class MockProblemAnalyzer implements ProblemAnalyzer {
  async analyze(text: string): Promise<ProblemAnalysis> {
    const input = normalized(text);
    if (input.length < 10) throw new Error('Beschreibe die Aufgabe etwas genauer.');

    const exact = demoProblems.find((problem) => normalized(problem.originalText) === input);
    if (exact) return exact;

    const rules: [string, string[]][] = [
      ['satellite-orbit', ['satellit', 'bahngeschwindigkeit']],
      ['gravity-field', ['gravitationsfeldstärke', '400']],
      ['gravity-force', ['zwei körper', 'gravitationskraft']],
      ['kepler-third', ['planet', 'umlaufzeit']],
      ['linear-equation', ['3x', '20']],
      ['quadratic-equation', ['x²', '5x', '6']],
      ['trigonometry', ['gegenkathete', 'ankathete']],
      ['rate-of-change', ['weges', 'geschwindigkeit', 't']],
    ];
    const matchedId = rules.find(([, words]) => words.every((word) => input.includes(normalized(word))))?.[0];
    const problem = demoProblems.find((item) => item.id === matchedId);
    if (!problem) throw new UnsupportedProblemError();
    return problem;
  }
}

export const problemAnalyzer: ProblemAnalyzer = new MockProblemAnalyzer();
