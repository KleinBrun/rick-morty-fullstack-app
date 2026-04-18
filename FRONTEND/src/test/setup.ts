import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

function isAbortReason(reason: unknown) {
  if (!reason || typeof reason !== 'object') {
    return false;
  }

  const candidate = reason as { name?: string; code?: number };
  return candidate.name === 'AbortError' || candidate.code === 20;
}

window.addEventListener('unhandledrejection', (event) => {
  if (isAbortReason(event.reason)) {
    event.preventDefault();
  }
});

const processShim = (globalThis as { process?: { on?: (event: string, handler: (reason: unknown) => void) => void } }).process;

processShim?.on?.('unhandledRejection', (reason: unknown) => {
  if (isAbortReason(reason)) {
    return;
  }
});

afterEach(() => { cleanup(); });

beforeEach(() => { window.localStorage.clear(); });
