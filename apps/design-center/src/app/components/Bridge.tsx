/**
 * BRIDGE COMPONENT - APPLE-GRADE FROSTED GLASS AESTHETIC
 * 
 * Perfect narrative transition between major sections
 */

import { useState, useEffect } from 'react';
import { colors, surfaces } from '@/design-tokens';
import { animations } from '@/marketing-tokens';
import { GlassTextEyebrow, GlassTextEtched, GlassTextSubtle } from '@/app/components/marketing/GlassText';
import { GlassDivider } from '@/app/components/marketing/GlassDivider';
import { useIsMobile } from '@/app/components/ui/use-mobile';

export interface BridgeProps {
  eyebrow?: string;
  headline: string;
  subtext?: string;
  theme?: 'purple' | 'green' | 'amber' | 'cyan' | 'neutral';
  mounted?: boolean;
}

export function Bridge({ 
  eyebrow, 
  headline, 
  subtext, 
  theme = 'neutral',
  mounted = true 
}: BridgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const themeConfig = {
    purple: colors.brand.purple.mid,
    green: colors.status.green.mid,
    amber: colors.status.amber.mid,
    cyan: colors.accent.cyan.primary,
    neutral: colors.neutral.gray[600],
  };

  const accentColor = themeConfig[theme];
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
      {theme !== 'neutral' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}0D 0%, transparent 70%)`,
          }}
        />
      )}

      <div 
        className="relative z-10 w-full text-center" 
        style={{ 
          maxWidth: '56rem',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: isVisible ? '20rem' : '0',
            opacity: isVisible ? 1 : 0,
            transition: animations.transition.default,
            marginBottom: '4rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <GlassDivider maxWidth="full" accentColor={dividerColor} />
        </div>

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

        <div
          style={{
            width: isVisible ? '20rem' : '0',
            opacity: isVisible ? 1 : 0,
            transition: animations.transition.default,
            transitionDelay: '0.4s',
            marginTop: '4rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <GlassDivider maxWidth="full" accentColor={dividerColor} />
        </div>
      </div>
    </section>
  );
}
