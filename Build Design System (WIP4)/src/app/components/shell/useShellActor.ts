/**
 * useShellActor — React Hook for the Shell Machine
 *
 * Wraps the XState v5 shell machine into a clean React hook.
 * Returns the same shape as the current UniversalPlayer useState calls
 * so adoption can be incremental.
 *
 * Usage:
 *   const shell = useShellActor({ initialRoom: 'sync' });
 *   shell.activeRoomId     // current room
 *   shell.inCueFlow        // whether in CUE flow
 *   shell.streamOpen       // whether stream is visible
 *   shell.posture          // resilience posture
 *   shell.enterRoom('talk') // navigate to a room
 *   shell.resolve()        // return to CUE flow
 *   shell.openStream()     // reveal the stream
 *
 * Adoption rule:
 *   UniversalPlayer can adopt this hook one concern at a time.
 *   Start with room navigation, then stream, then anchor.
 *   Do not force-migrate everything on the first pass.
 */

import { useMachine } from '@xstate/react';
import { useCallback } from 'react';
import {
  shellMachine,
  selectActiveRoom,
  selectInCueFlow,
  selectStreamState,
  selectShellPosture,
  selectReturnTarget,
  selectExpandedParent,
  selectAnchorState,
  selectOverlay,
  type ShellPosture,
  type ShellInput,
} from './shell-machine';

export interface ShellActorAPI {
  // ── Read ──
  activeRoomId: string;
  inCueFlow: boolean;
  streamOpen: boolean;
  streamState: 'closed' | 'opening' | 'open' | 'closing';
  anchorState: 'idle' | 'pressing' | 'expanded' | 'forked';
  posture: ShellPosture;
  returnTarget: string | null;
  expandedParentId: string | null;
  overlayId: string | null;

  // ── Write ──
  enterRoom: (roomId: string, parentId?: string) => void;
  forkRoom: (childId: string, parentId: string) => void;
  returnRoom: () => void;
  resolve: () => void;
  enterCueFlow: () => void;
  exitCueFlow: () => void;
  openStream: () => void;
  closeStream: () => void;
  setPosture: (posture: ShellPosture) => void;
  showOverlay: (overlayId: string) => void;
  dismissOverlay: () => void;

  // ── Raw ──
  /** The raw XState send function for advanced usage */
  send: (event: any) => void;
}

export function useShellActor(input: ShellInput): ShellActorAPI {
  const [state, send] = useMachine(shellMachine, {
    input,
  });

  // ── Derived values ──
  const activeRoomId = selectActiveRoom(state);
  const inCueFlow = selectInCueFlow(state);
  const streamState = selectStreamState(state);
  const streamOpen = streamState === 'open' || streamState === 'opening';
  const anchorState = selectAnchorState(state);
  const posture = selectShellPosture(state);
  const returnTarget = selectReturnTarget(state);
  const expandedParentId = selectExpandedParent(state);
  const overlayId = selectOverlay(state);

  // ��─ Actions ──
  const enterRoom = useCallback((roomId: string, parentId?: string) => {
    send({ type: 'ROOM.ENTER', roomId, parentId });
  }, [send]);

  const forkRoom = useCallback((childId: string, parentId: string) => {
    send({ type: 'ROOM.FORK', childId, parentId });
  }, [send]);

  const returnRoom = useCallback(() => {
    send({ type: 'ROOM.RETURN' });
  }, [send]);

  const resolve = useCallback(() => {
    send({ type: 'ROOM.RESOLVE' });
  }, [send]);

  const enterCueFlow = useCallback(() => {
    send({ type: 'CUE_FLOW.ENTER' });
  }, [send]);

  const exitCueFlow = useCallback(() => {
    send({ type: 'CUE_FLOW.EXIT' });
  }, [send]);

  const openStream = useCallback(() => {
    send({ type: 'STREAM.OPEN' });
  }, [send]);

  const closeStream = useCallback(() => {
    send({ type: 'STREAM.CLOSE' });
  }, [send]);

  const setPosture = useCallback((p: ShellPosture) => {
    send({ type: 'POSTURE.SET', posture: p });
  }, [send]);

  const showOverlay = useCallback((id: string) => {
    send({ type: 'OVERLAY.SHOW', overlayId: id });
  }, [send]);

  const dismissOverlay = useCallback(() => {
    send({ type: 'OVERLAY.DISMISS' });
  }, [send]);

  return {
    activeRoomId,
    inCueFlow,
    streamOpen,
    streamState,
    anchorState,
    posture,
    returnTarget,
    expandedParentId,
    overlayId,
    enterRoom,
    forkRoom,
    returnRoom,
    resolve,
    enterCueFlow,
    exitCueFlow,
    openStream,
    closeStream,
    setPosture,
    showOverlay,
    dismissOverlay,
    send,
  };
}