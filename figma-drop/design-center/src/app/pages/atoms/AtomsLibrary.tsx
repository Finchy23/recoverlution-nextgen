/**
 * ATOMS COMPOSITION WORKSPACE
 * ============================
 * The place where atoms meet their environment.
 *
 * Layout (desktop):
 *   ┌──────────────┬──────────────┬──────────────────────┐
 *   │  ATOM CATALOG │   DEVICE     │  COMPOSITION         │
 *   │  10 series    │   MIRROR     │  CONTROLS            │
 *   │  100 atoms    │  (composed)  │  scene · color · atm │
 *   └──────────────┴──────────────┴──────────────────────┘
 *
 * Select an atom. Choose a scene. Watch it breathe in context.
 * The phone preview shows the full layered composition:
 * color story → atmosphere gradient → background feel → atom.
 *
 * Currently: infrastructure-only — atom components not yet built.
 * The workspace shows the catalog, series structure, and composition
 * controls ready for when components are registered.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import {
  layout,
  withAlpha,
  atomsLayout,
  deviceFrame,
  getEngineVisual,
} from '../design-center/dc-tokens';
import { useDeviceMirror, DeviceMirror } from '../design-center/components/DeviceMirror';
import { useBreathEngine } from '../design-center/hooks/useBreathEngine';
import type { BreathPattern } from '../design-center/hooks/useBreathEngine';
import { EnginePreviewRenderer } from '../design-center/components/EngineRenderers';

// ── Atoms: registry + types ─────────────────────────────────
import {
  ATOM_IDS,
  ATOM_CATALOG,
  ATOM_COLORS,
  ATOM_COMPONENTS,
  SERIES_CATALOG,
  SERIES_IDS,
  SERIES_COLORS,
  DESIGNED_ATOM_COUNT,
  TOTAL_ATOM_COUNT,
  type AtomId,
  type SeriesId,
} from '@/app/components/atoms';

// ── Layer system data ───────────────────────────────────────
import {
  COLOR_STORIES,
  ATMOSPHERE_PRESETS,
  BACKGROUND_ENGINES,
  type ColorStory,
  type AtmospherePreset,
  type BackgroundEngine,
} from '@/app/data/composition-presets';

// =====================================================================
// COMPOSITION STATE
// =====================================================================

interface CompositionState {
  atomId: AtomId;
  colorStoryId: string;
  atmosphereId: string;
  backgroundEngineId: string;
  breathPattern: BreathPattern;
  atomScale: number;
  atomOpacity: number;
  atmosphereIntensity: number;
}

const INITIAL_STATE: CompositionState = {
  atomId: 'chrono-kinetic',
  colorStoryId: 'luminous-purple',
  atmosphereId: 'gentle-current',
  backgroundEngineId: 'constellation',
  breathPattern: 'calm',
  atomScale: 1.0,
  atomOpacity: 1.0,
  atmosphereIntensity: 0.7,
};

const BREATH_PATTERNS: { id: BreathPattern; label: string; desc: string }[] = [
  { id: 'calm', label: 'Calm', desc: '4-7-8 calming' },
  { id: 'simple', label: 'Simple', desc: '4-4 rhythmic' },
  { id: 'energize', label: 'Energize', desc: '2-1-2-1 activating' },
  { id: 'box', label: 'Box', desc: '4-4-4-4 grounding' },
];

// =====================================================================
// ATOM SELECTOR (Left Panel) — Series-based catalog
// =====================================================================

function AtomSelector({
  selectedAtom,
  onSelect,
}: {
  selectedAtom: AtomId;
  onSelect: (id: AtomId) => void;
}) {
  const [expandedSeries, setExpandedSeries] = useState<SeriesId | null>(
    () => ATOM_CATALOG[selectedAtom]?.series ?? 'physics-engines',
  );

  const selectedMeta = ATOM_CATALOG[selectedAtom];

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
        ATOM LIBRARY
      </div>
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 8,
        color: colors.neutral.white,
        opacity: 0.1,
        marginBottom: 16,
      }}>
        {DESIGNED_ATOM_COUNT} designed · {TOTAL_ATOM_COUNT} total
      </div>

      {/* Series accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SERIES_IDS.map(seriesId => {
          const series = SERIES_CATALOG[seriesId];
          const seriesColor = SERIES_COLORS[seriesId];
          const isExpanded = expandedSeries === seriesId;
          const seriesAtoms = ATOM_IDS.filter(id => ATOM_CATALOG[id].series === seriesId);
          const hasSelected = selectedMeta?.series === seriesId;

          return (
            <div key={seriesId}>
              {/* Series header */}
              <button
                onClick={() => setExpandedSeries(isExpanded ? null : seriesId)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isExpanded ? withAlpha(seriesColor, 0.06) : 'rgba(0,0,0,0)',
                  textAlign: 'left',
                  transition: 'background 0.3s',
                }}
              >
                {/* Series color dot */}
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: seriesColor,
                  opacity: isExpanded || hasSelected ? 0.7 : 0.25,
                  flexShrink: 0,
                  transition: 'opacity 0.3s',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: fonts.primary,
                    fontSize: 11,
                    color: isExpanded ? seriesColor : colors.neutral.white,
                    opacity: isExpanded ? 0.7 : 0.3,
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {series.name}
                  </div>
                  <div style={{
                    fontFamily: fonts.mono,
                    fontSize: 7,
                    color: colors.neutral.white,
                    opacity: 0.1,
                    marginTop: 1,
                  }}>
                    {series.subtitle}
                  </div>
                </div>
                <div style={{
                  fontFamily: fonts.mono,
                  fontSize: 8,
                  color: colors.neutral.white,
                  opacity: 0.1,
                }}>
                  {series.number}
                </div>
              </button>

              {/* Atoms in series */}
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
                      {seriesAtoms.map(atomId => {
                        const atom = ATOM_CATALOG[atomId];
                        const isActive = selectedAtom === atomId;
                        const isDesigned = atom.implementations.length > 0;
                        const hasComponent = atomId in ATOM_COMPONENTS;

                        return (
                          <button
                            key={atomId}
                            onClick={() => onSelect(atomId)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '5px 8px',
                              borderRadius: 6,
                              border: 'none',
                              cursor: 'pointer',
                              background: isActive ? withAlpha(seriesColor, 0.08) : 'rgba(0,0,0,0)',
                              textAlign: 'left',
                              transition: 'background 0.2s',
                            }}
                          >
                            {/* Status indicator */}
                            <div style={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: hasComponent
                                ? colors.accent.cyan.light
                                : isDesigned ? seriesColor : surfaces.glass.border,
                              opacity: hasComponent ? 0.8 : isDesigned ? 0.3 : 0.15,
                              flexShrink: 0,
                            }} />
                            <div style={{
                              fontFamily: fonts.primary,
                              fontSize: 10,
                              color: isActive ? seriesColor : colors.neutral.white,
                              opacity: isActive ? 0.7 : isDesigned ? 0.3 : 0.12,
                              transition: 'all 0.2s',
                              flex: 1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {isDesigned ? atom.name.replace(/^The /, '') : `#${atom.number}`}
                            </div>
                            <div style={{
                              fontFamily: fonts.mono,
                              fontSize: 7,
                              color: colors.neutral.white,
                              opacity: 0.08,
                            }}>
                              {atom.renderMode}
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
// DEVICE SCENE RENDERER — what appears inside the phone
// =====================================================================

function AtomSceneRenderer({
  atomId,
  colorStory,
  atmosphere,
  backgroundEngine,
  breathPattern,
  reducedMotion,
  atomScale,
  atomOpacity,
  atmosphereIntensity,
}: {
  atomId: AtomId;
  colorStory: ColorStory;
  atmosphere: AtmospherePreset;
  backgroundEngine: BackgroundEngine;
  breathPattern: BreathPattern;
  reducedMotion: boolean;
  atomScale: number;
  atomOpacity: number;
  atmosphereIntensity: number;
}) {
  const AtomComponent = ATOM_COMPONENTS[atomId];
  const atomColor = ATOM_COLORS[atomId];
  const atomMeta = ATOM_CATALOG[atomId];
  const engineVisual = getEngineVisual(backgroundEngine.id);
  const { amplitude } = useBreathEngine(breathPattern);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Z-1: Background engine — wrapper opacity keeps engine elements in ALPHA.background range */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
        <EnginePreviewRenderer
          engineId={backgroundEngine.id}
          physics={backgroundEngine.physics}
          responseMode="resonance"
          accent={engineVisual?.accent ?? colorStory.accent}
          glow={engineVisual?.glow ?? colorStory.glow}
          params={backgroundEngine.params}
          viewport={{ width: deviceFrame.composer.width, height: deviceFrame.composer.height }}
          engineName=""
          responseName=""
        />
      </div>

      {/* Z-2: Color story surface tint — ALPHA.atmosphere via radial gradient stop alpha */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${colorStory.surface} 0%, transparent 80%)`,
        }}
      />

      {/* Z-2: Color story accent glow — ALPHA.atmosphere, breath-driven */}
      <div
        style={{
          position: 'absolute',
          width: '80%',
          height: '60%',
          top: '10%',
          left: '10%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colorStory.glow} 0%, transparent 60%)`,
          opacity: 0.3 + amplitude * 0.2,
          transition: reducedMotion ? 'none' : 'opacity 1.5s ease',
        }}
      />

      {/* Layer 4: Removed — atmosphere gradients are now handled by engine renderers */}

      {/* Z-2: Secondary color accent — ALPHA.background range, breath-modulated */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '20%',
          width: '60%',
          height: '40%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colorStory.secondary} 0%, transparent 70%)`,
          opacity: (0.5 + amplitude * 0.3) * 0.15,
          transition: reducedMotion ? 'none' : 'opacity 2s ease',
        }}
      />

      {/* Z-3/Z-4: The Atom — content/focal range, user-controlled opacity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        {AtomComponent ? (
          <div
            style={{
              position: 'relative',
              transform: `scale(${atomScale})`,
              opacity: atomOpacity,
              transition: reducedMotion ? 'none' : 'transform 0.6s ease, opacity 0.4s ease',
              width: '100%',
              height: '100%',
            }}
          >
            <AtomComponent
              breathAmplitude={amplitude}
              reducedMotion={reducedMotion}
              color={atomColor}
              accentColor={colorStory.accent}
              viewport={{ width: deviceFrame.composer.width, height: deviceFrame.composer.height }}
              phase="active"
              onHaptic={(_event) => { /* haptic bridge not yet wired */ }}
            />
          </div>
        ) : (
          /* Blueprint placeholder — shows atom identity without component */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            padding: 24,
          }}>
            {/* Breathing identity ring */}
            <div style={{
              width: atomsLayout.blueprintRingBase + amplitude * atomsLayout.blueprintRingBreathRange,
              height: atomsLayout.blueprintRingBase + amplitude * atomsLayout.blueprintRingBreathRange,
              borderRadius: '50%',
              border: `1px solid ${withAlpha(atomColor, 0.15 + amplitude * 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: reducedMotion ? 'none' : 'all 1.2s ease-out',
            }}>
              <div style={{
                width: atomsLayout.blueprintDotBase + amplitude * atomsLayout.blueprintDotBreathRange,
                height: atomsLayout.blueprintDotBase + amplitude * atomsLayout.blueprintDotBreathRange,
                borderRadius: '50%',
                background: atomColor,
                opacity: 0.3 + amplitude * 0.4,
                boxShadow: `0 0 ${atomsLayout.blueprintGlowBase + amplitude * atomsLayout.blueprintGlowBreathRange}px ${withAlpha(atomColor, 0.2)}`,
                transition: reducedMotion ? 'none' : 'all 1.2s ease-out',
              }} />
            </div>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 8,
              color: atomColor,
              opacity: 0.3,
              letterSpacing: '0.06em',
              textAlign: 'center',
              maxWidth: 180,
            }}>
              {atomMeta.renderMode} · {atomMeta.defaultScale}
            </div>
            <div style={{
              fontFamily: fonts.primary,
              fontSize: 10,
              color: colors.neutral.white,
              opacity: 0.15,
              textAlign: 'center',
              maxWidth: 200,
              lineHeight: 1.4,
            }}>
              {atomMeta.implementations.length > 0
                ? atomMeta.implementations.join(' · ')
                : 'pending design'
              }
            </div>
          </div>
        )}
      </div>

      {/* Z-top: Vignette — edge darkening, fixed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />
    </div>
  );
}

// =====================================================================
// COMPOSITION CONTROLS (Right Panel)
// =====================================================================

function CompositionControls({
  state,
  onChange,
}: {
  state: CompositionState;
  onChange: (s: CompositionState) => void;
}) {
  const meta = ATOM_CATALOG[state.atomId];
  const atomColor = ATOM_COLORS[state.atomId];
  const series = SERIES_CATALOG[meta.series];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 28, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* ── Atom Info ───────────────────────── */}
      <div>
        <SectionLabel>active atom</SectionLabel>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.atomId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              fontFamily: fonts.secondary,
              fontSize: 16,
              color: atomColor,
              opacity: 0.75,
              marginBottom: 2,
            }}>
              {meta.name}
            </div>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 8,
              color: SERIES_COLORS[meta.series],
              opacity: 0.25,
              letterSpacing: '0.04em',
              marginBottom: 8,
            }}>
              {series.name} · #{meta.number}
            </div>
            <div style={{
              fontFamily: fonts.primary,
              fontSize: 11,
              color: colors.neutral.white,
              opacity: 0.22,
              lineHeight: 1.5,
            }}>
              {meta.intent.length > 200
                ? meta.intent.slice(0, 200) + '…'
                : meta.intent
              }
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Color Story ──────────────────────── */}
      <div>
        <SectionLabel>color story</SectionLabel>
        <div style={{ display: 'grid', gap: 3 }}>
          {COLOR_STORIES.map(cs => (
            <button
              key={cs.id}
              onClick={() => onChange({ ...state, colorStoryId: cs.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: state.colorStoryId === cs.id ? surfaces.glass.light : 'rgba(0,0,0,0)',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${cs.primary}, ${cs.accent})`,
                flexShrink: 0,
              }} />
              <div style={{
                fontFamily: fonts.primary,
                fontSize: 11,
                color: colors.neutral.white,
                opacity: state.colorStoryId === cs.id ? 0.6 : 0.25,
                transition: 'opacity 0.2s',
              }}>
                {cs.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Atmosphere ──────────────────────── */}
      <div>
        <SectionLabel>atmosphere</SectionLabel>
        <div style={{ display: 'grid', gap: 3 }}>
          {ATMOSPHERE_PRESETS.map(atm => (
            <button
              key={atm.id}
              onClick={() => onChange({ ...state, atmosphereId: atm.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: state.atmosphereId === atm.id ? surfaces.glass.light : 'rgba(0,0,0,0)',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: state.atmosphereId === atm.id ? colors.neutral.white : surfaces.glass.border,
                opacity: state.atmosphereId === atm.id ? 0.5 : 0.15,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: fonts.primary,
                  fontSize: 11,
                  color: colors.neutral.white,
                  opacity: state.atmosphereId === atm.id ? 0.6 : 0.25,
                  transition: 'opacity 0.2s',
                }}>
                  {atm.name}
                </div>
                <div style={{
                  fontFamily: fonts.mono,
                  fontSize: 7,
                  color: colors.neutral.white,
                  opacity: 0.1,
                  marginTop: 1,
                }}>
                  {atm.intention}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <SliderControl
            label="intensity"
            value={state.atmosphereIntensity}
            min={0}
            max={1}
            step={0.05}
            onChange={v => onChange({ ...state, atmosphereIntensity: v })}
          />
        </div>
      </div>

      {/* ── Background Engine ─────────────────── */}
      <div>
        <SectionLabel>background engine</SectionLabel>
        <div style={{ display: 'grid', gap: 3 }}>
          {BACKGROUND_ENGINES.map(eng => (
            <button
              key={eng.id}
              onClick={() => onChange({ ...state, backgroundEngineId: eng.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: state.backgroundEngineId === eng.id ? surfaces.glass.light : 'rgba(0,0,0,0)',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: state.backgroundEngineId === eng.id ? colors.neutral.white : surfaces.glass.border,
                opacity: state.backgroundEngineId === eng.id ? 0.5 : 0.3,
              }} />
              <div style={{
                fontFamily: fonts.primary,
                fontSize: 11,
                color: colors.neutral.white,
                opacity: state.backgroundEngineId === eng.id ? 0.6 : 0.25,
                transition: 'opacity 0.2s',
              }}>
                {eng.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Breath Pattern ────────────────────── */}
      <div>
        <SectionLabel>breath</SectionLabel>
        <div style={{ display: 'flex', gap: 4 }}>
          {BREATH_PATTERNS.map(bp => (
            <button
              key={bp.id}
              onClick={() => onChange({ ...state, breathPattern: bp.id })}
              title={bp.desc}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontFamily: fonts.primary,
                fontSize: 11,
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

      {/* ── Atom Tuning ──────────────────────── */}
      <div>
        <SectionLabel>atom tuning</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SliderControl
            label="scale"
            value={state.atomScale}
            min={0.4}
            max={2.0}
            step={0.05}
            onChange={v => onChange({ ...state, atomScale: v })}
            formatValue={v => `${v.toFixed(1)}x`}
          />
          <SliderControl
            label="opacity"
            value={state.atomOpacity}
            min={0.2}
            max={1.0}
            step={0.05}
            onChange={v => onChange({ ...state, atomOpacity: v })}
            formatValue={v => `${Math.round(v * 100)}%`}
          />
        </div>
      </div>

      {/* ── Atom Contract ────────────────────── */}
      <div>
        <SectionLabel>contract</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <PropStat label="render" value={meta.renderMode} />
          <PropStat label="scale" value={meta.defaultScale} />
          <PropStat label="states" value={`${meta.stateRange[0]}–${meta.stateRange[1]}`} />
          <PropStat label="breath" value={meta.breathCoupling} />
          <PropStat label="resolution" value={meta.hasResolution ? 'yes' : 'no'} />
          <PropStat label="status" value={meta.status} />
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{
            fontFamily: fonts.mono,
            fontSize: 7,
            color: colors.neutral.white,
            opacity: 0.12,
            letterSpacing: '0.06em',
            marginBottom: 4,
          }}>
            surfaces
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {meta.surfaces.map(s => (
              <span key={s} style={{
                fontFamily: fonts.mono,
                fontSize: 8,
                color: colors.neutral.white,
                opacity: 0.2,
                padding: '2px 6px',
                borderRadius: 3,
                background: surfaces.glass.subtle,
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {meta.implementations.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 7,
              color: colors.neutral.white,
              opacity: 0.12,
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}>
              implementations
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {meta.implementations.map(impl => (
                <span key={impl} style={{
                  fontFamily: fonts.mono,
                  fontSize: 8,
                  color: atomColor,
                  opacity: 0.25,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: withAlpha(atomColor, 0.05),
                }}>
                  {impl}
                </span>
              ))}
            </div>
          </div>
        )}

        {meta.hapticSignature && meta.hapticSignature !== 'Pending' && (
          <div style={{ marginTop: 10 }}>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 7,
              color: colors.neutral.white,
              opacity: 0.12,
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}>
              haptic signature
            </div>
            <div style={{
              fontFamily: fonts.primary,
              fontSize: 10,
              color: colors.neutral.white,
              opacity: 0.18,
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}>
              {meta.hapticSignature}
            </div>
          </div>
        )}
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

// =====================================================================
// MAIN WORKSPACE
// =====================================================================

export default function AtomsLibrary() {
  const [state, setState] = useState<CompositionState>(INITIAL_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const { setContent } = useDeviceMirror();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < atomsLayout.mobileBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Resolve layer data
  const colorStory = useMemo(
    () => COLOR_STORIES.find(c => c.id === state.colorStoryId) ?? COLOR_STORIES[0],
    [state.colorStoryId],
  );
  const atmosphere = useMemo(
    () => ATMOSPHERE_PRESETS.find(a => a.id === state.atmosphereId) ?? ATMOSPHERE_PRESETS[0],
    [state.atmosphereId],
  );
  const backgroundEngine = useMemo(
    () => BACKGROUND_ENGINES.find(e => e.id === state.backgroundEngineId) ?? BACKGROUND_ENGINES[0],
    [state.backgroundEngineId],
  );

  // Push composed scene into DeviceMirror
  useEffect(() => {
    setContent({
      accent: colorStory.accent,
      glow: colorStory.glow,
      breathPattern: state.breathPattern,
      customRenderer: (
        <AtomSceneRenderer
          atomId={state.atomId}
          colorStory={colorStory}
          atmosphere={atmosphere}
          backgroundEngine={backgroundEngine}
          breathPattern={state.breathPattern}
          reducedMotion={reducedMotion}
          atomScale={state.atomScale}
          atomOpacity={state.atomOpacity}
          atmosphereIntensity={state.atmosphereIntensity}
        />
      ),
    });
  }, [
    state.atomId, colorStory, atmosphere, backgroundEngine, reducedMotion,
    state.atomScale, state.atomOpacity, state.atmosphereIntensity,
    state.breathPattern, setContent,
  ]);

  // ── Desktop: 3-column layout ──────────────────────────────
  if (!isMobile) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${atomsLayout.catalogPanelWidth}px 1fr ${atomsLayout.controlsPanelWidth}px`,
        gap: 0,
        minHeight: `calc(100vh - ${layout.topBarHeight}px)`,
      }}>
        {/* Left: Atom catalog */}
        <div style={{
          padding: '20px 16px',
          borderRight: `1px solid ${surfaces.glass.subtle}`,
          background: withAlpha(surfaces.solid.base, 0.4),
          overflowY: 'auto',
        }}>
          <AtomSelector
            selectedAtom={state.atomId}
            onSelect={id => setState(s => ({ ...s, atomId: id }))}
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
          <CompositionControls state={state} onChange={setState} />
        </div>
      </div>
    );
  }

  // ── Mobile: stacked layout ────────────────────────────────
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <DeviceMirror />
      </div>
      <AtomSelector
        selectedAtom={state.atomId}
        onSelect={id => setState(s => ({ ...s, atomId: id }))}
      />
      <div style={{ marginTop: 24 }}>
        <CompositionControls state={state} onChange={setState} />
      </div>
    </div>
  );
}