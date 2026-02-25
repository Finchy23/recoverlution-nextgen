/**
 * TRICKSTER #1 — The Absurdity Filter
 * "The problem is real. The anxiety is a performance. Change the soundtrack."
 * ARCHETYPE: Pattern A (Tap) — Tap to apply the "Clown" filter
 * ENTRY: Reverse reveal — serious form → comic transformation
 * STEALTH KBE: Engaging with filter = Humor as Coping (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'serious' | 'filtered' | 'resonant' | 'afterglow';

const PROBLEMS = ['TAX FORM 1040-EZ', 'QUARTERLY REPORT DUE', 'PERFORMANCE REVIEW', 'MORTGAGE APPLICATION'];

export default function Trickster_AbsurdityFilter({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [problem] = useState(() => PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('serious'), 1800); return () => T.current.forEach(clearTimeout); }, []);

  const applyFilter = () => {
    if (stage !== 'serious') return;
    console.log(`[KBE:B] AbsurdityFilter humorAdoption=engaged humorAsCoping=confirmed`);
    setStage('filtered');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '70px', height: '50px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '3px', background: themeColor(TH.primaryHSL, 0.06, 4) }} />
          </motion.div>
        )}
        {stage === 'serious' && (
          <motion.div key="ser" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ padding: '14px 22px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                color: themeColor(TH.primaryHSL, 0.25, 12), textTransform: 'uppercase' }}>
                {problem}
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: '2px', flex: 1, borderRadius: '1px',
                    background: themeColor(TH.primaryHSL, 0.06, 4) }} />
                ))}
              </div>
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
              very serious. very important.
            </div>
            <motion.div whileTap={{ scale: 0.9, rotate: 5 }} onClick={applyFilter}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>
                Apply clown filter
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'filtered' && (
          <motion.div key="f" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <motion.div animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ padding: '14px 22px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <div style={{ fontSize: '12px', fontFamily: 'cursive, fantasy, serif', fontStyle: 'italic',
                color: themeColor(TH.accentHSL, 0.4, 16), textAlign: 'center', letterSpacing: '0.02em' }}>
                ~ {problem.toLowerCase()} ~
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'center' }}>
                {['◇', '○', '◇'].map((e, i) => (
                  <motion.span key={i} animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                    style={{ fontSize: '11px' }}>{e}</motion.span>
                ))}
              </div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Same problem. Different soundtrack. If you can laugh at the dragon, it shrinks.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Gelotology: the science of laughter. The problem is real; the anxiety is a performance. Humor doesn{"'"}t dismiss the problem, it changes your relationship to it. Cortisol drops 40% when you laugh. The dragon shrinks when you stop feeding it seriousness.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Lighter.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}