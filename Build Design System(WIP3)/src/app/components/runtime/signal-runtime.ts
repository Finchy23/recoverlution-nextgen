/**
 * SIGNAL RUNTIME — Client Gateway
 *
 * Purpose-built runtime client for the signal-runtime Edge Function.
 * Serves PLOT (check-in / now truth) and MAP (schema-first constellation).
 *
 * Auth posture: public (explicit individual_id in dev/preview)
 *
 * Canonical contract:
 *   GET /manifest?individual_id=...
 *   GET /now?individual_id=...
 *   GET /map?individual_id=...&group_by=schema
 *   GET /focus-zones?individual_id=...
 *   POST /focus-zones
 *   GET /proof?individual_id=...&limit=...
 *
 * Rule: Frontend does NOT derive map truth locally.
 * The runtime owns semantic grouping, KBE interpretation, and proof truth.
 */

const BASE =
  'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/signal-runtime';

// ─── Shared fetch helper ───

async function signalFetch<T>(
  path: string,
  opts?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        'Accept': 'application/json',
        ...opts?.headers,
      },
      ...opts,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return { data: null, error: `${res.status}: ${text}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// ─── Types ───

export interface SignalNow {
  energy: number;
  clarity: number;
  anchorage: number;
  timestamp: string;
  confidence: number;
}

export interface SignalMapNode {
  id: string;
  label: string;
  schema_id: string;
  group: string;
  integration: number;
  x: number;
  y: number;
  kbe: { knowing: number; believing: number; embodying: number };
}

export interface SignalFocusZone {
  id: string;
  schema_id: string;
  label: string;
  priority: number;
  created_at: string;
}

export interface SignalProofReceipt {
  id: string;
  type: string;
  label: string;
  timestamp: string;
  schema_id?: string;
  detail?: string;
}

// ─── Public API ───

/** Runtime manifest — capabilities and version */
export function manifest(individualId: string) {
  return signalFetch<Record<string, unknown>>(
    `/manifest?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Now truth — current Energy / Clarity / Anchorage */
export function now(individualId: string) {
  return signalFetch<SignalNow>(
    `/now?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Map — schema-first constellation (default group_by=schema) */
export function map(individualId: string, groupBy: 'schema' | 'node' = 'schema') {
  return signalFetch<{ nodes: SignalMapNode[]; groups: Record<string, unknown>[] }>(
    `/map?individual_id=${encodeURIComponent(individualId)}&group_by=${groupBy}`,
  );
}

/** Focus zones — user-set intentional areas */
export function focusZones(individualId: string) {
  return signalFetch<{ zones: SignalFocusZone[] }>(
    `/focus-zones?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Create or update a focus zone */
export function createFocusZone(payload: {
  individual_id: string;
  schema_id: string;
  label: string;
  priority?: number;
}) {
  return signalFetch<{ zone: SignalFocusZone }>('/focus-zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Proof receipts — evidence of movement */
export function proof(individualId: string, limit = 20) {
  return signalFetch<{ receipts: SignalProofReceipt[] }>(
    `/proof?individual_id=${encodeURIComponent(individualId)}&limit=${limit}`,
  );
}

/** Health check */
export function health() {
  return signalFetch<{ status: string }>('/health');
}
