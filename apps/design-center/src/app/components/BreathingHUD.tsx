/**
 * BREATHING HUD
 * =============
 *
 * The 7-element narrative overlay for the NaviCue Compositor.
 * Replaces the legacy Z-3 AtomicVoice layer with a collapsible
 * canopy/pill mechanic:
 *
 *   Phase 1: Canopy EXPANDED — user reads the Why
 *   Phase 2: Canopy COLLAPSED into Semantic Pill — user feels the physics
 *   Phase 3: Re-toggle — pill expands to show condensed canopy
 *
 * State machine: ENTERING → EXPANDED → COLLAPSED → MORPHED → RECEIPT
 *
 * See: /src/imports/breathing-hud-spec.md
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, withAlpha, TRANSPARENT } from '@/design-tokens';
import type {
  NarrativePayload,
  PlayerPhase,
  VoiceLaneId,
  CollapseModel,
} from '@/navicue-types';

// =====================================================================
// TYPES
// =====================================================================

export type HUDPhase =
  | 'hook'       // Inbound hook visible, canopy not yet shown
  | 'expanded'   // Narrative canopy visible, reading phase
  | 'collapsed'  // Semantic pill visible, physics is hero
  | 'retoggle'   // Canopy re-expanded (shows condensed text)
  | 'morphed'    // Threshold morph complete, afterglow
  | 'receipt';   // Outbound receipt visible

export interface BreathingHUDProps {
  narrative: NarrativePayload;
  voiceLane: VoiceLaneId;
  /** Current phase from the orchestrator */
  playerPhase: PlayerPhase;
  /** Phase elapsed time (ms) */
  phaseElapsed: number;
  /** Whether atmosphere has settled (800ms Rule) */
  atmosphereSettled: boolean;
  /** Whether text should be visible */
  textVisible: boolean;
  /** Current breath amplitude from breath engine */
  breathAmplitude: number;
  /** Viewport width */
  width: number;
  /** Viewport height */
  height: number;
  /** Minimum dimension for responsive sizing */
  minDim: number;
  /** Primary color from color signature */
  primaryColor: string;
  /** Reduced motion preference */
  reducedMotion: boolean;
  /** Signals that the user has started interacting with the atom */
  interactionStarted: boolean;
  /** Signals that the atom has resolved */
  resolved: boolean;
  /** Number of completed breath cycles (for breath-cycles collapse model) */
  breathCycleCount: number;
  /** Haptic feedback callback — 'light' on collapse, 'medium' on morph */
  onHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void;
}

// =====================================================================
// VOICE LANE → TYPOGRAPHY MAPPING
// =====================================================================

function getCanopyTypography(voiceLane: VoiceLaneId) {
  switch (voiceLane) {
    case 'companion':
      return { fontFamily: fonts.secondary, textAlign: 'center' as const, letterSpacing: '0.01em' };
    case 'coach':
      return { fontFamily: fonts.mono, textAlign: 'left' as const, letterSpacing: '0.02em' };
    case 'mirror':
      return { fontFamily: fonts.secondary, textAlign: 'center' as const, letterSpacing: '0.02em' };
    case 'narrator':
      return { fontFamily: fonts.secondary, textAlign: 'left' as const, letterSpacing: '0.01em' };
    case 'activator':
      return { fontFamily: fonts.mono, textAlign: 'center' as const, letterSpacing: '0.06em' };
  }
}

// =====================================================================
// SCRAMBLE ANIMATION HOOK
// =====================================================================

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function useScrambleText(from: string, to: string, active: boolean, durationMs = 800) {
  const [display, setDisplay] = useState(from);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setDisplay(from);
      return;
    }

    const startTime = performance.now();
    const maxLen = Math.max(from.length, to.length);
    const paddedFrom = from.padEnd(maxLen);
    const paddedTo = to.padEnd(maxLen);

    function tick() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      let result = '';
      for (let i = 0; i < maxLen; i++) {
        const charProgress = Math.min(1, (progress * maxLen - i + 2) / 3);
        if (charProgress >= 1) {
          result += paddedTo[i];
        } else if (charProgress <= 0) {
          result += paddedFrom[i];
        } else {
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setDisplay(result.trimEnd());

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [from, to, active, durationMs]);

  return display;
}

