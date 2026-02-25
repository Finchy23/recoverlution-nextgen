/**
 * RECEIVER #7 -- 1177. The Feedback Loop (Squeal)
 * "Stop analyzing the analysis. Cover the mic. Act."
 * INTERACTION: Painful screech (feedback). Cover the mic. Silence. Relief.
 * STEALTH KBE: Interruption -- rumination stopping (E)
 *
 * COMPOSITOR: sensory_cinema / Pulse / night / embodying / tap / 1177
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_FeedbackLoop({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1177,
        isSeal: false,
      }}
      arrivalText="A screech. Growing louder."
      prompt="You are listening to yourself listening to yourself. It is a loop. Stop analyzing the analysis. Cover the mic. Act."
      resonantText="Interruption. The feedback loop was you amplifying you. Thought feeding thought. The fix was not more thinking. It was one physical act: cover the mic. Rumination stops with the body, not the mind."
      afterglowCoda="Relief."
      onComplete={onComplete}
    >
      {(verse) => <FeedbackLoopInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FeedbackLoopInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'screeching' | 'covered' | 'silence'>('screeching');
  const [intensity, setIntensity] = useState(0.3);
  const [time, setTime] = useState(0);

  // Escalating screech
  useEffect(() => {
    if (phase !== 'screeching') return;
    const interval = setInterval(() => {
      setTime(t => t + 0.05);
      setIntensity(prev => Math.min(0.9, prev + 0.003));
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  const coverMic = useCallback(() => {
    if (phase !== 'screeching') return;
    setPhase('covered');
    setTimeout(() => {
      setPhase('silence');
      setTimeout(() => verse.advance(), 2200);
    }, 1200);
  }, [phase, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          <AnimatePresence>
            {phase === 'screeching' && (
              <>
                {/* Feedback spiral */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const r = 10 + i * 8 + Math.sin(time * 3 + i) * 3;
                  return (
                    <motion.circle key={i}
                      cx={80} cy={45} r={r}
                      fill="none"
                      stroke="hsla(0, 35%, 50%, 0.2)"
                      strokeWidth={1 + intensity * 2}
                      animate={{ opacity: [intensity * 0.3, intensity * 0.5, intensity * 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.2 + i * 0.1 }}
                    />
                  );
                })}

                {/* Loop arrows */}
                <motion.path
                  d="M 65 30 Q 95 25 95 45 Q 95 65 65 60 Q 35 55 35 45 Q 35 25 65 30"
                  fill="none" stroke="hsla(0, 30%, 50%, 0.2)"
                  strokeWidth={1} strokeDasharray="3 3"
                  animate={{ strokeDashoffset: [0, -12] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />

                {/* Intensity meter */}
                <rect x={15} y={78} width={130} height={3} rx={1.5}
                  fill={verse.palette.primaryGlow} opacity={0.15} />
                <rect x={15} y={78} width={130 * intensity} height={3} rx={1.5}
                  fill="hsla(0, 35%, 50%, 0.4)" />
              </>
            )}

            {phase === 'covered' && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Covered mic */}
                <circle cx={80} cy={45} r={15}
                  fill="hsla(0, 0%, 30%, 0.2)"
                  stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.3} />
                <text x={80} y={48} textAnchor="middle"
                  style={{ ...navicueType.hint, fontSize: 8 }}
                  fill={verse.palette.textFaint} opacity={0.4}>
                  covered
                </text>
              </motion.g>
            )}

            {phase === 'silence' && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Flat line -- silence */}
                <line x1={20} y1={45} x2={140} y2={45}
                  stroke={verse.palette.accent} strokeWidth={1} opacity={0.3} />
                <text x={80} y={65} textAnchor="middle"
                  style={{ ...navicueType.hint, fontSize: 10 }}
                  fill={verse.palette.accent} opacity={0.5}>
                  silence
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Action */}
      {phase === 'screeching' && (
        <motion.button onClick={coverMic}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          cover the mic
        </motion.button>
      )}
      {phase === 'covered' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.5 }}>
          fading...
        </span>
      )}
      {phase === 'silence' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          relief
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'silence' ? 'rumination stopping' : 'stop the loop'}
      </div>
    </div>
  );
}