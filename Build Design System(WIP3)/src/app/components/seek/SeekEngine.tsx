/**
 * SEEK ENGINE — The Cinematic Orchestrator
 *
 * Takes an insight (a JSON payload of block selections) and renders
 * it as a micro-intense interactive documentary. The engine manages:
 *
 *   - Scene sequencing with cinematic transitions
 *   - Block rendering (entry, transfer, ascertainment)
 *   - Atom atmospheric binding per scene
 *   - Silent telemetry collection
 *   - KBE score aggregation
 *
 * The engine is the chassis. The blocks are the wheels.
 * The insight is the destination.
 */

import { useState, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SeekInsight, SeekScene, SeekTelemetry, SeekPhase } from './seek-types';
import type { AtomProps } from '../atoms/types';
import { hapticSeal, hapticTick } from '../surfaces/haptics';

import { ThresholdLock } from './ThresholdLock';
import { FocalLens } from './FocalLens';
import { DepthDescent } from './DepthDescent';
import { PendulumPan } from './PendulumPan';
import { FocusPull } from './FocusPull';
import { GravityDrag } from './GravityDrag';
import { RippleRadius } from './RippleRadius';
import { SomaticSync } from './SomaticSync';
import { KineticClear } from './KineticClear';
import { TopographyDrop } from './TopographyDrop';
import { TensionTether } from './TensionTether';
import { SomaticGate } from './SomaticGate';

import { room, font, tracking, typeSize, weight, opacity, timing, glow, radii, glaze, layer } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const BREATH_CYCLE_MS = 10909; // 5.5 BPM — matches SomaticSync

// Lazy atom components
const atomComponents: Record<string, React.LazyExoticComponent<React.ComponentType<AtomProps>>> = {
  'somatic-resonance': lazy(() => import('../atoms/somatic-resonance')),
  'wave-collapse': lazy(() => import('../atoms/wave-collapse')),
  'dark-matter': lazy(() => import('../atoms/dark-matter')),
  'mycelial-routing': lazy(() => import('../atoms/mycelial-routing')),
  'phoenix-ash': lazy(() => import('../atoms/phoenix-ash')),
  'cymatic-coherence': lazy(() => import('../atoms/cymatic-coherence')),
  'future-memory': lazy(() => import('../atoms/future-memory')),
};

interface SeekEngineProps {
  insight: SeekInsight;
  breath: number;
  viewport: { width: number; height: number };
  onComplete?: (telemetry: SeekTelemetry) => void;
  onExit?: () => void;
}

