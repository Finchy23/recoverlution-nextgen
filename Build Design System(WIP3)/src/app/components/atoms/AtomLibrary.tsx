/**
 * ATOM LIBRARY — The Seed Pack Browser
 *
 * A glass-native browsable view of all 18 seed atoms.
 * Transparent on dark glass. No boxes. No cards.
 * Each atom gets a full-viewport canvas when selected.
 *
 * Death of the Box: Atom previews are live canvases, not thumbnails.
 * The library itself is a continuous field, not a grid.
 */

import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ATOM_REGISTRY, type AtomMeta } from './atom-registry';
import type { AtomProps } from './types';
import { room, font, colors, tracking, typeSize, leading, weight, opacity, timing, glow, void_, layer, layout } from '../design-system/surface-tokens';

// ─── Lazy-load implemented atoms ───
const atomComponents: Record<string, LazyExoticComponent<ComponentType<AtomProps>>> = {
  'somatic-resonance': lazy(() => import('./somatic-resonance')),
  'wave-collapse': lazy(() => import('./wave-collapse')),
  'dark-matter': lazy(() => import('./dark-matter')),
  'mycelial-routing': lazy(() => import('./mycelial-routing')),
  'phoenix-ash': lazy(() => import('./phoenix-ash')),
  'cymatic-coherence': lazy(() => import('./cymatic-coherence')),
  'future-memory': lazy(() => import('./future-memory')),
  'still-point': lazy(() => import('./still-point')),
  'tidal-breath': lazy(() => import('./tidal-breath')),
  'weight-release': lazy(() => import('./weight-release')),
  'signal-fire': lazy(() => import('./signal-fire')),
  'dissolve': lazy(() => import('./dissolve')),
  'ember-grid': lazy(() => import('./ember-grid')),
  'pendulum-rest': lazy(() => import('./pendulum-rest')),
  'mirror-breath': lazy(() => import('./mirror-breath')),
  'root-pulse': lazy(() => import('./root-pulse')),
  'threshold': lazy(() => import('./threshold')),
};

// ─── Interaction label ───
const INTERACTION_LABELS: Record<string, string> = {
  hold: 'HOLD', breath: 'BRTH', tap: 'TOUC', drag: 'DRAG',
  swipe: 'SWPE', pinch: 'PNCH', draw: 'DRAW', voice: 'VOIC',
  type: 'TYPE', observe: 'LOOK',
};

// ─── Breath Simulator (for library preview) ───
// Throttled to ~15fps to avoid hammering React renders.
// Atoms read from propsRef internally so smooth visual is maintained.
function useSimulatedBreath(): number {
  const [breath, setBreath] = useState(0.3);

  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 0.065;
      setBreath(0.3 + 0.35 * Math.sin(t) + 0.15 * Math.sin(t * 2.3));
    }, 65);
    return () => clearInterval(id);
  }, []);

  return breath;
}

