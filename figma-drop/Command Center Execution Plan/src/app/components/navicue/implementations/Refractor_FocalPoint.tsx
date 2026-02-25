/**
 * REFRACTOR #2 -- 1042. The Focal Point (The Burn)
 * "Diffused light creates no heat. Focus the rays."
 * INTERACTION: Hold the lens steady to concentrate heat -- release dissipates
 * STEALTH KBE: Attentional narrowing -- deep focus (E)
 *
 * COMPOSITOR: sensory_cinema / Stellar / work / embodying / hold / 1042
 */
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { useHoldInteraction } from '../interactions/useHoldInteraction';
import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Refractor_FocalPoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Stellar',
        chrono: 'work',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1042,
        isSeal: false,
      }}
      arrivalText="Scattered rays. Warm but weak."
      prompt="You are busy, but you are cold. Diffused light creates no heat. Focus the rays. Burn through the obstacle."
      resonantText="Attentional narrowing. A magnifying glass does not add energy. It concentrates what is already there. Your attention is the lens."
      afterglowCoda="Burn through."
      onComplete={onComplete}
    >
      {(verse) => <FocalPointInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FocalPointInteraction({ verse }: { verse: any }) {
  const hold = useHoldInteraction({
    maxDuration: 4000,
    onComplete: () => verse.advance(),
  });
  const h = hold.tension;
  const heat = h * 100;

  // Rays converge as hold progresses
  const rays = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const spread = 50 - h * 35;
      return {
        x: 110 + Math.cos(angle) * spread,
        y: 20,
        endX: 110 + Math.cos(angle) * (5 + (1 - h) * 30),
        endY: 95 + Math.sin(angle) * (3 + (1 - h) * 15),
      };
    }),
  [h]);

  const heatColor = `hsla(${30 - heat * 0.3}, ${40 + heat * 0.5}%, ${30 + heat * 0.3}%, ${0.15 + h * 0.35})`;

  return (
    <div style={{ ...navicueInteraction.interactionWrapper, gap: 24 }}>
      {/* Lens + rays visualization -- hold zone IS the visualization */}
      <div
        {...hold.holdProps}
        style={{
          ...hold.holdProps.style,
          position: 'relative',
          width: 220,
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
          userSelect: 'none',
          cursor: hold.completed ? 'default' : 'pointer',
        }}
      >
        {/* Converging rays */}
        <svg width="220" height="200" viewBox="0 0 220 200" style={{ position: 'absolute', inset: 0 }}>
          {rays.map((ray, i) => (
            <motion.line
              key={i}
              x1={ray.x} y1={ray.y}
              x2={ray.endX} y2={ray.endY}
              stroke={verse.palette.primary}
              strokeWidth={0.8}
              animate={{ opacity: [0.08 + h * 0.12, 0.2 + h * 0.12] }}
              transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}

          {/* Focal point glow */}
          <motion.circle
            cx={110} cy={95}
            r={6 + h * 12}
            fill={heatColor}
            animate={hold.completed ? { r: [18, 25, 18] } : {}}
            transition={{ duration: 0.6, repeat: hold.completed ? Infinity : 0 }}
          />

          {/* Lens arc */}
          <motion.ellipse
            cx={110} cy={55}
            rx={35 - h * 5} ry={8}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={0.8}
            animate={{ opacity: 0.15 + h * 0.2 }}
          />
        </svg>

        {/* Smoke wisps when burning */}
        {hold.completed && Array.from({ length: 4 }, (_, i) => (
          <motion.div
            key={`smoke-${i}`}
            style={{
              position: 'absolute',
              width: 2, height: 25,
              background: `linear-gradient(to top, ${verse.palette.textFaint}, transparent)`,
              left: 105 + i * 5, top: 100,
              borderRadius: 2,
            }}
            animate={{ y: [-5, -40], opacity: [0.25, 0] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
          />
        ))}

        {/* Hold progress ring */}
        <svg viewBox="0 0 220 200" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <circle
            cx={110} cy={100} r={90}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={0.8}
            strokeDasharray={`${h * 565} 565`}
            strokeLinecap="round"
            opacity={hold.isHolding ? 0.2 + h * 0.15 : 0.06}
            transform="rotate(-90 110 100)"
          />
        </svg>
      </div>

      {/* Heat gauge */}
      <div style={{ width: 100, height: 2, borderRadius: 1, background: verse.palette.primaryFaint, overflow: 'hidden' }}>
        <motion.div
          style={{
            height: '100%', borderRadius: 1,
            background: heat > 70 ? 'hsla(15, 60%, 50%, 0.7)' : verse.palette.accent,
          }}
          animate={{ width: `${heat}%`, opacity: 0.5 + h * 0.3 }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Status */}
      <span style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}>
        {hold.completed ? 'ignition' : hold.isHolding ? 'focusing...' : 'hold to focus the rays'}
      </span>
    </div>
  );
}
