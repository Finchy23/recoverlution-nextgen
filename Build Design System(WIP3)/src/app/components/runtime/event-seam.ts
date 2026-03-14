/**
 * EVENT SEAM — PostHog-Ready Event Adapter
 *
 * One event bus for the entire organism.
 * Every surface, every room, every interaction flows through here.
 *
 * Currently: logs to console (development mode).
 * Later: routes to PostHog, analytics, learning pipeline.
 *
 * Rule: Do NOT build analytics truth. Build the adapter shape
 * so later hookup is additive, not structural.
 */

// ─── Event Types ───

export type EventDomain =
  | 'shell'      // room transitions, invocations, returns
  | 'play'       // station interactions, mutations, feedback
  | 'talk'       // corridor phases, seals, schema bridges
  | 'signal'     // check-ins, focus zones, proof views
  | 'navigate'   // support pings, SOS, inbox actions
  | 'seek'       // insight arcs, KBE updates
  | 'form'       // practice sessions, holds, washes
  | 'sync'       // atom engagement, ambient breathing
  | 'know'       // content consumption, reading, video
  | 'tune'       // media transport, playback, scrubbing
  ;

export interface OrganismEvent {
  /** Unique event ID */
  id: string;
  /** Domain that generated the event */
  domain: EventDomain;
  /** Event action name (e.g. 'room_entered', 'station_compiled') */
  action: string;
  /** Timestamp */
  timestamp: number;
  /** Arbitrary payload — shape depends on domain + action */
  payload: Record<string, unknown>;
  /** User identity (preview persona or authenticated) */
  userId?: string;
  /** Current surface mode ID */
  surfaceId?: string;
}

// ─── Event Bus ───

type EventListener = (event: OrganismEvent) => void;

const listeners: EventListener[] = [];
let eventCounter = 0;

/** Emit an event into the organism event bus */
export function emit(
  domain: EventDomain,
  action: string,
  payload: Record<string, unknown> = {},
  meta?: { userId?: string; surfaceId?: string },
): void {
  const event: OrganismEvent = {
    id: `evt-${++eventCounter}-${Date.now().toString(36)}`,
    domain,
    action,
    timestamp: Date.now(),
    payload,
    userId: meta?.userId,
    surfaceId: meta?.surfaceId,
  };

  // Development: log to console
  console.info(
    `[event:${domain}] ${action}`,
    Object.keys(payload).length > 0 ? payload : '',
  );

  // Notify listeners
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch (err) {
      console.error('[event-seam] Listener error:', err);
    }
  });
}

/** Subscribe to all organism events */
export function subscribe(fn: EventListener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

/** Subscribe to events from a specific domain */
export function subscribeDomain(
  domain: EventDomain,
  fn: EventListener,
): () => void {
  const filtered: EventListener = (event) => {
    if (event.domain === domain) fn(event);
  };
  return subscribe(filtered);
}

// ─── Convenience emitters ───

export const shell = {
  roomEntered: (surfaceId: string, fromId?: string) =>
    emit('shell', 'room_entered', { surfaceId, fromId }, { surfaceId }),
  roomExited: (surfaceId: string) =>
    emit('shell', 'room_exited', { surfaceId }, { surfaceId }),
  anchorInvoked: () =>
    emit('shell', 'anchor_invoked', {}),
  returnTriggered: (fromId: string, toId: string) =>
    emit('shell', 'return_triggered', { fromId, toId }),
};

export const play = {
  sessionStarted: (sessionId: string, controls: Record<string, unknown>) =>
    emit('play', 'session_started', { sessionId, ...controls }),
  trackStarted: (trackId: string, type: string) =>
    emit('play', 'track_started', { trackId, type }),
  mutationRequested: (type: string, from: string, to: string) =>
    emit('play', 'mutation_requested', { type, from, to }),
  stationSaved: (stationId: string, name: string) =>
    emit('play', 'station_saved', { stationId, name }),
};

export const talk = {
  corridorEntered: () =>
    emit('talk', 'corridor_entered', {}),
  entrySealed: (entryId: string, lane: string, depth: number) =>
    emit('talk', 'entry_sealed', { entryId, lane, depth }),
  schemaDetected: (schemas: string[]) =>
    emit('talk', 'schema_detected', { schemas }),
  deepMineTriggered: (entryCount: number) =>
    emit('talk', 'deep_mine_triggered', { entryCount }),
};

export const signal = {
  checkIn: (energy: number, clarity: number, anchorage: number) =>
    emit('signal', 'check_in', { energy, clarity, anchorage }),
  focusZoneSet: (schemaId: string) =>
    emit('signal', 'focus_zone_set', { schemaId }),
  proofViewed: (receiptId: string) =>
    emit('signal', 'proof_viewed', { receiptId }),
};

export const navigate = {
  supportPinged: (contactId: string) =>
    emit('navigate', 'support_pinged', { contactId }),
  sosTriggered: () =>
    emit('navigate', 'sos_triggered', {}),
  inboxOpened: () =>
    emit('navigate', 'inbox_opened', {}),
};
