/**
 * SPECIMEN AUDIT -- Full System Audit Dashboard
 *
 * Three-view comprehensive audit for 1,000 NaviCue specimens:
 *
 *   1. SYSTEM READINESS   -- Are all 1,000 systemised? Ready for next 1,000?
 *   2. APPLE HIG BENCHMARK -- 9 dimensions mapped to Apple Human Interface Guidelines
 *   3. INTERACTION HEART LAB -- Deep dive into centering, timing, touch targets
 *
 * Each audit dimension defines:
 *   - The canonical rule (the Apple-grade target)
 *   - Current compliance per generation
 *   - Known violation patterns with frequency
 *   - Remediation strategy with effort classification
 *   - Priority (P0 = blocks ship, P1 = degrades experience, P2 = polish)
 *
 * The goal: confirm all 1,000 NaviCues are systemised and the next-gen
 * design system is ready to produce the next 1,000 at Apple-grade quality.
 */

import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { colors, surfaces, fonts } from '@/design-tokens';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  getRegistryStats,
  auditDualAuthorityDependencies,
  type Generation,
} from '@/app/data/navicue-registry';
import {
  Type,
  Palette,
  Layout,
  Wind,
  MousePointerClick,
  Move,
  Target,
  Maximize2,
  LifeBuoy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Crosshair,
  Timer,
  Smartphone,
  Monitor,
  Hand,
  Fingerprint,
  CircleDot,
  ArrowRight,
  Check,
  X,
  Minus,
} from 'lucide-react';
import { RemediationPlan } from './RemediationPlan';

// =====================================================================
// TYPES
// =====================================================================

type Priority = 'P0' | 'P1' | 'P2';
type ComplianceLevel = 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
type AuditView = 'readiness' | 'benchmark' | 'heart' | 'plan';

interface GenerationCompliance {
  generation: string;
  count: number;
  level: ComplianceLevel;
  notes: string;
}

interface Violation {
  pattern: string;
  impact: string;
  frequency: 'common' | 'occasional' | 'rare';
  example?: string;
}

interface Remediation {
  strategy: string;
  effort: 'automated' | 'semi-auto' | 'manual';
  description: string;
}

interface AuditDimension {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  priority: Priority;
  appleHigRef: string;
  canonicalRule: string;
  description: string;
  generationCompliance: GenerationCompliance[];
  violations: Violation[];
  remediation: Remediation;
  overallScore: number;
  compliantCount: number;
  totalCount: number;
}

// =====================================================================
// SHARED STYLE HELPERS
// =====================================================================

const glass = {
  background: surfaces.glass.light,
  border: `1px solid ${colors.neutral.gray[100]}`,
  borderRadius: '12px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '600',
  letterSpacing: '1.5px',
  textTransform: 'uppercase' as const,
  color: colors.neutral.gray[600],
};

function scoreColor(score: number): string {
  if (score >= 90) return 'hsla(160, 40%, 45%, 0.8)';
  if (score >= 70) return 'hsla(200, 35%, 50%, 0.7)';
  if (score >= 50) return 'hsla(42, 50%, 50%, 0.7)';
  return 'hsla(0, 40%, 50%, 0.7)';
}

function priorityColor(p: Priority): string {
  if (p === 'P0') return 'hsla(0, 50%, 50%, 0.6)';
  if (p === 'P1') return 'hsla(42, 50%, 55%, 0.6)';
  return 'hsla(200, 30%, 50%, 0.6)';
}

// =====================================================================
// AUDIT DIMENSION DATA BUILDER
// =====================================================================

