/**
 * NAVICUE ENTRY ORCHESTRATOR
 * ==========================
 * 
 * Handles the first 3-8 seconds of every NaviCue with 10 distinct
 * choreographies. This is the moment between "nothing" and "something" --
 * the threshold crossing that makes each NaviCue feel like entering
 * a unique world.
 * 
 * CHOREOGRAPHIES:
 *   fade_text       -- Standard gentle arrival, atmosphere then text
 *   scene_first     -- Scene builds for 4s, text arrives after
 *   object_first    -- Central element appears first, context wraps around
 *   silence_first   -- 5 seconds of pure atmosphere, then a single word sears in
 *   cold_open       -- No threshold. Content is immediately present.
 *   breath_gate     -- Holds until one full breath cycle completes
 *   particle_gather -- Particles converge from edges, then text
 *   emergence       -- Text rises letter by letter from particle field
 *   split_reveal    -- Two halves slide apart to reveal content
 *   dissolve_in     -- Everything starts blurred, slowly focuses
 * 
 * USAGE:
 * The orchestrator wraps the arriving stage of the NaviCue.
 * It fires onEntryComplete when the choreography finishes.
 * 
 * ```tsx
 * <NaviCueEntryOrchestrator
 *   pattern="silence_first"
 *   palette={palette}
 *   breathAmplitude={breathAmplitude}
 *   onEntryComplete={() => next()}
 * >
 *   <ArrivalText>The still point of the turning world.</ArrivalText>
 * </NaviCueEntryOrchestrator>
 * ```
 */

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { NaviCuePalette } from '@/app/design-system/navicue-blueprint';
import {
  type EntryPattern,
  ENTRY_PATTERN_CONFIGS,
} from '@/app/design-system/navicue-compositor';

interface NaviCueEntryOrchestratorProps {
  /** The choreography pattern to execute */
  pattern: EntryPattern;
  /** Palette for color-derived visuals */
  palette: NaviCuePalette;
  /** Current breath amplitude (0-1), needed for breath_gate */
  breathAmplitude?: number;
  /** Called when the entry sequence completes */
  onEntryComplete: () => void;
  /** Arrival text / content to orchestrate */
  children: ReactNode;
}

