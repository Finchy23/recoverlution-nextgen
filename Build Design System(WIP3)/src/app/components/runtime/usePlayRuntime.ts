/**
 * usePlayRuntime — Mode B Compiled PLAY Session Client
 *
 * Per soundbite-play-contract: when the user presses Play without
 * selecting a specific track, the system compiles the right moment.
 *
 * This hook manages the full lifecycle:
 *   1. Fetch profiles (allowed intents, beat profiles, voice lanes)
 *   2. Create session (POST with intent, duration, state, beat, voice)
 *   3. Read session queue (the playback truth)
 *   4. Send feedback on completion
 *
 * Endpoint: https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/play-runtime
 *
 * Contract source of truth: play-contracts.ts
 * If the live runtime returns different shapes, update play-contracts.ts — not this file.
 *
 * Mapping from surface controls to session params:
 *   Frequency (DRIVE/FOCUS/DRIFT) → intent (uplift/ground/release)
 *   Thread (GRIT/CALM/SELF/etc.) → voice_lane
 *   Beat (PULSE/WAVE/HAZE/BARE) → beat profile / beat_enabled
 */

import { useState, useCallback, useRef } from 'react';
import type { FrequencyId } from '../surfaces/FrequencySignature';
import type { PlayCompiledStation, PlayQueueItem } from './play-contracts';

// Re-export canonical types so consumers can import from one place
export type { PlayCompiledStation, PlayQueueItem } from './play-contracts';

// ─── Constants ───

const BASE =
  'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/play-runtime';

// ─── Types ───

export interface PlayProfile {
  intents: string[];
  durationTargets: string[];
  beatProfiles: string[];
  voiceLanes: string[];
  environmentModes: string[];
}

/**
 * PlaySession — the frontend's working shape for a compiled session.
 * Identical to PlayCompiledStation from play-contracts.ts.
 * Kept as an alias for readability at the surface layer.
 */
export type PlaySession = PlayCompiledStation;

export interface PlaySessionFeedback {
  completed: boolean;
  skipped: boolean;
  calming: boolean;
  energizing: boolean;
  wrongTone: boolean;
  wrongBeat: boolean;
  wrongVoice: boolean;
}

// ─── Surface control → session param mappings ───

export const FREQUENCY_INTENT_MAP: Record<FrequencyId, string> = {
  drive: 'uplift',
  focus: 'ground',
  drift: 'release',
};

export const BEAT_PROFILE_MAP: Record<string, { beatEnabled: boolean; profile?: string }> = {
  pulse: { beatEnabled: true, profile: 'driving' },
  wave:  { beatEnabled: true, profile: 'flowing' },
  haze:  { beatEnabled: true, profile: 'ambient' },
  bare:  { beatEnabled: false },
};

export const THREAD_VOICE_MAP: Record<string, string> = {
  grit: 'determined_steady',
  calm: 'warm_grounded',
  self: 'reflective_intimate',
  free: 'liberating_open',
  edge: 'challenging_direct',
  bond: 'connective_warm',
  wake: 'alert_present',
  root: 'anchored_deep',
};

// ─── Fetch helper ───

