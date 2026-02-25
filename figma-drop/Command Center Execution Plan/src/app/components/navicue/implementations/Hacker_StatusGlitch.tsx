/**
 * HACKER #2 — The Status Glitch
 * "Status is a multiplayer game. Opt out. Play single-player."
 * INTERACTION: A leaderboard of "success" metrics crumbles into
 * pixels when you tap it. A single-player icon emerges from the rubble.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const RANKINGS = [
  { rank: '#1', metric: 'Most Followers' },
  { rank: '#2', metric: 'Highest Salary' },
  { rank: '#3', metric: 'Best Looking' },
  { rank: '#4', metric: 'Most Productive' },
  { rank: '#5', metric: 'Most Liked' },
];

export default function Hacker_StatusGlitch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [glitched, setGlitched] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleGlitch = (i: number) => {
    if (stage !== 'active' || glitched.includes(i)) return;
    const next = [...glitched, i];
    setGlitched(next);
    if (next.length >= RANKINGS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Leaderboard loading...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Status is a multiplayer game.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each ranking to opt out</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '280px' }}>
            {RANKINGS.map((r, i) => {
              const isGlitched = glitched.includes(i);
              return (
                <motion.button key={i} onClick={() => handleGlitch(i)}
                  animate={{
                    opacity: isGlitched ? 0.1 : 0.5,
                    scale: isGlitched ? 0.95 : 1,
                    x: isGlitched ? (Math.random() - 0.5) * 4 : 0,
                  }}
                  whileHover={!isGlitched ? { opacity: 0.7 } : undefined}
                  style={{ width: '100%', padding: '14px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${isGlitched ? 'transparent' : palette.primaryFaint}`, borderRadius: radius.sm, cursor: isGlitched ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {!isGlitched ? (
                    <>
                      <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', opacity: 0.4, width: '24px' }}>{r.rank}</span>
                      <span style={{ ...navicueType.texture, color: palette.text, fontSize: '12px' }}>{r.metric}</span>
                    </>
                  ) : (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                      style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                      ▓▓░░▓░▓▓░▓░░▓
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
            {glitched.length >= RANKINGS.length && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.7, scale: 1 }} transition={{ type: 'spring', stiffness: 150 }}
                style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 16px ${palette.accentGlow}`, opacity: 0.6 }} />
                <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', letterSpacing: '0.1em' }}>SINGLE PLAYER</div>
              </motion.div>
            )}
            {glitched.length < RANKINGS.length && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '8px' }}>{glitched.length} of {RANKINGS.length} dismantled</div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The leaderboard was never real.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Play your own game. Keep your own score.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Single player. Infinite game.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}