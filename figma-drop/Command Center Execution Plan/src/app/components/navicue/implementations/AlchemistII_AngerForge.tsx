/**
 * ALCHEMIST II #1 -- The Anger Forge
 * "Anger is just the energy of change. Don't waste it on yelling. Hammer it into a boundary."
 * INTERACTION: A blacksmith's anvil with hot iron. Each tap = hammer
 * strike with sparks flying. The raw red anger cools into a shaped
 * golden boundary. Clang. Clang. Clang. Forged.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Somatic Regulation', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STRIKES = 6;

export default function AlchemistII_AngerForge({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [hits, setHits] = useState(0);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const sparkId = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const strike = () => {
    if (stage !== 'active' || hits >= STRIKES) return;
    const next = hits + 1;
    setHits(next);
    // Generate sparks
    const newSparks = Array.from({ length: 8 }, () => ({
      id: sparkId.current++,
      x: 100 + (Math.random() - 0.5) * 20,
      y: 85 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 60,
      vy: -Math.random() * 40 - 10,
    }));
    setSparks(prev => [...prev.slice(-20), ...newSparks]);
    if (next >= STRIKES) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const heat = 1 - hits / STRIKES; // 1 = red hot, 0 = golden
  const ironHue = 5 + (1 - heat) * 40; // 5 (red) → 45 (gold)
  const ironSat = 70 - (1 - heat) * 20;
  const ironLight = 40 + (1 - heat) * 15;
  // Iron shape morphs from rough rectangle to refined shape
  const ironWidth = 50 - hits * 3;
  const ironHeight = 16 + hits * 2;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Somatic Regulation" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The forge heats...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Anger is just the energy of change. Don't waste it on yelling. Hammer it into a boundary.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to strike the iron</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={strike}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: hits >= STRIKES ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Forge scene */}
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(15, 20%, 8%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Ambient heat glow */}
                <radialGradient id={`${svgId}-forgeGlow`} cx="50%" cy="55%">
                  <stop offset="0%" stopColor={`hsla(${ironHue}, ${ironSat}%, ${ironLight}%, ${0.08 + heat * 0.06})`} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <rect x="0" y="0" width="220" height="160" fill={`url(#${svgId}-forgeGlow)`} />
                {/* Anvil */}
                <rect x="70" y="95" width="80" height="10" rx="2" fill="hsla(220, 5%, 25%, 0.5)" />
                <rect x="85" y="105" width="50" height="25" rx="1" fill="hsla(220, 5%, 20%, 0.6)" />
                <rect x="95" y="130" width="30" height="15" rx="1" fill="hsla(220, 5%, 18%, 0.5)" />
                {/* Hot iron on anvil */}
                <motion.rect
                  x={110 - ironWidth / 2} y={95 - ironHeight}
                  width={ironWidth} height={ironHeight}
                  rx={hits >= STRIKES ? 4 : 1}
                  fill={`hsla(${ironHue}, ${ironSat}%, ${ironLight}%, 0.7)`}
                  initial={{
                    x: 110 - ironWidth / 2,
                    width: ironWidth,
                    height: ironHeight,
                    y: 95 - ironHeight,
                  }}
                  animate={{
                    x: 110 - ironWidth / 2,
                    width: ironWidth,
                    height: ironHeight,
                    y: 95 - ironHeight,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
                {/* Iron glow */}
                <motion.rect
                  x={110 - ironWidth / 2 - 3} y={95 - ironHeight - 3}
                  width={ironWidth + 6} height={ironHeight + 6}
                  rx={hits >= STRIKES ? 6 : 2}
                  fill="none"
                  stroke={`hsla(${ironHue}, ${ironSat}%, ${ironLight + 10}%, ${heat * 0.2})`}
                  strokeWidth="1"
                  initial={{ opacity: heat * 0.15 }}
                  animate={{ opacity: [heat * 0.15, heat * 0.25, heat * 0.15] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {/* Hammer (shows on strike) */}
                {hits > 0 && (
                  <motion.g
                    initial={{ y: -30, opacity: 1 }}
                    animate={{ y: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    key={hits}>
                    <rect x="102" y="40" width="16" height="12" rx="2" fill="hsla(220, 8%, 35%, 0.6)" />
                    <rect x="108" y="20" width="4" height="22" rx="1" fill="hsla(25, 15%, 30%, 0.5)" />
                  </motion.g>
                )}
                {/* Sparks */}
                {sparks.slice(-16).map(s => (
                  <motion.circle key={s.id}
                    cx={s.x} cy={s.y} r={1.5}
                    fill={`hsla(${40 + Math.random() * 20}, 80%, 60%, 0.8)`}
                    initial={{ cx: s.x, cy: s.y, opacity: 0.9 }}
                    animate={{ cx: s.x + s.vx, cy: s.y + s.vy, opacity: 0 }}
                    transition={{ duration: 0.6 + Math.random() * 0.3, ease: 'easeOut' }}
                  />
                ))}
              </svg>
              {/* Strike count */}
              <div style={{ position: 'absolute', top: '8px', right: '10px', fontFamily: 'monospace', fontSize: '11px', color: `hsla(${ironHue}, ${ironSat}%, ${ironLight}%, 0.4)`, letterSpacing: '0.1em' }}>
                {hits}/{STRIKES}
              </div>
            </div>
            {/* State text */}
            <motion.div key={hits} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {hits === 0 ? 'Raw rage on the anvil.' : hits < STRIKES ? `Strike ${hits}. Shaping...` : 'Forged. A boundary.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: STRIKES }, (_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < hits ? `hsla(${ironHue}, ${ironSat}%, ${ironLight}%, 0.6)` : palette.primaryFaint, opacity: i < hits ? 0.7 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Lead into gold. The anger was never the enemy. It was raw material.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Sublimation complete. Impulse channeled. A boundary forged from the fire.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Hammered. Shaped. Forged.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}