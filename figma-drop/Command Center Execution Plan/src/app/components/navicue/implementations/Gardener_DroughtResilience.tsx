/**
 * GARDENER II #6 — The Drought Resilience
 * "Surface water is easy. Deep water is reliable."
 * Pattern A (Tap) — Rain stops; surface dries; switch to "Roots" view; tap deep aquifer
 * STEALTH KBE: Engaging deep root mode = Self-Reliance / Internal Resources (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'drought' | 'roots' | 'tapped' | 'resonant' | 'afterglow';

export default function Gardener_DroughtResilience({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('drought'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const switchToRoots = () => {
    if (stage !== 'drought') return;
    setStage('roots');
  };

  const tapReserve = () => {
    if (stage !== 'roots') return;
    console.log(`[KBE:B] DroughtResilience selfReliance=confirmed internalResources=true`);
    setStage('tapped');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '1px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'drought' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The rain has stopped. The surface is cracking. Everything above ground is drying. Switch view to see what{"'"}s below.
            </div>
            <div style={{ width: '80px', height: '16px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Surface: Dry</span>
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={switchToRoots}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Switch to Roots ↓</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'roots' && (
          <motion.div key="ro" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Below ground: deep roots reaching the aquifer. Reliable water. Tap the reserve.
            </div>
            <svg width="60" height="50" viewBox="0 0 60 50">
              <rect x="0" y="0" width="60" height="10" fill={themeColor(TH.primaryHSL, 0.03, 1)} />
              <line x1="30" y1="10" x2="30" y2="40" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" />
              <line x1="30" y1="20" x2="18" y2="32" stroke={themeColor(TH.accentHSL, 0.05, 3)} strokeWidth="0.5" />
              <line x1="30" y1="20" x2="42" y2="35" stroke={themeColor(TH.accentHSL, 0.05, 3)} strokeWidth="0.5" />
              <rect x="5" y="38" width="50" height="12" rx="3" fill={themeColor(TH.accentHSL, 0.03, 2)} />
              <text x="30" y="46" textAnchor="middle" fill={themeColor(TH.accentHSL, 0.15, 6)} fontSize="11">Aquifer</text>
            </svg>
            <motion.div whileTap={{ scale: 0.9 }} onClick={tapReserve}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Switch to Roots</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'tapped' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Tapped. The deep water flows. When the world dries up, go down. Your resilience is stored in the dark, in the practices, values, and relationships you built during the good times. Surface water is easy but evaporates fast. Deep water is reliable. The drought revealed what was always there: roots deep enough to reach what no surface wind can touch.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Resilience depth. Trees that grow in constant wind develop stronger root systems. Nassim Taleb{"'"}s "antifragility": some systems benefit from stress. The "deep roots" metaphor maps to psychological reserve capacity (Staudinger & Fleeson): the internal resources, values, skills, relationships, that people draw upon during crisis. Research on post-adversity growth: people with stronger pre-crisis meaning systems recover faster. Build deep in the good times. The aquifer is your insurance.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Deep.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}