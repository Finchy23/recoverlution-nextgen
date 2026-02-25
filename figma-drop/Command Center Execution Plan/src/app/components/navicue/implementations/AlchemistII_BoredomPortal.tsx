/**
 * ALCHEMIST II #5 -- The Boredom Portal
 * "Boredom is the threshold of creativity. Do not pick up the phone."
 * INTERACTION: A flat grey wall. Tap to resist distraction. After
 * enough resisting, a door materializes in the wall and opens --
 * behind it, light and possibility. Default Mode activated.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const WAIT_STEPS = 5;

export default function AlchemistII_BoredomPortal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [patience, setPatience] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const resist = () => {
    if (stage !== 'active' || patience >= WAIT_STEPS) return;
    const next = patience + 1;
    setPatience(next);
    if (next >= WAIT_STEPS) {
      addTimer(() => setDoorOpen(true), 800);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3500);
    }
  };

  const p = patience / WAIT_STEPS;
  const doorOutline = p > 0.4;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Nothing happening...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Boredom is the threshold of creativity. Do not pick up the phone. Walk through the door.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to resist the urge</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resist}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: patience >= WAIT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(0, 0%, ${12 + p * 3}%, 0.25)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Grey wall -- bricks */}
                {Array.from({ length: 8 }, (_, row) =>
                  Array.from({ length: 5 }, (_, col) => (
                    <rect key={`${row}-${col}`}
                      x={col * 44 + (row % 2 ? 22 : 0)} y={row * 20}
                      width="42" height="18" rx="1"
                      fill={`hsla(0, 0%, ${18 + Math.random() * 4}%, ${0.3 - p * 0.15})`}
                      stroke={`hsla(0, 0%, 15%, ${0.15 - p * 0.08})`}
                      strokeWidth="0.5"
                    />
                  ))
                )}
                {/* Door outline -- appears as patience grows */}
                {doorOutline && (
                  <motion.rect x="75" y="20" width="70" height="130" rx="3"
                    fill="none"
                    stroke={`hsla(45, 30%, 50%, ${(p - 0.4) * 0.5})`}
                    strokeWidth="1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: (p - 0.4) * 0.6 }}
                    transition={{ duration: 1 }}
                  />
                )}
                {/* Door handle */}
                {p > 0.6 && (
                  <motion.circle cx="135" cy="85" r="3"
                    fill={`hsla(45, 40%, 55%, ${(p - 0.6) * 0.6})`}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                  />
                )}
                {/* Door opening -- light behind */}
                {doorOpen && (
                  <motion.g>
                    <motion.rect x="76" y="21" width="68" height="128" rx="2"
                      fill="hsla(45, 40%, 65%, 0.15)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                      transition={{ duration: 1.5 }}
                    />
                    {/* Light rays from the open door */}
                    {[0, 1, 2].map(i => (
                      <motion.line key={i}
                        x1={90 + i * 15} y1="40" x2={70 + i * 20} y2="0"
                        stroke={`hsla(45, 40%, 65%, 0.06)`} strokeWidth="3"
                        initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                        transition={{ delay: 0.5 + i * 0.3, duration: 1 }}
                      />
                    ))}
                    {/* Warm glow */}
                    <motion.ellipse cx="110" cy="80" rx="40" ry="60"
                      fill="hsla(45, 40%, 60%, 0.05)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                      transition={{ duration: 2 }}
                    />
                  </motion.g>
                )}
              </svg>
              {/* Temptation text (fading) */}
              {!doorOpen && patience < WAIT_STEPS && (
                <motion.div
                  animate={{ opacity: [0.08, 0.15, 0.08] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center', fontSize: '11px', color: 'hsla(0, 0%, 40%, 0.2)', fontFamily: 'monospace' }}>
                  {patience < 2 ? 'check your phone?' : patience < 4 ? 'still boring...' : 'almost...'}
                </motion.div>
              )}
            </div>
            <motion.div key={patience} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {patience === 0 ? 'A grey wall. Nothing happening.' : !doorOpen ? `Resisted ${patience}×. Patience building...` : 'The door opened. Walk through.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: WAIT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < patience ? 'hsla(45, 30%, 50%, 0.5)' : palette.primaryFaint, opacity: i < patience ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The door was always there. You just had to be bored enough to see it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Default mode network activated. Mind wandered without distraction. Creativity unlocked.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Bored. Waited. Found the door.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}