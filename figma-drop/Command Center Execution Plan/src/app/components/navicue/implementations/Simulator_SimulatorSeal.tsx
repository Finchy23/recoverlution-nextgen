/**
 * SIMULATOR #10 -- 1250. The Simulator Seal (The Proof)
 * "The model is not the truth. But it is the tool."
 * INTERACTION: Observe -- wireframe hand holding a solid apple, mesh becomes solid
 * STEALTH KBE: Mental Models -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1250
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

export default function Simulator_SimulatorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1250,
        isSeal: true,
      }}
      arrivalText="A wireframe hand."
      prompt="The model is not the truth. But it is the tool."
      resonantText="Mental models. We do not interact with the world directly. We interact with our brain's model of the world. The wireframe became solid not because the world changed, but because the model improved. Change the model, change the interaction."
      afterglowCoda="Upgrade the model."
      onComplete={onComplete}
    >
      {(verse) => <SimulatorSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SimulatorSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);
  const breathCycle = verse.breathAmplitude;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);  // Hand appears
    const t2 = setTimeout(() => setPhase(2), 4500);  // Apple appears
    const t3 = setTimeout(() => setPhase(3), 7000);  // Mesh fills
    const t4 = setTimeout(() => {
      setPhase(4);
      setTimeout(() => verse.advance(), 3500);
    }, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [verse]);

  const SCENE_W = 240;
  const SCENE_H = 240;
  const CX = SCENE_W / 2;
  const CY = SCENE_H / 2 + 10;

  // Wireframe density increases with phase
  const wireOpacity = phase >= 3 ? 0.08 : 0.2;
  const fillOpacity = phase >= 3 ? 0.15 : 0;
  const solidProgress = phase >= 3 ? 1 : 0;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Hand -- wireframe fingers cradling */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Palm base */}
              <motion.path
                d={`M ${CX - 50},${CY + 40} Q ${CX - 55},${CY + 15} ${CX - 40},${CY - 5}
                    Q ${CX - 30},${CY - 15} ${CX - 15},${CY - 30}
                    M ${CX + 50},${CY + 40} Q ${CX + 55},${CY + 15} ${CX + 40},${CY - 5}
                    Q ${CX + 30},${CY - 15} ${CX + 15},${CY - 30}`}
                fill="none"
                stroke={verse.palette.primary}
                strokeWidth={phase >= 3 ? 1.5 : 0.8}
                animate={{
                  opacity: safeOpacity(phase >= 3 ? 0.35 : 0.2),
                }}
              />

              {/* Finger segments -- wireframe */}
              {[
                `M ${CX - 15},${CY - 30} Q ${CX - 20},${CY - 55} ${CX - 10},${CY - 65}`,
                `M ${CX},${CY - 35} Q ${CX},${CY - 60} ${CX + 5},${CY - 70}`,
                `M ${CX + 15},${CY - 30} Q ${CX + 20},${CY - 55} ${CX + 12},${CY - 65}`,
                `M ${CX - 40},${CY - 5} Q ${CX - 55},${CY - 15} ${CX - 55},${CY - 30}`,
                `M ${CX + 40},${CY - 5} Q ${CX + 55},${CY + 5} ${CX + 60},${CY - 10}`,
              ].map((d, i) => (
                <motion.path
                  key={`finger-${i}`}
                  d={d}
                  fill="none"
                  stroke={verse.palette.primary}
                  strokeWidth={phase >= 3 ? 1.2 : 0.6}
                  strokeLinecap="round"
                  animate={{
                    opacity: safeOpacity(phase >= 3 ? 0.3 : wireOpacity),
                  }}
                  transition={{ duration: 0.5 }}
                />
              ))}

              {/* Cross-hatch wireframe on palm */}
              {phase < 3 && [
                `M ${CX - 45},${CY + 20} L ${CX + 45},${CY + 20}`,
                `M ${CX - 40},${CY + 5} L ${CX + 40},${CY + 5}`,
                `M ${CX - 35},${CY - 10} L ${CX + 35},${CY - 10}`,
                `M ${CX - 30},${CY + 35} L ${CX - 30},${CY - 15}`,
                `M ${CX},${CY + 35} L ${CX},${CY - 25}`,
                `M ${CX + 30},${CY + 35} L ${CX + 30},${CY - 15}`,
              ].map((d, i) => (
                <line
                  key={`mesh-${i}`}
                  x1={parseFloat(d.split(' ')[1].split(',')[0].substring(0))}
                  y1={0} x2={0} y2={0}
                  stroke={verse.palette.primary}
                  strokeWidth={0.3}
                  opacity={safeOpacity(0.1)}
                >
                  <animate attributeName="opacity"
                    values={`${safeOpacity(0.05)};${safeOpacity(0.1)};${safeOpacity(0.05)}`}
                    dur="3s" repeatCount="indefinite" />
                </line>
              ))}

              {/* Palm fill (solid phase) */}
              {phase >= 3 && (
                <motion.path
                  d={`M ${CX - 50},${CY + 40} Q ${CX - 55},${CY + 15} ${CX - 40},${CY - 5}
                      Q ${CX - 30},${CY - 15} ${CX - 15},${CY - 30}
                      L ${CX + 15},${CY - 30}
                      Q ${CX + 30},${CY - 15} ${CX + 40},${CY - 5}
                      Q ${CX + 55},${CY + 15} ${CX + 50},${CY + 40} Z`}
                  fill={verse.palette.primary}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.06) }}
                  transition={{ duration: 1.5 }}
                />
              )}
            </motion.g>
          )}

          {/* Apple -- starts wireframe, becomes solid */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Apple body */}
              <motion.ellipse
                cx={CX} cy={CY + 10}
                rx={22} ry={20}
                fill={verse.palette.accent}
                animate={{
                  opacity: safeOpacity(phase >= 3 ? 0.2 : 0.03),
                }}
                transition={{ duration: 1 }}
              />

              {/* Wireframe mesh on apple */}
              {[0, 1, 2, 3].map(i => (
                <motion.ellipse
                  key={`wire-h-${i}`}
                  cx={CX} cy={CY + 10}
                  rx={22} ry={5 + i * 5}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  animate={{
                    opacity: safeOpacity(phase >= 3 ? 0.1 : 0.2),
                  }}
                />
              ))}
              {[-15, -5, 5, 15].map((dx, i) => (
                <motion.line
                  key={`wire-v-${i}`}
                  x1={CX + dx} y1={CY - 10}
                  x2={CX + dx} y2={CY + 30}
                  stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  animate={{
                    opacity: safeOpacity(phase >= 3 ? 0.08 : 0.15),
                  }}
                />
              ))}

              {/* Apple outline */}
              <motion.ellipse
                cx={CX} cy={CY + 10}
                rx={22} ry={20}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={phase >= 3 ? 1.5 : 0.8}
                animate={{
                  opacity: safeOpacity(phase >= 3 ? 0.5 : 0.25),
                }}
              />

              {/* Stem */}
              <motion.path
                d={`M ${CX},${CY - 10} Q ${CX + 3},${CY - 18} ${CX + 2},${CY - 22}`}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1}
                animate={{
                  opacity: safeOpacity(phase >= 3 ? 0.4 : 0.2),
                }}
              />

              {/* Leaf */}
              <motion.path
                d={`M ${CX + 2},${CY - 19} Q ${CX + 12},${CY - 25} ${CX + 8},${CY - 18}`}
                fill={verse.palette.accent}
                animate={{
                  opacity: safeOpacity(phase >= 3 ? 0.2 : 0.08),
                }}
              />
            </motion.g>
          )}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY}
              r={100}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </svg>
      </div>

      {/* Phase text */}
      <motion.div
        animate={{ opacity: 0.6 }}
        style={{
          ...navicueType.hint,
          color: phase >= 4 ? verse.palette.accent : verse.palette.textFaint,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        {phase === 0 && 'a wireframe world'}
        {phase === 1 && 'the hand is a model'}
        {phase === 2 && 'it holds a wireframe apple'}
        {phase === 3 && 'the mesh becomes solid'}
        {phase >= 4 && 'the model is not the truth. but it is the tool.'}
      </motion.div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 4 ? 'mental models' : 'observe'}
      </div>
    </div>
  );
}
