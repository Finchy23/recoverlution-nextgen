/**
 * SOCIAL PHYSICS #3 — The Silent Mirror
 * "Silence is a vacuum. They will rush to fill it with the truth."
 * ARCHETYPE: Pattern A (Wait) — Greyed keyboard + countdown timer
 * ENTRY: Cold open — accusation text appears
 * STEALTH KBE: Tapping greyed keys = impulse failure; waiting = Self-Regulation (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'active' | 'waited' | 'resonant' | 'afterglow';

export default function SocialPhysics_SilentMirror({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [countdown, setCountdown] = useState(5);
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    if (countdown <= 0) {
      console.log(`[KBE:E] SilentMirror impulseTaps=${taps} selfRegulation=${taps === 0}`);
      setStage('waited');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      return;
    }
    const id = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [stage, countdown]);

  const tapKey = () => { if (stage === 'active') setTaps(n => n + 1); };

  const keyRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px 18px', borderRadius: radius.lg,
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 6)}` }}>
              <div style={{ ...navicueType.texture, color: 'hsla(0, 40%, 45%, 0.6)' }}>
                "This is all your fault!"
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ padding: '12px 18px', borderRadius: radius.lg,
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 6)}` }}>
              <div style={{ ...navicueType.texture, color: 'hsla(0, 40%, 45%, 0.6)' }}>
                "This is all your fault!"
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'waited' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              {taps === 0 ? 'Perfect silence. You let the vacuum do the work.' : `You reached for the keys ${taps} time${taps > 1 ? 's' : ''}. The impulse is real, and now you see it.`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Inhibitory control. Silence in conflict is a strategic tool. The urge to respond is the amygdala firing. Waiting activates the prefrontal cortex. Let the silence do the heavy lifting.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Silent.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}