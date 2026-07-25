import { createApp } from './app.js';
import { connectDatabase } from './config/prisma.js';

const app = createApp();

let databaseConnected = false;

app.use(async (req, res, next) => {
  if (!databaseConnected) {
    try {
      await connectDatabase();
      databaseConnected = true;
      console.log('[db] Connected to PostgreSQL');
    } catch (error) {
      console.error('[db] Could not connect:', error.message);
    }
  }

  next();
});

export default app;