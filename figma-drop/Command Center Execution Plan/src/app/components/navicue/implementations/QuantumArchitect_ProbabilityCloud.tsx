/**
 * QUANTUM ARCHITECT #2 -- 1232. The Probability Cloud
 * "Aim for the highest probability. Ignore the outliers."
 * INTERACTION: Draw a path toward the densest part of the dot cloud
 * STEALTH KBE: Risk Assessment -- Probabilistic Thinking (K)
 *
 * COMPOSITOR: poetic_precision / Drift / morning / knowing / draw / 1232
 */
import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  navicueInteraction,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

// Seeded RNG for deterministic cloud
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export default function QuantumArchitect_ProbabilityCloud({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'k',
        hook: 'draw',
        specimenSeed: 1232,
        isSeal: false,
      }}
      arrivalText="You are a dot. The future is a cloud."
      prompt="You cannot predict the exact point. You can predict the cloud. Aim for the highest probability. Ignore the outliers."
      resonantText="Risk assessment. You did not chase the long shot. You aimed for the fat part of the distribution. Probabilistic thinking trades fantasy for strategy."
      afterglowCoda="Aim for the cloud."
      onComplete={onComplete}
    >
      {(verse) => <ProbabilityCloudInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ProbabilityCloudInteraction({ verse }: { verse: any }) {
  const rand = seededRandom(1232);
  const SCENE_W = 280;
  const SCENE_H = 180;
  const CENTER_X = 200;
  const CENTER_Y = 90;
  const START_X = 30;
  const START_Y = 140;

  // Generate Gaussian-distributed cloud
  const cloudDots = useRef(
    Array.from({ length: 60 }, () => {
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(-2 * Math.log(rand())) * 25;
      return {
        x: CENTER_X + Math.cos(angle) * r,
        y: CENTER_Y + Math.sin(angle) * r,
      };
    })
  ).current;

  const [path, setPath] = useState<Array<{ x: number; y: number }>>([]);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const [hitCenter, setHitCenter] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const getPoint = useCallback((e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * SCENE_W,
      y: ((e.clientY - rect.top) / rect.height) * SCENE_H,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return;
    setDrawing(true);
    const pt = getPoint(e);
    if (pt) setPath([pt]);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [done, getPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drawing || done) return;
    const pt = getPoint(e);
    if (pt) setPath(prev => [...prev, pt]);
  }, [drawing, done, getPoint]);

  const handlePointerUp = useCallback(() => {
    if (!drawing) return;
    setDrawing(false);

    // Check if path endpoint is near the center of the cloud
    if (path.length > 3) {
      const endPt = path[path.length - 1];
      const dist = Math.sqrt((endPt.x - CENTER_X) ** 2 + (endPt.y - CENTER_Y) ** 2);
      if (dist < 40) {
        setHitCenter(true);
        setDone(true);
        setTimeout(() => verse.advance(), 2800);
      } else {
        // Missed the fat part -- reset
        setTimeout(() => setPath([]), 1500);
      }
    }
  }, [drawing, path, verse]);

  const pathD = path.length > 1
    ? `M ${path[0].x},${path[0].y} ${path.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')}`
    : '';

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div
        style={{
          ...navicueInteraction.tapZone,
          width: SCENE_W,
          height: SCENE_H,
          cursor: done ? 'default' : 'crosshair',
          touchAction: 'none',
        }}
      >
        <svg
          ref={svgRef}
          width={SCENE_W}
          height={SCENE_H}
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Cloud dots -- density increases toward center */}
          {cloudDots.map((dot, i) => {
            const dist = Math.sqrt((dot.x - CENTER_X) ** 2 + (dot.y - CENTER_Y) ** 2);
            const density = Math.max(0.1, 1 - dist / 80);
            return (
              <motion.circle
                key={i}
                cx={dot.x} cy={dot.y}
                r={1.5 + density * 1.5}
                fill={verse.palette.accent}
                animate={{
                  opacity: safeOpacity(
                    hitCenter
                      ? density * 0.5
                      : density * 0.25
                  ),
                }}
              />
            );
          })}

          {/* Center marker (subtle) */}
          <motion.circle
            cx={CENTER_X} cy={CENTER_Y} r={8}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={0.5}
            strokeDasharray="2 3"
            animate={{
              opacity: hitCenter
                ? safeOpacity(0.5)
                : [safeOpacity(0.1), safeOpacity(0.2), safeOpacity(0.1)],
            }}
            transition={hitCenter ? {} : { repeat: Infinity, duration: 2 }}
          />

          {/* Start dot (You) */}
          <circle
            cx={START_X} cy={START_Y} r={5}
            fill={verse.palette.primary}
            opacity={safeOpacity(0.3)}
          />
          <text x={START_X} y={START_Y + 18} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            you
          </text>

          {/* Drawn path */}
          {pathD && (
            <motion.path
              d={pathD}
              fill="none"
              stroke={hitCenter ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1.5}
              animate={{
                opacity: hitCenter ? safeOpacity(0.5) : safeOpacity(0.3),
              }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Miss indicator */}
          {!hitCenter && path.length > 3 && !drawing && (
            <motion.text
              x={path[path.length - 1]?.x}
              y={(path[path.length - 1]?.y || 0) - 10}
              textAnchor="middle"
              fill={verse.palette.shadow}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 0] }}
              transition={{ duration: 1.5 }}
            >
              outlier
            </motion.text>
          )}

          {/* Success glow */}
          {hitCenter && (
            <motion.circle
              cx={CENTER_X} cy={CENTER_Y} r={30}
              fill={verse.palette.accent}
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.12), safeOpacity(0.05)] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'you aimed for the highest probability'
          : drawing
            ? 'draw toward the densest cluster'
            : path.length > 0
              ? 'not the fat part. try again.'
              : 'draw a path to the center of the cloud'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          probabilistic thinking
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'risk assessment' : 'find the fat part of the curve'}
      </div>
    </div>
  );
}
