/**
 * TOPOGRAPHY DROP — Ascertainment Block (Embodying 3A)
 *
 * "Where does this sit?"
 *
 * An abstract, slow-breathing topography — an ethereal body silhouette
 * rendered as layered contour lines, not a clinical diagram. Alive.
 * Breathing with the user. Luminous edges in the dark.
 *
 * The user takes a single point of light and places it on the topography.
 * As the light touches down, ripples echo outward from the placement,
 * and the screen fades to black.
 *
 * We log the autonomic location of the integration.
 * Not "where should it sit" — "where does it sit, right now."
 *
 * Canvas 2D: contour-line body silhouette with drop-point ripple.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticPressure, hapticResolve, hapticBreathPulse } from '../surfaces/haptics';
import { room, font, tracking, typeSize, weight, opacity, timing } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

// Body region mapping — approximate zones on the abstract topography
const BODY_REGIONS = [
  { id: 'head', label: 'head', yRange: [0.05, 0.18] },
  { id: 'throat', label: 'throat', yRange: [0.18, 0.25] },
  { id: 'chest', label: 'chest', yRange: [0.25, 0.40] },
  { id: 'solar', label: 'solar plexus', yRange: [0.40, 0.50] },
  { id: 'gut', label: 'gut', yRange: [0.50, 0.62] },
  { id: 'pelvis', label: 'pelvis', yRange: [0.62, 0.72] },
  { id: 'legs', label: 'legs', yRange: [0.72, 0.95] },
] as const;

interface TopographyDropProps {
  color: string;
  copy: string;
  prompt: string;
  instruction: string;
  breath: number;
  width: number;
  height: number;
  onComplete: (location: { x: number; y: number; region: string }) => void;
}

export function TopographyDrop({
  color,
  copy,
  prompt,
  instruction,
  breath,
  width,
  height,
  onComplete,
}: TopographyDropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [dropPoint, setDropPoint] = useState<{ x: number; y: number } | null>(null);
  const [dropped, setDropped] = useState(false);
  const dropRef = useRef<{ x: number; y: number } | null>(null);
  const dropTimeRef = useRef(0);
  const droppedRef = useRef(false);
  const [lightPos, setLightPos] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  // Body silhouette contour — abstract, not anatomical
  // Returns width factor (0-1) for a given y position (0-1) on the body
  const bodyContour = (yNorm: number): number => {
    // Head
    if (yNorm < 0.12) {
      const t = yNorm / 0.12;
      return 0.12 + Math.sin(t * Math.PI) * 0.06;
    }
    // Neck
    if (yNorm < 0.18) return 0.06;
    // Shoulders
    if (yNorm < 0.22) {
      const t = (yNorm - 0.18) / 0.04;
      return 0.06 + t * 0.18;
    }
    // Torso
    if (yNorm < 0.55) {
      const t = (yNorm - 0.22) / 0.33;
      return 0.24 - Math.sin(t * Math.PI) * 0.04;
    }
    // Waist
    if (yNorm < 0.62) {
      const t = (yNorm - 0.55) / 0.07;
      return 0.22 - t * 0.04;
    }
    // Hips
    if (yNorm < 0.68) {
      const t = (yNorm - 0.62) / 0.06;
      return 0.18 + Math.sin(t * Math.PI) * 0.04;
    }
    // Upper legs
    if (yNorm < 0.85) {
      const t = (yNorm - 0.68) / 0.17;
      return 0.16 - t * 0.06;
    }
    // Lower legs
    if (yNorm < 0.95) {
      return 0.10;
    }
    return 0.06;
  };

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

    const cx = width / 2;
    const bodyTop = height * 0.12;
    const bodyBottom = height * 0.88;
    const bodyHeight = bodyBottom - bodyTop;
    const t = Date.now() * 0.001;
    const [r, g, b] = parseHex(color);
    const breathPhase = Math.sin(breath * Math.PI * 2);

    // ── Draw contour layers ──
    const layerCount = 5;
    for (let layer = 0; layer < layerCount; layer++) {
      const layerOffset = (layer / layerCount) * 0.3;
      const layerAlpha = 0.03 + (layerCount - layer) * 0.01;
      const breathMod = 1 + breathPhase * (0.01 + layer * 0.005);

      ctx.beginPath();
      // Right side
      for (let yNorm = 0; yNorm <= 1; yNorm += 0.01) {
        const bodyW = bodyContour(yNorm) * width * breathMod;
        const waveOffset = Math.sin(t * 0.5 + yNorm * 8 + layer * 1.5) * (2 + layer * 1.5);
        const px = cx + bodyW + layerOffset * 30 + waveOffset;
        const py = bodyTop + yNorm * bodyHeight;
        if (yNorm === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      // Left side (mirror)
      for (let yNorm = 1; yNorm >= 0; yNorm -= 0.01) {
        const bodyW = bodyContour(yNorm) * width * breathMod;
        const waveOffset = Math.sin(t * 0.5 + yNorm * 8 + layer * 1.5) * (2 + layer * 1.5);
        const px = cx - bodyW - layerOffset * 30 - waveOffset;
        const py = bodyTop + yNorm * bodyHeight;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${r},${g},${b},${layerAlpha.toFixed(4)})`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    // ── Inner meridian line ──
    ctx.beginPath();
    for (let yNorm = 0.12; yNorm <= 0.92; yNorm += 0.01) {
      const waveX = Math.sin(t * 0.3 + yNorm * 6) * 2;
      const py = bodyTop + yNorm * bodyHeight;
      if (yNorm <= 0.12) ctx.moveTo(cx + waveX, py);
      else ctx.lineTo(cx + waveX, py);
    }
    ctx.strokeStyle = `rgba(${r},${g},${b},0.015)`;
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // ── Energy nodes at chakra-like positions ──
    const nodes = [0.10, 0.22, 0.32, 0.45, 0.55, 0.65, 0.80];
    for (const yNorm of nodes) {
      const py = bodyTop + yNorm * bodyHeight;
      const nodeBreath = Math.sin(t * 1.5 + yNorm * 10) * 0.5 + 0.5;
      const nodeSize = 1.5 + nodeBreath * 1;

      ctx.beginPath();
      ctx.arc(cx, py, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.04 + nodeBreath * 0.03).toFixed(4)})`;
      ctx.fill();
    }

    // ── Dragging light point ──
    if (lightPos && !droppedRef.current) {
      const glowRadius = 25;
      const glowGrad = ctx.createRadialGradient(
        lightPos.x, lightPos.y, 0,
        lightPos.x, lightPos.y, glowRadius,
      );
      glowGrad.addColorStop(0, `rgba(${r},${g},${b},0.25)`);
      glowGrad.addColorStop(0.5, `rgba(${r},${g},${b},0.08)`);
      glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.min(255, r + 80)},${Math.min(255, g + 80)},${Math.min(255, b + 80)},0.6)`;
      ctx.fill();
    }

    // ── Drop point ripples ──
    if (dropRef.current) {
      const dp = dropRef.current;
      const dropAge = t - dropTimeRef.current;

      // Expanding ripples
      const rippleCount = Math.min(5, Math.floor(dropAge * 2) + 1);
      for (let i = 0; i < rippleCount; i++) {
        const rippleAge = dropAge - i * 0.5;
        if (rippleAge < 0) continue;
        const rippleRadius = rippleAge * 40;
        const rippleAlpha = Math.max(0, 0.15 - rippleAge * 0.03);

        ctx.beginPath();
        ctx.arc(dp.x, dp.y, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${rippleAlpha.toFixed(4)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Persistent glow at drop point
      const persistGlow = Math.max(0, 0.2 - dropAge * 0.02);
      if (persistGlow > 0) {
        const pgRadius = 20 + dropAge * 5;
        const pgGrad = ctx.createRadialGradient(dp.x, dp.y, 0, dp.x, dp.y, pgRadius);
        pgGrad.addColorStop(0, `rgba(${r},${g},${b},${persistGlow.toFixed(4)})`);
        pgGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = pgGrad;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, pgRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dp.x, dp.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.min(255, r + 80)},${Math.min(255, g + 80)},${Math.min(255, b + 80)},${(persistGlow * 2).toFixed(3)})`;
        ctx.fill();
      }

      // Fade to completion after ripples expand
      if (dropAge > 4 && !droppedRef.current) {
        // Already completed via timeout
      }
    }

    ctx.restore();

    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, lightPos]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (droppedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    draggingRef.current = true;
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setLightPos(pos);
    hapticPressure(0.3);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || droppedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setLightPos(pos);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current || droppedRef.current || !lightPos) return;
    draggingRef.current = false;

    // Check if the drop is within the body contour
    const bodyTop = height * 0.12;
    const bodyBottom = height * 0.88;
    const bodyHeight = bodyBottom - bodyTop;
    const yNorm = (lightPos.y - bodyTop) / bodyHeight;

    if (yNorm >= 0 && yNorm <= 1) {
      const bodyW = bodyContour(yNorm) * width;
      const cx = width / 2;
      const dx = Math.abs(lightPos.x - cx);

      if (dx <= bodyW + 20) {
        // Valid drop on body
        droppedRef.current = true;
        setDropped(true);
        setDropPoint(lightPos);
        dropRef.current = lightPos;
        dropTimeRef.current = Date.now() * 0.001;
        hapticResolve();

        // Determine body region
        const region = BODY_REGIONS.find(
          r => yNorm >= r.yRange[0] && yNorm <= r.yRange[1]
        );

        // Normalize to 0-1 coordinate space
        const normalizedX = lightPos.x / width;
        const normalizedY = lightPos.y / height;

        setTimeout(() => {
          onComplete({
            x: normalizedX,
            y: normalizedY,
            region: region?.id || 'unknown',
          });
        }, 2500);

        return;
      }
    }

    // Drop missed the body — reset
    setLightPos(null);
    hapticBreathPulse();
  }, [lightPos, width, height, onComplete]);

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

      {/* Copy */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '3%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: dropped ? 0 : 0.4,
          transition: timing.t.fadeEmerge,
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
          {copy}
        </p>
      </div>

      {/* Region indicator */}
      <AnimatePresence>
        {dropped && dropPoint && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: dropPoint.y + 25,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: opacity.ambient, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              textTransform: 'uppercase',
              color,
            }}>
              {BODY_REGIONS.find(r => {
                const bodyTop = height * 0.12;
                const bodyHeight = height * 0.76;
                const yNorm = (dropPoint.y - bodyTop) / bodyHeight;
                return yNorm >= r.yRange[0] && yNorm <= r.yRange[1];
              })?.label || ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction */}
      {!dropped && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity.trace }}
          transition={{ delay: 0.8, duration: 1 }}
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