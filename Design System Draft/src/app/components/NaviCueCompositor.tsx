/**
 * NAVICUE COMPOSITOR
 * ==================
 *
 * The rendering stack. This component takes a fully resolved
 * NaviCueComposition and renders all layers in the correct Z-order:
 *
 *   Z-0: Black void (base)
 *   Z-1: Living Atmosphere (Layer 2 — engine + response profile)
 *   Z-2: Hero Physics (Layer 6 — the atom, composed mode)
 *   Z-3: Breathing HUD (7-element narrative system)
 *   Z-5: Phase indicator (diagnostic)
 *
 * Layer 1 (Diagnostic Core) feeds INTO the composition as config.
 * Layer 3 (Pulse & Motion) drives breath amplitude + motion curves.
 * Layer 4 (Persona) selects voice lane + materialization.
 *
 * RULES:
 *   - The atom receives composed=true, suppressing its own atmosphere/text
 *   - The 800ms Rule is enforced: atmosphere renders, then text fades in
 *   - All text slots respect their ThrottleLimits
 *   - reducedMotion is threaded through every animation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import type {
  NaviCueComposition,
  PlayerPhase,
} from '@/navicue-types';
import { COLOR_SIGNATURES, ENTRANCES } from '@/navicue-data';
import type { AtomPhase } from '@/app/components/atoms/types';
import { ATOM_COMPONENTS } from '@/app/components/atoms';
import { useBreathEngine } from '@/app/pages/design-center/hooks/useBreathEngine';
import type { BreathPattern } from '@/app/pages/design-center/hooks/useBreathEngine';
import { BreathingHUD } from './BreathingHUD';

// ─── Props ──────────────────────────────────────────────────────

export interface CompositorProps {
  composition: NaviCueComposition;
  /** Current phase from the orchestrator */
  phase: PlayerPhase;
  /** Atom-facing phase */
  atomPhase: AtomPhase;
  /** Whether atmosphere has settled (800ms Rule) */
  atmosphereSettled: boolean;
  /** Whether text should be visible */
  textVisible: boolean;
  /** Phase elapsed time (ms) */
  phaseElapsed: number;
  /** Viewport dimensions */
  width: number;
  height: number;
  /** Reduced motion preference */
  reducedMotion: boolean;
  /** Called when atom signals resolution */
  onAtomResolve?: () => void;
  /** Called when atom reports state change */
  onAtomStateChange?: (state: number) => void;
  /** Haptic feedback callback from the Breathing HUD */
  onHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void;
}

// ─── Main Compositor ──────────────────────────────────────────

