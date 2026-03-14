/**
 * SYNC SURFACE — The Physics of Feeling (Scene-Orchestrated)
 *
 * The benchmark room. Strongest authored entrance/mechanic/seal.
 * Minimal copy in live state. Physical interaction carries the meaning.
 *
 * NaviCue Physics:
 *   Mass    — the weight of what you carry (resists motion, builds inertia)
 *   Drag    — viscous resistance (the harder you push, the more it pushes back)
 *   Resolve — the moment mass overcomes drag (snap + release)
 *
 * Scene Lifecycle (orchestrated by useNavicueScene):
 *   1. ATMOSPHERE   → canvas breathes, no copy, no controls
 *   2. ENTRANCE     → canopy floats in, atom materializes, gesture whispers
 *   3. LIVE         → canopy collapses on touch, body takes over
 *   4. RESOLVE      → mass resolves on hold, energy releases
 *   5. SEAL         → receipt appears, neural pathway stamped
 *   6. TRANSITION   → receipt fades, next scene loads
 *   → back to ATMOSPHERE with new navicue copy
 *
 * Copy ownership (§7):
 *   Room owns: canopy, gesture (from navicue scene)
 *   Player owns: receipt, route, ambient
 *
 * Attenuation: fused (canvas links to foreground physics)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { hapticResolve, hapticSeal, hapticTick } from './haptics';
import { useTemperature, shouldShowCopy, governedDuration } from '../design-system/TemperatureGovernor';
import { useSurfaceArrival } from './useSurfaceArrival';
import { useNavicueScene } from './useNavicueScene';
import { governedAcoustic } from './acoustics';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { FORM_PRACTICES } from '../form/form-practices';
import { SEEK_INSIGHTS } from '../seek/seek-insights';
import { readAllKBEProfiles } from '../runtime/useSeekTelemetry';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import { room, font, tracking, typeSize, leading, weight, opacity, timing, glow, signal } from '../design-system/surface-tokens';

// ── NaviCue Physics Constants ──
const MASS_BASE = 1.0;
const DRAG_COEFFICIENT = 0.92;
const RESOLVE_THRESHOLD = 0.6;
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.85;

const PLOT_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
const plotHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

const COORDINATE_COLORS = [
  { id: 'clarity',   color: signal.clarity },
  { id: 'energy',    color: signal.energy },
  { id: 'anchorage', color: signal.anchor },
] as const;

// ── Physics State ──

interface NaviCueState {
  holdProgress: number;
  resolved: boolean;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  tension: number;
}

const INITIAL_CUE: NaviCueState = {
  holdProgress: 0, resolved: false,
  dx: 0, dy: 0, vx: 0, vy: 0, tension: 0,
};

// ── Component ──

interface ActionSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

export function ActionSurface({ mode, breath, onResolve }: ActionSurfaceProps) {
  const userId = useIndividualId();
  const resilience = useResilience();
  const [holding, setHolding] = useState(false);
  const [cue, setCue] = useState<NaviCueState>({ ...INITIAL_CUE });
  const [plotCoords, setPlotCoords] = useState<{ id: string; value: number }[] | null>(null);
  const [temporalDiff, setTemporalDiff] = useState<string | null>(null);
  const [frictionNodeTitle, setFrictionNodeTitle] = useState<string | null>(null);
  const [recommendedPractice, setRecommendedPractice] = useState<{
    id: string; name: string; reason: string; protocol: string;
  } | null>(null);

  const holdStartRef = useRef(0);
  const rafRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const massRef = useRef<HTMLDivElement>(null);

  const { constraints } = useTemperature();
  const { atmosphereMs } = useSurfaceArrival(mode);

  // ═══════════════════════════════════════════════════
  // SCENE ORCHESTRATOR
  // ═══════════════════════════════════════════════════

  const sceneOrch = useNavicueScene(
    mode, plotCoords, userId, atmosphereMs,
    temporalDiff, frictionNodeTitle,
  );
  const { phase, scene, sceneIndex, scenesCompleted, canopy: sceneCanopy } = sceneOrch;

  // Governed hold from scene
  const governedHoldMs = governedDuration(scene.holdDurationMs, constraints);
  const governedResolveThreshold = constraints.band >= 3 ? 0.3 : RESOLVE_THRESHOLD;

  // Reset physics when scene changes
  useEffect(() => {
    setCue({ ...INITIAL_CUE });
    setHolding(false);
    pointerRef.current.active = false;
  }, [sceneIndex]);

  // ═══════════════════════════════════════════════════
  // PLOT LOADING
  // ═══════════════════════════════════════════════════

  useEffect(() => {
    if (mode.id !== 'sync') return;

    // Load coordinates
    fetch(`${PLOT_BASE}/plot/coordinates/${userId}`, { headers: plotHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.found && data.coordinates) {
          setPlotCoords(data.coordinates.map((c: any) => ({ id: c.id, value: c.value })));
        }
      })
      .catch(() => {});

    // Load temporal diff
    fetch(`${PLOT_BASE}/plot/history/${userId}`, { headers: plotHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.history || data.history.length < 2) return;
        const readings = data.history;
        const latest = readings[readings.length - 1];
        const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
        const previous = [...readings].reverse().find(
          (r: any) => r.timestamp < twelveHoursAgo
        );
        if (!previous?.coordinates || !latest?.coordinates) return;

        const deltas = ['clarity', 'energy', 'anchorage'].map(id => {
          const prevVal = previous.coordinates.find((c: any) => c.id === id)?.value ?? 0.5;
          const currVal = latest.coordinates.find((c: any) => c.id === id)?.value ?? 0.5;
          return { id, delta: currVal - prevVal };
        });
        const sorted = [...deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
        const biggest = sorted[0];

        if (Math.abs(biggest.delta) > 0.08) {
          const pct = Math.round(Math.abs(biggest.delta) * 100);
          const label = biggest.id;
          const text = biggest.delta > 0
            ? `Your ${label} has risen ${pct}% since yesterday.`
            : `Your ${label} has dropped ${pct}% since yesterday.`;
          setTemporalDiff(text);
          console.log(`[SYNC] Temporal diff: ${label} Δ${(biggest.delta * 100).toFixed(0)}%`);
        }
      })
      .catch(() => {});
  }, [mode.id]);

  // ═══════════════════════════════════════════════════
  // FORM RECOMMENDATION (SYNC → FORM bridge)
  // ═══════════════════════════════════════════════════

  useEffect(() => {
    if (mode.id !== 'sync') return;
    const timer = setTimeout(async () => {
      try {
        const profiles = await readAllKBEProfiles(userId);
        const frictionInsights: { id: string; integration: number }[] = [];
        if (Array.isArray(profiles)) {
          profiles.forEach((p: any) => {
            if (p?.value?.sessions?.length > 0) {
              const sessions = p.value.sessions;
              const last = sessions[sessions.length - 1];
              const keyParts = (p.key || '').split(':');
              const insightId = keyParts[keyParts.length - 1];
              if (insightId) {
                const integration = (last.knowing || 0) * 0.3 + (last.believing || 0) * 0.5 + Math.min(sessions.length / 10, 1) * 0.2;
                frictionInsights.push({ id: insightId, integration });
              }
            }
          });
        }
        frictionInsights.sort((a, b) => a.integration - b.integration);

        // Surface friction node for canopy personalization
        if (frictionInsights.length > 0 && frictionInsights[0].integration < 0.4) {
          const topFriction = SEEK_INSIGHTS.find(s => s.id === frictionInsights[0].id);
          if (topFriction) setFrictionNodeTitle(topFriction.schema);
        }

        const clarity = plotCoords?.find(c => c.id === 'clarity')?.value ?? 0.5;
        const energy = plotCoords?.find(c => c.id === 'energy')?.value ?? 0.5;
        const anchorage = plotCoords?.find(c => c.id === 'anchorage')?.value ?? 0.5;

        let selectedPractice = FORM_PRACTICES[0];
        let reason = 'The glass suggests this practice.';

        if (anchorage < 0.3) {
          const p = FORM_PRACTICES.find(p => p.protocol === 'parts-unburdening' || p.protocol === 'bilateral-processing');
          if (p) { selectedPractice = p; reason = 'The anchorage is low. The body needs the ground.'; }
        } else if (clarity < 0.3) {
          const p = FORM_PRACTICES.find(p => p.protocol === 'act-defusion');
          if (p) { selectedPractice = p; reason = 'The fog asks for defusion.'; }
        } else if (energy < 0.3) {
          const p = FORM_PRACTICES.find(p => p.protocol === 'bilateral-processing');
          if (p) { selectedPractice = p; reason = 'Low energy. The rhythm carries you.'; }
        } else if (frictionInsights.length > 0 && frictionInsights[0].integration < 0.3) {
          const fId = frictionInsights[0].id;
          const p = FORM_PRACTICES.find(p => p.atomId === fId || p.schema?.toLowerCase().includes(fId.slice(0, 8)));
          if (p) { selectedPractice = p; reason = 'A ghost in the constellation needs attention.'; }
        }

        setRecommendedPractice({
          id: selectedPractice.id, name: selectedPractice.name,
          reason, protocol: selectedPractice.protocol,
        });

        fetch(`${PLOT_BASE}/sync/recommendation`, {
          method: 'POST', headers: plotHeaders(),
          body: JSON.stringify({
            userId, practiceId: selectedPractice.id,
            practiceName: selectedPractice.name, reason,
            plotState: { clarity, energy, anchorage },
            frictionInsights: frictionInsights.slice(0, 3),
          }),
        }).catch(() => {});
      } catch (err) {
        console.error('[SYNC→FORM] Recommendation failed:', err);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [mode.id, plotCoords, userId]);

  // ═══════════════════════════════════════════════════
  // PHYSICS ENGINE
  // ═══════════════════════════════════════════════════

  const physicsLoop = useCallback(() => {
    setCue(prev => {
      if (prev.resolved) return prev;

      let { dx, dy, vx, vy, holdProgress, tension } = prev;
      const mass = MASS_BASE + tension * 0.5;
      const govSpeed = constraints.motionSpeed;

      if (holding) {
        const elapsed = performance.now() - holdStartRef.current;
        holdProgress = Math.min(1, elapsed / governedHoldMs);
        tension = holdProgress;

        if (holdProgress > 0.15 && holdProgress < 0.8) {
          governedAcoustic(constraints.band, 'weight', holdProgress);
        }

        if (pointerRef.current.active && massRef.current) {
          const rect = massRef.current.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const fx = ((pointerRef.current.x - cx) * 0.15 - dx) * SPRING_STIFFNESS / mass;
          const fy = ((pointerRef.current.y - cy) * 0.15 - dy) * SPRING_STIFFNESS / mass;
          vx = (vx + fx) * DRAG_COEFFICIENT * govSpeed;
          vy = (vy + fy) * DRAG_COEFFICIENT * govSpeed;
        }

        if (holdProgress >= governedResolveThreshold) {
          hapticResolve();
          governedAcoustic(constraints.band, 'resolve');
          return { ...prev, holdProgress, tension, dx: dx + vx, dy: dy + vy, vx, vy, resolved: true };
        }
      } else {
        vx = (vx + -dx * SPRING_STIFFNESS) * SPRING_DAMPING * govSpeed;
        vy = (vy + -dy * SPRING_STIFFNESS) * SPRING_DAMPING * govSpeed;
        tension = Math.max(0, tension - 0.02);
        holdProgress = Math.max(0, holdProgress - 0.03);
      }

      return { ...prev, dx: dx + vx, dy: dy + vy, vx, vy, holdProgress, tension, resolved: false };
    });
    rafRef.current = requestAnimationFrame(physicsLoop);
  }, [holding, constraints, governedHoldMs, governedResolveThreshold]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(physicsLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [physicsLoop]);

  // Resolve → scene orchestrator
  useEffect(() => {
    if (cue.resolved && phase === 'live') {
      hapticSeal();
      governedAcoustic(constraints.band, 'seal');
      onResolve?.();
      sceneOrch.resolve();
    }
  }, [cue.resolved, phase]);

  // ═══════════════════════════════════════════════════
  // POINTER HANDLERS
  // ═══════════════════════════════════════════════════

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase === 'seal') { sceneOrch.advanceNow(); return; }
    if (phase === 'transition' || phase === 'resolve') return;
    if (phase === 'entrance' || phase === 'atmosphere') sceneOrch.enterLive();
    setHolding(true);
    holdStartRef.current = performance.now();
    pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
    hapticTick();
    governedAcoustic(constraints.band, 'tick');
  }, [phase, constraints, sceneOrch]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (holding) pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
  }, [holding]);

  const handlePointerUp = useCallback(() => {
    setHolding(false);
    pointerRef.current.active = false;
  }, []);

  // ═══════════════════════════════════════════════════
  // DERIVED VALUES
  // ═══════════════════════════════════════════════════

  const orbScale = 1 + breath * 0.06 + cue.tension * 0.3;
  const glowIntensity = 0.12 + cue.tension * 0.5;
  const refractionRadius = 40 + cue.tension * 80;

  const gestureText = scene.gesture;
  const receiptText = scene.receipt;

  // Phase → visibility
  const showCanopy = phase === 'entrance' && shouldShowCopy('canopy', constraints);
  const showGesture = phase === 'entrance' && shouldShowCopy('gesture', constraints);
  const showAtom = phase !== 'transition';
  const showReceipt = phase === 'seal';

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ cursor: 'default', touchAction: 'none' }}
    >
      {/* ── Scene trace — whisper dots showing continuity ── */}
      <AnimatePresence>
        {scenesCompleted > 0 && phase !== 'transition' && (
          <motion.div
            className="absolute flex items-center gap-1.5"
            style={{ top: '8%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ghost }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            {Array.from({ length: Math.min(scenesCompleted, 7) }).map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 2, height: 2,
                  background: mode.color,
                  opacity: 0.3 + (i / Math.max(1, scenesCompleted - 1)) * 0.4,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Canopy — scene-owned hero line ── */}
      <AnimatePresence mode="wait">
        {showCanopy && (
          <motion.p
            key={`canopy-${sceneIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: opacity.voice, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.4, ease: [0.55, 0, 1, 0.45] } }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
            style={{
              top: '22%',
              fontFamily: font.serif,
              fontSize: typeSize.lede,
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              textAlign: 'center',
              maxWidth: '70%',
              lineHeight: leading.relaxed,
            }}
          >
            {sceneCanopy}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Atom — the NaviCue mass ── */}
      <AnimatePresence mode="wait">
        {showAtom && (
          <motion.div
            key={`atom-${sceneIndex}`}
            ref={massRef}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: cue.resolved ? 0 : 1,
              scale: cue.resolved ? 2.5 : 1,
            }}
            exit={{
              opacity: 0, scale: 0.3, filter: 'blur(12px)',
              transition: { duration: 0.6, ease: [0.55, 0, 1, 0.45] },
            }}
            transition={{
              opacity: { duration: cue.resolved ? 0.8 : 1.8, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: cue.resolved ? 0.6 : 2.2, delay: cue.resolved ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] },
            }}
            className="relative"
            style={{ transform: `translate(${cue.dx}px, ${cue.dy}px)` }}
          >
            {/* Refractive field */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: refractionRadius * 2, height: refractionRadius * 2,
                top: '50%', left: '50%',
                transform: `translate(-50%, -50%) scale(${orbScale})`,
                background: `radial-gradient(circle, ${mode.color}${Math.round(glowIntensity * 20).toString(16).padStart(2, '0')} 0%, ${mode.color}06 40%, transparent 70%)`,
                transition: timing.t.resizeBrisk,
              }}
            />

            {/* PLOT halos */}
            {plotCoords && plotCoords.length > 0 && !cue.resolved && plotCoords.map((coord, i) => {
              const cc = COORDINATE_COLORS.find(c => c.id === coord.id);
              if (!cc) return null;
              const haloRadius = 60 + coord.value * 50 + i * 15;
              const beatPhase = Math.sin(breath * Math.PI * 2 * (0.8 + i * 0.15) + i * 1.2);
              const haloScale = 1 + beatPhase * 0.04 * coord.value;
              const haloOpacity = coord.value * 0.025;
              return (
                <div
                  key={cc.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: haloRadius * 2, height: haloRadius * 2,
                    top: '50%', left: '50%',
                    transform: `translate(-50%, -50%) scale(${haloScale})`,
                    background: `radial-gradient(circle, ${cc.color}${Math.round(haloOpacity * 255).toString(16).padStart(2, '0')} 0%, ${cc.color}${Math.round(haloOpacity * 0.3 * 255).toString(16).padStart(2, '0')} 50%, transparent 75%)`,
                    transition: timing.t.easeAtmosphere,
                  }}
                />
              );
            })}

            {/* Core mass */}
            <div
              className="rounded-full relative"
              style={{
                width: 48, height: 48,
                background: `radial-gradient(circle at 38% 38%, ${mode.color}40, ${mode.color}18 55%, transparent 100%)`,
                boxShadow: `0 0 ${30 + cue.tension * 40}px ${mode.color}${Math.round((0.08 + cue.tension * 0.25) * 255).toString(16).padStart(2, '0')}, inset 0 0 20px ${mode.color}08`,
                transform: `scale(${orbScale})`,
                transition: `transform ${timing.dur.snap} linear`,
              }}
            />

            {/* Tension ring */}
            {cue.tension > 0.05 && (
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 64 + cue.tension * 24, height: 64 + cue.tension * 24,
                  top: '50%', left: '50%',
                  transform: `translate(-50%, -50%) scale(${orbScale})`,
                  background: `radial-gradient(circle, transparent 60%, ${mode.color}${Math.round(cue.tension * 12).toString(16).padStart(2, '0')} 80%, transparent 100%)`,
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resolve particle ── */}
      <AnimatePresence>
        {cue.resolved && phase !== 'transition' && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 48, height: 48,
              background: `radial-gradient(circle, ${mode.color}30 0%, ${mode.color}08 40%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Gesture — scene-owned action whisper ── */}
      <AnimatePresence>
        {showGesture && (
          <motion.div
            key={`gesture-${sceneIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 1.8, delay: 0.6 }}
            className="absolute flex items-center gap-2"
            style={{ bottom: '28%' }}
          >
            <span
              className="rounded-full"
              style={{
                width: 3, height: 3,
                background: mode.color,
                boxShadow: glow.soft(mode.color, '60'),
                opacity: opacity.strong,
              }}
            />
            <span
              style={{
                fontSize: typeSize.detail,
                fontWeight: weight.medium,
                letterSpacing: tracking.normal,
                textTransform: 'uppercase',
                color: mode.color,
                opacity: opacity.quiet,
              }}
            >
              {gestureText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="sync" />

      {/* ── Seal receipt ── */}
      <AnimatePresence mode="wait">
        {showReceipt && (
          <motion.div
            key={`receipt-${sceneIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: opacity.gentle, y: 0 }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.5 } }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute flex flex-col items-center gap-3"
          >
            <div
              className="rounded-full"
              style={{
                width: 4, height: 4,
                background: mode.color,
                boxShadow: glow.halo(mode.color),
              }}
            />
            <span
              style={{
                fontFamily: font.serif,
                fontSize: typeSize.small,
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: room.fg,
                opacity: opacity.steady,
              }}
            >
              {receiptText}
            </span>

            {/* FORM recommendation — first scene only */}
            {recommendedPractice && scenesCompleted === 0 && (
              <motion.div
                className="flex flex-col items-center gap-2 mt-3"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.detail,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.normal,
                    textTransform: 'uppercase',
                    color: room.fg,
                    opacity: opacity.present,
                    textAlign: 'center',
                    maxWidth: '65vw',
                    lineHeight: leading.body,
                  }}
                >
                  {recommendedPractice.reason}
                </span>
                <span
                  style={{
                    fontSize: typeSize.small,
                    fontWeight: weight.light,
                    letterSpacing: tracking.normal,
                    textTransform: 'uppercase',
                    color: mode.color,
                    opacity: opacity.quiet,
                  }}
                >
                  FORM → {recommendedPractice.name.toUpperCase()}
                </span>
              </motion.div>
            )}

            {/* Scene route whisper */}
            {scene.route && (
              <motion.div
                className="flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
              >
                <span className="rounded-full" style={{ width: 2, height: 2, background: mode.color, opacity: opacity.spoken }} />
                <span style={{ fontSize: typeSize.detail, fontWeight: weight.regular, letterSpacing: tracking.body, color: mode.color, opacity: opacity.ghost }}>
                  {scene.route.label || scene.route.target}
                </span>
              </motion.div>
            )}

            {/* Advance hint */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: opacity.ghost }}
              transition={{ delay: 3.5, duration: 1.5 }}
              style={{
                fontSize: typeSize.label,
                fontWeight: weight.regular,
                letterSpacing: tracking.code,
                color: room.gray2,
                marginTop: 8,
              }}
            >
              touch to continue
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transition dissolve ── */}
      <AnimatePresence>
        {phase === 'transition' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${mode.color}06 0%, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
