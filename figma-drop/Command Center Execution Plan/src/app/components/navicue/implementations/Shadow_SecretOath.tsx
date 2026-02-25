/**
 * SHADOW WORKER #3 — The Secret Oath
 * "You made a vow at 5 years old. That vow is now a prison. Tear it up."
 * ARCHETYPE: Pattern B (Drag) — Drag to "tear" the contract
 * ENTRY: Cold open — dusty contract
 * STEALTH KBE: Force/completeness of tear = Resolution (E)
 * WEB ADAPTATION: Multi-touch tear → drag slider to tear
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Ocean');
type Stage = 'arriving' | 'active' | 'torn' | 'resonant' | 'afterglow';

const OATHS = ['never be weak', 'never need help', 'never be too happy', 'never outshine them', 'always stay small'];

export default function Shadow_SecretOath({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [oath] = useState(() => OATHS[Math.floor(Math.random() * OATHS.length)]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] SecretOath oathRevoked="${oath}" resolution=confirmed`);
      setStage('torn');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tearAmount = drag.progress;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '40px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              An old contract. Your signature, from childhood. Tear it up.
            </div>
            <div style={{ position: 'relative', width: '120px', height: '80px' }}>
              {/* Left half */}
              <motion.div style={{ position: 'absolute', left: 0, top: 0,
                width: '60px', height: '80px', borderRadius: '2px 0 0 2px',
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                borderRight: 'none',
                transform: `translateX(${-tearAmount * 15}px) rotate(${-tearAmount * 3}deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint, writingMode: 'vertical-rl' }}>I promise to</span>
              </motion.div>
              {/* Right half */}
              <motion.div style={{ position: 'absolute', right: 0, top: 0,
                width: '60px', height: '80px', borderRadius: '0 2px 2px 0',
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                borderLeft: 'none',
                transform: `translateX(${tearAmount * 15}px) rotate(${tearAmount * 3}deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>{oath}</span>
              </motion.div>
            </div>
            <div ref={drag.containerRef} style={{ width: '180px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.15, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.2, 10)}`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to tear</div>
          </motion.div>
        )}
        {stage === 'torn' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Revoked. The contract is void. You are safe now. The vow no longer binds you.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Childhood vows. You made a secret oath when you were small, to stay safe, to never be too much, to never need anyone. That vow was survival then. It{"'"}s a prison now. Tear up the contract. You are safe. You are grown.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Revoked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}