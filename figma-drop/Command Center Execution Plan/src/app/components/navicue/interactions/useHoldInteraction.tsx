/**
 * useHoldInteraction — Pattern E: Hold & Release
 * 
 * Tracks long-press duration. Builds tension 0→1 while held.
 * Fires onThreshold at intervals. Fires onComplete at max.
 * On release: captures final tension value.
 * 
 * Used by: Silence as Weapon, Crescendo, Trance Drum, etc.
 */
import { useRef, useState, useCallback, useEffect } from 'react';

interface HoldConfig {
  /** Duration in ms to reach 100% tension */
  maxDuration?: number;
  /** Called at 25%, 50%, 75%, 100% thresholds */
  onThreshold?: (tension: number) => void;
  /** Called when tension reaches 1.0 */
  onComplete?: () => void;
  /** Update frequency in ms */
  tickRate?: number;
}

interface HoldState {
  tension: number;       // 0-1
  isHolding: boolean;
  completed: boolean;
  heldDuration: number;  // ms
}

export function useHoldInteraction(config: HoldConfig = {}) {
  const { maxDuration = 5000, onThreshold, onComplete, tickRate = 50 } = config;
  const [state, setState] = useState<HoldState>({
    tension: 0, isHolding: false, completed: false, heldDuration: 0,
  });
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const lastThresholdRef = useRef(0);
  // Ref mirror to avoid stale closure reads of state.completed
  const completedRef = useRef(false);
  const isHoldingRef = useRef(false);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startHold = useCallback(() => {
    if (completedRef.current) return;
    startTimeRef.current = Date.now();
    lastThresholdRef.current = 0;
    isHoldingRef.current = true;
    setState(prev => ({ ...prev, isHolding: true }));
    
    clearTick();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const tension = Math.min(1, elapsed / maxDuration);
      
      // Check threshold crossings (25% intervals)
      const thresholdStep = Math.floor(tension * 4) / 4;
      if (thresholdStep > lastThresholdRef.current) {
        lastThresholdRef.current = thresholdStep;
        onThreshold?.(tension);
      }
      
      // Check completion BEFORE setState to avoid side effects inside updater
      const justCompleted = tension >= 1 && !completedRef.current;
      if (justCompleted) {
        completedRef.current = true;
        clearTick();
      }

      setState(prev => {
        if (justCompleted) {
          return { tension: 1, isHolding: false, completed: true, heldDuration: elapsed };
        }
        return { ...prev, tension, heldDuration: elapsed };
      });

      // Fire callback outside setState
      if (justCompleted) onComplete?.();
    }, tickRate);
  }, [maxDuration, onThreshold, onComplete, tickRate, clearTick]);

  const endHold = useCallback(() => {
    isHoldingRef.current = false;
    clearTick();
    setState(prev => ({ ...prev, isHolding: false }));
  }, [clearTick]);

  // Cleanup on unmount
  useEffect(() => clearTick, [clearTick]);

  const holdProps = {
    onPointerDown: () => startHold(),
    onPointerUp: () => endHold(),
    onPointerCancel: () => endHold(),
    onPointerLeave: () => { if (isHoldingRef.current) endHold(); },
    style: { touchAction: 'none' as const, cursor: completedRef.current ? 'default' : 'pointer', userSelect: 'none' as const },
  };

  const reset = useCallback(() => {
    clearTick();
    lastThresholdRef.current = 0;
    completedRef.current = false;
    isHoldingRef.current = false;
    setState({ tension: 0, isHolding: false, completed: false, heldDuration: 0 });
  }, [clearTick]);

  return { ...state, holdProps, reset };
}