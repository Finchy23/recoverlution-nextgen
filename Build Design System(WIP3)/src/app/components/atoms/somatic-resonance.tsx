/**
 * ATOM: SOMATIC RESONANCE
 * Series 1 — Physics · Breath-driven bioluminescent membrane
 *
 * Bypasses intellect — breath, bilateral stimulation, resonant vibration
 * directly entrain the autonomic nervous system.
 *
 * INTERACTION: Breath (primary) · Hold (bilateral oscillation)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB, ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';

const PERIMETER_POINTS = 64;
const BASE_RADIUS_RATIO = 0.28;
const BREATH_EXPANSION = 0.35;
const SHELL_COUNT = 4;
const SHELL_SPACING = 0.12;
const PARTICLE_COUNT = 80;
const BILATERAL_FREQ = 0.02;
const BILATERAL_STRENGTH = 0.25;
const HOLD_ACTIVATE_FRAMES = 24;
const BREATH_PEAK_THRESHOLD = 0.75;
const BREATH_PEAK_COOLDOWN = 60;

interface WaveLayer {
  frequency: number;
  amplitude: number;
  phaseSpeed: number;
  breathCoupling: number;
  phase: number;
}

function createWaveLayers(): WaveLayer[] {
  return [
    { frequency: 3, amplitude: 0.08, phaseSpeed: 0.008, breathCoupling: 0.6, phase: 0 },
    { frequency: 5, amplitude: 0.04, phaseSpeed: -0.012, breathCoupling: 0.4, phase: Math.PI * 0.7 },
    { frequency: 7, amplitude: 0.025, phaseSpeed: 0.018, breathCoupling: 0.8, phase: Math.PI * 1.3 },
    { frequency: 11, amplitude: 0.015, phaseSpeed: -0.006, breathCoupling: 0.3, phase: Math.PI * 0.4 },
  ];
}

interface ResParticle {
  angle: number; distance: number; homeDistance: number;
  size: number; brightness: number; phase: number; drift: number; orbital: number;
}

function createParticles(): ResParticle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const homeD = 0.25 + Math.random() * 0.35;
    return {
      angle: Math.random() * Math.PI * 2, distance: homeD, homeDistance: homeD,
      size: 0.4 + Math.random() * 1.8, brightness: 0.15 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2, drift: 0.0005 + Math.random() * 0.002,
      orbital: (Math.random() - 0.5) * 0.003,
    };
  });
}

const EXHALE_COOL: RGB = [80, 100, 170];
const INHALE_WARM: RGB = [200, 160, 100];
const MEMBRANE_GLOW: RGB = [140, 180, 220];

export default function SomaticResonanceAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    waveLayers: createWaveLayers(), particles: createParticles(),
    isHolding: false, holdFrames: 0, bilateralActive: false, bilateralPhase: 0,
    smoothBreath: 0, prevBreath: 0, breathPeakCooldown: 0, breathRising: false, resonanceScore: 0,
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;
      const w = viewport.width, h = viewport.height, breath = p.breathAmplitude;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      if (s.entranceProgress < 1) s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      const entrance = easeOutExpo(s.entranceProgress);

      s.smoothBreath += (breath - s.smoothBreath) * 0.12;
      s.breathPeakCooldown = Math.max(0, s.breathPeakCooldown - 1);
      if (breath > BREATH_PEAK_THRESHOLD && s.prevBreath <= BREATH_PEAK_THRESHOLD && s.breathPeakCooldown === 0) {
        cb.onHaptic('breath_peak'); s.breathPeakCooldown = BREATH_PEAK_COOLDOWN;
        s.resonanceScore = Math.min(1, s.resonanceScore + 0.15);
      }
      s.breathRising = breath > s.prevBreath; s.prevBreath = breath;
      s.resonanceScore = Math.max(0, s.resonanceScore - 0.001);

      if (s.isHolding) { s.holdFrames++; if (!s.bilateralActive && s.holdFrames > HOLD_ACTIVATE_FRAMES) { s.bilateralActive = true; cb.onHaptic('hold_threshold'); } }
      if (s.bilateralActive && !p.reducedMotion) s.bilateralPhase += BILATERAL_FREQ;
      cb.onStateChange?.(s.smoothBreath);
      if (!p.reducedMotion) for (const wave of s.waveLayers) wave.phase += wave.phaseSpeed;

      const cx = w / 2, cy = h / 2, minDim = Math.min(w, h), baseR = minDim * BASE_RADIUS_RATIO;
      const sb = s.smoothBreath;
      const bilatX = s.bilateralActive ? Math.sin(s.bilateralPhase) * baseR * BILATERAL_STRENGTH : 0;
      const breathColor = lerpColor(EXHALE_COOL, INHALE_WARM, sb);
      const membraneColor = lerpColor(breathColor, s.primaryRgb, 0.25);
      const glowColor = lerpColor(MEMBRANE_GLOW, s.accentRgb, 0.2);

      // Background pulse
      const bgBase = lerpColor(membraneColor, [15, 12, 20], 0.7);
      const bgGrad = ctx.createRadialGradient(cx + bilatX * 0.3, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, rgba(lerpColor(bgBase, [18, 12, 22], 0.4), entrance * 0.03));
      bgGrad.addColorStop(0.5, rgba(bgBase, entrance * 0.025));
      bgGrad.addColorStop(1, rgba(lerpColor(bgBase, [4, 2, 8], 0.5), entrance * 0.02));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Particles
      if (!p.reducedMotion) {
        for (const particle of s.particles) {
          const breathPull = sb * 0.08;
          particle.distance += ((particle.homeDistance - breathPull) - particle.distance) * 0.03;
          particle.angle += particle.orbital; particle.phase += particle.drift;
          const shimmer = 0.5 + 0.5 * Math.sin(particle.phase);
          const px = cx + bilatX * 0.1 + Math.cos(particle.angle) * particle.distance * minDim;
          const py = cy + Math.sin(particle.angle) * particle.distance * minDim;
          const pAlpha = particle.brightness * shimmer * entrance * (0.15 + sb * 0.15);
          if (pAlpha < 0.01) continue;
          ctx.beginPath(); ctx.arc(px, py, particle.size * (0.8 + sb * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = rgba(glowColor, pAlpha); ctx.fill();
          if (particle.size > 1.2) {
            ctx.beginPath(); ctx.arc(px, py, particle.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = rgba(glowColor, pAlpha * 0.1); ctx.fill();
          }
        }
      }

      // Membrane shells
      for (let shell = SHELL_COUNT - 1; shell >= 0; shell--) {
        const shellFraction = shell / SHELL_COUNT;
        const shellR = baseR * (1 + BREATH_EXPANSION * sb) * (1 - shellFraction * SHELL_SPACING);
        const shellAlpha = (0.04 + shellFraction * 0.08 + sb * 0.06) * entrance;
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < PERIMETER_POINTS; i++) {
          const angle = (i / PERIMETER_POINTS) * Math.PI * 2;
          let deformation = 0;
          if (!p.reducedMotion) for (const wave of s.waveLayers) {
            deformation += Math.sin(angle * wave.frequency + wave.phase + shell * 0.3) * wave.amplitude * (1 + wave.breathCoupling * sb);
          }
          const r = shellR * (1 + deformation);
          const bilatOffset = s.bilateralActive ? Math.cos(angle) * bilatX * (0.3 + shellFraction * 0.2) : 0;
          points.push({ x: cx + bilatOffset + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const p0 = points[(i - 1 + points.length) % points.length];
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const p3 = points[(i + 2) % points.length];
          if (i === 0) ctx.moveTo(p1.x, p1.y);
          ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
        }
        ctx.closePath();
        const shellGrad = ctx.createRadialGradient(cx + bilatX * 0.2, cy, shellR * 0.1, cx + bilatX * 0.1, cy, shellR * 1.2);
        shellGrad.addColorStop(0, rgba(lerpColor(membraneColor, [255, 255, 255], 0.1 + sb * 0.1), shellAlpha * (1.5 - shellFraction)));
        shellGrad.addColorStop(0.5, rgba(lerpColor(membraneColor, glowColor, shellFraction), shellAlpha * 0.5));
        shellGrad.addColorStop(1, rgba(lerpColor(membraneColor, glowColor, shellFraction), 0));
        ctx.fillStyle = shellGrad; ctx.fill();
        if (shell >= SHELL_COUNT - 2) {
          ctx.save();
          ctx.shadowColor = rgba(glowColor, 0.3 * entrance * (0.5 + sb * 0.5));
          ctx.shadowBlur = minDim * (0.04 + sb * 0.03);
          ctx.strokeStyle = rgba(glowColor, shellAlpha * 0.3);
          ctx.lineWidth = minDim * 0.0016; ctx.stroke(); ctx.restore();
        }
      }

      // Inner core
      const coreR = baseR * 0.35 * (0.8 + sb * 0.4);
      const coreAlpha = (0.15 + sb * 0.25) * entrance;
      const coreGrad = ctx.createRadialGradient(cx + bilatX * 0.15, cy, 0, cx + bilatX * 0.1, cy, coreR);
      const coreColor = lerpColor(membraneColor, [255, 240, 220], sb * 0.4);
      coreGrad.addColorStop(0, rgba(coreColor, coreAlpha));
      coreGrad.addColorStop(0.4, rgba(membraneColor, coreAlpha * 0.4));
      coreGrad.addColorStop(1, rgba(membraneColor, 0));
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - coreR + bilatX * 0.15, cy - coreR, coreR * 2, coreR * 2);

      // Resonance ring
      if (s.resonanceScore > 0.05) {
        const resR = baseR * (1.8 + sb * 0.3);
        ctx.beginPath(); ctx.arc(cx, cy, resR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(glowColor, s.resonanceScore * 0.06 * entrance);
        ctx.lineWidth = minDim * (0.001 + s.resonanceScore * 0.002); ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      s.isHolding = true; s.holdFrames = 0;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      if (s.bilateralActive) cbRef.current.onHaptic('hold_release');
      s.isHolding = false; s.holdFrames = 0; s.bilateralActive = false;
      canvas.releasePointerCapture(e.pointerId);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
