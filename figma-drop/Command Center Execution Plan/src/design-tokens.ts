/**
 * RecoveryOS Design System V2
 * Central source of truth for all design tokens
 * Nothing is hardcoded. Everything pulls from here.
 *
 * ═══════════════════════════════════════════════════════════════════
 * COLOR DOMAIN GOVERNANCE
 * ═══════════════════════════════════════════════════════════════════
 *
 * RecoveryOS operates two distinct color domains. The boundary between
 * them is itself a design moment: the user transitions from platform
 * (structured, clinical, confident) into specimen (intimate, organic,
 * poetic). Like walking from an Apple Store into the app you opened.
 *
 * PLATFORM DOMAIN (homepage, command center, navigation, bridges):
 *   Cyan   (#40E0D0) = Structural skeleton. Eyebrows, dividers, scroll
 *                       indicators, nav accents, scene counters. The
 *                       quiet line that holds everything together.
 *   Purple (#B85EFF)  = Understanding and depth. EMBRACE phase. Bridge
 *                       sections 1, 3, 5 (alternating rhythm).
 *   Amber  (#FBB024)  = Action and delivery. SHIFT phase. NaviCues as
 *                       a feature carry this color. The energy of doing.
 *   Green  (#4ADE80)  = Integration and growth. BECOME phase. Bridge
 *                       sections 2, 4, 6 (alternating rhythm).
 *   Blue   (#39AEDD)  = Trust, calm, predictability. Baseline foundation.
 *
 * SPECIMEN DOMAIN (inside NaviCue experiences):
 *   Colors derived from `magicSignatures` (8 HSLA families) via
 *   `createNaviCuePalette()` in navicue-blueprint.ts. Mechanism accents
 *   provide secondary hue shifts. KBE layer controls intensity.
 *   Brand colors (cyan/purple/amber/green) are NEVER used directly
 *   inside specimens. The specimen is the user's world, not the brand's.
 *
 * RADIUS GOVERNANCE:
 *   All values must snap to the `radius` scale (xs through full).
 *   Pills always use radius.full (9999px). No 100px, no fixed values.
 *   See `radiusRules` for circle vs rectangle guidance.
 *
 * TYPOGRAPHY GOVERNANCE:
 *   Platform: `typography` tokens below (Inter for UI, Crimson Pro for narrative)
 *   Specimens: `navicueType` in navicue-blueprint.ts (10px floor, 36px ceiling)
 *   Legacy `navicueTypography` below is deprecated. See migration guide.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

// ==========================================
// FONTS
// ==========================================

export const fonts = {
  // Primary UI font - Inter for clean, modern interface
  primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
  
  // Secondary narrative font - Crimson Pro for storytelling, long-form content
  secondary: "'Crimson Pro', Georgia, 'Times New Roman', serif",
  
  // Monospace for code and technical content
  mono: "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', monospace",
} as const;

// ==========================================
// COLORS
// ==========================================

export const colors = {
  // Brand Core - Primary Purple
  brand: {
    purple: {
      dark: '#3E2BB8',
      mid: '#2B5DAD',
      light: '#B85EFF', // Updated for better readability and vibrancy
    },
  },

  // Accent - Cyan (used for icons, eyebrows, accents)
  accent: {
    cyan: {
      primary: '#40E0D0',
      light: '#7FFFD4',
      dark: '#20B2AA',
    },
    blue: {
      primary: '#39AEDD', // Trust, calm, predictability - Baseline foundation
    },
  },

  // Traffic Light System
  status: {
    green: {
      bright: '#4ADE80',
      mid: '#22C55E',
      dark: '#16A34A',
    },
    amber: {
      bright: '#FBB024',
      mid: '#F59E0B',
      dark: '#D97706',
    },
    yellow: {
      bright: '#FACC15',
      mid: '#EAB308',
      dark: '#CA8A04',
    },
    red: {
      bright: '#EF4444',
      mid: '#DC2626',
      dark: '#B91C1C',
    },
  },

  // Neutrals
  neutral: {
    white: '#ecefe5', // Warm off-white
    black: '#000000',
    gray: {
      50: 'rgba(236, 239, 229, 0.05)',
      100: 'rgba(236, 239, 229, 0.1)',
      200: 'rgba(236, 239, 229, 0.2)',
      300: 'rgba(236, 239, 229, 0.3)',
      400: 'rgba(236, 239, 229, 0.4)',
      500: 'rgba(236, 239, 229, 0.5)',
      600: 'rgba(236, 239, 229, 0.6)',
      700: 'rgba(236, 239, 229, 0.7)',
      800: 'rgba(236, 239, 229, 0.8)',
      900: 'rgba(236, 239, 229, 0.9)',
    },
    // Dark scale for light backgrounds (navy/black based)
    dark: {
      50: 'rgba(17, 23, 30, 0.05)',
      100: 'rgba(17, 23, 30, 0.1)',
      200: 'rgba(17, 23, 30, 0.2)',
      300: 'rgba(17, 23, 30, 0.3)',
      400: 'rgba(17, 23, 30, 0.4)',
      500: 'rgba(17, 23, 30, 0.5)',
      600: 'rgba(17, 23, 30, 0.6)',
      700: 'rgba(17, 23, 30, 0.7)',
      800: 'rgba(17, 23, 30, 0.8)',
      900: 'rgba(17, 23, 30, 0.9)',
      950: '#11171e', // Full navy
    },
  },
} as const;

// ==========================================
// BACKGROUNDS & SURFACES
// ==========================================

export const surfaces = {
  glass: {
    light: 'rgba(236, 239, 229, 0.03)',
    medium: 'rgba(236, 239, 229, 0.05)',
    strong: 'rgba(236, 239, 229, 0.08)',
  },
  solid: {
    base: '#11171e', // Deep blue-black foundation
    elevated: '#1a2028', // Slightly lighter blue-black
    pure: '#000000', // Reserved for true blacks if needed
  },
} as const;

// ==========================================
// GLASS NAVIGATION AESTHETIC
// ==========================================

/**
 * Unified glass navigation aesthetic
 * Used across all navigation components (top nav, player nav, etc.)
 * Ensures visual consistency throughout the platform
 */
