/**
 * SURFACE TOKENS — The Single Source of Truth
 *
 * Every surface-level design value lives here.
 * No component should hardcode a hex, a font stack, or an opacity.
 *
 * The glass speaks with one voice.
 *
 * ─── LAYER ───
 *
 * This file extends the brand tokens (colors, surfaces) from tokens.ts
 * with the room-level constants that all surfaces share:
 *   • Room colors (the deep blacks and foreground)
 *   • Typography stacks
 *   • The opacity scale (whisper → clear)
 *   • The type size scale (trace → display)
 *   • Canonical letter-spacing values
 *   • Shared layout constants
 *   • Motion re-exports for convenience
 *
 * Import this file, not individual hex values.
 */

import { colors, surfaces } from './tokens';
import { SURFACE_EASE, SURFACE_DURATION, STAGGER } from '../surfaces/useSurfaceArrival';

// ═══════════════════════════════════════════════════
// ROOM COLORS
// ═══════════════════════════════════════════════════

export const room = {
  /** The deepest black — immersive surfaces (ReadSurface, TalkSurface, etc.) */
  void: '#06050A',
  /** Deep shell black — page workbenches, sub-void backgrounds */
  deep: '#0A0812',
  /** Standard background — NavShell, LivingAtmosphere */
  base: colors.neutral.black,     // #0F0D1A
  /** Foreground — all text */
  fg: colors.neutral.white,       // #F9F8FF
  /** Elevated surface */
  elevated: surfaces.solid.elevated,  // #1F1D27

  // ── Mid-gray palette — wired to colors.neutral.gray (single source) ──
  /** Deepest mid-gray. Code values, tertiary labels, timestamps. */
  gray1: colors.neutral.gray[800],    // #373541
  /** Deep mid-gray. Units, secondary descriptions, section labels. */
  gray2: colors.neutral.gray[700],    // #4B495B
  /** Medium gray. Descriptions, metaphors, section notes. */
  gray3: colors.neutral.gray[600],    // #6B677A
  /** Lifted gray. Essence copy, de-emphasised body. */
  gray4: colors.neutral.gray[500],    // #8A8499
  /** Light gray. Card titles, readable secondary. */
  gray5: colors.neutral.gray[400],    // #A89FB8
} as const;

// ═══════════════════════════════════════════════════
// TYPOGRAPHY STACKS
// ═══════════════════════════════════════════════════

export const font = {
  /** Serif — Crimson Pro for body, titles, reading */
  serif: "'Crimson Pro', Georgia, serif",
  /** Sans — Inter for labels, eyebrows, controls */
  sans: "'Inter', sans-serif",
  /** Mono — SF Mono for code, values, tokens */
  mono: "'SF Mono', 'Fira Code', monospace",
} as const;

// ═══════════════════════════════════════════════════
// WEIGHT SCALE — Typographic Mass
// Four semantic stops covering the full design range.
// ═══════════════════════════════════════════════════

export const weight = {
  /** 300 — Light. Stream copy, reading passages, serif body. */
  light: 300 as const,
  /** 400 — Regular/Normal. Default body, fallback. */
  regular: 400 as const,
  /** 500 — Medium. Labels, controls, emphasis. */
  medium: 500 as const,
  /** 600 — Semibold. Section headers, strong anchors. */
  semibold: 600 as const,
} as const;

// ═══════════════════════════════════════════════════
// OPACITY SCALE — The Volume Dial
// Each name is a felt presence, not a number.
// ═══════════════════════════════════════════════════

