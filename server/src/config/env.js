import dotenv from 'dotenv';

// Load variables from server/.env into process.env.
dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Don't crash the whole app for a missing optional; but surface it.
    console.warn(`[env] Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
};
