import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  dbDialect: process.env.DB_DIALECT ?? 'postgres',
  dbUrl: process.env.DB_URL ?? '',
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbName: process.env.DB_NAME ?? 'rickandmorty',
  dbUser: process.env.DB_USER ?? 'postgres',
  dbPassword: process.env.DB_PASSWORD ?? 'postgres',
  dbSsl: process.env.DB_SSL === 'true',
  redisUrl: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:8080,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT ?? '100kb',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 200),
};