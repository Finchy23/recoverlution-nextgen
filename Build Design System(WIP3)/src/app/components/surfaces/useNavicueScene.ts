/**
 * useNavicueScene — The Scene Orchestrator
 *
 * The heartbeat of SYNC. This hook orchestrates the navicue lifecycle:
 *
 *   ATMOSPHERE  → glass breathes, nothing visible
 *   ENTRANCE    → canopy floats in, atom materializes, gesture whispers
 *   LIVE        → canopy collapses on touch, atom responds to physics
 *   RESOLVE     → hold threshold met, atom snaps
 *   SEAL        → receipt appears, neural pathway stamped
 *   TRANSITION  → receipt fades, prepare next scene
 *   → back to ATMOSPHERE with new navicue
 *
 * Copy Doctrine (§7):
 *   NAVICUES recipe: Canopy (4-10w) → Gesture (1-4w) → Receipt (1-6w)
 *   Room owns: canopy, gesture
 *   Player owns: receipt, route, ambient
 *
 * This is the bloodline. Instagram with a brain.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import type { NaviCueBundle } from '../runtime/navicue-runtime';
import * as navicueRuntime from '../runtime/navicue-runtime';

// ═══════════════════════════════════════════════════
// SCENE TYPES
// ═══════════════════════════════════════════════════

export type ScenePhase =
  | 'atmosphere'   // Glass breathes alone
  | 'entrance'     // Copy and atom materialize
  | 'live'         // Interaction active, canopy collapsed
  | 'resolve'      // Hold threshold met
  | 'seal'         // Receipt, neural pathway stamped
  | 'transition';  // Preparing next scene

/** A single scene — the atomic unit of the SYNC experience */
export interface NavicueScene {
  id: string;
  canopy: string;
  gesture: string;
  receipt: string;
  holdDurationMs: number;
  route?: { target: string; label: string };
  source: 'runtime' | 'local';
  bundle?: NaviCueBundle;
}

// ═══════════════════════════════════════════════════
// LOCAL SCENE LIBRARY
// ═══════════════════════════════════════════════════

type SceneSeed = Omit<NavicueScene, 'id' | 'source'>;

const LOCAL_SCENES: SceneSeed[] = [
  {
    canopy: 'The weight will move when you are ready.',
    gesture: 'Hold the glass.',
    receipt: 'The weight moved.',
    holdDurationMs: 1800,
  },
  {
    canopy: 'You showed up. That is the hardest part.',
    gesture: 'Touch the glass.',
    receipt: 'You are here.',
    holdDurationMs: 1600,
  },
  {
    canopy: 'The body remembers what the mind forgets.',
    gesture: 'Hold.',
    receipt: 'Felt.',
    holdDurationMs: 2000,
  },
  {
    canopy: 'One breath changes everything.',
    gesture: 'Breathe with the glass.',
    receipt: 'The rhythm held.',
    holdDurationMs: 1800,
  },
  {
    canopy: 'Nothing needs fixing right now.',
    gesture: 'Rest here.',
    receipt: 'Permission granted.',
    holdDurationMs: 1400,
  },
  {
    canopy: 'The fog is not you. It is weather.',
    gesture: 'Hold still.',
    receipt: 'The sky cleared.',
    holdDurationMs: 1800,
  },
  {
    canopy: 'Strength is not the absence of trembling.',
    gesture: 'Press.',
    receipt: 'Steady.',
    holdDurationMs: 2200,
  },
  {
    canopy: 'What you carry does not define you.',
    gesture: 'Release.',
    receipt: 'Lighter.',
    holdDurationMs: 1600,
  },
];

const PLOT_SCENES: Record<string, SceneSeed[]> = {
  clarity_low: [
    { canopy: 'The fog is temporary. You are not.', gesture: 'Hold.', receipt: 'Clearer.', holdDurationMs: 1800 },
    { canopy: 'You do not need to see the whole path.', gesture: 'One step.', receipt: 'The step was enough.', holdDurationMs: 1600 },
  ],
  energy_low: [
    { canopy: 'Rest is not retreat. It is architecture.', gesture: 'Stay.', receipt: 'Restored.', holdDurationMs: 1400 },
    { canopy: 'The body is asking for permission to pause.', gesture: 'Grant it.', receipt: 'Granted.', holdDurationMs: 1600 },
  ],
  anchorage_low: [
    { canopy: 'Feel the ground. It has not moved.', gesture: 'Press down.', receipt: 'Grounded.', holdDurationMs: 2000 },
    { canopy: 'The anchor is not out there. It is in here.', gesture: 'Hold.', receipt: 'Anchored.', holdDurationMs: 1800 },
  ],
  coherent: [
    { canopy: 'All three coordinates are aligned.', gesture: 'Feel that.', receipt: 'Coherent.', holdDurationMs: 1600 },
    { canopy: 'The system is steady. So are you.', gesture: 'Observe.', receipt: 'Witnessed.', holdDurationMs: 1400 },
  ],
};

