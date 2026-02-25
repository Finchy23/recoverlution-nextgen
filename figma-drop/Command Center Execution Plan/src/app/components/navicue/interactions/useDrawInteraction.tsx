/**
 * useDrawInteraction — Pattern C: Draw Connection
 *
 * Tracks freeform pointer drawing within a container.
 * Returns path points, stroke count, coverage (0→1),
 * and completion when enough of the canvas is traversed.
 *
 * Used by: Philosopher's Stone, constellation drawing,
 * sigil tracing, and any specimen requiring gesture-as-ritual.
 */
import { useRef, useState, useCallback, useEffect } from 'react';

export interface Point { x: number; y: number; }
export interface Stroke { points: Point[]; }

interface DrawConfig {
  /** Fraction of canvas area that must be covered (0-1). Default 0.35 */
  coverageThreshold?: number;
  /** Min strokes required before completion can fire. Default 1 */
  minStrokes?: number;
  /** Called when coverage reaches threshold */
  onComplete?: () => void;
  /** Grid resolution for coverage calc. Default 10 */
  gridRes?: number;
}

interface DrawState {
  strokes: Stroke[];
  currentStroke: Point[];
  isDrawing: boolean;
  coverage: number;    // 0-1
  completed: boolean;
}

export function useDrawInteraction(config: DrawConfig = {}) {
  const {
    coverageThreshold = 0.35,
    minStrokes = 1,
    onComplete,
    gridRes = 10,
  } = config;

  const [state, setState] = useState<DrawState>({
    strokes: [], currentStroke: [], isDrawing: false, coverage: 0, completed: false,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  /**
   * Separate track ref for two-element patterns where the canvas container
   * and the event target are different elements.
   * Exposed as `containerRef` in the return value.
   * toLocal prefers this over the internal containerRef.
   */
  const trackRef = useRef<HTMLDivElement | null>(null);
  const coveredCells = useRef<Set<string>>(new Set());
  const totalCells = gridRes * gridRes;
  const completeFiredRef = useRef(false);
  // Ref mirrors for values read inside event handlers to avoid stale closures
  const isDrawingRef = useRef(false);

  // Convert client coords → normalised 0-1 within container
  const toLocal = useCallback((clientX: number, clientY: number): Point | null => {
    const el = trackRef.current || containerRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    const y = (clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    return { x, y };
  }, []);

  // Mark grid cell as covered
  const markCoverage = useCallback((p: Point) => {
    const col = Math.min(gridRes - 1, Math.floor(p.x * gridRes));
    const row = Math.min(gridRes - 1, Math.floor(p.y * gridRes));
    coveredCells.current.add(`${col},${row}`);
  }, [gridRes]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (completeFiredRef.current) return;
    const p = toLocal(clientX, clientY);
    if (!p) return;
    markCoverage(p);
    isDrawingRef.current = true;
    setState(prev => ({ ...prev, isDrawing: true, currentStroke: [p] }));
  }, [toLocal, markCoverage]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDrawingRef.current || completeFiredRef.current) return;
    const p = toLocal(clientX, clientY);
    if (!p) return;
    markCoverage(p);
    setState(prev => ({ ...prev, currentStroke: [...prev.currentStroke, p] }));
  }, [toLocal, markCoverage]);

  const handleEnd = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const coverage = coveredCells.current.size / totalCells;
    const wasAlreadyComplete = completeFiredRef.current;

    setState(prev => {
      const newStrokes = prev.currentStroke.length > 1
        ? [...prev.strokes, { points: prev.currentStroke }]
        : prev.strokes;

      const shouldComplete =
        coverage >= coverageThreshold &&
        newStrokes.length >= minStrokes &&
        !completeFiredRef.current;

      if (shouldComplete) completeFiredRef.current = true;

      return {
        ...prev,
        isDrawing: false,
        strokes: newStrokes,
        currentStroke: [],
        coverage,
        completed: shouldComplete ? true : prev.completed,
      };
    });

    // Fire onComplete outside setState -- only if this specific handleEnd triggered it
    if (!wasAlreadyComplete) {
      const coverageNow = coveredCells.current.size / totalCells;
      if (coverageNow >= coverageThreshold) {
        // completeFiredRef was set inside setState above; fire callback after state settles
        queueMicrotask(() => {
          if (completeFiredRef.current) onComplete?.();
        });
      }
    }
  }, [totalCells, coverageThreshold, minStrokes, onComplete]);

  // Cleanup
  useEffect(() => {
    return () => { completeFiredRef.current = false; isDrawingRef.current = false; };
  }, []);

  const drawProps = {
    ref: containerRef,
    onPointerDown: (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      handleStart(e.clientX, e.clientY);
    },
    onPointerMove: (e: React.PointerEvent) => handleMove(e.clientX, e.clientY),
    onPointerUp: () => handleEnd(),
    onPointerCancel: () => handleEnd(),
    style: { touchAction: 'none' as const, cursor: 'crosshair' },
  };

  /** All completed + current points as SVG path data (normalised 0-1) */
  const allPoints: Point[] = [
    ...state.strokes.flatMap(s => s.points),
    ...state.currentStroke,
  ];

  const reset = useCallback(() => {
    coveredCells.current.clear();
    completeFiredRef.current = false;
    isDrawingRef.current = false;
    setState({ strokes: [], currentStroke: [], isDrawing: false, coverage: 0, completed: false });
  }, []);

  return { ...state, drawProps, allPoints, containerRef: trackRef, reset };
}