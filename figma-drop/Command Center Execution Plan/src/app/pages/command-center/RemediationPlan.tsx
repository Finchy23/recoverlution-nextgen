/**
 * REMEDIATION PLAN -- Strategic Execution Dashboard
 *
 * The flight plan to 100% across all 9 audit dimensions.
 *
 * Three phases, eight waves:
 *
 *   PHASE 1: P0 BLOCKERS (must resolve before scaling to next 1,000)
 *     Wave 1 -- Color Authority Migration     (651 files, semi-auto)
 *     Wave 2 -- Interaction Heart Centering    (1,000 files, manual)
 *     Wave 3 -- Layout Centering Enforcement   (1,000 files, manual)
 *
 *   PHASE 2: P1 DEGRADATIONS (degrades experience quality)
 *     Wave 4 -- Stage Lifecycle Migration      (~320 files, semi-auto)
 *     Wave 5 -- Typography Token Compliance    (33 files, semi-auto)
 *     Wave 6 -- Button Standardization         (~280 files, semi-auto)
 *     Wave 7 -- Atmosphere Shell Wrapping      (33 files, semi-auto)
 *
 *   PHASE 3: P2 POLISH (final refinement)
 *     Wave 8 -- Motion + Spacing Normalization (~200 files, semi-auto)
 *
 * Each wave tracks: affected files, migration pattern, effort,
 * dependencies, projected score delta, and batch operation template.
 */

import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { colors, surfaces, fonts } from '@/design-tokens';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getRegistryStats,
  auditDualAuthorityDependencies,
} from '@/app/data/navicue-registry';
import {
  Palette,
  Target,
  Layout,
  LifeBuoy,
  Type,
  MousePointerClick,
  Wind,
  Move,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check,
  Clock,
  Zap,
  Shield,
  Layers,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Terminal,
  BarChart3,
} from 'lucide-react';

// =====================================================================
// TYPES
// =====================================================================

type PhaseId = 'p0' | 'p1' | 'p2';
type WaveStatus = 'blocked' | 'ready' | 'in-progress' | 'complete';
type EffortType = 'automated' | 'semi-auto' | 'manual';

interface MigrationPattern {
  label: string;
  before: string;
  after: string;
  description: string;
}

interface WaveDependency {
  waveId: string;
  reason: string;
}

interface ScoreImpact {
  dimension: string;
  currentScore: number;
  projectedScore: number;
  delta: number;
}

interface Wave {
  id: string;
  number: number;
  label: string;
  icon: React.ComponentType<any>;
  phase: PhaseId;
  status: WaveStatus;
  effort: EffortType;
  description: string;
  rationale: string;
  affectedFiles: number;
  affectedGenerations: string[];
  estimatedHours: number;
  dependencies: WaveDependency[];
  scoreImpacts: ScoreImpact[];
  migrationPatterns: MigrationPattern[];
  batchStrategy: string;
  validationCriteria: string[];
  risks: string[];
}

