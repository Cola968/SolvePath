import { randomUUID } from 'node:crypto';
import { problemAnalysisSchema, type ProblemAnalysis } from '../../../src/domain/problem/schema';
import { ANALYSIS_SYSTEM_PROMPT } from '../prompts/analysis';
import { ApiError } from '../security/limits';
import type { AnalysisProvider } from './analysis-provider';

type Fetcher = typeof fetch;

export class RemoteAnalysisProvider implements AnalysisProvider {
  constructor(
    private readonly config: { apiKey: string; model: string; baseUrl: string; timeoutMs?: number },
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

  private async request(content: unknown[]): Promise<ProblemAnalysis> {
    if (!this.config.apiKey || !this.config.model || !this.config.baseUrl)
      throw new ApiError(
        503,
        'provider_not_configured',
        'Remote Analysis ist noch nicht konfiguriert.',
      );
    let url: URL;
    try {
      url = new URL(`${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`);
      if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
        throw new Error('HTTPS required');
    } catch {
      throw new ApiError(503, 'provider_not_configured', 'Die Provider-URL ist ungültig.');
    }

    for (let attempt = 0; attempt < 2; attempt++) {
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
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
              { role: 'user', content },
            ],
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
      let value: unknown;
      try {
        const payload: unknown = await response.json();
        const text = (payload as { choices?: { message?: { content?: string } }[] }).choices?.[0]
          ?.message?.content;
        value = JSON.parse(text ?? '');
      } catch {
        continue;
      }
      const parsed = problemAnalysisSchema.safeParse(
        value && typeof value === 'object' && !Array.isArray(value)
          ? { ...value, id: `remote-${randomUUID()}` }
          : value,
      );
      if (parsed.success) return parsed.data;
    }
    throw new ApiError(
      502,
      'invalid_analysis',
      'Die Analyse war unvollständig. Bitte versuche es erneut.',
    );
  }
}
