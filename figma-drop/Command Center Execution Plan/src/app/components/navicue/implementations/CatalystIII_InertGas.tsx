/**
 * CATALYST III #8 -- 1228. The Inert Gas (Protection)
 * "You are reactive. Surround yourself with boundaries."
 * INTERACTION: Tap to activate argon shield -- danger passes without ignition
 * STEALTH KBE: Shielding -- Protective Regulation (E)
 *
 * COMPOSITOR: pattern_glitch / Circuit / work / embodying / tap / 1228
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

export default function CatalystIII_InertGas({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1228,
        isSeal: false,
      }}
      arrivalText="A volatile chemical. Oxygen approaches."
      prompt="You are reactive. You need a buffer gas. Surround yourself with boundaries so the spark does not catch."
      resonantText="Shielding. The danger did not disappear. You became unreactive. Protective regulation is not hiding. It is choosing the atmosphere around you so the wrong things cannot ignite."
      afterglowCoda="Buffer the spark."
      onComplete={onComplete}
    >
      {(verse) => <InertGasInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InertGasInteraction({ verse }: { verse: any }) {
  const [oxygenApproach, setOxygenApproach] = useState(0);
  const [shielded, setShielded] = useState(false);
  const [oxygenPassed, setOxygenPassed] = useState(false);
  const [done, setDone] = useState(false);

  // Oxygen approaches over time
  useEffect(() => {
    const interval = setInterval(() => {
      setOxygenApproach(prev => {
        if (prev >= 1) { clearInterval(interval); return 1; }
        return prev + 0.008;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // If oxygen reaches the chemical without shield = explosion (restart)
  useEffect(() => {
    if (oxygenApproach >= 0.9 && !shielded) {
      // Reset -- the spark caught
      setTimeout(() => {
        setOxygenApproach(0);
      }, 1500);
    }
  }, [oxygenApproach, shielded]);

  // If shielded and oxygen approaches -- it passes harmlessly
  useEffect(() => {
    if (shielded && oxygenApproach >= 0.9 && !oxygenPassed) {
      setOxygenPassed(true);
      setDone(true);
      setTimeout(() => verse.advance(), 2800);
    }
  }, [shielded, oxygenApproach, oxygenPassed, verse]);

  const handleShield = () => {
    if (shielded) return;
    setShielded(true);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 240;
  const SCENE_H = 120;

  const chemX = SCENE_W / 2;
  const chemY = SCENE_H / 2;
  const oxyX = 220 - oxygenApproach * 100;

  const nearExplosion = oxygenApproach > 0.8 && !shielded;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Chamber */}
          <rect x={50} y={15} width={140} height={90} rx={8}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1} opacity={safeOpacity(0.15)} />

          {/* Argon shield (visible when activated) */}
          {shielded && (
            <motion.g>
              <motion.rect
                x={52} y={17} width={136} height={86} rx={6}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.06) }}
                transition={{ duration: 0.5 }}
              />
              {/* Shield particles */}
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.circle
                  key={i}
                  cx={60 + (i % 5) * 28}
                  cy={25 + Math.floor(i / 5) * 50}
                  r={1.5}
                  fill={verse.palette.accent}
                  animate={{
                    opacity: [safeOpacity(0.08), safeOpacity(0.2), safeOpacity(0.08)],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* Volatile chemical (center) */}
          <motion.g
            animate={{
              scale: nearExplosion ? [1, 1.1, 1] : 1,
            }}
            transition={nearExplosion ? { repeat: Infinity, duration: 0.3 } : {}}
          >
            <motion.polygon
              points={`${chemX},${chemY - 15} ${chemX + 13},${chemY + 8} ${chemX - 13},${chemY + 8}`}
              fill={verse.palette.shadow}
              animate={{
                opacity: safeOpacity(nearExplosion ? 0.35 : 0.2),
              }}
            />
            <text x={chemX} y={chemY + 25} textAnchor="middle"
              fill={verse.palette.textFaint} style={navicueType.micro}>
              volatile
            </text>
          </motion.g>

          {/* Oxygen molecule approaching */}
          {!oxygenPassed && (
            <motion.g>
              <motion.circle
                cx={oxyX} cy={chemY}
                r={8}
                fill={nearExplosion ? verse.palette.shadow : verse.palette.primary}
                animate={{
                  opacity: safeOpacity(0.2 + oxygenApproach * 0.2),
                }}
              />
              <text x={oxyX} y={chemY - 14} textAnchor="middle"
                fill={verse.palette.textFaint} style={navicueType.micro}>
                O2
              </text>
            </motion.g>
          )}

          {/* Deflection (oxygen bounces off shield) */}
          {oxygenPassed && (
            <motion.circle
              cy={chemY}
              r={6}
              fill={verse.palette.textFaint}
              initial={{ cx: oxyX, opacity: 0.2 }}
              animate={{ cx: 240, opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Explosion flash (if unshielded) */}
          {nearExplosion && oxygenApproach >= 0.9 && (
            <motion.circle
              cx={chemX} cy={chemY}
              fill={verse.palette.shadow}
              initial={{ r: 5, opacity: 0.5 }}
              animate={{ r: 50, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </svg>
      </div>

      {/* Shield button */}
      {!shielded && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleShield}
          animate={{
            scale: oxygenApproach > 0.5 ? [1, 1.02, 1] : 1,
          }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          flood with argon
        </motion.button>
      )}

      {/* Danger indicator */}
      {!shielded && oxygenApproach > 0.3 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...navicueType.micro, color: verse.palette.shadow }}>
            danger
          </span>
          <div style={{ width: 60, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
            <motion.div
              animate={{ width: `${oxygenApproach * 100}%` }}
              style={{
                height: '100%', borderRadius: 2,
                background: verse.palette.shadow,
                opacity: 0.5,
              }}
            />
          </div>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the spark did not catch'
          : shielded
            ? 'boundaries active. waiting...'
            : oxygenApproach > 0.5
              ? 'oxygen approaching. act now.'
              : 'a reactive compound in open air'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          protective regulation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'shielding' : 'set the boundary'}
      </div>
    </div>
  );
}
