/**
 * useTypeInteraction — Pattern D: Type Incantation
 * 
 * Validates typed text against accepted phrases.
 * Provides shake-reject and glow-accept feedback states.
 * Supports both exact match and keyword/prefix matching.
 * 
 * Used by: Incantation (have to→get to), Mythic Seal,
 * Night Quest, Pre-Hindsight, Future Self Chat, etc.
 */
import { useState, useCallback, useRef } from 'react';

interface TypeConfig {
  /** Accepted phrases (lowercase). If input contains any, it's accepted. */
  acceptPhrases?: string[];
  /** Rejected phrases (lowercase). If input contains any, it's rejected with shake. */
  rejectPhrases?: string[];
  /** If true, must exactly match an accept phrase (case-insensitive) */
  exactMatch?: boolean;
  /** Called on successful acceptance */
  onAccept?: (text: string) => void;
  /** Called on rejection */
  onReject?: (text: string) => void;
  /** Minimum character count before validation fires */
  minLength?: number;
}

interface TypeState {
  value: string;
  status: 'idle' | 'typing' | 'accepted' | 'rejected';
  shakeCount: number;  // increments on each rejection for animation key
  accepted: boolean;
}

export function useTypeInteraction(config: TypeConfig = {}) {
  const {
    acceptPhrases = [],
    rejectPhrases = [],
    exactMatch = false,
    onAccept,
    onReject,
    minLength = 3,
  } = config;

  const [state, setState] = useState<TypeState>({
    value: '',
    status: 'idle',
    shakeCount: 0,
    accepted: false,
  });

  const shakeTimerRef = useRef<number | null>(null);

  const clearShake = useCallback(() => {
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
  }, []);

  const onChange = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      value: text,
      status: text.length > 0 ? 'typing' : 'idle',
    }));
  }, []);

  const submit = useCallback(() => {
    const lower = state.value.toLowerCase().trim();
    if (lower.length < minLength) return;

    // Check for rejection first
    const isRejected = rejectPhrases.some(rp => lower.includes(rp));
    if (isRejected) {
      clearShake();
      setState(prev => ({
        ...prev,
        status: 'rejected',
        shakeCount: prev.shakeCount + 1,
      }));
      onReject?.(state.value);
      shakeTimerRef.current = window.setTimeout(() => {
        setState(prev => ({ ...prev, status: 'typing' }));
      }, 800);
      return;
    }

    // Check for acceptance
    const isAccepted = exactMatch
      ? acceptPhrases.some(ap => lower === ap)
      : acceptPhrases.some(ap => lower.includes(ap));

    if (isAccepted) {
      setState(prev => ({
        ...prev,
        status: 'accepted',
        accepted: true,
      }));
      onAccept?.(state.value);
    } else if (acceptPhrases.length > 0) {
      // Has accept rules but didn't match — subtle rejection
      clearShake();
      setState(prev => ({
        ...prev,
        status: 'rejected',
        shakeCount: prev.shakeCount + 1,
      }));
      onReject?.(state.value);
      shakeTimerRef.current = window.setTimeout(() => {
        setState(prev => ({ ...prev, status: 'typing' }));
      }, 800);
    } else {
      // No accept rules — free-form accept
      setState(prev => ({
        ...prev,
        status: 'accepted',
        accepted: true,
      }));
      onAccept?.(state.value);
    }
  }, [state.value, acceptPhrases, rejectPhrases, exactMatch, minLength, onAccept, onReject, clearShake]);

  const reset = useCallback(() => {
    clearShake();
    setState({ value: '', status: 'idle', shakeCount: 0, accepted: false });
  }, [clearShake]);

  return { ...state, onChange, submit, reset };
}