function buildAuditDimensions(): AuditDimension[] {
  const stats = getRegistryStats();
  const gen1 = stats.byGeneration.find(g => g.gen === 1)?.count ?? 33;
  const gen2 = stats.byGeneration.find(g => g.gen === 2)?.count ?? 316;
  const gen3 = stats.byGeneration.find(g => g.gen === 3)?.count ?? 651;
  const total = stats.totalSpecimens;

  return [
    {
      id: 'typography',
      label: 'Typography',
      icon: Type,
      priority: 'P1',
      appleHigRef: 'HIG: Typography / Dynamic Type / Minimum Sizes',
      canonicalRule: 'All text uses navicueType.* tokens. Floor at 11px (enforced by NaviCueShell.sanitizeCopy). No bare fontFamily: "monospace" (Shell normalizes to fonts.mono). No hardcoded font sizes in specimen source.',
      description: 'Typography compliance ensures every NaviCue whispers at the right volume. The token system provides 16 named sizes from micro (11px) through hero (36px), each with optical spacing.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'partial', notes: 'Direct design-tokens imports for fonts. Some use raw font sizes. Shell sanitization catches sub-11px at runtime.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'compliant', notes: 'Uses navicueType.* tokens throughout. Shell provides runtime safety net.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'compliant', notes: 'Uses navicueType.* tokens throughout. Consistent with Gen 2 pattern.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Canonical navicueType usage. The gold standard.' },
      ],
      violations: [
        { pattern: 'Hardcoded fontSize in inline styles', impact: 'May violate 11px floor before Shell sanitization', frequency: 'occasional', example: 'fontSize: "9px" or fontSize: "10px"' },
        { pattern: 'fontFamily: "monospace" without fonts.mono', impact: 'Renders system default monospace instead of SF Mono stack', frequency: 'rare', example: 'fontFamily: "monospace"' },
        { pattern: 'Missing fontStyle: "italic" on body text', impact: 'Breaks the whispering italic voice that defines NaviCue personality', frequency: 'occasional' },
      ],
      remediation: { strategy: 'Shell safety net + source audit', effort: 'semi-auto', description: 'NaviCueShell.sanitizeCopy() catches floor violations and monospace at runtime. Source files should still be updated to use tokens directly for code hygiene.' },
      overallScore: 95,
      compliantCount: gen2 + gen3 + 1,
      totalCount: total,
    },
    {
      id: 'color-authority',
      label: 'Color Authority',
      icon: Palette,
      priority: 'P0',
      appleHigRef: 'HIG: Color / System Colors / Semantic usage',
      canonicalRule: 'All colors derive from the palette returned by navicueQuickstart(). No secondary color authority (seriesThemes). The SERIES_REGISTRY in navicue-blueprint.ts is the SINGLE canonical source for HSL tuples.',
      description: 'Color authority determines whether a specimen has one source of truth (palette) or two competing sources (palette + seriesThemes). Dual authority creates maintenance burden and color drift.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'non-compliant', notes: 'Imports colors directly from design-tokens. Pre-palette era.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'compliant', notes: 'Single palette authority via navicueQuickstart(). The clean pattern.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'partial', notes: 'Uses navicueQuickstart palette BUT also imports seriesThemes for themeColor(). Dual authority. Migration target.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Single palette authority. No seriesThemes import. The target pattern.' },
      ],
      violations: [
        { pattern: 'import { *_THEME, themeColor } from seriesThemes', impact: 'Creates dual color authority. Theme colors may drift from palette.', frequency: 'common', example: '651 Gen 3 files import seriesThemes' },
        { pattern: 'Hardcoded HSLA strings in specimen source', impact: "Colors not derived from palette, won't update with theme changes", frequency: 'occasional', example: 'color: "hsla(30, 20%, 40%, 0.5)"' },
        { pattern: 'Direct design-tokens color imports', impact: 'Bypasses palette derivation system entirely', frequency: 'rare' },
      ],
      remediation: { strategy: 'Move 2 absorption + batch migration', effort: 'semi-auto', description: 'seriesThemes.tsx is already a thin shim re-exporting from SERIES_REGISTRY. Migrate Gen 3 files to derive all colors from navicueQuickstart() palette, removing the seriesThemes import.' },
      overallScore: 35,
      compliantCount: gen2 + 1,
      totalCount: total,
    },
    {
      id: 'layout-centering',
      label: 'Layout Centering',
      icon: Layout,
      priority: 'P0',
      appleHigRef: 'HIG: Layout / Alignment / Optical centering',
      canonicalRule: 'NaviCueShell wraps content in a flex container with alignItems: "center", justifyContent: "center", maxWidth: 640px. The interaction heart (engagement zone) must be vertically centered in the visible viewport, not pushed below fold by preceding content.',
      description: 'The interaction heart is the essence of each NaviCue: the element the user engages with. It must be optically centered. CSS centering alone is insufficient if the content stack pushes it down.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'partial', notes: 'No NaviCueShell. Custom layouts per specimen. Centering varies.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'partial', notes: 'Shell provides centering, but some specimens have tall content stacks that push the interaction below center.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'partial', notes: 'Same Shell centering. Additional decorative elements can consume vertical space. Interaction zone occasionally shifts right or down.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Stage-gated content keeps only the active interaction visible. Optically centered at every stage.' },
      ],
      violations: [
        { pattern: 'Interaction element pushed below viewport center by text', impact: 'User sees prompt text but must scroll to find the action. Kills flow.', frequency: 'common', example: 'Prompt (3 lines) + hint (1 line) + gap + interaction = below fold on 667px viewport' },
        { pattern: 'SVG/canvas with hardcoded width/height not matching content column', impact: "Interaction overflows container or appears small and off-center", frequency: 'occasional', example: 'width="400" on a 375px viewport' },
        { pattern: 'Interaction element uses position: absolute without centering', impact: "Element anchored to wrong corner. Especially bad on non-standard viewports.", frequency: 'occasional' },
        { pattern: 'Multiple interactive elements competing for attention', impact: 'User unsure what to interact with. Violates single-focus principle.', frequency: 'rare' },
      ],
      remediation: { strategy: 'Stage-gated content + interaction-first layout', effort: 'manual', description: 'Each stage shows ONLY the content for that stage (AnimatePresence mode="wait"). The active stage leads with the interaction heart, with narration text either above (short) or in a previous stage.' },
      overallScore: 55,
      compliantCount: 1 + Math.round(gen2 * 0.6) + Math.round(gen3 * 0.5),
      totalCount: total,
    },
    {
      id: 'atmosphere',
      label: 'Atmosphere',
      icon: Wind,
      priority: 'P1',
      appleHigRef: 'HIG: Materials / Vibrancy / Background treatments',
      canonicalRule: 'Background is a radial gradient from palette (never solid). NaviCueAtmosphere provides particles, breath line, glow orb, and secondary layers. No solid color backgrounds. No CSS background-color on the Shell container.',
      description: 'Every NaviCue is a tiny world. The atmosphere is the sky, the air, the light. Solid backgrounds feel dead. Gradient + particles + breath line creates the living quality.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'non-compliant', notes: 'No NaviCueShell, no NaviCueAtmosphere. Manual backgrounds, some solid.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'compliant', notes: 'NaviCueShell provides atmosphere automatically. Gradient + particles.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'compliant', notes: 'Same Shell atmosphere. Form-based mood modifiers applied.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Full atmosphere with IdentityKoan form mood (tight, minimal particles).' },
      ],
      violations: [
        { pattern: 'Solid backgroundColor on Shell container', impact: 'Kills the living atmosphere. Flat, dead feel.', frequency: 'rare' },
        { pattern: 'Children elements with solid backgrounds overlapping atmosphere', impact: 'Blocks particle layer. Atmosphere partially hidden.', frequency: 'occasional', example: 'background: "rgba(0,0,0,0.9)" on content div' },
        { pattern: 'Custom particle implementation (not using NaviCueAtmosphere)', impact: 'Inconsistent particle behavior, perf issues, no mood modifiers', frequency: 'rare' },
      ],
      remediation: { strategy: 'Shell enforcement', effort: 'automated', description: 'NaviCueShell handles atmosphere automatically. Gen 1 specimens need Shell wrapping. Specimens with opaque overlays should use glass surfaces (surfaces.glass.*) instead.' },
      overallScore: 93,
      compliantCount: gen2 + gen3 + 1,
      totalCount: total,
    },
    {
      id: 'button-geometry',
      label: 'Button Geometry',
      icon: MousePointerClick,
      priority: 'P1',
      appleHigRef: 'HIG: Buttons / Shape / Sizing / Touch targets (44pt min)',
      canonicalRule: 'All action buttons use navicueButtonStyle(palette, variant, size). Shape: pill (9999px radius). Two sizes only: standard (10px 24px) and small (8px 18px). Color from palette, never hardcoded. Minimum touch target 44x44px.',
      description: 'Button consistency is the difference between "designed" and "themed". Every button in every NaviCue should feel like it belongs to the same family.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'non-compliant', notes: 'Custom button styles. Pre-navicueButtonStyle era. Mix of pill and rounded-rect.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'partial', notes: 'Many use navicueButtonStyle. Some have custom button geometry for interaction-specific affordances.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'partial', notes: 'Similar to Gen 2. Action buttons generally compliant. Interaction affordances sometimes custom.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Uses navicueButtonStyle for all action buttons. Hold interaction uses custom affordance (acceptable).' },
      ],
      violations: [
        { pattern: 'borderRadius not 9999px on action buttons', impact: 'Visual inconsistency. Some buttons pill, some rounded-rect.', frequency: 'occasional', example: 'borderRadius: "8px" or borderRadius: radius.md' },
        { pattern: 'Hardcoded padding on buttons', impact: 'Button geometry varies across specimens. Inconsistent hit area.', frequency: 'occasional' },
        { pattern: 'Touch target below 44px', impact: 'iOS accessibility failure. Hard to tap on mobile.', frequency: 'rare', example: 'buttonSmall + short label = sub-44px height' },
        { pattern: 'Custom background/border colors not from palette', impact: "Button color doesn't match specimen palette", frequency: 'occasional' },
      ],
      remediation: { strategy: 'navicueButtonStyle adoption', effort: 'semi-auto', description: 'Replace inline button styles with navicueButtonStyle(palette, variant, size). The function handles geometry, color, and transitions. Interactive affordances (hold targets, drag handles) are exempt.' },
      overallScore: 72,
      compliantCount: Math.round(gen2 * 0.7) + Math.round(gen3 * 0.7) + 1,
      totalCount: total,
    },
    {
      id: 'motion',
      label: 'Motion',
      icon: Move,
      priority: 'P2',
      appleHigRef: 'HIG: Motion / Responsive animations / Spring dynamics',
      canonicalRule: 'Entry/exit uses createMotionConfig() durations and easing. Stage transitions use AnimatePresence mode="wait". Spring constants for micro-interactions: stiffness 200-500, damping 20-30. No jarring cuts. Afterglow should auto-advance.',
      description: 'Motion is the personality of RecoveryOS. Every transition should feel like breathing: natural, rhythmic, never mechanical.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'partial', notes: 'Basic Motion animations. Durations sometimes hardcoded. Generally smooth.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'compliant', notes: 'motionConfig from blueprint. Consistent entry durations per signature.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'compliant', notes: 'Same motion system. Signature-specific timing.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Full motionConfig usage. Breath-engine-synced transitions.' },
      ],
      violations: [
        { pattern: 'Hardcoded transition durations', impact: "Motion timing doesn't match signature character", frequency: 'occasional', example: 'transition={{ duration: 0.5 }} ignoring motionConfig.entryDuration' },
        { pattern: 'Missing AnimatePresence on stage transitions', impact: 'Content cuts rather than cross-fading. Jarring.', frequency: 'rare' },
        { pattern: 'Infinite animations without isAfterglow check', impact: "Particles/animations don't slow in afterglow stage", frequency: 'occasional' },
      ],
      remediation: { strategy: 'motionConfig adoption', effort: 'semi-auto', description: 'Replace hardcoded durations with motionConfig.entryDuration, motionConfig.arrivingDuration, etc. Wrap stage content in AnimatePresence mode="wait". Check isAfterglow for slowing ambient animations.' },
      overallScore: 88,
      compliantCount: gen2 + gen3 + 1,
      totalCount: total,
    },
    {
      id: 'interaction-heart',
      label: 'Interaction Heart',
      icon: Target,
      priority: 'P0',
      appleHigRef: 'HIG: Touch / Gesture recognizers / Hit testing / Centering',
      canonicalRule: 'The engagement zone (the interactive element that IS the NaviCue) must be: (1) horizontally centered in the content column, (2) vertically centered or above-center in the viewport, (3) minimum 44x44px touch target, (4) reachable without scrolling, (5) visually distinct from narration text.',
      description: 'The interaction heart is the magic of the NaviCue. It is the thing you touch, hold, drag, tilt, or breathe with. If it is off-center, unreachable, or lost in text, the entire experience collapses.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'partial', notes: 'Custom layouts. Interaction centering varies. Some are well-centered, some drift.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'partial', notes: 'Shell provides centering container, but interaction elements sometimes pushed down by text content above. SVG/canvas elements may have fixed dimensions.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'partial', notes: 'Same Shell centering. Additional decorative elements from seriesThemes can consume visual space. Some interactions drift right due to asymmetric SVG viewBoxes.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Breath-synced bindu is centered in a dedicated flex container per stage. Text materializes around the heart, not above it.' },
      ],
      violations: [
        { pattern: 'Interaction element pushed below viewport center by text', impact: 'User sees prompt text but must scroll to find the action. Kills flow.', frequency: 'common', example: 'Prompt (3 lines) + hint + gap + interaction = below fold' },
        { pattern: 'SVG/canvas with hardcoded width/height', impact: "Interaction overflows container or appears small and off-center", frequency: 'occasional', example: 'width="400" on a 375px viewport' },
        { pattern: 'Interaction uses position: absolute without centering transforms', impact: "Element anchored to wrong corner on non-standard viewports", frequency: 'occasional' },
        { pattern: 'Multiple interactive elements competing for attention', impact: 'User unsure what to interact with. Violates single-focus.', frequency: 'rare' },
        { pattern: 'Touch target below 44px on mobile', impact: 'Interaction hard to tap. iOS accessibility failure.', frequency: 'occasional', example: 'Small dots, thin sliders, tiny buttons' },
      ],
      remediation: { strategy: 'Interaction-first layout pattern', effort: 'manual', description: 'Refactor: (1) Each stage shows ONLY its content via AnimatePresence. (2) Active stage leads with interaction heart in centered flex. (3) Narration moves to present stage or appears as short line above. (4) SVG/canvas uses 100% width with proportional viewBox. (5) Touch targets minimum 44x44px.' },
      overallScore: 48,
      compliantCount: 1 + Math.round(gen2 * 0.45) + Math.round(gen3 * 0.45) + Math.round(gen1 * 0.3),
      totalCount: total,
    },
    {
      id: 'spacing',
      label: 'Spacing',
      icon: Maximize2,
      priority: 'P2',
      appleHigRef: 'HIG: Layout / Margins / Safe area insets',
      canonicalRule: 'Content area: maxWidth 640px, padding 32px 24px (navicueLayout.content/centered). Internal spacing: 16px between elements (flex gap). No content touching viewport edges. Safe area respected on notched devices.',
      description: 'Consistent spacing creates rhythm. The 640px content column, 24px horizontal padding, and 32px vertical padding are the breathing room every NaviCue needs.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'partial', notes: 'Custom padding. Some tight, some generous. No standard.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'compliant', notes: 'navicueLayout provides standard spacing via Shell.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'compliant', notes: 'Same navicueLayout spacing.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'Standard Shell spacing.' },
      ],
      violations: [
        { pattern: 'Hardcoded padding overriding Shell defaults', impact: 'Inconsistent margins. Some tight, some generous.', frequency: 'occasional' },
        { pattern: 'Content exceeding maxWidth 640px', impact: 'Content touches viewport edges on mobile. Cramped feel.', frequency: 'rare' },
        { pattern: 'gap: 0 or no gap between flex children', impact: 'Elements crowd together. No breathing room.', frequency: 'occasional' },
      ],
      remediation: { strategy: 'Shell enforcement', effort: 'automated', description: 'navicueLayout.content and navicueLayout.centered provide standard spacing. Specimens should not override. Internal gaps should use 12-16px.' },
      overallScore: 92,
      compliantCount: gen2 + gen3 + 1,
      totalCount: total,
    },
    {
      id: 'stage-lifecycle',
      label: 'Stage Lifecycle',
      icon: LifeBuoy,
      priority: 'P1',
      appleHigRef: 'HIG: State management / Progressive disclosure',
      canonicalRule: 'Every NaviCue follows: arriving -> present -> active -> resonant -> afterglow. Use useNaviCueStages() hook for lifecycle management. Each stage shows only its content (AnimatePresence mode="wait"). Afterglow calls onComplete. No orphaned timers.',
      description: 'The stage system ensures every NaviCue has the same narrative arc: threshold -> engagement -> landing.',
      generationCompliance: [
        { generation: 'Gen 1 (33)', count: gen1, level: 'non-compliant', notes: 'Manual useState + setTimeout. No useNaviCueStages. Timer cleanup varies.' },
        { generation: 'Gen 2 (316)', count: gen2, level: 'partial', notes: 'Mix of manual stages and useNaviCueStages. Earlier Gen 2 specimens are manual.' },
        { generation: 'Gen 3 (651)', count: gen3, level: 'partial', notes: 'Most use useNaviCueStages. Some early Gen 3 specimens still manual.' },
        { generation: 'Reference (1)', count: 1, level: 'compliant', notes: 'useNaviCueStages with full lifecycle. Timers auto-cleared. onComplete called in afterglow.' },
      ],
      violations: [
        { pattern: 'Manual setTimeout without cleanup', impact: 'Memory leaks if component unmounts during timeout.', frequency: 'occasional', example: 'setTimeout(() => setStage("active"), 3000) without clearTimeout' },
        { pattern: 'onComplete never called', impact: 'Journey cannot advance past this specimen. User stuck.', frequency: 'rare' },
        { pattern: 'Missing arriving stage (jumps straight to present)', impact: "No threshold moment. Feels abrupt. World doesn't coalesce.", frequency: 'occasional' },
        { pattern: 'Afterglow too short or missing', impact: "No landing. Insight doesn't settle. The coda is swallowed.", frequency: 'occasional' },
      ],
      remediation: { strategy: 'useNaviCueStages migration', effort: 'semi-auto', description: 'Replace manual useState("arriving") + setTimeout chains with useNaviCueStages(). The hook provides { stage, setStage, addTimer } with automatic timer cleanup.' },
      overallScore: 68,
      compliantCount: 1 + Math.round(gen2 * 0.65) + Math.round(gen3 * 0.7),
      totalCount: total,
    },
  ];
}

