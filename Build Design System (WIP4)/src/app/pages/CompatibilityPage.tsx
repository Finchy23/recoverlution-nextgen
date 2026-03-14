/**
 * COMPATIBILITY — The Matrix
 *
 * What works with what. What is forbidden.
 * A living map of harmonic and forbidden combinations.
 */

import { useState, useMemo } from 'react';
import { Reveal } from '../components/design-system/Reveal';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, glow, glaze, layer } from '../components/design-system/surface-tokens';
import {
  allVariables,
  checkCompatibility,
  type DoctrineVariable,
  type GovernorLayer,
  type CompatibilityResult,
  heatBands,
  type HeatBandId,
  roomRecipes,
  getVariable,
} from '../components/design-system/doctrine';

const layerColors: Record<GovernorLayer, string> = {
  temperature: colors.brand.purple.mid,
  atmosphere: colors.brand.purple.primary,
  motion: colors.accent.cyan.primary,
  interaction: colors.status.green.bright,
  color: colors.status.amber.bright,
};

const resultColors: Record<CompatibilityResult, { bg: string; text: string; label: string }> = {
  harmonic: { bg: glass(colors.status.green.bright, 0.12), text: colors.status.green.bright, label: 'Harmonic' },
  neutral: { bg: glaze.faint, text: room.gray1, label: '·' },
  forbidden: { bg: glass(colors.brand.purple.mid, 0.08), text: colors.brand.purple.mid, label: '✕' },
};

function MatrixCell({ a, b }: { a: string; b: string }) {
  const result = checkCompatibility(a, b);
  const style = resultColors[result];

  if (a === b) {
    return (
      <div
        className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm flex items-center justify-center"
        style={{ background: glaze.veil }}
      >
        <span style={{ fontSize: typeSize.micro, color: room.gray1 }}>—</span>
      </div>
    );
  }

  return (
    <div
      className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm flex items-center justify-center cursor-default group relative"
      style={{ background: style.bg }}
      title={`${a} × ${b}: ${style.label}`}
    >
      <span style={{ fontSize: typeSize.label, color: style.text }}>{style.label === 'Harmonic' ? '◆' : style.label}</span>
    </div>
  );
}

