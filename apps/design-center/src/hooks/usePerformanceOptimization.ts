import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  root?: Element | null;
}

interface UseIntersectionObserverResult {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false, root = null } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (triggerOnce && isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
        if (triggerOnce && entry.isIntersecting) observer.disconnect();
      },
      { threshold, rootMargin, root }
    );

    observer.observe(element);
    return () => { observer.disconnect(); };
  }, [elementRef, threshold, rootMargin, triggerOnce, root, isIntersecting]);

  return { isIntersecting, entry };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastRan = useRef(Date.now());
  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    }) as T,
    [callback, delay]
  );
}

export function useAnimationFrame(callback: (deltaTime: number) => void, isRunning: boolean = true): void {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    if (!isRunning) return;
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [callback, isRunning]);
}

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => { setPrefersReducedMotion(e.matches); };
    mediaQuery.addEventListener('change', handleChange);
    return () => { mediaQuery.removeEventListener('change', handleChange); };
  }, []);

  return prefersReducedMotion;
}
