/**
 * CATALYST III #4 -- 1224. The Compound (Synthesis)
 * "Sodium explodes. Chlorine is poison. Together, they are salt."
 * INTERACTION: Drag elements together. Flash. New compound emerges.
 * STEALTH KBE: Dialectical Synthesis -- Synthesis changes the parts (K)
 *
 * COMPOSITOR: science_x_soul / Storm / social / knowing / tap / 1224
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function CatalystIII_Compound({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Storm',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1224,
        isSeal: false,
      }}
      arrivalText="Two elements. Both dangerous alone."
      prompt="Sodium explodes in water. Chlorine is poison. Together, they are salt. Combine your fear and your love. Make something new."
      resonantText="Dialectical synthesis. Fear alone is paralysis. Love alone is naivety. Together they become courage. Synthesis does not weaken the parts. It transforms them into something neither could be alone."
      afterglowCoda="Make something new."
      onComplete={onComplete}
    >
      {(verse) => <CompoundInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CompoundInteraction({ verse }: { verse: any }) {
  const [combined, setCombined] = useState(false);
  const [flash, setFlash] = useState(false);
  const [done, setDone] = useState(false);

  const handleCombine = () => {
    if (combined) return;
    setCombined(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 2500);
    }, 1500);
  };

  const SCENE_W = 240;
  const SCENE_H = 120;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Elements visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Flash overlay */}
          {flash && (
            <motion.rect
              x={0} y={0} width={SCENE_W} height={SCENE_H}
              fill={verse.palette.accent}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}

          <AnimatePresence>
            {!combined ? (
              <motion.g key="elements" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {/* Element A: Fear (left, unstable) */}
                <motion.g
                  animate={{ x: [0, -2, 2, 0], y: [0, 1, -1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  <circle cx={60} cy={60} r={28}
                    fill={verse.palette.shadow}
                    opacity={safeOpacity(0.15)} />
                  <circle cx={60} cy={60} r={28}
                    fill="none"
                    stroke={verse.palette.shadow}
                    strokeWidth={1}
                    opacity={safeOpacity(0.3)} />
                  <text x={60} y={56} textAnchor="middle"
                    fill={verse.palette.shadow} style={navicueType.micro}>
                    fear
                  </text>
                  <text x={60} y={70} textAnchor="middle"
                    fill={verse.palette.textFaint} style={navicueType.micro}>
                    toxic
                  </text>
                </motion.g>

                {/* Element B: Love (right, soft) */}
                <motion.g
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <circle cx={180} cy={60} r={28}
                    fill={verse.palette.accent}
                    opacity={safeOpacity(0.08)} />
                  <circle cx={180} cy={60} r={28}
                    fill="none"
                    stroke={verse.palette.accent}
                    strokeWidth={1}
                    opacity={safeOpacity(0.3)} />
                  <text x={180} y={56} textAnchor="middle"
                    fill={verse.palette.accent} style={navicueType.micro}>
                    love
                  </text>
                  <text x={180} y={70} textAnchor="middle"
                    fill={verse.palette.textFaint} style={navicueType.micro}>
                    soft
                  </text>
                </motion.g>

                {/* Plus sign */}
                <text x={120} y={65} textAnchor="middle"
                  fill={verse.palette.textFaint} style={navicueType.hint}>
                  +
                </text>
              </motion.g>
            ) : (
              <motion.g
                key="compound"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Compound: Courage (center, stable) */}
                <circle cx={120} cy={60} r={35}
                  fill={verse.palette.accent}
                  opacity={safeOpacity(0.1)} />
                <circle cx={120} cy={60} r={35}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={1.5}
                  opacity={safeOpacity(0.4)} />

                {/* Inner structure -- bond lines */}
                <line x1={105} y1={50} x2={135} y2={70}
                  stroke={verse.palette.accent} strokeWidth={0.8}
                  opacity={safeOpacity(0.2)} />
                <line x1={135} y1={50} x2={105} y2={70}
                  stroke={verse.palette.accent} strokeWidth={0.8}
                  opacity={safeOpacity(0.2)} />

                <text x={120} y={56} textAnchor="middle"
                  fill={verse.palette.accent} style={navicueType.choice}>
                  courage
                </text>
                <text x={120} y={75} textAnchor="middle"
                  fill={verse.palette.textFaint} style={navicueType.micro}>
                  stable / strong
                </text>

                {/* Glow */}
                <motion.circle
                  cx={120} cy={60} r={50}
                  fill={verse.palette.accent}
                  animate={{ opacity: [0.02, 0.05, 0.02] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Combine button */}
      {!combined && (
        <motion.div
          style={{
            ...immersiveTap(verse.palette).zone,
            ...navicueType.choice,
            color: verse.palette.accent,
            border: `1px solid ${verse.palette.accentGlow}`,
            borderRadius: 8,
            padding: '14px 20px',
            boxShadow: `0 0 12px ${verse.palette.accentGlow}`,
            position: 'relative' as const,
            zIndex: 2,
            cursor: 'pointer',
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCombine}
        >
          combine
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'neither could be this alone'
          : combined
            ? 'bonding...'
            : 'two dangerous elements'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          dialectical synthesis
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'synthesis' : 'combine the elements'}
      </div>
    </div>
  );
}