export const opacity = {
  /** 0.03 — barely registers. Atmospheric glow denominators. */
  breath: 0.03,
  /** 0.04 — flicker. Sub-threshold awareness, ring accents. */
  flicker: 0.04,
  /** 0.05 — peripheral awareness. Depth threads, filaments. */
  whisper: 0.05,
  /** 0.06 — ghost chrome. Page counters, sealed states. */
  ghost: 0.06,
  /** 0.08 — present but not demanding. Day labels, gesture hints. */
  trace: 0.08,
  /** 0.10 — navigational murmurs. Turn blocks, subtle controls. */
  murmur: 0.10,
  /** 0.12 — quiet presence. Scene labels, secondary actions. */
  quiet: 0.12,
  /** 0.15 — readable but ambient. Gesture cues, integration pips. */
  ambient: 0.15,
  /** 0.18 — emerging. Instrument outlines, progress markers. */
  emerging: 0.18,
  /** 0.20 — clearly there. Rest dots, lede blocks, sub-copy. */
  present: 0.20,
  /** 0.25 — comfortable presence. Breathing dots, cue indicators. */
  gentle: 0.25,
  /** 0.28 — lifted. Lede block opacity, italic emphasis. */
  lifted: 0.28,
  /** 0.30 — readable. Marks, pull quotes. */
  spoken: 0.30,
  /** 0.35 — primary reading. Canopy text, prompts. */
  voice: 0.35,
  /** 0.40 — steady emphasis. Data readouts, active controls. */
  steady: 0.40,
  /** 0.50 — body content. Reading paragraphs. */
  body: 0.50,
  /** 0.55 — warm body. Mid-range engine energy. */
  warm: 0.55,
  /** 0.58 — landing paragraphs. Slightly brighter body. */
  land: 0.58,
  /** 0.60 — strong body. Secondary headlines, active labels. */
  strong: 0.60,
  /** 0.70 — prominent. Titles in context, active indicators. */
  bright: 0.70,
  /** 0.80 — headline, focal element. */
  clear: 0.80,
  /** 0.85 — display. Hero titles, primary anchors. */
  full: 0.85,
  /** 0.90 — near-solid. Focused input, critical labels. */
  solid: 0.90,
} as const;

// ═══════════════════════════════════════════════════
// TYPE SIZE SCALE — The Whisper Gradient
// From barely-there traces to display headlines.
// ═══════════════════════════════════════════════════

export const typeSize = {
  /** 4px — sub-trace. Tiny decorative data, thread dots. */
  sub: '4px',
  /** 5px — barely-there. Hold-to-sync labels, return-to-stream. */
  trace: '5px',
  /** 5.5px — between trace and whisper. Micro player annotations. */
  traceUp: '5.5px',
  /** 6px — scene type labels, seal/skip controls. */
  whisper: '6px',
  /** 6.5px — between whisper and micro. Compact player detail. */
  whisperUp: '6.5px',
  /** 7px — gestures, page counters, depth markers. */
  micro: '7px',
  /** 8px — eyebrows, marks, modality signals. */
  label: '8px',
  /** 9px — detail labels, transition identities, metadata. */
  detail: '9px',
  /** 10px — sub-copy, captions. */
  caption: '10px',
  /** 11px — notes, descriptions, secondary meta. */
  note: '11px',
  /** 12px  small body, governance readouts, section notes. */
  small: '12px',
  /** 13px — descriptions, lede text. */
  reading: '13px',
  /** 14px — lede italic, introspection prompts. */
  lede: '14px',
  /** 15px — reading-large, italic decrees, principles. */
  prose: '15px',
  /** 16px — body reading, primary content. */
  body: '16px',
  /** 17px — elevated body, shell labels. */
  elevated: '17px',
  /** 18px — pull quotes, resonant truths. */
  pull: '18px',
  /** 22px — stream headlines, player dominant readout. */
  stream: '22px',
  /** 24px — page titles, open blocks. */
  title: '24px',
  /** 28px — hero headlines. */
  display: '28px',
} as const;

// ═══════════════════════════════════════════════════
// LETTER SPACING — Tracking Tokens
// ═════════════════════════════════════════════════

export const tracking = {
  /** -0.01em — optical tightening for large serif display */
  tight_neg: '-0.01em',
  /** 0em — zero tracking, natural spacing */
  none: '0em',
  /** 0.01em — hairline tracking, barely perceptible */
  hair: '0.01em',
  /** 0.02em — body text, minimal tightening */
  body: '0.02em',
  /** 0.04em — monospace values, code readouts */
  code: '0.04em',
  /** 0.06em — data labels, instrument readouts */
  data: '0.06em',
  /** 0.08em — compact metadata, room attribute labels */
  compact: '0.08em',
  /** 0.10em — compact labels, modality signals */
  label: '0.10em',
  /** 0.12em — seed text, tight labels */
  tight: '0.12em',
  /** 0.15em — trace labels, return-to-stream */
  snug: '0.15em',
  /** 0.16em — drawer labels, compact eyebrows */
  shelf: '0.16em',
  /** 0.18em — law markers, spread labels */
  spread: '0.18em',
  /** 0.20em — gestures, controls, action words */
  normal: '0.20em',
  /** 0.22em — lifted labels, thread markers */
  lift: '0.22em',
  /** 0.25em — scene labels, day markers */
  wide: '0.25em',
  /** 0.28em — eyebrows, mark blocks */
  eyebrow: '0.28em',
  /** 0.30em — ceremonial, talk-surface breath labels */
  breath: '0.30em',
} as const;

