import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json());
  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // All API routes live under /api. This keeps room for future namespaces
  // (e.g. a Socket.IO endpoint) without clashing.
  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
