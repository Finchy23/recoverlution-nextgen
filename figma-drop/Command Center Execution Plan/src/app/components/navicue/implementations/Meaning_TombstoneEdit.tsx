/**
 * MEANING MAKER #3 — The Tombstone Edit
 * "The eulogy is the only bio that matters."
 * ARCHETYPE: Pattern A (Tap) — Select a virtue over a metric
 * ENTRY: Scene-first — stone engraving
 * STEALTH KBE: Choosing virtue over metric = Intrinsic Value Orientation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'engraved' | 'edited' | 'resonant' | 'afterglow';

const VIRTUES = ['Kind', 'Brave', 'Present', 'Generous', 'Honest'];
const METRICS = ['Busy', 'Rich', 'Famous', 'Productive', 'Successful'];

export default function Meaning_TombstoneEdit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState('');
  const [isVirtue, setIsVirtue] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('engraved'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (word: string, virtue: boolean) => {
    if (stage !== 'engraved') return;
    setChosen(word);
    setIsVirtue(virtue);
    console.log(`[KBE:K] TombstoneEdit word="${word}" isVirtue=${virtue} intrinsicValueOrientation=${virtue}`);
    setStage('edited');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '40px', borderRadius: `${radius.xs} ${radius.xs} 0 0`,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
        )}
        {stage === 'engraved' && (
          <motion.div key="en" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Tombstone */}
            <div style={{ width: '140px', padding: '16px 12px', borderRadius: `${radius.sm} ${radius.sm} 0 0`,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: palette.textFaint, letterSpacing: '0.08em' }}>HERE LIES</div>
              <div style={{ fontSize: '10px', color: palette.textFaint, marginTop: '4px' }}>They were</div>
              <div style={{ fontSize: '13px', color: themeColor(TH.primaryHSL, 0.15, 6), fontStyle: 'italic',
                marginTop: '2px', textDecoration: 'line-through' }}>busy</div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Edit the stone. What word do you want carved?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 8), textAlign: 'center' }}>virtues</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {VIRTUES.map(v => (
                  <motion.div key={v} whileTap={{ scale: 0.9 }} onClick={() => pick(v, true)}
                    style={{ padding: '6px 12px', borderRadius: radius.md, cursor: 'pointer',
                      background: themeColor(TH.accentHSL, 0.06, 3),
                      border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                    <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.4, 14) }}>{v}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', marginTop: '4px' }}>metrics</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {METRICS.map(m => (
                  <motion.div key={m} whileTap={{ scale: 0.9 }} onClick={() => pick(m, false)}
                    style={{ padding: '6px 12px', borderRadius: radius.md, cursor: 'pointer',
                      background: themeColor(TH.primaryHSL, 0.03, 1),
                      border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                    <span style={{ fontSize: '11px', color: palette.textFaint }}>{m}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'edited' && (
          <motion.div key="ed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ width: '140px', padding: '16px 12px', borderRadius: `${radius.sm} ${radius.sm} 0 0`,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${isVirtue ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.primaryHSL, 0.06, 4)}`,
              textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: palette.textFaint, letterSpacing: '0.08em' }}>HERE LIES</div>
              <div style={{ fontSize: '10px', color: palette.textFaint, marginTop: '4px' }}>They were</div>
              <div style={{ fontSize: '14px', marginTop: '2px', fontWeight: 500,
                color: isVirtue ? themeColor(TH.accentHSL, 0.45, 14) : palette.textFaint }}>{chosen}</div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {isVirtue
                ? `"${chosen}." That's a legacy. The eulogy is the only bio that matters.`
                : `"${chosen}." Is that enough? The stone doesn't care about metrics. What virtue lived behind it?`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Value clarification. David Brooks distinguishes between "résumé virtues" (skills for the market) and "eulogy virtues" (what people say at your funeral). Research consistently shows that people on their deathbeds never wish they{"'"}d been busier. They wish they{"'"}d been kinder, braver, more present. The tombstone is the only performance review that matters. Edit accordingly.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Carved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}