/**
 * ZERO POINT #9 — The Nothing Box
 * "What is inside? Nothing. Perfect."
 * STEALTH KBE: Accepting the empty box = understanding of Shunyata (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Potentiality', 'knowing', 'Ocean');
type Stage = 'arriving' | 'closed' | 'open' | 'accept' | 'resonant' | 'afterglow';

export default function Void_NothingBox({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('closed'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const openBox = () => { if (stage === 'closed') setStage('open'); };
  const acceptEmpty = () => {
    if (stage !== 'open') return;
    console.log(`[KBE:K] NothingBox accepted=true shunyata=true potentiality=true`);
    setStage('accept');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Potentiality" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '12px', height: '10px', borderRadius: '2px', border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'closed' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div whileTap={{ scale: 0.95 }} onClick={openBox}
              style={{ width: '80px', height: '60px', borderRadius: '6px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', color: palette.textFaint }}>?</span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>What is inside? Tap to open.</div>
          </motion.div>
        )}
        {stage === 'open' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Open box - empty */}
            <div style={{ width: '80px', height: '60px', borderRadius: '0 0 6px 6px',
              background: themeColor(TH.primaryHSL, 0.02, 0),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}`, borderTop: 'none' }}>
              {/* Lid */}
              <motion.div initial={{ rotateX: 0 }} animate={{ rotateX: -60 }}
                style={{ width: '84px', height: '10px', marginLeft: '-3px', marginTop: '-10px',
                  borderRadius: '4px 4px 0 0',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}`,
                  transformOrigin: 'bottom' }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>Nothing.</div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={acceptEmpty}
              style={{ padding: '6px 16px', borderRadius: radius.md, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }}>
              <span style={{ fontSize: '8px', letterSpacing: '0.1em', color: palette.textFaint }}>PERFECT</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'accept' && (
          <motion.div key="ac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ scale: 1 }} animate={{ scale: 0.8, opacity: 0.6 }} transition={{ duration: 3 }}
              style={{ width: '60px', height: '45px', borderRadius: '6px',
                border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, fontSize: '9px', textAlign: 'center' }}>
              The emptiness is the treasure.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Shunyata (Nagarjuna, 2nd century CE): emptiness is not nothingness; it is the absence of inherent existence, which makes all existence possible. A cup is useful because of its emptiness. A room is livable because of its space. The nothing is potential. It is space for the new.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Empty.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}