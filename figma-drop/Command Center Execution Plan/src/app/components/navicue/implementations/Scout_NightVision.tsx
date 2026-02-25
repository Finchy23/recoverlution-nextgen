/**
 * SCOUT #4 -- 1274. The Night Vision
 * "Curiosity is night vision. Turn it on."
 * INTERACTION: Tap to toggle curiosity mode -- darkness becomes green-tinted clarity
 * STEALTH KBE: Curiosity -- Investigation over Reaction (B)
 *
 * COMPOSITOR: pattern_glitch / Pulse / night / believing / tap / 1274
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const SHAPES = [
  { x: 60, y: 65, r: 18, darkLabel: 'monster?', lightLabel: 'bush' },
  { x: 150, y: 50, r: 22, darkLabel: 'threat?', lightLabel: 'tree' },
  { x: 210, y: 80, r: 15, darkLabel: 'danger?', lightLabel: 'rock' },
  { x: 100, y: 110, r: 20, darkLabel: 'shadow?', lightLabel: 'friend' },
];

export default function Scout_NightVision({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1274,
        isSeal: false,
      }}
      arrivalText="Pitch black. Shapes in the dark."
      prompt="Darkness is just a lack of data. Equip the right sensor. Curiosity is night vision. Turn it on."
      resonantText="Curiosity. You turned on the sensor and the monsters became bushes. Investigation over reaction. Fear is always a data problem. Curiosity is the instrument that solves it."
      afterglowCoda="Turn it on."
      onComplete={onComplete}
    >
      {(verse) => <NightVisionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NightVisionInteraction({ verse }: { verse: any }) {
  const [nvOn, setNvOn] = useState(false);
  const [done, setDone] = useState(false);

  const handleToggle = () => {
    if (done) return;
    setNvOn(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 270, H = 160;

  // Night vision green tint
  const nvColor = '#4ade80';

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Mode indicator */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '4px 12px', borderRadius: 12,
        border: `1px solid ${nvOn ? nvColor + '30' : verse.palette.shadow + '20'}`,
      }}>
        <motion.div style={{
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: nvOn ? nvColor : verse.palette.shadow,
        }} animate={{ opacity: nvOn ? [0.5, 1, 0.5] : 0.3 }}
          transition={nvOn ? { repeat: Infinity, duration: 1.5 } : {}} />
        <span style={{
          ...navicueType.micro,
          color: nvOn ? nvColor : verse.palette.textFaint,
        }}>
          {nvOn ? 'curiosity mode: active' : 'standard vision: dark'}
        </span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Background */}
          <rect x={0} y={0} width={W} height={H} rx={8}
            fill={nvOn ? nvColor : verse.palette.primary}
            opacity={safeOpacity(nvOn ? 0.04 : 0.1)} />

          {/* Scan lines (night vision effect) */}
          {nvOn && Array.from({ length: 20 }).map((_, i) => (
            <motion.line key={i}
              x1={0} y1={i * 8} x2={W} y2={i * 8}
              stroke={nvColor}
              strokeWidth={0.3}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.06) }}
              transition={{ delay: i * 0.02 }}
            />
          ))}

          {/* Shapes */}
          {SHAPES.map((shape, i) => (
            <motion.g key={i}>
              {/* Shape body */}
              <motion.g>
                {/* Dark mode: menacing irregular shapes */}
                {!nvOn && (
                  <motion.path
                    d={`M ${shape.x - shape.r},${shape.y + shape.r * 0.5}
                        Q ${shape.x - shape.r * 0.5},${shape.y - shape.r * 1.2} ${shape.x},${shape.y - shape.r}
                        Q ${shape.x + shape.r * 0.8},${shape.y - shape.r * 0.8} ${shape.x + shape.r},${shape.y + shape.r * 0.5}
                        Q ${shape.x},${shape.y + shape.r} ${shape.x - shape.r},${shape.y + shape.r * 0.5} Z`}
                    fill={verse.palette.shadow}
                    animate={{
                      opacity: [safeOpacity(0.15), safeOpacity(0.25), safeOpacity(0.15)],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                  />
                )}

                {/* Night vision: harmless round shapes */}
                {nvOn && (
                  <motion.circle
                    cx={shape.x} cy={shape.y} r={shape.r * 0.7}
                    fill={nvColor}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.12) }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  />
                )}
                {nvOn && (
                  <motion.circle
                    cx={shape.x} cy={shape.y} r={shape.r * 0.7}
                    fill="none" stroke={nvColor}
                    strokeWidth={0.5}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.3) }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  />
                )}
              </motion.g>

              {/* Labels */}
              <AnimatePresence mode="wait">
                <motion.text
                  key={nvOn ? 'light' : 'dark'}
                  x={shape.x} y={shape.y + shape.r + 15}
                  textAnchor="middle"
                  fill={nvOn ? nvColor : verse.palette.shadow}
                  style={navicueType.micro}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: nvOn ? 0.6 : 0.35 }}
                  exit={{ opacity: 0 }}
                >
                  {nvOn ? shape.lightLabel : shape.darkLabel}
                </motion.text>
              </AnimatePresence>
            </motion.g>
          ))}

          {/* Crosshair (NV on) */}
          {nvOn && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.2) }}
              transition={{ delay: 0.5 }}
            >
              <circle cx={W / 2} cy={H / 2} r={30}
                fill="none" stroke={nvColor} strokeWidth={0.5} />
              <line x1={W / 2 - 35} y1={H / 2} x2={W / 2 - 25} y2={H / 2}
                stroke={nvColor} strokeWidth={0.5} />
              <line x1={W / 2 + 25} y1={H / 2} x2={W / 2 + 35} y2={H / 2}
                stroke={nvColor} strokeWidth={0.5} />
              <line x1={W / 2} y1={H / 2 - 35} x2={W / 2} y2={H / 2 - 25}
                stroke={nvColor} strokeWidth={0.5} />
              <line x1={W / 2} y1={H / 2 + 25} x2={W / 2} y2={H / 2 + 35}
                stroke={nvColor} strokeWidth={0.5} />
            </motion.g>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleToggle}>
          activate curiosity
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the monsters were bushes all along'
          : 'darkness is just a lack of data'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: nvColor }}>
          investigation over reaction
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'curiosity' : 'equip the right sensor'}
      </div>
    </div>
  );
}
