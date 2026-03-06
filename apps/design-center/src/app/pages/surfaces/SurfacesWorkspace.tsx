/**
 * SURFACES COMPOSITION WORKSPACE
 * ===============================
 * Layer 2: The Living Atmosphere — Color Signatures, Visual Engines,
 * Response Profiles, and Atmosphere Presets.
 *
 * Layout (desktop):
 *   ┌───────────────┬──────────────┬──────────────────────┐
 *   │ SURFACE       │   DEVICE     │  COMPOSITION         │
 *   │ CATALOG       │   MIRROR     │  CONTROLS            │
 *   │ 8 signatures  │  (live sky)  │  engine params ·     │
 *   │ 6 engines     │              │  response · breath · │
 *   │ 4 responses   │              │  atmosphere tuning   │
 *   │ 6 atmospheres │              │                      │
 *   └───────────────┴──────────────┴──────────────────────┘
 *
 * Select a color signature. Choose an engine. Watch the sky breathe.
 * Atmosphere presets modify the FEEL (density, speed, breath) without
 * changing the engine, color, or response profile — they're orthogonal
 * mood knobs, not aesthetic overrides.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import {
  layout,
  withAlpha,
  atomsLayout,
  workspaceSectionAccents,
  getEngineVisual,
  RESPONSE_VISUALS,
  deviceFrame,
} from '../design-center/dc-tokens';
import { useDeviceMirror, DeviceMirror } from '../design-center/components/DeviceMirror';
import { useBreathEngine } from '../design-center/hooks/useBreathEngine';
import type { BreathPattern } from '../design-center/hooks/useBreathEngine';
import { EnginePreviewRenderer } from '../design-center/components/EngineRenderers';

// ── NaviCue data (Layer 2 types + data) ─────────────────────
import {
  COLOR_SIGNATURES,
  COLOR_SIGNATURE_IDS,
} from '@/navicue-data';

import type {
  ColorSignatureId,
  VisualEngineId,
  ResponseProfileId,
} from '@/navicue-types';

// ── Composition presets (atmosphere + engines) ──────────────
import {
  ATMOSPHERE_PRESETS,
  BACKGROUND_ENGINES,
} from '@/app/data/composition-presets';

// =====================================================================
// SECTION ACCENT PALETTE — imported from centralized dc-tokens
// =====================================================================

const SECTION_ACCENTS = workspaceSectionAccents.surfaces;

// =====================================================================
// COMPOSITION STATE
// =====================================================================

const VISUAL_ENGINE_IDS: VisualEngineId[] = [
  'particle-field', 'gradient-mesh', 'noise-fabric', 'constellation', 'liquid-pool', 'void',
];

const RESPONSE_PROFILE_IDS: ResponseProfileId[] = [
  'resonance', 'contrast', 'witness', 'immersion',
];

interface SurfaceCompositionState {
  colorSignature: ColorSignatureId;
  engineId: string;
  responseProfile: ResponseProfileId;
  atmosphereId: string;
  breathPattern: BreathPattern;
  /** Engine parameter overrides */
  engineParams: {
    density: number;
    speed: number;
    complexity: number;
    reactivity: number;
    depth: number;
  };
}

const INITIAL_STATE: SurfaceCompositionState = {
  colorSignature: 'quiet-authority',
  engineId: 'constellation',
  responseProfile: 'resonance',
  atmosphereId: 'gentle-current',
  breathPattern: 'calm',
  engineParams: { density: 0.5, speed: 0.35, complexity: 0.5, reactivity: 0.5, depth: 0.5 },
};

const BREATH_PATTERNS: { id: BreathPattern; label: string }[] = [
  { id: 'calm', label: 'Calm' },
  { id: 'simple', label: 'Simple' },
  { id: 'energize', label: 'Energize' },
  { id: 'box', label: 'Box' },
];

// =====================================================================
// SURFACE CATALOG (Left Panel)
// =====================================================================

type CatalogSection = 'signatures' | 'engines' | 'responses' | 'atmospheres';

