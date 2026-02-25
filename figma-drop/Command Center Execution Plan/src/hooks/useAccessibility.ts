import { useEffect, useState, useRef, useCallback } from 'react';
import { reducedMotionSystem, screenReader } from '@/design-tokens';

/**
 * useReducedMotion - Detect prefers-reduced-motion preference
 * Automatically respects OS/browser accessibility settings
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check media query
    const mediaQuery = window.matchMedia(reducedMotionSystem.mediaQuery);
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * useAnimationPreference - User's animation preference with localStorage
 * Allows users to override system settings
 */
export function useAnimationPreference(storageKey: string = 'recoveryos_animations_enabled') {
  const prefersReducedMotion = useReducedMotion();
  const [userPreference, setUserPreference] = useState<boolean | null>(null);

  // Load user preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setUserPreference(stored === 'true');
    }
  }, [storageKey]);

  // Save user preference to localStorage
  const setPreference = useCallback((enabled: boolean) => {
    setUserPreference(enabled);
    localStorage.setItem(storageKey, String(enabled));
  }, [storageKey]);

  // Clear user preference (revert to system)
  const clearPreference = useCallback(() => {
    setUserPreference(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Final decision: user preference overrides system
  const shouldAnimate = userPreference !== null 
    ? userPreference 
    : !prefersReducedMotion;

  return {
    shouldAnimate,
    prefersReducedMotion,
    userPreference,
    setPreference,
    clearPreference,
    isSystemDefault: userPreference === null,
  };
}

/**
 * useMotionSafety - Returns appropriate animation config based on user preference
 * Automatically simplifies or disables animations when needed
 */
export function useMotionSafety<T extends Record<string, any>>(
  fullAnimation: T,
  fallback: 'fade' | 'instant' | 'none' = 'fade'
): T {
  const { shouldAnimate } = useAnimationPreference();

  if (shouldAnimate) {
    return fullAnimation;
  }

  // Return fallback based on type
  switch (fallback) {
    case 'fade':
      return reducedMotionSystem.fallbacks.fadeOnly as T;
    case 'instant':
      return reducedMotionSystem.fallbacks.instant as T;
    case 'none':
      return {} as T;
    default:
      return fullAnimation;
  }
}

/**
 * useScreenReaderAnnouncement - Make screen reader announcements
 * Uses ARIA live regions for accessible notifications
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((
    message: string, 
    level: 'polite' | 'assertive' = 'polite'
  ) => {
    setPoliteness(level);
    setAnnouncement(message);

    // Clear announcement after a short delay
    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return {
    announce,
    announcePolite,
    announceAssertive,
    announcement,
    politeness,
  };
}

/**
 * useFocusTrap - Trap focus within a container (for modals, drawers)
 * Prevents keyboard navigation from leaving the component
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Save currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable]',
      ].join(', ');

      return Array.from(
        container.querySelectorAll<HTMLElement>(selector)
      ).filter(el => {
        return el.offsetParent !== null; // Only visible elements
      });
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab (backwards)
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forwards)
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Cleanup: restore focus
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [containerRef, isActive]);
}

/**
 * useFocusVisible - Detect if user is navigating via keyboard
 * Shows focus indicators only for keyboard navigation
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [usingKeyboard, setUsingKeyboard] = useState(false);

  useEffect(() => {
    // Detect keyboard usage
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setUsingKeyboard(true);
      }
    };

    // Detect mouse usage
    const handleMouseDown = () => {
      setUsingKeyboard(false);
    };

    // Update focus-visible state
    const handleFocus = () => {
      if (usingKeyboard) {
        setIsFocusVisible(true);
      }
    };

    const handleBlur = () => {
      setIsFocusVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, [usingKeyboard]);

  return { isFocusVisible, usingKeyboard };
}

/**
 * useKeyboardShortcut - Register keyboard shortcuts
 * Accessible keyboard navigation for power users
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const {
        ctrl = false,
        shift = false,
        alt = false,
        meta = false,
      } = modifiers;

      const matches =
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta;

      if (matches) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, modifiers]);
}

/**
 * useAriaLiveRegion - Create and manage ARIA live region
 * For dynamic content updates accessible to screen readers
 */
export function useAriaLiveRegion() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive' | 'off'>('polite');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announceMessage = useCallback((
    newMessage: string,
    level: 'polite' | 'assertive' = 'polite',
    clearAfter: number = 3000
  ) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new message
    setPoliteness(level);
    setMessage(newMessage);

    // Auto-clear after delay
    if (clearAfter > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, clearAfter);
    }
  }, []);

  const clearMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage('');
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    message,
    politeness,
    announceMessage,
    clearMessage,
    ariaProps: {
      'aria-live': politeness,
      'aria-atomic': 'true',
      role: politeness === 'assertive' ? 'alert' : 'status',
    },
  };
}

/**
 * useAccessibleAnimation - Complete accessible animation wrapper
 * Combines reduced motion, user preferences, and ARIA announcements
 */
export function useAccessibleAnimation(
  animationName: string,
  announceStart: boolean = false,
  announceEnd: boolean = false
) {
  const { shouldAnimate } = useAnimationPreference();
  const { announce } = useScreenReaderAnnouncement();
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    if (!shouldAnimate) return;

    setIsAnimating(true);

    if (announceStart) {
      announce(`${animationName} started`, 'polite');
    }
  }, [shouldAnimate, announceStart, animationName, announce]);

  const endAnimation = useCallback(() => {
    setIsAnimating(false);

    if (announceEnd) {
      announce(`${animationName} complete`, 'polite');
    }
  }, [announceEnd, animationName, announce]);

  return {
    shouldAnimate,
    isAnimating,
    startAnimation,
    endAnimation,
  };
}

/**
 * useSkipLink - Accessible skip link for keyboard navigation
 * Allows users to skip to main content
 */
export function useSkipLink(targetId: string) {
  const skipToTarget = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [targetId]);

  return { skipToTarget };
}

/**
 * useEscapeKey - Handle Escape key press
 * Common pattern for closing modals/drawers
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onEscape, enabled]);
}

/**
 * useAutoFocus - Auto-focus element on mount
 * Useful for modals, search inputs, etc.
 */
export function useAutoFocus<T extends HTMLElement>(
  enabled: boolean = true,
  delay: number = 0
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const timeout = setTimeout(() => {
      ref.current?.focus();
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [enabled, delay]);

  return ref;
}
