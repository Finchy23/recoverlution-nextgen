/**
 * SYNC PAGE — The Copy Workbench
 *
 * Select atom + copy type. Inspect every fragment independently.
 * Device mirror (phone/desktop) wraps the live atom + copy preview.
 * Same pattern as Base and Surfaces pages.
 */

import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import { DepthPlane, CopyContainer, AtmosphericText } from '../components/sync/SyncComposer';
import { SYNC_COMPOSITIONS } from '../components/sync/sync-compositions';
import type { AtomProps } from '../components/atoms/types';
import type { Beat, CopyType } from '../components/sync/sync-types';
import {
  decomposeComposition,
  COPY_TYPE_INFO,
  FRAGMENT_ROLES,
  type SyncFragment,
  type FragmentRole,
} from '../components/sync/sync-fragments';
import { getImplementedAtoms } from '../components/atoms/atom-registry';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, radii, glaze, glow, layer, signal } from '../components/design-system/surface-tokens';

// ─── Lazy-load atoms ───
const atomComponents: Record<string, LazyExoticComponent<ComponentType<AtomProps>>> = {
  'somatic-resonance': lazy(() => import('../components/atoms/somatic-resonance')),
  'wave-collapse': lazy(() => import('../components/atoms/wave-collapse')),
  'dark-matter': lazy(() => import('../components/atoms/dark-matter')),
  'mycelial-routing': lazy(() => import('../components/atoms/mycelial-routing')),
  'phoenix-ash': lazy(() => import('../components/atoms/phoenix-ash')),
  'cymatic-coherence': lazy(() => import('../components/atoms/cymatic-coherence')),
  'future-memory': lazy(() => import('../components/atoms/future-memory')),
  'still-point': lazy(() => import('../components/atoms/still-point')),
  'tidal-breath': lazy(() => import('../components/atoms/tidal-breath')),
  'weight-release': lazy(() => import('../components/atoms/weight-release')),
  'signal-fire': lazy(() => import('../components/atoms/signal-fire')),
  'dissolve': lazy(() => import('../components/atoms/dissolve')),
  'ember-grid': lazy(() => import('../components/atoms/ember-grid')),
  'pendulum-rest': lazy(() => import('../components/atoms/pendulum-rest')),
  'mirror-breath': lazy(() => import('../components/atoms/mirror-breath')),
  'root-pulse': lazy(() => import('../components/atoms/root-pulse')),
  'threshold': lazy(() => import('../components/atoms/threshold')),
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

// ─── Styles ───
const SANS = "'Inter', sans-serif";
const SERIF = "'Crimson Pro', Georgia, serif";

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

const btnBase = (active: boolean): React.CSSProperties => ({
  fontFamily: SERIF,
  fontSize: typeSize.small,
  fontWeight: active ? weight.medium : weight.regular,
  color: active ? room.fg : glaze.silver,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  transition: timing.t.colorMid,
  whiteSpace: 'nowrap',
});

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

// ═══════════════════════════════════════════════════
// FRAGMENT PREVIEW — renders one fragment at peak visibility
// ═══════════════════════════════════════════════════

function FragmentPreview({ fragment, viewport }: { fragment: SyncFragment; viewport: { width: number; height: number } }) {
  const d = fragment.depth;

  if (fragment.role === 'atmospheric') {
    return <AtmosphericText text={fragment.payload.text} visible />;
  }

  return (
    <DepthPlane
      layer={d.peakLayer}
      opacity={d.peakOpacity}
      blur={d.peakBlur}
      transitionSpeed="opacity 0.8s ease, filter 0.8s ease, transform 1s ease"
    >
      <CopyContainer payload={fragment.payload} viewport={viewport} />
    </DepthPlane>
  );
}

// ═══════════════════════════════════════════════════
// TIMELINE BAR
// ═══════════════════════════════════════════════════

function TimelineBar({ fragment, isActive }: { fragment: SyncFragment; isActive: boolean }) {
  const t = fragment.timing;
  const total = Math.max(t.total, 0.01);
  const delayPct = (t.delay / total) * 100;
  const fadeInPct = (t.fadeIn / total) * 100;
  const holdPct = (t.hold / total) * 100;
  const fadeOutPct = (t.fadeOut / total) * 100;

  const beatColor =
    fragment.beat === 'entrance' ? glass(signal.entrance, 0.6) :
    fragment.beat === 'friction' ? glass(signal.frictionBeat, 0.6) :
    glass(signal.resolution, 0.5);

  return (
    <div style={{ display: 'flex', height: 3, width: '100%', borderRadius: radii.bar, overflow: 'hidden', opacity: isActive ? 1 : 0.3, transition: `opacity ${timing.dur.fast} ease` }}>
      <div style={{ width: `${delayPct}%`, background: glaze.thin }} />
      <div style={{ width: `${fadeInPct}%`, background: `linear-gradient(90deg, transparent, ${beatColor})` }} />
      <div style={{ width: `${holdPct}%`, background: beatColor }} />
      <div style={{ width: `${fadeOutPct}%`, background: `linear-gradient(90deg, ${beatColor}, transparent)` }} />
    </div>
  );
}

// ═════════════════════════════════════════════════
// FRAGMENT INSPECTOR
// ═══════════════════════════════════════════════════

function FragmentInspector({ fragment }: { fragment: SyncFragment }) {
  const t = fragment.timing;
  const d = fragment.depth;
  const typ = fragment.typography;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '6px 0' }}>
      <div>
        <span style={dimLabel}>Timing</span>
        <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={monoStyle}>delay: {t.delay.toFixed(2)}s</span>
          <span style={monoStyle}>fadeIn: {t.fadeIn.toFixed(2)}s</span>
          <span style={monoStyle}>hold: {t.hold.toFixed(2)}s</span>
          <span style={monoStyle}>fadeOut: {t.fadeOut.toFixed(2)}s</span>
          <span style={{ ...monoStyle, color: glaze.half }}>total: {t.total.toFixed(2)}s</span>
        </div>
      </div>
      <div>
        <span style={dimLabel}>Depth</span>
        <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={monoStyle}>entry: {d.entryLayer}</span>
          <span style={monoStyle}>peak: {d.peakLayer}</span>
          <span style={monoStyle}>exit: {d.exitLayer}</span>
          <span style={monoStyle}>blur: {d.entryBlur}→{d.peakBlur}→{d.exitBlur}</span>
          <span style={monoStyle}>opacity: {d.entryOpacity}→{d.peakOpacity}→{d.exitOpacity}</span>
        </div>
      </div>
      <div>
        <span style={dimLabel}>Behavior</span>
        <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={monoStyle}>entry: {fragment.entry}</span>
          <span style={monoStyle}>exit: {fragment.exit}</span>
          <span style={monoStyle}>progress: {fragment.progressDriven ? 'yes' : 'no'}</span>
          <span style={monoStyle}>touch: {fragment.touchLocked ? 'locked' : 'free'}</span>
          <span style={monoStyle}>json: {fragment.jsonReady ? 'ready' : 'no'}</span>
        </div>
      </div>
      <div>
        <span style={dimLabel}>Typography</span>
        <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={monoStyle}>font: {typ.fontFamily.split(',')[0].replace(/'/g, '')}</span>
          <span style={monoStyle}>size: {typ.fontSize}</span>
          <span style={monoStyle}>weight: {typ.fontWeight}</span>
          <span style={monoStyle}>anchor: {typ.anchor}</span>
          <span style={monoStyle}>maxW: {(typ.maxWidthFrac * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DEVICE MIRROR — phone/desktop frame for the atom preview
// ═══════════════════════════════════════════════════

interface DeviceMirrorProps {
  device: Device;
  children: React.ReactNode;
}

function DeviceMirror({ device, children }: DeviceMirrorProps) {
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
        {/* Deep black base */}
        <div className="absolute inset-0" style={{ background: room.void }} />

        {/* Content */}
        <div className="absolute inset-0">
          {children}
        </div>

        {/* Top sheen */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 15%, ${glaze.mist} 50%, transparent 85%)`,
          }}
        />

        {/* Edge glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 'inherit',
            boxShadow: glow.innerAtmosphere(glass(signal.entrance, 0.03), glass(signal.entrance, 0.01)),
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// THE SYNC WORKBENCH
// ═══════════════════════════════════════════════════

export function SyncPage() {
  const [device, setDevice] = useState<Device>('phone');
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });
  const breath = useSimulatedBreath();

  // ─── Selections ───
  const implementedAtoms = useMemo(() => getImplementedAtoms(), []);
  const [selectedAtomId, setSelectedAtomId] = useState(implementedAtoms[0]?.id || 'somatic-resonance');
  const [selectedCopyType, setSelectedCopyType] = useState<CopyType | 'all'>('all');

  // ─── Derived ───
  const composition = useMemo(
    () => SYNC_COMPOSITIONS.find(c => c.atomId === selectedAtomId),
    [selectedAtomId],
  );

  const fragments = useMemo(
    () => composition ? decomposeComposition(composition) : [],
    [composition],
  );

  const filteredFragments = useMemo(
    () => selectedCopyType === 'all'
      ? fragments
      : fragments.filter(f => f.copyType === selectedCopyType),
    [fragments, selectedCopyType],
  );

  // The single active fragment when a specific copy type is selected
  const activeFragment = useMemo(
    () => selectedCopyType !== 'all' && filteredFragments.length === 1
      ? filteredFragments[0]
      : null,
    [selectedCopyType, filteredFragments],
  );

  const AtomComponent = atomComponents[selectedAtomId];
  const atomMeta = implementedAtoms.find(a => a.id === selectedAtomId);

  // Available copy types for this composition
  const availableCopyTypes = useMemo(() => {
    const types = new Set<CopyType>();
    fragments.forEach(f => types.add(f.copyType));
    return Array.from(types);
  }, [fragments]);

  // Track mirror viewport
  useEffect(() => {
    const el = mirrorRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Atom callbacks
  const noop = useCallback(() => {}, []);
  const noopState = useCallback((_v: number) => {}, []);

  // Build atom element
  const atomElement = AtomComponent ? (
    <Suspense fallback={null}>
      <AtomComponent
        breathAmplitude={breath}
        reducedMotion={false}
        color={atomMeta?.color || signal.neutral}
        accentColor={atomMeta?.accentColor || signal.neutralLight}
        viewport={viewport}
        phase="active"
        onHaptic={noop}
        onStateChange={noopState}
        onResolve={noop}
      />
    </Suspense>
  ) : null;

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 56px)', background: room.deep }}
    >
      {/* ═══ DEVICE MIRROR VIEWPORT ═══ */}
      <div className="flex-1 flex items-center justify-center min-h-0 px-4 pt-2">
        <DeviceMirror device={device}>
          <div ref={mirrorRef} style={{ position: 'absolute', inset: 0 }}>
            {/* Atom canvas — z:1 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: layer.base }}>
              {atomElement}
            </div>

            {/* Copy layer — z:2 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: layer.content, pointerEvents: 'none' }}>
              {filteredFragments.map(f => (
                <FragmentPreview
                  key={f.id}
                  fragment={f}
                  viewport={viewport}
                />
              ))}
            </div>

            {/* Fragment label — z:3 */}
            {activeFragment && (
              <div style={{
                position: 'absolute',
                bottom: 14,
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: layer.raised,
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontFamily: SANS,
                  fontSize: typeSize.whisper,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.wide,
                  textTransform: 'uppercase',
                  color: glaze.ember,
                }}>
                  {activeFragment.role} · {activeFragment.beat}
                </span>
              </div>
            )}

            {/* Atom ID whisper */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: 14,
              zIndex: layer.raised,
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.regular,
              letterSpacing: tracking.normal,
              textTransform: 'uppercase',
              color: glaze.ember,
              pointerEvents: 'none',
            }}>
              {selectedAtomId}
            </div>
          </div>
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
          {/* Row 1: Atom + Copy Type selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Atom */}
            <div>
              <span style={labelStyle}>Atom</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {implementedAtoms.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAtomId(a.id); setSelectedCopyType('all'); }}
                    style={btnBase(selectedAtomId === a.id)}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Type */}
            <div>
              <span style={labelStyle}>Copy Type</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <button
                  onClick={() => setSelectedCopyType('all')}
                  style={btnBase(selectedCopyType === 'all')}
                >
                  All
                </button>
                {availableCopyTypes.map(ct => {
                  const info = COPY_TYPE_INFO[ct];
                  return (
                    <button
                      key={ct}
                      onClick={() => setSelectedCopyType(ct)}
                      style={btnBase(selectedCopyType === ct)}
                    >
                      <span style={{ marginRight: 4, opacity: opacity.body }}>{info.glyph}</span>
                      {info.label.charAt(0) + info.label.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="sm:col-span-1 lg:col-span-2">
              <span style={labelStyle}>Timeline</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {fragments.map(f => {
                  const isActive = selectedCopyType === 'all' || f.copyType === selectedCopyType;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedCopyType(f.copyType)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 45px',
                        gap: 6,
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '1px 0',
                      }}
                    >
                      <span style={{
                        ...monoStyle,
                        fontSize: typeSize.micro,
                        color: isActive ? glaze.milk : glaze.muted,
                        transition: `color ${timing.dur.fast} ease`,
                      }}>
                        {f.label}
                      </span>
                      <TimelineBar fragment={f} isActive={isActive} />
                      <span style={{
                        ...monoStyle,
                        fontSize: typeSize.micro,
                        textAlign: 'right',
                        color: isActive ? glaze.silver : glaze.ember,
                      }}>
                        {f.timing.total.toFixed(1)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Inspector (when specific copy type selected) */}
          {activeFragment && (
            <div className="mt-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
                <span style={labelStyle}>Inspector</span>
                <span style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.note,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: glaze.dim,
                }}>
                  "{activeFragment.payload.text.length > 55
                    ? activeFragment.payload.text.slice(0, 55) + '…'
                    : activeFragment.payload.text}"
                </span>
              </div>
              <FragmentInspector fragment={activeFragment} />
            </div>
          )}

          {/* When multiple fragments match the copy type */}
          {selectedCopyType !== 'all' && filteredFragments.length > 1 && (
            <div className="mt-3">
              <span style={labelStyle}>
                {filteredFragments.length} fragments match {selectedCopyType}
              </span>
              {filteredFragments.map(f => (
                <div key={f.id} style={{ marginBottom: 8 }}>
                  <span style={{ ...monoStyle, fontSize: typeSize.label, color: glaze.tin }}>
                    {f.role} — "{f.payload.text.slice(0, 50)}{f.payload.text.length > 50 ? '…' : ''}"
                  </span>
                  <FragmentInspector fragment={f} />
                </div>
              ))}
            </div>
          )}

          {/* Row 3: Status + Device toggle */}
          <div className="mt-3 flex items-center gap-6 sm:justify-between">
            <div className="flex items-center gap-3">
              <span style={{
                fontFamily: SERIF,
                fontSize: typeSize.note,
                color: glaze.dim,
                fontStyle: 'italic',
              }}>
                {fragments.length} fragments · {availableCopyTypes.length} types · 3 beats
              </span>
              <span style={{
                fontFamily: SANS,
                fontSize: typeSize.detail,
                letterSpacing: tracking.tight,
                color: glaze.sheen,
              }}>
                {selectedCopyType === 'all' ? 'showing all' : selectedCopyType}
              </span>
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