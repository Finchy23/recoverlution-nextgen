/**
 * FORM PAGE — The Clinical Architecture Workbench
 *
 * FORM is not SYNC. This workbench demonstrates:
 *   1. The five clinical containers as distinct instruments
 *   2. The practice library — complete therapeutic protocols
 *   3. The LIVE FormSurface executing step-by-step in the device mirror
 *   4. Container mechanics: depth, interaction, somatic, safety
 *
 * The device mirror runs the real FormSurface with step override.
 * The control panel exposes the clinical engineering.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CONTAINERS,
  PROTOCOLS,
  ALL_CONTAINERS,
  type ClinicalContainer,
} from '../components/form/form-types';
import { FORM_PRACTICES } from '../components/form/form-practices';
import { FormSurface } from '../components/surfaces/FormSurface';
import { getModeById } from '../components/universal-player/surface-modes';
import { useFormRuntime } from '../components/runtime/useFormRuntime';
import { getImplementedAtoms } from '../components/atoms/atom-registry';
import type { Device } from '../components/design-system/surface-engine';
import { useSearchParams } from 'react-router';

import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, radii, glaze, glow, signal } from '../components/design-system/surface-tokens';

// ─── Styles ───
const SANS = font.sans;
const SERIF = font.serif;

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: typeSize.label,
  fontWeight: weight.medium,
  letterSpacing: tracking.spread,
  textTransform: 'uppercase',
  color: glaze.smoke,
  marginBottom: 6,
  display: 'block',
};

const monoStyle: React.CSSProperties = {
  fontFamily: font.mono,
  fontSize: typeSize.detail,
  letterSpacing: tracking.body,
  color: glaze.pewter,
};

const dimLabel: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: typeSize.micro,
  fontWeight: weight.regular,
  letterSpacing: tracking.snug,
  textTransform: 'uppercase',
  color: glaze.muted,
};

// ─── Breath simulator ───
function useSimulatedBreath(): number {
  const [breath, setBreath] = useState(0.3);
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 0.065;
      setBreath(0.3 + 0.35 * Math.sin(t) + 0.15 * Math.sin(t * 2.3));
    }, 65);
    return () => clearInterval(id);
  }, []);
  return breath;
}

// ═══════════════════════════════════════════════════
// CONTAINER INSPECTOR
// ══════════════════════════════════════════════════

function ContainerInspector({ container }: { container: ClinicalContainer }) {
  const def = CONTAINERS[container];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: '6px 0' }}>
      <div>
        <span style={dimLabel}>Clinical Function</span>
        <p style={{ ...monoStyle, marginTop: 3, lineHeight: leading.body }}>
          {def.clinicalFunction.length > 120
            ? def.clinicalFunction.slice(0, 120) + '\u2026'
            : def.clinicalFunction}
        </p>
      </div>
      <div>
        <span style={dimLabel}>Mechanics</span>
        <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={monoStyle}>depth: {def.depthPosition}</span>
          <span style={monoStyle}>persistent: {def.persistent ? 'yes' : 'no'}</span>
          <span style={monoStyle}>tradition: {def.tradition.split('(')[0].trim()}</span>
          <span style={monoStyle}>interaction: {def.interactionMechanic.split('.')[0]}</span>
        </div>
      </div>
      <div>
        <span style={dimLabel}>Safety</span>
        <p style={{ ...monoStyle, marginTop: 3, lineHeight: leading.body }}>
          {def.safetyMechanic.length > 100
            ? def.safetyMechanic.slice(0, 100) + '\u2026'
            : def.safetyMechanic}
        </p>
      </div>
    </div>
  );
}

// ════════��══════════════════════════════════════════
// DEVICE MIRROR
// ═══════════════════════════════════════════════════

function DeviceMirror({ device, children }: { device: Device; children: React.ReactNode }) {
  const isPhone = device === 'phone';

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: isPhone ? 'min(380px, 88vw)' : '100%',
        height: isPhone ? 'min(680px, 100%)' : '100%',
        maxHeight: '100%',
        borderRadius: isPhone ? radii.chromeOuter : radii.frame,
        background: glaze.trace,
        boxShadow: glow.chrome(glass(signal.entrance, 0.02)),
        transition: timing.t.arrive,
      }}
    >
      <div
        className="absolute overflow-hidden"
        style={{
          top: isPhone ? 12 : 6,
          left: isPhone ? 6 : 6,
          right: isPhone ? 6 : 6,
          bottom: isPhone ? 12 : 6,
          borderRadius: isPhone ? radii.chromeInner : radii.frameInner,
          transition: timing.t.arrive,
        }}
      >
        <div className="absolute inset-0" style={{ background: room.void }} />
        <div className="absolute inset-0">{children}</div>
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent 15%, ${glaze.mist} 50%, transparent 85%)` }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: 'inherit', boxShadow: glow.innerAtmosphere(glass(signal.entrance, 0.03), glass(signal.entrance, 0.01)) }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// THE FORM WORKBENCH
// ═══════════════════════════════════════════════════

export function FormPage() {
  const [device, setDevice] = useState<Device>('phone');
  const breath = useSimulatedBreath();
  const [searchParams] = useSearchParams();

  // ─── URL-based SEEK→FORM handoff ───
  const urlSchema = searchParams.get('schema') || '';
  const urlPractice = searchParams.get('practice') || '';

  // ─── Atom library for swapping ───
  const implementedAtoms = useMemo(() => getImplementedAtoms(), []);

  // ─── Selections ───
  const [selectedPracticeId, setSelectedPracticeId] = useState(
    urlPractice || FORM_PRACTICES[0].id,
  );
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [selectedContainer, setSelectedContainer] = useState<ClinicalContainer | null>(null);
  const [schemaInput, setSchemaInput] = useState(urlSchema);
  const [activeSchema, setActiveSchema] = useState(urlSchema);
  const [atomOverride, setAtomOverride] = useState<string | null>(null);

  // ─── Form runtime — SEEK→FORM handoff ───
  const formRuntime = useFormRuntime({ initialSchema: activeSchema });

  // ─── Derived ───
  const basePractice = useMemo(
    () => FORM_PRACTICES.find(p => p.id === selectedPracticeId)!,
    [selectedPracticeId],
  );

  // Apply atom override to practice
  const practice = useMemo(
    () => atomOverride ? { ...basePractice, atomId: atomOverride } : basePractice,
    [basePractice, atomOverride],
  );

  const currentStep = practice.steps[selectedStepIndex];
  const protocol = PROTOCOLS[practice.protocol];
  const formMode = getModeById('form');

  // Active container — from step or explicit selection
  const activeContainer = selectedContainer || currentStep?.container;

  // Reset step index when practice changes
  useEffect(() => {
    setSelectedStepIndex(0);
    setSelectedContainer(null);
  }, [selectedPracticeId]);

  // Schema injection handler
  const handleSchemaInject = useCallback(() => {
    if (!schemaInput.trim()) return;
    setActiveSchema(schemaInput.trim());
    formRuntime.setSchema(schemaInput.trim());
  }, [schemaInput, formRuntime]);

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 56px)', background: room.deep }}
    >
      {/* ═══ DEVICE MIRROR — Running the REAL FormSurface ═══ */}
      <div className="flex-1 flex items-center justify-center min-h-0 px-4 pt-2">
        <DeviceMirror device={device}>
          <FormSurface
            mode={formMode}
            breath={breath}
            practiceOverride={practice}
            stepOverride={selectedStepIndex}
            schemaOverride={activeSchema || undefined}
          />
        </DeviceMirror>
      </div>

      {/* ═══ CONTROL PANEL ═══ */}
      <div
        className="shrink-0 px-6 sm:px-10 pb-4 pt-4 relative"
        style={{ background: room.deep }}
      >
        {/* Gradient edge */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${glaze.veil} 30%, ${glaze.frost} 50%, ${glaze.veil} 70%, transparent 95%)` }} />

        <div className="max-w-5xl mx-auto">
          {/* Row 1: Practice + Steps + Container + Protocol */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Practice selector */}
            <div>
              <span style={labelStyle}>Practice</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {FORM_PRACTICES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPracticeId(p.id)}
                    style={{
                      fontFamily: SERIF,
                      fontSize: typeSize.small,
                      fontWeight: selectedPracticeId === p.id ? weight.medium : weight.regular,
                      color: selectedPracticeId === p.id ? room.fg : glaze.silver,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: timing.t.colorMid,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step sequence */}
            <div>
              <span style={labelStyle}>Protocol Steps</span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                {practice.steps.map((step, i) => {
                  const cDef = CONTAINERS[step.container];
                  const isActive = i === selectedStepIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedStepIndex(i); setSelectedContainer(null); }}
                      className="flex items-center gap-1"
                      style={{
                        fontFamily: SANS,
                        fontSize: typeSize.detail,
                        fontWeight: weight.medium,
                        letterSpacing: tracking.tight,
                        color: isActive ? cDef.colorTint.replace('0.5)', '0.8)') : glaze.dim,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 0',
                        transition: `color ${timing.dur.fast} ease`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ opacity: opacity.body, fontSize: typeSize.label }}>{cDef.glyph}</span>
                      {cDef.label}
                      {i < practice.steps.length - 1 && (
                        <span style={{ color: glaze.frost, margin: '0 2px', fontSize: typeSize.label }}>{'\u2192'}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Container selector */}
            <div>
              <span style={labelStyle}>Container</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {ALL_CONTAINERS.map(c => {
                  const cDef = CONTAINERS[c];
                  const isInPractice = practice.steps.some(s => s.container === c);
                  const isActive = activeContainer === c;
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        if (!isInPractice) return;
                        setSelectedContainer(c);
                        const stepIdx = practice.steps.findIndex(s => s.container === c);
                        if (stepIdx >= 0) setSelectedStepIndex(stepIdx);
                      }}
                      style={{
                        fontFamily: SERIF,
                        fontSize: typeSize.small,
                        fontWeight: isActive ? weight.medium : weight.regular,
                        color: isActive
                          ? cDef.colorTint.replace('0.5)', '0.9)')
                          : isInPractice
                            ? glaze.silver
                            : glaze.ember,
                        background: 'none',
                        border: 'none',
                        cursor: isInPractice ? 'pointer' : 'default',
                        padding: 0,
                        transition: timing.t.colorMid,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ marginRight: 4, opacity: opacity.body }}>{cDef.glyph}</span>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Protocol metadata */}
            <div>
              <span style={labelStyle}>Protocol</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={monoStyle}>protocol: {protocol.name}</span>
                <span style={monoStyle}>tradition: {protocol.tradition.split('(')[0].trim()}</span>
                <span style={monoStyle}>atom: {practice.atomId}</span>
                <span style={monoStyle}>steps: {practice.steps.length}</span>
                <span style={{ ...monoStyle, fontStyle: 'italic', color: glaze.dim }}>
                  "{practice.schema.length > 35 ? practice.schema.slice(0, 35) + '\u2026' : practice.schema}"
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Container clinical detail */}
          {activeContainer && (
            <div className="mt-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                <span style={labelStyle}>Clinical Detail</span>
                <span style={{
                  fontFamily: SANS,
                  fontSize: typeSize.label,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.snug,
                  color: CONTAINERS[activeContainer].colorTint.replace('0.5)', '0.4)'),
                }}>
                  {CONTAINERS[activeContainer].glyph} {activeContainer.toUpperCase()}
                </span>
              </div>
              <ContainerInspector container={activeContainer} />
            </div>
          )}

          {/* Row 2.5: SEEK→FORM Schema Injection */}
          <div className="mt-3 flex items-end gap-3">
            <div className="flex-1">
              <span style={labelStyle}>Schema Handoff</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={schemaInput}
                  onChange={(e) => setSchemaInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSchemaInject(); }}
                  placeholder="Type a thought to process\u2026"
                  style={{
                    fontFamily: SERIF,
                    fontSize: typeSize.small,
                    fontWeight: weight.light,
                    fontStyle: 'italic',
                    color: room.fg,
                    background: glaze.faint,
                    border: 'none',
                    borderBottom: `1px solid ${glaze.frost}`,
                    outline: 'none',
                    padding: '4px 0',
                    width: '100%',
                    maxWidth: 320,
                    letterSpacing: tracking.body,
                    transition: `border-color ${timing.dur.fast} ease`,
                  }}
                />
                <button
                  onClick={handleSchemaInject}
                  style={{
                    fontFamily: SANS,
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.spread,
                    textTransform: 'uppercase',
                    color: schemaInput.trim() ? glaze.tin : glaze.ember,
                    background: 'none',
                    border: 'none',
                    cursor: schemaInput.trim() ? 'pointer' : 'default',
                    padding: '4px 8px',
                    transition: `color ${timing.dur.fast} ease`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  INJECT
                </button>
                {activeSchema && (
                  <button
                    onClick={() => { setActiveSchema(''); setSchemaInput(''); }}
                    style={{
                      fontFamily: SANS,
                      fontSize: typeSize.label,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.spread,
                      textTransform: 'uppercase',
                      color: glaze.muted,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
            {activeSchema && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={dimLabel}>Runtime Resolution</span>
                <span style={monoStyle}>shape: {formRuntime.schemaShape}</span>
                <span style={monoStyle}>protocol: {formRuntime.recommendedProtocol}</span>
                <span style={monoStyle}>auto: {formRuntime.autoResolved ? 'yes' : 'no'}</span>
              </div>
            )}
          </div>

          {/* Row 2.75: Atom Selector */}
          <div className="mt-3">
            <span style={labelStyle}>Atom Override</span>
            <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
              <button
                onClick={() => setAtomOverride(null)}
                style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.note,
                  fontWeight: !atomOverride ? weight.medium : weight.regular,
                  color: !atomOverride ? room.fg : glaze.silver,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: timing.t.colorMid,
                  whiteSpace: 'nowrap',
                }}
              >
                Default
              </button>
              {implementedAtoms.map(atom => {
                const isActive = atomOverride === atom.id;
                const isDefault = !atomOverride && basePractice.atomId === atom.id;
                return (
                  <button
                    key={atom.id}
                    onClick={() => setAtomOverride(atom.id)}
                    style={{
                      fontFamily: SERIF,
                      fontSize: typeSize.note,
                      fontWeight: isActive ? weight.medium : weight.regular,
                      color: isActive
                        ? atom.color
                        : isDefault
                          ? glaze.milk
                          : glaze.dim,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: timing.t.colorMid,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {atom.name}
                    {isDefault && !atomOverride && (
                      <span style={{ fontSize: typeSize.micro, opacity: opacity.steady, marginLeft: 4 }}>{'\u2022'}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Status + Device toggle */}
          <div className="mt-3 flex items-center gap-6 sm:justify-between">
            <div className="flex items-center gap-3">
              <span style={{
                fontFamily: SERIF,
                fontSize: typeSize.note,
                color: glaze.dim,
                fontStyle: 'italic',
              }}>
                {practice.steps.length} steps · {new Set(practice.steps.map(s => s.container)).size} containers · {protocol.tradition.split(' ')[0]}
              </span>
              {currentStep && (
                <span style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.caption,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: glaze.sheen,
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  "{currentStep.copy.length > 45
                    ? currentStep.copy.slice(0, 45) + '\u2026'
                    : currentStep.copy}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-6">
              {(['phone', 'desktop'] as Device[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  style={{
                    fontFamily: SANS,
                    fontSize: typeSize.detail,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.shelf,
                    textTransform: 'uppercase',
                    color: device === d ? glaze.bright : glaze.dim,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: timing.t.color,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}