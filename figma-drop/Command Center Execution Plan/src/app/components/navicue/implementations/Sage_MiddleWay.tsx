/**
 * SAGE #3 — The Middle Way
 * "The path is in the center."
 * Pattern B (Drag) — Balance on tightrope; keep slider centered
 * WEB ADAPT: gyroscope → horizontal drag slider, hold center zone
 * STEALTH KBE: Maintaining center = Somatic Equilibrium / Balance (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'embodying', 'Practice');
type Stage = 'arriving' | 'walking' | 'balanced' | 'resonant' | 'afterglow';

export default function Sage_MiddleWay({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pos, setPos] = useState(50); // 0–100, 50 = center
  const [stableTime, setStableTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('walking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'walking') return;
    intervalRef.current = window.setInterval(() => {
      setPos(p => {
        const inCenter = Math.abs(p - 50) < 15;
        if (inCenter) {
          setStableTime(prev => {
            const next = prev + 200;
            if (next >= 3000) {
              console.log(`[KBE:E] MiddleWay somaticEquilibrium=confirmed balance=true`);
              setStage('balanced');
              t(() => setStage('resonant'), 5000);
              t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
            }
            return next;
          });
        } else {
          setStableTime(0);
        }
        // Random drift
        return Math.max(5, Math.min(95, p + (Math.random() - 0.5) * 8));
      });
    }, 200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [stage]);

  const nudge = (dir: 'left' | 'right') => {
    if (stage !== 'walking') return;
    setPos(p => Math.max(5, Math.min(95, p + (dir === 'left' ? -12 : 12))));
  };

  const centerDist = Math.abs(pos - 50);
  const centerColor = centerDist < 15
    ? themeColor(TH.accentHSL, 0.08, 4)
    : centerDist < 30
      ? themeColor(TH.accentHSL, 0.04, 2)
      : 'hsla(0, 15%, 25%, 0.04)';

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '60px', height: '1px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'walking' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A tightrope. Too far left: Asceticism. Too far right: Indulgence. Tap to nudge back to center. Hold the line.
            </div>
            {/* Tightrope */}
            <div style={{ position: 'relative', width: '160px', height: '40px' }}>
              <div style={{ position: 'absolute', top: '20px', width: '100%', height: '1px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              {/* Center zone */}
              <div style={{ position: 'absolute', top: '14px', left: '35%', width: '30%', height: '12px',
                background: themeColor(TH.accentHSL, 0.02, 1), borderRadius: '2px' }} />
              {/* Walker */}
              <motion.div animate={{ left: `${pos}%` }}
                style={{ position: 'absolute', top: '8px', width: '8px', height: '14px', borderRadius: '4px 4px 2px 2px',
                  background: centerColor, marginLeft: '-4px', transition: 'left 0.1s' }} />
              <span style={{ position: 'absolute', top: '26px', left: '2px', ...navicueType.micro, color: palette.textFaint }}>Asceticism</span>
              <span style={{ position: 'absolute', top: '26px', right: '2px', ...navicueType.micro, color: palette.textFaint }}>Indulgence</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.div whileTap={{ scale: 0.85 }} onClick={() => nudge('left')}
                style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>← Left</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.85 }} onClick={() => nudge('right')}
                style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Right →</span>
              </motion.div>
            </div>
            <div style={{ ...navicueType.micro, color: centerDist < 15 ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint }}>
              {centerDist < 15 ? `Centered... ${Math.round(stableTime / 1000)}s / 3s` : 'Find the center'}
            </div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Balanced. Extreme discipline breaks you. Extreme pleasure dulls you. Walk the razor{"'"}s edge: the path is in the center. The Middle Way isn{"'"}t moderation as mediocrity; it{"'"}s dynamic equilibrium. The tightrope walker is constantly adjusting, never still. Balance is a verb, not a noun.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Middle Way (Majjhim{"ā"} Pa{"ṭ"}ipad{"ā"}). The Buddha{"'"}s central teaching: avoid the extremes of self-mortification and self-indulgence. Aristotle{"'"}s "Golden Mean" maps the same principle: every virtue is the midpoint between two vices. Modern psychology confirms: both rigid discipline and total permissiveness predict worse outcomes. The optimal zone is flexible structure: responsive adaptation, not fixed rules.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Balanced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}