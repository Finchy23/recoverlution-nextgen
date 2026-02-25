/**
 * MAESTRO #6 — The Mirror Match
 * "People trust those who move like them. Match the dance, then lead."
 * ARCHETYPE: Pattern A (Tap × 5) — Two figures: one moves, one mirrors.
 * Each tap synchronizes another body parameter. At 5: perfect sync.
 * Then figure A leads. Limbic synchrony.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

const SYNC_STEPS = 5;
const PARAMS = ['posture', 'gesture', 'breathing', 'rhythm', 'energy'];

export default function Maestro_MirrorMatch({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [synced, setSynced] = useState(0);

  const sync = () => {
    if (stage !== 'active' || synced >= SYNC_STEPS) return;
    const next = synced + 1;
    setSynced(next);
    if (next >= SYNC_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = synced / SYNC_STEPS;
  const bobA = Math.sin(Date.now() / 600) * 3;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two figures, out of sync...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>People trust those who move like them. Match the dance, then lead. Synchronize first. Lead second. Pace, then lead.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to synchronize each parameter</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={sync}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: synced >= SYNC_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Figure A */}
                <motion.g initial={{ y: 0 }} animate={{ y: bobA }} transition={{ duration: 0.6 }}>
                  <circle cx="70" cy="45" r="8" fill={themeColor(TH.accentHSL, 0.06 + t * 0.04, 12)} />
                  <rect x="62" y="55" width="16" height="25" rx="3" fill={themeColor(TH.accentHSL, 0.05 + t * 0.03, 10)} />
                  <line x1="62" y1="60" x2={52 - t * 5} y2={68 - t * 3} stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 10)} strokeWidth="2" strokeLinecap="round" />
                  <line x1="78" y1="60" x2={88 + t * 5} y2={68 - t * 3} stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 10)} strokeWidth="2" strokeLinecap="round" />
                  <line x1="66" y1="80" x2="60" y2="105" stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 10)} strokeWidth="2" strokeLinecap="round" />
                  <line x1="74" y1="80" x2="80" y2="105" stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 10)} strokeWidth="2" strokeLinecap="round" />
                  <text x="70" y="118" textAnchor="middle" fontSize="11" fontFamily="monospace" fill={themeColor(TH.accentHSL, 0.06, 12)}>YOU</text>
                </motion.g>

                {/* Figure B — progressively mirrors A */}
                <motion.g initial={{ y: 0 }} animate={{ y: t > 0.1 ? bobA * t : bobA * 0.2 * (Math.random() - 0.5) }} transition={{ duration: 0.6, delay: 0.3 * (1 - t) }}>
                  <circle cx="150" cy="45" r="8" fill={themeColor(TH.primaryHSL, 0.04 + t * 0.03, 10)} />
                  <rect x="142" y="55" width="16" height="25" rx="3" fill={themeColor(TH.primaryHSL, 0.035 + t * 0.025, 8)} />
                  <line x1="142" y1="60" x2={132 + (1 - t) * 5} y2={68 + (1 - t) * 8} stroke={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 8)} strokeWidth="2" strokeLinecap="round" />
                  <line x1="158" y1="60" x2={168 - (1 - t) * 5} y2={68 + (1 - t) * 8} stroke={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 8)} strokeWidth="2" strokeLinecap="round" />
                  <line x1="146" y1="80" x2={140 + (1 - t) * 5} y2="105" stroke={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 8)} strokeWidth="2" strokeLinecap="round" />
                  <line x1="154" y1="80" x2={160 - (1 - t) * 5} y2="105" stroke={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 8)} strokeWidth="2" strokeLinecap="round" />
                  <text x="150" y="118" textAnchor="middle" fontSize="11" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.05, 10)}>THEM</text>
                </motion.g>

                {/* Sync connection line */}
                {t > 0.2 && (
                  <motion.line x1="78" y1="55" x2="142" y2="55"
                    stroke={themeColor(TH.accentHSL, t * 0.04, 12)}
                    strokeWidth="0.4" strokeDasharray={`${t * 4} 2`}
                    initial={{ opacity: 0 }} animate={{ opacity: t * 0.04 }}
                  />
                )}

                {/* Sync % */}
                <text x="110" y="65" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.06, 15)}>
                  {Math.round(t * 100)}%
                </text>
                <text x="110" y="73" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.04 + t * 0.02, 10)}>sync</text>

                {/* Synced parameters */}
                {PARAMS.slice(0, synced).map((param, i) => (
                  <motion.text key={i} x="110" y={88 + i * 8} textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.05, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.05 }}>
                    ✓ {param}
                  </motion.text>
                ))}

                <text x="110" y="135" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'LOCKED. now you lead' : `matching: ${synced}/${SYNC_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {synced === 0 ? 'Two figures. Out of sync. Different rhythms.' : synced < SYNC_STEPS ? `${PARAMS[synced - 1]} matched. ${SYNC_STEPS - synced} parameters remaining.` : 'Perfect sync. Now shift, and they follow you.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: SYNC_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < synced ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five parameters synchronized: posture, gesture, breathing, rhythm, energy. The figures moved as one. Then: you shifted, and they followed. Match the dance first. Then lead it. People trust those who move like them. Pace, then lead.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Limbic synchrony. Mirror neurons fire both when performing and observing the same action. Matching creates unconscious rapport, enabling subsequent leadership.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Match. Sync. Lead.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}