export function NaviCueEntryOrchestrator({
  pattern,
  palette,
  breathAmplitude = 0,
  onEntryComplete,
  children,
}: NaviCueEntryOrchestratorProps) {
  const config = ENTRY_PATTERN_CONFIGS[pattern];
  const [phase, setPhase] = useState<'atmosphere' | 'reveal' | 'complete'>('atmosphere');
  const hasCompleted = useRef(false);
  const breathCycleRef = useRef(0);
  const prevAmplitude = useRef(breathAmplitude);

  // Track breath cycles for breath_gate
  useEffect(() => {
    if (pattern !== 'breath_gate') return;
    // Detect a full breath cycle: amplitude goes up then comes back down
    if (breathAmplitude < 0.2 && prevAmplitude.current > 0.6) {
      breathCycleRef.current += 1;
    }
    prevAmplitude.current = breathAmplitude;

    if (breathCycleRef.current >= 1 && phase === 'atmosphere') {
      setPhase('reveal');
    }
  }, [breathAmplitude, pattern, phase]);

  // Standard timer-based progression
  useEffect(() => {
    if (pattern === 'breath_gate') return; // handled by breath detection

    if (pattern === 'cold_open') {
      // Immediate: skip atmosphere entirely
      setPhase('complete');
      return;
    }

    if (!config.atmosphereFirst) {
      // No atmosphere-first delay
      setPhase('reveal');
    }

    // Atmosphere -> Reveal
    const revealTimer = setTimeout(() => {
      if (phase === 'atmosphere') setPhase('reveal');
    }, config.textDelayMs);

    return () => clearTimeout(revealTimer);
  }, [pattern, config, phase]);

  // Reveal -> Complete
  useEffect(() => {
    if (phase !== 'reveal') return;
    const remaining = config.durationMs - config.textDelayMs;
    const completeTimer = setTimeout(() => {
      setPhase('complete');
    }, Math.max(remaining, 800));

    return () => clearTimeout(completeTimer);
  }, [phase, config]);

  // Fire onEntryComplete when done
  useEffect(() => {
    if (phase === 'complete' && !hasCompleted.current) {
      hasCompleted.current = true;
      onEntryComplete();
    }
  }, [phase, onEntryComplete]);

  // Render the choreography
  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <AnimatePresence mode="wait">
        {renderChoreography(pattern, phase, palette, breathAmplitude, children)}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// CHOREOGRAPHY RENDERERS
// =====================================================================

function renderChoreography(
  pattern: EntryPattern,
  phase: 'atmosphere' | 'reveal' | 'complete',
  palette: NaviCuePalette,
  breathAmplitude: number,
  children: ReactNode,
): ReactNode {
  switch (pattern) {
    case 'fade_text':
      return <FadeTextEntry phase={phase} palette={palette} children={children} />;
    case 'scene_first':
      return <SceneFirstEntry phase={phase} palette={palette} children={children} />;
    case 'object_first':
      return <ObjectFirstEntry phase={phase} palette={palette} children={children} />;
    case 'silence_first':
      return <SilenceFirstEntry phase={phase} palette={palette} children={children} />;
    case 'cold_open':
      return <ColdOpenEntry palette={palette} children={children} />;
    case 'breath_gate':
      return <BreathGateEntry phase={phase} palette={palette} breathAmplitude={breathAmplitude} children={children} />;
    case 'particle_gather':
      return <ParticleGatherEntry phase={phase} palette={palette} children={children} />;
    case 'emergence':
      return <EmergenceEntry phase={phase} palette={palette} children={children} />;
    case 'split_reveal':
      return <SplitRevealEntry phase={phase} palette={palette} children={children} />;
    case 'dissolve_in':
      return <DissolveInEntry phase={phase} palette={palette} children={children} />;
    default:
      return <FadeTextEntry phase={phase} palette={palette} children={children} />;
  }
}

interface EntryProps {
  phase: 'atmosphere' | 'reveal' | 'complete';
  palette: NaviCuePalette;
  breathAmplitude?: number;
  children: ReactNode;
}

/** fade_text: Gentle atmosphere, then text fades in */
function FadeTextEntry({ phase, children }: EntryProps) {
  if (phase === 'atmosphere') {
    return (
      <motion.div
        key="fade-atmo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ textAlign: 'center' }}
      />
    );
  }
  return (
    <motion.div
      key="fade-text"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** scene_first: Scene builds, then text arrives 3.5s later */
function SceneFirstEntry({ phase, palette, children }: EntryProps) {
  if (phase === 'atmosphere') {
    return (
      <motion.div
        key="scene-atmo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Atmospheric glow ring */}
        <motion.div
          animate={{
            scale: [0.5, 1.2, 1],
            opacity: [0, 0.08, 0.04],
          }}
          transition={{ duration: 3.5, ease: 'easeOut' }}
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: `1px solid ${palette.primaryGlow}`,
          }}
        />
      </motion.div>
    );
  }
  return (
    <motion.div
      key="scene-text"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** object_first: Central element appears first, context wraps around */
function ObjectFirstEntry({ phase, children }: EntryProps) {
  return (
    <motion.div
      key="object-entry"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {phase !== 'atmosphere' && children}
    </motion.div>
  );
}

/** silence_first: 5 seconds of pure atmosphere, then a single word sears in */
function SilenceFirstEntry({ phase, palette, children }: EntryProps) {
  if (phase === 'atmosphere') {
    return (
      <motion.div
        key="silence-wait"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        style={{
          width: '100%',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* A single breath dot pulses in the center */}
        <motion.div
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: palette.primary,
          }}
        />
      </motion.div>
    );
  }
  return (
    <motion.div
      key="silence-text"
      initial={{ opacity: 0, letterSpacing: '0.2em' }}
      animate={{ opacity: 1, letterSpacing: '0.02em' }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** cold_open: Immediate. No threshold. Startling. */
function ColdOpenEntry({ children }: Omit<EntryProps, 'phase'>) {
  return (
    <motion.div
      key="cold-open"
      initial={{ opacity: 1 }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** breath_gate: Holds until one full breath cycle */
function BreathGateEntry({ phase, palette, breathAmplitude = 0, children }: EntryProps) {
  if (phase === 'atmosphere') {
    return (
      <motion.div
        key="breath-wait"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Breathing circle that responds to breath engine */}
        <motion.div
          animate={{
            scale: 0.7 + breathAmplitude * 0.6,
            opacity: 0.06 + breathAmplitude * 0.06,
          }}
          transition={{ duration: 0.3 }}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: `1px solid ${palette.primary}`,
          }}
        />
      </motion.div>
    );
  }
  return (
    <motion.div
      key="breath-text"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** particle_gather: Particles converge from edges, then text */
function ParticleGatherEntry({ phase, palette, children }: EntryProps) {
  if (phase === 'atmosphere') {
    const dots = Array.from({ length: 8 }, (_, i) => {
      const angle = (360 / 8) * i;
      const rad = (angle * Math.PI) / 180;
      return {
        id: i,
        startX: 50 + Math.cos(rad) * 45,
        startY: 50 + Math.sin(rad) * 45,
      };
    });

    return (
      <motion.div
        key="gather-atmo"
        exit={{ opacity: 0 }}
        style={{
          position: 'relative',
          width: 120,
          height: 120,
        }}
      >
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            initial={{
              left: `${dot.startX}%`,
              top: `${dot.startY}%`,
              opacity: 0,
            }}
            animate={{
              left: '50%',
              top: '50%',
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              delay: dot.id * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: palette.primary,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </motion.div>
    );
  }
  return (
    <motion.div
      key="gather-text"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** emergence: Text rises from below, letter by letter feel */
function EmergenceEntry({ phase, children }: EntryProps) {
  if (phase === 'atmosphere') {
    return (
      <motion.div
        key="emerge-wait"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
      />
    );
  }
  return (
    <motion.div
      key="emerge-text"
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** split_reveal: Content revealed as two halves part */
function SplitRevealEntry({ phase, palette, children }: EntryProps) {
  if (phase === 'atmosphere') {
    return (
      <motion.div
        key="split-mask"
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Two curtains */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '-100%' }}
          transition={{ duration: 1.5, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            height: '100%',
            background: palette.primaryFaint,
          }}
        />
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '50%',
            height: '100%',
            background: palette.primaryFaint,
          }}
        />
      </motion.div>
    );
  }
  return (
    <motion.div
      key="split-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}

/** dissolve_in: Everything starts blurred, slowly focuses */
function DissolveInEntry({ phase, children }: EntryProps) {
  return (
    <motion.div
      key="dissolve-entry"
      initial={{ opacity: 0.3, filter: 'blur(8px)' }}
      animate={{
        opacity: phase === 'atmosphere' ? 0.3 : 1,
        filter: phase === 'atmosphere' ? 'blur(8px)' : 'blur(0px)',
      }}
      transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      {children}
    </motion.div>
  );
}
