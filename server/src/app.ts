import fastify from 'fastify';
import multipart from '@fastify/multipart';
import { problemAnalysisSchema } from '../../src/domain/problem/schema';
import type { AnalysisProvider } from './providers/analysis-provider';
import { RemoteAnalysisProvider } from './providers/remote-analysis-provider';
import {
  ApiError,
  MAX_IMAGE_BYTES,
  MAX_TEXT_LENGTH,
  validateImage,
  validateText,
} from './security/limits';

type AnalysisInput = { text: string; image?: Buffer; mimeType?: string };

export function buildServer(
  provider: AnalysisProvider = new RemoteAnalysisProvider({
    apiKey: process.env.LLM_API_KEY ?? '',
    model: process.env.LLM_MODEL ?? '',
    baseUrl: process.env.LLM_BASE_URL ?? '',
  }),
) {
  const app = fastify({
    logger: false,
    bodyLimit: MAX_IMAGE_BYTES + MAX_TEXT_LENGTH + 4096,
    requestTimeout: 30_000,
  });
  const requests = new Map<string, { count: number; until: number }>();
  app.register(multipart, {
    limits: {
      files: 1,
      fields: 1,
      parts: 2,
      fileSize: MAX_IMAGE_BYTES,
      fieldSize: MAX_TEXT_LENGTH,
    },
  });
  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
    const key = request.ip;
    const now = Date.now();
    if (requests.size > 10_000) {
      for (const [address, entry] of requests) if (entry.until <= now) requests.delete(address);
    }
    const item = requests.get(key);
    const next =
      !item || item.until <= now
        ? { count: 1, until: now + 60_000 }
        : { count: item.count + 1, until: item.until };
    requests.set(key, next);
    if (next.count > 30)
      throw new ApiError(429, 'rate_limited', 'Zu viele Anfragen. Bitte kurz warten.');
  });
  app.setErrorHandler((error, request, reply) => {
    const known = error instanceof ApiError ? error : null;
    const oversized =
      error instanceof Error && /too large|file size|body is too large/i.test(error.message);
    reply.code(known?.statusCode ?? (oversized ? 413 : 500)).send({
      error:
        known?.message ??
        (oversized ? 'Die Anfrage ist zu groß.' : 'Die Analyse ist fehlgeschlagen.'),
      code: known?.code ?? (oversized ? 'request_too_large' : 'internal_error'),
      requestId: request.id,
    });
  });
  app.get('/health', async () => ({ status: 'ok' }));
  app.post('/api/analyze', async (request, reply) => {
    let input: AnalysisInput;
    if (request.isMultipart()) {
      let text = '';
      let image: Buffer | undefined;
      let mimeType: string | undefined;
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          if (part.fieldname !== 'image')
            throw new ApiError(400, 'invalid_image', 'Bildfeld muss image heißen.');
          mimeType = part.mimetype;
          image = await part.toBuffer();
        } else if (part.fieldname === 'text') {
          text = String(part.value ?? '');
        } else {
          throw new ApiError(400, 'invalid_field', 'Unbekanntes Eingabefeld.');
        }
      }
      if (!image || !mimeType)
        throw new ApiError(400, 'missing_image', 'Bitte wähle ein Bild aus.');
      validateImage(image, mimeType);
      input = { image, mimeType, text: validateText(text, true) };
    } else if (request.headers['content-type']?.startsWith('application/json')) {
      const body = request.body;
      if (!body || typeof body !== 'object' || !('text' in body))
        throw new ApiError(400, 'invalid_text', 'Ein Aufgabentext fehlt.');
      input = { text: validateText(body.text, false) };
    } else {
      throw new ApiError(415, 'unsupported_media_type', 'Nutze JSON oder Multipart-Formular.');
    }
    const result = input.image
      ? await provider.analyzeImage(input.image, input.mimeType!, input.text)
      : await provider.analyzeText(input.text);
    const validated = problemAnalysisSchema.safeParse(result);
    if (!validated.success)
      throw new ApiError(
        502,
        'invalid_analysis',
        'Die Analyse war unvollständig. Bitte versuche es erneut.',
      );
    return reply.send(validated.data);
  });
  return app;
}