function RoomRecipeCard({ recipe }: { recipe: typeof roomRecipes[number] }) {
  const defaults = [
    { label: 'Atmosphere', id: recipe.defaultAtmosphere },
    { label: 'Motion', id: recipe.defaultMotion },
    { label: 'Interaction', id: recipe.defaultInteraction },
    { label: 'Color', id: recipe.defaultColor },
  ];

  // Check internal compatibility
  const ids = defaults.map(d => d.id);
  const conflicts: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (checkCompatibility(ids[i], ids[j]) === 'forbidden') {
        conflicts.push(`${ids[i]} × ${ids[j]}`);
      }
    }
  }

  return (
    <Reveal>
      <div
        className="rounded-xl p-5"
        style={{
          background: glaze.faint,
          boxShadow: `inset 0 0 0 1px ${recipe.color}15`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: recipe.color, boxShadow: glow.soft(recipe.color, '30') }} />
          <span style={{ fontSize: typeSize.label, fontWeight: weight.medium, color: room.fg, opacity: opacity.clear }}>{recipe.label}</span>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{ fontSize: typeSize.detail, color: room.gray2, background: glaze.thin }}
          >
            {recipe.family}
          </span>
        </div>

        <p style={{ fontFamily: font.serif, fontSize: typeSize.lede, fontStyle: 'italic', color: room.gray4, lineHeight: leading.body }}>
          {recipe.magicLaw}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {defaults.map(d => {
            const variable = getVariable(d.id);
            return (
              <div key={d.label}>
                <span style={{ fontSize: typeSize.detail, color: room.gray1, textTransform: 'uppercase', letterSpacing: tracking.compact }}>{d.label}</span>
                <p style={{ fontSize: typeSize.small, color: room.gray3, marginTop: 2 }}>
                  {variable?.label || d.id}
                </p>
              </div>
            );
          })}
        </div>

        {/* Attenuation + Temperature */}
        <div className="flex gap-6 mt-3 pt-3 relative">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${glaze.thin} 20%, ${glaze.thin} 80%, transparent 100%)` }} />
          <div>
            <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Attenuation</span>
            <p style={{ fontSize: typeSize.small, color: room.gray3 }}>{recipe.defaultAttenuation}</p>
          </div>
          <div>
            <span style={{ fontSize: typeSize.detail, color: room.gray1 }}>Temperature</span>
            <p style={{ fontSize: typeSize.small, color: room.gray3 }}>
              Band {recipe.temperatureRange[0]}–{recipe.temperatureRange[1]}
            </p>
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: glass(colors.brand.purple.mid, 0.06) }}>
            <span style={{ fontSize: typeSize.detail, color: colors.brand.purple.mid }}>⚠ Internal conflicts: {conflicts.join(', ')}</span>
          </div>
        )}
      </div>
    </Reveal>
  );
}

export function CompatibilityPage() {
  const [activeLayer, setActiveLayer] = useState<GovernorLayer | 'all'>('all');
  const [view, setView] = useState<'matrix' | 'rooms'>('matrix');

  const visibleVars = useMemo(() => {
    if (activeLayer === 'all') return allVariables;
    return allVariables.filter(v => v.layer === activeLayer);
  }, [activeLayer]);

  // For cross-layer matrix, show a selection of interesting combos
  const matrixVars = useMemo(() => {
    // Limit to avoid overwhelming grid
    if (visibleVars.length > 16) {
      // Pick representative samples
      const layers: GovernorLayer[] = ['atmosphere', 'motion', 'interaction', 'color'];
      const selected: DoctrineVariable[] = [];
      for (const layer of layers) {
        const layerVars = visibleVars.filter(v => v.layer === layer);
        selected.push(...layerVars.slice(0, 4));
      }
      return selected;
    }
    return visibleVars;
  }, [visibleVars]);

  return (
    <div className="relative" style={{ zIndex: layer.base }}>
      <div className="h-[30vh]" />

      <div className="px-6 sm:px-10 max-w-5xl mx-auto">
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
            The compatibility matrix
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            Every variable declares what it harmonizes with and what is forbidden.
            Biology-clashing combinations are rejection criteria.
          </p>
        </Reveal>

        {/* View toggle */}
        <div className="mt-12 flex gap-6">
          {(['matrix', 'rooms'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                fontSize: typeSize.reading,
                fontWeight: weight.medium,
                color: view === v ? room.fg : room.gray2,
                transition: timing.t.colorEase,
              }}
            >
              {v === 'matrix' ? 'Variable Matrix' : 'Room Recipes'}
            </button>
          ))}
        </div>

        {view === 'matrix' ? (
          <>
            {/* Layer filter */}
            <div className="mt-8 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveLayer('all')}
                className="px-3 py-1.5 rounded-lg transition-all duration-500"
                style={{
                  fontSize: typeSize.note,
                  background: activeLayer === 'all' ? glaze.frost : glaze.faint,
                  color: activeLayer === 'all' ? room.fg : room.gray2,
                  boxShadow: glow.ringCast(glaze.veil),
                }}
              >
                All Layers
              </button>
              {(['atmosphere', 'motion', 'interaction', 'color'] as GovernorLayer[]).map(layer => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-500"
                  style={{
                    fontSize: typeSize.note,
                    background: activeLayer === layer ? `${layerColors[layer]}10` : glaze.faint,
                    color: activeLayer === layer ? layerColors[layer] : room.gray2,
                    boxShadow: `${activeLayer === layer ? glow.ring(layerColors[layer], '25') : glow.ringCast(glaze.veil)}`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: layerColors[layer], opacity: activeLayer === layer ? 1 : 0.3 }} />
                  {layer}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ background: resultColors.harmonic.bg }}>
                  <span className="flex items-center justify-center h-full" style={{ fontSize: typeSize.label, color: resultColors.harmonic.text }}></span>
                </div>
                <span style={{ fontSize: typeSize.caption, color: room.gray2 }}>Harmonic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ background: resultColors.neutral.bg }} />
                <span style={{ fontSize: typeSize.caption, color: room.gray2 }}>Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ background: resultColors.forbidden.bg }}>
                  <span className="flex items-center justify-center h-full" style={{ fontSize: typeSize.label, color: resultColors.forbidden.text }}>✕</span>
                </div>
                <span style={{ fontSize: typeSize.caption, color: room.gray2 }}>Forbidden</span>
              </div>
            </div>

            {/* Matrix */}
            <div className="mt-8 overflow-x-auto">
              <Reveal>
                <div className="inline-block">
                  {/* Column headers */}
                  <div className="flex" style={{ paddingLeft: 100 }}>
                    {matrixVars.map(v => (
                      <div
                        key={v.id}
                        className="w-6 sm:w-7 flex-shrink-0 flex items-end justify-center pb-1"
                        style={{ height: 60 }}
                      >
                        <span
                          style={{
                            fontSize: typeSize.label,
                            color: layerColors[v.layer],
                            opacity: opacity.strong,
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {v.label.length > 12 ? v.label.slice(0, 12) + '…' : v.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {matrixVars.map(rowVar => (
                    <div key={rowVar.id} className="flex items-center">
                      {/* Row label */}
                      <div className="w-[100px] flex-shrink-0 pr-2 flex items-center gap-1.5 justify-end">
                        <span
                          style={{
                            fontSize: typeSize.detail,
                            color: layerColors[rowVar.layer],
                            opacity: opacity.strong,
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 85,
                            display: 'inline-block',
                          }}
                        >
                          {rowVar.label}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: layerColors[rowVar.layer], opacity: opacity.body }} />
                      </div>

                      {/* Cells */}
                      <div className="flex gap-px">
                        {matrixVars.map(colVar => (
                          <MatrixCell key={colVar.id} a={rowVar.id} b={colVar.id} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-8">
              {(() => {
                let harmonicCount = 0;
                let forbiddenCount = 0;
                for (let i = 0; i < matrixVars.length; i++) {
                  for (let j = i + 1; j < matrixVars.length; j++) {
                    const r = checkCompatibility(matrixVars[i].id, matrixVars[j].id);
                    if (r === 'harmonic') harmonicCount++;
                    if (r === 'forbidden') forbiddenCount++;
                  }
                }
                return (
                  <>
                    <Reveal>
                      <div>
                        <span style={{ fontSize: typeSize.display, fontFamily: font.serif, fontWeight: weight.light, color: colors.status.green.bright }}>
                          {harmonicCount}
                        </span>
                        <span className="block mt-1" style={{ fontSize: typeSize.caption, color: room.gray2 }}>harmonic pairs</span>
                      </div>
                    </Reveal>
                    <Reveal delay={0.05}>
                      <div>
                        <span style={{ fontSize: typeSize.display, fontFamily: font.serif, fontWeight: weight.light, color: colors.brand.purple.mid }}>
                          {forbiddenCount}
                        </span>
                        <span className="block mt-1" style={{ fontSize: typeSize.caption, color: room.gray2 }}>forbidden pairs</span>
                      </div>
                    </Reveal>
                    <Reveal delay={0.1}>
                      <div>
                        <span style={{ fontSize: typeSize.display, fontFamily: font.serif, fontWeight: weight.light, color: room.gray3 }}>
                          {matrixVars.length * (matrixVars.length - 1) / 2 - harmonicCount - forbiddenCount}
                        </span>
                        <span className="block mt-1" style={{ fontSize: typeSize.caption, color: room.gray2 }}>neutral pairs</span>
                      </div>
                    </Reveal>
                  </>
                );
              })()}
            </div>
          </>
        ) : (
          /* Room Recipes */
          <div className="mt-12">
            <Reveal>
              <p className="mb-8" style={{ fontSize: typeSize.reading, color: room.gray3, lineHeight: leading.relaxed }}>
                Each room has a default recipe — the variable combination that creates its signature atmosphere.
                Recipes must pass compatibility checks. Conflicts are flagged.
              </p>
            </Reveal>

            <div className="space-y-4">
              {roomRecipes.map(recipe => (
                <RoomRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-[20vh]" />
    </div>
  );
}