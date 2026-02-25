/**
 * BIOGRAPHER #1 — The Origin Story (Narrative Identity / Reframing)
 * "The event remains the same. The meaning is yours to choose."
 * ARCHETYPE: Pattern D (Type) — Type a damage statement, AI crosses out and rewrites
 * ENTRY: Instruction-as-poetry — dusty book page appears with poetic preamble
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'active' | 'rewriting' | 'resonant' | 'afterglow';

const REWRITES: Record<string, string> = {
  damaged: 'forged', broken: 'rebuilt', weak: 'tested', lost: 'searching',
  failure: 'first draft', worthless: 'unfinished', stupid: 'learning',
  alone: 'sovereign', ugly: 'unpolished', hopeless: 'pre-dawn',
};

function rewrite(text: string): string {
  const lower = text.toLowerCase().trim();
  for (const [key, val] of Object.entries(REWRITES)) {
    if (lower.includes(key)) return text.replace(new RegExp(key, 'i'), val.toUpperCase());
  }
  return text.replace(/^I am /i, 'I was ').replace(/\.$/, '') + ' \u2014 and then I chose differently.';
}

export default function Biographer_OriginStory({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [original, setOriginal] = useState('');
  const [rewritten, setRewritten] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    minLength: 5,
    onAccept: (text: string) => {
      setOriginal(text);
      setRewritten(rewrite(text));
      setStage('rewriting');
      t(() => setStage('resonant'), 6000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2600);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            an old, dusty page turns open...
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              It was not a tragedy. It was an origin story. Write the old caption {'\u2014'} the damage label you carry.
            </div>
            <div style={{ padding: '16px', borderRadius: radius.sm, width: '250px',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              <input value={type.value} onChange={(e) => type.onChange(e.target.value)}
                placeholder="I am..."
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: palette.text, fontSize: '14px', fontFamily: 'serif', fontStyle: 'italic' }} />
            </div>
            {type.value.length >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={type.submit}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer' }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>edit the caption</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'rewriting' && (
          <motion.div key="rw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '280px' }}>
            <div style={{ padding: '16px', borderRadius: radius.sm, width: '100%',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '14px', fontFamily: 'serif', fontStyle: 'italic', color: palette.textFaint,
                  textDecoration: 'line-through', textDecorationColor: themeColor(TH.accentHSL, 0.3, 12) }}>
                  {original}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}
                  style={{ marginTop: '12px', fontSize: '15px', fontFamily: 'serif', fontWeight: 600,
                    color: themeColor(TH.accentHSL, 0.5, 18) }}>
                  {rewritten}
                </motion.div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 2.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>rewritten in gold ink</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Narrative Identity. People who frame their lives as stories of redemption rather than contamination show significantly higher mental health outcomes. The event remains. The meaning is yours.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Origin story.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}