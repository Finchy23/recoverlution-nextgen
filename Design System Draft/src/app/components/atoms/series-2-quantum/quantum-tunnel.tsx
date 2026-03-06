/**
 * ATOM 017: THE QUANTUM TUNNEL ENGINE
 * =====================================
 * Series 2 — Quantum Mechanics · Position 7
 *
 * Seemingly impossible barriers contain microscopic space.
 * You don't always have to break a wall — sometimes you can
 * just pass through it.
 *
 * A massive crystalline wall stretches across the viewport.
 * A glowing quantum node sits on the left. Drag it.
 * Slam it into the wall → rigid collision, node bounces.
 * Gently, persistently press the node into the wall →
 * molecular gaps shimmer, and after ~3s of sustained gentle
 * pressure the node PHASES THROUGH, emerging free on the other side.
 *
 * PHYSICS:
 *   - Draggable quantum node with velocity tracking
 *   - Wall with molecular structure visible (hexagonal lattice)
 *   - Collision detection: high velocity = bounce, low velocity = tunnel
 *   - Sustained gentle contact timer (3s threshold)
 *   - Phase-through: node becomes translucent, collision disabled
 *   - Post-tunnel: resolution glow, node free on other side
 *
 * INTERACTION:
 *   Drag (node)      → push into wall
 *   Slam (fast)      → bounce with impact flash
 *   Gentle hold (3s) → phase through the wall
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No molecular shimmer, instant tunnel at threshold
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, easeInOutCubic, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS (all viewport-relative via minDim * factor)
// =====================================================================

/** Node radius as fraction of minDim */
const NODE_R_FRAC = 0.028;
/** Wall X position as fraction of viewport width */
const WALL_X_FRAC = 0.52;
/** Wall thickness as fraction of minDim */
const WALL_THICKNESS_FRAC = 0.08;
/** Velocity ABOVE which a slam-bounce occurs (fraction of minDim/frame) */
const BOUNCE_VEL_FRAC = 0.006;
/** Frames of sustained wall contact to tunnel */
const TUNNEL_THRESHOLD_FRAMES = 150; // ~2.5s at 60fps
/** Bounce elasticity */
const BOUNCE_ELASTICITY = 0.6;
/** How close the node edge must be to the wall to count as contact (frac of minDim) */
const CONTACT_PROXIMITY_FRAC = 0.03;
/** Molecular grid cell size as fraction of minDim */
const MOL_CELL_FRAC = 0.024;
/** Molecular shimmer radius as fraction of minDim */
const SHIMMER_R_FRAC = 0.12;
/** Hit detection radius multiplier over node radius */
const HIT_MULT = 2.5;

// =====================================================================
// MOLECULAR STRUCTURE
// =====================================================================

interface MoleculeNode {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  phase: number;
  row: number;
}

function createMolecules(wallX: number, wallW: number, h: number, cellSize: number): MoleculeNode[] {
  const nodes: MoleculeNode[] = [];
  const rowH = cellSize * 0.866;
  const rows = Math.ceil(h / rowH);
  const cols = Math.ceil(wallW / cellSize) + 2;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const offset = r % 2 === 0 ? 0 : cellSize * 0.5;
    for (let c = 0; c < cols; c++) {
      const x = wallX - wallW / 2 + c * cellSize + offset;
      nodes.push({
        x, y, homeX: x, homeY: y,
        phase: Math.random() * Math.PI * 2,
        row: r,
      });
    }
  }
  return nodes;
}

// =====================================================================
// COLOR
// =====================================================================

