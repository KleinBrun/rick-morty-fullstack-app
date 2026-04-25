export type AppErrorCode =
  | 'DATABASE_UNAVAILABLE'
  | 'EXTERNAL_API_UNAVAILABLE'
  | 'CACHE_UNAVAILABLE'
  | 'NOT_FOUND';

export type ServiceWarning = {
  code: AppErrorCode;
  message: string;
  source: string;
};

type AppErrorOptions = {
  cause?: unknown;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: AppErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = options.details;

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function toDatabaseError(operation: string, error: unknown) {
  if (isAppError(error)) {
    return error;
  }

  return new AppError('DATABASE_UNAVAILABLE', `Database operation failed: ${operation}`, {
    cause: error,
    details: { operation },
  });
}

export function toExternalApiError(operation: string, error: unknown) {
  if (isAppError(error)) {
    return error;
  }

  return new AppError('EXTERNAL_API_UNAVAILABLE', `Rick and Morty API unavailable during ${operation}`, {
    cause: error,
    details: { operation },
  });
}
