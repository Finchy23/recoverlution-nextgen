/**
 * MYSTIC #2 — The Drop in the Ocean
 * "The drop dies so the ocean can be born."
 * Pattern A (Tap) — Tap to fall; drop disappears into ocean and becomes it
 * STEALTH KBE: Accepting transition from drop to ocean = Unity Consciousness / Ego Dissolution (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'falling' | 'ocean' | 'resonant' | 'afterglow';

export default function Mystic_DropInOcean({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('falling'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const fall = () => {
    if (stage !== 'falling') return;
    console.log(`[KBE:B] DropInOcean unityConsciousness=confirmed egoDissolution=true`);
    setStage('ocean');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '8px', borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
              background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'falling' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are a drop of water, suspended. Below: the ocean. "I am afraid to fall." Let go.
            </div>
            <div style={{ position: 'relative', height: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <motion.div animate={{ y: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: '10px', height: '12px', borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
                  background: themeColor(TH.accentHSL, 0.08, 4) }} />
              <div style={{ width: '60px', height: '3px', borderRadius: '1px',
                background: themeColor(TH.primaryHSL, 0.04, 2), marginTop: '30px' }} />
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={fall}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Fall</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'ocean' && (
          <motion.div key="o" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            You are the ocean. The drop disappeared — but nothing was lost. You didn{"'"}t end. You expanded. The drop dies so the ocean can be born. Do not fear the end of "You." Fear the smallness of the drop. The boundary between "I" and "everything" was always imaginary. A line drawn on water.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Ego dissolution. Rumi: "You are not a drop in the ocean. You are the entire ocean in a drop." Psychedelic research (Griffiths, Johns Hopkins): psilocybin reliably produces "oceanic boundlessness" — the dissolution of ego boundaries — which correlates with lasting increases in openness, well-being, and pro-social behavior. The self is a useful fiction, not a fixed entity. Dropping the boundary is not death. It is expansion.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ocean.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}