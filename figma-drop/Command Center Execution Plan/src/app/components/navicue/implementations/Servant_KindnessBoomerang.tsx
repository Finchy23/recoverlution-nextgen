/**
 * SERVANT #6 — The Kindness Boomerang
 * "What goes out, comes back. The physics is absolute."
 * ARCHETYPE: Pattern A (Tap) — Throw disc into void, wait for return
 * ENTRY: Scene-first — glowing disc
 * STEALTH KBE: Waiting for return = Faith in Social Capital / Reciprocity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'ready' | 'thrown' | 'returned' | 'resonant' | 'afterglow';

export default function Servant_KindnessBoomerang({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('ready'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const throwDisc = () => {
    if (stage !== 'ready') return;
    setStage('thrown');
    t(() => {
      console.log(`[KBE:B] KindnessBoomerang reciprocityFaith=confirmed socialCapital=true`);
      setStage('returned');
    }, 6000);
    t(() => setStage('resonant'), 10000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 15000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '16px', height: '16px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
        )}
        {stage === 'ready' && (
          <motion.div key="re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A glowing disc. Throw it into the void.
            </div>
            <motion.div animate={{ boxShadow: [
                `0 0 4px ${themeColor(TH.accentHSL, 0.04, 3)}`,
                `0 0 10px ${themeColor(TH.accentHSL, 0.08, 5)}`,
                `0 0 4px ${themeColor(TH.accentHSL, 0.04, 3)}`,
              ] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 5),
                border: `2px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={throwDisc}
              style={{ padding: '10px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Throw</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'thrown' && (
          <motion.div key="th" initial={{ opacity: 1 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div initial={{ scale: 1, x: 0 }} animate={{ scale: 0.1, x: 200, opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 5),
                border: `2px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
              Gone. Into the void. Waiting...
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 4 }}
              style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                  style={{ width: '3px', height: '3px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.15, 6) }} />
              ))}
            </motion.div>
          </motion.div>
        )}
        {stage === 'returned' && (
          <motion.div key="ret" initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, type: 'spring', damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div animate={{ boxShadow: [
                `0 0 8px ${themeColor(TH.accentHSL, 0.06, 5)}`,
                `0 0 16px ${themeColor(TH.accentHSL, 0.1, 8)}`,
                `0 0 8px ${themeColor(TH.accentHSL, 0.06, 5)}`,
              ] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 6),
                border: `2px solid ${themeColor(TH.accentHSL, 0.2, 10)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              It came back. What goes out, comes back. Maybe not today. Maybe not from them. But the physics is absolute. Trust the circuit.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Reciprocity and social capital. Robert Putnam{"'"}s research shows that generalized reciprocity — giving without expecting direct return — builds social capital that benefits everyone in the network. Kindness is a boomerang, not a transaction. The physics is absolute: prosocial behavior creates feedback loops that measurably improve health, happiness, and community resilience. Throw it. Trust the return.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Returned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}