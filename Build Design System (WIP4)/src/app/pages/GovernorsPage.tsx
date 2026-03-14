/**
 * GOVERNORS — The Five Runtime Layers
 *
 * Temperature is the governor. The rest are governed.
 * This page demonstrates the hierarchy and every variable's DNA.
 */

import { useState, useMemo } from 'react';
import { Reveal } from '../components/design-system/Reveal';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, glow, glaze, layer } from '../components/design-system/surface-tokens';
import {
  governorLayers,
  heatBands,
  atmosphereVariables,
  motionVariables,
  interactionVariables,
  colorVariables,
  type DoctrineVariable,
  type HeatBandId,
  type GovernorLayer,
  easingFunctions,
} from '../components/design-system/doctrine';

// ─── Variable Card ───

function VariableCard({ variable, isAllowed }: { variable: DoctrineVariable; isAllowed: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const enterEasing = easingFunctions[variable.transition.enterCurve];
  const exitEasing = easingFunctions[variable.transition.exitCurve];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-700"
      style={{
        background: isAllowed ? glaze.thin : glaze.trace,
        boxShadow: `${glow.ringCast(isAllowed ? glaze.frost : glaze.faint)}`,
        opacity: isAllowed ? 1 : 0.35,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-4"
      >
        {/* Layer indicator */}
        <div
          className="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-all duration-500"
          style={{
            background: isAllowed
              ? variable.layer === 'atmosphere' ? glass(colors.brand.purple.primary, 0.19)
              : variable.layer === 'motion' ? glass(colors.accent.cyan.primary, 0.19)
              : variable.layer === 'interaction' ? glass(colors.status.green.bright, 0.19)
              : glass(colors.status.amber.bright, 0.19)
              : room.gray1,
            boxShadow: isAllowed ? `0 0 8px ${
              variable.layer === 'atmosphere' ? '#6B52FF30'
              : variable.layer === 'motion' ? '#00CCE030'
              : variable.layer === 'interaction' ? '#2FE6A630'
              : '#FFB67730'
            }` : 'none',
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span style={{ fontSize: typeSize.lede, fontWeight: weight.medium, color: room.fg, opacity: opacity.clear }}>
              {variable.label}
            </span>
            <span style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: room.gray1 }}>
              rv-{variable.layer.slice(0, 5)}-{variable.id}
            </span>
          </div>
          <p className="mt-1" style={{ fontSize: typeSize.small, color: room.gray3, lineHeight: leading.body }}>
            {variable.metaphor}
          </p>
        </div>

        {/* Energy cost badge */}
        <span
          className="shrink-0 px-2 py-0.5 rounded-full"
          style={{
            fontSize: typeSize.detail,
            fontFamily: font.mono,
            color: variable.attenuationCost > 0.15 ? colors.status.amber.bright : room.gray2,
            background: variable.attenuationCost > 0.15 ? glass(colors.status.amber.bright, 0.06) : glaze.faint,
          }}
        >
          {(variable.attenuationCost * 100).toFixed(0)}% energy
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-5 pb-5 space-y-4 relative"
        >
          <div className="absolute top-0 left-5 right-5 h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${glaze.thin} 20%, ${glaze.thin} 80%, transparent 100%)` }} />
          {/* Description */}
          <p className="pt-4"
            style={{ fontSize: typeSize.reading, color: room.gray4, lineHeight: leading.reading }}
          >
            {variable.description}
          </p>

          {/* Transition Identity */}
          <div>
            <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase' as const, color: room.gray1 }}>
              Transition Identity
            </span>
            <p className="mt-1" style={{ fontSize: typeSize.small, color: room.gray3, fontStyle: 'italic', lineHeight: leading.body }}>
              {variable.transition.description}
            </p>
            <div className="flex gap-6 mt-2">
              <div>
                <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Enter</span>
                <p style={{ fontSize: typeSize.note, fontFamily: font.mono, color: room.gray2 }}>
                  {variable.transition.enterMs}ms · {variable.transition.enterCurve}
                </p>
              </div>
              <div>
                <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Exit</span>
                <p style={{ fontSize: typeSize.note, fontFamily: font.mono, color: room.gray2 }}>
                  {variable.transition.exitMs}ms · {variable.transition.exitCurve}
                </p>
              </div>
            </div>
          </div>

          {/* Allowed Bands */}
          <div>
            <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase' as const, color: room.gray1 }}>
              Temperature Range
            </span>
            <div className="flex gap-1.5 mt-2">
              {heatBands.map(band => {
                const allowed = variable.allowedBands.includes(band.id);
                return (
                  <div
                    key={band.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-md"
                    style={{
                      background: allowed ? `${band.color}12` : glaze.trace,
                      boxShadow: `${allowed ? glow.ring(band.color, '25') : glow.ringCast(glaze.thin)}`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: allowed ? band.color : room.gray1 }} />
                    <span style={{ fontSize: typeSize.detail, color: allowed ? band.color : room.gray1 }}>{band.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compatibility */}
          <div className="flex gap-8">
            {variable.harmonicWith.length > 0 && (
              <div>
                <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase' as const, color: glass(colors.status.green.bright, 0.5) }}>
                  Harmonic
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {variable.harmonicWith.map(id => (
                    <span key={id} className="px-2 py-0.5 rounded-full" style={{ fontSize: typeSize.caption, color: room.gray3, background: glass(colors.status.green.bright, 0.04), boxShadow: glow.ringCast(glass(colors.status.green.bright, 0.08)) }}>
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {variable.forbiddenWith.length > 0 && (
              <div>
                <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase' as const, color: glass(colors.brand.purple.mid, 0.5) }}>
                  Forbidden
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {variable.forbiddenWith.map(id => (
                    <span key={id} className="px-2 py-0.5 rounded-full" style={{ fontSize: typeSize.caption, color: room.gray3, background: glass(colors.brand.purple.mid, 0.04), boxShadow: glow.ringCast(glass(colors.brand.purple.mid, 0.08)) }}>
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Temperature Band ───

function TemperatureBandCard({ band }: { band: typeof heatBands[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: glaze.faint,
        boxShadow: glow.ring(band.color, '15'),
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: band.color, boxShadow: glow.mid(band.color, '30') }} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span style={{ fontSize: typeSize.lede, fontWeight: weight.medium, color: room.fg, opacity: opacity.clear }}>
              Band {band.id}: {band.label}
            </span>
            <span style={{ fontSize: typeSize.caption, color: room.gray2 }}>
              {band.clinicalName}
            </span>
          </div>
        </div>
        <span style={{ fontSize: typeSize.caption, color: room.gray1 }}>
          {band.maxChoices} {band.maxChoices === 1 ? 'choice' : 'choices'}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 relative" style={{ }}>
          <div className="absolute top-0 left-5 right-5 h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${glaze.thin} 20%, ${glaze.thin} 80%, transparent 100%)` }} />
          <p className="pt-3" style={{ fontSize: typeSize.reading, color: room.gray4, lineHeight: leading.relaxed }}>
            {band.description}
          </p>

          {/* Commands */}
          <div>
            <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase' as const, color: band.color, opacity: opacity.strong }}>
              Commands
            </span>
            <div className="mt-2 space-y-1.5">
              {band.commands.map(cmd => (
                <p key={cmd} style={{ fontSize: typeSize.small, color: colors.brand.purple.light, lineHeight: leading.firm }}>
                  {cmd}
                </p>
              ))}
            </div>
          </div>

          {/* Constraints grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Max Motion</span>
              <p style={{ fontSize: typeSize.reading, fontFamily: font.mono, color: room.gray3 }}>
                {band.maxMotionSpeed === 0 ? 'NONE' : `${(band.maxMotionSpeed * 100).toFixed(0)}%`}
              </p>
            </div>
            <div>
              <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Max Interaction</span>
              <p style={{ fontSize: typeSize.reading, fontFamily: font.mono, color: room.gray3 }}>
                {band.maxInteractionComplexity === 0 ? 'NONE' : `${(band.maxInteractionComplexity * 100).toFixed(0)}%`}
              </p>
            </div>
            <div>
              <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Copy</span>
              <p style={{ fontSize: typeSize.reading, fontFamily: font.mono, color: room.gray3 }}>
                {band.maxCopyDensity}
              </p>
            </div>
            <div>
              <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Scrolling</span>
              <p style={{ fontSize: typeSize.reading, fontFamily: font.mono, color: band.maxScrolling ? room.gray3 : colors.brand.purple.mid }}>
                {band.maxScrolling ? 'Allowed' : 'ZERO'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Layer Section ──

function LayerSection({
  layer,
  variables,
  activeBand,
}: {
  layer: typeof governorLayers[number];
  variables: DoctrineVariable[];
  activeBand: HeatBandId;
}) {
  const layerColor = layer.id === 'atmosphere' ? colors.brand.purple.primary
    : layer.id === 'motion' ? colors.accent.cyan.primary
    : layer.id === 'interaction' ? colors.status.green.bright
    : colors.status.amber.bright;

  return (
    <div className="mt-24">
      <Reveal>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: layerColor, boxShadow: glow.mid(layerColor, '30') }} />
          <span
            style={{
              fontSize: typeSize.caption,
              fontWeight: weight.medium,
              letterSpacing: tracking.tight,
              textTransform: 'uppercase' as const,
              color: layerColor,
              opacity: opacity.lucid,
            }}
          >
            {layer.label}
          </span>
          {layer.id !== 'temperature' && (
            <span style={{ fontSize: typeSize.detail, color: room.gray1, fontStyle: 'italic' }}>
              Governed by Temperature
            </span>
          )}
        </div>

        <p className="mb-2" style={{ fontSize: typeSize.lede, color: room.gray5 }}>
          {layer.role}
        </p>
        <p className="mb-8" style={{
          fontFamily: font.serif,
          fontSize: typeSize.prose,
          fontStyle: 'italic',
          color: room.gray3,
        }}>
          {layer.question}
        </p>
      </Reveal>

      <div className="space-y-2">
        {variables.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.03}>
            <VariableCard
              variable={v}
              isAllowed={v.allowedBands.includes(activeBand)}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───

export function GovernorsPage() {
  const [activeBand, setActiveBand] = useState<HeatBandId>(0);

  const currentBand = heatBands.find(b => b.id === activeBand)!;

  // Count allowed variables at current band
  const allVars = [...atmosphereVariables, ...motionVariables, ...interactionVariables, ...colorVariables];
  const allowedCount = allVars.filter(v => v.allowedBands.includes(activeBand)).length;

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
            The five governors
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            Temperature is not a peer of Motion or Color. It is the hierarchical governor
            that restricts what other variables are permitted. Change the temperature band
            below and watch the system narrow.
          </p>
        </Reveal>

        {/* Temperature Selector — sticky */}
        <div className="mt-16 sticky top-14 py-4" style={{ zIndex: layer.pinnacle, background: `linear-gradient(180deg, ${room.base} 60%, transparent 100%)` }}>
          <Reveal>
            <span
              className="block mb-3"
              style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: glaze.dim }}
            >
              Active Temperature Band
            </span>
            <div className="flex flex-wrap gap-2">
              {heatBands.map(band => (
                <button
                  key={band.id}
                  onClick={() => setActiveBand(band.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-500"
                  style={{
                    background: activeBand === band.id ? `${band.color}12` : glaze.faint,
                    boxShadow: `${activeBand === band.id ? glow.ring(band.color, '30') : glow.ringCast(glaze.veil)}`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full transition-all duration-500"
                    style={{
                      background: band.color,
                      boxShadow: activeBand === band.id ? `0 0 8px ${band.color}40` : 'none',
                      opacity: activeBand === band.id ? 1 : 0.35,
                    }}
                  />
                  <span style={{ fontSize: typeSize.small, color: activeBand === band.id ? room.fg : room.gray2, transition: timing.t.colorEase }}>
                    {band.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2" style={{ fontSize: typeSize.note, color: room.gray2 }}>
              Band {activeBand}: {currentBand.clinicalName} — {allowedCount}/{allVars.length} variables permitted
            </p>
          </Reveal>
        </div>

        {/* Temperature Bands */}
        <div className="mt-12">
          <Reveal>
            <span
              className="block mb-6"
              style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}
            >
              Temperature — The Governor
            </span>
          </Reveal>

          <div className="space-y-2">
            {heatBands.map((band, i) => (
              <Reveal key={band.id} delay={i * 0.04}>
                <TemperatureBandCard band={band} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Atmosphere */}
        <LayerSection
          layer={governorLayers.find(l => l.id === 'atmosphere')!}
          variables={atmosphereVariables}
          activeBand={activeBand}
        />

        {/* Motion */}
        <LayerSection
          layer={governorLayers.find(l => l.id === 'motion')!}
          variables={motionVariables}
          activeBand={activeBand}
        />

        {/* Interaction */}
        <LayerSection
          layer={governorLayers.find(l => l.id === 'interaction')!}
          variables={interactionVariables}
          activeBand={activeBand}
        />

        {/* Color */}
        <LayerSection
          layer={governorLayers.find(l => l.id === 'color')!}
          variables={colorVariables}
          activeBand={activeBand}
        />
      </div>

      <div className="h-[20vh]" />
    </div>
  );
}