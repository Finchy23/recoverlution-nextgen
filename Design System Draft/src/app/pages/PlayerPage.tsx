/**
 * NAVICUE PLAYER
 * ==============
 *
 * The full-screen immersive NaviCue composition player.
 * This is Recoverlution's equivalent of the Apple App player —
 * the final delivery surface where all 7 layers compose into
 * a single therapeutic experience.
 *
 * NOW WIRED to the centralized composition-engine.ts — no local
 * buildComposition() duplication. All colors through design tokens.
 *
 * QUERY PARAMS (Showcase handoff):
 *   ?atom=<AtomId>        — pre-select hero atom
 *   ?voice=<VoiceLaneId>  — pre-select voice lane
 *   ?color=<ColorSigId>   — pre-select color signature
 *   ?breath=<BreathId>    — pre-select breath pattern
 *   ?density=<DensityId>  — pre-select narrative density
 *
 * ROUTE: /player
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router';
import { colors, fonts, surfaces, withAlpha, TRANSPARENT } from '@/design-tokens';
import { workspaceNavAccents } from './design-center/dc-tokens';
import type {
  NaviCueComposition,
  VoiceLaneId,
  EntranceArchitectureId,
  ExitTransitionId,
  ColorSignatureId,
  BreathPatternId,
  HeatBand,
  AtomicVoicePayload,
  NarrativeDensity,
} from '@/navicue-types';
import {
  VOICE_LANES,
  VOICE_LANE_IDS,
  ENTRANCES,
  ENTRANCE_IDS,
  EXITS,
  EXIT_IDS,
  COLOR_SIGNATURES,
  COLOR_SIGNATURE_IDS,
  ENTRANCE_COPY,
  EXIT_COPY,
  MOTION_CURVES,
  ATOM_112_WORKED_EXAMPLES,
} from '@/navicue-data';
import { NaviCueCompositor } from '@/app/components/NaviCueCompositor';
import { usePhaseOrchestrator } from '@/app/hooks/usePhaseOrchestrator';
import {
  ATOM_CATALOG,
  ATOM_IDS,
  ATOM_COMPONENTS,
  SERIES_CATALOG,
  type AtomId,
} from '@/app/components/atoms';
import { ATOM_CONTENT_PROFILES } from '@/app/data/atom-content-profiles';
import { buildComposition as buildCompositionFromEngine, type CompositionInput } from '@/app/data/composition-engine';
import { getAtomCopyProfile } from '@/app/data/atom-copy-profile';

// ─── Constants ──────────────────────────────────────────────────

const ACCENT = workspaceNavAccents.player;

// ─── Device Preview ─────────────────────────────────────────────

type DeviceMode = 'fullscreen' | 'mobile' | 'desktop';

const DEVICE_FRAMES: Record<Exclude<DeviceMode, 'fullscreen'>, { width: number; height: number; label: string; radius: number }> = {
  mobile: { width: 390, height: 844, label: 'iPhone 15 · 390×844', radius: 44 },
  desktop: { width: 1280, height: 800, label: 'Desktop · 1280×800', radius: 10 },
};

// ── Composition Builder (delegates to composition-engine) ──────

function buildComposition(config: {
  atomId: AtomId;
  voiceLane: VoiceLaneId;
  entrance: EntranceArchitectureId;
  exit: ExitTransitionId;
  colorSignature: ColorSignatureId;
  breathPattern: BreathPatternId;
  narrativeDensity: NarrativeDensity;
}): NaviCueComposition {
  const { atomId, voiceLane, entrance, exit, colorSignature, breathPattern, narrativeDensity } = config;
  const contentProfile = ATOM_CONTENT_PROFILES[atomId];

  // Build atomic voice payload — use worked example if atom 112
  let atomicVoice: AtomicVoicePayload | undefined;
  if (atomId === 'micro-step-shrink') {
    const example = ATOM_112_WORKED_EXAMPLES[voiceLane];
    atomicVoice = {
      anchorPrompt: { text: example.anchorPrompt },
      kineticPayload: { text: example.kineticPayload },
      ambientSubtext: { text: example.ambientSubtext },
      metacognitiveTag: { text: example.metacognitiveTag },
      thresholdShift: { before: example.thresholdShift.before, after: example.thresholdShift.after },
      shadowNode: example.shadowNode ? { text: example.shadowNode } : undefined,
    };

    if (example.midInteraction.type === 'friction') {
      atomicVoice.reactiveFriction = {
        states: {
          start: example.midInteraction.start,
          mid: example.midInteraction.mid,
          max: example.midInteraction.max,
        },
      };
    } else {
      atomicVoice.progressiveSequence = {
        steps: example.midInteraction.steps,
      };
    }
  }

  // Use the centralized composition engine
  const input: CompositionInput = {
    schemaTarget: 'defectiveness',
    heatBand: 3 as HeatBand,
    chronoContext: 'morning',
    colorSignature,
    visualEngine: 'gradient-mesh',
    engineParams: { density: 0.6, speed: 0.3, complexity: 0.7, reactivity: 0.5, depth: 0.6 },
    responseProfile: 'resonance',
    breathPattern,
    arrivalCurve: 'arrival',
    departureCurve: 'departure',
    voiceLane,
    entranceMaterialization: 'emerge',
    exitMaterialization: exit === 'burn-in' ? 'burn-in' : exit === 'immediate' ? 'immediate' : 'emerge',
    entrance,
    exit,
    atomId,
    primaryGesture: contentProfile.primaryGesture,
    useResolutionMatrix: false,
    atomicVoice,
    narrativeDensity,
  };

  return buildCompositionFromEngine(input);
}

// ─── Control Panel ──────────────────────────────────────────────

function ControlPanel({
  config,
  onConfigChange,
  phase,
  onStart,
  onReset,
  onSkipToActive,
  onResolve,
  deviceMode,
  onDeviceModeChange,
}: {
  config: {
    atomId: AtomId;
    voiceLane: VoiceLaneId;
    entrance: EntranceArchitectureId;
    exit: ExitTransitionId;
    colorSignature: ColorSignatureId;
    breathPattern: BreathPatternId;
    narrativeDensity: NarrativeDensity;
  };
  onConfigChange: (key: string, value: string) => void;
  phase: string;
  onStart: () => void;
  onReset: () => void;
  onSkipToActive: () => void;
  onResolve: () => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Get atoms that have built components
  const builtAtoms = ATOM_IDS.filter(id => ATOM_COMPONENTS[id]);

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    background: withAlpha(colors.neutral.white, 0.04),
    border: `1px solid ${withAlpha(colors.neutral.white, 0.08)}`,
    borderRadius: 6,
    color: colors.neutral.white,
    fontFamily: fonts.mono,
    fontSize: 10,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors.neutral.white,
    opacity: 0.3,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  };

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    background: active ? withAlpha(ACCENT, 0.3) : withAlpha(colors.neutral.white, 0.04),
    border: `1px solid ${active ? withAlpha(ACCENT, 0.4) : withAlpha(colors.neutral.white, 0.08)}`,
    borderRadius: 6,
    color: colors.neutral.white,
    fontFamily: fonts.mono,
    fontSize: 9,
    cursor: 'pointer',
    letterSpacing: '0.06em',
    transition: 'all 0.2s',
  });

  if (collapsed) {
    return (
      <motion.button
        onClick={() => setCollapsed(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100,
          ...btnStyle(),
          opacity: 0.5,
        }}
      >
        CONTROLS
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: MOTION_CURVES.arrival.motionEasing as unknown as number[] }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 280,
        background: withAlpha(surfaces.solid.base, 0.95),
        borderLeft: `1px solid ${withAlpha(colors.neutral.white, 0.05)}`,
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.15, letterSpacing: '0.12em' }}>
            NAVICUE PLAYER
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, marginTop: 2 }}>
            7-LAYER COMPOSITION ENGINE
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link
            to="/delivery"
            style={{
              ...btnStyle(),
              padding: '4px 8px',
              fontSize: 8,
              textDecoration: 'none',
              color: withAlpha(workspaceNavAccents.delivery, 0.6),
            }}
          >
            MAP
          </Link>
          <button onClick={() => setCollapsed(true)} style={{ ...btnStyle(), padding: '4px 8px', fontSize: 8 }}>
            HIDE
          </button>
        </div>
      </div>

      {/* Device Preview Toggle */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>DEVICE PREVIEW</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {([
            { mode: 'fullscreen' as DeviceMode, icon: '⛶', label: 'FULL' },
            { mode: 'mobile' as DeviceMode, icon: '📱', label: 'MOBILE' },
            { mode: 'desktop' as DeviceMode, icon: '🖥', label: 'DESKTOP' },
          ]).map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => onDeviceModeChange(mode)}
              style={{
                ...btnStyle(deviceMode === mode),
                fontSize: 8,
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 10 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
        {deviceMode !== 'fullscreen' && (
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(ACCENT, 0.4), marginTop: 4 }}>
            {DEVICE_FRAMES[deviceMode].label}
          </div>
        )}
      </div>

      {/* Phase indicator */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(['loading', 'entering', 'active', 'resolving', 'receipt', 'complete'] as const).map(p => (
          <div
            key={p}
            style={{
              fontFamily: fonts.mono,
              fontSize: 7,
              padding: '3px 6px',
              borderRadius: 4,
              background: p === phase ? withAlpha(ACCENT, 0.3) : withAlpha(colors.neutral.white, 0.02),
              color: colors.neutral.white,
              opacity: p === phase ? 0.8 : 0.15,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
            }}
          >
            {p}
          </div>
        ))}
      </div>

      {/* Transport controls */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 6 }}>
        <button onClick={onReset} style={btnStyle(phase === 'complete')}>REPLAY</button>
        <button
          onClick={onSkipToActive}
          style={{
            ...btnStyle(false),
            opacity: phase === 'active' ? 0.2 : 0.8,
          }}
          disabled={phase === 'active'}
        >
          SKIP→ACTIVE
        </button>
        <button
          onClick={onResolve}
          style={{
            ...btnStyle(false),
            opacity: phase === 'active' ? 0.8 : 0.2,
          }}
          disabled={phase !== 'active'}
        >
          RESOLVE
        </button>
      </div>

      <div style={{ height: 1, background: withAlpha(colors.neutral.white, 0.04), margin: '8px 16px' }} />

      {/* Layer 6: Atom selector */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>LAYER 6 — HERO ATOM</div>
        <select
          value={config.atomId}
          onChange={e => onConfigChange('atomId', e.target.value)}
          style={selectStyle}
        >
          {builtAtoms.map(id => {
            const meta = ATOM_CATALOG[id];
            return (
              <option key={id} value={id} style={{ background: colors.neutral.gray[950] }}>
                {meta?.number ?? '?'}. {meta?.name ?? id}
              </option>
            );
          })}
        </select>
        {/* Content profile summary */}
        {(() => {
          const cp = ATOM_CONTENT_PROFILES[config.atomId];
          const ap = getAtomCopyProfile(config.atomId);
          return (
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(ACCENT, 0.4), letterSpacing: '0.04em' }}>
                {cp.primaryGesture.toUpperCase()}
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.15) }}>
                {cp.voiceSlots.length} slots
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.15) }}>
                {ap.copyWeight}
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.15) }}>
                {ap.ctaMode}
              </span>
            </div>
          );
        })()}
        {config.atomId === 'micro-step-shrink' && (
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.accent.green.primary, 0.5), marginTop: 4 }}>
            WORKED EXAMPLE LOADED
          </div>
        )}
      </div>

      {/* Layer 4: Voice Lane */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>LAYER 4 — VOICE LANE</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {VOICE_LANE_IDS.map(v => (
            <button
              key={v}
              onClick={() => onConfigChange('voiceLane', v)}
              style={{
                ...btnStyle(config.voiceLane === v),
                fontSize: 8,
                padding: '4px 8px',
                textTransform: 'capitalize' as const,
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.15, marginTop: 4 }}>
          {VOICE_LANES[config.voiceLane].vibe}
        </div>
      </div>

      {/* Layer 5: Entrance */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>LAYER 5 — ENTRANCE</div>
        <select
          value={config.entrance}
          onChange={e => onConfigChange('entrance', e.target.value)}
          style={selectStyle}
        >
          {ENTRANCE_IDS.map(id => (
            <option key={id} value={id} style={{ background: colors.neutral.gray[950] }}>
              {id.replace(/-/g, ' ').replace(/^the /, 'The ')}
            </option>
          ))}
        </select>
        {/* Show entrance affinity match */}
        {(() => {
          const cp = ATOM_CONTENT_PROFILES[config.atomId];
          const isAffine = cp.entranceAffinity.includes(config.entrance);
          return isAffine ? (
            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.accent.green.primary, 0.4), marginTop: 4 }}>
              AFFINITY MATCH
            </div>
          ) : null;
        })()}
      </div>

      {/* Layer 5: Exit */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>LAYER 5 — EXIT</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {EXIT_IDS.map(id => (
            <button
              key={id}
              onClick={() => onConfigChange('exit', id)}
              style={{
                ...btnStyle(config.exit === id),
                fontSize: 8,
                padding: '4px 8px',
                textTransform: 'capitalize' as const,
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Layer 2: Color Signature */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>LAYER 2 — COLOR SIGNATURE</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {COLOR_SIGNATURE_IDS.map(id => {
            const sig = COLOR_SIGNATURES[id];
            return (
              <button
                key={id}
                onClick={() => onConfigChange('colorSignature', id)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: config.colorSignature === id
                    ? `2px solid ${withAlpha(colors.neutral.white, 0.4)}`
                    : `1px solid ${withAlpha(colors.neutral.white, 0.06)}`,
                  background: `radial-gradient(circle, ${sig.primary} 0%, ${surfaces.solid.base} 100%)`,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'border 0.2s',
                }}
                title={sig.name}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.15, marginTop: 4 }}>
          {COLOR_SIGNATURES[config.colorSignature].name}
        </div>
      </div>

      {/* Layer 3: Breath */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>LAYER 3 — BREATH</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['calm', 'simple', 'box', 'energize'] as BreathPatternId[]).map(b => (
            <button
              key={b}
              onClick={() => onConfigChange('breathPattern', b)}
              style={{
                ...btnStyle(config.breathPattern === b),
                fontSize: 8,
                padding: '4px 8px',
                textTransform: 'capitalize' as const,
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Layer 7b: Narrative Density */}
      <div style={{ padding: '8px 16px' }}>
        <div style={labelStyle}>LAYER 7b — NARRATIVE DENSITY</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['full', 'core', 'minimal', 'silent'] as NarrativeDensity[]).map(d => (
            <button
              key={d}
              onClick={() => onConfigChange('narrativeDensity', d)}
              style={{
                ...btnStyle(config.narrativeDensity === d),
                fontSize: 8,
                padding: '4px 8px',
                textTransform: 'uppercase' as const,
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.15, marginTop: 4 }}>
          {config.narrativeDensity === 'full' && 'All 7 narrative elements active'}
          {config.narrativeDensity === 'core' && 'Hook + canopy + pill + receipt'}
          {config.narrativeDensity === 'minimal' && 'Hook + receipt only'}
          {config.narrativeDensity === 'silent' && 'Ambient subtext only (pure physics)'}
        </div>
      </div>

      {/* Layer 7 preview */}
      <div style={{ padding: '8px 16px', marginTop: 'auto' }}>
        <div style={labelStyle}>LAYER 7 — VOICE PAYLOAD</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.12, lineHeight: 1.6 }}>
          {config.atomId === 'micro-step-shrink' ? (
            <>
              ANCHOR: {ATOM_112_WORKED_EXAMPLES[config.voiceLane].anchorPrompt}<br />
              PAYLOAD: {ATOM_112_WORKED_EXAMPLES[config.voiceLane].kineticPayload}<br />
              TAG: {ATOM_112_WORKED_EXAMPLES[config.voiceLane].metacognitiveTag}<br />
              SHIFT: {ATOM_112_WORKED_EXAMPLES[config.voiceLane].thresholdShift.before} → {ATOM_112_WORKED_EXAMPLES[config.voiceLane].thresholdShift.after}
            </>
          ) : (
            <span style={{ color: withAlpha(ACCENT, 0.25) }}>
              Select atom 112 for full worked example — or use Delivery workspace to author
            </span>
          )}
        </div>
      </div>

      {/* Workspace navigation */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${withAlpha(colors.neutral.white, 0.04)}`, marginTop: 8, paddingTop: 12 }}>
        {[
          { to: '/atoms', label: 'atoms', color: workspaceNavAccents.atoms },
          { to: '/surfaces', label: 'surfaces', color: workspaceNavAccents.surfaces },
          { to: '/motion', label: 'motion', color: workspaceNavAccents.motion },
          { to: '/voice', label: 'voice', color: workspaceNavAccents.voice },
          { to: '/delivery', label: 'delivery', color: workspaceNavAccents.delivery },
          { to: '/showcase', label: 'showcase', color: workspaceNavAccents.showcase },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              fontFamily: fonts.mono,
              fontSize: 7,
              color: withAlpha(link.color, 0.4),
              textDecoration: 'none',
              letterSpacing: '0.06em',
              transition: 'color 0.2s',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Version */}
      <div style={{ padding: '12px 16px', fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.06, letterSpacing: '0.08em' }}>
        NAVICUE PLAYER v0.2.0 — COMPOSITION ENGINE
      </div>
    </motion.div>
  );
}

// ─── Main Player Page ───────────────────────────────────────────

export default function PlayerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [showDiag, setShowDiag] = useState(false);
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ── RUNTIME DIAGNOSTICS ────────────────────────────────────
  // Mount confirmation — if you don't see this in console, the module failed to load
  useEffect(() => {
    console.log('%c[PlayerPage] MOUNTED', 'color: #00ff88; font-weight: bold');
    console.log('[PlayerPage] Built atoms count:', ATOM_IDS.filter(id => ATOM_COMPONENTS[id]).length);
    console.log('[PlayerPage] ATOM_COMPONENTS keys:', Object.keys(ATOM_COMPONENTS).length);
    return () => console.log('[PlayerPage] UNMOUNTED');
  }, []);

  // Toggle diagnostic overlay with Ctrl+Shift+D
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDiag(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Resolve initial config from URL search params (Showcase handoff)
  const initialConfig = useMemo(() => {
    const builtAtoms = ATOM_IDS.filter(id => ATOM_COMPONENTS[id]);
    const paramAtom = searchParams.get('atom') as AtomId | null;
    const paramVoice = searchParams.get('voice') as VoiceLaneId | null;
    const paramColor = searchParams.get('color') as ColorSignatureId | null;
    const paramBreath = searchParams.get('breath') as BreathPatternId | null;
    const paramDensity = searchParams.get('density') as NarrativeDensity | null;
    const VALID_DENSITIES: NarrativeDensity[] = ['full', 'core', 'minimal', 'silent'];

    return {
      atomId: (paramAtom && builtAtoms.includes(paramAtom) ? paramAtom : 'micro-step-shrink') as AtomId,
      voiceLane: (paramVoice && VOICE_LANE_IDS.includes(paramVoice) ? paramVoice : 'coach') as VoiceLaneId,
      entrance: 'the-emergence' as EntranceArchitectureId,
      exit: 'burn-in' as ExitTransitionId,
      colorSignature: (paramColor && COLOR_SIGNATURE_IDS.includes(paramColor) ? paramColor : 'quiet-authority') as ColorSignatureId,
      breathPattern: (paramBreath && (['calm', 'simple', 'box', 'energize'] as BreathPatternId[]).includes(paramBreath) ? paramBreath : 'calm') as BreathPatternId,
      narrativeDensity: (paramDensity && VALID_DENSITIES.includes(paramDensity) ? paramDensity : 'core') as NarrativeDensity,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only read params on mount — subsequent changes are via controls

  // Composition config
  const [config, setConfig] = useState(initialConfig);

  // Track which keys require a full lifecycle restart vs live update
  // Only atom change and entrance change need to restart — everything else
  // (voice, color, breath, exit) updates the composition live in-place.
  const lifecycleKeyRef = useRef(`${initialConfig.atomId}::${initialConfig.entrance}`);

  const handleConfigChange = useCallback((key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Build composition from config (now via composition-engine.ts)
  const composition = useMemo(() => {
    try {
      const c = buildComposition(config);
      console.log('[PlayerPage] Composition built:', {
        id: c.id,
        atomId: c.heroPhysics.atomId,
        colorSig: c.livingAtmosphere.colorSignature,
        voiceLane: c.persona.voiceLane,
        hasAtomComponent: !!ATOM_COMPONENTS[c.heroPhysics.atomId as keyof typeof ATOM_COMPONENTS],
        anchorText: c.atomicVoice?.anchorPrompt?.text?.slice(0, 30),
        hasNarrative: !!c.narrative,
        narrativeDensity: c.narrative?.density,
        pillBefore: c.narrative?.semanticPill?.before,
        collapseModel: c.narrative?.collapseModel,
      });
      return c;
    } catch (err) {
      console.error('[PlayerPage] COMPOSITION BUILD FAILED:', err);
      throw err;
    }
  }, [config]);

  // Orchestrator
  const entranceSpec = ENTRANCES[config.entrance];
  const exitSpec = EXITS[config.exit];

  const [orchestratorState, orchestratorControls] = usePhaseOrchestrator({
    entranceDurationMs: entranceSpec.durationMs,
    exitDurationMs: exitSpec.durationMs,
    entranceRequiresAction: entranceSpec.requiresUserAction,
  });

  // Viewport tracking
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport({ width: rect.width, height: rect.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── Lifecycle restart — ONLY when atom or entrance changes ──
  // Voice lane, color, breath, exit changes update the composition object
  // which the compositor picks up live — no phase restart needed.
  const currentLifecycleKey = `${config.atomId}::${config.entrance}`;
  useEffect(() => {
    const isInitial = lifecycleKeyRef.current === currentLifecycleKey;
    lifecycleKeyRef.current = currentLifecycleKey;

    orchestratorControls.reset();
    // Brief loading beat, then auto-start
    const timer = setTimeout(() => {
      orchestratorControls.start();
    }, isInitial ? 600 : 400); // shorter restart when switching atoms
    return () => clearTimeout(timer);
  }, [currentLifecycleKey]);

  // Auto-complete entrance actions (breath gate / threshold)
  // In production the user performs the action; here we simulate it
  useEffect(() => {
    if (orchestratorState.phase !== 'entering') return;
    if (!entranceSpec.requiresUserAction) return;
    // Simulate user completing the entrance after a natural pause
    const timer = setTimeout(() => {
      orchestratorControls.completeEntranceAction();
    }, 3000);
    return () => clearTimeout(timer);
  }, [orchestratorState.phase, entranceSpec.requiresUserAction]);

  // NO auto-resolve — the atom fires onResolve when the user completes
  // their gesture interaction. This is the production-faithful flow:
  //   entrance → active (user engages with atom) → atom fires onResolve → exit
  // The atom's onAtomResolve callback is already wired in the compositor.

  // Replay handler — reset + auto-start the full lifecycle again
  const handleReplay = useCallback(() => {
    orchestratorControls.reset();
    setTimeout(() => orchestratorControls.start(), 600);
  }, [orchestratorControls]);

  // Haptic feedback — maps Breathing HUD intensity to device vibration
  const handleHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: [15, 30, 15],
        heavy: [20, 40, 20, 40, 20],
      };
      try { navigator.vibrate(patterns[intensity]); } catch { /* not supported */ }
    }
  }, []);

  // Device mode state
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('fullscreen');

  // Compute compositor dimensions based on device mode
  const compositorDims = useMemo((): {
    width: number;
    height: number;
    nativeWidth: number;
    nativeHeight: number;
    scale: number;
    radius: number;
  } => {
    if (deviceMode === 'fullscreen') {
      return { width: viewport.width, height: viewport.height, nativeWidth: viewport.width, nativeHeight: viewport.height, scale: 1, radius: 0 };
    }
    const frame = DEVICE_FRAMES[deviceMode];
    // Scale to fit within available viewport (leave room for controls panel)
    const availW = viewport.width - 320; // 280px panel + generous margin
    const availH = viewport.height - 100; // top/bottom padding
    const scaleX = availW / frame.width;
    const scaleY = availH / frame.height;
    const scale = Math.min(scaleX, scaleY, 1); // never upscale
    return {
      width: Math.round(frame.width * scale),
      height: Math.round(frame.height * scale),
      nativeWidth: frame.width,
      nativeHeight: frame.height,
      scale,
      radius: frame.radius,
    };
  }, [deviceMode, viewport]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: surfaces.solid.base,
        overflow: 'hidden',
      }}
    >
      {/* The Compositor — fullscreen mode */}
      {viewport.width > 0 && deviceMode === 'fullscreen' && (
        <NaviCueCompositor
          composition={composition}
          phase={orchestratorState.phase}
          atomPhase={orchestratorState.atomPhase}
          atmosphereSettled={orchestratorState.atmosphereSettled}
          textVisible={orchestratorState.textVisible}
          phaseElapsed={orchestratorState.phaseElapsed}
          width={viewport.width}
          height={viewport.height}
          reducedMotion={reducedMotion}
          onAtomResolve={() => orchestratorControls.signalResolution()}
          onAtomStateChange={() => {}}
          onHaptic={handleHaptic}
        />
      )}

      {/* Device frame preview */}
      {viewport.width > 0 && deviceMode !== 'fullscreen' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            /* Subtle grid background to visually separate preview area */
            backgroundImage: `radial-gradient(${withAlpha(colors.neutral.white, 0.015)} 1px, ${TRANSPARENT} 1px)`,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Device chrome */}
          <motion.div
            key={deviceMode}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              width: compositorDims.width,
              height: compositorDims.height,
              borderRadius: compositorDims.radius * compositorDims.scale,
              border: `1px solid ${withAlpha(colors.neutral.white, 0.08)}`,
              boxShadow: `0 0 80px ${withAlpha(ACCENT, 0.08)}, 0 0 1px ${withAlpha(colors.neutral.white, 0.12)}, 0 20px 60px ${withAlpha(colors.neutral.black, 0.5)}`,
              overflow: 'hidden',
              background: surfaces.solid.base,
            }}
          >
            {/* Mobile notch / status bar */}
            {deviceMode === 'mobile' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 44 * compositorDims.scale,
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: 8 * compositorDims.scale,
                  pointerEvents: 'none',
                }}
              >
                {/* Dynamic Island */}
                <div
                  style={{
                    width: 120 * compositorDims.scale,
                    height: 34 * compositorDims.scale,
                    borderRadius: 20 * compositorDims.scale,
                    background: colors.neutral.black,
                    border: `1px solid ${withAlpha(colors.neutral.white, 0.04)}`,
                  }}
                />
              </div>
            )}

            {/* Home indicator for mobile */}
            {deviceMode === 'mobile' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 8 * compositorDims.scale,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 134 * compositorDims.scale,
                  height: 5 * compositorDims.scale,
                  borderRadius: 3 * compositorDims.scale,
                  background: withAlpha(colors.neutral.white, 0.15),
                  zIndex: 20,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Desktop title bar */}
            {deviceMode === 'desktop' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 28 * compositorDims.scale,
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 10 * compositorDims.scale,
                  gap: 6 * compositorDims.scale,
                  background: withAlpha(colors.neutral.black, 0.6),
                  backdropFilter: 'blur(8px)',
                  pointerEvents: 'none',
                }}
              >
                {/* Traffic lights */}
                {[
                  withAlpha(colors.status.red.mid, 0.6),
                  withAlpha(colors.status.amber.mid, 0.6),
                  withAlpha(colors.status.green.mid, 0.6),
                ].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10 * compositorDims.scale,
                      height: 10 * compositorDims.scale,
                      borderRadius: '50%',
                      background: c,
                    }}
                  />
                ))}
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 8 * compositorDims.scale,
                    color: withAlpha(colors.neutral.white, 0.2),
                    marginLeft: 8 * compositorDims.scale,
                    letterSpacing: '0.06em',
                  }}
                >
                  recoverlution.app
                </div>
              </div>
            )}

            {/* Compositor — rendered at native device resolution, CSS-scaled to fit frame */}
            <div
              style={{
                width: compositorDims.nativeWidth,
                height: compositorDims.nativeHeight,
                transform: `scale(${compositorDims.scale})`,
                transformOrigin: 'top left',
              }}
            >
              <NaviCueCompositor
                composition={composition}
                phase={orchestratorState.phase}
                atomPhase={orchestratorState.atomPhase}
                atmosphereSettled={orchestratorState.atmosphereSettled}
                textVisible={orchestratorState.textVisible}
                phaseElapsed={orchestratorState.phaseElapsed}
                width={compositorDims.nativeWidth}
                height={compositorDims.nativeHeight}
                reducedMotion={reducedMotion}
                onAtomResolve={() => orchestratorControls.signalResolution()}
                onAtomStateChange={() => {}}
                onHaptic={handleHaptic}
              />
            </div>

            {/* Loading prompt INSIDE device frame */}
            {orchestratorState.phase === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 30,
                  pointerEvents: 'none',
                }}
              >
                <motion.div
                  animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 30 * compositorDims.scale,
                    height: 30 * compositorDims.scale,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${withAlpha(ACCENT, 0.3)} 0%, ${TRANSPARENT} 70%)`,
                  }}
                />
              </motion.div>
            )}
          </motion.div>

          {/* Device label */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 8,
              color: withAlpha(colors.neutral.white, 0.12),
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
          >
            {DEVICE_FRAMES[deviceMode].label} · {Math.round(compositorDims.scale * 100)}%
          </div>
        </div>
      )}

      {/* Center prompt when loading — fullscreen mode only */}
      {deviceMode === 'fullscreen' && orchestratorState.phase === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha(ACCENT, 0.3)} 0%, ${TRANSPARENT} 70%)`,
            }}
          />
        </motion.div>
      )}

      {/* Control Panel */}
      <ControlPanel
        config={config}
        onConfigChange={handleConfigChange}
        phase={orchestratorState.phase}
        onStart={orchestratorControls.start}
        onReset={handleReplay}
        onSkipToActive={orchestratorControls.skipToActive}
        onResolve={orchestratorControls.signalResolution}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
      />

      {/* Diagnostic Overlay — toggle with Ctrl+Shift+D */}
      {showDiag && (
        <div
          style={{
            position: 'fixed',
            bottom: 12,
            left: 12,
            zIndex: 200,
            background: withAlpha(colors.neutral.black, 0.85),
            border: `1px solid ${withAlpha(colors.neutral.white, 0.1)}`,
            borderRadius: 8,
            padding: '10px 14px',
            fontFamily: fonts.mono,
            fontSize: 9,
            color: colors.neutral.white,
            lineHeight: 1.8,
            backdropFilter: 'blur(12px)',
            maxWidth: 340,
            pointerEvents: 'auto',
          }}
        >
          <div style={{ opacity: 0.3, letterSpacing: '0.12em', marginBottom: 6 }}>RUNTIME DIAGNOSTICS</div>
          <div style={{ opacity: 0.6 }}>viewport: {viewport.width}×{viewport.height}</div>
          <div style={{ opacity: 0.6 }}>deviceMode: {deviceMode}</div>
          <div style={{ opacity: 0.6 }}>compositor: {compositorDims.width}×{compositorDims.height} (native: {compositorDims.nativeWidth}×{compositorDims.nativeHeight})</div>
          <div style={{ opacity: 0.6 }}>scale: {compositorDims.scale.toFixed(3)}</div>
          <div style={{ opacity: 0.6 }}>phase: <span style={{ color: withAlpha(ACCENT, 0.8) }}>{orchestratorState.phase}</span></div>
          <div style={{ opacity: 0.6 }}>atomPhase: {orchestratorState.atomPhase}</div>
          <div style={{ opacity: 0.6 }}>textVisible: {String(orchestratorState.textVisible)}</div>
          <div style={{ opacity: 0.6 }}>atmosphereSettled: {String(orchestratorState.atmosphereSettled)}</div>
          <div style={{ opacity: 0.6 }}>atomId: {config.atomId}</div>
          <div style={{ opacity: 0.6 }}>hasComponent: {String(!!ATOM_COMPONENTS[config.atomId])}</div>
          <div style={{ opacity: 0.6 }}>colorSig: {config.colorSignature}</div>
          <div style={{ opacity: 0.6 }}>voiceLane: {config.voiceLane}</div>
          <div style={{ opacity: 0.6 }}>entrance: {config.entrance} (dur={entranceSpec.durationMs}ms, action={String(entranceSpec.requiresUserAction)}, copy={entranceSpec.copyMode})</div>
          <div style={{ opacity: 0.6 }}>exit: {config.exit} (dur={exitSpec.durationMs}ms)</div>
          <div style={{ opacity: 0.6 }}>breath: {config.breathPattern}</div>
          <div style={{ opacity: 0.6 }}>compositionId: {composition.id}</div>
          <div style={{ opacity: 0.6 }}>reducedMotion: {String(reducedMotion)}</div>
          <div style={{ opacity: 0.25, marginTop: 4, fontSize: 7 }}>Ctrl+Shift+D to close</div>
        </div>
      )}
    </div>
  );
}