interface Phase {
  id: PhaseId;
  label: string;
  sublabel: string;
  description: string;
  color: string;
  waves: Wave[];
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

function phaseColor(p: PhaseId): string {
  if (p === 'p0') return 'hsla(0, 50%, 50%, 0.6)';
  if (p === 'p1') return 'hsla(42, 50%, 55%, 0.6)';
  return 'hsla(200, 30%, 50%, 0.6)';
}

function statusConfig(s: WaveStatus) {
  switch (s) {
    case 'complete': return { color: 'hsla(160, 40%, 45%, 0.7)', bg: 'hsla(160, 40%, 45%, 0.06)', label: 'Complete' };
    case 'in-progress': return { color: 'hsla(200, 40%, 55%, 0.7)', bg: 'hsla(200, 40%, 55%, 0.06)', label: 'In Progress' };
    case 'ready': return { color: 'hsla(42, 50%, 55%, 0.7)', bg: 'hsla(42, 50%, 55%, 0.06)', label: 'Ready' };
    case 'blocked': return { color: 'hsla(0, 40%, 50%, 0.5)', bg: 'hsla(0, 40%, 50%, 0.04)', label: 'Blocked' };
  }
}

function effortBadge(e: EffortType) {
  switch (e) {
    case 'automated': return { color: 'hsla(160, 40%, 45%, 0.7)', label: 'Automated' };
    case 'semi-auto': return { color: 'hsla(42, 50%, 55%, 0.7)', label: 'Semi-Auto' };
    case 'manual': return { color: 'hsla(0, 40%, 50%, 0.7)', label: 'Manual' };
  }
}

// =====================================================================
// DATA BUILDER
// =====================================================================

function buildRemediationPlan(): Phase[] {
  const stats = getRegistryStats();
  const audit = auditDualAuthorityDependencies();
  const gen1 = stats.byGeneration.find(g => g.gen === 1)?.count ?? 33;
  const gen2 = stats.byGeneration.find(g => g.gen === 2)?.count ?? 316;
  const gen3 = stats.byGeneration.find(g => g.gen === 3)?.count ?? 651;
  const total = stats.totalSpecimens;

  const waves: Wave[] = [
    // ── PHASE 1: P0 BLOCKERS ────────────────────────────
    {
      id: 'w1',
      number: 1,
      label: 'Color Authority Migration',
      icon: Palette,
      phase: 'p0',
      status: 'ready',
      effort: 'semi-auto',
      description: `Migrate ${audit.shimDependents} Gen 3 specimens from dual color authority (palette + seriesThemes) to single palette authority (navicueQuickstart only). Remove all seriesThemes.tsx imports.`,
      rationale: 'Color Authority is at 35%. The seriesThemes shim already re-exports from SERIES_REGISTRY, so the data path is identical. The migration is a mechanical find-and-replace of import statements and color function calls, with getUnifiedColorConfig() as the single resolver.',
      affectedFiles: audit.shimDependents,
      affectedGenerations: ['Gen 3'],
      estimatedHours: 40,
      dependencies: [],
      scoreImpacts: [
        { dimension: 'Color Authority', currentScore: 35, projectedScore: 100, delta: 65 },
      ],
      migrationPatterns: [
        {
          label: 'Remove seriesThemes import',
          before: `import { SHAMAN_THEME, themeColor, flashColor } from '../seriesThemes';`,
          after: `// Removed: colors now derived from navicueQuickstart() palette`,
          description: 'Delete the seriesThemes import line entirely. All color derivation moves to the palette returned by navicueQuickstart().',
        },
        {
          label: 'Replace themeColor() calls',
          before: `color: themeColor(SHAMAN_THEME.accentHSL, 0.6)`,
          after: `color: palette.accent`,
          description: 'Replace themeColor(TH.accentHSL, alpha) with the equivalent palette property. The palette object from navicueQuickstart() provides .accent, .primary, .glow, .text, and .bg at pre-computed opacities.',
        },
        {
          label: 'Replace flashColor() calls',
          before: `background: flashColor(SHAMAN_THEME)`,
          after: `background: palette.flash`,
          description: 'Replace flashColor(THEME) with palette.flash. The flash color is pre-computed in the palette.',
        },
        {
          label: 'Use getUnifiedColorConfig for custom alpha',
          before: `background: themeColor(TH.primaryHSL, 0.15, -10)`,
          after: `background: \`hsla(\${config.theme.primaryHSL.join(',')}, 0.15)\``,
          description: 'For calls requiring custom alpha or hue offset, use getUnifiedColorConfig(seriesSlug) which provides the raw HSL tuples.',
        },
      ],
      batchStrategy: 'Process by series (65 Gen 3 series, ~10 files each). Each series shares the same THEME constant, so the find-and-replace is identical within a series. Run getUnifiedColorConfig(slug) once, pipe through sed/codemod, validate render.',
      validationCriteria: [
        'Zero imports from seriesThemes.tsx across entire codebase',
        'auditDualAuthorityDependencies().shimDependents === 0',
        'All Gen 3 specimens render correct colors (visual regression)',
        'seriesThemes.tsx can be deleted without breaking any import',
      ],
      risks: [
        'Custom alpha/hue offset calls need manual conversion (est. ~15% of calls)',
        'Some specimens may use themeColor for non-palette-equivalent colors',
        'Visual regression if HSL tuples differ between shim and registry (mitigated: shim reads from same registry)',
      ],
    },
    {
      id: 'w2',
      number: 2,
      label: 'Interaction Heart Centering',
      icon: Target,
      phase: 'p0',
      status: 'ready',
      effort: 'manual',
      description: 'Refactor all 1,000 specimens to center the interaction heart (engagement zone) optically in the viewport. Apply the interaction-first layout pattern from the reference specimen.',
      rationale: 'Interaction Heart is at 48%. The core issue: prompt text above the interaction element pushes it below viewport center. The fix is stage-gated content (AnimatePresence mode="wait") so each stage shows ONLY its content, with the interaction heart as the primary element.',
      affectedFiles: total,
      affectedGenerations: ['Gen 1', 'Gen 2', 'Gen 3'],
      estimatedHours: 160,
      dependencies: [],
      scoreImpacts: [
        { dimension: 'Interaction Heart', currentScore: 48, projectedScore: 95, delta: 47 },
      ],
      migrationPatterns: [
        {
          label: 'Stage-gated content pattern',
          before: `return (
  <div>
    <p>{prompt}</p>
    <p>{hint}</p>
    <InteractionElement />
    <p>{afterText}</p>
  </div>
)`,
          after: `return (
  <AnimatePresence mode="wait">
    {stage === 'present' && (
      <motion.div key="present" style={centered}>
        <p>{prompt}</p>
      </motion.div>
    )}
    {stage === 'active' && (
      <motion.div key="active" style={centered}>
        <InteractionElement />
      </motion.div>
    )}
  </AnimatePresence>
)`,
          description: 'Wrap each stage in AnimatePresence mode="wait". Only the active stage renders. The interaction heart gets its own dedicated centered flex container.',
        },
        {
          label: 'Interaction-first flex container',
          before: `<div style={{ display: 'flex', flexDirection: 'column' }}>`,
          after: `<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>`,
          description: 'The interaction container uses centered flex with minHeight to ensure vertical centering within the viewport.',
        },
        {
          label: 'SVG/Canvas responsive sizing',
          before: `<svg width="400" height="400">`,
          after: `<svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: '280px' }}>`,
          description: 'Replace fixed width/height with viewBox + percentage width. Prevents overflow on small viewports.',
        },
      ],
      batchStrategy: 'Process by interaction pattern type (Hold: 280, Tap: 310, Drag: 120, Breathe: 85, Reveal: 105, Write: 100). Each pattern type shares a canonical centering template. Apply template per type, then manual adjustment for specimens with unique layouts.',
      validationCriteria: [
        'Interaction element is within 10% of viewport vertical center on 375x667',
        'No horizontal overflow on any viewport >= 320px',
        'Touch target minimum 44x44px on all interactive elements',
        'AnimatePresence mode="wait" wraps all stage transitions',
        'No scrolling required to reach the interaction on first render',
      ],
      risks: [
        'Manual effort is high (160 hours estimated)',
        'Some specimens have unique multi-element interactions',
        'Centering may conflict with specimens that intentionally use asymmetric layout',
        'SVG viewBox conversion may alter visual proportions',
      ],
    },
    {
      id: 'w3',
      number: 3,
      label: 'Layout Centering Enforcement',
      icon: Layout,
      phase: 'p0',
      status: 'blocked',
      effort: 'semi-auto',
      description: 'Enforce the 640px content column, centered flex container, and safe area compliance across all specimens. Tightly coupled with Wave 2 (Interaction Heart) since both address centering.',
      rationale: 'Layout Centering is at 55%. Many of the same issues as Interaction Heart: text pushing content down, SVG overflow, absolute positioning without centering transforms. Wave 2 handles the interaction element; Wave 3 handles the surrounding layout structure.',
      affectedFiles: total - Math.round(gen2 * 0.6) - 1,
      affectedGenerations: ['Gen 1', 'Gen 2 (partial)', 'Gen 3 (partial)'],
      estimatedHours: 80,
      dependencies: [
        { waveId: 'w2', reason: 'Interaction Heart centering must be resolved first to avoid conflicting layout changes' },
      ],
      scoreImpacts: [
        { dimension: 'Layout Centering', currentScore: 55, projectedScore: 100, delta: 45 },
        { dimension: 'Interaction Heart', currentScore: 95, projectedScore: 100, delta: 5 },
      ],
      migrationPatterns: [
        {
          label: 'Content column enforcement',
          before: `<div style={{ padding: '20px' }}>`,
          after: `<div style={{ ...navicueLayout.content, maxWidth: '640px', margin: '0 auto' }}>`,
          description: 'Use navicueLayout.content for consistent padding and maxWidth. Prevents content from touching viewport edges.',
        },
        {
          label: 'Remove position: absolute without centering',
          before: `position: 'absolute', top: 0, left: 0`,
          after: `position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'`,
          description: 'Absolutely positioned elements must use centering transforms. Prevents elements from anchoring to wrong corners on different viewports.',
        },
      ],
      batchStrategy: 'After Wave 2 completes, run a static analysis pass to find remaining layout violations: (1) hardcoded padding overrides, (2) position:absolute without centering transforms, (3) content exceeding 640px maxWidth. Apply fixes in bulk, then validate per viewport.',
      validationCriteria: [
        'All content within 640px maxWidth column',
        'No content touching viewport edges on 375px viewport',
        'No position:absolute without centering transforms (unless intentional overlay)',
        'Safe area insets respected on notched devices',
      ],
      risks: [
        'Blocked by Wave 2 completion',
        'Some specimens intentionally use edge-to-edge layout for immersive effects',
        'Static analysis may not catch all dynamic layout issues',
      ],
    },

    // ── PHASE 2: P1 DEGRADATIONS ────────────────────────
    {
      id: 'w4',
      number: 4,
      label: 'Stage Lifecycle Migration',
      icon: LifeBuoy,
      phase: 'p1',
      status: 'blocked',
      effort: 'semi-auto',
      description: 'Migrate ~320 specimens from manual useState + setTimeout stage management to useNaviCueStages() hook. Ensures timer cleanup, consistent stage naming, and onComplete lifecycle.',
      rationale: 'Stage Lifecycle is at 68%. Manual timer management creates memory leaks, inconsistent stage names, and orphaned timeouts. The useNaviCueStages() hook handles all of this automatically.',
      affectedFiles: Math.round(total * 0.32),
      affectedGenerations: ['Gen 1', 'Gen 2 (early)', 'Gen 3 (early)'],
      estimatedHours: 48,
      dependencies: [
        { waveId: 'w2', reason: 'Interaction Heart centering relies on stage-gated content, which requires useNaviCueStages' },
      ],
      scoreImpacts: [
        { dimension: 'Stage Lifecycle', currentScore: 68, projectedScore: 100, delta: 32 },
      ],
      migrationPatterns: [
        {
          label: 'Replace manual stage state',
          before: `const [stage, setStage] = useState<string>('arriving');
useEffect(() => {
  const t = setTimeout(() => setStage('present'), 2000);
  return () => clearTimeout(t);
}, []);`,
          after: `const { stage, setStage, addTimer } = useNaviCueStages({
  arrivingDuration: 2000,
  onComplete: props.onComplete,
});`,
          description: 'Replace manual useState + setTimeout with useNaviCueStages(). The hook manages timer cleanup and provides addTimer() for safe timeout creation.',
        },
        {
          label: 'Add onComplete in afterglow',
          before: `// Missing onComplete call`,
          after: `useEffect(() => {
  if (stage === 'afterglow') {
    addTimer(() => onComplete?.(), 3000);
  }
}, [stage]);`,
          description: 'Ensure every specimen calls onComplete in afterglow. Without this, the journey cannot advance past the specimen.',
        },
      ],
      batchStrategy: 'Regex-match files with useState("arriving") or useState(\'arriving\'). Replace with useNaviCueStages import + hook call. Validate timer cleanup by checking for orphaned setTimeout calls.',
      validationCriteria: [
        'Zero orphaned setTimeout calls (all via addTimer)',
        'onComplete called in afterglow for every specimen',
        'All 5 stages present: arriving, present, active, resonant, afterglow',
        'No manual clearTimeout calls (hook handles cleanup)',
      ],
      risks: [
        'Some specimens use non-standard stage names',
        'Custom stage timing may not map cleanly to hook defaults',
        'Specimens with conditional stages need manual attention',
      ],
    },
    {
      id: 'w5',
      number: 5,
      label: 'Typography Token Compliance',
      icon: Type,
      phase: 'p1',
      status: 'ready',
      effort: 'semi-auto',
      description: 'Migrate 33 Gen 1 specimens from direct design-tokens font imports to navicueType.* token scale. Ensure 11px floor compliance and fonts.mono for monospace.',
      rationale: 'Typography is at 95%. Only Gen 1 (33 files) uses direct imports. Shell sanitization catches floor violations at runtime, but source should use tokens for code hygiene and maintainability.',
      affectedFiles: gen1,
      affectedGenerations: ['Gen 1'],
      estimatedHours: 8,
      dependencies: [],
      scoreImpacts: [
        { dimension: 'Typography', currentScore: 95, projectedScore: 100, delta: 5 },
      ],
      migrationPatterns: [
        {
          label: 'Replace hardcoded font sizes',
          before: `fontSize: '9px'`,
          after: `fontSize: navicueType.micro.fontSize  // 11px floor`,
          description: 'Replace hardcoded fontSize values with navicueType.* tokens. The token scale provides 16 named sizes from micro (11px) through hero (36px).',
        },
        {
          label: 'Replace raw monospace',
          before: `fontFamily: 'monospace'`,
          after: `fontFamily: fonts.mono`,
          description: 'Use fonts.mono for the SF Mono stack instead of raw "monospace".',
        },
      ],
      batchStrategy: 'Small batch (33 files). Grep for hardcoded fontSize values below 11px and raw monospace fontFamily. Replace with closest navicueType token.',
      validationCriteria: [
        'No fontSize value below 11px in any Gen 1 source',
        'No raw fontFamily: "monospace" in any source',
        'All font sizes use navicueType.* tokens or design-tokens.fonts references',
      ],
      risks: [
        'Some Gen 1 specimens use fontSize as part of animation (scaling text). Need manual verification.',
      ],
    },
    {
      id: 'w6',
      number: 6,
      label: 'Button Standardization',
      icon: MousePointerClick,
      phase: 'p1',
      status: 'ready',
      effort: 'semi-auto',
      description: 'Adopt navicueButtonStyle() for ~280 specimens with custom button geometry. Standardize to pill shape, two-size system, palette-derived colors, and 44px minimum touch target.',
      rationale: 'Button Geometry is at 72%. Custom button styles create visual inconsistency. The navicueButtonStyle() function handles geometry, color, transitions, and touch target compliance.',
      affectedFiles: Math.round(total * 0.28),
      affectedGenerations: ['Gen 1', 'Gen 2 (partial)', 'Gen 3 (partial)'],
      estimatedHours: 32,
      dependencies: [
        { waveId: 'w1', reason: 'Buttons use palette colors; color authority must be unified first' },
      ],
      scoreImpacts: [
        { dimension: 'Button Geometry', currentScore: 72, projectedScore: 100, delta: 28 },
      ],
      migrationPatterns: [
        {
          label: 'Replace inline button styles',
          before: `<button style={{
  padding: '8px 16px',
  borderRadius: '8px',
  background: 'hsla(30, 20%, 40%, 0.3)',
  border: '1px solid hsla(30, 20%, 40%, 0.2)',
}}>`,
          after: `<button style={navicueButtonStyle(palette, 'primary', 'standard')}>`,
          description: 'Replace inline button styles with navicueButtonStyle(palette, variant, size). Two variants: "primary" and "ghost". Two sizes: "standard" and "small".',
        },
      ],
      batchStrategy: 'Grep for inline button styles with borderRadius != 9999px. Replace with navicueButtonStyle call. Interactive affordances (hold targets, drag handles) are exempt.',
      validationCriteria: [
        'All action buttons use navicueButtonStyle()',
        'All buttons have borderRadius: 9999px (pill)',
        'All button touch targets >= 44x44px',
        'Button colors derived from palette, never hardcoded',
      ],
      risks: [
        'Some buttons are intentionally non-pill for interaction-specific affordances',
        'Custom hover/active states may not map to navicueButtonStyle defaults',
      ],
    },
    {
      id: 'w7',
      number: 7,
      label: 'Atmosphere Shell Wrapping',
      icon: Wind,
      phase: 'p1',
      status: 'ready',
      effort: 'semi-auto',
      description: 'Wrap 33 Gen 1 specimens in NaviCueShell to provide the standard atmosphere (gradient + particles + breath line). Replace any solid backgrounds with glass surfaces.',
      rationale: 'Atmosphere is at 93%. Only Gen 1 (33 files) lacks NaviCueShell. Adding Shell wrapping is mechanical but requires adjusting each specimen\'s internal layout to work within the Shell container.',
      affectedFiles: gen1,
      affectedGenerations: ['Gen 1'],
      estimatedHours: 16,
      dependencies: [
        { waveId: 'w5', reason: 'Typography tokens should be migrated before adding Shell (Shell sanitization depends on tokens)' },
      ],
      scoreImpacts: [
        { dimension: 'Atmosphere', currentScore: 93, projectedScore: 100, delta: 7 },
        { dimension: 'Spacing', currentScore: 92, projectedScore: 98, delta: 6 },
      ],
      migrationPatterns: [
        {
          label: 'Add NaviCueShell wrapper',
          before: `export function Mirror_Integrate_BA_B(props) {
  return (
    <div style={{ background: '#0a0a0c', ... }}>
      {/* content */}
    </div>
  );
}`,
          after: `export function Mirror_Integrate_BA_B(props) {
  const { palette, atmosphere } = navicueQuickstart('sacred_ordinary', 'BA', 'B');
  return (
    <NaviCueShell palette={palette} atmosphere={atmosphere}>
      {/* content */}
    </NaviCueShell>
  );
}`,
          description: 'Wrap the entire specimen in NaviCueShell. Remove manual background and padding (Shell provides these). Derive palette and atmosphere from navicueQuickstart().',
        },
      ],
      batchStrategy: 'Small batch (33 files). Each Foundation specimen maps to a known form + mechanism + KBE. Generate Shell wrapping template per file, apply, validate render.',
      validationCriteria: [
        'All 1,000 specimens render inside NaviCueShell',
        'No solid backgroundColor on any Shell container',
        'NaviCueAtmosphere (particles + breath line) visible on all specimens',
        'No opaque overlays blocking atmosphere layer',
      ],
      risks: [
        'Gen 1 specimens have custom internal layouts that may conflict with Shell flex container',
        'Some Gen 1 backgrounds are intentionally dark/opaque for readability',
      ],
    },

    // ── PHASE 3: P2 POLISH ──────────────────────────────
    {
      id: 'w8',
      number: 8,
      label: 'Motion + Spacing Normalization',
      icon: Move,
      phase: 'p2',
      status: 'blocked',
      effort: 'semi-auto',
      description: 'Adopt createMotionConfig() for ~120 specimens with hardcoded transition durations. Normalize spacing to navicueLayout standards for ~80 specimens with custom padding.',
      rationale: 'Motion is at 88%, Spacing at 92%. These are polish items. Most specimens already comply. Remaining violations are hardcoded durations and custom padding overrides.',
      affectedFiles: Math.round(total * 0.12) + Math.round(total * 0.08),
      affectedGenerations: ['Gen 1', 'Gen 2 (scattered)', 'Gen 3 (scattered)'],
      estimatedHours: 24,
      dependencies: [
        { waveId: 'w4', reason: 'Stage lifecycle migration ensures motionConfig durations are applied per-stage' },
        { waveId: 'w7', reason: 'Shell wrapping provides standard spacing; must complete before normalizing overrides' },
      ],
      scoreImpacts: [
        { dimension: 'Motion', currentScore: 88, projectedScore: 100, delta: 12 },
        { dimension: 'Spacing', currentScore: 92, projectedScore: 100, delta: 8 },
      ],
      migrationPatterns: [
        {
          label: 'Replace hardcoded motion durations',
          before: `transition={{ duration: 0.5 }}`,
          after: `transition={{ duration: motionConfig.entryDuration }}`,
          description: 'Use motionConfig durations from createMotionConfig(). Provides signature-specific timing.',
        },
        {
          label: 'Normalize spacing overrides',
          before: `padding: '10px'`,
          after: `padding: navicueLayout.content.padding`,
          description: 'Remove hardcoded padding that overrides Shell defaults. Use navicueLayout constants.',
        },
      ],
      batchStrategy: 'Grep for hardcoded transition.duration values and hardcoded padding overrides. Replace with motionConfig and navicueLayout references. Low risk, small batch.',
      validationCriteria: [
        'No hardcoded transition duration values in specimen source',
        'No hardcoded padding values that override Shell defaults',
        'All entry/exit animations use motionConfig durations',
        'Consistent 12-16px internal gaps between flex children',
      ],
      risks: [
        'Some hardcoded durations are intentional for unique micro-interactions',
        'Spacing normalization may affect specimens with intentionally tight/loose layout',
      ],
    },
  ];

  // Build phases
  const phases: Phase[] = [
    {
      id: 'p0',
      label: 'Phase 1: P0 Blockers',
      sublabel: 'Blocks ship to next 1,000',
      description: 'Three blockers that must resolve before the design system can scale. Color Authority (35%), Interaction Heart (48%), and Layout Centering (55%) are the critical path.',
      color: 'hsla(0, 50%, 50%, 0.6)',
      waves: waves.filter(w => w.phase === 'p0'),
    },
    {
      id: 'p1',
      label: 'Phase 2: P1 Degradations',
      sublabel: 'Degrades experience quality',
      description: 'Four dimensions that degrade the experience but do not block shipping. Stage Lifecycle (68%), Typography (95%), Button Geometry (72%), and Atmosphere (93%).',
      color: 'hsla(42, 50%, 55%, 0.6)',
      waves: waves.filter(w => w.phase === 'p1'),
    },
    {
      id: 'p2',
      label: 'Phase 3: P2 Polish',
      sublabel: 'Final refinement',
      description: 'Motion (88%) and Spacing (92%) are already near-compliant. This phase normalizes the remaining ~200 files.',
      color: 'hsla(200, 30%, 50%, 0.6)',
      waves: waves.filter(w => w.phase === 'p2'),
    },
  ];

  return phases;
}

// =====================================================================
// SCORE PROJECTION DATA
// =====================================================================

interface ProjectionPoint {
  label: string;
  score: number;
  phase: string;
}

function buildScoreProjection(phases: Phase[]): ProjectionPoint[] {
  // Current state
  const currentScores: Record<string, number> = {
    'Typography': 95,
    'Color Authority': 35,
    'Layout Centering': 55,
    'Atmosphere': 93,
    'Button Geometry': 72,
    'Motion': 88,
    'Interaction Heart': 48,
    'Spacing': 92,
    'Stage Lifecycle': 68,
  };

  const weights: Record<string, number> = {
    'Typography': 2, 'Color Authority': 3, 'Layout Centering': 3,
    'Atmosphere': 2, 'Button Geometry': 2, 'Motion': 1,
    'Interaction Heart': 3, 'Spacing': 1, 'Stage Lifecycle': 2,
  };

  function weightedScore(scores: Record<string, number>): number {
    let wSum = 0, wTotal = 0;
    for (const [dim, score] of Object.entries(scores)) {
      const w = weights[dim] || 1;
      wSum += score * w;
      wTotal += w;
    }
    return Math.round(wSum / wTotal);
  }

  const points: ProjectionPoint[] = [];
  const running = { ...currentScores };
  points.push({ label: 'Current', score: weightedScore(running), phase: 'now' });

  // Apply each wave's score impacts
  const allWaves = phases.flatMap(p => p.waves);
  for (const wave of allWaves) {
    for (const impact of wave.scoreImpacts) {
      running[impact.dimension] = impact.projectedScore;
    }
    points.push({
      label: `W${wave.number}`,
      score: weightedScore(running),
      phase: wave.phase,
    });
  }

  return points;
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export function RemediationPlan() {
  const [expandedWave, setExpandedWave] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<PhaseId | 'all'>('all');

  const phases = useMemo(() => buildRemediationPlan(), []);
  const projection = useMemo(() => buildScoreProjection(phases), [phases]);

  const allWaves = phases.flatMap(p => p.waves);
  const totalFiles = allWaves.reduce((s, w) => s + w.affectedFiles, 0);
  const totalHours = allWaves.reduce((s, w) => s + w.estimatedHours, 0);
  const currentScore = projection[0].score;
  const targetScore = projection[projection.length - 1].score;

  const filteredPhases = activePhase === 'all' ? phases : phases.filter(p => p.id === activePhase);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.6 }}
        style={{ marginBottom: '32px', textAlign: 'center' }}
      >
        <div style={{ ...labelStyle, letterSpacing: '3px', color: 'hsla(160, 40%, 55%, 0.7)', marginBottom: '12px' }}>
          REMEDIATION PLAN
        </div>
        <div style={{ fontSize: '14px', color: colors.neutral.gray[400], fontWeight: '400', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Strategic flight plan from {currentScore} to {targetScore} across 9 dimensions.
          {' '}{allWaves.length} waves, {totalFiles.toLocaleString()} file operations, ~{totalHours} engineering hours.
        </div>
      </motion.div>

      {/* Key Metrics Strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}
      >
        {([
          { label: 'Current Score', value: `${currentScore}`, sublabel: 'Weighted', color: 'hsla(42, 50%, 55%, 0.7)', icon: BarChart3 },
          { label: 'Target Score', value: `${targetScore}`, sublabel: 'All dimensions', color: 'hsla(160, 40%, 45%, 0.7)', icon: Target },
          { label: 'Total Waves', value: `${allWaves.length}`, sublabel: '3 phases', color: 'hsla(200, 40%, 55%, 0.7)', icon: Layers },
          { label: 'Files Affected', value: totalFiles.toLocaleString(), sublabel: 'Across all waves', color: 'hsla(270, 35%, 55%, 0.7)', icon: FileCode },
          { label: 'Est. Hours', value: `${totalHours}`, sublabel: 'Engineering effort', color: 'hsla(200, 30%, 50%, 0.7)', icon: Clock },
        ] as const).map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.04, duration: 0.4 }}
            style={{ ...glass, padding: '16px 18px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <m.icon size={12} style={{ color: m.color }} />
              <span style={{ fontSize: '10px', color: colors.neutral.gray[500], fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{m.label}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '200', color: colors.neutral.white, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '4px' }}>{m.sublabel}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Score Projection Chart + Dependency Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {/* Score Trajectory */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ ...glass, padding: '24px' }}
        >
          <div style={{ ...labelStyle, marginBottom: '16px' }}>PROJECTED SCORE TRAJECTORY</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={projection} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsla(160, 40%, 45%, 0.4)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsla(160, 40%, 45%, 0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: colors.neutral.gray[500] }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: colors.neutral.gray[600] }}
                axisLine={false}
                tickLine={false}
                width={32}
                domain={[40, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(20, 20, 22, 0.95)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  fontFamily: fonts.primary,
                  fontSize: '12px',
                  color: colors.neutral.white,
                }}
                formatter={(value: number) => [`${value}%`, 'Weighted Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsla(160, 40%, 45%, 0.7)"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  const isFirst = payload.label === 'Current';
                  const isLast = payload.label === `W${allWaves.length}`;
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isFirst || isLast ? 5 : 3}
                      fill={isLast ? 'hsla(160, 40%, 45%, 1)' : isFirst ? 'hsla(42, 50%, 55%, 0.8)' : 'hsla(200, 40%, 55%, 0.6)'}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth={1}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '8px' }}>
            {([
              { label: 'P0 Blockers', color: 'hsla(0, 50%, 50%, 0.5)' },
              { label: 'P1 Degradations', color: 'hsla(42, 50%, 55%, 0.5)' },
              { label: 'P2 Polish', color: 'hsla(200, 30%, 50%, 0.5)' },
            ]).map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
                <span style={{ fontSize: '10px', color: colors.neutral.gray[400] }}>{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dependency Graph */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ ...glass, padding: '24px' }}
        >
          <div style={{ ...labelStyle, marginBottom: '16px' }}>WAVE DEPENDENCIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {allWaves.map((wave, i) => {
              const sc = statusConfig(wave.status);
              const hasDeps = wave.dependencies.length > 0;
              return (
                <div key={wave.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${sc.color.replace(/[\d.]+\)$/, '0.2)')}`,
                    fontSize: '10px', fontWeight: '600', color: sc.color,
                  }}>
                    {wave.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: '500', color: colors.neutral.white, lineHeight: 1.2 }}>{wave.label}</div>
                    {hasDeps && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <GitBranch size={8} style={{ color: colors.neutral.gray[600] }} />
                        <span style={{ fontSize: '8px', color: colors.neutral.gray[600] }}>
                          needs W{wave.dependencies.map(d => d.waveId.replace('w', '')).join(', W')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: '8px', fontWeight: '600', padding: '2px 5px', borderRadius: '3px',
                    background: sc.bg, color: sc.color, letterSpacing: '0.3px',
                  }}>
                    {sc.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Critical Path */}
          <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ ...labelStyle, marginBottom: '6px', fontSize: '8px' }}>CRITICAL PATH</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 8].map((wn, i) => (
                <span key={wn} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '600',
                    color: wn <= 3 ? 'hsla(0, 50%, 50%, 0.7)' : wn <= 7 ? 'hsla(42, 50%, 55%, 0.7)' : 'hsla(200, 30%, 50%, 0.7)',
                  }}>
                    W{wn}
                  </span>
                  {i < 4 && <ArrowRight size={8} style={{ color: colors.neutral.gray[600] }} />}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Phase Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          padding: '4px', background: surfaces.glass.medium,
          borderRadius: '10px', border: `1px solid ${colors.neutral.gray[100]}`,
          width: 'fit-content',
        }}
      >
        {([
          { key: 'all' as const, label: 'All Waves', count: allWaves.length },
          { key: 'p0' as const, label: 'P0 Blockers', count: phases[0]?.waves.length ?? 0 },
          { key: 'p1' as const, label: 'P1 Degradations', count: phases[1]?.waves.length ?? 0 },
          { key: 'p2' as const, label: 'P2 Polish', count: phases[2]?.waves.length ?? 0 },
        ]).map(tab => (
          <motion.button
            key={tab.key}
            onClick={() => setActivePhase(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '8px 16px', borderRadius: '7px', border: 'none',
              cursor: 'pointer', fontSize: '12px',
              fontWeight: activePhase === tab.key ? '500' : '400',
              fontFamily: fonts.primary,
              color: activePhase === tab.key ? colors.neutral.white : colors.neutral.gray[500],
              background: activePhase === tab.key ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: '10px', opacity: 0.5 }}>{tab.count}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Phase Sections + Wave Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {filteredPhases.map((phase, pi) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + pi * 0.08, duration: 0.5 }}
          >
            {/* Phase header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '3px',
                background: phase.color,
              }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white }}>{phase.label}</div>
                <div style={{ fontSize: '10px', color: colors.neutral.gray[500] }}>{phase.sublabel}</div>
              </div>
              <div style={{ flex: 1, height: '1px', background: phase.color.replace(/[\d.]+\)$/, '0.15)') }} />
              <div style={{ fontSize: '10px', color: colors.neutral.gray[500] }}>
                {phase.waves.reduce((s, w) => s + w.estimatedHours, 0)}h est.
              </div>
            </div>

            {/* Wave cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {phase.waves.map((wave, wi) => (
                <WaveCard
                  key={wave.id}
                  wave={wave}
                  index={wi}
                  expanded={expandedWave === wave.id}
                  onToggle={() => setExpandedWave(expandedWave === wave.id ? null : wave.id)}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Execution Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          ...glass, padding: '24px', marginTop: '32px',
          background: 'linear-gradient(135deg, rgba(160, 200, 180, 0.03) 0%, rgba(160, 180, 220, 0.03) 100%)',
          border: '1px solid hsla(160, 40%, 45%, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Shield size={14} style={{ color: 'hsla(160, 40%, 45%, 0.7)' }} />
          <span style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white }}>
            Execution Principles
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {([
            { label: 'Never Break Imports', desc: 'The seriesThemes shim stays until all 651 consumers are migrated. Only then does the shim file get deleted.' },
            { label: 'Validate Per Wave', desc: 'Each wave has explicit validation criteria. A wave is not complete until all criteria pass. No partial completion.' },
            { label: 'Reference Specimen First', desc: 'Every migration pattern must match the TranscendenceSeal reference. If a pattern diverges, the reference is the authority.' },
            { label: 'Scores are Truth', desc: 'The audit dashboard is the source of truth. After each wave, re-run the audit. If scores do not match projections, investigate.' },
          ]).map(p => (
            <div key={p.label} style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: colors.neutral.white, marginBottom: '6px', letterSpacing: '0.3px' }}>{p.label}</div>
              <div style={{ fontSize: '10px', color: colors.neutral.gray[400], lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================================
// WAVE CARD
// =====================================================================

function WaveCard({ wave, index, expanded, onToggle }: {
  wave: Wave;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = wave.icon;
  const sc = statusConfig(wave.status);
  const eb = effortBadge(wave.effort);
  const pc = phaseColor(wave.phase);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
      style={{
        borderRadius: '10px',
        background: expanded ? 'rgba(255,255,255,0.02)' : surfaces.glass.light,
        border: `1px solid ${expanded ? pc.replace(/[\d.]+\)$/, '0.2)') : colors.neutral.gray[100]}`,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '14px 18px', border: 'none',
          background: 'transparent', cursor: 'pointer',
          fontFamily: fonts.primary, textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: pc.replace(/[\d.]+\)$/, '0.1)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={14} style={{ color: pc }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: '600', color: pc }}>
                  WAVE {wave.number}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white }}>
                  {wave.label}
                </span>
                <span style={{
                  fontSize: '8px', fontWeight: '600', letterSpacing: '0.3px',
                  padding: '2px 5px', borderRadius: '3px',
                  background: sc.bg, color: sc.color,
                }}>
                  {sc.label}
                </span>
                <span style={{
                  fontSize: '8px', fontWeight: '600', letterSpacing: '0.3px',
                  padding: '2px 5px', borderRadius: '3px',
                  background: eb.color.replace(/[\d.]+\)$/, '0.08)'), color: eb.color,
                }}>
                  {eb.label}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: colors.neutral.gray[500], marginTop: '2px' }}>
                {wave.affectedFiles.toLocaleString()} files  --  ~{wave.estimatedHours}h  --  {wave.affectedGenerations.join(', ')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Score delta pills */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {wave.scoreImpacts.map(si => (
                <div key={si.dimension} style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '2px 6px', borderRadius: '4px',
                  background: 'hsla(160, 40%, 45%, 0.08)',
                  fontSize: '10px',
                }}>
                  <span style={{ color: colors.neutral.gray[500], fontWeight: '500' }}>
                    {si.dimension.split(' ')[0]}
                  </span>
                  <span style={{ color: 'hsla(160, 40%, 45%, 0.7)', fontWeight: '600' }}>
                    +{si.delta}
                  </span>
                </div>
              ))}
            </div>
            {expanded
              ? <ChevronUp size={14} style={{ color: colors.neutral.gray[500] }} />
              : <ChevronDown size={14} style={{ color: colors.neutral.gray[500] }} />
            }
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 20px' }}>
              {/* Description */}
              <div style={{ fontSize: '11px', color: colors.neutral.gray[400], lineHeight: 1.6, marginBottom: '16px' }}>
                {wave.description}
              </div>

              {/* Rationale */}
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '16px' }}>
                <div style={{ ...labelStyle, marginBottom: '6px', fontSize: '8px' }}>RATIONALE</div>
                <div style={{ fontSize: '10px', color: colors.neutral.gray[400], lineHeight: 1.6 }}>
                  {wave.rationale}
                </div>
              </div>

              {/* Score Impact + Dependencies */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {/* Score Impact */}
                <div>
                  <div style={{ ...labelStyle, marginBottom: '6px', fontSize: '8px' }}>SCORE IMPACT</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {wave.scoreImpacts.map(si => (
                      <div key={si.dimension} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
                        borderRadius: '5px', background: 'rgba(255,255,255,0.02)',
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: colors.neutral.white, flex: 1 }}>
                          {si.dimension}
                        </span>
                        <span style={{ fontSize: '11px', color: 'hsla(42, 50%, 55%, 0.7)' }}>
                          {si.currentScore}%
                        </span>
                        <ArrowRight size={10} style={{ color: colors.neutral.gray[600] }} />
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'hsla(160, 40%, 45%, 0.8)' }}>
                          {si.projectedScore}%
                        </span>
                        <span style={{
                          fontSize: '9px', padding: '1px 4px', borderRadius: '3px',
                          background: 'hsla(160, 40%, 45%, 0.08)',
                          color: 'hsla(160, 40%, 45%, 0.7)', fontWeight: '600',
                        }}>
                          +{si.delta}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <div style={{ ...labelStyle, marginBottom: '6px', fontSize: '8px' }}>DEPENDENCIES</div>
                  {wave.dependencies.length === 0 ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px',
                      borderRadius: '5px', background: 'hsla(160, 40%, 45%, 0.04)',
                      border: '1px solid hsla(160, 40%, 45%, 0.08)',
                    }}>
                      <CheckCircle2 size={10} style={{ color: 'hsla(160, 40%, 45%, 0.6)' }} />
                      <span style={{ fontSize: '10px', color: 'hsla(160, 40%, 45%, 0.7)' }}>No dependencies. Ready to start.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {wave.dependencies.map(dep => (
                        <div key={dep.waveId} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '6px 10px',
                          borderRadius: '5px', background: 'hsla(42, 50%, 55%, 0.04)',
                          border: '1px solid hsla(42, 50%, 55%, 0.08)',
                        }}>
                          <GitBranch size={10} style={{ color: 'hsla(42, 50%, 55%, 0.6)', marginTop: '1px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '500', color: colors.neutral.white }}>
                              Wave {dep.waveId.replace('w', '')}
                            </div>
                            <div style={{ fontSize: '9px', color: colors.neutral.gray[500], marginTop: '1px' }}>
                              {dep.reason}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Migration Patterns */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ ...labelStyle, marginBottom: '8px', fontSize: '8px' }}>
                  MIGRATION PATTERNS ({wave.migrationPatterns.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {wave.migrationPatterns.map((mp, mpi) => (
                    <MigrationPatternCard key={mpi} pattern={mp} />
                  ))}
                </div>
              </div>

              {/* Batch Strategy */}
              <div style={{
                padding: '12px 14px', borderRadius: '8px',
                background: 'rgba(200, 180, 140, 0.04)',
                border: '1px solid rgba(200, 180, 140, 0.08)',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Zap size={10} style={{ color: 'hsla(42, 50%, 55%, 0.6)' }} />
                  <span style={{ ...labelStyle, fontSize: '8px' }}>BATCH STRATEGY</span>
                </div>
                <div style={{ fontSize: '10px', color: colors.neutral.gray[400], lineHeight: 1.6 }}>
                  {wave.batchStrategy}
                </div>
              </div>

              {/* Validation + Risks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Validation */}
                <div>
                  <div style={{ ...labelStyle, marginBottom: '6px', fontSize: '8px' }}>
                    VALIDATION CRITERIA ({wave.validationCriteria.length})
                  </div>
                  {wave.validationCriteria.map((vc, vi) => (
                    <div key={vi} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '6px',
                      padding: '4px 0', fontSize: '10px', color: colors.neutral.gray[400],
                    }}>
                      <Check size={10} style={{ color: 'hsla(160, 40%, 45%, 0.5)', marginTop: '2px', flexShrink: 0 }} />
                      {vc}
                    </div>
                  ))}
                </div>
                {/* Risks */}
                <div>
                  <div style={{ ...labelStyle, marginBottom: '6px', fontSize: '8px' }}>
                    RISKS ({wave.risks.length})
                  </div>
                  {wave.risks.map((risk, ri) => (
                    <div key={ri} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '6px',
                      padding: '4px 0', fontSize: '10px', color: colors.neutral.gray[400],
                    }}>
                      <AlertTriangle size={10} style={{ color: 'hsla(42, 50%, 55%, 0.5)', marginTop: '2px', flexShrink: 0 }} />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =====================================================================
// MIGRATION PATTERN CARD
// =====================================================================

function MigrationPatternCard({ pattern }: { pattern: MigrationPattern }) {
  const [showDiff, setShowDiff] = useState(false);

  return (
    <div style={{
      borderRadius: '6px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setShowDiff(!showDiff)}
        style={{
          width: '100%', padding: '8px 12px', border: 'none',
          background: 'transparent', cursor: 'pointer',
          fontFamily: fonts.primary, textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <Terminal size={10} style={{ color: 'hsla(200, 40%, 55%, 0.6)' }} />
        <span style={{ fontSize: '11px', fontWeight: '500', color: colors.neutral.white, flex: 1 }}>
          {pattern.label}
        </span>
        <span style={{ fontSize: '9px', color: colors.neutral.gray[500] }}>
          {showDiff ? 'hide diff' : 'show diff'}
        </span>
        {showDiff
          ? <ChevronUp size={10} style={{ color: colors.neutral.gray[600] }} />
          : <ChevronDown size={10} style={{ color: colors.neutral.gray[600] }} />
        }
      </button>

      <AnimatePresence>
        {showDiff && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 12px 12px' }}>
              <div style={{ fontSize: '10px', color: colors.neutral.gray[400], lineHeight: 1.5, marginBottom: '8px' }}>
                {pattern.description}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {/* Before */}
                <div style={{
                  padding: '10px 12px', borderRadius: '6px',
                  background: 'hsla(0, 40%, 50%, 0.04)',
                  border: '1px solid hsla(0, 40%, 50%, 0.08)',
                }}>
                  <div style={{ fontSize: '8px', fontWeight: '600', letterSpacing: '1px', color: 'hsla(0, 40%, 50%, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    BEFORE
                  </div>
                  <pre style={{
                    fontSize: '9px', color: colors.neutral.gray[400],
                    fontFamily: 'SF Mono, Menlo, monospace',
                    lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}>
                    {pattern.before}
                  </pre>
                </div>
                {/* After */}
                <div style={{
                  padding: '10px 12px', borderRadius: '6px',
                  background: 'hsla(160, 40%, 45%, 0.04)',
                  border: '1px solid hsla(160, 40%, 45%, 0.08)',
                }}>
                  <div style={{ fontSize: '8px', fontWeight: '600', letterSpacing: '1px', color: 'hsla(160, 40%, 45%, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    AFTER
                  </div>
                  <pre style={{
                    fontSize: '9px', color: colors.neutral.gray[400],
                    fontFamily: 'SF Mono, Menlo, monospace',
                    lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}>
                    {pattern.after}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
