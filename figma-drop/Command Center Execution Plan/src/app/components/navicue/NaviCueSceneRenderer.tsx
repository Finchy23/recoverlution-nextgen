/**
 * NAVICUE SCENE RENDERER
 * ======================
 * 
 * SVG-based scene backgrounds for all 12 compositor scene types.
 * Each scene responds to breathAmplitude (0-1) and interactionProgress (0-1),
 * creating living backgrounds that react to the user.
 * 
 * ARCHITECTURE:
 * - One component, one SVG viewport, 12 scene renderers
 * - All scenes use the palette colors for visual coherence
 * - Scenes are NOT interactive (pointerEvents: none)
 * - Scenes layer BEHIND content but ABOVE the atmosphere gradient
 * - Performance: simple SVG primitives, no filters, limited element count
 * 
 * MOBILE-FIRST: All animation is autonomous. No cursor dependency.
 * breathAmplitude drives the living quality; interactionProgress
 * provides optional user-driven response.
 */

import { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import type { NaviCuePalette } from '@/app/design-system/navicue-blueprint';
import {
  type SceneBackground,
  type SceneConfig,
  SCENE_CONFIGS,
  createPRNG,
} from '@/app/design-system/navicue-compositor';

interface NaviCueSceneRendererProps {
  /** Which scene to render */
  scene: SceneBackground;
  /** The specimen's palette for color derivation */
  palette: NaviCuePalette;
  /** 0-1 amplitude from the breath engine */
  breathAmplitude?: number;
  /** 0-1 progress from user interaction */
  interactionProgress?: number;
  /** Seed for deterministic element placement */
  seed?: number;
}

export function NaviCueSceneRenderer({
  scene,
  palette,
  breathAmplitude = 0,
  interactionProgress = 0,
  seed = 42,
}: NaviCueSceneRendererProps) {
  const config = SCENE_CONFIGS[scene];
  const rand = useMemo(() => createPRNG(seed), [seed]);
  const elements = useRef(
    generateSceneElements(config, rand)
  ).current;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        {scene === 'deep_field' && (
          <DeepFieldScene elements={elements} palette={palette} breathAmplitude={breathAmplitude} interactionProgress={interactionProgress} />
        )}
        {scene === 'aurora' && (
          <AuroraScene elements={elements} palette={palette} breathAmplitude={breathAmplitude} />
        )}
        {scene === 'grid_pulse' && (
          <GridPulseScene elements={elements} palette={palette} breathAmplitude={breathAmplitude} interactionProgress={interactionProgress} />
        )}
        {scene === 'ember_rise' && (
          <EmberRiseScene elements={elements} palette={palette} interactionProgress={interactionProgress} />
        )}
        {scene === 'refraction' && (
          <RefractionScene elements={elements} palette={palette} interactionProgress={interactionProgress} />
        )}
        {scene === 'liquid_dark' && (
          <LiquidDarkScene elements={elements} palette={palette} breathAmplitude={breathAmplitude} />
        )}
        {scene === 'cathedral' && (
          <CathedralScene elements={elements} palette={palette} breathAmplitude={breathAmplitude} />
        )}
        {scene === 'interference' && (
          <InterferenceScene elements={elements} palette={palette} breathAmplitude={breathAmplitude} interactionProgress={interactionProgress} />
        )}
        {scene === 'horizon_line' && (
          <HorizonLineScene palette={palette} breathAmplitude={breathAmplitude} />
        )}
        {scene === 'frost_glass' && (
          <FrostGlassScene elements={elements} palette={palette} interactionProgress={interactionProgress} />
        )}
        {scene === 'constellation' && (
          <ConstellationScene elements={elements} palette={palette} interactionProgress={interactionProgress} />
        )}
        {scene === 'smoke_drift' && (
          <SmokeDriftScene elements={elements} palette={palette} breathAmplitude={breathAmplitude} />
        )}
      </svg>
    </div>
  );
}

// =====================================================================
// ELEMENT GENERATION
// =====================================================================

interface SceneElement {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  delay: number;
  duration: number;
  opacity: number;
  variant: number; // 0-1 for sub-type variation
}

