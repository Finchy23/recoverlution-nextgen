/**
 * SAGE #10 — The Legacy Stamp
 * "What will the room feel like after you leave it?"
 * INTERACTION: A wax seal slowly forms. You choose one word
 * that will outlive you, then press it into the seal.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Values Clarification', 'knowing', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const LEGACY_WORDS = ['Courage', 'Kindness', 'Truth', 'Presence', 'Joy', 'Service', 'Love', 'Freedom'];

export default function Sage_LegacyStamp({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleChoose = (word: string) => {
    if (chosen) return;
    setChosen(word);
  };

  const handlePress = () => {
    if (!chosen || pressed) return;
    setPressed(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Values Clarification" kbe="knowing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            What will the room feel like after you leave?
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Choose one word that will outlive you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>select, then press the seal</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            {/* Word selection */}
            {!pressed && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '280px' }}>
                {LEGACY_WORDS.map(word => {
                  const isChosen = chosen === word;
                  return (
                    <motion.button key={word} onClick={() => handleChoose(word)}
                      whileHover={!chosen ? { scale: 1.08 } : undefined}
                      animate={{ opacity: chosen ? (isChosen ? 1 : 0.15) : 0.6 }}
                      style={{ padding: '12px 18px', background: isChosen ? palette.primaryGlow : 'transparent', border: `1px solid ${isChosen ? palette.accent : palette.primaryFaint}`, borderRadius: radius.full, cursor: chosen ? 'default' : 'pointer', ...navicueType.choice, color: isChosen ? palette.text : palette.textFaint, fontSize: '13px', transition: 'all 0.3s' }}>
                      {word}
                    </motion.button>
                  );
                })}
              </div>
            )}
            {/* Wax seal */}
            <motion.div
              onClick={handlePress}
              animate={pressed ? { scale: [1, 0.92, 1], boxShadow: `0 0 40px ${palette.accentGlow}` } : { scale: 1 }}
              transition={pressed ? { duration: 0.6 } : {}}
              whileHover={chosen && !pressed ? { scale: 1.05 } : undefined}
              whileTap={chosen && !pressed ? { scale: 0.9 } : undefined}
              style={{ width: '100px', height: '100px', borderRadius: '50%', background: pressed ? `radial-gradient(circle, hsla(0, 40%, 35%, 0.7), hsla(0, 30%, 25%, 0.5))` : `radial-gradient(circle, ${palette.primaryGlow}, ${palette.primaryFaint})`, border: `1px solid ${pressed ? 'hsla(0, 35%, 45%, 0.5)' : palette.primaryFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chosen && !pressed ? 'pointer' : 'default' }}>
              {pressed && chosen && (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.8, scale: 1 }} transition={{ duration: 1 }}
                  style={{ ...navicueType.prompt, color: 'hsla(42, 60%, 65%, 0.9)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {chosen}
                </motion.div>
              )}
              {!pressed && chosen && (
                <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4, fontSize: '11px' }}>press</div>
              )}
            </motion.div>
            {!chosen && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>choose your word first</div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Sealed. {chosen}.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>This is what the room feels like after you leave.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The seal outlives the hand that pressed it.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}