import { describe, expect, it, vi } from 'vitest';
import { demoProblems } from '../../src/data/problems';
import type { AnalysisProvider } from './providers/analysis-provider';
import { RemoteProblemAnalyzer } from '../../src/services/problem-analyzer';
import { buildServer } from './app';

const valid = demoProblems[0]!;
function mockProvider(result: unknown = valid): AnalysisProvider {
  return {
    analyzeText: vi.fn(async () => result as typeof valid),
    analyzeImage: vi.fn(async () => result as typeof valid),
  };
}

function multipartImage(bytes: Buffer, mimeType: string) {
  const boundary = 'solvepath-test-boundary';
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="task.png"\r\nContent-Type: ${mimeType}\r\n\r\n`,
      ),
      bytes,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
}

describe('POST /api/analyze', () => {
  it('returns only a schema-valid analysis with request ID', async () => {
    const app = buildServer(mockProvider());
    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: { text: 'Eine neue Aufgabe mit Zahlen und Frage' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().hints).toHaveLength(6);
    expect(response.headers['x-request-id']).toBeTruthy();
    await app.close();
  });

  it('rejects invalid provider output without sending it to the app', async () => {
    const app = buildServer(mockProvider({ ...valid, hints: [] }));
    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: { text: 'Eine neue Aufgabe mit Zahlen und Frage' },
    });
    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      code: 'invalid_analysis',
      requestId: expect.any(String),
    });
    expect(response.body).not.toContain('hints');
    await app.close();
  });

  it('rejects oversized text and invalid image content', async () => {
    const app = buildServer(mockProvider());
    const long = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: { text: 'x'.repeat(12_001) },
    });
    expect(long.statusCode).toBe(413);
    const image = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      ...multipartImage(Buffer.from('not a PNG'), 'image/png'),
    });
    expect(image.statusCode).toBe(415);
    const huge = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      ...multipartImage(Buffer.alloc(8 * 1024 * 1024 + 1), 'image/png'),
    });
    expect(huge.statusCode).toBe(413);
    await app.close();
  });

  it('accepts a valid image and passes it to the provider', async () => {
    const provider = mockProvider();
    const app = buildServer(provider);
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      Buffer.from('body'),
    ]);
    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      ...multipartImage(png, 'image/png'),
    });
    expect(response.statusCode).toBe(200);
    expect(provider.analyzeImage).toHaveBeenCalledOnce();
    await app.close();
  });

  it('keeps health checks outside the analysis rate limit', async () => {
    const previousMinute = process.env.RATE_LIMIT_PER_MINUTE;
    const previousDay = process.env.RATE_LIMIT_PER_DAY;
    process.env.RATE_LIMIT_PER_MINUTE = '1';
    process.env.RATE_LIMIT_PER_DAY = '10';
    const app = buildServer(mockProvider());
    try {
      expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
      expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/api/analyze',
            payload: { text: 'Eine neue Aufgabe mit Zahlen und Frage' },
          })
        ).statusCode,
      ).toBe(200);
      const limited = await app.inject({
        method: 'POST',
        url: '/api/analyze',
        payload: { text: 'Noch eine neue Aufgabe mit Zahlen und Frage' },
      });
      expect(limited.statusCode).toBe(429);
      expect(limited.json().code).toBe('rate_limited');
    } finally {
      if (previousMinute === undefined) delete process.env.RATE_LIMIT_PER_MINUTE;
      else process.env.RATE_LIMIT_PER_MINUTE = previousMinute;
      if (previousDay === undefined) delete process.env.RATE_LIMIT_PER_DAY;
      else process.env.RATE_LIMIT_PER_DAY = previousDay;
      await app.close();
    }
  });

  it('serves the mobile text analyzer over HTTP', async () => {
    const app = buildServer(mockProvider());
    const address = await app.listen({ host: '127.0.0.1', port: 0 });
    try {
      const result = await new RemoteProblemAnalyzer(address).analyze(
        'Eine Aufgabe mit freien Eingaben',
      );
      expect(result.hints).toHaveLength(6);
    } finally {
      await app.close();
    }
  });
});