// ═══════════════════════════════════════════════════
// LINE HEIGHT — Leading Tokens
// The vertical breath of text. Tighter for display, looser for reading.
// ═══════════════════════════════════════════════════

export const leading = {
  /** 1.0 — flush. Decorative numerals, single-line badges. */
  none: 1,
  /** 1.1 — display. Large hero copy, stats. */
  display: 1.1,
  /** 1.15 — tight. Page titles, hero headlines. */
  tight: 1.15,
  /** 1.2 — heading. Section headlines, display serif. */
  heading: 1.2,
  /** 1.25 — snug. Subtitles, law headers. */
  snug: 1.25,
  /** 1.3 — compact. Headings, labels, short strings. */
  compact: 1.3,
  /** 1.35 — settled. Reframed copy, composed headlines. */
  settled: 1.35,
  /** 1.4 — firm. Compact body, notes, cards. */
  firm: 1.4,
  /** 1.45 — natural. Comfortable compact reading. */
  natural: 1.45,
  /** 1.5 — body. Standard reading, default paragraphs. */
  body: 1.5,
  /** 1.6 — relaxed. Descriptions, comfortable paragraphs. */
  relaxed: 1.6,
  /** 1.65 — reading. Long-form comfortable reading. */
  reading: 1.65,
  /** 1.7 — generous. Ledes, intro paragraphs, reflective. */
  generous: 1.7,
  /** 1.8 — open. Journal entries, spacious contemplation. */
  open: 1.8,
  /** 1.9 — breath. Most spacious reading, copy-style. */
  breath: 1.9,
  /** 2.0 — double. Vocabulary lists, ceremonial spacing. */
  double: 2,
} as const;

// ═══════════════════════════════════════════════════
// LAYER — Z-index stacking order
// Semantic names for the vertical glass stack.
// Every zIndex in the app reads from here.
// ═══════════════════════════════════════════════════

export const layer = {
  /** 0 — background canvas (LivingAtmosphere) */
  canvas: 0,
  /** 1 — base content level (main, surface backgrounds) */
  base: 1,
  /** 2 — surface content elements (controls, orb rings) */
  content: 2,
  /** 3 — surface raised elements (labels, actions, threads) */
  raised: 3,
  /** 4 — surface overlay (input areas, bottom fade controls) */
  overlay: 4,
  /** 5 — surface scrims (top/bottom gradient fades) */
  scrim: 5,
  /** 6 — surface floating elements (counters, indicators) */
  float: 6,
  /** 8 — surface elevated UI (page switchers, drawers) */
  lifted: 8,
  /** 10 — surface pinnacle (sticky headers, top-level controls) */
  pinnacle: 10,
  /** 15 — player base layer (inactive player region) */
  playerBase: 15,
  /** 20 — journey cue / full-surface overlay */
  cue: 20,
  /** 22 — player stream chrome */
  playerStream: 22,
  /** 25 — player / video prominent chrome */
  playerChrome: 25,
  /** 30 — player anchor (bottom orb cluster) */
  playerAnchor: 30,
  /** 40 — navigation chrome (NavShell bar, player controls) */
  nav: 40,
  /** 50 — navigation overlay (menus, drawers, modals) */
  navOverlay: 50,
} as const;

// ═══════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════

export const layout = {
  /** Bottom clearance for the orb / anchor */
  orbClearance: 110,
  /** Standard content padding as percentage */
  contentPadX: '12%',
  /** Standard max-width for reading content */
  readingMaxWidth: '28rem',  // max-w-md
  /** Standard max-width for narrow content */
  narrowMaxWidth: '24rem',   // max-w-sm
} as const;

// ═══════════════════════════════════════════════════
// MOTION RE-EXPORTS — for convenience
// ═══════════════════════════════════════════════════

