/**
 * GLASS SURFACE
 *
 * The shared visual container used by both Base and Copy pages.
 * Atmosphere layers, canvas, vignette, sheen — and an overlay
 * slot for the Copy page to inject text into the glass.
 *
 * Now implements Dynamic Attenuation: the glass thickens (blur,
 * darken, motion-yield) when foreground content demands focus,
 * and thins when the canvas should breathe fully.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  BREATH_DURATION,
  type InteractionType, type MotionType, type ColorType, type Device,
  type Atmosphere, type AttenuationLevel,
  atmosphereList, temperatureList, attenuationLevels, attenuationTransitions,
  useCanvasRenderer,
} from './surface-engine';

import { colors, surfaces } from './tokens';
import { room, timing, radii, glaze, depth, glow } from './surface-tokens';

interface GlassSurfaceProps {
  interactionId: InteractionType;
  motionId: MotionType;
  atmosphereId: string;
  temperatureId: string;
  colorId: ColorType;
  device: Device;
  /** Attenuation mode — defaults to 'open' (full canvas energy) */
  attenuationId?: string;
  /** Render prop — receives breath value, atmosphere, and isPhone flag */
  overlay?: (ctx: { breath: number; atmosphere: Atmosphere; isPhone: boolean }) => React.ReactNode;
}

/** Interpolate between two attenuation levels */
function lerpAttenuation(a: AttenuationLevel, b: AttenuationLevel, t: number): {
  blur: number; overlayOpacity: number; motionYield: number; intensityScale: number;
} {
  return {
    blur: a.blur + (b.blur - a.blur) * t,
    overlayOpacity: a.overlayOpacity + (b.overlayOpacity - a.overlayOpacity) * t,
    motionYield: a.motionYield + (b.motionYield - a.motionYield) * t,
    intensityScale: a.intensityScale + (b.intensityScale - a.intensityScale) * t,
  };
}

