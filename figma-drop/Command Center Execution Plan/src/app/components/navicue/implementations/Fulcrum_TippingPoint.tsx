/**
 * FULCRUM #9 -- 1209. The Tipping Point
 * "Phase transition is non-linear. You are building critical mass."
 * INTERACTION: Hold to add sand grain by grain. Nothing. Nothing. Then tip.
 * STEALTH KBE: Persistence -- Faith in Accumulation (B)
 *
 * COMPOSITOR: koan_paradox / Glacier / night / believing / hold / 1209
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveHoldButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Fulcrum_TippingPoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Glacier',
        chrono: 'night',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1209,
        isSeal: false,
      }}
      arrivalText="A seesaw. Perfectly level."
      prompt="Phase transition is non-linear. You think nothing is happening. You are building critical mass. Add the last grain."
      resonantText="Persistence. Every grain before the last one looked useless. They were not. They were building the threshold. Faith in accumulation is understanding that the tip is built by the grains you cannot see."
      afterglowCoda="One more grain."
      onComplete={onComplete}
    >
      {(verse) => <TippingInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TippingInteraction({ verse }: { verse: any }) {
  const [grains, setGrains] = useState(0);
  const [tipped, setTipped] = useState(false);
  const grainTarget = 20;
  const tipThreshold = 0.95;

  const hold = useHoldInteraction({
    maxDuration: 8000,
    tickRate: 30,
    onThreshold: (t: number) => {
      if (t > 0.05) {
        setGrains(prev => Math.min(grainTarget, prev + 1));
      }
    },
    onComplete: () => {
      // Hold completed -- add final grains
      setGrains(grainTarget);
    },
  });

  // Watch for tip
  useEffect(() => {
    if (grains >= grainTarget && !tipped) {
      setTipped(true);
      setTimeout(() => verse.advance(), 2800);
    }
  }, [grains, tipped, verse]);

  const progress = grains / grainTarget;
  const seesawAngle = tipped ? 18 : progress * 2; // Barely moves until tip
  const btn = immersiveHoldButton(verse.palette);

  const SCENE_W = 240;
  const SCENE_H = 120;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Seesaw visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Fulcrum triangle */}
          <polygon
            points={`${SCENE_W / 2 - 8},${SCENE_H - 10} ${SCENE_W / 2 + 8},${SCENE_H - 10} ${SCENE_W / 2},${SCENE_H - 30}`}
            fill={verse.palette.primary}
            opacity={safeOpacity(0.15)}
          />

          {/* Seesaw beam */}
          <motion.line
            x1={30} y1={SCENE_H - 30}
            x2={SCENE_W - 30} y2={SCENE_H - 30}
            stroke={verse.palette.primary}
            strokeWidth={2}
            opacity={safeOpacity(0.2)}
            animate={{ rotate: seesawAngle }}
            transition={{ duration: tipped ? 0.6 : 0.2, ease: tipped ? [0.22, 1, 0.36, 1] : 'linear' }}
            style={{ transformOrigin: `${SCENE_W / 2}px ${SCENE_H - 30}px` }}
          />

          {/* Sand grains on the right side */}
          {Array.from({ length: grains }).map((_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const gx = SCENE_W / 2 + 30 + col * 8;
            const gy = SCENE_H - 36 - row * 6;
            return (
              <motion.circle
                key={i}
                cx={gx} cy={gy}
                r={2.5}
                fill={verse.palette.accent}
                initial={{ opacity: 0, y: -20 }}
                animate={{
                  opacity: safeOpacity(0.3 + (i / grainTarget) * 0.2),
                  y: tipped ? 20 : 0,
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  y: tipped ? { duration: 0.6, delay: i * 0.02 } : {},
                }}
              />
            );
          })}

          {/* "Nothing" labels during accumulation */}
          {!tipped && grains > 3 && grains < grainTarget - 2 && (
            <motion.text
              x={SCENE_W / 2}
              y={30}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.micro}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              nothing yet
            </motion.text>
          )}

          {/* TIP moment */}
          {tipped && (
            <motion.text
              x={SCENE_W / 2}
              y={30}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.subheading}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              tip
            </motion.text>
          )}
        </svg>
      </div>

      {/* Hold zone */}
      {!tipped && (
        <motion.div
          {...hold.holdProps}
          animate={hold.isHolding ? btn.holding : {}}
          transition={{ duration: 0.2 }}
          style={{ ...hold.holdProps.style, ...btn.base }}
        >
          <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
            <circle {...btn.progressRing.track} />
            <circle {...btn.progressRing.fill(hold.tension)} />
          </svg>
          <div style={btn.label}>
            {hold.isHolding ? 'adding...' : 'hold to add sand'}
          </div>
        </motion.div>
      )}

      {/* Grain counter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ ...navicueType.data, color: verse.palette.text }}>
          {grains} grain{grains !== 1 ? 's' : ''}
        </span>
        <span style={navicueStyles.interactionHint(verse.palette)}>
          {tipped
            ? 'critical mass reached'
            : grains === 0
              ? 'hold to add grains of sand'
              : 'keep going. the tip is coming.'}
        </span>
      </div>

      {tipped && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          faith in accumulation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {tipped ? 'persistence' : 'keep adding'}
      </div>
    </div>
  );
}