// ─── Stub Atom (for unimplemented atoms) ───
function StubAtom({ color, accentColor, viewport }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = viewport.width, h = viewport.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Just a faint atmospheric glow
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.3);
    grad.addColorStop(0, `${color}08`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Faint text
    ctx.fillStyle = `${color}15`;
    ctx.font = `500 7px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('PENDING', w / 2, h / 2);
  }, [color, accentColor, viewport]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}

// ─── Atom Tile ───
interface TileProps {
  meta: AtomMeta;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function AtomTile({ meta, isSelected, onSelect, index }: TileProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      className="flex items-center gap-3 w-full cursor-pointer"
      style={{
        background: 'none',
        border: 'none',
        padding: '10px 0',
        textAlign: 'left',
        opacity: isSelected ? 1 : opacity.body,
        transition: timing.t.fadeBrisk,
      }}
    >
      {/* Atom color dot */}
      <div
        className="rounded-full flex-shrink-0"
        style={{
          width: 6, height: 6,
          background: meta.color,
          opacity: isSelected ? 0.8 : opacity.spoken,
          boxShadow: isSelected ? glow.soft(meta.color, '30') : 'none',
          transition: timing.t.easeBrisk,
        }}
      />

      {/* Name + series */}
      <div className="flex-1 min-w-0">
        <span style={{
          fontFamily: font.serif,
          fontSize: typeSize.reading,
          fontWeight: weight.light,
          color: room.fg,
          display: 'block',
          lineHeight: leading.compact,
        }}>
          {meta.name}
        </span>
        <span style={{
          fontFamily: font.sans,
          fontSize: typeSize.label,
          fontWeight: weight.regular,
          letterSpacing: tracking.tight,
          color: meta.color,
          opacity: opacity.steady,
          textTransform: 'uppercase',
        }}>
          S{meta.series} · {INTERACTION_LABELS[meta.interaction] || meta.interaction}
        </span>
      </div>

      {/* Implementation status */}
      {meta.implemented && (
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: 3, height: 3,
            background: colors.status.green.bright,
            opacity: opacity.steady,
          }}
        />
      )}
    </motion.button>
  );
}

// ═════════════════════════════════════════════════
// THE ATOM LIBRARY
// ══════════════════════════════════════════════════

const ORB_CLEARANCE = layout.orbClearance;

interface AtomLibraryProps {
  onClose?: () => void;
}

export function AtomLibrary({ onClose }: AtomLibraryProps) {
  const [selectedId, setSelectedId] = useState(ATOM_REGISTRY[0].id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });
  const breath = useSimulatedBreath();

  const selectedMeta = ATOM_REGISTRY.find(a => a.id === selectedId) || ATOM_REGISTRY[0];

  // Track viewport size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  const noopHaptic = useCallback(() => {}, []);

  // Resolve the component for the selected atom
  const AtomComponent = selectedMeta.implemented
    ? atomComponents[selectedId]
    : undefined;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" style={{ background: room.void }}>
      {/* ═══ ATOM CANVAS — Full viewport behind everything ═══ */}
      <div className="absolute inset-0" style={{ zIndex: layer.base }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={null}>
              {AtomComponent ? (
                <AtomComponent
                  breathAmplitude={breath}
                  reducedMotion={false}
                  color={selectedMeta.color}
                  accentColor={selectedMeta.accentColor}
                  viewport={viewport}
                  phase="active"
                  onHaptic={noopHaptic}
                />
              ) : (
                <StubAtom
                  breathAmplitude={breath}
                  reducedMotion={false}
                  color={selectedMeta.color}
                  accentColor={selectedMeta.accentColor}
                  viewport={viewport}
                  phase="active"
                  onHaptic={noopHaptic}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ ATOM INFO — Floating over the canvas ═══ */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center pointer-events-none"
        style={{ top: '8%', zIndex: layer.raised }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5 }}
            className="text-center px-8 max-w-xs"
          >
            {/* Series eyebrow */}
            <span style={{
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.medium,
              letterSpacing: tracking.eyebrow,
              textTransform: 'uppercase',
              color: selectedMeta.color,
              opacity: opacity.spoken,
              display: 'block',
              marginBottom: 8,
            }}>
              S{selectedMeta.series} · {selectedMeta.seriesName}
            </span>

            {/* Atom name */}
            <h2 style={{
              fontFamily: font.serif,
              fontSize: typeSize.stream,
              fontWeight: weight.light,
              color: room.fg,
              opacity: opacity.lucid,
              lineHeight: leading.compact,
              margin: '0 0 6px',
            }}>
              {selectedMeta.name}
            </h2>

            {/* Essence */}
            <p style={{
              fontFamily: font.serif,
              fontSize: typeSize.small,
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              opacity: opacity.gentle,
              lineHeight: leading.body,
              margin: 0,
            }}>
              {selectedMeta.essence}
            </p>

            {/* Interaction badge */}
            <span style={{
              display: 'inline-block',
              marginTop: 10,
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.regular,
              letterSpacing: tracking.tight,
              textTransform: 'uppercase',
              color: selectedMeta.color,
              opacity: opacity.ambient,
            }}>
              {selectedMeta.interaction}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ ATOM LIST — Scrollable on the left ═══ */}
      <div
        className="absolute left-0 top-0 bottom-0 overflow-y-auto pointer-events-auto"
        style={{
          width: '42%',
          maxWidth: 180,
          paddingTop: '35%',
          paddingLeft: '5%',
          paddingRight: '3%',
          paddingBottom: ORB_CLEARANCE + 20,
          scrollbarWidth: 'none',
          zIndex: layer.overlay,
          background: `linear-gradient(to right, ${void_.abyss} 0%, ${void_.haze} 70%, transparent 100%)`,
        }}
      >
        {ATOM_REGISTRY.map((meta, i) => (
          <AtomTile
            key={meta.id}
            meta={meta}
            isSelected={meta.id === selectedId}
            onSelect={() => setSelectedId(meta.id)}
            index={i}
          />
        ))}
      </div>

      {/* ═══ CLOSE ═══ */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute cursor-pointer"
          style={{
            top: 16, right: 16, zIndex: layer.scrim,
            background: 'none', border: 'none',
            fontFamily: font.sans,
            fontSize: typeSize.detail, fontWeight: weight.regular,
            letterSpacing: tracking.normal, textTransform: 'uppercase',
            color: room.fg, opacity: opacity.ambient,
          }}
        >
          BACK
        </button>
      )}

      {/* ═══ HIDE SCROLLBAR ═══ */}
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}