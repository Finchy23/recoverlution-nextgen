/**
 * CONTENT RUNTIME — Client Gateway
 *
 * One of the six purpose-built runtime clients (§9 of the runtime index).
 * This is the canonical content/library read API for:
 *   videos · articles · insights · practices · journeys · assets
 *
 * Auth posture: public (no JWT required)
 *
 * Rule: Do NOT construct storage paths or media URLs yourself.
 * The runtime returns everything needed for hydration.
 */

const BASE =
  'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime';

// ─── Shared fetch helper ───

async function runtimeFetch<T>(
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

// ─── Public API ───

/** Health check */
export function health() {
  return runtimeFetch<{ status: string }>('/health');
}

/** Runtime manifest */
export function manifest() {
  return runtimeFetch<Record<string, unknown>>('/manifest');
}

/** Full catalog */
export function catalog() {
  return runtimeFetch<Record<string, unknown>>('/catalog');
}

/** Orchestrated feed */
export function feed() {
  return runtimeFetch<Record<string, unknown>>('/feed');
}

// ─── Item Lists ───

export type ContentKind =
  | 'videos'
  | 'articles'
  | 'insights'
  | 'practices'
  | 'soundbites';

export interface ContentListParams {
  kind: ContentKind;
  limit?: number;
  channel?: string;
  series_key?: string;
  /** Soundbite type filter: spark | flame | ember */
  type?: 'spark' | 'flame' | 'ember';
  /** Soundbite pillar filter (e.g. "CR") */
  pillar_id?: string;
  /** Soundbite theme filter (e.g. "A") */
  theme_id?: string;
}

/**
 * GET /items?kind=...&limit=...&channel=...&type=...&pillar_id=...&theme_id=...
 *
 * The response shape is determined by the runtime.
 * We return the raw payload and let the surface map it.
 */
export function items(params: ContentListParams) {
  const qs = new URLSearchParams();
  qs.set('kind', params.kind);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.channel) qs.set('channel', params.channel);
  if (params.series_key) qs.set('series_key', params.series_key);
  if (params.type) qs.set('type', params.type);
  if (params.pillar_id) qs.set('pillar_id', params.pillar_id);
  if (params.theme_id) qs.set('theme_id', params.theme_id);
  return runtimeFetch<unknown>(`/items?${qs.toString()}`);
}

// ─── Item Detail ───

/**
 * GET /item/videos/:jwMediaId?channel=preview
 */
export function videoDetail(jwMediaId: string, channel = 'preview') {
  return runtimeFetch<unknown>(
    `/item/videos/${encodeURIComponent(jwMediaId)}?channel=${channel}`,
  );
}

/**
 * GET /item/practices/:key
 */
export function practiceDetail(key: string) {
  return runtimeFetch<unknown>(`/item/practices/${encodeURIComponent(key)}`);
}

/**
 * GET /item/articles/:key
 */
export function articleDetail(key: string) {
  return runtimeFetch<unknown>(`/item/articles/${encodeURIComponent(key)}`);
}

/**
 * GET /item/insights/:key
 */
export function insightDetail(key: string) {
  return runtimeFetch<unknown>(`/item/insights/${encodeURIComponent(key)}`);
}

/**
 * GET /item/soundbites/:trackId
 */
export function soundbiteDetail(trackId: string) {
  return runtimeFetch<unknown>(
    `/item/soundbites/${encodeURIComponent(trackId)}`,
  );
}

// ─── Journeys ───

export function journeys() {
  return runtimeFetch<unknown>('/journeys');
}

export function journeyScenes(key: string) {
  return runtimeFetch<unknown>(
    `/journeys/${encodeURIComponent(key)}/scenes`,
  );
}

// ─── Video Series ───

export function videoSeries(seriesKey: string) {
  return runtimeFetch<unknown>(
    `/videos/series/${encodeURIComponent(seriesKey)}`,
  );
}

// ─── Assets ───

export function assets() {
  return runtimeFetch<unknown>('/assets');
}

export function assetDetail(assetId: string) {
  return runtimeFetch<unknown>(
    `/assets/${encodeURIComponent(assetId)}`,
  );
}

// ─── Notifications ───

export function notificationsCatalog() {
  return runtimeFetch<unknown>('/notifications/catalog');
}