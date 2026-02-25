/**
 * NaviCue Anti-Pattern Audit
 *
 * Runtime validation that catches regressions of resolved audit findings.
 * Import and call in development builds to surface violations early.
 *
 * FINDING 1 (HIGH): tapZone + navicueType.hint co-occurrence
 *   The deprecated pattern of spreading both tapZone and hint onto the same
 *   element creates invisible tap targets with no material presence.
 *   GOLD STANDARD: use immersiveTapButton(palette) for text tap targets.
 *
 * FINDING 2 (MEDIUM): inline onPointerDown/Up hold handlers
 *   Manual useState + setInterval hold logic is fragile (stale closures,
 *   leaked intervals, inconsistent cleanup).
 *   GOLD STANDARD: use useHoldInteraction() + immersiveHoldButton(palette).
 *
 * FINDING 3 (LOW): sub-11px fontSize
 *   Enforced at runtime by NaviCueShell/Verse sanitizeCopy, but source
 *   files should avoid introducing sub-11px values.
 *
 * Usage (dev only):
 *   import { auditAntiPatterns } from './audit/anti-pattern-check';
 *   useEffect(() => { if (import.meta.env.DEV) auditAntiPatterns(); }, []);
 */

/** Pattern signatures to grep for in source files */
export const ANTI_PATTERNS = {
  /** Finding 1: tapZone + hint button anti-pattern */
  tapZoneHint: {
    id: 'F1-TAPZONE-HINT',
    severity: 'HIGH' as const,
    description: 'Deprecated tapZone + navicueType.hint button pattern',
    grep: /\.\.\.navicueInteraction\.tapZone[\s\S]{0,200}\.\.\.navicueType\.hint/,
    fix: 'Replace with immersiveTapButton(palette).base',
  },

  /** Finding 2: inline hold handlers without useHoldInteraction */
  inlineHoldHandlers: {
    id: 'F2-INLINE-HOLD',
    severity: 'MEDIUM' as const,
    description: 'Inline onPointerDown/Up hold pattern without useHoldInteraction',
    grep: /onPointerDown.*setHolding\(true\)|onPointerDown.*startHold/,
    fix: 'Replace with useHoldInteraction() + immersiveHoldButton(palette)',
  },

  /** Finding 3: sub-11px fontSize */
  subMinFontSize: {
    id: 'F3-SUB-11PX',
    severity: 'LOW' as const,
    description: 'Font size below 11px floor',
    grep: /fontSize:\s*(?:[0-9]|10)(?:\s*[,})\]])/,
    fix: 'Use 11px minimum or navicueType tokens (which enforce the floor)',
  },

  /** Legacy navicueButtonStyle usage */
  legacyButtonStyle: {
    id: 'F4-LEGACY-BUTTON',
    severity: 'HIGH' as const,
    description: 'Deprecated navicueButtonStyle() usage',
    grep: /navicueButtonStyle\s*\(/,
    fix: 'Replace with immersiveTapButton(palette)',
  },

  /** Raw tapZone on text-labeled buttons (should use immersiveTapButton) */
  rawTapZoneTextButton: {
    id: 'F5-RAW-TAPZONE-TEXT',
    severity: 'MEDIUM' as const,
    description: 'Raw tapZone on text-labeled button (missing material presence)',
    grep: /\.\.\.navicueInteraction\.tapZone[\s\S]{0,100}cursor:\s*'pointer'/,
    fix: 'Use immersiveTapButton(palette).base for text buttons or immersiveTap(palette).zone for visual scenes',
  },
} as const;

export type AntiPatternId = keyof typeof ANTI_PATTERNS;

export interface AuditViolation {
  patternId: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  fix: string;
}

/**
 * Validate a source string against all anti-patterns.
 * Returns an array of violations found.
 */
export function auditSource(source: string): AuditViolation[] {
  const violations: AuditViolation[] = [];

  for (const pattern of Object.values(ANTI_PATTERNS)) {
    if (pattern.grep.test(source)) {
      violations.push({
        patternId: pattern.id,
        severity: pattern.severity,
        description: pattern.description,
        fix: pattern.fix,
      });
    }
  }

  return violations;
}

/**
 * Log a summary of anti-pattern audit results.
 * Call during development to catch regressions.
 */
export function logAuditResults(fileName: string, violations: AuditViolation[]): void {
  if (violations.length === 0) return;

  const highCount = violations.filter(v => v.severity === 'HIGH').length;
  const medCount = violations.filter(v => v.severity === 'MEDIUM').length;
  const lowCount = violations.filter(v => v.severity === 'LOW').length;

  console.warn(
    `[NaviCue Audit] ${fileName}: ${violations.length} violation(s) ` +
    `(${highCount} HIGH, ${medCount} MEDIUM, ${lowCount} LOW)`
  );

  for (const v of violations) {
    console.warn(`  [${v.severity}] ${v.patternId}: ${v.description}`);
    console.warn(`    Fix: ${v.fix}`);
  }
}