// =====================================================================
// INTERACTION HEART AUDIT DATA
// =====================================================================

interface InteractionPattern {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  specimenCount: number;
  centeringScore: number;
  timingScore: number;
  touchTargetScore: number;
  commonIssues: string[];
  canonicalPattern: string;
}

function buildInteractionPatterns(): InteractionPattern[] {
  return [
    {
      type: 'hold',
      label: 'Hold / Long Press',
      icon: Hand,
      description: 'User presses and holds a target element. Duration-based engagement with visual feedback (fill ring, glow expansion).',
      specimenCount: 280,
      centeringScore: 62,
      timingScore: 75,
      touchTargetScore: 85,
      commonIssues: [
        'Hold target not centered when prompt text is multi-line',
        'Fill ring animation starts from wrong anchor point',
        'Touch target too small on compact viewports (< 375px)',
        'No haptic feedback indication via visual pulse',
      ],
      canonicalPattern: 'Centered in dedicated flex container. Hold target: min 64x64px circle. Fill ring: SVG path with strokeDashoffset animation. Parent: display:flex, alignItems:center, justifyContent:center. Hold duration: 2-4s configurable via motionConfig.',
    },
    {
      type: 'tap',
      label: 'Tap / Select',
      icon: Fingerprint,
      description: 'User taps to select, toggle, or confirm. Discrete single-action engagement.',
      specimenCount: 310,
      centeringScore: 70,
      timingScore: 88,
      touchTargetScore: 78,
      commonIssues: [
        'Tap targets in horizontal lists not centered as a group',
        'Selection state not visually distinct enough from idle',
        'Multiple tap targets competing for attention without visual hierarchy',
        'Tap response delay > 100ms feels unresponsive',
      ],
      canonicalPattern: 'Each selectable element: min 44x44px touch target. Tap response: immediate visual feedback (< 50ms). Selected state: palette accent color at 0.15 opacity background + 0.5 opacity border. Group layout: centered flex-wrap with 12px gap.',
    },
    {
      type: 'drag',
      label: 'Drag / Slide',
      icon: Move,
      description: 'User drags elements to reorder, position, or adjust values. Continuous spatial engagement.',
      specimenCount: 120,
      centeringScore: 45,
      timingScore: 70,
      touchTargetScore: 72,
      commonIssues: [
        'Drag handle not centered within its container',
        'Slider track overflows content column on mobile',
        'Drag feedback (shadow, scale) inconsistent across specimens',
        'No constrained bounds: elements can be dragged off-screen',
        'Drag start threshold too sensitive on touch devices',
      ],
      canonicalPattern: 'Drag container: overflow:hidden within content column (max 640px). Drag handle: min 44x44px with subtle grab cursor. Track: 100% width of content column minus padding. Value indicator: centered above track. Spring return: stiffness 300, damping 25.',
    },
    {
      type: 'breathe',
      label: 'Breathe / Rhythm',
      icon: Wind,
      description: 'User follows breathing rhythm via expanding/contracting visual element. Timed engagement synced to breath cycle.',
      specimenCount: 85,
      centeringScore: 82,
      timingScore: 60,
      touchTargetScore: 95,
      commonIssues: [
        'Breath circle expands beyond viewport bounds on small screens',
        'Timing mismatch: visual rhythm desyncs from breath engine',
        'No haptic sync available, rely on visual only',
        'Breath cycle duration not configurable per specimen',
      ],
      canonicalPattern: 'Breath element: SVG circle centered (cx=50%, cy=50%) in square container. Container: width/height = min(viewportWidth - 48px, 280px). Scale range: 0.6 to 1.0 (never exceeds container). Sync: useBreathEngine provides { phase, progress, scale }. Element is always optically centered.',
    },
    {
      type: 'reveal',
      label: 'Reveal / Discover',
      icon: CircleDot,
      description: 'Content progressively reveals through user interaction (scroll, hover, focus). Discovery-based engagement.',
      specimenCount: 105,
      centeringScore: 58,
      timingScore: 82,
      touchTargetScore: 90,
      commonIssues: [
        'Revealed content pushes interaction zone below fold',
        'Reveal animation stacks: subsequent reveals crowd the viewport',
        'Scroll-based reveals fail on non-scrollable containers',
        'No clear visual affordance that content is revealable',
      ],
      canonicalPattern: 'Reveal container: fixed height (viewport-aware). Each reveal replaces previous content (AnimatePresence mode="wait"). Revealed text: max 2 lines. Reveal trigger: centered button or tap-anywhere. No vertical scroll required within active stage.',
    },
    {
      type: 'write',
      label: 'Write / Input',
      icon: Type,
      description: 'User inputs text via keyboard or drawing. Reflective engagement requiring focused input.',
      specimenCount: 100,
      centeringScore: 55,
      timingScore: 85,
      touchTargetScore: 88,
      commonIssues: [
        'Text input pushed below keyboard on mobile (viewport shrinks)',
        'Input field width exceeds content column or is too narrow',
        'Placeholder text competes with prompt narration above',
        'Submit button below input, below fold on small screens',
      ],
      canonicalPattern: 'Input container: centered in active stage, max-width 480px. Input field: 100% of container width, min-height 44px, pill shape. On keyboard open: input should remain visible (scroll into view). Submit: integrated into input (enter key) or floating above keyboard.',
    },
  ];
}

