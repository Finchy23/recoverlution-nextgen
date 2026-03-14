/**
 * TEMPERATURE GOVERNOR — The Runtime Permission System
 *
 * Temperature is not a style. It is a permission system.
 * It GOVERNS what Motion, Interaction, Color, and Copy
 * complexity are allowed at any given moment.
 *
 * The Governor sits above all surfaces and constrains them.
 * When the heat rises, the system automatically simplifies:
 *   - Motion slows
 *   - Interactions reduce
 *   - Copy density drops
 *   - Choices narrow
 *   - The room becomes simpler, quieter, safer
 *
 * This is the neuroadaptive core of Recoverlution.
 *
 * The Governor now accepts three input channels:
 *   1. Manual — explicit setHeatBand / escalate / deescalate
 *   2. Neuroadaptive — arousal signal from interaction patterns
 *   3. Hardware — floor constraints from device capabilities
 *
 * The final band = max(manualBand, neuroadaptiveBand, hardwareFloor)
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { type HeatBandId, heatBands, type HeatBand, getTemperatureFiltered } from './doctrine';

// ═══════════════════════════════════════════════════
// GOVERNANCE CONSTRAINTS — derived from heat band
// ═══════════════════════════════════════════════════

export interface GovernanceConstraints {
  /** Current heat band (0-4) */
  band: HeatBandId;
  /** The full heat band configuration */
  config: HeatBand;

  /** Motion speed multiplier (0-1) */
  motionSpeed: number;
  /** Interaction complexity multiplier (0-1) */
  interactionComplexity: number;
  /** Copy density level */
  copyDensity: 'whisper' | 'light' | 'moderate';
  /** Whether scrolling is permitted */
  scrollAllowed: boolean;
  /** Maximum number of choices the UI may present */
  maxChoices: number;

  /** Whether a specific motion variable is permitted */
  isMotionAllowed: (motionId: string) => boolean;
  /** Whether a specific interaction variable is permitted */
  isInteractionAllowed: (interactionId: string) => boolean;
  /** Whether a specific atmosphere is permitted */
  isAtmosphereAllowed: (atmosphereId: string) => boolean;
  /** Whether a specific color variable is permitted */
  isColorAllowed: (colorId: string) => boolean;

  /** Duration multiplier — higher bands = slower transitions */
  durationMultiplier: number;
  /** Particle count multiplier — higher bands = fewer particles */
  particleMultiplier: number;
  /** Waveform complexity — higher bands = fewer bars */
  waveformBars: number;
  /** Copy delay multiplier — higher bands = later copy */
  copyDelayMultiplier: number;
}

function deriveConstraints(band: HeatBandId): GovernanceConstraints {
  const config = heatBands[band];

  // Duration scales: Band 0 = 1x, Band 4 = 3x (everything slower)
  const durationMultiplier = 1 + band * 0.5;

  // Particles: Band 0 = full, Band 4 = nearly none
  const particleMultiplier = Math.max(0, 1 - band * 0.22);

  // Waveform: Band 0 = 28 bars, Band 4 = 4 bars
  const waveformBars = Math.max(4, Math.round(28 - band * 6));

  // Copy delay: higher bands push copy even later
  const copyDelayMultiplier = 1 + band * 0.4;

  return {
    band,
    config,
    motionSpeed: config.maxMotionSpeed,
    interactionComplexity: config.maxInteractionComplexity,
    copyDensity: config.maxCopyDensity,
    scrollAllowed: config.maxScrolling,
    maxChoices: config.maxChoices,

    isMotionAllowed: (id: string) => config.allowedMotions.includes(id),
    isInteractionAllowed: (id: string) => config.allowedInteractions.includes(id),
    isAtmosphereAllowed: (id: string) => config.allowedAtmospheres.includes(id),
    isColorAllowed: (id: string) => config.allowedColors.includes(id),

    durationMultiplier,
    particleMultiplier,
    waveformBars,
    copyDelayMultiplier,
  };
}

// ═══════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════

interface TemperatureContextValue {
  constraints: GovernanceConstraints;
  /** The raw manual band (before floor/neuroadaptive merging) */
  manualBand: HeatBandId;
  /** The neuroadaptive suggested band */
  neuroadaptiveBand: HeatBandId;
  /** The hardware floor band */
  hardwareFloor: HeatBandId;
  /** The effective (final) band after all inputs */
  effectiveBand: HeatBandId;
  /** Set the heat band manually */
  setHeatBand: (band: HeatBandId) => void;
  /** Escalate the heat band by 1 (clamped to 4) */
  escalate: () => void;
  /** De-escalate the heat band by 1 (clamped to 0) */
  deescalate: () => void;
  /** Set the neuroadaptive band (called by sensing engine) */
  setNeuroadaptiveBand: (band: HeatBandId) => void;
  /** Set the hardware floor (called by hardware symbiosis) */
  setHardwareFloor: (band: HeatBandId) => void;
  /** Which input source is currently dominant */
  dominantSource: 'manual' | 'neuroadaptive' | 'hardware';
}

