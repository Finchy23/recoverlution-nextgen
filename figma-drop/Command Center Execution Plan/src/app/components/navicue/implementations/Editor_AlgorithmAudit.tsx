/**
 * EDITOR #3 — The Algorithm Audit
 * "Your attention is being mined. Hijack the algorithm."
 * ARCHETYPE: Pattern C (Hold) — Hold finger down to stop the scrolling feed
 * ENTRY: Cold open — feed scrolling fast
 * STEALTH KBE: Successfully holding still for 5s = Digital Autonomy (B)
 * WEB ADAPTATION: Hold-to-stop replaces gyroscope/accelerometer detection
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'stopped' | 'resonant' | 'afterglow';
const FEED_ITEMS = ['outrage', 'fear', 'envy', 'comparison', 'clickbait', 'anxiety', 'fomo', 'drama'];

export default function Editor_AlgorithmAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [scrollIdx, setScrollIdx] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      console.log(`[KBE:B] AlgorithmAudit feedStopped=true digitalAutonomy=confirmed`);
      setStage('stopped');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'active' || hold.isHolding) return;
    const id = window.setInterval(() => setScrollIdx(i => (i + 1) % FEED_ITEMS.length), 400);
    return () => clearInterval(id);
  }, [stage, hold.isHolding]);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ y: [0, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                style={{ width: '100px', height: '14px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Who programmed this feed? You or Fear? Hold to stop.
            </div>
            <div style={{ width: '140px', height: '80px', overflow: 'hidden', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`, position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div key={scrollIdx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: hold.isHolding ? 0.15 : 0.5 }}
                  exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    ...navicueType.texture, color: 'hsla(0, 25%, 40%, 0.4)', fontSize: '12px' }}>
                  {FEED_ITEMS[scrollIdx]}
                </motion.div>
              </AnimatePresence>
            </div>
            <motion.div {...hold.holdProps}
              animate={{ scale: hold.isHolding ? 0.95 : 1,
                boxShadow: hold.isHolding ? `0 0 ${8 + hold.tension * 16}px ${themeColor(TH.accentHSL, 0.08, 6)}` : 'none' }}
              style={{ padding: '12px 28px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}`,
                touchAction: 'none', userSelect: 'none' }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12) }}>
                {hold.isHolding ? `holding... ${Math.round(hold.tension * 100)}%` : 'hold to stop'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'stopped' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '140px', height: '60px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.25, 10) }}>feed reset</span>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The feed stopped. You hijacked the algorithm. Look at a wall. Reset.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Digital autonomy. Your attention is being mined for profit. Stopping the feed is an act of reclaiming sovereignty over your cognitive resources. You are not the algorithm{"'"}s product.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Reclaimed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}