// ── Helpers ──

let _sceneCounter = 0;
function mintId(): string {
  return `scene-${++_sceneCounter}-${Date.now()}`;
}

function seedToScene(seed: SceneSeed): NavicueScene {
  return { ...seed, id: mintId(), source: 'local' };
}

/** Build the initial queue — always returns at least one scene */
function buildInitialQueue(): NavicueScene[] {
  return LOCAL_SCENES.map(seedToScene);
}

/** Build PLOT-aware scenes to INSERT (not replace) */
function buildPlotScenes(
  coords: { id: string; value: number }[],
): NavicueScene[] {
  const scenes: SceneSeed[] = [];
  const clarity = coords.find(c => c.id === 'clarity')?.value ?? 0.5;
  const energy = coords.find(c => c.id === 'energy')?.value ?? 0.5;
  const anchorage = coords.find(c => c.id === 'anchorage')?.value ?? 0.5;
  const avg = (clarity + energy + anchorage) / 3;

  if (avg > 0.65 && Math.abs(Math.max(clarity, energy, anchorage) - Math.min(clarity, energy, anchorage)) < 0.2) {
    scenes.push(PLOT_SCENES.coherent[0]);
  }
  if (clarity < 0.35) scenes.push(PLOT_SCENES.clarity_low[0]);
  if (energy < 0.35) scenes.push(PLOT_SCENES.energy_low[0]);
  if (anchorage < 0.35) scenes.push(PLOT_SCENES.anchorage_low[0]);

  return scenes.map(seedToScene);
}

// ═══════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════

const SEAL_DWELL_MS = 5000;
const TRANSITION_MS = 800;

// ═══════════════════════════════════════════════════
// THE HOOK
// ═══════════════════════════════════════════════════

export interface NavicueSceneResult {
  phase: ScenePhase;
  scene: NavicueScene;
  sceneIndex: number;
  scenesCompleted: number;
  runtimeConnected: boolean;
  /** Personalized canopy — may be enriched by temporal diff */
  canopy: string;
  enterLive: () => void;
  resolve: () => void;
  advanceNow: () => void;
  reset: () => void;
}