/** The room ease curve — CSS string for transition properties */
const ROOM_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const timing = {
  /** The room ease — spring-like emergence curve (CSS string) */
  curve: ROOM_EASE,
  /** Array form for programmatic use (e.g. Web Animations API) */
  easeArray: SURFACE_EASE as readonly [number, number, number, number],
  /** Alias — backward-compatible name for easeArray */
  ease: SURFACE_EASE as readonly [number, number, number, number],
  /** Standard surface transition duration (seconds, numeric) */
  duration: SURFACE_DURATION,
  /** Content stagger timing */
  stagger: STAGGER,

  // ─── Duration scale (CSS strings) ───

  dur: {
    /** 0.08s — sub-frame, scrubber tracking */
    micro: '0.08s',
    /** 0.1s — instantaneous feedback */
    instant: '0.1s',
    /** 0.12s — tactile snap (waveform, seek) */
    snap: '0.12s',
    /** 0.15s — quick positional (tooltip, thumb) */
    quick: '0.15s',
    /** 0.3s — brisk UI response */
    brisk: '0.3s',
    /** 0.4s — responsive element change */
    fast: '0.4s',
    /** 0.5s — moderate pendulum / pan */
    moderate: '0.5s',
    /** 0.6s — standard state shift */
    mid: '0.6s',
    /** 0.7s — component-level transition */
    flow: '0.7s',
    /** 0.8s — settling atmospheric shift */
    slow: '0.8s',
    /** 0.9s — surface arrival */
    surface: '0.9s',
    /** 1.2s — deep surface emergence */
    emerge: '1.2s',
    /** 1.6s — slow fade (video reveal) */
    reveal: '1.6s',
    /** 2s — deep atmospheric / canvas breathing */
    breath: '2s',
  },

  // ─── Pre-composed CSS transition strings ───

  t: {
    /** Quick response: all 0.4s room-ease */
    respond: `all 0.4s ${ROOM_EASE}`,
    /** Standard shift: all 0.6s room-ease */
    shift: `all 0.6s ${ROOM_EASE}`,
    /** Component flow: all 0.7s room-ease */
    flow: `all 0.7s ${ROOM_EASE}`,
    /** Settling transition: all 0.8s room-ease */
    settle: `all 0.8s ${ROOM_EASE}`,
    /** Surface emergence: all 1.2s room-ease */
    arrive: `all 1.2s ${ROOM_EASE}`,
    /** Color transition: color 0.8s room-ease */
    color: `color 0.8s ${ROOM_EASE}`,
    /** Color mid transition: color 0.6s room-ease */
    colorMid: `color 0.6s ${ROOM_EASE}`,
    /** Color + opacity: color 0.8s, opacity 0.8s */
    colorOpacity: 'color 0.8s, opacity 0.8s',
    /** Opacity settling: opacity 0.8s room-ease */
    fade: `opacity 0.8s ${ROOM_EASE}`,
    /** Background atmosphere: background 2s room-ease */
    atmosphere: `background 2s ${ROOM_EASE}`,
    /** Background slow ease: background 2s ease */
    atmosphereEase: 'background 2s ease',
    /** Opacity atmosphere: opacity 2s ease */
    fadeAtmosphere: 'opacity 2s ease',
    /** Box-shadow atmosphere: box-shadow 2s ease */
    glowAtmosphere: 'box-shadow 2s ease',

    // ─── Ease-curve variants (CSS `ease`) ───

    /** all 0.3s ease — brisk UI snap */
    easeBrisk: 'all 0.3s ease',
    /** all 0.4s ease — quick response */
    easeRespond: 'all 0.4s ease',
    /** all 0.5s ease — moderate */
    easeModerate: 'all 0.5s ease',
    /** all 0.6s ease — standard shift */
    easeShift: 'all 0.6s ease',
    /** all 0.8s ease — settling */
    easeSettle: 'all 0.8s ease',
    /** all 2s ease — deep atmospheric */
    easeAtmosphere: 'all 2s ease',
    /** color 0.5s ease */
    colorEase: 'color 0.5s ease',
    /** color 0.6s ease */
    colorShift: 'color 0.6s ease',
    /** opacity 0.3s ease */
    fadeBrisk: 'opacity 0.3s ease',
    /** opacity 0.5s ease */
    fadeModerate: 'opacity 0.5s ease',
    /** opacity 0.6s ease */
    fadeMid: 'opacity 0.6s ease',
    /** opacity 0.8s ease */
    fadeSettle: 'opacity 0.8s ease',
    /** opacity 1s ease */
    fadeSlow: 'opacity 1s ease',
    /** opacity 1.5s ease */
    fadeEmerge: 'opacity 1.5s ease',
    /** background 0.6s ease */
    bgShift: 'background 0.6s ease',
    /** background 0.8s ease */
    bgSettle: 'background 0.8s ease',
    /** background 1s ease */
    bgSlow: 'background 1s ease',
    /** border-color 0.6s ease */
    borderMid: 'border-color 0.6s ease',
    /** border-color 0.8s ease */
    borderSettle: 'border-color 0.8s ease',
    /** width 0.3s ease, height 0.3s ease — resize brisk */
    resizeBrisk: 'width 0.3s ease, height 0.3s ease',
    /** width 0.6s ease, height 0.6s ease, background 0.6s ease — morph mid */
    morphMid: 'width 0.6s ease, height 0.6s ease, background 0.6s ease',
    /** color 0.6s ease, opacity 0.6s ease */
    colorOpacityMid: 'color 0.6s ease, opacity 0.6s ease',
    /** width 0.5s ease, height 0.5s ease, transform 0.3s ease */
    resizeTransform: 'width 0.5s ease, height 0.5s ease, transform 0.3s ease',
    /** border-color 0.5s ease */
    borderModerate: 'border-color 0.5s ease',
    /** background 0.5s ease */
    bgModerate: 'background 0.5s ease',
    /** width 0.5s ease-out */
    widthModerate: 'width 0.5s ease-out',
    /** transform 4s ease-in-out — deep breathing */
    breathTransform: 'transform 4s ease-in-out',
    /** transform 3s ease-in-out — breathing */
    breathTransformMid: 'transform 3s ease-in-out',
    /** filter 0.1s linear — sub-frame smoothing */
    filterSnap: 'filter 0.1s linear',
    /** filter 0.8s ease — slow filter shift */
    filterSettle: 'filter 0.8s ease',
    /** opacity 1.5s ease, filter 1.5s ease — slow reveal with defocus */
    fadeFilterEmerge: 'opacity 1.5s ease, filter 1.5s ease',
    /** opacity 2s ease, filter 2s ease — atmospheric reveal with defocus */
    fadeFilterAtmosphere: 'opacity 2s ease, filter 2s ease',
    /** top 0.25s ease — snappy position shift */
    positionSnap: 'top 0.25s ease',
  },
} as const;

