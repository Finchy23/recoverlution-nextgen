/**
 * PLOT SURFACE — The Architecture of Capacity
 *
 * Three capillary tubes carved into the glass.
 * Energy. Clarity. Balance.
 *
 * No numbers. No labels demanding attention.
 * The fill IS the data. The eye reads the level.
 * The whisper names what the level means.
 *
 * Touch a column. It wakes. Drag to set.
 * As you move, a single whisper materializes
 * near the surface, an observation, never a judgment.
 * Release. The glass remembers.
 *
 * The atmosphere is the composite readout.
 * Three colors bleed into the void proportionally.
 * You feel the capacity before you name it.
 *
 * Philosophy: The De-Shaming of Capacity.
 * You do not judge an ecosystem for experiencing a drought.
 * You simply read the telemetry and adjust.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { hapticSeal } from './haptics';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import { FORM_PRACTICES } from '../form/form-practices';
import {
  room, font, layout, tracking, typeSize, leading, weight,
  opacity, timing, void_, layer, signal,
} from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const ORB_CLEARANCE = layout.orbClearance;

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

// ─── Whisper System ───
// Observations at charge thresholds. No moral language.
// No em dashes. No hyphens. Architecture of Resonance.

const WHISPERS: Record<string, { at: number; text: string }[]> = {
  energy: [
    { at: 0,    text: 'The tank is empty' },
    { at: 0.08, text: 'Running on reserves' },
    { at: 0.22, text: 'Some fuel remaining' },
    { at: 0.38, text: 'A steady supply' },
    { at: 0.55, text: 'Well fueled' },
    { at: 0.75, text: 'Fully charged' },
  ],
  clarity: [
    { at: 0,    text: 'Deep in the fog' },
    { at: 0.08, text: 'Signal is faint' },
    { at: 0.22, text: 'Shapes beginning to form' },
    { at: 0.38, text: 'The view is clearing' },
    { at: 0.55, text: 'Sharp signal' },
    { at: 0.75, text: 'Crystal clear' },
  ],
  balance: [
    { at: 0,    text: 'The ground is shifting' },
    { at: 0.08, text: 'Searching for footing' },
    { at: 0.22, text: 'Some steadiness returning' },
    { at: 0.38, text: 'Finding center' },
    { at: 0.55, text: 'Well anchored' },
    { at: 0.75, text: 'Deeply rooted' },
  ],
};

function getWhisper(id: string, value: number): string {
  const ws = WHISPERS[id];
  if (!ws) return '';
  let r = ws[0].text;
  for (const w of ws) { if (value >= w.at) r = w.text; }
  return r;
}

// ─── Battery Definition ───

interface Battery {
  id: string;
  label: string;
  color: string;
  value: number; // 0–1
}

const DEFAULT_BATTERIES: Battery[] = [
  { id: 'energy',  label: 'ENERGY',  color: signal.energy, value: 0.5 },
  { id: 'clarity', label: 'CLARITY', color: signal.clarity, value: 0.5 },
  { id: 'balance', label: 'BALANCE', color: signal.anchor,  value: 0.5 },
];

// ─── Column dimensions ───
const COL_W = 36;
const COL_R = 18;

interface PlotSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  onNavigate?: (modeId: string) => void;
}

// ═══════════════════════════════════════════════════
// CAPILLARY — A single glass column
// ═══════════════════════════════════════════════════

interface CapillaryProps {
  bat: Battery;
  idx: number;
  active: boolean;
  anyActive: boolean;
  height: number;
  breath: number;
  onDown: (i: number, clientY: number) => void;
  onMove: (clientY: number) => void;
  onUp: () => void;
}

function Capillary({ bat, idx, active, anyActive, height, breath, onDown, onMove, onUp }: CapillaryProps) {
  const whisper = getWhisper(bat.id, bat.value);
  const fill = bat.value * height;
  const breathShift = Math.sin(breath * Math.PI * 2 + idx * 2.1) * 2;

  // Dim non-active columns when one is active
  const restOpacity = anyActive ? (active ? 1 : 0.35) : 1;

  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={{ opacity: restOpacity }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: 80 }}
    >
      {/* ── The Glass Tube ── */}
      <div
        className="relative"
        style={{
          width: COL_W,
          height,
          borderRadius: COL_R,
          touchAction: 'none',
          cursor: 'ns-resize',
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          onDown(idx, e.clientY);
        }}
        onPointerMove={(e) => {
          if (active) onMove(e.clientY);
        }}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* Glass shell — the tube itself, barely there */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: COL_R,
            border: `1px solid ${bat.color}`,
            opacity: active ? 0.14 : 0.06,
            transition: `opacity 0.6s ${timing.curve}`,
          }}
        />

        {/* Inner shadow — carved-into-glass depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: COL_R,
            boxShadow: `inset 0 2px 8px ${room.void}`,
            opacity: 0.6,
          }}
        />

        {/* ── Plasma Fill ── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ borderRadius: `4px 4px ${COL_R}px ${COL_R}px`, overflow: 'hidden' }}
          animate={{ height: Math.max(0, fill + breathShift) }}
          transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }}
        >
          {/* Primary luminance */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${bat.color}20 0%, ${bat.color}10 50%, ${bat.color}06 100%)`,
              borderRadius: `4px 4px ${COL_R}px ${COL_R}px`,
            }}
          />

          {/* Meniscus — the bright surface line */}
          <motion.div
            className="absolute top-0 left-0 right-0"
            style={{ height: 3 }}
            animate={{
              boxShadow: active
                ? `0 0 14px 2px ${bat.color}50, 0 0 30px 4px ${bat.color}20`
                : `0 0 8px 1px ${bat.color}25, 0 0 20px 2px ${bat.color}10`,
              background: active
                ? `linear-gradient(to bottom, ${bat.color}70, ${bat.color}00)`
                : `linear-gradient(to bottom, ${bat.color}35, ${bat.color}00)`,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Internal breath — slow luminous pulse */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 100% 40% at 50% 0%, ${bat.color}12 0%, transparent 70%)`,
              borderRadius: `4px 4px ${COL_R}px ${COL_R}px`,
            }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{
              duration: active ? 1.2 : 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* ── Charge field — subtle glow expansion during drag ── */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: -8, right: -8,
                top: Math.max(0, height - fill - 16),
                height: 32,
                borderRadius: 16,
                background: `radial-gradient(ellipse 100% 100% at 50% 50%, ${bat.color}18 0%, transparent 70%)`,
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* ── Active halo — the glass edges wake up ── */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: COL_R,
                boxShadow: `0 0 24px ${bat.color}12, inset 0 0 12px ${bat.color}06`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Label — whisper-quiet, always present ── */}
      <motion.span
        className="pointer-events-none mt-3"
        style={{
          fontFamily: SANS,
          fontSize: typeSize.trace,
          fontWeight: weight.medium,
          letterSpacing: tracking.wide,
          textTransform: 'uppercase',
          color: bat.color,
        }}
        animate={{ opacity: active ? 0.5 : anyActive ? 0.08 : 0.15 }}
        transition={{ duration: 0.5 }}
      >
        {bat.label}
      </motion.span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// PLOT SURFACE — Main Component
