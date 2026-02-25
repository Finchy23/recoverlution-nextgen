/**
 * MAGNUM OPUS II #5 — The Chisel Strike
 * "I do not create the angel. I just remove the marble that is not the angel."
 * Pattern A (Tap) — Tap to chisel away excess layers; perfect face emerges
 * STEALTH KBE: Viewing growth as Revelation (not Addition) = Michelangelo Effect (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'believing', 'Cosmos');
type Stage = 'arriving' | 'rough' | 'revealed' | 'resonant' | 'afterglow';

const LAYERS = ['Fear', 'Doubt', 'Comparison', 'Perfection', 'Approval'];

export default function Mastery_ChiselStrike({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [removed, setRemoved] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('rough'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const chisel = (layer: string) => {
    if (stage !== 'rough' || removed.includes(layer)) return;
    const next = [...removed, layer];
    setRemoved(next);
    if (next.length >= LAYERS.length) {
      console.log(`[KBE:B] ChiselStrike removed=[${next}] subtraction=true michelangeloEffect=true`);
      setStage('revealed');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '32px', borderRadius: radius.xs, background: themeColor(TH.primaryHSL, 0.05, 3) }} />
          </motion.div>
        )}
        {stage === 'rough' && (
          <motion.div key="ro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ width: '80px', height: '100px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '9px', color: themeColor(TH.accentHSL, 0.2 + removed.length * 0.06, 8), transition: 'all 0.5s' }}>
                {removed.length >= LAYERS.length ? 'You' : `${LAYERS.length - removed.length} layers`}
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A rough stone. Tap each excess to chisel it away.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {LAYERS.map(l => {
                const gone = removed.includes(l);
                return (
                  <motion.div key={l} whileTap={gone ? {} : { scale: 0.85 }} onClick={() => chisel(l)}
                    animate={gone ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                    style={{ padding: '5px 12px', borderRadius: '10px', cursor: gone ? 'default' : 'pointer',
                      background: gone ? 'transparent' : themeColor(TH.primaryHSL, 0.04, 2),
                      border: `1px solid ${gone ? 'transparent' : themeColor(TH.primaryHSL, 0.06, 3)}` }}>
                    <span style={{ fontSize: '8px', color: gone ? 'transparent' : palette.textFaint,
                      textDecoration: gone ? 'line-through' : 'none' }}>{l}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            The statue was always inside. Michelangelo: "I saw the angel in the marble and carved until I set him free." Growth isn{"'"}t addition — it{"'"}s revelation. Remove the fear. Remove the doubt. What remains is you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The Michelangelo Effect (Drigotas et al.): close partners "sculpt" each other toward their ideal selves by affirming what is already there, not by adding. The best mentors, lovers, and friends don{"'"}t build you — they remove what isn{"'"}t you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Revealed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}