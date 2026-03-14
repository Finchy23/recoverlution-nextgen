import { useState, useRef, useEffect, useCallback } from 'react';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, glow, radii, glaze, layer } from '../components/design-system/surface-tokens';
import { ArrowRight, Check, Heart, Zap } from 'lucide-react';
import { SomaticThreshold } from '../components/controls/SomaticThreshold';
import { RefractiveField, SemanticParticle } from '../components/controls/RefractiveField';
import { TemperatureProvider, useTemperature } from '../components/design-system/TemperatureGovernor';
import { setAcousticsEnabled, acousticTick } from '../components/surfaces/acoustics';
import { useNeuroadaptiveSensing } from '../components/design-system/NeuroadaptiveSensing';
import { useSequenceEngine, arcPatterns, type ArcPatternId } from '../components/design-system/SequenceThermodynamics';
import { useHardwareSymbiosis } from '../components/design-system/HardwareSymbiosis';
import type { HeatBandId } from '../components/design-system/doctrine';
import { Reveal } from '../components/design-system/Reveal';

/**
 * COMPONENTS — The Instruments
 *
 * Each component is a therapeutic verb.
 * It catches, holds, slows, redirects, releases, or seals.
 */

const BREATH_DURATION = 10.9;

function SemanticPillDemo() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)} className="mb-4">
        <span style={{ fontSize: typeSize.note, color: room.gray3, cursor: 'pointer' }}>
          {collapsed ? 'expand' : 'collapse'}
        </span>
      </button>
      <div
        className="overflow-hidden"
        style={{
          width: collapsed ? 28 : 'auto',
          height: collapsed ? 5 : 'auto',
          borderRadius: collapsed ? radii.full : radii.frameInner,
          opacity: collapsed ? 0.3 : 1,
          background: collapsed ? glaze.sheen : glaze.thin,
          transition: timing.t.easeRespond,
        }}
      >
        {!collapsed && (
          <div className="px-5 py-4">
            <p style={{ fontSize: typeSize.reading, lineHeight: leading.relaxed, color: room.gray4 }}>
              Notice the hum of autopilot when it arises. You do not need to stop it. You only need to feel it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnchorOrbs() {
  const [breath, setBreath] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const origin = performance.now();
    const tick = (now: number) => {
      const s = (now - origin) / 1000;
      setBreath((Math.sin((s / BREATH_DURATION) * Math.PI * 2 - Math.PI / 2) + 1) / 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const scale = 1 + breath * 0.06;

  return (
    <div className="flex flex-wrap items-center gap-12">
      {[
        { label: 'Sync', color: colors.brand.purple.primary },
        { label: 'Talk', color: colors.accent.cyan.primary },
        { label: 'Play', color: colors.status.amber.bright },
        { label: 'Move', color: colors.accent.green.primary },
        { label: 'Echo', color: colors.status.purple.bright },
      ].map(o => (
        <div key={o.label} className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
            <div
              className="absolute rounded-full"
              style={{
                width: 70, height: 70,
                background: `radial-gradient(circle, ${o.color}15 0%, transparent 70%)`,
                transform: `scale(${scale * 1.05})`,
              }}
            />
            <div
              className="rounded-full"
              style={{
                width: 28, height: 28,
                background: `radial-gradient(circle at 38% 38%, ${o.color}dd, ${o.color}88 55%, ${o.color}44 100%)`,
                boxShadow: glow.point(o.color, 10 + breath * 10, '35'),
                transform: `scale(${scale})`,
              }}
            />
          </div>
          <span style={{ fontSize: typeSize.caption, color: room.gray2 }}>{o.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Somatic Threshold Demo ──
function SomaticThresholdDemo() {
  const [resolvedCount, setResolvedCount] = useState(0);

  const thresholds = [
    { label: 'Begin', color: colors.brand.purple.primary, receipt: 'The room opened.' },
    { label: 'Breathe', color: colors.accent.green.primary, receipt: 'The breath held.' },
    { label: 'Release', color: colors.accent.cyan.primary, receipt: 'The weight moved.' },
    { label: 'Seal', color: colors.status.amber.mid, receipt: 'The moment stamped.' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-8">
        {thresholds.map((t, i) => (
          <SomaticThreshold
            key={t.label}
            label={t.label}
            color={t.color}
            receipt={t.receipt}
            holdMs={500 + i * 100}
            size={i === 0 ? 'large' : i === 3 ? 'small' : 'medium'}
            onResolve={() => setResolvedCount(prev => prev + 1)}
          />
        ))}
      </div>

      {/* Resolve counter */}
      <div className="flex items-center gap-2 mt-8">
        <span
          className="rounded-full"
          style={{
            width: 3, height: 3,
            background: resolvedCount > 0 ? colors.accent.green.primary : glaze.hint,
            boxShadow: resolvedCount > 0 ? `0 0 6px ${colors.accent.green.primary}30` : 'none',
            transition: timing.t.easeRespond,
          }}
        />
        <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase', color: room.gray2 }}>
          {resolvedCount} threshold{resolvedCount !== 1 ? 's' : ''} resolved
        </span>
      </div>

      <p className="mt-6 max-w-md" style={{ fontSize: typeSize.note, color: room.gray1, lineHeight: leading.relaxed }}>
        No background. No border. No pill. The control reveals itself through pressure response.
        Hold any label above — watch the refractive field build around the typography,
        feel the haptic tension, hear the crystalline snap.
      </p>
    </div>
  );
}

// ── Temperature Governor Demo ──
function TemperatureGovernorDemo() {
  const [band, setBand] = useState<HeatBandId>(0);

  const bandData = [
    { id: 0 as HeatBandId, label: 'Safe & Social', color: 'hsl(160, 60%, 50%)', motionSpeed: '100%', choices: 8, copy: 'moderate' },
    { id: 1 as HeatBandId, label: 'Alert', color: 'hsl(140, 50%, 45%)', motionSpeed: '70%', choices: 4, copy: 'light' },
    { id: 2 as HeatBandId, label: 'Dysregulated', color: 'hsl(45, 90%, 55%)', motionSpeed: '40%', choices: 2, copy: 'whisper' },
    { id: 3 as HeatBandId, label: 'Fight/Flight', color: 'hsl(25, 90%, 55%)', motionSpeed: '15%', choices: 1, copy: 'whisper' },
    { id: 4 as HeatBandId, label: 'Survival', color: 'hsl(30, 90%, 50%)', motionSpeed: '0%', choices: 1, copy: 'silent' },
  ];

  const current = bandData[band];

  return (
    <div>
      {/* Band selector — semantic particles */}
      <div className="flex items-center gap-6 mb-8">
        {bandData.map((b) => (
          <button
            key={b.id}
            onClick={() => setBand(b.id)}
            className="flex items-center gap-1.5 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span
              className="rounded-full"
              style={{
                width: band === b.id ? 5 : 3,
                height: band === b.id ? 5 : 3,
                background: b.color,
                boxShadow: band === b.id ? `0 0 8px ${b.color}50` : 'none',
                opacity: band === b.id ? 1 : 0.3,
                transition: timing.t.easeRespond,
              }}
            />
            <span
              style={{
                fontSize: typeSize.detail,
                fontWeight: weight.medium,
                letterSpacing: tracking.compact,
                textTransform: 'uppercase',
                color: band === b.id ? b.color : room.gray3,
                opacity: band === b.id ? 0.8 : 0.4,
                transition: timing.t.easeRespond,
              }}
            >
              {b.id}
            </span>
          </button>
        ))}
      </div>

      {/* Current band readout */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="rounded-full"
          style={{
            width: 6, height: 6,
            background: current.color,
            boxShadow: glow.warm(current.color, '40'),
          }}
        />
        <span style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontWeight: weight.regular, color: room.fg, opacity: opacity.lucid }}>
          Band {current.id}: {current.label}
        </span>
      </div>

      {/* Governance constraints */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
        {[
          { label: 'motion', value: current.motionSpeed },
          { label: 'choices', value: String(current.choices) },
          { label: 'copy', value: current.copy },
        ].map(item => (
          <span
            key={item.label}
            style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: room.gray2, letterSpacing: tracking.code }}
          >
            <span style={{ color: room.gray1 }}>{item.label}</span>{' '}
            <span style={{ color: current.color, opacity: opacity.lucid, transition: `all ${timing.dur.fast}` }}>{item.value}</span>
          </span>
        ))}
      </div>

      {/* Motion speed bar */}
      <div className="max-w-xs">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: glaze.faint }}>
          <div
            className="h-full rounded-full"
            style={{
              width: current.motionSpeed,
              background: `linear-gradient(90deg, ${current.color}60, ${current.color}15)`,
              transition: timing.t.flow,
            }}
          />
        </div>
      </div>

      {/* Governed somatic control */}
      <div className="flex items-center gap-6 mt-8">
        <TemperatureProvider initialBand={band}>
          <SomaticThreshold
            label="Governed"
            color={current.color}
            receipt="Under governance."
            holdMs={band >= 3 ? 100 : 500}
            size="medium"
          />
        </TemperatureProvider>
      </div>

      <p className="mt-4 max-w-md" style={{ fontSize: typeSize.caption, color: room.gray1, fontStyle: 'italic', lineHeight: leading.body }}>
        At Band 3+, the threshold collapses to a simple tap. The room becomes safer.
      </p>
    </div>
  );
}

// ── Refractive Field Demo ──
function RefractiveFieldDemo() {
  const [breath, setBreath] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const origin = performance.now();
    const tick = (now: number) => {
      const s = (now - origin) / 1000;
      setBreath((Math.sin((s / BREATH_DURATION) * Math.PI * 2 - Math.PI / 2) + 1) / 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      {/* Refractive fields with different shapes and colors */}
      <div className="flex flex-wrap gap-8 mb-8">
        <TemperatureProvider initialBand={0}>
          <RefractiveField color={colors.brand.purple.primary} intensity={0.12} breath={breath} shape="ellipse">
            <p style={{ fontFamily: font.serif, fontSize: typeSize.lede, color: room.fg, opacity: opacity.strong, lineHeight: leading.generous, maxWidth: 200 }}>
              The field elevates content without drawing a box.
            </p>
          </RefractiveField>
        </TemperatureProvider>

        <TemperatureProvider initialBand={0}>
          <RefractiveField color={colors.accent.cyan.primary} intensity={0.10} breath={breath} shape="circle">
            <div className="flex flex-col items-center gap-2">
              <div
                className="rounded-full"
                style={{
                  width: 20, height: 20,
                  background: `radial-gradient(circle, ${colors.accent.cyan.primary}40, ${colors.accent.cyan.primary}10)`,
                  boxShadow: glow.warm(colors.accent.cyan.primary, '20'),
                }}
              />
              <span style={{ fontSize: typeSize.detail, letterSpacing: tracking.label, textTransform: 'uppercase', color: colors.accent.cyan.primary, opacity: opacity.body }}>
                Awareness
              </span>
            </div>
          </RefractiveField>
        </TemperatureProvider>

        <TemperatureProvider initialBand={0}>
          <RefractiveField color={colors.accent.green.primary} intensity={0.08} breath={breath} shape="wide">
            <div className="flex items-center gap-3">
              <SemanticParticle color={colors.accent.green.primary} active size={3} />
              <span style={{ fontFamily: font.serif, fontSize: typeSize.small, color: room.fg, opacity: opacity.body, fontStyle: 'italic' }}>
                Growth begins in stillness.
              </span>
            </div>
          </RefractiveField>
        </TemperatureProvider>
      </div>

      {/* Semantic particles */}
      <div className="flex flex-wrap items-center gap-6 mt-6">
        <SemanticParticle color={colors.brand.purple.primary} label="Sovereignty" active />
        <SemanticParticle color={colors.accent.cyan.primary} label="Clarity" />
        <SemanticParticle color={colors.accent.green.primary} label="Growth" active />
        <SemanticParticle color={colors.status.amber.mid} label="Warmth" />
      </div>

      <p className="mt-6 max-w-md" style={{ fontSize: typeSize.note, color: room.gray1, lineHeight: leading.relaxed }}>
        The Refractive Field replaces cards, panels, and bordered containers. Content floats above a sub-surface pool of light. The Semantic Particle replaces tags and pills — a glowing dot beside tracked typography.
      </p>
    </div>
  );
}

// ── Neuroadaptive Sensing Demo ──
function NeuroadaptiveSensingDemo() {
  const { setHeatBand } = useTemperature();
  const { arousal, suggestedBand, signal, reset, active, setActive } = useNeuroadaptiveSensing(
    useCallback((band: HeatBandId) => setHeatBand(band), [setHeatBand])
  );

  const bandColors = ['hsl(160, 60%, 50%)', 'hsl(140, 50%, 45%)', 'hsl(45, 90%, 55%)', 'hsl(25, 90%, 55%)', 'hsl(30, 90%, 50%)'];
  const bandLabels = ['Safe & Social', 'Alert', 'Dysregulated', 'Fight/Flight', 'Survival'];

  return (
    <div>
      {/* Arousal meter — a luminous bar, not a bordered meter */}
      <div className="flex items-center gap-4 mb-6">
        <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase', color: room.gray2, width: 60 }}>
          Arousal
        </span>
        <div className="flex-1 max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: glaze.faint }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${arousal * 100}%`,
              background: `linear-gradient(90deg, ${bandColors[suggestedBand]}80, ${bandColors[suggestedBand]}20)`,
              transition: timing.t.easeBrisk,
            }}
          />
        </div>
        <span style={{ fontSize: typeSize.caption, fontFamily: font.mono, color: bandColors[suggestedBand], opacity: opacity.lucid, width: 40 }}>
          {(arousal * 100).toFixed(0)}%
        </span>
      </div>

      {/* Current suggested band */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="rounded-full"
          style={{
            width: 5, height: 5,
            background: bandColors[suggestedBand],
            boxShadow: glow.soft(bandColors[suggestedBand], '40'),
            transition: timing.t.easeRespond,
          }}
        />
        <span style={{ fontFamily: font.serif, fontSize: typeSize.reading, color: room.fg, opacity: opacity.strong, transition: timing.t.easeRespond }}>
          Band {suggestedBand}: {bandLabels[suggestedBand]}
        </span>
      </div>

      {/* Interaction buttons — feed signals */}
      <div className="flex flex-wrap gap-4 mb-4">
        <SomaticThreshold
          label="Tap"
          color={colors.brand.purple.primary}
          holdMs={100}
          size="small"
          onResolve={() => signal({ type: 'tap' })}
        />
        <SomaticThreshold
          label="Rapid Tap"
          color={colors.status.amber.mid}
          holdMs={50}
          size="small"
          onResolve={() => {
            signal({ type: 'tap' });
            signal({ type: 'tap' });
            signal({ type: 'tap' });
          }}
        />
        <SomaticThreshold
          label="Abort"
          color="hsl(25, 90%, 55%)"
          holdMs={100}
          size="small"
          onResolve={() => signal({ type: 'abort' })}
        />
        <SomaticThreshold
          label="Resolve"
          color={colors.accent.green.primary}
          holdMs={300}
          size="small"
          onResolve={() => signal({ type: 'resolve' })}
        />
        <SomaticThreshold
          label="Reset"
          color={colors.accent.cyan.primary}
          holdMs={200}
          size="small"
          onResolve={reset}
        />
      </div>

      <p className="mt-4 max-w-md" style={{ fontSize: typeSize.caption, color: room.gray1, fontStyle: 'italic', lineHeight: leading.body }}>
        The system reads your interaction patterns. Rapid taps and aborts escalate arousal. Resolves and stillness cool it down. No data leaves the device — we read physics, not identity.
      </p>
    </div>
  );
}

// ── Sequence Thermodynamics Demo ──
function SequenceThermodynamicsDemo() {
  const { setHeatBand } = useTemperature();
  const engine = useSequenceEngine(
    useCallback((band: HeatBandId) => setHeatBand(band), [setHeatBand])
  );

  const bandColors = ['hsl(160, 60%, 50%)', 'hsl(140, 50%, 45%)', 'hsl(45, 90%, 55%)', 'hsl(25, 90%, 55%)', 'hsl(30, 90%, 50%)'];
  const patternIds: ArcPatternId[] = ['plateau-release', 'descent-return', 'containment-bloom', 'breathing-wave'];

  return (
    <div>
      {/* Pattern selectors — semantic particles */}
      <div className="flex flex-wrap gap-6 mb-8">
        {patternIds.map((id) => {
          const pattern = arcPatterns[id];
          const isActive = engine.activePattern === id;
          return (
            <SomaticThreshold
              key={id}
              label={pattern.label}
              color={isActive ? bandColors[engine.currentBand] : room.gray3}
              active={isActive}
              holdMs={200}
              size="small"
              onResolve={() => {
                if (isActive) {
                  engine.stop();
                } else {
                  engine.play(id);
                }
              }}
            />
          );
        })}
      </div>

      {/* Active sequence visualizer */}
      {engine.playing && engine.activePattern && (
        <div className="mb-6">
          {/* Keyframe progress dots */}
          <div className="flex items-center gap-3 mb-4">
            {arcPatterns[engine.activePattern].keyframes.map((kf, i) => {
              const isCurrent = i === engine.currentKeyframe;
              const isPast = i < engine.currentKeyframe;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="rounded-full"
                      style={{
                        width: isCurrent ? 6 : 4,
                        height: isCurrent ? 6 : 4,
                        background: bandColors[kf.band],
                        opacity: isCurrent ? 0.9 : isPast ? 0.3 : 0.15,
                        boxShadow: isCurrent ? `0 0 10px ${bandColors[kf.band]}50` : 'none',
                        transition: timing.t.easeRespond,
                      }}
                    />
                    <span style={{
                      fontSize: typeSize.micro, color: bandColors[kf.band],
                      opacity: isCurrent ? 0.7 : 0.3,
                      transition: timing.t.easeRespond,
                    }}>
                      B{kf.band}
                    </span>
                  </div>
                  {i < arcPatterns[engine.activePattern!].keyframes.length - 1 && (
                    <div style={{
                      width: 20, height: 1,
                      background: `linear-gradient(90deg, ${bandColors[kf.band]}20, ${bandColors[arcPatterns[engine.activePattern!].keyframes[i + 1].band]}20)`,
                      opacity: isPast ? 0.5 : 0.15,
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Hold progress for current keyframe */}
          <div className="max-w-xs">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: glaze.faint }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${engine.holdProgress * 100}%`,
                  background: `linear-gradient(90deg, ${bandColors[engine.currentBand]}60, ${bandColors[engine.currentBand]}15)`,
                  transition: `width ${timing.dur.instant} linear`,
                }}
              />
            </div>
          </div>

          <p className="mt-3" style={{ fontSize: typeSize.caption, color: room.gray2, fontStyle: 'italic' }}>
            {arcPatterns[engine.activePattern].description}
            {arcPatterns[engine.activePattern].loop && ' (looping)'}
          </p>
        </div>
      )}

      <p className="mt-4 max-w-md" style={{ fontSize: typeSize.caption, color: room.gray1, fontStyle: 'italic', lineHeight: leading.body }}>
        Arc patterns modulate the room's temperature over time — tension builds, peaks, releases. Each pattern models a different therapeutic arc.
      </p>
    </div>
  );
}

// ── Hardware Symbiosis Demo ──
function HardwareSymbiosisDemo() {
  const { hardware, hardwareConstraints } = useHardwareSymbiosis();

  const signalColor = (active: boolean) => active ? colors.accent.cyan.primary : room.gray1;

  return (
    <div>
      {/* Hardware signals readout */}
      <div className="flex flex-col gap-3 mb-6">
        {[
          { label: 'prefers-reduced-motion', value: hardware.prefersReducedMotion ? 'active' : 'none', active: hardware.prefersReducedMotion },
          { label: 'prefers-high-contrast', value: hardware.prefersHighContrast ? 'active' : 'none', active: hardware.prefersHighContrast },
          { label: 'color-scheme', value: hardware.colorScheme, active: hardware.colorScheme === 'light' },
          { label: 'battery', value: hardware.batteryLevel !== null ? `${Math.round(hardware.batteryLevel * 100)}%${hardware.isCharging ? ' charging' : ''}` : 'unavailable', active: hardware.batteryLevel !== null && hardware.batteryLevel < 0.35 },
          { label: 'device-memory', value: hardware.deviceMemory !== null ? `${hardware.deviceMemory}GB` : 'unavailable', active: hardware.deviceMemory !== null && hardware.deviceMemory <= 4 },
          { label: 'connection', value: hardware.connectionType ?? 'unavailable', active: hardware.connectionType === '2g' || hardware.connectionType === 'slow-2g' },
          { label: 'save-data', value: hardware.saveData ? 'active' : 'none', active: hardware.saveData },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className="rounded-full flex-shrink-0"
              style={{
                width: item.active ? 4 : 2,
                height: item.active ? 4 : 2,
                background: signalColor(item.active),
                boxShadow: item.active ? `0 0 6px ${colors.accent.cyan.primary}30` : 'none',
                transition: timing.t.easeRespond,
              }}
            />
            <span style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: room.gray2, letterSpacing: tracking.code, width: 140 }}>
              {item.label}
            </span>
            <span style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: signalColor(item.active), opacity: item.active ? 0.7 : 0.4, transition: timing.t.easeRespond }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Derived constraints */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
        {[
          { label: 'band floor', value: String(hardwareConstraints.minBandFloor) },
          { label: 'particles', value: `${Math.round(hardwareConstraints.particleScale * 100)}%` },
          { label: 'motion', value: `${Math.round(hardwareConstraints.motionScale * 100)}%` },
          { label: 'acoustics', value: hardwareConstraints.suppressAcoustics ? 'suppressed' : 'active' },
        ].map(item => (
          <span key={item.label} style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: room.gray2, letterSpacing: tracking.code }}>
            <span style={{ color: room.gray1 }}>{item.label}</span>{' '}
            <span style={{ color: colors.accent.cyan.primary, opacity: opacity.lucid }}>{item.value}</span>
          </span>
        ))}
      </div>

      {/* Active signals */}
      {hardwareConstraints.activeSignals.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {hardwareConstraints.activeSignals.map(sig => (
            <SemanticParticle key={sig} color={colors.accent.cyan.primary} label={sig} active size={2} />
          ))}
        </div>
      )}

      <p className="mt-6 max-w-md" style={{ fontSize: typeSize.caption, color: room.gray1, fontStyle: 'italic', lineHeight: leading.body }}>
        The glass reads what the OS already knows. Low battery, reduced motion, slow network — each signal quietly raises the temperature floor. No data leaves the device.
      </p>
    </div>
  );
}

// ── Acoustic Toggle ──
function AcousticToggle() {
  const [enabled, setEnabled] = useState(false);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setAcousticsEnabled(next);
    if (next) {
      setTimeout(() => acousticTick(), 100);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <SomaticThreshold
        label={enabled ? 'Acoustics On' : 'Enable Acoustics'}
        color={enabled ? colors.accent.green.primary : room.gray3}
        active={enabled}
        onResolve={toggle}
        holdMs={300}
        size="medium"
        receipt={enabled ? 'The glass speaks.' : 'The glass went quiet.'}
      />

      <span style={{ fontSize: typeSize.caption, color: room.gray1, fontStyle: 'italic' }}>
        {enabled ? 'Micro-sounds active' : 'Hold to enable'}
      </span>
    </div>
  );
}

export function ComponentsPage() {
  const [toggleState, setToggleState] = useState<'idle' | 'active'>('idle');

  return (
    <div className="relative" style={{ zIndex: layer.base }}>
      <div className="h-[30vh]" />

      <div className="px-6 sm:px-10 max-w-4xl mx-auto">
        {/* Title */}
        <Reveal>
          <p
            style={{
              fontFamily: font.serif,
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: weight.regular,
              color: room.fg,
              opacity: opacity.clear,
              letterSpacing: '-0.02em',
              lineHeight: leading.tight,
            }}
          >
            The instruments
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-lg" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            Each component is a therapeutic verb. It catches, holds, slows, redirects, releases, or seals.
          </p>
        </Reveal>

        {/* ── Controls Without Containers §6.X ── */}
        <div className="mt-28">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Controls Without Containers — §6.X
            </span>
            <p className="mb-8" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray2, lineHeight: leading.relaxed }}>
              A control is just typography floating in the void. Hold to reveal.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <TemperatureProvider initialBand={0}>
              <SomaticThresholdDemo />
            </TemperatureProvider>
          </Reveal>
        </div>

        {/* ── Refractive Field & Semantic Particles ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              The Refractive Field — §6.X
            </span>
            <p className="mb-8" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray2, lineHeight: leading.relaxed }}>
              If a block of text needs elevation, do not draw a card. Use a soft, borderless pool of sub-surface light.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <RefractiveFieldDemo />
          </Reveal>
        </div>

        {/* ── Temperature Governor ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Temperature Governor — Runtime
            </span>
            <p className="mb-8" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray2, lineHeight: leading.relaxed }}>
              As the heat band rises, the system simplifies. Motion slows, choices narrow, the room becomes safer.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <TemperatureGovernorDemo />
          </Reveal>
        </div>

        {/* ── Neuroadaptive Sensing ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Neuroadaptive Sensing — §11
            </span>
            <p className="mb-8" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray2, lineHeight: leading.relaxed }}>
              The room reads you. Interaction velocity, hold patterns, stillness — all feed into the arousal engine. The temperature adjusts itself.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <TemperatureProvider initialBand={0}>
              <NeuroadaptiveSensingDemo />
            </TemperatureProvider>
          </Reveal>
        </div>

        {/* ── Sequence Thermodynamics ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Sequence Thermodynamics — §11
            </span>
            <p className="mb-8" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray2, lineHeight: leading.relaxed }}>
              Healing happens in arcs — tension builds, peaks, releases. Each pattern models a different therapeutic cycle.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <TemperatureProvider initialBand={0}>
              <SequenceThermodynamicsDemo />
            </TemperatureProvider>
          </Reveal>
        </div>

        {/* ── Hardware Symbiosis ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Hardware Symbiosis — §12
            </span>
            <p className="mb-8" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray2, lineHeight: leading.relaxed }}>
              The glass reads what the OS already knows. Battery, accessibility preferences, network quality — each signal quietly shapes the room.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <HardwareSymbiosisDemo />
          </Reveal>
        </div>

        {/* ── Acoustic Materiality ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Acoustic Materiality — §12
            </span>
            <p className="mb-8" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: room.gray2, lineHeight: leading.relaxed }}>
              Sound confirms weight, drag, release, and receipt. Enable acoustics, then interact with the Somatic Thresholds above.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <AcousticToggle />
          </Reveal>
        </div>

        {/* ── Actions ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-8" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Actions
            </span>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                className="px-5 py-2.5 rounded-xl flex items-center gap-2 transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${colors.brand.purple.primary}, ${colors.brand.purple.dark})`,
                  color: room.fg, fontSize: typeSize.lede, fontWeight: weight.medium,
                  boxShadow: `0 4px 20px ${colors.brand.purple.primary}25`,
                }}
              >
                Begin <ArrowRight size={14} />
              </button>

              <button
                className="px-5 py-2.5 rounded-xl transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02]"
                style={{ background: glaze.veil, color: room.gray5, fontSize: typeSize.lede, fontWeight: weight.medium }}
              >
                Explore
              </button>

              <button
                className="px-5 py-2.5 rounded-xl transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02]"
                style={{ background: 'transparent', color: room.gray3, fontSize: typeSize.lede, fontWeight: weight.medium }}
              >
                Skip
              </button>

              <button
                className="px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02]"
                style={{ background: `${colors.accent.cyan.primary}10`, color: colors.accent.cyan.primary, fontSize: typeSize.lede, fontWeight: weight.medium }}
              >
                <Zap size={14} /> Reset
              </button>

              <button
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-[0.95] hover:scale-[1.05]"
                style={{ background: `${colors.status.purple.bright}08`, color: colors.status.purple.bright }}
              >
                <Heart size={15} />
              </button>
            </div>
          </Reveal>
        </div>

        {/* ── The Anchor ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              The Anchor
            </span>
          </Reveal>

          <Reveal>
            <AnchorOrbs />
          </Reveal>
        </div>

        {/* ── Semantic Pill ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-3" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              The Semantic Pill
            </span>
            <p className="mb-6" style={{ fontSize: typeSize.small, color: room.gray1, lineHeight: leading.body }}>
              Instructional text collapses when the body takes over.
            </p>
          </Reveal>

          <Reveal>
            <SemanticPillDemo />
          </Reveal>
        </div>

        {/* ── Heat Bands ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Heat Bands
            </span>
          </Reveal>

          <div className="space-y-4">
            {[
              { label: 'Safe & Social', color: 'hsl(160, 60%, 50%)', width: '18%' },
              { label: 'Alert & Regulated', color: 'hsl(140, 50%, 45%)', width: '32%' },
              { label: 'Early Dysregulation', color: 'hsl(45, 90%, 55%)', width: '52%' },
              { label: 'Sympathetic', color: 'hsl(25, 90%, 55%)', width: '74%' },
              { label: 'Survival', color: 'hsl(30, 90%, 50%)', width: '94%' },
            ].map((band, i) => (
              <Reveal key={band.label} delay={i * 0.04}>
                <div className="flex items-center gap-4">
                  <span className="w-36 shrink-0" style={{ fontSize: typeSize.small, color: room.gray3 }}>{band.label}</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: glaze.faint }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: band.width,
                        background: `linear-gradient(90deg, ${band.color}60, ${band.color}15)`,
                      }}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Micro-Receipt ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Micro-Receipt
            </span>
          </Reveal>

          <Reveal>
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${colors.accent.green.primary}12` }}>
                  <Check size={10} color={colors.accent.green.primary} />
                </div>
                <span style={{ fontSize: typeSize.detail, fontWeight: weight.semibold, letterSpacing: tracking.label, textTransform: 'uppercase', color: colors.accent.green.primary, opacity: opacity.lucid }}>
                  Micro-Receipt
                </span>
              </div>
              <p style={{ fontFamily: font.serif, fontSize: typeSize.body, fontStyle: 'italic', color: room.gray4, lineHeight: leading.relaxed }}>
                "You paused before responding. That space is where your new architecture lives."
              </p>
              <p className="mt-4" style={{ fontSize: typeSize.caption, color: room.gray1 }}>Journey 3, Scene 6</p>
            </div>
          </Reveal>
        </div>

        {/* ── State Modes ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-8" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              State Modes
            </span>
          </Reveal>

          <Reveal>
            <div className="flex gap-4 mb-4">
              {['idle', 'active'].map(state => (
                <button
                  key={state}
                  onClick={() => setToggleState(state as 'idle' | 'active')}
                  className="transition-all duration-500"
                  style={{ fontSize: typeSize.reading, fontWeight: weight.medium, color: toggleState === state ? room.gray5 : room.gray1 }}
                >
                  {state}
                </button>
              ))}
            </div>
            <div className="h-1 rounded-full overflow-hidden max-w-xs" style={{ background: glaze.faint }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: toggleState === 'active' ? '100%' : '20%',
                  background: toggleState === 'active'
                    ? `linear-gradient(90deg, ${colors.brand.purple.primary}, ${colors.accent.cyan.primary})`
                    : glaze.frost,
                  transition: timing.t.flow,
                }}
              />
            </div>
          </Reveal>
        </div>

        {/* ── Pipeline Tags ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-2" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Pipeline Tags
            </span>
            <p className="mb-6" style={{ fontSize: typeSize.note, color: room.gray1 }}>Internal only. Never user-facing.</p>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap gap-6">
              {Object.entries(colors.kbe).map(([, val]) => (
                <div key={val.tag} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: val.color, boxShadow: glow.dot(val.color, '30') }} />
                  <span style={{ fontSize: typeSize.small, color: room.gray3 }}>{val.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Closing */}
        <div className="mt-40">
          <Reveal>
            <p style={{ fontFamily: font.serif, fontSize: typeSize.elevated, lineHeight: leading.generous, fontStyle: 'italic', color: room.gray3, maxWidth: '28rem' }}>
              A room is alive when the atmosphere arrives first, the interaction is simple but deep, and the memory remains after the room is gone.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="h-[20vh]" />
    </div>
  );
}