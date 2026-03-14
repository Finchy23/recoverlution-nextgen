/**
 * THE ANCHOR — Focal Well
 *
 * Not a button on the glass. A focal point WITHIN it.
 * Light gathers here the way it gathers in deep glass —
 * a well of luminance that the eye naturally finds.
 *
 * The orb has the same material language as ActionSurface's mass:
 * transparent center, refractive haze, no solid fill, no edge.
 * It lives at the same depth as the canvas particles.
 *
 * The orb has two lives:
 *
 *   DWELLING (home / CUE flow)
 *     The system's heartbeat. Slow geological breath. Soft violet.
 *     Slightly larger core (44px). Relaxed, expanded, present.
 *     12s breath cycle. Wide atmospheric halos.
 *     Tap: no-op. The orb acknowledges but you are already home.
 *     Hold: diffracts the constellation.
 *     Swipe up (via Stream filament): opens the Stream.
 *
 *   ANCHORING (in a surface)
 *     Your tether. Compact core (34px), deferring to the surface.
 *     Takes on the surface's color so you know where you are.
 *     7s breath cycle. Attentive, alive.
 *     A return beacon pulses outward: a ring of home color
 *     that says "I am the way back."
 *     Tap: returns home.
 *     Hold: diffracts the constellation.
 *     Swipe up (via Stream filament): opens the Stream.
 *
 * Two-tier radial invocation:
 *   First arc:  TALK · PLAY · TUNE · SYNC · ECHO
 *   Second arc: SYNC → READ · KNOW · HONE
 *               ECHO → PLOT · ∞MAP · LINK
 *
 * Should feel: geological, embodied, like light trapped in obsidian
 * Should NOT feel: like a button, like an overlay, like a separate element
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from './surface-modes';
import { getChildren, isParentMode, getModeById } from './surface-modes';
import type { InteractionSignal } from '../design-system/NeuroadaptiveSensing';
import { colors } from '../design-system/tokens';
import { room, font, tracking, typeSize, weight, timing, glow, glaze, refract, layer, glass } from '../design-system/surface-tokens';

const HOLD_THRESHOLD_MS = 400;

// The orb's home identity — the color of the CUE river, the system's own heartbeat
const HOME_COLOR = getModeById('home').color; // #8A7AFF soft violet

// ── Orb State Parameters ──
// These define the orb's personality in each state.
// Every value lerps naturally through Motion's animate prop.

const orbState = {
  dwelling: {
    coreSize: 44,
    innerCausticSize: 58,
    midHaloSize: 90,
    outerHaloSize: 150,
    breathDuration: 12,
    coreBreathScale: [1, 1.04, 1] as number[],
    midBreathScale: [1, 1.06, 1] as number[],
    outerBreathScale: [1, 1.10, 1] as number[],
    coreOpacity: [0.7, 1, 0.7] as number[],
    glowIntensity: { inner: '38', mid: '18', outer: '08', edge: '00' },
    specularOpacity: 0.15,
  },
  anchoring: {
    coreSize: 34,
    innerCausticSize: 46,
    midHaloSize: 70,
    outerHaloSize: 120,
    breathDuration: 7,
    coreBreathScale: [1, 1.06, 1] as number[],
    midBreathScale: [1, 1.08, 1] as number[],
    outerBreathScale: [1, 1.12, 1] as number[],
    coreOpacity: [0.6, 0.9, 0.6] as number[],
    glowIntensity: { inner: '30', mid: '14', outer: '06', edge: '00' },
    specularOpacity: 0.10,
  },
} as const;

interface PlayerAnchorProps {
  modes: SurfaceMode[];
  activeId: string;
  /** Whether the player is in CUE flow (home) or a surface */
  inCueFlow: boolean;
  onSelect: (id: string) => void;
  onTap?: () => void;
  onNeuroadaptiveSignal?: (signal: InteractionSignal) => void;
}

