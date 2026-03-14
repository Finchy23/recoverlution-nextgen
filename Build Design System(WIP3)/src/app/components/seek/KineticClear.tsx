/**
 * KINETIC CLEAR — Entry Block 1C
 *
 * The Noise Reduction.
 *
 * The glass is covered in visual static — dense, drifting noise particles.
 * The user must swipe outward from the center to physically clear the fog
 * and reveal the title of the ghost beneath.
 *
 * This is the act of clearing the mind's cache. Not a test.
 * Not a skill check. Just: make space. Arrive here empty.
 *
 * Silent Telemetry: measures clearing velocity and pattern —
 * aggressive swiping vs. slow deliberate clearing. Neither is
 * wrong. Both are data about where the nervous system is today.
 *
 * Canvas 2D: particle noise field that dissolves radially from touch.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { hapticTick, hapticResolve, hapticPressure } from '../surfaces/haptics';
import { room, font, tracking, typeSize, leading, weight, opacity } from '../design-system/surface-tokens';

const PARTICLE_COUNT = 400;
const CLEAR_THRESHOLD = 0.85; // 85% of particles cleared
const SERIF = font.serif;
const SANS = font.sans;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  cleared: boolean;
}

interface KineticClearProps {
  width: number;
  height: number;
  title: string;
  essence: string;
  color: string;
  breath: number;
  instruction: string;
  onClear: (clearVelocity: number, clearDurationMs: number) => void;
}

export function KineticClear({
  width,
  height,
  title,
  essence,
  color,
  breath,
  instruction,
  onClear,
}: KineticClearProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const touchPosRef = useRef<{ x: number; y: number } | null>(null);
  const prevTouchRef = useRef<{ x: number; y: number } | null>(null);
  const mountTimeRef = useRef(Date.now());
  const velocityAccumRef = useRef(0);
  const swipeCountRef = useRef(0);
  const [clearProgress, setClearProgress] = useState(0);
  const [cleared, setCleared] = useState(false);
  const clearedRef = useRef(false);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.04 + Math.random() * 0.08,
        cleared: false,
      });
    }
    particlesRef.current = particles;
  }, [width, height]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = Math.round(width * dpr);
    const ch = Math.round(height * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const touch = touchPosRef.current;
    const prevTouch = prevTouchRef.current;
    const t = Date.now() * 0.001;

    // Calculate swipe velocity
    let velocity = 0;
    if (touch && prevTouch) {
      const dx = touch.x - prevTouch.x;
      const dy = touch.y - prevTouch.y;
      velocity = Math.sqrt(dx * dx + dy * dy);
    }

    // Clear radius around touch point
    const clearRadius = 60 + velocity * 2;

    let clearedCount = 0;

    for (const p of particles) {
      if (p.cleared) {
        clearedCount++;
        // Cleared particles drift away and fade
        p.x += p.vx * 3;
        p.y += p.vy * 3;
        p.alpha = Math.max(0, p.alpha - 0.002);
        if (p.alpha > 0.001) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.alpha.toFixed(4)})`;
          ctx.fill();
        }
        continue;
      }

      // Check if touch clears this particle
      if (touch) {
        const dx = p.x - touch.x;
        const dy = p.y - touch.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < clearRadius) {
          p.cleared = true;
          // Push particle outward from touch
          const angle = Math.atan2(dy, dx);
          p.vx = Math.cos(angle) * (1 + velocity * 0.1);
          p.vy = Math.sin(angle) * (1 + velocity * 0.1);
          clearedCount++;
          continue;
        }
      }

      // Drift
      p.x += p.vx + Math.sin(t * 0.5 + p.y * 0.01) * 0.2;
      p.y += p.vy + Math.cos(t * 0.4 + p.x * 0.01) * 0.2;

      // Wrap
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Draw
      const flicker = 0.7 + Math.sin(t * 3 + p.x * 0.03) * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(p.alpha * flicker).toFixed(4)})`;
      ctx.fill();
    }

    // Update clear progress
    const progress = clearedCount / particles.length;
    setClearProgress(progress);

    // Title reveal — fades in as glass clears
    // (Drawn on canvas for seamless integration)
    if (progress > 0.3) {
      const [r, g, b] = parseHex(color);
      const titleAlpha = Math.min(0.15, (progress - 0.3) * 0.25);
      const cx = width / 2;
      const cy = height * 0.44;
      const glowRadius = 40 + progress * 60;

      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      glowGrad.addColorStop(0, `rgba(${r},${g},${b},${(titleAlpha * 0.4).toFixed(4)})`);
      glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Check completion
    if (progress >= CLEAR_THRESHOLD && !clearedRef.current) {
      clearedRef.current = true;
      setCleared(true);
      hapticResolve();
      const duration = Date.now() - mountTimeRef.current;
      const avgVelocity = swipeCountRef.current > 0 ? velocityAccumRef.current / swipeCountRef.current : 0;
      setTimeout(() => onClear(avgVelocity, duration), 1000);
    }

    ctx.restore();

    prevTouchRef.current = touch ? { ...touch } : null;

    if (!clearedRef.current || progress < 1) {
      rafRef.current = requestAnimationFrame(render);
    }
  }, [width, height, color, breath, onClear]);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (clearedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    touchPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Track velocity for telemetry
    if (prevTouchRef.current) {
      const dx = touchPosRef.current.x - prevTouchRef.current.x;
      const dy = touchPosRef.current.y - prevTouchRef.current.y;
      const v = Math.sqrt(dx * dx + dy * dy);
      velocityAccumRef.current += v;
      swipeCountRef.current += 1;

      // Haptic on significant movement
      if (v > 15) {
        hapticTick();
      }
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (clearedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    touchPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    hapticPressure(0.3);
  }, []);

  const handlePointerUp = useCallback(() => {
    touchPosRef.current = null;
    prevTouchRef.current = null;
  }, []);

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Title — emerges as noise clears */}
      <div
        className="absolute flex flex-col items-center gap-3 pointer-events-none"
        style={{
          top: height * 0.36,
          left: 0,
          right: 0,
          opacity: cleared ? 1 : Math.max(0, (clearProgress - 0.4) * 2),
          transform: `scale(${0.95 + clearProgress * 0.05})`,
          transition: cleared ? 'opacity 0.6s ease' : 'none',
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(18px, 4.5vw, 24px)',
          fontWeight: weight.light,
          color: room.fg,
          textAlign: 'center',
          margin: 0,
          maxWidth: '75%',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: leading.compact,
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(10px, 2.5vw, 13px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          opacity: opacity.spoken,
          textAlign: 'center',
          margin: 0,
          maxWidth: '70%',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: leading.body,
        }}>
          {essence}
        </p>
      </div>

      {/* Instruction */}
      {!cleared && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity.murmur }}
          transition={{ delay: 1, duration: 1 }}
        >
          <span style={{
            fontFamily: SANS,
            fontSize: typeSize.micro,
            fontWeight: weight.medium,
            letterSpacing: tracking.lift,
            textTransform: 'uppercase',
            color,
          }}>
            {instruction}
          </span>
        </motion.div>
      )}
    </div>
  );
}