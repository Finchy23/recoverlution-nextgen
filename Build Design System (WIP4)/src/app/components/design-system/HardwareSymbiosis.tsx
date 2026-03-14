/**
 * HARDWARE SYMBIOSIS — §12
 *
 * "The glass should not fight the device. It should become the device."
 *
 * The system reads hardware and OS-level signals to adapt
 * its temperature and fidelity. These are not "settings" —
 * they are the glass acknowledging reality.
 *
 * Signals we read:
 *
 *   prefers-reduced-motion
 *     User or OS has requested minimal motion.
 *     Effect: auto Band 2+ (motion constrained)
 *
 *   Battery Level (Battery Status API)
 *     Low battery → reduce particles, motion, acoustics.
 *     Effect: Band floor raises as battery drops
 *
 *   prefers-color-scheme
 *     Dark/light preference. Recoverlution is always dark glass,
 *     but we adjust contrast for light-mode users.
 *     Effect: boost atmosphere luminosity slightly in light mode
 *
 *   prefers-contrast
 *     High contrast preference.
 *     Effect: sharper text, stronger semantic particles
 *
 *   Device Memory (navigator.deviceMemory)
 *     Low-memory devices get fewer particles, simpler physics.
 *     Effect: particle/waveform reduction
 *
 *   Network Quality (navigator.connection)
 *     Slow connection → preload less, reduce asset weight.
 *     Effect: simplify atmosphere, preload fewer states
 *
 * All detection is passive. No data leaves the device.
 * The glass simply reads what the OS already knows.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { HeatBandId } from './doctrine';

// ═══════════════════════════════════════════════════
// HARDWARE STATE
// ═══════════════════════════════════════════════════

export interface HardwareState {
  /** User/OS prefers reduced motion */
  prefersReducedMotion: boolean;
  /** User/OS prefers high contrast */
  prefersHighContrast: boolean;
  /** User/OS color scheme preference */
  colorScheme: 'dark' | 'light';
  /** Battery level (0-1, null if unavailable) */
  batteryLevel: number | null;
  /** Whether the device is charging */
  isCharging: boolean | null;
  /** Device memory in GB (null if unavailable) */
  deviceMemory: number | null;
  /** Effective connection type (null if unavailable) */
  connectionType: string | null;
  /** Whether the connection is metered (save data) */
  saveData: boolean;
  /** Screen refresh rate hint */
  screenRefreshRate: number;
}

export interface HardwareConstraints {
  /** Minimum band floor imposed by hardware */
  minBandFloor: HeatBandId;
  /** Particle multiplier (0-1) */
  particleScale: number;
  /** Motion multiplier (0-1) */
  motionScale: number;
  /** Whether acoustics should be suppressed */
  suppressAcoustics: boolean;
  /** Whether to boost contrast */
  boostContrast: boolean;
  /** Whether to simplify atmosphere */
  simplifyAtmosphere: boolean;
  /** Summary of active hardware signals */
  activeSignals: string[];
}

// ═══════════════════════════════════════════════════
// DETECTION FUNCTIONS
// ═══════════════════════════════════════════════════

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

function detectHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-contrast: more)')?.matches ?? false;
}

function detectColorScheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark';
}

function detectDeviceMemory(): number | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as any).deviceMemory ?? null;
}

function detectConnection(): { type: string | null; saveData: boolean } {
  if (typeof navigator === 'undefined') return { type: null, saveData: false };
  const conn = (navigator as any).connection;
  if (!conn) return { type: null, saveData: false };
  return {
    type: conn.effectiveType ?? null,
    saveData: conn.saveData ?? false,
  };
}

function detectScreenRefreshRate(): number {
  // Default to 60. Some screens report higher via getDisplayMedia, but
  // we don't need that level of access. 60 is a safe default.
  return 60;
}

// ═══════════════════════════════════════════════════
// CONSTRAINT DERIVATION
// ═══════════════════════════════════════════════════

