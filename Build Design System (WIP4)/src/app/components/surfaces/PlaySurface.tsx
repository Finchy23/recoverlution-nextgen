/**
 * PLAY SURFACE — The Soundtrack of Becoming
 *
 * Not a library. Not a playlist. A sentient radio station.
 * The hardest part is pressing play.
 *
 * Three control axes carved into the glass:
 *   FREQUENCY — DRIVE · FOCUS · DRIFT (the energy of delivery)
 *   THREAD    — the clinical theme (what the voice speaks about)
 *   BEAT      — the sonic character underneath the voice
 *
 * Two states:
 *   The Invitation — the glass breathes, controls are visible, press play
 *   The Immersion  — the glass comes alive, sound fills the room
 *
 * Spatial hierarchy (bottom → top):
 *   ORB CLEARANCE (0–110px)  — sacred orb territory, untouchable
 *   SETTINGS CONSTELLATION   — breathing organism: FREQ dots · BEAT dots · THRD tuner
 *   HERO ZONE                — centered play orb (88px) with concentric halos + DPTH control
 *   SONIC FIELD              — waveform atmosphere above the hero
 *   FREQUENCY SIGNATURE      — full-viewport canvas behind everything
 *
 * Copy guardrails (see copy-guardrails.ts):
 *   Eyebrow: 4-char frequency · All labels: 4-char uppercase
 *   No numbers. No time. No metrics. No library exposure.
 *
 * Data pipeline:
 *   Mode A (library): useContentSoundbites → bootSoundbiteTrack → useAudioEngine
 *   Mode B (compiled): usePlayRuntime → session queue → useAudioEngine
 *   The audio engine exposes AnalyserNode frequency data for the SonicField.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useTemperature } from '../design-system/TemperatureGovernor';
import { useSurfaceArrival, STAGGER, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { FrequencySignature, FREQUENCY_COLORS, type FrequencyId } from './FrequencySignature';
import { TYPOGRAPHY } from './copy-guardrails';
import { useContentSoundbites, bootSoundbiteTrack } from '../runtime/useContentSoundbites';
import { useAudioEngine, type CrossfadePhase } from '../runtime/useAudioEngine';
import { usePlayRuntime } from '../runtime/usePlayRuntime';
import { room, font, layout, tracking, typeSize, weight, opacity, timing, glow, radii, glaze, void_, refract, layer } from '../design-system/surface-tokens';
import type { PlayPendingMutation, PlaySavedStation, PlayRuntimeHealthState } from '../runtime/play-contracts';
import * as events from '../runtime/event-seam';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import { usePlayPersistence } from '../runtime/usePlayPersistence';

// ─── Constants ───
const ORB_CLEARANCE = layout.orbClearance;

// ─── Persistence moved to usePlayPersistence hook ───
// Preferences (volume, depth, indices) and station persistence
// now live in /runtime/usePlayPersistence.ts
// The shell consumes the hook — no fetch calls here.

// ─── Frequency identity ───

interface Frequency {
  id: FrequencyId;
  label: string; // 4-char
  whisper: string;
}

const FREQUENCIES: Frequency[] = [
  { id: 'drive', label: 'DRIVE', whisper: 'The kinetic frequency' },
  { id: 'focus', label: 'FOCUS', whisper: 'The grounding frequency' },
  { id: 'drift', label: 'DRIFT', whisper: 'The descent frequency' },
];

// ─── Thread identity (clinical themes as 4-letter words) ───

interface Thread {
  id: string;
  label: string; // 4-char
}

const THREADS: Thread[] = [
  { id: 'grit', label: 'GRIT' },
  { id: 'calm', label: 'CALM' },
  { id: 'self', label: 'SELF' },
  { id: 'free', label: 'FREE' },
  { id: 'edge', label: 'EDGE' },
  { id: 'bond', label: 'BOND' },
  { id: 'wake', label: 'WAKE' },
  { id: 'root', label: 'ROOT' },
];

// ─── Beat identity (sonic character) ───

interface Beat {
  id: string;
  label: string; // 4-char
  whisper: string;
}

const BEATS: Beat[] = [
  { id: 'pulse', label: 'PULSE', whisper: 'Rhythmic presence' },
  { id: 'wave',  label: 'WAVE',  whisper: 'Flowing undertow' },
  { id: 'haze',  label: 'HAZE',  whisper: 'Ambient dissolve' },
  { id: 'bare',  label: 'BARE',  whisper: 'Voice forward' },
];

// ─── Surface states ───
type PlayPhase = 'arrival' | 'surface' | 'playing' | 'paused';

// ─── Pending Mutation Whisper — subtle visual cue during compile ───

function MutationWhisper({ mutation, applied, color, breath }: {
  mutation: PlayPendingMutation | null;
  applied: boolean;
  color: string;
  breath: number;
}) {
  // "Applied" confirmation — brief green-tinted flash
  if (applied) {
    return (
      <motion.div
        className="flex items-center gap-2 pointer-events-none"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.6, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02, y: -3 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-full"
          style={{
            width: 4, height: 4,
            background: '#6EE7B7',
            boxShadow: glow.soft('#6EE7B7', '35'),
          }}
        />
        <span style={{
          fontFamily: font.sans,
          fontSize: typeSize.trace,
          fontWeight: weight.medium,
          letterSpacing: tracking.spread,
          color: '#6EE7B7',
          textTransform: 'uppercase' as const,
        }}>
          APPLIED
        </span>
      </motion.div>
    );
  }

  if (!mutation) return null;
  const pulse = 0.4 + Math.sin(breath * Math.PI * 4) * 0.3;
  return (
    <motion.div
      className="flex items-center gap-2 pointer-events-none"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: pulse, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="rounded-full"
        style={{
          width: 3, height: 3,
          background: color,
          boxShadow: glow.soft(color, '30'),
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <span style={{
        fontFamily: font.sans,
        fontSize: typeSize.trace,
        fontWeight: weight.medium,
        letterSpacing: tracking.spread,
        color,
        textTransform: 'uppercase' as const,
      }}>
        {mutation.phraseSafe ? 'WAITING' : 'TUNING'}
      </span>
    </motion.div>
  );
}

// ─── Saved Station Pill — minimal save/recall affordance ───

function SavedStationShell({ stations, color, onLoad, onSave }: {
  stations: PlaySavedStation[];
  color: string;
  onLoad: (station: PlaySavedStation) => void;
  onSave: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Toggle — "MY ROOMS" / "SAVE" */}
      <motion.button
        className="flex items-center gap-2 cursor-pointer"
        style={{
          background: 'none', border: 'none',
          padding: '4px 10px',
        }}
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Station count dots — each dot represents a saved room */}
        {stations.length > 0 && (
          <div className="flex items-center gap-1">
            {stations.slice(0, 5).map((s) => {
              const stationFreqColor = FREQUENCY_COLORS[s.frequency as FrequencyId]?.hex || color;
              return (
                <div
                  key={s.stationId}
                  className="rounded-full"
                  style={{
                    width: 3, height: 3,
                    background: stationFreqColor,
                    opacity: opacity.murmur,
                  }}
                />
              );
            })}
          </div>
        )}
        <span style={{
          fontFamily: font.sans,
          fontSize: typeSize.trace,
          fontWeight: weight.medium,
          letterSpacing: tracking.spread,
          color: room.fg,
          opacity: opacity.trace,
        }}>
          {stations.length > 0 ? 'MY ROOMS' : 'SAVE'}
        </span>
      </motion.button>

      {/* Expanded station list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Save current room */}
            <motion.button
              className="cursor-pointer flex items-center gap-1.5"
              style={{
                background: 'none',
                border: `0.5px solid ${color}12`,
                borderRadius: radii.round,
                padding: '3px 12px',
              }}
              onClick={(e) => { e.stopPropagation(); onSave(); setExpanded(false); }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="rounded-full"
                style={{ width: 3, height: 3, background: color, opacity: opacity.gentle }}
              />
              <span style={{
                fontFamily: font.sans, fontSize: typeSize.trace,
                fontWeight: weight.medium, letterSpacing: tracking.normal,
                color, opacity: opacity.gentle,
              }}>
                SAVE THIS ROOM
              </span>
            </motion.button>

            {/* Saved rooms — each is a named room with its frequency identity */}
            {stations.slice(0, 4).map((s, i) => {
              const stationFreqColor = FREQUENCY_COLORS[s.frequency as FrequencyId]?.hex || color;
              return (
                <motion.button
                  key={s.stationId}
                  className="cursor-pointer flex items-center gap-2"
                  style={{
                    background: 'none', border: 'none', padding: '2px 8px',
                  }}
                  onClick={(e) => { e.stopPropagation(); onLoad(s); setExpanded(false); }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  {/* Station's frequency color dot */}
                  <div
                    className="rounded-full"
                    style={{
                      width: 4, height: 4,
                      background: stationFreqColor,
                      opacity: opacity.quiet,
                      boxShadow: glow.soft(stationFreqColor, '15'),
                    }}
                  />
                  {/* Station name — emotionally real, not a filter label */}
                  <span style={{
                    fontFamily: font.sans, fontSize: typeSize.trace,
                    fontWeight: weight.medium, letterSpacing: tracking.label,
                    color: room.fg, opacity: opacity.present,
                  }}>
                    {s.name}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Quiet Runtime Inspector — debug overlay ───

function RuntimeInspector({ health, color }: {
  health: PlayRuntimeHealthState;
  color: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top: 8, right: 8, zIndex: layer.pinnacle,
        padding: '6px 10px',
        borderRadius: radii.frameInner,
        background: void_.shroud,
        backdropFilter: refract.frost,
        maxWidth: 180,
      }}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.4 }}
    >
      {[
        { label: 'MODE', value: health.mode },
        { label: 'PIPE', value: health.mode === 'live' ? 'B' : 'A' },
        { label: 'CONN', value: health.connected ? 'LIVE' : 'OFF' },
        { label: 'SESS', value: health.sessionActive ? 'ON' : 'IDLE' },
        { label: 'QUEUE', value: String(health.queueDepth) },
        { label: 'PEND', value: String(health.pendingMutations) },
        { label: 'TRCK', value: health.currentTrackId?.slice(0, 8) || '---' },
      ].map((row) => (
        <div key={row.label} className="flex justify-between gap-3" style={{ marginBottom: 1 }}>
          <span style={{
            fontFamily: font.mono, fontSize: typeSize.trace,
            fontWeight: weight.medium, letterSpacing: tracking.code,
            color, opacity: opacity.murmur,
          }}>
            {row.label}
          </span>
          <span style={{
            fontFamily: font.mono, fontSize: typeSize.trace,
            fontWeight: weight.regular, letterSpacing: tracking.code,
            color: room.fg, opacity: opacity.quiet,
          }}>
            {row.value}
          </span>
        </div>
      ))}
      {health.errors.length > 0 && (
        <div style={{ marginTop: 3, borderTop: `0.5px solid ${color}10`, paddingTop: 2 }}>
          {health.errors.slice(-2).map((err, i) => (
            <span key={i} style={{
              fontFamily: font.mono, fontSize: typeSize.sub,
              color: '#FF6B6B', opacity: opacity.quiet,
              display: 'block', lineHeight: 1.3,
            }}>
              {err.slice(0, 40)}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Props ───
interface PlaySurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

// ─── Waveform — audio-reactive sonic field visualization ───
// When real audio is flowing through the AnalyserNode, frequency data
// drives the bars. When idle or no audio data, falls back to breath-linked.

function SonicField({
  color,
  breath,
  playing,
  volume,
  frequencyData,
  amplitude,
  crossfadePhase = 'idle',
  crossfadeProgress = 0,
  onSwipeLeft,
  onSwipeRight,
}: {
  color: string;
  breath: number;
  playing: boolean;
  volume: number;
  /** Raw frequency bins from AnalyserNode (0-255 each) */
  frequencyData?: Uint8Array;
  /** Normalized 0-1 average amplitude from AnalyserNode */
  amplitude?: number;
  /** Current crossfade phase for visual indicator */
  crossfadePhase?: CrossfadePhase;
  /** Continuous 0→1 progress through crossfade (rAF-driven) */
  crossfadeProgress?: number;
  /** Swipe left handler — skip next (mobile gesture) */
  onSwipeLeft?: () => void;
  /** Swipe right handler — skip prev (mobile gesture) */
  onSwipeRight?: () => void;
}) {
  const barCount = 48;
  const isCrossfading = crossfadePhase !== 'idle';
  const hasAudioData = playing && frequencyData && frequencyData.length > 0 && (amplitude ?? 0) > 0.01;

  // Continuous crossfade scale via rAF progress (0→1):
  //   0→0.5 = fade-out: bars compress from 1.0 down to 0.05
  //   0.5 = swap point: bars at minimum
  //   0.5→1 = fade-in: bars expand from 0.05 back to 1.0
  // Uses a smooth ease curve for natural visual feel
  let crossfadeScale = 1;
  if (isCrossfading && crossfadeProgress > 0) {
    const p = crossfadeProgress;
    if (p <= 0.5) {
      // Fade-out phase: ease from 1 → 0.05
      const t = p / 0.5; // normalize 0→1
      crossfadeScale = 1 - (1 - 0.05) * (t * t); // quadratic ease-in
    } else {
      // Fade-in phase: ease from 0.05 → 1
      const t = (p - 0.5) / 0.5; // normalize 0→1
      crossfadeScale = 0.05 + (1 - 0.05) * (1 - (1 - t) * (1 - t)); // quadratic ease-out
    }
  }

  // ── Swipe gesture tracking for mobile skip ──
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [swipeDeltaX, setSwipeDeltaX] = useState(0);
  const SWIPE_THRESHOLD = 40; // min px horizontal distance
  const SWIPE_MAX_Y = 60; // max px vertical drift (prevents scroll-triggered swipes)
  const SWIPE_VISUAL_DAMPING = 0.35; // how much finger movement maps to bar offset

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    setSwipeDeltaX(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !playing) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    // Only track horizontal — ignore vertical scrolls
    if (dy < SWIPE_MAX_Y) {
      // Damped offset with elastic feel at edges (tanh-like clamping)
      const maxOffset = 24;
      const raw = dx * SWIPE_VISUAL_DAMPING;
      const damped = maxOffset * Math.tanh(raw / maxOffset);
      setSwipeDeltaX(damped);
    }
  }, [playing]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !playing) {
      setSwipeDeltaX(0);
      return;
    }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    const dt = Date.now() - touchStartRef.current.t;
    touchStartRef.current = null;
    setSwipeDeltaX(0); // snap back

    // Must be a fast horizontal swipe, not a scroll
    if (Math.abs(dx) > SWIPE_THRESHOLD && dy < SWIPE_MAX_Y && dt < 500) {
      if (dx < 0 && onSwipeLeft) {
        triggerHaptic('medium');
        onSwipeLeft();
      } else if (dx > 0 && onSwipeRight) {
        triggerHaptic('medium');
        onSwipeRight();
      }
    }
  }, [playing, onSwipeLeft, onSwipeRight]);

  const bars = Array.from({ length: barCount }, (_, i) => {
    if (hasAudioData && frequencyData) {
      // Audio-reactive: map frequency bins to bar heights
      const binIndex = Math.floor((i / barCount) * frequencyData.length);
      const binValue = frequencyData[binIndex] / 255; // normalize 0-1
      const base = 2;
      const maxHeight = 48 * volume;
      const h = Math.max(1.5, base + binValue * maxHeight);
      return isCrossfading ? Math.max(1.5, h * crossfadeScale) : h;
    }

    // Breath-linked fallback (idle or no audio data)
    const phase = (i / barCount) * Math.PI * 2;
    const base = playing ? 4 : 2;
    const amp = playing ? 28 * volume : 6;
    const breathWave = Math.sin(phase + breath * Math.PI * 2) * amp;
    const secondHarmonic = playing
      ? Math.sin(phase * 2.3 + breath * Math.PI * 4) * amp * 0.3
      : 0;
    const thirdHarmonic = playing
      ? Math.sin(phase * 3.7 + breath * Math.PI * 6) * amp * 0.15
      : 0;
    const h = Math.max(1.5, base + breathWave + secondHarmonic + thirdHarmonic);
    return isCrossfading ? Math.max(1.5, h * crossfadeScale) : h;
  });

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe direction hint — appears during active touch-drag */}
      {swipeDeltaX !== 0 && Math.abs(swipeDeltaX) > 6 && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center"
          style={{
            justifyContent: swipeDeltaX > 0 ? 'flex-start' : 'flex-end',
            paddingLeft: swipeDeltaX > 0 ? 4 : 0,
            paddingRight: swipeDeltaX < 0 ? 4 : 0,
          }}
        >
          <svg
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
            style={{
              opacity: Math.min(0.4, Math.abs(swipeDeltaX) / 24 * 0.4),
              transform: swipeDeltaX < 0 ? 'none' : 'scaleX(-1)',
            }}
          >
            <path
              d="M2 2L10 8L2 14"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      {/* Crossfade phase indicator — subtle horizontal light sweep */}
      {isCrossfading && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: crossfadePhase === 'swapping'
              ? `radial-gradient(ellipse 60% 100% at 50% 50%, ${color}18, transparent)`
              : `linear-gradient(90deg, transparent 0%, ${color}${crossfadePhase === 'fading-out' ? '12' : '20'} 50%, transparent 100%)`,
            opacity: crossfadePhase === 'fading-in' ? 0.8 : 0.5,
            transition: 'opacity 200ms ease, background 200ms ease',
          }}
        />
      )}
      <div
        className="flex items-center justify-center"
        style={{
          height: 64,
          gap: 1.5,
          transform: swipeDeltaX !== 0 ? `translateX(${swipeDeltaX}px)` : undefined,
          transition: swipeDeltaX === 0 ? 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        }}
      >
        {bars.map((h, i) => {
          const alphaBase = playing ? 0.15 + volume * 0.2 : 0.06;
          const alphaTop = playing ? 0.03 : 0.01;
          // During crossfade, bars get a slight tint shift
          const barAlphaBase = isCrossfading ? alphaBase * 0.6 : alphaBase;
          const barAlphaTop = isCrossfading ? alphaTop * 0.4 : alphaTop;
          return (
            <div
              key={i}
              style={{
                width: 1.5,
                height: h,
                borderRadius: radii.micro,
                background: `linear-gradient(to top, ${color}${Math.round(barAlphaBase * 255).toString(16).padStart(2, '0')}, ${color}${Math.round(barAlphaTop * 255).toString(16).padStart(2, '0')})`,
                transition: isCrossfading
                  ? 'height 250ms cubic-bezier(0.4, 0, 0.2, 1)'
                  : `height ${timing.dur.snap} ease`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Hero Play Gesture — The central action ───
// Large refractive orb with concentric breathing halos.
// This is THE hero of the surface — everything orbits around it.

const HERO_SIZE = 88;
const HERO_INNER = 64;

function PlayGesture({
  playing,
  color,
  breath,
  depth,
  amplitude,
  onClick,
}: {
  playing: boolean;
  color: string;
  breath: number;
  depth: number;
  /** Normalized 0-1 audio amplitude from AnalyserNode */
  amplitude: number;
  onClick: () => void;
}) {
  const breathScale = 1 + Math.sin(breath * Math.PI * 2) * 0.02;
  // When playing with real audio, the outer halo pulses with amplitude
  // Otherwise follows the gentle breath cycle
  const ampPulse = playing && amplitude > 0.01
    ? 1 + amplitude * 0.12
    : 1 + Math.sin(breath * Math.PI * 2 + 0.5) * 0.04;
  // Outer halo alpha intensifies with amplitude
  const outerAlpha = playing
    ? Math.round(Math.min(255, 3 + amplitude * 18)).toString(16).padStart(2, '0')
    : '03';

  return (
    <motion.button
      className="relative cursor-pointer flex items-center justify-center"
      style={{
        width: HERO_SIZE,
        height: HERO_SIZE,
        background: 'none',
        border: 'none',
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.93 }}
    >
      {/* Outer breathing halo — amplitude-reactive when playing */}
      <div
        className="absolute rounded-full"
        style={{
          width: HERO_SIZE + 40,
          height: HERO_SIZE + 40,
          background: `radial-gradient(circle, ${color}${outerAlpha} 0%, transparent 70%)`,
          transform: `scale(${ampPulse})`,
          transition: playing ? 'transform 0.08s ease-out' : 'transform 0.6s, background 0.8s',
        }}
      />

      {/* Secondary amplitude ring — only visible when playing with audio */}
      {playing && amplitude > 0.05 && (
        <div
          className="absolute rounded-full"
          style={{
            width: HERO_SIZE + 60,
            height: HERO_SIZE + 60,
            border: `0.5px solid ${color}${Math.round(amplitude * 8).toString(16).padStart(2, '0')}`,
            transform: `scale(${1 + amplitude * 0.08})`,
            transition: `transform ${timing.dur.micro} ease-out, border-color ${timing.dur.instant}`,
          }}
        />
      )}

      {/* Mid halo — refractive ring, depth-responsive */}
      <div
        className="absolute rounded-full"
        style={{
          width: HERO_SIZE + 16,
          height: HERO_SIZE + 16,
          border: `1px solid ${color}${Math.round(depth * 12 + 4).toString(16).padStart(2, '0')}`,
          transform: `scale(${breathScale})`,
          transition: `border-color ${timing.dur.mid}`,
        }}
      />

      {/* Inner field — the glass lens */}
      <div
        className="absolute rounded-full"
        style={{
          width: HERO_INNER,
          height: HERO_INNER,
          background: `radial-gradient(circle at 45% 40%, ${color}${playing ? '12' : '08'} 0%, ${color}04 50%, transparent 80%)`,
          backdropFilter: refract.whisper,
          transform: `scale(${breathScale})`,
          transition: `background ${timing.dur.slow}`,
        }}
      />

      {/* Subtle inner ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: HERO_INNER,
          height: HERO_INNER,
          border: `0.5px solid ${color}${playing ? '18' : '0c'}`,
          transform: `scale(${breathScale})`,
          transition: `border-color ${timing.dur.slow}`,
        }}
      />

      {/* Icon */}
      {playing ? (
        <div className="flex items-center gap-2 relative" style={{ zIndex: layer.content }}>
          <div style={{ width: 3, height: 20, borderRadius: radii.bar, background: color, opacity: opacity.body }} />
          <div style={{ width: 3, height: 20, borderRadius: radii.bar, background: color, opacity: opacity.body }} />
        </div>
      ) : (
        <svg width="22" height="24" viewBox="0 0 18 20" fill="none" style={{ position: 'relative', zIndex: layer.content, marginLeft: 3 }}>
          <path d="M2 1.5L16 10L2 18.5V1.5Z" fill={color} opacity={opacity.steady} />
        </svg>
      )}
    </motion.button>
  );
}

// ─── Haptic feedback — subtle vibration on skip gestures (mobile) ───

function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if (navigator.vibrate) {
      const ms = style === 'heavy' ? 25 : style === 'medium' ? 15 : 8;
      navigator.vibrate(ms);
    }
  } catch {
    // Haptic not available — silent fail
  }
}

// ─── Skip Transport — Subtle refractive skip arrows flanking the hero ───
// Only visible during playback. SkipBack and SkipForward as small
// glass-morphic chevrons that pulse with the breath cycle.

/** Formats seconds as m:ss */
function formatTime(s: number): string {
  if (!s || !isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Scrub speed tiers — the longer you hold, the faster you scrub */
const SCRUB_TIERS = [
  { afterMs: 0,    stepS: 3 },
  { afterMs: 1500, stepS: 7 },
  { afterMs: 3000, stepS: 15 },
] as const;

/** Scrub tier labels for the speed whisper */
const SCRUB_TIER_LABELS: Record<number, string> = {
  3: '×1',
  7: '×2',
  15: '×5',
};

function SkipTransport({
  color,
  breath,
  playing,
  onSkipPrev,
  onSkipNext,
  onScrub,
  onSeekTo,
  canSkipPrev,
  canSkipNext,
  crossfadePhase,
  queuePosition,
  queueLength,
  trackProgress,
  currentTime,
  duration,
  frequencyData,
}: {
  color: string;
  breath: number;
  playing: boolean;
  onSkipPrev: () => void;
  onSkipNext: () => void;
  onScrub: (offsetSeconds: number) => void;
  onSeekTo: (positionSeconds: number) => void;
  canSkipPrev: boolean;
  canSkipNext: boolean;
  crossfadePhase: CrossfadePhase;
  queuePosition: number;
  queueLength: number;
  trackProgress: number;
  currentTime: number;
  duration: number;
  /** Raw frequency data for waveform preview — 64 bins */
  frequencyData: Uint8Array;
}) {
  if (!playing) return null;

  const isCrossfading = crossfadePhase !== 'idle';
  const breathAlpha = 0.12 + Math.sin(breath * Math.PI * 2) * 0.04;
  const hasQueue = queueLength > 1;

  // Time whisper hover state
  const [showTimeWhisper, setShowTimeWhisper] = useState(false);

  // Long-press scrubbing with accelerating speed
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didScrubRef = useRef(false);
  const scrubStartRef = useRef(0);
  /** Active scrub direction — null when not scrubbing */
  const [activeScrub, setActiveScrub] = useState<{ direction: -1 | 1; speed: string } | null>(null);

  const getScrubStep = useCallback((): number => {
    const held = Date.now() - scrubStartRef.current;
    let step = SCRUB_TIERS[0].stepS;
    for (const tier of SCRUB_TIERS) {
      if (held >= tier.afterMs) step = tier.stepS;
    }
    return step;
  }, []);

  const startLongPress = useCallback((direction: -1 | 1) => {
    didScrubRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      didScrubRef.current = true;
      scrubStartRef.current = Date.now();
      triggerHaptic('medium');
      onScrub(direction * SCRUB_TIERS[0].stepS);
      setActiveScrub({ direction, speed: SCRUB_TIER_LABELS[SCRUB_TIERS[0].stepS] });
      scrubIntervalRef.current = setInterval(() => {
        const step = getScrubStep();
        onScrub(direction * step);
        setActiveScrub({ direction, speed: SCRUB_TIER_LABELS[step] || `×${step}` });
        triggerHaptic(step >= 15 ? 'heavy' : step >= 7 ? 'medium' : 'light');
      }, 150);
    }, 400);
  }, [onScrub, getScrubStep]);

  const endLongPress = useCallback((direction: -1 | 1, onClick: () => void) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (scrubIntervalRef.current) {
      clearInterval(scrubIntervalRef.current);
      scrubIntervalRef.current = null;
    }
    if (!didScrubRef.current) {
      triggerHaptic('light');
      onClick();
    }
    didScrubRef.current = false;
    setActiveScrub(null);
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (scrubIntervalRef.current) clearInterval(scrubIntervalRef.current);
    };
  }, []);

  // Progress bar drag state
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const progressToTime = useCallback((clientX: number): number => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return 0;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const handleProgressPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingProgress(true);
    const time = progressToTime(e.clientX);
    setDragProgress(duration > 0 ? time / duration : 0);
    triggerHaptic('light');
  }, [progressToTime, duration]);

  const handleProgressPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingProgress) return;
    const time = progressToTime(e.clientX);
    setDragProgress(duration > 0 ? time / duration : 0);
  }, [isDraggingProgress, progressToTime, duration]);

  const handleProgressPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingProgress) return;
    setIsDraggingProgress(false);
    const time = progressToTime(e.clientX);
    onSeekTo(time);
    triggerHaptic('medium');
  }, [isDraggingProgress, progressToTime, onSeekTo]);

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingProgress) return;
    const time = progressToTime(e.clientX);
    onSeekTo(time);
    triggerHaptic('light');
  }, [isDraggingProgress, progressToTime, onSeekTo]);

  const SkipButton = ({ direction, onClick, enabled }: { direction: -1 | 1; onClick: () => void; enabled: boolean }) => (
    <motion.button
      className="flex items-center justify-center rounded-full cursor-pointer"
      style={{
        width: 32,
        height: 32,
        background: `${color}${enabled ? '0a' : '04'}`,
        backdropFilter: refract.subtle,
        border: `0.5px solid ${color}${enabled ? '12' : '06'}`,
        opacity: enabled ? (isCrossfading ? 0.3 : 1) : 0.2,
        transition: `opacity ${timing.dur.snap}, background ${timing.dur.snap}`,
        touchAction: 'none',
      }}
      whileHover={enabled ? { scale: 1.08, background: `${color}14` } : {}}
      whileTap={enabled ? { scale: 0.92 } : {}}
      onPointerDown={() => {
        if (enabled && !isCrossfading) startLongPress(direction);
      }}
      onPointerUp={() => {
        if (enabled && !isCrossfading) endLongPress(direction, onClick);
      }}
      onPointerLeave={() => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (scrubIntervalRef.current) {
          clearInterval(scrubIntervalRef.current);
          scrubIntervalRef.current = null;
        }
        didScrubRef.current = false;
        setActiveScrub(null);
      }}
      disabled={!enabled || isCrossfading}
      aria-label={direction === -1 ? 'Previous track (hold to rewind)' : 'Next track (hold to fast-forward)'}
    >
      <svg
        width="10"
        height="12"
        viewBox="0 0 10 12"
        fill="none"
        style={{ transform: direction === 1 ? 'none' : 'scaleX(-1)' }}
      >
        <path
          d="M1 1L5 6L1 11"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={enabled ? breathAlpha * 4 : 0.15}
        />
        <path
          d="M5 1L9 6L5 11"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={enabled ? breathAlpha * 3 : 0.1}
        />
      </svg>
    </motion.button>
  );

  // ── Keyboard shortcuts: 1-9 for 10%-90% jump, ←/→ for ±5s ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!playing || !duration) return;

      // Number keys 1-9: jump to 10%-90% of track
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        const targetTime = (num / 10) * duration;
        onSeekTo(targetTime);
        triggerHaptic('light');
        return;
      }

      // 0 key: jump to start
      if (e.key === '0') {
        e.preventDefault();
        onSeekTo(0);
        triggerHaptic('light');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, duration, onSeekTo, onScrub]);

  // ── Waveform preview: downsample frequency data to fit progress bar ──
  const PROGRESS_WIDTH = hasQueue ? 140 : 100;
  const WAVEFORM_BARS = 28; // number of mini bars in the waveform preview
  const waveformBars = useMemo(() => {
    if (!frequencyData || frequencyData.length === 0) return [];
    const bars: number[] = [];
    const binStep = frequencyData.length / WAVEFORM_BARS;
    for (let i = 0; i < WAVEFORM_BARS; i++) {
      const binIdx = Math.floor(i * binStep);
      const val = frequencyData[binIdx] / 255;
      bars.push(val);
    }
    return bars;
  }, [frequencyData]);

  const displayProgress = isDraggingProgress ? dragProgress : trackProgress;
  const displayTime = isDraggingProgress ? dragProgress * duration : currentTime;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-5 relative">
        {/* Scrub speed whisper — left side (rewind) */}
        <AnimatePresence>
          {activeScrub && activeScrub.direction === -1 && (
            <motion.span
              className="absolute pointer-events-none"
              style={{
                right: '100%',
                marginRight: 6,
                fontFamily: font.sans,
                fontSize: typeSize.micro,
                fontWeight: weight.medium,
                letterSpacing: tracking.wide,
                color,
                opacity: opacity.murmur,
                whiteSpace: 'nowrap',
              }}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: opacity.murmur, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.12 }}
            >
              {activeScrub.speed}
            </motion.span>
          )}
        </AnimatePresence>

        <SkipButton direction={-1} onClick={onSkipPrev} enabled={canSkipPrev} />

        {hasQueue && (
          <AnimatePresence mode="wait">
            <motion.span
              key={queuePosition}
              style={{
                fontFamily: font.sans,
                fontSize: typeSize.micro,
                fontWeight: weight.medium,
                letterSpacing: tracking.wide,
                color,
                opacity: opacity.murmur,
                minWidth: 28,
                textAlign: 'center' as const,
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: opacity.murmur, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {queuePosition}/{queueLength}
            </motion.span>
          </AnimatePresence>
        )}

        <SkipButton direction={1} onClick={onSkipNext} enabled={canSkipNext} />

        {/* Scrub speed whisper — right side (fast-forward) */}
        <AnimatePresence>
          {activeScrub && activeScrub.direction === 1 && (
            <motion.span
              className="absolute pointer-events-none"
              style={{
                left: '100%',
                marginLeft: 6,
                fontFamily: font.sans,
                fontSize: typeSize.micro,
                fontWeight: weight.medium,
                letterSpacing: tracking.wide,
                color,
                opacity: opacity.murmur,
                whiteSpace: 'nowrap',
              }}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: opacity.murmur, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12 }}
            >
              {activeScrub.speed}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Track progress bar — tappable/draggable with hover time whisper + waveform */}
      {(trackProgress > 0 || duration > 0) && (
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setShowTimeWhisper(true)}
          onMouseLeave={() => { setShowTimeWhisper(false); setIsDraggingProgress(false); }}
        >
          {/* Time whisper — appears on hover or during drag */}
          <AnimatePresence>
            {(showTimeWhisper || isDraggingProgress) && duration > 0 && (
              <motion.div
                className="flex items-center justify-center"
                style={{
                  fontFamily: font.sans,
                  fontSize: typeSize.micro,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.wide,
                  color,
                  opacity: isDraggingProgress ? opacity.steady : opacity.murmur,
                  marginBottom: 3,
                  gap: 4,
                }}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: isDraggingProgress ? opacity.steady : opacity.murmur, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.15 }}
              >
                <span>{formatTime(displayTime)}</span>
                <span style={{ opacity: 0.3 }}>/</span>
                <span style={{ opacity: 0.5 }}>{formatTime(duration)}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress track with optional waveform overlay */}
          <div
            ref={progressBarRef}
            className="relative"
            style={{
              width: PROGRESS_WIDTH,
              height: isDraggingProgress ? 16 : showTimeWhisper ? 3 : 1.5,
              borderRadius: radii.bar,
              background: `${color}${isDraggingProgress ? '08' : '08'}`,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: isDraggingProgress ? 'height 150ms ease' : 'height 200ms ease',
              touchAction: 'none',
            }}
            onClick={handleProgressClick}
            onPointerDown={handleProgressPointerDown}
            onPointerMove={handleProgressPointerMove}
            onPointerUp={handleProgressPointerUp}
          >
            {/* Solid progress fill (behind waveform) */}
            <div
              className="absolute inset-0"
              style={{
                width: `${Math.min(100, displayProgress * 100)}%`,
                height: '100%',
                borderRadius: radii.bar,
                background: isDraggingProgress
                  ? `linear-gradient(90deg, ${color}15, ${color}25)`
                  : `linear-gradient(90deg, ${color}20, ${color}35)`,
                transition: isDraggingProgress ? 'none' : 'width 300ms linear',
              }}
            />

            {/* Waveform preview — only during drag, expands from progress fill */}
            {isDraggingProgress && waveformBars.length > 0 && (
              <div
                className="absolute inset-0 flex items-end justify-between pointer-events-none"
                style={{ padding: '0 2px 1px 2px' }}
              >
                {waveformBars.map((val, i) => {
                  const barRatio = (i + 0.5) / WAVEFORM_BARS;
                  const isPast = barRatio <= displayProgress;
                  return (
                    <div
                      key={i}
                      style={{
                        width: Math.max(1, (PROGRESS_WIDTH - 4) / WAVEFORM_BARS - 1),
                        height: `${Math.max(15, val * 100)}%`,
                        borderRadius: radii.micro,
                        background: isPast
                          ? `${color}${Math.min(255, Math.round((0.15 + val * 0.25) * 255)).toString(16).padStart(2, '0')}`
                          : `${color}${Math.min(255, Math.round((0.05 + val * 0.1) * 255)).toString(16).padStart(2, '0')}`,
                        transition: 'height 80ms ease, background 80ms ease',
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Depth Control — The immersion depth dial ───
// Vertical segmented arc, labeled "DPTH".
// Dragging vertically controls how deep you go.
// Segments light up from bottom to top — deeper = more lit.
// Each segment carries a semantic name: NEAR → HELD → CORE → DEEP → FULL

const DEPTH_LAYERS = [
  { name: 'FULL', threshold: 0.95 },
  { name: 'DEEP', threshold: 0.75 },
  { name: 'CORE', threshold: 0.50 },
  { name: 'HELD', threshold: 0.25 },
  { name: 'NEAR', threshold: 0.00 },
] as const;

/** Derive semantic depth label from 0-1 value */
function depthLabel(v: number): string {
  for (const layer of DEPTH_LAYERS) {
    if (v >= layer.threshold) return layer.name;
  }
  return 'NEAR';
}

function DepthControl({
  depth,
  color,
  breath,
  onChange,
}: {
  depth: number;
  color: string;
  breath: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromEvent = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const y = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      onChange(y);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFromEvent(e.clientY);
    },
    [updateFromEvent],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging.current) updateFromEvent(e.clientY);
    },
    [updateFromEvent],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const breathPulse = Math.sin(breath * Math.PI * 2) * 0.15;

  // Find the active depth layer name
  const activeLayer = DEPTH_LAYERS.find(l => depth >= l.threshold) ?? DEPTH_LAYERS[DEPTH_LAYERS.length - 1];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Active depth layer name — animates on change */}
      <AnimatePresence mode="wait">
        <motion.span
          key={activeLayer.name}
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.micro,
            fontWeight: weight.medium,
            letterSpacing: tracking.normal,
            color,
            opacity: opacity.gentle + depth * 0.25,
          }}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: opacity.gentle + depth * 0.25, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.25 }}
        >
          {activeLayer.name}
        </motion.span>
      </AnimatePresence>

      {/* Vertical depth track — bodily immersion dial */}
      <div
        ref={trackRef}
        className="relative cursor-pointer flex flex-col items-center justify-between"
        style={{
          width: 36,
          height: 64,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Atmospheric field behind segments — grows with depth */}
        <div
          className="absolute rounded-full"
          style={{
            width: 24 + depth * 16,
            height: 24 + depth * 16,
            left: '50%',
            top: `${(1 - depth) * 100}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${color}${Math.round(depth * 8).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            transition: 'all 0.8s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Semantic segments — layers of immersion, not data points */}
        {DEPTH_LAYERS.map((layer, i) => {
          const isLit = depth >= layer.threshold - 0.02;
          const isCurrent = layer.name === activeLayer.name;
          const segAlpha = isLit ? (0.25 + breathPulse * depth) : 0.035;
          const segWidth = isLit ? 16 + (layer.threshold * 10) : 7;

          return (
            <div key={layer.name} className="flex items-center gap-1.5">
              {/* Segment bar — wider segments = deeper layers */}
              <div
                style={{
                  width: segWidth,
                  height: isCurrent ? 2.5 : 1.5,
                  borderRadius: radii.dot,
                  background: color,
                  opacity: segAlpha,
                  transition: timing.t.respond,
                  boxShadow: isLit && isCurrent ? glow.soft(color, '25') : isLit ? glow.soft(color, '12') : 'none',
                }}
              />
            </div>
          );
        })}

        {/* Thumb — luminous point with depth-reactive glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: 9 + depth * 3,
            height: 9 + depth * 3,
            left: '50%',
            top: `${(1 - depth) * 100}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle at 40% 38%, ${color}${Math.round(0.35 + depth * 0.35).toString(16).padStart(2, '0')}, ${color}15 70%, transparent)`,
            boxShadow: `0 0 ${6 + depth * 10}px ${color}${Math.round(0.15 + depth * 0.2).toString(16).padStart(2, '0')}`,
            transition: `top ${timing.dur.quick} ease-out, width 0.4s ease, height 0.4s ease, box-shadow 0.8s ease`,
          }}
        />
      </div>

      {/* DPTH eyebrow */}
      <span
        style={{
          fontFamily: font.sans,
          fontSize: typeSize.traceUp,
          fontWeight: weight.medium,
          letterSpacing: tracking.spread,
          color: room.fg,
          opacity: opacity.trace,
        }}
      >
        DPTH
      </span>
    </div>
  );
}

// ─── Volume Control — subtle glass loudness slider ───
// Mirrors DepthControl's aesthetic but shorter and simpler.
// Volume is 0-1 where 0 = muted, 1 = full loudness.

function VolumeControl({
  volume,
  color,
  breath,
  onChange,
}: {
  volume: number;
  color: string;
  breath: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromEvent = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const y = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      onChange(y);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFromEvent(e.clientY);
    },
    [updateFromEvent],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging.current) updateFromEvent(e.clientY);
    },
    [updateFromEvent],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const breathPulse = Math.sin(breath * Math.PI * 2) * 0.08;
  const isMuted = volume < 0.02;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Volume percentage whisper */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isMuted ? 'mute' : Math.round(volume * 10)}
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.micro,
            fontWeight: weight.medium,
            letterSpacing: tracking.normal,
            color: isMuted ? room.fg : color,
            opacity: isMuted ? opacity.trace : opacity.gentle,
          }}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: isMuted ? opacity.trace : opacity.gentle, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.25 }}
        >
          {isMuted ? '—' : Math.round(volume * 100)}
        </motion.span>
      </AnimatePresence>

      {/* Vertical volume track */}
      <div
        ref={trackRef}
        className="relative cursor-pointer"
        style={{
          width: 20,
          height: 56,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Track background — faint filament */}
        <div
          className="absolute left-1/2"
          style={{
            width: 1,
            top: 0,
            bottom: 0,
            transform: 'translateX(-50%)',
            background: `linear-gradient(to bottom, ${color}${isMuted ? '04' : '10'}, ${color}${isMuted ? '02' : '06'})`,
            transition: timing.t.respond,
          }}
        />

        {/* Fill — grows from bottom */}
        <div
          className="absolute left-1/2"
          style={{
            width: 1.5,
            bottom: 0,
            height: `${volume * 100}%`,
            transform: 'translateX(-50%)',
            background: `linear-gradient(to top, ${color}${Math.round((0.15 + breathPulse) * 255).toString(16).padStart(2, '0')}, transparent)`,
            transition: timing.t.respond,
          }}
        />

        {/* Thumb */}
        <div
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            left: '50%',
            top: `${(1 - volume) * 100}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle at 40% 38%, ${color}50, ${color}10 70%, transparent)`,
            boxShadow: isMuted ? 'none' : glow.soft(color, '18'),
            transition: `top ${timing.dur.quick} ease-out`,
          }}
        />
      </div>

      {/* VOL eyebrow */}
      <span
        style={{
          fontFamily: font.sans,
          fontSize: typeSize.traceUp,
          fontWeight: weight.medium,
          letterSpacing: tracking.spread,
          color: room.fg,
          opacity: opacity.trace,
        }}
      >
        VOL
      </span>
    </div>
  );
}

// ─── Thread Arrow — with hover preview of next/prev thread ───

function ThreadArrow({
  direction,
  color,
  previewLabel,
  onClick,
}: {
  direction: -1 | 1;
  color: string;
  previewLabel: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isLeft = direction === -1;

  return (
    <motion.button
      className="relative cursor-pointer flex items-center"
      style={{
        background: 'none',
        border: 'none',
        padding: '6px',
        gap: 4,
        flexDirection: isLeft ? 'row' : 'row-reverse',
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.9 }}
    >
      {/* Preview label — fades in on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            style={{
              fontFamily: font.sans,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.spread,
              color,
              whiteSpace: 'nowrap',
            }}
            initial={{ opacity: 0, x: isLeft ? 6 : -6 }}
            animate={{ opacity: opacity.gentle, x: 0 }}
            exit={{ opacity: 0, x: isLeft ? 6 : -6 }}
            transition={{ duration: 0.2 }}
          >
            {previewLabel}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Arrow */}
      <motion.div
        animate={{ x: hovered ? (isLeft ? -2 : 2) : 0, opacity: hovered ? opacity.steady : opacity.ambient }}
        transition={{ duration: 0.2 }}
      >
        <svg width="7" height="12" viewBox="0 0 8 14" fill="none">
          <path
            d={isLeft ? 'M6 2L2 7L6 12' : 'M2 2L6 7L2 12'}
            stroke={color}
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
}

// ══════════════════════════════════════════════════
// THE PLAY SURFACE
// ════════════════════════════════════════════════���══

export function PlaySurface({ mode, breath, onResolve }: PlaySurfaceProps) {
  const [phase, setPhase] = useState<PlayPhase>('arrival');
  const [frequencyIndex, setFrequencyIndex] = useState(1); // FOCUS default
  const [threadIndex, setThreadIndex] = useState(0); // GRIT default
  const [beatIndex, setBeatIndex] = useState(0); // PULSE default
  const [volume, setVolume] = useState(0.7);
  /** Depth: voice/music balance (0 = music-forward, 1 = voice-deep) */
  const [depth, setDepth] = useState(0.5);

  // ── PLAY priorities 4-6: mutation, stations, inspector ──
  const [pendingMutation, setPendingMutation] = useState<PlayPendingMutation | null>(null);
  const [mutationApplied, setMutationApplied] = useState(false);
  const appliedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clear pending mutation and briefly flash "APPLIED" confirmation */
  const clearMutationWithConfirmation = useCallback(() => {
    setPendingMutation(null);
    setMutationApplied(true);
    if (appliedTimerRef.current) clearTimeout(appliedTimerRef.current);
    appliedTimerRef.current = setTimeout(() => {
      setMutationApplied(false);
      appliedTimerRef.current = null;
    }, 1200);
  }, []);

  const [showInspector, setShowInspector] = useState(false);

  // ── Persistence — preferences & stations live in the hook, not the shell ──
  const [persistence, persistActions] = usePlayPersistence();
  const { savedStations, hydrated: prefsReady } = persistence;

  // ── Identity & Resilience ──
  const userId = useIndividualId();
  const resilience = useResilience();
  const { isRuntimeAvailable } = resilience;
  /** Which pipeline is actively feeding the audio engine */
  const [activeMode, setActiveMode] = useState<'A' | 'B'>('A');

  const { constraints } = useTemperature();
  const { arrived, delay } = useSurfaceArrival(mode);

  const activeFreq = FREQUENCIES[frequencyIndex];
  const activeThread = THREADS[threadIndex];
  const activeBeat = BEATS[beatIndex];
  const color = FREQUENCY_COLORS[activeFreq.id].hex;

  const isPlaying = phase === 'playing';
  const showControls = phase !== 'arrival';

  // ── Phase transitions — unified arrival via useSurfaceArrival ──
  useEffect(() => {
    setPhase('arrival');
  }, [mode.id]);

  useEffect(() => {
    if (arrived && phase === 'arrival') {
      setPhase('surface');
    }
  }, [arrived, phase]);

  // ── Actions ──
  const togglePlay = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'playing') return 'paused';
      return 'playing';
    });
  }, []);

  const tuneThread = useCallback((dir: 1 | -1) => {
    setThreadIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return THREADS.length - 1;
      if (next >= THREADS.length) return 0;
      return next;
    });
  }, []);

  // ── Keyboard ���─
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'surface' || phase === 'playing' || phase === 'paused') {
          togglePlay();
        }
      }
      if (e.key === 'ArrowLeft' && !e.shiftKey) tuneThread(-1);
      if (e.key === 'ArrowRight' && !e.shiftKey) tuneThread(1);
      // Shift+Arrow → skip track (with haptic)
      if (e.key === 'ArrowLeft' && e.shiftKey && phase === 'playing') {
        e.preventDefault();
        triggerHaptic('light');
        audioEngine.skipPrev();
      }
      if (e.key === 'ArrowRight' && e.shiftKey && phase === 'playing') {
        e.preventDefault();
        triggerHaptic('light');
        audioEngine.skip();
      }
      // Shift+I → toggle runtime inspector
      if (e.key === 'I' && e.shiftKey) {
        e.preventDefault();
        setShowInspector(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, togglePlay, tuneThread, audioEngine]);

  // ── Data: Mode A — Library soundbites via content-runtime ──
  const {
    soundbites,
  } = useContentSoundbites({
    frequency: activeFreq.id,
    threadId: activeThread.id,
    limit: 24,
    enabled: true,
  });

  // ── Audio engine — Web Audio API with AnalyserNode ──
  const audioEngine = useAudioEngine();

  // ── Data: Mode B — Compiled PLAY sessions (graceful degradation) ──
  const playRuntime = usePlayRuntime({
    frequency: activeFreq.id,
    threadId: activeThread.id,
    beatId: activeBeat.id,
    depth,
  });

  // ── Check play-runtime availability on mount ──
  const playRuntimeChecked = useRef(false);
  useEffect(() => {
    if (!playRuntimeChecked.current && isRuntimeAvailable('play')) {
      playRuntimeChecked.current = true;
      playRuntime.checkAvailability().then((available) => {
        console.info(`[play-surface] Mode B runtime ${available ? 'available — will use compiled sessions' : 'not available — using Mode A library'}`);
      });
    }
  }, [isRuntimeAvailable]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync volume control with audio engine
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync depth duck with audio engine (Mode A voice-presence EQ)
  useEffect(() => {
    audioEngine.setDepthDuck(depth);
  }, [depth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Session-stable shuffle seed for picking soundbites
  const shuffleSeed = useRef(Date.now() % 10000);

  // ── Boot and play a random soundbite from the pool (Mode A) ──
  const bootAndPlay = useCallback(async () => {
    setActiveMode('A');
    if (soundbites.length === 0) {
      console.info('[play-surface] No soundbites available for current frequency/thread');
      return;
    }

    // Pick a random soundbite using session-stable seed
    shuffleSeed.current = (shuffleSeed.current * 16807 + 0) % 2147483647;
    const idx = shuffleSeed.current % soundbites.length;
    const soundbite = soundbites[idx];

    console.info(`[play-surface] Booting soundbite: ${soundbite.trackId} (${soundbite.title})`);

    // Use crossfade when switching tracks during active playback
    const useCrossfade = audioEngine.state === 'playing';

    // If the soundbite already has an audio_url from the rail, use it directly
    if (soundbite.audioUrl) {
      const track = {
        trackId: soundbite.trackId,
        audioUrl: soundbite.audioUrl,
        title: soundbite.title,
        type: soundbite.type,
      };
      useCrossfade ? audioEngine.crossfadeToTrack(track, 400) : audioEngine.playTrack(track);
      return;
    }

    // Otherwise, fetch detail for audio_url
    const result = await bootSoundbiteTrack(soundbite.trackId);
    if (result.error || !result.track) {
      console.warn(`[play-surface] Failed to boot track: ${result.error}`);
      return;
    }

    const track = {
      trackId: result.track.trackId,
      audioUrl: result.track.audioUrl,
      title: result.track.title,
      type: result.track.type,
    };
    useCrossfade ? audioEngine.crossfadeToTrack(track, 400) : audioEngine.playTrack(track);
  }, [soundbites, audioEngine]);

  // ── Mode B compile path — attempt compiled session when play-runtime is live ──
  const compileAndPlay = useCallback(async () => {
    if (!playRuntime.available) {
      console.info('[play-surface] Mode B not available — falling back to Mode A');
      bootAndPlay();
      return;
    }

    console.info('[play-surface] Mode B: compiling session...');
    setActiveMode('B');

    const jwt = userId || 'anon';
    const session = await playRuntime.compile(jwt);

    if (!session || session.queue.length === 0) {
      console.warn('[play-surface] Mode B compile returned empty — falling back to Mode A');
      bootAndPlay();
      return;
    }

    console.info(`[play-surface] Mode B: compiled ${session.queue.length} queue items`);
    events.play.sessionStarted(session.sessionId, {
      frequency: activeFreq.id, thread: activeThread.id,
      beat: activeBeat.id, mode: 'B', queueLength: session.queue.length,
    });

    // Map compiled queue → AudioTrack[] and feed to engine
    const audioTracks = session.queue
      .filter(q => q.audioUrl && q.audioUrl.startsWith('http'))
      .map(q => ({
        trackId: q.trackId,
        audioUrl: q.audioUrl,
        title: q.voiceProfile || q.role,
        type: q.type,
      }));

    if (audioTracks.length === 0) {
      console.warn('[play-surface] Mode B: no playable audio URLs — falling back to Mode A');
      bootAndPlay();
      return;
    }

    // Use crossfade when recompiling during active playback (400ms mutation duration)
    if (audioEngine.state === 'playing') {
      audioEngine.crossfadeToQueue(audioTracks, 400);
    } else {
      audioEngine.playQueue(audioTracks);
    }
  }, [playRuntime, userId, activeFreq.id, activeThread.id, activeBeat.id, audioEngine, bootAndPlay]);

  // ── Phase → audio synchronization ──
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (phase === 'playing' && prevPhase !== 'playing') {
      if (audioEngine.state === 'paused') {
        audioEngine.resume();
      } else {
        // Try Mode B first if play-runtime is available, otherwise Mode A
        if (playRuntime.available) {
          compileAndPlay();
        } else {
          bootAndPlay();
        }
      }
    } else if (phase === 'paused' && prevPhase === 'playing') {
      audioEngine.pause();
    } else if ((phase === 'arrival' || phase === 'surface') && (prevPhase === 'playing' || prevPhase === 'paused')) {
      audioEngine.stop();
      setActiveMode('A');
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // When audio engine ends, continue radio (Mode B queue auto-advances internally)
  useEffect(() => {
    if (audioEngine.state === 'ended' && phase === 'playing') {
      const timer = setTimeout(() => {
        if (activeMode === 'B') {
          console.info('[play-surface] Mode B queue exhausted — continuing with Mode A');
        }
        bootAndPlay();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [audioEngine.state, phase, bootAndPlay, activeMode]);

  // When frequency changes during playback, debounced recompile/reboot
  const prevFreqRef = useRef(activeFreq.id);
  const freqDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (prevFreqRef.current !== activeFreq.id && phase === 'playing') {
      const fromFreq = prevFreqRef.current;
      prevFreqRef.current = activeFreq.id;

      // Clear previous debounce timer
      if (freqDebounceRef.current) {
        clearTimeout(freqDebounceRef.current);
      }

      // Show mutation whisper immediately
      setPendingMutation({
        mutationId: `mut-freq-${Date.now()}`,
        type: 'frequency',
        fromValue: fromFreq,
        toValue: activeFreq.id,
        requestedAt: Date.now(),
        phraseSafe: true,
        estimatedMs: 800,
      });
      events.play.mutationRequested('frequency', fromFreq, activeFreq.id);

      // Debounced recompile — waits for rapid frequency cycling to settle
      freqDebounceRef.current = setTimeout(() => {
        if (activeMode === 'B' && playRuntime.available) {
          compileAndPlay();
        } else {
          bootAndPlay();
        }
        clearMutationWithConfirmation();
        freqDebounceRef.current = null;
      }, 500);

      return () => {
        if (freqDebounceRef.current) {
          clearTimeout(freqDebounceRef.current);
        }
      };
    }
    prevFreqRef.current = activeFreq.id;
  }, [activeFreq.id, phase, bootAndPlay, compileAndPlay, activeMode, playRuntime.available, clearMutationWithConfirmation]);

  // ── Derived: audio-reactive values for SonicField ──
  const audioAmplitude = audioEngine.amplitude;
  const audioFreqData = audioEngine.frequencyData;
  const audioCrossfadePhase = audioEngine.crossfadePhase;
  const audioCrossfadeProgress = audioEngine.crossfadeProgress;

  // ── Mutation tracking: when controls change during playback ──
  const prevThreadRef = useRef(activeThread.id);
  const prevBeatRef = useRef(activeBeat.id);
  const prevDepthRef = useRef(depth);
  useEffect(() => {
    if (phase === 'playing') {
      if (prevThreadRef.current !== activeThread.id) {
        setPendingMutation({
          mutationId: `mut-${Date.now()}`,
          type: 'thread',
          fromValue: prevThreadRef.current,
          toValue: activeThread.id,
          requestedAt: Date.now(),
          phraseSafe: true,
        });
        events.play.mutationRequested('thread', prevThreadRef.current, activeThread.id);

        // Mode B: recompile with new thread after phrase-safe delay
        if (activeMode === 'B' && playRuntime.available) {
          setTimeout(() => {
            compileAndPlay();
            clearMutationWithConfirmation();
          }, 1200);
        } else {
          setTimeout(() => clearMutationWithConfirmation(), 2000);
        }
      }
      if (prevBeatRef.current !== activeBeat.id) {
        setPendingMutation({
          mutationId: `mut-${Date.now()}`,
          type: 'beat',
          fromValue: prevBeatRef.current,
          toValue: activeBeat.id,
          requestedAt: Date.now(),
          phraseSafe: false,
        });
        events.play.mutationRequested('beat', prevBeatRef.current, activeBeat.id);

        // Mode B: recompile with new beat (immediate — beat is not phrase-safe)
        if (activeMode === 'B' && playRuntime.available) {
          setTimeout(() => {
            compileAndPlay();
            clearMutationWithConfirmation();
          }, 600);
        } else {
          setTimeout(() => clearMutationWithConfirmation(), 1500);
        }
      }
    }
    prevThreadRef.current = activeThread.id;
    prevBeatRef.current = activeBeat.id;
  }, [activeThread.id, activeBeat.id, phase, activeMode, playRuntime.available, compileAndPlay, clearMutationWithConfirmation]);

  // ── Depth mutation tracking: debounced recompile Mode B on depth dial change ──
  // Debounce prevents rapid scrubbing from spamming compile requests.
  // The whisper shows immediately but compile waits for scrub to settle.
  const depthDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (phase === 'playing' && Math.abs(prevDepthRef.current - depth) > 0.08) {
      const fromLabel = depthLabel(prevDepthRef.current);
      const toLabel = depthLabel(depth);
      if (fromLabel !== toLabel) {
        // Clear any pending debounced compile
        if (depthDebounceRef.current) {
          clearTimeout(depthDebounceRef.current);
          depthDebounceRef.current = null;
        }

        setPendingMutation({
          mutationId: `mut-depth-${Date.now()}`,
          type: 'depth',
          fromValue: fromLabel,
          toValue: toLabel,
          requestedAt: Date.now(),
          phraseSafe: true,
          estimatedMs: 1800,
        });
        events.play.mutationRequested('depth', fromLabel, toLabel);

        // Mode B: debounced recompile — waits for scrub to settle
        if (activeMode === 'B' && playRuntime.available) {
          depthDebounceRef.current = setTimeout(() => {
            compileAndPlay();
            clearMutationWithConfirmation();
            depthDebounceRef.current = null;
          }, 1800);
        } else {
          depthDebounceRef.current = setTimeout(() => {
            clearMutationWithConfirmation();
            depthDebounceRef.current = null;
          }, 2500);
        }
      }
      prevDepthRef.current = depth;
    }

    return () => {
      if (depthDebounceRef.current) {
        clearTimeout(depthDebounceRef.current);
      }
    };
  }, [depth, phase, activeMode, playRuntime.available, compileAndPlay, clearMutationWithConfirmation]);

  // ── Save station handler — delegates to persistence hook ──
  const handleSaveStation = useCallback(() => {
    const station: PlaySavedStation = {
      stationId: `station-${Date.now()}`,
      name: `${activeFreq.label} · ${activeThread.label}`,
      frequency: activeFreq.id,
      thread: activeThread.id,
      beat: activeBeat.id,
      depth,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      playCount: 0,
    };
    persistActions.saveStation(station);
  }, [activeFreq, activeThread, activeBeat, depth, persistActions]);

  // ── Load station handler ──
  const handleLoadStation = useCallback((station: PlaySavedStation) => {
    const freqIdx = FREQUENCIES.findIndex(f => f.id === station.frequency);
    const threadIdx = THREADS.findIndex(t => t.id === station.thread);
    const beatIdx = BEATS.findIndex(b => b.id === station.beat);
    if (freqIdx >= 0) setFrequencyIndex(freqIdx);
    if (threadIdx >= 0) setThreadIndex(threadIdx);
    if (beatIdx >= 0) setBeatIndex(beatIdx);
    setDepth(station.depth);
  }, []);

  // ── Preferences hydration — load once from persistence hook ──
  const prefsHydrated = useRef(false);
  const prefsLoadRequested = useRef(false);
  useEffect(() => {
    if (prefsLoadRequested.current) return;
    prefsLoadRequested.current = true;
    persistActions.loadPreferences().then((prefs) => {
      const vol = Number(prefs.volume);
      const dep = Number(prefs.depth);
      setVolume(Number.isFinite(vol) ? Math.max(0, Math.min(1, vol)) : 0.7);
      setDepth(Number.isFinite(dep) ? Math.max(0, Math.min(1, dep)) : 0.5);
      const fi = Number(prefs.frequencyIndex);
      const ti = Number(prefs.threadIndex);
      const bi = Number(prefs.beatIndex);
      if (Number.isFinite(fi) && fi >= 0 && fi < FREQUENCIES.length) {
        setFrequencyIndex(Math.floor(fi));
      }
      if (Number.isFinite(ti) && ti >= 0 && ti < THREADS.length) {
        setThreadIndex(Math.floor(ti));
      }
      if (Number.isFinite(bi) && bi >= 0 && bi < BEATS.length) {
        setBeatIndex(Math.floor(bi));
      }
      console.info(`[play-surface] Preferences hydrated from persistence hook`);
      setTimeout(() => { prefsHydrated.current = true; }, 100);
    });
  }, [persistActions]);

  // ── Debounced save preferences via persistence hook ──
  useEffect(() => {
    if (!prefsHydrated.current) return;
    persistActions.savePreferences({
      volume, depth,
      frequencyIndex, threadIndex, beatIndex,
    });
  }, [volume, depth, frequencyIndex, threadIndex, beatIndex, persistActions]);

  // ── Runtime health state for inspector ──
  const runtimeHealth: PlayRuntimeHealthState = useMemo(() => ({
    connected: playRuntime.available,
    mode: activeMode === 'B' && playRuntime.available ? 'live' as const : 'mock' as const,
    sessionActive: !!playRuntime.session,
    queueDepth: playRuntime.session?.queue?.length ?? 0,
    currentTrackId: audioEngine.currentTrack?.trackId ?? null,
    pendingMutations: pendingMutation ? 1 : 0,
    lastEventTimestamp: Date.now(),
    errors: playRuntime.error ? [playRuntime.error] : [],
  }), [playRuntime, audioEngine.currentTrack, pendingMutation, activeMode]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      {/* ═══ BACKGROUND: Frequency Signature Canvas ═══ */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: room.void }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFreq.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <FrequencySignature
              frequency={activeFreq.id}
              intensity={isPlaying ? 0.9 : 0.5}
              playing={isPlaying}
            />
          </motion.div>
        </AnimatePresence>

        {/* Depth vignette — tightens as depth increases (bodily, not technical) */}
        {/* At low depth the room feels open, at high depth the space contracts around you */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(ellipse ${80 - depth * 25}% ${70 - depth * 20}% at 50% 50%, transparent 20%, ${void_.dim} 100%)`,
            transition: 'background 1.2s ease',
          }}
        />
        {/* Bottom depth — orb territory */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `linear-gradient(to bottom, transparent ${55 - depth * 10}%, ${void_.deep} ${80 - depth * 5}%, ${void_.curtain} 100%)`,
            transition: 'background 1.2s ease',
          }}
        />
        {/* Depth warmth — subtle color wash that intensifies with depth */}
        {depth > 0.3 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 55%, ${color}${Math.round((depth - 0.3) * 8).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
              transition: 'background 1.5s ease',
            }}
          />
        )}
      </div>

      {/* ═══ CONTENT LAYER ═══ */}
      <div
        className="absolute inset-0 flex flex-col justify-end"
        style={{ zIndex: layer.raised }}
      >
        {/* ── Arrival canopy — luminous threshold into the room ── */}
        <AnimatePresence>
          {phase === 'arrival' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              style={{ pointerEvents: 'none' }}
            >
              <div className="flex flex-col items-center gap-6" style={{ maxWidth: '75%' }}>
                {/* Threshold line */}
                <motion.div
                  style={{
                    width: '35%', height: 1,
                    background: `linear-gradient(90deg, transparent, ${color}18, transparent)`,
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Surface label */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: opacity.quiet, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.micro,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.wide,
                    textTransform: 'uppercase' as const,
                    color,
                  }}
                >
                  PLAY
                </motion.span>

                {/* Canopy copy */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: opacity.spoken, y: 0 }}
                  transition={{ delay: 0.45, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    ...TYPOGRAPHY.description,
                    color: room.fg,
                    textAlign: 'center',
                    maxWidth: '240px',
                  }}
                >
                  {mode.canopy}
                </motion.p>

                {/* Lower threshold */}
                <motion.div
                  style={{
                    width: '20%', height: 1,
                    background: `linear-gradient(90deg, transparent, ${color}0C, transparent)`,
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero zone: Play gesture + Sonic field + Depth ── */}
        <div className="flex-1 flex flex-col items-center justify-center" style={{ pointerEvents: 'none' }}>
          <AnimatePresence>
            {showControls && (
              <motion.div
                className="flex flex-col items-center gap-3"
                style={{ pointerEvents: 'auto' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: SURFACE_DURATION, delay: delay('content'), ease: SURFACE_EASE as unknown as number[] }}
              >
                {/* Frequency eyebrow */}
                <motion.div
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay('eyebrow'), duration: SURFACE_DURATION }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: 4,
                      height: 4,
                      background: color,
                      boxShadow: glow.mid(color, '40'),
                      opacity: opacity.body,
                    }}
                  />
                  <span
                    style={{
                      ...TYPOGRAPHY.eyebrow,
                      color,
                      opacity: opacity.spoken,
                    }}
                  >
                    {activeFreq.label}
                  </span>
                </motion.div>

                {/* Whisper — frequency description */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeFreq.id}
                    style={{
                      ...TYPOGRAPHY.description,
                      color: room.fg,
                      opacity: opacity.emerging,
                      textAlign: 'center',
                      maxWidth: '200px',
                      margin: 0,
                    }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: opacity.emerging, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.5 }}
                  >
                    {activeFreq.whisper}
                  </motion.p>
                </AnimatePresence>

                {/* Sonic field waveform — atmosphere above the hero */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay('content'), duration: SURFACE_DURATION }}
                  style={{ marginBottom: 4 }}
                >
                  <SonicField
                    color={color}
                    breath={breath}
                    playing={isPlaying}
                    volume={volume}
                    frequencyData={audioFreqData}
                    amplitude={audioAmplitude}
                    crossfadePhase={audioCrossfadePhase}
                    crossfadeProgress={audioCrossfadeProgress}
                    onSwipeLeft={() => { triggerHaptic('medium'); audioEngine.skip(); }}
                    onSwipeRight={() => { triggerHaptic('medium'); audioEngine.skipPrev(); }}
                  />
                </motion.div>

                {/* ═══ HERO ROW: Depth | Play | Depth mirror ═══ */}
                <div className="flex items-center gap-8">
                  {/* Depth control — left side */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay('controls'), duration: SURFACE_DURATION }}
                  >
                    <DepthControl
                      depth={depth}
                      color={color}
                      breath={breath}
                      onChange={setDepth}
                    />
                  </motion.div>

                  {/* THE HERO — Play gesture, centered and heroised */}
                  <PlayGesture
                    playing={isPlaying}
                    color={color}
                    breath={breath}
                    depth={depth}
                    amplitude={audioAmplitude}
                    onClick={togglePlay}
                  />

                  {/* Volume control — right side, mirrors depth */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay('controls'), duration: SURFACE_DURATION }}
                  >
                    <VolumeControl
                      volume={volume}
                      color={color}
                      breath={breath}
                      onChange={setVolume}
                    />
                  </motion.div>
                </div>

                {/* ═══ SKIP TRANSPORT — appears during playback ═══ */}
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      style={{ marginTop: 4, marginBottom: 2 }}
                    >
                      <SkipTransport
                        color={color}
                        breath={breath}
                        playing={isPlaying}
                        onSkipPrev={() => audioEngine.skipPrev()}
                        onSkipNext={() => audioEngine.skip()}
                        onScrub={(offset) => audioEngine.seekBy(offset)}
                        onSeekTo={(pos) => audioEngine.seekTo(pos)}
                        canSkipPrev={audioEngine.currentIndex > 0 || (audioEngine.state === 'playing')}
                        canSkipNext={audioEngine.queueLength > 0 && audioEngine.currentIndex < audioEngine.queueLength - 1}
                        crossfadePhase={audioCrossfadePhase}
                        queuePosition={audioEngine.currentIndex + 1}
                        queueLength={audioEngine.queueLength}
                        trackProgress={audioEngine.duration > 0 ? audioEngine.currentTime / audioEngine.duration : 0}
                        currentTime={audioEngine.currentTime}
                        duration={audioEngine.duration}
                        frequencyData={audioEngine.frequencyData}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active state context — thread · beat whisper below hero */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay('controls'), duration: SURFACE_DURATION }}
                  style={{ marginTop: 2 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeThread.id}
                      style={{
                        fontFamily: font.sans,
                        fontSize: typeSize.label,
                        fontWeight: weight.medium,
                        letterSpacing: tracking.normal,
                        color,
                        opacity: opacity.present,
                      }}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: opacity.present, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeThread.label}
                    </motion.span>
                  </AnimatePresence>
                  <div className="rounded-full" style={{ width: 2, height: 2, background: color, opacity: opacity.murmur }} />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeBeat.id}
                      style={{
                        fontFamily: font.sans,
                        fontSize: typeSize.label,
                        fontWeight: weight.medium,
                        letterSpacing: tracking.normal,
                        color,
                        opacity: opacity.present,
                      }}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: opacity.present, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeBeat.label}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom settings constellation — alive and responsive ── */}
        <AnimatePresence>
          {showControls && !isPlaying && (
            <motion.div
              className="flex flex-col items-center gap-5 px-6"
              style={{ paddingBottom: ORB_CLEARANCE }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.4 } }}
              transition={{ delay: delay('controls'), duration: SURFACE_DURATION, ease: SURFACE_EASE as unknown as number[] }}
            >
              {/* ── Thread tuner — with arrows + hover previews ── */}
              <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay('controls'), duration: SURFACE_DURATION }}
              >
                {/* Prev arrow + preview */}
                <ThreadArrow
                  direction={-1}
                  color={color}
                  previewLabel={THREADS[(threadIndex - 1 + THREADS.length) % THREADS.length].label}
                  onClick={() => tuneThread(-1)}
                />

                <div className="flex items-center gap-3" style={{ minWidth: 80, justifyContent: 'center' }}>
                  <span style={{ fontFamily: font.sans, fontSize: typeSize.whisperUp, fontWeight: weight.medium, letterSpacing: tracking.normal, color: room.fg, opacity: opacity.murmur }}>THRD</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeThread.id}
                      style={{ fontFamily: font.sans, fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.lift, color, opacity: opacity.steady }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: opacity.steady, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                    >
                      {activeThread.label}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Next arrow + preview */}
                <ThreadArrow
                  direction={1}
                  color={color}
                  previewLabel={THREADS[(threadIndex + 1) % THREADS.length].label}
                  onClick={() => tuneThread(1)}
                />
              </motion.div>

              {/* ── Unified constellation: Beat · Frequency ── */}
              {/* Beat and Frequency selectors sit as one breathing organism */}
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay('peripherals'), duration: SURFACE_DURATION, ease: SURFACE_EASE as unknown as number[] }}
              >
                {/* Beat row */}
                <div className="flex items-center justify-center gap-5">
                  {BEATS.map((beat, i) => {
                    const isActive = beatIndex === i;
                    const breathGlow = isActive ? (1 + Math.sin(breath * Math.PI * 2) * 0.3) : 1;
                    return (
                      <motion.button
                        key={beat.id}
                        onClick={(e) => { e.stopPropagation(); setBeatIndex(i); }}
                        className="flex flex-col items-center gap-1 cursor-pointer relative"
                        style={{ background: 'none', border: 'none', padding: '3px 2px' }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.92 }}
                      >
                        {/* Breathing haze — active items pulse with breath */}
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: isActive ? 28 * breathGlow : 14,
                            height: isActive ? 28 * breathGlow : 14,
                            top: '20%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle, ${color}${isActive ? '12' : '04'} 0%, transparent 70%)`,
                            transition: timing.t.morphMid,
                          }}
                        />
                        <div
                          className="rounded-full"
                          style={{
                            width: isActive ? 5 : 3,
                            height: isActive ? 5 : 3,
                            background: `radial-gradient(circle at 40% 38%, ${color}${isActive ? '55' : '18'}, ${color}10 70%, transparent)`,
                            boxShadow: isActive ? `0 0 8px ${color}28` : 'none',
                            transition: timing.t.shift,
                          }}
                        />
                        <span style={{
                          fontFamily: font.sans, fontSize: typeSize.whisperUp, fontWeight: weight.medium,
                          letterSpacing: tracking.spread, whiteSpace: 'nowrap',
                          color: isActive ? color : `${room.fg}26`,
                          opacity: isActive ? opacity.body : opacity.gentle,
                          transition: timing.t.colorOpacityMid,
                        }}>
                          {beat.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Beat whisper — active beat's sonic character */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeBeat.id}
                    style={{
                      fontFamily: font.serif,
                      fontSize: 'clamp(10px, 2.5vw, 12px)',
                      fontWeight: weight.light,
                      fontStyle: 'italic',
                      color: room.fg,
                      opacity: opacity.emerging,
                      textAlign: 'center',
                      margin: 0,
                    }}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: opacity.emerging, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.4 }}
                  >
                    {activeBeat.whisper}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Playing state: frequency constellation + thread · beat whisper above orb ── */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              className="flex flex-col items-center gap-3"
              style={{ paddingBottom: ORB_CLEARANCE }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Frequency dots — glass-carved feel */}
              <div className="flex items-center gap-7">
                {FREQUENCIES.map((freq, i) => {
                  const isActive = frequencyIndex === i;
                  const freqColor = FREQUENCY_COLORS[freq.id].hex;
                  const breathGlow = isActive ? (1 + Math.sin(breath * Math.PI * 2 + i) * 0.3) : 1;
                  return (
                    <motion.button
                      key={freq.id}
                      onClick={(e) => { e.stopPropagation(); setFrequencyIndex(i); }}
                      className="cursor-pointer relative flex flex-col items-center gap-1"
                      style={{ background: 'none', border: 'none', padding: '4px 6px' }}
                      whileTap={{ scale: 0.92 }}
                    >
                      {/* Atmospheric halo */}
                      {isActive && (
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: 22 * breathGlow,
                            height: 22 * breathGlow,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle, ${freqColor}0C, transparent 70%)`,
                            transition: timing.t.resizeBrisk,
                          }}
                        />
                      )}
                      <div
                        className="rounded-full"
                        style={{
                          width: isActive ? 5 : 3,
                          height: isActive ? 5 : 3,
                          background: isActive ? freqColor : glaze.sheen,
                          boxShadow: isActive ? glow.soft(freqColor, '30') : 'none',
                          opacity: isActive ? opacity.body : opacity.present,
                          transition: `all ${timing.dur.mid}`,
                        }}
                      />
                      {/* Frequency label — only for active, trace opacity */}
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity.trace }}
                          style={{
                            fontFamily: font.sans,
                            fontSize: typeSize.sub,
                            fontWeight: weight.medium,
                            letterSpacing: tracking.spread,
                            color: freqColor,
                          }}
                        >
                          {freq.label}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Orb clearance when not showing bottom controls ── */}
      </div>

      {/* ═══ PLAY PRIORITY 4: Pending Mutation Whisper + Applied Confirmation ═══ */}
      <AnimatePresence>
        {(pendingMutation || mutationApplied) && isPlaying && (
          <div
            className="absolute flex justify-center pointer-events-none"
            style={{ bottom: ORB_CLEARANCE + 40, left: 0, right: 0, zIndex: layer.float }}
          >
            <MutationWhisper mutation={pendingMutation} applied={mutationApplied} color={color} breath={breath} />
          </div>
        )}
      </AnimatePresence>

      {/* ═══ PLAY PRIORITY 5: Saved Station Shell ═══ */}
      <AnimatePresence>
        {showControls && !isPlaying && (
          <div
            className="absolute flex justify-center"
            style={{ top: 12, left: 0, right: 0, zIndex: layer.float }}
          >
            <SavedStationShell
              stations={savedStations}
              color={color}
              onLoad={handleLoadStation}
              onSave={handleSaveStation}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ═══ PLAY PRIORITY 6: Quiet Runtime Inspector (Shift+I) ═══ */}
      <AnimatePresence>
        {showInspector && (
          <RuntimeInspector health={runtimeHealth} color={color} />
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="play" position="top-left" />
    </div>
  );
}