// ═══════════════════════════════════════════════════
// RADII — Border radius tokens
// ═══════════════════════════════════════════════════

export const radii = {
  /** 1px — indicator dots, thin progress bars */
  dot: 1,
  /** 0.75px — sub-pixel rounding for micro elements */
  micro: 0.75,
  /** 1.5px — bar caps, thick indicators */
  bar: 1.5,
  /** 2px — slight rounding */
  pill: 2,
  /** 12px — desktop device chrome inner panel */
  frameInner: 12,
  /** 16px — desktop device chrome outer shell */
  frame: 16,
  /** 20px — large pill shapes */
  round: 20,
  /** 38px — phone device chrome inner panel */
  chromeInner: 38,
  /** 48px — phone device chrome outer shell */
  chromeOuter: 48,
  /** 999px — maximum pill (collapsed elements) */
  full: 999,
  /** 50% — perfect circle */
  circle: '50%' as const,
} as const;

// ═══════════════════════════════════════════════════
// GLAZE — White overlay scale (frosted glass on dark room)
// ═══════════════════════════════════════════════════

export const glaze = {
  /** 0.01 — barely perceptible overlay */
  trace:   'rgba(255,255,255,0.01)',
  /** 0.02 — track backgrounds, minimal surfaces */
  faint:   'rgba(255,255,255,0.02)',
  /** 0.025 — gradient midpoint */
  whisper: 'rgba(255,255,255,0.025)',
  /** 0.03 — subtle surfaces, inset rings */
  thin:    'rgba(255,255,255,0.03)',
  /** 0.035 — gradient midpoint */
  mist:    'rgba(255,255,255,0.035)',
  /** 0.04 — visible surfaces, separator rings */
  veil:    'rgba(255,255,255,0.04)',
  /** 0.06 — prominent rings, active separators */
  frost:   'rgba(255,255,255,0.06)',
  /** 0.07 — soft decorative text */
  haze:    'rgba(255,255,255,0.07)',
  /** 0.08 — active surfaces, visible elements */
  glint:   'rgba(255,255,255,0.08)',
  /** 0.12 — highlighted, prominent surfaces */
  sheen:   'rgba(255,255,255,0.12)',
  /** 0.1 — barely-there text, ghost labels */
  ember:   'rgba(255,255,255,0.1)',
  /** 0.15 — subdued labels, dimmed metadata */
  muted:   'rgba(255,255,255,0.15)',
  /** 0.2 — secondary text, recessed info */
  dim:     'rgba(255,255,255,0.2)',
  /** 0.25 — tertiary labels, section heads */
  smoke:   'rgba(255,255,255,0.25)',
  /** 0.3 — inactive controls, deselected text */
  silver:  'rgba(255,255,255,0.3)',
  /** 0.35 — mid-range chrome text */
  pewter:  'rgba(255,255,255,0.35)',
  /** 0.4 — readable secondary text */
  tin:     'rgba(255,255,255,0.4)',
  /** 0.45 — near-opaque overlay */
  milk:    'rgba(255,255,255,0.45)',
  /** 0.5 — half-luminous text */
  half:    'rgba(255,255,255,0.5)',
  /** 0.6 — prominent, active chrome text */
  bright:  'rgba(255,255,255,0.6)',
} as const;

