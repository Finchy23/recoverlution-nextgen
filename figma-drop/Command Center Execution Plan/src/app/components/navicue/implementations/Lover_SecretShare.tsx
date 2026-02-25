/**
 * LOVER #7 — The Secret Share
 * "If you hide it, you feed it. If you share it, you starve it."
 * INTERACTION: A locked box at center. Each tap turns the key further.
 * The lock mechanism clicks through 5 tumblers. At final click:
 * the lid lifts. Light spills out. The monster was only big in the dark.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TUMBLER_STEPS = 5;

export default function Lover_SecretShare({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tumblers, setTumblers] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const turn = () => {
    if (stage !== 'active' || tumblers >= TUMBLER_STEPS) return;
    const next = tumblers + 1;
    setTumblers(next);
    if (next >= TUMBLER_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = tumblers / TUMBLER_STEPS;
  const opened = t >= 1;
  const lidAngle = opened ? -45 : 0;
  const lightSpill = opened ? 0.15 : 0;
  const keyAngle = t * 180; // key rotates 180°

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A locked box waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Tell them one thing you are afraid they will know. The monster is only big in the dark.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to turn the key</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={turn}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: tumblers >= TUMBLER_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(270, ${8 + t * 6}%, ${7 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Light spill — from inside the box */}
                {opened && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: lightSpill }} transition={{ duration: 1.5 }}>
                    <defs>
                      <radialGradient id={`${svgId}-secretLight`} cx="50%" cy="55%">
                        <stop offset="0%" stopColor="hsla(42, 35%, 55%, 0.2)" />
                        <stop offset="60%" stopColor="transparent" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="100" cy="80" rx="50" ry="35" fill={`url(#${svgId}-secretLight)`} />
                  </motion.g>
                )}

                {/* Box body */}
                <rect x="55" y="80" width="90" height="55" rx="3"
                  fill={`hsla(270, ${6 + t * 4}%, ${14 + t * 5}%, ${0.12 + t * 0.06})`}
                  stroke="hsla(270, 8%, 25%, 0.08)" strokeWidth="0.5" />
                {/* Box grain */}
                {[65, 80, 95, 110, 125].map((x, i) => (
                  <line key={i} x1={x} y1="83" x2={x} y2="132"
                    stroke="hsla(270, 5%, 18%, 0.025)" strokeWidth="0.3" />
                ))}

                {/* Lid — hinges at back, opens upward */}
                <motion.g
                  animate={{ rotate: lidAngle }}
                  transition={{ type: 'spring', stiffness: 60 }}
                  style={{ transformOrigin: '100px 80px' }}>
                  <rect x="53" y="65" width="94" height="17" rx="2"
                    fill={`hsla(270, ${6 + t * 4}%, ${16 + t * 4}%, ${0.14 + t * 0.06})`}
                    stroke="hsla(270, 8%, 25%, 0.08)" strokeWidth="0.5" />
                  {/* Lid edge */}
                  <line x1="55" y1="80" x2="145" y2="80"
                    stroke="hsla(270, 6%, 22%, 0.06)" strokeWidth="0.3" />
                </motion.g>

                {/* Lock mechanism */}
                {!opened && (
                  <g>
                    {/* Keyhole */}
                    <circle cx="100" cy="100" r="5"
                      fill="hsla(0, 0%, 10%, 0.1)" stroke="hsla(270, 8%, 28%, 0.08)" strokeWidth="0.5" />
                    <rect x="99" y="100" width="2" height="6" rx="0.5"
                      fill="hsla(0, 0%, 10%, 0.08)" />
                    {/* Key — rotating */}
                    <motion.g
                      animate={{ rotate: keyAngle }}
                      transition={{ type: 'spring', stiffness: 80 }}
                      style={{ transformOrigin: '100px 100px' }}>
                      <line x1="100" y1="100" x2="100" y2="115"
                        stroke={`hsla(42, ${20 + t * 20}%, ${35 + t * 15}%, ${0.12 + t * 0.1})`}
                        strokeWidth="1" strokeLinecap="round" />
                      <line x1="100" y1="115" x2="104" y2="112"
                        stroke={`hsla(42, ${20 + t * 20}%, ${35 + t * 15}%, ${0.1 + t * 0.08})`}
                        strokeWidth="0.8" />
                    </motion.g>
                  </g>
                )}

                {/* Tumbler indicators */}
                <g>
                  {Array.from({ length: TUMBLER_STEPS }, (_, i) => (
                    <rect key={i} x={70 + i * 14} y="140" width="8" height="4" rx="1"
                      fill={i < tumblers ? `hsla(42, 30%, 48%, ${0.15 + i * 0.03})` : 'hsla(270, 5%, 18%, 0.05)'}
                    />
                  ))}
                </g>

                {/* Opened label */}
                {opened && (
                  <motion.text x="100" y="110" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 30%, 52%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5, duration: 1.5 }}>
                    SHARED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={tumblers} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {tumblers === 0 ? 'Locked. The secret inside.' : tumblers < TUMBLER_STEPS ? `Tumbler ${tumblers}. Click.` : 'Open. Light spills. The monster shrank.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: TUMBLER_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < tumblers ? 'hsla(42, 30%, 48%, 0.5)' : palette.primaryFaint, opacity: i < tumblers ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The box opened. Light spilled out. The thing you hid, now shared. The monster shrank to nothing. It was only big in the dark.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Shame resilience. Vulnerability without catastrophe creates a massive prediction error. The shame circuit rewires. If you share it, you starve it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Locked. Shared. Light.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}