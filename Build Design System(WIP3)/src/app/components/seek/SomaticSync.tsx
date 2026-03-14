/**
 * SOMATIC SYNC — Entry Block 1B
 *
 * The Baseline Calibration.
 *
 * A slow-expanding rhythmic mesh breathes on the glass at 5.5 BPM.
 * The user must hold the glass and match their presence to the rhythm.
 * When their hold duration aligns with the breath cycle, the mesh
 * coheres and the arc begins.
 *
 * This is not a test. It is a settling. The nervous system must
 * arrive before the mind can receive.
 *
 * Silent Telemetry: measures baseline vagal coherence —
 * how many cycles it takes the user to synchronize.
 * Not success/failure. Just: where are you starting from today?
 *
 * Canvas 2D: concentric breathing ellipses that cohere when held.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { hapticBreathPulse, hapticPressure, hapticResolve } from '../surfaces/haptics';
import { room, font, tracking, typeSize, leading, weight, opacity } from '../design-system/surface-tokens';

const BREATH_CYCLE_MS = 10909; // 5.5 BPM
const CYCLES_TO_SYNC = 2; // 2 full cycles of coherent hold
const SERIF = font.serif;
const SANS = font.sans;

interface SomaticSyncProps {
  width: number;
  height: number;
  title: string;
  essence: string;
  color: string;
  breath: number;
  instruction: string;
  onSync: (cyclesNeeded: number) => void;
}

export function SomaticSync({
  width,
  height,
  title,
  essence,
  color,
  breath,
  instruction,
  onSync,
}: SomaticSyncProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const holdingRef = useRef(false);
  const holdStartRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  const coherenceRef = useRef(0); // 0-1 coherence built through sustained hold
  const cycleCountRef = useRef(0);
  const lastBreathPhaseRef = useRef(0);
  const [coherence, setCoherence] = useState(0);
  const [synced, setSynced] = useState(false);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
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
    const cy = height * 0.44;
    const t = Date.now() * 0.001;
    const [r, g, b] = parseHex(color);
    const coh = coherenceRef.current;

    // Breath phase: 0-1 continuous from the breath cycle
    const elapsed = (Date.now() - mountTimeRef.current) % BREATH_CYCLE_MS;
    const breathPhase = elapsed / BREATH_CYCLE_MS;
    const breathSin = Math.sin(breathPhase * Math.PI * 2);

    // Detect breath cycle completion while holding
    if (holdingRef.current) {
      if (lastBreathPhaseRef.current > 0.8 && breathPhase < 0.2) {
        cycleCountRef.current += 1;
        hapticBreathPulse();
      }
      lastBreathPhaseRef.current = breathPhase;

      // Build coherence based on sustained hold across breath cycles
      const holdDuration = Date.now() - holdStartRef.current;
      const cyclesHeld = holdDuration / BREATH_CYCLE_MS;
      const newCoherence = Math.min(1, cyclesHeld / CYCLES_TO_SYNC);
      coherenceRef.current = newCoherence;
      setCoherence(newCoherence);

      // Haptic escalation synced to breath
      if (Math.abs(breathSin) < 0.1) {
        hapticPressure(newCoherence * 0.5);
      }

      if (newCoherence >= 1 && !synced) {
        setSynced(true);
        hapticResolve();
        const totalCycles = cycleCountRef.current;
        setTimeout(() => onSync(totalCycles), 800);
      }
    } else if (coherenceRef.current > 0) {
      // Decay coherence when not holding
      coherenceRef.current = Math.max(0, coherenceRef.current - 0.005);
      setCoherence(coherenceRef.current);
    }

    // ── Draw breathing mesh rings ──
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
      const ringPhase = breathPhase + (i / ringCount) * 0.4;
      const breathVal = Math.sin(ringPhase * Math.PI * 2);

      // Without coherence: rings are scattered, different phases
      // With coherence: rings align into unified breathing
      const scatter = (1 - coh) * 30;
      const offsetX = Math.sin(t * 0.3 + i * 2.1) * scatter;
      const offsetY = Math.cos(t * 0.4 + i * 1.7) * scatter;

      const baseRadius = 30 + i * 25;
      const breathScale = 1 + breathVal * (0.08 + coh * 0.12);
      const radius = baseRadius * breathScale;

      // Aspect ratio: ellipses become circles as coherence grows
      const aspectY = 0.6 + coh * 0.4;

      ctx.beginPath();
      ctx.ellipse(
        cx + offsetX,
        cy + offsetY,
        radius,
        radius * aspectY,
        0,
        0,
        Math.PI * 2,
      );
      const ringAlpha = (0.03 + coh * 0.06) * (0.7 + breathVal * 0.3);
      ctx.strokeStyle = `rgba(${r},${g},${b},${ringAlpha.toFixed(4)})`;
      ctx.lineWidth = 0.5 + coh * 0.5;
      ctx.stroke();
    }

    // ── Central coherence orb — grows with sync ──
    const orbSize = 3 + coh * 6 + breathSin * (1 + coh * 2);
    const orbGlow = 15 + coh * 35;

    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbGlow);
    glowGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.08 + coh * 0.15).toFixed(4)})`);
    glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, orbGlow, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, orbSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(0.2 + coh * 0.5).toFixed(3)})`;
    ctx.fill();

    // ── Coherence ring — visible as sync builds ──
    if (coh > 0.1) {
      const cohRadius = 20 + coh * 15;
      ctx.beginPath();
      ctx.arc(cx, cy, cohRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * coh);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.1 + coh * 0.15).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // ── Scattered particles that cohere ──
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      // Without coherence: wide orbit. With coherence: tighten to ring
      const orbitRadius = 60 + (1 - coh) * 40 + Math.sin(t * 0.5 + i * 1.3) * (20 * (1 - coh));
      const px = cx + Math.cos(angle + t * 0.2 * (1 - coh * 0.8)) * orbitRadius;
      const py = cy + Math.sin(angle + t * 0.2 * (1 - coh * 0.8)) * orbitRadius * (0.6 + coh * 0.4);
      const pSize = 1 + coh * 0.5;
      const pAlpha = 0.06 + coh * 0.1;

      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${pAlpha.toFixed(4)})`;
      ctx.fill();
    }

    ctx.restore();

    if (!synced) {
      rafRef.current = requestAnimationFrame(render);
    }
  }, [width, height, color, breath, synced, onSync]);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback(() => {
    if (synced) return;
    holdingRef.current = true;
    holdStartRef.current = Date.now();
    lastBreathPhaseRef.current = ((Date.now() - mountTimeRef.current) % BREATH_CYCLE_MS) / BREATH_CYCLE_MS;
  }, [synced]);

  const handlePointerUp = useCallback(() => {
    holdingRef.current = false;
    // Don't reset cycle count — let them resume
  }, []);

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Title */}
      <div
        className="absolute flex flex-col items-center gap-3 pointer-events-none"
        style={{
          top: height * 0.62,
          left: 0,
          right: 0,
          opacity: synced ? 0 : 0.6 + coherence * 0.4,
          transition: synced ? 'opacity 0.8s ease' : 'none',
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
      {!synced && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: holdingRef.current ? 0.04 : 0.1 }}
          transition={{ delay: 1.5, duration: 1 }}
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