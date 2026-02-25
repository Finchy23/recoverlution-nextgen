/**
 * SAGE #6 — The Observer's Seat
 * "You are not the traffic. You are the one watching the traffic."
 * Pattern A (Tap) — Zoom out from chaotic scene to balcony; noise becomes hum
 * STEALTH KBE: Identifying thought without engaging = Meta-Cognitive Awareness / De-identification (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'knowing', 'Practice');
type Stage = 'arriving' | 'street' | 'zooming' | 'balcony' | 'resonant' | 'afterglow';

const TRAFFIC = ['I am late', 'They don\'t like me', 'What if I fail?', 'I should have...', 'Not enough time'];

export default function Sage_ObserverSeat({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tagged, setTagged] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('street'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tag = (thought: string) => {
    if (stage !== 'street') return;
    setTagged(thought);
  };

  const observe = () => {
    if (!tagged) return;
    setStage('zooming');
    t(() => {
      console.log(`[KBE:K] ObserverSeat thought="${tagged}" metaCognitiveAwareness=confirmed deIdentification=true`);
      setStage('balcony');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }, 1800);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                  style={{ width: '4px', height: '4px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'street' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A chaotic street scene — thoughts rushing by. Tag one without engaging. Then step back.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', maxWidth: '220px' }}>
              {TRAFFIC.map(th => (
                <motion.div key={th}
                  animate={{ x: [0, Math.random() * 4 - 2, 0] }}
                  transition={{ duration: 1 + Math.random(), repeat: Infinity }}
                  whileTap={{ scale: 0.9 }} onClick={() => tag(th)}
                  style={{ padding: '12px 18px', borderRadius: '6px', cursor: 'pointer',
                    background: tagged === th ? themeColor(TH.accentHSL, 0.06, 3) : themeColor(TH.primaryHSL, 0.02, 1),
                    border: `1px solid ${tagged === th ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.primaryHSL, 0.03, 2)}` }}>
                  <span style={{ ...navicueType.micro, color: tagged === th ? themeColor(TH.accentHSL, 0.35, 12) : palette.textFaint }}>
                    {th}
                  </span>
                </motion.div>
              ))}
            </div>
            {tagged && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileTap={{ scale: 0.9 }} onClick={observe}
                style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Step Back ↑</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'zooming' && (
          <motion.div key="z" initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0.6, scale: 0.7 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Zooming out...</div>
          </motion.div>
        )}
        {stage === 'balcony' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The balcony. The noise turned into a hum. You tagged: "{tagged}" — and stepped back. You are not the traffic. You are the one watching the traffic. The thought still exists down there, rushing by. But you{"'"}re up here now. Just watching. Not chasing it. Not running from it. Observing.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            De-identification. The "Observer Self" in ACT (Acceptance and Commitment Therapy): you are not your thoughts; you are the context in which thoughts arise. This is also the Buddhist concept of "witness consciousness" (sakshi) — the unchanging awareness behind changing mental content. Meta-cognitive awareness (Flavell, 1979): the ability to think about thinking. The balcony is always available. You just forget to go up there.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Observed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}