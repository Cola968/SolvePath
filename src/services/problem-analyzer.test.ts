import { describe, expect, it, vi } from 'vitest';
import { demoProblems } from '../data/problems';
import { analyzerForMode, RemoteProblemAnalyzer } from './problem-analyzer';

describe('RemoteProblemAnalyzer', () => {
  it('validates a text response and sends only text to the API', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(demoProblems[0]), { status: 200 }));
    const analyzer = new RemoteProblemAnalyzer(
      'https://solvepath.example',
      fetcher as typeof fetch,
    );
    expect((await analyzer.analyze('Eine Physikaufgabe mit Zahlen')).id).toBe(demoProblems[0]!.id);
    expect(fetcher.mock.calls[0]![0]).toBe('https://solvepath.example/api/analyze');
    expect(JSON.parse(fetcher.mock.calls[0]![1]!.body as string)).toEqual({
      text: 'Eine Physikaufgabe mit Zahlen',
    });
  });

  it('rejects malformed server output', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ unexpected: true }), { status: 200 }));
    await expect(
      new RemoteProblemAnalyzer('https://solvepath.example', fetcher as typeof fetch).analyze(
        'Eine Physikaufgabe mit Zahlen',
      ),
    ).rejects.toThrow('Serverantwort');
  });

  it('keeps the local demo usable when remote fetch fails', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('network failed'));
    await expect(
      new RemoteProblemAnalyzer('https://solvepath.example', fetcher as typeof fetch).analyze(
        'Eine Physikaufgabe mit Zahlen',
      ),
    ).rejects.toThrow('nicht erreichbar');
    expect((await analyzerForMode('demo').analyze(demoProblems[0]!.originalText)).id).toBe(
      demoProblems[0]!.id,
    );
  });

  it('uploads an image and optional text as multipart data', async () => {
    class TestFormData {
      fields: [string, unknown][] = [];
      append(name: string, value: unknown) {
        this.fields.push([name, value]);
      }
    }
    vi.stubGlobal('FormData', TestFormData);
    try {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(JSON.stringify(demoProblems[0]), { status: 200 }));
      const analyzer = new RemoteProblemAnalyzer(
        'https://solvepath.example',
        fetcher as typeof fetch,
      );
      await analyzer.analyze('Zusätzlicher Hinweis', {
        uri: 'file:///photo.jpg',
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
      });
      const request = fetcher.mock.calls[0]![1]!;
      expect(request.headers).toBeUndefined();
      expect((request.body as unknown as TestFormData).fields).toEqual([
        ['image', { uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg' }],
        ['text', 'Zusätzlicher Hinweis'],
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('times out a stalled API request', async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn<typeof fetch>().mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError')),
            );
          }),
      );
      const analyzer = new RemoteProblemAnalyzer(
        'https://solvepath.example',
        fetcher as typeof fetch,
        10,
      );
      const pending = expect(analyzer.analyze('Eine Physikaufgabe mit Zahlen')).rejects.toThrow(
        'zu lange',
      );
      await vi.advanceTimersByTimeAsync(11);
      await pending;
    } finally {
      vi.useRealTimers();
    }
  });
});
