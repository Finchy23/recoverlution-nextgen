/**
 * MAESTRO #4 — The Stage Presence
 * "Own every inch. Stand like you paid for the floor."
 * ARCHETYPE: Pattern A (Tap × 5) — A figure on a tiny platform. Each tap
 * expands the platform and the figure's stance. Territory display.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

const EXPAND_STEPS = 5;

export default function Maestro_StagePresence({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [expanded, setExpanded] = useState(0);

  const expand = () => {
    if (stage !== 'active' || expanded >= EXPAND_STEPS) return;
    const next = expanded + 1;
    setExpanded(next);
    if (next >= EXPAND_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = expanded / EXPAND_STEPS;
  const platW = 30 + t * 160;
  const stanceW = 6 + t * 20;
  const shoulderW = 8 + t * 14;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A small stage...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Own every inch. Stand like you paid for the floor. The body speaks before the mouth opens. Take up space.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to expand your stage presence</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={expand}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: expanded >= EXPAND_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Stage/platform — expands */}
                <motion.rect x={110 - platW / 2} y="115" width={platW} height="8" rx="2"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.04, 12)}
                  initial={{ x: 110 - 20, width: 40 }}
                  animate={{ x: 110 - platW / 2, width: platW }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Stage edge highlight */}
                <motion.rect x={110 - platW / 2} y="115" width={platW} height="1.5" rx="0.5"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.05, 18)}
                  initial={{ x: 110 - 20, width: 40 }}
                  animate={{ x: 110 - platW / 2, width: platW }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Figure — stance widens */}
                {/* Head */}
                <circle cx="110" cy="50" r={6 + t * 2}
                  fill={themeColor(TH.primaryHSL, 0.06 + t * 0.04, 12)} />
                {/* Torso */}
                <rect x={110 - shoulderW / 2} y="58" width={shoulderW} height={20 + t * 5} rx="3"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.03, 10)} />
                {/* Legs — wider stance */}
                <motion.line x1={110 - stanceW / 2} y1="115" x2={110 - shoulderW / 4} y2={78 + t * 5}
                  stroke={themeColor(TH.primaryHSL, 0.05 + t * 0.03, 10)} strokeWidth={2 + t}
                  strokeLinecap="round"
                  initial={{ x1: 110 - stanceW / 2 }}
                  animate={{ x1: 110 - stanceW / 2 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                <motion.line x1={110 + stanceW / 2} y1="115" x2={110 + shoulderW / 4} y2={78 + t * 5}
                  stroke={themeColor(TH.primaryHSL, 0.05 + t * 0.03, 10)} strokeWidth={2 + t}
                  strokeLinecap="round"
                  initial={{ x1: 110 + stanceW / 2 }}
                  animate={{ x1: 110 + stanceW / 2 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Arms — expand outward */}
                <motion.line x1={110 - shoulderW / 2} y1="62" x2={110 - shoulderW / 2 - t * 15} y2={68 - t * 5}
                  stroke={themeColor(TH.primaryHSL, 0.04 + t * 0.03, 10)} strokeWidth={1.5 + t * 0.5}
                  strokeLinecap="round" />
                <motion.line x1={110 + shoulderW / 2} y1="62" x2={110 + shoulderW / 2 + t * 15} y2={68 - t * 5}
                  stroke={themeColor(TH.primaryHSL, 0.04 + t * 0.03, 10)} strokeWidth={1.5 + t * 0.5}
                  strokeLinecap="round" />

                {/* Presence aura */}
                {t > 0.3 && (
                  <motion.ellipse cx="110" cy="80" rx={platW / 2 - 5} ry={35 + t * 10}
                    fill={themeColor(TH.accentHSL, (t - 0.3) * 0.02, 8)}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.3) * 0.02 }}
                  />
                )}

                {/* Spotlight */}
                {t > 0.5 && (
                  <motion.polygon
                    points={`110,15 ${110 - 20 - t * 30},125 ${110 + 20 + t * 30},125`}
                    fill={themeColor(TH.accentHSL, (t - 0.5) * 0.015, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.5) * 0.015 }}
                  />
                )}

                <text x="110" y="140" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'THE STAGE IS YOURS' : `presence: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {expanded === 0 ? 'A tiny platform. Cramped stance. Small.' : expanded < EXPAND_STEPS ? `Expansion ${expanded}. Wider stance. Bigger stage. More presence.` : 'Full stage. Full stance. Arms wide. The floor is yours.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five expansions. The platform grew from a postage stamp to a full stage. The figure's stance widened, shoulders broadened, arms opened. A spotlight descended. The body spoke before the mouth opened: "I belong here." Own every inch. Stand like you paid for the floor.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Territory display. Expansive postures signal dominance and increase perceived confidence. The body broadcasts a message before a single word is spoken.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Small. Expand. Own.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}