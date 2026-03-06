/**
 * DESIGN TOKEN SYSTEM
 *
 * Recoverlution Design Tokens — the single source of truth for
 * every visual primitive in the application shell, pages, and
 * design-center labs.
 *
 * ARCHITECTURE:
 *   Shell / Pages / Labs         → this file
 *   NaviCue atoms / compositions → design-system/atom-tokens.ts
 *   NaviCue palettes / atmosphere → design-system/navicue-blueprint.ts
 *   NaviCue orchestration        → design-system/symphony-orchestration.ts
 *
 * RULES:
 *   - No value should appear twice. If it does, it's an alias with a name.
 *   - Every export is `as const` for literal type inference.
 *   - Glass/glow values use rgba for compositing.
 *   - Spacing uses px strings for direct style application.
 *   - Motion uses CSS timing strings and cubic-bezier arrays.
 */

// ==========================================
// COLORS
// ==========================================

export const colors = {
  neutral: {
    black: '#0F0D1A',
    white: '#F9F8FF',
    gray: {
      50: '#F9F8FF',
      100: '#F0EFF8',
      200: '#E1DEF0',
      300: '#C9C4D8',
      400: '#A89FB8',
      500: '#8A8499',
      600: '#6B677A',
      700: '#4B495B',
      800: '#373541',
      900: '#1F1D27',
      950: '#0F0D1A',
    },
  },
  brand: {
    purple: {
      light: '#A89BFF',
      mid: '#8A7AFF',
      primary: '#6B52FF',
      dark: '#3E2BB8',
      deep: '#2A1F7A',
    },
  },
  accent: {
    cyan: {
      light: '#40E0D0',
      primary: '#00CCE0',
      dark: '#1FB2A0',
    },
    blue: {
      light: '#7CB8FF',
      primary: '#4A90D9',
      dark: '#2D5F99',
    },
    green: {
      light: '#2FE6A6',
      primary: '#25D494',
      dark: '#1BBF82',
    },
  },
  status: {
    green: {
      bright: '#2FE6A6',
      mid: '#25D494',
      dark: '#1BBF82',
    },
    amber: {
      bright: '#FFB677',
      mid: '#E6973D',
      dark: '#CC7A20',
    },
    red: {
      bright: '#FF6B6B',
      mid: '#E63946',
      dark: '#CC2936',
    },
    yellow: {
      bright: '#FFD700',
      mid: '#F0C040',
      dark: '#CC9B00',
    },
  },
  /** Signature palette primaries — the 4 colors unique to emotion signatures
   *  that don't map to brand/accent/status. Canonical source for these hues. */
  signature: {
    /** Sacred Ordinary — warm stone */
    sacredOrdinary: '#D4C5B8',
    /** Witness / Ritual — muted slate blue */
    witnessRitual: '#8B9DC3',
    /** Koan / Paradox — deep violet */
    koanParadox: '#7C3AED',
    /** Warm Provocation — amber gold */
    warmProvocation: '#E8A64C',
  },
  /** UI-layer accents — named colors for workspace chrome, sections, and tools.
   *  Each has a specific semantic job in the Design Center shell. */
  ui: {
    /** Atmosphere section accent — soft blue */
    atmosphereBlue: '#6B9BF0',
    /** Gate section accent — rose */
    gateRose: '#FF6B8A',
    /** Interaction / receipt accent — receipt yellow */
    receiptYellow: '#FBBF24',
    /** Series 10 / Atoms workspace accent — warm gold */
    seriesGold: '#C9A87C',
    /** Pure white (not neutral.white) — for radiant-white signature */
    pureWhite: '#FFFFFF',
  },
} as const;

// ==========================================
// SURFACES
// ==========================================

