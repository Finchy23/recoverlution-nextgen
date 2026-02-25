/**
 * WONDERER #7 — The Impossible List
 * "Impossible is just a lack of logistics. Pulleys and mirrors."
 * ARCHETYPE: Pattern A (Tap) + D (Type) — Tap impossible item, type the logistics
 * ENTRY: Instruction-as-poetry — list of impossibilities
 * STEALTH KBE: Converting impossible to todo = Agency / Self-Efficacy (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'listing' | 'converting' | 'converted' | 'resonant' | 'afterglow';

const IMPOSSIBLES = ['Fly', 'Read minds', 'Time travel', 'Be fearless', 'Live forever'];

export default function Wonderer_ImpossibleList({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<string | null>(null);
  const [conversion, setConversion] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'the logistics version...',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      setConversion(value.trim());
      console.log(`[KBE:B] ImpossibleList impossible="${selected}" todo="${value.trim()}" selfEfficacy=confirmed agency=true`);
      setStage('converted');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('listing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (item: string) => {
    setSelected(item);
    setStage('converting');
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: `${40 + i * 10}px`, height: '3px', borderRadius: '1.5px',
                background: themeColor(TH.primaryHSL, 0.05, 3) }} />
            ))}
          </motion.div>
        )}
        {stage === 'listing' && (
          <motion.div key="li" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>THINGS I CANNOT DO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {IMPOSSIBLES.map(item => (
                <motion.div key={item} whileTap={{ scale: 0.97, x: 4 }} onClick={() => pick(item)}
                  style={{ padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.03, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                  <span style={{ fontSize: '12px', color: palette.textFaint }}>{item}</span>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.25, 8), fontStyle: 'italic' }}>
              tap one to break it down
            </div>
          </motion.div>
        )}
        {stage === 'converting' && selected && (
          <motion.div key="conv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ textDecoration: 'line-through', color: palette.textFaint, fontSize: '12px' }}>{selected}</span>
              <span style={{ color: themeColor(TH.accentHSL, 0.3, 10), fontSize: '11px' }}>→</span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Break the magic trick down. What{"'"}s the real-world version?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Convert</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'converted' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ textDecoration: 'line-through', color: palette.textFaint, fontSize: '11px' }}>{selected}</span>
              <span style={{ color: themeColor(TH.accentHSL, 0.3, 10), fontSize: '10px' }}>→</span>
              <span style={{ color: themeColor(TH.accentHSL, 0.45, 14), fontSize: '12px', fontWeight: 500 }}>{conversion}</span>
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              Impossible is just a lack of logistics. It{"'"}s pulleys and mirrors all the way down.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-efficacy. Bandura{"'"}s research shows that the single greatest predictor of achievement isn{"'"}t talent or resources; it{"'"}s the belief that you can do something. Converting "impossible" to "todo" isn{"'"}t just optimism; it{"'"}s a cognitive reframe that activates the brain{"'"}s planning circuits. Agency is built in the translation from magic to logistics.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Possible.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}