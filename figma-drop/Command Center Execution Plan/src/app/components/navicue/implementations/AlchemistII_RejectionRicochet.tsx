/**
 * ALCHEMIST II #9 -- The Rejection Ricochet
 * "They said no. Good. Now you have something to prove. Use the energy."
 * INTERACTION: A ball hits a wall and bounces back. Each tap = another
 * throw. The ball comes back faster each time, gaining energy. The
 * wall doesn't stop you -- it accelerates you.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Exposure', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BOUNCES = 5;

export default function AlchemistII_RejectionRicochet({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bounceCount, setBounceCount] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [ballPhase, setBallPhase] = useState<'idle' | 'going' | 'returning'>('idle');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const throwBall = () => {
    if (stage !== 'active' || animating || bounceCount >= BOUNCES) return;
    setAnimating(true);
    setBallPhase('going');
    const speed = 400 - bounceCount * 50;
    addTimer(() => {
      setBallPhase('returning');
      addTimer(() => {
        const next = bounceCount + 1;
        setBounceCount(next);
        setBallPhase('idle');
        setAnimating(false);
        if (next >= BOUNCES) {
          addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
        }
      }, speed);
    }, speed);
  };

  const energy = bounceCount / BOUNCES;
  const ballSize = 8 + energy * 4;
  const ballColor = `hsla(${15 + energy * 25}, ${50 + energy * 20}%, ${45 + energy * 10}%, ${0.5 + energy * 0.3})`;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Exposure" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The wall stands...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>They said no. Good. Now you have something to prove. Use the energy.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to throw and use the bounce</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={throwBall}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: bounceCount >= BOUNCES || animating ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* The Wall */}
                <rect x="195" y="10" width="15" height="120" rx="2"
                  fill="hsla(0, 0%, 20%, 0.4)"
                  stroke="hsla(0, 0%, 25%, 0.2)" strokeWidth="0.5" />
                {/* Wall texture -- bricks */}
                {Array.from({ length: 6 }, (_, i) => (
                  <line key={i} x1="195" y1={10 + i * 20} x2="210" y2={10 + i * 20}
                    stroke="hsla(0, 0%, 15%, 0.15)" strokeWidth={safeSvgStroke(0.3)} />
                ))}
                {/* Impact marks on wall */}
                {Array.from({ length: bounceCount }, (_, i) => (
                  <circle key={`im${i}`}
                    cx="195"
                    cy={70 + (i - 2) * 12}
                    r={2 + i * 0.5}
                    fill={`hsla(0, 0%, 25%, ${0.08 + i * 0.02})`}
                  />
                ))}
                {/* Ball */}
                <motion.circle
                  cx={ballPhase === 'going' ? 190 : ballPhase === 'returning' ? 30 : 40}
                  cy="70"
                  r={ballSize}
                  fill={ballColor}
                  initial={{
                    cx: ballPhase === 'going' ? 190 : ballPhase === 'returning' ? 30 : 40,
                  }}
                  animate={{
                    cx: ballPhase === 'going' ? 190 : ballPhase === 'returning' ? 30 : 40 + bounceCount * 3,
                  }}
                  transition={{
                    duration: ballPhase === 'idle' ? 0 : (0.4 - bounceCount * 0.05),
                    ease: ballPhase === 'going' ? 'easeIn' : 'easeOut',
                  }}
                />
                {/* Motion trail */}
                {ballPhase === 'returning' && (
                  <motion.line x1="190" y1="70" x2="40" y2="70"
                    stroke={ballColor} strokeWidth="1" strokeDasharray="3 5"
                    initial={{ opacity: 0.2 }} animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                {/* Energy indicator -- growing bar */}
                <rect x="15" y="125" width={bounceCount * 35} height="4" rx="2"
                  fill={ballColor} opacity={0.3} />
              </svg>
              {/* Speed label */}
              <div style={{ position: 'absolute', top: '8px', left: '10px', fontFamily: 'monospace', fontSize: '11px', color: ballColor, opacity: 0.4 }}>
                {bounceCount > 0 ? `${Math.floor(energy * 100)}% ENERGY` : 'IDLE'}
              </div>
            </div>
            <motion.div key={bounceCount} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {bounceCount === 0 ? 'The ball. The wall. Throw it.' : bounceCount < BOUNCES ? `Bounce ${bounceCount}. Coming back faster.` : 'Maximum velocity. Use the energy.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BOUNCES }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < bounceCount ? ballColor : palette.primaryFaint, opacity: i < bounceCount ? 0.7 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every "no" added velocity. The wall didn't stop you. It accelerated you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Reactance theory engaged. Threatened autonomy became fuel. Persistence amplified.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            No. Bounce. Faster.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}