/**
 * MULTIVERSE #9 — The Empty Room (The Observer)
 * "Beneath the roles, there is just... this. The witness."
 * ARCHETYPE: Pattern C (Hold) — Hold still for 10 seconds
 * ENTRY: Cold open — empty white room
 * STEALTH KBE: Sustained stillness = Pure Awareness (E)
 * WEB ADAPT: hold phone still → hold button for 10 seconds
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'empty' | 'witnessed' | 'resonant' | 'afterglow';

export default function Multiverse_EmptyRoom({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({ duration: 10000,
    onComplete: () => {
      console.log(`[KBE:E] EmptyRoom pureAwareness=confirmed stillness=true`);
      setStage('witnessed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('empty'), 1800); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.01, 0) }} />
        )}
        {stage === 'empty' && (
          <motion.div key="em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            {/* Empty room */}
            <div style={{ width: '120px', height: '70px', borderRadius: '2px', position: 'relative',
              background: themeColor(TH.primaryHSL, 0.015, 0),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.025, 1)}` }}>
              {hold.isHolding && hold.progress > 0.3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: hold.progress * 0.15 }}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: `${8 + hold.progress * 12}px`, height: `${8 + hold.progress * 12}px`,
                    borderRadius: '50%',
                    background: themeColor(TH.accentHSL, hold.progress * 0.06, 3) }} />
              )}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontStyle: 'italic' }}>
              An empty room. No furniture. No identity. Just awareness. Sit in the center.
            </div>
            <motion.div {...hold.holdProps}
              animate={hold.isHolding ? { boxShadow: `0 0 ${4 + hold.progress * 12}px ${themeColor(TH.accentHSL, 0.02 + hold.progress * 0.04, 3)}` } : {}}
              style={{ width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.04 + hold.progress * 0.03, 2),
                border: `2px solid ${themeColor(TH.accentHSL, 0.06 + hold.progress * 0.08, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                userSelect: 'none', WebkitUserSelect: 'none' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2 + hold.progress * 0.15, 8) }}>
                {hold.isHolding ? `${Math.round(hold.progress * 10)}s` : 'Sit'}
              </span>
            </motion.div>
            <div style={{ width: '60px', height: '3px', borderRadius: '1.5px',
              background: themeColor(TH.primaryHSL, 0.03, 1) }}>
              <div style={{ height: '100%', borderRadius: '1.5px',
                width: `${hold.progress * 100}%`,
                background: themeColor(TH.accentHSL, 0.1, 5), transition: 'width 0.1s' }} />
            </div>
          </motion.div>
        )}
        {stage === 'witnessed' && (
          <motion.div key="wi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Silence. Beneath the roles, beneath the names, beneath the stories — there is just... this. The witness. The awareness that watches everything without being any of it. Rest in the emptiness. It holds everything.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Pure awareness. The "Observer Self" (ACT) — the you that watches your thoughts without being your thoughts. Neuroscience: the default mode network (DMN) constructs the narrative self; mindfulness practice activates the salience network, which observes without narrating. 10 seconds of sustained stillness is harder than it sounds. It is the doorway to what the contemplative traditions call "witness consciousness."
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Witnessed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}