export function PlayerAnchor({ modes, activeId, inCueFlow, onSelect, onTap, onNeuroadaptiveSignal }: PlayerAnchorProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHold = useRef(false);
  const holdStartMs = useRef(0);

  // Find the active mode — could be a child mode or a top-level mode
  const activeTopMode = modes.find(m => m.id === activeId);
  // If activeId is a child, find the parent's color for the orb
  const activeChildParent = modes.find(m => m.children?.includes(activeId));
  const orbMode = activeTopMode || activeChildParent || modes[0];
  // The actual active mode for color (could be a child)
  const allModes = [...modes, ...modes.flatMap(m => m.children ? getChildren(m.id) : [])];
  const activeMode = allModes.find(m => m.id === activeId) || modes[0];

  // ── Orb identity — derives from state ──
  const orbColor = inCueFlow ? HOME_COLOR : activeMode.color;
  const state = inCueFlow ? orbState.dwelling : orbState.anchoring;

  const handlePointerDown = useCallback(() => {
    didHold.current = false;
    holdStartMs.current = performance.now();
    onNeuroadaptiveSignal?.({ type: 'holdStart' });
    holdTimer.current = setTimeout(() => {
      didHold.current = true;
      setExpanded(true);
      setExpandedParentId(null); // Reset second tier on new hold
    }, HOLD_THRESHOLD_MS);
  }, [onNeuroadaptiveSignal]);

  const handlePointerUp = useCallback(() => {
    const holdDuration = performance.now() - holdStartMs.current;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (!didHold.current) {
      onNeuroadaptiveSignal?.({ type: 'holdEnd', durationMs: holdDuration, completed: false });
      onNeuroadaptiveSignal?.({ type: 'tap' });
      if (expanded) {
        setExpanded(false);
        setExpandedParentId(null);
      } else {
        onTap?.();
      }
    } else {
      onNeuroadaptiveSignal?.({ type: 'holdEnd', durationMs: holdDuration, completed: true });
    }
  }, [expanded, onTap, onNeuroadaptiveSignal]);

  const handlePointerLeave = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const handleModeSelect = useCallback((id: string) => {
    // If this is a parent mode, expand its children instead of selecting
    if (isParentMode(id)) {
      setExpandedParentId(prev => prev === id ? null : id);
      return;
    }
    // Direct selection
    onSelect(id);
    setTimeout(() => {
      setExpanded(false);
      setExpandedParentId(null);
    }, 350);
  }, [onSelect]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, []);

  // Orbital geometry — semicircle above, modes as diffracted light
  const orbitalRadius = 85;
  const arcSpan = Math.PI * 0.68;
  const arcStart = Math.PI + (Math.PI - arcSpan) / 2;

  // Second-tier geometry — children expand at a larger radius
  const childRadius = 145;
  const childArcSpan = Math.PI * 0.28;

  // Calculate the angular position of each mode in the first ring
  function getModeAngle(index: number, total: number): number {
    return arcStart + (index / (total - 1)) * arcSpan;
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
      style={{ zIndex: layer.playerAnchor, paddingBottom: 16 }}
    >
      {/* Diffracted constellation — modes emerge as light through glass */}
      <AnimatePresence>
        {expanded && (
          <div className="absolute" style={{ bottom: 36 }}>
            {/* First ring — 5 anchor modes */}
            {modes.map((mode, i) => {
              const isActive = mode.id === activeId || mode.children?.includes(activeId);
              const isExpandedParent = mode.id === expandedParentId;
              const angle = getModeAngle(i, modes.length);
              const x = Math.cos(angle) * orbitalRadius;
              const y = Math.sin(angle) * orbitalRadius;

              return (
                <motion.button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="absolute cursor-pointer"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x, y,
                    opacity: expandedParentId && !isExpandedParent ? 0.4 : 1,
                    scale: 1,
                  }}
                  exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Each mode is a focal point — same material language as the main orb */}
                  <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}>
                    {/* Refractive haze */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: isActive ? 44 : isExpandedParent ? 38 : 32,
                        height: isActive ? 44 : isExpandedParent ? 38 : 32,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle, ${mode.color}${isActive || isExpandedParent ? '14' : '0a'} 0%, ${mode.color}04 50%, transparent 70%)`,
                        transition: timing.t.settle,
                      }}
                    />
                    {/* Focal core — transparent center like ActionSurface mass */}
                    <div
                      className="rounded-full"
                      style={{
                        width: isActive ? 8 : isExpandedParent ? 7 : 5,
                        height: isActive ? 8 : isExpandedParent ? 7 : 5,
                        background: `radial-gradient(circle at 40% 38%, ${mode.color}${isActive ? '55' : isExpandedParent ? '45' : '30'}, ${mode.color}${isActive ? '20' : '10'} 70%, transparent 100%)`,
                        boxShadow: isActive
                          ? glow.halo(mode.color, 16, 32, '30', '10')
                          : isExpandedParent
                            ? glow.halo(mode.color, 12, 24, '25', '0c')
                            : glow.soft(mode.color, '15'),
                        transition: timing.t.settle,
                      }}
                    />
                    {/* Parent indicator — subtle diffraction ring for REST/ECHO */}
                    {mode.children && (
                      <motion.div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: 18,
                          height: 18,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          border: `1px solid ${mode.color}${isExpandedParent ? '18' : '08'}`,
                          transition: `border-color ${timing.dur.mid}`,
                        }}
                        animate={isExpandedParent ? {
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0.2, 0.5],
                        } : {}}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    {/* Label — materializes late, whisper-weight */}
                    <motion.span
                      className="absolute whitespace-nowrap"
                      style={{
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: 7,
                        fontFamily: font.serif,
                        fontSize: typeSize.caption,
                        fontWeight: weight.light,
                        fontStyle: 'italic',
                        color: isActive || isExpandedParent ? mode.color : glaze.smoke,
                        letterSpacing: tracking.data,
                        opacity: isActive || isExpandedParent ? 0.6 : 0.25,
                        transition: timing.t.colorOpacity,
                      }}
                      initial={{ opacity: 0, filter: refract.soft }}
                      animate={{ opacity: isActive || isExpandedParent ? 0.6 : 0.25, filter: refract.clear }}
                    >
                      {mode.label}
                    </motion.span>
                  </div>
                </motion.button>
              );
            })}

            {/* Second ring — children of expanded parent */}
            <AnimatePresence>
              {expandedParentId && (() => {
                const children = getChildren(expandedParentId);
                const parentIndex = modes.findIndex(m => m.id === expandedParentId);
                const parentAngle = getModeAngle(parentIndex, modes.length);
                // Center the children arc around the parent's angle
                const childArcStart = parentAngle - childArcSpan / 2;

                return children.map((child, ci) => {
                  const isChildActive = child.id === activeId;
                  const childAngle = children.length === 1
                    ? parentAngle
                    : childArcStart + (ci / (children.length - 1)) * childArcSpan;
                  const cx = Math.cos(childAngle) * childRadius;
                  const cy = Math.sin(childAngle) * childRadius;

                  return (
                    <motion.button
                      key={child.id}
                      onClick={() => handleModeSelect(child.id)}
                      className="absolute cursor-pointer"
                      style={{
                        left: '50%',
                        top: '50%',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                      }}
                      initial={{ x: Math.cos(parentAngle) * orbitalRadius, y: Math.sin(parentAngle) * orbitalRadius, opacity: 0, scale: 0 }}
                      animate={{ x: cx, y: cy, opacity: 1, scale: 1 }}
                      exit={{ x: Math.cos(parentAngle) * orbitalRadius, y: Math.sin(parentAngle) * orbitalRadius, opacity: 0, scale: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: ci * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}>
                        {/* Refractive haze */}
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: isChildActive ? 40 : 28,
                            height: isChildActive ? 40 : 28,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle, ${child.color}${isChildActive ? '14' : '0a'} 0%, ${child.color}04 50%, transparent 70%)`,
                            transition: timing.t.settle,
                          }}
                        />
                        {/* Focal core */}
                        <div
                          className="rounded-full"
                          style={{
                            width: isChildActive ? 7 : 4,
                            height: isChildActive ? 7 : 4,
                            background: `radial-gradient(circle at 40% 38%, ${child.color}${isChildActive ? '55' : '35'}, ${child.color}${isChildActive ? '20' : '12'} 70%, transparent 100%)`,
                            boxShadow: isChildActive
                              ? glow.halo(child.color, 14, 28, '30', '0c')
                              : glow.dot(child.color, '18'),
                            transition: timing.t.settle,
                          }}
                        />
                        {/* Child label */}
                        <motion.span
                          className="absolute whitespace-nowrap"
                          style={{
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: 6,
                            fontFamily: font.serif,
                            fontSize: typeSize.detail,
                            fontWeight: weight.light,
                            fontStyle: 'italic',
                            color: isChildActive ? child.color : glaze.silver,
                            letterSpacing: tracking.data,
                            opacity: isChildActive ? 0.6 : 0.3,
                            transition: timing.t.colorOpacity,
                          }}
                          initial={{ opacity: 0, filter: refract.soft }}
                          animate={{ opacity: isChildActive ? 0.6 : 0.3, filter: refract.clear }}
                          transition={{ delay: 0.15 + ci * 0.04, duration: 0.5 }}
                        >
                          {child.label}
                        </motion.span>
                      </div>
                    </motion.button>
                  );
                });
              })()}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* ── The Focal Well ── */}
      {/* The orb lives in two states: dwelling (home) and anchoring (surface).
          In both, it breathes. In anchoring, a return beacon pulses outward
          in home color — the memory of where you came from. */}
      <motion.div
        className="relative cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        whileTap={{ scale: 0.93 }}
        style={{ touchAction: 'none' }}
      >
        {/* Deepest refractive field — wide atmospheric presence */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            width: state.outerHaloSize,
            height: state.outerHaloSize,
            scale: state.outerBreathScale,
            opacity: [0.4, 0.7, 0.4],
            background: `radial-gradient(circle, ${orbColor}08 0%, ${orbColor}03 35%, transparent 60%)`,
          }}
          transition={{
            width: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            height: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            background: { duration: 0.8 },
            scale: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Mid refractive haze — the breathing presence */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            width: state.midHaloSize,
            height: state.midHaloSize,
            scale: state.midBreathScale,
            opacity: [0.5, 0.8, 0.5],
            background: `radial-gradient(circle, ${orbColor}10 0%, ${orbColor}06 40%, transparent 70%)`,
          }}
          transition={{
            width: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            height: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            background: { duration: 0.8 },
            scale: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
            opacity: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
          }}
        />

        {/* Inner caustic — refracted light ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            width: state.innerCausticSize,
            height: state.innerCausticSize,
            scale: [1, 1.04, 1],
            opacity: [0.3, 0.6, 0.3],
            background: `radial-gradient(circle, transparent 50%, ${orbColor}08 72%, transparent 92%)`,
          }}
          transition={{
            width: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            height: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            background: { duration: 0.8 },
            scale: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut', delay: 0.15 },
            opacity: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut', delay: 0.15 },
          }}
        />

        {/* ═══ Return Beacon — only when anchoring (in a surface) ═══
            A ring of home color that pulses outward from the core.
            Like sonar. Like a heartbeat made visible.
            "I am the way back." */}
        <AnimatePresence>
          {!inCueFlow && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: `1px solid ${HOME_COLOR}18`,
              }}
              initial={{ width: state.coreSize, height: state.coreSize, opacity: 0 }}
              animate={{
                width: [state.coreSize, 80],
                height: [state.coreSize, 80],
                opacity: [0.5, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: [0.16, 1, 0.3, 1],
                repeatDelay: 1.5,
              }}
            />
          )}
        </AnimatePresence>

        {/* Second beacon wave — offset for depth */}
        <AnimatePresence>
          {!inCueFlow && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: `1px solid ${HOME_COLOR}10`,
              }}
              initial={{ width: state.coreSize, height: state.coreSize, opacity: 0 }}
              animate={{
                width: [state.coreSize, 64],
                height: [state.coreSize, 64],
                opacity: [0.35, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: [0.16, 1, 0.3, 1],
                delay: 1.8,
                repeatDelay: 2.2,
              }}
            />
          )}
        </AnimatePresence>

        {/* Core — the focal point.
            Dwelling: home color, larger, slow geological breath.
            Anchoring: surface color, compact, with a peek of home at center. */}
        <motion.div
          className="relative rounded-full"
          animate={{
            width: state.coreSize,
            height: state.coreSize,
            scale: state.coreBreathScale,
            background: `radial-gradient(circle at 40% 38%, ${orbColor}${state.glowIntensity.inner}, ${orbColor}${state.glowIntensity.mid} 50%, ${orbColor}${state.glowIntensity.outer} 75%, transparent 100%)`,
            boxShadow: [
              `0 0 28px ${orbColor}18, 0 0 60px ${orbColor}08`,
              `0 0 40px ${orbColor}25, 0 0 80px ${orbColor}10`,
              `0 0 28px ${orbColor}18, 0 0 60px ${orbColor}08`,
            ],
          }}
          transition={{
            width: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            height: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            background: { duration: 0.8 },
            scale: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: state.breathDuration, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Home ember — when anchoring, a tiny point of home color
            peeks through the center of the surface-colored orb.
            The memory of where you came from, never fully gone. */}
        <AnimatePresence>
          {!inCueFlow && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 6,
                height: 6,
                background: `radial-gradient(circle, ${HOME_COLOR}40 0%, ${HOME_COLOR}15 50%, transparent 100%)`,
                boxShadow: `0 0 8px ${HOME_COLOR}20`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.15, 1],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                default: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              }}
            />
          )}
        </AnimatePresence>

        {/* Specular caustic — light caught in the glass */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          animate={{
            width: inCueFlow ? 12 : 8,
            height: inCueFlow ? 7 : 5,
            top: inCueFlow ? 11 : 8,
            left: inCueFlow ? 14 : 10,
            background: `radial-gradient(ellipse, ${orbColor}${inCueFlow ? '20' : '18'} 0%, transparent 80%)`,
            opacity: state.specularOpacity,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: refract.whisper }}
        />

        {/* Hold diffraction — ripple emerging from the well */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 64,
                height: 64,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, transparent 45%, ${orbColor}08 65%, ${orbColor}0c 80%, transparent 100%)`,
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1.2], opacity: [0, 0.5, 0.25] }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}