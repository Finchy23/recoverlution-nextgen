/**
 * useSurfaceArrival — Unified Surface Transition Choreography
 *
 * Every mode change follows the same immersive arc:
 *
 *   Phase 1: ATMOSPHERE (0 → ~300ms)
 *     The glass breathes alone. Canvas/signature is visible.
 *     No copy, no controls. Pure spatial presence.
 *
 *   Phase 2: ARRIVED (~300ms+)
 *     Content emerges from the glass with staggered revelation.
 *     Each surface decides what "arrived" means for its own content,
 *     but the TIMING of arrival is universal.
 *
 * This replaces the per-surface arrival logic that used to vary
 * from 600ms to 1200ms across different surfaces.
 *
 * The UniversalPlayer handles the cross-surface transition (exit/enter).
 * This hook handles only the INTERNAL arrival within a surface.
 *
 * Stagger helper: returns delay values for layered content revelation.
 *   atmosphere → eyebrow → headline → controls → peripherals
 */

import { useState, useEffect, useMemo } from 'react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useTemperature, governedDuration } from '../design-system/TemperatureGovernor';

// ─── Canonical arrival timing ───
// These are the INTERNAL delays after the surface mounts.
// The UniversalPlayer's crossfade runs concurrently.

const ATMOSPHERE_MS = 300;   // Glass breathes before anything appears

// ─── Stagger delays (relative to arrival) ───
// Content layers emerge in sequence after atmosphere settles

export const STAGGER = {
  /** Background canvas / signature — immediate (it IS the atmosphere) */
  atmosphere: 0,
  /** Eyebrow / label — first text to appear */
  eyebrow: 0.15,
  /** Primary content — headline, hero element */
  content: 0.25,
  /** Interactive controls — buttons, sliders, selectors */
  controls: 0.4,
  /** Peripheral elements — arrows, secondary options */
  peripherals: 0.55,
} as const;

// ─── Canonical motion config ───
// Shared spring-like easing for all surface content emergence

export const SURFACE_EASE = [0.16, 1, 0.3, 1] as const;
export const SURFACE_DURATION = 0.9;

// ─── The Hook ───

interface UseSurfaceArrivalResult {
  /** Whether the surface has completed its atmosphere phase */
  arrived: boolean;
  /** Delay in seconds for a given stagger layer */
  delay: (layer: keyof typeof STAGGER) => number;
  /** The governed atmosphere duration in ms */
  atmosphereMs: number;
}

export function useSurfaceArrival(mode: SurfaceMode): UseSurfaceArrivalResult {
  const [arrived, setArrived] = useState(false);
  const { constraints } = useTemperature();

  // Govern the atmosphere duration based on temperature
  // Higher heat bands → shorter atmosphere (user needs content faster)
  const atmosphereMs = useMemo(
    () => governedDuration(ATMOSPHERE_MS, constraints),
    [constraints],
  );

  useEffect(() => {
    setArrived(false);
    const timer = setTimeout(() => setArrived(true), atmosphereMs);
    return () => clearTimeout(timer);
  }, [mode.id, atmosphereMs]);

  const delay = useMemo(
    () => (layer: keyof typeof STAGGER) => STAGGER[layer],
    [],
  );

  return { arrived, delay, atmosphereMs };
}
