/**
 * SHELL ACTOR SEAM — XState v5 Shell Machine
 *
 * Protects the organism's shell state from React drift.
 * Wraps existing Surface / Anchor / Stream behavior
 * into a formal state model.
 *
 * First seam scope (from XSTATE_SHELL_SEAM_PLAN.md):
 *   - current visible room
 *   - anchor state: idle | pressing | expanded | forked
 *   - stream state: closed | opening | open | closing
 *   - shell posture: full | degraded | offline | reduced | low-power
 *   - return target
 *   - transient overlay state
 *
 * Out of scope for first seam:
 *   - live phenomenon / strategy authority
 *   - full analytics side effects
 *   - media engine state
 *   - room-specific content state
 *   - backend orchestration logic
 *
 * Adoption rule: wrap existing shell behavior first.
 * Do not rewrite all room internals on the first pass.
 */

import { setup, assign } from 'xstate';

// ─── Types ───

export type ShellPosture = 'full' | 'degraded' | 'offline' | 'reduced' | 'low-power';
export type AnchorState = 'idle' | 'pressing' | 'expanded' | 'forked';
export type StreamState = 'closed' | 'opening' | 'open' | 'closing';

export interface ShellContext {
  /** Current visible room ID */
  activeRoomId: string;
  /** Previous room for return path */
  returnTarget: string | null;
  /** Parent room when in a child (e.g. SYNC when in READ) */
  expandedParentId: string | null;
  /** Anchor interaction state */
  anchorState: AnchorState;
  /** Stream visibility state */
  streamState: StreamState;
  /** Shell resilience posture */
  posture: ShellPosture;
  /** Whether the shell is in CUE flow (home) or a surface */
  inCueFlow: boolean;
  /** Transient overlay ID (if any) */
  overlayId: string | null;
  /** Session mode for preview/persona context */
  sessionMode: 'live' | 'preview';
}

// ─── Events ───

export type ShellEvent =
  | { type: 'ROOM.ENTER'; roomId: string; parentId?: string }
  | { type: 'ROOM.RETURN' }
  | { type: 'ROOM.RESOLVE' }
  | { type: 'ROOM.FORK'; childId: string; parentId: string }
  | { type: 'ANCHOR.PRESS' }
  | { type: 'ANCHOR.RELEASE' }
  | { type: 'ANCHOR.EXPAND' }
  | { type: 'ANCHOR.COLLAPSE' }
  | { type: 'STREAM.OPEN' }
  | { type: 'STREAM.CLOSE' }
  | { type: 'STREAM.OPENED' }
  | { type: 'STREAM.CLOSED' }
  | { type: 'POSTURE.SET'; posture: ShellPosture }
  | { type: 'OVERLAY.SHOW'; overlayId: string }
  | { type: 'OVERLAY.DISMISS' }
  | { type: 'CUE_FLOW.ENTER' }
  | { type: 'CUE_FLOW.EXIT' };

// ─── Input ───

export interface ShellInput {
  initialRoom: string;
  sessionMode?: 'live' | 'preview';
  resiliencePosture?: ShellPosture;
}

// ═══════════════════════════════════════════════════
// THE MACHINE
// ═══════════════════════════════════════════════════

