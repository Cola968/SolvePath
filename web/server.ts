import fastify from 'fastify';
import multipart from '@fastify/multipart';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

async function main() {
  const app = fastify({
    logger: true,
    bodyLimit: 9 * 1024 * 1024,
    requestTimeout: 95_000,
  });

  await app.register(multipart, {
    limits: { files: 1, fields: 1, parts: 2, fileSize: 8 * 1024 * 1024, fieldSize: 12_000 },
  });

  const root = dirname(fileURLToPath(import.meta.url));
  const upstream = (process.env.UPSTREAM_API_URL || 'https://solvepath-api-prod.onrender.com').replace(/\/$/, '');

  const mime: Record<string, string> = {
    'index.html': 'text/html; charset=utf-8',
    'styles.css': 'text/css; charset=utf-8',
    'app.js': 'text/javascript; charset=utf-8',
    'manifest.webmanifest': 'application/manifest+json; charset=utf-8',
    'sw.js': 'text/javascript; charset=utf-8',
    'icon.svg': 'image/svg+xml; charset=utf-8',
  };

  async function sendFile(reply: any, name: string) {
    const body = await readFile(join(root, name));
    reply.header('cache-control', name === 'index.html' ? 'no-cache' : 'public, max-age=3600');
    return reply.type(mime[name] || 'application/octet-stream').send(body);
  }

  app.get('/health', async () => ({ status: 'ok', app: 'snapstudy-web' }));

  function localTextAnalysis(text: string) {
    const clean = text.replace(/\s+/g, ' ').trim();
    const chunks = clean.split(/(?<=[.!?])\s+/).filter((x) => x.length > 12).slice(0, 5);
    const source = chunks.length ? chunks : [clean];
    const stop = new Set(['diese','dieser','dieses','einer','einem','einen','werden','wurde','wird','sind','oder','aber','auch','durch','dass','weil','wenn','dann','über','unter','zwischen','gegen','ohne','nach','vor','eine','eines','der','die','das','den','dem','des','und','mit','für','von','ist','im','in','am','an','zu','auf']);
    const steps = source.slice(0, 3).map((sentence) => {
      const words = sentence.match(/[A-Za-zÄÖÜäöüß0-9²³%-]{4,}/g) || [];
      const answer = words.filter((w) => !stop.has(w.toLowerCase())).sort((a,b) => b.length-a.length)[0] || words[0] || 'Begriff';
      return {
        question: 'Ergänze den fehlenden Begriff: ' + sentence.replace(answer, '_____'),
        answer,
        explanation: sentence,
      };
    });
    while (steps.length < 3) {
      steps.push({
        question: 'Nenne einen wichtigen Begriff aus deinem Lernstoff.',
        answer: clean.split(' ')[0] || 'Lernstoff',
        explanation: clean,
      });
    }
    return {
      title: 'Aus deinen Notizen',
      topic: 'Eigener Lernstoff',
      originalText: clean,
      strategySelection: {
        question: 'Welche Aussage passt am besten zu deinem Lernstoff?',
        options: [source[0] || clean, 'Das Thema ist nicht im Text enthalten', 'Keine der Aussagen'],
        correctOption: source[0] || clean,
        explanation: 'Die Aussage stammt direkt aus deinen Notizen.',
      },
      reasoningSteps: steps,
      correctResult: {
        display: steps[0]?.answer || 'Lernstoff',
        acceptedAnswers: [steps[0]?.answer || 'Lernstoff'],
        explanation: steps[0]?.explanation || clean,
      },
      localFallback: true,
    };
  }

  app.post('/api/analyze', async (request, reply) => {
    let fallbackText = '';
    try {
      let response: Response;

      if (request.isMultipart()) {
        const form = new FormData();
        for await (const part of request.parts()) {
          if (part.type === 'file') {
            const bytes = await part.toBuffer();
            form.append(
              part.fieldname,
              new Blob([bytes], { type: part.mimetype || 'application/octet-stream' }),
              part.filename || 'scan.jpg',
            );
          } else {
            const value = String(part.value ?? '');
            form.append(part.fieldname, value);
            if (part.fieldname === 'text') fallbackText = value;
          }
        }
        response = await fetch(upstream + '/api/analyze', {
          method: 'POST',
          body: form,
          signal: AbortSignal.timeout(90_000),
        });
      } else {
        const body = (request.body ?? {}) as { text?: unknown };
        fallbackText = typeof body.text === 'string' ? body.text : '';
        response = await fetch(upstream + '/api/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(request.body ?? {}),
          signal: AbortSignal.timeout(90_000),
        });
      }

      if (!response.ok && fallbackText.trim().length >= 20) {
        request.log.warn({ status: response.status }, 'Upstream unavailable; using local text fallback');
        return reply.code(200).send(localTextAnalysis(fallbackText));
      }

      const text = await response.text();
      let payload: unknown = text;
      try { payload = JSON.parse(text); } catch {}

      for (const name of ['x-solvepath-entitlement', 'x-solvepath-free-remaining', 'x-request-id']) {
        const value = response.headers.get(name);
        if (value) reply.header(name, value);
      }
      return reply.code(response.status).send(payload);
    } catch (error) {
      request.log.error(error);
      if (fallbackText.trim().length >= 20) {
        return reply.code(200).send(localTextAnalysis(fallbackText));
      }
      return reply.code(502).send({
        error: 'Die Bilderkennung ist gerade nicht erreichbar. Füge etwas Text zur Notiz hinzu oder versuche es erneut.',
        code: 'upstream_unavailable',
      });
    }
  });

  app.get('/styles.css', async (_request, reply) => sendFile(reply, 'styles.css'));
  app.get('/app.js', async (_request, reply) => sendFile(reply, 'app.js'));
  app.get('/manifest.webmanifest', async (_request, reply) => sendFile(reply, 'manifest.webmanifest'));
  app.get('/sw.js', async (_request, reply) => sendFile(reply, 'sw.js'));
  app.get('/icon.svg', async (_request, reply) => sendFile(reply, 'icon.svg'));
  app.get('/', async (_request, reply) => sendFile(reply, 'index.html'));
  app.get('/*', async (_request, reply) => sendFile(reply, 'index.html'));

  const port = Number(process.env.PORT || 10000);
  await app.listen({ host: '0.0.0.0', port });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
