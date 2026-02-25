/**
 * SIMULATOR #1 -- 1241. The Map vs. Territory
 * "The map is wrong. Trust the mud."
 * INTERACTION: Tap to walk on the map -- it rips. Switch to Territory Mode.
 * STEALTH KBE: Reality Testing -- Adaptability (K)
 *
 * COMPOSITOR: pattern_glitch / Arc / work / knowing / tap / 1241
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

export default function Simulator_MapVsTerritory({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1241,
        isSeal: false,
      }}
      arrivalText="A map says 'Easy Path.'"
      prompt="You are frustrated because the map says easy but the ground says swamp. The map is wrong. Trust the mud."
      resonantText="Reality testing. You threw away the plan that no longer matched the terrain. Adaptability is not giving up. It is trusting the mud over the map. The territory always wins."
      afterglowCoda="Trust the mud."
      onComplete={onComplete}
    >
      {(verse) => <MapVsTerritoryInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function MapVsTerritoryInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'map' | 'ripped' | 'territory' | 'done'>('map');

  const handleWalk = () => {
    if (phase !== 'map') return;
    setPhase('ripped');
  };

  const handleSwitch = () => {
    if (phase !== 'ripped') return;
    setPhase('territory');
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => verse.advance(), 2800);
    }, 2500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 160;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          <AnimatePresence mode="wait">
            {/* MAP VIEW */}
            {(phase === 'map' || phase === 'ripped') && (
              <motion.g
                key="map"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Grid lines (map aesthetic) */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`v${i}`}
                    x1={30 + i * 30} y1={15} x2={30 + i * 30} y2={145}
                    stroke={verse.palette.primary} strokeWidth={0.3}
                    opacity={safeOpacity(0.15)} />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line key={`h${i}`}
                    x1={15} y1={25 + i * 30} x2={245} y2={25 + i * 30}
                    stroke={verse.palette.primary} strokeWidth={0.3}
                    opacity={safeOpacity(0.15)} />
                ))}

                {/* Path on map (smooth, clean) */}
                <path
                  d="M 40,130 Q 80,100 120,80 Q 160,60 200,50 Q 230,40 240,35"
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={2} strokeDasharray="6 3"
                  opacity={safeOpacity(0.3)}
                />

                {/* Labels */}
                <text x={40} y={145} fill={verse.palette.textFaint}
                  style={navicueType.micro}>start</text>
                <text x={225} y={30} fill={verse.palette.accent}
                  style={navicueType.micro}>easy</text>

                {/* Rip effect */}
                {phase === 'ripped' && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Tear lines */}
                    <motion.path
                      d="M 100,10 Q 110,50 95,80 Q 105,110 100,150"
                      fill="none" stroke={verse.palette.shadow}
                      strokeWidth={1.5}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <motion.path
                      d="M 160,10 Q 150,60 165,90 Q 155,120 160,150"
                      fill="none" stroke={verse.palette.shadow}
                      strokeWidth={1.5}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    />
                    <motion.text
                      x={130} y={85} textAnchor="middle"
                      fill={verse.palette.shadow}
                      style={navicueType.micro}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: 0.5 }}
                    >
                      the map lied
                    </motion.text>
                  </motion.g>
                )}
              </motion.g>
            )}

            {/* TERRITORY VIEW */}
            {(phase === 'territory' || phase === 'done') && (
              <motion.g
                key="territory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {/* Organic terrain shapes */}
                <motion.path
                  d="M 20,140 Q 60,100 80,120 Q 100,135 130,110 Q 160,85 180,100 Q 200,115 240,90"
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={1}
                  opacity={safeOpacity(0.25)}
                />
                {/* Mud/swamp patches */}
                {[
                  { cx: 70, cy: 115, rx: 20, ry: 8 },
                  { cx: 140, cy: 105, rx: 15, ry: 6 },
                  { cx: 200, cy: 95, rx: 18, ry: 7 },
                ].map((p, i) => (
                  <motion.ellipse
                    key={i} {...p}
                    fill={verse.palette.primary}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.08 + i * 0.02) }}
                    transition={{ delay: i * 0.2 }}
                  />
                ))}

                {/* Tree shapes */}
                {[50, 110, 170, 220].map((x, i) => (
                  <motion.g key={`tree-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: safeOpacity(0.2), y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                  >
                    <line x1={x} y1={55 + i * 8} x2={x} y2={75 + i * 8}
                      stroke={verse.palette.accent} strokeWidth={1} />
                    <circle cx={x} cy={50 + i * 8} r={8}
                      fill={verse.palette.accent} opacity={safeOpacity(0.1)} />
                  </motion.g>
                ))}

                {/* Real path (messy, winding) */}
                <motion.path
                  d="M 30,135 Q 50,130 65,125 Q 85,118 95,122 Q 110,128 125,115 Q 145,100 165,108 Q 185,115 195,105 Q 210,92 235,88"
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  opacity={safeOpacity(0.4)}
                />

                {/* Walking dot */}
                <motion.circle
                  r={4}
                  fill={verse.palette.accent}
                  initial={{ cx: 30, cy: 135, opacity: 0 }}
                  animate={{ cx: 235, cy: 88, opacity: safeOpacity(0.5) }}
                  transition={{ duration: 2, delay: 0.8, ease: 'easeInOut' }}
                />

                <text x={130} y={25} textAnchor="middle"
                  fill={verse.palette.accent} style={navicueType.micro}
                  opacity={0.5}>
                  territory mode
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Actions */}
      {phase === 'map' && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleWalk}
        >
          walk the map
        </motion.button>
      )}

      {phase === 'ripped' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleSwitch}
        >
          switch to territory
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done'
          ? 'real mud. real path.'
          : phase === 'territory'
            ? 'navigating the actual terrain...'
            : phase === 'ripped'
              ? 'the map ripped. it was never the ground.'
              : 'the plan looks clean'}
      </span>

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          adaptability
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'reality testing' : 'map or territory?'}
      </div>
    </div>
  );
}