export function NaviCueCompositor({
  composition,
  phase,
  atomPhase,
  atmosphereSettled,
  textVisible,
  phaseElapsed,
  width,
  height,
  reducedMotion,
  onAtomResolve,
  onAtomStateChange,
  onHaptic,
}: CompositorProps) {
  const { amplitude, phase: breathPhase } = useBreathEngine(
    composition.pulseMotion.breathPattern as BreathPattern
  );

  const atomId = composition.heroPhysics.atomId;
  const AtomComponent = ATOM_COMPONENTS[atomId as keyof typeof ATOM_COMPONENTS];
  const voice = composition.atomicVoice;
  const persona = composition.persona;
  const colorSigId = composition.livingAtmosphere.colorSignature;

  // ── RUNTIME DIAGNOSTIC — log once per composition ─────────
  const lastLoggedId = useRef('');
  useEffect(() => {
    if (composition.id !== lastLoggedId.current) {
      lastLoggedId.current = composition.id;
      const entranceId = composition.temporalBookends.entrance;
      const entranceCopyMode = ENTRANCES[entranceId]?.copyMode ?? 'ceremony';
      const hz = composition.heroPhysics.heroZone ?? { topFrac: 0.12, heightFrac: 0.76 };
      console.log('%c[Compositor] Rendering:', 'color: #88ccff', {
        compositionId: composition.id,
        atomId,
        AtomComponentResolved: !!AtomComponent,
        colorSigId,
        width,
        height,
        phase,
        voiceLane: persona.voiceLane,
        breathPattern: composition.pulseMotion.breathPattern,
        anchorPrompt: voice.anchorPrompt?.text?.slice(0, 40),
        entranceCopyMode,
        heroZone: `top:${hz.topFrac} h:${hz.heightFrac}`,
        hasNarrative: !!composition.narrative,
        narrativeDensity: composition.narrative?.density,
      });
    }
  });

  // Log phase changes
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      console.log(`%c[Compositor] Phase: ${prevPhaseRef.current} → ${phase}`, 'color: #ffaa44', {
        atomPhase,
        textVisible,
        atmosphereSettled,
        width,
        height,
      });
      prevPhaseRef.current = phase;
    }
  });

  // ── Resolve Color Signature from Layer 2 data ─────────────
  // This is the single source of truth — no hardcoded hex.
  const resolvedSig = COLOR_SIGNATURES[colorSigId];
  const primaryColor = resolvedSig.primary;
  const accentColor = resolvedSig.accent;
  const glowColor = resolvedSig.glow;
  const surfaceColor = resolvedSig.surface;
  const secondaryColor = resolvedSig.secondary;

  // ── Exit overlay ──────────────────────────────────────────
  const isExiting = phase === 'resolving' || phase === 'receipt' || phase === 'complete';

  const minDim = Math.min(width, height);

  // ── Hero Zone (Layer 6) — governs Z-2 atom placement ──────
  // Defaults: 12% top safe zone, 76% hero, 12% bottom safe zone.
  const heroZone = composition.heroPhysics.heroZone ?? { topFrac: 0.12, heightFrac: 0.76 };
  const heroTop = Math.round(height * heroZone.topFrac);
  const heroHeight = Math.round(height * heroZone.heightFrac);
  const heroWidth = width; // full width, vertical constraint only

  // ── Breathing HUD state tracking ──────────────────────────
  const [interactionStarted, setInteractionStarted] = useState(false);
  const [atomResolved, setAtomResolved] = useState(false);
  const [breathCycleCount, setBreathCycleCount] = useState(0);
  const prevBreathPhaseRef = useRef(breathPhase);

  // Track breath cycles (count transitions from exhale → inhale)
  useEffect(() => {
    if (prevBreathPhaseRef.current === 'exhale' && breathPhase === 'inhale') {
      setBreathCycleCount(c => c + 1);
    }
    prevBreathPhaseRef.current = breathPhase;
  }, [breathPhase]);

  // Reset tracking state on new composition
  useEffect(() => {
    setInteractionStarted(false);
    setAtomResolved(false);
    setBreathCycleCount(0);
  }, [composition.id]);

  // Wrap atom callbacks to track interaction & resolution
  const handleAtomStateChange = useCallback((state: number) => {
    if (state > 0 && !interactionStarted) setInteractionStarted(true);
    onAtomStateChange?.(state);
  }, [interactionStarted, onAtomStateChange]);

  const handleAtomResolve = useCallback(() => {
    setAtomResolved(true);
    onAtomResolve?.();
  }, [onAtomResolve]);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        background: surfaces.solid.base,
        borderRadius: 0,
      }}
    >
      {/* Z-0: Black void base — always present */}

      {/* Z-1: Living Atmosphere (Layer 2)
           Primary glow: ALPHA.atmosphere → content range (0.08–0.20 breath-driven)
           Secondary glow: ALPHA.atmosphere range (0.04–0.10 breath-driven)
           Surface tint: color-stop alpha only, no wrapper opacity */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: phase === 'loading' ? 0 : 1,
          pointerEvents: 'none',
        }}
        animate={{
          opacity: phase === 'loading' ? 0 : isExiting ? 0.3 : 1,
        }}
        transition={{ duration: reducedMotion ? 0 : 1.5 }}
      >
        {/* Atmosphere glow — ALPHA.atmosphere→content, breath-driven */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{
              scale: reducedMotion ? 1 : 0.85 + amplitude * 0.2,
              opacity: reducedMotion ? 0.15 : 0.08 + amplitude * 0.12,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              width: width * 0.8,
              height: width * 0.8,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Secondary glow pulse — ALPHA.atmosphere range, breath-modulated */}
        <div
          style={{
            position: 'absolute',
            left: '30%',
            top: '60%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{
              scale: reducedMotion ? 1 : 0.9 + amplitude * 0.15,
              opacity: reducedMotion ? 0.05 : 0.04 + amplitude * 0.06,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              width: width * 0.5,
              height: width * 0.5,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Surface tint — full-screen color wash, alpha in gradient stop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 40%, ${surfaceColor} 0%, transparent 80%)`,
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Z-2: Hero Physics (Layer 6 — the atom)
           Constrained to heroZone (Layer 6 governs placement).
           Atom receives zone-relative viewport dimensions so its
           physics center at (w/2, h/2) lands in the visual center
           of the safe zone, not at the top edge of the screen. */}
      {AtomComponent && phase !== 'loading' && (
        <div style={{
          position: 'absolute',
          top: heroTop,
          left: 0,
          width: heroWidth,
          height: heroHeight,
          zIndex: 2,
          pointerEvents: 'auto',
        }}>
          <AtomComponent
            breathAmplitude={amplitude}
            reducedMotion={reducedMotion}
            color={primaryColor}
            accentColor={accentColor}
            viewport={{ width: heroWidth, height: heroHeight }}
            phase={atomPhase}
            composed={true}
            onHaptic={() => {}}
            onStateChange={handleAtomStateChange}
            onResolve={handleAtomResolve}
          />
        </div>
      )}

      {/* Z-3: Breathing HUD — the 7-element narrative system.
           Replaces the legacy Z-3 atomic voice / Z-4 entrance-exit copy /
           Z-5 gesture CTA with a collapsible canopy/pill mechanic.
           The HUD handles all text rendering: hook, canopy, pill,
           ambient subtext, idle whisper, threshold morph, receipt. */}
      {composition.narrative && (
        <BreathingHUD
          narrative={composition.narrative}
          voiceLane={persona.voiceLane}
          playerPhase={phase}
          phaseElapsed={phaseElapsed}
          atmosphereSettled={atmosphereSettled}
          textVisible={textVisible}
          breathAmplitude={amplitude}
          width={width}
          height={height}
          minDim={minDim}
          primaryColor={primaryColor}
          reducedMotion={reducedMotion}
          interactionStarted={interactionStarted}
          resolved={atomResolved}
          breathCycleCount={breathCycleCount}
          onHaptic={onHaptic}
        />
      )}

      {/* Phase indicator — bottom center */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          pointerEvents: 'none',
          fontFamily: fonts.mono,
          fontSize: 7,
          color: colors.neutral.white,
          opacity: 0.1,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
        }}
      >
        {breathPhase} · {phase}
      </div>
    </div>
  );
}