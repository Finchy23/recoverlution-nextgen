/**
 * GARDENER II #2 — The Composting
 * "There is no waste in nature. Your mistakes are just nitrogen."
 * Pattern D (Type) — Type a regret; watch worms turn it into black soil
 * STEALTH KBE: Viewing failure as nutrient = Growth Mindset / Transmutation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Ecological Identity', 'knowing', 'Canopy');
type Stage = 'arriving' | 'binning' | 'composted' | 'resonant' | 'afterglow';

export default function Gardener_Composting({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'A regret to compost...',
    onAccept: (val: string) => {
      console.log(`[KBE:K] Composting transmutation=confirmed growthMindset=true length=${val.length}`);
      setStage('composted');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('binning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '18px', borderRadius: '2px 2px 4px 4px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'binning' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A compost bin labeled "Regrets." Name a failure. Throw it in. Watch the worms work.
            </div>
            <div style={{ width: '100%', maxWidth: '240px' }}>
              <input
                type="text"
                value={typeInt.value}
                onChange={(e) => typeInt.onChange(e.target.value)}
                placeholder={typeInt.placeholder}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', fontSize: '11px',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                  color: palette.text, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            {typeInt.value.length > 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
                onClick={() => typeInt.onAccept(typeInt.value)}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Compost It</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'composted' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Composted. The worms went to work. What was rotting became rich, black soil — fertilizer. There is no waste in nature. Your mistakes are just nitrogen for the next crop. Let it rot. It feeds the roots. The failure you named is now nutrition. Something will grow from it that couldn{"'"}t grow from success.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Growth mindset and failure reframing. Carol Dweck{"'"}s research: viewing failures as learning opportunities (growth mindset) vs. fixed judgments (fixed mindset) predicts resilience, achievement, and psychological well-being. Composting as metaphor: decomposition is transformation, not destruction. In permaculture, every "waste" output is an input for another process. Post-failure reflection (Shepherd, 2009): entrepreneurs who grieve failures constructively learn faster than those who suppress or ruminate.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Fertile.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}