/**
 * GAIA #10 — The Gaia Seal (Overview Effect)
 * "There are no borders from here. Only the atmosphere."
 * Pattern A (Tap) — Earth spinning in the void; fragile and alone
 * STEALTH KBE: Completion = Systems Thinking / Overview Effect confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'spinning' | 'sealed' | 'resonant' | 'afterglow';

export default function Gaia_GaiaSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('spinning'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'spinning') return;
    console.log(`[KBE:K] GaiaSeal systemsThinking=confirmed overviewEffect=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Earth */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" fill={themeColor(TH.accentHSL, 0.04, 2)}
                  stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" />
                {/* Continents (abstract) */}
                <ellipse cx="22" cy="22" rx="8" ry="6" fill={themeColor(TH.primaryHSL, 0.04, 3)} />
                <ellipse cx="38" cy="30" rx="6" ry="10" fill={themeColor(TH.primaryHSL, 0.04, 3)} />
                <ellipse cx="25" cy="40" rx="7" ry="5" fill={themeColor(TH.primaryHSL, 0.04, 3)} />
                {/* Atmosphere glow */}
                <circle cx="30" cy="30" r="28" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.03, 4)} strokeWidth="3" />
              </svg>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              The Earth. Spinning in the void. Fragile and alone. There are no borders from here.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ boxShadow: [
                `0 0 8px ${themeColor(TH.accentHSL, 0.03, 3)}`,
                `0 0 16px ${themeColor(TH.accentHSL, 0.05, 5)}`,
                `0 0 8px ${themeColor(TH.accentHSL, 0.03, 3)}`,
              ] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Sealed. There are no borders from here. Only the atmosphere. You are not on the earth — you are of the earth. You breathed with the trees, connected through mycelium, zoomed past galaxies, cycled with water, eroded with rock, traced sunlight, survived through diversity, dove to silence, and felt the butterfly{"'"}s wing. This pale blue dot is all we have. All we are. All we will be.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Overview Effect. Frank White (1987): astronauts viewing Earth from orbit report a profound cognitive shift — a sense of the planet{"'"}s fragility, the absurdity of borders, and a deep feeling of obligation to the whole. Edgar Mitchell (Apollo 14) described it as "an explosion of awareness." Carl Sagan{"'"}s "Pale Blue Dot": "Everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives... on a mote of dust suspended in a sunbeam."
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Home.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}