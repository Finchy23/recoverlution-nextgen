/**
 * useContentVideos — Hook for TUNE surface video rail hydration
 *
 * Calls content-runtime: GET /items?kind=videos&limit=12&channel=preview
 *
 * Maps the runtime response into the surface's Practice shape using
 * the backend-owned contract fields:
 *   key, title, summary, duration_minutes, series_key, hero.poster_url
 *
 * This is the RAIL call only — used for card rendering.
 * Do NOT boot the player from rail payload alone.
 * On tap, call /item/videos/:key?channel=preview for streaming sources.
 *
 * Falls back to mock data if the runtime is unreachable.
 */

import { useState, useEffect, useRef } from 'react';
import { items } from './content-runtime';

// ─── The shape TUNE needs ───

export type ModalityId =
  | 'breathwork'
  | 'meditation'
  | 'yoga'
  | 'fitness'
  | 'nourishment';

export interface VideoPractice {
  id: string;
  title: string;
  subtitle: string;
  modality: ModalityId;
  durationMin: number;
  /** Poster from hero.poster_url — the backend constructs this */
  posterUrl: string;
  direction: 'downshift' | 'upshift' | 'neutral';
  /** The video key — used to call /item/videos/:key on tap */
  jwMediaId?: string;
  /** Series key if part of a series */
  seriesKey?: string;
  /** Raw payload from the runtime (for debugging / future use) */
  _raw?: Record<string, unknown>;
}

// ─── Modality inference ───

const MODALITY_KEYWORDS: Record<ModalityId, string[]> = {
  breathwork: ['breath', 'breathwork', 'breathing', 'sigh', 'exhale', 'inhale', 'respiratory'],
  meditation: ['meditation', 'meditate', 'mindful', 'stillness', 'calm', 'presence', 'awareness'],
  yoga: ['yoga', 'vinyasa', 'asana', 'restorative', 'stretch', 'flow', 'pose', 'sun salutation'],
  fitness: ['fitness', 'workout', 'hiit', 'strength', 'cardio', 'exercise', 'sweat', 'burn', 'kinetic', 'conditioning'],
  nourishment: ['nourish', 'nutrition', 'food', 'cook', 'recipe', 'meal', 'fuel', 'eat'],
};

function inferModality(item: Record<string, unknown>): ModalityId {
  const searchText = [
    item.title,
    item.summary,
    item.subtitle,
    item.description,
    item.category,
    item.modality,
    item.type,
    item.pillar,
    item.tags,
    item.series_key,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Direct modality field
  if (typeof item.modality === 'string') {
    const m = item.modality.toLowerCase() as ModalityId;
    if (Object.keys(MODALITY_KEYWORDS).includes(m)) return m;
  }

  // Keyword scan
  for (const [mod, keywords] of Object.entries(MODALITY_KEYWORDS)) {
    if (keywords.some(kw => searchText.includes(kw))) {
      return mod as ModalityId;
    }
  }

  return 'yoga'; // sensible default
}

// ─── Direction inference ───

function inferDirection(item: Record<string, unknown>): 'downshift' | 'upshift' | 'neutral' {
  const modality = inferModality(item);
  if (modality === 'breathwork' || modality === 'meditation') return 'downshift';
  if (modality === 'fitness') return 'upshift';
  return 'neutral';
}

// ─── Duration extraction ───

function extractDuration(item: Record<string, unknown>): number {
  // Contract field: duration_minutes
  for (const key of ['duration_minutes', 'duration_min', 'duration', 'length', 'runtime']) {
    const val = item[key];
    if (typeof val === 'number') {
      // If > 120 it's likely seconds
      return val > 120 ? Math.round(val / 60) : val;
    }
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed > 120 ? Math.round(parsed / 60) : parsed;
    }
  }
  return 10; // default fallback
}

// ─── Poster URL extraction ───
// Per contract: hero.poster_url is the field for the rail poster.
// Backend owns URL construction — we never build JW CDN URLs.

function extractPoster(item: Record<string, unknown>): string {
  // Contract: hero.poster_url (nested)
  if (item.hero && typeof item.hero === 'object') {
    const hero = item.hero as Record<string, unknown>;
    if (typeof hero.poster_url === 'string' && hero.poster_url.startsWith('http')) {
      return hero.poster_url;
    }
  }

  // Flat fallbacks (some runtime shapes may flatten hero)
  for (const key of [
    'poster_url', 'poster', 'thumbnail_url', 'thumbnail',
    'image_url', 'image', 'cover_url', 'cover',
    'hero_image', 'hero_url', 'artwork_url',
  ]) {
    const val = item[key];
    if (typeof val === 'string' && val.startsWith('http')) return val;
  }

  return '';
}

// ─── Map runtime item → VideoPractice ───
// Contract fields: key, title, summary, duration_minutes, series_key, hero.poster_url

function mapItem(item: Record<string, unknown>, index: number): VideoPractice {
  return {
    // Contract: `key` is the video identifier (also the jw_media_id)
    id: String(item.key || item.id || item.jw_media_id || `video-${index}`),
    title: String(item.title || item.name || 'Untitled'),
    subtitle: String(item.summary || item.subtitle || item.description || item.short_description || ''),
    modality: inferModality(item),
    durationMin: extractDuration(item),
    posterUrl: extractPoster(item),
    direction: inferDirection(item),
    // `key` IS the media ID used for /item/videos/:key detail call
    jwMediaId: typeof item.key === 'string' ? item.key :
               typeof item.jw_media_id === 'string' ? item.jw_media_id : undefined,
    seriesKey: typeof item.series_key === 'string' ? item.series_key : undefined,
    _raw: item,
  };
}

