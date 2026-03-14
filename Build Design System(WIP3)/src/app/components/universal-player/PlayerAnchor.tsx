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
 * Mechanic:
 *   - Tap: open the Stream (hidden surface of purpose)
 *   - Long hold (400ms): constellation diffracts outward
 *   - TALK, PLAY, MOVE → direct selection
 *   - KNOW, ECHO → parent modes that fork (second arc appears)
 *   - Tap a child in the second arc → enter that sub-mode
 *
 * Two-tier radial invocation:
 *   First arc:  TALK · PLAY · MOVE · KNOW · ECHO
 *   Second arc: KNOW → READ · SEEK · FORM
 *               ECHO → PLOT · ∞MAP · LINK
 *
 * Should feel: geological, embodied, like light trapped in obsidian
 * Should NOT feel: like a button, like an overlay, like a separate element
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from './surface-modes';
import { getChildren, isParentMode } from './surface-modes';
import type { InteractionSignal } from '../design-system/NeuroadaptiveSensing';
import { colors } from '../design-system/tokens';
import { room, font, tracking, typeSize, weight, timing, glow, glaze, refract, layer } from '../design-system/surface-tokens';

const HOLD_THRESHOLD_MS = 400;

interface PlayerAnchorProps {
  modes: SurfaceMode[];
  activeId: string;
  onSelect: (id: string) => void;
  onTap?: () => void;
  onNeuroadaptiveSignal?: (signal: InteractionSignal) => void;
}

export function PlayerAnchor({ modes, activeId, onSelect, onTap, onNeuroadaptiveSignal }: PlayerAnchorProps) {
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
      {/* Same material language as ActionSurface's mass:
          transparent center, refractive haze, no solid fill.
          This is light gathered within the glass, not a button on it. */}
      <motion.div
        className="relative cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        whileTap={{ scale: 0.93 }}
        style={{ touchAction: 'none' }}
      >
        {/* Deepest refractive field — wide, barely there */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 140,
            height: 140,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${activeMode.color}0a 0%, ${activeMode.color}04 35%, transparent 60%)`,
          }}
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 10.9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mid refractive haze — the breathing presence */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 80,
            height: 80,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${activeMode.color}12 0%, ${activeMode.color}08 40%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{ duration: 10.9, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />

        {/* Inner caustic — refracted light ring, not a border */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 52,
            height: 52,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, transparent 50%, ${activeMode.color}0a 72%, transparent 92%)`,
          }}
          animate={{
            scale: [1, 1.04, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10.9, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Core — the focal point. Transparent center,
            matching ActionSurface's mass: ${color}35 → ${color}15 → transparent */}
        <motion.div
          className="relative rounded-full"
          style={{
            width: 40,
            height: 40,
            background: `radial-gradient(circle at 40% 38%, ${activeMode.color}38, ${activeMode.color}18 50%, ${activeMode.color}08 75%, transparent 100%)`,
            boxShadow: glow.atmosphere(activeMode.color),
          }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              `0 0 28px ${activeMode.color}20, 0 0 60px ${activeMode.color}0a`,
              `0 0 36px ${activeMode.color}2a, 0 0 72px ${activeMode.color}12`,
              `0 0 28px ${activeMode.color}20, 0 0 60px ${activeMode.color}0a`,
            ],
          }}
          transition={{ duration: 10.9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Specular caustic — light caught in the glass */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 10,
            height: 6,
            top: 10,
            left: 12,
            background: `radial-gradient(ellipse, ${activeMode.color}25 0%, transparent 80%)`,
            filter: refract.whisper,
          }}
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
                background: `radial-gradient(circle, transparent 45%, ${activeMode.color}08 65%, ${activeMode.color}0c 80%, transparent 100%)`,
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