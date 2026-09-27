import { demoProblems } from '../data/problems';
import type { ProblemAnalysis } from '../domain/problem/schema';
import { problemAnalysisSchema } from '../domain/problem/schema';
import { getSubscriptionAppUserId } from './subscription-identity';

export type AnalysisImage = { uri: string; name: string; mimeType: string; size?: number };
export type AnalysisMode = 'remote' | 'demo';

export const remoteApiUrl = process.env.EXPO_PUBLIC_SOLVEPATH_API_URL?.trim() ?? '';

export interface ProblemAnalyzer {
  analyze(
    text: string,
    image?: AnalysisImage,
    onStage?: (stage: number) => void,
  ): Promise<ProblemAnalysis>;
}

export class UnsupportedProblemError extends Error {
  constructor() {
    super(
      'Diese Aufgabe ist in der lokalen Demo noch nicht enthalten. Wähle eine der Beispielaufgaben.',
    );
  }
}

const normalized = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export class MockProblemAnalyzer implements ProblemAnalyzer {
  async analyze(text: string, image?: AnalysisImage): Promise<ProblemAnalysis> {
    if (image) throw new UnsupportedProblemError();
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
    const matchedId = rules.find(([, words]) =>
      words.every((word) => input.includes(normalized(word))),
    )?.[0];
    const problem = demoProblems.find((item) => item.id === matchedId);
    if (!problem) throw new UnsupportedProblemError();
    return problem;
  }
}

export class RemoteProblemAnalyzer implements ProblemAnalyzer {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly timeoutMs = 85_000,
  ) {}

  async analyze(
    text: string,
    image?: AnalysisImage,
    onStage?: (stage: number) => void,
  ): Promise<ProblemAnalysis> {
    if (!this.baseUrl)
      throw new Error('Remote Analysis ist nicht eingerichtet. Wähle eine Demo-Aufgabe.');
    if (!image && text.trim().length < 10) throw new Error('Beschreibe die Aufgabe etwas genauer.');
    if (image && image.size && image.size > 8 * 1024 * 1024)
      throw new Error('Das Bild ist größer als 8 MB. Bitte wähle ein kleineres Bild.');
    onStage?.(1);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      let body: string | FormData;
      const appUserId = getSubscriptionAppUserId();
      let headers: Record<string, string> | undefined = appUserId
        ? { 'x-solvepath-user-id': appUserId }
        : undefined;
      if (image) {
        const form = new FormData();
        form.append('image', {
          uri: image.uri,
          name: image.name,
          type: image.mimeType,
        } as unknown as Blob);
        form.append('text', text.trim());
        body = form;
      } else {
        body = JSON.stringify({ text: text.trim() });
        headers = { ...(headers ?? {}), 'content-type': 'application/json' };
      }
      const response = await this.fetcher(`${this.baseUrl.replace(/\/$/, '')}/api/analyze`, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });
      onStage?.(2);
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = (payload as { error?: unknown })?.error;
        throw new Error(
          typeof message === 'string' ? message : 'Analyse fehlgeschlagen. Bitte erneut versuchen.',
        );
      }
      const parsed = problemAnalysisSchema.safeParse(payload);
      if (!parsed.success)
        throw new Error('Die Serverantwort ist unvollständig. Bitte erneut versuchen.');
      onStage?.(3);
      return parsed.data;
    } catch (error) {
      if (controller.signal.aborted)
        throw new Error('Die Analyse hat zu lange gedauert. Bitte erneut versuchen.');
      if (error instanceof TypeError)
        throw new Error(
          'Der Analyseserver ist nicht erreichbar. Du kannst eine Demo-Aufgabe wählen.',
        );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const mockProblemAnalyzer = new MockProblemAnalyzer();
export const remoteProblemAnalyzer = new RemoteProblemAnalyzer(remoteApiUrl);

export function analyzerForMode(mode: AnalysisMode): ProblemAnalyzer {
  return mode === 'remote' ? remoteProblemAnalyzer : mockProblemAnalyzer;
}
