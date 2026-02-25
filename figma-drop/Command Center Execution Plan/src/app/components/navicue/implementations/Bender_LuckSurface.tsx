/**
 * BENDER #3 — The Luck Surface
 * "Luck is not magic. It is geometry. Expand the net."
 * ARCHETYPE: Pattern A (Tap × 5) — Each tap expands a radar net outward.
 * Nodes light up as the net catches them. Serendipity engineering.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const EXPAND_STEPS = 5;
// Opportunity nodes at various distances from center
const NODES = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * Math.PI * 2 + (i * 0.3),
  dist: 20 + (i * 13 + i * i * 3) % 65,
  label: ['deal', 'friend', 'idea', 'mentor', 'skill', 'chance', 'gift', 'door', 'spark', 'link', 'path', 'key', 'wave', 'flow', 'seed', 'light', 'call', 'sync'][i],
}));

export default function Bender_LuckSurface({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [expanded, setExpanded] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const expand = () => {
    if (stage !== 'active' || expanded >= EXPAND_STEPS) return;
    const next = expanded + 1;
    setExpanded(next);
    if (next >= EXPAND_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = expanded / EXPAND_STEPS;
  const netRadius = 15 + t * 70;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scanning for opportunity...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Luck is not magic. It is geometry. Expand the net. Stand in the path of opportunity. Luck strikes moving targets.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to expand the radar</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={expand}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: expanded >= EXPAND_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Radar grid rings */}
                {[20, 40, 60, 80].map(r => (
                  <circle key={r} cx="100" cy="100" r={r}
                    fill="none" stroke={themeColor(TH.primaryHSL, r <= netRadius ? 0.04 + t * 0.02 : 0.02, 10)}
                    strokeWidth={safeSvgStroke(0.3)} strokeDasharray="2 2" />
                ))}
                {/* Radar cross */}
                <line x1="100" y1="15" x2="100" y2="185" stroke={themeColor(TH.primaryHSL, 0.03)} strokeWidth={safeSvgStroke(0.3)} />
                <line x1="15" y1="100" x2="185" y2="100" stroke={themeColor(TH.primaryHSL, 0.03)} strokeWidth={safeSvgStroke(0.3)} />

                {/* The net — expanding circle */}
                <motion.circle cx="100" cy="100" r={netRadius}
                  fill={themeColor(TH.accentHSL, t * 0.02, 5)}
                  stroke={themeColor(TH.accentHSL, 0.06 + t * 0.06, 15)}
                  strokeWidth={0.5 + t * 0.5}
                  initial={{ r: 15 }}
                  animate={{ r: netRadius }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Sweep line */}
                <motion.line x1="100" y1="100" x2={100 + netRadius} y2="100"
                  stroke={themeColor(TH.accentHSL, 0.06 + t * 0.04, 10)}
                  strokeWidth="0.4"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4 - t * 2, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '100px 100px' }}
                />

                {/* Opportunity nodes — light up when inside net radius */}
                {NODES.map((node, i) => {
                  const nx = 100 + Math.cos(node.angle) * node.dist;
                  const ny = 100 + Math.sin(node.angle) * node.dist;
                  const caught = node.dist <= netRadius;
                  return (
                    <g key={i}>
                      <motion.circle cx={nx} cy={ny} r={caught ? 3 : 1.5}
                        fill={caught
                          ? themeColor(TH.accentHSL, 0.12, 15)
                          : themeColor(TH.primaryHSL, 0.03)}
                        initial={{ r: 1.5 }}
                        animate={{ r: caught ? 3 : 1.5 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                      />
                      {caught && (
                        <motion.text x={nx} y={ny + 7} textAnchor="middle" fontSize="2.5" fontFamily="monospace"
                          fill={themeColor(TH.accentHSL, 0.08, 10)}
                          initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}>
                          {node.label}
                        </motion.text>
                      )}
                    </g>
                  );
                })}

                {/* Caught count */}
                <text x="100" y="192" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? `${NODES.filter(n => n.dist <= netRadius).length} opportunities caught` : `net radius: ${Math.round(netRadius)}px`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {expanded === 0 ? 'A tiny radar. Barely scanning.' : expanded < EXPAND_STEPS ? `Expansion ${expanded}. ${NODES.filter(n => n.dist <= netRadius).length} nodes caught.` : 'Maximum surface area. Every opportunity within reach.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: EXPAND_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < expanded ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five expansions. The radar swept wider with each tap. Nodes lit up: a deal, a friend, an idea, a mentor, a spark. The geometry of luck: the larger the net, the more you catch. Stand in the path of opportunity. Say hello.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Serendipity engineering. Increasing random interactions and openness to experience increases the statistical probability of a positive black swan event. Luck is geometry.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Net. Expand. Catch.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}