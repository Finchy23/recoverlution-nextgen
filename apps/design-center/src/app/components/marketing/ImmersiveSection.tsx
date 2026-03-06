import type { CSSProperties, ReactNode } from 'react';
import { spacing, surfaces, withAlpha } from '@/design-tokens';
import { assetOpacity, frostedGlass, reelOverlay } from '@/marketing-tokens';

type PanelVariant = 'ultraLight' | 'light' | 'dark' | 'card';

export const immersiveSectionPadding = {
  mobile: `${spacing['3xl']} 0`,
  desktop: `${spacing['4xl']} 0`,
} as const;

export const immersiveContentPadding = {
  mobile: `0 ${spacing.md}`,
  desktop: `0 ${spacing.xl}`,
} as const;

interface ImmersiveSectionProps {
  assetUrl?: string;
  assetAlt?: string;
  accentColor?: string;
  backgroundOpacity?: number;
  overlayBackground?: string;
  minHeight?: string;
  style?: CSSProperties;
  children: ReactNode;
}

interface ImmersivePanelOptions {
  accentColor?: string;
  borderAlpha?: number;
  glowAlpha?: number;
  radiusValue?: string;
  variant?: PanelVariant;
}

export function getImmersivePanelStyle({
  accentColor,
  borderAlpha = 0.2,
  glowAlpha = 0.12,
  radiusValue,
  variant = 'ultraLight',
}: ImmersivePanelOptions = {}): CSSProperties {
  const panel = frostedGlass[variant];

  return {
    background: panel.background,
    backdropFilter: panel.backdropFilter,
    WebkitBackdropFilter: panel.backdropFilter,
    border: accentColor ? `1px solid ${withAlpha(accentColor, borderAlpha)}` : panel.border,
    boxShadow: accentColor
      ? `${panel.shadow}, 0 0 48px ${withAlpha(accentColor, glowAlpha)}`
      : panel.shadow,
    borderRadius: radiusValue,
  };
}

export function ImmersiveSection({
  assetUrl,
  assetAlt = '',
  accentColor,
  backgroundOpacity = assetOpacity.section,
  overlayBackground = reelOverlay.background,
  minHeight = '100vh',
  style,
  children,
}: ImmersiveSectionProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        position: 'relative',
        backgroundColor: surfaces.solid.base,
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {assetUrl ? (
        <div className="absolute inset-0">
          <img
            src={assetUrl}
            alt={assetAlt}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ opacity: backgroundOpacity }}
          />
        </div>
      ) : null}

      <div className="absolute inset-0" style={{ background: overlayBackground }} />

      {accentColor ? (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 24%, ${withAlpha(accentColor, 0.16)} 0%, transparent 54%)`,
              opacity: 0.9,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${withAlpha(accentColor, 0.08)} 0%, transparent 35%, ${withAlpha(accentColor, 0.05)} 100%)`,
              mixBlendMode: 'screen',
            }}
          />
        </>
      ) : null}

      <div className="relative w-full z-10">{children}</div>
    </section>
  );
}
