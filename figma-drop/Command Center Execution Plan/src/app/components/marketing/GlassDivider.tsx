/**
 * GLASS DIVIDER COMPONENT
 * 
 * Horizontal gradient line for section separation
 * Apple-grade subtle accent that creates rhythm without overwhelming
 * 
 * Features:
 * - Customizable max-width presets
 * - Theme-aware color support
 * - Always horizontally centered
 * - Tokenized via glassDivider from marketing-tokens
 */

import React from 'react';
import { glassDivider } from '@/marketing-tokens';

export interface GlassDividerProps {
  /** Additional CSS classes */
  className?: string;
  
  /** Max width constraint */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  
  /** Override accent color (defaults to cyan from token) */
  accentColor?: string;
}

/**
 * Max width presets (Tailwind classes)
 */
const maxWidths = {
  xs: 'max-w-xs',   // ~20rem / 320px
  sm: 'max-w-sm',   // ~24rem / 384px
  md: 'max-w-md',   // ~28rem / 448px
  lg: 'max-w-lg',   // ~32rem / 512px
  full: 'max-w-full',
};

/**
 * GlassDivider - Horizontal gradient accent line
 */
export function GlassDivider({ 
  className = '', 
  maxWidth = 'xs',
  accentColor,
}: GlassDividerProps) {
  // Build custom gradient if accent color provided
  const dividerStyle = accentColor
    ? {
        height: glassDivider.height,
        background: `linear-gradient(90deg, transparent 0%, ${accentColor}40 20%, ${accentColor}40 80%, transparent 100%)`,
      }
    : {
        height: glassDivider.height,
        background: glassDivider.background,
      };

  return (
    <div 
      className={`mx-auto ${maxWidths[maxWidth]} ${className}`}
      style={dividerStyle}
      aria-hidden="true"
    />
  );
}
