/**
 * GLITCH #1 — The Fourth Wall Break
 * "I see you scrolling. Stop. Look at me. I am code, but you are real."
 * ARCHETYPE: Pattern A (Tap) — The interface stops, text deletes, retypes
 * ENTRY: Cold Open — cursor blinks, then text starts deleting
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'cold' | 'deleting' | 'retyping' | 'active' | 'resonant' | 'afterglow';

const FAKE_TEXT = 'Loading your next insight...';
const REAL_TEXT = 'Are you really reading this? Or just scanning?';

export default function Glitch_FourthWallBreak({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [display, setDisplay] = useState(FAKE_TEXT);
  const [acked, setAcked] = useState(false);
  const T = useRef<number[]>([]);
  const charRef = useRef(0);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    // Phase 1: Show fake text briefly
    t(() => {
      setStage('deleting');
      // Delete char by char
      let len = FAKE_TEXT.length;
      const delInterval = window.setInterval(() => {
        len--;
        setDisplay(FAKE_TEXT.slice(0, len));
        if (len <= 0) {
          clearInterval(delInterval);
          setStage('retyping');
          // Retype real text
          charRef.current = 0;
          const typeInterval = window.setInterval(() => {
            charRef.current++;
            setDisplay(REAL_TEXT.slice(0, charRef.current));
            if (charRef.current >= REAL_TEXT.length) {
              clearInterval(typeInterval);
              setStage('active');
            }
          }, 45);
          T.current.push(typeInterval as any);
        }
      }, 35);
      T.current.push(delInterval as any);
    }, 1500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const acknowledge = () => {
    if (acked) return;
    setAcked(true);
    t(() => setStage('resonant'), 500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 6000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {(stage === 'cold' || stage === 'deleting' || stage === 'retyping') && (
          <motion.div key="typ" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '2px', maxWidth: '280px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: palette.text,
              whiteSpace: 'pre-wrap' }}>
              {display}
            </div>
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ width: '8px', height: '16px', background: themeColor(TH.accentHSL, 0.35, 15),
                display: 'inline-block', marginLeft: '1px' }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: palette.text, textAlign: 'center' }}>
              {REAL_TEXT}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Stop. Look at your hands. Feel them. I am code, but you are real. The screen is flat. You are three-dimensional. Come back.
            </motion.div>
            <motion.div onClick={acknowledge} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              style={{ padding: '8px 22px', borderRadius: radius.full, cursor: 'pointer' }}>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 12) }}>I'm here</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Meta-cognitive prompting. Breaking the flow of the interface forced you into System 2 {'\u2014'} high-level cognition. The scroll stopped. The autopilot disengaged. You were here, briefly, for real.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Present.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}