/**
 * ALCHEMIST IV #3 - The Fear Compass
 * "Fear is a signal. Calibrate the needle."
 * Pattern A (Tap) - Compass spinning, categorize as Danger or Growth
 * STEALTH KBE: Distinguishing anxiety from danger = Emotional Granularity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'knowing', 'Ember');
type Stage = 'arriving' | 'spinning' | 'calibrated' | 'resonant' | 'afterglow';

export default function AlchemistIV_FearCompass({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [reading, setReading] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('spinning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const calibrate = (dir: string) => {
    if (stage !== 'spinning') return;
    setReading(dir);
    console.log(`[KBE:K] FearCompass reading="${dir}" emotionalGranularity=confirmed differentiation=true`);
    setStage('calibrated');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your fear compass is spinning. It points to Danger and Growth - often the same direction. Which is it right now?
            </div>
            {/* Compass */}
            <svg width="70" height="70" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="30" fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
              <motion.g initial={{ rotate: 0 }} animate={{ rotate: [0, 720] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '35px 35px' }}>
                <line x1="35" y1="10" x2="35" y2="35" stroke="hsla(0, 20%, 30%, 0.08)" strokeWidth="2" />
                <line x1="35" y1="35" x2="35" y2="60" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="2" />
              </motion.g>
              <circle cx="35" cy="35" r="3" fill={themeColor(TH.accentHSL, 0.08, 4)} />
              <text x="35" y="7" textAnchor="middle" fill="hsla(0, 15%, 30%, 0.12)" fontSize="6">Danger</text>
              <text x="35" y="68" textAnchor="middle" fill={themeColor(TH.accentHSL, 0.15, 8)} fontSize="6">Growth</text>
            </svg>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ label: 'Danger', desc: 'Run away (Tiger)', color: 'hsla(0, 15%, 25%, 0.06)' },
                { label: 'Growth', desc: 'Pay attention (Stage)', color: themeColor(TH.accentHSL, 0.06, 3) }].map(opt => (
                <motion.div key={opt.label} whileTap={{ scale: 0.9 }} onClick={() => calibrate(opt.label)}
                  style={{ padding: '12px 14px', borderRadius: radius.md, cursor: 'pointer',
                    background: opt.color, border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>{opt.label}</span>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>{opt.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'calibrated' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Calibrated: {reading}. Fear is a signal, not a sentence. Is it saying "run away" (tiger) or "pay attention" (stage)? The compass doesn{"'"}t eliminate fear - it classifies it. Danger and growth often point the same direction, but the body{"'"}s response tells you which one you{"'"}re facing. Calibrate the needle.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional granularity. Lisa Feldman Barrett{"'"}s research: people who can differentiate between similar negative emotions (anxiety vs. fear vs. excitement) regulate more effectively. The concept of "emotional granularity" - fine-grained distinctions - is a learnable skill. High granularity predicts better mental health, better decision-making, and lower reactivity. The compass is the tool.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Calibrated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}