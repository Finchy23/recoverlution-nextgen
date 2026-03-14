/**
 * useVideoDetail — Content Runtime Video Detail Hook
 *
 * Fetches streaming sources from the content-runtime Edge Function.
 * NOT from JW CDN directly — the backend owns all URL construction.
 *
 * Call: GET /item/videos/:jwMediaId?channel=preview
 *
 * Returns playable URLs (HLS / MP4), poster, and metadata
 * as returned by the content-runtime. Frontend never touches JW APIs.
 *
 * Called on interaction (tap a card) — never for the rail.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { videoDetail } from './content-runtime';

// ─── Resolved media for the player ───

export interface ResolvedMedia {
  /** HLS manifest URL (preferred — adaptive streaming) */
  hlsUrl: string | null;
  /** MP4 source URL (fallback) */
  mp4Url: string | null;
  /** Poster / thumbnail URL from the runtime */
  posterUrl: string | null;
  /** Duration in seconds */
  durationSec: number;
  /** Title from runtime metadata */
  title: string;
  /** Description */
  description: string;
  /** Series key if part of a series */
  seriesKey: string | null;
  /** Series name */
  seriesName: string | null;
  /** Episode number within series */
  episodeNumber: number | null;
  /** JW media ID echoed back */
  jwMediaId: string | null;
  /** Embed URL (fallback reference, not primary path) */
  embedUrl: string | null;
  /** Raw response for debugging */
  _raw: Record<string, unknown> | null;
}

const EMPTY_MEDIA: ResolvedMedia = {
  hlsUrl: null,
  mp4Url: null,
  posterUrl: null,
  durationSec: 0,
  title: '',
  description: '',
  seriesKey: null,
  seriesName: null,
  episodeNumber: null,
  jwMediaId: null,
  embedUrl: null,
  _raw: null,
};

// ─── Extract fields from the runtime response ───

function extractMedia(data: unknown): ResolvedMedia {
  if (!data || typeof data !== 'object') return EMPTY_MEDIA;

  const obj = data as Record<string, unknown>;

  // The runtime wraps the video in `item` (per the canonical setup example)
  const item = (typeof obj.item === 'object' && obj.item !== null)
    ? obj.item as Record<string, unknown>
    : obj;

  const str = (key: string): string | null => {
    const v = item[key];
    return typeof v === 'string' && v.length > 0 ? v : null;
  };

  const num = (key: string): number | null => {
    const v = item[key];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const parsed = parseFloat(v);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  // Duration: runtime may return duration_minutes or duration (seconds)
  let durationSec = 0;
  const durMin = num('duration_minutes');
  const durRaw = num('duration');
  if (durMin !== null) {
    durationSec = durMin * 60;
  } else if (durRaw !== null) {
    // If > 300, assume seconds; otherwise assume minutes
    durationSec = durRaw > 300 ? durRaw : durRaw * 60;
  }

  return {
    hlsUrl: str('hls_url'),
    mp4Url: str('mp4_url'),
    posterUrl: str('poster_url'),
    durationSec,
    title: str('title') || '',
    description: str('description') || '',
    seriesKey: str('series_key'),
    seriesName: str('series_name'),
    episodeNumber: num('episode_number'),
    jwMediaId: str('jw_media_id'),
    embedUrl: str('embed_url'),
    _raw: item as Record<string, unknown>,
  };
}

// ─── The Hook ───

interface UseVideoDetailOptions {
  /** The JW media ID / video key — if null/undefined, hook is idle */
  mediaId: string | null | undefined;
  /** Whether to start fetching immediately (default true) */
  enabled?: boolean;
  /** Channel — 'preview' for dev, 'published' for live (default 'preview') */
  channel?: string;
}

interface UseVideoDetailResult {
  media: ResolvedMedia;
  loading: boolean;
  error: string | null;
  /** Re-fetch the video detail */
  refetch: () => void;
}

export function useJWMedia({ mediaId, enabled = true, channel = 'preview' }: UseVideoDetailOptions): UseVideoDetailResult {
  const [media, setMedia] = useState<ResolvedMedia>(EMPTY_MEDIA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!mediaId || !enabled) return;

    // Avoid duplicate fetches for same ID
    if (activeIdRef.current === mediaId && media._raw) return;
    activeIdRef.current = mediaId;

    setLoading(true);
    setError(null);

    console.info(`[video-detail] Fetching: /item/videos/${mediaId}?channel=${channel}`);

    const { data, error: fetchErr } = await videoDetail(mediaId, channel);

    if (fetchErr) {
      console.warn(`[video-detail] Error for ${mediaId}:`, fetchErr);
      setError(fetchErr);
      setLoading(false);
      return;
    }

    console.info(`[video-detail] Response for ${mediaId}:`, data);

    const resolved = extractMedia(data);
    setMedia(resolved);
    setLoading(false);

    // Log what we got
    console.info(`[video-detail] Resolved:`, {
      hls: !!resolved.hlsUrl,
      mp4: !!resolved.mp4Url,
      poster: !!resolved.posterUrl,
      duration: resolved.durationSec,
      series: resolved.seriesKey,
    });
  }, [mediaId, enabled, channel]);

  useEffect(() => {
    if (mediaId && enabled) {
      fetchDetail();
    } else {
      // Reset when no media ID
      setMedia(EMPTY_MEDIA);
      setError(null);
      activeIdRef.current = null;
    }
  }, [mediaId, enabled, fetchDetail]);

  return { media, loading, error, refetch: fetchDetail };
}
