/**
 * TRICKSTER #4 — The Rule Breaker
 * "The rules were written by someone who wanted to control you. Walk through the wall."
 * ARCHETYPE: Pattern A (Tap) — Tap through the wall, not the path
 * ENTRY: Scene-first — maze where following rules = losing
 * STEALTH KBE: Breaking the wall = Autonomous Thinking (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'maze' | 'complied' | 'broke' | 'resonant' | 'afterglow';

export default function Trickster_RuleBreaker({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('maze'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const followPath = () => {
    if (stage !== 'maze') return;
    console.log(`[KBE:B] RuleBreaker action=complied autonomousThinking=false`);
    setStage('complied');
    t(() => setStage('resonant'), 4000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 9000);
  };

  const breakWall = () => {
    if (stage !== 'maze') return;
    console.log(`[KBE:B] RuleBreaker action=broke autonomousThinking=confirmed`);
    setStage('broke');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <rect x="5" y="5" width="50" height="50" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="1" />
              <line x1="25" y1="5" x2="25" y2="35" stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1" />
              <line x1="35" y1="25" x2="35" y2="55" stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1" />
            </svg>
          </motion.div>
        )}
        {stage === 'maze' && (
          <motion.div key="mz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>the maze</div>
            <svg width="120" height="100" viewBox="0 0 120 100">
              {/* Outer walls */}
              <rect x="10" y="10" width="100" height="80" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.1, 6)} strokeWidth="2" rx="2" />
              {/* Inner walls */}
              <line x1="40" y1="10" x2="40" y2="60" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2" />
              <line x1="70" y1="40" x2="70" y2="90" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2" />
              {/* Path arrow — the "correct" way */}
              <path d="M20,50 Q30,30 50,50 Q60,70 80,50 Q90,30 100,50"
                fill="none" stroke={themeColor(TH.primaryHSL, 0.05, 4)} strokeWidth="1" strokeDasharray="3,3" />
              {/* You marker */}
              <circle cx="20" cy="50" r="4" fill={themeColor(TH.accentHSL, 0.15, 8)} />
              {/* Exit */}
              <circle cx="100" cy="50" r="4" fill={themeColor(TH.accentHSL, 0.08, 6)} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Follow the path? Or walk through the wall?
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={followPath}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Follow the path</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9, rotate: 3 }} onClick={breakWall}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14), fontSize: '11px' }}>Break the wall</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'complied' && (
          <motion.div key="co" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            You followed the rules. You arrived, eventually. But the wall was always a lie. Next time, try the shortcut.
          </motion.div>
        )}
        {stage === 'broke' && (
          <motion.div key="br" initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.45, 14), textAlign: 'center', maxWidth: '260px' }}>
              Straight through. The wall was a suggestion. You chose autonomy.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Autonomous thinking. Most "rules" are just habits that calcified into walls. The maze was designed to keep you busy, not to help you arrive. Question the path. The wall is a lie. Walk through it. The people who change the world are the ones who refuse the maze.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Through.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}