/**
 * TENSION TETHER — Ascertainment Block (Believing 3B)
 *
 * The user pulls a digital string attached to the old schema.
 * The string has elastic tension — it resists being pulled.
 *
 * How they interact with the tether reveals emotional elasticity:
 * - Slow, deliberate pull → measured integration
 * - Aggressive snap → defensive posturing, still fighting
 * - Gentle release → surrender, acceptance
 *
 * The string never judges. It just records the physics of letting go.
 *
 * Canvas 2D: elastic catenary curve with spring physics.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { hapticPressure, hapticResolve, hapticTick, hapticBreathPulse } from '../surfaces/haptics';

import { room, font, tracking, typeSize, leading, weight, opacity, timing } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface TensionTetherProps {
  color: string;
  copy: string;
  prompt: string;
  instruction: string;
  breath: number;
  width: number;
  height: number;
  onComplete: (score: number) => void;
}

export function TensionTether({
  color,
  copy,
  prompt,
  instruction,
  breath,
  width,
  height,
  onComplete,
}: TensionTetherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [released, setReleased] = useState(false);
  const releasedRef = useRef(false);

  // Physics state
  const anchorRef = useRef({ x: width / 2, y: height * 0.3 }); // Schema anchor point
  const handleRef = useRef({ x: width / 2, y: height * 0.6 }); // User's grip point
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const draggingRef = useRef(false);
  const maxStretchRef = useRef(0);
  const releaseVelocityRef = useRef(0);
  const pullStartRef = useRef(0);
  const [stretch, setStretch] = useState(0); // 0-1 normalized

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  // Update anchor when dimensions change
  useEffect(() => {
    anchorRef.current = { x: width / 2, y: height * 0.28 };
    handleRef.current = { x: width / 2, y: height * 0.55 };
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

    const [r, g, b] = parseHex(color);
    const t = Date.now() * 0.001;
    const anchor = anchorRef.current;
    const handle = handleRef.current;
    const breathPhase = Math.sin(breath * Math.PI * 2);

    // ── Spring physics when not dragging ──
    if (!draggingRef.current && !releasedRef.current) {
      const restY = height * 0.55;
      const restX = width / 2;
      const dx = restX - handle.x;
      const dy = restY - handle.y;
      const springK = 0.03;
      const damping = 0.92;

      velocityRef.current.vx = (velocityRef.current.vx + dx * springK) * damping;
      velocityRef.current.vy = (velocityRef.current.vy + dy * springK) * damping;

      handle.x += velocityRef.current.vx;
      handle.y += velocityRef.current.vy;
    }

    // ── Calculate stretch ──
    const dx = handle.x - anchor.x;
    const dy = handle.y - anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const restDist = height * 0.27;
    const maxDist = height * 0.6;
    const currentStretch = Math.max(0, Math.min(1, (dist - restDist) / (maxDist - restDist)));
    setStretch(currentStretch);

    if (currentStretch > maxStretchRef.current) {
      maxStretchRef.current = currentStretch;
    }

    // ── Draw catenary/bezier tether ──
    const controlSag = 30 + (1 - currentStretch) * 50;
    const controlX = (anchor.x + handle.x) / 2 + Math.sin(t * 2) * (5 * (1 - currentStretch));
    const controlY = Math.max(anchor.y, handle.y) + controlSag * (1 - currentStretch * 0.8);

    // Tension glow along the string
    const tetherAlpha = 0.08 + currentStretch * 0.15;
    const tetherWidth = 0.5 + currentStretch * 1.5;

    // Draw multiple strands for thickness perception
    for (let strand = -1; strand <= 1; strand++) {
      const offset = strand * (1 + currentStretch * 2);
      ctx.beginPath();
      ctx.moveTo(anchor.x + offset, anchor.y);
      ctx.quadraticCurveTo(
        controlX + offset + Math.sin(t * 3 + strand) * 3,
        controlY,
        handle.x + offset,
        handle.y,
      );
      ctx.strokeStyle = `rgba(${r},${g},${b},${(tetherAlpha * (strand === 0 ? 1 : 0.3)).toFixed(4)})`;
      ctx.lineWidth = strand === 0 ? tetherWidth : tetherWidth * 0.3;
      ctx.stroke();
    }

    // ── Tension particles along the string ──
    if (currentStretch > 0.2) {
      const particleCount = Math.floor(currentStretch * 8);
      for (let i = 0; i < particleCount; i++) {
        const param = (i + 0.5) / particleCount;
        const bezT = param;
        // Quadratic bezier point
        const px = (1 - bezT) * (1 - bezT) * anchor.x + 2 * (1 - bezT) * bezT * controlX + bezT * bezT * handle.x;
        const py = (1 - bezT) * (1 - bezT) * anchor.y + 2 * (1 - bezT) * bezT * controlY + bezT * bezT * handle.y;
        // Offset perpendicular to string
        const jitter = Math.sin(t * 5 + i * 2.3) * (3 + currentStretch * 8);

        ctx.beginPath();
        ctx.arc(px + jitter, py + jitter * 0.5, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${(currentStretch * 0.12).toFixed(4)})`;
        ctx.fill();
      }
    }

    // ── Schema anchor node ──
    const anchorSize = 5 + breathPhase * 1;
    const anchorGlow = 15 + currentStretch * 10;

    const aGrad = ctx.createRadialGradient(anchor.x, anchor.y, 0, anchor.x, anchor.y, anchorGlow);
    aGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.08 + currentStretch * 0.05).toFixed(4)})`);
    aGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = aGrad;
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, anchorGlow, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, anchorSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(0.2 + currentStretch * 0.15).toFixed(3)})`;
    ctx.fill();

    // ── User handle node ──
    if (!releasedRef.current) {
      const handleSize = 6 + (draggingRef.current ? 3 : 0);
      const handleGlow = 20 + currentStretch * 15;

      const hGrad = ctx.createRadialGradient(handle.x, handle.y, 0, handle.x, handle.y, handleGlow);
      hGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.12 + currentStretch * 0.1).toFixed(4)})`);
      hGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, handleGlow, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(handle.x, handle.y, handleSize, 0, Math.PI * 2);
      const bright = Math.min(255, r + 40);
      const brightG = Math.min(255, g + 40);
      const brightB = Math.min(255, b + 40);
      ctx.fillStyle = `rgba(${bright},${brightG},${brightB},${(0.3 + currentStretch * 0.3).toFixed(3)})`;
      ctx.fill();
    }

    // ── Release animation: string snaps ──
    if (releasedRef.current) {
      const releaseAge = t - (pullStartRef.current * 0.001 || t);
      // String fades and dissolves
      const fadeAlpha = Math.max(0, 1 - (t - (pullStartRef.current * 0.001 || t)) * 0.3);

      if (fadeAlpha <= 0) {
        ctx.restore();
        cancelAnimationFrame(rafRef.current);
        return;
      }
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (releasedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const handle = handleRef.current;

    // Check if near the handle
    const dx = px - handle.x;
    const dy = py - handle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 50) {
      draggingRef.current = true;
      pullStartRef.current = Date.now();
      hapticPressure(0.3);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || releasedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const prevX = handleRef.current.x;
    const prevY = handleRef.current.y;

    handleRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Track velocity for release measurement
    const vx = handleRef.current.x - prevX;
    const vy = handleRef.current.y - prevY;
    velocityRef.current = { vx, vy };

    // Haptic at stretch thresholds
    const anchor = anchorRef.current;
    const dx = handleRef.current.x - anchor.x;
    const dy = handleRef.current.y - anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const restDist = height * 0.27;
    const maxDist = height * 0.6;
    const s = (dist - restDist) / (maxDist - restDist);

    if (s > 0.3 && s < 0.32) hapticTick();
    if (s > 0.6 && s < 0.62) hapticPressure(0.5);
    if (s > 0.9 && s < 0.92) hapticPressure(0.8);
  }, [height]);

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current || releasedRef.current) return;
    draggingRef.current = false;

    // Calculate release metrics
    const vel = velocityRef.current;
    const releaseVel = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
    releaseVelocityRef.current = releaseVel;

    // Score: combines max stretch with release velocity
    // High stretch + gentle release = high integration (high score)
    // High stretch + aggressive snap = resistance (lower score)
    // Low stretch = didn't engage deeply
    const stretchFactor = maxStretchRef.current;
    const velocityFactor = Math.min(1, releaseVel / 30); // Normalize velocity
    // Gentle release (low velocity) with high stretch = high believing
    const score = stretchFactor * (1 - velocityFactor * 0.5);

    releasedRef.current = true;
    setReleased(true);
    hapticResolve();
    pullStartRef.current = Date.now();

    setTimeout(() => onComplete(Math.max(0, Math.min(1, score))), 1500);
  }, [onComplete]);

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

      {/* Schema text at anchor */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: height * 0.14,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: released ? 0 : 0.35,
          transition: timing.t.fadeSlow,
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(11px, 2.8vw, 15px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          margin: 0,
          maxWidth: '65%',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: leading.firm,
        }}>
          {copy}
        </p>
      </div>

      {/* Prompt */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '6%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: released ? 0 : 0.25,
          transition: timing.t.fadeSlow,
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(13px, 3.2vw, 17px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          margin: 0,
          maxWidth: '70%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {prompt}
        </p>
      </div>

      {/* Stretch indicator */}
      {stretch > 0.1 && !released && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: height * 0.72,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: opacity.trace,
          }}
        >
          <span style={{
            fontFamily: font.mono,
            fontSize: typeSize.label,
            color,
          }}>
            {stretch > 0.8 ? 'RELEASE' : stretch > 0.5 ? 'TENSION' : 'PULLING'}
          </span>
        </div>
      )}

      {/* Instruction */}
      {!released && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity.trace }}
          transition={{ delay: 0.5, duration: 1 }}
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