/**
 * GLASS TEXT COMPONENT
 * 
 * Text with sophisticated shadow treatments for depth on glass surfaces
 * Apple-grade etched/embossed effect without heavy background dimming
 */

import React from 'react';
import { glassText } from '@/marketing-tokens';

export type GlassTextVariant = 'etched' | 'subtle' | 'eyebrow';

export interface GlassTextProps {
  /** Text variant - determines shadow treatment and color */
  variant: GlassTextVariant;
  
  /** Content to render */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** HTML element to render as */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  
  /** Override text color (keeps shadow treatment) */
  color?: string;
  
  /** Override text shadow */
  textShadow?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * GlassText - Text with glass surface depth effects
 */
export function GlassText({ 
  variant, 
  children, 
  className = '', 
  as: Component = 'p',
  color,
  textShadow,
  style: extraStyle,
}: GlassTextProps) {
  const baseStyles = glassText[variant];
  
  const style: React.CSSProperties = {
    color: color || baseStyles.color,
    textShadow: textShadow || baseStyles.textShadow,
    letterSpacing: baseStyles.letterSpacing,
    ...(variant === 'eyebrow' && {
      fontWeight: baseStyles.fontWeight,
      textTransform: baseStyles.textTransform,
      fontSize: baseStyles.fontSize,
    }),
    ...extraStyle,
  };

  return (
    <Component 
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}

/**
 * Pre-configured convenience exports for common use cases
 */

export function GlassTextEtched({ 
  children, 
  className = '', 
  as = 'h2',
  ...props 
}: Omit<GlassTextProps, 'variant'>) {
  return (
    <GlassText variant="etched" className={className} as={as} {...props}>
      {children}
    </GlassText>
  );
}

export function GlassTextSubtle({ 
  children, 
  className = '', 
  as = 'p',
  ...props 
}: Omit<GlassTextProps, 'variant'>) {
  return (
    <GlassText variant="subtle" className={className} as={as} {...props}>
      {children}
    </GlassText>
  );
}

export function GlassTextEyebrow({ 
  children, 
  className = '', 
  as = 'p',
  ...props 
}: Omit<GlassTextProps, 'variant'>) {
  return (
    <GlassText variant="eyebrow" className={className} as={as} {...props}>
      {children}
    </GlassText>
  );
}
