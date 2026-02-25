/**
 * INTUITION #2 — The Coin Flip (The Reveal)
 * "The coin doesn't decide. The coin forces YOU to decide."
 * Pattern D (Type) — Type what you're hoping for while coin spins
 * STEALTH KBE: Speed of hope entry = Access to Subconscious Desire (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'knowing', 'Practice');
type Stage = 'arriving' | 'spinning' | 'revealed' | 'resonant' | 'afterglow';

export default function Intuition_CoinFlip({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [hope, setHope] = useState('');
  const [flipping, setFlipping] = useState(false);
  const startRef = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setHope(val),
    onAccept: () => {
      if (!hope.trim()) return;
      const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
      console.log(`[KBE:K] CoinFlip hope="${hope.trim()}" desireAccessTimeS=${elapsed} subconsciousDesire=confirmed`);
      setStage('revealed');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('spinning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    startRef.current = Date.now();
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            {!flipping ? (
              <>
                <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                  A gold coin. Heads: Go. Tails: Stay. Flip it.
                </div>
                <motion.div whileTap={{ scale: 0.85 }} onClick={flip}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.08, 4),
                    border: `2px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '14px', color: themeColor(TH.accentHSL, 0.4, 12) }}>⟳</span>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '40px', height: '40px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.08, 4),
                    border: `2px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
                <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.35, 10), textAlign: 'center', fontStyle: 'italic' }}>
                  While it spins, what are you hoping for?
                </div>
                <input type="text" value={hope} onChange={(e) => typeInt.onChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
                  placeholder="I'm hoping for..."
                  autoFocus
                  style={{ width: '160px', padding: '6px 10px', borderRadius: radius.sm,
                    background: themeColor(TH.primaryHSL, 0.02, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                    color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
                <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
                  style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.08, 4),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                    opacity: hope.trim() ? 1 : 0.4 }}>
                  <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Catch</span>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            You were hoping for: "{hope}." The coin didn{"'"}t decide. The coin forced you to decide. While it spun, your secret wish was revealed. Catch the wish, not the coin. The answer was always inside; you just needed permission to hear it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The coin flip heuristic. When you flip a coin and feel disappointed by the result, you{"'"}ve learned your true preference. The coin doesn{"'"}t provide information about the world; it provides information about YOU. This is an accessibility hack for the unconscious: by creating a forced binary, you bypass the rumination loop and access the pre-decisional preference that was always there.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Revealed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}