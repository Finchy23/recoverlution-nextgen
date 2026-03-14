/**
 * NAVICUE RUNTIME — Client Gateway
 *
 * Purpose-built runtime client for the navicue-read-bundle Edge Function.
 * Serves SYNC — the benchmark surface where healing begins.
 *
 * The NaviCue is not a notification. It is a 10-second somatic intervention
 * wrapped in Apple-grade choreography. Canopy + Gesture + Receipt.
 *
 * Auth posture: JWT-required internal (controlled preview fallback)
 *
 * Canonical contract:
 *   GET  /health
 *   GET  /bundle/:navicue_id
 *   POST /bundle
 *   GET  /compile/:navicue_id
 *   POST /compile
 *   POST /dispatch
 *   GET  /matrix
 *   GET  /work-queue
 */

const BASE =
  'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/navicue-read-bundle';

// ─── Shared fetch helper ───

async function ncFetch<T>(
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

/** The runtime-compiled navicue bundle — everything the surface needs */
export interface NaviCueBundle {
  id: string;
  /** The hero line — emotional orientation (3-12 words) */
  canopy: string;
  /** The action instruction — body to interface (1-6 words) */
  gesture: string;
  /** The completion line — identity seal (1-8 words) */
  receipt: string;
  /** The somatic mechanic type */
  mechanic: string;
  /** Hold duration for this navicue in ms */
  duration_ms: number;
  /** Origin schema — the foundational wound being addressed */
  schema?: string;
  /** Voice archetype delivering the intervention */
  voice?: string;
  /** Chrono-context tag */
  chrono_context?: string;
  /** Color override (if the navicue carries its own tint) */
  color?: string;
  /** Whether this navicue has a route/continuation target */
  route?: {
    target_surface: string;
    target_id?: string;
    label?: string;
  };
  /** Semantic provenance — internal only, not for display */
  provenance?: Record<string, unknown>;
}

/** Dispatch request — ask the runtime for the next navicue */
export interface NaviCueDispatchRequest {
  /** Current user state band */
  state_band?: string;
  /** Surface requesting dispatch */
  surface?: string;
  /** Time of day context */
  chrono_context?: string;
  /** Individual ID */
  individual_id?: string;
  /** Previous navicue ID (for sequencing) */
  previous_id?: string;
  /** Coordinate state from PLOT */
  coordinates?: { id: string; value: number }[];
}

/** Dispatch response — the runtime's recommended next navicue */
export interface NaviCueDispatchResponse {
  bundle: NaviCueBundle;
  /** Queue of upcoming navicue IDs (for prefetch/preview) */
  queue?: string[];
  /** Reason this navicue was selected */
  selection_reason?: string;
}

/** Compile response — a fully resolved navicue ready for surface */
export interface NaviCueCompileResponse {
  bundle: NaviCueBundle;
  compiled_at: string;
}

// ─── Public API ───

/** Health check */
export function health() {
  return ncFetch<{ status: string }>('/health');
}

/** Fetch a specific navicue bundle by ID */
export function bundle(navicueId: string) {
  return ncFetch<NaviCueBundle>(`/bundle/${encodeURIComponent(navicueId)}`);
}

/** Request a bundle by criteria */
export function bundleByQuery(params: {
  schema?: string;
  mechanic?: string;
  voice?: string;
  state_band?: string;
}) {
  return ncFetch<NaviCueBundle>('/bundle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

/** Compile a navicue — fully resolve all copy/mechanic for runtime */
export function compile(navicueId: string) {
  return ncFetch<NaviCueCompileResponse>(
    `/compile/${encodeURIComponent(navicueId)}`,
  );
}

/** Compile by criteria */
export function compileByQuery(params: {
  schema?: string;
  mechanic?: string;
  voice?: string;
  state_band?: string;
  chrono_context?: string;
}) {
  return ncFetch<NaviCueCompileResponse>('/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

/** Dispatch — ask the runtime for the next scene */
export function dispatch(request: NaviCueDispatchRequest) {
  return ncFetch<NaviCueDispatchResponse>('/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

/** Matrix — the full navicue taxonomy (buildout/debug) */
export function matrix() {
  return ncFetch<Record<string, unknown>>('/matrix');
}

/** Work queue — pending navicues for buildout (debug) */
export function workQueue() {
  return ncFetch<Record<string, unknown>>('/work-queue');
}
