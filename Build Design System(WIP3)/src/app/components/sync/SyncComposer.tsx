/**
 * SYNC COMPOSER — The Typographic Orchestrator
 *
 * Wraps an atom and layers the 3-beat copy sequence on top.
 * CSS transitions drive all depth-plane animations.
 * The atom canvas runs its own rAF internally.
 *
 * NO BOXES. NO PILLS. NO BORDERS.
 * Text is positioned by spatial proximity and typographic weight alone.
 */

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { room, font, tracking, typeSize, weight, opacity, timing, void_, layer, layout } from '../design-system/surface-tokens';
import type {
  SyncComposition,
  Beat,
  CopyType,
  DepthLayer,
  SyncPayload,
} from './sync-types';
import { DEPTH_LAYERS, BEAT_TIMING, TYPO_CONFIG } from './sync-types';

// ═══════════════════════════════════════════════════
// DEPTH RENDERER
// ═══════════════════════════════════════════════════

export interface DepthProps {
  layer: DepthLayer;
  opacity?: number;
  blur?: number;
  transitionSpeed?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function DepthPlane({ layer, opacity, blur, transitionSpeed, children, style, className }: DepthProps) {
  const config = DEPTH_LAYERS[layer];
  const resolvedBlur = blur ?? config.blur;
  const resolvedOpacity = opacity ?? config.opacity;
  const speed = transitionSpeed || 'filter 0.8s ease, opacity 0.6s ease, transform 1.2s ease';

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        filter: resolvedBlur > 0.1 ? `blur(${resolvedBlur}px)` : 'none',
        opacity: resolvedOpacity,
        transform: `scale(${config.scale})`,
        willChange: 'filter, opacity, transform',
        transition: speed,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COPY CONTAINER
// ═══════════════════════════════════════════════════

export interface CopyContainerProps {
  payload: SyncPayload;
  anchorOverride?: 'center' | 'upper-third' | 'lower-third';
  touchPosition?: { x: number; y: number };
  viewport: { width: number; height: number };
}

function getCopyStyle(type: CopyType): React.CSSProperties {
  const config = TYPO_CONFIG[type];
  return {
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
    fontWeight: config.fontWeight,
    letterSpacing: config.letterSpacing,
    lineHeight: config.lineHeight,
    textTransform: config.textTransform as React.CSSProperties['textTransform'],
    fontStyle: config.fontStyle as React.CSSProperties['fontStyle'],
    color: room.fg,
    textAlign: 'center',
    maxWidth: `${config.maxWidthFrac * 100}%`,
    margin: '0 auto',
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
  };
}

function getAnchorPosition(
  type: CopyType,
  override?: 'center' | 'upper-third' | 'lower-third',
  touchPos?: { x: number; y: number },
): React.CSSProperties {
  const config = TYPO_CONFIG[type];
  const anchor = override || config.anchor;

  if (anchor === 'touch-locked' && touchPos) {
    return {
      position: 'absolute',
      left: `${touchPos.x * 100}%`,
      top: `${Math.max(8, touchPos.y * 100 - 12)}%`,
      transform: 'translate(-50%, -100%)',
      transition: `left ${timing.dur.quick} ease, top ${timing.dur.quick} ease`,
    };
  }

  switch (anchor) {
    case 'upper-third':
      return { position: 'absolute', top: '15%', left: 0, right: 0 };
    case 'lower-third':
      return { position: 'absolute', bottom: '18%', left: 0, right: 0 };
    case 'center':
    default:
      return {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
      };
  }
}

export function CopyContainer({ payload, anchorOverride, touchPosition, viewport }: CopyContainerProps) {
  const textStyle = getCopyStyle(payload.type);
  const posStyle = getAnchorPosition(payload.type, anchorOverride, touchPosition);

  return (
    <div style={{ ...posStyle, padding: '0 8%' }}>
      <div style={textStyle}>{payload.text}</div>
      {payload.subtext && (
        <div
          style={{
            ...textStyle,
            fontSize: typeSize.micro,
            fontWeight: weight.regular,
            letterSpacing: tracking.breath,
            textTransform: 'uppercase',
            color: room.fg,
            opacity: opacity.spoken,
            marginTop: 10,
          }}
        >
          {payload.subtext}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ATMOSPHERIC TEXT
// ═══════════════════════════════════════════════════

export function AtmosphericText({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '6%',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: font.sans,
        fontSize: typeSize.micro,
        fontWeight: weight.regular,
        letterSpacing: tracking.breath,
        textTransform: 'uppercase',
        color: room.fg,
        opacity: visible ? 0.06 : 0,
        transition: timing.t.fadeEmerge,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {text}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// THE SYNC COMPOSER
// ═══════════════════════════════════════════════════

const ORB_CLEARANCE = layout.orbClearance;

export interface SyncComposerProps {
  composition: SyncComposition;
  atomElement: ReactNode;
  viewport: { width: number; height: number };
  beatOverride?: Beat;
  atomProgressOverride?: number;
  onSequenceComplete?: () => void;
}

export function SyncComposer({
  composition,
  atomElement,
  viewport,
  beatOverride,
  atomProgressOverride,
  onSequenceComplete,
}: SyncComposerProps) {
  // ─── State ───
  const [beat, setBeat] = useState<Beat>('entrance');
  const [atomProgress, setAtomProgress] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const [touchPos, setTouchPos] = useState({ x: 0.5, y: 0.5 });
  const [resolutionPhase, setResolutionPhase] = useState<
    'hidden' | 'appear' | 'linger' | 'dissolve' | 'gone'
  >('hidden');

  // Entrance delay — let text fade in after mount
  const [entranceReady, setEntranceReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntranceReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const activeBeat = beatOverride || beat;
  const activeProgress = atomProgressOverride ?? atomProgress;

  // ─── Resolution lifecycle: appear → linger → dissolve → gone ───
  useEffect(() => {
    if (activeBeat === 'release' && resolutionPhase === 'hidden') {
      setResolutionPhase('appear');
    }
  }, [activeBeat, resolutionPhase]);

  useEffect(() => {
    if (resolutionPhase === 'appear') {
      const t = setTimeout(() => setResolutionPhase('linger'), BEAT_TIMING.resolutionAppear * 1000);
      return () => clearTimeout(t);
    }
    if (resolutionPhase === 'linger') {
      const t = setTimeout(() => setResolutionPhase('dissolve'), BEAT_TIMING.resolutionLinger * 1000);
      return () => clearTimeout(t);
    }
    if (resolutionPhase === 'dissolve') {
      const t = setTimeout(() => {
        setResolutionPhase('gone');
        onSequenceComplete?.();
      }, BEAT_TIMING.resolutionDissolve * 1000);
      return () => clearTimeout(t);
    }
  }, [resolutionPhase, onSequenceComplete]);

  // ─── Touch tracking ───
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      setIsTouching(true);
      const rect = el.getBoundingClientRect();
      setTouchPos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      setTouchPos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    const onUp = () => setIsTouching(false);

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, []);

  // ─── Compute visual state from beat + progress ───
  const isEntrance = activeBeat === 'entrance';
  const isFriction = activeBeat === 'friction';
  const isRelease = activeBeat === 'release';

  // Entrance block
  const entranceVisible = isEntrance && entranceReady;
  const entranceOpacity = entranceVisible ? 0.85 : 0;
  const entranceBlur = isFriction ? 6 : 0;

  // Anecdote
  const anecdoteOpacity = entranceVisible ? 0.3 : 0;

  // Directive
  const directiveOpacity = isFriction ? 0.85 : 0;

  // Reframe — emerges based on atom progress during friction
  const reframeProgress = isFriction ? Math.min(1, activeProgress * 2) : 0;
  const reframeBlur = (1 - reframeProgress) * DEPTH_LAYERS.background.blur;
  const reframeOpacity = reframeProgress * 0.7;

  // Resolution
  const resolutionOpacity =
    resolutionPhase === 'appear' || resolutionPhase === 'linger' ? 0.9 :
    resolutionPhase === 'dissolve' ? 0 : 0;
  const resolutionVisible = resolutionPhase !== 'hidden' && resolutionPhase !== 'gone';

  // Atmospheric
  const atmosphericVisible = !isRelease || resolutionPhase === 'hidden';

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: room.void,
      }}
    >
      {/* ═══ ATOM CANVAS — z:1 ═══ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: layer.base }}>
        {atomElement}
      </div>

      {/* ═══ COPY LAYER — z:2 ═══ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: layer.content,
          pointerEvents: 'none',
        }}
      >
        {/* ── ATMOSPHERIC ── */}
        {composition.atmospheric && (
          <AtmosphericText text={composition.atmospheric} visible={atmosphericVisible} />
        )}

        {/* ── BEAT 1: ENTRANCE — primary text ── */}
        <DepthPlane
          layer="foreground"
          opacity={entranceOpacity}
          blur={entranceBlur}
          transitionSpeed={`opacity ${BEAT_TIMING.entranceFadeIn}s ease, filter ${BEAT_TIMING.entranceRecede}s ease, transform 1.2s ease`}
        >
          <CopyContainer
            payload={composition.entrance.primary}
            viewport={viewport}
          />
        </DepthPlane>

        {/* ── ENTRANCE ANECDOTE — midground ── */}
        {composition.entrance.anecdote && (
          <DepthPlane
            layer="midground"
            opacity={anecdoteOpacity}
            transitionSpeed={`opacity ${BEAT_TIMING.entranceFadeIn * 1.3}s ease, filter 1s ease, transform 1.2s ease`}
          >
            <CopyContainer
              payload={composition.entrance.anecdote}
              viewport={viewport}
            />
          </DepthPlane>
        )}

        {/* ── BEAT 2: DIRECTIVE — locks near touch ── */}
        <DepthPlane
          layer="foreground"
          opacity={directiveOpacity}
          transitionSpeed={`opacity ${BEAT_TIMING.directiveAppear}s ease, filter 0.3s ease, transform 0.5s ease`}
        >
          <CopyContainer
            payload={composition.friction.directive}
            touchPosition={isTouching ? touchPos : undefined}
            viewport={viewport}
          />
        </DepthPlane>

        {/* ── BEAT 2: REFRAME — emerges from depth ── */}
        <DepthPlane
          layer="foreground"
          opacity={reframeOpacity}
          blur={reframeBlur}
          transitionSpeed={`opacity ${BEAT_TIMING.reframeEmergence}s ease, filter ${BEAT_TIMING.reframeEmergence}s ease, transform 1.5s ease`}
        >
          <CopyContainer
            payload={composition.friction.reframe}
            viewport={viewport}
          />
        </DepthPlane>

        {/* ── BEAT 3: RESOLUTION ── */}
        {resolutionVisible && (
          <DepthPlane
            layer="foreground"
            opacity={resolutionOpacity}
            blur={0}
            transitionSpeed={`opacity ${resolutionPhase === 'dissolve' ? BEAT_TIMING.resolutionDissolve : BEAT_TIMING.resolutionAppear}s ease, filter 0.5s ease, transform 2s ease`}
            style={{
              letterSpacing: resolutionPhase === 'dissolve' ? '0.2em' : '0.06em',
            }}
          >
            <CopyContainer
              payload={composition.release.resolution}
              viewport={viewport}
            />
          </DepthPlane>
        )}
      </div>

      {/* ── ORB CLEARANCE ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: ORB_CLEARANCE,
          background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
          zIndex: layer.raised,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STANDALONE COPY RENDERER
// ═══════════════════════════════════════════════════

interface StandaloneCopyProps {
  payload: SyncPayload;
  depth: DepthLayer;
  viewport: { width: number; height: number };
  opacity?: number;
  anchor?: 'center' | 'upper-third' | 'lower-third';
}

export function StandaloneCopy({ payload, depth, viewport, opacity = 1, anchor }: StandaloneCopyProps) {
  return (
    <DepthPlane layer={depth} opacity={DEPTH_LAYERS[depth].opacity * opacity}>
      <CopyContainer payload={payload} anchorOverride={anchor} viewport={viewport} />
    </DepthPlane>
  );
}