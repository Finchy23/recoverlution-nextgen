/**
 * SAGE #7 — The Wu Wei (Effortless Action)
 * "Stop fighting the current. The river knows the way."
 * Pattern A (Tap) — Tap fast = exhaust; stop tapping = river carries you
 * STEALTH KBE: Trusting the flow by stopping = Surrender / Ease over Effort (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'believing', 'Practice');
type Stage = 'arriving' | 'swimming' | 'carried' | 'resonant' | 'afterglow';

export default function Sage_WuWei({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [energy, setEnergy] = useState(100);
  const [tapping, setTapping] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const idleRef = useRef<number | null>(null);
  const lastTapRef = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('swimming'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'swimming') return;
    idleRef.current = window.setInterval(() => {
      const since = Date.now() - lastTapRef.current;
      if (since > 2000 && lastTapRef.current > 0) {
        setIdleTime(prev => {
          const next = prev + 300;
          if (next >= 3000) {
            console.log(`[KBE:B] WuWei surrender=confirmed easeOverEffort=true`);
            setStage('carried');
            t(() => setStage('resonant'), 5000);
            t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
          }
          return next;
        });
      }
    }, 300);
    return () => { if (idleRef.current) clearInterval(idleRef.current); };
  }, [stage]);

  const swim = () => {
    if (stage !== 'swimming') return;
    lastTapRef.current = Date.now();
    setIdleTime(0);
    setTapping(true);
    setEnergy(e => Math.max(0, e - 8));
    setTimeout(() => setTapping(false), 100);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ x: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <div style={{ width: '30px', height: '4px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.04, 2) }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'swimming' && (
          <motion.div key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A river. You are swimming upstream. Tap fast to fight the current... or stop. See what happens.
            </div>
            {/* River */}
            <div style={{ position: 'relative', width: '120px', height: '40px', overflow: 'hidden' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  animate={{ x: [-20, 140] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
                  style={{ position: 'absolute', top: `${8 + i * 7}px`, width: '16px', height: '2px', borderRadius: '1px',
                    background: themeColor(TH.accentHSL, 0.04, 2) }} />
              ))}
            </div>
            {/* Energy bar */}
            <div style={{ width: '80px', height: '6px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}`, overflow: 'hidden' }}>
              <div style={{ width: `${energy}%`, height: '100%',
                background: energy > 40 ? themeColor(TH.accentHSL, 0.06, 3) : 'hsla(0, 15%, 25%, 0.06)',
                transition: 'width 0.2s' }} />
            </div>
            <span style={{ ...navicueType.status, color: palette.textFaint }}>
              Energy: {energy}% {energy < 30 ? '; exhausted' : ''}
            </span>
            <motion.div whileTap={{ scale: 0.85 }} onClick={swim}
              animate={{ scale: tapping ? 0.9 : 1 }}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Swim ↑</div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              {lastTapRef.current > 0 && idleTime > 500 ? 'The current is carrying you...' : 'Or... stop?'}
            </div>
          </motion.div>
        )}
        {stage === 'carried' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Carried. You stopped fighting and the river brought you exactly where you needed to go. Stop fighting the current. The river knows the way. Lift your feet. Let the Tao carry you. Wu Wei is not laziness — it is alignment. When you stop forcing, the natural order takes over. The effort was the obstacle.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Wu Wei ({"無為"}). The Daoist principle of "effortless action" — not inaction, but action aligned with the natural flow. Csikszentmihalyi{"'"}s "flow state" is the Western parallel: when effort disappears and performance peaks. Neuroscience: flow states involve transient hypofrontality — the prefrontal cortex (the "trying" brain) quiets down, and the implicit system takes over. You don{"'"}t try to flow. You stop trying, and flow happens.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Carried.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}