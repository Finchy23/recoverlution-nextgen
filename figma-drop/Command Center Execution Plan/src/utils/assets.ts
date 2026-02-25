/**
 * CENTRALIZED ASSET MANAGEMENT
 * 
 * Benefits:
 * - Single source of truth for all asset URLs
 * - Easy CDN migration
 * - Type-safe asset access
 * - Preloading utilities
 * - Fallback support
 * - Responsive images (Enhancement #15)
 * - Format optimization (Enhancement #15)
 */

const SUPABASE_URL = 'https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public';

// ==========================================
// DEVICE DETECTION (Enhancement #15)
// ==========================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ImageFormat = 'avif' | 'webp' | 'jpg';
export type ImageSize = '1:1' | '3:4' | '4:5' | '5:4' | '16:9';

/**
 * Detect device type based on screen width
 */
export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Detect optimal image format based on browser support
 */
export function getOptimalImageFormat(): ImageFormat {
  if (typeof window === 'undefined') return 'avif';
  
  // Check AVIF support
  if (supportsAVIF()) return 'avif';
  
  // Check WebP support (most browsers)
  if (supportsWebP()) return 'webp';
  
  // Fallback to JPEG
  return 'jpg';
}

// ==========================================
// ASSET TYPES
// ==========================================

export type AssetFamily = 'neuralflower' | 'flowstate' | 'evolvingforms' | 'neuralflow' | 'mindblock';
export type AssetMode = 'light' | 'dark';

// Comprehensive variant types for each family
export type NeuralFlowerVariant = 
  | 'plasticity' | 'transformation' | 'insight' | 'flow' | 'regulation'
  | 'interoception' | 'wisdom' | 'repair' | 'blossom' | 'cognitive+spark'
  | 'growth'; // Added for TrustByDesign

export type FlowStateVariant = 
  | 'bloom' | 'calm+shift' | 'upward+shift' | 'alignment+shift' | 'assemble'
  | 'blossoming' | 'commit' | 'neurocoding'; // Added for TheLoop

export type EvolvingFormsVariant = 
  | 'balance' | 'regrowth' | 'flux' | 'shift_' | 'transition'
  | 'glasscube+glowing+centre' | 'skypattern';

export type NeuralFlowVariant = 
  | 'flowing' | 'transition' | 'motion' | 'orientation' | 'flourish';

export type MindBlockVariant = 
  | 'tower' | 'integration' | 'microspheres+defusion' | 'skyline' | 'rise' | 'dynamic';

export type AssetVariant = 
  | NeuralFlowerVariant 
  | FlowStateVariant 
  | EvolvingFormsVariant 
  | NeuralFlowVariant 
  | MindBlockVariant;

// ==========================================
// CORE ASSET FUNCTIONS
// ==========================================

/**
 * Get asset URL with type safety
 * NEW: Supports aspect ratio parameter for 4:5 / 3:4 system
 */
export function getAsset(
  family: AssetFamily,
  variant: AssetVariant,
  mode: AssetMode,
  aspectRatio?: ImageSize // Optional: defaults to legacy 5:4
): string {
  const ratio = aspectRatio || '5:4'; // Default to legacy 5:4 for backwards compatibility
  return `${SUPABASE_URL}/recoverlution-assets/${family}/${ratio}/avif/${family}_abstract_${variant}_${mode}.avif`;
}

/**
 * Get logo URL
 */
export function getLogo(mode: 'light' | 'dark'): string {
  return `${SUPABASE_URL}/marketing-assets/Logo/wide/svg/recoverlution_logo_wide_${mode}.svg`;
}

/**
 * Get fallback gradient for asset family
 * Used when image fails to load
 */
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

// ==========================================
// PRELOADING UTILITIES
// ==========================================

/**
 * Preload a single asset
 * Returns cleanup function
 */
export function preloadAsset(url: string): () => void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  
  // Detect image type from URL
  if (url.endsWith('.avif')) {
    link.type = 'image/avif';
  } else if (url.endsWith('.webp')) {
    link.type = 'image/webp';
  } else if (url.endsWith('.svg')) {
    link.type = 'image/svg+xml';
  }
  
  document.head.appendChild(link);
  
  // Return cleanup function
  return () => {
    if (document.head.contains(link)) {
      document.head.removeChild(link);
    }
  };
}

/**
 * Preload multiple assets
 * Returns cleanup function
 */
