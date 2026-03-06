import { useEffect, useState, useRef, useCallback } from 'react';
import { reducedMotionSystem } from '@/design-tokens';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionSystem.mediaQuery);
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => { mediaQuery.removeEventListener('change', handleChange); };
  }, []);

  return prefersReducedMotion;
}

export function useAnimationPreference(storageKey: string = 'recoveryos_animations_enabled') {
  const prefersReducedMotion = useReducedMotion();
  const [userPreference, setUserPreference] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) { setUserPreference(stored === 'true'); }
  }, [storageKey]);

  const setPreference = useCallback((enabled: boolean) => {
    setUserPreference(enabled);
    localStorage.setItem(storageKey, String(enabled));
  }, [storageKey]);

  const clearPreference = useCallback(() => {
    setUserPreference(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const shouldAnimate = userPreference !== null ? userPreference : !prefersReducedMotion;

  return { shouldAnimate, prefersReducedMotion, userPreference, setPreference, clearPreference, isSystemDefault: userPreference === null };
}

export function useMotionSafety<T extends Record<string, any>>(
  fullAnimation: T,
  fallback: 'fade' | 'instant' | 'none' = 'fade'
): T {
  const { shouldAnimate } = useAnimationPreference();
  if (shouldAnimate) return fullAnimation;
  switch (fallback) {
    case 'fade': return reducedMotionSystem.fallbacks.fadeOnly as T;
    case 'instant': return reducedMotionSystem.fallbacks.instant as T;
    case 'none': return {} as T;
    default: return fullAnimation;
  }
}

export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setAnnouncement(message);
    setTimeout(() => { setAnnouncement(''); }, 1000);
  }, []);

  const announcePolite = useCallback((message: string) => { announce(message, 'polite'); }, [announce]);
  const announceAssertive = useCallback((message: string) => { announce(message, 'assertive'); }, [announce]);

  return { announce, announcePolite, announceAssertive, announcement, politeness };
}

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean = true) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const container = containerRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement;

    const getFocusableElements = () => {
      const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
      return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(el => el.offsetParent !== null);
    };

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) focusableElements[0].focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = getFocusableElements();
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) { event.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current) previousFocusRef.current.focus();
    };
  }, [containerRef, isActive]);
}

export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onEscape(); }
    };
    window.addEventListener('keydown', handleEscape);
    return () => { window.removeEventListener('keydown', handleEscape); };
  }, [onEscape, enabled]);
}
