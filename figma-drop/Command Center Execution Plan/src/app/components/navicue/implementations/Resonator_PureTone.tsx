/**
 * RESONATOR #6 -- 1026. The Pure Tone (The Standard)
 * "Hold the note until the room matches you."
 * INTERACTION: Hold the tuning fork -- chaos calms into a single pure line
 * STEALTH KBE: Stability -- leadership presence (E)
 *
 * COMPOSITOR: witness_ritual / Ocean / morning / embodying / hold / 1026
 */
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { useHoldInteraction } from '../interactions/useHoldInteraction';
import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_PureTone({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Ocean',
        chrono: 'morning',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1026,
        isSeal: false,
      }}
      arrivalText="Chaos warming up."
      prompt="Chaos respects a standard. Be the tuning fork. Do not wobble. Hold the note until the room matches you."
      resonantText="Emotional regulation through co-regulation. A steady nervous system in a room full of dysregulated ones becomes the reference frequency. The room does not quiet because you asked. It quiets because you held."
      afterglowCoda="The room matches you."
      onComplete={onComplete}
    >
      {(verse) => <PureToneInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PureToneInteraction({ verse }: { verse: any }) {
  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => verse.advance(),
  });
  const h = hold.tension;

  // Orchestra chaos that calms with hold
  const chaos = Math.max(0, 1 - h * 1.3);
  const lineCount = 8;

  const orchestraLines = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => {
      const baseY = 12 + i * 12;
      const chaosAmp = chaos * (10 + i * 3);
      const freq = 0.05 + (i * 0.015) * chaos + (1 - chaos) * 0.05;
      return Array.from({ length: 60 }, (_, x) => {
        const px = x * 5;
        const py = baseY + Math.sin(px * freq + i * 1.7) * chaosAmp;
        return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
      }).join(' ');
    });
  }, [chaos]);

  return (
    <div style={{ ...navicueInteraction.interactionWrapper, gap: 28 }}>
      {/* Orchestra visualization */}
      <svg width="280" height="120" viewBox="0 0 300 120">
        {orchestraLines.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={0.6}
            animate={{ opacity: [0.06 + (1 - chaos) * 0.08, 0.12 + (1 - chaos) * 0.08] }}
            transition={{ duration: 2 + i * 0.2, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
        {/* The pure tone -- a single steady line that brightens */}
        <motion.line
          x1="0" y1="60" x2="300" y2="60"
          stroke={verse.palette.accent}
          strokeWidth={0.6 + h * 1}
          animate={{ opacity: h > 0.1 ? [0.1 + h * 0.2, 0.25 + h * 0.2] : 0 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* 440Hz label */}
        {h > 0.3 && (
          <motion.text
            x="290" y="57" textAnchor="end"
            fill={verse.palette.textFaint}
            style={{ fontSize: 9, fontFamily: 'monospace' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: h * 0.35 }}
          >
            440Hz
          </motion.text>
        )}
      </svg>

      {/* Tuning fork hold zone -- large, immersive */}
      <div
        {...hold.holdProps}
        style={{
          ...hold.holdProps.style,
          ...navicueInteraction.holdZone,
          position: 'relative',
        }}
      >
        {/* Outer glow ring -- breathes when not holding, tightens when holding */}
        <motion.div
          animate={{
            scale: hold.isHolding ? 1 : [1, 1.08, 1],
            opacity: hold.isHolding ? 0.15 + h * 0.15 : 0.06,
          }}
          transition={hold.isHolding
            ? { duration: 0.3 }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `1px solid ${verse.palette.accent}`,
          }}
        />

        {/* Progress arc */}
        <svg viewBox="0 0 120 120" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
        }}>
          <circle
            cx={60} cy={60} r={55}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={1}
            strokeDasharray={`${h * 345} 345`}
            strokeLinecap="round"
            opacity={0.25 + h * 0.2}
            transform="rotate(-90 60 60)"
          />
        </svg>

        {/* Tuning fork shape */}
        <svg width="40" height="60" viewBox="0 0 40 60" style={{ position: 'relative', zIndex: 1 }}>
          <motion.path
            d="M 14 6 L 14 30 M 26 6 L 26 30 M 20 30 L 20 54"
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={1.5}
            strokeLinecap="round"
            animate={hold.isHolding
              ? { opacity: [0.25, 0.5, 0.25] }
              : { opacity: 0.15 }
            }
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          {/* Vibration lines when holding */}
          {hold.isHolding && (
            <>
              <motion.line
                x1={10} y1={15} x2={6} y2={15}
                stroke={verse.palette.accent} strokeWidth={0.5}
                animate={{ opacity: [0, 0.3, 0], x1: [10, 7, 10] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
              />
              <motion.line
                x1={30} y1={15} x2={34} y2={15}
                stroke={verse.palette.accent} strokeWidth={0.5}
                animate={{ opacity: [0, 0.3, 0], x2: [34, 37, 34] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Status text */}
      <span style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}>
        {h > 0.9 ? 'pure tone' : h > 0.5 ? 'steadying...' : hold.isHolding ? 'holding...' : 'hold the fork'}
      </span>
    </div>
  );
}