function deriveHardwareConstraints(state: HardwareState): HardwareConstraints {
  let minBandFloor: HeatBandId = 0;
  let particleScale = 1;
  let motionScale = 1;
  let suppressAcoustics = false;
  let boostContrast = false;
  let simplifyAtmosphere = false;
  const activeSignals: string[] = [];

  // ── prefers-reduced-motion ──
  if (state.prefersReducedMotion) {
    minBandFloor = Math.max(minBandFloor, 2) as HeatBandId;
    motionScale = 0;
    activeSignals.push('reduced-motion');
  }

  // ── prefers-high-contrast ──
  if (state.prefersHighContrast) {
    boostContrast = true;
    activeSignals.push('high-contrast');
  }

  // ── Battery level ──
  if (state.batteryLevel !== null) {
    if (state.batteryLevel < 0.1 && !state.isCharging) {
      // Critical: Band 3+ floor, minimal everything
      minBandFloor = Math.max(minBandFloor, 3) as HeatBandId;
      particleScale = 0.1;
      motionScale = Math.min(motionScale, 0.15);
      suppressAcoustics = true;
      simplifyAtmosphere = true;
      activeSignals.push('battery-critical');
    } else if (state.batteryLevel < 0.2 && !state.isCharging) {
      // Low: Band 2+ floor, reduced particles
      minBandFloor = Math.max(minBandFloor, 2) as HeatBandId;
      particleScale = Math.min(particleScale, 0.4);
      motionScale = Math.min(motionScale, 0.5);
      activeSignals.push('battery-low');
    } else if (state.batteryLevel < 0.35 && !state.isCharging) {
      // Moderate: slight reduction
      particleScale = Math.min(particleScale, 0.7);
      activeSignals.push('battery-moderate');
    }
  }

  // ── Device memory ──
  if (state.deviceMemory !== null) {
    if (state.deviceMemory <= 2) {
      // Low memory device
      particleScale = Math.min(particleScale, 0.3);
      simplifyAtmosphere = true;
      activeSignals.push('low-memory');
    } else if (state.deviceMemory <= 4) {
      particleScale = Math.min(particleScale, 0.6);
      activeSignals.push('limited-memory');
    }
  }

  // ── Network quality ──
  if (state.saveData) {
    simplifyAtmosphere = true;
    activeSignals.push('save-data');
  }
  if (state.connectionType === '2g' || state.connectionType === 'slow-2g') {
    simplifyAtmosphere = true;
    activeSignals.push('slow-network');
  }

  return {
    minBandFloor,
    particleScale,
    motionScale,
    suppressAcoustics,
    boostContrast,
    simplifyAtmosphere,
    activeSignals,
  };
}

// ═══════════════════════════════════════════════════
// HOOK: useHardwareSymbiosis
// ═══════════════════════════════════════════════════

export interface HardwareSymbiosisResult {
  /** The raw hardware state */
  hardware: HardwareState;
  /** Derived constraints for the temperature system */
  hardwareConstraints: HardwareConstraints;
  /** Force a re-detection */
  refresh: () => void;
}

export function useHardwareSymbiosis(): HardwareSymbiosisResult {
  const [hardware, setHardware] = useState<HardwareState>(() => ({
    prefersReducedMotion: detectReducedMotion(),
    prefersHighContrast: detectHighContrast(),
    colorScheme: detectColorScheme(),
    batteryLevel: null,
    isCharging: null,
    deviceMemory: detectDeviceMemory(),
    connectionType: detectConnection().type,
    saveData: detectConnection().saveData,
    screenRefreshRate: detectScreenRefreshRate(),
  }));

  // ── Media query listeners ──
  useEffect(() => {
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia?.('(prefers-contrast: more)');
    const schemeQuery = window.matchMedia?.('(prefers-color-scheme: light)');

    const onMotionChange = (e: MediaQueryListEvent) => {
      setHardware(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    const onContrastChange = (e: MediaQueryListEvent) => {
      setHardware(prev => ({ ...prev, prefersHighContrast: e.matches }));
    };
    const onSchemeChange = (e: MediaQueryListEvent) => {
      setHardware(prev => ({ ...prev, colorScheme: e.matches ? 'light' : 'dark' }));
    };

    motionQuery?.addEventListener?.('change', onMotionChange);
    contrastQuery?.addEventListener?.('change', onContrastChange);
    schemeQuery?.addEventListener?.('change', onSchemeChange);

    return () => {
      motionQuery?.removeEventListener?.('change', onMotionChange);
      contrastQuery?.removeEventListener?.('change', onContrastChange);
      schemeQuery?.removeEventListener?.('change', onSchemeChange);
    };
  }, []);

  // ── Battery API ──
  useEffect(() => {
    let battery: any = null;

    const updateBattery = () => {
      if (battery) {
        setHardware(prev => ({
          ...prev,
          batteryLevel: battery.level,
          isCharging: battery.charging,
        }));
      }
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        battery = b;
        updateBattery();
        b.addEventListener('levelchange', updateBattery);
        b.addEventListener('chargingchange', updateBattery);
      }).catch(() => {/* Battery API not available */});
    }

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  // ── Network change listener ──
  useEffect(() => {
    const conn = (navigator as any).connection;
    if (!conn) return;

    const onConnectionChange = () => {
      setHardware(prev => ({
        ...prev,
        connectionType: conn.effectiveType ?? null,
        saveData: conn.saveData ?? false,
      }));
    };

    conn.addEventListener?.('change', onConnectionChange);
    return () => conn.removeEventListener?.('change', onConnectionChange);
  }, []);

  const refresh = useCallback(() => {
    setHardware({
      prefersReducedMotion: detectReducedMotion(),
      prefersHighContrast: detectHighContrast(),
      colorScheme: detectColorScheme(),
      batteryLevel: hardware.batteryLevel,
      isCharging: hardware.isCharging,
      deviceMemory: detectDeviceMemory(),
      connectionType: detectConnection().type,
      saveData: detectConnection().saveData,
      screenRefreshRate: detectScreenRefreshRate(),
    });
  }, [hardware.batteryLevel, hardware.isCharging]);

  const hardwareConstraints = useMemo(
    () => deriveHardwareConstraints(hardware),
    [hardware],
  );

  return useMemo(() => ({
    hardware,
    hardwareConstraints,
    refresh,
  }), [hardware, hardwareConstraints, refresh]);
}
