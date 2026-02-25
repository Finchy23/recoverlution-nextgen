/**
 * ASCENDANT #10 -- The Ascendant Seal
 * "Feet on the ground. Head in the stars. Heart in the center."
 * Pattern A (Tap) -- Human figure in square (earth) and circle (heaven), proportioned
 * STEALTH KBE: Completion = Integrated Living mastery confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'figure' | 'sealed' | 'resonant' | 'afterglow';

export default function Ascendant_AscendantSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('figure'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'figure') return;
    console.log(`[KBE:K] AscendantSeal integratedLiving=confirmed optimalFunctioning=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity }} exit={{ opacity: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="3" y="3" width="14" height="14" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="0.5" />
              <circle cx="10" cy="10" r="7" fill="none"
                stroke={themeColor(TH.accentHSL, 0.04, 2)} strokeWidth="0.5" />
            </svg>
          </motion.div>
        )}
        {stage === 'figure' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Vitruvian figure */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              {/* Square (Earth) */}
              <rect x="14" y="14" width="52" height="52" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="0.5" />
              {/* Circle (Heaven) */}
              <circle cx="40" cy="40" r="32" fill="none"
                stroke={themeColor(TH.accentHSL, 0.04, 2)} strokeWidth="0.5" />
              {/* Figure */}
              <circle cx="40" cy="22" r="4" fill={themeColor(TH.accentHSL, 0.06, 4)} />
              <line x1="40" y1="26" x2="40" y2="48" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1.5" />
              <line x1="40" y1="32" x2="24" y2="38" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1" />
              <line x1="40" y1="32" x2="56" y2="38" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1" />
              <line x1="40" y1="48" x2="30" y2="64" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1" />
              <line x1="40" y1="48" x2="50" y2="64" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1" />
              {/* Heart point */}
              <motion.circle cx="40" cy="36" r="2"
                initial={{ opacity: 0.06 }}
                animate={{ opacity: [0.06, 0.12, 0.06] }}
                transition={{ duration: 2, repeat: Infinity }}
                fill={themeColor(TH.accentHSL, 0.12, 8)} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              Feet on the ground. Head in the stars. Heart in the center.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Integrate</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ boxShadow: [`0 0 8px ${themeColor(TH.accentHSL, 0.03, 3)}`, `0 0 20px ${themeColor(TH.accentHSL, 0.06, 5)}`, `0 0 8px ${themeColor(TH.accentHSL, 0.03, 3)}`] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 6) }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Sealed. The Ascendant: feet on the ground, head in the stars, heart in the center. You scrubbed the dishes. You descended from the mountain. You held center in the market. You got your hands dirty. You saw the miracle in bread. You repaired with gold. You made ripples. You grasped the hand. You opened the door. And now you stand: body in matter, mind in cosmos, heart in service. This is integrated living. Not escape. Not transcendence alone. But all of it -- held together, in one breath, in one life, in you.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Integrated functioning. Ken Wilber{"'"}s AQAL (All Quadrants, All Levels) model: optimal human development integrates body, mind, spirit, and shadow across individual and collective dimensions. Da Vinci{"'"}s Vitruvian Man: the human body as microcosm of the universe, simultaneously inscribed in square (material, rational) and circle (infinite, spiritual). WHO definition of health: "a state of complete physical, mental, and social well-being." The Ascendant is not above the human -- it IS the human, fully realized. Feet on the ground. Head in the stars. Heart in the center.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Integrated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}