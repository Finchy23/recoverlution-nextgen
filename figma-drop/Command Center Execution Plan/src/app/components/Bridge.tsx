/**
 * BRIDGE COMPONENT - APPLE-GRADE FROSTED GLASS AESTHETIC
 * 
 * Perfect narrative transition between major sections
 * Updated to use glass text effects and ultra-light backdrop blur
 * 
 * Design Principles:
 * - Ultra-light blur (0.5px) - assets stay sharp
 * - Glass text shadows for depth, not heavy panels
 * - Subtle gradient accents, not overwhelming overlays
 * - Glass dividers with theme colors
 * - Apple-grade cubic-bezier animations
 * - Full mobile optimization
 * 
 * Pattern (from design system):
 * - Top glass divider (animated expand)
 * - Eyebrow → Headline → Subtext hierarchy
 * - Bottom glass divider (animated expand, delayed)
 * - Large vertical padding (py-32 mobile, py-40 desktop)
 * - Max-width 4xl for content, centered
 * 
 * Usage:
 * <Bridge 
 *   eyebrow="THE INSTALLATION"
 *   headline="A new default"
 *   subtext="Change holds when it can be run."
 *   theme="purple"
 * />
 */

import { useState, useEffect } from 'react';
import { colors, surfaces } from '@/design-tokens';
import { animations } from '@/marketing-tokens';
import { GlassTextEyebrow, GlassTextEtched, GlassTextSubtle } from '@/app/components/marketing/GlassText';
import { GlassDivider } from '@/app/components/marketing/GlassDivider';

export interface BridgeProps {
  /** Uppercase eyebrow label */
  eyebrow?: string;
  
  /** Main headline */
  headline: string;
  
  /** Supporting copy */
  subtext?: string;
  
  /** Theme color for accents (subtle gradient background only - dividers always cyan) */
  theme?: 'purple' | 'green' | 'amber' | 'cyan' | 'neutral';
  
  /** Control visibility for entrance animation */
  mounted?: boolean;
}

/**
 * Bridge - Apple-grade transitional section
 */
export function Bridge({ 
  eyebrow, 
  headline, 
  subtext, 
  theme = 'neutral',
  mounted = true 
}: BridgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Entrance animation trigger
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Theme configuration - accent colors for subtle gradient background only
  const themeConfig = {
    purple: colors.brand.purple.mid,
    green: colors.status.green.mid,
    amber: colors.status.amber.mid,
    cyan: colors.accent.cyan.primary,
    neutral: colors.neutral.gray[600],
  };

  const accentColor = themeConfig[theme];
  
  // Dividers always use cyan regardless of theme
  const dividerColor = colors.accent.cyan.primary;

  return (
    <section 
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        minHeight: isMobile ? '400px' : '500px',
        padding: isMobile ? '8rem 1.5rem' : '10rem 2rem',
        backgroundColor: surfaces.solid.base,
      }}
    >
      {/* Subtle gradient overlay - MUCH lighter than before */}
      {theme !== 'neutral' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}0D 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Content container */}
      <div 
        className="relative z-10 w-full text-center" 
        style={{ 
          maxWidth: '56rem', // 4xl
          margin: '0 auto',
        }}
      >
        {/* Top Divider - Glass effect with cyan */}
        <div
          style={{
            width: isVisible ? '20rem' : '0',
            opacity: isVisible ? 1 : 0,
            transition: animations.transition.default,
            marginBottom: '4rem',
            marginLeft: 'auto', // Center the animated wrapper
            marginRight: 'auto', // Center the animated wrapper
          }}
        >
          <GlassDivider maxWidth="full" accentColor={dividerColor} />
        </div>

        {/* Eyebrow */}
        {eyebrow && (
          <div
            style={{
              marginBottom: '2rem',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: animations.transition.default,
              transitionDelay: '0.1s',
            }}
          >
            <GlassTextEyebrow>
              {eyebrow}
            </GlassTextEyebrow>
          </div>
        )}

        {/* Headline - Etched glass effect */}
        <div
          style={{
            marginBottom: subtext ? '1.5rem' : '0',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: animations.transition.default,
            transitionDelay: '0.2s',
          }}
        >
          <GlassTextEtched 
            as="h2"
            className={isMobile ? 'text-4xl' : 'text-5xl md:text-6xl lg:text-7xl'}
            style={{
              fontFamily: 'Crimson Pro, serif',
              fontWeight: isMobile ? 400 : 300,
              lineHeight: 1.1,
              textWrap: 'balance' as any,
            }}
          >
            {headline}
          </GlassTextEtched>
        </div>

        {/* Subtext - Subtle glass effect */}
        {subtext && (
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: animations.transition.default,
              transitionDelay: '0.3s',
            }}
          >
            <GlassTextSubtle 
              className={isMobile ? 'text-lg' : 'text-xl'}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 300,
                maxWidth: '42rem',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              {subtext}
            </GlassTextSubtle>
          </div>
        )}

        {/* Bottom Divider - Glass effect with cyan */}
        <div
          style={{
            width: isVisible ? '20rem' : '0',
            opacity: isVisible ? 1 : 0,
            transition: animations.transition.default,
            transitionDelay: '0.4s',
            marginTop: '4rem',
            marginLeft: 'auto', // Center the animated wrapper
            marginRight: 'auto', // Center the animated wrapper
          }}
        >
          <GlassDivider maxWidth="full" accentColor={dividerColor} />
        </div>
      </div>
    </section>
  );
}