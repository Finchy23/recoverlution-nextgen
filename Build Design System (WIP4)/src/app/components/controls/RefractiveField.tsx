/**
 * THE REFRACTIVE FIELD — §6.X
 *
 * "If a block of text needs elevation, do not draw a card.
 *  Use a soft, borderless pool of sub-surface light
 *  illuminating from behind it."
 *
 * A radial gradient of near-invisible luminosity.
 * The content floats above nothing visible — only perceived depth.
 *
 * The Death of the Box, applied to containers:
 *   - No background-color
 *   - No border
 *   - No box-shadow with hard edges
 *   - No card, no panel, no bordered wrapper
 *
 * Instead: a frostedGlass.breath — a soft, pulsing pool of
 * sub-surface light that responds to the somatic breath cycle
 * and temperature governance.
 *
 * Props:
 *   color      — the hue of the refractive pool
 *   intensity  — how visible the pool is (0-1)
 *   breath     — current breath cycle value (0-1) for pulsing
 *   children   — the content that floats above the field
 */

import { type ReactNode } from 'react';
import { useTemperature } from '../design-system/TemperatureGovernor';
import { colors, glass, tracking, weight, timing, glaze, layer } from '../design-system/surface-tokens';

interface RefractiveFieldProps {
  /** The hue of the sub-surface luminosity */
  color?: string;
  /** Base intensity of the field (0-1, default 0.08) */
  intensity?: number;
  /** Breath cycle value (0-1) for subtle pulsing */
  breath?: number;
  /** Field shape */
  shape?: 'ellipse' | 'circle' | 'wide';
  /** Padding around the content */
  padding?: string;
  /** Additional class names */
  className?: string;
  /** Content that floats above the field */
  children: ReactNode;
}

export function RefractiveField({
  color = glass(colors.brand.purple.mid, 1),
  intensity = 0.08,
  breath = 0,
  shape = 'ellipse',
  padding = '24px 28px',
  className = '',
  children,
}: RefractiveFieldProps) {
  const { constraints } = useTemperature();

  // Temperature governance: reduce field intensity at higher bands
  const governedIntensity = intensity * Math.max(0.2, 1 - constraints.band * 0.2);

  // Breath modulation — subtle pulsing (±15% of intensity)
  const breathMod = 1 + Math.sin(breath * Math.PI * 2) * 0.15;
  const finalIntensity = governedIntensity * breathMod;

  // Shape presets
  const gradientShape = {
    ellipse: 'ellipse 70% 55% at 50% 50%',
    circle: 'circle at 50% 50%',
    wide: 'ellipse 85% 40% at 50% 50%',
  }[shape];

  // Convert color to hex opacity values
  const primaryOpacity = Math.round(finalIntensity * 255).toString(16).padStart(2, '0');
  const secondaryOpacity = Math.round(finalIntensity * 0.4 * 255).toString(16).padStart(2, '0');

  // At Band 4, the field is nearly invisible — minimal distraction
  if (constraints.band >= 4 && intensity < 0.15) {
    return <div className={className} style={{ padding }}>{children}</div>;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ padding }}
    >
      {/* The refractive pool — sub-surface luminosity */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(${gradientShape}, ${color}${primaryOpacity} 0%, ${color}${secondaryOpacity} 40%, transparent 75%)`,
          transition: `opacity ${800 + constraints.band * 200}ms ${timing.t.respond}`,
        }}
      />

      {/* Optional secondary glow layer — adds volumetric depth */}
      {finalIntensity > 0.05 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(${gradientShape}, transparent 30%, ${color}${Math.round(finalIntensity * 0.15 * 255).toString(16).padStart(2, '0')} 70%, transparent 100%)`,
          }}
        />
      )}

      {/* Content floats above the field */}
      <div className="relative" style={{ zIndex: layer.base }}>
        {children}
      </div>
    </div>
  );
}

/**
 * SEMANTIC PARTICLE — §6.X
 *
 * "Instead of a colored 'tag' or 'pill' for metadata,
 *  use a single, glowing microscopic pixel of light next to
 *  tracked-out typography."
 *
 * A 2-4px luminous dot with a soft glow halo.
 * The typography beside it carries the semantic weight.
 * No container needed.
 */
export function SemanticParticle({
  color = colors.brand.purple.mid,
  label,
  size = 3,
  active = false,
  className = '',
}: {
  color?: string;
  label?: string;
  size?: number;
  active?: boolean;
  className?: string;
}) {
  const dotSize = active ? size + 1 : size;
  const glowIntensity = active ? 0.6 : 0.3;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: dotSize,
          height: dotSize,
          background: color,
          opacity: glowIntensity,
          boxShadow: active
            ? `0 0 ${6 + size}px ${color}50, 0 0 ${12 + size * 2}px ${color}20`
            : `0 0 ${4}px ${color}25`,
          transition: `all ${timing.dur.fast}`,
        }}
      />
      {label && (
        <span
          style={{
            fontSize: `${7 + size}px`,
            fontWeight: weight.medium,
            letterSpacing: tracking.tight,
            textTransform: 'uppercase',
            color: active ? color : glaze.silver,
            opacity: active ? 0.7 : 0.4,
            transition: `all ${timing.dur.fast}`,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}