export const glassNav = {
  // Background
  background: {
    default: 'rgba(11, 11, 12, 0.4)', // Dark glass with 40% opacity
    hover: 'rgba(11, 11, 12, 0.5)', // Slightly more opaque on hover
  },
  
  // Backdrop filter for glass effect
  backdropFilter: 'blur(40px) saturate(200%) brightness(1.1)',
  
  // Borders
  border: {
    default: 'rgba(236, 239, 229, 0.1)', // Subtle border using neutral gray
    scrolled: 'rgba(236, 239, 229, 0.15)', // More visible when scrolled
  },
  
  // Transitions
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ==========================================
// SCENE PADDING SYSTEM
// ==========================================

/**
 * Consistent padding system for all player scenes
 * 
 * Mobile: Accounts for TopNav (60px) and BottomNav (88px)
 * Desktop: Balanced padding assuming left nav mirrors right (64px width each side)
 * 
 * Rule: Content must NEVER touch nav elements or edges
 * Typography sits comfortably within safe zones
 * Background assets extend to full inset: 0
 */
export const scenePadding = {
  // Mobile - Account for glass navs
  mobile: {
    top: '80px',        // 60px TopNav + 20px breathing room
    bottom: '108px',    // 88px BottomNav + 20px breathing room
    left: '5%',         // 5% padding = 90% content width
    right: '5%',        // 5% padding = 90% content width
  },
  
  // Desktop - Balanced for left/right nav columns (64px each)
  desktop: {
    top: '48px',        // Balanced top breathing room
    bottom: '48px',     // Balanced bottom breathing room
    left: '96px',       // 64px nav + 32px breathing room
    right: '96px',      // 64px nav + 32px breathing room (matches right column)
  },
  
  // Content max-width for text readability
  contentMaxWidth: '900px',
  
  // Section spacing (between elements within a scene)
  section: {
    small: '24px',
    medium: '32px',
    large: '48px',
    xlarge: '64px',
  },
} as const;

// ==========================================
// BUTTON SYSTEM - Apple-Grade Elegance
// ==========================================

/**
 * Elegant button system with glass aesthetics
 * No solid backgrounds - only glass, borders, and subtle fills
 * Follows Apple's design philosophy of minimal, refined interfaces
 */
export const buttons = {
  // Primary action button (e.g., Continue, Submit)
  primary: {
    background: {
      light: 'rgba(11, 11, 12, 0.08)',        // Subtle dark tint on light backgrounds
      dark: 'rgba(236, 239, 229, 0.08)',      // Subtle light tint on dark backgrounds
    },
    border: {
      light: 'rgba(11, 11, 12, 0.15)',        // Defined border on light
      dark: 'rgba(236, 239, 229, 0.15)',      // Defined border on dark
    },
    hover: {
      background: {
        light: 'rgba(11, 11, 12, 0.12)',
        dark: 'rgba(236, 239, 229, 0.12)',
      },
      border: {
        light: 'rgba(11, 11, 12, 0.25)',
        dark: 'rgba(236, 239, 229, 0.25)',
      },
    },
    active: {
      background: {
        light: 'rgba(11, 11, 12, 0.15)',
        dark: 'rgba(236, 239, 229, 0.15)',
      },
    },
    text: {
      light: '#0B0B0C',
      dark: '#ECEFE5',
    },
    padding: {
      mobile: '14px 28px',
      desktop: '16px 32px',
    },
    fontSize: {
      mobile: '15px',
      desktop: '16px',
    },
    fontWeight: '400',
    letterSpacing: '0.01em',
    minHeight: {
      mobile: '48px',
      desktop: '52px',
    },
  },

  // Secondary/Ghost button (subtle, minimal)
  secondary: {
    background: {
      light: 'transparent',
      dark: 'transparent',
    },
    border: {
      light: 'rgba(11, 11, 12, 0.1)',
      dark: 'rgba(236, 239, 229, 0.1)',
    },
    hover: {
      background: {
        light: 'rgba(11, 11, 12, 0.05)',
        dark: 'rgba(236, 239, 229, 0.05)',
      },
      border: {
        light: 'rgba(11, 11, 12, 0.2)',
        dark: 'rgba(236, 239, 229, 0.2)',
      },
    },
    text: {
      light: 'rgba(11, 11, 12, 0.7)',
      dark: 'rgba(236, 239, 229, 0.7)',
    },
    padding: {
      mobile: '12px 24px',
      desktop: '14px 28px',
    },
    fontSize: {
      mobile: '14px',
      desktop: '15px',
    },
    fontWeight: '400',
    letterSpacing: '0.01em',
  },

  // Circle button (for icons)
  circle: {
    background: {
      light: 'transparent',
      dark: 'transparent',
    },
    border: {
      light: 'rgba(11, 11, 12, 0.12)',
      dark: 'rgba(236, 239, 229, 0.12)',
    },
    hover: {
      background: {
        light: 'rgba(11, 11, 12, 0.06)',
        dark: 'rgba(236, 239, 229, 0.06)',
      },
      border: {
        light: 'rgba(11, 11, 12, 0.2)',
        dark: 'rgba(236, 239, 229, 0.2)',
      },
    },
    size: {
      small: '40px',
      medium: '48px',
      large: '56px',
    },
  },

  // Shared properties
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: {
    pill: '9999px', // True pill — matches radius.full for consistency
    rounded: '12px', // Rounded but not pill (radius.md)
  },
  transform: {
    hover: 'translateY(-1px)',
    active: 'translateY(0)',
  },
} as const;

// ==========================================
// TYPOGRAPHY
// ==========================================

export const typography = {
  // Font families - applied globally
  fontFamily: {
    primary: fonts.primary,
    secondary: fonts.secondary,
    mono: fonts.mono,
  },

  // Display - Hero level
  display: {
    hero: {
      fontSize: 'clamp(48px, 8vw, 96px)',
      fontWeight: '700',
      letterSpacing: '-0.03em',
      lineHeight: '1.1',
      fontFamily: fonts.primary,
      textWrap: 'balance' as const,
    },
    large: {
      fontSize: '72px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.1',
      fontFamily: fonts.primary,
      textWrap: 'balance' as const,
    },
  },

  // Section Headers
  sectionHeader: {
    title: {
      fontSize: '48px',
      fontWeight: '600',
      letterSpacing: '-0.01em',
      fontFamily: fonts.primary,
      textWrap: 'balance' as const,
    },
    titleLarge: {
      fontSize: '56px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
      fontFamily: fonts.primary,
      textWrap: 'balance' as const,
    },
    eyebrow: {
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.25em',
      fontFamily: fonts.primary,
      textTransform: 'uppercase' as const,
    },
  },

  // Headings
  heading: {
    h1: {
      fontSize: '56px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
      fontFamily: fonts.primary,
      textWrap: 'balance' as const,
    },
    h2: {
      fontSize: '48px',
      fontFamily: fonts.primary,
      fontWeight: '600',
      letterSpacing: '-0.01em',
      lineHeight: '1.2',
      textWrap: 'balance' as const,
    },
    h3: {
      fontSize: '32px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
      textWrap: 'balance' as const,
    },
    h4: {
      fontSize: '28px',
      fontWeight: '600',
      letterSpacing: '-0.01em',
      lineHeight: '1.3',
      textWrap: 'balance' as const,
    },
    h5: {
      fontSize: '24px',
      fontWeight: '600',
      letterSpacing: '-0.01em',
      lineHeight: '1.3',
      textWrap: 'balance' as const,
    },
    h6: {
      fontSize: '20px',
      fontWeight: '600',
      letterSpacing: '-0.01em',
      lineHeight: '1.4',
      textWrap: 'balance' as const,
    },
  },

  // Body text
  body: {
    xlarge: {
      fontSize: 'clamp(16px, 2vw, 22px)',
      lineHeight: '1.7',
      fontFamily: fonts.primary,
    },
    large: {
      fontSize: '20px',
      lineHeight: '1.7',
      fontFamily: fonts.primary,
    },
    medium: {
      fontSize: '18px',
      lineHeight: '1.7',
      fontFamily: fonts.primary,
    },
    regular: {
      fontSize: '16px',
      lineHeight: '1.6',
      fontFamily: fonts.primary,
    },
    small: {
      fontSize: '14px',
      lineHeight: '1.6',
    },
    xsmall: {
      fontSize: '13px',
      lineHeight: '1.5',
    },
  },

  // Labels & metadata
  label: {
    large: {
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
    medium: {
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
    small: {
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },

  // Tile typography
  tile: {
    number: {
      fontSize: '56px',
      fontWeight: '700',
      lineHeight: '1',
      opacity: '0.15',
    },
    title: {
      fontSize: '19px',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    description: {
      fontSize: '14px',
      lineHeight: '1.7',
    },
  },

  // Pillar typography
  pillar: {
    label: {
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
    description: {
      fontSize: '14px',
      lineHeight: '1.6',
    },
  },

  // Metrics & data
  metric: {
    value: {
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1',
    },
    unit: {
      fontSize: '24px',
      opacity: '0.6',
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },

  // Code & technical
  code: {
    regular: {
      fontSize: '11px',
      fontFamily: fonts.mono,
      lineHeight: '1.6',
    },
    small: {
      fontSize: '10px',
      fontFamily: fonts.mono,
      lineHeight: '1.6',
    },
  },

  // UI Elements - Buttons, pills, interactive components
  ui: {
    button: {
      fontSize: '16px', // Standardized from 15px → 16px (on-grid)
      fontWeight: '500',
      letterSpacing: '0.01em',
    },
    buttonSmall: {
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.05em',
    },
    pill: {
      fontSize: '13px',
      fontWeight: '500',
      letterSpacing: '0.05em',
    },
    caption: {
      fontSize: '12px',
      lineHeight: '1.4',
      letterSpacing: '0',
    },
  },

  // Micro Copy - Mobile-optimized (12px minimum for readability)
  micro: {
    large: {
      fontSize: '12px', // Increased from 10px for mobile readability
      fontWeight: '600',
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
    },
    medium: {
      fontSize: '12px', // Increased from 10px for mobile readability
      fontWeight: '500',
      letterSpacing: '0.1em',
    },
    small: {
      fontSize: '12px', // Increased from 8px for mobile readability (WCAG compliance)
      fontWeight: '600',
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
    },
  },

  // Decorative Numbers - Large background numbers
  decorative: {
    large: {
      fontSize: '120px',
      fontWeight: '900',
      lineHeight: '1',
      opacity: '0.05',
    },
    medium: {
      fontSize: '64px',
      fontWeight: '700',
      lineHeight: '1',
      opacity: '0.1',
    },
    small: {
      fontSize: '56px',
      fontWeight: '700',
      lineHeight: '1',
      opacity: '0.15',
    },
  },

  // Narrative - Scrollytelling component typography
  narrative: {
    tagline: {
      fontSize: '18px',
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: '0.01em',
      fontFamily: fonts.primary,
      fontStyle: 'normal' as const,
      textTransform: 'uppercase' as const,
    },
    foundationStatement: {
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '1.6',
      letterSpacing: '0.02em',
      fontFamily: fonts.secondary,
      fontStyle: 'normal' as const,
      opacity: '0.6',
    },
  },
} as const;

// ==========================================
// DESIGN REFERENCE DATA
// (Must come AFTER typography since it references it)
// ==========================================

export const designReference = {
  // Philosophy principles
  philosophy: {
    vision: "Where precision meets compassion",
    principles: [
      { title: "Intentional Simplicity", desc: "Every pixel serves recovery" },
      { title: "Systematic Beauty", desc: "Governed by tokens, elevated by craft" },
      { title: "Emotional Resonance", desc: "Science doesn't mean sterile" },
      { title: "Infinite Scalability", desc: "From button to platform" }
    ]
  },

  // Color system showcase data
  colorFamilies: [
    {
      name: "Primary Purple",
      family: "Brand Core",
      tokens: [
        { name: "Dark", value: colors.brand.purple.dark, usage: "Primary actions, headers" },
        { name: "Mid", value: colors.brand.purple.mid, usage: "Interactive states, links" },
        { name: "Light", value: colors.brand.purple.light, usage: "Highlights, accents" }
      ]
    },
    {
      name: "Cyan Accent",
      family: "Energy",
      tokens: [
        { name: "Primary", value: colors.accent.cyan.primary, usage: "Success, growth, activation" },
        { name: "Light", value: colors.accent.cyan.light, usage: "Subtle highlights" },
        { name: "Dark", value: colors.accent.cyan.dark, usage: "Deep emphasis" }
      ]
    },
    {
      name: "Traffic Light - Green",
      family: "Status System",
      tokens: [
        { name: "Bright", value: colors.status.green.bright, usage: "Optimal state" },
        { name: "Mid", value: colors.status.green.mid, usage: "Good progress" },
        { name: "Dark", value: colors.status.green.dark, usage: "Stable baseline" }
      ]
    },
    {
      name: "Traffic Light - Amber",
      family: "Status System",
      tokens: [
        { name: "Bright", value: colors.status.amber.bright, usage: "Attention needed" },
        { name: "Mid", value: colors.status.amber.mid, usage: "Caution state" },
        { name: "Dark", value: colors.status.amber.dark, usage: "Warning emphasis" }
      ]
    },
    {
      name: "Traffic Light - Red",
      family: "Status System",
      tokens: [
        { name: "Bright", value: colors.status.red.bright, usage: "Critical alert" },
        { name: "Mid", value: colors.status.red.mid, usage: "Error state" },
        { name: "Dark", value: colors.status.red.dark, usage: "Severe warning" }
      ]
    },
    {
      name: "Neutrals",
      family: "Foundation",
      tokens: [
        { name: "White", value: colors.neutral.white, usage: "Text on dark" },
        { name: "Black", value: colors.neutral.black, usage: "Backgrounds, depth" },
        { name: "Gray 800", value: colors.neutral.gray[800], usage: "Subtle text" },
        { name: "Gray 600", value: colors.neutral.gray[600], usage: "Secondary text" },
        { name: "Gray 400", value: colors.neutral.gray[400], usage: "Tertiary text" }
      ]
    }
  ],

  // Typography scale showcase data
  typeScale: [
    { name: "Display Hero", fontSize: typography.display.hero.fontSize, fontWeight: typography.display.hero.fontWeight, letterSpacing: typography.display.hero.letterSpacing, usage: "Landing hero statements" },
    { name: "Display Large", fontSize: typography.display.large.fontSize, fontWeight: typography.display.large.fontWeight, usage: "Hero statements" },
    { name: "H1", fontSize: typography.heading.h1.fontSize, fontWeight: typography.heading.h1.fontWeight, usage: "Page titles" },
    { name: "H2", fontSize: typography.heading.h2.fontSize, fontWeight: typography.heading.h2.fontWeight, usage: "Section headers" },
    { name: "H3", fontSize: typography.heading.h3.fontSize, fontWeight: typography.heading.h3.fontWeight, usage: "Card titles" },
    { name: "Body Large", fontSize: typography.body.large.fontSize, lineHeight: typography.body.large.lineHeight, usage: "Primary text" },
    { name: "Body Regular", fontSize: typography.body.regular.fontSize, lineHeight: typography.body.regular.lineHeight, usage: "Standard text" },
    { name: "Body Small", fontSize: typography.body.small.fontSize, lineHeight: typography.body.small.lineHeight, usage: "Metadata, labels" },
    { name: "Label Medium", fontSize: typography.label.medium.fontSize, fontWeight: typography.label.medium.fontWeight, usage: "Tags, eyebrows" },
    { name: "Code", fontSize: typography.code.regular.fontSize, fontFamily: typography.code.regular.fontFamily, usage: "Technical specs" }
  ],

  // Visual styles showcase
  visualStyles: (supabaseUrl: string) => [
    {
      name: "neuralflower",
      essence: "Transformation & Growth",
      asset: `${supabaseUrl}/recoverlution-assets/neuralflower/5:4/avif/neuralflower_abstract_plasticity_light.avif`,
      usage: "Recovery journeys, personal growth"
    },
    {
      name: "flowstate",
      essence: "Flow & Momentum",
      asset: `${supabaseUrl}/recoverlution-assets/flowstate/5:4/avif/flowstate_abstract_bloom_dark.avif`,
      usage: "Progress tracking, state visualization"
    },
    {
      name: "abstract",
      essence: "System Complexity",
      asset: `${supabaseUrl}/recoverlution-assets/neuralflower/5:4/avif/neuralflower_abstract_transformation_dark.avif`,
      usage: "Technical features, architecture"
    }
  ]
} as const;

// ==========================================
// BORDERS
// ==========================================

export const border = {
  width: {
    hairline: '1px',
    thin: '1.5px',
    default: '2px',
    thick: '3px',
    bold: '4px',
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },
} as const;

// ==========================================
// SHADOWS & GLOWS
// ==========================================

export const shadows = {
  // All shadows removed - clean, flat design
} as const;

// ==========================================
// CONTAINERS & LAYOUT
// ==========================================

export const containers = {
  // Cinematic Card System
  cinematic: {
    maxWidth: '1200px',
    aspectRatio: {
      desktop: '4 / 5',  // Taller cards for desktop (NEW: was 5/4)
      mobile: '3 / 4',   // Portrait cards for mobile
      legacy: '5 / 4',   // Old aspect ratio (kept for backwards compatibility)
    },
  },
  // Content width constraints
  content: {
    maxWidth: {
      narrow: '600px',
      standard: '800px',
      wide: '1000px',
      full: '1200px',
    },
  },
} as const;

// ==========================================
// ICON & NODE SIZES
// ==========================================

export const iconSizes = {
  // Standard UI icons
  ui: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
    xl: '40px',
  },
  // Node/badge containers (like in TheLoop)
  node: {
    mobile: {
      container: '48px',
      icon: '24px',
    },
    desktop: {
      container: '72px',
      icon: '36px',
    },
  },
  // Hero/feature icons
  hero: {
    mobile: {
      container: '64px',
      icon: '32px',
    },
    desktop: {
      container: '96px',
      icon: '48px',
    },
  },
} as const;

// ==========================================
// HERO SECTION SYSTEM
// ==========================================

/**
 * HERO TOKENS
 * Complete token system for hero sections
 * Covers typography, layout, animation, effects, and interactions
 * 
 * IMPROVEMENTS (Mobile-First Review):
 * ✅ Responsive typography with mobile/desktop breakpoints
 * ✅ Safe area handling for scroll indicator
 * ✅ Optimized animation timing for mobile
 * ✅ Background positioning for different viewports
 * ✅ Content width constraints for better readability
 */
export const hero = {
  // Canvas configuration
  canvas: {
    width: 1920,
    height: 1080,
    // Mobile: smaller canvas for performance
    mobile: {
      width: 1024,
      height: 768,
    },
  },

  // Background layers
  background: {
    // Asset layer
    asset: {
      opacity: {
        desktop: 0.65, // Apple-grade: Let the asset breathe and be the hero
        mobile: 0.55, // Stronger presence on mobile too
      },
      scale: {
        base: 1,
        scrollMultiplier: {
          desktop: 0.00015,
          mobile: 0.0001, // Less dramatic on mobile for performance
        },
      },
      blur: {
        enabled: false,
        value: '0px',
      },
      position: {
        desktop: 'center',
        mobile: 'center 40%', // Shift focus higher on mobile (less sky, more subject)
      },
    },
    // Gradient overlay
    gradient: {
      // Radial gradient (center glow)
      radial: {
        position: {
          desktop: 'ellipse at center',
          mobile: 'ellipse at center top', // Pull glow up on mobile
        },
        colorStop1: (color: string) => `${color}12`, // Apple-grade: 12% opacity for subtle glow
        colorStop2: 'transparent',
        colorStop2Position: '50%', // Apple-grade: Tighter glow, more asset visible
      },
      // Linear gradient (top to bottom darkening)
      linear: {
        direction: 'to bottom',
        colorStop1: {
          desktop: 'rgba(17,23,30,0.2)', // Apple-grade: Subtle vignette using new foundation
          mobile: 'rgba(17,23,30,0.3)', // Slightly darker at top on mobile
        },
        colorStop2: 'rgba(17,23,30,0.85)', // Apple-grade: Let asset show through more at top
      },
    },
  },

  // Typography system
  typography: {
    // Eyebrow (pre-headline text)
    eyebrow: {
      // Mobile-first: 12px min (better for small screens), scale to 18px on desktop
      fontSize: 'clamp(12px, 3.5vw, 18px)',
      fontWeight: '600',
      letterSpacing: {
        mobile: '0.02em', // Slightly more open on mobile
        desktop: '-0.01em',
      },
      opacity: 0.5,
      marginBottom: 'clamp(12px, 2.5vw, 20px)', // Tighter spacing
      textTransform: 'lowercase' as const, // Apple-style lowercase eyebrow
    },
    // Main headline
    headline: {
      // IMPROVED: Better mobile scaling for maximum impact
      // Mobile (375px): 11vw = 41.25px → caps at 48px ✅ (33% BIGGER)
      // Tablet (768px): 11vw = 84px ✅ (was 73px)
      // Desktop (1440px): 11vw = 158px → caps at 96px ✅
      fontSize: 'clamp(48px, 11vw, 96px)', // Increased from 36px min for mobile shine
      fontWeight: '600',
      letterSpacing: {
        mobile: '-0.02em', // Tighter on mobile
        desktop: '-0.03em', // Even tighter on desktop (Apple style)
      },
      lineHeight: {
        mobile: '1.1', // Slightly more breathing room on mobile
        desktop: '1.05',
      },
      marginBottom: 'clamp(20px, 4vw, 32px)',
    },
    // Subheadline
    subheadline: {
      // IMPROVED: Better readability on mobile (16px → 20px instead of 14px → 22px)
      fontSize: 'clamp(16px, 3vw, 20px)',
      lineHeight: {
        mobile: '1.5', // Tighter on mobile for space
        desktop: '1.6',
      },
      opacity: 0.6, // More muted than headline for hierarchy
      letterSpacing: '0.01em',
      maxWidth: {
        mobile: '100%', // Full width on mobile
        tablet: '540px',
        desktop: '620px', // Narrower for better readability
      },
      color: 'rgba(236, 239, 229, 0.75)', // Warm muted gray, distinct from headline
    },
  },

  // Animation system
  animation: {
    // Mount delays
    delays: {
      eyebrow: 0.2,
      headlineStart: {
        desktop: 0.8,
        mobile: 0.4, // Faster on mobile (get to content quicker)
      },
      headlineSecondLine: {
        desktop: 1.2, // Delay before "Rewired." starts
        mobile: 0.8, // Faster on mobile
      },
      subheadline: {
        desktop: 1.8,
        mobile: 1.2, // Faster on mobile
      },
    },
    // Durations
    durations: {
      eyebrow: {
        desktop: 1.2,
        mobile: 0.8, // Snappier on mobile
      },
      characterReveal: {
        desktop: 0.4,
        mobile: 0.3, // Faster character reveals on mobile
      },
      subheadline: {
        desktop: 1.4,
        mobile: 1.0,
      },
      scrollIndicator: 2,
    },
    // Character-by-character reveal
    characterReveal: {
      staggerIncrement: {
        desktop: 0.04, // 40ms between characters
        mobile: 0.02, // 20ms between characters (2x faster)
      },
      yOffset: {
        desktop: 20,
        mobile: 12, // Less movement on mobile
      },
      // Option to disable on low-power mode
      enableOnMobile: true, // Can be toggled via performance profile
    },
  },

  // Scroll indicator
  scrollIndicator: {
    position: {
      // IMPROVED: Safe area handling for iPhone notch/home indicator
      bottom: 'clamp(32px, 8vh, 56px)', // More responsive to viewport height
    },
    line: {
      width: '1px',
      height: 'clamp(20px, 4vh, 32px)', // Responsive to viewport height
      opacity: 0.4,
      margin: '0 auto 8px',
    },
    icon: {
      size: {
        mobile: 18,
        desktop: 20,
      },
      opacity: 0.8,
    },
    animation: {
      scaleY: [1, 1.2, 1],
      translateY: {
        desktop: [0, -8, 0],
        mobile: [0, -6, 0], // Less dramatic on mobile
      },
      duration: 2,
    },
    scroll: {
      fadeMultiplier: {
        desktop: 0.005,
        mobile: 0.008, // Fade out faster on mobile (less scroll distance)
      },
    },
  },

  // Layout
  layout: {
    section: {
      minHeight: {
        mobile: '100dvh', // Dynamic viewport height (handles mobile browsers)
        desktop: '100vh',
      },
      padding: {
        mobile: '80px 20px 40px', // Top accounts for nav
        desktop: '0 40px',
      },
    },
    content: {
      maxWidth: {
        mobile: '100%',
        tablet: '720px',
        desktop: '920px', // Narrower than 5xl for better readability
      },
      padding: {
        mobile: '0 16px',
        desktop: '0 24px',
      },
    },
  },

  // Particle system
  particles: {
    count: {
      mobile: 20, // Fewer particles on mobile
      desktop: 40,
    },
    opacity: {
      mobile: 0.3,
      desktop: 0.4,
    },
  },
} as const;

// ==========================================
// NAVICUE MAGIC SIGNATURE AESTHETICS
// ==========================================

/**
 * Replace the alpha channel in an HSLA color string.
 * Converts hex-alpha intent to valid HSLA: withAlpha('hsla(30, 50%, 50%, 1)', 0.13)
 * → 'hsla(30, 50%, 50%, 0.13)'
 *
 * Common hex-alpha → decimal conversions used in NaviCue files:
 *   08 → 0.03   0a → 0.04   11 → 0.07   15 → 0.08   22 → 0.13
 *   33 → 0.20   44 → 0.27   50 → 0.31   60 → 0.38   cc → 0.80   ee → 0.93
 */
export function withAlpha(hsla: string, alpha: number): string {
  return hsla.replace(/[\d.]+\)$/, `${alpha})`);
}

/**
 * Complete aesthetic system for 8 magic signatures
 * Each signature has unique colors, motion, and interaction feel
 */
export const magicSignatures = {
  sacred_ordinary: {
    name: 'Sacred Ordinary',
    colors: {
      primary: 'hsla(35, 60%, 60%, 1)', // warm honey
      secondary: 'hsla(45, 55%, 65%, 1)', // soft gold
      accent: 'hsla(25, 50%, 70%, 1)', // gentle peach
      glow: 'hsla(35, 60%, 60%, 0.3)',
    },
    motion: {
      entry: { duration: 800, ease: [0.22, 1, 0.36, 1] },
      dwell: 'near_still',
      exit: { duration: 600, ease: [0.22, 1, 0.36, 1] },
    },
    visual: {
      contrast: 'low',
      accentIntensity: 0.35,
      composition: 'centered_generous_whitespace',
    },
  },
  
  witness_ritual: {
    name: 'Witness / Ritual',
    colors: {
      primary: 'hsla(30, 25%, 50%, 1)', // warm stone
      secondary: 'hsla(25, 30%, 55%, 1)', // soft clay
      accent: 'hsla(35, 35%, 60%, 1)', // desert sand
      glow: 'hsla(30, 25%, 50%, 0.35)',
    },
    motion: {
      entry: { duration: 1000, ease: [0.22, 1, 0.36, 1] },
      dwell: 'stable_hold',
      exit: { duration: 700, ease: [0.22, 1, 0.36, 1] },
    },
    visual: {
      contrast: 'mid',
      accentIntensity: 0.4,
      composition: 'centered_symmetric',
    },
  },
  
  poetic_precision: {
    name: 'Poetic Precision',
    colors: {
      primary: 'hsla(210, 15%, 55%, 1)', // cool steel
      secondary: 'hsla(215, 12%, 60%, 1)', // soft silver
      accent: 'hsla(220, 10%, 65%, 1)', // lunar gray
      glow: 'hsla(210, 15%, 55%, 0.25)',
    },
    motion: {
      entry: { duration: 400, ease: [0.4, 0.0, 1, 1] },
      dwell: 'still',
      exit: { duration: 300, ease: [0.4, 0.0, 0.2, 1] },
    },
    visual: {
      contrast: 'mid_high',
      accentIntensity: 0.3,
      composition: 'high_hierarchy_negative_space',
    },
  },
  
  science_x_soul: {
    name: 'Science × Soul',
    colors: {
      primary: 'hsla(165, 40%, 55%, 1)', // cool jade
      secondary: 'hsla(175, 45%, 60%, 1)', // soft teal
      accent: 'hsla(185, 35%, 65%, 1)', // mineral blue
      glow: 'hsla(165, 40%, 55%, 0.35)',
    },
    motion: {
      entry: { duration: 600, ease: [0.22, 1, 0.36, 1] },
      dwell: 'steady',
      exit: { duration: 500, ease: [0.22, 1, 0.36, 1] },
    },
    visual: {
      contrast: 'mid',
      accentIntensity: 0.45,
      composition: 'structured_grid_organic_motion',
    },
  },
  
  koan_paradox: {
    name: 'Koan / Paradox',
    colors: {
      primary: 'hsla(20, 50%, 50%, 1)', // burnt sienna
      secondary: 'hsla(15, 55%, 55%, 1)', // terra cotta
      accent: 'hsla(25, 60%, 52%, 1)', // copper
      glow: 'hsla(20, 50%, 50%, 0.4)',
    },
    motion: {
      entry: { duration: 900, ease: [0.22, 1, 0.36, 1] },
      dwell: 'phase_shift',
      exit: { duration: 700, ease: [0.22, 1, 0.36, 1] },
    },
    visual: {
      contrast: 'mid',
      accentIntensity: 0.5,
      composition: 'unexpected_asymmetry',
    },
  },
  
  pattern_glitch: {
    name: 'Pattern Glitch',
    colors: {
      primary: 'hsla(250, 50%, 58%, 1)', // electric indigo
      secondary: 'hsla(255, 45%, 60%, 1)', // charged violet
      accent: 'hsla(245, 55%, 62%, 1)', // neon blue
      glow: 'hsla(250, 50%, 58%, 0.45)',
    },
    motion: {
      entry: { duration: 300, ease: [0.4, 0.0, 1, 1] },
      dwell: 'normalize_fast',
      exit: { duration: 400, ease: [0.22, 1, 0.36, 1] },
    },
    visual: {
      contrast: 'mid',
      accentIntensity: 0.55,
      composition: 'controlled_visual_interrupt',
    },
  },
  
  sensory_cinema: {
    name: 'Sensory Cinema',
    colors: {
      primary: 'hsla(200, 35%, 45%, 1)', // deep ocean
      secondary: 'hsla(210, 40%, 50%, 1)', // midnight blue
      accent: 'hsla(220, 30%, 55%, 1)', // soft slate
      glow: 'hsla(200, 35%, 45%, 0.4)',
    },
    motion: {
      entry: { duration: 1200, ease: [0.22, 1, 0.36, 1] },
      dwell: 'somatic_wave',
      exit: { duration: 800, ease: [0.22, 1, 0.36, 1] },
    },
    visual: {
      contrast: 'low_mid',
      accentIntensity: 0.42,
      composition: 'immersive_body_centric',
    },
  },
  
  relational_ghost: {
    name: 'Relational Ghost',
    colors: {
      primary: 'hsla(345, 40%, 65%, 1)', // soft rose
      secondary: 'hsla(350, 35%, 70%, 1)', // blush pink
      accent: 'hsla(340, 30%, 68%, 1)', // warm mauve
      glow: 'hsla(345, 40%, 65%, 0.32)',
    },
    motion: {
      entry: { duration: 700, ease: [0.22, 1, 0.36, 1] },
      dwell: 'steady_presence',
      exit: { duration: 600, ease: [0.22, 1, 0.36, 1] },
    },
    visual: {
      contrast: 'low_mid',
      accentIntensity: 0.38,
      composition: 'companion_presence_gentle_boundary',
    },
  },
} as const;

// ==========================================
// NAVICUE CONTEMPLATIVE TYPOGRAPHY
// ==========================================

/**
 * @deprecated — Use `navicueType` from `navicue-blueprint.ts` instead.
 *
 * This legacy typography system is consumed by ~8 older specimen files.
 * New specimens MUST use the `navicueType` scale (micro -> hero) which
 * enforces the 10px floor and provides 15 purpose-named tokens.
 *
 * Mapping guide for migration:
 *   contemplative.primary   -> navicueType.prompt (22-28px)
 *   contemplative.secondary -> navicueType.narrative (16-19px)
 *   contemplative.whisper   -> navicueType.afterglow (13-15px)
 *   ui.button               -> navicueInteraction.button (use navicueButtonStyle())
 *   ui.label                -> navicueType.micro + textTransform uppercase
 *   ui.caption              -> navicueType.caption (12-14px)
 *   eyebrow                 -> navicueType.micro (10-12px)
 *
 * Tracked for removal in: DESIGN_SYSTEM_CLEANUP
 */
export const navicueTypography = {
  // Contemplative prompts - main question/koan
  contemplative: {
    primary: {
      fontSize: 'clamp(24px, 4vw, 32px)',
      fontFamily: fonts.secondary, // Crimson Pro
      fontStyle: 'italic' as const,
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0.01em',
      color: colors.neutral.white,
      opacity: 0.95,
    },
    secondary: {
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      fontFamily: fonts.secondary, // Crimson Pro
      fontStyle: 'italic' as const,
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0.01em',
      color: colors.neutral.gray[400],
      opacity: 0.85,
    },
    whisper: {
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontFamily: fonts.secondary, // Crimson Pro
      fontStyle: 'italic' as const,
      fontWeight: '300',
      lineHeight: '1.7',
      letterSpacing: '0.02em',
      color: colors.neutral.gray[500],
      opacity: 0.7,
    },
  },
  
  // UI elements - buttons, labels, CTAs
  ui: {
    button: {
      fontSize: '16px',
      fontFamily: fonts.primary, // Inter
      fontWeight: '500',
      letterSpacing: '0.01em',
    },
    label: {
      fontSize: '13px',
      fontFamily: fonts.primary, // Inter
      fontWeight: '600',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: '12px',
      fontFamily: fonts.primary, // Inter
      fontWeight: '400',
      letterSpacing: '0.02em',
    },
  },
  
  // Eyebrow/context text
  eyebrow: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontFamily: fonts.primary, // Inter
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    opacity: 0.6,
  },
} as const;

// ==========================================
// BRIDGE SYSTEM (NARRATIVE TRANSITIONS)
// ==========================================

/**
 * BRIDGE TOKENS
 * Complete design system for narrative bridge sections
 * Transitions between major content sections with visual sophistication
 * 100% token-driven, zero hardcoded values
 */
export const bridge = {
  // Layout & Sizing
  layout: {
    minHeight: {
      mobile: 'clamp(280px, 40vh, 400px)',
      desktop: 'clamp(400px, 60vh, 600px)',
    },
    padding: {
      mobile: 'clamp(40px, 8vw, 60px) clamp(20px, 5vw, 24px)',
      desktop: '80px clamp(20px, 5vw, 48px) 40px clamp(20px, 5vw, 48px)', // Apple: 80px top, 40px bottom (kiss point)
    },
    contentMaxWidth: '1024px', // 4xl for better readability
  },

  // Background & Surfaces
  background: {
    base: '#08060D', // Deep purple-black foundation
    elevated: 'rgba(17, 23, 30, 1)', // Slightly elevated surface
    
    // Asset overlay (parallax backgrounds)
    asset: {
      opacity: 0.15,
      blur: '8px',
      scale: {
        base: 1.1,
        scrollMultiplier: 0.1,
      },
    },
  },

  // Gradient Overlays
  gradient: {
    // Radial gradient (theme-specific glow)
    radial: {
      position: 'ellipse at center',
      colorStop1Opacity: '06', // Very subtle glow
      colorStop1Position: '0%',
      colorStop2: 'transparent',
      colorStop2Position: '60%',
    },
    // Linear gradient (depth + vignette)
    linear: {
      direction: '180deg',
      colorStop1: 'rgba(17, 23, 30, 0.4)',
      colorStop1Position: '0%',
      colorStop2: 'rgba(17, 23, 30, 0.95)',
      colorStop2Position: '100%',
    },
  },

  // Divider Lines (top & bottom) - Apple: Subtle gradient bars, not full dividers
  divider: {
    width: {
      collapsed: '0px',
      expanded: 'clamp(120px, 20vw, 200px)', // Wider, more Apple-like
    },
    height: '1px',
    opacity: 0.3, // More subtle
    blur: '30px', // Softer glow
    blurOpacity: '20', // Reduced glow intensity
  },

  // Typography
  typography: {
    eyebrow: {
      fontSize: {
        mobile: 'clamp(11px, 2.5vw, 13px)', // Mobile: Bigger for readability
        desktop: 'clamp(12px, 2vw, 14px)', // Desktop: Slightly larger
      },
      letterSpacing: '0.25em',
      textTransform: 'uppercase' as const,
      fontWeight: '600',
      opacity: 0.6,
      marginBottom: 'clamp(16px, 4vw, 32px)',
    },
    headline: {
      fontSize: {
        mobile: 'clamp(44px, 10vw, 56px)', // Mobile: 44-56px (bigger min for impact)
        desktop: 'clamp(56px, 7vw, 72px)', // Desktop: 56-72px (3/4 of Hero's 96px)
      },
      lineHeight: '1.15',
      fontWeight: {
        mobile: '500', // Slightly heavier on mobile for legibility
        desktop: '400', // Lighter on desktop for elegance
      },
      letterSpacing: '-0.025em',
      marginBottom: 'clamp(24px, 5vw, 40px)',
      color: (neutralWhite: string) => neutralWhite,
    },
    subtext: {
      fontSize: {
        mobile: 'clamp(17px, 4vw, 20px)', // Mobile: 17-20px (better readability)
        desktop: 'clamp(19px, 3vw, 22px)', // Desktop: 19-22px (slightly larger)
      },
      lineHeight: '1.6',
      fontWeight: '300',
      maxWidth: '700px',
      opacity: 0.5,
      color: (neutralGray: string) => neutralGray,
    },
  },

  // Scroll Indicator - Apple: Remove from Bridge (Hero has it, Card has thread)
  scrollIndicator: {
    enabled: false, // Don't show scroll indicator on Bridge
    position: {
      bottom: 'clamp(24px, 6vw, 48px)',
    },
    line: {
      width: '1px',
      height: 'clamp(24px, 5vw, 40px)',
      opacity: 0.4,
      marginBottom: '8px',
    },
    icon: {
      size: 20,
      opacity: 0.8,
    },
    opacity: 0.6,
  },

  // Animation & Timing
  animation: {
    durations: {
      entrance: '0.8s',
      divider: {
        default: '1.2s',
        extended: '1.4s',
      },
      scrollIndicator: '1.0s',
    },
    delays: {
      eyebrow: '0.1s',
      headline: '0.2s',
      subtext: '0.4s',
      divider: '0.6s',
      scrollIndicator: '0.8s',
    },
    easing: {
      entrance: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth entrance
      divider: 'cubic-bezier(0.65, 0, 0.35, 1)', // Apple-grade elastic
    },
  },

  // Theme Variants (color families following design rules)
  themes: {
    purple: {
      glow: (purpleLight: string) => purpleLight,
      accent: (purpleMid: string) => purpleMid,
      assetType: 'neuralflower' as const,
      assetMood: 'wisdom' as const,
      assetVariant: 'dark' as const,
    },
    green: {
      glow: (greenBright: string) => greenBright,
      accent: (greenMid: string) => greenMid,
      assetType: 'flowstate' as const,
      assetMood: 'calm+shift' as const,
      assetVariant: 'light' as const,
    },
    amber: {
      glow: (amberBright: string) => amberBright,
      accent: (amberMid: string) => amberMid,
      assetType: 'evolvingforms' as const,
      assetMood: 'transition' as const,
      assetVariant: 'dark' as const,
    },
    cyan: {
      glow: (cyanPrimary: string) => cyanPrimary,
      accent: (cyanLight: string) => cyanLight,
      assetType: 'neuralflow' as const,
      assetMood: 'transfer' as const,
      assetVariant: 'light' as const,
    },
    neutral: {
      glow: (neutralGray: string) => neutralGray,
      accent: (neutralGray: string) => neutralGray,
      assetType: null,
      assetMood: null,
      assetVariant: null,
    },
  },
} as const;

// ==========================================
// SCROLLYTELLING CARD SYSTEM
// ==========================================

/**
 * SCROLLYTELLING CARD TOKENS
 * Complete design system for TheGapScrollytelling component
 * Features Apple-grade frosted glass panel for text legibility
 */
export const scrollytellingCard = {
  // Layout & Container
  layout: {
    section: {
      padding: {
        mobile: '60px 16px',
        desktop: '80px 24px',
      },
    },
    container: {
      width: {
        mobile: '100%',
        desktop: '90%',
      },
      maxWidth: '1200px',
      aspectRatio: {
        mobile: '3 / 4',
        desktop: '5 / 4',
      },
    },
    card: {
      borderRadius: 'clamp(16px, 3vw, 24px)',
      borderWidth: border.width.hairline,
      borderOpacity: '20', // Hex opacity for theme color
      backgroundColor: 'rgba(17, 23, 30, 0.95)', // Dark foundation
      padding: {
        mobile: '32px 20px',
        desktop: 'clamp(24px, 6vw, 48px)',
      },
    },
    navigation: {
      bottom: {
        mobile: '32px',
        desktop: '64px',
      },
      width: {
        mobile: '95%',
        desktop: '80%',
      },
      maxWidth: {
        mobile: '100%',
        desktop: '600px',
      },
      gap: {
        mobile: '4px',
        desktop: '0',
      },
      spacer: {
        mobile: '50px',
        desktop: '80px',
      },
    },
  },

  // Content Box (Premium Glass Morphism)
  contentBox: {
    background: 'rgba(17, 23, 30, 0.12)', // Ultra-subtle dark tint
    backdropFilter: 'blur(10px) saturate(1.2)',
    WebkitBackdropFilter: 'blur(10px) saturate(1.2)',
    border: '1px solid rgba(255, 255, 255, 0.06)', // Subtle edge
    borderRadius: {
      mobile: '16px',
      desktop: '24px',
    },
    padding: {
      mobile: '32px 20px',
      desktop: '48px 40px',
    },
    maxWidth: '900px',
  },

  // Typography - Scene Content
  content: {
    eyebrow: {
      fontSize: {
        mobile: 'clamp(9px, 2.2vw, 11px)',
        desktop: 'clamp(10px, 2vw, 11px)',
      },
      letterSpacing: {
        mobile: '0.15em',
        desktop: '0.2em',
      },
      marginBottom: {
        mobile: 'clamp(10px, 2.5vw, 16px)',
        desktop: 'clamp(12px, 3vw, 24px)',
      },
    },
    title: {
      minHeight: {
        mobile: '105px', // 2 lines * lineHeight
        desktop: '115px',
      },
      fontSize: {
        mobile: {
          prominent: 'clamp(40px, 10vw, 56px)', // "the Gap"
          large: 'clamp(36px, 9vw, 52px)', // Standard scenes
          medium: 'clamp(32px, 8vw, 48px)', // Long titles
        },
        desktop: {
          prominent: 'clamp(48px, 8vw, 64px)', // "the Gap"
          large: 'clamp(44px, 7.5vw, 56px)', // Standard scenes
          medium: 'clamp(40px, 7vw, 52px)', // Long titles
        },
      },
      lineHeight: {
        mobile: '1.15',
        desktop: '1.1',
      },
      marginBottom: {
        mobile: 'clamp(14px, 3.5vw, 24px)',
        desktop: 'clamp(16px, 4vw, 32px)',
      },
    },
    spine: {
      fontSize: {
        mobile: 'clamp(36px, 10vw, 52px)',
        desktop: 'clamp(56px, 8vw, 72px)',
      },
      marginBottom: {
        mobile: '12px',
        desktop: '24px',
      },
    },
    tagline: {
      fontSize: {
        mobile: 'clamp(12px, 3.5vw, 16px)',
        desktop: 'clamp(18px, 2.5vw, 28px)',
      },
      marginBottom: {
        mobile: '12px',
        desktop: '32px',
      },
    },
    description: {
      fontSize: {
        mobile: 'clamp(11px, 3vw, 14px)',
        desktop: 'clamp(16px, 2vw, 20px)',
      },
      maxWidth: '600px',
      margin: {
        mobile: '0 auto 16px',
        desktop: '0 auto 40px',
      },
    },
    bullets: {
      gap: {
        mobile: '8px 12px',
        desktop: '32px',
      },
      marginBottom: {
        mobile: '12px',
        desktop: '64px',
      },
      dot: {
        width: {
          mobile: '3px',
          desktop: '6px',
        },
        height: {
          mobile: '3px',
          desktop: '6px',
        },
      },
      text: {
        fontSize: {
          mobile: 'clamp(9px, 2.5vw, 11px)',
          desktop: typography.body.small.fontSize,
        },
      },
    },
    foundation: {
      label: {
        fontSize: {
          mobile: 'clamp(9px, 2.2vw, 11px)',
          desktop: 'clamp(10px, 2vw, 11px)',
        },
        letterSpacing: {
          mobile: '0.15em',
          desktop: '0.2em',
        },
        marginBottom: {
          mobile: '6px',
          desktop: '12px',
        },
      },
      title: {
        fontSize: {
          mobile: 'clamp(18px, 5vw, 24px)',
          desktop: typography.heading.h4.fontSize,
        },
        marginBottom: {
          mobile: '6px',
          desktop: '12px',
        },
      },
      tagline: {
        fontSize: {
          mobile: 'clamp(10px, 2.5vw, 12px)',
          desktop: typography.ui.pill.fontSize,
        },
      },
      statement: {
        fontSize: {
          mobile: 'clamp(10px, 2.8vw, 12px)',
          desktop: typography.narrative.foundationStatement.fontSize,
        },
      },
    },
  },

  // Navigation Icons - Animated glyphs for each scene
  icons: {
    container: {
      height: {
        mobile: '24px',
        desktop: '40px',
      },
      width: {
        mobile: '30px',
        desktop: '50px',
      },
    },
    radar: {
      rings: [
        { size: { mobile: '8px', desktop: '12px' } },
        { size: { mobile: '14px', desktop: '22px' } },
        { size: { mobile: '20px', desktop: '32px' } },
      ],
      center: {
        size: { mobile: '4px', desktop: '6px' },
      },
      borderWidth: { mobile: '1.5px', desktop: '2px' },
      blur: { mobile: '6px', desktop: '10px' },
    },
    route: {
      central: {
        size: { mobile: '5px', desktop: '8px' },
        left: { mobile: '6px', desktop: '10px' },
      },
      path: {
        left: { mobile: '8px', desktop: '14px' },
        width: { mobile: '15px', desktop: '25px' },
        height: { mobile: '1.5px', desktop: '2px' },
      },
      endpoint: {
        size: { mobile: '3px', desktop: '5px' },
        left: { mobile: '22px', desktop: '38px' },
      },
      blur: { mobile: '5px', desktop: '8px' },
    },
    deliver: {
      shaft: {
        left: { mobile: '5px', desktop: '8px' },
        width: { mobile: '18px', desktop: '30px' },
        height: { mobile: '2px', desktop: '3px' },
      },
      arrowhead: {
        right: { mobile: '6px', desktop: '10px' },
        borderLeft: { mobile: '5px', desktop: '8px' },
        borderTop: { mobile: '4px', desktop: '6px' },
      },
      particle: {
        left: { mobile: '5px', desktop: '8px' },
        size: { mobile: '3px', desktop: '4px' },
      },
      blur: { mobile: '6px', desktop: '10px' },
    },
    seal: {
      arc: {
        size: { mobile: '8px', desktop: '12px' },
        borderWidth: { mobile: '2px', desktop: '3px' },
        translateX: {
          mobile: { left: '-6px', right: '6px' },
          desktop: { left: '-10px', right: '10px' },
        },
      },
      center: {
        size: { mobile: '4px', desktop: '6px' },
      },
      blur: { mobile: '6px', desktop: '10px' },
    },
    label: {
      fontSize: {
        mobile: 'clamp(9px, 2.5vw, 11px)',
        desktop: typography.ui.pill.fontSize,
      },
    },
    arrow: {
      size: { mobile: 16, desktop: 20 },
      bottom: { mobile: '-28px', desktop: '-20px' },
      blur: '8px',
    },
    loop: {
      size: { mobile: '20px', desktop: '28px' },
      bottom: { mobile: '-30px', desktop: '-24px' },
      blur: '8px',
    },
  },

  // Gradient Overlay - Bottom glow
  gradient: {
    radial: {
      position: 'center bottom',
      colorStop1Opacity: '15', // Hex opacity for theme glow
      colorStop2: 'transparent',
      colorStop2Position: '70%',
    },
  },

  // Calculator Grid Navigation - Apple-style suite selector
  calculatorGrid: {
    container: {
      padding: {
        mobile: '24px 16px 32px',
        desktop: '32px 40px 40px',
      },
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(17, 23, 30, 0.4)',
      backdropFilter: 'blur(10px)',
    },
    grid: {
      columns: {
        mobile: 5, // 5x2 grid
        desktop: 5,
      },
      gap: {
        mobile: '8px',
        desktop: '12px',
      },
      maxWidth: '900px', // Matches content box
    },
    button: {
      aspectRatio: '1 / 1', // Square buttons
      borderRadius: {
        mobile: '12px', // Snapped to radius.md — no off-scale values
        desktop: '12px',
      },
      background: {
        default: 'rgba(236, 239, 229, 0.04)',
        hover: 'rgba(236, 239, 229, 0.08)',
        active: 'rgba(236, 239, 229, 0.12)',
      },
      border: {
        default: '1px solid rgba(255, 255, 255, 0.08)',
        active: '1.5px solid', // Color appended dynamically
      },
      transition: 'all 0.2s ease-out',
      icon: {
        size: {
          mobile: 18,
          desktop: 22,
        },
        opacity: {
          default: 0.6,
          hover: 0.8,
          active: 1,
        },
      },
      label: {
        fontSize: {
          mobile: '8px',
          desktop: '9px',
        },
        letterSpacing: '0.05em',
        fontWeight: '600',
        marginTop: {
          mobile: '4px',
          desktop: '6px',
        },
        opacity: {
          default: 0.5,
          hover: 0.7,
          active: 1,
        },
      },
    },
  },

  // Crystal Glass Panel - Ultra-transparent Apple aesthetic
  frostedPanel: {
    backdropFilter: 'blur(60px) saturate(180%)', // 🔮 Heavy blur + saturation boost
    WebkitBackdropFilter: 'blur(60px) saturate(180%)', // Safari support
    background: 'rgba(255, 255, 255, 0.08)', // 🔮 LIGHT white tint - see-through!
    border: '1px solid rgba(255, 255, 255, 0.2)', // Bright edge definition
    borderRadius: {
      mobile: '20px',
      desktop: '24px', // Slightly larger on desktop
    },
    padding: {
      mobile: 'clamp(28px, 7vw, 40px) clamp(20px, 5vw, 28px)',
      desktop: 'clamp(40px, 8vw, 56px) clamp(32px, 6vw, 48px)',
    },
    // Panel dimensions
    maxWidth: {
      mobile: '90%',
      desktop: '900px', // Contain text nicely
    },
    // Inner glow for crystal shimmer effect
    innerGlow: {
      background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.15), transparent 70%)',
    },
    // Hover state (optional enhancement)
    hover: {
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.12)',
    },
  },

  // Asset Background Settings
  asset: {
    opacity: 0.4, // Keep assets bright
    blur: '0px', // Sharp assets
    transition: 'opacity 1s ease-in-out',
  },

  // Button - Standard rectangular CTA with frosted glass
  button: {
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    background: surfaces.glass.strong, // Consistent with design system
    borderRadius: '8px', // Standard button (radius.sm) - matches all nav buttons
    padding: {
      mobile: '8px 16px', // spacing.xs spacing.sm
      desktop: '16px 20px', // spacing.sm 20px
    },
    borderWidth: border.width.hairline,
    // Border uses scene theme color at low opacity (applied inline with borderOpacity)
    borderOpacity: '15', // Hex opacity value
    hover: {
      background: 'rgba(236, 239, 229, 0.12)', // Slightly brighter neutral
      borderOpacity: '25',
    },
  },

  // Tag Button - Ultra-clean Apple-style tag (e.g. "survive", "belong", "avoid pain")
  // Clean, borderless, elegant recognition without distraction
  tagButton: {
    padding: {
      mobile: '6px 12px',
      desktop: '8px 16px',
    },
    borderRadius: {
      mobile: '8px',  // Snapped to radius.sm — no off-scale values
      desktop: '8px',
    },
    background: {
      default: 'rgba(255, 255, 255, 0.05)', // Ultra-subtle neutral tint
      hover: 'rgba(255, 255, 255, 0.08)', // Slightly brighter on hover
    },
    typography: {
      fontSize: {
        mobile: 'clamp(11px, 3vw, 13px)',
        desktop: 'clamp(13px, 1.5vw, 15px)',
      },
      fontWeight: '500',
      letterSpacing: '0.01em',
      lineHeight: '1.4',
    },
    transition: 'all 0.2s ease',
    opacity: {
      default: 0.85,
      hover: 1,
    },
  },
} as const;

// ==========================================
// NAVIGATION SYSTEM
// ==========================================

/**
 * NAVIGATION TOKENS
 * Complete design system for fixed navigation bar
 * Nothing hardcoded - all values governed by tokens
 */
export const navigation = {
  // Container
  container: {
    height: 'auto', // Auto height based on padding
    maxWidth: '1280px', // 7xl equivalent
    padding: {
      horizontal: 'clamp(20px, 5vw, 48px)',
      vertical: 'clamp(12px, 3vw, 20px)',
      combined: 'clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)',
    },
  },

  // Logo
  logo: {
    height: '28px',
    width: 'auto',
    opacity: {
      default: 0.9,
      scrolled: 1,
    },
    hover: {
      scale: 1.02,
    },
    transition: 'opacity 0.3s ease',
  },

  // Glass morphism states
  glass: {
    default: {
      backgroundColor: 'transparent',
      backdropFilter: 'none',
    },
    scrolled: {
      backgroundColor: 'rgba(11,11,12,0.4)', // More transparent for glass effect
      backdropFilter: 'blur(40px) saturate(200%) brightness(1.1)', // Heavier blur + saturation + brightness
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Nav links
  links: {
    typography: {
      fontSize: 'clamp(10px, 2vw, 12px)',
      fontWeight: '600',
      letterSpacing: '0.25em',
      textTransform: 'uppercase' as const,
    },
    opacity: {
      default: 0.6,
      hover: 1,
    },
    transition: 'opacity 0.3s ease',
    spacing: {
      gap: '24px', // Between link groups
      innerGap: '6px', // Between individual links
    },
    interaction: {
      hover: {
        scale: 1.05,
        opacity: 1,
      },
      tap: {
        scale: 0.95,
      },
    },
  },

  // Divider between nav sections
  divider: {
    width: '1px',
    height: '1em', // Match text height
    opacity: 0.15,
    margin: '0 8px',
  },

  // CTA (Start button)
  cta: {
    indent: '8px', // Subtle separation from divider
    interaction: {
      hover: {
        scale: 1.05,
        opacity: 1,
      },
      tap: {
        scale: 0.95,
      },
    },
  },
} as const;

// ==========================================
// SPACING
// ==========================================

export const spacing = {
  // 8px Grid System
  grid: 8,
  
  // Common spacing values (all multiples of 8)
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
  '3xl': '96px',
  '4xl': '128px',

  // Section spacing - governs major layout sections
  section: {
    wrapper: {
      mobile: '40px 16px',    // Standard section wrapper (mobile)
      desktop: '80px 24px',   // Standard section wrapper (desktop)
    },
    content: {
      mobile: '32px 24px',    // Content area padding (mobile)
      desktop: '48px 64px',   // Content area padding (desktop)
      // Variants
      tight: {
        mobile: '24px 20px',
        desktop: '64px 48px',
      },
      comfortable: {
        mobile: '32px 20px',
        desktop: '64px 80px',
      },
      withBottom: {
        mobile: '32px 24px 60px',
        desktop: '48px 64px',
      },
    },
    padding: {
      vertical: '128px', // Legacy - kept for compatibility
      horizontal: '24px', // Legacy - kept for compatibility
    },
    marginBottom: {
      header: '64px',
      content: '48px',
    },
  },

  // Responsive spacing with clamp() - Apple-grade fluidity
  responsive: {
    nav: {
      vertical: 'clamp(12px, 3vw, 20px)',
      horizontal: 'clamp(16px, 4vw, 24px)',
      combined: 'clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)',
    },
    hero: {
      all: 'clamp(20px, 5vw, 24px)',
    },
    bridge: {
      mobile: 'clamp(40px, 8vw, 60px) clamp(20px, 5vw, 24px)',
      desktop: 'clamp(60px, 10vw, 80px) clamp(20px, 5vw, 48px)',
    },
    container: {
      horizontal: '0 clamp(16px, 4vw, 0px)',
    },
  },

  // Interactive elements - buttons, badges, pills
  interactive: {
    button: {
      small: '8px 16px',      // Small button/CTA
      medium: '10px 20px',    // Medium button
      large: '12px 24px',     // Large button
    },
    badge: {
      mini: {
        mobile: '8px 12px',
        desktop: '10px 14px',
      },
      small: '6px 12px',      // Small badge/pill
      medium: '8px 16px',     // Medium badge
    },
    item: {
      compact: '8px',         // Compact interactive item (e.g., icon button)
      comfortable: '10px 16px', // List item, interactive row
    },
  },

  // Component spacing
  component: {
    gap: {
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
  },

  // Tile spacing - governs all tile copy relationships
  tile: {
    numberToTitle: '12px',      // Space between number badge and headline (Apple: tight hierarchy)
    titleToDescription: '6px',  // Space between headline and subtext (Apple: intimate relationship)
    copy: {
      lineHeight: '1.6',         // Line height for tile copy
      descriptionLineHeight: '1.7', // Slightly more generous for descriptions
    },
  },

  // Pillar spacing - governs large hero card copy relationships
  pillar: {
    labelToTitle: '12px',        // Space between module label and title (e.g., "Module 01" → "Journey")
    titleToDescription: '12px',  // Space between title and description (larger scale = more breathing room)
    copy: {
      lineHeight: '1.6',         // Line height for pillar description text
    },
  },
} as const;

// ==========================================
// TILE SYSTEM - MULTIDIMENSIONAL SPEC
// ==========================================

/**
 * TILE SYSTEM
 * Apple-grade standardization of tile dimensions, styles, functionality, and usage
 * Everything is governed - nothing left to chance
 */

export const tiles = {
  // ==========================================
  // TILE SIZES - Aspect Ratios & Dimensions
  // ==========================================
  sizes: {
    // Standard sizes based on aspect ratios
    square: {
      small: { width: '240px', height: '240px', aspectRatio: '1/1', gridSpan: 1 },
      medium: { width: '320px', height: '320px', aspectRatio: '1/1', gridSpan: 1 },
      large: { width: '400px', height: '400px', aspectRatio: '1/1', gridSpan: 1 },
    },
    landscape: {
      standard: { minHeight: '320px', aspectRatio: '3/2', gridSpan: 1 },  // Default tile
      wide: { minHeight: '320px', aspectRatio: '2/1', gridSpan: 2 },      // Expandable/featured
      ultrawide: { minHeight: '320px', aspectRatio: '3/1', gridSpan: 3 },  // Hero tiles
    },
    portrait: {
      tall: { minHeight: '400px', aspectRatio: '2/3', gridSpan: 1 },      // Pillar cards
      xtall: { minHeight: '500px', aspectRatio: '1/2', gridSpan: 1 },     // Deep content
    },
  },

  // ==========================================
  // TILE STYLES - Visual Variants
  // ==========================================
  styles: {
    standard: {
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      background: 'none', // Uses background image or gradient
      usage: 'Default tile style. Hero image backgrounds.',
    },
    glass: {
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      usage: 'Overlay tiles, data displays, minimal content.',
    },
    elevated: {
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(11,11,12,0.95))',
      usage: 'High-priority content, CTAs, featured items.',
    },
    minimal: {
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      background: 'rgba(17,17,19,0.4)',
      usage: 'Subtle backgrounds, supporting content.',
    },
    accent: {
      border: '1px solid rgba(64,224,208,0.2)',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(17,17,19,0.8), rgba(11,11,12,0.9))',
      usage: 'Active state, CTAs, user prompts.',
    },
    traffic: {
      green: {
        border: '1px solid rgba(74,222,128,0.3)',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(17,17,19,0.9), rgba(11,11,12,0.95))',
        usage: 'Optimal status, success states, achievements.',
      },
      amber: {
        border: '1px solid rgba(251,176,36,0.3)',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(17,17,19,0.9), rgba(11,11,12,0.95))',
        usage: 'Caution states, attention needed, warnings.',
      },
      red: {
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(17,17,19,0.9), rgba(11,11,12,0.95))',
        usage: 'Critical alerts, errors, blockers.',
      },
    },
  },

  // ==========================================
  // TILE FUNCTIONALITY - Interaction Types
  // ==========================================
  functionality: {
    static: {
      description: 'Non-interactive display tile',
      behavior: 'Hover elevation only',
      usage: 'Information display, visual content',
      maxPerView: 'Unlimited',
    },
    interactive: {
      description: 'Clickable navigation or action',
      behavior: 'Hover + click → route/modal/action',
      usage: 'Navigation, quick actions, links',
      maxPerView: '12-15 (grid dependent)',
    },
    expandable: {
      description: 'Grows to reveal more content',
      behavior: 'Click to expand horizontally across grid',
      usage: 'Detailed views, multi-step content',
      maxPerView: '1-2 expanded at a time',
    },
    flip: {
      description: '3D card flip reveals back content',
      behavior: 'Click to rotate 180° (Y-axis)',
      usage: 'Before/after, dual context, reveals',
      maxPerView: '3-6 per grid',
    },
    hoverReveal: {
      description: 'Content appears on hover',
      behavior: 'Hover → fade in hidden content + zoom background',
      usage: 'Progressive disclosure, subtle CTAs',
      maxPerView: '4-8 per grid',
    },
    layered: {
      description: 'Multi-depth stacked cards',
      behavior: 'Hover → layers separate vertically',
      usage: 'Depth illustration, complexity hint',
      maxPerView: '2-4 per grid (performance)',
    },
    metric: {
      description: 'Data visualization tile',
      behavior: 'Live updates, hover for detail',
      usage: 'KPIs, real-time data, dashboards',
      maxPerView: '4-8 per dashboard view',
    },
    progress: {
      description: 'Journey/task progress display',
      behavior: 'Animated progress bar, percentage',
      usage: 'User journeys, goals, completion tracking',
      maxPerView: '3-5 active progressions',
    },
    cta: {
      description: 'Call to action prompt',
      behavior: 'Prominent hover + click → primary action',
      usage: 'User prompts, onboarding, conversions',
      maxPerView: '1-2 per view (focused attention)',
    },
  },

  // ==========================================
  // GRID SYSTEMS - Layout Compositions
  // ==========================================
  grids: {
    // Standard 3-column grid (desktop)
    threeColumn: {
      columns: 3,
      gap: '24px',
      minColumnWidth: '320px',
      breakpoint: '1024px',
      usage: 'Default desktop grid. Balanced content distribution.',
      maxTiles: '12-15 visible',
    },
    // 2-column grid (tablet)
    twoColumn: {
      columns: 2,
      gap: '20px',
      minColumnWidth: '280px',
      breakpoint: '768px',
      usage: 'Tablet/medium screens. Maintains readability.',
      maxTiles: '8-10 visible',
    },
    // Single column (mobile)
    oneColumn: {
      columns: 1,
      gap: '16px',
      minColumnWidth: '100%',
      breakpoint: '0px',
      usage: 'Mobile. Full-width tiles, vertical scroll.',
      maxTiles: '6-8 above fold',
    },
    // Bento grid (mixed sizes)
    bento: {
      columns: 'auto-fit',
      gap: '24px',
      minColumnWidth: '280px',
      breakpoint: 'responsive',
      usage: 'Dashboard hero sections. Mixed tile sizes create visual hierarchy.',
      composition: 'Mix of 1x1, 2x1, 1x2 tiles for dynamic layout',
    },
  },

  // ==========================================
  // PROPORTIONS - Universal Standards
  // ==========================================
  proportions: {
    // Padding scales with tile size
    padding: {
      small: '24px',   // For tiles < 280px
      medium: '32px',  // For tiles 280-400px (standard)
      large: '40px',   // For tiles > 400px
    },
    // Icon badge sizing
    iconBadge: {
      small: { size: '40px', iconSize: '20px', borderRadius: '12px' },
      medium: { size: '56px', iconSize: '28px', borderRadius: '16px' },
      large: { size: '72px', iconSize: '36px', borderRadius: '20px' },
    },
    // Content hierarchy spacing (already in spacing.tile)
    contentSpacing: {
      numberToTitle: '12px',
      titleToDescription: '6px',
      descriptionToAction: '16px',
      sectionGap: '24px',
    },
  },

  // ==========================================
  // USAGE GUIDELINES - When to Use What
  // ==========================================
  usage: {
    hero: {
      tiles: ['expandable', 'layered', 'flip'],
      styles: ['elevated', 'accent'],
      sizes: ['landscape.wide', 'landscape.ultrawide'],
      count: '1-3 per hero section',
      purpose: 'First impression. Feature spotlight. High engagement.',
    },
    dashboard: {
      tiles: ['metric', 'progress', 'interactive'],
      styles: ['glass', 'standard'],
      sizes: ['square.medium', 'landscape.standard'],
      count: '6-12 tiles in bento grid',
      purpose: 'Real-time data. Quick actions. Status overview.',
    },
    gallery: {
      tiles: ['static', 'hoverReveal'],
      styles: ['standard', 'minimal'],
      sizes: ['square.medium', 'landscape.standard'],
      count: '9-15 in uniform grid',
      purpose: 'Content browsing. Visual showcase. Exploration.',
    },
    navigation: {
      tiles: ['interactive', 'cta'],
      styles: ['glass', 'accent'],
      sizes: ['square.medium'],
      count: '4-8 primary options',
      purpose: 'Wayfinding. Module selection. Clear paths.',
    },
    status: {
      tiles: ['metric', 'progress'],
      styles: ['traffic.green', 'traffic.amber', 'traffic.red'],
      sizes: ['square.small', 'landscape.standard'],
      count: '3-6 key indicators',
      purpose: 'System health. User state. Real-time monitoring.',
    },
  },

  // ==========================================
  // HOVER STATES - Interaction Standards
  // ==========================================
  hover: {
    standard: {
      borderColor: 'rgba(64,224,208,0.2)',
      transform: 'translateY(-4px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    elevated: {
      borderColor: 'rgba(64,224,208,0.3)',
      transform: 'translateY(-6px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    subtle: {
      borderColor: 'rgba(64,224,208,0.1)',
      transform: 'translateY(-2px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // ==========================================
  // ANIMATION TIMING - Tile Transitions
  // ==========================================
  animations: {
    hover: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    expand: {
      duration: '500ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    flip: {
      duration: '600ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    reveal: {
      duration: '400ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

// ==========================================
// SECTION HEADER TOKENS
// ==========================================

export const sectionHeader = {
  // Icon size
  icon: {
    width: '20px',
    height: '20px',
  },

  // Accent line
  accentLine: {
    width: '60px',
    height: '2px',
  },

  // Spacing
  spacing: {
    iconEyebrowGap: '12px', // gap-3
    eyebrowTitleGap: '16px', // mb-4
    titleLineGap: '16px', // mb-4
    headerDescriptionGap: '48px', // mb-12
  },

  // Description
  description: {
    maxWidth: '800px',
  },
} as const;

// ==========================================
// BORDERS
// ==========================================

export const borders = {
  section: {
    top: '1px solid rgba(255, 255, 255, 0.1)',
  },
  card: {
    default: '1px solid rgba(255, 255, 255, 0.1)',
  },
} as const;

// ==========================================
// ANIMATIONS
// ==========================================

export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    default: 'ease',
    inOut: 'ease-in-out',
    out: 'ease-out',
    in: 'ease-in',
  },
} as const;

// ==========================================
// Z-INDEX LAYERS
// ==========================================

export const zIndex = {
  base: 0,
  elevated: 10,
  overlay: 100,
  modal: 1000,
  toast: 10000,
} as const;

// ==========================================
// BORDER RADIUS
// ==========================================

export const radius = {
  // Apple-grade corner radius system
  xs: '4px',      // Tight elements (chips, badges, inline accents)
  sm: '8px',      // Buttons, small cards, tags
  md: '12px',     // Cards, panels, modals, standard containers
  lg: '16px',     // Large modals, sheets, feature cards
  xl: '20px',     // Tiles, hero cards, cinematic containers
  '2xl': '24px',  // Large cinematic frames, showcase containers
  '3xl': '32px',  // Extra-large expanded modals, feature showcases
  full: '9999px', // Pills, avatars, circular elements
} as const;

// ==========================================
// RADIUS USAGE RULES
// ==========================================

/**
 * CIRCLE vs RECTANGLE GOVERNANCE
 * Apple-grade rules for when to use circular (radius.full) vs rectangular radius
 * 
 * CIRCLES (radius.full) - RESERVED FOR:
 * 1. Status Indicators (3-12px dots) - health/state visualization
 * 2. Navigation/Progress Dots (8-32px) - position in sequence, pagination
 * 3. Pill Buttons - smooth transitions, section navigation
 * 4. Progress Bars - horizontal/radial progress visualization
 * 5. Avatars/User Elements - profile images, user representation
 * 6. Decorative Orbs - ambient blur effects, glows
 * 
 * RECTANGLES (radius.xs → radius.2xl) - USED FOR:
 * 1. Entity Containers - icons representing people, objects, concepts
 * 2. Content Cards - any information container or card
 * 3. Buttons (non-pill) - rectangular action triggers
 * 4. Feature Cards - product features, capabilities, content blocks
 * 5. Frames & Containers - cinematic frames, modals, panels
 * 6. Input Elements - forms, text fields, dropdowns
 * 
 * NARRATIVE PRINCIPLE:
 * - Circles = Flow, State, Navigation, Status (dynamic, cyclical)
 * - Rectangles = Structure, Entities, Content, Actions (stable, hierarchical)
 */

export const radiusRules = {
  circles: {
    statusDot: { size: '3-12px', usage: 'System health indicators', example: 'green/amber status dot' },
    navigationDot: { size: '8-32px', usage: 'Carousel dots, layer progress', example: 'TheCloser phase dots' },
    pillButton: { size: 'variable', usage: 'Section navigation, tag pills', example: 'MeetLuma section nav' },
    avatar: { size: 'variable', usage: 'User profile images', example: 'User avatar component' },
    progressBar: { size: 'variable', usage: 'Horizontal/radial progress', example: 'MindblockAnalytics bars' },
    decorativeOrb: { size: 'large', usage: 'Ambient blur effects', example: 'NeuralGradient orbs' },
  },
  rectangles: {
    iconContainer: { 
      radius: 'radius.lg (16px)', 
      usage: 'Icons representing entities (people, buildings, objects)', 
      example: 'ThreeAltitudes: User, Stethoscope, Building2' 
    },
    button: { 
      radius: 'radius.sm (8px)', 
      usage: 'Standard rectangular buttons', 
      example: 'Primary CTA buttons' 
    },
    featureCard: { 
      radius: 'radius.sm (8px)', 
      usage: 'Feature cards within larger containers', 
      example: 'ThreeAltitudes feature list items' 
    },
    standardCard: { 
      radius: 'radius.md (12px)', 
      usage: 'Default cards, panels, modals', 
      example: 'Command Center cards' 
    },
    largeCard: { 
      radius: 'radius.lg (16px)', 
      usage: 'Large feature cards, sheets', 
      example: 'Modal dialogs' 
    },
    cinematicFrame: { 
      radius: 'radius.xl (20px) or radius.2xl (24px)', 
      usage: 'Hero containers, showcase frames', 
      example: 'ThreeAltitudes outer frame' 
    },
  },
} as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get spacing value as multiple of grid (8px)
 */
export const gridSpacing = (multiplier: number): string => {
  return `${spacing.grid * multiplier}px`;
};

/**
 * Type exports for TypeScript
 */
export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type SectionHeader = typeof sectionHeader;

// ==========================================
// MOTION & ANIMATION
// ==========================================

/**
 * MOTION SYSTEM
 * Apple-grade animation timing and easing curves
 * Governs all transitions, animations, and micro-interactions
 * Nothing is hardcoded. Everything pulls from here.
 */

export const motion = {
  // ==========================================
  // DURATION TOKENS - Semantic Animation Speeds
  // ==========================================
  duration: {
    // Instant - Immediate feedback (0-100ms)
    instant: '0ms',         // No animation (immediate)
    flash: '50ms',          // Ultra-fast micro feedback
    snap: '100ms',          // Quick state changes
    
    // Fast - UI responsiveness (100-250ms)
    fast: '150ms',          // Hover states, toggles
    quick: '200ms',         // Standard UI transitions
    rapid: '250ms',         // List item reveals
    
    // Base - Standard interactions (300-500ms)
    base: '300ms',          // Default transition (most common)
    smooth: '400ms',        // Content reveals, cards
    relaxed: '500ms',       // Section transitions
    
    // Slow - Dramatic reveals (600-900ms)
    slow: '600ms',          // Emphasized content
    dramatic: '700ms',      // Hero image transitions
    cinematic: '800ms',     // Large section reveals
    narrative: '900ms',     // Text storytelling
    
    // Extended - Major state changes (1000ms+)
    extended: '1000ms',     // Hero entrances, major transitions
    epic: '1200ms',         // Full-screen transitions
    longform: '1400ms',     // Sequential narrative reveals
    ambient: '1500ms',      // Background color shifts
    loop: '2000ms',         // Continuous ambient animations
  },

  // ==========================================
  // EASING CURVES - Timing Functions
  // ==========================================
  easing: {
    // Standard curves
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Apple-style curves (custom cubic-bezier)
    appleStandard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',      // Material Design standard
    appleDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',    // Deceleration curve
    appleAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',      // Acceleration curve
    appleSharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',         // Sharp easing
    
    // Specialized curves
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',     // Bounce effect
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',   // Elastic snap
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',       // Smooth flow
  },

  // ==========================================
  // DELAY TOKENS - Stagger Patterns
  // ==========================================
  delay: {
    // No delay
    none: '0ms',
    
    // Micro staggers (UI elements)
    micro: '50ms',          // Tiny offset
    mini: '100ms',          // Button sequences
    small: '150ms',         // List item staggers
    base: '200ms',          // Default stagger
    
    // Macro staggers (content sections)
    medium: '300ms',        // Card reveals
    large: '400ms',         // Section delays
    xlarge: '500ms',        // Hero sequence delays
    dramatic: '600ms',      // Cinematic pauses
    cinematic: '800ms',     // Major scene transitions
    extended: '1000ms',     // Full transitions
    
    // Stagger increments (for loops)
    stagger: {
      fast: '0.05s',        // 50ms increment (0.05s * i)
      base: '0.1s',         // 100ms increment (0.1s * i)
      slow: '0.15s',        // 150ms increment (0.15s * i)
    },
  },

  // ==========================================
  // ANIMATION PRESETS - Common Combinations
  // ==========================================
  presets: {
    // Fade transitions
    fade: {
      fast: 'opacity 150ms ease',
      base: 'opacity 300ms ease',
      slow: 'opacity 600ms ease',
    },
    
    // Transform transitions
    transform: {
      fast: 'transform 150ms ease',
      base: 'transform 300ms ease',
      smooth: 'transform 400ms ease-out',
    },
    
    // Combined transitions (most common)
    all: {
      fast: 'all 150ms ease',
      base: 'all 300ms ease',
      smooth: 'all 400ms ease-out',
      dramatic: 'all 700ms ease-out',
      cinematic: 'all 800ms ease-out',
    },
    
    // Opacity + Transform (entrance animations)
    entrance: {
      base: 'opacity 300ms ease-out, transform 300ms ease-out',
      dramatic: 'opacity 800ms ease-out, transform 800ms ease-out',
      epic: 'opacity 1000ms ease-out, transform 1000ms ease-out',
      narrative: 'opacity 900ms ease-out, transform 900ms ease-out',
    },
    
    // Button interactions
    button: {
      base: 'all 200ms ease',
      hover: 'transform 150ms ease',
      active: 'transform 100ms ease',
    },
    
    // Card/tile interactions
    card: {
      hover: 'transform 400ms ease-out',
      reveal: 'all 700ms ease-out',
    },
    
    // Background transitions
    background: {
      base: 'background 400ms ease',
      color: 'background-color 300ms ease',
      image: 'background-image 700ms ease',
    },
  },

  // ==========================================
  // KEYFRAME PATTERNS - Reusable Animations
  // ==========================================
  keyframes: {
    // Fade patterns
    fadeIn: {
      name: 'fadeIn',
      definition: 'from { opacity: 0; } to { opacity: 1; }',
    },
    fadeOut: {
      name: 'fadeOut',
      definition: 'from { opacity: 1; } to { opacity: 0; }',
    },
    
    // Slide patterns
    slideUp: {
      name: 'slideUp',
      definition: 'from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }',
    },
    slideDown: {
      name: 'slideDown',
      definition: 'from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); }',
    },
    slideLeft: {
      name: 'slideLeft',
      definition: 'from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); }',
    },
    slideRight: {
      name: 'slideRight',
      definition: 'from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); }',
    },
    
    // Pulse/glow patterns
    pulse: {
      name: 'pulse',
      definition: '0%, 100% { opacity: 0.8; } 50% { opacity: 1; }',
    },
    glow: {
      name: 'glow',
      definition: '0%, 100% { opacity: 0.6; } 50% { opacity: 1; }',
    },
    
    // Scale patterns
    scaleIn: {
      name: 'scaleIn',
      definition: 'from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); }',
    },
    scaleOut: {
      name: 'scaleOut',
      definition: 'from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); }',
    },
  },
} as const;

// Type export for motion
export type Motion = typeof motion;

// ==========================================
// ADVANCED ANIMATION PATTERNS - Phase B
// ==========================================

/**
 * ORCHESTRATION - Coordinating multiple animations
 * For sequenced reveals, parallel movements, and choreographed experiences
 */
export const orchestration = {
  // Sequence patterns - One after another
  sequence: {
    // Fast waterfall (50ms between items)
    waterfall: {
      increment: 50,
      easing: motion.easing.smooth,
      baseDelay: 0,
    },
    // Staggered reveal (100ms between items)
    stagger: {
      increment: 100,
      easing: motion.easing.appleStandard,
      baseDelay: 0,
    },
    // Cascading (150ms between items)
    cascade: {
      increment: 150,
      easing: motion.easing.appleDecelerate,
      baseDelay: 200,
    },
    // Wave effect (200ms between items)
    wave: {
      increment: 200,
      easing: motion.easing.smooth,
      baseDelay: 0,
    },
  },

  // Parallel patterns - Multiple animations at once with different timing
  parallel: {
    // Hero entrance (title, subtitle, cta at different speeds)
    heroEntrance: {
      title: { delay: 0, duration: motion.duration.dramatic },
      subtitle: { delay: 200, duration: motion.duration.smooth },
      cta: { delay: 400, duration: motion.duration.base },
    },
    // Card reveal (image, content, border at different speeds)
    cardReveal: {
      image: { delay: 0, duration: motion.duration.cinematic },
      content: { delay: 300, duration: motion.duration.smooth },
      border: { delay: 500, duration: motion.duration.base },
    },
    // Section transition (background, content, accents)
    sectionTransition: {
      background: { delay: 0, duration: motion.duration.ambient },
      content: { delay: 200, duration: motion.duration.dramatic },
      accents: { delay: 400, duration: motion.duration.base },
    },
  },

  // Helper function to generate stagger delays
  generateStagger: (index: number, pattern: 'waterfall' | 'stagger' | 'cascade' | 'wave' = 'stagger') => {
    const config = orchestration.sequence[pattern];
    return `${config.baseDelay + (index * config.increment)}ms`;
  },
};

/**
 * SCROLL-DRIVEN ANIMATIONS
 * Utilities for scroll-based reveals and parallax effects
 */
export const scrollAnimation = {
  // Intersection Observer thresholds
  thresholds: {
    trigger: 0.1,      // Start animation when 10% visible
    halfway: 0.5,      // Trigger at 50% visible
    complete: 0.9,     // Trigger when 90% visible
  },

  // Viewport reveal patterns
  reveal: {
    // Fade in from bottom
    fadeUp: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: motion.duration.dramatic, ease: motion.easing.appleDecelerate },
    },
    // Fade in from top
    fadeDown: {
      initial: { opacity: 0, y: -40 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: motion.duration.dramatic, ease: motion.easing.appleDecelerate },
    },
    // Fade in from left
    fadeLeft: {
      initial: { opacity: 0, x: -40 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: motion.duration.dramatic, ease: motion.easing.appleDecelerate },
    },
    // Fade in from right
    fadeRight: {
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: motion.duration.dramatic, ease: motion.easing.appleDecelerate },
    },
    // Scale fade in
    scaleFade: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: motion.duration.smooth, ease: motion.easing.appleStandard },
    },
    // Blur fade in
    blurFade: {
      initial: { opacity: 0, filter: 'blur(10px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      transition: { duration: motion.duration.cinematic, ease: motion.easing.smooth },
    },
  },

  // Parallax patterns
  parallax: {
    subtle: { speed: 0.2, range: [-20, 20] },
    moderate: { speed: 0.4, range: [-40, 40] },
    dramatic: { speed: 0.6, range: [-60, 60] },
    extreme: { speed: 0.8, range: [-100, 100] },
  },
};

