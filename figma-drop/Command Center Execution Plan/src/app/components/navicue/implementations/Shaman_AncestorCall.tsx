/**
 * SHAMAN #1 — The Ancestor Call
 * "You are not the first to walk this path. Listen. They are still speaking."
 * ARCHETYPE: Pattern A (Tap x 5) — Smoke drifts from a central ember.
 * Each tap: an ancestral figure materializes from the smoke — faint, reverent.
 * Ancestral wisdom. Intergenerational knowledge transfer.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

const CALL_STEPS = 5;
const ANCESTORS = [
  { x: 50, y: 42, label: 'the one who endured' },
  { x: 150, y: 38, label: 'the one who built' },
  { x: 35, y: 68, label: 'the one who loved' },
  { x: 165, y: 64, label: 'the one who sacrificed' },
  { x: 100, y: 28, label: 'the one who dreamed you' },
];

export default function Shaman_AncestorCall({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [called, setCalled] = useState(0);

  const call = () => {
    if (stage !== 'active' || called >= CALL_STEPS) return;
    const next = called + 1;
    setCalled(next);
    if (next >= CALL_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = called / CALL_STEPS;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Smoke rising...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not the first to walk this path. Listen. They are still speaking. The smoke carries their voices.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to call each ancestor from the smoke</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={call}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: called >= CALL_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Central ember */}
                <motion.circle cx="100" cy="130" r={3 + t * 2}
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.04, 15)}
                  animate={{ r: [3 + t * 2, 4 + t * 2, 3 + t * 2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Ember glow */}
                <circle cx="100" cy="130" r={10 + t * 5}
                  fill={themeColor(TH.primaryHSL, 0.02 + t * 0.01, 8)} />

                {/* Smoke columns — always drifting */}
                {Array.from({ length: 6 }, (_, i) => (
                  <motion.path key={i}
                    d={`M ${88 + i * 5},130 Q ${85 + i * 5 + Math.sin(i) * 8},${80 - i * 8} ${90 + i * 4},${30 + i * 3}`}
                    fill="none"
                    stroke={themeColor(TH.primaryHSL, 0.02 + t * 0.008, 6)}
                    strokeWidth={0.5 + t * 0.3}
                    strokeLinecap="round"
                    animate={{ opacity: [0.02, 0.03, 0.02] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
                  />
                ))}

                {/* Ancestor figures — emerge from smoke */}
                {ANCESTORS.map((anc, i) => {
                  if (i >= called) return null;
                  return (
                    <motion.g key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: safeOpacity(0.06 + (called - i) * 0.012), y: 0 }}
                      transition={{ type: 'spring', stiffness: 20, damping: 8 }}>
                      {/* Smoke aura */}
                      <circle cx={anc.x} cy={anc.y} r="14"
                        fill={themeColor(TH.primaryHSL, 0.015, 5)} />
                      {/* Head */}
                      <circle cx={anc.x} cy={anc.y - 4} r="4"
                        fill={themeColor(TH.primaryHSL, 0.04 + i * 0.005, 10 + i * 2)} />
                      {/* Body — flowing, ghost-like */}
                      <path d={`M ${anc.x - 5},${anc.y + 1} Q ${anc.x},${anc.y + 18} ${anc.x + 5},${anc.y + 1}`}
                        fill={themeColor(TH.primaryHSL, 0.03 + i * 0.004, 8 + i)}
                        stroke="none" />
                      {/* Label */}
                      <text x={anc.x} y={anc.y + 26} textAnchor="middle" fontSize="11" fontFamily="Georgia, serif" fontStyle="italic"
                        fill={themeColor(TH.accentHSL, 0.05, 10)}>
                        {anc.label}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Convergence glow */}
                {called >= CALL_STEPS && (
                  <motion.circle cx="100" cy="70" r="50"
                    fill={themeColor(TH.primaryHSL, 0.02, 8)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                    transition={{ duration: 2.5 }}
                  />
                )}

                <text x="100" y="152" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'ALL CALLED. they stand with you' : `ancestors: ${called}/${CALL_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {called === 0 ? 'An ember. Smoke drifting upward. Silence.' : called < CALL_STEPS ? `"${ANCESTORS[called - 1].label}" emerges from the smoke.` : 'Five ancestors. All present. They stand with you.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: CALL_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < called ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five calls into the smoke. They came: the one who endured, who built, who loved, who sacrificed, and the one who dreamed you into existence. You are not the first. You carry their strength in your bones. Listen. They are still speaking.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Intergenerational knowledge transfer. Connecting to ancestral lineage activates narrative identity resources, providing resilience through the sense of being part of a larger story.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Smoke. Voice. Ancestor.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}