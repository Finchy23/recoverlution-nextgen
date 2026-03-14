/**
 * ConstellationGlyph — a tiny dot-pattern SVG representing a constellation's shape
 *
 * Renders the star positions and connection lines of a given constellation
 * scaled down to a miniature glyph (~24x24), used as a visual accent beside
 * the rest summary echo count.
 *
 * Phase AC: Slow rotation with staggered star shimmer — the glyph breathes
 * and turns gently so it feels alive rather than static.
 *
 * Phase AC+: When breathCycleDuration is provided, all star dots pulse in
 * unison on the same cycle as the parent breathing animation, creating a
 * unified heartbeat between text and icon.
 */

import { CONSTELLATIONS, ALL_STARS } from './talk-universe';

interface ConstellationGlyphProps {
  /** Constellation ID (e.g. 'lyra', 'orion') */
  constellationId: string;
  /** Glyph size in px */
  size?: number;
  /** Color for dots and lines */
  color: string;
  /** Opacity 0..1 */
  opacity?: number;
  /** When set, all stars pulse in sync on this cycle duration (seconds).
   *  Omit to use the default staggered per-star shimmer. */
  breathCycleDuration?: number;
}

// Unique animation ID counter to avoid keyframe name collisions
let glyphIdCounter = 0;

export function ConstellationGlyph({
  constellationId,
  size = 24,
  color,
  opacity = 0.5,
  breathCycleDuration,
}: ConstellationGlyphProps) {
  const con = CONSTELLATIONS.find(c => c.id === constellationId);
  if (!con) return null;

  // Gather star positions for this constellation
  const conStars = con.starIds
    .map(id => ALL_STARS.find(s => s.id === id))
    .filter(Boolean) as typeof ALL_STARS;

  if (conStars.length === 0) return null;

  // Stable unique ID for this glyph's keyframes
  const glyphId = `glyph-${constellationId}-${++glyphIdCounter}`;

  // Project to 2D by using x/y of the 3D positions (ignoring z for the glyph)
  const points = conStars.map(s => ({
    id: s.id,
    x: s.pos.x,
    y: -s.pos.y, // flip y so up is up in SVG
  }));

  // Compute bounding box
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Normalize to fit within size with padding
  const pad = 4;
  const innerSize = size - pad * 2;
  const scale = innerSize / Math.max(rangeX, rangeY);

  const normalized = points.map(p => ({
    id: p.id,
    nx: (p.x - minX) * scale + pad + (innerSize - rangeX * scale) / 2,
    ny: (p.y - minY) * scale + pad + (innerSize - rangeY * scale) / 2,
  }));

  const pointMap = new Map(normalized.map(p => [p.id, p]));
  const center = size / 2;

  const useBreathSync = typeof breathCycleDuration === 'number' && breathCycleDuration > 0;

  // Unified breath-sync keyframe: all stars pulse together
  const breathName = `${glyphId}-breath`;
  const breathCSS = useBreathSync
    ? `@keyframes ${breathName} {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }`
    : '';

  // Staggered shimmer keyframes for each star (used when not breath-synced)
  const shimmerKeyframes = !useBreathSync
    ? normalized.map((_, i) => {
        const name = `${glyphId}-shimmer-${i}`;
        const offset = (i / normalized.length) * 100;
        return {
          name,
          css: `@keyframes ${name} {
            0%, 100% { opacity: 0.5; }
            ${Math.round(offset)}% { opacity: 1; }
            ${Math.round((offset + 50) % 100)}% { opacity: 0.4; }
          }`,
        };
      })
    : [];

  const rotateAnim = `${glyphId}-rotate`;
  const rotateCSS = `@keyframes ${rotateAnim} {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;

  // Connection line pulse keyframe (syncs with breath when available)
  const linePulseName = `${glyphId}-line-pulse`;
  const linePulseCSS = useBreathSync
    ? `@keyframes ${linePulseName} {
        0%, 100% { stroke-opacity: 0.25; }
        50% { stroke-opacity: 0.55; }
      }`
    : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        opacity,
        flexShrink: 0,
        animation: `${rotateAnim} 40s linear infinite`,
        transformOrigin: `${center}px ${center}px`,
      }}
    >
      <defs>
        <style>
          {rotateCSS}
          {breathCSS}
          {linePulseCSS}
          {shimmerKeyframes.map(k => k.css).join('\n')}
        </style>
      </defs>
      {/* Connection lines */}
      {con.connections.map(([idA, idB], i) => {
        const a = pointMap.get(idA);
        const b = pointMap.get(idB);
        if (!a || !b) return null;
        return (
          <line
            key={`line-${i}`}
            x1={a.nx} y1={a.ny}
            x2={b.nx} y2={b.ny}
            stroke={color}
            strokeWidth={0.6}
            strokeOpacity={0.4}
            style={useBreathSync ? {
              animation: `${linePulseName} ${breathCycleDuration}s ease-in-out infinite`,
            } : undefined}
          />
        );
      })}
      {/* Star dots */}
      {normalized.map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={p.nx} cy={p.ny}
          r={1.3}
          fill={color}
          style={{
            animation: useBreathSync
              ? `${breathName} ${breathCycleDuration}s ease-in-out infinite`
              : `${shimmerKeyframes[i].name} ${3 + i * 0.4}s ease-in-out infinite`,
          }}
        />
      ))}
    </svg>
  );
}
