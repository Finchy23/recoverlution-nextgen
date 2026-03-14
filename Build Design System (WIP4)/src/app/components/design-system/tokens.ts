/**
 * RECOVERYOS DESIGN TOKENS
 *
 * Visual primitives: colors, surfaces.
 * Four hero primaries — each with semantic character:
 *   Purple  → Sovereignty / Identity / Boundary
 *   Cyan    → Awareness / Clarity / Connection
 *   Green   → Growth / Embodiment / Safety
 *   Amber   → Warmth / Attention / Caution
 *
 * For room recipes, motion families, easing, and governance → see doctrine.ts
 */

export const colors = {
  neutral: {
    black: '#0F0D1A',
    white: '#F9F8FF',
    gray: {
      50: '#F9F8FF', 100: '#F0EFF8', 200: '#E1DEF0', 300: '#C9C4D8',
      400: '#A89FB8', 500: '#8A8499', 600: '#6B677A', 700: '#4B495B',
      800: '#373541', 900: '#1F1D27', 950: '#0F0D1A',
    },
  },
  brand: {
    purple: {
      light: '#A89BFF', mid: '#8A7AFF', primary: '#6B52FF',
      dark: '#3E2BB8', deep: '#2A1F7A',
    },
  },
  accent: {
    cyan: { light: '#66F0E8', primary: '#00CCE0', mid: '#00B8CC', dark: '#1FB2A0', deep: '#0D8A7A' },
    blue: { light: '#7CB8FF', primary: '#4A90D9', dark: '#2D5F99' },
    green: { light: '#4AEDBA', primary: '#25D494', mid: '#20C088', dark: '#1BBF82', deep: '#148F62' },
  },
  status: {
    green: { bright: '#2FE6A6', mid: '#25D494', dark: '#1BBF82' },
    amber: { bright: '#FFB677', mid: '#E6973D', dark: '#CC7A20' },
    purple: { bright: '#A89BFF', mid: '#8A7AFF', dark: '#6B52FF' },
  },
  kbe: {
    knowing: { color: '#8A7AFF', label: 'Knowing', tag: 'K' },
    believing: { color: '#E6973D', label: 'Believing', tag: 'B' },
    embodying: { color: '#25D494', label: 'Embodying', tag: 'E' },
  },
  signature: {
    sacredOrdinary: '#D4C5B8',
    witnessRitual: '#8B9DC3',
    koanParadox: '#7C3AED',
    warmProvocation: '#E8A64C',
  },
} as const;

export const surfaces = {
  solid: { base: '#0F0D1A', elevated: '#1F1D27', raised: '#373541' },
  glass: {
    subtle: 'rgba(255,255,255,0.03)',
    light: 'rgba(255,255,255,0.06)',
    medium: 'rgba(255,255,255,0.08)',
    strong: 'rgba(255,255,255,0.12)',
    border: 'rgba(255,255,255,0.06)',
  },
} as const;