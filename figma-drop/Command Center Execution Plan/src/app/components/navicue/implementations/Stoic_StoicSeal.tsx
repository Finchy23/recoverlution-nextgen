/**
 * STOIC #10 — The Stoic Seal (The Proof)
 * "You have power over your mind, not outside events. Realize this,
 *  and you will find strength."
 * INTERACTION: An iron stamp hovering above stone. Each tap drives
 * it down — pressure building. Final tap: the stamp presses into
 * stone, leaving the mark "I ENDURED" embossed. Self-efficacy forged.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PRESS_STEPS = 5;

export default function Stoic_StoicSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pressed, setPressed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const press = () => {
    if (stage !== 'active' || pressed >= PRESS_STEPS) return;
    const next = pressed + 1;
    setPressed(next);
    if (next >= PRESS_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    }
  };

  const t = pressed / PRESS_STEPS;
  const stampY = 30 + t * 50; // descends from 30 to 80
  const stoneY = 95;
  const sealed = t >= 1;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Iron and stone...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You have power over your mind, not outside events. Realize this, and you will find strength.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to drive the stamp into stone</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={press}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: pressed >= PRESS_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 8%, 7%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Stone slab */}
                <rect x="30" y={stoneY} width="140" height="40" rx="3"
                  fill={`hsla(25, 6%, ${15 + t * 3}%, ${0.12 + t * 0.06})`}
                  stroke="hsla(25, 5%, 22%, 0.15)" strokeWidth="0.5" />
                {/* Stone grain */}
                {Array.from({ length: 8 }, (_, i) => (
                  <line key={i}
                    x1={35 + i * 16} y1={stoneY + 3}
                    x2={38 + i * 16} y2={stoneY + 37}
                    stroke="hsla(25, 4%, 18%, 0.1)" strokeWidth="0.3" />
                ))}

                {/* Iron stamp — descending */}
                <motion.g
                  animate={{ y: stampY - 30 }}
                  transition={{ type: 'spring', stiffness: sealed ? 200 : 80, damping: sealed ? 12 : 15 }}>
                  {/* Stamp handle */}
                  <rect x="85" y="10" width="30" height="12" rx="2"
                    fill={`hsla(210, ${8 + t * 5}%, ${20 + t * 5}%, ${0.15 + t * 0.1})`}
                    stroke="hsla(210, 8%, 28%, 0.08)" strokeWidth="0.5" />
                  {/* Stamp body */}
                  <rect x="75" y="22" width="50" height="20" rx="2"
                    fill={`hsla(210, ${6 + t * 4}%, ${18 + t * 4}%, ${0.18 + t * 0.1})`}
                    stroke="hsla(210, 8%, 25%, 0.08)" strokeWidth="0.5" />
                  {/* Stamp face — reversed text */}
                  <rect x="78" y="38" width="44" height="10" rx="1"
                    fill={`hsla(210, ${8 + t * 6}%, ${15 + t * 3}%, ${0.12 + t * 0.08})`} />
                  {/* Stamp text (mirrored on face) */}
                  <text x="100" y="46" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(210, 8%, 30%, ${0.1 + t * 0.08})`}
                    style={{ transform: 'scaleX(-1)', transformOrigin: '100px 46px' }}>
                    I ENDURED
                  </text>
                </motion.g>

                {/* Embossed mark in stone — appears when sealed */}
                {sealed && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    {/* Impression border */}
                    <rect x="72" y={stoneY + 8} width="56" height="18" rx="2"
                      fill="hsla(210, 8%, 12%, 0.06)"
                      stroke="hsla(210, 8%, 25%, 0.08)" strokeWidth="0.4" />
                    {/* Embossed text */}
                    <text x="100" y={stoneY + 20} textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(210, 10%, 35%, 0.3)" letterSpacing="1.5" fontWeight="500">
                      I ENDURED
                    </text>
                  </motion.g>
                )}

                {/* Pressure lines — visual force */}
                {t > 0 && t < 1 && Array.from({ length: 3 }, (_, i) => (
                  <line key={`p${i}`}
                    x1={80 + i * 20} y1={stampY + 22}
                    x2={80 + i * 20} y2={stampY + 22 + 8 * t}
                    stroke={`hsla(210, 8%, 30%, ${0.04 * t})`} strokeWidth="0.3" strokeDasharray="1 2" />
                ))}

                {/* Impact flash */}
                {sealed && (
                  <motion.rect x="65" y={stoneY - 2} width="70" height="5" rx="2"
                    fill="hsla(210, 10%, 40%, 0.03)"
                    initial={{ opacity: 0.1 }} animate={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  />
                )}
              </svg>
            </div>
            <motion.div key={pressed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {pressed === 0 ? 'Iron hovers. Stone waits.' : pressed < PRESS_STEPS ? `Pressing... ${Math.floor(t * 100)}% force.` : 'Sealed. I endured.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PRESS_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < pressed ? 'hsla(210, 10%, 38%, 0.45)' : palette.primaryFaint, opacity: i < pressed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Iron into stone. The mark permanent. I endured. Power over the mind. Strength found.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Self-efficacy. The belief in your capacity to execute. Built not from affirmation but from mastering difficulty. The seal is proof.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Iron. Stone. Endured.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}