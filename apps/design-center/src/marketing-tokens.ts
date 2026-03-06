/**
 * MARKETING ASSET TOKEN SYSTEM
 */

import { projectId } from '@/utils/supabaseInfo';
import type { AssetFamily, AssetVariant, AssetMode } from '@/utils/assets';

const SUPABASE_STORAGE_URL = `https://${projectId}.supabase.co/storage/v1/object/public`;

export function buildAssetUrl(
  family: AssetFamily,
  variant: AssetVariant,
  mode: AssetMode,
  aspectRatio: '5:4' | '4:5' | '3:4' | '1:1' | '16:9' = '5:4',
  format: 'avif' | 'webp' | 'jpg' = 'avif'
): string {
  return `${SUPABASE_STORAGE_URL}/recoverlution-assets/${family}/${aspectRatio}/${format}/${family}_abstract_${variant}_${mode}.${format}`;
}

export const assetOpacity = {
  hero: 1.0,
  section: 0.95,
  subtle: 0.85,
  minimal: 0.7,
} as const;

export const frostedGlass = {
  ultraLight: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 50%, rgba(255, 255, 255, 0.01) 100%)',
    backdropFilter: 'blur(0.5px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  card: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(64, 224, 208, 0.15)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
    hoverShadow: '0 12px 48px rgba(64, 224, 208, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
    hoverBorder: '1px solid rgba(64, 224, 208, 0.3)',
  },
  accent: (accentColor: string, opacity: number = 0.15) => ({
    background: `${accentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    backdropFilter: 'blur(24px)',
    border: `1px solid ${accentColor}40`,
    shadow: `0 8px 32px ${accentColor}20`,
  }),
  subtle: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
  },
} as const;

export const glassText = {
  etched: {
    color: 'rgb(236, 239, 229)',
    textShadow: '0 1px 0 rgba(236, 239, 229, 0.4), 0 -1px 0 rgba(0, 0, 0, 0.3), 0 2px 10px rgba(0, 0, 0, 0.2)',
    letterSpacing: '-0.5px',
  },
  subtle: {
    color: 'rgba(236, 239, 229, 0.75)',
    textShadow: '0 1px 0 rgba(236, 239, 229, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15)',
  },
  eyebrow: {
    color: 'rgb(64, 224, 208)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 0 8px rgba(64, 224, 208, 0.2)',
    letterSpacing: '0.25em',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    fontSize: '0.75rem',
  },
} as const;

export const glassDivider = {
  height: '1px',
  background: 'linear-gradient(90deg, transparent 0%, rgba(64, 224, 208, 0.25) 20%, rgba(64, 224, 208, 0.25) 80%, transparent 100%)',
} as const;

export const reelOverlay = {
  background: 'linear-gradient(180deg, rgba(17, 23, 30, 0.5) 0%, rgba(17, 23, 30, 0.6) 50%, rgba(17, 23, 30, 0.65) 100%)',
} as const;

export const animations = {
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.6s',
    verySlow: '1s',
  },
  transition: {
    default: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    fast: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export const sectionAssets = {
  hero: { family: 'neuralflower' as const, variant: 'plasticity' as const, mode: 'light' as const, opacity: assetOpacity.hero, gradient: 'heroCompound' },
  journeysExpanded: { family: 'neuralflower' as const, variant: 'transformation' as const, mode: 'light' as const, opacity: assetOpacity.section, gradient: 'vignette' },
  theGap: {
    cards: [
      { id: 'good-intentions', family: 'evolvingforms' as const, variant: 'synconicity' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'intent-vs-stress', family: 'evolvingforms' as const, variant: 'realign' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'old-paths', family: 'evolvingforms' as const, variant: 'regrowth' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'cognitive-change', family: 'evolvingforms' as const, variant: 'convergence' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'always-running', family: 'neuralflow' as const, variant: 'transfer' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'your-window', family: 'evolvingforms' as const, variant: 'repatterning' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'tiny-rewires', family: 'mindblock' as const, variant: 'modular' as const, mode: 'light' as const, opacity: assetOpacity.section },
    ],
  },
  neuroadaptive: { family: 'neuralflower' as const, variant: 'cognitive+spark' as const, mode: 'dark' as const, opacity: assetOpacity.section, gradient: 'vignette' },
  nervousSystem: { family: 'neuralflow' as const, variant: 'flowing' as const, mode: 'dark' as const, opacity: assetOpacity.section, gradient: 'fadeDown' },
  operatingTruth: {
    features: [
      { id: 'glasscube', family: 'evolvingforms' as const, variant: 'glasscube+glowing+centre' as const, mode: 'dark' as const, opacity: assetOpacity.section },
      { id: 'skypattern', family: 'evolvingforms' as const, variant: 'skypattern' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'flourish', family: 'neuralflow' as const, variant: 'flourish' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'integration', family: 'mindblock' as const, variant: 'integration' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'blossom', family: 'neuralflower' as const, variant: 'blossom' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'transition', family: 'evolvingforms' as const, variant: 'transition' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'microspheres', family: 'mindblock' as const, variant: 'microspheres+defusion' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'balance', family: 'evolvingforms' as const, variant: 'balance' as const, mode: 'dark' as const, opacity: assetOpacity.section },
      { id: 'skyline', family: 'mindblock' as const, variant: 'skyline' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'blossoming', family: 'flowstate' as const, variant: 'blossoming' as const, mode: 'light' as const, opacity: assetOpacity.section },
    ],
    finalCard: { url: buildAssetUrl('flowstate', 'accelerate', 'light'), opacity: assetOpacity.section },
  },
  threeAltitudes: { family: 'mindblock' as const, variant: 'tower' as const, mode: 'dark' as const, opacity: assetOpacity.section, gradient: 'vignette' },
  alwaysRunning: { family: 'flowstate' as const, variant: 'bloom' as const, mode: 'light' as const, opacity: assetOpacity.section, gradient: 'fadeDown' },
  sentientBaseline: {
    principles: [
      { id: 'decide', family: 'flowstate' as const, variant: 'decide' as const, mode: 'light' as const, opacity: assetOpacity.section },
      { id: 'chain-flow', family: 'flowstate' as const, variant: 'chain+flow' as const, mode: 'dark' as const, opacity: assetOpacity.section },
      { id: 'commit', family: 'flowstate' as const, variant: 'commit' as const, mode: 'light' as const, opacity: assetOpacity.section },
    ],
  },
} as const;

export function getSectionAsset(section: keyof typeof sectionAssets, isMobile: boolean = false): string {
  const config = sectionAssets[section];
  if ('family' in config) {
    const aspectRatio = isMobile ? '3:4' : '5:4';
    return buildAssetUrl(config.family, config.variant, config.mode, aspectRatio);
  }
  throw new Error(`Section ${section} does not have a simple asset configuration`);
}

export function getGapCardAsset(index: number, isMobile: boolean = false): string {
  const card = sectionAssets.theGap.cards[index];
  if (!card) throw new Error(`Invalid Gap card index: ${index}`);
  return buildAssetUrl(card.family, card.variant, card.mode, isMobile ? '3:4' : '5:4');
}

export function getOperatingTruthFeatureAsset(index: number, isMobile: boolean = false): string {
  const feature = sectionAssets.operatingTruth.features[index];
  if (!feature) throw new Error(`Invalid Operating Truth feature index: ${index}`);
  return buildAssetUrl(feature.family, feature.variant, feature.mode, isMobile ? '3:4' : '5:4');
}

export function getSentientPrincipleAsset(index: number, isMobile: boolean = false): string {
  const principle = sectionAssets.sentientBaseline.principles[index];
  if (!principle) throw new Error(`Invalid Sentient Baseline principle index: ${index}`);
  return buildAssetUrl(principle.family, principle.variant, principle.mode, isMobile ? '3:4' : '5:4');
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}
