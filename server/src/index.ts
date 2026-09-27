import { buildServer } from './app';

const port = Number(process.env.PORT ?? 3000);
buildServer()
  .listen({ host: process.env.HOST ?? '127.0.0.1', port })
  .then((address) => process.stdout.write(`SolvePath API listening at ${address}\n`))
  .catch(() => {
    process.stderr.write('SolvePath API could not start.\n');
    process.exitCode = 1;
  });
