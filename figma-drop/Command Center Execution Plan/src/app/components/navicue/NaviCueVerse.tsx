/**
 * NAVICUE VERSE
 * =============
 * 
 * The compositional wrapper that replaces manual NaviCueShell + useNaviCueStages
 * wiring. A specimen using NaviCueVerse only provides:
 *   - Its interactive content (as a render function)
 *   - Prompt text
 *   - Resonant (landing) text
 *   - Afterglow coda
 * 
 * Everything else -- scene background, atmosphere mode, entry choreography,
 * timing, color temperature, typography mood, transition style -- is
 * assembled by the compositor from the specimen's context properties.
 * 
 * USAGE:
 * ```tsx
 * <NaviCueVerse
 *   compositorInput={{
 *     signature: 'science_x_soul',
 *     form: 'Theater',
 *     chrono: 'night',
 *     kbe: 'embodying',
 *     hook: 'hold',
 *     specimenSeed: 1010,
 *     isSeal: true,
 *   }}
 *   prompt="Every fragment contains the whole."
 *   arrivalText="A hologram appears..."
 *   resonantText="The holographic principle is not a metaphor."
 *   afterglowCoda="Every fragment, the whole."
 *   onComplete={handleComplete}
 * >
 *   {(verse) => (
 *     // ONLY the interactive content goes here
 *     <HoldZone palette={verse.palette} onHeld={verse.advance} />
 *   )}
 * </NaviCueVerse>
 * ```
 * 
 * The render function receives a VerseContext with:
 *   - palette: NaviCuePalette for coloring interactive elements
 *   - composition: full CompositorOutput for advanced use
 *   - breathAmplitude: current breath value (0-1)
 *   - interactionProgress: 0-1 progress (managed by the specimen)
 *   - advance: function to move to next stage
 *   - stage: current NaviCue stage
 *   - typographyOverrides: additional CSS properties for typography
 *   - isLabMode: true when rendering inside Lab/ProofPreview
 * 
 * NON-LINEAR: NaviCues are not sequential. There is no "finishing"
 * or "progress bar" -- each NaviCue is a self-contained world.
 * The system decides what comes next based on user need.
 */

import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueShell, sanitizeCopy } from './NaviCueShell';
import { NaviCueSceneRenderer } from './NaviCueSceneRenderer';
import { NaviCueEntryOrchestrator } from './NaviCueEntryOrchestrator';
import {
  type NaviCuePalette,
  navicueQuickstart,
  navicueType,
  navicueLayout,
  applyColorTemperature,
  CHRONO_MODIFIERS,
} from '@/app/design-system/navicue-blueprint';
import {
  useNaviCueStages,
  type NaviCueStage,
} from './interactions/useNaviCueStages';
import {
  type CompositorInput,
  type CompositorOutput,
  composeNaviCue,
} from '@/app/design-system/navicue-compositor';
import { useNaviCueLabContext } from './NaviCueLabContext';

// =====================================================================
// VERSE CONTEXT (passed to render function)
// =====================================================================

export interface VerseContext {
  /** The specimen's palette -- use this for all coloring */
  palette: NaviCuePalette;
  /** Full compositor output for advanced scene/atmosphere use */
  composition: CompositorOutput;
  /** Current breath amplitude (0-1) */
  breathAmplitude: number;
  /** Interaction progress (0-1) -- specimen manages this */
  interactionProgress: number;
  /** Call to advance to the next stage (active -> resonant) */
  advance: () => void;
  /** Current stage in the NaviCue arc */
  stage: NaviCueStage;
  /** Typography mood overrides (additional CSS properties) */
  typographyOverrides: Record<string, string | number>;
  /**
   * True when rendering inside Lab/ProofPreview.
   * Observe-pattern specimens can use this to skip or accelerate
   * breath-cycle waits (e.g., advance after 1 cycle instead of 3).
   */
  isLabMode: boolean;
}

// =====================================================================
// PROPS
// =====================================================================

interface NaviCueVerseProps {
  /** Compositor input -- determines the entire visual composition */
  compositorInput: CompositorInput;
  /** Arrival text shown during the arriving stage */
  arrivalText?: string;
  /** The central prompt / question */
  prompt: string;
  /** Landing / resonant text shown after interaction */
  resonantText?: string;
  /** Afterglow coda -- the final poetic line */
  afterglowCoda?: string;
  /** Called when the entire NaviCue completes */
  onComplete?: () => void;
  /** Override stage timing */
  timing?: {
    /** Time before prompt appears (ms). Default: entry duration */
    presentAt?: number;
    /** Time before interaction opens (ms). Default: presentAt + 2000 */
    activeAt?: number;
    /** Duration of resonant stage (ms). Default: 4000-6000 */
    resonantDuration?: number;
    /** Duration of afterglow (ms). Default: 3000-5000 */
    afterglowDuration?: number;
  };
  /** Mechanism name (for palette accent derivation) */
  mechanism?: string;
  /** Render function for the interactive content */
  children: (verse: VerseContext) => ReactNode;
}

