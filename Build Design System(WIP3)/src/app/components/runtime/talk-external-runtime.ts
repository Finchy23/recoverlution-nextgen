/**
 * TALK EXTERNAL RUNTIME — Client Gateway
 *
 * Purpose-built runtime client for the external talk-runtime Edge Function.
 * This is SEPARATE from talk-runtime.ts (which handles make-server persistence + LLM).
 *
 * This client handles:
 *   - Prompt discovery (POST /session) — the therapeutic brain selects the right prompts
 *   - Route dispatch (POST /dispatch) — the brain navigates the user to the right surface
 *
 * Auth posture: public (dev/preview)
 *
 * The two talk clients are COMPLEMENTARY:
 *   talk-runtime.ts (make-server)     → persistence, LLM evolution, schema detection, KBE nudge
 *   talk-external-runtime.ts (this)   → prompt selection, dispatch, therapeutic routing
 *
 * Rule: Do NOT build Talk as chat. Talk is already real as prompt discovery.
 * Do NOT guess routes locally — the runtime dispatches.
 */

const BASE =
  'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/talk-runtime';

// ─── Shared fetch helper ───

async function talkExtFetch<T>(
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

export interface TalkSessionPrompt {
  id: string;
  text: string;
  lane: string;
  depth: number;
  source: string;
}

export interface TalkSession {
  session_id: string;
  prompts: TalkSessionPrompt[];
  context: Record<string, unknown>;
  routing_hints: string[];
}

export interface TalkDispatchResult {
  target_surface: string;
  target_id?: string;
  reason: string;
  confidence: number;
}

// ─── Public API ───

/**
 * POST /session — Request prompt discovery from the therapeutic brain.
 * The runtime analyzes the user's state and returns contextually appropriate prompts.
 */
export function createSession(payload: {
  individual_id: string;
  current_state?: Record<string, unknown>;
  previous_entries?: Array<{ prompt: string; response: string; lane: string }>;
  depth?: number;
}) {
  return talkExtFetch<TalkSession>('/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * POST /dispatch — Request route navigation from the therapeutic brain.
 * Based on user entries and patterns, the runtime recommends where to go next.
 */
export function dispatch(payload: {
  individual_id: string;
  entries: Array<{ prompt: string; response: string; lane: string }>;
  current_surface: string;
}) {
  return talkExtFetch<TalkDispatchResult>('/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Health check */
export function health() {
  return talkExtFetch<{ status: string }>('/health');
}