export function SeekEngine({
  insight,
  breath,
  viewport,
  onComplete,
  onExit,
}: SeekEngineProps) {
  const [phase, setPhase] = useState<SeekPhase>('entry');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Telemetry accumulator
  const telemetryRef = useRef<Partial<SeekTelemetry>>({
    insightId: insight.id,
    entryFrictionMs: 0,
    sectionPacingMs: [],
    knowingScore: 0,
    believingScore: 0,
    embodyingLocation: null,
    rippleRadius: 0,
    totalDurationMs: 0,
    timestamp: Date.now(),
  });

  const startTimeRef = useRef(Date.now());

  const currentScene = insight.scenes[sceneIndex];
  const totalScenes = insight.scenes.length;

  // Atom for current scene
  const atomId = currentScene?.atomId || insight.atomId;
  const AtomComponent = atomComponents[atomId];
  const intensity = currentScene?.atmosphereIntensity ?? 0.3;

  const noop = useCallback(() => {}, []);
  const noopState = useCallback((_v: number) => {}, []);

  // ── Advance to next scene ──
  const advanceScene = useCallback(() => {
    const nextIndex = sceneIndex + 1;
    hapticTick();

    if (nextIndex >= totalScenes) {
      // Arc complete
      setPhase('integrating');
      hapticSeal();

      const tel = telemetryRef.current;
      tel.totalDurationMs = Date.now() - startTimeRef.current;
      tel.timestamp = Date.now();

      setTimeout(() => {
        setPhase('sealed');
        onComplete?.(tel as SeekTelemetry);
      }, 2000);
      return;
    }

    // Cinematic transition
    setTransitioning(true);
    setTimeout(() => {
      setSceneIndex(nextIndex);
      const nextScene = insight.scenes[nextIndex];
      if (nextScene) {
        setPhase(
          nextScene.phase === 'entry' ? 'entry'
            : nextScene.phase === 'transfer' ? 'transferring'
              : 'ascending'
        );
      }
      setTimeout(() => setTransitioning(false), 100);
    }, 800);
  }, [sceneIndex, totalScenes, insight.scenes, onComplete]);

  // ── Scene block renderer ──
  const renderScene = useMemo(() => {
    if (!currentScene || transitioning) return null;

    const commonProps = {
      color: insight.color,
      breath,
      width: viewport.width,
      height: viewport.height,
    };

    switch (currentScene.blockType) {
      case 'threshold-lock':
        return (
          <ThresholdLock
            {...commonProps}
            title={currentScene.copy}
            essence={currentScene.subCopy || insight.essence}
            instruction={currentScene.instruction || 'PRESS AND HOLD TO BEGIN'}
            onUnlock={(frictionMs) => {
              telemetryRef.current.entryFrictionMs = frictionMs;
              advanceScene();
            }}
          />
        );

      case 'focal-lens':
        return (
          <FocalLens
            {...commonProps}
            copy={currentScene.copy}
            sections={currentScene.sections || []}
            instruction={currentScene.instruction || 'DRAG TO ILLUMINATE'}
            onComplete={(pacingMs) => {
              telemetryRef.current.sectionPacingMs = [
                ...(telemetryRef.current.sectionPacingMs || []),
                ...pacingMs,
              ];
              advanceScene();
            }}
          />
        );

      case 'depth-descent':
        return (
          <DepthDescent
            {...commonProps}
            copy={currentScene.copy}
            sections={currentScene.sections || []}
            instruction={currentScene.instruction || 'PULL TOWARD YOU'}
            onComplete={(pacingMs) => {
              telemetryRef.current.sectionPacingMs = [
                ...(telemetryRef.current.sectionPacingMs || []),
                ...pacingMs,
              ];
              advanceScene();
            }}
          />
        );

      case 'pendulum-pan':
        return (
          <PendulumPan
            {...commonProps}
            copy={currentScene.copy}
            dualCopy={currentScene.dualCopy || ''}
            instruction={currentScene.instruction || 'SHIFT BETWEEN TRUTHS'}
            onComplete={(leftMs, rightMs) => {
              telemetryRef.current.sectionPacingMs = [
                ...(telemetryRef.current.sectionPacingMs || []),
                leftMs,
                rightMs,
              ];
              advanceScene();
            }}
          />
        );

      case 'focus-pull':
        return (
          <FocusPull
            {...commonProps}
            copy={currentScene.copy}
            prompt={currentScene.prompt || ''}
            instruction={currentScene.instruction || 'SHARPEN THE TRUTH'}
            onComplete={(score) => {
              telemetryRef.current.knowingScore = score;
              advanceScene();
            }}
          />
        );

      case 'gravity-drag':
        return (
          <GravityDrag
            {...commonProps}
            copy={currentScene.copy}
            prompt={currentScene.prompt || ''}
            instruction={currentScene.instruction || 'LIFT THE TRUTH'}
            onComplete={(score) => {
              telemetryRef.current.believingScore = score;
              advanceScene();
            }}
          />
        );

      case 'ripple-radius':
        return (
          <RippleRadius
            {...commonProps}
            copy={currentScene.copy}
            prompt={currentScene.prompt || ''}
            instruction={currentScene.instruction || 'HOLD AND EXPAND'}
            onComplete={(radius) => {
              telemetryRef.current.rippleRadius = radius;
              advanceScene();
            }}
          />
        );

      case 'somatic-sync':
        return (
          <SomaticSync
            {...commonProps}
            title={currentScene.copy}
            essence={currentScene.subCopy || insight.essence}
            instruction={currentScene.instruction || 'HOLD AND BREATHE WITH THE GLASS'}
            onSync={(cyclesNeeded) => {
              telemetryRef.current.entryFrictionMs = cyclesNeeded * BREATH_CYCLE_MS;
              advanceScene();
            }}
          />
        );

      case 'kinetic-clear':
        return (
          <KineticClear
            {...commonProps}
            title={currentScene.copy}
            essence={currentScene.subCopy || insight.essence}
            instruction={currentScene.instruction || 'CLEAR THE GLASS'}
            onClear={(velocity, durationMs) => {
              telemetryRef.current.entryFrictionMs = durationMs;
              telemetryRef.current.sectionPacingMs = [
                ...(telemetryRef.current.sectionPacingMs || []),
                durationMs,
              ];
              advanceScene();
            }}
          />
        );

      case 'topography-drop':
        return (
          <TopographyDrop
            {...commonProps}
            copy={currentScene.copy}
            prompt={currentScene.prompt || ''}
            instruction={currentScene.instruction || 'PLACE THE LIGHT'}
            onComplete={(location) => {
              telemetryRef.current.embodyingLocation = { x: location.x, y: location.y };
              advanceScene();
            }}
          />
        );

      case 'tension-tether':
        return (
          <TensionTether
            {...commonProps}
            copy={currentScene.copy}
            prompt={currentScene.prompt || ''}
            instruction={currentScene.instruction || 'PULL AND RELEASE'}
            onComplete={(score) => {
              telemetryRef.current.believingScore = score;
              advanceScene();
            }}
          />
        );

      case 'somatic-gate':
        return (
          <SomaticGate
            {...commonProps}
            copy={currentScene.copy}
            instruction={currentScene.instruction || 'HOLD TO PASS THROUGH'}
            onGateOpen={(holdMs) => {
              telemetryRef.current.sectionPacingMs = [
                ...(telemetryRef.current.sectionPacingMs || []),
                holdMs,
              ];
              advanceScene();
            }}
          />
        );

      default:
        return null;
    }
  }, [currentScene, transitioning, insight, breath, viewport, advanceScene]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      {/* ═══ BACKGROUND ═══ */}
      <div className="absolute inset-0" style={{ background: room.void }} />

      {/* Atmospheric glow — intensity modulated per scene */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 42%, ${insight.color}${Math.round(intensity * 6).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          transition: timing.t.fadeFilterAtmosphere,
        }}
      />

      {/* ═══ ATOM CANVAS — z:1 ═══ */}
      {AtomComponent && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: layer.base,
            opacity: atomMod.canvasOpacity,
            filter: `saturate(${0.5 + intensity * 0.3})`,
            transition: timing.t.fadeFilterAtmosphere,
          }}
        >
          <Suspense fallback={null}>
            <AtomComponent
              breathAmplitude={breath * (0.3 + intensity * 0.4)}
              reducedMotion={false}
              color={insight.color}
              accentColor={insight.accentColor}
              viewport={viewport}
              phase="active"
              onHaptic={noop}
              onStateChange={noopState}
              onResolve={noop}
            />
          </Suspense>
        </div>
      )}

      {/* ═══ SCENE LAYER — z:3 ═══ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: layer.raised }}>
        {/* Transition overlay */}
        <AnimatePresence>
          {transitioning && (
            <motion.div
              className="absolute inset-0"
              style={{ background: room.void, zIndex: layer.pinnacle }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>

        {/* Active scene */}
        <AnimatePresence mode="wait">
          {renderScene && phase !== 'sealed' && phase !== 'integrating' && (
            <motion.div
              key={`scene-${sceneIndex}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderScene}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Integration state — the truth settles */}
        <AnimatePresence>
          {phase === 'integrating' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center gap-6">
                <div
                  className="rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    background: insight.color,
                    boxShadow: glow.halo(insight.color, 16, 32, '30', '10'),
                  }}
                />
                <p style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.small,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: room.fg,
                  opacity: opacity.gentle,
                  textAlign: 'center',
                  maxWidth: '60%',
                }}>
                  The light has been cast.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sealed state */}
        <AnimatePresence>
          {phase === 'sealed' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center gap-6">
                <div
                  className="rounded-full"
                  style={{
                    width: 3,
                    height: 3,
                    background: insight.color,
                    boxShadow: glow.mid(insight.color, '25'),
                  }}
                />
                <p style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.note,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: room.fg,
                  opacity: opacity.present,
                }}>
                  The arc is complete.
                </p>
                {onExit && (
                  <motion.button
                    className="cursor-pointer"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: SANS,
                      fontSize: typeSize.micro,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.normal,
                      textTransform: 'uppercase',
                      color: insight.color,
                      opacity: opacity.ambient,
                      marginTop: 12,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: opacity.ambient }}
                    transition={{ delay: 1.5, duration: 1 }}
                    onClick={onExit}
                  >
                    RETURN
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ SCENE PROGRESS — z:4 ═══ */}
      {phase !== 'sealed' && phase !== 'integrating' && (
        <div
          className="absolute flex items-center gap-1 justify-center pointer-events-none"
          style={{ bottom: 100, left: 0, right: 0, zIndex: layer.overlay }}
        >
          {insight.scenes.map((_, i) => {
            const scene = insight.scenes[i];
            const isPhaseTransition = i > 0 && scene.phase !== insight.scenes[i - 1].phase;
            return (
              <div key={i} className="flex items-center gap-1">
                {isPhaseTransition && (
                  <div style={{
                    width: 4,
                    height: 0.5,
                    background: glaze.thin,
                    marginRight: 2,
                  }} />
                )}
                <div
                  style={{
                    width: i === sceneIndex ? 10 : 3,
                    height: 2,
                    borderRadius: radii.dot,
                    background: i === sceneIndex
                      ? insight.color
                      : i < sceneIndex
                        ? glaze.glint
                        : glaze.thin,
                    opacity: i === sceneIndex ? 0.35 : 1,
                    transition: timing.t.settle,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Phase label */}
      {phase !== 'sealed' && phase !== 'integrating' && currentScene && (
        <div
          className="absolute pointer-events-none"
          style={{ top: '4%', left: 0, right: 0, textAlign: 'center', zIndex: layer.overlay, opacity: opacity.ghost }}
        >
          <span style={{
            fontFamily: SANS,
            fontSize: typeSize.whisper,
            fontWeight: weight.medium,
            letterSpacing: tracking.normal,
            textTransform: 'uppercase',
            color: room.fg,
          }}>
            {currentScene.phase === 'entry' ? 'THRESHOLD'
              : currentScene.blockType === 'somatic-gate' ? 'SOMATIC GATE'
              : currentScene.phase === 'transfer' ? 'ILLUMINATION'
                : currentScene.kbeDimension === 'knowing' ? 'KNOWING'
                  : currentScene.kbeDimension === 'believing' ? 'BELIEVING'
                    : 'EMBODYING'}
          </span>
        </div>
      )}
    </div>
  );
}