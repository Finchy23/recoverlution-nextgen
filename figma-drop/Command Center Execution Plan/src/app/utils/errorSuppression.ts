/**
 * GLOBAL ERROR SUPPRESSION
 * Handles fetch errors from Figma devtools worker and other platform issues.
 * 
 * NOTE: Errors originating inside Figma's Web Worker (devtools_worker-*.min.js.br)
 * run in a separate JS context and CANNOT be caught from the main thread.
 * Those errors will still appear in the browser console — this is a Figma platform
 * issue, not an application bug. This module suppresses any that DO bubble to the
 * main thread (e.g. via Worker.onerror propagation).
 */

const FIGMA_PATTERNS = [
  'devtools_worker',
  'webpack-artifacts',
  'figma.com/webpack',
] as const;

// Vite dynamic import errors that are transient / HMR-related
const VITE_TRANSIENT_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
] as const;

function isFigmaWorkerError(event: ErrorEvent | PromiseRejectionEvent): boolean {
  // Check filename (ErrorEvent only)
  if ('filename' in event && typeof event.filename === 'string') {
    if (FIGMA_PATTERNS.some(p => event.filename!.includes(p))) return true;
  }

  // Check error message
  const message =
    ('message' in event && typeof event.message === 'string' && event.message) ||
    ('reason' in event && event.reason?.message) ||
    ('reason' in event && String(event.reason)) ||
    '';

  if (typeof message === 'string' && message.includes('Failed to fetch')) {
    // Check stack trace for Figma patterns
    const stack =
      ('error' in event && event.error?.stack) ||
      ('reason' in event && event.reason?.stack) ||
      '';
    if (typeof stack === 'string' && FIGMA_PATTERNS.some(p => stack.includes(p))) {
      return true;
    }
    // Generic "Failed to fetch" with no app-relevant stack — likely Figma
    if (!stack || stack === '') return true;
  }

  return false;
}

function isViteTransientError(event: ErrorEvent | PromiseRejectionEvent): boolean {
  const message =
    ('message' in event && typeof event.message === 'string' && event.message) ||
    ('reason' in event && event.reason?.message) ||
    ('reason' in event && String(event.reason)) ||
    '';

  if (typeof message === 'string') {
    return VITE_TRANSIENT_PATTERNS.some(p => message.toLowerCase().includes(p.toLowerCase()));
  }
  return false;
}

// Install global handlers immediately (runs at import time)
window.addEventListener('error', (event) => {
  if (isFigmaWorkerError(event)) {
    event.preventDefault();
    return;
  }
  if (isViteTransientError(event)) {
    console.warn('[ErrorSuppression] Vite dynamic import error caught — ErrorBoundary will handle UI recovery');
    // Don't preventDefault — let ErrorBoundary catch it
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (isFigmaWorkerError(event)) {
    event.preventDefault();
    return;
  }
  if (isViteTransientError(event)) {
    console.warn('[ErrorSuppression] Vite dynamic import rejection caught — ErrorBoundary will handle UI recovery');
    // Don't preventDefault — let ErrorBoundary catch it
    return;
  }
});

console.log('%c[ErrorSuppression] Active — Figma + Vite transient errors handled', 'color: #888');