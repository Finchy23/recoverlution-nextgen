/**
 * MULTIVERSE #10 — The Multiverse Seal (Meta-Cognition)
 * "You are the one looking at the mirror."
 * ARCHETYPE: Pattern A (Tap) — Smile at infinite mirrors
 * ENTRY: Cold open — hall of mirrors
 * STEALTH KBE: Completion = Meta-Cognition confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Identity Koan');
type Stage = 'arriving' | 'mirrors' | 'smiled' | 'resonant' | 'afterglow';

export default function Multiverse_MultiverseSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('mirrors'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const smile = () => {
    if (stage !== 'mirrors') return;
    console.log(`[KBE:K] MultiverseSeal metaCognition=confirmed observerIdentity=true`);
    setStage('smiled');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '10px', height: '18px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.03 - i * 0.005, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.04, 3)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'mirrors' && (
          <motion.div key="mi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Hall of mirrors */}
            <div style={{ display: 'flex', gap: '4px', perspective: '200px' }}>
              {[0.15, 0.2, 0.3, 0.2, 0.15].map((op, i) => (
                <motion.div key={i} animate={{ opacity: [op * 0.8, op, op * 0.8] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  style={{ width: `${14 - Math.abs(i - 2) * 2}px`,
                    height: `${24 - Math.abs(i - 2) * 3}px`, borderRadius: '2px',
                    background: themeColor(TH.accentHSL, op * 0.3, 3 + i),
                    border: `1px solid ${themeColor(TH.accentHSL, op * 0.4, 5)}` }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              Infinite versions of you. They all wait for you.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={smile}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Smile</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'smiled' && (
          <motion.div key="sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            They all smiled back. Infinite versions. Every self you{"'"}ve been, every self you could be — they are all reflections. But you? You are the one looking at the mirror. Not the reflections. The looker.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Meta-cognition. The ability to observe your own thoughts, identities, and patterns without being identified with any of them. This is the highest order of self-knowledge: not "Who am I?" but "Who is asking the question?" The one looking at the mirror is not any single reflection. It is the awareness itself — stable, observing, whole.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Multiverse.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}