// ═══════════════════════════════════════════════════
// DEPTH — Black shadow/void scale
// ═══════════════════════════════════════════════════

export const depth = {
  /** rgba(0,0,0,0.5) — moderate drop shadow */
  shadow: 'rgba(0,0,0,0.5)',
  /** rgba(0,0,0,0.6) — device chrome bottom edge */
  edge:   'rgba(0,0,0,0.6)',
  /** rgba(0,0,0,0.7) — deep device chrome shadow */
  well:   'rgba(0,0,0,0.7)',
} as const;

// ═══════════════════════════════════════════════════
// VOID — Room-background (6,5,10) vignette/fade scale
// ═══════════════════════════════════════════════════

export const void_ = {
  /** 0.2 — lightest vignette edge */
  mist:    'rgba(6,5,10,0.2)',
  /** 0.3 — orb-clearance gradient, soft bottom fade */
  haze:    'rgba(6,5,10,0.3)',
  /** 0.35 — semi-opaque overlay (scrubber backdrop) */
  fog:     'rgba(6,5,10,0.35)',
  /** 0.45 — mid-range radial vignette */
  shade:   'rgba(6,5,10,0.45)',
  /** 0.5 — medium vignette / radial edge */
  dim:     'rgba(6,5,10,0.5)',
  /** 0.6 — strong gradient fade / bottom edge */
  deep:    'rgba(6,5,10,0.6)',
  /** 0.7 — heavy gradient terminus / side scrim */
  abyss:   'rgba(6,5,10,0.7)',
  /** 0.85 — near-opaque backdrop (player stream) */
  shroud:  'rgba(6,5,10,0.85)',
  /** 0.9 — almost-solid bottom terminus */
  curtain: 'rgba(6,5,10,0.9)',
  /** 0.95 — near-solid terminus */
  seal:    'rgba(6,5,10,0.95)',
  /** 1.0 — fully opaque room void */
  solid:   'rgba(6,5,10,1)',
} as const;

// ═══════════════════════════════════════════════════
// SIGNAL — Recovery-domain semantic color palette
// Used for data viz, status indicators, domain categories.
// ═══════════════════════════════════════════════════

export const signal = {
  /** #A8B5FF — Body/clarity domain, biometric readouts */
  clarity:  '#A8B5FF',
  /** #FFB088 — Energy/processing, amber warmth */
  energy:   '#FFB088',
  /** #80C8A0 — Balance/groundedness, embodied green */
  anchor:   '#80C8A0',
  /** #FF6B6B — Friction/danger, raw red */
  friction: '#FF6B6B',
  /** #B8A0FF — Mind/therapeutic, soft violet */
  mind:     '#B8A0FF',
  /** #FF8EC4 — Safety architecture, rose */
  safe:     '#FF8EC4',
  /** #FFE088 — Mid-integration, warm gold */
  warm:     '#FFE088',
  /** #B0A0E0 — Insight fallback, lavender */
  insight:  '#B0A0E0',
  /** #A78BFA — Meditation/drift/parasympathetic, violet */
  drift:    '#A78BFA',
  /** #808080 — Neutral fallback (atom defaults) */
  neutral:  '#808080',
  /** #AAAAAA — Light neutral fallback (atom accent defaults) */
  neutralLight: '#AAAAAA',
  /** #6488C0 — Entrance beat, steel blue */
  entrance: '#6488C0',
  /** #C8A064 — Friction beat, warm ochre */
  frictionBeat: '#C8A064',
  /** #50B478 — Resolution beat, living green */
  resolution: '#50B478',
} as const;

// ═══════════════════════════════════════════════════
// REFRACT — Blur scale (light bending through glass)
// Used for both `filter` and `backdropFilter`.
// ═══════════════════════════════════════════════════

export const refract = {
  /** 0px — sharp / animation end-state */
  clear:   'blur(0px)',
  /** 1px — barely perceptible softening */
  subtle:  'blur(1px)',
  /** 2px — whisper defocus, gentle backdrop */
  whisper: 'blur(2px)',
  /** 3px — soft entrance/exit, light glass */
  soft:    'blur(3px)',
  /** 4px — gentle glass, scrubber backdrop */
  gentle:  'blur(4px)',
  /** 6px — medium defocus, transition states */
  medium:  'blur(6px)',
  /** 8px — haze entrance, visible glass */
  haze:    'blur(8px)',
  /** 12px — frosted glass, prominent backdrop */
  frost:   'blur(12px)',
  /** 20px — deep glass, nav-level backdrop */
  deep:    'blur(20px)',
  /** 25px — dense ambient, atmospheric layer */
  dense:   'blur(25px)',
  /** 30px — thick ambient, background washes */
  thick:   'blur(30px)',
  /** 40px — heavy glass, player-level backdrop */
  heavy:   'blur(40px)',
  /** 60px — extreme diffusion, cue atmospherics */
  extreme: 'blur(60px)',

  // ── Composed backdrop presets (blur + saturate) ──

  /** Nav chrome: blur(20px) saturate(180%) */
  nav:    'blur(20px) saturate(180%)',
  /** Player stream: blur(40px) saturate(120%) */
  player: 'blur(40px) saturate(120%)',
} as const;

