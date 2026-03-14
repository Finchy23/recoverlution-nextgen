/**
 * SEEK TELEMETRY RUNTIME — Silent Measurement Client
 *
 * The frontend pipe for SEEK interaction data.
 * Sends telemetry to the server after each cinematic arc completes.
 * Reads KBE trajectory for insight personalization.
 *
 * This hook is fire-and-forget for writes — the UI never blocks
 * on telemetry. Reads are async for trajectory display.
 *
 * Data schema (what gets stored per arc session):
 *   entryFrictionMs    — time between screen open and threshold press
 *   sectionPacingMs[]  — ms spent on each transfer section
 *   knowingScore       — 0-1 from focus-pull/alignment interaction
 *   believingScore     — 0-1 from gravity-drag/tension-tether
 *   embodyingLocation  — {x,y} from topography-drop (nullable)
 *   rippleRadius       — 0-1 from ripple-radius hold
 *   totalDurationMs    — full arc duration
 *   sceneInteractions  — per-scene interaction metadata (extensible)
 *   atomEngagement     — atom-level interaction data (extensible)
 *
 * Profile schema (aggregated per user×insight):
 *   sessions[]         — last 50 KBE snapshots for trajectory plotting
 */

import { useCallback, useRef } from 'react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import type { SeekTelemetry } from '../seek/seek-types';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

// ─── Raw fetch helpers ───

async function postTelemetry(
  domain: 'seek' | 'form' | 'sync',
  payload: Record<string, unknown>,
): Promise<{ stored: boolean; key?: string; error?: string }> {
  try {
    const res = await fetch(`${BASE}/telemetry/${domain}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`[Telemetry:${domain}] Server error:`, data.error);
      return { stored: false, error: data.error };
    }
    return data;
  } catch (err) {
    console.error(`[Telemetry:${domain}] Network error:`, err);
    return { stored: false, error: String(err) };
  }
}

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: headers() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Public API ───

/** Send SEEK telemetry after an arc completes */
export function sendSeekTelemetry(
  telemetry: SeekTelemetry,
  userId = 'anon',
  extras?: {
    sceneInteractions?: unknown[];
    atomEngagement?: unknown;
  },
) {
  return postTelemetry('seek', {
    userId,
    ...telemetry,
    ...(extras || {}),
  });
}

/** Send FORM telemetry after a practice completes */
export function sendFormTelemetry(payload: {
  userId?: string;
  practiceId: string;
  protocol: string;
  schema?: string;
  containerSequence?: string[];
  holdDurations?: number[];
  pendulationOscillations?: number;
  washProgress?: number;
  totalDurationMs: number;
  atomId?: string;
  bilateralEngagement?: unknown;
}) {
  return postTelemetry('form', {
    userId: payload.userId || 'anon',
    ...payload,
    timestamp: Date.now(),
  });
}

/** Send SYNC telemetry after an ambient session */
export function sendSyncTelemetry(payload: {
  userId?: string;
  atomId?: string;
  duration: number;
  breathCorrelation?: number;
  holdEvents?: number;
  modeTransitions?: string[];
}) {
  return postTelemetry('sync', {
    userId: payload.userId || 'anon',
    ...payload,
    timestamp: Date.now(),
  });
}

// ─── Read APIs ───

export interface KBESession {
  timestamp: number;
  knowing: number;
  believing: number;
  rippleRadius: number;
  embodyingLocation: { x: number; y: number } | null;
  totalDurationMs: number;
}

export interface KBEProfile {
  sessions: KBESession[];
}

/** Read KBE trajectory for a specific insight */
export async function readKBEProfile(
  userId: string,
  insightId: string,
): Promise<KBEProfile> {
  const data = await fetchJSON<{ profile: KBEProfile }>(
    `/profile/kbe/${encodeURIComponent(userId)}/${encodeURIComponent(insightId)}`,
  );
  return data?.profile || { sessions: [] };
}

/** Read all KBE profiles for a user */
export async function readAllKBEProfiles(
  userId: string,
): Promise<KBEProfile[]> {
  const data = await fetchJSON<{ profiles: KBEProfile[] }>(
    `/profile/kbe/${encodeURIComponent(userId)}`,
  );
  return data?.profiles || [];
}

/** Read somatic profile (aggregated FORM sessions) */
export async function readSomaticProfile(userId: string) {
  const data = await fetchJSON<{
    profile: {
      sessions: unknown[];
      lastPractice: { practiceId: string; protocol: string; timestamp: number } | null;
    };
  }>(`/profile/somatic/${encodeURIComponent(userId)}`);
  return data?.profile || { sessions: [], lastPractice: null };
}

/** Read SEEK session history for an insight */
export async function readSeekHistory(
  userId: string,
  insightId: string,
): Promise<SeekTelemetry[]> {
  const data = await fetchJSON<{ sessions: SeekTelemetry[] }>(
    `/telemetry/seek/${encodeURIComponent(userId)}/${encodeURIComponent(insightId)}`,
  );
  return data?.sessions || [];
}

// ─── React Hook ───

/**
 * useSeekTelemetry — fire-and-forget telemetry for SEEK arcs
 *
 * Usage:
 *   const { send } = useSeekTelemetry('anon');
 *   <SeekEngine onComplete={(tel) => send(tel)} />
 */
export function useSeekTelemetry(userId = 'anon') {
  const pendingRef = useRef(false);

  const send = useCallback(
    (telemetry: SeekTelemetry) => {
      if (pendingRef.current) return; // Debounce double-fires
      pendingRef.current = true;

      sendSeekTelemetry(telemetry, userId)
        .then((result) => {
          if (result.stored) {
            console.log('[SEEK] Telemetry stored:', result.key);
          } else {
            console.warn('[SEEK] Telemetry failed:', result.error);
          }
        })
        .finally(() => {
          pendingRef.current = false;
        });
    },
    [userId],
  );

  return { send };
}