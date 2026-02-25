/**
 * ZERO POINT #2 — The Un-Naming (Semantic Satiation)
 * "Language is a filter. Remove the word. See it raw."
 * STEALTH KBE: De-Labeling — describe without naming = Phenomenological Perception (K)
 * Web: useTypeInteraction — type description of object without using its name
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'De-Labeling', 'knowing', 'Ocean');
type Stage = 'arriving' | 'peel' | 'describe' | 'resonant' | 'afterglow';

const OBJECTS = ['Chair', 'Tree', 'Cloud', 'River', 'Fire'];

export default function Void_UnNaming({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [object] = useState(() => OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
  const [labelGone, setLabelGone] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typing = useTypeInteraction({
    onAccept: (text: string) => {
      const usedName = text.toLowerCase().includes(object.toLowerCase());
      console.log(`[KBE:K] UnNaming object=${object} usedName=${usedName} phenomenological=${!usedName}`);
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => {
    t(() => setStage('peel'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const peelLabel = () => {
    setLabelGone(true);
    t(() => setStage('describe'), 2000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="De-Labeling" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'peel' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: radius.md,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', color: themeColor(TH.accentHSL, 0.12, 5) }}>
                {object === 'Chair' ? '\u{1FA91}' : object === 'Tree' ? '\u{1F333}' : object === 'Cloud' ? '\u2601' : object === 'River' ? '\u{1F30A}' : '\u{1F525}'}
              </span>
            </div>
            <motion.div
              animate={labelGone ? { opacity: 0, y: 20, scale: 0.5 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.5 }}
              onClick={peelLabel}
              style={{ padding: '4px 16px', borderRadius: radius.sm, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }}>
              <span style={{ fontSize: '11px', color: palette.text }}>{object}</span>
            </motion.div>
            {!labelGone && (
              <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', fontSize: '11px' }}>
                Tap the label to peel it off
              </div>
            )}
          </motion.div>
        )}
        {stage === 'describe' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Describe what you see — without using the word "{object}."
            </div>
            <textarea
              value={typing.value}
              onChange={(e) => typing.onChange(e.target.value)}
              placeholder="A shape that..."
              style={{ width: '240px', height: '60px', resize: 'none', borderRadius: radius.sm, padding: '8px',
                background: themeColor(TH.primaryHSL, 0.02, 0), color: palette.text,
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
                fontSize: '10px', fontFamily: 'inherit', outline: 'none' }}
            />
            <motion.div whileTap={{ scale: 0.95 }}
              onClick={() => { if (typing.value.length > 5) typing.submit(); }}
              style={{ padding: '6px 16px', borderRadius: radius.md, cursor: typing.value.length > 5 ? 'pointer' : 'default',
                opacity: typing.value.length > 5 ? 1 : 0.3,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: palette.textFaint }}>SEE IT RAW</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Semantic satiation (Severance & Washburn, 1907): repeat any word enough and it loses meaning. Language is a compression algorithm. Without the label, the raw thing returns: shape, texture, warmth. This is phenomenological perception: seeing before naming.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Unnamed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}