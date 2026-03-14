/**
 * TALK RUNTIME — Frontend API Client
 *
 * Three capabilities:
 *   1. Constellation persistence — save/load sealed entries
 *   2. Prompt evolution — LLM-generated contextual prompts
 *   3. Schema detection — pattern recognition for SEEK bridge
 *
 * All calls are fire-and-forget where possible.
 * The glass never blocks on network. The corridor holds.
 */

import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import type { TalkPrompt, TalkEntry, TalkLane } from './talk-types';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

// ═══════════════════════════════════════════════════
// CONSTELLATION PERSISTENCE
// ═══════════════════════════════════════════════════

/** Save entries to KV (fire-and-forget) */
export async function saveEntries(
  entries: TalkEntry[],
  sessionDepth: number,
  userId = 'anon',
): Promise<{ stored: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/talk/entries`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ userId, entries, sessionDepth }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[TALK save] Server error:', data.error);
      return { stored: false, error: data.error };
    }
    console.log(`[TALK save] ${data.entryCount} entries stored`);
    return { stored: true };
  } catch (err) {
    console.error('[TALK save] Network error:', err);
    return { stored: false, error: String(err) };
  }
}

/** Load entries from KV (async) */
export async function loadEntries(
  userId = 'anon',
): Promise<{ entries: TalkEntry[]; sessionDepth: number; found: boolean }> {
  try {
    const res = await fetch(
      `${BASE}/talk/entries/${encodeURIComponent(userId)}`,
      { headers: headers() },
    );
    if (!res.ok) return { entries: [], sessionDepth: 0, found: false };
    const data = await res.json();
    return {
      entries: data.entries || [],
      sessionDepth: data.sessionDepth || 0,
      found: data.found || false,
    };
  } catch (err) {
    console.error('[TALK load] Network error:', err);
    return { entries: [], sessionDepth: 0, found: false };
  }
}

// ═══════════════════════════════════════════════════
// CONSTELLATION NAMES — Personal naming persistence
// ══════════════════════════════════════════════════

/** Save constellation names to KV (fire-and-forget) */
export async function saveConstellationNames(
  names: Record<string, string>,
  userId = 'anon',
): Promise<void> {
  try {
    const res = await fetch(`${BASE}/talk/names`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ userId, names }),
    });
    if (!res.ok) {
      const data = await res.json();
      console.error('[TALK names save] Server error:', data.error);
    } else {
      console.log(`[TALK names] ${Object.keys(names).length} constellation names stored`);
    }
  } catch (err) {
    console.error('[TALK names save] Network error:', err);
  }
}

/** Load constellation names from KV */
export async function loadConstellationNames(
  userId = 'anon',
): Promise<{ names: Record<string, string>; found: boolean }> {
  try {
    const res = await fetch(
      `${BASE}/talk/names/${encodeURIComponent(userId)}`,
      { headers: headers() },
    );
    if (!res.ok) return { names: {}, found: false };
    const data = await res.json();
    return {
      names: data.names || {},
      found: data.found || false,
    };
  } catch (err) {
    console.error('[TALK names load] Network error:', err);
    return { names: {}, found: false };
  }
}

// ═══════════════════════════════════════════════════
// SESSION MEMORY — Inter-session Continuity
// ═══════════════════════════════════════════════════
//
// Persists whisper history, territory depth, bridge crossings,
// and session visit count so the cosmos deepens across returns.

export interface SessionMemory {
  /** Total session count (how many times the user has entered TALK) */
  sessionCount: number;
  /** Whisper texts already shown (prevents repetition across sessions) */
  shownWhispers: string[];
  /** Per-territory inscription counts across all sessions */
  territoryDepth: Record<string, number>;
  /** Territory pairs that have been bridged (e.g. "CALM→ROOT") */
  bridgesCrossed: string[];
  /** The last territory whispered in (for bridge detection on return) */
  lastTerritory: string | null;
  /** Timestamp of current session start */
  lastVisit: number;
  /** Timestamp of previous session (preserved for time-aware returning whispers) */
  previousVisit?: number;
  /** Observation IDs encountered across sessions (prevents repetition, capped at 50) */
  encounteredObservations?: string[];
  /** Constellation IDs that have been fully completed and named (all stars illuminated) */
  completedConstellations?: string[];
  /** Short fragments extracted from user passages, echoed back on return (capped at 20) */
  passageEchoes?: string[];
  /** How many times passage resonance has been detected across all sessions */
  resonanceDepth?: number;
}

/** Save session memory to KV (fire-and-forget) */
export async function saveSessionMemory(
  memory: SessionMemory,
  userId = 'anon',
): Promise<void> {
  try {
    const res = await fetch(`${BASE}/talk/memory`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ userId, memory }),
    });
    if (!res.ok) {
      const data = await res.json();
      console.error('[TALK memory save] Server error:', data.error);
    } else {
      console.log(`[TALK memory] Session memory saved (${memory.sessionCount} visits)`);
    }
  } catch (err) {
    console.error('[TALK memory save] Network error:', err);
  }
}

/** Load session memory from KV */
export async function loadSessionMemory(
  userId = 'anon',
): Promise<{ memory: SessionMemory | null; found: boolean }> {
  try {
    const res = await fetch(
      `${BASE}/talk/memory/${encodeURIComponent(userId)}`,
      { headers: headers() },
    );
    if (!res.ok) return { memory: null, found: false };
    const data = await res.json();
    return {
      memory: data.memory || null,
      found: data.found || false,
    };
  } catch (err) {
    console.error('[TALK memory load] Network error:', err);
    return { memory: null, found: false };
  }
}

// ═══════════════════════════════════════════════════
// LLM PROMPT EVOLUTION
// ══════════════════════════════════════════════════

export interface EvolvedPrompts {
  prompts: TalkPrompt[] | null;
  fallback: boolean;
}

/** Request LLM-evolved prompts based on sealed entries */
export async function evolvePrompts(
  entries: TalkEntry[],
  sessionDepth: number,
  currentLane?: TalkLane,
): Promise<EvolvedPrompts> {
  try {
    const res = await fetch(`${BASE}/talk/evolve`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ entries, sessionDepth, currentLane }),
    });
    if (!res.ok) {
      console.error('[TALK evolve] Server error:', res.status);
      return { prompts: null, fallback: true };
    }
    const data = await res.json();
    return {
      prompts: data.prompts || null,
      fallback: data.fallback ?? true,
    };
  } catch (err) {
    console.error('[TALK evolve] Network error:', err);
    return { prompts: null, fallback: true };
  }
}

// ═══════════════════════════════════════════════════
// SCHEMA DETECTION — SEEK BRIDGE
// ═══════════════════════════════════════════════════

export interface DetectedSchema {
  insightId: string;
  confidence: number;
  signal: string;
}

/** Detect schemas from entries for SEEK bridge */
export async function detectSchemas(
  entries: TalkEntry[],
): Promise<{ schemas: DetectedSchema[]; detected: boolean }> {
  try {
    const res = await fetch(`${BASE}/talk/detect-schema`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) {
      console.error('[TALK schema-detect] Server error:', res.status);
      return { schemas: [], detected: false };
    }
    const data = await res.json();
    return {
      schemas: data.schemas || [],
      detected: data.detected || false,
    };
  } catch (err) {
    console.error('[TALK schema-detect] Network error:', err);
    return { schemas: [], detected: false };
  }
}

// ═══════════════════════════════════════════════════
// KBE NUDGE — CONSTELLATION RESPONSE TO JOURNALING
// ═══════════════════════════════════════════════════

/**
 * Nudge a K.B.E. knowing score upward when a schema is detected in journaling.
 * The ∞MAP constellation responds to what you write — journaling about
 * a schema is itself an act of knowing.
 *
 * Fire-and-forget. The corridor does not wait.
 */
export async function nudgeKBEFromJournal(
  schemas: DetectedSchema[],
  userId = 'anon',
): Promise<void> {
  for (const schema of schemas) {
    try {
      await fetch(`${BASE}/talk/kbe-nudge`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          userId,
          insightId: schema.insightId,
          confidence: schema.confidence,
        }),
      });
      console.log(`[TALK→MAP] KBE nudge sent for ${schema.insightId} (confidence: ${schema.confidence})`);
    } catch (err) {
      console.error(`[TALK→MAP] KBE nudge failed for ${schema.insightId}:`, err);
    }
  }
}

// ══════════════════════════════════════════════════
// DEEP THREAD MINING — SECOND-PASS ANALYSIS
// ══════════════════════════════════════════════════

/**
 * Deep thread mining result — recurring emotional themes
 * identified by second-pass LLM analysis of 10+ entries.
 */
export interface MinedTheme {
  id: string;
  name: string;
  description: string;
  evidence: string[];
  lane: string;
  intensity: number;
  insightCandidate: boolean;
  suggestedInsightTitle: string | null;
}

/**
 * Trigger deep thread mining when journal constellation reaches 10+ entries.
 * This is a heavier analysis — call it sparingly (once per milestone).
 *
 * Returns recurring themes and potential SEEK insight candidates.
 */
export async function deepMineThreads(
  entries: TalkEntry[],
  userId = 'anon',
): Promise<{ themes: MinedTheme[]; mined: boolean }> {
  if (entries.length < 10) {
    return { themes: [], mined: false };
  }

  try {
    const res = await fetch(`${BASE}/talk/deep-mine`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ userId, entries }),
    });

    if (!res.ok) {
      console.error('[TALK deep-mine] Server error:', res.status);
      return { themes: [], mined: false };
    }

    const data = await res.json();
    console.log(`[TALK deep-mine] ${data.themes?.length || 0} themes mined from ${entries.length} entries`);
    return {
      themes: data.themes || [],
      mined: data.mined || false,
    };
  } catch (err) {
    console.error('[TALK deep-mine] Network error:', err);
    return { themes: [], mined: false };
  }
}

/**
 * Load the latest deep mine results (cached on server).
 */
export async function loadDeepMineResults(
  userId = 'anon',
): Promise<{ themes: MinedTheme[]; found: boolean }> {
  try {
    const res = await fetch(
      `${BASE}/talk/deep-mine/${encodeURIComponent(userId)}`,
      { headers: headers() },
    );
    if (!res.ok) return { themes: [], found: false };
    const data = await res.json();
    return {
      themes: data.result?.themes || [],
      found: data.found || false,
    };
  } catch (err) {
    console.error('[TALK deep-mine load] Network error:', err);
    return { themes: [], found: false };
  }
}

// ═══════════════════════════════════════════════════
// INSIGHT PROMOTION — JOURNAL → CONSTELLATION
// ═══════════════════════════════════════════════════

/**
 * Promote a mined theme to a constellation node.
 * The theme becomes a user-generated insight visible in ∞MAP.
 * Fire-and-forget.
 */
export async function promoteThemeToInsight(
  theme: MinedTheme,
  userId = 'anon',
): Promise<{ promoted: boolean }> {
  try {
    const res = await fetch(`${BASE}/talk/promote-insight`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        userId,
        themeId: theme.id,
        name: theme.name,
        description: theme.description,
        lane: theme.lane,
        suggestedTitle: theme.suggestedInsightTitle,
        intensity: theme.intensity,
      }),
    });
    if (!res.ok) {
      console.error('[TALK→MAP promote] Server error:', res.status);
      return { promoted: false };
    }
    const data = await res.json();
    console.log(`[TALK→MAP] Promoted: ${theme.suggestedInsightTitle || theme.name}`);
    return { promoted: data.promoted || false };
  } catch (err) {
    console.error('[TALK→MAP promote] Network error:', err);
    return { promoted: false };
  }
}