/**
 * GESTURE-BASED ANIMATIONS
 * Drag, swipe, and touch interactions
 */
export const gestures = {
  // Drag constraints
  drag: {
    loose: { dragElastic: 0.8, dragConstraints: { top: -200, bottom: 200, left: -200, right: 200 } },
    moderate: { dragElastic: 0.5, dragConstraints: { top: -100, bottom: 100, left: -100, right: 100 } },
    tight: { dragElastic: 0.2, dragConstraints: { top: -50, bottom: 50, left: -50, right: 50 } },
    locked: { dragElastic: 0, dragConstraints: { top: 0, bottom: 0, left: 0, right: 0 } },
  },

  // Swipe thresholds
  swipe: {
    velocity: 500,      // Minimum velocity to trigger swipe
    distance: 50,       // Minimum distance to trigger swipe
    duration: 0.3,      // Animation duration after swipe
  },

  // Spring configurations (for natural physics)
  spring: {
    // Gentle bounce
    soft: { type: 'spring', stiffness: 100, damping: 15, mass: 1 },
    // Standard spring
    standard: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
    // Snappy response
    snappy: { type: 'spring', stiffness: 400, damping: 25, mass: 1 },
    // Bouncy feel
    bouncy: { type: 'spring', stiffness: 300, damping: 10, mass: 0.8 },
    // Stiff and quick
    stiff: { type: 'spring', stiffness: 500, damping: 30, mass: 1 },
  },
};

