/**
 * MULTIVERSE #6 — The Ghost Ship (Past Selves)
 * "That version of you served their purpose. Let them go."
 * ARCHETYPE: Pattern A (Tap) — Wave goodbye to ghost ship
 * ENTRY: Scene-first — ghostly ship in mist
 * STEALTH KBE: Letting ship fade without boarding = Release of Past Identity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'sailing' | 'released' | 'resonant' | 'afterglow';

export default function Multiverse_GhostShip({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shipFade, setShipFade] = useState(0.3);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('sailing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const wave = () => {
    if (stage !== 'sailing') return;
    console.log(`[KBE:B] GhostShip pastIdentityRelease=confirmed lettingGo=true`);
    setShipFade(0);
    setStage('released');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '16px', borderRadius: '0 0 4px 4px',
              background: themeColor(TH.primaryHSL, 0.03, 2) }} />
        )}
        {stage === 'sailing' && (
          <motion.div key="sa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A ghostly ship sails by. It is You from the past. Wave goodbye.
            </div>
            {/* Ghost ship */}
            <motion.div animate={{ x: [0, 3, 0], opacity: shipFade }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '60px', height: '30px', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '5px', right: '5px', height: '14px',
                borderRadius: '0 0 6px 6px', background: themeColor(TH.primaryHSL, 0.03, 2) }} />
              <div style={{ position: 'absolute', bottom: '14px', left: '28px',
                width: '2px', height: '14px', background: themeColor(TH.primaryHSL, 0.03, 2) }} />
              <div style={{ position: 'absolute', bottom: '16px', left: '18px',
                width: '12px', height: '8px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.02, 1) }} />
            </motion.div>
            <motion.div whileTap={{ scale: 0.9, rotate: [0, -10, 10, 0] }} onClick={wave}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Wave Goodbye</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'released' && (
          <motion.div key="re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The ship fades into the mist. That version of you served their purpose. They got you here. But they cannot steer this ship. Gratitude — and release. The ghost sails on. You stay on shore, in the present.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Identity release. Hazel Markus{"'"} "possible selves" research: we carry past selves alongside present and future ones. Healthy development requires releasing attachment to outdated self-concepts. The grief of who you were is real. But holding onto a past version of yourself prevents the current version from steering. Thank the ghost. Let it sail.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Released.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}