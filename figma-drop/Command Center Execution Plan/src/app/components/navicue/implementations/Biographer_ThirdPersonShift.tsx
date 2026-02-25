/**
 * BIOGRAPHER #3 — The Third-Person Shift (Illeism / Self-Distancing)
 * "Step out of the body. Watch the character. What would the audience scream?"
 * ARCHETYPE: Pattern D (Type) — Write advice to the character on screen
 * ENTRY: Instruction-as-poetry — camera pulls back description
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'active' | 'advising' | 'resonant' | 'afterglow';

export default function Biographer_ThirdPersonShift({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [advice, setAdvice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    minLength: 8,
    onAccept: (text: string) => {
      setAdvice(text);
      setStage('advising');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', maxWidth: '240px' }}>
            the camera pulls back. you see a character in a scene.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            {/* The scene */}
            <div style={{ padding: '14px 18px', borderRadius: radius.sm, width: '260px',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.08, 6) }} />
                <div style={{ fontSize: '13px', fontFamily: 'serif', fontStyle: 'italic',
                  color: palette.text }}>
                  They were overwhelmed. They didn't know what to do next.
                </div>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Step out of the body. Watch the character. What would the audience scream at the screen?
            </div>
            <textarea value={type.value} onChange={(e) => type.onChange(e.target.value)}
              placeholder="Tell them what they need to hear..."
              style={{ width: '240px', minHeight: '60px', padding: '12px', borderRadius: radius.md, resize: 'none',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                color: palette.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
            {type.value.length >= 8 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={type.submit}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>tell them</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'advising' && (
          <motion.div key="adv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <div style={{ padding: '14px', borderRadius: radius.sm, width: '100%',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
              <div style={{ fontSize: '13px', fontFamily: 'serif', color: themeColor(TH.accentHSL, 0.4, 15),
                fontStyle: 'italic', textAlign: 'center' }}>
                "{advice}"
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              they heard you. now hear yourself.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Illeism. Speaking about yourself in the third person significantly reduces emotional egocentricity and improves regulation. The advice you gave the character {'\u2014'} that was for you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>They heard you.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}