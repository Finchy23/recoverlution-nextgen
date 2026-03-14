import { useState, useRef, useEffect } from 'react';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, glow, glaze, layer, timing } from '../components/design-system/surface-tokens';
import { Reveal } from '../components/design-system/Reveal';
import {
  motionVariables,
  easingFunctions,
  type EasingName,
  type DoctrineVariable,
} from '../components/design-system/doctrine';

/**
 * MOTION — The Breath of the System
 *
 * Motion is not decoration. Motion is biological rhythm and material behavior.
 * This page demonstrates every doctrine motion family and easing identity.
 */

const BREATH_DURATION = 10.9;

// ─── Somatic Breath Demo ───

function BreathingDemo() {
  const [breath, setBreath] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const origin = performance.now();
    const tick = (now: number) => {
      const s = (now - origin) / 1000;
      setBreath((Math.sin((s / BREATH_DURATION) * Math.PI * 2 - Math.PI / 2) + 1) / 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const scale = 1 + breath * 0.08;
  const glow = breath;
  const rgb = '107,82,255';

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <div
          className="absolute rounded-full"
          style={{
            width: 180, height: 180,
            background: `radial-gradient(circle, rgba(${rgb},${(0.03 + glow * 0.08).toFixed(3)}) 0%, transparent 70%)`,
            transform: `scale(${scale * 1.05})`,
          }}
        />
        <div
          className="rounded-full"
          style={{
            width: 44, height: 44,
            background: `radial-gradient(circle at 38% 38%, rgba(${rgb},0.85), rgba(${rgb},0.45) 55%, rgba(${rgb},0.12) 100%)`,
            boxShadow: `0 0 ${14 + glow * 14}px rgba(${rgb},${(0.2 + glow * 0.25).toFixed(2)}), 0 0 ${40 + glow * 30}px rgba(${rgb},0.06)`,
            transform: `scale(${scale})`,
          }}
        />
      </div>

      <div className="flex gap-10 mt-4">
        {[
          { val: '5.5', unit: 'breaths / min' },
          { val: '10.9s', unit: 'cycle' },
          { val: '0.09Hz', unit: 'frequency' },
        ].map(d => (
          <div key={d.unit} className="text-center">
            <span style={{ fontSize: typeSize.title, fontWeight: weight.light, color: room.fg, fontFamily: font.serif, opacity: opacity.clear }}>{d.val}</span>
            <span className="block mt-1" style={{ fontSize: typeSize.caption, color: room.gray2 }}>{d.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Easing Curve Visualization ───

function EasingCurveCanvas({ fn }: { fn: (t: number) => number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 160;
    const h = 80;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = glaze.thin;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(w, h);
    ctx.moveTo(0, 0); ctx.lineTo(0, h);
    ctx.stroke();

    // Linear reference
    ctx.strokeStyle = glaze.veil;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve
    ctx.strokeStyle = glaze.thin;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const val = fn(t);
      const x = t * w;
      const y = h - val * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [fn]);

  return <canvas ref={canvasRef} />;
}

function EasingCard({ name }: { name: EasingName }) {
  const easing = easingFunctions[name];
  const [playing, setPlaying] = useState(false);
  const [x, setX] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!playing) { setX(0); return; }
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      const total = 1.2;
      const t = Math.min(1, elapsed / total);
      setX(easing.fn(t));

      if (t >= 1) {
        setTimeout(() => { setPlaying(false); setX(0); }, 300);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, easing.fn]);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: glaze.faint,
        boxShadow: `inset 0 0 0 1px ${glaze.veil}`,
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span style={{ fontSize: typeSize.lede, fontWeight: weight.medium, color: room.gray5 }}>
            {name}
          </span>
          <p className="mt-1" style={{ fontSize: typeSize.note, color: room.gray2, lineHeight: leading.firm }}>
            {easing.feel}
          </p>
        </div>
        <EasingCurveCanvas fn={easing.fn} />
      </div>

      {/* Playback track */}
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full h-8 rounded-lg overflow-hidden cursor-pointer mt-2"
        style={{ background: glaze.faint }}
      >
        <div
          className="absolute top-1 left-1 w-6 h-6 rounded-md"
          style={{
            background: `linear-gradient(135deg, ${colors.brand.purple.primary}, ${colors.accent.cyan.primary})`,
            transform: `translateX(${x * (240)}px)`,
            transition: playing ? 'none' : 'transform 0.3s',
          }}
        />
      </button>

      <span className="block mt-2" style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: room.gray1 }}>
        {easing.css}
      </span>
    </div>
  );
}

// ─── Motion Family Card ───

function MotionFamilyCard({ variable }: { variable: DoctrineVariable }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: glaze.faint,
        boxShadow: `inset 0 0 0 1px ${glaze.veil}`,
      }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: colors.accent.cyan.primary, boxShadow: glow.soft(colors.accent.cyan.primary, '30') }} />
          <span style={{ fontSize: typeSize.lede, fontWeight: weight.medium, color: room.fg, opacity: opacity.clear }}>
            {variable.label}
          </span>
          <span style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: room.gray1 }}>
            rv-motion-{variable.id}
          </span>
        </div>

        <p className="mt-1 mb-3" style={{ fontSize: typeSize.small, color: room.gray4, lineHeight: leading.relaxed }}>
          {variable.description}
        </p>

        <p style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray3, lineHeight: leading.body }}>
          {variable.metaphor}
        </p>

        {/* Transition identity */}
        <div className="mt-4 pt-3" style={{ background: `linear-gradient(90deg, transparent 0%, ${glaze.thin} 20%, ${glaze.thin} 80%, transparent 100%)`, backgroundSize: '100% 1px', backgroundRepeat: 'no-repeat', backgroundPosition: 'top' }}>
          <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase' as const, color: room.gray1 }}>
            Transition Identity
          </span>
          <p className="mt-1" style={{ fontSize: typeSize.note, color: room.gray2, fontStyle: 'italic' }}>
            {variable.transition.description}
          </p>
          <div className="flex gap-6 mt-2">
            <div>
              <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Enter</span>
              <p style={{ fontSize: typeSize.caption, fontFamily: font.mono, color: room.gray2 }}>
                {variable.transition.enterMs}ms {variable.transition.enterCurve}
              </p>
            </div>
            <div>
              <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Exit</span>
              <p style={{ fontSize: typeSize.caption, fontFamily: font.mono, color: room.gray2 }}>
                {variable.transition.exitMs}ms {variable.transition.exitCurve}
              </p>
            </div>
            <div>
              <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Cost</span>
              <p style={{ fontSize: typeSize.caption, fontFamily: font.mono, color: variable.attenuationCost > 0.15 ? colors.status.amber.bright : room.gray2 }}>
                {(variable.attenuationCost * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Temperature range */}
        <div className="flex gap-1.5 mt-3">
          {[0, 1, 2, 3, 4].map(band => {
            const allowed = variable.allowedBands.includes(band as any);
            return (
              <div
                key={band}
                className="w-5 h-1.5 rounded-full"
                style={{
                  background: allowed
                    ? band === 0 ? 'hsl(160, 60%, 50%)' : band === 1 ? 'hsl(140, 50%, 45%)' : band === 2 ? 'hsl(45, 90%, 55%)' : band === 3 ? 'hsl(25, 90%, 55%)' : 'hsl(30, 90%, 50%)'
                    : glaze.thin,
                  opacity: allowed ? opacity.strong : 1,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───

export function MotionPage() {
  const easingNames = Object.keys(easingFunctions) as EasingName[];

  return (
    <div className="relative" style={{ zIndex: layer.base }}>
      <div className="h-[30vh]" />

      <div className="px-6 sm:px-10 max-w-4xl mx-auto">
        {/* Title */}
        <Reveal>
          <p
            style={{
              fontFamily: font.serif,
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: weight.regular,
              color: room.fg,
              opacity: opacity.clear,
              letterSpacing: '-0.02em',
              lineHeight: leading.tight,
            }}
          >
            The breath of the system
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-lg" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            Motion is not decoration. It is biological rhythm and material behavior.
            How does the environment breathe? How heavy is the digital matter?
            How does tension leave?
          </p>
        </Reveal>

        {/* Somatic Breath — the heartbeat */}
        <div className="mt-28">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: glass(colors.accent.cyan.primary, 0.5) }}>
              The Heartbeat — 5.5 Breaths Per Minute
            </span>
            <p className="mb-8" style={{ fontSize: typeSize.small, color: room.gray1, lineHeight: leading.body }}>
              Every oscillation in the system inherits this rhythm. The entire canvas inhales and exhales as one organism.
            </p>
          </Reveal>
          <Reveal>
            <BreathingDemo />
          </Reveal>
        </div>

        {/* Motion Families */}
        <div className="mt-36">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: glass(colors.accent.cyan.primary, 0.5) }}>
              Motion Families
            </span>
            <p className="mb-8" style={{ fontSize: typeSize.small, color: room.gray1, lineHeight: leading.body }}>
              Six canonical families. Each governed by Temperature. Each with its own transition identity.
            </p>
          </Reveal>

          <div className="space-y-3">
            {motionVariables.map((v, i) => (
              <Reveal key={v.id} delay={i * 0.04}>
                <MotionFamilyCard variable={v} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Easing Library */}
        <div className="mt-36">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: glass(colors.brand.purple.primary, 0.5) }}>
              Easing Library
            </span>
            <p className="mb-8" style={{ fontSize: typeSize.small, color: room.gray1, lineHeight: leading.body }}>
              Every curve has a name that describes its emotional character, not its mathematics.
              Tap the track to see the curve in motion.
            </p>
          </Reveal>

          <div className="space-y-4">
            {easingNames.map((name, i) => (
              <Reveal key={name} delay={i * 0.04}>
                <EasingCard name={name} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Principles */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Motion Vocabulary
            </span>
          </Reveal>

          <div className="space-y-14">
            {[
              { t: 'Nothing cuts to black', b: 'Every transition morphs. Every exit dissolves, emerges, or burns-in. The unbroken continuity of the glass is our signature.' },
              { t: '800ms before copy', b: 'Text should never arrive at the same instant as room load. Atmosphere first. Language second. Non-negotiable.' },
              { t: 'Kinetic subordination', b: 'When the foreground needs attention, background motion must reduce. The background should not compete with the intervention.' },
              { t: 'Reduced motion', b: 'All motion respects prefers-reduced-motion. Fallback to opacity-only or instant transitions. The system remains alive through stillness.' },
            ].map((p, i) => (
              <Reveal key={p.t} delay={i * 0.04}>
                <p style={{ fontSize: typeSize.prose, fontWeight: weight.medium, color: room.gray5, marginBottom: '4px' }}>{p.t}</p>
                <p style={{ fontSize: typeSize.reading, lineHeight: leading.reading, color: room.gray2, maxWidth: '28rem' }}>{p.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[20vh]" />
    </div>
  );
}