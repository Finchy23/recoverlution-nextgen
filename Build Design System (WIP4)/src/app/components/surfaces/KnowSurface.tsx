/**
 * SYNC SURFACE — The Sanctuary of Understanding
 *
 * The entry experience for the SYNC modality.
 * Not a menu. Not a selector. An immersive descent into the triad of knowing.
 *
 * Three refractive lenses emerge from the dark glass:
 *   READ — The Infinite Book (articles, calm absorption)
 *   KNOW — The Anatomy of Truth (insights, tangible understanding)
 *   HONE — The Instruments of Alchemy (practices, somatic agency)
 *
 * Each lens is a luminous convergence point in the glass — not a button,
 * not a card — a localized refraction that breathes with the system.
 * Touch a lens and the glass carries you into that instrument.
 *
 * Spatial hierarchy (top → bottom):
 *   READ — lightest engagement, passive absorption
 *   KNOW — deeper, interactive understanding
 *   HONE — somatic, the body takes over
 *
 * Copy:
 *   Canopy: "Understand the machine."
 *   Each lens carries a whisper — one breath of invitation.
 *
 * Death of the Box: No bordered panels. No dock. No tabs.
 * The OS is continuous dark glass; the lenses ARE the navigation.
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { getModeById } from '../universal-player/surface-modes';
import { useSurfaceArrival, STAGGER, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { room, font, colors, tracking, typeSize, weight, opacity, timing, void_, refract, layer, layout } from '../design-system/surface-tokens';
import { TYPOGRAPHY } from './copy-guardrails';

// ─── Constants ───

const ORB_CLEARANCE = layout.orbClearance;

// ─── The Triad — three instruments of knowing ───

interface KnowLens {
  id: string;       // mode id to transition into
  label: string;    // 4-letter display name
  whisper: string;  // one-breath invitation
  color: string;    // lens tint
  gesture: string;  // action cue
}

const TRIAD: KnowLens[] = [
  {
    id: 'read',
    label: 'READ',
    whisper: 'The calm line through the noise',
    color: room.fg,
    gesture: 'DESCEND',
  },
  {
    id: 'know',
    label: 'KNOW',
    whisper: 'The anatomy of truth',
    color: colors.accent.cyan.primary,
    gesture: 'DESCEND',
  },
  {
    id: 'hone',
    label: 'HONE',
    whisper: 'The body takes over',
    color: colors.status.green.bright,
    gesture: 'BEGIN',
  },
];

// ─── Refractive Lens — a single luminous convergence point ───

function RefractiveLens({
  lens,
  breath,
  index,
  delay,
  onSelect,
}: {
  lens: KnowLens;
  breath: number;
  index: number;
  delay: number;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Each lens breathes at a slightly offset phase
  const phase = breath * Math.PI * 2 + index * 1.2;
  const breathScale = 1 + Math.sin(phase) * 0.015;
  const glowPulse = 0.5 + Math.sin(phase + 0.5) * 0.15;

  // Lens field size — grows on hover
  const fieldSize = hovered ? 140 : 100;
  const innerSize = hovered ? 56 : 44;

  return (
    <motion.button
      className="relative flex flex-col items-center cursor-pointer"
      style={{ background: 'none', border: 'none', padding: 0 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay, duration: SURFACE_DURATION, ease: SURFACE_EASE as unknown as number[] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(lens.id); }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer field — refractive glow */}
      <div className="relative flex items-center justify-center" style={{ width: fieldSize, height: fieldSize }}>
        <div
          className="absolute rounded-full"
          style={{
            width: fieldSize,
            height: fieldSize,
            background: `radial-gradient(circle, ${lens.color}${hovered ? '0a' : '04'} 0%, transparent 70%)`,
            transform: `scale(${breathScale})`,
            transition: timing.t.morphMid,
          }}
        />

        {/* Mid ring  refractive boundary */}
        <div
          className="absolute rounded-full"
          style={{
            width: innerSize + 16,
            height: innerSize + 16,
            border: `0.5px solid ${lens.color}${hovered ? '14' : '08'}`,
            transform: `scale(${breathScale})`,
            transition: timing.t.shift,
          }}
        />

        {/* Inner lens — the glass convergence point */}
        <div
          className="absolute rounded-full"
          style={{
            width: innerSize,
            height: innerSize,
            background: `radial-gradient(circle at 45% 40%, ${lens.color}${hovered ? '10' : '06'} 0%, ${lens.color}02 60%, transparent 85%)`,
            backdropFilter: hovered ? refract.soft : refract.subtle,
            transform: `scale(${breathScale})`,
            transition: timing.t.shift,
          }}
        />

        {/* Inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: innerSize,
            height: innerSize,
            border: `0.5px solid ${lens.color}${hovered ? '18' : '0a'}`,
            transform: `scale(${breathScale})`,
            transition: `all ${timing.dur.mid}`,
          }}
        />

        {/* 4-letter label — centered in the lens */}
        <motion.span
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.detail,
            fontWeight: weight.medium,
            letterSpacing: tracking.eyebrow,
            color: lens.color,
            opacity: hovered ? opacity.strong : opacity.spoken,
            position: 'relative',
            zIndex: layer.content,
            transition: `opacity ${timing.dur.fast}`,
          }}
        >
          {lens.label}
        </motion.span>
      </div>

      {/* Whisper — appears below the lens */}
      <AnimatePresence>
        {hovered && (
          <motion.p
            style={{
              ...TYPOGRAPHY.description,
              color: lens.color,
              opacity: opacity.present,
              textAlign: 'center',
              maxWidth: '180px',
              margin: 0,
              marginTop: 8,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: opacity.present, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {lens.whisper}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Gesture cue — faint action word */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            style={{
              ...TYPOGRAPHY.gesture,
              color: lens.color,
              opacity: opacity.murmur,
              marginTop: 4,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.murmur }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {lens.gesture}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Connecting Thread — the luminous filament between lenses ───

function ConnectingThread({ color, breath }: { color: string; breath: number }) {
  const threadOpacity = 0.03 + Math.sin(breath * Math.PI * 2) * 0.01;
  return (
    <div
      style={{
        width: 0.5,
        height: 20,
        background: `linear-gradient(to bottom, ${color}${Math.round(threadOpacity * 255).toString(16).padStart(2, '0')}, transparent)`,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════
// THE KNOW SURFACE
// ══════════════════════════════════════════════════

interface KnowSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  /** Callback to transition into a child instrument */
  onNavigateToChild?: (childModeId: string) => void;
}

export function KnowSurface({ mode, breath, onResolve, onNavigateToChild }: KnowSurfaceProps) {
  const [phase, setPhase] = useState<'arrival' | 'sanctuary'>('arrival');
  const { arrived, delay } = useSurfaceArrival(mode);

  // ── Phase transitions ──
  useEffect(() => {
    setPhase('arrival');
  }, [mode.id]);

  useEffect(() => {
    if (arrived && phase === 'arrival') {
      setPhase('sanctuary');
    }
  }, [arrived, phase]);

  const showLenses = phase === 'sanctuary';

  // ── Handle lens selection ──
  const handleSelect = useCallback((childId: string) => {
    if (onNavigateToChild) {
      onNavigateToChild(childId);
    }
  }, [onNavigateToChild]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      {/* ═══ BACKGROUND: Deep sanctuary glass ═══ */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: room.void }} />

        {/* Sanctuary atmosphere — slow-breathing volumetric field */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${mode.color}03 0%, transparent 70%)`,
            transform: `scale(${1 + Math.sin(breath * Math.PI * 2) * 0.02})`,
            transition: timing.t.breathTransform,
          }}
        />

        {/* Depth vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, ${void_.deep} 100%)`,
          }}
        />

        {/* Bottom territory — orb gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `linear-gradient(to bottom, transparent 60%, ${void_.abyss} 85%, ${void_.seal} 100%)`,
          }}
        />
      </div>

      {/* ═══ CONTENT LAYER ═══ */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: layer.raised, paddingBottom: ORB_CLEARANCE }}
      >
        {/* ── Arrival canopy ── */}
        <AnimatePresence>
          {phase === 'arrival' && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
            >
              <p
                style={{
                  ...TYPOGRAPHY.description,
                  color: room.fg,
                  opacity: opacity.spoken,
                  textAlign: 'center',
                  maxWidth: '240px',
                }}
              >
                {mode.canopy}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── The Triad of Knowing ── */}
        <AnimatePresence>
          {showLenses && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Sanctuary eyebrow */}
              <motion.span
                style={{
                  ...TYPOGRAPHY.eyebrow,
                  color: mode.color,
                  opacity: opacity.present,
                  marginBottom: 24,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.eyebrow,
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: opacity.present, y: 0 }}
                transition={{ delay: delay('eyebrow'), duration: SURFACE_DURATION }}
              >
                SYNC
              </motion.span>

              {/* Canopy whisper */}
              <motion.p
                style={{
                  ...TYPOGRAPHY.description,
                  color: room.fg,
                  opacity: opacity.ambient,
                  textAlign: 'center',
                  maxWidth: '220px',
                  margin: 0,
                  marginBottom: 32,
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: opacity.spoken, y: 0 }}
                transition={{ delay: delay('content'), duration: SURFACE_DURATION }}
              >
                {mode.canopy}
              </motion.p>

              {/* The three lenses — vertical descent */}
              <div className="flex flex-col items-center">
                {TRIAD.map((lens, i) => (
                  <div key={lens.id} className="flex flex-col items-center">
                    {i > 0 && <ConnectingThread color={TRIAD[i - 1].color} breath={breath} />}
                    <RefractiveLens
                      lens={lens}
                      breath={breath}
                      index={i}
                      delay={delay('content') + i * STAGGER}
                      onSelect={handleSelect}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}