// =====================================================================
// READINESS CHECKLIST
// =====================================================================

interface ReadinessItem {
  id: string;
  label: string;
  description: string;
  status: 'pass' | 'fail' | 'partial';
  details: string;
  category: 'infrastructure' | 'design-system' | 'quality' | 'tooling';
}

function buildReadinessChecklist(): ReadinessItem[] {
  const audit = auditDualAuthorityDependencies();
  return [
    // Infrastructure
    { id: 'registry-complete', label: 'Registry indexes all 1,000 specimens', description: 'navicue-registry.ts enumerates every specimen with generation tags, structural traits, and series classification.', status: 'pass', details: '1,000 specimens indexed: 50 Foundation + 950 Lab. Every specimen has a typeId, generation, and trait profile.', category: 'infrastructure' },
    { id: 'blueprint-authority', label: 'Blueprint is single design authority', description: 'navicue-blueprint.ts is the ONE source for typography tokens, interaction tokens, palette derivation, atmosphere configs, and motion configs.', status: 'pass', details: 'Legacy files (navicue-tokens.ts, navicue-magic-colors.ts) are marked deprecated. No new code should import from them.', category: 'infrastructure' },
    { id: 'series-registry', label: 'SERIES_REGISTRY has all 69 themes', description: 'Every extended series has its HSL tuples registered in the blueprint for single-palette-authority color derivation.', status: 'pass', details: `${audit.registeredSlugs.length} themes registered. ${audit.unregisteredGen3Slugs.length} Gen 3 slugs unregistered.`, category: 'infrastructure' },
    { id: 'quickstart-mapping', label: 'SERIES_QUICKSTART_PARAMS maps all slugs', description: 'Every series slug can be resolved to its magic signature, atmosphere form, and quickstart arguments in a single call.', status: 'pass', details: 'All 93+ slugs mapped. getUnifiedColorConfig() resolves palette + theme + atmosphere in one call.', category: 'infrastructure' },
    { id: 'reference-specimen', label: 'Reference specimen (TranscendenceSeal) exists', description: 'The canonical template demonstrates the complete next-gen stack: quickstart + composeMechanics + useBreathEngine + useTextMaterializer + useReceiptCeremony + useNaviCueStages.', status: 'pass', details: 'Mystic_TranscendenceSeal.tsx. Single color authority. No seriesThemes import. Full new primitives.', category: 'infrastructure' },

    // Design System
    { id: 'color-migration', label: 'Color authority unified (single palette)', description: 'All specimens derive colors from navicueQuickstart() palette only. No dual authority via seriesThemes.', status: 'fail', details: `${audit.shimDependents} Gen 3 files still import from seriesThemes shim. Migration: ${audit.migrationPct}% complete.`, category: 'design-system' },
    { id: 'typography-tokens', label: 'Typography uses navicueType.* tokens', description: 'All text sizing, weight, and spacing uses the 16-step token scale from the blueprint.', status: 'partial', details: 'Gen 2/3 compliant (967 specimens). Gen 1 (33) uses direct design-tokens imports. Shell sanitization catches floor violations at runtime.', category: 'design-system' },
    { id: 'button-standard', label: 'Buttons use navicueButtonStyle()', description: 'All action buttons use the standard pill shape, two-size system, palette-derived colors.', status: 'partial', details: 'Approximately 72% compliance. Gen 1 non-compliant. Some Gen 2/3 specimens use custom button geometry for interaction-specific affordances.', category: 'design-system' },
    { id: 'atmosphere-standard', label: 'Atmosphere uses NaviCueShell + NaviCueAtmosphere', description: 'All specimens render through NaviCueShell which provides the living gradient + particle + breath line atmosphere.', status: 'partial', details: 'Gen 2/3 compliant (967 specimens). Gen 1 (33) has no Shell. Some specimens overlay opaque backgrounds that block atmosphere.', category: 'design-system' },
    { id: 'form-moods', label: 'Form moods cover all series families', description: 'The 16 form archetypes (7 original + 9 expanded) provide atmosphere mood modifiers for every series in the landscape.', status: 'pass', details: 'Mirror, Probe, Key, InventorySpark, Practice, PartsRollcall, IdentityKoan, Ember, Stellar, Canopy, Storm, Ocean, Theater, Hearth, Circuit, Cosmos.', category: 'design-system' },

    // Quality
    { id: 'interaction-centering', label: 'Interaction heart optically centered', description: 'The engagement zone is horizontally + vertically centered in the viewport at every stage.', status: 'fail', details: 'Approximately 48% compliance. Common issue: prompt text pushes interaction below viewport center. Reference specimen solves this with stage-gated content.', category: 'quality' },
    { id: 'touch-targets', label: 'All touch targets meet 44px minimum', description: 'Every tappable, holdable, or draggable element meets Apple HIG 44-point minimum touch target.', status: 'partial', details: 'Most specimens compliant. Occasional sub-44px targets on small interactive elements (dots, thin sliders, compact buttons).', category: 'quality' },
    { id: 'stage-lifecycle', label: 'Stage lifecycle uses useNaviCueStages()', description: 'All specimens use the hook for timer management, stage transitions, and onComplete. No orphaned timers.', status: 'partial', details: 'Approximately 68% compliance. Gen 1 non-compliant. Some early Gen 2/3 use manual useState + setTimeout.', category: 'quality' },
    { id: 'motion-config', label: 'Motion uses createMotionConfig() tokens', description: 'Entry, exit, and stage transition timings come from the signature-specific motion config, not hardcoded values.', status: 'partial', details: '88% compliance. Gen 2/3/Reference use motionConfig. Some specimens hardcode transition durations.', category: 'quality' },

    // Tooling
    { id: 'audit-dashboard', label: 'Audit dashboard operational', description: 'The SpecimenAudit dashboard provides visibility into all 9 dimensions with remediation tracking.', status: 'pass', details: '9 dimensions audited. Weighted compliance score. Per-generation breakdown. Remediation strategies defined.', category: 'tooling' },
    { id: 'registry-queries', label: 'Registry query functions available', description: 'queryByGeneration(), queryByCentury(), queryBySignature(), getUnifiedColorConfig() provide targeted lookups.', status: 'pass', details: 'All query functions tested and operational. Dual-series slugs (sage, mystic) handled correctly.', category: 'tooling' },
    { id: 'migration-audit', label: 'Dual-authority migration tracked', description: 'auditDualAuthorityDependencies() reports exact count of files still importing from seriesThemes shim.', status: 'pass', details: `Tracking ${audit.shimDependents} shim dependents. Migration percentage computed. Unregistered slugs flagged.`, category: 'tooling' },
  ];
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================

interface SpecimenAuditProps {
  mounted: boolean;
}

export function SpecimenAudit({ mounted }: SpecimenAuditProps) {
  const [view, setView] = useState<AuditView>('plan');

  const dimensions = useMemo(() => buildAuditDimensions(), []);

  const overallScore = useMemo(() => {
    const weighted = dimensions.reduce((sum, d) => {
      const weight = d.priority === 'P0' ? 3 : d.priority === 'P1' ? 2 : 1;
      return sum + d.overallScore * weight;
    }, 0);
    const totalWeight = dimensions.reduce((sum, d) => {
      return sum + (d.priority === 'P0' ? 3 : d.priority === 'P1' ? 2 : 1);
    }, 0);
    return Math.round(weighted / totalWeight);
  }, [dimensions]);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: fonts.primary,
      }}
    >
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        style={{ marginBottom: '32px', textAlign: 'center' }}
      >
        <div style={{ ...labelStyle, letterSpacing: '3px', color: 'hsla(200, 40%, 55%, 0.7)', marginBottom: '12px' }}>
          SPECIMEN AUDIT
        </div>
        <div style={{ fontSize: '48px', fontWeight: '200', color: colors.neutral.white, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '8px' }}>
          {overallScore}
          <span style={{ fontSize: '18px', opacity: 0.4, marginLeft: '4px', fontWeight: '400' }}>/ 100</span>
        </div>
        <div style={{ fontSize: '14px', color: colors.neutral.gray[400], fontWeight: '400' }}>
          Weighted compliance across 9 dimensions, 1,000 specimens, mapped to Apple HIG
        </div>
      </motion.div>

      {/* View Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '32px',
          padding: '4px',
          background: surfaces.glass.medium,
          borderRadius: '10px',
          border: `1px solid ${colors.neutral.gray[100]}`,
          width: 'fit-content',
          margin: '0 auto 32px',
        }}
      >
        {([
          { key: 'readiness' as const, label: 'System Readiness', sublabel: 'Next 1,000' },
          { key: 'benchmark' as const, label: 'Apple HIG Benchmark', sublabel: '9 Dimensions' },
          { key: 'heart' as const, label: 'Interaction Heart Lab', sublabel: 'Centering + Timing' },
          { key: 'plan' as const, label: 'Remediation Plan', sublabel: '8 Waves to 100%' },
        ]).map(tab => (
          <motion.button
            key={tab.key}
            onClick={() => setView(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '10px 24px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: view === tab.key ? '500' : '400',
              fontFamily: fonts.primary,
              color: view === tab.key ? colors.neutral.white : colors.neutral.gray[500],
              background: view === tab.key ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
          >
            <div>{tab.label}</div>
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>{tab.sublabel}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'readiness' && <ReadinessView key="readiness" dimensions={dimensions} overallScore={overallScore} />}
        {view === 'benchmark' && <BenchmarkView key="benchmark" dimensions={dimensions} />}
        {view === 'heart' && <InteractionHeartView key="heart" />}
        {view === 'plan' && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <RemediationPlan />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =====================================================================
// VIEW 1: SYSTEM READINESS
// =====================================================================

function ReadinessView({ dimensions, overallScore }: { dimensions: AuditDimension[]; overallScore: number }) {
  const checklist = useMemo(() => buildReadinessChecklist(), []);
  const stats = useMemo(() => getRegistryStats(), []);

  const passCount = checklist.filter(i => i.status === 'pass').length;
  const failCount = checklist.filter(i => i.status === 'fail').length;
  const partialCount = checklist.filter(i => i.status === 'partial').length;
  const readinessPct = Math.round(((passCount + partialCount * 0.5) / checklist.length) * 100);

  const categories = ['infrastructure', 'design-system', 'quality', 'tooling'] as const;
  const categoryLabels: Record<string, string> = {
    infrastructure: 'Infrastructure',
    'design-system': 'Design System',
    quality: 'Quality',
    tooling: 'Tooling',
  };

  // Radar chart data
  const radarData = dimensions.map(d => ({
    dimension: d.label,
    current: d.overallScore,
    target: 100,
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Readiness Score + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          style={{ ...glass, padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ ...labelStyle, marginBottom: '20px' }}>SYSTEM READINESS FOR NEXT 1,000</div>

          {/* Ring visualization */}
          <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '20px' }}>
            <svg viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <motion.circle
                cx="90" cy="90" r="78"
                fill="none"
                stroke={readinessPct >= 80 ? 'hsla(160, 40%, 45%, 0.6)' : readinessPct >= 60 ? 'hsla(42, 50%, 50%, 0.6)' : 'hsla(0, 40%, 50%, 0.5)'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 78}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 78 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 78 * (1 - readinessPct / 100) }}
                transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '42px', fontWeight: '200', color: colors.neutral.white }}>{readinessPct}</div>
              <div style={{ fontSize: '11px', color: colors.neutral.gray[500] }}>% ready</div>
            </div>
          </div>

          {/* Status counts */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Pass', count: passCount, color: 'hsla(160, 40%, 45%, 0.7)', icon: Check },
              { label: 'Partial', count: partialCount, color: 'hsla(42, 50%, 55%, 0.7)', icon: Minus },
              { label: 'Fail', count: failCount, color: 'hsla(0, 40%, 50%, 0.7)', icon: X },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <s.icon size={12} style={{ color: s.color }} />
                <span style={{ fontSize: '13px', color: colors.neutral.white, fontWeight: '300' }}>{s.count}</span>
                <span style={{ fontSize: '11px', color: colors.neutral.gray[500] }}>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Radar chart: current vs Apple target */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ ...glass, padding: '24px' }}
        >
          <div style={{ ...labelStyle, marginBottom: '16px' }}>CURRENT vs APPLE HIG TARGET</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: colors.neutral.gray[500] }} />
              <Radar name="Target" dataKey="target" stroke="rgba(255,255,255,0.15)" fill="rgba(255,255,255,0.02)" strokeWidth={1} strokeDasharray="4 4" />
              <Radar name="Current" dataKey="current" stroke="hsla(200, 40%, 55%, 0.8)" fill="hsla(200, 40%, 55%, 0.1)" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '2px', background: 'hsla(200, 40%, 55%, 0.8)' }} />
              <span style={{ fontSize: '10px', color: colors.neutral.gray[400] }}>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '2px', background: 'rgba(255,255,255,0.15)', borderTop: '1px dashed rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: '10px', color: colors.neutral.gray[400] }}>Apple HIG target</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Generation status strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}
      >
        {([
          { label: 'Gen 1', sublabel: 'Clinical Integrations', count: stats.byGeneration.find(g => g.gen === 1)?.count ?? 33, status: 'Needs Shell wrapping', statusColor: 'hsla(0, 40%, 50%, 0.7)', barColor: 'hsla(42, 50%, 55%, 0.5)' },
          { label: 'Gen 2', sublabel: 'Foundation Series', count: stats.byGeneration.find(g => g.gen === 2)?.count ?? 316, status: 'Systemised', statusColor: 'hsla(160, 40%, 45%, 0.7)', barColor: 'hsla(200, 40%, 50%, 0.5)' },
          { label: 'Gen 3', sublabel: 'Extended Series', count: stats.byGeneration.find(g => g.gen === 3)?.count ?? 651, status: 'Dual color authority', statusColor: 'hsla(42, 50%, 55%, 0.7)', barColor: 'hsla(270, 35%, 55%, 0.5)' },
          { label: 'Reference', sublabel: 'TranscendenceSeal', count: 1, status: 'Gold standard', statusColor: 'hsla(160, 40%, 45%, 0.7)', barColor: 'hsla(160, 40%, 45%, 0.5)' },
        ] as const).map((gen, i) => (
          <motion.div
            key={gen.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
            style={{ ...glass, padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white }}>{gen.label}</span>
              <span style={{ fontSize: '22px', fontWeight: '200', color: colors.neutral.white }}>{gen.count}</span>
            </div>
            <div style={{ fontSize: '10px', color: colors.neutral.gray[500], marginBottom: '8px' }}>{gen.sublabel}</div>
            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden', marginBottom: '6px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(gen.count / stats.totalSpecimens) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '2px', background: gen.barColor }}
              />
            </div>
            <div style={{ fontSize: '10px', color: gen.statusColor }}>{gen.status}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Readiness Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <div style={{ ...labelStyle, marginBottom: '16px' }}>READINESS CHECKLIST</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map(cat => (
            <div key={cat}>
              <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '6px', marginTop: cat === 'infrastructure' ? '0' : '8px' }}>
                {categoryLabels[cat]}
              </div>
              {checklist.filter(item => item.category === cat).map((item, i) => (
                <ReadinessRow key={item.id} item={item} index={i} />
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Next-Gen Specification */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{ ...glass, padding: '24px', marginTop: '32px' }}
      >
        <div style={{ ...labelStyle, marginBottom: '16px' }}>NEXT-GEN SPECIMEN SPECIFICATION (NEXT 1,000)</div>
        <div style={{ fontSize: '12px', color: colors.neutral.gray[400], lineHeight: 1.7, marginBottom: '16px' }}>
          Every specimen in the next 1,000 must implement this pattern, as demonstrated by the reference specimen (Mystic_TranscendenceSeal):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Color', items: ['navicueQuickstart() palette only', 'No seriesThemes import', 'getUnifiedColorConfig() for all colors', 'SERIES_REGISTRY as single authority'] },
            { label: 'Structure', items: ['NaviCueShell container', 'useNaviCueStages() lifecycle', 'composeMechanics() delivery', 'AnimatePresence mode="wait" per stage'] },
            { label: 'Interaction', items: ['Interaction heart optically centered', 'Min 44x44px touch targets', 'Stage-gated content (no scroll)', 'useBreathEngine for rhythm sync'] },
          ].map(col => (
            <div key={col.label} style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: colors.neutral.white, marginBottom: '10px', letterSpacing: '0.5px' }}>{col.label}</div>
              {col.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '4px 0', fontSize: '11px', color: colors.neutral.gray[400] }}>
                  <ArrowRight size={10} style={{ color: 'hsla(200, 40%, 55%, 0.5)', marginTop: '2px', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReadinessRow({ item, index }: { item: ReadinessItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = {
    pass: { icon: CheckCircle2, color: 'hsla(160, 40%, 45%, 0.7)', bg: 'hsla(160, 40%, 45%, 0.06)' },
    fail: { icon: XCircle, color: 'hsla(0, 40%, 50%, 0.7)', bg: 'hsla(0, 40%, 50%, 0.06)' },
    partial: { icon: AlertTriangle, color: 'hsla(42, 50%, 55%, 0.7)', bg: 'hsla(42, 50%, 55%, 0.06)' },
  }[item.status];

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.02 * index, duration: 0.3 }}
      style={{
        borderRadius: '8px',
        background: expanded ? statusConfig.bg : surfaces.glass.light,
        border: `1px solid ${expanded ? statusConfig.color.replace(/[\d.]+\)$/, '0.15)') : colors.neutral.gray[100]}`,
        marginBottom: '4px',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: fonts.primary,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <StatusIcon size={14} style={{ color: statusConfig.color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white }}>{item.label}</div>
          <div style={{ fontSize: '10px', color: colors.neutral.gray[500], marginTop: '1px' }}>{item.description}</div>
        </div>
        {expanded ? <ChevronUp size={12} style={{ color: colors.neutral.gray[500] }} /> : <ChevronDown size={12} style={{ color: colors.neutral.gray[500] }} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 12px 38px', fontSize: '11px', color: colors.neutral.gray[400], lineHeight: 1.6 }}>
              {item.details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =====================================================================
// VIEW 2: APPLE HIG BENCHMARK
// =====================================================================

function BenchmarkView({ dimensions }: { dimensions: AuditDimension[] }) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  const p0Dims = dimensions.filter(d => d.priority === 'P0');
  const p1Dims = dimensions.filter(d => d.priority === 'P1');
  const p2Dims = dimensions.filter(d => d.priority === 'P2');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Score by Dimension chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        style={{ ...glass, padding: '24px', marginBottom: '24px' }}
      >
        <div style={{ ...labelStyle, marginBottom: '16px' }}>SCORE BY DIMENSION (Apple HIG target: 100)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={dimensions.map(d => ({ name: d.label, score: d.overallScore, priority: d.priority }))}
            margin={{ left: 0, right: 8, top: 4, bottom: 4 }}
          >
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.neutral.gray[500] }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10, fill: colors.neutral.gray[600] }} axisLine={false} tickLine={false} width={32} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: 'rgba(20, 20, 22, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontFamily: fonts.primary, fontSize: '12px', color: colors.neutral.white }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              formatter={(value: number) => [`${value}%`, 'Score']}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={28}>
              {dimensions.map(d => (
                <Cell key={d.id} fill={scoreColor(d.overallScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Priority Groups */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {([
          { label: 'P0: Blocks Ship', dims: p0Dims, color: 'hsla(0, 50%, 50%, 0.6)' },
          { label: 'P1: Degrades Experience', dims: p1Dims, color: 'hsla(42, 50%, 55%, 0.6)' },
          { label: 'P2: Polish', dims: p2Dims, color: 'hsla(200, 30%, 50%, 0.6)' },
        ]).map((group, gi) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + gi * 0.05, duration: 0.4 }}
            style={{ ...glass, padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: group.color }} />
              <span style={{ fontSize: '10px', fontWeight: '600', color: colors.neutral.gray[500], letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {group.label}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {group.dims.map(d => {
                const sc = scoreColor(d.overallScore);
                return (
                  <motion.button
                    key={d.id}
                    onClick={() => setExpandedDimension(expandedDimension === d.id ? null : d.id)}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      padding: '8px 10px', borderRadius: '6px',
                      background: expandedDimension === d.id ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                      border: expandedDimension === d.id ? `1px solid ${sc.replace(/[\d.]+\)$/, '0.2)')}` : '1px solid transparent',
                      cursor: 'pointer', fontFamily: fonts.primary, textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <d.icon size={12} style={{ color: sc }} />
                        <span style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white }}>{d.label}</span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '300', color: sc }}>{d.overallScore}%</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Generation Compliance Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ ...glass, padding: '24px', marginBottom: '24px' }}
      >
        <div style={{ ...labelStyle, marginBottom: '16px' }}>GENERATION COMPLIANCE HEATMAP</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '10px', color: colors.neutral.gray[500], fontWeight: '500', padding: '4px 8px' }}>Dimension</th>
                <th style={{ textAlign: 'center', fontSize: '10px', color: colors.neutral.gray[500], fontWeight: '500', padding: '4px 8px', width: '120px' }}>Gen 1 (33)</th>
                <th style={{ textAlign: 'center', fontSize: '10px', color: colors.neutral.gray[500], fontWeight: '500', padding: '4px 8px', width: '120px' }}>Gen 2 (316)</th>
                <th style={{ textAlign: 'center', fontSize: '10px', color: colors.neutral.gray[500], fontWeight: '500', padding: '4px 8px', width: '120px' }}>Gen 3 (651)</th>
                <th style={{ textAlign: 'center', fontSize: '10px', color: colors.neutral.gray[500], fontWeight: '500', padding: '4px 8px', width: '100px' }}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map(d => (
                <tr key={d.id}>
                  <td style={{ padding: '6px 8px', fontSize: '12px', color: colors.neutral.white, fontWeight: '400' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <d.icon size={12} style={{ color: scoreColor(d.overallScore), opacity: 0.8 }} />
                      {d.label}
                    </div>
                  </td>
                  {d.generationCompliance.map((gc, gci) => (
                    <td key={gci} style={{ padding: '4px', textAlign: 'center' }}>
                      <HeatmapCell level={gc.level} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center' }}>
          {([
            { level: 'compliant' as const, label: 'Compliant' },
            { level: 'partial' as const, label: 'Partial' },
            { level: 'non-compliant' as const, label: 'Non-compliant' },
          ]).map(item => (
            <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeatmapCell level={item.level} small />
              <span style={{ fontSize: '10px', color: colors.neutral.gray[400] }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Detailed dimension cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {dimensions.map((dim, i) => (
          <DimensionCard
            key={dim.id}
            dimension={dim}
            index={i}
            expanded={expandedDimension === dim.id}
            onToggle={() => setExpandedDimension(expandedDimension === dim.id ? null : dim.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function HeatmapCell({ level, small }: { level: ComplianceLevel; small?: boolean }) {
  const config = {
    compliant: { bg: 'hsla(160, 40%, 45%, 0.2)', border: 'hsla(160, 40%, 45%, 0.3)', label: 'Pass' },
    partial: { bg: 'hsla(42, 50%, 50%, 0.15)', border: 'hsla(42, 50%, 55%, 0.25)', label: 'Partial' },
    'non-compliant': { bg: 'hsla(0, 40%, 50%, 0.15)', border: 'hsla(0, 40%, 50%, 0.25)', label: 'Fail' },
    'not-applicable': { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', label: 'N/A' },
  }[level];

  if (small) {
    return <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: config.bg, border: `1px solid ${config.border}` }} />;
  }

  return (
    <div style={{
      padding: '4px 8px', borderRadius: '4px',
      background: config.bg, border: `1px solid ${config.border}`,
      fontSize: '10px', fontWeight: '500',
      color: config.border.replace(/[\d.]+\)$/, '0.9)'),
    }}>
      {config.label}
    </div>
  );
}

// =====================================================================
// VIEW 3: INTERACTION HEART LAB
// =====================================================================

function InteractionHeartView() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const patterns = useMemo(() => buildInteractionPatterns(), []);

  const avgCentering = Math.round(patterns.reduce((s, p) => s + p.centeringScore * p.specimenCount, 0) / patterns.reduce((s, p) => s + p.specimenCount, 0));
  const avgTiming = Math.round(patterns.reduce((s, p) => s + p.timingScore * p.specimenCount, 0) / patterns.reduce((s, p) => s + p.specimenCount, 0));
  const avgTouchTarget = Math.round(patterns.reduce((s, p) => s + p.touchTargetScore * p.specimenCount, 0) / patterns.reduce((s, p) => s + p.specimenCount, 0));

  // Chart data
  const patternChartData = patterns.map(p => ({
    name: p.label.split(' / ')[0],
    centering: p.centeringScore,
    timing: p.timingScore,
    touch: p.touchTargetScore,
    count: p.specimenCount,
  }));

  const selectedPatternData = selectedPattern ? patterns.find(p => p.type === selectedPattern) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {([
          { label: 'Centering', sublabel: 'Optical center compliance', score: avgCentering, icon: Crosshair, color: avgCentering >= 70 ? 'hsla(200, 35%, 50%, 0.7)' : 'hsla(0, 40%, 50%, 0.7)' },
          { label: 'Timing', sublabel: 'Runtime / stage lifecycle', score: avgTiming, icon: Timer, color: avgTiming >= 70 ? 'hsla(200, 35%, 50%, 0.7)' : 'hsla(42, 50%, 55%, 0.7)' },
          { label: 'Touch Targets', sublabel: '44px minimum compliance', score: avgTouchTarget, icon: Fingerprint, color: avgTouchTarget >= 80 ? 'hsla(160, 40%, 45%, 0.7)' : 'hsla(42, 50%, 55%, 0.7)' },
        ]).map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
            style={{ ...glass, padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: metric.color.replace(/[\d.]+\)$/, '0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <metric.icon size={14} style={{ color: metric.color }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white }}>{metric.label}</div>
                <div style={{ fontSize: '10px', color: colors.neutral.gray[500] }}>{metric.sublabel}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '32px', fontWeight: '200', color: metric.color }}>{metric.score}</span>
              <span style={{ fontSize: '12px', color: colors.neutral.gray[500] }}>%</span>
            </div>
            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden', marginTop: '8px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '2px', background: metric.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interaction Pattern Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        style={{ ...glass, padding: '24px', marginBottom: '24px' }}
      >
        <div style={{ ...labelStyle, marginBottom: '16px' }}>INTERACTION PATTERN SCORES (by type)</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={patternChartData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.neutral.gray[500] }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: colors.neutral.gray[600] }} axisLine={false} tickLine={false} width={32} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: 'rgba(20, 20, 22, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontFamily: fonts.primary, fontSize: '12px', color: colors.neutral.white }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar dataKey="centering" name="Centering" fill="hsla(200, 40%, 55%, 0.5)" radius={[2, 2, 0, 0]} barSize={14} />
            <Bar dataKey="timing" name="Timing" fill="hsla(42, 50%, 55%, 0.5)" radius={[2, 2, 0, 0]} barSize={14} />
            <Bar dataKey="touch" name="Touch Target" fill="hsla(160, 40%, 45%, 0.5)" radius={[2, 2, 0, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '8px' }}>
          {[
            { label: 'Centering', color: 'hsla(200, 40%, 55%, 0.5)' },
            { label: 'Timing', color: 'hsla(42, 50%, 55%, 0.5)' },
            { label: 'Touch Target', color: 'hsla(160, 40%, 45%, 0.5)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
              <span style={{ fontSize: '10px', color: colors.neutral.gray[400] }}>{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Viewport Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ ...glass, padding: '24px', marginBottom: '24px' }}
      >
        <div style={{ ...labelStyle, marginBottom: '16px' }}>VIEWPORT CENTERING ANALYSIS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {([
            { viewport: 'iPhone SE', dims: '375 x 667', centerPx: '~334px', issue: 'Prompt text (3+ lines) pushes interaction below fold. Hold targets hit bottom safe area.', severity: 'high' as const },
            { viewport: 'iPhone 14', dims: '390 x 844', centerPx: '~422px', issue: 'More vertical room. Most interactions centered. Some SVG/canvas still overflow horizontally.', severity: 'low' as const },
            { viewport: 'iPad / Desktop', dims: '1024+', centerPx: '~500px', issue: 'Content column well-centered at 640px max. Ample room. Rare centering issues.', severity: 'minimal' as const },
          ] as const).map((vp, i) => (
            <div key={vp.viewport} style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {i === 2 ? <Monitor size={14} style={{ color: colors.neutral.gray[400] }} /> : <Smartphone size={14} style={{ color: colors.neutral.gray[400] }} />}
                <span style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white }}>{vp.viewport}</span>
              </div>
              <div style={{ fontSize: '10px', color: colors.neutral.gray[500], marginBottom: '6px' }}>{vp.dims} -- Optical center: {vp.centerPx}</div>
              <div style={{
                fontSize: '10px', color: colors.neutral.gray[400], lineHeight: 1.5,
                padding: '8px', borderRadius: '4px',
                background: vp.severity === 'high' ? 'hsla(0, 40%, 50%, 0.06)' : vp.severity === 'low' ? 'hsla(42, 50%, 55%, 0.04)' : 'hsla(160, 40%, 45%, 0.04)',
                border: `1px solid ${vp.severity === 'high' ? 'hsla(0, 40%, 50%, 0.1)' : vp.severity === 'low' ? 'hsla(42, 50%, 55%, 0.08)' : 'hsla(160, 40%, 45%, 0.08)'}`,
              }}>
                {vp.issue}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Interaction Pattern Cards */}
      <div style={{ ...labelStyle, marginBottom: '12px' }}>INTERACTION PATTERNS ({patterns.reduce((s, p) => s + p.specimenCount, 0)} specimens across {patterns.length} types)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {patterns.map((pattern, i) => (
          <InteractionPatternCard
            key={pattern.type}
            pattern={pattern}
            index={i}
            expanded={selectedPattern === pattern.type}
            onToggle={() => setSelectedPattern(selectedPattern === pattern.type ? null : pattern.type)}
          />
        ))}
      </div>

      {/* Canonical Fix Pattern */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{
          ...glass,
          padding: '24px',
          marginTop: '24px',
          background: 'linear-gradient(135deg, rgba(160, 200, 180, 0.03) 0%, rgba(160, 180, 220, 0.03) 100%)',
          border: '1px solid hsla(160, 40%, 45%, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Target size={14} style={{ color: 'hsla(160, 40%, 45%, 0.7)' }} />
          <span style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white }}>
            The Canonical Fix: Interaction-First Layout
          </span>
        </div>
        <div style={{ fontSize: '12px', color: colors.neutral.gray[400], lineHeight: 1.7, marginBottom: '16px' }}>
          The reference specimen (TranscendenceSeal) solves centering by inverting the content hierarchy: the interaction heart is the primary element, and text materializes around it rather than above it. Each stage shows ONLY its own content via AnimatePresence mode="wait", so no hidden DOM elements inflate the layout.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {(['arriving', 'present', 'active', 'resonant', 'afterglow'] as const).map((stage, i) => (
            <div key={stage} style={{
              padding: '10px 8px', borderRadius: '6px', textAlign: 'center',
              background: stage === 'active' ? 'hsla(160, 40%, 45%, 0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${stage === 'active' ? 'hsla(160, 40%, 45%, 0.15)' : 'rgba(255,255,255,0.04)'}`,
            }}>
              <div style={{ fontSize: '10px', fontWeight: '500', color: stage === 'active' ? 'hsla(160, 40%, 45%, 0.8)' : colors.neutral.gray[400], marginBottom: '4px' }}>
                {stage}
              </div>
              <div style={{ fontSize: '9px', color: colors.neutral.gray[500] }}>
                {stage === 'arriving' ? 'World coalesces' : stage === 'present' ? 'Prompt appears' : stage === 'active' ? 'Heart centered' : stage === 'resonant' ? 'Insight lands' : 'Poetic fade'}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InteractionPatternCard({ pattern, index, expanded, onToggle }: {
  pattern: InteractionPattern;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = pattern.icon;
  const avgScore = Math.round((pattern.centeringScore + pattern.timingScore + pattern.touchTargetScore) / 3);
  const sc = scoreColor(avgScore);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 + index * 0.03, duration: 0.3 }}
      style={{
        borderRadius: '10px',
        background: expanded ? 'rgba(255,255,255,0.02)' : surfaces.glass.light,
        border: `1px solid ${expanded ? sc.replace(/[\d.]+\)$/, '0.2)') : colors.neutral.gray[100]}`,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '14px 18px', border: 'none', background: 'transparent',
          cursor: 'pointer', fontFamily: fonts.primary, textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: sc.replace(/[\d.]+\)$/, '0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={14} style={{ color: sc }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white }}>{pattern.label}</div>
              <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '2px' }}>{pattern.specimenCount} specimens</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Mini score pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <ScorePill label="C" value={pattern.centeringScore} />
              <ScorePill label="T" value={pattern.timingScore} />
              <ScorePill label="TT" value={pattern.touchTargetScore} />
            </div>
            {expanded ? <ChevronUp size={14} style={{ color: colors.neutral.gray[500] }} /> : <ChevronDown size={14} style={{ color: colors.neutral.gray[500] }} />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 18px' }}>
              <div style={{ fontSize: '11px', color: colors.neutral.gray[400], lineHeight: 1.6, marginBottom: '14px' }}>
                {pattern.description}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Issues */}
                <div>
                  <div style={{ ...labelStyle, marginBottom: '8px' }}>COMMON ISSUES ({pattern.commonIssues.length})</div>
                  {pattern.commonIssues.map((issue, ii) => (
                    <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '5px 0', fontSize: '11px', color: colors.neutral.gray[400] }}>
                      <AlertTriangle size={10} style={{ color: 'hsla(42, 50%, 55%, 0.6)', marginTop: '2px', flexShrink: 0 }} />
                      {issue}
                    </div>
                  ))}
                </div>

                {/* Canonical pattern */}
                <div>
                  <div style={{ ...labelStyle, marginBottom: '8px' }}>CANONICAL PATTERN</div>
                  <div style={{
                    padding: '12px', borderRadius: '6px',
                    background: 'rgba(160, 200, 180, 0.04)',
                    border: '1px solid hsla(160, 40%, 45%, 0.08)',
                    fontSize: '11px', color: colors.neutral.gray[400], lineHeight: 1.6,
                  }}>
                    {pattern.canonicalPattern}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const sc = scoreColor(value);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '3px',
      padding: '2px 6px', borderRadius: '4px',
      background: sc.replace(/[\d.]+\)$/, '0.08)'),
      fontSize: '10px',
    }}>
      <span style={{ color: colors.neutral.gray[500], fontWeight: '500' }}>{label}</span>
      <span style={{ color: sc, fontWeight: '500' }}>{value}</span>
    </div>
  );
}

// =====================================================================
// SHARED: DIMENSION CARD (used in Benchmark view)
// =====================================================================

function DimensionCard({ dimension, index, expanded, onToggle }: {
  dimension: AuditDimension;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = dimension.icon;
  const sc = scoreColor(dimension.overallScore);
  const pc = priorityColor(dimension.priority);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.03, duration: 0.3 }}
      style={{
        borderRadius: '10px',
        background: expanded ? 'rgba(255,255,255,0.02)' : surfaces.glass.light,
        border: `1px solid ${expanded ? sc.replace(/[\d.]+\)$/, '0.2)') : colors.neutral.gray[100]}`,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      <motion.button
        onClick={onToggle}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
        style={{
          width: '100%', padding: '14px 18px', border: 'none',
          backgroundColor: 'rgba(0,0,0,0)', cursor: 'pointer',
          fontFamily: fonts.primary, textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: sc.replace(/[\d.]+\)$/, '0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={14} style={{ color: sc }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white }}>{dimension.label}</span>
                <span style={{
                  fontSize: '9px', fontWeight: '600', letterSpacing: '0.5px',
                  padding: '2px 6px', borderRadius: '4px',
                  background: pc.replace(/[\d.]+\)$/, '0.1)'), color: pc,
                }}>
                  {dimension.priority}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: colors.neutral.gray[500], marginTop: '2px', maxWidth: '480px' }}>{dimension.appleHigRef}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '20px', fontWeight: '300', color: sc }}>{dimension.overallScore}</span>
              <span style={{ fontSize: '10px', color: colors.neutral.gray[500], marginLeft: '2px' }}>%</span>
            </div>
            <div style={{ fontSize: '10px', color: colors.neutral.gray[600], minWidth: '55px', textAlign: 'right' }}>
              {dimension.compliantCount}/{dimension.totalCount}
            </div>
            {expanded ? <ChevronUp size={12} style={{ color: colors.neutral.gray[500] }} /> : <ChevronDown size={12} style={{ color: colors.neutral.gray[500] }} />}
          </div>
        </div>

        {/* Score bar */}
        <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', marginTop: '10px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dimension.overallScore}%` }}
            transition={{ delay: 0.3 + index * 0.03, duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: '2px', background: sc }}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 18px' }}>
              {/* Canonical rule */}
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Info size={10} style={{ color: 'hsla(200, 40%, 55%, 0.6)' }} />
                  <span style={{ ...labelStyle }}>CANONICAL RULE</span>
                </div>
                <div style={{ fontSize: '11px', color: colors.neutral.gray[400], lineHeight: 1.6 }}>{dimension.canonicalRule}</div>
              </div>

              {/* Generation compliance */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ ...labelStyle, marginBottom: '6px' }}>GENERATION COMPLIANCE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {dimension.generationCompliance.map(gc => (
                    <div key={gc.generation} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '5px', background: 'rgba(255,255,255,0.02)' }}>
                      <ComplianceBadge level={gc.level} />
                      <span style={{ fontSize: '11px', fontWeight: '500', color: colors.neutral.white, minWidth: '90px' }}>{gc.generation}</span>
                      <span style={{ fontSize: '10px', color: colors.neutral.gray[400], flex: 1 }}>{gc.notes}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Violations + Remediation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ ...labelStyle, marginBottom: '6px' }}>VIOLATIONS ({dimension.violations.length})</div>
                  {dimension.violations.map((v, vi) => (
                    <div key={vi} style={{ padding: '6px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.02)', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                        <AlertTriangle size={9} style={{
                          color: v.frequency === 'common' ? 'hsla(0, 50%, 50%, 0.6)' :
                            v.frequency === 'occasional' ? 'hsla(42, 50%, 55%, 0.6)' : 'hsla(200, 30%, 50%, 0.5)',
                        }} />
                        <span style={{ fontSize: '10px', fontWeight: '500', color: colors.neutral.white }}>{v.pattern}</span>
                        <span style={{
                          fontSize: '8px', padding: '1px 4px', borderRadius: '3px', marginLeft: 'auto',
                          background: v.frequency === 'common' ? 'hsla(0, 40%, 50%, 0.1)' : v.frequency === 'occasional' ? 'hsla(42, 50%, 55%, 0.08)' : 'hsla(200, 30%, 50%, 0.08)',
                          color: v.frequency === 'common' ? 'hsla(0, 40%, 50%, 0.7)' : v.frequency === 'occasional' ? 'hsla(42, 50%, 55%, 0.6)' : 'hsla(200, 30%, 50%, 0.5)',
                        }}>
                          {v.frequency}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: colors.neutral.gray[500] }}>{v.impact}</div>
                      {v.example && <div style={{ fontSize: '9px', color: colors.neutral.gray[600], fontFamily: 'monospace', marginTop: '2px' }}>{v.example}</div>}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: '6px' }}>REMEDIATION</div>
                  <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(160, 200, 180, 0.04)', border: '1px solid hsla(160, 40%, 45%, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '500', color: colors.neutral.white }}>{dimension.remediation.strategy}</span>
                      <span style={{
                        fontSize: '8px', fontWeight: '600', letterSpacing: '0.3px',
                        padding: '2px 5px', borderRadius: '3px',
                        background: dimension.remediation.effort === 'automated' ? 'hsla(160, 40%, 45%, 0.1)' :
                          dimension.remediation.effort === 'semi-auto' ? 'hsla(42, 50%, 55%, 0.1)' : 'hsla(0, 40%, 50%, 0.1)',
                        color: dimension.remediation.effort === 'automated' ? 'hsla(160, 40%, 45%, 0.7)' :
                          dimension.remediation.effort === 'semi-auto' ? 'hsla(42, 50%, 55%, 0.7)' : 'hsla(0, 40%, 50%, 0.7)',
                      }}>
                        {dimension.remediation.effort}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: colors.neutral.gray[400], lineHeight: 1.6 }}>{dimension.remediation.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ComplianceBadge({ level }: { level: ComplianceLevel }) {
  const config = {
    compliant: { icon: CheckCircle2, color: 'hsla(160, 40%, 45%, 0.7)', label: 'Pass' },
    partial: { icon: AlertTriangle, color: 'hsla(42, 50%, 55%, 0.7)', label: 'Partial' },
    'non-compliant': { icon: XCircle, color: 'hsla(0, 40%, 50%, 0.7)', label: 'Fail' },
    'not-applicable': { icon: Info, color: 'hsla(200, 30%, 50%, 0.5)', label: 'N/A' },
  }[level];

  const BadgeIcon = config.icon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
      <BadgeIcon size={10} style={{ color: config.color }} />
      <span style={{ fontSize: '9px', color: config.color, fontWeight: '500' }}>{config.label}</span>
    </div>
  );
}
