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

  app.post('/api/analyze', async (request, reply) => {
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
            form.append(part.fieldname, String(part.value ?? ''));
          }
        }
        response = await fetch(upstream + '/api/analyze', {
          method: 'POST',
          body: form,
          signal: AbortSignal.timeout(90_000),
        });
      } else {
        response = await fetch(upstream + '/api/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(request.body ?? {}),
          signal: AbortSignal.timeout(90_000),
        });
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
      return reply.code(502).send({
        error: 'Der Analyseserver ist gerade nicht erreichbar. Bitte nutze die Demo oder versuche es erneut.',
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
