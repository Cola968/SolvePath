import fastify from 'fastify';
import multipart from '@fastify/multipart';
import { problemAnalysisSchema } from '../../src/domain/problem/schema';
import type { AnalysisProvider } from './providers/analysis-provider';
import { RemoteAnalysisProvider } from './providers/remote-analysis-provider';
import {
  RevenueCatEntitlementVerifier,
  type EntitlementVerifier,
} from './services/revenuecat';
import {
  ApiError,
  MAX_IMAGE_BYTES,
  MAX_TEXT_LENGTH,
  validateImage,
  validateText,
} from './security/limits';

type AnalysisInput = { text: string; image?: Buffer; mimeType?: string };

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function headerValue(value: string | string[] | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 300) : null;
}

export function buildServer(
  provider: AnalysisProvider = new RemoteAnalysisProvider({
    apiKey: process.env.LLM_API_KEY ?? '',
    model: process.env.LLM_MODEL ?? '',
    baseUrl: process.env.LLM_BASE_URL ?? '',
    timeoutMs: positiveNumber(process.env.LLM_TIMEOUT_MS, 18_000),
    verifyAnalysis: process.env.LLM_VERIFY_ANALYSIS !== 'false',
  }),
  entitlementVerifier: EntitlementVerifier = new RevenueCatEntitlementVerifier({
    apiKey: process.env.REVENUECAT_SECRET_KEY ?? '',
    entitlementId: process.env.REVENUECAT_ENTITLEMENT_ID ?? 'pro',
  }),
) {
  const app = fastify({
    logger: false,
    trustProxy: process.env.TRUST_PROXY === 'true',
    bodyLimit: MAX_IMAGE_BYTES + MAX_TEXT_LENGTH + 4096,
    requestTimeout: 80_000,
  });

  const minuteLimit = Math.floor(positiveNumber(process.env.RATE_LIMIT_PER_MINUTE, 12));
  const dailyLimit = Math.floor(positiveNumber(process.env.RATE_LIMIT_PER_DAY, 120));
  const freeDailyLimit = Math.floor(positiveNumber(process.env.FREE_ANALYSES_PER_DAY, 3));
  const requests = new Map<
    string,
    { minuteCount: number; minuteUntil: number; dayCount: number; dayUntil: number }
  >();
  const freeUsage = new Map<string, number>();

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
    reply.header('x-content-type-options', 'nosniff');
    if (request.url.startsWith('/api/')) reply.header('cache-control', 'no-store');
    if (!request.url.startsWith('/api/analyze')) return;

    const key = request.ip;
    const now = Date.now();
    if (requests.size > 5_000) {
      for (const [address, entry] of requests) if (entry.dayUntil <= now) requests.delete(address);
    }

    const current = requests.get(key);
    const minuteExpired = !current || current.minuteUntil <= now;
    const dayExpired = !current || current.dayUntil <= now;
    const next = {
      minuteCount: minuteExpired ? 1 : current.minuteCount + 1,
      minuteUntil: minuteExpired ? now + 60_000 : current.minuteUntil,
      dayCount: dayExpired ? 1 : current.dayCount + 1,
      dayUntil: dayExpired ? now + 86_400_000 : current.dayUntil,
    };
    requests.set(key, next);

    reply.header('x-ratelimit-limit-minute', minuteLimit);
    reply.header('x-ratelimit-limit-day', dailyLimit);
    reply.header('x-ratelimit-remaining-minute', Math.max(0, minuteLimit - next.minuteCount));
    reply.header('x-ratelimit-remaining-day', Math.max(0, dailyLimit - next.dayCount));

    if (next.minuteCount > minuteLimit)
      throw new ApiError(429, 'rate_limited', 'Zu viele Anfragen. Bitte kurz warten.');
    if (next.dayCount > dailyLimit)
      throw new ApiError(
        429,
        'daily_limit_reached',
        'Das Tageslimit für Analysen ist erreicht. Bitte später erneut versuchen.',
      );
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

    const appUserId = headerValue(request.headers['x-solvepath-user-id']);
    const proStatus = appUserId ? await entitlementVerifier.isPro(appUserId) : null;
    const day = Math.floor(Date.now() / 86_400_000);
    const freeKey = appUserId ? `${day}:${appUserId}` : null;

    if (freeUsage.size > 5_000) {
      const prefix = `${day}:`;
      for (const key of freeUsage.keys()) if (!key.startsWith(prefix)) freeUsage.delete(key);
    }

    if (proStatus === true) {
      reply.header('x-solvepath-entitlement', 'pro');
    } else if (proStatus === false && freeKey) {
      const used = freeUsage.get(freeKey) ?? 0;
      const remaining = Math.max(0, freeDailyLimit - used);
      reply.header('x-solvepath-entitlement', 'free');
      reply.header('x-solvepath-free-remaining', remaining);
      if (used >= freeDailyLimit)
        throw new ApiError(
          429,
          'free_quota_reached',
          'Deine kostenlosen KI-Analysen für heute sind verbraucht. Mit SolvePath Pro gibt es kein Tageslimit.',
        );
    } else {
      reply.header('x-solvepath-entitlement', 'unknown');
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

    if (proStatus === false && freeKey) {
      const used = (freeUsage.get(freeKey) ?? 0) + 1;
      freeUsage.set(freeKey, used);
      reply.header('x-solvepath-free-remaining', Math.max(0, freeDailyLimit - used));
    }

    return reply.send(validated.data);
  });

  return app;
}
