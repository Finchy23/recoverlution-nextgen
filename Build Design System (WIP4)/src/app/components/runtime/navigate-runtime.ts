/**
 * NAVIGATE RUNTIME — Client Gateway
 *
 * Purpose-built runtime client for the navigate-runtime Edge Function.
 * Serves LINK (infrastructure / support / control center).
 *
 * Auth posture: public (explicit individual_id in dev/preview)
 *
 * Canonical contract:
 *   GET /manifest?individual_id=...
 *   GET /compass?individual_id=...
 *   GET /context?individual_id=...
 *   GET /network?individual_id=...
 *   GET /shared-room?individual_id=...
 *   GET /inbox?individual_id=...
 *   GET /rescue?individual_id=...
 *   POST /support/ping
 *   POST /sos
 *
 * Rule: Frontend does NOT invent support truth or rescue truth.
 * The runtime owns contacts, escalation logic, and consent.
 */

const BASE =
  'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/navigate-runtime';

// ─── Shared fetch helper ───

async function navFetch<T>(
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

export interface NavigateCompass {
  active_domains: string[];
  support_level: string;
  last_check_in: string | null;
}

export interface NavigateContext {
  integrations: Array<{
    id: string;
    type: string;
    label: string;
    status: 'connected' | 'pending' | 'disconnected';
  }>;
}

export interface NavigateContact {
  id: string;
  name: string;
  role: string;
  channel: string;
  available: boolean;
}

export interface NavigateNetwork {
  contacts: NavigateContact[];
  organizations: Array<{ id: string; name: string; role: string }>;
}

export interface NavigateSharedRoom {
  rooms: Array<{
    id: string;
    label: string;
    participants: string[];
    last_activity: string;
  }>;
}

export interface NavigateInboxItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export interface NavigateRescueState {
  sos_available: boolean;
  escalation_level: string;
  emergency_contacts: Array<{
    id: string;
    name: string;
    channel: string;
  }>;
  guardrail_copy: string;
}

// ─── Public API ───

/** Runtime manifest */
export function manifest(individualId: string) {
  return navFetch<Record<string, unknown>>(
    `/manifest?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Compass — active domains and support level */
export function compass(individualId: string) {
  return navFetch<NavigateCompass>(
    `/compass?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Context — connected integrations */
export function context(individualId: string) {
  return navFetch<NavigateContext>(
    `/context?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Network — support contacts and organizations */
export function network(individualId: string) {
  return navFetch<NavigateNetwork>(
    `/network?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Shared room — collaborative spaces */
export function sharedRoom(individualId: string) {
  return navFetch<NavigateSharedRoom>(
    `/shared-room?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Inbox — notifications and messages */
export function inbox(individualId: string) {
  return navFetch<{ items: NavigateInboxItem[] }>(
    `/inbox?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Rescue — SOS state and emergency contacts */
export function rescue(individualId: string) {
  return navFetch<NavigateRescueState>(
    `/rescue?individual_id=${encodeURIComponent(individualId)}`,
  );
}

/** Support ping — reach out to a contact */
export function supportPing(payload: {
  individual_id: string;
  contact_id: string;
  message?: string;
}) {
  return navFetch<{ sent: boolean; channel: string }>('/support/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** SOS — emergency escalation */
export function sos(payload: {
  individual_id: string;
  context?: string;
}) {
  return navFetch<{ escalated: boolean; response: string }>('/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Health check */
export function health() {
  return navFetch<{ status: string }>('/health');
}
