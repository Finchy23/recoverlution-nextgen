/**
 * PROJECTOR #5 -- 1005. The Tuning Fork
 * "You cannot tune an instrument by thinking about music."
 * INTERACTION: Observe a tuning fork that responds to breath.
 * As breath amplitude peaks, the fork rings clearer and vibration
 * lines appear. After 3 breath cycles of sustained attention,
 * the fork resolves into a single pure tone visual.
 * STEALTH KBE: E (Embodying) -- Somatic entrainment through observation
 *
 * PROOF SPECIMEN: Validates NaviCueVerse with observe interaction,
 * sensory_cinema signature, Theater form, night chrono, seed 1005.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Projector_TuningFork({ onComplete }: Props) {
  const [breathCycles, setBreathCycles] = useState(0);
  const [resolved, setResolved] = useState(false);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Theater',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'observe',
        specimenSeed: 1005,
        isSeal: false,
      }}
      arrivalText="Listen..."
      prompt="Watch the fork. Let your breath find its frequency."
      resonantText="The body knows the note before the mind can name it."
      afterglowCoda="Resonance."
      onComplete={onComplete}
      mechanism="Somatic Awareness"
    >
      {(verse) => (
        <TuningForkInner
          verse={verse}
          breathCycles={breathCycles}
          setBreathCycles={setBreathCycles}
          resolved={resolved}
          setResolved={setResolved}
        />
      )}
    </NaviCueVerse>
  );
}

function TuningForkInner({
  verse,
  breathCycles,
  setBreathCycles,
  resolved,
  setResolved,
}: {
  verse: any;
  breathCycles: number;
  setBreathCycles: (n: number | ((prev: number) => number)) => void;
  resolved: boolean;
  setResolved: (b: boolean) => void;
}) {
  const prevAmp = useRef(0);
  const wasRising = useRef(false);
  const advanceRef = useRef(verse.advance);
  advanceRef.current = verse.advance;

  // Track breath cycles via effect (never setState in render)
  useEffect(() => {
    const amp = verse.breathAmplitude;
    if (amp > 0.7) wasRising.current = true;
    if (amp < 0.3 && wasRising.current) {
      wasRising.current = false;
      setBreathCycles((prev: number) => prev + 1);
    }
    prevAmp.current = amp;
  }, [verse.breathAmplitude, setBreathCycles]);

  // Resolve after 3 cycles
  useEffect(() => {
    if (breathCycles >= 3 && !resolved) {
      setResolved(true);
      setTimeout(() => advanceRef.current(), 2000);
    }
  }, [breathCycles, resolved, setResolved]);

  const amp = verse.breathAmplitude;
  const vibrationWidth = 3 + amp * 12;
  const toneOpacity = 0.1 + amp * 0.3;
  const coherence = Math.min(1, breathCycles / 3);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 28,
      width: '100%',
    }}>
      {/* Tuning fork visual */}
      <div style={navicueStyles.heroScene(verse.palette, 120 / 200)}>
        <svg viewBox="0 0 120 200" style={navicueStyles.heroSvg}>
          {/* Handle */}
          <rect
            x={57} y={100} width={6} height={90}
            rx={3}
            fill={verse.palette.primary}
            opacity={0.3 + coherence * 0.3}
          />
          {/* Left tine */}
          <motion.rect
            x={40} y={10} width={4} height={95}
            rx={2}
            fill={verse.palette.primary}
            opacity={0.3 + coherence * 0.4}
            animate={{
              x: [40 - vibrationWidth * 0.3, 40 + vibrationWidth * 0.3, 40 - vibrationWidth * 0.3],
            }}
            transition={{
              duration: 0.15 + (1 - amp) * 0.1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {/* Right tine */}
          <motion.rect
            x={76} y={10} width={4} height={95}
            rx={2}
            fill={verse.palette.primary}
            opacity={0.3 + coherence * 0.4}
            animate={{
              x: [76 + vibrationWidth * 0.3, 76 - vibrationWidth * 0.3, 76 + vibrationWidth * 0.3],
            }}
            transition={{
              duration: 0.15 + (1 - amp) * 0.1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {/* Vibration lines */}
          {amp > 0.3 && (
            <>
              <motion.circle
                cx={60} cy={50}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={0.5}
                animate={{
                  r: [8, 20 + amp * 15, 8],
                  opacity: [toneOpacity, 0, toneOpacity],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {coherence > 0.3 && (
                <motion.circle
                  cx={60} cy={50}
                  fill="none"
                  stroke={verse.palette.primary}
                  strokeWidth={0.3}
                  animate={{
                    r: [15, 30 + amp * 20, 15],
                    opacity: [toneOpacity * 0.5, 0, toneOpacity * 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
              )}
            </>
          )}
          {/* Resolved glow */}
          {resolved && (
            <motion.circle
              cx={60} cy={50}
              fill={verse.palette.primaryGlow}
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: 40, opacity: 0.15 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </svg>
      </div>

      {/* Coherence indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              background: breathCycles > i ? verse.palette.primary : 'transparent',
              borderColor: breathCycles > i ? verse.palette.primary : verse.palette.primaryGlow,
              opacity: breathCycles > i ? 0.6 : 0.2,
            }}
            transition={{ duration: 0.5 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              border: `1px solid ${verse.palette.primaryGlow}`,
            }}
          />
        ))}
      </div>

      {/* Guidance text */}
      <motion.div
        animate={{ opacity: resolved ? 0 : 0.5 }}
        style={{
          ...navicueType.hint,
          color: verse.palette.textFaint,
          textAlign: 'center',
        }}
      >
        {breathCycles === 0 && 'Breathe with the fork...'}
        {breathCycles === 1 && 'The tone is finding you.'}
        {breathCycles === 2 && 'Almost in resonance.'}
        {breathCycles >= 3 && !resolved && 'Pure tone achieved.'}
      </motion.div>
    </div>
  );
}