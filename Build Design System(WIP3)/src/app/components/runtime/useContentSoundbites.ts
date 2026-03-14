/**
 * useContentSoundbites — Hook for PLAY surface soundbite hydration
 *
 * Mode A from the soundbite-play-contract:
 *   GET /items?kind=soundbites&type=spark|flame|ember&limit=24
 *
 * Maps the runtime response into the surface's Soundbite shape using
 * the backend-owned contract fields:
 *   track_id, code, type, title, angle, pillar_id, theme_id
 *
 * This is the RAIL call only — used for pool building.
 * On play, call /item/soundbites/:trackId for audio_url.
 *
 * Frequency → Type mapping:
 *   DRIVE → spark  (kinetic, high-energy, quick hits)
 *   FOCUS → flame  (grounding, sustained, mid-tempo)
 *   DRIFT → ember  (ambient, parasympathetic, descent)
 *
 * Thread → pillar_id mapping:
 *   Backend-owned. Threads are 4-letter clinical theme aliases.
 *   The mapping will be provided by the backend when pillar_ids are finalized.
 *   For now, thread is passed as pillar_id hint if it matches known codes.
 *
 * Falls back to mock data if the runtime is unreachable.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { items, soundbiteDetail } from './content-runtime';
import type { FrequencyId } from '../surfaces/FrequencySignature';

// ─── Types ───

export type SoundbiteType = 'spark' | 'flame' | 'ember';

export interface Soundbite {
  trackId: string;
  code: string;
  type: SoundbiteType;
  title: string;
  angle: string;
  pillarId: string;
  themeId: string;
  tag: string;
  durationMs: number | null;
  /** Only populated after detail fetch */
  audioUrl?: string;
  /** Raw payload */
  _raw?: Record<string, unknown>;
}

export interface SoundbiteTrackDetail {
  trackId: string;
  code: string;
  type: SoundbiteType;
  title: string;
  angle: string;
  durationMs: number | null;
  audioUrl: string;
}

// ─── Frequency → Type mapping ───

export const FREQUENCY_TYPE_MAP: Record<FrequencyId, SoundbiteType> = {
  drive: 'spark',
  focus: 'flame',
  drift: 'ember',
};

// ─── Thread → pillar_id mapping ───
// Backend-owned. These are best-guess mappings based on clinical pillar codes.
// Will be updated when backend confirms the canonical pillar_id table.

const THREAD_PILLAR_MAP: Record<string, string | undefined> = {
  grit: undefined,  // Resilience — pillar TBD
  calm: undefined,  // Nervous system regulation — pillar TBD
  self: undefined,  // Identity / self-worth — pillar TBD
  free: undefined,  // Release / letting go — pillar TBD
  edge: undefined,  // Growth edge — pillar TBD
  bond: undefined,  // Connection / belonging — pillar TBD
  wake: undefined,  // Awareness / presence — pillar TBD
  root: undefined,  // Grounding / foundation — pillar TBD
};

// ─── Extract items from response ───

function extractItems(payload: unknown): Record<string, unknown>[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;

  for (const key of ['items', 'data', 'soundbites', 'results', 'content', 'records', 'rows']) {
    if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
  }

  if (obj.track_id || obj.code) return [obj];

  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      return val as Record<string, unknown>[];
    }
  }

  return [];
}

// ─── Map runtime item → Soundbite ───

function mapSoundbite(item: Record<string, unknown>, index: number): Soundbite {
  return {
    trackId: String(item.track_id || item.id || item.key || `soundbite-${index}`),
    code: String(item.code || ''),
    type: (['spark', 'flame', 'ember'].includes(String(item.type))
      ? String(item.type) as SoundbiteType
      : 'flame'),
    title: String(item.title || item.name || ''),
    angle: String(item.angle || item.subtitle || item.summary || ''),
    pillarId: String(item.pillar_id || ''),
    themeId: String(item.theme_id || ''),
    tag: String(item.tag || ''),
    durationMs: typeof item.duration_ms === 'number' ? item.duration_ms : null,
    audioUrl: typeof item.audio_url === 'string' ? item.audio_url : undefined,
    _raw: item,
  };
}

// ─── Mock soundbites ───

const MOCK_SOUNDBITES: Soundbite[] = [
  { trackId: 'mock-spark-01', code: 'CR-A-01', type: 'spark', title: 'The Pattern Has a Name', angle: 'Naming the loop breaks the loop', pillarId: 'CR', themeId: 'A', tag: 'awareness', durationMs: 8000 },
  { trackId: 'mock-spark-02', code: 'CR-A-02', type: 'spark', title: 'You Are Not Your Reflex', angle: 'The space between trigger and response', pillarId: 'CR', themeId: 'A', tag: 'identity', durationMs: 12000 },
  { trackId: 'mock-flame-01', code: 'CR-B-01', type: 'flame', title: 'Grounding the Signal', angle: 'From chaos to coherence', pillarId: 'CR', themeId: 'B', tag: 'regulation', durationMs: 22000 },
  { trackId: 'mock-flame-02', code: 'CR-B-02', type: 'flame', title: 'The Architecture of Calm', angle: 'Building the container your nervous system needs', pillarId: 'CR', themeId: 'B', tag: 'foundation', durationMs: 18000 },
  { trackId: 'mock-ember-01', code: 'CR-C-01', type: 'ember', title: 'Slow Descent', angle: 'Letting the system find its own floor', pillarId: 'CR', themeId: 'C', tag: 'release', durationMs: 35000 },
  { trackId: 'mock-ember-02', code: 'CR-C-02', type: 'ember', title: 'The Weight Lifts', angle: 'What remains when you stop carrying', pillarId: 'CR', themeId: 'C', tag: 'surrender', durationMs: 28000 },
];

