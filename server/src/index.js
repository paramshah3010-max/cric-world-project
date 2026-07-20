import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/prisma.js';

async function start() {
  const app = createApp();

  try {
    await connectDatabase();
    console.log('[db] Connected to PostgreSQL');
  } catch (err) {
    // The API can still boot (e.g. for the health check) even if the DB is
    // down, but data endpoints will error until it is reachable.
    console.error('[db] Could not connect to PostgreSQL:', err.message);
  }

  const server = app.listen(env.port, () => {
    console.log(`[api] CRIC WORLD API listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
