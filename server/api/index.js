import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/prisma.js';

const app = createApp();

let databaseConnectionPromise;

app.use(async (req, res, next) => {
  try {
    if (!databaseConnectionPromise) {
      databaseConnectionPromise = connectDatabase();
    }

    await databaseConnectionPromise;
    next();
  } catch (error) {
    console.error('[db] Database connection failed:', error.message);
    next();
  }
});

export default app;