/**
 * MICRO-INTERACTIONS
 * Button presses, hover states, and small delightful animations
 */
export const microInteractions = {
  // Button press patterns
  button: {
    // Standard press
    press: {
      scale: 0.95,
      duration: motion.duration.snap,
      easing: motion.easing.appleStandard,
    },
    // Subtle press
    pressSubtle: {
      scale: 0.98,
      duration: motion.duration.flash,
      easing: motion.easing.ease,
    },
    // Dramatic press
    pressDramatic: {
      scale: 0.92,
      duration: motion.duration.quick,
      easing: motion.easing.bounce,
    },
    // Elastic press (bounces back)
    pressElastic: {
      scale: [1, 0.95, 1.02, 1],
      duration: motion.duration.smooth,
      easing: motion.easing.elastic,
    },
  },

  // Hover effects
  hover: {
    // Lift up
    lift: {
      y: -4,
      scale: 1.02,
      duration: motion.duration.fast,
      easing: motion.easing.appleDecelerate,
    },
    // Glow
    glow: {
      duration: motion.duration.base,
      easing: motion.easing.smooth,
    },
    // Magnetic (pulls toward cursor)
    magnetic: {
      scale: 1.05,
      duration: motion.duration.fast,
      easing: motion.easing.smooth,
    },
    // Border pulse
    borderPulse: {
      borderWidth: '2px',
      duration: motion.duration.quick,
      easing: motion.easing.ease,
    },
  },

  // Loading states
  loading: {
    // Spinner rotation
    spinner: {
      rotate: 360,
      duration: motion.duration.extended,
      easing: 'linear',
      repeat: Infinity,
    },
    // Pulse
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 1, 0.6],
      duration: motion.duration.loop,
      easing: motion.easing.smooth,
      repeat: Infinity,
    },
    // Dots sequence
    dotsSequence: {
      y: [0, -10, 0],
      duration: motion.duration.smooth,
      easing: motion.easing.easeInOut,
      repeat: Infinity,
    },
  },

  // Focus states
  focus: {
    // Ring expansion
    ring: {
      scale: 1,
      duration: motion.duration.fast,
      easing: motion.easing.appleStandard,
    },
    // Glow expansion
    glow: {
      duration: motion.duration.base,
      easing: motion.easing.smooth,
    },
  },
};

