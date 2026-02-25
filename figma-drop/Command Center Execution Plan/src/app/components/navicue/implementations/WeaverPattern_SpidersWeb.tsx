/**
 * WEAVER PATTERN #5 -- 1285. The Spider's Web (Sensitivity)
 * "If your web is strung tight, you will feel the opportunity before you see it."
 * INTERACTION: Hold to attune -- vibration arrives at the edge, react by tapping
 * STEALTH KBE: Attunement -- Sensory Awareness (E)
 *
 * COMPOSITOR: sensory_cinema / Circuit / morning / embodying / tap / 1285
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function WeaverPattern_SpidersWeb({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1285,
        isSeal: false,
      }}
      arrivalText="A web. You sit at the center."
      prompt="You do not need eyes. You need connection. If your web is strung tight, you will feel the opportunity before you see it."
      resonantText="Attunement. You felt the vibration before you saw the target. Sensory awareness is the spider's gift: sit still, stay connected, and the information travels to you."
      afterglowCoda="Feel the vibration."
      onComplete={onComplete}
    >
      {(verse) => <SpidersWebInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SpidersWebInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'waiting' | 'vibrating' | 'caught' | 'done'>('waiting');
  const [targetAngle, setTargetAngle] = useState(0);
  const [vibrationWave, setVibrationWave] = useState(0);
  const vibTimer = useRef<any>(null);

  const W = 240, H = 240;
  const CX = W / 2, CY = H / 2;
  const R = 90;
  const RINGS = 5;
  const SPOKES = 12;

  // Start vibration after random delay
  useEffect(() => {
    const delay = 2000 + Math.random() * 2000;
    const t = setTimeout(() => {
      const angle = Math.floor(Math.random() * SPOKES) * (360 / SPOKES);
      setTargetAngle(angle);
      setPhase('vibrating');

      // Animate vibration wave from edge to center
      let wave = 0;
      vibTimer.current = setInterval(() => {
        wave += 0.15;
        setVibrationWave(wave);
        if (wave >= 1) {
          clearInterval(vibTimer.current);
        }
      }, 50);
    }, delay);

    return () => {
      clearTimeout(t);
      if (vibTimer.current) clearInterval(vibTimer.current);
    };
  }, []);

  const handleCatch = () => {
    if (phase !== 'vibrating') return;
    setPhase('caught');
    setPhase('done');
    if (vibTimer.current) clearInterval(vibTimer.current);
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');

  // Generate web geometry
  const spokeLines = Array.from({ length: SPOKES }).map((_, i) => {
    const angle = (i * 360) / SPOKES;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: CX, y1: CY,
      x2: CX + R * Math.cos(rad),
      y2: CY + R * Math.sin(rad),
      angle,
    };
  });

  const ringPaths = Array.from({ length: RINGS }).map((_, ring) => {
    const ringR = (R / RINGS) * (ring + 1);
    const points = Array.from({ length: SPOKES }).map((_, spoke) => {
      const rad = (spoke * 360 / SPOKES) * Math.PI / 180;
      return `${CX + ringR * Math.cos(rad)},${CY + ringR * Math.sin(rad)}`;
    });
    return `M ${points.join(' L ')} Z`;
  });

  // Target spoke position
  const targetRad = (targetAngle * Math.PI) / 180;
  const targetX = CX + R * Math.cos(targetRad);
  const targetY = CY + R * Math.sin(targetRad);

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Spokes */}
          {spokeLines.map((line, i) => {
            const isTarget = phase === 'vibrating' && Math.abs(line.angle - targetAngle) < 1;
            return (
              <motion.line key={`spoke-${i}`}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke={isTarget ? verse.palette.accent : verse.palette.primary}
                strokeWidth={isTarget ? 1 : 0.5}
                animate={{
                  opacity: safeOpacity(isTarget ? 0.35 : 0.12),
                }}
              />
            );
          })}

          {/* Concentric rings */}
          {ringPaths.map((d, i) => (
            <motion.path key={`ring-${i}`} d={d}
              fill="none"
              stroke={verse.palette.primary}
              strokeWidth={0.4}
              opacity={safeOpacity(0.08 + i * 0.02)} />
          ))}

          {/* Vibration wave traveling along target spoke */}
          {phase === 'vibrating' && (
            <motion.g>
              {/* Wave pulse */}
              <motion.circle
                fill={verse.palette.accent}
                r={3}
                animate={{
                  cx: CX + (R - R * vibrationWave) * Math.cos(targetRad),
                  cy: CY + (R - R * vibrationWave) * Math.sin(targetRad),
                  opacity: [safeOpacity(0.4), safeOpacity(0.15), safeOpacity(0.4)],
                }}
                transition={{
                  opacity: { repeat: Infinity, duration: 0.4 },
                }}
              />

              {/* Ripple rings from impact point */}
              {[0, 1, 2].map(i => (
                <motion.circle key={i}
                  cx={targetX} cy={targetY}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  animate={{
                    r: [3, 15 + i * 8],
                    opacity: [safeOpacity(0.2), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: i * 0.3,
                  }}
                />
              ))}

              {/* Fly/target dot at edge */}
              <motion.circle
                cx={targetX} cy={targetY} r={4}
                fill={verse.palette.accent}
                animate={{ opacity: [safeOpacity(0.3), safeOpacity(0.5), safeOpacity(0.3)] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            </motion.g>
          )}

          {/* Center spider (you) */}
          <motion.circle
            cx={CX} cy={CY} r={6}
            fill={verse.palette.accent}
            animate={{
              opacity: safeOpacity(phase === 'done' ? 0.4 : 0.2),
            }}
          />
          <circle cx={CX} cy={CY} r={6}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={0.5} opacity={safeOpacity(0.3)} />

          {/* Catch line to target (done) */}
          {phase === 'done' && (
            <motion.line
              x1={CX} y1={CY} x2={targetX} y2={targetY}
              stroke={verse.palette.accent}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.4) }}
              transition={{ duration: 0.4 }}
            />
          )}
        </svg>
      </div>

      {phase === 'vibrating' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleCatch}
        >
          catch
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done' ? 'you felt it before you saw it'
          : phase === 'vibrating' ? 'vibration detected...'
            : 'hold the center. wait.'}
      </span>

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          sensory awareness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'attunement' : 'feel the web'}
      </div>
    </div>
  );
}
