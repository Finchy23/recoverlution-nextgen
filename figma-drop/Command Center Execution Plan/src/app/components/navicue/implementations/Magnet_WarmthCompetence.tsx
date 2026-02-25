/**
 * MAGNET #6 — The Warmth/Competence Grid
 * "Competence without warmth is a threat. Warmth without competence is a pet."
 * ARCHETYPE: Pattern B (Drag) — A quadrant. Drag a dot from Cold/Smart (Threat)
 * to Warm/Smart (Leader). Stereotype Content Model.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Magnet_WarmthCompetence({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const drag = useDragInteraction({
    axis: 'both', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  // Dot starts bottom-right (Cold/Smart=Threat), moves to top-right (Warm/Smart=Leader)
  const dotX = 150; // stays on the "smart" side
  const dotY = 120 - t * 80; // 120→40

  const quadrant = t < 0.3 ? 'THREAT' : t < 0.6 ? 'NEUTRAL' : t < 0.9 ? 'WARM' : 'LEADER';
  const qHue = t < 0.3 ? 0 : t < 0.6 ? 40 : 42;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two axes. One truth.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Competence without warmth is a threat. Warmth without competence is a pet. Be both. Smile while you win.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward and move from threat to leader</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Axes */}
                <line x1="30" y1="130" x2="30" y2="20" stroke={themeColor(TH.primaryHSL, 0.06, 10)} strokeWidth="0.5" />
                <line x1="30" y1="130" x2="180" y2="130" stroke={themeColor(TH.primaryHSL, 0.06, 10)} strokeWidth="0.5" />

                {/* Labels */}
                <text x="10" y="75" fontSize="3.5" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.05, 10)}
                  transform="rotate(-90, 10, 75)" textAnchor="middle">WARMTH</text>
                <text x="105" y="145" fontSize="3.5" fontFamily="monospace" fill={themeColor(TH.primaryHSL, 0.05, 10)}
                  textAnchor="middle">COMPETENCE</text>

                {/* Quadrant labels */}
                <text x="60" y="45" textAnchor="middle" fontSize="3" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.04, 8)}>WARM/WEAK</text>
                <text x="60" y="52" textAnchor="middle" fontSize="2.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.03, 8)}>= pet</text>

                <text x="150" y="45" textAnchor="middle" fontSize="3" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, t >= 0.9 ? 0.1 : 0.04, t >= 0.9 ? 15 : 8)}>WARM/SMART</text>
                <text x="150" y="52" textAnchor="middle" fontSize="2.5" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, t >= 0.9 ? 0.08 : 0.03, t >= 0.9 ? 15 : 8)}>= LEADER</text>

                <text x="60" y="115" textAnchor="middle" fontSize="3" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.04, 8)}>COLD/WEAK</text>
                <text x="60" y="122" textAnchor="middle" fontSize="2.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.03, 8)}>= invisible</text>

                <text x="150" y="115" textAnchor="middle" fontSize="3" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, t < 0.3 ? 0.06 : 0.04, t < 0.3 ? 10 : 8)}>COLD/SMART</text>
                <text x="150" y="122" textAnchor="middle" fontSize="2.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, t < 0.3 ? 0.05 : 0.03, t < 0.3 ? 10 : 8)}>= threat</text>

                {/* Grid lines */}
                <line x1="105" y1="20" x2="105" y2="130" stroke={themeColor(TH.primaryHSL, 0.02)} strokeWidth="0.3" strokeDasharray="2 2" />
                <line x1="30" y1="75" x2="180" y2="75" stroke={themeColor(TH.primaryHSL, 0.02)} strokeWidth="0.3" strokeDasharray="2 2" />

                {/* The dot — dragged upward */}
                <motion.circle cx={dotX} cy={dotY} r={5 + t * 3}
                  fill={`hsla(${qHue}, ${12 + t * 15}%, ${22 + t * 15}%, ${0.1 + t * 0.08})`}
                  stroke={`hsla(${qHue}, ${12 + t * 12}%, ${28 + t * 12}%, ${0.06 + t * 0.04})`}
                  strokeWidth={0.5 + t * 0.3}
                  initial={{ cy: dotY }}
                  animate={{ cy: dotY }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Trail */}
                {t > 0.05 && (
                  <motion.line x1={dotX} y1="120" x2={dotX} y2={dotY}
                    stroke={themeColor(TH.accentHSL, 0.04, 10)}
                    strokeWidth="0.4" strokeDasharray="1 2" />
                )}

                {/* Leader glow */}
                {t >= 0.9 && (
                  <motion.circle cx={dotX} cy={dotY} r="18"
                    fill={themeColor(TH.accentHSL, 0.03, 12)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'You are Cold/Smart. Competent but threatening.' : t < 0.5 ? `Moving toward warmth. Currently: ${quadrant}.` : t < 0.95 ? 'Warm and smart. The leader zone is near.' : 'LEADER. Warm and smart. Smile while you win.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Two axes. Warmth and competence. You started at Cold/Smart, the threat zone. Competent but unapproachable. You dragged upward: warmth rising, competence holding. Cold/Smart to Warm/Smart. Threat to Leader. The dot glowed gold in the upper right. Smile while you win.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The stereotype content model. Humans judge all interactions on two axes: warmth (intent) and competence (ability). High attraction requires scoring high on both.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Cold. Warm. Leader.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}