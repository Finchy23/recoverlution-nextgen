import { useRef, useState, useEffect, CSSProperties } from 'react';
import { useIntersectionObserver } from '@/hooks/usePerformanceOptimization';
import { 
  getFallbackGradient, 
  getAssetAria, 
  getOptimizedAsset,
  type AssetFamily, 
  type AssetVariant,
  type AssetMode
} from '@/utils/assets';

interface UseLazyBackgroundOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  transitionDuration?: number;
  opacity?: number;
  backgroundSize?: string;
  backgroundPosition?: string;
}

interface UseLazyBackgroundResult {
  ref: React.RefObject<HTMLDivElement>;
  style: CSSProperties;
  role: string;
  ariaLabel: string;
  isLoaded: boolean;
  hasError: boolean;
}

export function useLazyBackground(
  url: string,
  family?: AssetFamily,
  variant?: AssetVariant,
  options: UseLazyBackgroundOptions = {}
): UseLazyBackgroundResult {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    triggerOnce = false,
    transitionDuration = 300,
    opacity = 0.4,
    backgroundSize = 'cover',
    backgroundPosition = 'center',
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { isIntersecting } = useIntersectionObserver(ref, { threshold, rootMargin, triggerOnce });

  useEffect(() => {
    if (isIntersecting && !loaded && !hasError) {
      const img = new Image();
      img.onload = () => { setLoaded(true); };
      img.onerror = () => { setHasError(true); };
      img.src = url;
    }
  }, [isIntersecting, loaded, hasError, url]);

  const fallbackGradient = family ? getFallbackGradient(family) : 'linear-gradient(135deg, rgba(87, 57, 251, 0.3), rgba(64, 224, 208, 0.3))';
  const ariaLabel = (family && variant) ? getAssetAria(family, variant) : 'Decorative background image';

  const style: CSSProperties = {
    backgroundImage: hasError ? fallbackGradient : loaded ? `url('${url}')` : 'none',
    backgroundSize,
    backgroundPosition,
    opacity,
    transition: `background-image ${transitionDuration}ms ease-in`,
  };

  return { ref, style, role: 'img', ariaLabel, isLoaded: loaded, hasError };
}

export function useOptimizedLazyBackground(
  family: AssetFamily,
  variant: AssetVariant,
  mode: AssetMode,
  options: UseLazyBackgroundOptions = {}
): UseLazyBackgroundResult {
  const optimizedUrl = getOptimizedAsset(family, variant, mode);
  return useLazyBackground(optimizedUrl, family, variant, options);
}
