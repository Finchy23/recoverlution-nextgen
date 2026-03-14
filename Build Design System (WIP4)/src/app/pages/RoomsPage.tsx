import { useState, useRef, useEffect } from 'react';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, glow, glaze, depth, layer } from '../components/design-system/surface-tokens';
import { Reveal } from '../components/design-system/Reveal';
import {
  roomRecipes,
  getVariable,
  checkCompatibility,
  type RoomRecipe,
} from '../components/design-system/doctrine';

/**
 * ROOMS — The Modalities
 *
 * One operating system. Many rooms. Three families.
 * Each room has a doctrine recipe — the variable combination
 * that creates its signature atmosphere.
 */

const BREATH_DURATION = 10.9;

const familyMeta: Record<string, { label: string; description: string; color: string }> = {
  callable: {
    label: 'Callable',
    description: 'Direct state shift. Low ceremony. Immediate invocation. Should feel summoned, not operated.',
    color: colors.brand.purple.mid,
  },
  'slow-depth': {
    label: 'Slow-Depth',
    description: 'Deepen. Unspool. Integrate. Hold. Should feel inevitable, not content-shaped.',
    color: colors.brand.purple.primary,
  },
  intelligence: {
    label: 'Intelligence',
    description: 'Prove. Steer. Support. Remember. Should feel believable through field geometry and live cast.',
    color: colors.accent.cyan.primary,
  },
};

