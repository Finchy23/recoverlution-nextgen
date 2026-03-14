import { useRef, useEffect, useState, type ReactNode } from 'react';
import { timing } from './surface-tokens';

/**
 * Reveal
 *
 * Content emerges from darkness. No springs, no bounce.
 * Just opacity and a gentle upward drift, like breath.
 */

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** vertical drift in px — default 18 */
  drift?: number;
  /** once: true by default */
  once?: boolean;
}

export function Reveal({ children, className = '', delay = 0, drift = 18, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${drift}px)`,
        transition: `opacity ${timing.dur.surface} ${timing.curve} ${delay}s, transform ${timing.dur.surface} ${timing.curve} ${delay}s`,
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}