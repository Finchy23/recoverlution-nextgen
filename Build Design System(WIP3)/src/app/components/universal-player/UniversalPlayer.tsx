/**
 * THE UNIVERSAL PLAYER — The Three-Tier Architecture
 *
 * One piece of glass. One anchor. One stream. Infinite possibilities.
 *
 * The entire operating system is reduced to three spatial dimensions:
 *   The Surface (The Present)  — edge-to-edge glass where healing takes place
 *   The Anchor  (The Hand)     — a single focal well at the base
 *   The Stream  (The Beneath)  — a hidden surface of purpose, pulled into view
 *
 * You do not navigate this system by clicking through menus.
 * You simply shift your state.
 *
 * HOME STATE: CUEs flow through the glass. Each CUE is a somatic
 * intervention — an atom and its copy. There is no progress indicator.
 * There is no destination. Only this atom. Only this breath. Only now.
 *
 * SURFACES: Tap the anchor to open a surface. The surface IS the room.
 * When a surface resolves, you return to the CUE river.
 *
 * The Stream lives beneath the glass. Swipe up from the orb to reveal it.
 * Swipe down to return. One glass, two faces.
 *
 * Wired systems:
 *   Neuroadaptive Sensing → suggestedBand feeds setNeuroadaptiveBand
 *   Sequence Thermodynamics → each mode auto-starts its therapeutic arc
 *   Governors Debug Overlay → visualizes arousal, sources, arc state
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassSurface } from '../design-system/GlassSurface';
import { PlayerAnchor } from './PlayerAnchor';
import { PlayerStream } from './PlayerStream';
import { useSealAndCarry } from './PlayerStream';
import { anchorModes, getModeById, type SurfaceMode } from './surface-modes';
import type { Device } from '../design-system/surface-engine';
import { useTemperature } from '../design-system/TemperatureGovernor';
import { governedAcoustic } from '../surfaces/acoustics';
import { useNeuroadaptiveSensing } from '../design-system/NeuroadaptiveSensing';
import { useSequenceEngine, arcPatterns } from '../design-system/SequenceThermodynamics';

// Surface content components — mapped to the new taxonomy
import { ActionSurface } from '../surfaces/ActionSurface';       // SYNC
import { TalkSurface } from '../surfaces/TalkSurface';           // TALK
import { PlaySurface } from '../surfaces/PlaySurface';           // PLAY
import { TuneSurface } from '../surfaces/TuneSurface';           // TUNE (discovery tuner — the frequency dial)
import { KnowSurface } from '../surfaces/KnowSurface';           // KNOW (parent — sanctuary entry)
import { ReadSurface } from '../surfaces/ReadSurface';           // READ (KNOW→)
import { SeekSurface } from '../surfaces/SeekSurface';           // SEEK (KNOW→ spatial documentary)
import { FormSurface } from '../surfaces/FormSurface';           // FORM (KNOW→)
import { PlotSurface } from '../surfaces/PlotSurface';           // PLOT (ECHO→)
import { MapSurface } from '../surfaces/MapSurface';             // ∞MAP (ECHO→)
import { LinkSurface } from '../surfaces/LinkSurface';           // LINK (ECHO→)
import { ControlSurface } from '../surfaces/ControlSurface';     // ECHO (parent, uses Control DNA)

import { SURFACE_EASE, SURFACE_DURATION } from '../surfaces/useSurfaceArrival';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, glow, radii, glaze, refract, layer } from '../design-system/surface-tokens';
import { CueEngine } from '../cues/CueEngine';
import { CompositionEngine } from '../cues/CompositionEngine';
import type { Composition } from '../cues/composition-types';
import type { CompositionSessionRecord } from '../cues/CompositionEngine';

interface UniversalPlayerProps {
  /** Initial mode */
  initialMode?: string;
  /** Device form factor */
  device?: Device;
  /** Called when mode changes */
  onModeChange?: (mode: SurfaceMode) => void;
  /** Show design system overlay info */
  showSystemInfo?: boolean;
  /** When provided, plays this composition instead of the CueEngine loop */
  composition?: Composition;
  /** Called when a composition finishes playing */
  onCompositionComplete?: (record: CompositionSessionRecord) => void;
  /** Called when the current atom's color changes during composition playback */
  onAtomColorChange?: (color: string, accentColor: string) => void;
}

