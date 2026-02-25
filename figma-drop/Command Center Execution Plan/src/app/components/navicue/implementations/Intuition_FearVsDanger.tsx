/**
 * INTUITION #9 — Fear vs. Danger
 * "Fear means you are growing. Danger means you are dying. Learn the difference."
 * Pattern A (Tap) — Categorize as Fear or Danger
 * STEALTH KBE: Labeling correctly = Cognitive Reappraisal / Discernment (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'believing', 'Practice');
type Stage = 'arriving' | 'radar' | 'categorized' | 'resonant' | 'afterglow';

export default function Intuition_FearVsDanger({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [label, setLabel] = useState<'fear' | 'danger' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('radar'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const categorize = (c: 'fear' | 'danger') => {
    if (stage !== 'radar') return;
    setLabel(c);
    console.log(`[KBE:B] FearVsDanger label=${c} discernment=confirmed cognitiveReappraisal=${c === 'fear'}`);
    setStage('categorized');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2, rotate: 360 }}
            transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' } }}
            style={{ width: '24px', height: '24px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
        )}
        {stage === 'radar' && (
          <motion.div key="ra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A radar screen. A blip appears. Is it a Tiger (Danger) or a Shadow (Fear)? Scan it.
            </div>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', position: 'relative',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', top: '50%', left: '50%', width: '33px', height: '1px',
                  background: themeColor(TH.accentHSL, 0.1, 5), transformOrigin: '0 0' }} />
              <motion.div animate={{ opacity: [0.15, 0.05, 0.15] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ position: 'absolute', top: '18px', right: '18px', width: '6px', height: '6px',
                  borderRadius: '50%', background: themeColor(TH.accentHSL, 0.15, 6) }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => categorize('fear')}
                style={{ padding: '8px 16px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Shadow (Fear)</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => categorize('danger')}
                style={{ padding: '8px 16px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Tiger (Danger)</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'categorized' && (
          <motion.div key="ca" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {label === 'fear'
              ? 'Shadow. Just fear. Not danger. Fear means you are growing — it is the edge of your comfort zone, not the edge of a cliff. Walk toward it. Public speaking, vulnerability, a hard conversation — these are shadows, not tigers. The amygdala fires the same alarm for both. YOUR job is discernment.'
              : 'Tiger. Real danger. Respect it. Not all fear is irrational — some is protective. The skill is discernment: is this my nervous system warning me of genuine harm, or is it triggering a false alarm? If the tiger is real, retreat is wisdom, not cowardice.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Fear vs. danger. Joseph LeDoux{"'"}s dual-pathway model: the amygdala processes threats via a "low road" (fast, crude) and a "high road" (slow, accurate). The low road cannot distinguish between a real tiger and a shadow that looks like a tiger. Cognitive reappraisal — consciously re-labeling the threat — activates the prefrontal cortex to override the amygdala{"'"}s false alarm. The label changes the physiology.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Scanned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