/**
 * PAGE TRANSITIONS
 * View-to-view navigation animations
 */
export const pageTransitions = {
  // Fade transitions
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motion.duration.smooth, ease: motion.easing.appleStandard },
  },

  // Slide transitions
  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: motion.duration.dramatic, ease: motion.easing.appleDecelerate },
  },
  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: motion.duration.dramatic, ease: motion.easing.appleDecelerate },
  },

  // Scale transitions
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: motion.duration.smooth, ease: motion.easing.appleStandard },
  },

  // Blur transitions
  blur: {
    initial: { filter: 'blur(10px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    exit: { filter: 'blur(10px)', opacity: 0 },
    transition: { duration: motion.duration.cinematic, ease: motion.easing.smooth },
  },
};

/**
 * LOADING CHOREOGRAPHY
 * Skeleton screens and loading state patterns
 */
export const loadingChoreography = {
  // Skeleton shimmer effect
  shimmer: {
    backgroundSize: '200% 100%',
    backgroundPosition: ['200% 0', '-200% 0'],
    duration: motion.duration.ambient,
    easing: 'linear',
    repeat: Infinity,
  },

  // Skeleton pulse
  skeletonPulse: {
    opacity: [0.5, 0.8, 0.5],
    duration: motion.duration.loop,
    easing: motion.easing.easeInOut,
    repeat: Infinity,
  },

  // Progressive reveal (for lists)
  progressiveReveal: {
    stagger: 100,
    duration: motion.duration.smooth,
    easing: motion.easing.appleDecelerate,
  },
};