function getSurfaceContent(
  mode: SurfaceMode,
  breath: number,
  onResolve?: () => void,
  onNavigateToChild?: (childId: string) => void,
) {
  switch (mode.id) {
    // The default surface — SYNC is home
    case 'sync':    return <ActionSurface mode={mode} breath={breath} onResolve={onResolve} />;
    // Anchor constellation — primary modes
    case 'talk':    return <TalkSurface mode={mode} breath={breath} onResolve={onResolve} onNavigate={onNavigateToChild} />;
    case 'play':    return <PlaySurface mode={mode} breath={breath} onResolve={onResolve} />;
    case 'tune':    return <TuneSurface mode={mode} breath={breath} onResolve={onResolve} />;
    // KNOW and its children
    case 'know':    return <KnowSurface mode={mode} breath={breath} onResolve={onResolve} onNavigateToChild={onNavigateToChild} />;
    case 'read':    return <ReadSurface mode={mode} breath={breath} onResolve={onResolve} onNavigate={onNavigateToChild} />;
    case 'seek':    return <SeekSurface mode={mode} breath={breath} onResolve={onResolve} />;
    case 'form':    return <FormSurface mode={mode} breath={breath} onResolve={onResolve} />;
    // ECHO and its children
    case 'echo':    return <ControlSurface mode={mode} breath={breath} onResolve={onResolve} />;
    case 'plot':    return <PlotSurface mode={mode} breath={breath} onResolve={onResolve} onNavigate={onNavigateToChild} />;
    case 'map':     return <MapSurface mode={mode} breath={breath} onResolve={onResolve} onNavigate={onNavigateToChild} />;
    case 'link':    return <LinkSurface mode={mode} breath={breath} onResolve={onResolve} />;
    // Fallback — always SYNC
    default:        return <ActionSurface mode={mode} breath={breath} onResolve={onResolve} />;
  }
}

// ─── Source color mapping for the overlay ───
const sourceColors: Record<string, string> = {
  manual: colors.brand.purple.mid,
  neuroadaptive: colors.accent.cyan.primary,
  hardware: colors.status.amber.bright,
};

