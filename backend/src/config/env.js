/**
 * Centralized environment configuration.
 *
 * IMPORTANT: There is no hardcoded fallback for JWT_SECRET or any other
 * credential. If it is missing outside the test environment, the app fails
 * fast at startup instead of silently running with an insecure default.
 */
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/todolist',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtExpiresInRemember: process.env.JWT_EXPIRES_IN_REMEMBER || '30d',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:8080,http://127.0.0.1:8080')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export function validateEnv() {
  if (env.nodeEnv === 'test') {
    // Tests set their own JWT secret in test setup; no external DB is required.
    return;
  }

  if (!env.jwtSecret) {
    throw new Error(
      'Missing required environment variable JWT_SECRET. ' +
        'Copy backend/.env.example to backend/.env and set a real secret ' +
        '(e.g. `openssl rand -base64 48`).',
    );
  }
}