function PhoneMockup({ recipe }: { recipe: RoomRecipe }) {
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

  const orbScale = 1 + breath * 0.06;

  return (
    <div
      className="relative w-[220px] h-[440px] rounded-[28px] overflow-hidden mx-auto"
      style={{
        background: room.base,
        boxShadow: `0 20px 60px ${depth.shadow}, 0 0 80px ${recipe.color}06`,
      }}
    >
      {/* Stream */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-end px-3 pb-0.5 overflow-hidden" style={{ zIndex: layer.content }}>
        <div className="flex gap-4 whitespace-nowrap" style={{ animation: 'stream-flow 22s linear infinite' }}>
          {['Heart rate settling', 'You showed up today', 'Therapy at 4 PM', 'Heart rate settling'].map((t, i) => (
            <span key={i} style={{ fontSize: typeSize.micro, color: glaze.muted }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Surface */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${recipe.color}10 0%, transparent 70%)`,
        }}
      >
        <div className="text-center px-5">
          <span style={{ fontSize: typeSize.micro, fontWeight: weight.semibold, letterSpacing: tracking.snug, textTransform: 'uppercase' as const, color: recipe.color, opacity: opacity.lucid }}>
            {recipe.label}
          </span>
          <p className="mt-1.5" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: glaze.pewter, lineHeight: leading.firm }}>
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Anchor */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center" style={{ zIndex: layer.content }}>
        <div
          className="rounded-full"
          style={{
            width: 20, height: 20,
            background: `radial-gradient(circle at 38% 38%, ${recipe.color}dd, ${recipe.color}88 55%, ${recipe.color}44 100%)`,
            boxShadow: `0 0 ${8 + breath * 8}px ${recipe.color}40`,
            transform: `scale(${orbScale})`,
          }}
        />
      </div>
    </div>
  );
}

function RecipeDetail({ recipe }: { recipe: RoomRecipe }) {
  const defaults = [
    { label: 'Atmosphere', id: recipe.defaultAtmosphere },
    { label: 'Motion', id: recipe.defaultMotion },
    { label: 'Interaction', id: recipe.defaultInteraction },
    { label: 'Color', id: recipe.defaultColor },
  ];

  // Check internal compatibility
  const ids = defaults.map(d => d.id);
  const conflicts: string[] = [];
  const harmonics: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const result = checkCompatibility(ids[i], ids[j]);
      if (result === 'forbidden') conflicts.push(`${ids[i]} + ${ids[j]}`);
      if (result === 'harmonic') harmonics.push(`${ids[i]} + ${ids[j]}`);
    }
  }

  return (
    <div>
      {/* Recipe Variables */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {defaults.map(d => {
          const variable = getVariable(d.id);
          const layerColor = d.label === 'Atmosphere' ? colors.brand.purple.primary
            : d.label === 'Motion' ? colors.accent.cyan.primary
            : d.label === 'Interaction' ? colors.status.green.bright
            : colors.status.amber.bright;
          return (
            <div
              key={d.label}
              className="rounded-lg px-4 py-3"
              style={{
                background: glaze.faint,
                boxShadow: `inset 0 0 0 1px ${layerColor}10`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: layerColor, opacity: opacity.body }} />
                <span style={{ fontSize: typeSize.detail, color: room.gray1, textTransform: 'uppercase' as const, letterSpacing: tracking.compact }}>{d.label}</span>
              </div>
              <p style={{ fontSize: typeSize.reading, color: room.gray4 }}>
                {variable?.label || d.id}
              </p>
              {variable && (
                <p className="mt-0.5" style={{ fontSize: typeSize.caption, fontFamily: font.mono, color: room.gray1 }}>
                  {variable.transition.enterMs}ms {variable.transition.enterCurve}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Attenuation + Temperature + Magic Law */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="px-3 py-2 rounded-lg" style={{ background: glaze.faint }}>
          <span style={{ fontSize: typeSize.detail, color: room.gray1, textTransform: 'uppercase' as const, letterSpacing: tracking.compact }}>Attenuation</span>
          <p style={{ fontSize: typeSize.small, color: room.gray3 }}>{recipe.defaultAttenuation}</p>
        </div>
        <div className="px-3 py-2 rounded-lg" style={{ background: glaze.faint }}>
          <span style={{ fontSize: typeSize.detail, color: room.gray1, textTransform: 'uppercase' as const, letterSpacing: tracking.compact }}>Temperature</span>
          <p style={{ fontSize: typeSize.small, color: room.gray3 }}>
            Band {recipe.temperatureRange[0]}–{recipe.temperatureRange[1]}
          </p>
        </div>
      </div>

      {/* Internal compatibility */}
      {(harmonics.length > 0 || conflicts.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {harmonics.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: typeSize.detail, color: glass(colors.status.green.bright, 0.6) }}>
                {harmonics.length} harmonic {harmonics.length === 1 ? 'pair' : 'pairs'}
              </span>
            </div>
          )}
          {conflicts.length > 0 && (
            <div className="px-2 py-1 rounded-md" style={{ background: glass(colors.brand.purple.mid, 0.06) }}>
              <span style={{ fontSize: typeSize.detail, color: colors.brand.purple.mid }}>
                Conflict: {conflicts.join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Magic Law */}
      <div className="mt-6">
        <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase' as const, color: room.gray1 }}>
          Magic Law
        </span>
        <p className="mt-2" style={{ fontFamily: font.serif, fontSize: typeSize.lede, fontStyle: 'italic', color: room.gray4, lineHeight: leading.relaxed, maxWidth: '30rem' }}>
          {recipe.magicLaw}
        </p>
      </div>
    </div>
  );
}

export function RoomsPage() {
  const [activeId, setActiveId] = useState(roomRecipes[0].id);
  const recipe = roomRecipes.find(r => r.id === activeId)!;
  const family = familyMeta[recipe.family];

  // Group by family
  const families = ['callable', 'slow-depth', 'intelligence'] as const;

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
            The spaces
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-md" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            The rooms are not a feature list. They are three families inside one OS.
            Each has a doctrine recipe — the variable combination that creates its signature atmosphere.
          </p>
        </Reveal>

        {/* Shell Architecture */}
        <div className="mt-28">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              The Shell — Three Pieces
            </span>
          </Reveal>

          <div className="space-y-6">
            {[
              { name: 'Surface', desc: 'The immersive hero canvas. Edge-to-edge. Materially dominant. Not a component wrapper.', color: colors.brand.purple.primary },
              { name: 'Anchor', desc: 'The ritual point at the base of the glass. Grounding and invocation, not a control dock. Carries pressure, not menu logic.', color: colors.accent.cyan.primary },
              { name: 'Stream', desc: 'The horizon. Carries ambient context, continuity, support drift, proof drift, and timing. Should feel like weather, not notifications.', color: colors.status.green.bright },
            ].map((el, i) => (
              <Reveal key={el.name} delay={i * 0.06}>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: el.color, boxShadow: glow.soft(el.color, '30') }} />
                  <div>
                    <p style={{ fontSize: typeSize.lede, fontWeight: weight.medium, color: room.gray5 }}>{el.name}</p>
                    <p className="mt-1" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body, maxWidth: '28rem' }}>{el.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Room Families Overview */}
        <div className="mt-28">
          <Reveal>
            <span className="block mb-8" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Three Families
            </span>
          </Reveal>

          <div className="space-y-4">
            {families.map((fam, i) => {
              const meta = familyMeta[fam];
              const count = roomRecipes.filter(r => r.family === fam).length;
              return (
                <Reveal key={fam} delay={i * 0.05}>
                  <div
                    className="rounded-xl px-5 py-4 flex items-start gap-4"
                    style={{
                      background: `${meta.color}04`,
                      boxShadow: `inset 0 0 0 1px ${meta.color}10`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: meta.color, boxShadow: glow.soft(meta.color, '30') }} />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span style={{ fontSize: typeSize.lede, fontWeight: weight.medium, color: room.fg, opacity: opacity.clear }}>{meta.label}</span>
                        <span style={{ fontSize: typeSize.caption, color: room.gray2 }}>{count} rooms</span>
                      </div>
                      <p className="mt-1" style={{ fontSize: typeSize.small, color: room.gray3, lineHeight: leading.body }}>
                        {meta.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Room Explorer */}
        <div className="mt-28">
          <Reveal>
            <span className="block mb-8" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Room Explorer
            </span>
          </Reveal>

          {/* Room selector */}
          <Reveal>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-10">
              {roomRecipes.map(r => (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className="flex items-center gap-2 transition-all duration-500"
                  style={{
                    opacity: activeId === r.id ? 1 : 0.35,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      background: r.color,
                      boxShadow: activeId === r.id ? `0 0 8px ${r.color}50` : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: font.serif,
                      fontSize: typeSize.body,
                      color: activeId === r.id ? room.fg : room.gray3,
                      transition: `color ${timing.dur.moderate}`,
                    }}
                  >
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* Active room */}
          <div key={activeId}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ background: recipe.color, boxShadow: glow.point(recipe.color, 14, '40') }} />
              <p
                style={{
                  fontFamily: font.serif,
                  fontSize: 'clamp(22px, 3.5vw, 32px)',
                  fontWeight: weight.regular,
                  color: room.fg,
                  opacity: opacity.clear,
                  letterSpacing: '-0.01em',
                }}
              >
                {recipe.label}
              </p>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ fontSize: typeSize.detail, color: family.color, background: `${family.color}08`, boxShadow: glow.ring(family.color, '15') }}
              >
                {family.label}
              </span>
            </div>

            <p style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontStyle: 'italic', color: room.gray3, lineHeight: leading.body }}>
              {recipe.verb}
            </p>

            {/* Phone + Recipe side by side on desktop */}
            <div className="mt-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              <div className="shrink-0">
                <PhoneMockup recipe={recipe} />
              </div>
              <div className="flex-1 min-w-0">
                <RecipeDetail recipe={recipe} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[20vh]" />
    </div>
  );
}