// ═══════════════════════════════════════════════════
// GLOW — Box-shadow generators for point light effects
// ═══════════════════════════════════════════════════

export const glow = {
  /** Flexible single-layer: `0 0 {r}px {color}{hex}` */
  point: (c: string, r = 8, hex = '30') => `0 0 ${r}px ${c}${hex}`,
  /** Pre-formed color (rgba / glass()): `0 0 {r}px {color}` — no hex suffix */
  cast: (c: string, r = 8) => `0 0 ${r}px ${c}`,
  /** Inset glow: `inset 0 0 {r}px {color}{hex}` */
  inset: (c: string, r = 12, hex = '20') => `inset 0 0 ${r}px ${c}${hex}`,
  /** 1px inset ring: `inset 0 0 0 1px {color}{hex}` */
  ring: (c: string, hex = '10') => `inset 0 0 0 1px ${c}${hex}`,
  /** 1px inset ring with pre-formed color (rgba / glass()): `inset 0 0 0 1px {color}` */
  ringCast: (c: string) => `inset 0 0 0 1px ${c}`,
  /** Device chrome outer shell shadow (5-layer compound) */
  chrome: (atmosphereColor: string) => [
    `0 0 200px ${atmosphereColor}`,
    `0 80px 160px ${depth.well}`,
    `inset 0 0 0 1px ${glaze.thin}`,
    `inset 0 1px 0 ${glaze.thin}`,
    `inset 0 -1px 0 ${depth.edge}`,
  ].join(', '),
  /** Device chrome inner atmospheric glow (dual inset) */
  innerAtmosphere: (deep: string, mid: string) =>
    `inset 0 0 80px ${deep}, inset 0 0 160px ${mid}`,
  /** 0 0 6px — dot/indicator glow */
  dot: (c: string, hex = '30') => `0 0 6px ${c}${hex}`,
  /** 0 0 8px — subtle accent glow */
  soft: (c: string, hex = '20') => `0 0 8px ${c}${hex}`,
  /** 0 0 10px — standard mid-range glow */
  mid: (c: string, hex = '30') => `0 0 10px ${c}${hex}`,
  /** 0 0 12px — present/warm glow */
  warm: (c: string, hex = '40') => `0 0 12px ${c}${hex}`,
  /** 0 0 16px — strong visible glow */
  strong: (c: string, hex = '30') => `0 0 16px ${c}${hex}`,
  /** Two-layer halo: inner bright + outer diffuse spread */
  halo: (c: string, innerR = 12, outerR = 24, innerHex = '40', outerHex = '15') =>
    `0 0 ${innerR}px ${c}${innerHex}, 0 0 ${outerR}px ${c}${outerHex}`,
  /** Wide atmospheric halo — large-scale ambient */
  atmosphere: (c: string) => `0 0 28px ${c}20, 0 0 60px ${c}0a`,
} as const;

// ═══════════════════════════════════════════════════
// GLOW HELPERS — Radial gradient generators
// ═══════════════════════════════════════════════════

/** Convert any hex token + opacity to an rgba string.
 *  The fundamental building block for all translucent hero color usage.
 *  Example: glass(colors.brand.purple.primary, 0.35) → 'rgba(107, 82, 255, 0.35)'
 */
