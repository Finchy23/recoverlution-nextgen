/**
 * CATALYST III #2 -- 1222. The Precipitate (Clarity)
 * "One drop of decision precipitates the truth."
 * INTERACTION: Tap to add a decision drop. Cloud settles into crystals. Liquid clears.
 * STEALTH KBE: Decision Making -- Decisiveness as Clarity (K)
 *
 * COMPOSITOR: poetic_precision / Glacier / work / knowing / tap / 1222
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function CatalystIII_Precipitate({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Glacier',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1222,
        isSeal: false,
      }}
      arrivalText="A cloudy liquid. Doubt suspended."
      prompt="The solution is supersaturated with doubt. One drop of decision precipitates the truth. Make the call. Watch the clarity fall out."
      resonantText="Decision making. The doubt was not destroyed. It crystallized into something visible, something you can hold. Decisiveness is not the absence of doubt. It is the precipitation of it."
      afterglowCoda="Make the call."
      onComplete={onComplete}
    >
      {(verse) => <PrecipitateInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PrecipitateInteraction({ verse }: { verse: any }) {
  const [dropped, setDropped] = useState(false);
  const [settling, setSettling] = useState(false);
  const [clarity, setClarity] = useState(0); // 0=cloudy, 1=clear
  const [done, setDone] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Cloudy particles
  useEffect(() => {
    if (dropped) return;
    const initial = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 140,
      y: 20 + Math.random() * 100,
    }));
    setParticles(initial);
  }, [dropped]);

  const handleDrop = () => {
    if (dropped) return;
    setDropped(true);
    setSettling(true);

    // Settling animation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.015;
      setClarity(progress);

      // Move particles downward
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y + (1.5 + Math.random() * 0.5),
      })));

      if (progress >= 1) {
        clearInterval(interval);
        setSettling(false);
        setDone(true);
        setTimeout(() => verse.advance(), 2500);
      }
    }, 40);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 180;
  const SCENE_H = 160;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Beaker visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Beaker outline */}
          <path
            d="M40,15 L40,130 Q40,145 55,145 L125,145 Q140,145 140,130 L140,15"
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={1}
            opacity={safeOpacity(0.2)}
          />

          {/* Liquid fill -- opacity decreases as clarity increases */}
          <rect x={42} y={20} width={96} height={122} rx={2}
            fill={verse.palette.primary}
            opacity={safeOpacity(0.08 * (1 - clarity * 0.7))}
          />

          {/* Suspended particles (doubt) */}
          {particles.map(p => {
            const visible = p.y < 140;
            const settled = p.y >= 130;
            return (
              <motion.circle
                key={p.id}
                cx={p.x}
                cy={Math.min(p.y, 138)}
                r={settled ? 3 : 2}
                fill={settled ? verse.palette.accent : verse.palette.primary}
                animate={{
                  opacity: safeOpacity(
                    settled ? 0.4 : visible ? 0.15 * (1 - clarity * 0.8) : 0
                  ),
                }}
                transition={{ duration: 0.1 }}
              />
            );
          })}

          {/* Crystal layer at bottom (settled precipitate) */}
          {clarity > 0.3 && (
            <motion.rect
              x={42} y={135}
              width={96}
              height={Math.min(10, clarity * 12)}
              rx={1}
              fill={verse.palette.accent}
              animate={{ opacity: safeOpacity(clarity * 0.25) }}
            />
          )}

          {/* Drop falling */}
          {dropped && clarity < 0.1 && (
            <motion.circle
              cx={90} cy={5}
              r={4}
              fill={verse.palette.accent}
              initial={{ cy: -10, opacity: 0.7 }}
              animate={{ cy: 25, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Clarity label */}
          {clarity > 0.5 && (
            <motion.text
              x={90} y={75}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(clarity * 0.5) }}
            >
              clear
            </motion.text>
          )}
        </svg>
      </div>

      {/* Action */}
      {!dropped && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleDrop}
        >
          add one drop of decision
        </motion.button>
      )}

      {settling && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>clarity</span>
          <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
            <motion.div
              animate={{ width: `${clarity * 100}%` }}
              style={{
                height: '100%', borderRadius: 2,
                background: verse.palette.accent, opacity: 0.6,
              }}
            />
          </div>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the truth precipitates'
          : settling
            ? 'settling...'
            : 'supersaturated with doubt'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          decisiveness as clarity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'decision making' : 'one drop changes everything'}
      </div>
    </div>
  );
}