function SurfaceCatalog({
  state,
  onSelectSignature,
  onSelectEngine,
  onSelectResponse,
  onSelectAtmosphere,
}: {
  state: SurfaceCompositionState;
  onSelectSignature: (id: ColorSignatureId) => void;
  onSelectEngine: (id: string) => void;
  onSelectResponse: (id: ResponseProfileId) => void;
  onSelectAtmosphere: (id: string) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<CatalogSection>('signatures');

  const sections: { id: CatalogSection; label: string; count: number; color: string }[] = [
    { id: 'signatures', label: 'Color Signatures', count: COLOR_SIGNATURE_IDS.length, color: SECTION_ACCENTS.signature },
    { id: 'engines', label: 'Visual Engines', count: VISUAL_ENGINE_IDS.length, color: SECTION_ACCENTS.engine },
    { id: 'responses', label: 'Response Profiles', count: RESPONSE_PROFILE_IDS.length, color: SECTION_ACCENTS.response },
    { id: 'atmospheres', label: 'Atmosphere Presets', count: ATMOSPHERE_PRESETS.length, color: SECTION_ACCENTS.atmosphere },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* Header */}
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 9,
        color: colors.neutral.white,
        opacity: 0.15,
        letterSpacing: '0.12em',
        marginBottom: 6,
      }}>
        SURFACE LIBRARY
      </div>
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 8,
        color: colors.neutral.white,
        opacity: 0.1,
        marginBottom: 16,
      }}>
        layer 2 the living atmosphere
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map(section => {
          const isExpanded = expandedSection === section.id;
          return (
            <div key={section.id}>
              <button
                onClick={() => setExpandedSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isExpanded ? withAlpha(section.color, 0.06) : 'rgba(0,0,0,0)',
                  textAlign: 'left',
                  transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: section.color,
                  opacity: isExpanded ? 0.7 : 0.25,
                  flexShrink: 0,
                  transition: 'opacity 0.3s',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: fonts.primary, fontSize: 11,
                    color: isExpanded ? section.color : colors.neutral.white,
                    opacity: isExpanded ? 0.7 : 0.3,
                    transition: 'all 0.3s',
                  }}>
                    {section.label}
                  </div>
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.1 }}>
                  {section.count}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '4px 0 8px 14px', display: 'flex', flexDirection: 'column', gap: 1 }}>

                      {/* Color Signatures */}
                      {section.id === 'signatures' && COLOR_SIGNATURE_IDS.map(id => {
                        const sig = COLOR_SIGNATURES[id];
                        const isActive = state.colorSignature === id;
                        return (
                          <button
                            key={id}
                            onClick={() => onSelectSignature(id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: isActive ? withAlpha(sig.primary, 0.08) : 'rgba(0,0,0,0)',
                              textAlign: 'left', transition: 'background 0.2s',
                            }}
                          >
                            <div style={{
                              width: 10, height: 10, borderRadius: 3, flexShrink: 0,
                              background: `linear-gradient(135deg, ${sig.primary}, ${sig.accent})`,
                              border: `1px solid ${withAlpha(sig.primary, 0.2)}`,
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontFamily: fonts.primary, fontSize: 10,
                                color: isActive ? sig.primary : colors.neutral.white,
                                opacity: isActive ? 0.7 : 0.3,
                                transition: 'all 0.2s',
                              }}>
                                {sig.name}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Visual Engines */}
                      {section.id === 'engines' && VISUAL_ENGINE_IDS.map(id => {
                        const engineVis = getEngineVisual(id);
                        const engineData = BACKGROUND_ENGINES.find(e => e.id === id);
                        const isActive = state.engineId === id;
                        return (
                          <button
                            key={id}
                            onClick={() => onSelectEngine(id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: isActive ? withAlpha(section.color, 0.08) : 'rgba(0,0,0,0)',
                              textAlign: 'left', transition: 'background 0.2s',
                            }}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: engineVis?.previewGradient ?? withAlpha(section.color, 0.05),
                              border: `1px solid ${withAlpha(section.color, 0.1)}`,
                              fontFamily: fonts.mono, fontSize: 10,
                              color: colors.neutral.white, opacity: 0.4,
                            }}>
                              {engineVis?.icon ?? '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontFamily: fonts.primary, fontSize: 10,
                                color: isActive ? section.color : colors.neutral.white,
                                opacity: isActive ? 0.7 : 0.3,
                                transition: 'all 0.2s',
                              }}>
                                {engineData?.name ?? formatId(id)}
                              </div>
                            </div>
                            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.08 }}>
                              {engineData?.physics ?? id}
                            </div>
                          </button>
                        );
                      })}

                      {/* Response Profiles */}
                      {section.id === 'responses' && RESPONSE_PROFILE_IDS.map(id => {
                        const respVis = RESPONSE_VISUALS.find(r => r.id === id);
                        const isActive = state.responseProfile === id;
                        return (
                          <button
                            key={id}
                            onClick={() => onSelectResponse(id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: isActive ? withAlpha(section.color, 0.08) : 'rgba(0,0,0,0)',
                              textAlign: 'left', transition: 'background 0.2s',
                            }}
                          >
                            <div style={{
                              width: 4, height: 4, borderRadius: '50%',
                              background: isActive ? (respVis?.accent ?? section.color) : surfaces.glass.border,
                              opacity: isActive ? 0.8 : 0.15, flexShrink: 0,
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontFamily: fonts.primary, fontSize: 10,
                                color: isActive ? section.color : colors.neutral.white,
                                opacity: isActive ? 0.7 : 0.3,
                                transition: 'all 0.2s',
                              }}>
                                {respVis?.name ?? formatId(id)}
                              </div>
                              <div style={{
                                fontFamily: fonts.mono, fontSize: 7,
                                color: colors.neutral.white, opacity: 0.1,
                                marginTop: 1,
                              }}>
                                {respVis?.metaphor ?? id}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Atmosphere Presets */}
                      {section.id === 'atmospheres' && ATMOSPHERE_PRESETS.map(atm => {
                        const isActive = state.atmosphereId === atm.id;
                        return (
                          <button
                            key={atm.id}
                            onClick={() => onSelectAtmosphere(atm.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: isActive ? withAlpha(section.color, 0.08) : 'rgba(0,0,0,0)',
                              textAlign: 'left', transition: 'background 0.2s',
                            }}
                          >
                            <div style={{
                              width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                              background: isActive ? section.color : surfaces.glass.border,
                              opacity: isActive ? 0.8 : 0.15,
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontFamily: fonts.primary, fontSize: 10,
                                color: isActive ? section.color : colors.neutral.white,
                                opacity: isActive ? 0.7 : 0.3,
                                transition: 'all 0.2s',
                              }}>
                                {atm.name}
                              </div>
                              <div style={{
                                fontFamily: fonts.mono, fontSize: 7,
                                color: colors.neutral.white, opacity: 0.1,
                                marginTop: 1,
                              }}>
                                {atm.intention}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// =====================================================================
// DEVICE SCENE RENDERER — live atmosphere inside the phone
// =====================================================================

function SurfaceSceneRenderer({
  state,
  breathAmplitude,
}: {
  state: SurfaceCompositionState;
  breathAmplitude: number;
}) {
  const colorSig = COLOR_SIGNATURES[state.colorSignature];
  const engineData = BACKGROUND_ENGINES.find(e => e.id === state.engineId) ?? BACKGROUND_ENGINES[0];

  if (!colorSig) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: surfaces.solid.base }}>
      {/* Z-0: The engine IS the atmosphere — full opacity, no fighting overlays */}
      <EnginePreviewRenderer
        engineId={state.engineId}
        physics={engineData.physics}
        responseMode={state.responseProfile}
        accent={colorSig.primary}
        glow={colorSig.glow}
        params={state.engineParams}
        viewport={{ width: deviceFrame.composer.width, height: deviceFrame.composer.height }}
        engineName=""
        responseName=""
      />

      {/* Z-1: Subtle surface tint — very low opacity, just adds signature warmth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${colorSig.surface} 0%, transparent 80%)`,
          opacity: 0.4 + breathAmplitude * 0.1,
          pointerEvents: 'none',
        }}
      />

      {/* Soft vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.06) 100%)',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />

      {/* HUD: Signature name */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          fontFamily: fonts.mono,
          fontSize: 7,
          color: colors.neutral.white,
          opacity: 0.12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          zIndex: 10,
        }}
      >
        {colorSig.name}
      </div>

      {/* HUD: Engine + Response */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: fonts.mono,
          fontSize: 7,
          color: colors.neutral.white,
          opacity: 0.08,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          zIndex: 10,
        }}
      >
        {engineData.name} / {state.responseProfile}
      </div>
    </div>
  );
}

// =====================================================================
// COMPOSITION CONTROLS (Right Panel)
// =====================================================================

function SurfaceControls({
  state,
  onChange,
}: {
  state: SurfaceCompositionState;
  onChange: (s: SurfaceCompositionState) => void;
}) {
  const colorSig = COLOR_SIGNATURES[state.colorSignature];
  const engineData = BACKGROUND_ENGINES.find(e => e.id === state.engineId) ?? BACKGROUND_ENGINES[0];
  const atmosphere = ATMOSPHERE_PRESETS.find(a => a.id === state.atmosphereId) ?? ATMOSPHERE_PRESETS[0];

  if (!colorSig) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* ── Active Signature ───────────────── */}
      <div>
        <SectionLabel>active signature</SectionLabel>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.colorSignature}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              fontFamily: fonts.secondary,
              fontSize: 15,
              color: colorSig.primary,
              opacity: 0.75,
              marginBottom: 4,
            }}>
              {colorSig.name}
            </div>
            {/* Color swatch strip */}
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[
                { label: 'primary', color: colorSig.primary },
                { label: 'accent', color: colorSig.accent },
                { label: 'glow', color: colorSig.glow },
                { label: 'surface', color: colorSig.surface },
                { label: 'secondary', color: colorSig.secondary },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: s.color,
                    border: `1px solid ${surfaces.glass.subtle}`,
                  }} />
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 6,
                    color: colors.neutral.white, opacity: 0.12,
                    letterSpacing: '0.02em',
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Engine Parameters ──────────────── */}
      <div>
        <SectionLabel>engine parameters</SectionLabel>
        <div style={{
          fontFamily: fonts.secondary,
          fontSize: 12,
          color: SECTION_ACCENTS.engine,
          opacity: 0.5,
          marginBottom: 8,
        }}>
          {engineData.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(['density', 'speed', 'complexity', 'reactivity', 'depth'] as const).map(param => (
            <SliderControl
              key={param}
              label={param}
              value={state.engineParams[param]}
              min={0}
              max={1}
              step={0.05}
              onChange={v => onChange({
                ...state,
                engineParams: { ...state.engineParams, [param]: v },
              })}
              formatValue={v => v.toFixed(2)}
            />
          ))}
        </div>
      </div>

      {/* ── Response Profile ───────────────── */}
      <div>
        <SectionLabel>response profile</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {RESPONSE_PROFILE_IDS.map(id => {
            const respVis = RESPONSE_VISUALS.find(r => r.id === id);
            const isActive = state.responseProfile === id;
            return (
              <button
                key={id}
                onClick={() => onChange({ ...state, responseProfile: id })}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: fonts.primary,
                  fontSize: 10,
                  color: isActive ? SECTION_ACCENTS.response : colors.neutral.white,
                  opacity: isActive ? 0.65 : 0.2,
                  background: isActive ? withAlpha(SECTION_ACCENTS.response, 0.08) : 'rgba(0,0,0,0)',
                  transition: 'all 0.3s',
                }}
              >
                {respVis?.name ?? formatId(id)}
                {respVis && (
                  <span style={{
                    marginLeft: 4, fontFamily: fonts.mono, fontSize: 7, opacity: 0.5,
                  }}>
                    ({respVis.metaphor})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Breath ─────────────────────────── */}
      <div>
        <SectionLabel>breath</SectionLabel>
        <div style={{ display: 'flex', gap: 4 }}>
          {BREATH_PATTERNS.map(bp => (
            <button
              key={bp.id}
              onClick={() => onChange({ ...state, breathPattern: bp.id })}
              style={{
                padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: fonts.primary, fontSize: 10,
                color: colors.neutral.white,
                opacity: state.breathPattern === bp.id ? 0.65 : 0.2,
                background: state.breathPattern === bp.id ? surfaces.glass.light : 'rgba(0,0,0,0)',
                transition: 'all 0.3s',
              }}
            >
              {bp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contracts ─────────────────────── */}
      <div>
        <SectionLabel>layer 2 contract</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <PropStat label="signatures" value="8" />
          <PropStat label="engines" value="6" />
          <PropStat label="responses" value="4" />
          <PropStat label="atmospheres" value={`${ATMOSPHERE_PRESETS.length}`} />
          <PropStat label="unique skies" value="4,608" />
          <PropStat label="preset" value={atmosphere.name} />
        </div>
      </div>

      <div>
        <SectionLabel>resolution matrix</SectionLabel>
        <div style={{
          fontFamily: fonts.mono,
          fontSize: 8,
          color: colors.neutral.white,
          opacity: 0.15,
          lineHeight: 1.6,
        }}>
          tap → particle-field{'\n'}
          hold → gradient-mesh{'\n'}
          drag → constellation{'\n'}
          swipe → particle-field{'\n'}
          pinch → noise-fabric{'\n'}
          breathe → void
        </div>
      </div>
    </motion.div>
  );
}

// ── Shared tiny components ──────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: fonts.mono,
      fontSize: 8,
      color: colors.neutral.white,
      opacity: 0.15,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function PropStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: fonts.primary, fontSize: 11, color: colors.neutral.white, opacity: 0.35 }}>{value}</div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const display = formatValue ? formatValue(value) : value.toFixed(2);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.15, letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.3 }}>{display}</div>
      </div>
      <div style={{ position: 'relative', height: 14, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 3,
          borderRadius: 2,
          background: surfaces.glass.subtle,
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 2,
            background: withAlpha(colors.neutral.white, 0.15),
            transition: 'width 0.1s ease',
          }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            margin: 0,
          }}
        />
        <div style={{
          position: 'absolute',
          left: `${pct}%`,
          transform: 'translateX(-50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: colors.neutral.white,
          opacity: 0.3,
          pointerEvents: 'none',
          transition: 'left 0.1s ease',
        }} />
      </div>
    </div>
  );
}