// ─── The Hook ───

interface UseContentSoundbitesParams {
  frequency: FrequencyId;
  threadId?: string;
  limit?: number;
  enabled?: boolean;
}

interface UseContentSoundbitesResult {
  soundbites: Soundbite[];
  loading: boolean;
  error: string | null;
  source: 'live' | 'mock';
  refresh: () => void;
}

export function useContentSoundbites({
  frequency,
  threadId,
  limit = 24,
  enabled = true,
}: UseContentSoundbitesParams): UseContentSoundbitesResult {
  const type = FREQUENCY_TYPE_MAP[frequency];
  const pillarId = threadId ? THREAD_PILLAR_MAP[threadId] : undefined;

  const [soundbites, setSoundbites] = useState<Soundbite[]>(
    MOCK_SOUNDBITES.filter(s => s.type === type),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'live' | 'mock'>('mock');
  const fetchedRef = useRef<string | null>(null);

  const fetchSoundbites = useCallback(async () => {
    if (!enabled) return;

    const cacheKey = `${type}-${pillarId || 'all'}-${limit}`;
    setLoading(true);
    setError(null);

    console.info(`[content-runtime] GET /items?kind=soundbites&type=${type}&limit=${limit}${pillarId ? `&pillar_id=${pillarId}` : ''}`);

    const response = await items({
      kind: 'soundbites',
      type,
      limit,
      pillar_id: pillarId,
    });

    console.info('[content-runtime] Soundbites response:', response);

    if (response.error) {
      console.warn('[content-runtime] Soundbites error:', response.error);
      setError(response.error);
      setSoundbites(MOCK_SOUNDBITES.filter(s => s.type === type));
      setSource('mock');
      setLoading(false);
      return;
    }

    const rawItems = extractItems(response.data);
    console.info(`[content-runtime] Extracted ${rawItems.length} soundbite items`);

    if (rawItems.length > 0) {
      if (rawItems[0]) {
        console.info('[content-runtime] First soundbite shape:', Object.keys(rawItems[0]));
      }

      const mapped = rawItems.map((item, i) => mapSoundbite(item, i));
      const usable = mapped.filter(s => s.trackId && s.trackId !== 'soundbite-0');

      console.info(`[content-runtime] Mapped ${usable.length} usable soundbites`);

      if (usable.length > 0) {
        setSoundbites(usable);
        setSource('live');
        setLoading(false);
        fetchedRef.current = cacheKey;
        return;
      }
    }

    console.info('[content-runtime] No soundbites found — using mock data');
    setSoundbites(MOCK_SOUNDBITES.filter(s => s.type === type));
    setSource('mock');
    setLoading(false);
    fetchedRef.current = cacheKey;
  }, [type, pillarId, limit, enabled]);

  useEffect(() => {
    const cacheKey = `${type}-${pillarId || 'all'}-${limit}`;
    if (fetchedRef.current !== cacheKey) {
      fetchSoundbites();
    }
  }, [fetchSoundbites, type, pillarId, limit]);

  return {
    soundbites,
    loading,
    error,
    source,
    refresh: fetchSoundbites,
  };
}

// ─── Track detail fetcher (for player boot) ───

export async function bootSoundbiteTrack(
  trackId: string,
): Promise<{ track: SoundbiteTrackDetail; error: null } | { track: null; error: string }> {
  console.info(`[content-runtime] GET /item/soundbites/${trackId}`);

  const response = await soundbiteDetail(trackId);

  if (response.error) {
    console.error(`[content-runtime] Soundbite detail error for ${trackId}:`, response.error);
    return { track: null, error: response.error };
  }

  const data = response.data as Record<string, unknown>;
  if (!data) {
    return { track: null, error: 'No data returned' };
  }

  // Contract: response may wrap in { item: {...} } or return flat
  const item = (data.item || data) as Record<string, unknown>;

  const audioUrl = String(item.audio_url || '');
  if (!audioUrl || !audioUrl.startsWith('http')) {
    return { track: null, error: `No valid audio_url for track ${trackId}` };
  }

  return {
    track: {
      trackId: String(item.track_id || trackId),
      code: String(item.code || ''),
      type: (['spark', 'flame', 'ember'].includes(String(item.type))
        ? String(item.type) as SoundbiteType
        : 'flame'),
      title: String(item.title || ''),
      angle: String(item.angle || ''),
      durationMs: typeof item.duration_ms === 'number' ? item.duration_ms : null,
      audioUrl,
    },
    error: null,
  };
}
