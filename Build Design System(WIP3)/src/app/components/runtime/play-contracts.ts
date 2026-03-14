/**
 * PLAY CONTRACT TYPES — Shape Declaration
 *
 * These interfaces declare the shapes the PLAY shell expects
 * from the live play-runtime when it delivers the DJ engine.
 *
 * Source of truth: packages/types/src/play-station.ts (when it exists)
 * Until then, these are the shapes we BUILD AGAINST in mock and live-contract mode.
 *
 * Rule: Do NOT invent compile law, queue law, or mutation law.
 * These shapes are declared so the shell can accept them when they arrive.
 * If the live runtime returns different shapes, update these — not the shell.
 */

// ─── Core Station Types ───

/** The compiled station — the DJ engine's output after processing controls */
export interface PlayCompiledStation {
  sessionId: string;
  sessionShape: string;
  queue: PlayQueueItem[];
  voiceProfile: string;
  beatProfile: string;
  mixProfile: string;
  transitionProfile: string;
  semanticProvenance: string;
  compiledAt: number;
}

/** A single item in the playback queue */
export interface PlayQueueItem {
  trackId: string;
  type: 'soundbite' | 'bed' | 'transition' | 'silence';
  role: 'voice' | 'bed' | 'bridge' | 'pad';
  audioUrl: string;
  voiceProfile?: string;
  beatProfile?: string;
  playbackRate?: number;
  pauseWindowMs?: number;
  transitionAfterMs?: number;
  duckingProfile?: string;
  energyCurve?: string;
  schemaTargets?: string[];
}

// ─── Bed Family Types ───

/** The active bed family — what sonic character is carrying the room */
export interface PlayActiveBedFamily {
  familyId: string;
  name: string;
  character: string;
  tracks: string[];
  currentTrackIndex: number;
}

/** The roster of available bed families */
export interface PlayBedFamilyRoster {
  families: PlayActiveBedFamily[];
  defaultFamilyId: string;
}

// ─── Mutation Types ───

/** A pending mutation — the DJ is recompiling the session */
export interface PlayPendingMutation {
  mutationId: string;
  type: 'frequency' | 'thread' | 'beat' | 'depth';
  fromValue: string;
  toValue: string;
  requestedAt: number;
  /** Whether the mutation is waiting for a phrase-safe handoff point */
  phraseSafe: boolean;
  /** Estimated time until the mutation takes effect */
  estimatedMs?: number;
}

// ─── Saved Station Types ───

/** A saved station — "my station", not a filter */
export interface PlaySavedStation {
  stationId: string;
  name: string;
  frequency: string;
  thread: string;
  beat: string;
  depth: number;
  createdAt: number;
  lastPlayedAt: number;
  playCount: number;
}

// ─── Runtime Observability Types ───

/** A runtime event for the event seam */
export interface PlayRuntimeEvent {
  eventId: string;
  type: 'session_start' | 'session_end' | 'track_start' | 'track_end' | 'mutation_applied' | 'mutation_pending' | 'feedback_sent' | 'station_saved' | 'station_loaded';
  timestamp: number;
  payload: Record<string, unknown>;
}

/** Runtime health for the quiet inspector */
export interface PlayRuntimeHealthState {
  connected: boolean;
  mode: 'mock' | 'live';
  sessionActive: boolean;
  queueDepth: number;
  currentTrackId: string | null;
  pendingMutations: number;
  lastEventTimestamp: number;
  errors: string[];
}