// ═══════════════════════════════════════════════════

export function PlotSurface({ mode, breath, onResolve, onNavigate }: PlotSurfaceProps) {
  const userId = useIndividualId();
  const resilience = useResilience();
  const [batteries, setBatteries] = useState<Battery[]>(DEFAULT_BATTERIES);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [checkInPhase, setCheckInPhase] = useState<'idle' | 'adjusting' | 'sealed'>('idle');
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });
  const [formNudge, setFormNudge] = useState<{ practice: string; reason: string; id: string } | null>(null);
  const [sealPulse, setSealPulse] = useState<{ color: string; idx: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(null);
  const { arrived, delay } = useSurfaceArrival(mode);

  // ── Composite ──
  const composite = useMemo(() =>
    batteries.reduce((a, b) => a + b.value, 0) / batteries.length,
  [batteries]);

  // ── Active whisper ──
  const activeWhisper = useMemo(() =>
    activeIdx !== null ? getWhisper(batteries[activeIdx].id, batteries[activeIdx].value) : null,
  [activeIdx, batteries]);

  // ── Viewport ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // ── Load ──
  useEffect(() => {
    fetch(`${BASE}/plot/coordinates/${userId}`, { headers: headers() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.found && data.coordinates) {
          const mapped = data.coordinates.map((c: any) => {
            const id = c.id === 'anchorage' ? 'balance' : c.id;
            const def = DEFAULT_BATTERIES.find(b => b.id === id);
            return {
              id,
              label: def?.label || id.toUpperCase(),
              color: def?.color || signal.anchor,
              value: c.value ?? 0.5,
            };
          });
          if (mapped.length === 3) setBatteries(mapped);
          setLastCheckIn(data.timestamp);
        }
      })
      .catch(err => console.error('[PLOT load]', err));
  }, []);

  // ── Geometry ──
  const COL_TOP = viewport.height * 0.18;
  const COL_BOT = ORB_CLEARANCE + 52;
  const colH = Math.max(100, viewport.height - COL_TOP - COL_BOT);

  // ── Interaction ──

  const updateValue = useCallback((clientY: number) => {
    const idx = activeRef.current;
    if (idx === null) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const colTop = rect.top + COL_TOP;
    const relY = (clientY - colTop) / colH;
    const value = Math.max(0, Math.min(1, 1 - relY));
    setBatteries(prev => prev.map((b, i) => i === idx ? { ...b, value } : b));
  }, [colH, COL_TOP]);

  const handleDown = useCallback((idx: number, clientY: number) => {
    setActiveIdx(idx);
    activeRef.current = idx;
    setCheckInPhase('adjusting');
    updateValue(clientY);
  }, [updateValue]);

  const handleMove = useCallback((clientY: number) => {
    if (activeRef.current !== null) updateValue(clientY);
  }, [updateValue]);

  const handleUp = useCallback(() => {
    const idx = activeRef.current;
    if (idx !== null) {
      hapticSeal();

      // Seal pulse — a brief glow ripple from the fill line
      setSealPulse({ color: batteries[idx].color, idx });
      setTimeout(() => setSealPulse(null), 800);

      setCheckInPhase('sealed');

      // Save
      const coordinates = batteries.map(b => ({
        id: b.id === 'balance' ? 'anchorage' : b.id,
        label: b.label, color: b.color, value: b.value,
        whisper: getWhisper(b.id, b.value),
      }));

      fetch(`${BASE}/plot/coordinates`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId, coordinates }),
      })
        .then(r => r.json())
        .then(d => { if (d?.stored) { setLastCheckIn(d.timestamp); console.log('[PLOT] Telemetry sealed'); } })
        .catch(err => console.error('[PLOT save]', err));

      // PLOT → HONE
      const critical = batteries.find(b => b.value < 0.2);
      if (critical && onNavigate) {
        const map: Record<string, { pillar: string; reason: string }> = {
          clarity:  { pillar: 'rewire',   reason: 'The fog is heavy. Defusion may create some clearing.' },
          energy:   { pillar: 'bridge',   reason: 'The reserves are low. Rhythm can carry what effort cannot.' },
          balance:  { pillar: 'baseline', reason: 'The ground feels distant. The body can become the anchor.' },
        };
        const m = map[critical.id];
        if (m) {
          const matched = FORM_PRACTICES.find(p => p.pillar === m.pillar);
          if (matched) setTimeout(() => setFormNudge({ practice: matched.name, reason: m.reason, id: matched.id }), 2200);
        }
      }

      setTimeout(() => setCheckInPhase('idle'), 2000);
    }
    setActiveIdx(null);
    activeRef.current = null;
  }, [batteries, onNavigate, userId]);

  const timeSince = lastCheckIn ? formatTimeSince(lastCheckIn) : null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      {/* ── Void ── */}
      <div className="absolute inset-0" style={{ background: room.void }} />

      {/* ── Glass depth — vignette and interior luminance ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 48%, ${room.deep}80 0%, ${room.void} 100%)`,
        }}
      />

      {/* ── Atmosphere — three color fields bleeding into the glass ── */}
      {batteries.map((bat, i) => {
        const xPos = i === 0 ? '28%' : i === 1 ? '50%' : '72%';
        const yPos = i === 1 ? '46%' : '52%';
        return (
          <motion.div
            key={bat.id}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 45% 60% at ${xPos} ${yPos}, ${bat.color} 0%, transparent 70%)`,
            }}
            animate={{ opacity: 0.03 + bat.value * 0.12 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        );
      })}

      {/* ── Composite atmospheric breath — the glass breathing ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 48%, ${mode.color} 0%, transparent 70%)`,
        }}
        animate={{ opacity: [composite * 0.02, composite * 0.06, composite * 0.02] }}
        transition={{
          duration: 10 + (1 - composite) * 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── Glass refraction edge — subtle top-to-bottom gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${room.void}40 85%, ${room.void} 100%)`,
        }}
      />

      {/* ── Eyebrow ── */}
      <AnimatePresence>
        {arrived && checkInPhase === 'idle' && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ top: '5.5%', left: 0, right: 0, textAlign: 'center', zIndex: layer.raised }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('eyebrow'), ease: SURFACE_EASE as any }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.medium,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase',
              color: mode.color,
              opacity: opacity.quiet,
            }}>
              PLOT
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Seal confirmation — replaces eyebrow briefly ── */}
      <AnimatePresence>
        {checkInPhase === 'sealed' && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ top: '5.5%', left: 0, right: 0, textAlign: 'center', zIndex: layer.raised }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ambient }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.medium,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase',
              color: mode.color,
            }}>
              SEALED
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Canopy whisper — the narrative voice ── */}
      <AnimatePresence>
        {arrived && activeIdx === null && checkInPhase === 'idle' && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '8%', left: '12%', right: '12%',
              textAlign: 'center', zIndex: layer.raised,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: opacity.gentle, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 1.2, delay: delay('content'), ease: SURFACE_EASE as any }}
          >
            <span style={{
              fontFamily: SERIF,
              fontSize: 'clamp(13px, 3.4vw, 17px)',
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              lineHeight: leading.breath,
            }}>
              What do you notice today
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active whisper — changes as you drag ── */}
      <AnimatePresence mode="wait">
        {activeWhisper && activeIdx !== null && (
          <motion.div
            key={activeWhisper}
            className="absolute pointer-events-none"
            style={{
              top: '8%', left: '10%', right: '10%',
              textAlign: 'center', zIndex: layer.raised,
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: opacity.spoken, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{
              fontFamily: SERIF,
              fontSize: 'clamp(14px, 3.6vw, 18px)',
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: batteries[activeIdx].color,
              lineHeight: leading.breath,
              transition: `color 0.3s ${timing.curve}`,
            }}>
              {activeWhisper}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── The Three Capillaries ── */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            className="absolute flex justify-center items-end"
            style={{
              top: COL_TOP, left: 0, right: 0, bottom: COL_BOT,
              zIndex: layer.content,
              gap: Math.min(48, viewport.width * 0.1),
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('atmosphere'), ease: SURFACE_EASE as any }}
          >
            {batteries.map((bat, i) => (
              <Capillary
                key={bat.id}
                bat={bat}
                idx={i}
                active={activeIdx === i}
                anyActive={activeIdx !== null}
                height={colH}
                breath={breath}
                onDown={handleDown}
                onMove={handleMove}
                onUp={handleUp}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Seal pulse — ripple from the column on release ── */}
      <AnimatePresence>
        {sealPulse && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: 0, right: 0,
              top: COL_TOP, bottom: COL_BOT,
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width: 2, height: 2,
                borderRadius: '50%',
                background: sealPulse.color,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 80, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Last reading ── */}
      {arrived && timeSince && checkInPhase === 'idle' && activeIdx === null && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            bottom: ORB_CLEARANCE + 12, left: 0, right: 0,
            textAlign: 'center', zIndex: layer.raised,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity.trace }}
        >
          <span style={{
            fontFamily: SANS,
            fontSize: typeSize.trace,
            fontWeight: weight.regular,
            letterSpacing: tracking.snug,
            color: room.fg,
            textTransform: 'uppercase',
          }}>
            LAST READING · {timeSince}
          </span>
        </motion.div>
      )}

      {/* ── PLOT → HONE Nudge ── */}
      <AnimatePresence>
        {formNudge && (
          <motion.div
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              bottom: ORB_CLEARANCE + 36, left: '12%', right: '12%',
              textAlign: 'center', zIndex: layer.float,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              if (onNavigate) {
                console.log(`[PLOT→HONE] ${formNudge.practice}`);
                onNavigate('hone');
              }
              setFormNudge(null);
            }}
          >
            <span style={{
              fontFamily: SERIF,
              fontSize: 'clamp(12px, 3vw, 15px)',
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              opacity: opacity.present,
              display: 'block',
              lineHeight: leading.body,
            }}>
              {formNudge.reason}
            </span>
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.trace,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              textTransform: 'uppercase',
              color: mode.color,
              opacity: opacity.murmur,
              marginTop: 6,
              display: 'block',
            }}>
              HONE → {formNudge.practice.toUpperCase()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="plot" />

      {/* ── Orb clearance ── */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: ORB_CLEARANCE,
          background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
          zIndex: layer.scrim,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── Utility ───

function formatTimeSince(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return `${mins}M AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}