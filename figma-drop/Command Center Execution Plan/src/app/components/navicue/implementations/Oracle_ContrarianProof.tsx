/**
 * ORACLE #9 — The Contrarian Proof
 * "If everyone agrees, something is wrong."
 * ARCHETYPE: Pattern A (Tap × 5) — Consensus arrows all pointing one way.
 * Each tap rotates one arrow against the grain. At 5: one arrow glows — yours.
 * Groupthink Antidote.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ARROW_COUNT = 15;
const BREAK_STEPS = 5;

export default function Oracle_ContrarianProof({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [broken, setBroken] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const breakFree = () => {
    if (stage !== 'active' || broken >= BREAK_STEPS) return;
    const next = broken + 1;
    setBroken(next);
    if (next >= BREAK_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = broken / BREAK_STEPS;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Everyone agrees...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>If everyone agrees, something is wrong. The herd is comforting but rarely correct at the edges. Break from consensus. Think what no one else is willing to think.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to turn arrows against the grain</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={breakFree}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: broken >= BREAK_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Grid of arrows */}
                {Array.from({ length: ARROW_COUNT }, (_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const cx = 30 + col * 35;
                  const cy = 30 + row * 35;
                  // First `broken` arrows point opposite (left)
                  const isContrarian = i < broken;
                  const angle = isContrarian ? 180 : 0;

                  return (
                    <motion.g key={i}
                      animate={{ rotate: angle }}
                      transition={{ type: 'spring', stiffness: 60, damping: 12 }}
                      style={{ transformOrigin: `${cx}px ${cy}px` }}>
                      {/* Arrow shaft */}
                      <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy}
                        stroke={isContrarian
                          ? themeColor(TH.accentHSL, 0.1 + t * 0.05, 15)
                          : themeColor(TH.primaryHSL, 0.05, 10)
                        }
                        strokeWidth={isContrarian ? 1 : 0.5}
                        strokeLinecap="round" />
                      {/* Arrow head */}
                      <polygon points={`${cx + 8},${cy} ${cx + 4},${cy - 3} ${cx + 4},${cy + 3}`}
                        fill={isContrarian
                          ? themeColor(TH.accentHSL, 0.1 + t * 0.05, 15)
                          : themeColor(TH.primaryHSL, 0.05, 10)
                        } />
                      {/* Contrarian glow */}
                      {isContrarian && (
                        <circle cx={cx} cy={cy} r="12"
                          fill={themeColor(TH.accentHSL, 0.02, 10)} />
                      )}
                    </motion.g>
                  );
                })}

                {/* "YOUR ARROW" label at completion */}
                {t >= 1 && (
                  <motion.text x="100" y="148" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold"
                    fill={themeColor(TH.accentHSL, 0.12, 18)} letterSpacing="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ delay: 0.5, duration: 1.5 }}>
                    CONTRARIAN = CORRECT
                  </motion.text>
                )}
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {broken === 0 ? 'Fifteen arrows. All pointing right. Perfect consensus.' : broken < BREAK_STEPS ? `${broken} arrow${broken > 1 ? 's' : ''} turned. Breaking from the herd.` : 'Five arrows reversed. The contrarian signal glows.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: BREAK_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < broken ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Fifteen arrows, all pointing right: unanimous consensus. Five taps, five arrows reversed, glowing, pointing left. Against the grain. The contrarian proof: if everyone agrees, something is wrong. The herd is comforting but blind at the edges. Your edge is the willingness to think what no one else will.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Groupthink antidote. Designated dissent improves decision quality by forcing consideration of alternative scenarios that conformity pressure suppresses.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Herd. Break. Contrarian.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}