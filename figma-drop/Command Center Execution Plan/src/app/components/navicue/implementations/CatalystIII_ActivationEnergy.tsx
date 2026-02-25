/**
 * CATALYST III #3 -- 1223. The Activation Energy
 * "Push over the activation barrier."
 * INTERACTION: Drag the ball up the steep slope. High resistance, then free roll.
 * STEALTH KBE: Effort -- Overcoming Activation Energy (E)
 *
 * COMPOSITOR: witness_ritual / Storm / morning / embodying / drag / 1223
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function CatalystIII_ActivationEnergy({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Storm',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1223,
        isSeal: false,
      }}
      arrivalText="A ball at the bottom. A hill in the way."
      prompt="The hardest part is the hump. You have to put in more energy than you get back... at first. Push over the activation barrier."
      resonantText="Effort. The uphill felt impossible. The downhill felt like flight. Every meaningful change requires an activation energy. The cost is front-loaded, the reward is permanent."
      afterglowCoda="Over the hump."
      onComplete={onComplete}
    >
      {(verse) => <ActivationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ActivationInteraction({ verse }: { verse: any }) {
  const [progress, setProgress] = useState(0); // 0-1, 0.5 = peak
  const [rolling, setRolling] = useState(false);
  const [done, setDone] = useState(false);
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const SCENE_W = 260;
  const SCENE_H = 140;

  // Energy curve: hill peaks at 0.4, then drops
  const getY = (t: number) => {
    if (t < 0.4) {
      // Steep uphill
      return SCENE_H - 20 - (Math.sin(t / 0.4 * Math.PI / 2) * 80);
    } else {
      // Gentle downhill
      const dt = (t - 0.4) / 0.6;
      return SCENE_H - 100 + dt * 60;
    }
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (rolling || done) return;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rolling, done]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || rolling || done) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    // Can only push forward, with resistance on uphill
    const clamped = Math.max(progress, Math.min(0.45, x));
    setProgress(clamped);
  }, [progress, rolling, done]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    if (progress >= 0.4 && !rolling) {
      // Over the hump -- auto-roll
      setRolling(true);
    }
  }, [progress, rolling]);

  // Auto-roll downhill
  useEffect(() => {
    if (!rolling) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.015;
        if (next >= 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 2500);
          return 1;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [rolling, verse]);

  const ballX = 20 + progress * (SCENE_W - 40);
  const ballY = getY(progress) - 10;

  // Path for the energy curve
  const curvePath = Array.from({ length: 50 }, (_, i) => {
    const t = i / 49;
    const x = 20 + t * (SCENE_W - 40);
    const y = getY(t);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Energy landscape */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          ...immersiveTap(verse.palette).zone,
          width: SCENE_W,
          height: SCENE_H,
          position: 'relative',
          cursor: done ? 'default' : rolling ? 'default' : 'ew-resize',
        }}
      >
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Energy curve */}
          <path
            d={curvePath}
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={1.5}
            opacity={safeOpacity(0.2)}
          />

          {/* Activation energy label at peak */}
          <motion.text
            x={20 + 0.4 * (SCENE_W - 40)}
            y={getY(0.4) - 18}
            textAnchor="middle"
            fill={verse.palette.textFaint}
            style={navicueType.micro}
            animate={{ opacity: progress < 0.35 ? safeOpacity(0.4) : 0 }}
          >
            activation barrier
          </motion.text>

          {/* Start label */}
          <text x={25} y={SCENE_H - 8}
            fill={verse.palette.textFaint} style={navicueType.micro}>
            start
          </text>

          {/* Destination label */}
          <text x={SCENE_W - 25} y={SCENE_H - 8}
            textAnchor="end"
            fill={verse.palette.accent} style={navicueType.micro}>
            change
          </text>

          {/* Ball */}
          <motion.circle
            cx={ballX} cy={ballY}
            r={10}
            fill={verse.palette.accent}
            animate={{
              cx: ballX, cy: ballY,
              opacity: safeOpacity(0.4 + progress * 0.3),
            }}
            transition={rolling
              ? { duration: 0 }
              : { type: 'spring', stiffness: 200, damping: 20 }
            }
          />

          {/* Speed lines when rolling downhill */}
          {rolling && progress > 0.5 && Array.from({ length: 3 }).map((_, i) => (
            <motion.line
              key={i}
              x1={ballX - 15 - i * 8} y1={ballY - 3 + i * 3}
              x2={ballX - 25 - i * 8} y2={ballY - 3 + i * 3}
              stroke={verse.palette.accent}
              strokeWidth={0.8}
              animate={{ opacity: [0, safeOpacity(0.3), 0] }}
              transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.1 }}
            />
          ))}

          {/* Effort indicator on uphill */}
          {!rolling && progress > 0.05 && progress < 0.4 && (
            <motion.text
              x={ballX} y={ballY - 18}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.micro}
              animate={{ opacity: safeOpacity(0.4) }}
            >
              {progress < 0.2 ? 'hard' : progress < 0.35 ? 'harder' : 'almost'}
            </motion.text>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the reaction is free'
          : rolling
            ? 'rolling...'
            : progress < 0.05
              ? 'drag the ball up the hill'
              : 'keep pushing'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          activation energy overcome
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'effort' : 'push over the barrier'}
      </div>
    </div>
  );
}
