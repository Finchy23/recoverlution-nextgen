/**
 * SHAMAN #5 — The Bone Reading
 * "Scatter the bones. The pattern is already there. You just need eyes to see it."
 * ARCHETYPE: Pattern A (Tap x 5) — Bones scatter randomly.
 * Each tap: a connection line appears between bones, forming a constellation of meaning.
 * Apophenia as tool. Pattern recognition in chaos.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

const READ_STEPS = 5;
const BONES = [
  { x: 45, y: 50, angle: 35, len: 18 },
  { x: 130, y: 42, angle: -20, len: 22 },
  { x: 80, y: 95, angle: 60, len: 16 },
  { x: 155, y: 90, angle: -45, len: 20 },
  { x: 100, y: 60, angle: 10, len: 24 },
  { x: 60, y: 120, angle: -30, len: 14 },
  { x: 140, y: 115, angle: 50, len: 17 },
];
const CONNECTIONS = [
  [0, 4], [4, 1], [0, 2], [2, 3], [3, 1], [2, 5], [3, 6], [5, 6], [4, 2], [4, 3],
];
const READINGS = [
  'endurance meets change',
  'sacrifice feeds purpose',
  'the wound becomes the gift',
  'what was lost returns transformed',
  'the pattern was always there',
];

export default function Shaman_BoneReading({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [reads, setReads] = useState(0);

  const read = () => {
    if (stage !== 'active' || reads >= READ_STEPS) return;
    const next = reads + 1;
    setReads(next);
    if (next >= READ_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = reads / READ_STEPS;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Bones scattered...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Scatter the bones. The pattern is already there. You just need eyes to see it. Look again. The connections reveal the reading.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to read each connection</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={read}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: reads >= READ_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Earth/cloth texture */}
                <rect x="20" y="20" width="160" height="120" rx="4"
                  fill={themeColor(TH.primaryHSL, 0.02, 3)}
                  stroke={themeColor(TH.primaryHSL, 0.03, 6)} strokeWidth="0.3" />

                {/* Bones */}
                {BONES.map((bone, i) => {
                  const rad = bone.angle * Math.PI / 180;
                  const x1 = bone.x - Math.cos(rad) * bone.len / 2;
                  const y1 = bone.y - Math.sin(rad) * bone.len / 2;
                  const x2 = bone.x + Math.cos(rad) * bone.len / 2;
                  const y2 = bone.y + Math.sin(rad) * bone.len / 2;
                  return (
                    <g key={i}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={themeColor(TH.primaryHSL, 0.06 + t * 0.02, 12 + t * 5)}
                        strokeWidth={1.8}
                        strokeLinecap="round"
                      />
                      {/* Joint knobs */}
                      <circle cx={x1} cy={y1} r="2"
                        fill={themeColor(TH.primaryHSL, 0.05 + t * 0.015, 10)} />
                      <circle cx={x2} cy={y2} r="2"
                        fill={themeColor(TH.primaryHSL, 0.05 + t * 0.015, 10)} />
                    </g>
                  );
                })}

                {/* Connection lines — revealed with each read */}
                {CONNECTIONS.slice(0, reads * 2).map(([a, b], ci) => (
                  <motion.line key={`conn-${ci}`}
                    x1={BONES[a].x} y1={BONES[a].y}
                    x2={BONES[b].x} y2={BONES[b].y}
                    stroke={themeColor(TH.accentHSL, 0.05 + ci * 0.003, 12)}
                    strokeWidth="0.4"
                    strokeDasharray="2 2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: safeOpacity(0.05 + ci * 0.003) }}
                    transition={{ duration: 0.6 }}
                  />
                ))}

                {/* Pattern glow at completion */}
                {reads >= READ_STEPS && (
                  <motion.rect x="20" y="20" width="160" height="120" rx="4"
                    fill={themeColor(TH.accentHSL, 0.02, 8)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="100" y="152" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'READING COMPLETE. the pattern speaks' : `connections: ${reads * 2}/${READ_STEPS * 2}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {reads === 0 ? 'Seven bones on dark cloth. Scattered. Meaningless, or not.' : `Reading ${reads}: "${READINGS[reads - 1]}."`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: READ_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < reads ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five readings. The bones were random. But lines appeared between them, connections you chose to see. The pattern was always there. Or was it? The shaman knows: it does not matter. What matters is that the reading opens a door. The pattern you see reveals the pattern in you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Apophenia as tool. The human tendency to find patterns in randomness, when used intentionally, becomes a projective technique for accessing intuitive knowledge.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Scatter. Connect. Read.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}