/**
 * ATOM TYPE SYSTEM
 *
 * Every atom is a self-contained canvas-based physics simulation.
 * Transparent background. Lives on the depth glass.
 * The glass IS the background — the atom floats on top.
 *
 * ═══════════════════════════════════════════════════════
 * THE ATOM CONTRACT
 * ═══════════════════════════════════════════════════════
 *
 * An atom MUST:
 *   1. Accept AtomProps as its only props
 *   2. export default (required for lazy loading in the library)
 *   3. Render a single <div style={{ position: 'absolute', inset: 0 }}>
 *      containing a single <canvas> with touchAction: 'none'
 *   4. Run its own requestAnimationFrame loop inside a useEffect
 *      with deps [viewport.width, viewport.height]
 *   5. Store mutable physics state in useRef (never useState)
 *   6. Store latest props in a propsRef (avoids stale closures)
 *   7. Store callbacks in a cbRef (same reason)
 *   8. Handle DPR-correct canvas setup every frame
 *   9. Call ctx.save() at frame start, ctx.restore() at frame end
 *  10. Cancel the rAF and remove all listeners in cleanup
 *
 * An atom MUST NOT:
 *   - Use useState for animation state (kills perf)
 *   - Draw opaque backgrounds (the glass must show through)
 *   - Import from outside ./atom-utils and ./types
 *   - Use CSS transitions/animations (canvas only)
 *   - Depend on DOM outside its own canvas
 *
 * CANONICAL PATTERN:
 *
 *   import { useRef, useEffect } from 'react';
 *   import type { AtomProps } from './types';
 *   import { parseColor, lerpColor, rgba, easeOutExpo, type RGB,
 *            ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';
 *
 *   export default function MyAtom(props: AtomProps) {
 *     const canvasRef = useRef<HTMLCanvasElement>(null);
 *     const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange });
 *     const propsRef = useRef({ ...relevantProps });
 *     const stateRef = useRef({ ...mutablePhysicsState, entranceProgress: 0 });
 *
 *     useEffect(() => { cbRef.current = { ... }; }, [callbacks]);
 *     useEffect(() => { propsRef.current = { ... }; }, [props]);
 *
 *     useEffect(() => {
 *       const canvas = canvasRef.current; if (!canvas) return;
 *       const ctx = canvas.getContext('2d'); if (!ctx) return;
 *       const w = props.viewport.width, h = props.viewport.height;
 *       const s = stateRef.current;
 *       let animId: number;
 *       const dpr = window.devicePixelRatio || 1;
 *
 *       // ... attach pointer listeners ...
 *
 *       const render = () => {
 *         const p = propsRef.current;
 *         // DPR setup
 *         const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
 *         if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
 *         ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
 *
 *         // Entrance
 *         if (s.entranceProgress < 1) s.entranceProgress = Math.min(1,
 *           s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
 *         const entrance = easeOutExpo(s.entranceProgress);
 *
 *         // ... physics ...
 *         // ... render ...
 *
 *         ctx.restore();
 *         animId = requestAnimationFrame(render);
 *       };
 *
 *       animId = requestAnimationFrame(render);
 *       return () => { cancelAnimationFrame(animId); /* remove listeners */ };
 *     }, [props.viewport.width, props.viewport.height]);
 *
 *     return (
 *       <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
 *         <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%',
 *           touchAction: 'none', cursor: 'default' }} />
 *       </div>
 *     );
 *   }
 */

export interface AtomProps {
  /** Breath amplitude 0–1. Primary biological input. */
  breathAmplitude: number;
  /** Reduced motion preference */
  reducedMotion: boolean;
  /** Primary color (hex string) */
  color: string;
  /** Accent color (hex string) */
  accentColor: string;
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Lifecycle phase */
  phase: 'enter' | 'active' | 'resolve';
  /** Haptic callback */
  onHaptic: (type: string) => void;
  /** State change callback (0–1 progress) */
  onStateChange?: (value: number) => void;
  /** Resolution callback — atom has completed */
  onResolve?: () => void;
}

/** Atom metadata for the registry */
export interface AtomMeta {
  /** Unique slug */
  id: string;
  /** Display name */
  name: string;
  /** Series number */
  series: number;
  /** Series name */
  seriesName: string;
  /** One-line essence */
  essence: string;
  /** Interaction archetype */
  interaction: 'hold' | 'drag' | 'swipe' | 'pinch' | 'tap' | 'draw' | 'voice' | 'type' | 'breath' | 'observe';
  /** Primary color for this atom */
  color: string;
  /** Accent color */
  accentColor: string;
  /** Whether the atom is implemented */
  implemented: boolean;
}

/**
 * Haptic event types atoms can fire:
 *   'hold_start'     — finger down
 *   'hold_threshold' — sustained hold crossed depth threshold
 *   'hold_release'   — finger up after deep hold
 *   'breath_peak'    — breath amplitude crossed peak
 *   'tap'            — single touch
 *   'completion'     — atom reached resolution
 */
export type HapticEvent =
  | 'hold_start'
  | 'hold_threshold'
  | 'hold_release'
  | 'breath_peak'
  | 'tap'
  | 'completion';