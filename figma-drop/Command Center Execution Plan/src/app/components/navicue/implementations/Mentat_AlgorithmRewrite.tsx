/**
 * MENTAT #9 — The Algorithm Rewrite
 * "You are running outdated software. Rewrite the function."
 * ARCHETYPE: Pattern D (Type) — Edit the response variable
 * ENTRY: Scene-first — code view with hardwired response
 * STEALTH KBE: Editing response = Cognitive Restructuring / Neuroplasticity Agency (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'knowing', 'Circuit');
type Stage = 'arriving' | 'editing' | 'saved' | 'resonant' | 'afterglow';

export default function Mentat_AlgorithmRewrite({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [newResponse, setNewResponse] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setNewResponse(val),
    onAccept: () => {
      if (!newResponse.trim()) return;
      console.log(`[KBE:K] AlgorithmRewrite newResponse="${newResponse.trim()}" cognitiveRestructuring=confirmed neuroplasticity=true`);
      setStage('saved');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('editing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: palette.textFaint }}>{'if () { }'}</div>
          </motion.div>
        )}
        {stage === 'editing' && (
          <motion.div key="ed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Outdated code. The trigger is hardwired, but the response is programmable. Rewrite it.
            </div>
            {/* Code view */}
            <div style={{ width: '180px', padding: '10px', borderRadius: '6px', fontFamily: 'monospace',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
              <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6), marginBottom: '4px' }}>
                <span style={{ color: themeColor(TH.accentHSL, 0.15, 4) }}>if</span> (Criticism) {'{'}
              </div>
              <div style={{ fontSize: '11px', color: 'hsla(0, 12%, 30%, 0.15)', marginLeft: '8px', textDecoration: 'line-through' }}>
                return Shame;
              </div>
              <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10), marginLeft: '8px' }}>
                return {newResponse || '___'};
              </div>
              <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15, 4) }}>{'}'}</div>
            </div>
            <input type="text" value={newResponse} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="e.g. Curiosity"
              style={{ width: '140px', padding: '6px 10px', borderRadius: radius.sm, fontFamily: 'monospace',
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                opacity: newResponse.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Save ✓</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'saved' && (
          <motion.div key="sa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace',
              background: themeColor(TH.accentHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>
                if (Criticism) → {newResponse}
              </span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Saved. The old code deleted Shame. The new code returns {newResponse}. The trigger is the same; but the response is rewritten. You are running upgraded software now. The function has been patched.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive restructuring. Aaron Beck{"'"}s foundational CBT insight: you cannot always control the trigger (criticism arrives), but you can reprogram the response (shame → curiosity). Neuroplasticity: every time you practice a new response to an old trigger, you weaken the old neural pathway and strengthen the new one. 66 days of consistent practice creates automaticity (Phillippa Lally). The algorithm is rewritable. You are the programmer.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rewritten.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}