const WALL_COLOR: RGB = [60, 55, 80];
const WALL_LATTICE: RGB = [80, 75, 110];
const NODE_COLOR: RGB = [180, 200, 255];
const SHIMMER_COLOR: RGB = [140, 160, 255];
const PHASE_COLOR: RGB = [200, 180, 255];
const RESOLVED_GLOW: RGB = [220, 230, 255];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function QuantumTunnelAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Single effect: native events + rAF loop ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // Derived dimensions
    const nodeR = minDim * NODE_R_FRAC;
    const wallThickness = minDim * WALL_THICKNESS_FRAC;
    const wallX = w * WALL_X_FRAC;
    const wallLeft = wallX - wallThickness / 2;
    const wallRight = wallX + wallThickness / 2;
    const cellSize = minDim * MOL_CELL_FRAC;
    const shimmerR = minDim * SHIMMER_R_FRAC;
    const bounceVel = minDim * BOUNCE_VEL_FRAC;
    const contactProximity = minDim * CONTACT_PROXIMITY_FRAC;

    // ── Mutable state ──────────────────────────────────
    const s = {
      molecules: createMolecules(wallX, wallThickness, h, cellSize),
      nodeX: w * 0.25,
      nodeY: h * 0.5,
      nodeVx: 0,
      nodeVy: 0,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      pointerX: 0,
      pointerY: 0,
      pointerId: -1,
      gentleContactFrames: 0,
      isTunnelling: false,
      tunnelProgress: 0,
      tunnelled: false,
      bounceFlash: 0,
      contactY: h * 0.5,
      resolved: false,
      resolveGlow: 0,
      entranceProgress: 0,
      frameCount: 0,
      primaryRgb: parseColor(color),
      accentRgb: parseColor(accentColor),
    };

    // ── Helper: CSS-pixel coords from pointer event ────
    // Normalise through actual rendered size to match the
    // canvas coordinate space (w × h) used for drawing.
    const getPos = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [
        (e.clientX - rect.left) / rect.width * w,
        (e.clientY - rect.top) / rect.height * h,
      ];
    };

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const [px, py] = getPos(e);

      // Only one draggable element — always grab the node.
      // Offset so the node doesn't snap its center to the pointer.
      s.isDragging = true;
      s.dragOffsetX = px - s.nodeX;
      s.dragOffsetY = py - s.nodeY;
      s.pointerX = px;
      s.pointerY = py;
      s.pointerId = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('tap');
    };

    const onMove = (e: PointerEvent) => {
      if (!s.isDragging) return;
      const [px, py] = getPos(e);
      s.pointerX = px;
      s.pointerY = py;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== s.pointerId) return;
      s.isDragging = false;
      if (!s.tunnelled && !s.isTunnelling) {
        s.gentleContactFrames = 0;
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // ── Animation loop ─────────────────────────────────
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      s.primaryRgb = parseColor(p.color);
      s.accentRgb = parseColor(p.accentColor);

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Node physics ──────────────────────────────
      if (s.isDragging && !s.tunnelled) {
        const targetX = s.pointerX - s.dragOffsetX;
        const targetY = s.pointerY - s.dragOffsetY;
        s.nodeVx = (targetX - s.nodeX) * 0.15;
        s.nodeVy = (targetY - s.nodeY) * 0.15;
        s.nodeX += s.nodeVx;
        s.nodeY += s.nodeVy;

        // Clamp Y
        s.nodeY = Math.max(nodeR, Math.min(h - nodeR, s.nodeY));

        // Wall collision
        if (!s.isTunnelling) {
          const speed = Math.sqrt(s.nodeVx * s.nodeVx + s.nodeVy * s.nodeVy);
          // How close is the node's right edge to the wall's left edge?
          const gap = wallLeft - (s.nodeX + nodeR);
          const alreadyInContact = s.gentleContactFrames > 0;

          if (gap < 0) {
            // Node is overlapping the wall
            s.contactY = s.nodeY;

            if (!alreadyInContact && speed > bounceVel) {
              // FIRST-CONTACT SLAM → BOUNCE
              s.nodeX = wallLeft - nodeR - minDim * 0.004;
              s.nodeVx = -Math.abs(s.nodeVx) * BOUNCE_ELASTICITY;
              s.gentleContactFrames = 0;
              s.bounceFlash = 1;
              cb.onHaptic('tap');
            } else {
              // Already in contact OR gentle approach → clamp & count
              s.nodeX = wallLeft - nodeR;
              s.nodeVx = 0; // Kill spring force so it doesn't re-bounce
              s.gentleContactFrames++;

              if (s.gentleContactFrames === 1) {
                cb.onHaptic('hold_start');
              }

              if (s.gentleContactFrames >= TUNNEL_THRESHOLD_FRAMES) {
                s.isTunnelling = true;
                s.tunnelProgress = 0;
                cb.onHaptic('hold_threshold');
              }
            }
          } else if (gap < contactProximity) {
            // Node is NEAR the wall — still counts as contact
            s.contactY = s.nodeY;
            s.gentleContactFrames++;

            if (s.gentleContactFrames === 1) {
              cb.onHaptic('hold_start');
            }

            if (s.gentleContactFrames >= TUNNEL_THRESHOLD_FRAMES) {
              s.isTunnelling = true;
              s.tunnelProgress = 0;
              cb.onHaptic('hold_threshold');
            }
          } else {
            // Away from wall — decay contact frames
            s.gentleContactFrames = Math.max(0, s.gentleContactFrames - 2);
          }
        }
      } else if (!s.isDragging && !s.tunnelled && !s.isTunnelling) {
        // Drift with friction
        s.nodeVx *= 0.95;
        s.nodeVy *= 0.95;
        s.nodeX += s.nodeVx;
        s.nodeY += s.nodeVy;
        s.nodeY = Math.max(nodeR, Math.min(h - nodeR, s.nodeY));
        if (s.nodeX + nodeR > wallLeft) s.nodeX = wallLeft - nodeR;
        if (s.nodeX < nodeR) s.nodeX = nodeR;
      }

      // ── Tunnel animation ──────────────────────────
      if (s.isTunnelling) {
        s.tunnelProgress = Math.min(1, s.tunnelProgress + (p.reducedMotion ? 0.04 : 0.008));
        const startX = wallLeft - nodeR;
        const endX = wallRight + nodeR + minDim * 0.06;
        s.nodeX = startX + (endX - startX) * easeInOutCubic(s.tunnelProgress);

        if (s.tunnelProgress >= 1) {
          s.isTunnelling = false;
          s.tunnelled = true;
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // ── Bounce flash decay ────────────────────────
      if (s.bounceFlash > 0) {
        s.bounceFlash = Math.max(0, s.bounceFlash - 0.04);
      }

      // ── Resolution glow ───────────────────────────
      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.006);
      }

      // ── State reporting ───────────────────────────
      const tunnelNorm = s.tunnelled ? 1 :
        s.isTunnelling ? 0.5 + s.tunnelProgress * 0.5 :
        Math.min(0.5, s.gentleContactFrames / TUNNEL_THRESHOLD_FRAMES * 0.5);
      cb.onStateChange?.(tunnelNorm);

      // ══════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════

      // ── Background ────────────────────────────────
      const bgBase = lerpColor([4, 3, 10], s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Wall body ─────────────────────────────────
      const wallColor = lerpColor(WALL_COLOR, s.primaryRgb, 0.06);
      ctx.fillStyle = rgba(wallColor, 0.55 * entrance);
      ctx.fillRect(wallLeft, 0, wallThickness, h);

      // Wall edge glow
      const edgeW = minDim * 0.02;
      const edgeGrad = ctx.createLinearGradient(wallLeft - edgeW, 0, wallLeft + edgeW * 0.5, 0);
      edgeGrad.addColorStop(0, rgba(wallColor, 0));
      edgeGrad.addColorStop(0.5, rgba(WALL_LATTICE, 0.12 * entrance));
      edgeGrad.addColorStop(1, rgba(wallColor, 0));
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(wallLeft - edgeW, 0, edgeW * 1.5, h);

      // ── Molecular lattice ─────────────────────────
      const shimmerProgress = s.gentleContactFrames / TUNNEL_THRESHOLD_FRAMES;
      const tunneling = s.isTunnelling;
      const molDotR = minDim * 0.002;

      for (const mol of s.molecules) {
        const mdx = mol.homeX - wallX;
        const mdy = mol.homeY - s.contactY;
        const distFromContact = Math.sqrt(mdx * mdx + mdy * mdy);
        const inShimmerZone = distFromContact < shimmerR;

        let molAlpha = 0.06 * entrance;
        let molSize = molDotR;

        if (inShimmerZone && (shimmerProgress > 0 || tunneling)) {
          const shimmerT = Math.max(shimmerProgress, tunneling ? 1 : 0);
          const proximity = 1 - distFromContact / shimmerR;

          // Molecules spread apart
          const spread = shimmerT * proximity * minDim * 0.012;
          const spreadAngle = Math.atan2(mdy, mdx);
          mol.x = mol.homeX + Math.cos(spreadAngle) * spread;
          mol.y = mol.homeY + Math.sin(spreadAngle) * spread;

          if (!p.reducedMotion) {
            const shimmer = Math.sin(s.frameCount * 0.08 + mol.phase) * 0.5 + 0.5;
            molAlpha = (0.06 + shimmerT * proximity * 0.2 * shimmer) * entrance;
          } else {
            molAlpha = (0.06 + shimmerT * proximity * 0.12) * entrance;
          }
          molSize = molDotR * (1 + shimmerT * proximity * 1.5);
        } else {
          mol.x += (mol.homeX - mol.x) * 0.05;
          mol.y += (mol.homeY - mol.y) * 0.05;
        }

        if (tunneling) {
          const tunnelDist = Math.abs(mol.homeY - s.contactY);
          if (tunnelDist < shimmerR * 1.5) {
            const partForce = (1 - tunnelDist / (shimmerR * 1.5)) * s.tunnelProgress * minDim * 0.03;
            const partDir = mol.homeY < s.contactY ? -1 : 1;
            mol.y = mol.homeY + partDir * partForce;
            molAlpha *= (1 - s.tunnelProgress * 0.5);
          }
        }

        const mColor = inShimmerZone && shimmerProgress > 0.3
          ? lerpColor(WALL_LATTICE, SHIMMER_COLOR, shimmerProgress * (1 - distFromContact / shimmerR))
          : lerpColor(WALL_LATTICE, s.primaryRgb, 0.1);

        ctx.beginPath();
        ctx.arc(mol.x, mol.y, Math.max(minDim * 0.0006, molSize), 0, Math.PI * 2);
        ctx.fillStyle = rgba(mColor, molAlpha);
        ctx.fill();
      }

      // ── Contact zone glow ─────────────────────────
      if (shimmerProgress > 0.1 && !s.tunnelled) {
        const glowR = shimmerR * shimmerProgress;
        const glowGrad = ctx.createRadialGradient(
          wallLeft, s.contactY, 0,
          wallLeft, s.contactY, glowR,
        );
        const gColor = lerpColor(SHIMMER_COLOR, s.accentRgb, 0.2);
        glowGrad.addColorStop(0, rgba(gColor, shimmerProgress * 0.08 * entrance));
        glowGrad.addColorStop(0.5, rgba(gColor, shimmerProgress * 0.03 * entrance));
        glowGrad.addColorStop(1, rgba(gColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(wallLeft - glowR, s.contactY - glowR, glowR * 2, glowR * 2);
      }

      // ── Tunnel opening (visual gap in wall) ───────
      if (tunneling || s.tunnelled) {
        const gapR = shimmerR * 0.6 * (tunneling ? s.tunnelProgress : 1);
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        const gapGrad = ctx.createRadialGradient(
          wallX, s.contactY, 0,
          wallX, s.contactY, gapR,
        );
        const gapAlpha = tunneling ? s.tunnelProgress : 1;
        gapGrad.addColorStop(0, `rgba(0,0,0,${gapAlpha * 0.7})`);
        gapGrad.addColorStop(0.7, `rgba(0,0,0,${gapAlpha * 0.3})`);
        gapGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gapGrad;
        ctx.fillRect(wallX - gapR, s.contactY - gapR, gapR * 2, gapR * 2);
        ctx.restore();

        // Phase glow inside gap
        const phaseGrad = ctx.createRadialGradient(
          wallX, s.contactY, 0,
          wallX, s.contactY, gapR * 0.8,
        );
        const pColor = lerpColor(PHASE_COLOR, s.accentRgb, 0.2);
        phaseGrad.addColorStop(0, rgba(pColor, 0.06 * entrance));
        phaseGrad.addColorStop(1, rgba(pColor, 0));
        ctx.fillStyle = phaseGrad;
        ctx.fillRect(wallX - gapR, s.contactY - gapR, gapR * 2, gapR * 2);
      }

      // ── Bounce flash ──────────────────────────────
      if (s.bounceFlash > 0) {
        const bounceColor = lerpColor([255, 200, 200], s.primaryRgb, 0.2);
        const flashH = minDim * 0.08;
        ctx.fillStyle = rgba(bounceColor, s.bounceFlash * 0.06 * entrance);
        ctx.fillRect(wallLeft - minDim * 0.008, s.contactY - flashH, wallThickness + minDim * 0.016, flashH * 2);
      }

      // ── Quantum node ──────────────────────────────
      const nodeAlpha = s.isTunnelling
        ? 0.3 + 0.4 * (1 - Math.abs(s.tunnelProgress - 0.5) * 2)
        : s.tunnelled ? 0.7 : 0.65;

      const nColor = lerpColor(NODE_COLOR, s.accentRgb, 0.15);
      const pulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.04));

      // Node glow
      const nGlowR = nodeR * 6 * pulse;
      const nGlowGrad = ctx.createRadialGradient(
        s.nodeX, s.nodeY, 0,
        s.nodeX, s.nodeY, nGlowR,
      );
      nGlowGrad.addColorStop(0, rgba(nColor, nodeAlpha * 0.15 * entrance));
      nGlowGrad.addColorStop(0.3, rgba(nColor, nodeAlpha * 0.04 * entrance));
      nGlowGrad.addColorStop(1, rgba(nColor, 0));
      ctx.fillStyle = nGlowGrad;
      ctx.fillRect(s.nodeX - nGlowR, s.nodeY - nGlowR, nGlowR * 2, nGlowR * 2);

      // Node body
      const nGrad = ctx.createRadialGradient(
        s.nodeX - nodeR * 0.2, s.nodeY - nodeR * 0.2, nodeR * 0.1,
        s.nodeX, s.nodeY, nodeR,
      );
      nGrad.addColorStop(0, rgba(lerpColor(nColor, [255, 255, 255], 0.3), nodeAlpha * entrance));
      nGrad.addColorStop(0.5, rgba(nColor, nodeAlpha * 0.7 * entrance));
      nGrad.addColorStop(1, rgba(nColor, nodeAlpha * 0.15 * entrance));
      ctx.beginPath();
      ctx.arc(s.nodeX, s.nodeY, nodeR * pulse, 0, Math.PI * 2);
      ctx.fillStyle = nGrad;
      ctx.fill();

      // Phasing ghost trail during tunnel
      if (s.isTunnelling) {
        for (let i = 1; i <= 4; i++) {
          const ghostX = s.nodeX - s.nodeVx * i * 3;
          const ghostAlpha = 0.04 * (1 - i / 5) * entrance;
          ctx.beginPath();
          ctx.arc(ghostX, s.nodeY, nodeR * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = rgba(PHASE_COLOR, ghostAlpha);
          ctx.fill();
        }
      }

      // ── Gentle contact progress arc ───────────────
      if (shimmerProgress > 0 && !s.tunnelled && !s.isTunnelling) {
        const arcR = nodeR + minDim * 0.016;
        const arcAngle = shimmerProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(s.nodeX, s.nodeY, arcR, -Math.PI / 2, -Math.PI / 2 + arcAngle);
        ctx.strokeStyle = rgba(SHIMMER_COLOR, 0.2 * entrance);
        ctx.lineWidth = minDim * 0.003;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ── Resolution glow ───────────────────────────
      if (s.resolveGlow > 0) {
        const rPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.02));
        const rR = minDim * 0.3;
        const rGrad = ctx.createRadialGradient(
          s.nodeX, s.nodeY, 0,
          s.nodeX, s.nodeY, rR,
        );
        rGrad.addColorStop(0, rgba(RESOLVED_GLOW, s.resolveGlow * 0.08 * rPulse * entrance));
        rGrad.addColorStop(0.4, rgba(s.accentRgb, s.resolveGlow * 0.02 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad;
        ctx.fillRect(s.nodeX - rR, s.nodeY - rR, rR * 2, rR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'grab',
        }}
      />
    </div>
  );
}