// ==========================================
// PERFORMANCE OPTIMIZATION - Phase C
// ==========================================

/**
 * GPU ACCELERATION
 * Smart will-change management for hardware acceleration
 */
export const gpuAcceleration = {
  // Properties that benefit from GPU acceleration
  properties: {
    transform: 'will-change: transform;',
    opacity: 'will-change: opacity;',
    transformOpacity: 'will-change: transform, opacity;',
    filter: 'will-change: filter;',
    all: 'will-change: transform, opacity, filter;',
  },

  // Auto will-change (adds before animation, removes after)
  auto: {
    // Add will-change before animation starts
    prepare: (element: HTMLElement, properties: string[] = ['transform', 'opacity']) => {
      element.style.willChange = properties.join(', ');
    },
    // Remove will-change after animation completes
    cleanup: (element: HTMLElement, delay: number = 100) => {
      setTimeout(() => {
        element.style.willChange = 'auto';
      }, delay);
    },
  },

  // Composite layer hints (force GPU layer creation)
  compositeLayers: {
    // Force layer with transform3d
    forceLayer: 'transform: translateZ(0);',
    // Force layer with backface-visibility
    backface: 'backface-visibility: hidden;',
    // Combined (most compatible)
    combined: 'transform: translateZ(0); backface-visibility: hidden;',
  },

  // Hardware acceleration best practices
  hints: {
    // Use transform instead of position properties
    useTransform: 'Always animate transform (translate, scale, rotate) instead of top/left/margin',
    // Use opacity instead of visibility
    useOpacity: 'Animate opacity instead of visibility for fade effects',
    // Avoid animating expensive properties
    avoidExpensive: 'Never animate: width, height, padding, margin, border (causes layout)',
    // Prefer transform and opacity
    preferComposite: 'Stick to transform and opacity for 60fps animations',
  },
};

