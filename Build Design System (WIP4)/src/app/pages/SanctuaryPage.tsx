import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';
import { room, font, colors, glass, leading, weight, timing, layer } from '../components/design-system/surface-tokens';

/**
 * THE HEARTBEAT
 *
 * Three lines. The rest is silence and breath.
 * The scroll is the exhale.
 */

const BREATH_DURATION = 10.9; // 5.5 breaths per minute

// ─── Emotional temperature of the scroll ───
// void → purple presence → warm recognition → grounding → quiet return → held silence
type RGBA = [number, number, number, number];

interface Stage {
  at: number;
  primary: RGBA;
  secondary: RGBA;
  orbColor: [number, number, number];
}

const stages: Stage[] = [
  { at: 0.00, primary: [15, 13, 26, 0],      secondary: [15, 13, 26, 0],      orbColor: [107, 82, 255] },
  { at: 0.10, primary: [42, 31, 122, 0.18],   secondary: [107, 82, 255, 0.06],  orbColor: [107, 82, 255] },
  { at: 0.25, primary: [62, 43, 130, 0.22],   secondary: [168, 155, 255, 0.07], orbColor: [138, 122, 255] },
  { at: 0.40, primary: [120, 75, 60, 0.14],   secondary: [180, 120, 80, 0.05],  orbColor: [200, 150, 120] },
  { at: 0.55, primary: [31, 140, 130, 0.12],  secondary: [0, 160, 180, 0.05],   orbColor: [31, 178, 160] },
  { at: 0.72, primary: [60, 40, 140, 0.10],   secondary: [107, 82, 255, 0.04],  orbColor: [107, 82, 255] },
  { at: 0.88, primary: [42, 31, 90, 0.05],    secondary: [15, 13, 26, 0],       orbColor: [168, 155, 255] },
  { at: 1.00, primary: [15, 13, 26, 0],       secondary: [15, 13, 26, 0],       orbColor: [168, 155, 255] },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function lerpRGBA(a: RGBA, b: RGBA, t: number): string {
  return `rgba(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))},${lerp(a[3], b[3], t).toFixed(3)})`;
}

function lerpRGB(a: [number, number, number], b: [number, number, number], t: number): string {
  return `${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))}`;
}

function interpolateStage(progress: number) {
  let i = 0;
  for (let j = 1; j < stages.length; j++) {
    if (progress <= stages[j].at) { i = j - 1; break; }
    if (j === stages.length - 1) i = j - 1;
  }
  const a = stages[i];
  const b = stages[Math.min(i + 1, stages.length - 1)];
  const range = b.at - a.at;
  const t = range === 0 ? 0 : Math.max(0, Math.min(1, (progress - a.at) / range));
  const eased = t * t * (3 - 2 * t); // smoothstep
  return {
    primary: lerpRGBA(a.primary, b.primary, eased),
    secondary: lerpRGBA(a.secondary, b.secondary, eased),
    orbRGB: lerpRGB(a.orbColor, b.orbColor, eased),
  };
}

// ─── The three truths ──
const verses = [
  { text: 'You have spent your life trying to think your way out of a feeling.', at: 0.24 },
  { text: 'The body already knows.', at: 0.48 },
  { text: 'This is the space between.', at: 0.72 },
];

const VERSE_HOLD = 0.08;   // how long the verse stays at full opacity (scroll fraction)
const VERSE_FADE = 0.06;   // how far before/after the hold it takes to fade in/out

export function SanctuaryPage() {
  const reducedMotion = useReducedMotion();
  const rafRef = useRef<number>(0);
  const [scroll, setScroll] = useState(0);
  const [breath, setBreath] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [settled, setSettled] = useState(false); // after initial arrival transition
  const containerRef = useRef<HTMLDivElement>(null);

  // Delayed arrival — the void holds for a moment before anything appears
  useEffect(() => {
    const t1 = setTimeout(() => setArrived(true), reducedMotion ? 100 : 1200);
    const t2 = setTimeout(() => setSettled(true), reducedMotion ? 200 : 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reducedMotion]);

  // Scroll
  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    const max = containerRef.current.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    setScroll(Math.min(1, Math.max(0, window.scrollY / max)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // Breathing
  useEffect(() => {
    if (reducedMotion) { setBreath(0.5); return; }
    const origin = performance.now();
    const tick = (now: number) => {
      const s = (now - origin) / 1000;
      setBreath((Math.sin((s / BREATH_DURATION) * Math.PI * 2 - Math.PI / 2) + 1) / 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion]);

  // ─── Derived ───
  const { primary, secondary, orbRGB } = interpolateStage(scroll);
  const orbScale = 1 + breath * 0.06;
  const orbGlow = breath;

  // Orb visibility: gentle arrival, then tracks scroll
  const orbAlpha = arrived ? Math.min(1, 0.45 + scroll * 1.8) : 0;

  // Seal at very end
  const sealAlpha = Math.max(0, Math.min(1, (scroll - 0.91) / 0.07));
  const orbFadeForSeal = scroll > 0.89 ? Math.max(0, 1 - (scroll - 0.89) / 0.05) : 1;

  // Verse opacity — fade in → hold → fade out
  function getVerseAlpha(at: number): number {
    const d = scroll - at;
    const fadeIn = -VERSE_HOLD - VERSE_FADE;
    const holdStart = -VERSE_HOLD;
    const holdEnd = VERSE_HOLD;
    const fadeOut = VERSE_HOLD + VERSE_FADE;
    if (d < fadeIn || d > fadeOut) return 0;
    if (d < holdStart) return Math.max(0, (d - fadeIn) / VERSE_FADE);
    if (d > holdEnd) return Math.max(0, 1 - (d - holdEnd) / VERSE_FADE);
    return 1;
  }

  return (
    <div ref={containerRef} className="relative" style={{ marginTop: '-56px' }}>
      {/* The height IS the breath. */}
      <div style={{ height: '600vh' }} />

      {/* ═══ ATMOSPHERE ═══ */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: layer.canvas }} aria-hidden="true">
        <div className="absolute inset-0" style={{ background: room.base }} />

        {/* Primary — the emotional tone */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 90% 70% at 35% 30%, ${primary} 0%, transparent 70%)`,
          }}
        />

        {/* Secondary — counterpoint */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 55% 50% at 68% 65%, ${secondary} 0%, transparent 65%)`,
          }}
        />

        {/* Breathing pulse */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 45% 35% at 50% 48%, ${primary} 0%, transparent 55%)`,
            opacity: breath * 0.2,
            transform: `scale(${1 + breath * 0.03})`,
            willChange: 'opacity, transform',
          }}
        />

        {/* Vignette — safe darkness */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 25%, ${room.base} 100%)`,
          }}
        />
      </div>

      {/* ═══ THE ORB ═══ */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{
          zIndex: layer.content,
          opacity: orbAlpha * orbFadeForSeal,
          // Slow transition only for the initial arrival; after that, instant
          transition: settled ? 'none' : `opacity ${timing.dur.breath} ${timing.curve}`,
        }}
      >
        <div className="relative">
          {/* Outer atmosphere */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: 220,
              height: 220,
              marginLeft: -110,
              marginTop: -110,
              background: `radial-gradient(circle, rgba(${orbRGB},${(0.03 + orbGlow * 0.07).toFixed(3)}) 0%, transparent 70%)`,
              transform: `scale(${orbScale * 1.05})`,
              willChange: 'transform',
            }}
          />

          {/* Middle halo */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: 90,
              height: 90,
              marginLeft: -45,
              marginTop: -45,
              background: `radial-gradient(circle, rgba(${orbRGB},${(0.05 + orbGlow * 0.09).toFixed(3)}) 0%, transparent 65%)`,
              transform: `scale(${orbScale})`,
              willChange: 'transform',
            }}
          />

          {/* Core */}
          <div
            className="rounded-full"
            style={{
              width: 32,
              height: 32,
              background: `radial-gradient(circle at 38% 38%, rgba(${orbRGB},0.85), rgba(${orbRGB},0.45) 55%, rgba(${orbRGB},0.12) 100%)`,
              boxShadow: `0 0 ${12 + orbGlow * 12}px rgba(${orbRGB},${(0.18 + orbGlow * 0.22).toFixed(2)}), 0 0 ${35 + orbGlow * 25}px rgba(${orbRGB},0.06)`,
              transform: `scale(${orbScale})`,
              willChange: 'transform, box-shadow',
            }}
          />
        </div>
      </div>

      {/* ═══ THE VERSES ═══ */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: layer.raised }}>
        {verses.map((verse, i) => {
          const alpha = getVerseAlpha(verse.at);
          if (alpha < 0.005) return null;
          const drift = (1 - alpha) * 14;

          return (
            <p
              key={i}
              className="absolute px-6 sm:px-10 text-center"
              style={{
                maxWidth: i === 0 ? '32rem' : '28rem',
                fontFamily: font.serif,
                fontSize: i === 0 ? 'clamp(17px, 2.6vw, 23px)' : 'clamp(21px, 3.2vw, 34px)',
                fontWeight: weight.regular,
                fontStyle: i === 2 ? 'italic' : 'normal',
                lineHeight: leading.body,
                letterSpacing: '-0.015em',
                color: room.fg,
                opacity: alpha * (i === 0 ? 0.5 : 0.7),
                transform: `translateY(${drift}px)`,
                willChange: 'opacity, transform',
              }}
            >
              {verse.text}
            </p>
          );
        })}
      </div>

      {/* ═══ THE SEAL ═══ */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{
          zIndex: layer.content,
          opacity: sealAlpha,
          transition: timing.t.fadeSlow,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 5,
            height: 5,
            background: `radial-gradient(circle, ${glass(colors.brand.purple.light, 0.55 + breath * 0.35)}, ${glass(colors.brand.purple.primary, 0.15)})`,
            boxShadow: `0 0 ${6 + breath * 5}px ${glass(colors.brand.purple.light, 0.12 + breath * 0.12)}, 0 0 ${20 + breath * 14}px ${glass(colors.brand.purple.primary, 0.05)}`,
            transform: `scale(${1 + breath * 0.1})`,
            willChange: 'transform, box-shadow',
          }}
        />
      </div>

      {/* ═══ SCROLL HINT ══ */}
      <div
        className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        style={{
          zIndex: layer.raised,
          opacity: arrived && scroll < 0.03 ? 0.14 : 0,
          transition: timing.t.fadeEmerge,
          animation: 'gentle-float 4s ease-in-out infinite',
        }}
      >
        <div
          className="w-px"
          style={{
            height: 28,
            background: `linear-gradient(180deg, ${glass(colors.brand.purple.light, 0.45)} 0%, transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
}