export const shellMachine = setup({
  types: {
    context: {} as ShellContext,
    events: {} as ShellEvent,
    input: {} as ShellInput,
  },
}).createMachine({
  id: 'shell',
  initial: 'cueFlow',

  context: ({ input }) => ({
    activeRoomId: input.initialRoom,
    returnTarget: null,
    expandedParentId: null,
    anchorState: 'idle' as AnchorState,
    streamState: 'closed' as StreamState,
    posture: input.resiliencePosture ?? 'full',
    inCueFlow: true,
    overlayId: null,
    sessionMode: input.sessionMode ?? 'live',
  }),

  on: {
    // ─── Posture changes apply globally ───
    'POSTURE.SET': {
      actions: assign({
        posture: ({ event }) => event.posture,
      }),
    },

    // ─── Overlay management (transient, any state) ───
    'OVERLAY.SHOW': {
      actions: assign({
        overlayId: ({ event }) => event.overlayId,
      }),
    },
    'OVERLAY.DISMISS': {
      actions: assign({
        overlayId: () => null,
      }),
    },
  },

  states: {
    // ── CUE Flow — the home state, CUEs are flowing ──
    cueFlow: {
      entry: assign({
        inCueFlow: () => true,
      }),

      on: {
        'ROOM.ENTER': {
          target: 'surface',
          actions: assign({
            activeRoomId: ({ event }) => event.roomId,
            expandedParentId: ({ event }) => event.parentId ?? null,
            returnTarget: ({ context }) => context.activeRoomId,
            inCueFlow: () => false,
          }),
        },
        'CUE_FLOW.EXIT': {
          target: 'surface',
          actions: assign({
            inCueFlow: () => false,
          }),
        },
        // Anchor interactions in CUE flow
        'ANCHOR.PRESS': {
          actions: assign({ anchorState: () => 'pressing' as AnchorState }),
        },
        'ANCHOR.RELEASE': {
          actions: assign({ anchorState: () => 'idle' as AnchorState }),
        },
        'ANCHOR.EXPAND': {
          actions: assign({ anchorState: () => 'expanded' as AnchorState }),
        },
        'ANCHOR.COLLAPSE': {
          actions: assign({ anchorState: () => 'idle' as AnchorState }),
        },
      },
    },

    // ── Surface — a room is active ──
    surface: {
      entry: assign({
        inCueFlow: () => false,
      }),

      on: {
        // Switch to a different room
        'ROOM.ENTER': {
          actions: assign({
            returnTarget: ({ context }) => context.activeRoomId,
            activeRoomId: ({ event }) => event.roomId,
            expandedParentId: ({ event }) => event.parentId ?? null,
          }),
        },

        // Fork into a child room (e.g. SYNC → READ)
        'ROOM.FORK': {
          actions: assign({
            returnTarget: ({ context }) => context.activeRoomId,
            activeRoomId: ({ event }) => event.childId,
            expandedParentId: ({ event }) => event.parentId,
          }),
        },

        // Return to previous room or CUE flow
        'ROOM.RETURN': [
          {
            guard: ({ context }) => context.returnTarget !== null,
            actions: assign({
              activeRoomId: ({ context }) => context.returnTarget!,
              returnTarget: () => null,
              expandedParentId: () => null,
            }),
          },
          {
            target: 'cueFlow',
            actions: assign({
              returnTarget: () => null,
              expandedParentId: () => null,
            }),
          },
        ],

        // Room resolves — return to CUE flow
        'ROOM.RESOLVE': {
          target: 'cueFlow',
          actions: assign({
            returnTarget: () => null,
            expandedParentId: () => null,
          }),
        },

        // CUE flow re-entry
        'CUE_FLOW.ENTER': {
          target: 'cueFlow',
        },

        // Anchor interactions in surface
        'ANCHOR.PRESS': {
          actions: assign({ anchorState: () => 'pressing' as AnchorState }),
        },
        'ANCHOR.RELEASE': {
          actions: assign({ anchorState: () => 'idle' as AnchorState }),
        },
        'ANCHOR.EXPAND': {
          actions: assign({ anchorState: () => 'expanded' as AnchorState }),
        },
        'ANCHOR.COLLAPSE': {
          actions: assign({ anchorState: () => 'idle' as AnchorState }),
        },

        // Stream interactions
        'STREAM.OPEN': {
          actions: assign({ streamState: () => 'opening' as StreamState }),
        },
        'STREAM.OPENED': {
          actions: assign({ streamState: () => 'open' as StreamState }),
        },
        'STREAM.CLOSE': {
          actions: assign({ streamState: () => 'closing' as StreamState }),
        },
        'STREAM.CLOSED': {
          actions: assign({ streamState: () => 'closed' as StreamState }),
        },
      },
    },
  },
});

// ─── Selector helpers for React consumption ───

export function selectActiveRoom(state: { context: ShellContext }) {
  return state.context.activeRoomId;
}

export function selectAnchorState(state: { context: ShellContext }) {
  return state.context.anchorState;
}

export function selectStreamState(state: { context: ShellContext }) {
  return state.context.streamState;
}

export function selectShellPosture(state: { context: ShellContext }) {
  return state.context.posture;
}

export function selectInCueFlow(state: { context: ShellContext }) {
  return state.context.inCueFlow;
}

export function selectReturnTarget(state: { context: ShellContext }) {
  return state.context.returnTarget;
}

export function selectExpandedParent(state: { context: ShellContext }) {
  return state.context.expandedParentId;
}

export function selectOverlay(state: { context: ShellContext }) {
  return state.context.overlayId;
}