/**
 * SCHRODINGER #8 — The Oracle Deck
 * "It is not random. Your subconscious pulls the card it needs."
 * ARCHETYPE: Pattern A (Tap) — Tap a face-down card
 * ENTRY: Scene-first — three cards float into view
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'scene' | 'active' | 'flipped' | 'resonant' | 'afterglow';

const CARDS = [
  { symbol: '\u2660', message: 'Let go of something you are holding too tightly.' },
  { symbol: '\u2665', message: 'The next conversation you have: listen twice as long as you speak.' },
  { symbol: '\u2666', message: 'The answer is in your body, not your mind. Where do you feel tension right now?' },
];

export default function Schrodinger_OracleDeck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [picked, setPicked] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const flip = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setStage('flipped');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '10px' }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 * i }}
                style={{ width: '50px', height: '70px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.04, 6)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The answer you need is under one of these cards. Trust your hand. Let it move before the mind thinks.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {CARDS.map((_, i) => (
                <motion.div key={i} onClick={() => flip(i)}
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
                  style={{ width: '65px', height: '90px', borderRadius: radius.sm, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.1, 5),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.06, 8)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '16px', opacity: 0.08 }}>{'\u2727'}</div>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>choose one</div>
          </motion.div>
        )}
        {stage === 'flipped' && picked !== null && (
          <motion.div key="fl" initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.6 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '80px', height: '110px', borderRadius: radius.md,
              background: themeColor(TH.primaryHSL, 0.12, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 12)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '28px', color: themeColor(TH.accentHSL, 0.25, 15) }}>{CARDS[picked].symbol}</div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              {CARDS[picked].message}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Ideomotor phenomenon. Unconscious muscle movements are driven by subconscious expectations. Your hand "chose" the card your implicit knowledge already needed. There is no random; only pattern you can't yet see.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The hand knew.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}