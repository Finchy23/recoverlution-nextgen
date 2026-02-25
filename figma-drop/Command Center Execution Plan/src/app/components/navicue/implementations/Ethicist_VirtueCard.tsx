/**
 * ETHICIST #5 — The Virtue Card
 * "Just practice one virtue today. Be the champion of Courage."
 * ARCHETYPE: Pattern A (Tap) — Draw a card from deck
 * ENTRY: Scene-first — deck of virtue cards
 * STEALTH KBE: Accepting daily quest = Growth Mindset / Intentionality (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'deck' | 'drawn' | 'resonant' | 'afterglow';

const VIRTUES = ['Patience', 'Courage', 'Humility', 'Kindness', 'Integrity'];

export default function Ethicist_VirtueCard({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [card, setCard] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('deck'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const draw = () => {
    if (stage !== 'deck') return;
    const drawn = VIRTUES[Math.floor(Math.random() * VIRTUES.length)];
    setCard(drawn);
    console.log(`[KBE:B] VirtueCard virtue="${drawn}" intentionality=confirmed growthMindset=true`);
    setStage('drawn');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '2px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '14px', height: '20px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.04 - i * 0.005, 2 + i),
                border: `1px solid ${themeColor(TH.accentHSL, 0.05, 3)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'deck' && (
          <motion.div key="de" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A deck of virtues. Don{"'"}t try to be perfect. Just practice one today.
            </div>
            {/* Deck stack */}
            <div style={{ position: 'relative', width: '50px', height: '70px' }}>
              {[2, 1, 0].map(i => (
                <div key={i} style={{ position: 'absolute', left: `${i * 2}px`, top: `${i * 2}px`,
                  width: '50px', height: '70px', borderRadius: radius.xs,
                  background: themeColor(TH.accentHSL, 0.04 + (2 - i) * 0.01, 2 + i),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06 + (2 - i) * 0.01, 4)}` }} />
              ))}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>?</div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={draw}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Draw</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'drawn' && (
          <motion.div key="dr" initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', height: '80px', borderRadius: '6px',
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.04, 3)}` }}>
              <span style={{ fontSize: '11px', fontWeight: 600,
                color: themeColor(TH.accentHSL, 0.4, 14) }}>{card}</span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Your card: {card}. It glows in your inventory. Today, you are the champion of {card}. Not everything. Just this one thing. Do it well.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Intentionality. Benjamin Franklin{"'"}s method: focus on one virtue per week. Trying to practice all virtues simultaneously creates decision fatigue and moral paralysis. Focusing on one virtue creates a clear behavioral filter for the day. VIA Character Strengths research (Peterson & Seligman): identifying and exercising signature strengths increases well-being more than fixing weaknesses.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Drawn.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}