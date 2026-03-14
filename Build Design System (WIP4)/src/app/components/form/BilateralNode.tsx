/**
 * BILATERAL NODE — EMDR-Adjacent Processing
 *
 * A Canvas 2D bilateral stimulation node. The user follows
 * a luminous dot as it traverses left→right→left→right
 * across the glass. This is the core mechanic of the
 * bilateral-processing protocol.
 *
 * The node is NOT a bouncing ball. It is a controlled,
 * deliberate, clinical traversal:
 *   - Constant speed (no acceleration)
 *   - Smooth sine-eased reversal at edges
 *   - Bilateral haptic pulse on each reversal
 *   - Trail that fades behind the node
 *   - Breath-modulated glow intensity
 *
 * The traversal speed is locked to a therapeutic cadence:
 *   ~1 full cycle (left→right→left) every 2.4 seconds
 *   This is standard EMDR bilateral speed.
 *
 * The node renders into any container — during bilateral-processing
 * protocol it runs inside the titration step.
 */

import { useRef, useEffect, useCallback } from 'react';

interface BilateralNodeProps {
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Node color (hex) */
  color: string;
  /** Breath amplitude 0-1 for glow modulation */
  breath: number;
  /** Whether the node is active */
  active: boolean;
  /** Current cycle count (fires on each reversal) */
  onReversal?: () => void;
  /** Vertical position as fraction (0=top, 1=bottom) */
  yPosition?: number;
  /** Speed multiplier (1 = standard EMDR) */
  speedMultiplier?: number;
}

// Parse hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) || 100,
    parseInt(h.slice(2, 4), 16) || 136,
    parseInt(h.slice(4, 6), 16) || 192,
  ];
}

export function BilateralNode({
  width,
  height,
  color,
  breath,
  active,
  onReversal,
  yPosition = 0.42,
  speedMultiplier = 1,
}: BilateralNodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const stateRef = useRef({
    time: 0,
    lastDirection: 1,
    trailPoints: [] as { x: number; y: number; age: number }[],
  });
  const cbRef = useRef({ onReversal });

  useEffect(() => {
    cbRef.current = { onReversal };
  }, [onReversal]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

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

    const s = stateRef.current;
    const dt = 0.016; // ~60fps
    s.time += dt * speedMultiplier;

    const [r, g, b] = hexToRgb(color);

    // ─── Node position ───
    // Full cycle = 2.4s → frequency = 1/2.4 ≈ 0.417 Hz
    // We use a sine wave for smooth reversal
    const frequency = 0.417;
    const phase = s.time * frequency * Math.PI * 2;
    const sineValue = Math.sin(phase); // -1 to 1

    // Horizontal position: 15% margin on each side
    const marginX = width * 0.15;
    const nodeX = marginX + (sineValue * 0.5 + 0.5) * (width - marginX * 2);
    const nodeY = height * yPosition;

    // ─── Reversal detection ───
    const currentDirection = Math.cos(phase) > 0 ? 1 : -1;
    if (currentDirection !== s.lastDirection) {
      s.lastDirection = currentDirection;
      cbRef.current.onReversal?.();
    }

    // ─── Trail ───
    // Add current position to trail
    s.trailPoints.push({ x: nodeX, y: nodeY, age: 0 });

    // Age and prune trail
    const maxAge = 0.8; // seconds
    s.trailPoints = s.trailPoints
      .map(p => ({ ...p, age: p.age + dt }))
      .filter(p => p.age < maxAge);

    // Draw trail
    for (let i = 0; i < s.trailPoints.length - 1; i++) {
      const p = s.trailPoints[i];
      const alpha = Math.max(0, (1 - p.age / maxAge) * 0.15);
      const size = Math.max(0.5, (1 - p.age / maxAge) * 2.5);

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(4)})`;
      ctx.fill();
    }

    // ─── Trail line ───
    if (s.trailPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(s.trailPoints[0].x, s.trailPoints[0].y);
      for (let i = 1; i < s.trailPoints.length; i++) {
        ctx.lineTo(s.trailPoints[i].x, s.trailPoints[i].y);
      }
      ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ─── Node glow ───
    const breathGlow = 0.7 + breath * 0.3;
    const glowRadius = 18 + breath * 8;

    // Outer glow
    const outerGrad = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, glowRadius * 2);
    outerGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.06 * breathGlow).toFixed(4)})`);
    outerGrad.addColorStop(0.5, `rgba(${r},${g},${b},${(0.02 * breathGlow).toFixed(4)})`);
    outerGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = outerGrad;
    ctx.fillRect(nodeX - glowRadius * 2, nodeY - glowRadius * 2, glowRadius * 4, glowRadius * 4);

    // Inner glow
    const innerGrad = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, glowRadius);
    innerGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.2 * breathGlow).toFixed(4)})`);
    innerGrad.addColorStop(0.3, `rgba(${r},${g},${b},${(0.08 * breathGlow).toFixed(4)})`);
    innerGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = innerGrad;
    ctx.fillRect(nodeX - glowRadius, nodeY - glowRadius, glowRadius * 2, glowRadius * 2);

    // Core node
    const coreSize = 3 + breath * 1.5;
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(0.6 * breathGlow).toFixed(3)})`;
    ctx.fill();

    // Bright center
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, coreSize * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${(0.3 * breathGlow).toFixed(3)})`;
    ctx.fill();

    // ─── Guide rail ───
    // Subtle horizontal line showing the traversal path
    ctx.beginPath();
    ctx.moveTo(marginX, nodeY);
    ctx.lineTo(width - marginX, nodeY);
    ctx.strokeStyle = `rgba(${r},${g},${b},0.02)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Edge markers
    for (const ex of [marginX, width - marginX]) {
      ctx.beginPath();
      ctx.arc(ex, nodeY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
      ctx.fill();
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, active, speedMultiplier, yPosition]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      stateRef.current.trailPoints = [];
      return;
    }

    stateRef.current.time = 0;
    stateRef.current.lastDirection = 1;
    stateRef.current.trailPoints = [];

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, render]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
