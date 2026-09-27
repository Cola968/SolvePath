import { describe, expect, it } from 'vitest';
import { problemAnalysisSchema } from '../domain/problem/schema';
import { LocalProblemAnalyzer } from './local-problem-analyzer';

describe('LocalProblemAnalyzer', () => {
  const analyzer = new LocalProblemAnalyzer();

  it('solves a free linear equation locally', async () => {
    const problem = await analyzer.analyze('Löse 3x + 5 = 20.');
    expect(problem.correctResult.numericValue).toBe(5);
    expect(problem.subject).toBe('math');
    expect(problemAnalysisSchema.safeParse(problem).success).toBe(true);
  });

  it('solves a percentage task locally', async () => {
    const problem = await analyzer.analyze('Wie viel sind 15 % von 240?');
    expect(problem.correctResult.numericValue).toBe(36);
    expect(problemAnalysisSchema.safeParse(problem).success).toBe(true);
  });

  it('solves a free arithmetic expression locally', async () => {
    const problem = await analyzer.analyze('Berechne 4 + 3 * 2.');
    expect(problem.correctResult.numericValue).toBe(10);
    expect(problemAnalysisSchema.safeParse(problem).success).toBe(true);
  });

  it('solves a slope task from two points', async () => {
    const problem = await analyzer.analyze(
      'Bestimme die Steigung der Geraden durch A(2|5) und B(6|13).',
    );
    expect(problem.correctResult.numericValue).toBe(2);
    expect(problemAnalysisSchema.safeParse(problem).success).toBe(true);
  });

  it('solves a Pythagoras task locally', async () => {
    const problem = await analyzer.analyze(
      'Ein rechtwinkliges Dreieck hat die Katheten 3 cm und 4 cm. Bestimme die Hypotenuse.',
    );
    expect(problem.correctResult.numericValue).toBe(5);
    expect(problemAnalysisSchema.safeParse(problem).success).toBe(true);
  });

  it('solves an Ohm task locally', async () => {
    const problem = await analyzer.analyze(
      'An einem Widerstand von 10 Ohm fließt ein Strom von 2 A. Bestimme die Spannung.',
    );
    expect(problem.correctResult.numericValue).toBe(20);
    expect(problem.correctResult.unit).toBe('V');
    expect(problemAnalysisSchema.safeParse(problem).success).toBe(true);
  });

  it('refuses unsupported free-form tasks instead of inventing a result', async () => {
    await expect(
      analyzer.analyze('Erkläre irgendeine völlig unbekannte Aufgabe ohne Zahlen.'),
    ).rejects.toThrow('noch nicht sicher');
  });
});
