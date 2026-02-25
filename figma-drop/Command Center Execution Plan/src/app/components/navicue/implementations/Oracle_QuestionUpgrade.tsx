/**
 * ORACLE #7 — The Question Upgrade
 * "The quality of your life is determined by the quality of your questions."
 * ARCHETYPE: Pattern A (Tap × 5) — Weak questions on screen.
 * Each tap rewrites a question. Weak → powerful. Socratic Method.
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

const QS = [
  { weak: 'Why me?', strong: 'What is this teaching me?' },
  { weak: 'What if I fail?', strong: 'What if I fly?' },
  { weak: 'Why can\'t I?', strong: 'How might I?' },
  { weak: 'Who\'s to blame?', strong: 'What can I control?' },
  { weak: 'Is this possible?', strong: 'What would make this inevitable?' },
];

export default function Oracle_QuestionUpgrade({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [upgraded, setUpgraded] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const upgrade = () => {
    if (stage !== 'active' || upgraded >= QS.length) return;
    const next = upgraded + 1;
    setUpgraded(next);
    if (next >= QS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = upgraded / QS.length;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Wrong questions...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The quality of your life is determined by the quality of your questions. Upgrade the question, upgrade the answer.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to upgrade each question</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={upgrade}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: upgraded >= QS.length ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '240px', height: '150px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 150" style={{ position: 'absolute', inset: 0 }}>
                {QS.map((q, i) => {
                  const done = i < upgraded;
                  const y = 20 + i * 24;
                  return (
                    <g key={i}>
                      {/* Weak question */}
                      <text x="20" y={y} fontSize="11" fontFamily="Georgia, serif"
                        fill={themeColor(TH.primaryHSL, done ? 0.03 : 0.07, done ? 8 : 14)}
                        textDecoration={done ? 'line-through' : 'none'}>
                        {q.weak}
                      </text>
                      {/* Arrow + strong question */}
                      {done && (
                        <motion.g initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}>
                          <text x="90" y={y} fontSize="11" fill={themeColor(TH.accentHSL, 0.06, 10)}>→</text>
                          <text x="100" y={y} fontSize="11" fontFamily="Georgia, serif" fontWeight="600"
                            fontStyle="italic" fill={themeColor(TH.accentHSL, 0.12, 18)}>
                            {q.strong}
                          </text>
                        </motion.g>
                      )}
                    </g>
                  );
                })}

                {/* Upgrade arrow indicator */}
                {upgraded < QS.length && (
                  <motion.polygon
                    points={`8,${14 + upgraded * 24} 14,${17 + upgraded * 24} 8,${20 + upgraded * 24}`}
                    fill={themeColor(TH.accentHSL, 0.08, 12)}
                    initial={{ y: 0 }}
                    animate={{ y: 0 }}
                  />
                )}

                <text x="120" y="145" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'ALL UPGRADED. ask better, live better' : `upgraded: ${upgraded}/${QS.length}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {upgraded === 0 ? 'Five weak questions. Victim language. Closed doors.' : upgraded < QS.length ? `"${QS[upgraded - 1].weak}" → "${QS[upgraded - 1].strong}"` : 'All five upgraded. Open doors everywhere.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: QS.length }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < upgraded ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five upgrades. "Why me?" → "What is this teaching me?" "What if I fail?" → "What if I fly?" "Why can't I?" → "How might I?" "Who's to blame?" → "What can I control?" "Is this possible?" → "What would make this inevitable?" The quality of your questions determines the quality of your answers.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The Socratic method. Questioning assumptions reframes the problem space, redirecting attention from helplessness to agency and from threat to opportunity.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Weak. Upgrade. Fly.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}