export function preloadAssets(urls: string[]): () => void {
  const cleanups = urls.map(url => preloadAsset(url));
  
  return () => {
    cleanups.forEach(cleanup => cleanup());
  };
}

/**
 * Preload critical HomePage assets
 */
export function preloadHeroAssets(): () => void {
  const heroAssets = [
    getAsset('neuralflower', 'plasticity', 'dark'), // Hero background
    getLogo('light'), // Nav logo
  ];
  
  return preloadAssets(heroAssets);
}

// ==========================================
// ASSET COLLECTIONS
// ==========================================

/**
 * Predefined asset collections for common use cases
 */
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

// ==========================================
// ACCESSIBILITY UTILITIES
// ==========================================

/**
 * Get semantic alt text for asset
 */
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

// ==========================================
// BROWSER SUPPORT
// ==========================================

/**
 * Check if browser supports AVIF
 */
export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Create a small AVIF test image
  const avif = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  const img = new Image();
  img.src = avif;
  
  return img.complete && img.width > 0;
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Create a small WebP test image
  const webp = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA';
  
  const img = new Image();
  img.src = webp;
  
  return img.complete && img.width > 0;
}

// ==========================================
// RESPONSIVE IMAGE UTILITIES (Enhancement #15)
// ==========================================

export interface ResponsiveImageOptions {
  family: AssetFamily;
  variant: AssetVariant;
  mode: AssetMode;
  size?: ImageSize;
  format?: ImageFormat;
  deviceType?: DeviceType;
}

/**
 * Get responsive asset URL with optimal format and size
 * TEMPORARY: Using legacy 5:4 until new 4:5/3:4 assets are available
 */
export function getResponsiveAsset(options: ResponsiveImageOptions): string {
  const {
    family,
    variant,
    mode,
    size, // If provided, override auto-detection
    format = getOptimalImageFormat(),
    deviceType = getDeviceType(),
  } = options;

  // TEMPORARY FIX: Use 5:4 for all devices until new assets are ready
  // TODO: Switch to this once 4:5 and 3:4 assets are available:
  // const optimalSize = size || (deviceType === 'mobile' ? '3:4' : '4:5');
  const optimalSize = size || '5:4'; // Legacy fallback

  return `${SUPABASE_URL}/recoverlution-assets/${family}/${optimalSize}/${format}/${family}_abstract_${variant}_${mode}.${format}`;
}

/**
 * Generate srcset for responsive images
 * Returns srcset string with multiple formats and sizes
 * NEW: Uses 3:4 for mobile, 4:5 for desktop
 */
export function getAssetSrcSet(
  family: AssetFamily,
  variant: AssetVariant,
  mode: AssetMode
): string {
  const format = getOptimalImageFormat();
  
  // Generate srcset with different sizes
  const sizes = [
    { width: 640, size: '3:4' as ImageSize },   // Mobile (3:4 portrait)
    { width: 1024, size: '4:5' as ImageSize },  // Tablet (4:5 portrait)
    { width: 1920, size: '4:5' as ImageSize },  // Desktop (4:5 portrait)
  ];

  const srcset = sizes
    .map(({ width, size }) => {
      const url = `${SUPABASE_URL}/recoverlution-assets/${family}/${size}/${format}/${family}_abstract_${variant}_${mode}.${format}`;
      return `${url} ${width}w`;
    })
    .join(', ');

  return srcset;
}

/**
 * Generate sizes attribute for responsive images
 */
export function getAssetSizes(): string {
  return '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px';
}

/**
 * Get optimized asset for current device
 * Automatically selects best format and size
 */
export function getOptimizedAsset(
  family: AssetFamily,
  variant: AssetVariant,
  mode: AssetMode
): string {
  return getResponsiveAsset({
    family,
    variant,
    mode,
  });
}

/**
 * Get asset URL with fallback for unsupported formats
 * Now with proper format detection (Enhancement #15)
 * TEMPORARY: Using legacy 5:4 until new assets are available
 */
export function getAssetWithFallback(
  family: AssetFamily,
  variant: AssetVariant,
  mode: AssetMode
): string {
  const format = getOptimalImageFormat();
  // TEMPORARY: Use 5:4 until new assets are ready
  const size = '5:4'; // Legacy fallback
  
  return `${SUPABASE_URL}/recoverlution-assets/${family}/${size}/${format}/${family}_abstract_${variant}_${mode}.${format}`;
}

// ==========================================
// EXPORT CONSTANTS
// ==========================================

export { SUPABASE_URL };