async function playFetch<T>(
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

// ─── Standalone health check (usable outside React) ───

export async function health(): Promise<{ data: unknown | null; error: string | null }> {
  return playFetch<unknown>('/profiles');
}

// ─── The Hook ───

interface UsePlayRuntimeParams {
  frequency: FrequencyId;
  threadId: string;
  beatId: string;
  /** Voice/music balance 0-1 (0 = music-forward, 1 = voice-deep) */
  depth?: number;
}

interface UsePlayRuntimeResult {
  /** Whether the play-runtime is available */
  available: boolean;
  /** Current compiled session */
  session: PlaySession | null;
  /** Whether a session is being compiled */
  compiling: boolean;
  /** Error from last operation */
  error: string | null;
  /** Compile a new session from current controls */
  compile: (jwt: string) => Promise<PlaySession | null>;
  /** Send feedback for current session */
  sendFeedback: (feedback: PlaySessionFeedback, jwt: string) => Promise<void>;
  /** Check if runtime is live */
  checkAvailability: () => Promise<boolean>;
}

export function usePlayRuntime({
  frequency,
  threadId,
  beatId,
  depth,
}: UsePlayRuntimeParams): UsePlayRuntimeResult {
  const [available, setAvailable] = useState(false);
  const [session, setSession] = useState<PlaySession | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkedRef = useRef(false);

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    if (checkedRef.current) return available;

    console.info('[play-runtime] Checking availability...');
    const { error: err } = await playFetch<unknown>('/profiles');

    const isAvailable = !err;
    setAvailable(isAvailable);
    checkedRef.current = true;

    console.info(`[play-runtime] ${isAvailable ? 'Available' : `Not available: ${err}`}`);
    return isAvailable;
  }, [available]);

  const compile = useCallback(async (jwt: string): Promise<PlaySession | null> => {
    setCompiling(true);
    setError(null);

    const intent = FREQUENCY_INTENT_MAP[frequency];
    const beatConfig = BEAT_PROFILE_MAP[beatId] || { beatEnabled: true };
    const voiceLane = THREAD_VOICE_MAP[threadId] || 'warm_grounded';

    console.info(`[play-runtime] POST /session — intent=${intent}, beat=${beatId}, voice=${voiceLane}`);

    const { data, error: err } = await playFetch<Record<string, unknown>>('/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        intent,
        duration_target: '5m',
        beat_enabled: beatConfig.beatEnabled,
        voice_lane: voiceLane,
        depth,
      }),
    });

    if (err || !data) {
      console.error('[play-runtime] Session compilation failed:', err);
      setError(err || 'No data returned');
      setCompiling(false);
      return null;
    }

    const compiled: PlaySession = {
      sessionId: String(data.session_id || ''),
      sessionShape: String(data.session_shape || ''),
      queue: Array.isArray(data.queue) ? (data.queue as Record<string, unknown>[]).map(q => ({
        trackId: String(q.track_id || ''),
        type: String(q.type || 'soundbite') as PlayQueueItem['type'],
        role: String(q.role || 'voice') as PlayQueueItem['role'],
        audioUrl: String(q.audio_url || ''),
        voiceProfile: typeof q.voice_profile === 'string' ? q.voice_profile : undefined,
        beatProfile: typeof q.beat_profile === 'string' ? q.beat_profile : undefined,
        playbackRate: typeof q.playback_rate === 'number' ? q.playback_rate : undefined,
        pauseWindowMs: typeof q.pause_window_ms === 'number' ? q.pause_window_ms : undefined,
        transitionAfterMs: typeof q.transition_after_ms === 'number' ? q.transition_after_ms : undefined,
        duckingProfile: typeof q.ducking_profile === 'string' ? q.ducking_profile : undefined,
        energyCurve: typeof q.energy_curve === 'string' ? q.energy_curve : undefined,
        schemaTargets: Array.isArray(q.schema_targets) ? q.schema_targets as string[] : undefined,
      })) : [],
      voiceProfile: String(data.voice_profile || ''),
      beatProfile: String(data.beat_profile || ''),
      mixProfile: String(data.mix_profile || ''),
      transitionProfile: String(data.transition_profile || ''),
      semanticProvenance: String(data.semantic_provenance || ''),
      compiledAt: typeof data.compiled_at === 'number' ? data.compiled_at : Date.now(),
    };

    console.info(`[play-runtime] Session compiled: ${compiled.sessionId}, ${compiled.queue.length} queue items`);

    setSession(compiled);
    setCompiling(false);
    return compiled;
  }, [frequency, threadId, beatId, depth]);

  const sendFeedback = useCallback(async (
    feedback: PlaySessionFeedback,
    jwt: string,
  ): Promise<void> => {
    if (!session) return;

    console.info(`[play-runtime] POST /session/${session.sessionId}/feedback`);

    const { error: err } = await playFetch<unknown>(
      `/session/${session.sessionId}/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          completed: feedback.completed,
          skipped: feedback.skipped,
          calming: feedback.calming,
          energizing: feedback.energizing,
          wrong_tone: feedback.wrongTone,
          wrong_beat: feedback.wrongBeat,
          wrong_voice: feedback.wrongVoice,
        }),
      },
    );

    if (err) {
      console.warn(`[play-runtime] Feedback error: ${err}`);
    }
  }, [session]);

  return {
    available,
    session,
    compiling,
    error,
    compile,
    sendFeedback,
    checkAvailability,
  };
}