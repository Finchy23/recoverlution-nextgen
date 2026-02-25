/**
 * useDragInteraction — Pattern B: Continuous drag control
 * 
 * Tracks horizontal or vertical drag within a container.
 * Returns progress 0→1, isDragging, and current position.
 * Supports snap points and threshold callbacks.
 * 
 * Used by: Atmosphere Engineer (thermostat), Timeline Jump,
 * Warmth/Competence Grid, Time Dilate, etc.
 */
import { useRef, useState, useCallback } from 'react';

interface DragConfig {
  axis?: 'x' | 'y' | 'both';
  /** If true, value persists after release. If false, springs back to 0 */
  sticky?: boolean;
  /** Called when progress crosses threshold */
  onThreshold?: (progress: number) => void;
  /** Called when drag completes (progress >= 0.95) */
  onComplete?: () => void;
  /** Snap points (0-1) — value will round to nearest */
  snapPoints?: number[];
}

interface DragState {
  progress: number;        // 0-1 normalized
  rawX: number;            // pixel offset X
  rawY: number;            // pixel offset Y
  isDragging: boolean;
  completed: boolean;
}

export function useDragInteraction(config: DragConfig = {}) {
  const { axis = 'x', sticky = true, onThreshold, onComplete, snapPoints } = config;
  const [state, setState] = useState<DragState>({
    progress: 0, rawX: 0, rawY: 0, isDragging: false, completed: false,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  /**
   * Separate track ref for two-element patterns where the measurement
   * container (track) and the pointer-event target (handle) are different
   * elements. Exposed as `containerRef` in the return value.
   * getProgress prefers this over the internal containerRef.
   */
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef({ x: 0, y: 0, startProgress: 0 });
  // Ref mirrors for values read inside event handlers to avoid stale closures
  const isDraggingRef = useRef(false);
  const completedRef = useRef(false);

  const getProgress = useCallback((clientX: number, clientY: number): number => {
    const el = trackRef.current || containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    let p: number;
    if (axis === 'x') {
      p = (clientX - rect.left) / rect.width;
    } else if (axis === 'y') {
      p = 1 - (clientY - rect.top) / rect.height; // bottom=0, top=1
    } else {
      const px = (clientX - rect.left) / rect.width;
      const py = 1 - (clientY - rect.top) / rect.height;
      p = (px + py) / 2;
    }
    return Math.max(0, Math.min(1, p));
  }, [axis]);

  const snap = useCallback((p: number): number => {
    if (!snapPoints || snapPoints.length === 0) return p;
    let closest = snapPoints[0];
    let minDist = Math.abs(p - closest);
    for (const sp of snapPoints) {
      const d = Math.abs(p - sp);
      if (d < minDist) { minDist = d; closest = sp; }
    }
    return minDist < 0.08 ? closest : p;
  }, [snapPoints]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startRef.current = { x: clientX, y: clientY, startProgress: state.progress };
    isDraggingRef.current = true;
    setState(prev => ({ ...prev, isDragging: true }));
  }, [state.progress]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const raw = getProgress(clientX, clientY);
    const snapped = snap(raw);
    
    // Check completion BEFORE setState to avoid side effects inside updater
    const justCompleted = snapped >= 0.95 && !completedRef.current;
    if (justCompleted) completedRef.current = true;

    setState(prev => {
      const newState = { ...prev, progress: snapped, rawX: clientX, rawY: clientY };
      if (justCompleted) newState.completed = true;
      return newState;
    });

    // Fire callbacks outside setState (side effects must not live inside updaters)
    if (justCompleted) onComplete?.();
    onThreshold?.(snapped);
  }, [getProgress, snap, onComplete, onThreshold]);

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
    setState(prev => ({
      ...prev,
      isDragging: false,
      progress: sticky ? prev.progress : 0,
    }));
  }, [sticky]);

  // Unified event handlers for pointer events
  const dragProps = {
    ref: containerRef,
    onPointerDown: (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      handleStart(e.clientX, e.clientY);
    },
    onPointerMove: (e: React.PointerEvent) => handleMove(e.clientX, e.clientY),
    onPointerUp: () => handleEnd(),
    onPointerCancel: () => handleEnd(),
    style: { touchAction: 'none' as const, cursor: 'grab' },
  };

  const reset = useCallback(() => {
    isDraggingRef.current = false;
    completedRef.current = false;
    setState({ progress: 0, rawX: 0, rawY: 0, isDragging: false, completed: false });
  }, []);

  return { ...state, dragProps, containerRef: trackRef, reset };
}