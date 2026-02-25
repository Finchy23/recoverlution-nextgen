/**
 * ALCHEMIST IV #8 - The Anxiety Engine
 * "Anxiety is just kinetic energy without a job. Give it a job."
 * Pattern A (Tap) - Connect anxiety wire to a task; turbine spins
 * STEALTH KBE: Connecting anxiety to task = Anxiety-as-Fuel Reframing (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'believing', 'Ember');
type Stage = 'arriving' | 'spinning' | 'connected' | 'resonant' | 'afterglow';

const TASKS = ['Preparation', 'Exercise', 'Deep Clean', 'Writing'];

export default function AlchemistIV_AnxietyEngine({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [task, setTask] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('spinning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const connect = (tk: string) => {
    if (stage !== 'spinning') return;
    setTask(tk);
    console.log(`[KBE:B] AnxietyEngine task="${tk}" anxietyAsFuel=confirmed reframing=true`);
    setStage('connected');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}` }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A spinning turbine powered by nervous energy. It generates electricity - but it{"'"}s not connected to anything. Plug it in.
            </div>
            {/* Turbine */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <svg width="50" height="50" viewBox="0 0 50 50">
                {[0, 120, 240].map((angle, i) => (
                  <line key={i} x1="25" y1="25"
                    x2={25 + 18 * Math.cos(angle * Math.PI / 180)}
                    y2={25 + 18 * Math.sin(angle * Math.PI / 180)}
                    stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="3" strokeLinecap="round" />
                ))}
                <circle cx="25" cy="25" r="4" fill={themeColor(TH.accentHSL, 0.06, 3)} />
              </svg>
            </motion.div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
              {TASKS.map(tk => (
                <motion.div key={tk} whileTap={{ scale: 0.9 }} onClick={() => connect(tk)}
                  style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 2),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>{tk}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'connected' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Connected to: {task}. The turbine hums with purpose now. Anxiety is just kinetic energy without a job - give it a job. Spin the turbine. Turn the panic into preparation. The nervous system doesn{"'"}t distinguish between anxiety and excitement; the only difference is the story you tell about the arousal.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Anxiety reappraisal. Alison Wood Brooks (Harvard): telling yourself "I am excited" before a stressful event outperforms "I am calm." Why? Because anxiety and excitement share identical physiological signatures (elevated heart rate, cortisol, adrenaline). The body is already aroused - you cannot suppress the arousal, but you can redirect its label. This is the engine metaphor: same energy, different output.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Powered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}