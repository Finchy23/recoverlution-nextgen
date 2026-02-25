/**
 * PROJECTOR #9 -- 1009. The Ghost Light
 * "The ghost light is the lamp left burning in an empty theater."
 * INTERACTION: Observe. A single dim lamp sits center stage.
 * As the user breathes, the light responds -- brightening on inhale,
 * dimming on exhale. After 3 breath cycles of presence, the theater
 * reveals it was never empty. You were always the audience.
 * STEALTH KBE: B (Believing) -- Presence through witnessing
 *
 * Uses NaviCueVerse with observe interaction,
 * relational_ghost signature, Theater form, morning chrono, seed 1009.
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Projector_GhostLight({ onComplete }: Props) {
  const [breathCycles, setBreathCycles] = useState(0);
  const [theaterRevealed, setTheaterRevealed] = useState(false);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'relational_ghost',
        form: 'Theater',
        chrono: 'morning',
        kbe: 'believing',
        hook: 'observe',
        specimenSeed: 1009,
        isSeal: false,
      }}
      arrivalText="A single lamp, burning..."
      prompt="Watch the ghost light. Let your breath meet it."
      resonantText="The theater was never empty. You were always here."
      afterglowCoda="Presence."
      onComplete={onComplete}
      mechanism="Witnessing"
    >
      {(verse) => (
        <GhostLightInner
          verse={verse}
          breathCycles={breathCycles}
          setBreathCycles={setBreathCycles}
          theaterRevealed={theaterRevealed}
          setTheaterRevealed={setTheaterRevealed}
        />
      )}
    </NaviCueVerse>
  );
}

function GhostLightInner({
  verse,
  breathCycles,
  setBreathCycles,
  theaterRevealed,
  setTheaterRevealed,
}: {
  verse: any;
  breathCycles: number;
  setBreathCycles: (n: number | ((prev: number) => number)) => void;
  theaterRevealed: boolean;
  setTheaterRevealed: (b: boolean) => void;
}) {
  const wasRising = useRef(false);
  const advanceRef = useRef(verse.advance);
  advanceRef.current = verse.advance;

  // Track breath cycles
  useEffect(() => {
    const amp = verse.breathAmplitude;
    if (amp > 0.7) wasRising.current = true;
    if (amp < 0.3 && wasRising.current) {
      wasRising.current = false;
      setBreathCycles((prev: number) => prev + 1);
    }
  }, [verse.breathAmplitude, setBreathCycles]);

  // Reveal theater after 3 cycles
  useEffect(() => {
    if (breathCycles >= 3 && !theaterRevealed) {
      setTheaterRevealed(true);
      setTimeout(() => advanceRef.current(), 2500);
    }
  }, [breathCycles, theaterRevealed, setTheaterRevealed]);

  const amp = verse.breathAmplitude;
  const presence = Math.min(1, breathCycles / 3);
  const glowRadius = 20 + amp * 30;
  const glowOpacity = 0.05 + amp * 0.12 + presence * 0.08;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 28,
      width: '100%',
    }}>
      {/* Theater stage */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 320,
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <svg viewBox="0 0 320 220" style={{ width: '100%', height: '100%' }}>
          {/* Stage floor */}
          <line
            x1={20} y1={180} x2={300} y2={180}
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            opacity={0.15}
          />

          {/* Curtain edges (subtle) */}
          <motion.line
            x1={30} y1={20} x2={30} y2={180}
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            animate={{ opacity: [0.05, 0.1 + presence * 0.05, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.line
            x1={290} y1={20} x2={290} y2={180}
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            animate={{ opacity: [0.05, 0.1 + presence * 0.05, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Ghost light -- the lamp stand */}
          <line
            x1={160} y1={120} x2={160} y2={180}
            stroke={verse.palette.primary}
            strokeWidth={1}
            opacity={0.2 + presence * 0.15}
          />
          {/* Lamp base */}
          <rect
            x={150} y={178} width={20} height={4} rx={2}
            fill={verse.palette.primary}
            opacity={0.2 + presence * 0.1}
          />

          {/* The light itself */}
          <motion.circle
            cx={160} cy={115}
            fill={verse.palette.accent}
            animate={{
              r: [8, 8 + amp * 4, 8],
              opacity: [0.3 + presence * 0.2, 0.5 + amp * 0.2, 0.3 + presence * 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Glow emanation */}
          <motion.circle
            cx={160} cy={115}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={0.5}
            animate={{
              r: [glowRadius * 0.5, glowRadius, glowRadius * 0.5],
              opacity: [glowOpacity, glowOpacity * 0.3, glowOpacity],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx={160} cy={115}
            fill="none"
            stroke={verse.palette.primaryGlow}
            strokeWidth={0.3}
            animate={{
              r: [glowRadius * 0.8, glowRadius * 1.4, glowRadius * 0.8],
              opacity: [glowOpacity * 0.5, 0, glowOpacity * 0.5],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Theater seats -- revealed gradually */}
          {presence > 0.3 && (
            <g>
              {Array.from({ length: 5 }, (_, i) => (
                <motion.rect
                  key={i}
                  x={80 + i * 35}
                  y={195}
                  width={12}
                  height={8}
                  rx={2}
                  fill={verse.palette.primary}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: presence * 0.12 }}
                  transition={{ delay: i * 0.3, duration: 1 }}
                />
              ))}
            </g>
          )}

          {/* Second row of seats */}
          {presence > 0.6 && (
            <g>
              {Array.from({ length: 4 }, (_, i) => (
                <motion.rect
                  key={`row2-${i}`}
                  x={95 + i * 35}
                  y={208}
                  width={12}
                  height={8}
                  rx={2}
                  fill={verse.palette.primary}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: presence * 0.08 }}
                  transition={{ delay: i * 0.4, duration: 1 }}
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Breath cycle indicator */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              background: breathCycles > i ? verse.palette.accent : 'transparent',
              borderColor: breathCycles > i ? verse.palette.accent : verse.palette.primaryGlow,
              opacity: breathCycles > i ? 0.5 : 0.15,
            }}
            transition={{ duration: 0.6 }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              border: `1px solid ${verse.palette.primaryGlow}`,
            }}
          />
        ))}
      </div>

      {/* Guidance */}
      <motion.div
        animate={{ opacity: theaterRevealed ? 0 : 0.4 }}
        style={{
          ...navicueType.hint,
          color: verse.palette.textFaint,
          textAlign: 'center',
        }}
      >
        {breathCycles === 0 && 'Be present with the light...'}
        {breathCycles === 1 && 'The theater is listening.'}
        {breathCycles === 2 && 'Almost... stay.'}
        {breathCycles >= 3 && !theaterRevealed && 'You were never alone.'}
      </motion.div>
    </div>
  );
}
