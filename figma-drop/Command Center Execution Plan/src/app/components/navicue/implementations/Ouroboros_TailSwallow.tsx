/**
 * OUROBOROS #8 — The Tail Swallow
 * "The snake eats its tail. Not destruction — completion."
 * INTERACTION: A serpent SVG path draws itself around a circle.
 * 5 taps advance the snake. The head slowly approaches the tail.
 * On the 5th tap, the mouth reaches the tail — completion.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Ouroboros_TailSwallow({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [segments, setSegments] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => { timersRef.current.forEach(clearTimeout); }; }, []);

  const advance = () => {
    if (stage !== 'active' || segments >= 5) return;
    const next = segments + 1;
    setSegments(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const t = segments / 5;
  const snakeLength = t * 0.95; // Leave a tiny gap until final segment

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (<motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The serpent stirs...</motion.div>)}
        {stage === 'present' && (<motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>The ouroboros eats its own tail. In every culture, this symbol. Not self-destruction, but self-completion. The end feeds the beginning. The beginning feeds the end. Watch the serpent close the circle.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to advance the serpent</div></motion.div>)}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: segments >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(38, ${5 + t * 6}%, ${4 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Snake body — circular path */}
                <circle cx="110" cy="90" r="50" fill="none" stroke={`hsla(38, 6%, 18%, 0.02)`} strokeWidth="6" />
                {segments > 0 && (
                  <motion.circle cx="110" cy="90" r="50" fill="none"
                    stroke={`hsla(38, ${14 + t * 10}%, ${28 + t * 12}%, ${0.05 + t * 0.05})`}
                    strokeWidth={4 + t * 2}
                    strokeLinecap="round"
                    strokeDasharray={`${snakeLength * 314} 314`}
                    transform="rotate(-90, 110, 90)"
                    initial={{ strokeDasharray: `0 314` }}
                    animate={{ strokeDasharray: `${(segments >= 5 ? 1 : snakeLength) * 314} 314` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                )}
                {/* Tail point */}
                {segments > 0 && (
                  <motion.circle cx="110" cy="40" r="3"
                    fill={`hsla(38, 15%, 35%, ${0.05 + t * 0.03})`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                  />
                )}
                {/* Head — follows the end of the snake */}
                {segments > 0 && (() => {
                  const angle = (segments >= 5 ? 1 : snakeLength) * 360 - 90;
                  const hx = 110 + 50 * Math.cos((angle * Math.PI) / 180);
                  const hy = 90 + 50 * Math.sin((angle * Math.PI) / 180);
                  return (
                    <motion.circle cx={hx} cy={hy} r="4"
                      fill={`hsla(38, ${18 + t * 10}%, ${32 + t * 12}%, ${0.06 + t * 0.04})`}
                      initial={{ cx: hx, cy: hy }}
                      animate={{ cx: hx, cy: hy }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  );
                })()}
                {/* Completion flash */}
                {segments >= 5 && (
                  <motion.circle cx="110" cy="90" r="55"
                    fill="none" stroke={`hsla(38, 22%, 50%, 0.04)`} strokeWidth="1"
                    initial={{ scale: 0.8, opacity: 0.08 }} animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 1.5 }}
                  />
                )}
              </svg>
            </div>
            <motion.div key={segments} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {segments === 0 ? 'The serpent begins.' : segments === 1 ? 'The head moves. Seeking.' : segments === 2 ? 'The body follows.' : segments === 3 ? 'The tail comes into view.' : segments === 4 ? 'Almost there. The mouth opens.' : 'The mouth meets the tail. Complete.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>{Array.from({ length: 5 }, (_, i) => (<div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < segments ? 'hsla(38, 22%, 50%, 0.5)' : palette.primaryFaint, opacity: i < segments ? 0.6 : 0.15 }} />))}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (<motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>The serpent swallowed its tail. The circle is complete. The ouroboros appears in Egyptian funerary texts 3,400 years ago, in Greek alchemy, in Norse cosmology: humanity's oldest symbol for the truth that endings feed beginnings.</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Kekulé dreamed of a snake eating its tail and discovered the structure of benzene. The ring shape. Completion as form. The ouroboros is not just philosophy; it is the shape of matter itself.</motion.div></motion.div>)}
        {stage === 'afterglow' && (<motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>Head. Tail. One.</motion.div>)}
      </AnimatePresence>
    </NaviCueShell>
  );
}