// ─── Governors Debug Overlay ───
function GovernorsOverlay({
  activeMode,
  arousal,
  neuroadaptiveBand,
  temperature,
  sequence,
}: {
  activeMode: SurfaceMode;
  arousal: number;
  neuroadaptiveBand: number;
  temperature: ReturnType<typeof useTemperature>;
  sequence: ReturnType<typeof useSequenceEngine>;
}) {
  const { manualBand, hardwareFloor, effectiveBand, dominantSource } = temperature;

  return (
    <div className="space-y-2">
      {/* Arousal meter — continuous bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span style={{ fontSize: typeSize.label, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase', color: room.gray1 }}>
            arousal
          </span>
          <span style={{ fontSize: typeSize.caption, fontFamily: font.mono, color: colors.accent.cyan.primary, opacity: opacity.bright }}>
            {(arousal * 100).toFixed(0)}%
          </span>
        </div>
        <div className="relative w-full overflow-hidden rounded-full" style={{ height: 3, background: glaze.thin }}>
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${colors.accent.cyan.primary}40, ${colors.accent.cyan.primary})` }}
            animate={{ width: `${arousal * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Three-source temperature readout */}
      <div className="flex gap-4">
        {[
          { label: 'manual', value: manualBand, color: sourceColors.manual },
          { label: 'neuro', value: neuroadaptiveBand, color: sourceColors.neuroadaptive },
          { label: 'hardware', value: hardwareFloor, color: sourceColors.hardware },
        ].map(src => (
          <div key={src.label} className="flex items-center gap-1.5">
            <span
              className="rounded-full"
              style={{
                width: dominantSource === (src.label === 'neuro' ? 'neuroadaptive' : src.label) ? 4 : 3,
                height: dominantSource === (src.label === 'neuro' ? 'neuroadaptive' : src.label) ? 4 : 3,
                background: src.color,
                opacity: dominantSource === (src.label === 'neuro' ? 'neuroadaptive' : src.label) ? opacity.clear : opacity.spoken,
                boxShadow: dominantSource === (src.label === 'neuro' ? 'neuroadaptive' : src.label)
                  ? glow.dot(src.color, '50')
                  : 'none',
                transition: timing.t.easeRespond,
              }}
            />
            <span style={{
              fontSize: typeSize.label,
              fontFamily: font.mono,
              color: dominantSource === (src.label === 'neuro' ? 'neuroadaptive' : src.label) ? src.color : room.gray1,
              opacity: dominantSource === (src.label === 'neuro' ? 'neuroadaptive' : src.label) ? opacity.clear : opacity.steady,
              transition: timing.t.easeRespond,
            }}>
              {src.label} {src.value}
            </span>
          </div>
        ))}
      </div>

      {/* Effective band + dominant source */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: typeSize.label, fontFamily: font.mono, color: room.gray2 }}>
          band
        </span>
        <span style={{
          fontSize: typeSize.reading,
          fontFamily: font.serif,
          fontWeight: weight.medium,
          color: sourceColors[dominantSource],
          transition: `color ${timing.dur.mid}`,
        }}>
          {effectiveBand}
        </span>
        <span style={{
          fontSize: typeSize.label,
          fontWeight: weight.medium,
          letterSpacing: tracking.label,
          textTransform: 'uppercase',
          color: sourceColors[dominantSource],
          opacity: opacity.body,
          transition: `color ${timing.dur.mid}`,
        }}>
          {dominantSource}
        </span>
      </div>

      {/* Sequence thermodynamics state */}
      {sequence.playing && sequence.activePattern && (
        <div className="flex items-center gap-2">
          <span
            className="rounded-full"
            style={{
              width: 3, height: 3,
              background: colors.status.green.bright,
              boxShadow: glow.dot(glass(colors.status.green.bright, 0.4)),
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: typeSize.label, fontFamily: font.mono, color: colors.status.green.bright, opacity: opacity.strong }}>
            {arcPatterns[sequence.activePattern].label}
          </span>
          <span style={{ fontSize: typeSize.label, fontFamily: font.mono, color: room.gray1 }}>
            kf {sequence.currentKeyframe + 1}/{arcPatterns[sequence.activePattern].keyframes.length}
          </span>
          {/* Progress bar for current keyframe */}
          <div className="relative overflow-hidden rounded-full" style={{ width: 32, height: 2, background: glaze.thin }}>
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${sequence.holdProgress * 100}%`,
                background: colors.status.green.bright,
                opacity: opacity.body,
                transition: `width ${timing.dur.instant} linear`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function UniversalPlayer({
  initialMode = 'sync',
  device = 'phone',
  onModeChange,
  showSystemInfo = false,
  composition,
  onCompositionComplete,
  onAtomColorChange,
}: UniversalPlayerProps) {
  const [activeId, setActiveId] = useState(initialMode);
  const [streamOpen, setStreamOpen] = useState(false);
  const [inCueFlow, setInCueFlow] = useState(true); // CUEs are home
  const activeMode = getModeById(activeId);
  const { traces, addTrace } = useSealAndCarry();
  const prevModeRef = useRef<SurfaceMode | null>(null);
  const temperature = useTemperature();
  const isFirstRender = useRef(true);
  const lastPointerRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // ── Neuroadaptive Sensing → Temperature feedback loop ──
  const neuroadaptiveSensing = useNeuroadaptiveSensing(
    // onBandChange: push suggested band into the temperature provider
    (band) => { temperature.setNeuroadaptiveBand(band); }
  );

  // ── Sequence Thermodynamics → Temperature arc driver ──
  const sequenceEngine = useSequenceEngine(
    // onBandChange: sequence arc pushes manual band (it IS the room's intention)
    (band) => { temperature.setHeatBand(band); }
  );

  // ── Pointer velocity tracking → Neuroadaptive motion signal ──
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const now = performance.now();
    const prev = lastPointerRef.current;
    if (prev) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      const dt = Math.max(1, now - prev.t); // ms since last sample
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = (distance / dt) * 1000; // px/s
      // Only emit if there's meaningful movement (debounce noise)
      if (velocity > 50) {
        neuroadaptiveSensing.signal({ type: 'pointerMove', velocity });
      }
    }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, t: now };
  }, [neuroadaptiveSensing]);

  // ─ Auto-start therapeutic arc when mode changes ──
  useEffect(() => {
    // Skip initial render to avoid playing arc on first load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Stop any running sequence
    sequenceEngine.stop();

    // Start the mode's arc pattern after the mode transition settles
    if (activeMode.arcPattern) {
      const delay = 300 + 800; // atmosphere (300ms unified) + settle before arc starts
      const timer = setTimeout(() => {
        sequenceEngine.play(activeMode.arcPattern!);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [activeId]); // intentionally only depends on activeId to avoid stale closures

  const handleModeSelect = useCallback((id: string) => {
    if (id === activeId && !inCueFlow) return;
    // Neuroadaptive: mode shift is a cognitive load signal
    neuroadaptiveSensing.signal({ type: 'modeShift' });
    // Acoustic mode shift sound
    governedAcoustic(temperature.constraints.band, 'modeShift');
    // Seal & Carry: the departing room leaves a trace particle
    if (!inCueFlow) {
      const departingMode = getModeById(activeId);
      if (departingMode) {
        prevModeRef.current = departingMode;
        const traceText = departingMode.streamFragments[
          Math.floor(Math.random() * departingMode.streamFragments.length)
        ];
        addTrace(traceText, departingMode.color);
      }
    }
    // Exit CUE flow → enter surface
    setInCueFlow(false);
    setActiveId(id);
    const newMode = getModeById(id);
    onModeChange?.(newMode);
  }, [activeId, inCueFlow, onModeChange, addTrace, temperature, neuroadaptiveSensing]);

  const handleResolve = useCallback(() => {
    // Neuroadaptive: resolve is a regulation signal (cooling)
    neuroadaptiveSensing.signal({ type: 'resolve' });
    const currentMode = getModeById(activeId);
    if (currentMode) {
      addTrace('The weight moved.', currentMode.color);
    }
    // Return to CUE flow — the surface resolves back to the river
    setInCueFlow(true);
  }, [activeId, addTrace, neuroadaptiveSensing]);

  return (
    <div className="relative w-full h-full flex items-center justify-center" onPointerMove={handlePointerMove}>
      {/* The Surface — the GlassSurface IS the experience */}
      <div className="relative" style={{
        width: device === 'phone' ? 'min(380px, 88vw)' : '100%',
        height: device === 'phone' ? 'min(740px, 100%)' : '100%',
        maxHeight: '100%',
      }}>
        <GlassSurface
          interactionId={activeMode.interaction}
          motionId={activeMode.motion}
          atmosphereId={activeMode.atmosphere}
          temperatureId={`band-${temperature.effectiveBand}`}
          colorId={activeMode.colorSignature}
          device={device}
          attenuationId={activeMode.attenuation}
          overlay={({ breath, atmosphere, isPhone }) => (
            <>
              {/* The Stream — always available, the beneath of the glass */}
              <PlayerStream
                fragments={activeMode.streamFragments}
                color={activeMode.color}
                traces={traces}
                open={streamOpen}
                onOpen={() => setStreamOpen(true)}
                onClose={() => setStreamOpen(false)}
              />

              {/* Content — Composition, CUE flow, or Surface */}
              <AnimatePresence mode="wait">
                {inCueFlow ? (
                  <motion.div
                    key={composition ? `comp-${composition.id}` : 'cue-flow'}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: refract.gentle }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ zIndex: layer.playerBase }}
                  >
                    {composition ? (
                      <CompositionEngine
                        composition={composition}
                        breath={breath}
                        onAtomColorChange={onAtomColorChange}
                        onComplete={(record) => onCompositionComplete?.(record)}
                      />
                    ) : (
                      <CueEngine breath={breath} />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeMode.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 0.985, filter: refract.medium }}
                    animate={{ opacity: 1, scale: 1, filter: refract.clear }}
                    exit={{ opacity: 0, scale: 1.01, filter: refract.gentle }}
                    transition={{
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.6 },
                    }}
                    style={{ zIndex: layer.playerBase }}
                  >
                    {getSurfaceContent(activeMode, breath, handleResolve, handleModeSelect)}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Anchor — the only permanent element */}
              <PlayerAnchor
                modes={anchorModes}
                activeId={inCueFlow ? '' : activeId}
                onSelect={handleModeSelect}
                onTap={() => setStreamOpen(true)}
                onNeuroadaptiveSignal={neuroadaptiveSensing.signal}
              />
            </>
          )}
        />
      </div>

      {/* System Info Overlay — for the design system page */}
      {showSystemInfo && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ zIndex: layer.nav }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="px-6 pb-4"
            >
              {/* Mode info */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: activeMode.color,
                    boxShadow: glow.soft(activeMode.color, '40'),
                  }}
                />
                <span
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.prose,
                    fontWeight: weight.regular,
                    color: room.fg,
                    opacity: opacity.bright,
                  }}
                >
                  {activeMode.label}
                </span>
                {/* Semantic particle + tracked typography — no pill */}
                <span
                  className="rounded-full"
                  style={{
                    width: 3,
                    height: 3,
                    background: activeMode.color,
                    boxShadow: glow.soft(activeMode.color, '40'),
                    opacity: opacity.body,
                  }}
                />
                <span
                  style={{
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.label,
                    textTransform: 'uppercase',
                    color: activeMode.color,
                    opacity: opacity.body,
                  }}
                >
                  {activeMode.family}
                </span>
              </div>

              {/* Doctrine recipe readout */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {[
                  { label: 'atmosphere', value: activeMode.atmosphere },
                  { label: 'attenuation', value: activeMode.attenuation },
                  { label: 'color', value: activeMode.colorSignature },
                  { label: 'motion', value: activeMode.motion },
                  { label: 'interaction', value: activeMode.interaction },
                  { label: 'arc', value: activeMode.arcPattern || 'none' },
                ].map(item => (
                  <span
                    key={item.label}
                    style={{
                      fontSize: typeSize.detail,
                      fontFamily: font.mono,
                      color: room.gray1,
                      letterSpacing: tracking.code,
                    }}
                  >
                    <span style={{ color: room.gray2 }}>{item.label}</span>{' '}
                    {item.value}
                  </span>
                ))}
              </div>

              {/* Governors Debug Overlay — live neuroadaptive + hardware + sequence state */}
              <div className="mt-3">
                <GovernorsOverlay
                  activeMode={activeMode}
                  arousal={neuroadaptiveSensing.arousal}
                  neuroadaptiveBand={neuroadaptiveSensing.suggestedBand}
                  temperature={temperature}
                  sequence={sequenceEngine}
                />
              </div>

              {/* Magic law */}
              <p
                className="mt-2"
                style={{
                  fontFamily: font.serif,
                  fontSize: typeSize.note,
                  fontStyle: 'italic',
                  color: room.gray2,
                  lineHeight: leading.body,
                  maxWidth: '32rem',
                }}
              >
                {activeMode.magicLaw}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}