/**
 * ORACLE #8 — The Pre-Mortem
 * "Imagine you failed. Now prevent it."
 * ARCHETYPE: Pattern A (Tap × 5) — A timeline forward. Each tap places a
 * failure flag, then a shield patches it. Prospective Hindsight.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FAIL_POINTS = [
  { x: 45, label: 'overconfidence' },
  { x: 85, label: 'bottleneck' },
  { x: 125, label: 'blind spot' },
  { x: 165, label: 'burnout' },
  { x: 205, label: 'complacency' },
];

export default function Oracle_PreMortem({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [patched, setPatched] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const patch = () => {
    if (stage !== 'active' || patched >= FAIL_POINTS.length) return;
    const next = patched + 1;
    setPatched(next);
    if (next >= FAIL_POINTS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = patched / FAIL_POINTS.length;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Imagine the failure...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The project failed. It is six months from now. Why did it fail? Work backward. Spot each failure point. Patch it before it happens.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to identify and patch each failure point</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={patch}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: patched >= FAIL_POINTS.length ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '240px', height: '120px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 120" style={{ position: 'absolute', inset: 0 }}>
                {/* Timeline */}
                <line x1="20" y1="55" x2="225" y2="55"
                  stroke={themeColor(TH.primaryHSL, 0.05, 10)} strokeWidth="0.5" />
                <text x="15" y="60" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.04, 8)}>NOW</text>
                <text x="220" y="60" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.04, 8)} textAnchor="end">+6mo</text>

                {/* Failure points → shields */}
                {FAIL_POINTS.map((fp, i) => {
                  const isPatched = i < patched;
                  return (
                    <g key={i}>
                      {/* Failure flag */}
                      {!isPatched ? (
                        <g>
                          <line x1={fp.x} y1="55" x2={fp.x} y2="30"
                            stroke="hsla(0, 18%, 30%, 0.06)" strokeWidth="0.5" />
                          <polygon points={`${fp.x},30 ${fp.x + 8},34 ${fp.x},38`}
                            fill="hsla(0, 18%, 30%, 0.06)" />
                          <text x={fp.x} y="25" textAnchor="middle" fontSize="11" fontFamily="monospace"
                            fill="hsla(0, 12%, 30%, 0.05)">{fp.label}</text>
                        </g>
                      ) : (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 100 }}>
                          {/* Shield */}
                          <polygon points={`${fp.x},28 ${fp.x + 7},33 ${fp.x + 5},42 ${fp.x - 5},42 ${fp.x - 7},33`}
                            fill={themeColor(TH.accentHSL, 0.08 + i * 0.01, 15)}
                            stroke={themeColor(TH.accentHSL, 0.06, 12)} strokeWidth="0.3" />
                          <text x={fp.x} y="37" textAnchor="middle" fontSize="11"
                            fill={themeColor(TH.accentHSL, 0.12, 18)}>✓</text>
                          <text x={fp.x} y="52" textAnchor="middle" fontSize="11" fontFamily="monospace"
                            fill={themeColor(TH.accentHSL, 0.06, 10)}>{fp.label}</text>
                        </motion.g>
                      )}

                      {/* Timeline tick */}
                      <line x1={fp.x} y1="53" x2={fp.x} y2="57"
                        stroke={themeColor(TH.primaryHSL, 0.04, 8)} strokeWidth="0.3" />
                    </g>
                  );
                })}

                {/* Success marker at end */}
                {t >= 1 && (
                  <motion.circle cx="225" cy="55" r="6"
                    fill={themeColor(TH.accentHSL, 0.08, 15)}
                    stroke={themeColor(TH.accentHSL, 0.06, 12)} strokeWidth="0.3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                )}

                {/* Progress bar */}
                <rect x="20" y="80" width="200" height="3" rx="1.5"
                  fill={themeColor(TH.primaryHSL, 0.03)} />
                <motion.rect x="20" y="80" width={200 * t} height="3" rx="1.5"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.06, 15)}
                  animate={{ width: 200 * t }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                <text x="120" y="100" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'ALL PATCHED. failure prevented' : `patched: ${patched}/${FAIL_POINTS.length}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {patched === 0 ? 'Five failure points on the timeline. Unpatched.' : patched < FAIL_POINTS.length ? `Patched: ${FAIL_POINTS[patched - 1].label}. ${FAIL_POINTS.length - patched} vulnerabilities remain.` : 'All five patched. The timeline is armored. Success likely.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: FAIL_POINTS.length }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < patched ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five failure points identified. Overconfidence, patched. Bottleneck, patched. Blind spot, patched. Burnout, patched. Complacency, patched. Five flags became five shields. The timeline is armored. You imagined the failure, then prevented it. That is oracle-level thinking.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Prospective hindsight. Pre-mortem analysis increases the ability to identify reasons for a future outcome by 30%, making failure prevention dramatically more effective than post-mortem regret.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Fail. Flag. Shield.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}