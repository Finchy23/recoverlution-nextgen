/**
 * ARCHITECT II #4 — The Perspective Balcony
 * "Go up. Look through their window."
 * Pattern A (Tap) — Take elevator from ground to penthouse; city looks different
 * STEALTH KBE: Describing other's view = Theory of Mind / Empathy (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'ground' | 'ascending' | 'penthouse' | 'resonant' | 'afterglow';

export default function Cognitive_PerspectiveBalcony({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('ground'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const ascend = () => {
    if (stage !== 'ground') return;
    setStage('ascending');
    t(() => {
      console.log(`[KBE:B] PerspectiveBalcony theoryOfMind=confirmed empathy=true`);
      setStage('penthouse');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }, 2000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '14px', height: '30px', borderRadius: '1px',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'ground' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are on the ground floor — your view. You cannot see the traffic pattern from the street. Take the elevator up.
            </div>
            {/* Building */}
            <div style={{ position: 'relative', width: '40px', height: '70px' }}>
              <div style={{ width: '40px', height: '70px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.025, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                {[58, 42, 26, 10].map((y, i) => (
                  <div key={i} style={{ position: 'absolute', top: `${y}px`, left: '8px',
                    width: '24px', height: '8px', borderRadius: '1px',
                    background: themeColor(TH.primaryHSL, 0.02, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}` }} />
                ))}
              </div>
              {/* You marker */}
              <div style={{ position: 'absolute', bottom: '4px', right: '-8px',
                fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>← You</div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={ascend}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Take Elevator ↑</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'ascending' && (
          <motion.div key="asc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div animate={{ y: [0, -30] }} transition={{ duration: 2 }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>↑</span>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Ascending...</div>
          </motion.div>
        )}
        {stage === 'penthouse' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Penthouse. The city looks different from up here. You can see the traffic pattern, the flow, the connections you{"'"}couldn{"'"}t see from the street. Look through their window. What do they see? The other person{"'"}s perspective isn{"'"}t wrong — it{"'"}s from a different floor. Go up. The view changes everything.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Theory of Mind. The ability to attribute mental states — beliefs, intents, desires, knowledge — to oneself and others. Premack & Woodruff (1978) established it as a cognitive milestone. The "balcony" metaphor comes from Ronald Heifetz{"'"}s adaptive leadership: "Get off the dance floor and onto the balcony" — you can{"'"}t see the pattern while you{"'"}re inside it. Perspective-taking is a spatial skill: physically or mentally changing your vantage point.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Elevated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}