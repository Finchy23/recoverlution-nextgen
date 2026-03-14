/**
 * RESILIENCE SEAM — Degraded Mode & Fallback Handler
 *
 * One fallback layer for the entire organism.
 * When the network drops, data is partial, or the device is struggling,
 * this seam tells surfaces how to degrade gracefully.
 *
 * Postures:
 *   'full'      — everything works, all runtimes available
 *   'degraded'  — some runtimes unavailable, show cached/mock data
 *   'offline'   — no network, show last-known state + warm messaging
 *   'reduced'   — user requested reduced stimulation (prefers-reduced-motion)
 *   'low-power' — device battery saver or slow device detected
 *
 * Rule: The organism should ALWAYS feel calm, even when broken.
 * Never show error walls. Never show spinners longer than 2s.
 * Degrade into beauty, not into failure screens.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { checkAllRuntimes } from './runtime-gateway';

// ─── Types ───

export type ResiliencePosture =
  | 'full'
  | 'degraded'
  | 'offline'
  | 'reduced'
  | 'low-power';

export interface ResilienceState {
  /** Current resilience posture */
  posture: ResiliencePosture;
  /** Whether the browser reports online */
  online: boolean;
  /** Whether the user prefers reduced motion */
  reducedMotion: boolean;
  /** Individual runtime availability flags */
  runtimes: Record<string, boolean>;
  /** Register a runtime as available or unavailable */
  setRuntimeAvailable: (name: string, available: boolean) => void;
  /** Whether a specific runtime is available */
  isRuntimeAvailable: (name: string) => boolean;
}

// ─── Context ───

const defaultState: ResilienceState = {
  posture: 'full',
  online: true,
  reducedMotion: false,
  runtimes: {},
  setRuntimeAvailable: () => {},
  isRuntimeAvailable: () => true,
};

export const ResilienceContext = createContext<ResilienceState>(defaultState);

/** Use the current resilience state */
export function useResilience(): ResilienceState {
  return useContext(ResilienceContext);
}

/** Whether to show reduced animation */
export function useReducedMotion(): boolean {
  const { reducedMotion, posture } = useResilience();
  return reducedMotion || posture === 'reduced' || posture === 'low-power';
}

/** Whether the organism is in a degraded state */
export function useDegraded(): boolean {
  const { posture } = useResilience();
  return posture !== 'full';
}

// ─── Provider ───

export function ResilienceProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [reducedMotion, setReducedMotion] = useState(false);
  const [runtimes, setRuntimes] = useState<Record<string, boolean>>({});

  // Network status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Boot health check — populate runtime availability on mount ──
  useEffect(() => {
    checkAllRuntimes().then((results) => {
      const runtimeState: Record<string, boolean> = {};
      for (const [name, status] of Object.entries(results)) {
        runtimeState[name] = status.available;
      }
      setRuntimes((prev) => ({ ...prev, ...runtimeState }));
      console.info('[resilience-seam] Boot health check complete:', runtimeState);
    }).catch((err) => {
      console.warn('[resilience-seam] Boot health check failed:', err);
    });
  }, []);

  const setRuntimeAvailable = useCallback((name: string, available: boolean) => {
    setRuntimes((prev) => ({ ...prev, [name]: available }));
  }, []);

  const isRuntimeAvailable = useCallback(
    (name: string) => runtimes[name] !== false,
    [runtimes],
  );

  // Derive posture
  const posture: ResiliencePosture = (() => {
    if (!online) return 'offline';
    if (reducedMotion) return 'reduced';
    const downCount = Object.values(runtimes).filter((v) => !v).length;
    if (downCount > 0) return 'degraded';
    return 'full';
  })();

  return (
    <ResilienceContext.Provider
      value={{ posture, online, reducedMotion, runtimes, setRuntimeAvailable, isRuntimeAvailable }}
    >
      {children}
    </ResilienceContext.Provider>
  );
}