export function GlassSurface({
  interactionId, motionId, atmosphereId, temperatureId, colorId, device,
  attenuationId = 'open', overlay,
}: GlassSurfaceProps) {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const breathRef = useRef(0);
  const [, forceRender] = useState(0);

  const atmosphere = useMemo(() => atmosphereList.find(a => a.id === atmosphereId)!, [atmosphereId]);
  const temperature = useMemo(() => temperatureList.find(t => t.id === temperatureId)!, [temperatureId]);
  const attenuation = useMemo(() => attenuationLevels.find(a => a.id === attenuationId)!, [attenuationId]);

  // ── Attenuation transition state ──
  const attenTransRef = useRef<{
    from: AttenuationLevel;
    to: AttenuationLevel;
    startMs: number;
    durationMs: number;
    curve: (t: number) => number;
  } | null>(null);
  const currentAttenRef = useRef(attenuation);
  const [liveAtten, setLiveAtten] = useState({
    blur: attenuation.blur,
    overlayOpacity: attenuation.overlayOpacity,
    motionYield: attenuation.motionYield,
    intensityScale: attenuation.intensityScale,
  });

  // Detect attenuation changes and trigger transitions
  useEffect(() => {
    const prev = currentAttenRef.current;
    if (prev.id === attenuation.id) return;

    const trans = attenuationTransitions[attenuation.id];
    attenTransRef.current = {
      from: prev,
      to: attenuation,
      startMs: performance.now(),
      durationMs: trans.durationMs,
      curve: trans.curve,
    };
    currentAttenRef.current = attenuation;
  }, [attenuation]);

  // Animate attenuation transitions
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = attenTransRef.current;
      if (t) {
        const elapsed = performance.now() - t.startMs;
        const raw = Math.min(1, elapsed / t.durationMs);
        const progress = t.curve(raw);
        const interpolated = lerpAttenuation(t.from, t.to, progress);
        setLiveAtten(interpolated);
        if (raw >= 1) {
          attenTransRef.current = null;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sync when attenuation set without transition (initial mount)
  useEffect(() => {
    if (!attenTransRef.current) {
      setLiveAtten({
        blur: attenuation.blur,
        overlayOpacity: attenuation.overlayOpacity,
        motionYield: attenuation.motionYield,
        intensityScale: attenuation.intensityScale,
      });
    }
  }, [attenuation]);

  // Breath cycle
  useEffect(() => {
    if (reducedMotion) { breathRef.current = 0.5; return; }
    const origin = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const s = (now - origin) / 1000;
      breathRef.current = (Math.sin((s / BREATH_DURATION) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // Re-render for breath-driven CSS (overlay opacity, atmosphere gradients)
  useEffect(() => {
    const hasOverlay = !!overlay;
    const id = setInterval(() => forceRender(n => n + 1), hasOverlay ? 150 : 2000);
    return () => clearInterval(id);
  }, [!!overlay]);

  useCanvasRenderer(
    canvasRef, interactionId, motionId, atmosphere, colorId,
    temperature.multiplier, breathRef, reducedMotion,
    liveAtten.motionYield, liveAtten.intensityScale,
  );

  const isPhone = device === 'phone';
  const breath = breathRef.current;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: isPhone ? 'min(380px, 88vw)' : '100%',
        height: isPhone ? 'min(680px, 100%)' : '100%',
        maxHeight: '100%',
        borderRadius: isPhone ? radii.chromeOuter : radii.frame,
        background: glaze.trace,
        /* Death of the Box: edge defined by inset box-shadow, not border */
        boxShadow: glow.chrome(`${atmosphere.mid}04`),
        transition: timing.t.arrive,
      }}
    >
      <div
        className="absolute overflow-hidden"
        style={{
          top: isPhone ? 12 : 6, left: isPhone ? 6 : 6,
          right: isPhone ? 6 : 6, bottom: isPhone ? 12 : 6,
          borderRadius: isPhone ? radii.chromeInner : radii.frameInner,
          transition: timing.t.arrive,
        }}
      >
        {/* Deep black base */}
        <div className="absolute inset-0" style={{ background: room.void }} />

        {/* Primary atmospheric field — atmosphere-specific rendering */}
        {atmosphere.id === 'abyssal-void' ? (
          /* Abyssal Void: Zero texture. Pure solid.base black. Only the faintest trace at extreme distance. */
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 90% 80% at 50% 50%, ${atmosphere.deep}${Math.round((0.03 + breath * 0.04) * 255).toString(16).padStart(2, '0')} 0%, transparent 80%)`,
            }}
          />
        ) : atmosphere.id === 'chiaroscuro-spotlight' ? (
          /* Chiaroscuro: Single dramatic cone of light at exact center. Everything outside is void. */
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 25% 35% at 50% 48%, ${atmosphere.mid}${Math.round((0.18 + breath * 0.10) * 255).toString(16).padStart(2, '0')} 0%, ${atmosphere.deep}${Math.round((0.08 + breath * 0.05) * 255).toString(16).padStart(2, '0')} 40%, transparent 65%)`,
                transform: `scale(${1 + breath * 0.02})`,
                transformOrigin: '50% 48%',
                willChange: 'transform',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 12% 18% at 50% 48%, ${atmosphere.accent}${Math.round((0.10 + breath * 0.06) * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
              }}
            />
          </>
        ) : (
          /* Standard atmospheres: primary + counter field */
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 70% 55% at ${atmosphere.fieldPosA}, ${atmosphere.deep}${Math.round((0.30 + breath * 0.15) * 255).toString(16).padStart(2, '0')} 0%, transparent 65%)`,
                transform: `scale(${1 + breath * 0.03})`,
                transformOrigin: atmosphere.fieldPosA,
                transition: timing.t.atmosphere,
                willChange: 'transform',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 45% 40% at ${atmosphere.fieldPosB}, ${atmosphere.mid}${Math.round((0.14 + breath * 0.08) * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
                transition: timing.t.atmosphere,
              }}
            />
          </>
        )}

        {/* Breath wash — suppressed for void/chiaroscuro */}
        {atmosphere.id !== 'abyssal-void' && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 35% 30% at 50% 48%, ${atmosphere.accent}${Math.round(breath * (atmosphere.id === 'chiaroscuro-spotlight' ? 0.04 : 0.07) * 255).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
            }}
          />
        )}

        {/* Deep vignette — widened to preserve atmosphere at edges */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 82% 82% at 50% 50%, transparent 25%, ${room.void} 100%)`,
          }}
        />

        {/* Canvas — with dynamic depth-of-field blur */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            borderRadius: 'inherit',
            filter: liveAtten.blur > 0.5 ? `blur(${liveAtten.blur}px)` : 'none',
            transition: timing.t.filterSnap, // sub-frame smoothing
          }}
        />

        {/* Attenuation darkness overlay — the glass thickens */}
        {liveAtten.overlayOpacity > 0.005 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: room.void,
              opacity: liveAtten.overlayOpacity,
              borderRadius: 'inherit',
            }}
          />
        )}

        {/* Overlay slot — for Copy text or other content */}
        {overlay && overlay({ breath, atmosphere, isPhone })}

        {/* Top sheen */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 15%, ${glaze.mist} 50%, transparent 85%)`,
          }}
        />

        {/* Edge glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 'inherit',
            boxShadow: glow.innerAtmosphere(`${atmosphere.deep}08`, `${atmosphere.mid}03`),
            transition: timing.t.glowAtmosphere,
          }}
        />
      </div>
    </div>
  );
}