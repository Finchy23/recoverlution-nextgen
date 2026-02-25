import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { colors, surfaces, spacing, mobile, hero, typography } from '@/design-tokens';
import { hero as heroContent } from '@/content-tokens';
import { 
  buildAssetUrl, 
  assetOpacity, 
  reelOverlay,
  frostedGlass,
  animations,
  isMobileViewport,
} from '@/marketing-tokens';
import { GlassTextEtched, GlassTextSubtle, GlassTextEyebrow } from '@/app/components/marketing/GlassText';
import { useReducedMotion } from '@/hooks/useAccessibility';

export interface HeroProps {
  eyebrow?: string;
  headline?: string | React.ReactNode;
  subheadline?: string;
  backgroundAsset?: {
    name: string;
    variant: string;
    theme: string;
  };
  enableParallax?: boolean;
  className?: string;
}

/**
 * UNIVERSAL HERO COMPONENT
 * 
 * Reusable hero section with:
 * - Token-driven design (100% design system)
 * - Stunning visual assets with glass text overlays
 * - Apple-grade gradient overlays
 * - Performance optimized
 * - Accessibility compliant
 * 
 * Usage:
 * <Hero 
 *   eyebrow="neuroadaptiveOS"
 *   headline="Recovery. Redefined."
 *   subheadline="Your nervous system learns to heal."
 * />
 */
export function Hero({
  eyebrow = heroContent.eyebrow,
  headline = heroContent.headline,
  subheadline = heroContent.subheadline,
  backgroundAsset = heroContent.backgroundAsset,
  enableParallax = true,
  className = '',
}: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileViewport());
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll for parallax
  useEffect(() => {
    if (!enableParallax) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableParallax]);

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate parallax effect
  const scrollProgress = Math.min(scrollY / 1000, 1);
  const heroScale = enableParallax 
    ? 1 + (scrollProgress * (isMobile ? 0.15 : 0.1))
    : 1;

  // Build asset URL
  const aspectRatio = isMobile ? '3:4' : '5:4'; // Changed from '16:9' to match Supabase storage structure
  const assetUrl = buildAssetUrl(
    backgroundAsset.name as any,
    backgroundAsset.variant as any,
    backgroundAsset.theme as 'light' | 'dark',
    aspectRatio
  );

  return (
    <section
      id="main-content"
      className={`relative w-full h-screen flex items-center justify-center ${className}`}
      style={{
        position: 'relative', // Required for scroll offset calculations
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
      }}
    >
      {/* Background Asset - Full brightness, let asset be the hero */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          ref={parallaxRef}
          className="absolute inset-0"
          role="img"
          aria-label="Abstract visualization of neuroplasticity and brain adaptation"
          style={{
            opacity: assetOpacity.hero,
            transform: `scale(${heroScale}) translate3d(0,0,0)`,
            willChange: enableParallax ? 'transform' : 'auto',
            transition: 'transform 0.1s linear',
          }}
        >
          <img 
            src={assetUrl}
            alt="Abstract visualization of neuroplasticity and brain adaptation"
            loading="eager"
            className="w-full h-full object-cover"
            style={{
              opacity: assetOpacity.hero,
            }}
          />
        </motion.div>
        
        {/* Reel Overlay - subtle gradient darkening */}
        <div 
          className="absolute inset-0"
          style={{
            background: reelOverlay.background,
          }}
        />
      </div>

      {/* Content Panel with Ultra-Light Glass Effect */}
      <div 
        className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6"
        style={{
          background: frostedGlass.ultraLight.background,
          backdropFilter: frostedGlass.ultraLight.backdropFilter,
          WebkitBackdropFilter: frostedGlass.ultraLight.backdropFilter,
        }}
      >
        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 1.2,
              ease: animations.easing.default.split('(')[1].split(')')[0].split(',').map(Number) as any,
            }}
            className="space-y-8"
          >
            {/* Eyebrow */}
            {eyebrow && (
              <GlassTextEyebrow 
                as="p" 
                className="font-body mb-8"
              >
                {eyebrow}
              </GlassTextEyebrow>
            )}

            {/* Headline */}
            {headline && (
              <div className="mb-8">
                <GlassTextEtched 
                  as="h1" 
                  className="font-display text-5xl md:text-6xl lg:text-8xl font-normal tracking-tight"
                >
                  {headline}
                </GlassTextEtched>
              </div>
            )}

            {/* Subheadline */}
            {subheadline && (
              <GlassTextSubtle 
                as="p" 
                className="font-display text-xl md:text-2xl lg:text-3xl font-light italic tracking-wide max-w-3xl mx-auto"
              >
                {subheadline}
              </GlassTextSubtle>
            )}
          </motion.div>
        </div>

        {/* Scroll Indicator - Elegant line + chevron */}
        <motion.div 
          className="absolute left-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: mounted ? Math.max(0, 1 - scrollY * (isMobile ? 0.003 : 0.002)) : 0,
            x: '-50%',
          }}
          style={{
            bottom: isMobile ? '32px' : '48px',
          }}
        >
          {/* Scaling line */}
          <motion.div 
            animate={{ 
              scaleY: prefersReducedMotion ? 1 : [1, 1.3, 1],
            }}
            transition={
              prefersReducedMotion 
                ? {} 
                : {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
            style={{
              width: '1px',
              height: isMobile ? '32px' : '40px',
              backgroundColor: colors.accent.cyan.primary,
              opacity: 0.6,
              margin: '0 auto 8px',
              transformOrigin: 'top'
            }}
          />
          
          {/* Animated chevron */}
          <motion.div
            animate={
              prefersReducedMotion 
                ? {} 
                : { y: [0, 8, 0] }
            }
            transition={
              prefersReducedMotion 
                ? {} 
                : {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
            }
          >
            <ChevronDown 
              size={isMobile ? 20 : 24} 
              style={{ 
                color: colors.accent.cyan.primary,
                opacity: 0.6,
              }} 
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}