export function useNavicueScene(
  mode: SurfaceMode,
  plotCoords: { id: string; value: number }[] | null,
  userId: string,
  atmosphereMs: number = 400,
  /** Temporal diff text from PLOT history — enriches first canopy */
  temporalDiffText: string | null = null,
  /** Active friction node name from ∞MAP */
  frictionNodeName: string | null = null,
): NavicueSceneResult {
  // ── Queue is initialized inline so scene is NEVER null ──
  const [sceneQueue, setSceneQueue] = useState<NavicueScene[]>(buildInitialQueue);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<ScenePhase>('atmosphere');
  const [scenesCompleted, setScenesCompleted] = useState(0);
  const [runtimeConnected, setRuntimeConnected] = useState(false);
  const [plotScenesInserted, setPlotScenesInserted] = useState(false);

  const sealTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const atmosphereTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);
  // Stable refs for callbacks used inside timers — avoids stale closures
  const sceneIndexRef = useRef(sceneIndex);
  sceneIndexRef.current = sceneIndex;
  const sceneQueueRef = useRef(sceneQueue);
  sceneQueueRef.current = sceneQueue;
  const plotCoordsRef = useRef(plotCoords);
  plotCoordsRef.current = plotCoords;

  // Current scene — guaranteed non-null because queue is pre-populated
  const scene = sceneQueue[sceneIndex] ?? sceneQueue[0];

  // ── Personalized canopy ──
  // First scene canopy can be enriched by temporal diff / friction data.
  // Subsequent scenes use their own canopy as-is.
  const canopy = useMemo(() => {
    if (scenesCompleted > 0 || sceneIndex > 0) return scene.canopy;

    // First scene: enrich with PLOT temporal diff if available
    if (temporalDiffText) return temporalDiffText;

    // Friction node awareness
    if (frictionNodeName && plotCoords) {
      const avg = plotCoords.reduce((s, c) => s + c.value, 0) / Math.max(1, plotCoords.length);
      if (avg < 0.55) return `${frictionNodeName} is still active.`;
    }

    return scene.canopy;
  }, [scene.canopy, scenesCompleted, sceneIndex, temporalDiffText, frictionNodeName, plotCoords]);

  // ── Cleanup ──
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(sealTimerRef.current);
      clearTimeout(transitionTimerRef.current);
      clearTimeout(atmosphereTimerRef.current);
    };
  }, []);

  // ── Mode reset ──
  useEffect(() => {
    if (mode.id !== 'sync') return;
    setSceneQueue(buildInitialQueue());
    setSceneIndex(0);
    setScenesCompleted(0);
    setPlotScenesInserted(false);
    setPhase('atmosphere');
  }, [mode.id]);

  // ── Insert PLOT scenes once when coords arrive ──
  useEffect(() => {
    if (!plotCoords || plotCoords.length === 0 || plotScenesInserted) return;
    const plotQueue = buildPlotScenes(plotCoords);
    if (plotQueue.length === 0) return;

    // Insert PLOT scenes AFTER the current scene (never mutate what's playing)
    setSceneQueue(prev => {
      const before = prev.slice(0, sceneIndexRef.current + 1);
      const after = prev.slice(sceneIndexRef.current + 1);
      return [...before, ...plotQueue, ...after];
    });
    setPlotScenesInserted(true);
    console.log(`[SYNC] Inserted ${plotQueue.length} PLOT-aware scenes`);
  }, [plotCoords, plotScenesInserted]);

  // ── Try navicue runtime on mount ──
  useEffect(() => {
    if (mode.id !== 'sync') return;
    navicueRuntime.health().then(({ data, error }) => {
      if (!mountedRef.current) return;
      if (data && !error) {
        setRuntimeConnected(true);
        console.log('[SYNC] NaviCue runtime connected');
      } else {
        console.log('[SYNC] NaviCue runtime unavailable, local scenes active');
      }
    });
  }, [mode.id]);

  // ═══════════════════════════════════════════════════
  // PHASE TRANSITIONS (timer-driven)
  // ═══════════════════════════════════════════════════

  // Atmosphere → Entrance
  useEffect(() => {
    if (phase !== 'atmosphere') return;
    atmosphereTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase('entrance');
    }, atmosphereMs);
    return () => clearTimeout(atmosphereTimerRef.current);
  }, [phase, atmosphereMs]);

  // Seal → Transition (auto-advance after dwell)
  useEffect(() => {
    if (phase !== 'seal') return;
    sealTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase('transition');
    }, SEAL_DWELL_MS);
    return () => clearTimeout(sealTimerRef.current);
  }, [phase]);

  // Transition → Next scene
  useEffect(() => {
    if (phase !== 'transition') return;
    transitionTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      const idx = sceneIndexRef.current;
      const queue = sceneQueueRef.current;
      const nextIdx = idx + 1;

      if (nextIdx >= queue.length) {
        // Rebuild queue with fresh scenes
        const fresh = buildInitialQueue();
        const plotExtra = plotCoordsRef.current ? buildPlotScenes(plotCoordsRef.current) : [];
        setSceneQueue([...plotExtra, ...fresh]);
        setSceneIndex(0);
      } else {
        setSceneIndex(nextIdx);
      }
      setScenesCompleted(prev => prev + 1);
      setPhase('atmosphere');
    }, TRANSITION_MS);
    return () => clearTimeout(transitionTimerRef.current);
  }, [phase]);

  // ═══════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════

  const enterLive = useCallback(() => {
    if (phase === 'entrance' || phase === 'atmosphere') {
      clearTimeout(atmosphereTimerRef.current);
      setPhase('live');
    }
  }, [phase]);

  const resolve = useCallback(() => {
    if (phase !== 'live') return;
    setPhase('resolve');
    setTimeout(() => {
      if (mountedRef.current) setPhase('seal');
    }, 1200);
  }, [phase]);

  const advanceNow = useCallback(() => {
    if (phase === 'seal') {
      clearTimeout(sealTimerRef.current);
      setPhase('transition');
    }
  }, [phase]);

  const reset = useCallback(() => {
    clearTimeout(sealTimerRef.current);
    clearTimeout(transitionTimerRef.current);
    clearTimeout(atmosphereTimerRef.current);
    setSceneQueue(buildInitialQueue());
    setSceneIndex(0);
    setScenesCompleted(0);
    setPlotScenesInserted(false);
    setPhase('atmosphere');
  }, []);

  return useMemo(() => ({
    phase,
    scene,
    sceneIndex,
    scenesCompleted,
    runtimeConnected,
    canopy,
    enterLive,
    resolve,
    advanceNow,
    reset,
  }), [phase, scene, sceneIndex, scenesCompleted, runtimeConnected, canopy, enterLive, resolve, advanceNow, reset]);
}
