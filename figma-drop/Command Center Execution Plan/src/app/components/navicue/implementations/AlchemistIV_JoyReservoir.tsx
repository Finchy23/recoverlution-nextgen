/**
 * ALCHEMIST IV #4 - The Joy Reservoir
 * "Happiness evaporates if you don't capture it."
 * Pattern A (Tap) - Tap repeatedly to collect golden drops into reservoir
 * STEALTH KBE: Engagement intensity = Positive Resource Building belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'raining' | 'filled' | 'resonant' | 'afterglow';

export default function AlchemistIV_JoyReservoir({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [drops, setDrops] = useState(0);
  const TARGET = 8;
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('raining'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const collect = () => {
    if (stage !== 'raining') return;
    const next = drops + 1;
    setDrops(next);
    if (next >= TARGET) {
      console.log(`[KBE:B] JoyReservoir drops=${next} savoring=confirmed positiveResourceBuilding=true`);
      setStage('filled');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '24px', borderRadius: '0 0 4px 4px',
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}`, borderTop: 'none' }} />
          </motion.div>
        )}
        {stage === 'raining' && (
          <motion.div key="ra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              It{"'"}s raining gold. A good moment. Tap to collect the drops before they evaporate. Save them for the drought.
            </div>
            {/* Reservoir */}
            <div style={{ position: 'relative', width: '60px', height: '40px' }}>
              <div style={{ width: '60px', height: '40px', borderRadius: '0 0 6px 6px',
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}`, borderTop: 'none',
                overflow: 'hidden', position: 'relative' }}>
                <motion.div animate={{ height: `${(drops / TARGET) * 100}%` }}
                  style={{ position: 'absolute', bottom: 0, width: '100%',
                    background: themeColor(TH.accentHSL, 0.06 + (drops / TARGET) * 0.04, 3) }} />
              </div>
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 10) }}>
                {drops}/{TARGET}
              </span>
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={collect}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Collect Drop</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'filled' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Reservoir full. Happiness evaporates if you don{"'"}t capture it. Savor the moment. Bottle the feeling. The drought will come - it always does - and you{"'"}ll need a sip. Joy is not just experienced; it{"'"}s invested. Each drop you consciously collected extends the half-life of this good moment.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Savoring. Fred Bryant{"'"}s research: the ability to deliberately attend to and appreciate positive experiences ("savoring") independently predicts well-being - above and beyond how many positive events actually occur. Savoring extends the emotional half-life of good moments. The hedonic treadmill erases joy automatically; savoring is the manual override. Three techniques: sharing, memory-building, and absorption.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Stored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}