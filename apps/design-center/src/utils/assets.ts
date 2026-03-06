/**
 * CENTRALIZED ASSET MANAGEMENT
 */

const SUPABASE_URL = 'https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ImageFormat = 'avif' | 'webp' | 'jpg';
export type ImageSize = '1:1' | '3:4' | '4:5' | '5:4' | '16:9';

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getOptimalImageFormat(): ImageFormat {
  if (typeof window === 'undefined') return 'avif';
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpg';
}

export type AssetFamily = 'neuralflower' | 'flowstate' | 'evolvingforms' | 'neuralflow' | 'mindblock';
export type AssetMode = 'light' | 'dark';

export type NeuralFlowerVariant = 'plasticity' | 'transformation' | 'insight' | 'flow' | 'regulation' | 'interoception' | 'wisdom' | 'repair' | 'blossom' | 'cognitive+spark' | 'growth';
export type FlowStateVariant = 'bloom' | 'calm+shift' | 'upward+shift' | 'alignment+shift' | 'assemble' | 'blossoming' | 'commit' | 'neurocoding';
export type EvolvingFormsVariant = 'balance' | 'regrowth' | 'flux' | 'shift_' | 'transition' | 'glasscube+glowing+centre' | 'skypattern';
export type NeuralFlowVariant = 'flowing' | 'transition' | 'motion' | 'orientation' | 'flourish';
export type MindBlockVariant = 'tower' | 'integration' | 'microspheres+defusion' | 'skyline' | 'rise' | 'dynamic';

export type AssetVariant = NeuralFlowerVariant | FlowStateVariant | EvolvingFormsVariant | NeuralFlowVariant | MindBlockVariant;

export function getAsset(family: AssetFamily, variant: AssetVariant, mode: AssetMode, aspectRatio?: ImageSize): string {
  const ratio = aspectRatio || '5:4';
  return `${SUPABASE_URL}/recoverlution-assets/${family}/${ratio}/avif/${family}_abstract_${variant}_${mode}.avif`;
}

export function getLogo(mode: 'light' | 'dark'): string {
  return `${SUPABASE_URL}/marketing-assets/Logo/wide/svg/recoverlution_logo_wide_${mode}.svg`;
}

export function getFallbackGradient(family: AssetFamily): string {
  const gradients: Record<AssetFamily, string> = {
    neuralflower: 'linear-gradient(135deg, rgba(124, 103, 255, 0.3), rgba(64, 224, 208, 0.3))',
    flowstate: 'linear-gradient(135deg, rgba(64, 224, 208, 0.3), rgba(87, 57, 251, 0.3))',
    evolvingforms: 'linear-gradient(135deg, rgba(87, 57, 251, 0.3), rgba(255, 193, 7, 0.3))',
    neuralflow: 'linear-gradient(135deg, rgba(64, 224, 208, 0.3), rgba(124, 103, 255, 0.3))',
    mindblock: 'linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(87, 57, 251, 0.3))',
  };
  return gradients[family];
}

export function preloadAsset(url: string): () => void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (url.endsWith('.avif')) link.type = 'image/avif';
  else if (url.endsWith('.webp')) link.type = 'image/webp';
  else if (url.endsWith('.svg')) link.type = 'image/svg+xml';
  document.head.appendChild(link);
  return () => { if (document.head.contains(link)) document.head.removeChild(link); };
}

export function preloadAssets(urls: string[]): () => void {
  const cleanups = urls.map(url => preloadAsset(url));
  return () => { cleanups.forEach(cleanup => cleanup()); };
}

export function preloadHeroAssets(): () => void {
  return preloadAssets([getAsset('neuralflower', 'plasticity', 'dark'), getLogo('light')]);
}

export const assetCollections = {
  hero: {
    neuralflower: getAsset('neuralflower', 'plasticity', 'dark'),
    flowstate: getAsset('flowstate', 'bloom', 'dark'),
    evolvingforms: getAsset('evolvingforms', 'balance', 'dark'),
  },
  layers: {
    baseline: getAsset('neuralflow', 'motion', 'light'),
    pillars: getAsset('neuralflow', 'orientation', 'light'),
    concepts: getAsset('flowstate', 'alignment+shift', 'light'),
    themes: getAsset('flowstate', 'assemble', 'light'),
    schema: getAsset('flowstate', 'bloom', 'dark'),
  },
};

export function getAssetAria(family: AssetFamily, variant: AssetVariant): string {
  const descriptions: Partial<Record<AssetFamily, Partial<Record<string, string>>>> = {
    neuralflower: {
      plasticity: 'Abstract visualization of neuroplasticity and brain adaptation',
      transformation: 'Abstract representation of personal transformation',
      insight: 'Visual metaphor for insight and self-awareness',
      flow: 'Flowing abstract pattern representing mental flow state',
      regulation: 'Abstract visualization of emotional regulation',
      wisdom: 'Abstract representation of accumulated wisdom',
    },
    flowstate: {
      bloom: 'Abstract blooming pattern representing growth',
      'calm+shift': 'Visual representation of calm transformation',
      'upward+shift': 'Upward flowing pattern representing progress',
    },
    evolvingforms: {
      balance: 'Abstract geometric pattern representing balance',
      regrowth: 'Visual metaphor for personal regrowth',
      transition: 'Abstract representation of life transitions',
    },
    neuralflow: {
      flowing: 'Flowing neural pattern representing mental clarity',
      motion: 'Abstract motion pattern representing forward momentum',
    },
    mindblock: {
      tower: 'Structured pattern representing mental foundations',
      integration: 'Abstract visualization of integrated systems',
    },
  };
  return descriptions[family]?.[variant] || `Abstract ${family} visualization: ${variant}`;
}

export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;
  const avif = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQ';
  const img = new Image();
  img.src = avif;
  return img.complete && img.width > 0;
}

export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  const webp = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA';
  const img = new Image();
  img.src = webp;
  return img.complete && img.width > 0;
}

export interface ResponsiveImageOptions {
  family: AssetFamily;
  variant: AssetVariant;
  mode: AssetMode;
  size?: ImageSize;
  format?: ImageFormat;
  deviceType?: DeviceType;
}

export function getResponsiveAsset(options: ResponsiveImageOptions): string {
  const { family, variant, mode, size, format = getOptimalImageFormat() } = options;
  const optimalSize = size || '5:4';
  return `${SUPABASE_URL}/recoverlution-assets/${family}/${optimalSize}/${format}/${family}_abstract_${variant}_${mode}.${format}`;
}

export function getOptimizedAsset(family: AssetFamily, variant: AssetVariant, mode: AssetMode): string {
  return getResponsiveAsset({ family, variant, mode });
}

export function getAssetWithFallback(family: AssetFamily, variant: AssetVariant, mode: AssetMode): string {
  const format = getOptimalImageFormat();
  const size = '5:4';
  return `${SUPABASE_URL}/recoverlution-assets/${family}/${size}/${format}/${family}_abstract_${variant}_${mode}.${format}`;
}

export { SUPABASE_URL };
