/**
 * TUNING #9 -- 1199. The Fade Out
 * "Respect the decay. Let it ring out."
 * INTERACTION: Song ends. Silence follows. Observe: wait for absolute end of sound. Patience.
 * STEALTH KBE: Closure -- respect for endings (E)
 *
 * COMPOSITOR: witness_ritual / Echo / night / embodying / observe / 1199
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tuning_FadeOut({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Echo',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1199,
        isSeal: false,
      }}
      arrivalText="The last note."
      prompt="The music is not over until the silence is complete. Respect the decay. Let it ring out."
      resonantText="Closure. You held the silence after the last note until the vibration reached zero. Most people rush to fill the space. You let it complete. Respect for endings: the silence after the music is part of the music."
      afterglowCoda="Complete."
      onComplete={onComplete}
    >
      {(verse) => <FadeOutInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FadeOutInteraction({ verse }: { verse: any }) {
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(false);
  const FADE_DURATION = 8; // seconds

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setTime(prev => {
        const next = prev + 0.05;
        if (next >= FADE_DURATION) {
          setDone(true);
          setTimeout(() => verse.advance(), 2000);
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [done, verse]);

  const pct = Math.min(1, time / FADE_DURATION);
  const amplitude = Math.max(0, 1 - pct) * (1 - pct); // exponential decay
  const envelope = Math.exp(-pct * 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Decaying waveform */}
          <path
            d={Array.from({ length: 80 }).map((_, i) => {
              const x = i * 2;
              const wave = Math.sin(x * 0.12 + time * 10) * 18 * envelope;
              return `${i === 0 ? 'M' : 'L'} ${x} ${40 + wave}`;
            }).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.4)'}
            strokeWidth={1.5}
            opacity={Math.max(0.05, envelope * 0.6)}
          />

          {/* Decay envelope */}
          <path
            d={Array.from({ length: 60 }).map((_, i) => {
              const x = 20 + i * 2;
              const envPoint = Math.exp(-(i / 60) * 3) * 18;
              return `${i === 0 ? 'M' : 'L'} ${x} ${40 - envPoint}`;
            }).join(' ')}
            fill="none"
            stroke={verse.palette.primaryGlow}
            strokeWidth={0.5} strokeDasharray="2 4"
            opacity={0.1}
          />

          {/* Progress marker along envelope */}
          <circle
            cx={20 + pct * 120}
            cy={40 - Math.exp(-pct * 3) * 18}
            r={2}
            fill={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.4)'}
            opacity={0.4}
          />

          {/* Silence line */}
          {pct > 0.7 && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              x1={20} y1={40} x2={140} y2={40}
              stroke={done ? verse.palette.accent : verse.palette.primaryGlow}
              strokeWidth={0.5}
            />
          )}

          {/* Volume */}
          <text x={80} y={72} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            opacity={0.4}>
            {done ? 'silence' : `${Math.max(0, Math.round(envelope * 100))}%`}
          </text>
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="fading"
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{
              ...navicueType.hint,
              color: verse.palette.textFaint,
              fontSize: 11,
              opacity: Math.max(0.15, 0.5 - pct * 0.4),
            }}>
              {pct < 0.3 ? 'the last note fading...' :
               pct < 0.6 ? 'fading...' :
               pct < 0.85 ? 'almost...' : 'silence approaching...'}
            </span>
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${pct * 100}%` }}
                style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
          >
            complete
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'respect for endings' : 'let it ring out'}
      </div>
    </div>
  );
}