export function glass(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Atmospheric radial glow behind content */
export function glowRadial(
  color: string,
  intensityHex = '04',
  width = '65%',
  height = '50%',
  centerY = '35%',
): string {
  return `radial-gradient(ellipse ${width} ${height} at 50% ${centerY}, ${color}${intensityHex} 0%, transparent 70%)`;
}

/** Top fade — dark room fades in from top */
export function fadeTop(height = 80): React.CSSProperties {
  return {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height,
    background: `linear-gradient(to bottom, ${room.void}, transparent)`,
    zIndex: layer.scrim,
    pointerEvents: 'none' as const,
  };
}

/** Bottom fade — dark room + orb territory */
export function fadeBottom(extra = 50): React.CSSProperties {
  return {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: layout.orbClearance + extra,
    background: `linear-gradient(to bottom, transparent, ${room.void} 55%)`,
    zIndex: layer.scrim,
    pointerEvents: 'none' as const,
  };
}

/** Luminous filament — the light seam between sections */
export function filament(color: string, direction: 'vertical' | 'horizontal' = 'vertical'): React.CSSProperties {
  const isV = direction === 'vertical';
  return {
    width: isV ? 0.5 : undefined,
    height: isV ? 24 : 0.5,
    background: `linear-gradient(${isV ? 'to bottom' : 'to right'}, transparent, ${color}10, transparent)`,
  };
}

// ═══════════════════════════════════════════════════
// COMPOSED TYPOGRAPHY — Pre-built style objects
// ═══════════════════════════════════════════════════

export const type = {
  /** Eyebrow — 8px Inter, 500, 0.28em tracking */
  eyebrow: (color: string) => ({
    fontFamily: font.sans,
    fontSize: typeSize.label,
    fontWeight: weight.medium,
    letterSpacing: tracking.eyebrow,
    textTransform: 'uppercase' as const,
    color,
    opacity: opacity.spoken,
  }),

  /** Scene label — 6px Inter, 500, 0.25em */
  sceneLabel: (color: string) => ({
    fontFamily: font.sans,
    fontSize: typeSize.whisper,
    fontWeight: weight.medium,
    letterSpacing: tracking.wide,
    textTransform: 'uppercase' as const,
    color,
    opacity: opacity.quiet,
  }),

  /** Gesture — 7px Inter, 400, 0.20em */
  gesture: (color: string) => ({
    fontFamily: font.sans,
    fontSize: typeSize.micro,
    fontWeight: weight.regular,
    letterSpacing: tracking.normal,
    textTransform: 'uppercase' as const,
    color,
    opacity: opacity.ambient,
  }),

  /** Trace — 5px Inter, 400, 0.15em (barely-there) */
  trace: (color: string) => ({
    fontFamily: font.sans,
    fontSize: typeSize.trace,
    fontWeight: weight.regular,
    letterSpacing: tracking.snug,
    textTransform: 'uppercase' as const,
    color,
    opacity: opacity.ghost,
  }),

  /** Body narrative — Crimson Pro, 300, 1.9 line-height */
  narrative: {
    fontFamily: font.serif,
    fontSize: 'clamp(15px, 3.8vw, 19px)',
    fontWeight: weight.light,
    lineHeight: leading.breath,
    color: room.fg,
    opacity: opacity.body,
  },

  /** Sub-copy — Crimson Pro italic, 300, 1.6 */
  subCopy: {
    fontFamily: font.serif,
    fontSize: 'clamp(11px, 2.8vw, 14px)',
    fontWeight: weight.light,
    fontStyle: 'italic' as const,
    lineHeight: leading.relaxed,
    color: room.fg,
    opacity: opacity.present,
  },

  /** Prompt — Crimson Pro italic, 300 (for introspection) */
  prompt: {
    fontFamily: font.serif,
    fontSize: 'clamp(14px, 3.5vw, 18px)',
    fontWeight: weight.light,
    fontStyle: 'italic' as const,
    lineHeight: leading.generous,
    color: room.fg,
    opacity: opacity.voice,
  },

  /** Input — Crimson Pro, 300 (for journaling) */
  input: {
    fontFamily: font.serif,
    fontSize: 'clamp(14px, 3.5vw, 17px)',
    fontWeight: weight.light,
    lineHeight: leading.open,
    color: room.fg,
    opacity: opacity.body + 0.05,
  },

  /** Seed — Inter, 500, 0.12em (the real-world instruction) */
  seed: (color: string) => ({
    fontFamily: font.sans,
    fontSize: typeSize.label,
    fontWeight: weight.medium,
    letterSpacing: tracking.tight,
    color,
    opacity: opacity.present - 0.02,
    textAlign: 'center' as const,
    lineHeight: leading.relaxed,
  }),

  /** KBE label — Inter, 400, 7px */
  kbeLabel: {
    fontFamily: font.sans,
    fontSize: typeSize.micro,
    fontWeight: weight.regular,
    color: room.fg,
    opacity: opacity.murmur,
  },
} as const;

// ═══════════════════════════════════════════════════
// RE-EXPORTS — so consumers only need one import
// ═══════════════════════════════════════════════════

/** Brand tokens pass-through */
export { colors, surfaces } from './tokens';