export const surfaces = {
  solid: {
    base: '#0F0D1A',
    elevated: '#1F1D27',
    raised: '#373541',
  },
  glass: {
    subtle: 'rgba(255, 255, 255, 0.03)',
    light: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.06)',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #3E2BB8 0%, #6B52FF 100%)',
    dark: 'linear-gradient(180deg, #0F0D1A 0%, #1F1D27 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
  },
} as const;

// ==========================================
// SPACING
// ==========================================

export const spacing = {
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
  '5xl': '96px',
  section: {
    content: {
      mobile: '24px 16px',
      desktop: '48px 32px',
    },
  },
} as const;

// ==========================================
// RADIUS
// ==========================================

export const radius = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

// ==========================================
// BORDER
// ==========================================

export const border = {
  width: {
    hairline: '0.5px',
    thin: '1px',
    medium: '2px',
  },
} as const;

// ==========================================
// TYPOGRAPHY
// ==========================================

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'Crimson Pro', 'Georgia', serif",
    mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  },
  display: {
    hero: {
      fontSize: 'clamp(48px, 8vw, 96px)',
      fontWeight: '700',
      lineHeight: '1',
      letterSpacing: '-0.03em',
    },
    large: {
      fontSize: 'clamp(36px, 6vw, 72px)',
      fontWeight: '600',
      lineHeight: '1.05',
      letterSpacing: '-0.025em',
    },
  },
  heading: {
    h1: {
      fontSize: 'clamp(32px, 5vw, 56px)',
      fontWeight: '600',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: 'clamp(24px, 4vw, 40px)',
      fontWeight: '600',
      lineHeight: '1.15',
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: 'clamp(20px, 3vw, 32px)',
      fontWeight: '500',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: 'clamp(18px, 2.5vw, 24px)',
      fontWeight: '500',
      lineHeight: '1.3',
    },
    h5: {
      fontSize: 'clamp(16px, 2vw, 20px)',
      fontWeight: '500',
      lineHeight: '1.4',
    },
    h6: {
      fontSize: 'clamp(14px, 1.5vw, 16px)',
      fontWeight: '500',
      lineHeight: '1.5',
    },
  },
  body: {
    large: {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.6',
    },
    default: {
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '1.6',
    },
    small: {
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    xs: {
      fontSize: '11px',
      fontWeight: '400',
      lineHeight: '1.4',
    },
  },
  label: {
    large: {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '1',
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
    },
    default: {
      fontSize: '12px',
      fontWeight: '600',
      lineHeight: '1',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    small: {
      fontSize: '10px',
      fontWeight: '600',
      lineHeight: '1',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },
  ui: {
    button: {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '11px',
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0.01em',
    },
  },
} as const;

// ==========================================
// FONTS (convenience aliases for fontFamily)
// ==========================================

export const fonts = {
  primary: typography.fontFamily.primary,
  secondary: typography.fontFamily.secondary,
  heading: typography.fontFamily.secondary,
  serif: typography.fontFamily.secondary,
  mono: typography.fontFamily.mono,
} as const;

// ==========================================
// MOBILE
// ==========================================

export const mobile = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
    wide: 1440,
  },
  viewport: {
    height: {
      full: '100vh',
      half: '50vh',
    },
  },
  spacing: {
    section: '48px',
    component: '24px',
  },
} as const;

// ==========================================
// GLASS NAV
// ==========================================