function generateSceneElements(
  config: SceneConfig,
  rand: () => number,
): SceneElement[] {
  return Array.from({ length: config.elementCount }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    size: 0.5 + rand() * 3,
    angle: rand() * 360,
    delay: rand() * config.baseDuration,
    duration: config.baseDuration * (0.6 + rand() * 0.8),
    opacity: 0.03 + rand() * 0.12,
    variant: rand(),
  }));
}

// =====================================================================
// SCENE RENDERERS
// =====================================================================

interface SceneProps {
  elements: SceneElement[];
  palette: NaviCuePalette;
  breathAmplitude?: number;
  interactionProgress?: number;
}

/** Deep Field: multiple depth layers of star-like points */
function DeepFieldScene({ elements, palette, breathAmplitude = 0, interactionProgress = 0 }: SceneProps) {
  return (
    <g>
      {elements.map((el) => {
        const depth = el.variant; // 0 = far, 1 = near
        const size = 0.15 + depth * 0.5;
        const baseOpacity = 0.04 + depth * 0.08;
        const twinkle = el.variant > 0.7;

        return (
          <motion.circle
            key={el.id}
            cx={el.x}
            cy={el.y}
            r={size + interactionProgress * depth * 0.3}
            fill={depth > 0.5 ? palette.primary : palette.secondary}
            initial={{ opacity: 0 }}
            animate={{
              opacity: twinkle
                ? [baseOpacity * 0.5, baseOpacity, baseOpacity * 0.3, baseOpacity]
                : baseOpacity + breathAmplitude * 0.02,
            }}
            transition={{
              duration: twinkle ? el.duration : el.duration * 2,
              repeat: Infinity,
              delay: el.delay,
              ease: 'linear',
            }}
          />
        );
      })}
    </g>
  );
}