// =====================================================================
// COMPONENT
// =====================================================================

export function NaviCueVerse({
  compositorInput,
  arrivalText,
  prompt,
  resonantText,
  afterglowCoda,
  onComplete,
  timing,
  mechanism,
  children,
}: NaviCueVerseProps) {
  // ── Lab mode detection ─────────────────────────────────────────────
  const { isLabMode } = useNaviCueLabContext();

  // ── Compose the experience ─────────────────────────────────────────
  const composition = useMemo(
    () => composeNaviCue(compositorInput),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compositorInput.specimenSeed],
  );

  // ── Design system tokens ───────────────────────────────────────────
  const { palette: rawPalette, atmosphere, motion: motionConfig } = useMemo(
    () => navicueQuickstart(
      compositorInput.signature,
      mechanism,
      compositorInput.kbe,
      compositorInput.form,
    ),
    [compositorInput.signature, mechanism, compositorInput.kbe, compositorInput.form],
  );

  // ── Apply color temperature ────────────────────────────────────────
  // The compositor selects warm/cool/neutral/muted/vivid via the chrono
  // affinity matrix. Without this, every specimen uses the raw signature
  // palette regardless of time-of-day context.
  const palette = useMemo(
    () => applyColorTemperature(rawPalette, composition.colorConfig),
    [rawPalette, composition.colorConfig],
  );

  // ─ Chrono world modifiers ─────────────────────────────────────────
  const chronoMods = CHRONO_MODIFIERS[compositorInput.chrono] || CHRONO_MODIFIERS.work;

  // ── Stage timing ───────────────────────────────────────────────────
  // In Lab mode, compress entry choreography so browsing is quicker,
  // but keep stages READABLE. The previous 150ms/400ms was too fast
  // to read arrival or prompt text. Now: 1.2s arrival, 2s prompt.
  const entryMs = composition.entryConfig.durationMs;
  const presentAt = isLabMode ? 1200 : (timing?.presentAt ?? entryMs);
  const activeAt = isLabMode ? 3200 : (timing?.activeAt ?? (presentAt + 2000));
  const resonantMs = timing?.resonantDuration ?? (compositorInput.isSeal ? 6000 : 4000);
  const afterglowMs = timing?.afterglowDuration ?? (compositorInput.isSeal ? 5000 : 3000);

  // ── Stage management (existing hook) ───────────────────────────────
  const { stage, setStage, addTimer } = useNaviCueStages({
    presentAt,
    activeAt,
  });

  // Advance function: moves from current stage to next
  const advance = useCallback(() => {
    if (stage === 'active') {
      setStage('resonant');
      addTimer(() => setStage('afterglow'), resonantMs);
    } else if (stage === 'present') {
      setStage('active');
    } else if (stage === 'resonant') {
      setStage('afterglow');
    }
  }, [stage, setStage, addTimer, resonantMs]);

  // ── Breath amplitude (chrono-aware oscillator) ─────────────────────
  // Each chrono world has a different breath cycle duration:
  //   morning: 6000ms, work: 5000ms, social: 6000ms, night: 8000ms
  const [breathAmplitude, setBreathAmplitude] = useState(0);
  useEffect(() => {
    let frame: number;
    const startTime = performance.now();
    const cycleDuration = chronoMods.breathCycleDuration;

    const tick = (now: number) => {
      const elapsed = (now - startTime) % cycleDuration;
      const phase = elapsed / cycleDuration;
      setBreathAmplitude(Math.sin(phase * Math.PI * 2) * 0.5 + 0.5);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [chronoMods.breathCycleDuration]);

  // ── Interaction progress (specimen-managed) ────────────────────────
  const [interactionProgress] = useState(0);

  // ── Typography mood overrides ──────────────────────────────────────
  const typographyOverrides = useMemo(() => {
    const tc = composition.typographyConfig;
    return {
      letterSpacing: tc.letterSpacingShift,
      lineHeight: tc.lineHeightMult,
    };
  }, [composition.typographyConfig]);

  // ── Build verse context ────────────────────────────────────────────
  const verse: VerseContext = {
    palette,
    composition,
    breathAmplitude,
    interactionProgress,
    advance,
    stage,
    typographyOverrides,
    isLabMode,
  };

  // ── Fire onComplete when afterglow starts ──────────────────────────
  useEffect(() => {
    if (stage === 'afterglow' && onComplete) {
      const timer = setTimeout(onComplete, afterglowMs);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete, afterglowMs]);

  // ── Lab-mode safety: auto-advance from active after timeout ────────
  // Observe-pattern specimens and complex interactions may never call
  // advance() in lab mode (e.g., breath-cycle watchers). After 8s of
  // active stage in lab mode, auto-advance to resonant so the preview
  // doesn't hang indefinitely.
  useEffect(() => {
    if (!isLabMode || stage !== 'active') return;
    const safety = setTimeout(() => {
      advance();
    }, 8000);
    return () => clearTimeout(safety);
  }, [isLabMode, stage, advance]);

  // ── Transition config ──────────────────────────────────────────────
  const tc = composition.transitionConfig;
  const stageTransition = {
    duration: isLabMode
      ? Math.min(0.2, tc.durationMs / 1000)
      : tc.durationMs / 1000,
    ease: tc.ease === 'linear'
      ? ('linear' as const)
      : ([0.22, 1, 0.36, 1] as const),
  };

  // ── Entry choreography handler ─────────────────────────────────────
  const handleEntryComplete = useCallback(() => {
    // The useNaviCueStages hook handles the arriving->present transition
    // via its own timer. The entry orchestrator completes in parallel.
    // If the entry completes before presentAt, that's fine -- the prompt
    // will appear when the stage changes.
  }, []);

  return (
    <NaviCueShell
      signatureKey={compositorInput.signature}
      mechanism={mechanism}
      kbe={compositorInput.kbe}
      form={compositorInput.form}
      mode="immersive"
      breathProgress={breathAmplitude}
      isAfterglow={stage === 'afterglow'}
      particleSeed={compositorInput.specimenSeed}
      atmosphereMode={composition.atmosphereMode}
      chronoSpeedMult={chronoMods.speedMult}
      interactionHook={compositorInput.hook}
      interactionActive={stage === 'active'}
    >
      {/* Scene background layer */}
      <NaviCueSceneRenderer
        scene={composition.scene}
        palette={palette}
        breathAmplitude={breathAmplitude}
        interactionProgress={interactionProgress}
        seed={compositorInput.specimenSeed}
      />

      {/* Stage content */}
      <div style={
        isLabMode ? navicueLayout.stageContentLab : navicueLayout.stageContent
      }>
        <AnimatePresence mode="wait">
          {/* ── ARRIVING ─────────────────────────────────────── */}
          {stage === 'arriving' && arrivalText && (
            <NaviCueEntryOrchestrator
              key="entry"
              pattern={composition.entryPattern}
              palette={palette}
              breathAmplitude={breathAmplitude}
              onEntryComplete={handleEntryComplete}
            >
              <motion.div
                style={{
                  ...navicueType.arrival,
                  color: palette.textFaint,
                  textAlign: 'center',
                  ...typographyOverrides,
                  maxWidth: 400,
                  padding: '0 16px',
                }}
              >
                {arrivalText}
              </motion.div>
            </NaviCueEntryOrchestrator>
          )}

          {/* ── PRESENT ──────────────────────────────────────── */}
          {stage === 'present' && (
            <motion.div
              key="present"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={stageTransition}
              style={{
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '0 16px',
              }}
            >
              <div style={{
                ...navicueType.prompt,
                color: palette.text,
                ...typographyOverrides,
                maxWidth: 400,
              }}>
                {prompt}
              </div>
            </motion.div>
          )}

          {/* ── ACTIVE ───────────────────────────────────────── */}
          {stage === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={stageTransition}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              {sanitizeCopy(children(verse))}
            </motion.div>
          )}

          {/* ── RESONANT ─────────────────────────────────────── */}
          {stage === 'resonant' && resonantText && (
            <motion.div
              key="resonant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: isLabMode ? 0.4 : 2,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '0 16px',
              }}
            >
              <div style={{
                ...navicueType.narrative,
                color: palette.text,
                letterSpacing: '0.01em',
                ...typographyOverrides,
                maxWidth: 400,
              }}>
                {resonantText}
              </div>
            </motion.div>
          )}

          {/* ── AFTERGLOW ────────────────────────────────────── */}
          {stage === 'afterglow' && (
            <motion.div
              key="afterglow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: isLabMode ? 0.4 : 2,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '0 16px',
              }}
            >
              {afterglowCoda && (
                <div style={{
                  ...navicueType.afterglow,
                  color: palette.textFaint,
                  ...typographyOverrides,
                  maxWidth: 400,
                }}>
                  {afterglowCoda}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NaviCueShell>
  );
}