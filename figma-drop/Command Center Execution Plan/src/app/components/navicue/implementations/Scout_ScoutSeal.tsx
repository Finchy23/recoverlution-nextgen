/**
 * SCOUT #10 -- 1280. The Scout Seal (The Proof)
 * "The world is wide. You are ready."
 * INTERACTION: Observe -- astrolabe-like navigation instrument rotating, locating stars
 * STEALTH KBE: Spatial Memory -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1280
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

export default function Scout_ScoutSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1280,
        isSeal: true,
      }}
      arrivalText="An ancient instrument."
      prompt="The world is wide. You are ready."
      resonantText="Spatial memory. The hippocampus grows physically larger in those who navigate complex environments. Exploring new territory builds a bigger brain. The map is not in the paper. The map is in you."
      afterglowCoda="The map is in you."
      onComplete={onComplete}
    >
      {(verse) => <ScoutSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ScoutSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 4000);
    const t3 = setTimeout(() => setPhase(3), 7000);
    const t4 = setTimeout(() => setPhase(4), 10000);
    const t5 = setTimeout(() => {
      setPhase(5);
      setTimeout(() => verse.advance(), 3500);
    }, 12500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [verse]);

  const W = 240, H = 240;
  const CX = W / 2, CY = H / 2;
  const R = 85;

  // Stars around the instrument
  const stars = [
    { x: 40, y: 30, r: 1.5 },
    { x: 200, y: 25, r: 1 },
    { x: 25, y: 120, r: 1.2 },
    { x: 215, y: 100, r: 1 },
    { x: 60, y: 200, r: 1.5 },
    { x: 180, y: 210, r: 1.2 },
    { x: 120, y: 15, r: 1 },
    { x: 130, y: 225, r: 1 },
  ];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Stars */}
          {stars.map((s, i) => (
            <motion.circle key={i}
              cx={s.x} cy={s.y} r={s.r}
              fill={verse.palette.textFaint}
              animate={{ opacity: [safeOpacity(0.1), safeOpacity(0.3), safeOpacity(0.1)] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3 }}
            />
          ))}

          {/* Outer ring (astrolabe body) */}
          {phase >= 1 && (
            <motion.circle
              cx={CX} cy={CY} r={R}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.2), scale: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Degree marks */}
          {phase >= 1 && Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const rad = angle * Math.PI / 180;
            const isMajor = i % 6 === 0;
            const r1 = R - (isMajor ? 8 : 4);
            return (
              <motion.line key={i}
                x1={CX + r1 * Math.cos(rad)} y1={CY + r1 * Math.sin(rad)}
                x2={CX + R * Math.cos(rad)} y2={CY + R * Math.sin(rad)}
                stroke={verse.palette.primary}
                strokeWidth={isMajor ? 0.8 : 0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(isMajor ? 0.2 : 0.08) }}
                transition={{ delay: 0.5 + i * 0.01 }}
              />
            );
          })}

          {/* Inner circles (altitude rings) */}
          {phase >= 2 && [0.7, 0.5, 0.3].map((scale, i) => (
            <motion.circle key={i}
              cx={CX} cy={CY} r={R * scale}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.3}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.1) }}
              transition={{ delay: i * 0.2 }}
            />
          ))}

          {/* Rete (star pointer plate) -- rotates */}
          {phase >= 2 && (
            <motion.g
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              {/* Pointer arms */}
              {[0, 72, 144, 216, 288].map((angle, i) => {
                const rad = angle * Math.PI / 180;
                const armR = R * 0.65;
                return (
                  <motion.line key={i}
                    x1={CX} y1={CY}
                    x2={CX + armR * Math.cos(rad)}
                    y2={CY + armR * Math.sin(rad)}
                    stroke={verse.palette.accent}
                    strokeWidth={0.5}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.2) }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  />
                );
              })}

              {/* Star points on rete */}
              {[45, 130, 200, 310].map((angle, i) => {
                const rad = angle * Math.PI / 180;
                const d = R * (0.35 + i * 0.08);
                return (
                  <motion.circle key={`sp-${i}`}
                    cx={CX + d * Math.cos(rad)}
                    cy={CY + d * Math.sin(rad)}
                    r={2}
                    fill={verse.palette.accent}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.3) }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Alidade (sighting arm) */}
          {phase >= 3 && (
            <motion.g
              animate={{ rotate: [0, -45] }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              <motion.line
                x1={CX - R + 10} y1={CY}
                x2={CX + R - 10} y2={CY}
                stroke={verse.palette.accent}
                strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.3) }}
              />
              {/* Sighting holes */}
              <circle cx={CX - R + 18} cy={CY} r={3}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.25)} />
              <circle cx={CX + R - 18} cy={CY} r={3}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.25)} />
            </motion.g>
          )}

          {/* Center pin */}
          {phase >= 1 && (
            <motion.circle
              cx={CX} cy={CY} r={3}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.3) }}
            />
          )}

          {/* Star alignment lines (phase 4) */}
          {phase >= 4 && stars.slice(0, 4).map((s, i) => (
            <motion.line key={`align-${i}`}
              x1={CX} y1={CY}
              x2={s.x} y2={s.y}
              stroke={verse.palette.accent}
              strokeWidth={0.3}
              strokeDasharray="2 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.12) }}
              transition={{ delay: i * 0.3 }}
            />
          ))}

          {/* Seal outer ring */}
          {phase >= 5 && (
            <motion.circle
              cx={CX} cy={CY} r={R + 15}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 5}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'the instrument'}
            {phase === 1 && 'calibrating'}
            {phase === 2 && 'the rete turns'}
            {phase === 3 && 'sighting the stars'}
            {phase === 4 && 'position found'}
            {phase >= 5 && 'the world is wide. you are ready.'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'spatial memory' : 'observe'}
      </div>
    </div>
  );
}
