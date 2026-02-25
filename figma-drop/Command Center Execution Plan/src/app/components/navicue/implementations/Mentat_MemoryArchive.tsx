/**
 * MENTAT #5 — The Memory Archive
 * "You forgot you are competent. Retrieve the evidence."
 * ARCHETYPE: Pattern D (Type) — Type a past win
 * ENTRY: Scene-first — library with empty shelf
 * STEALTH KBE: Retrieval time = Self-Efficacy / Recall (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'knowing', 'Circuit');
type Stage = 'arriving' | 'searching' | 'shelved' | 'resonant' | 'afterglow';

export default function Mentat_MemoryArchive({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [win, setWin] = useState('');
  const startRef = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setWin(val),
    onAccept: () => {
      if (!win.trim()) return;
      const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
      console.log(`[KBE:K] MemoryArchive pastWin="${win.trim()}" retrievalTimeS=${elapsed} selfEfficacy=confirmed`);
      setStage('shelved');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => { setStage('searching'); startRef.current = Date.now(); }, 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '18px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.03 + i * 0.005, 1) }} />
              ))}
            </motion.div>
        )}
        {stage === 'searching' && (
          <motion.div key="se" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The library. The "Confidence" shelf is empty. Drag a past win onto it. What did you succeed at?
            </div>
            {/* Library shelf */}
            <div style={{ width: '120px', height: '40px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.025, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint, fontStyle: 'italic' }}>
                {win ? win : '[ Confidence: Empty ]'}
              </span>
            </div>
            <input type="text" value={win} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="A time you succeeded..."
              style={{ width: '160px', padding: '6px 10px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                opacity: win.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Shelve</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'shelved' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Shelved. The evidence is filed. You forgot you are competent — the data was in the archive, but the "Confidence" shelf was empty because you stopped looking. Self-doubt is a retrieval failure, not a data failure. The wins exist. You just need to access them.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-efficacy and memory retrieval. Bandura{"'"}s research: self-efficacy (belief in your ability to succeed) is the strongest predictor of behavior change — stronger than motivation, knowledge, or skill. Self-efficacy is built from "mastery experiences" — past successes. Depression and anxiety create a negativity bias in memory retrieval, making it harder to access positive memories. The archive exercise counteracts this by forcing conscious retrieval of competence evidence.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Archived.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}