const TemperatureContext = createContext<TemperatureContextValue | null>(null);

export function TemperatureProvider({
  initialBand = 0,
  children,
}: {
  initialBand?: HeatBandId;
  children: ReactNode;
}) {
  const [manualBand, setManualBand] = useState<HeatBandId>(initialBand);
  const [neuroadaptiveBand, setNeuroadaptiveBandState] = useState<HeatBandId>(0);
  const [hardwareFloor, setHardwareFloorState] = useState<HeatBandId>(0);

  // Effective band = max of all three inputs
  const effectiveBand = Math.max(manualBand, neuroadaptiveBand, hardwareFloor) as HeatBandId;

  // Which source is dominant
  const dominantSource = effectiveBand === hardwareFloor && hardwareFloor > manualBand && hardwareFloor > neuroadaptiveBand
    ? 'hardware'
    : effectiveBand === neuroadaptiveBand && neuroadaptiveBand > manualBand
      ? 'neuroadaptive'
      : 'manual';

  const setHeatBand = useCallback((b: HeatBandId) => {
    setManualBand(Math.max(0, Math.min(4, b)) as HeatBandId);
  }, []);

  const escalate = useCallback(() => {
    setManualBand(prev => Math.min(4, prev + 1) as HeatBandId);
  }, []);

  const deescalate = useCallback(() => {
    setManualBand(prev => Math.max(0, prev - 1) as HeatBandId);
  }, []);

  const setNeuroadaptiveBand = useCallback((b: HeatBandId) => {
    setNeuroadaptiveBandState(Math.max(0, Math.min(4, b)) as HeatBandId);
  }, []);

  const setHardwareFloor = useCallback((b: HeatBandId) => {
    setHardwareFloorState(Math.max(0, Math.min(4, b)) as HeatBandId);
  }, []);

  const constraints = useMemo(() => deriveConstraints(effectiveBand), [effectiveBand]);

  const value = useMemo(() => ({
    constraints,
    manualBand,
    neuroadaptiveBand,
    hardwareFloor,
    effectiveBand,
    setHeatBand,
    escalate,
    deescalate,
    setNeuroadaptiveBand,
    setHardwareFloor,
    dominantSource,
  }), [constraints, manualBand, neuroadaptiveBand, hardwareFloor, effectiveBand, setHeatBand, escalate, deescalate, setNeuroadaptiveBand, setHardwareFloor, dominantSource]);

  return (
    <TemperatureContext.Provider value={value}>
      {children}
    </TemperatureContext.Provider>
  );
}

export function useTemperature(): TemperatureContextValue {
  const ctx = useContext(TemperatureContext);
  if (!ctx) {
    // Fallback: return Band 0 (safe & social) if no provider
    return {
      constraints: deriveConstraints(0),
      manualBand: 0,
      neuroadaptiveBand: 0,
      hardwareFloor: 0,
      effectiveBand: 0,
      setHeatBand: () => {},
      escalate: () => {},
      deescalate: () => {},
      setNeuroadaptiveBand: () => {},
      setHardwareFloor: () => {},
      dominantSource: 'manual',
    };
  }
  return ctx;
}

// ═══════════════════════════════════════════════════
// UTILITY: Apply governance to a duration value
// ═══════════════════════════════════════════════════

/** Slow a duration by the governance multiplier */
export function governedDuration(baseMs: number, constraints: GovernanceConstraints): number {
  return baseMs * constraints.durationMultiplier;
}

/** Scale a motion speed by governance */
export function governedSpeed(baseSpeed: number, constraints: GovernanceConstraints): number {
  return baseSpeed * constraints.motionSpeed;
}

/** Check if a copy layer should appear at this heat band */
export function shouldShowCopy(
  layer: 'eyebrow' | 'canopy' | 'guide' | 'gesture' | 'receipt' | 'route' | 'ambient',
  constraints: GovernanceConstraints,
): boolean {
  if (constraints.band >= 4) return false; // Band 4: zero reading
  if (constraints.band >= 3) return layer === 'gesture'; // Band 3: gesture only
  if (constraints.copyDensity === 'whisper') return layer !== 'guide' && layer !== 'ambient';
  if (constraints.copyDensity === 'light') return layer !== 'ambient';
  return true;
}
