/**
 * FUTURIST #4 — The Doomscroll Brake
 * "The feed has no bottom. You must build the floor."
 * INTERACTION: A scrolling feed — infinite content tiles falling.
 * Each tap forges one iron bar across the screen. 5 bars form
 * a heavy gate. CLANG. The feed stops. You built the floor.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BAR_COUNT = 5;

export default function Futurist_DoomscrollBrake({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bars, setBars] = useState(0);
  const [slammed, setSlammed] = useState(false);
  const [feedItems, setFeedItems] = useState<{ id: number; y: number; w: number }[]>([]);
  const animRef = useRef<number | null>(null);
  const idRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // Scrolling feed animation
  useEffect(() => {
    if (stage !== 'active' || slammed) return;
    const tick = () => {
      setFeedItems(prev => {
        let items = prev.map(it => ({ ...it, y: it.y + 0.5 })).filter(it => it.y < 200);
        if (Math.random() < 0.06) {
          items.push({ id: idRef.current++, y: -10, w: 30 + Math.random() * 50 });
        }
        return items;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [stage, slammed]);

  const forge = () => {
    if (stage !== 'active' || bars >= BAR_COUNT || slammed) return;
    const next = bars + 1;
    setBars(next);
    if (next >= BAR_COUNT) {
      addTimer(() => {
        setSlammed(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
      }, 600);
    }
  };

  const t = bars / BAR_COUNT;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scrolling... scrolling...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I am designed to keep you here forever. I will show you infinite novelty. The feed has no bottom. You must build the floor.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to forge each iron bar</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={forge}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: bars >= BAR_COUNT || slammed ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: slammed ? 'hsla(0, 0%, 3%, 0.95)' : `hsla(220, ${3 + t * 3}%, ${5 + t * 1}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Scrolling feed items — behind the gate */}
                {!slammed && feedItems.map(it => (
                  <rect key={it.id} x={110 - it.w / 2} y={it.y} width={it.w} height="6" rx="1.5"
                    fill={`hsla(220, 6%, ${14 + Math.random() * 3}%, 0.04)`} />
                ))}

                {/* Iron bars — horizontal, rusty */}
                {Array.from({ length: bars }, (_, i) => {
                  const y = 30 + i * 30;
                  return (
                    <motion.g key={`bar-${i}`}
                      initial={{ x: -220, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0 }}>
                      {/* Bar body */}
                      <rect x="10" y={y - 2.5} width="200" height="5" rx="2"
                        fill={`hsla(25, ${12 + i * 2}%, ${18 + i * 2}%, ${0.08 + i * 0.015})`} />
                      {/* Rust texture */}
                      <rect x="10" y={y - 1} width="200" height="2" rx="1"
                        fill={`hsla(20, ${10 + i * 3}%, ${22 + i * 2}%, ${0.04 + i * 0.01})`} />
                      {/* Bolts */}
                      <circle cx="15" cy={y} r="2"
                        fill={`hsla(30, 10%, ${20 + i * 2}%, ${0.06 + i * 0.01})`} />
                      <circle cx="205" cy={y} r="2"
                        fill={`hsla(30, 10%, ${20 + i * 2}%, ${0.06 + i * 0.01})`} />
                    </motion.g>
                  );
                })}

                {/* SLAM effect */}
                {slammed && (
                  <>
                    <motion.rect x="0" y="0" width="220" height="180"
                      fill="hsla(0, 0%, 8%, 0.08)"
                      initial={{ opacity: 0.15 }} animate={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.text x="110" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(25, 15%, 42%, 0.18)" letterSpacing="3" fontWeight="700"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.18 }}
                      transition={{ delay: 0.5, duration: 1.5 }}>
                      CLANG
                    </motion.text>
                    <motion.text x="110" y="110" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                      fill="hsla(25, 10%, 35%, 0.1)" letterSpacing="1"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}
                      transition={{ delay: 1.5, duration: 1.5 }}>
                      the feed stops here
                    </motion.text>
                  </>
                )}

                {/* Algorithm voice — in corner */}
                {!slammed && bars > 0 && (
                  <motion.text x="10" y="172" fontSize="3.5" fontFamily="monospace"
                    fill={`hsla(0, ${8 + t * 8}%, ${25 + t * 5}%, ${0.04 + t * 0.03})`}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}>
                    keep scrolling... there's more...
                  </motion.text>
                )}

                {/* Status */}
                {!slammed && (
                  <text x="195" y="172" textAnchor="end" fontSize="4.5" fontFamily="monospace"
                    fill={`hsla(25, ${8 + t * 8}%, ${25 + t * 10}%, ${0.06 + t * 0.04})`}>
                    bar {bars}/{BAR_COUNT}
                  </text>
                )}
              </svg>
            </div>
            <motion.div key={`${bars}-${slammed}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {bars === 0 ? 'Infinite feed. No bottom. Content tiles falling forever.' : !slammed && bars < BAR_COUNT ? `Bar ${bars} forged. The gate is building.` : slammed ? 'CLANG. Gate slammed. Feed stopped. You built the floor.' : 'Last bar. One more tap.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BAR_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < bars ? 'hsla(25, 15%, 42%, 0.5)' : palette.primaryFaint, opacity: i < bars ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five iron bars. Rusty and heavy. The gate slammed down. CLANG. The infinite feed hit a floor it did not know existed. You built that floor. The algorithm whispered "keep scrolling," and you forged iron instead.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Intermittent variable reward. Social feeds use the same slot machine mechanic that drives addiction. Physical interruption breaks the dopamine trance. Prove you are stronger than the code.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Scroll. Iron. Floor.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}