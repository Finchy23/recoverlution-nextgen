/**
 * FULCRUM #10 -- 1210. The Fulcrum Seal (The Proof)
 * "The world is heavy only if you lift it alone."
 * INTERACTION: Observe -- ideally balanced lever moving a massive Earth
 * STEALTH KBE: Mechanical Advantage -- seal completion
 *
 * COMPOSITOR: sacred_ordinary / Cosmos / night / knowing / observe / 1210
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Fulcrum_FulcrumSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1210,
        isSeal: true,
      }}
      arrivalText="A lever. Perfectly placed."
      prompt="The world is heavy only if you lift it alone."
      resonantText="Mechanical advantage. The factor by which a machine multiplies the force put into it. Smart work is hard work applied at the right angle. This is the geometry of possibility."
      afterglowCoda="The geometry of possibility."
      onComplete={onComplete}
    >
      {(verse) => <SealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0); // 0=still, 1=lever appears, 2=earth lifts, 3=complete
  const breathCycle = verse.breathAmplitude;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 4000);
    const t3 = setTimeout(() => {
      setPhase(3);
      setTimeout(() => verse.advance(), 3000);
    }, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [verse]);

  const SCENE_W = 260;
  const SCENE_H = 200;

  return (
    <div style={navicueStyles.interactionContainer(24)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Ambient glow */}
          <defs>
            <radialGradient id="seal-glow" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor={verse.palette.accent} stopOpacity={0.06} />
              <stop offset="100%" stopColor={verse.palette.accent} stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill="url(#seal-glow)" />

          {/* Earth (large circle) */}
          <motion.g
            animate={{
              y: phase >= 2 ? -20 - breathCycle * 5 : 0,
              opacity: safeOpacity(phase >= 1 ? 0.35 : 0.15),
            }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle
              cx={180} cy={80}
              r={40}
              fill="none"
              stroke={verse.palette.primary}
              strokeWidth={1.5}
              opacity={safeOpacity(0.25)}
            />
            {/* Continents hint -- subtle arcs */}
            <path
              d="M160,75 Q170,65 180,68 Q190,60 195,70"
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.8}
              opacity={safeOpacity(0.15)}
            />
            <path
              d="M170,90 Q180,85 190,92"
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.8}
              opacity={safeOpacity(0.12)}
            />
          </motion.g>

          {/* Lever beam */}
          <motion.line
            x1={20} y1={145}
            x2={SCENE_W - 20} y2={145}
            stroke={verse.palette.primary}
            strokeWidth={1.5}
            initial={{ opacity: 0 }}
            animate={{
              opacity: safeOpacity(phase >= 1 ? 0.3 : 0),
              rotate: phase >= 2 ? -8 - breathCycle * 2 : 0,
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${SCENE_W * 0.65}px 145px` }}
          />

          {/* Fulcrum */}
          <motion.polygon
            points={`${SCENE_W * 0.65 - 8},160 ${SCENE_W * 0.65 + 8},160 ${SCENE_W * 0.65},145`}
            fill={verse.palette.accent}
            initial={{ opacity: 0 }}
            animate={{ opacity: safeOpacity(phase >= 1 ? 0.5 : 0) }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* Tiny push point (left end of lever) */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6, y: [0, 2, 0] }}
              transition={{ opacity: { duration: 0.5 }, y: { repeat: Infinity, duration: 2 } }}
            >
              <circle cx={25} cy={143} r={4}
                fill={verse.palette.accent} opacity={safeOpacity(0.3)} />
              <motion.text
                x={25} y={165}
                textAnchor="middle"
                fill={verse.palette.textFaint}
                style={navicueType.micro}
              >
                one finger
              </motion.text>
            </motion.g>
          )}

          {/* Ground reference */}
          <line
            x1={10} y1={165} x2={SCENE_W - 10} y2={165}
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            opacity={safeOpacity(0.08)}
          />

          {/* Phase 3: completion glow */}
          {phase >= 3 && (
            <motion.circle
              cx={SCENE_W / 2} cy={SCENE_H / 2}
              r={80}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.2), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </svg>
      </div>

      {/* Phase text */}
      <motion.div
        animate={{ opacity: phase >= 2 ? 0.7 : 0.4 }}
        style={{
          ...navicueType.hint,
          color: phase >= 3 ? verse.palette.accent : verse.palette.textFaint,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        {phase < 1 && 'the lever extends into darkness'}
        {phase === 1 && 'the fulcrum is placed'}
        {phase === 2 && 'one finger lifts the world'}
        {phase >= 3 && 'the geometry of possibility'}
      </motion.div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 3 ? 'mechanical advantage' : 'observe'}
      </div>
    </div>
  );
}