/** Aurora: horizontal curtains of light that ripple */
function AuroraScene({ elements, palette, breathAmplitude = 0 }: SceneProps) {
  const curtains = elements.slice(0, 5);
  return (
    <g>
      {curtains.map((el, i) => {
        const y = 15 + i * 12;
        const amplitude = 3 + breathAmplitude * 4;
        const baseOpacity = 0.03 + i * 0.01;

        return (
          <motion.path
            key={el.id}
            d={`M 0 ${y} Q 25 ${y - amplitude} 50 ${y} Q 75 ${y + amplitude} 100 ${y}`}
            fill="none"
            stroke={i % 2 === 0 ? palette.primary : palette.accent}
            strokeWidth={2 + breathAmplitude * 1.5}
            opacity={baseOpacity}
            animate={{
              d: [
                `M 0 ${y} Q 25 ${y - amplitude} 50 ${y} Q 75 ${y + amplitude} 100 ${y}`,
                `M 0 ${y} Q 25 ${y + amplitude * 0.5} 50 ${y - amplitude * 0.3} Q 75 ${y - amplitude * 0.5} 100 ${y}`,
                `M 0 ${y} Q 25 ${y - amplitude} 50 ${y} Q 75 ${y + amplitude} 100 ${y}`,
              ],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </g>
  );
}

/** Grid Pulse: minimal grid lines that pulse with breath */
function GridPulseScene({ elements, palette, breathAmplitude = 0, interactionProgress = 0 }: SceneProps) {
  const gridSpacing = 100 / 6;
  const lines: { x1: number; y1: number; x2: number; y2: number; isH: boolean }[] = [];
  for (let i = 1; i <= 5; i++) {
    lines.push({ x1: gridSpacing * i, y1: 0, x2: gridSpacing * i, y2: 100, isH: false });
    lines.push({ x1: 0, y1: gridSpacing * i, x2: 100, y2: gridSpacing * i, isH: true });
  }

  return (
    <g>
      {lines.map((line, i) => (
        <motion.line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={palette.primary}
          strokeWidth={0.15 + breathAmplitude * 0.1}
          initial={{ opacity: 0.02 }}
          animate={{
            opacity: [0.02, 0.05 + interactionProgress * 0.03, 0.02],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Pulse origin at center */}
      <motion.circle
        cx={50}
        cy={50}
        fill="none"
        stroke={palette.accent}
        strokeWidth={0.2}
        initial={{ r: 2, opacity: 0.06 }}
        animate={{
          r: [2, 2 + breathAmplitude * 8, 2],
          opacity: [0.06, 0.02, 0.06],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </g>
  );
}

/** Ember Rise: sparks climbing upward from a low source */
function EmberRiseScene({ elements, palette, interactionProgress = 0 }: SceneProps) {
  return (
    <g>
      {elements.map((el) => {
        const startY = 85 + el.variant * 15;
        const endY = 10 + el.variant * 20;
        const drift = (el.angle / 360 - 0.5) * 20;

        return (
          <motion.circle
            key={el.id}
            r={0.3 + el.size * 0.3 + interactionProgress * 0.2}
            fill={el.variant > 0.6 ? palette.accent : palette.primary}
            initial={{ cx: el.x, cy: startY, opacity: 0 }}
            animate={{
              cy: [startY, endY],
              cx: [el.x, el.x + drift],
              opacity: [0, el.opacity * 1.5, el.opacity, 0],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </g>
  );
}

/** Refraction: geometric prisms bending light */
function RefractionScene({ elements, palette, interactionProgress = 0 }: SceneProps) {
  const prisms = elements.slice(0, 8);
  return (
    <g>
      {prisms.map((el) => {
        const cx = el.x;
        const cy = el.y;
        const size = 3 + el.size * 4;
        const rotation = el.angle + interactionProgress * 30;

        return (
          <motion.polygon
            key={el.id}
            points={`${cx},${cy - size} ${cx + size * 0.87},${cy + size * 0.5} ${cx - size * 0.87},${cy + size * 0.5}`}
            fill="none"
            stroke={el.variant > 0.5 ? palette.primary : palette.accent}
            strokeWidth={0.2}
            opacity={el.opacity * 0.6}
            animate={{
              rotate: [rotation, rotation + 15, rotation],
              opacity: [el.opacity * 0.4, el.opacity * 0.7, el.opacity * 0.4],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}
    </g>
  );
}

/** Liquid Dark: slow-moving dark fluid blobs */
function LiquidDarkScene({ elements, palette, breathAmplitude = 0 }: SceneProps) {
  const blobs = elements.slice(0, 4);
  return (
    <g>
      {blobs.map((el) => {
        const r = 12 + el.size * 8 + breathAmplitude * 5;

        return (
          <motion.ellipse
            key={el.id}
            fill={palette.primaryGlow}
            initial={{ rx: r, ry: r * 0.8, cx: el.x, cy: el.y }}
            animate={{
              rx: [r, r * 1.2, r],
              ry: [r * 0.8, r, r * 0.8],
              cx: [el.x, el.x + 3, el.x],
              cy: [el.y, el.y + 2, el.y],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </g>
  );
}

/** Cathedral: tall vertical light shafts */
function CathedralScene({ elements, palette, breathAmplitude = 0 }: SceneProps) {
  const shafts = elements.slice(0, 6);
  return (
    <g>
      {shafts.map((el, i) => {
        const x = 10 + i * 16;
        const width = 1 + breathAmplitude * 1.5;

        return (
          <motion.rect
            key={el.id}
            x={x - width / 2}
            y={0}
            height={100}
            fill={palette.primary}
            initial={{ opacity: 0.02, width: width }}
            animate={{
              opacity: [0.02, 0.05 + breathAmplitude * 0.03, 0.02],
              width: [width, width * 1.3, width],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay * 0.5,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </g>
  );
}

/** Interference: wave interference patterns */
function InterferenceScene({ elements, palette, breathAmplitude = 0, interactionProgress = 0 }: SceneProps) {
  const rings = elements.slice(0, 12);
  return (
    <g>
      {rings.map((el) => {
        const r = 5 + el.size * 10 + interactionProgress * 5;

        return (
          <motion.circle
            key={el.id}
            cx={el.x}
            cy={el.y}
            fill="none"
            stroke={el.variant > 0.5 ? palette.primary : palette.accent}
            strokeWidth={0.15}
            initial={{ r: r * 0.5, opacity: el.opacity }}
            animate={{
              r: [r * 0.5, r, r * 1.5],
              opacity: [el.opacity, el.opacity * 0.5 + breathAmplitude * 0.02, 0],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: 'linear',
            }}
          />
        );
      })}
    </g>
  );
}

/** Horizon Line: single horizon with gradient */
function HorizonLineScene({ palette, breathAmplitude = 0 }: Omit<SceneProps, 'elements'>) {
  const y = 55 + breathAmplitude * 3;
  return (
    <g>
      <motion.line
        x1={0}
        x2={100}
        stroke={palette.primary}
        strokeWidth={0.3}
        initial={{ y1: y, y2: y, opacity: 0.06 }}
        animate={{
          y1: [y, y - 1, y],
          y2: [y, y - 1, y],
          opacity: [0.06, 0.1, 0.06],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Glow above horizon */}
      <motion.rect
        x={0}
        width={100}
        fill={palette.primaryGlow}
        initial={{ y: y - 10, height: 10, opacity: 0.02 }}
        animate={{
          y: [y - 10, y - 12, y - 10],
          height: [10, 12, 10],
          opacity: [0.02, 0.04 + breathAmplitude * 0.02, 0.02],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </g>
  );
}

/** Frost Glass: crystalline patterns growing */
function FrostGlassScene({ elements, palette, interactionProgress = 0 }: SceneProps) {
  return (
    <g>
      {elements.map((el) => {
        const branches = Math.floor(3 + el.variant * 4);
        const baseLength = 2 + el.size * 3 + interactionProgress * 2;

        return (
          <g key={el.id}>
            {Array.from({ length: branches }, (_, b) => {
              const angle = (360 / branches) * b + el.angle;
              const rad = (angle * Math.PI) / 180;
              const endX = el.x + Math.cos(rad) * baseLength;
              const endY = el.y + Math.sin(rad) * baseLength;

              return (
                <motion.line
                  key={`${el.id}-${b}`}
                  x1={el.x}
                  y1={el.y}
                  x2={endX}
                  y2={endY}
                  stroke={palette.primary}
                  strokeWidth={0.15}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{
                    opacity: [0, el.opacity * 0.5, el.opacity * 0.3],
                  }}
                  transition={{
                    duration: el.duration * 0.6,
                    delay: el.delay + b * 0.3,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Constellation: connected star patterns */
function ConstellationScene({ elements, palette, interactionProgress = 0 }: SceneProps) {
  // Connect nearby elements with lines
  const connections: { from: SceneElement; to: SceneElement }[] = [];
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const dx = elements[i].x - elements[j].x;
      const dy = elements[i].y - elements[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 25 && connections.length < 24) {
        connections.push({ from: elements[i], to: elements[j] });
      }
    }
  }

  return (
    <g>
      {/* Connection lines */}
      {connections.map((conn, i) => (
        <motion.line
          key={`line-${i}`}
          x1={conn.from.x}
          y1={conn.from.y}
          x2={conn.to.x}
          y2={conn.to.y}
          stroke={palette.primary}
          strokeWidth={0.1}
          initial={{ opacity: 0.02 }}
          animate={{
            opacity: [0.02, 0.04 + interactionProgress * 0.02, 0.02],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Star points */}
      {elements.map((el) => (
        <motion.circle
          key={el.id}
          cx={el.x}
          cy={el.y}
          r={0.3 + interactionProgress * 0.15}
          fill={el.variant > 0.6 ? palette.accent : palette.primary}
          initial={{ opacity: el.opacity * 0.6 }}
          animate={{
            opacity: [el.opacity * 0.6, el.opacity, el.opacity * 0.6],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </g>
  );
}

/** Smoke Drift: organic smoke tendrils */
function SmokeDriftScene({ elements, palette, breathAmplitude = 0 }: SceneProps) {
  const wisps = elements.slice(0, 6);
  return (
    <g>
      {wisps.map((el) => {
        const startY = 70 + el.variant * 20;
        const endY = 10 + el.variant * 15;
        const drift = (el.angle / 360 - 0.5) * 30;

        return (
          <motion.ellipse
            key={el.id}
            fill={palette.primaryGlow}
            initial={{ cx: el.x, cy: startY, rx: 2, ry: 1, opacity: 0 }}
            animate={{
              cx: [el.x, el.x + drift * 0.5, el.x + drift],
              cy: [startY, (startY + endY) / 2, endY],
              rx: [2, 4 + breathAmplitude * 2, 6],
              ry: [1, 2 + breathAmplitude, 3],
              opacity: [0, el.opacity, 0],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </g>
  );
}