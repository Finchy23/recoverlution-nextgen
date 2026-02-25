/**
 * SCHRODINGER #6 — The Random Act
 * "Routine is a cage. Break the bars. Do something the algorithm didn't predict."
 * ARCHETYPE: Pattern A (Tap) — Tap to spin the slot reel
 * ENTRY: Cold Open — slot machine whirs to life
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'cold' | 'active' | 'spinning' | 'resonant' | 'afterglow';

const ACTIONS = [
  'Text someone you haven\u2019t spoken to in 90 days.',
  'Walk outside for 5 minutes with no destination.',
  'Write one sentence about what you\u2019re afraid of.',
  'Do 10 pushups. Right now. No thinking.',
  'Call the person whose name just appeared in your mind.',
  'Eat something you\u2019ve never tried before today.',
  'Give a genuine compliment to the next person you see.',
  'Sit in complete silence for 120 seconds.',
];

export default function Schrodinger_RandomAct({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [action, setAction] = useState('');
  const [flickering, setFlickering] = useState(true);
  const [flickerText, setFlickerText] = useState('');
  const T = useRef<number[]>([]);
  const flickerRef = useRef<number | null>(null);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 1500);
    return () => { T.current.forEach(clearTimeout); if (flickerRef.current) clearInterval(flickerRef.current); };
  }, []);

  const spin = () => {
    if (!flickering && action) return;
    setStage('spinning');
    flickerRef.current = window.setInterval(() => {
      setFlickerText(ACTIONS[Math.floor(Math.random() * ACTIONS.length)]);
    }, 80);
    t(() => {
      if (flickerRef.current) clearInterval(flickerRef.current);
      const pick = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      setAction(pick);
      setFlickering(false);
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
    }, 1800);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.3, 0.7] }}
            transition={{ duration: 1.5 }} exit={{ opacity: 0 }}
            style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.3em', color: palette.text }}>
            SPIN
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Routine is a cage. Break the bars. Surprise the system. Do something the algorithm didn't predict.
            </div>
            <motion.div onClick={spin} whileTap={{ scale: 0.95 }}
              style={{ padding: '12px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.1, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 10)}` }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to spin</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <div style={{ padding: '16px 20px', borderRadius: radius.md,
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 8)}`,
              minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ ...navicueType.hint, color: flickering ? palette.textFaint : palette.text,
                textAlign: 'center', transition: 'color 0.3s' }}>
                {flickering ? flickerText : action}
              </div>
            </div>
            {!flickering && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.15em',
                  color: themeColor(TH.accentHSL, 0.25, 12) }}>YOUR ASSIGNMENT</motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Behavioral activation. Novel, semi-random behaviors disrupt depressive loops and increase the probability of positive reinforcement from the environment. Chaos is medicine when routine becomes a cage.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Surprise the system.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}