export const glassNav = {
  background: {
    default: 'rgba(15, 13, 26, 0.8)',
    transparent: 'rgba(0,0,0,0)',
  },
  backdropFilter: 'blur(24px) saturate(180%)',
  border: {
    default: 'rgba(0,0,0,0)',
    scrolled: 'rgba(255, 255, 255, 0.06)',
  },
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

// ==========================================
// MOTION
// ==========================================

export const motion = {
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: '150ms',
    default: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
} as const;

// ==========================================
// REDUCED MOTION SYSTEM
// ==========================================

export const reducedMotionSystem = {
  /** CSS media query for prefers-reduced-motion */
  mediaQuery: '(prefers-reduced-motion: reduce)',
  /** Whether to check for reduced motion — all consumers should respect this */
  shouldReduce: (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  fallbacks: {
    fadeOnly: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    instant: {
      initial: {},
      animate: {},
      exit: {},
      transition: { duration: 0 },
    },
  },
} as const;

// ==========================================
// SCREEN READER
// ==========================================

export const screenReader = {
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    borderWidth: '0',
  },
} as const;

// ==========================================
// HERO SECTION TOKENS
// ==========================================

export const hero = {
  minHeight: '100vh',
  contentMaxWidth: '1200px',
  gradientOverlay: 'linear-gradient(180deg, rgba(15, 13, 26, 0.3) 0%, rgba(15, 13, 26, 0.6) 100%)',
} as const;

// ==========================================
// SHADOWS
// ==========================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  glow: {
    cyan: '0 0 20px rgba(0, 204, 224, 0.3)',
    purple: '0 0 20px rgba(107, 82, 255, 0.3)',
    green: '0 0 20px rgba(47, 230, 166, 0.3)',
  },
} as const;

// ==========================================
// Z-INDEX
// ==========================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  overlay: 400,
  nav: 1000,
  toast: 1100,
} as const;

// ==========================================
// KBE LAYER TOKENS
// ==========================================

export const kbeLayers = {
  knowing: {
    color: 'hsl(210, 70%, 55%)',
    light: 'hsl(210, 70%, 90%)',
    overlay: 'hsl(210, 70%, 55%, 0.1)',
    label: 'Knowing',
    tag: 'K',
  },
  believing: {
    color: 'hsl(30, 70%, 55%)',
    light: 'hsl(30, 70%, 90%)',
    overlay: 'hsl(30, 70%, 55%, 0.1)',
    label: 'Believing',
    tag: 'B',
  },
  embodying: {
    color: 'hsl(140, 65%, 50%)',
    light: 'hsl(140, 65%, 90%)',
    overlay: 'hsl(140, 65%, 50%, 0.1)',
    label: 'Embodying',
    tag: 'E',
  },
} as const;

// ==========================================
// HEAT BAND TOKENS
// ==========================================

export const heatBands = {
  0: {
    color: 'hsl(160, 60%, 50%)',
    bg: 'hsl(160, 60%, 96%)',
    border: 'hsl(160, 50%, 80%)',
    label: 'Safe & Social',
  },
  1: {
    color: 'hsl(140, 50%, 45%)',
    bg: 'hsl(140, 50%, 95%)',
    border: 'hsl(140, 45%, 75%)',
    label: 'Alert & Regulated',
  },
  2: {
    color: 'hsl(45, 90%, 55%)',
    bg: 'hsl(45, 90%, 95%)',
    border: 'hsl(45, 85%, 70%)',
    label: 'Early Dysregulation',
  },
  3: {
    color: 'hsl(25, 90%, 55%)',
    bg: 'hsl(25, 90%, 95%)',
    border: 'hsl(25, 85%, 70%)',
    label: 'Sympathetic Activation',
  },
  4: {
    color: 'hsl(0, 70%, 50%)',
    bg: 'hsl(0, 70%, 96%)',
    border: 'hsl(0, 65%, 75%)',
    label: 'Survival Mode',
  },
} as const;

// ==========================================
// COLOR UTILITIES
// ==========================================

/**
 * Convert a hex color string to rgba with a given alpha.
 * This is the SINGLE canonical implementation — all other files
 * import this. No duplicating this function.
 */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ==========================================
// TRANSPARENT — named constant to avoid raw 'transparent' keyword
// ==========================================
// CSS 'transparent' is shorthand for rgba(0,0,0,0), but it causes
// animation interpolation bugs in motion/react (and other WAAPI
// implementations) because it's a keyword, not a parseable color.
// Always use this constant instead of the string 'transparent'.

export const TRANSPARENT = 'rgba(0,0,0,0)' as const;