function formatId(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =====================================================================
// MAIN WORKSPACE
// =====================================================================

export default function SurfacesWorkspace() {
  const [state, setState] = useState<SurfaceCompositionState>(INITIAL_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const { setContent } = useDeviceMirror();
  const { amplitude } = useBreathEngine(state.breathPattern);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < atomsLayout.mobileBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Sync engine params when engine changes via catalog
  const handleEngineFromCatalog = useCallback((id: string) => {
    const eng = BACKGROUND_ENGINES.find(e => e.id === id);
    if (eng) {
      setState(s => ({ ...s, engineId: id, engineParams: { ...eng.params } }));
    }
  }, []);

  // Apply atmosphere preset — only changes FEEL (params + breath),
  // never changes engine, color, or response profile
  const handleAtmospherePreset = useCallback((presetId: string) => {
    const preset = ATMOSPHERE_PRESETS.find(a => a.id === presetId);
    if (!preset) return;
    setState(s => ({
      ...s,
      atmosphereId: preset.id,
      breathPattern: preset.breathPattern as BreathPattern,
      engineParams: { ...preset.engineParams },
    }));
  }, []);

  // Push composed scene into DeviceMirror
  useEffect(() => {
    const colorSig = COLOR_SIGNATURES[state.colorSignature];
    if (!colorSig) return;
    setContent({
      accent: colorSig.accent,
      glow: colorSig.glow,
      breathPattern: state.breathPattern,
      customRenderer: (
        <SurfaceSceneRenderer state={state} breathAmplitude={amplitude} />
      ),
    });
  }, [state, amplitude, setContent]);

  if (!isMobile) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${atomsLayout.catalogPanelWidth}px 1fr ${atomsLayout.controlsPanelWidth}px`,
        gap: 0,
        minHeight: `calc(100vh - ${layout.topBarHeight}px)`,
      }}>
        {/* Left: Surface catalog */}
        <div style={{
          padding: '20px 16px',
          borderRight: `1px solid ${surfaces.glass.subtle}`,
          background: withAlpha(surfaces.solid.base, 0.4),
          overflowY: 'auto',
        }}>
          <SurfaceCatalog
            state={state}
            onSelectSignature={id => setState(s => ({ ...s, colorSignature: id }))}
            onSelectEngine={handleEngineFromCatalog}
            onSelectResponse={id => setState(s => ({ ...s, responseProfile: id }))}
            onSelectAtmosphere={handleAtmospherePreset}
          />
        </div>

        {/* Center: DeviceMirror */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <DeviceMirror />
        </div>

        {/* Right: Composition controls */}
        <div style={{
          padding: '20px 16px',
          borderLeft: `1px solid ${surfaces.glass.subtle}`,
          background: withAlpha(surfaces.solid.base, 0.4),
          overflowY: 'auto',
        }}>
          <SurfaceControls state={state} onChange={setState} />
        </div>
      </div>
    );
  }

  // Mobile: stacked
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <DeviceMirror />
      </div>
      <SurfaceCatalog
        state={state}
        onSelectSignature={id => setState(s => ({ ...s, colorSignature: id }))}
        onSelectEngine={handleEngineFromCatalog}
        onSelectResponse={id => setState(s => ({ ...s, responseProfile: id }))}
        onSelectAtmosphere={handleAtmospherePreset}
      />
      <div style={{ marginTop: 24 }}>
        <SurfaceControls state={state} onChange={setState} />
      </div>
    </div>
  );
}