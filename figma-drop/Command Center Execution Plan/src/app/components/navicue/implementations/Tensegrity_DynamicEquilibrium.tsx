/**
 * TENSEGRITY #7 -- 1157. The Dynamic Equilibrium
 * "Balance is a verb. Keep moving."
 * INTERACTION: Tightrope walker -- constant tiny taps left/right -- stopping causes fall
 * STEALTH KBE: Oscillation -- balance (E)
 *
 * COMPOSITOR: pattern_glitch / Lattice / morning / embodying / tap / 1157
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_DynamicEquilibrium({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Lattice',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1157,
        isSeal: false,
      }}
      arrivalText="A tightrope. A walker. Never still."
      prompt="Balance is a verb. It is a constant negotiation with gravity. Do not try to freeze. Keep moving."
      resonantText="Oscillation. You balanced not by freezing but by adjusting. Micro-movements, left and right, constantly. Stillness was the only thing that would have killed you. Balance is motion."
      afterglowCoda="Moving."
      onComplete={onComplete}
    >
      {(verse) => <DynamicEquilibriumInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DynamicEquilibriumInteraction({ verse }: { verse: any }) {
  const [lean, setLean] = useState(0); // -100 to 100
  const [balanceTime, setBalanceTime] = useState(0);
  const [done, setDone] = useState(false);
  const [fallen, setFallen] = useState(false);
  const BALANCE_TARGET = 80; // ticks balanced

  // Gravity pulls randomly
  useEffect(() => {
    if (done || fallen) return;
    const interval = setInterval(() => {
      setLean(prev => {
        const drift = (Math.random() - 0.5) * 4 + (prev > 0 ? 0.8 : -0.8);
        const next = prev + drift;
        if (Math.abs(next) > 60) {
          setFallen(true);
          return next;
        }
        return next;
      });
      setBalanceTime(prev => {
        const next = prev + 1;
        if (next >= BALANCE_TARGET) {
          setDone(true);
          setTimeout(() => verse.advance(), 2000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [done, fallen, verse]);

  // Reset after fall
  useEffect(() => {
    if (!fallen) return;
    const timeout = setTimeout(() => {
      setFallen(false);
      setLean(0);
      setBalanceTime(0);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [fallen]);

  const tapLeft = useCallback(() => {
    if (done || fallen) return;
    setLean(prev => Math.max(-50, prev - 8));
  }, [done, fallen]);

  const tapRight = useCallback(() => {
    if (done || fallen) return;
    setLean(prev => Math.min(50, prev + 8));
  }, [done, fallen]);

  const leanPct = lean / 60;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Tightrope scene */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Bar */}
          <rect x="10" y="70" width="140" height="1" fill={verse.palette.primaryGlow} opacity="0.2" />
          {/* Posts */}
          <rect x="8" y="50" width="2" height="25" fill={verse.palette.primaryGlow} opacity="0.15" />
          <rect x="150" y="50" width="2" height="25" fill={verse.palette.primaryGlow} opacity="0.15" />

          {/* Walker */}
          <motion.g
            animate={{
              rotate: lean * 0.5,
              x: lean * 0.3,
              y: fallen ? 30 : 0,
              opacity: fallen ? 0.1 : 0.6,
            }}
            style={{
              transformOrigin: 'bottom center',
            }}
          >
            {/* Head */}
            <circle cx="72" cy="35" r="4" fill={done ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.5)'} />
            {/* Body */}
            <rect x="71" y="43" width="2" height="14" fill={done ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.4)'} />
            {/* Arms (balance pole) */}
            <rect x="64" y="55" width="16" height="1" fill={done ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.3)'} />
          </motion.g>

          {/* Progress */}
          {!fallen && !done && (
            <rect x="55" y="5" width="50" height="3" rx="2" fill={verse.palette.primaryGlow} overflow="hidden">
              <motion.rect
                animate={{ width: `${(balanceTime / BALANCE_TARGET) * 100}%` }}
                style={{ height: '100%', fill: verse.palette.accent, rx: 2, opacity: 0.5 }}
              />
            </rect>
          )}
        </svg>
      </div>

      {/* Controls */}
      {!done && !fallen && (
        <div style={{ display: 'flex', gap: 16 }}>
          <motion.button onClick={tapLeft}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            left
          </motion.button>
          <motion.button onClick={tapRight}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            right
          </motion.button>
        </div>
      )}
      {fallen && (
        <span style={navicueStyles.shadowAnnotation(verse.palette, 0.5)}>
          fell. resetting...
        </span>
      )}
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          balanced
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'oscillation' : fallen ? 'stillness is death' : 'keep moving'}
      </div>
    </div>
  );
}