// =====================================================================
// COMPONENT
// =====================================================================

export function BreathingHUD({
  narrative,
  voiceLane,
  playerPhase,
  phaseElapsed,
  atmosphereSettled,
  textVisible,
  breathAmplitude,
  width,
  height,
  minDim,
  primaryColor,
  reducedMotion,
  interactionStarted,
  resolved,
  breathCycleCount,
  onHaptic,
}: BreathingHUDProps) {
  const [hudPhase, setHudPhase] = useState<HUDPhase>('hook');
  const [reToggled, setReToggled] = useState(false);
  const idleTimerRef = useRef<number>(0);
  const [showWhisper, setShowWhisper] = useState(false);
  const [whisperType, setWhisperType] = useState<'invite' | 'hint'>('invite');
  const [afterglowComplete, setAfterglowComplete] = useState(false);

  const arrivalEasing = [0.25, 0.46, 0.45, 0.94]; // arrival curve

  // ── HUD Phase State Machine ──────────────────────────────────────

  // ENTERING → show hook
  useEffect(() => {
    if (playerPhase === 'entering') {
      setHudPhase('hook');
      setReToggled(false);
      setShowWhisper(false);
      setAfterglowComplete(false);
    }
  }, [playerPhase]);

  // ENTERING → ACTIVE: transition from hook to expanded canopy
  useEffect(() => {
    if (playerPhase === 'active' && hudPhase === 'hook') {
      // If we have a canopy, show it; otherwise skip to collapsed
      if (narrative.narrativeCanopy) {
        setHudPhase('expanded');
      } else if (narrative.semanticPill) {
        setHudPhase('collapsed');
      }
    }
  }, [playerPhase, hudPhase, narrative.narrativeCanopy, narrative.semanticPill]);

  // COLLAPSE TRIGGER — based on collapse model
  useEffect(() => {
    if (hudPhase !== 'expanded') return;

    const { collapseModel } = narrative;

    if (collapseModel === 'touch' && interactionStarted) {
      setHudPhase('collapsed');
      onHaptic?.('light');
      return;
    }

    if (collapseModel === 'breath-cycles' && breathCycleCount >= 3) {
      setHudPhase('collapsed');
      onHaptic?.('light');
      return;
    }

    if (collapseModel === 'timed') {
      const wordCount = narrative.narrativeCanopy?.text.split(/\s+/).length ?? 20;
      const autoCollapseMs = wordCount * 250;
      if (phaseElapsed > autoCollapseMs) {
        setHudPhase('collapsed');
        onHaptic?.('light');
      }
    }
  }, [hudPhase, narrative, interactionStarted, breathCycleCount, phaseElapsed, onHaptic]);

  // RESOLVING → morph
  useEffect(() => {
    if (playerPhase === 'resolving' && (hudPhase === 'collapsed' || hudPhase === 'retoggle')) {
      setHudPhase('morphed');
      onHaptic?.('medium');
    }
  }, [playerPhase, hudPhase, onHaptic]);

  // MORPHED → afterglow → receipt
  useEffect(() => {
    if (hudPhase !== 'morphed') return;
    const timer = window.setTimeout(() => {
      setAfterglowComplete(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [hudPhase]);

  useEffect(() => {
    if (playerPhase === 'receipt' || (hudPhase === 'morphed' && afterglowComplete)) {
      setHudPhase('receipt');
    }
  }, [playerPhase, hudPhase, afterglowComplete]);

  // IDLE WHISPER — dual trigger
  useEffect(() => {
    if (hudPhase !== 'collapsed' || !narrative.idleWhisper) return;

    const timer = window.setTimeout(() => {
      if (!interactionStarted) {
        setWhisperType('invite');
        setShowWhisper(true);
      } else if (!resolved) {
        setWhisperType('hint');
        setShowWhisper(true);
      }
    }, interactionStarted ? 4000 : 5000);

    idleTimerRef.current = timer;
    return () => clearTimeout(timer);
  }, [hudPhase, interactionStarted, resolved, narrative.idleWhisper]);

  // RE-TOGGLE handler
  const handlePillClick = useCallback(() => {
    if (hudPhase === 'collapsed') {
      setReToggled(true);
      setHudPhase('retoggle');
    } else if (hudPhase === 'retoggle') {
      setHudPhase('collapsed');
    }
  }, [hudPhase]);

  // ── Typography ──────────────────────────────────────────────────
  const canopyTypo = getCanopyTypography(voiceLane);
  const isActivator = voiceLane === 'activator';

  // ── Scramble text for threshold morph ──────────────────────────
  const pillBefore = narrative.semanticPill?.before ?? '';
  const pillAfter = narrative.semanticPill?.after ?? '';
  const scrambledText = useScrambleText(
    pillBefore,
    pillAfter,
    hudPhase === 'morphed',
    reducedMotion ? 100 : 800,
  );

  // ── Pill display text ──────────────────��──────────────────────
  const pillText = hudPhase === 'morphed' || hudPhase === 'receipt'
    ? scrambledText
    : pillBefore;

  // ── Responsive sizes ──────────────────────────────────────────
  const canopyFontSize = Math.max(13, Math.min(18, minDim * 0.038));
  const hookFontSize = Math.max(16, Math.min(24, minDim * 0.048));
  const pillFontSize = Math.max(9, Math.min(12, minDim * 0.024));
  const whisperFontSize = Math.max(9, Math.min(11, minDim * 0.022));
  const ambientFontSize = Math.max(24, Math.min(48, minDim * 0.09));
  const receiptFontSize = Math.max(20, Math.min(36, minDim * 0.07));

  // ── Breath-coupled pill scale ─────────────────────────────────
  const pillScale = 1 + breathAmplitude * 0.0003; // very subtle

  if (!textVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
      }}
    >
      {/* ═══════════════════════════════════════════════════════════
          Z-3 (DEEP): AMBIENT SUBTEXT
          Behind everything. The user's anxious voice.
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {narrative.ambientSubtext && (hudPhase === 'expanded' || hudPhase === 'collapsed' || hudPhase === 'retoggle') && (
          <motion.div
            key="ambient"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.08,
              y: breathAmplitude * -0.02, // gentle breath drift
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 1.5, ease: arrivalEasing }}
            style={{
              position: 'absolute',
              top: '40%',
              left: '8%',
              right: '8%',
              fontFamily: fonts.secondary,
              fontSize: ambientFontSize,
              color: colors.neutral.white,
              textAlign: 'center',
              filter: 'blur(6px)',
              pointerEvents: 'none',
              userSelect: 'none',
              lineHeight: 1.2,
            }}
          >
            {narrative.ambientSubtext.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          Z-4 (OVERLAY): NARRATIVE ELEMENTS
          Canopy / Pill / Hook / Whisper / Receipt
          ═══════════════════════════════════════════════════════════ */}

      {/* ── INBOUND HOOK ─────────────────────────────────────────── */}
      <AnimatePresence>
        {hudPhase === 'hook' && narrative.inboundHook && atmosphereSettled && (
          <motion.div
            key="hook"
            initial={{
              opacity: 0,
              y: narrative.inboundHook.position === 'bottom-rise' ? 20 : 0,
              x: narrative.inboundHook.position === 'peripheral' ? -30 : 0,
            }}
            animate={{ opacity: 0.7, y: 0, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 1.2, ease: arrivalEasing }}
            style={{
              position: 'absolute',
              ...(narrative.inboundHook.position === 'bottom-rise'
                ? { bottom: '30%', left: '50%', transform: 'translateX(-50%)' }
                : narrative.inboundHook.position === 'peripheral'
                  ? { top: '40%', left: '8%' }
                  : { top: '45%', left: '50%', transform: 'translateX(-50%)' }),
              fontFamily: isActivator ? fonts.mono : fonts.secondary,
              fontSize: hookFontSize,
              color: colors.neutral.white,
              textAlign: 'center',
              maxWidth: width * 0.8,
              lineHeight: 1.4,
            }}
          >
            {narrative.inboundHook.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NARRATIVE CANOPY (expanded state) ─────────────────────── */}
      <AnimatePresence>
        {(hudPhase === 'expanded' || hudPhase === 'retoggle') && narrative.narrativeCanopy && (
          <motion.div
            key={`canopy-${reToggled ? 'condensed' : 'full'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.8, ease: arrivalEasing }}
            style={{
              position: 'absolute',
              top: minDim * 0.04,
              left: '10%',
              right: '10%',
              maxHeight: height * 0.15,
              overflow: 'hidden',
              fontFamily: canopyTypo.fontFamily,
              fontSize: canopyFontSize,
              color: colors.neutral.white,
              textAlign: canopyTypo.textAlign,
              lineHeight: 1.6,
              letterSpacing: canopyTypo.letterSpacing,
              ...(isActivator ? { textTransform: 'uppercase' as const, fontSize: canopyFontSize * 0.9 } : {}),
            }}
          >
            {reToggled
              ? narrative.narrativeCanopy.condensed
              : narrative.narrativeCanopy.text
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEMANTIC PILL (collapsed state) ───────────────────────── */}
      <AnimatePresence>
        {(hudPhase === 'collapsed' || hudPhase === 'retoggle' || hudPhase === 'morphed') && narrative.semanticPill && (
          <motion.div
            key="pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: hudPhase === 'morphed' ? 1 : 0.6,
              scale: reducedMotion ? 1 : pillScale,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.5, ease: arrivalEasing }}
            onClick={hudPhase !== 'morphed' ? handlePillClick : undefined}
            style={{
              position: 'absolute',
              top: minDim * 0.025,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: fonts.mono,
              fontSize: pillFontSize,
              color: hudPhase === 'morphed'
                ? colors.neutral.white
                : withAlpha(primaryColor, 0.8),
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              padding: `${minDim * 0.008}px ${minDim * 0.025}px`,
              border: `1px solid ${withAlpha(
                hudPhase === 'morphed' ? colors.neutral.white : primaryColor,
                hudPhase === 'morphed' ? 0.3 : 0.15,
              )}`,
              borderRadius: minDim * 0.03,
              background: withAlpha(
                hudPhase === 'morphed' ? colors.neutral.white : primaryColor,
                hudPhase === 'morphed' ? 0.08 : 0.04,
              ),
              cursor: hudPhase !== 'morphed' ? 'pointer' : 'default',
              pointerEvents: hudPhase !== 'morphed' ? 'auto' : 'none',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.5s ease, border-color 0.5s ease, background 0.5s ease',
            }}
          >
            {pillText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IDLE WHISPER ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showWhisper && narrative.idleWhisper && hudPhase === 'collapsed' && (
          <motion.div
            key="whisper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 1.0, ease: arrivalEasing }}
            style={{
              position: 'absolute',
              bottom: height * 0.12,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: fonts.mono,
              fontSize: whisperFontSize,
              color: withAlpha(primaryColor, 0.5),
              letterSpacing: '0.06em',
              textTransform: 'lowercase' as const,
              pointerEvents: 'none',
            }}
          >
            {whisperType === 'invite'
              ? narrative.idleWhisper.invite
              : narrative.idleWhisper.hint
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── OUTBOUND RECEIPT ──────────────────────────────────────── */}
      <AnimatePresence>
        {hudPhase === 'receipt' && narrative.outboundReceipt && (
          <motion.div
            key="receipt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 1.2, ease: arrivalEasing }}
            style={{
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: isActivator ? fonts.mono : fonts.secondary,
              fontSize: receiptFontSize,
              color: colors.neutral.white,
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: width * 0.8,
            }}
          >
            {narrative.outboundReceipt.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}