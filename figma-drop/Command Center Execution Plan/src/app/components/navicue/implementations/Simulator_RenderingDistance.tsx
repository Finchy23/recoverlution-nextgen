/**
 * SIMULATOR #6 -- 1246. The Rendering Distance
 * "Push the fog back. Look at next year, not just next minute."
 * INTERACTION: Drag/tap to increase render distance -- fog recedes, horizon appears
 * STEALTH KBE: Perspective -- Temporal Extension (E)
 *
 * COMPOSITOR: sensory_cinema / Drift / night / embodying / drag / 1246
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

export default function Simulator_RenderingDistance({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1246,
        isSeal: false,
      }}
      arrivalText="Fog. You can see one foot ahead."
      prompt="Anxiety lives in the immediate. Peace lives in the distance. Push the fog back. Look at next year, not just next minute."
      resonantText="Perspective. You pushed the fog back and found the horizon waiting. Temporal extension is the rendering upgrade. When you see further, the next minute stops being a crisis and becomes a step."
      afterglowCoda="Push the fog back."
      onComplete={onComplete}
    >
      {(verse) => <RenderingDistanceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RenderingDistanceInteraction({ verse }: { verse: any }) {
  const [renderDist, setRenderDist] = useState(0); // 0 to 1
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const SCENE_W = 280;
  const SCENE_H = 160;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [done]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || done) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const newDist = Math.max(0, Math.min(1, x));
    setRenderDist(newDist);
  }, [dragging, done]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    if (renderDist > 0.85) {
      setDone(true);
      setRenderDist(1);
      setTimeout(() => verse.advance(), 3000);
    }
  }, [renderDist, verse]);

  const fogEdge = 20 + renderDist * (SCENE_W - 40);
  const timeLabels = ['now', '1 min', '1 hr', '1 week', '1 year', 'horizon'];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Render distance readout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
          render distance
        </span>
        <span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'max' : `${Math.round(renderDist * 100)}%`}
        </span>
      </div>

      <div style={{
        ...navicueInteraction.tapZone,
        width: SCENE_W, height: SCENE_H,
        cursor: done ? 'default' : 'ew-resize',
        touchAction: 'none',
      }}>
        <svg
          ref={svgRef}
          width={SCENE_W} height={SCENE_H}
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            {/* Fog gradient */}
            <linearGradient id="fog-grad-1246" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={verse.palette.bg} stopOpacity={0} />
              <stop offset={`${Math.max(5, (1 - renderDist) * 80)}%`}
                stopColor={verse.palette.bg} stopOpacity={0} />
              <stop offset={`${Math.max(10, (1 - renderDist) * 100)}%`}
                stopColor={verse.palette.primary} stopOpacity={done ? 0 : 0.5} />
              <stop offset="100%"
                stopColor={verse.palette.primary} stopOpacity={done ? 0 : 0.8} />
            </linearGradient>
          </defs>

          {/* Ground line */}
          <line x1={10} y1={120} x2={SCENE_W - 10} y2={120}
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            opacity={safeOpacity(0.2)} />

          {/* Perspective lines converging to horizon */}
          <motion.path
            d={`M 10,140 L ${SCENE_W - 20},85`}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={0.5}
            animate={{ opacity: safeOpacity(renderDist * 0.2) }}
          />
          <motion.path
            d={`M 10,100 L ${SCENE_W - 20},85`}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={0.5}
            animate={{ opacity: safeOpacity(renderDist * 0.2) }}
          />

          {/* Landmark trees/shapes at increasing distances */}
          {[
            { x: 40, h: 35, threshold: 0 },
            { x: 80, h: 28, threshold: 0.1 },
            { x: 120, h: 22, threshold: 0.25 },
            { x: 160, h: 18, threshold: 0.4 },
            { x: 200, h: 14, threshold: 0.6 },
            { x: 240, h: 10, threshold: 0.8 },
          ].map((landmark, i) => (
            <motion.g key={i}
              animate={{
                opacity: safeOpacity(
                  renderDist >= landmark.threshold
                    ? 0.15 + (1 - i / 6) * 0.15
                    : 0
                ),
              }}
              transition={{ duration: 0.3 }}
            >
              <line
                x1={landmark.x} y1={120}
                x2={landmark.x} y2={120 - landmark.h}
                stroke={verse.palette.accent} strokeWidth={1}
              />
              <circle
                cx={landmark.x} cy={120 - landmark.h - 4}
                r={landmark.h / 4}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.1)}
              />
            </motion.g>
          ))}

          {/* Horizon sun/circle (appears at high render distance) */}
          {renderDist > 0.7 && (
            <motion.circle
              cx={SCENE_W - 25} cy={82}
              r={12}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{
                opacity: safeOpacity((renderDist - 0.7) * 0.5),
              }}
            />
          )}

          {/* Time labels along the ground */}
          {timeLabels.map((label, i) => {
            const x = 30 + (i / (timeLabels.length - 1)) * (SCENE_W - 60);
            const threshold = i / (timeLabels.length - 1);
            return (
              <motion.text
                key={label}
                x={x} y={138}
                textAnchor="middle"
                fill={verse.palette.textFaint}
                style={navicueType.micro}
                animate={{
                  opacity: renderDist >= threshold ? 0.4 : 0.08,
                }}
              >
                {label}
              </motion.text>
            );
          })}

          {/* Fog overlay */}
          <rect x={0} y={0} width={SCENE_W} height={SCENE_H}
            fill="url(#fog-grad-1246)" />

          {/* Observer dot */}
          <circle cx={20} cy={120} r={4}
            fill={verse.palette.primary}
            opacity={safeOpacity(0.3)} />
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'you can see the horizon now'
          : dragging
            ? renderDist > 0.6
              ? 'the horizon is emerging...'
              : 'pushing the fog back...'
            : 'drag right to increase render distance'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          temporal extension
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'perspective' : 'how far can you see?'}
      </div>
    </div>
  );
}
