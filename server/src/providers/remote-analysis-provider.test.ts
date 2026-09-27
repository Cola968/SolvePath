import { describe, expect, it, vi } from 'vitest';
import { demoProblems } from '../../../src/data/problems';
import { RemoteAnalysisProvider } from './remote-analysis-provider';

const config = { apiKey: 'test-secret', model: 'vision-model', baseUrl: 'https://example.test/v1' };
const reply = (value: unknown) =>
  new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(value) } }] }), {
    status: 200,
  });

describe('RemoteAnalysisProvider', () => {
  it('retries a structurally invalid model answer', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply({ hints: [] }))
      .mockResolvedValueOnce(reply(demoProblems[0]));
    const provider = new RemoteAnalysisProvider(config, fetcher);
    const result = await provider.analyzeText('Eine Aufgabe mit beliebigem Text');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.id).toMatch(/^remote-/);
    const request = JSON.parse(fetcher.mock.calls[0]![1]!.body as string);
    expect(request.messages[0].content).toContain('Hinweis 1 und 2');
  });

  it('reports timeout without leaking provider details', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
    const provider = new RemoteAnalysisProvider(config, fetcher);
    await expect(provider.analyzeText('Eine Aufgabe mit beliebigem Text')).rejects.toMatchObject({
      code: 'provider_timeout',
      statusCode: 504,
    });
  });

  it('rejects two invalid model responses', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(reply({ arbitrary: 'unsafe' }));
    const provider = new RemoteAnalysisProvider(config, fetcher);
    await expect(provider.analyzeText('Eine Aufgabe mit beliebigem Text')).rejects.toMatchObject({
      code: 'invalid_analysis',
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('assigns a server-side ID when the model omits one', async () => {
    const { id: _id, ...withoutId } = demoProblems[0]!;
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(reply(withoutId));
    const result = await new RemoteAnalysisProvider(config, fetcher).analyzeText(
      'Eine Aufgabe mit beliebigem Text',
    );
    expect(result.id).toMatch(/^remote-/);
  });

  it('reports an unreadable task without inventing an analysis', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(reply({ error: 'unreadable' }));
    await expect(
      new RemoteAnalysisProvider(config, fetcher).analyzeText('Ein unvollständiger Aufgabentext'),
    ).rejects.toMatchObject({ code: 'unreadable_task', statusCode: 422 });
  });

  it('retries when an early hint reveals the full formula', async () => {
    const invalid = structuredClone(demoProblems[0]!);
    invalid.hints[0]!.text = invalid.formulas[0]!.expression;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(invalid))
      .mockResolvedValueOnce(reply(demoProblems[0]));
    await new RemoteAnalysisProvider(config, fetcher).analyzeText(
      'Eine Aufgabe mit beliebigem Text',
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
