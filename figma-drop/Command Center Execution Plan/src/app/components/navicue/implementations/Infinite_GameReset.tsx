/**
 * INFINITE PLAYER #3 — The Game Reset
 * "Stay hungry. Stay foolish."
 * INTERACTION: An 8-bit retro game screen. Static. "GAME OVER."
 * Each tap adds a coin — 5 coins. Screen flickers, resets.
 * "INSERT COIN" → "NEW GAME" → "PRESS START" → pixel art avatar appears → "PLAY."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const COIN_STEPS = 5;
const SCREEN_TEXT = ['GAME OVER', 'INSERT COIN...', 'NEW GAME', 'PRESS START', 'LOADING...', '▶ PLAY'];

export default function Infinite_GameReset({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [coins, setCoins] = useState(0);
  const [flicker, setFlicker] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const insertCoin = () => {
    if (stage !== 'active' || coins >= COIN_STEPS) return;
    setFlicker(true);
    addTimer(() => setFlicker(false), 200);
    const next = coins + 1;
    setCoins(next);
    if (next >= COIN_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = coins / COIN_STEPS;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            GAME OVER...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>New Game. Press Start. Stay hungry. Stay foolish.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to insert a coin</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={insertCoin}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: coins >= COIN_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '150px', borderRadius: radius.xs, overflow: 'hidden',
              background: flicker ? 'hsla(120, 15%, 8%, 0.95)' : `hsla(0, 0%, ${3 + t * 2}%, 0.95)`,
              border: `1px solid hsla(120, ${10 + t * 15}%, ${15 + t * 10}%, ${0.06 + t * 0.04})`,
              transition: 'background 0.1s' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Scanlines */}
                {Array.from({ length: 30 }, (_, i) => (
                  <line key={i} x1="0" y1={i * 5} x2="200" y2={i * 5}
                    stroke={`hsla(120, 8%, 12%, ${0.02})`} strokeWidth="0.5" />
                ))}

                {/* Screen text */}
                <motion.text x="100" y="55" textAnchor="middle"
                  fontSize="10" fontFamily="'Courier New', monospace" fontWeight="bold"
                  fill={`hsla(120, ${15 + t * 20}%, ${25 + t * 20}%, ${0.1 + t * 0.08})`}
                  key={coins}
                  initial={{ opacity: 0 }} animate={{ opacity: 0.1 + t * 0.08 }}
                  transition={{ duration: 0.3 }}>
                  {SCREEN_TEXT[coins]}
                </motion.text>

                {/* Blinking cursor */}
                {coins < COIN_STEPS && (
                  <motion.rect x="96" y="62" width="8" height="2"
                    fill={`hsla(120, 15%, 30%, 0.08)`}
                    initial={{ opacity: 0.08 }}
                    animate={{ opacity: [0.08, 0, 0.08] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}

                {/* Coin slot */}
                <rect x="88" y="108" width="24" height="4" rx="2"
                  fill={`hsla(45, 10%, 15%, ${0.06})`}
                  stroke={`hsla(45, 8%, 22%, 0.04)`} strokeWidth="0.3" />
                <text x="100" y="125" textAnchor="middle" fontSize="4" fontFamily="monospace"
                  fill={`hsla(120, ${8 + t * 10}%, ${20 + t * 8}%, ${0.05 + t * 0.03})`}>
                  COINS: {coins}/{COIN_STEPS}
                </text>

                {/* Pixel art avatar — appears at coin 4+ */}
                {coins >= 4 && (
                  <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.12, y: 0 }}
                    transition={{ type: 'spring' }}>
                    {/* Simple 8-bit character */}
                    <rect x="94" y="70" width="12" height="4" rx="1" fill="hsla(120, 15%, 30%, 0.1)" />
                    <rect x="96" y="74" width="8" height="8" rx="1" fill="hsla(120, 12%, 28%, 0.08)" />
                    <rect x="93" y="76" width="4" height="4" rx="0.5" fill="hsla(120, 10%, 25%, 0.06)" />
                    <rect x="103" y="76" width="4" height="4" rx="0.5" fill="hsla(120, 10%, 25%, 0.06)" />
                    <rect x="96" y="82" width="3" height="5" rx="0.5" fill="hsla(120, 10%, 25%, 0.06)" />
                    <rect x="101" y="82" width="3" height="5" rx="0.5" fill="hsla(120, 10%, 25%, 0.06)" />
                  </motion.g>
                )}

                {/* PLAY glow */}
                {coins >= COIN_STEPS && (
                  <motion.rect x="60" y="38" width="80" height="25" rx="3"
                    fill="hsla(120, 18%, 25%, 0.04)"
                    initial={{ opacity: 0 }} animate={{ opacity: [0.04, 0.06, 0.04] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Score */}
                <text x="15" y="15" fontSize="4" fontFamily="monospace"
                  fill={`hsla(120, ${8 + t * 10}%, ${18 + t * 8}%, 0.06)`}>
                  HI-SCORE: ∞
                </text>

                {/* Static noise when flickering */}
                {flicker && Array.from({ length: 40 }, (_, i) => (
                  <rect key={`static-${i}`}
                    x={Math.random() * 200} y={Math.random() * 150}
                    width={Math.random() * 8 + 1} height="1"
                    fill={`hsla(120, 10%, ${20 + Math.random() * 20}%, ${0.03 + Math.random() * 0.04})`} />
                ))}
              </svg>
            </div>
            <motion.div key={coins} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {coins === 0 ? 'GAME OVER. The screen is dark. Static.' : coins < COIN_STEPS ? `Coin ${coins} inserted. Screen flickers. ${SCREEN_TEXT[coins]}.` : 'PLAY. The avatar is ready. New game begins.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: COIN_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < coins ? 'hsla(120, 20%, 40%, 0.5)' : palette.primaryFaint, opacity: i < coins ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five coins. GAME OVER flickered to INSERT COIN. Then NEW GAME. Then PRESS START. A tiny pixel avatar appeared: you. Then: PLAY. The screen glows green. HI-SCORE: infinity. Stay hungry. Stay foolish. Press start.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Playfulness. Play is the natural state of learning and adaptation; it keeps the brain plastic. Every game over is just an insert coin away from a new game.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Game Over. Coin. Play.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}