/**
 * THROTTLE & DEBOUNCE
 * Performance utilities for event handlers and animations
 */
export const performanceUtils = {
  // Throttle intervals (in ms)
  throttle: {
    scroll: 16,        // ~60fps for scroll events
    resize: 100,       // Resize events
    mousemove: 16,     // ~60fps for mouse tracking
    drag: 16,          // ~60fps for drag operations
    default: 100,      // General throttle
  },

  // Debounce delays (in ms)
  debounce: {
    search: 300,       // Search input
    resize: 150,       // Window resize
    input: 200,        // General input
    scroll: 100,       // Scroll end detection
    default: 250,      // General debounce
  },

  // RAF (RequestAnimationFrame) helpers
  raf: {
    // Optimal frame budget (60fps = 16.67ms per frame)
    frameBudget: 16.67,
    // Target FPS
    targetFPS: 60,
    // Minimum FPS before degradation
    minFPS: 30,
  },
};

/**
 * INTERSECTION OBSERVER OPTIMIZATION
 * Shared observer configuration for scroll-driven animations
 */
export const observerConfig = {
  // Standard thresholds
  thresholds: {
    single: [0.1],              // Single trigger point
    progressive: [0, 0.25, 0.5, 0.75, 1],  // Progressive reveals
    precise: Array.from({ length: 101 }, (_, i) => i / 100),  // 0 to 1 in 1% increments
  },

  // Root margin configurations
  rootMargin: {
    none: '0px',
    preload: '200px',           // Start loading 200px before visible
    eager: '400px',             // Start loading 400px before visible
    lazy: '-100px',             // Wait until 100px into viewport
    viewport: '0px 0px -20% 0px',  // Trigger at 80% of viewport
  },

  // Performance presets
  presets: {
    // Lightweight (minimal observations)
    lightweight: {
      threshold: [0.1],
      rootMargin: '0px',
    },
    // Standard (balanced performance)
    standard: {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '200px',
    },
    // Precise (detailed tracking, more expensive)
    precise: {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20), // 0 to 1 in 5% increments
      rootMargin: '0px',
    },
    // Eager loading
    eager: {
      threshold: [0.1],
      rootMargin: '400px',
    },
  },
};

/**
 * MEMORY MANAGEMENT
 * Cleanup and leak prevention utilities
 */
export const memoryManagement = {
  // Cleanup timeouts (when to clean up resources)
  cleanup: {
    immediate: 0,       // Clean up immediately
    short: 100,         // Clean up after 100ms
    medium: 500,        // Clean up after 500ms
    long: 1000,         // Clean up after 1s
    delayed: 2000,      // Clean up after 2s
  },

  // Resource limits
  limits: {
    maxObservers: 10,          // Max concurrent Intersection Observers
    maxAnimations: 50,         // Max concurrent animations
    maxListeners: 100,         // Max event listeners
    cacheSizeKB: 2048,         // Max cache size (2MB)
  },

  // Cleanup strategies
  strategies: {
    // Aggressive cleanup (low-power devices)
    aggressive: {
      cleanupDelay: 100,
      removeWillChange: true,
      disconnectObservers: true,
      clearCache: true,
    },
    // Balanced cleanup (default)
    balanced: {
      cleanupDelay: 500,
      removeWillChange: true,
      disconnectObservers: false,
      clearCache: false,
    },
    // Minimal cleanup (high-performance devices)
    minimal: {
      cleanupDelay: 1000,
      removeWillChange: false,
      disconnectObservers: false,
      clearCache: false,
    },
  },
};

/**
 * PERFORMANCE MONITORING
 * FPS tracking and diagnostics
 */
export const performanceMonitoring = {
  // FPS thresholds
  fps: {
    excellent: 58,     // 58-60 fps
    good: 45,          // 45-58 fps
    acceptable: 30,    // 30-45 fps
    poor: 15,          // 15-30 fps
    critical: 0,       // < 15 fps
  },

  // Performance budget (time in ms)
  budget: {
    paint: 16,         // Paint budget per frame
    layout: 10,        // Layout budget per frame
    composite: 2,      // Composite budget per frame
    javascript: 4,     // JS execution budget per frame
  },

  // Metrics to track
  metrics: {
    fps: true,                    // Track frames per second
    paintTime: true,              // Track paint operations
    layoutTime: true,             // Track layout calculations
    jsExecutionTime: true,        // Track JS execution
    memoryUsage: false,           // Track memory (expensive)
    longTasks: true,              // Track long tasks (>50ms)
  },

  // Alert thresholds
  alerts: {
    lowFPS: 30,                   // Alert if FPS drops below 30
    longTask: 50,                 // Alert if task takes > 50ms
    highMemory: 100 * 1024 * 1024, // Alert if memory > 100MB
    paintOverBudget: 20,          // Alert if paint > 20ms
  },
};

