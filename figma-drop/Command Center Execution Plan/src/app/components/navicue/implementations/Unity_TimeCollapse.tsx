/**
 * OMEGA #7 — The Time Collapse
 * "There is only the eternal Now. Be here."
 * STEALTH KBE: Sustained hold of NOW button = Radical Presence (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Presence', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'timelines' | 'now' | 'resonant' | 'afterglow';

export default function Unity_TimeCollapse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    requiredDuration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] TimeCollapse holdComplete=true radicalPresence=true`);
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('timelines'), 2200);
    t(() => setStage('now'), 6000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Presence" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '1px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'timelines' && (
          <motion.div key="tl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* Three timelines collapsing */}
            {['Past', 'Present', 'Future'].map((label, i) => (
              <motion.div key={label}
                animate={{ y: [0, (1 - i) * -15] }}
                transition={{ duration: 2, delay: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint, width: '30px', textAlign: 'right' }}>{label}</span>
                <div style={{ width: '100px', height: '1px',
                  background: themeColor(TH.accentHSL, 0.06 + i * 0.03, 3 + i) }} />
              </motion.div>
            ))}
            <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>
              Collapsing...
            </div>
          </motion.div>
        )}
        {stage === 'now' && (
          <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div {...hold.bind()}
              animate={{ scale: hold.active ? 0.95 : 1,
                boxShadow: hold.active ? `0 0 ${20 + hold.progress * 30}px ${themeColor(TH.accentHSL, 0.06 + hold.progress * 0.1, 6)}` : 'none' }}
              style={{ width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em',
                color: themeColor(TH.accentHSL, 0.15 + hold.progress * 0.15, 8) }}>NOW</span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Hold. The clock stops. Be here.
            </div>
            <div style={{ width: '60px', height: '2px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 1) }}>
              <motion.div style={{ width: `${hold.progress * 100}%`, height: '100%', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The {"\""}specious present{"\""} (James, 1890): consciousness can only exist in the present moment. The past is memory. The future is imagination. Only Now is real. The eternal Now is not a moment in time; it is the collapse of time itself into pure awareness.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Now.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}