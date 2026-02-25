/**
 * WAYFINDER #1 -- 1161. The Dead Reckoning
 * "When you cannot see the goal, rely on the vector."
 * INTERACTION: Fog. No landmarks. Walk forward blindly on a heading. Fog clears. Land.
 * STEALTH KBE: Self-Trust -- internal guidance (B)
 *
 * COMPOSITOR: sacred_ordinary / Compass / morning / believing / tap / 1161
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Wayfinder_DeadReckoning({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Compass',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1161,
        isSeal: false,
      }}
      arrivalText="Fog. No landmarks."
      prompt="When you cannot see the goal, rely on the vector. You know your speed. You know your direction. Do not doubt the calculation."
      resonantText="Self-Trust. You walked without seeing. The heading held. The math held. You held. Internal guidance does not need a horizon. It needs conviction."
      afterglowCoda="Land."
      onComplete={onComplete}
    >
      {(verse) => <DeadReckoningInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DeadReckoningInteraction({ verse }: { verse: any }) {
  const [steps, setSteps] = useState(0);
  const [phase, setPhase] = useState<'fog' | 'walking' | 'land'>('fog');
  const STEPS_NEEDED = 8;
  const heading = 247;

  const step = useCallback(() => {
    if (phase === 'land') return;
    if (phase === 'fog') setPhase('walking');
    setSteps(prev => {
      const next = prev + 1;
      if (next >= STEPS_NEEDED) {
        setPhase('land');
        setTimeout(() => verse.advance(), 2400);
      }
      return next;
    });
  }, [phase, verse]);

  const fogOpacity = phase === 'land' ? 0 : Math.max(0.1, 0.7 - (steps / STEPS_NEEDED) * 0.6);
  const pct = steps / STEPS_NEEDED;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 110)}>
        {/* Fog layer */}
        <motion.div
          animate={{ opacity: fogOpacity }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 8,
            background: 'radial-gradient(ellipse at center, hsla(0,0%,70%,0.4), hsla(0,0%,50%,0.15))',
            pointerEvents: 'none',
          }}
        />

        {/* Land (appears as fog clears) */}
        <AnimatePresence>
          {pct > 0.5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.min(1, (pct - 0.5) * 2) }}
              style={{ position: 'absolute', bottom: 15, left: 30, right: 30, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <svg width={100} height={40}>
                <path d="M 0 35 Q 20 15 50 20 Q 80 15 100 35" fill="none"
                  stroke={verse.palette.accent} strokeWidth={1.5} opacity={0.4} />
                <path d="M 10 35 Q 30 22 50 25 Q 70 22 90 35" fill="none"
                  stroke={verse.palette.accent} strokeWidth={1} opacity={0.25} />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compass heading */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          <span style={{ ...navicueType.hint, fontSize: 8, color: verse.palette.textFaint, opacity: 0.4 }}>
            heading
          </span>
          <span style={{
            ...navicueType.hint, fontSize: 14,
            color: phase === 'land' ? verse.palette.accent : verse.palette.textFaint,
            opacity: 0.6,
          }}>
            {heading}°
          </span>
        </div>

        {/* Step tracker dots */}
        <div style={{
          position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 4,
        }}>
          {Array.from({ length: STEPS_NEEDED }).map((_, i) => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: '50%',
              background: i < steps
                ? (phase === 'land' ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.5)')
                : verse.palette.primaryGlow,
              opacity: i < steps ? 0.6 : 0.2,
            }} />
          ))}
        </div>
      </div>

      {/* Action */}
      {phase !== 'land' ? (
        <motion.button onClick={step}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          {phase === 'fog' ? 'trust the math' : 'step'}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          land
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'land' ? 'internal guidance' : phase === 'fog' ? 'trust the vector' : `step ${steps}/${STEPS_NEEDED}`}
      </div>
    </div>
  );
}