/**
 * TRANSFORM OPTIMIZATION
 * Optimized transform patterns for GPU acceleration
 */
export const transformOptimization = {
  // GPU-optimized transforms (only transform and opacity)
  optimized: {
    // Translate (always use 3D for GPU)
    translateY: (value: number | string) => `translate3d(0, ${value}, 0)`,
    translateX: (value: number | string) => `translate3d(${value}, 0, 0)`,
    translate: (x: number | string, y: number | string) => `translate3d(${x}, ${y}, 0)`,
    
    // Scale (always use 3D for GPU)
    scale: (value: number) => `scale3d(${value}, ${value}, 1)`,
    scaleX: (value: number) => `scale3d(${value}, 1, 1)`,
    scaleY: (value: number) => `scale3d(1, ${value}, 1)`,
    
    // Rotate (always use 3D for GPU)
    rotate: (deg: number) => `rotate3d(0, 0, 1, ${deg}deg)`,
    
    // Combined transforms
    transformOpacity: (transform: string, opacity: number) => ({
      transform,
      opacity,
      willChange: 'transform, opacity',
    }),
  },

  // Anti-patterns (avoid these)
  antiPatterns: {
    // BAD: Using 2D transforms
    bad2D: 'translateY(10px)',
    // GOOD: Use 3D transforms
    good3D: 'translate3d(0, 10px, 0)',
    
    // BAD: Animating width/height
    badLayout: 'width: 100px',
    // GOOD: Use scale transform
    goodScale: 'transform: scaleX(1.5)',
    
    // BAD: Animating left/top
    badPosition: 'left: 100px',
    // GOOD: Use translate
    goodTranslate: 'transform: translateX(100px)',
  },
};

/**
 * LAZY ANIMATION LOADING
 * Code splitting and dynamic imports for animations
 */
export const lazyLoading = {
  // Loading strategies
  strategies: {
    // Immediate (load on mount)
    immediate: { 
      trigger: 'mount',
      preload: true,
    },
    // Viewport (load when in view)
    viewport: {
      trigger: 'intersection',
      threshold: 0.1,
      preload: false,
    },
    // Interaction (load on hover/focus)
    interaction: {
      trigger: 'hover',
      preload: false,
    },
    // Idle (load when browser is idle)
    idle: {
      trigger: 'requestIdleCallback',
      timeout: 2000,
      preload: false,
    },
  },

  // Priority levels
  priority: {
    critical: 'high',      // Load immediately (hero animations)
    important: 'medium',   // Load in viewport
    optional: 'low',       // Load on idle
    deferred: 'idle',      // Load when truly idle
  },
};

/**
 * ANIMATION PERFORMANCE PRESETS
 * Pre-configured performance profiles
 */
export const performancePresets = {
  // High performance (desktop, modern devices)
  high: {
    gpuAcceleration: true,
    willChange: 'auto',
    observerThreshold: observerConfig.presets.precise.threshold,
    cleanupDelay: memoryManagement.cleanup.long,
    throttleInterval: performanceUtils.throttle.scroll,
    maxConcurrentAnimations: 50,
  },

  // Balanced (default, most devices)
  balanced: {
    gpuAcceleration: true,
    willChange: 'selective',
    observerThreshold: observerConfig.presets.standard.threshold,
    cleanupDelay: memoryManagement.cleanup.medium,
    throttleInterval: performanceUtils.throttle.default,
    maxConcurrentAnimations: 30,
  },

  // Low performance (older devices, low power mode)
  low: {
    gpuAcceleration: false,
    willChange: 'none',
    observerThreshold: observerConfig.presets.lightweight.threshold,
    cleanupDelay: memoryManagement.cleanup.short,
    throttleInterval: 200,
    maxConcurrentAnimations: 10,
  },

  // Reduced motion (accessibility)
  reducedMotion: {
    gpuAcceleration: false,
    willChange: 'none',
    observerThreshold: [0.1],
    cleanupDelay: memoryManagement.cleanup.immediate,
    throttleInterval: 0,
    maxConcurrentAnimations: 0,
  },
};

// ==========================================
// ACCESSIBILITY - Phase D
// ==========================================

/**
 * REDUCED MOTION SYSTEM
 * Support for prefers-reduced-motion media query
 */
export const reducedMotionSystem = {
  // Media query
  mediaQuery: '(prefers-reduced-motion: reduce)',
  
  // Reduced animation durations (faster, less dramatic)
  duration: {
    instant: '0ms',        // No animation
    minimal: '100ms',      // Absolute minimum
    reduced: '150ms',      // Reduced duration
    standard: '200ms',     // Conservative standard
  },

  // Simplified easing (no bounces or complex curves)
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeOut: 'ease-out',
  },

  // Motion severity levels
  severity: {
    // Essential - Never disable (focus indicators, state changes)
    essential: {
      enabled: true,
      duration: '100ms',
      allowTransform: true,
      allowOpacity: true,
      description: 'Critical for usability, never disable',
    },
    // Functional - Minimal motion only (modals, tooltips)
    functional: {
      enabled: true,
      duration: '150ms',
      allowTransform: false,
      allowOpacity: true,
      description: 'Functional feedback, fade only',
    },
    // Decorative - Disable in reduced motion (scroll effects, parallax)
    decorative: {
      enabled: false,
      duration: '0ms',
      allowTransform: false,
      allowOpacity: false,
      description: 'Purely decorative, disable completely',
    },
    // Optional - User preference (hero animations, transitions)
    optional: {
      enabled: false,
      duration: '0ms',
      allowTransform: false,
      allowOpacity: false,
      description: 'User can opt-in via settings',
    },
  },

  // Fallback patterns (when motion is reduced)
  fallbacks: {
    // Fade in place (no transform)
    fadeOnly: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: '150ms', ease: 'ease' },
    },
    // Instant (no animation)
    instant: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: '0ms' },
    },
    // Cross-fade (opacity only, fast)
    crossFade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: '100ms', ease: 'ease' },
    },
  },
};

/**
 * KEYBOARD NAVIGATION
 * Focus management and keyboard shortcuts
 */
export const keyboardNavigation = {
  // Focus styles
  focus: {
    // Visible focus indicator (WCAG 2.4.7)
    visible: {
      outline: `3px solid ${colors.accent.cyan.primary}`,
      outlineOffset: '2px',
      borderRadius: radius.sm,
    },
    // High contrast focus (enhanced visibility)
    highContrast: {
      outline: `4px solid ${colors.accent.cyan.primary}`,
      outlineOffset: '3px',
      borderRadius: radius.sm,
    },
    // Subtle focus (for dense UIs)
    subtle: {
      outline: `2px solid ${colors.accent.cyan.primary}`,
      outlineOffset: '1px',
      borderRadius: radius.sm,
    },
  },

  // Keyboard shortcuts
  shortcuts: {
    skipToContent: 'Skip to main content',
    skipToNav: 'Skip to navigation',
    toggleAnimations: 'Toggle animations',
    pauseAnimations: 'Pause all animations',
    playAnimations: 'Resume animations',
  },
};

/**
 * SCREEN READER SUPPORT
 * ARIA live regions and announcements
 */
export const screenReader = {
  // Live region politeness
  liveRegion: {
    polite: {
      'aria-live': 'polite' as const,
      'aria-atomic': 'true' as const,
      role: 'status' as const,
    },
    assertive: {
      'aria-live': 'assertive' as const,
      'aria-atomic': 'true' as const,
      role: 'alert' as const,
    },
    off: {
      'aria-live': 'off' as const,
    },
  },

  // Common announcements
  announcements: {
    loading: 'Loading content, please wait',
    loaded: 'Content loaded successfully',
    animationPaused: 'Animations paused',
    animationResumed: 'Animations resumed',
  },

  // Visually hidden but screen-reader accessible
  visuallyHidden: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden' as const,
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: '0',
  },
};

/**
 * ACCESSIBILITY PRESETS
 * Complete a11y configurations
 */
export const accessibilityPresets = {
  full: {
    reducedMotion: true,
    highContrast: false,
    focusVisible: true,
    skipLinks: true,
    screenReaderAnnouncements: true,
    keyboardNavigation: true,
    respectUserPreferences: true,
  },
  standard: {
    reducedMotion: true,
    highContrast: false,
    focusVisible: true,
    skipLinks: false,
    screenReaderAnnouncements: true,
    keyboardNavigation: true,
    respectUserPreferences: true,
  },
};

// ==========================================
// ADVANCED TECHNIQUES - Phase E
// ==========================================

/**
 * SVG PATH ANIMATIONS
 * stroke-dasharray and stroke-dashoffset animations
 */
export const svgPathAnimations = {
  draw: {
    drawIn: {
      initial: { pathLength: 0, opacity: 0 },
      animate: { pathLength: 1, opacity: 1 },
      transition: { 
        pathLength: { duration: motion.duration.dramatic, ease: motion.easing.appleDecelerate },
        opacity: { duration: motion.duration.fast },
      },
    },
  },
  stroke: {
    pulse: {
      strokeWidth: [2, 4, 2],
      transition: { duration: motion.duration.loop, repeat: Infinity },
    },
  },
};

/**
 * TEXT ANIMATIONS
 * Character-by-character and word reveals
 */
export const textAnimations = {
  character: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: motion.duration.base },
      stagger: 0.03,
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: motion.duration.base },
      stagger: 0.03,
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: motion.duration.base },
      stagger: 0.03,
    },
  },
  word: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: motion.duration.smooth },
      stagger: 0.1,
    },
  },
};

/**
 * SPRING PHYSICS
 * Realistic physics-based animations
 */
export const springPhysics = {
  presets: {
    gentle: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
      mass: 1,
    },
    bouncy: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 10,
      mass: 1,
    },
    stiff: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
      mass: 1,
    },
    wobbly: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 8,
      mass: 1,
    },
  },
};

/**
 * ADVANCED GESTURES
 * Drag, swipe configurations
 */
export const advancedGestures = {
  drag: {
    free: {
      drag: true,
      dragElastic: 0.2,
      dragMomentum: true,
    },
    horizontal: {
      drag: 'x' as const,
      dragElastic: 0.1,
      dragMomentum: true,
    },
    vertical: {
      drag: 'y' as const,
      dragElastic: 0.1,
      dragMomentum: true,
    },
  },
  swipe: {
    threshold: 50,
    velocityThreshold: 500,
  },
};

// ==========================================
// MOBILE OPTIMIZATION - Phase 1 (Quick Wins)
// ==========================================

/**
 * MOBILE-SPECIFIC UTILITIES
 * Touch targets, viewport fixes, performance optimizations
 */
export const mobile = {
  // Breakpoints
  breakpoints: {
    mobile: 768,      // Below 768px = mobile
    tablet: 1024,     // 768-1024 = tablet
    desktop: 1024,    // Above 1024 = desktop
  },

  // Touch Target Enforcement (WCAG 2.5.5)
  touchTargets: {
    // Minimum size (44x44px for iOS/Android)
    minimum: {
      width: '44px',
      height: '44px',
      minWidth: '44px',
      minHeight: '44px',
    },
    // Recommended size (48x48px for better UX)
    recommended: {
      width: '48px',
      height: '48px',
      minWidth: '48px',
      minHeight: '48px',
    },
    // Large (56x56px for primary actions)
    large: {
      width: '56px',
      height: '56px',
      minWidth: '56px',
      minHeight: '56px',
    },
  },

  // Viewport Units (Safari iOS compatible)
  viewport: {
    // Use dvh instead of vh for mobile (dynamic viewport height)
    height: {
      full: '100dvh',      // Safari-compatible full height
      half: '50dvh',
      screen: '100dvh',    // Respects mobile browser chrome
    },
    // Use dvw for width (less common issues)
    width: {
      full: '100dvw',
      screen: '100dvw',
    },
  },

  // Performance Optimizations
  performance: {
    // Reduce particle count on mobile
    particles: {
      mobile: 10,      // Reduced from 25
      desktop: 25,
    },
    // Disable expensive effects
    disableOnMobile: {
      parallax: true,
      particles: false,  // Keep but reduce count
      blur: true,        // Heavy filter
      shadows: false,    // Keep for depth
    },
    // Throttle intervals (more aggressive on mobile)
    throttle: {
      scroll: 32,        // ~30fps on mobile (vs 16ms on desktop)
      resize: 150,       // Slower resize throttle
      drag: 32,          // 30fps for drag
    },
  },

  // Overflow Prevention
  overflow: {
    // Prevent horizontal scroll
    preventHorizontal: {
      overflowX: 'hidden' as const,
      maxWidth: '100vw',
    },
    // Allow vertical scroll
    allowVertical: {
      overflowY: 'auto' as const,
    },
    // Combined
    safeContainer: {
      overflowX: 'hidden' as const,
      overflowY: 'auto' as const,
      maxWidth: '100vw',
    },
  },

  // Font Size Minimums (Readability)
  typography: {
    // Minimum font sizes on mobile
    minimums: {
      body: '16px',      // Prevents auto-zoom on iOS
      small: '14px',
      micro: '12px',     // Absolute minimum
    },
    // Line heights (more generous on mobile)
    lineHeight: {
      tight: '1.4',
      normal: '1.6',
      relaxed: '1.8',
    },
  },

  // Spacing Adjustments
  spacing: {
    // More generous tap spacing
    tapGap: '16px',      // Minimum gap between touch targets
    // Edge padding
    edge: {
      mobile: '16px',
      tablet: '24px',
    },
  },

  // Battery/Power Mode Detection
  batteryMode: {
    // Thresholds for battery-saving mode
    lowBatteryThreshold: 20,    // % - Enable low power mode below 20%
    criticalBatteryThreshold: 10, // % - Enable aggressive optimizations

    // Performance profiles based on battery
    profiles: {
      // Normal mode (battery > 20% or charging)
      normal: {
        particles: true,
        parallax: true,
        blur: true,
        animations: 'full' as const,
        throttle: 16,  // 60fps
      },
      // Low power mode (battery < 20%)
      lowPower: {
        particles: false,      // Disable particles
        parallax: false,       // Disable parallax
        blur: false,           // Disable blur filters
        animations: 'reduced' as const,
        throttle: 32,          // 30fps
      },
      // Critical mode (battery < 10%)
      critical: {
        particles: false,
        parallax: false,
        blur: false,
        animations: 'minimal' as const,
        throttle: 66,          // 15fps
      },
    },
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================