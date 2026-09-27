import { randomUUID } from 'node:crypto';
import { problemAnalysisSchema, type ProblemAnalysis } from '../../../src/domain/problem/schema';
import { ANALYSIS_SYSTEM_PROMPT, VERIFICATION_SYSTEM_PROMPT } from '../prompts/analysis';
import { ApiError } from '../security/limits';
import type { AnalysisProvider } from './analysis-provider';

type Fetcher = typeof fetch;
type ModelMessage = { role: 'system' | 'user'; content: unknown };

type ProviderConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs?: number;
  verifyAnalysis?: boolean;
};

function validationSummary(error: unknown): string {
  if (!error || typeof error !== 'object' || !('issues' in error)) return 'Schema ungültig.';
  const issues = (error as { issues?: { path?: PropertyKey[]; message?: string }[] }).issues ?? [];
  return issues
    .slice(0, 6)
    .map((issue) => `${issue.path?.join('.') || 'root'}: ${issue.message ?? 'ungültig'}`)
    .join('; ');
}

export class RemoteAnalysisProvider implements AnalysisProvider {
  constructor(
    private readonly config: ProviderConfig,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  analyzeText(input: string): Promise<ProblemAnalysis> {
    return this.request([{ type: 'text', text: input }]);
  }

  analyzeImage(image: Buffer, mimeType: string, optionalText = ''): Promise<ProblemAnalysis> {
    return this.request([
      { type: 'text', text: optionalText || 'Lies und analysiere die Aufgabe auf diesem Bild.' },
      {
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${image.toString('base64')}` },
      },
    ]);
  }

  private providerUrl(): URL {
    if (!this.config.apiKey || !this.config.model || !this.config.baseUrl)
      throw new ApiError(
        503,
        'provider_not_configured',
        'Remote Analysis ist noch nicht konfiguriert.',
      );
    try {
      const url = new URL(`${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`);
      if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
        throw new Error('HTTPS required');
      return url;
    } catch {
      throw new ApiError(503, 'provider_not_configured', 'Die Provider-URL ist ungültig.');
    }
  }

  private async callModel(messages: ModelMessage[]): Promise<unknown> {
    const url = this.providerUrl();
    let response: Response;
    try {
      response = await this.fetcher(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages,
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 25_000),
      });
    } catch (error) {
      if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name))
        throw new ApiError(
          504,
          'provider_timeout',
          'Die Analyse hat zu lange gedauert. Bitte erneut versuchen.',
        );
      throw new ApiError(
        502,
        'provider_unavailable',
        'Der Analysedienst ist gerade nicht erreichbar.',
      );
    }

    if (!response.ok)
      throw new ApiError(
        502,
        'provider_unavailable',
        'Der Analysedienst konnte die Aufgabe nicht verarbeiten.',
      );

    try {
      const payload: unknown = await response.json();
      const text = (payload as { choices?: { message?: { content?: string } }[] }).choices?.[0]
        ?.message?.content;
      return JSON.parse(text ?? '');
    } catch {
      return null;
    }
  }

  private async generate(content: unknown[]): Promise<ProblemAnalysis> {
    const messages: ModelMessage[] = [
      { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content },
    ];

    let lastValue: unknown = null;
    let lastValidation = 'Ungültige JSON-Antwort.';

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        messages.push({
          role: 'user',
          content:
            `Repariere deine letzte Antwort vollständig. Validierungsfehler: ${lastValidation}. ` +
            'Gib erneut nur ein vollständiges JSON-Objekt aus. Erfinde keine Angaben.',
        });
      }

      const value = await this.callModel(messages);
      lastValue = value;

      if (value && typeof value === 'object' && 'error' in value && value.error === 'unreadable')
        throw new ApiError(
          422,
          'unreadable_task',
          'Die Aufgabe ist nicht gut lesbar oder enthält zu wenig Angaben.',
        );

      const candidate =
        value && typeof value === 'object' && !Array.isArray(value)
          ? { ...value, id: 'pending' }
          : value;
      const parsed = problemAnalysisSchema.safeParse(candidate);
      if (parsed.success) return parsed.data;

      lastValidation = validationSummary(parsed.error);
      if (lastValue !== null) {
        messages.push({
          role: 'user',
          content: `Letzte Antwort zur Reparatur: ${JSON.stringify(lastValue).slice(0, 24_000)}`,
        });
      }
    }

    throw new ApiError(
      502,
      'invalid_analysis',
      'Die Analyse war unvollständig. Bitte versuche es erneut.',
    );
  }

  private async verify(analysis: ProblemAnalysis): Promise<ProblemAnalysis> {
    if (this.config.verifyAnalysis === false) return analysis;

    const { id: _id, ...withoutId } = analysis;
    const value = await this.callModel([
      { role: 'system', content: VERIFICATION_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(withoutId) },
    ]);

    if (!value || typeof value !== 'object') return analysis;
    const verdict = (value as { verdict?: unknown }).verdict;
    if (verdict === 'ok') return analysis;
    if (verdict === 'unreadable')
      throw new ApiError(
        422,
        'unreadable_task',
        'Die Aufgabe konnte fachlich nicht zuverlässig verifiziert werden.',
      );
    if (verdict !== 'repair') return analysis;

    const repaired = (value as { analysis?: unknown }).analysis;
    const parsed = problemAnalysisSchema.safeParse(
      repaired && typeof repaired === 'object' && !Array.isArray(repaired)
        ? { ...repaired, id: 'pending' }
        : repaired,
    );
    return parsed.success ? parsed.data : analysis;
  }

  private async request(content: unknown[]): Promise<ProblemAnalysis> {
    const generated = await this.generate(content);
    const verified = await this.verify(generated);
    return { ...verified, id: `remote-${randomUUID()}` };
  }
}
