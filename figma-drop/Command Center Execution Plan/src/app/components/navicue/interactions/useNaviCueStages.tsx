/**
 * useNaviCueStages — Universal stage lifecycle for all NaviCue specimens
 * 
 * Eliminates the ~12-line boilerplate that every specimen repeats:
 *   - Stage state management (arriving → present → active → resonant → afterglow)
 *   - Timer setup + cleanup
 *   - Auto-advancing arriving → present → active with standard timing
 * 
 * Usage:
 * ```tsx
 * const { stage, setStage, addTimer } = useNaviCueStages();
 * ```
 * 
 * With custom timing (rare):
 * ```tsx
 * const { stage, setStage, addTimer } = useNaviCueStages({ presentAt: 1000, activeAt: 4000 });
 * ```
 * 
 * Standard timing (matches 15-second cognitive bandwidth):
 *   arriving  → present:  1200ms  (world appears)
 *   present   → active:   3500ms  (invitation visible, then interaction opens)
 *   active    → resonant: specimen-controlled via addTimer
 *   resonant  → afterglow: specimen-controlled via addTimer
 * 
 * LIFECYCLE: All timers are auto-cleaned on unmount. No leaks.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Shared types (no longer need per-file definitions) ────────────

export type NaviCueStage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

export interface NaviCueProps {
  data?: any;
  onComplete?: () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────

interface UseNaviCueStagesOptions {
  /** Time from mount to 'present' stage (ms). Default: 1200 */
  presentAt?: number;
  /** Time from mount to 'active' stage (ms). Default: 3500 */
  activeAt?: number;
}

export function useNaviCueStages(options?: UseNaviCueStagesOptions) {
  const { presentAt = 1200, activeAt = 3500 } = options ?? {};

  const [stage, setStage] = useState<NaviCueStage>('arriving');
  const timersRef = useRef<number[]>([]);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  // Mount-only: auto-advance arriving → present → active
  // Timing values are captured at mount; options should not change.
  useEffect(() => {
    addTimer(() => setStage('present'), presentAt);
    addTimer(() => setStage('active'), activeAt);
    return () => { timersRef.current.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stage, setStage, addTimer };
}
