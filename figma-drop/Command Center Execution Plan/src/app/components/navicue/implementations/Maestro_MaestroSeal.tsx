/**
 * MAESTRO #10 — The Maestro Seal (The Proof)
 * "I am the conductor. The world is the orchestra."
 * ARCHETYPE: Pattern A (Tap × 5) — A baton at center.
 * Each tap = one section of the orchestra joins: strings, winds, brass, percussion, full.
 * Convergent control. One gesture, infinite sound.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

const JOIN_STEPS = 5;
const SECTIONS = [
  { label: 'strings', hue: 0, arc: 'M 60,120 Q 40,90 60,60', count: 8 },
  { label: 'woodwinds', hue: 120, arc: 'M 80,120 Q 60,85 80,50', count: 6 },
  { label: 'brass', hue: 45, arc: 'M 140,120 Q 160,85 140,50', count: 5 },
  { label: 'percussion', hue: 280, arc: 'M 160,120 Q 180,90 160,60', count: 4 },
  { label: 'FULL ORCHESTRA', hue: 45, arc: '', count: 0 },
];

export default function Maestro_MaestroSeal({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [joined, setJoined] = useState(0);

  const conduct = () => {
    if (stage !== 'active' || joined >= JOIN_STEPS) return;
    const next = joined + 1;
    setJoined(next);
    if (next >= JOIN_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = joined / JOIN_STEPS;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The baton rises...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>I am the conductor. The world is the orchestra. One gesture. Infinite sound.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to conduct, each section joins</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={conduct}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: joined >= JOIN_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 5) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Stage semicircle */}
                <path d="M 30,130 Q 110,100 190,130"
                  fill={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 8)}
                  stroke={themeColor(TH.primaryHSL, 0.04, 10)} strokeWidth="0.3" />

                {/* Orchestra sections — appear as conducted */}
                {SECTIONS.slice(0, 4).map((section, si) => {
                  const active = si < joined;
                  if (!active) return null;
                  const isLeft = si < 2;
                  const baseX = isLeft ? 35 + si * 30 : 135 + (si - 2) * 30;
                  return (
                    <motion.g key={si}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 60 }}>
                      {/* Sound waves emanating from section */}
                      {[0, 1, 2].map(w => (
                        <motion.path key={w}
                          d={section.arc}
                          fill="none"
                          stroke={`hsla(${section.hue}, ${12 + si * 3}%, ${25 + si * 4}%, ${0.03 - w * 0.008})`}
                          strokeWidth={0.4}
                          strokeDasharray="2 2"
                          transform={`scale(${1 + w * 0.15})`}
                          style={{ transformOrigin: `${baseX + 15}px 90px` }}
                        />
                      ))}
                      {/* Section musicians */}
                      {Array.from({ length: section.count }, (_, mi) => {
                        const mx = baseX + (mi % 4) * 10;
                        const my = 108 + Math.floor(mi / 4) * 12;
                        return (
                          <g key={mi}>
                            <circle cx={mx} cy={my - 3} r="2"
                              fill={`hsla(${section.hue}, 8%, 22%, 0.06)`} />
                            <rect x={mx - 1} y={my - 1} width="2" height="4" rx="0.5"
                              fill={`hsla(${section.hue}, 6%, 18%, 0.04)`} />
                          </g>
                        );
                      })}
                      {/* Label */}
                      <text x={baseX + 15} y={130} textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={`hsla(${section.hue}, 10%, 35%, 0.06)`}>
                        {section.label}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Conductor (you) — center front */}
                <motion.g
                  initial={{ rotate: 0 }}
                  animate={joined > 0 ? { rotate: [0, -8, 5, -3, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: '110px 70px' }}>
                  {/* Conductor body */}
                  <circle cx="110" cy="55" r="4"
                    fill={themeColor(TH.accentHSL, 0.12 + t * 0.06, 18)} />
                  <rect x="107" y="59" width="6" height="10" rx="1.5"
                    fill={themeColor(TH.accentHSL, 0.1 + t * 0.04, 15)} />
                  {/* Baton */}
                  <motion.line x1="116" y1="62" x2={130 + t * 5} y2={48 - t * 5}
                    stroke={themeColor(TH.accentHSL, 0.14 + t * 0.06, 22)}
                    strokeWidth={0.8 + t * 0.3}
                    strokeLinecap="round"
                  />
                  {/* Baton tip glow */}
                  <motion.circle cx={130 + t * 5} cy={48 - t * 5} r={1.5 + t * 1.5}
                    fill={themeColor(TH.accentHSL, 0.06 + t * 0.06, 20)}
                    initial={{ r: 1.5 }}
                    animate={{ r: [1.5 + t * 1.5, 2.5 + t * 1.5, 1.5 + t * 1.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.g>

                {/* Full orchestra convergence glow */}
                {joined >= JOIN_STEPS && (
                  <motion.ellipse cx="110" cy="90" rx="80" ry="40"
                    fill={themeColor(TH.accentHSL, 0.03, 12)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="110" y="152" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'FULL ORCHESTRA. one gesture, infinite sound' : `sections: ${Math.min(joined, 4)}/${4}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {joined === 0 ? 'A conductor stands alone. Baton raised. Silence.' : joined < JOIN_STEPS ? `${SECTIONS[joined - 1].label} joined. The sound deepens.` : 'Full orchestra. All sections. One baton. Infinite sound.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: JOIN_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < joined ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five gestures. Strings entered first, soaring. Then woodwinds, brass, percussion. At the fifth gesture: the full orchestra. One baton, one conductor, and a hundred instruments playing as one. I am the conductor. The world is the orchestra. One gesture. Infinite sound.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Convergent control. The conductor holds no instrument but shapes all sound. Mastery is not doing everything. It is orchestrating everything through presence and precise gestures.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Baton. Section. Orchestra.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}