import { describe, expect, it, vi } from 'vitest';
import { demoProblems } from '../../../src/data/problems';
import { RemoteAnalysisProvider } from './remote-analysis-provider';

const config = {
  apiKey: 'test-secret',
  model: 'vision-model',
  baseUrl: 'https://example.test/v1',
  verifyAnalysis: false,
};
const reply = (value: unknown) =>
  new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(value) } }] }), {
    status: 200,
  });

describe('RemoteAnalysisProvider', () => {
  it('retries a structurally invalid model answer with repair instructions', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply({ hints: [] }))
      .mockResolvedValueOnce(reply(demoProblems[0]));
    const provider = new RemoteAnalysisProvider(config, fetcher);
    const result = await provider.analyzeText('Eine Aufgabe mit beliebigem Text');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.id).toMatch(/^remote-/);
    const first = JSON.parse(fetcher.mock.calls[0]![1]!.body as string);
    const second = JSON.parse(fetcher.mock.calls[1]![1]!.body as string);
    expect(first.messages[0].content).toContain('Hinweis 1');
    expect(
      second.messages.some((message: { content: string }) => message.content.includes('Repariere')),
    ).toBe(true);
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

  it('rejects three invalid model responses', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(reply({ arbitrary: 'unsafe' }));
    const provider = new RemoteAnalysisProvider(config, fetcher);
    await expect(provider.analyzeText('Eine Aufgabe mit beliebigem Text')).rejects.toMatchObject({
      code: 'invalid_analysis',
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
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

  it('uses a second pass to repair a fachlich weak but schema-valid analysis', async () => {
    const generated = structuredClone(demoProblems[0]!);
    const repaired = structuredClone(demoProblems[0]!);
    repaired.principle.explanation = 'Fachlich verifiziert.';
    const { id: _id, ...repairedWithoutId } = repaired;

    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(generated))
      .mockResolvedValueOnce(reply({ verdict: 'repair', analysis: repairedWithoutId }));

    const result = await new RemoteAnalysisProvider(
      { ...config, verifyAnalysis: true },
      fetcher,
    ).analyzeText('Eine Aufgabe mit beliebigem Text');

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.principle.explanation).toBe('Fachlich verifiziert.');
    expect(result.id).toMatch(/^remote-/);
  });

  it('keeps a valid analysis if verifier output is malformed', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(demoProblems[0]))
      .mockResolvedValueOnce(reply({ verdict: 'repair', analysis: { broken: true } }));

    const result = await new RemoteAnalysisProvider(
      { ...config, verifyAnalysis: true },
      fetcher,
    ).analyzeText('Eine Aufgabe mit beliebigem Text');

    expect(result.title).toBe(demoProblems[0]!.title);
  });
});
