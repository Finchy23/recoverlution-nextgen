/**
 * SOCIAL PHYSICS #7 — The "Yes, And" Weaver
 * "'No' stops the flow. 'Yes, And' builds the future."
 * ARCHETYPE: Pattern A (Tap) — Select the response that incorporates opponent's input
 * ENTRY: Scene-first — two frayed threads
 * STEALTH KBE: Choosing integrative response = Cognitive Flexibility (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'active' | 'woven' | 'resonant' | 'afterglow';

const RESPONSES = [
  { id: 'block', label: '"No, that won\'t work."', integrative: false },
  { id: 'yesand', label: '"Yes, and what if we also..."', integrative: true },
  { id: 'ignore', label: '"Let\'s do my idea instead."', integrative: false },
];

export default function SocialPhysics_YesAndWeaver({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<string | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const choose = (id: string) => {
    if (stage !== 'active') return;
    setChoice(id);
    const success = id === 'yesand';
    console.log(`[KBE:K] YesAndWeaver choice=${id} integrative=${success} cognitiveFlexibility=${success}`);
    setStage('woven');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ width: '60px', height: '3px', background: 'hsla(0, 30%, 40%, 0.3)', borderRadius: '2px' }} />
              <div style={{ width: '60px', height: '3px', background: themeColor(TH.accentHSL, 0.2, 8), borderRadius: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>frayed</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              They proposed an idea you disagree with. How do you respond?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {RESPONSES.map(r => (
                <motion.div key={r.id} whileTap={{ scale: 0.97 }} onClick={() => choose(r.id)}
                  style={{ padding: '12px 16px', borderRadius: radius.lg, cursor: 'pointer',
                    background: themeColor(r.integrative ? TH.accentHSL : TH.primaryHSL, 0.06, 3),
                    border: `1px solid ${themeColor(r.integrative ? TH.accentHSL : TH.primaryHSL, 0.1, 6)}` }}>
                  <div style={{ ...navicueType.texture, color: palette.text, fontSize: '12px' }}>{r.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'woven' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'yesand' ? (
              <>
                <motion.div initial={{ width: '0px' }} animate={{ width: '140px' }} transition={{ duration: 1.2 }}
                  style={{ height: '4px', borderRadius: '2px',
                    background: `linear-gradient(to right, hsla(0, 30%, 40%, 0.3), ${themeColor(TH.accentHSL, 0.3, 10)})` }} />
                <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
                  Two threads became one rope. Stronger together than apart.
                </div>
              </>
            ) : (
              <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
                The thread snapped. Blocking stops the flow. Next time, try weaving.
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Creative synthesis. "Yes, And" is the foundation of improv and innovation. Taking their input and steering it forward demonstrates cognitive flexibility: the ability to hold two ideas without discarding either.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Woven.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}