// ─── Mock data (fallback when runtime is unreachable) ───
// No images. The glass aesthetic IS the visual when no JW content exists.
// Posters come exclusively from the content-runtime — never constructed manually.

const MOCK_PRACTICES: VideoPractice[] = [
  {
    id: 'mock-breathwork-reset',
    title: 'Autonomic Reset',
    subtitle: 'Four-count physiological sigh — the fastest remote control for your nervous system',
    modality: 'breathwork',
    durationMin: 6,
    posterUrl: '',
    direction: 'downshift',
    jwMediaId: 'mock-breathwork-reset',
  },
  {
    id: 'mock-meditation-stillpoint',
    title: 'Still Point',
    subtitle: 'A guided descent from Beta into Alpha — the architecture of stillness',
    modality: 'meditation',
    durationMin: 12,
    posterUrl: '',
    direction: 'downshift',
    jwMediaId: 'mock-meditation-stillpoint',
  },
  {
    id: 'mock-yoga-morning',
    title: 'Morning Ground',
    subtitle: 'A slow vinyasa to wake the spine — connecting geometry of body to pace of mind',
    modality: 'yoga',
    durationMin: 18,
    posterUrl: '',
    direction: 'neutral',
    jwMediaId: 'mock-yoga-morning',
  },
  {
    id: 'mock-fitness-cortisol',
    title: 'Cortisol Burn',
    subtitle: 'Kinetic release for stagnant energy — burning off what the body no longer needs',
    modality: 'fitness',
    durationMin: 22,
    posterUrl: '',
    direction: 'upshift',
    jwMediaId: 'mock-fitness-cortisol',
  },
  {
    id: 'mock-nourishment-alchemy',
    title: 'The Alchemy',
    subtitle: 'Dark cocoa & adaptogens — not dieting, but mindful connection to what sustains the machine',
    modality: 'nourishment',
    durationMin: 8,
    posterUrl: '',
    direction: 'neutral',
    jwMediaId: 'mock-nourishment-alchemy',
  },
  {
    id: 'mock-yoga-restorative',
    title: 'Restorative Flow',
    subtitle: 'Parasympathetic unwind — a somatic bridge before sleep',
    modality: 'yoga',
    durationMin: 25,
    posterUrl: '',
    direction: 'downshift',
    jwMediaId: 'mock-yoga-restorative',
  },
  {
    id: 'mock-breathwork-box',
    title: 'Box Breath',
    subtitle: 'The fastest autonomic remote control — four equal sides, infinite calm',
    modality: 'breathwork',
    durationMin: 4,
    posterUrl: '',
    direction: 'downshift',
    jwMediaId: 'mock-breathwork-box',
  },
];

// ─── Extract items from runtime response ───
// Handles multiple response shapes from the content-runtime

function extractItems(payload: unknown): Record<string, unknown>[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;

  // Try common collection keys
  for (const key of ['items', 'data', 'videos', 'results', 'content', 'records', 'rows', 'playlist', 'feed']) {
    if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
  }

  // If the payload itself has a title/key, it might be a single item
  if (obj.title || obj.key || obj.jw_media_id) return [obj];

  // Scan all keys for the first array value
  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      return val as Record<string, unknown>[];
    }
  }

  return [];
}

// ─── The Hook ───

interface UseContentVideosResult {
  practices: VideoPractice[];
  loading: boolean;
  error: string | null;
  /** Whether we're serving live data or mock fallback */
  source: 'live' | 'mock';
  /** Refresh from the runtime */
  refresh: () => void;
}

export function useContentVideos(limit = 12): UseContentVideosResult {
  const [practices, setPractices] = useState<VideoPractice[]>(MOCK_PRACTICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'live' | 'mock'>('mock');
  const fetchedRef = useRef(false);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    // Single call per contract: /items?kind=videos&limit=12&channel=preview
    console.info(`[content-runtime] GET /items?kind=videos&limit=${limit}&channel=preview`);

    const response = await items({ kind: 'videos', limit, channel: 'preview' });

    console.info('[content-runtime] Response:', response);

    if (response.error) {
      console.warn('[content-runtime] Error:', response.error);
      setError(response.error);
      setPractices(MOCK_PRACTICES);
      setSource('mock');
      setLoading(false);
      return;
    }

    const rawItems = extractItems(response.data);
    console.info('[content-runtime] Extracted items:', rawItems.length);

    if (rawItems.length > 0) {
      // Log first item to verify field shape matches contract
      console.info('[content-runtime] First item shape:', Object.keys(rawItems[0]));
      console.info('[content-runtime] First item:', rawItems[0]);

      const mapped = rawItems.map((item, i) => mapItem(item, i));
      const usable = mapped.filter(p => p.title !== 'Untitled');

      console.info(`[content-runtime] Mapped ${usable.length} usable practices`);

      if (usable.length > 0) {
        setPractices(usable);
        setSource('live');
        setLoading(false);
        return;
      }
    }

    // No items found — fall back to mock
    console.info('[content-runtime] No items found — using mock data');
    setPractices(MOCK_PRACTICES);
    setSource('mock');
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchVideos();
    }
  }, []);

  return {
    practices,
    loading,
    error,
    source,
    refresh: fetchVideos,
  };
}