import type { NextFunction, Request, Response } from 'express';

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  const startedAt = Date.now();

  console.log('[request]', {
    method: request.method,
    path: request.originalUrl,
    query: request.query,
    body: request.method === 'GET' ? undefined : request.body,
  });

  response.on('finish', () => {
    console.log('[response]', {
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}