/**
 * DOCTRINE — The Complete Philosophy
 *
 * The philosophy rendered. Not documented — demonstrated.
 * Every section breathes in its own space.
 *
 * This page itself follows the Death of the Box:
 * No painted containers. No bordered cards. No pills.
 * Hierarchy through typography, proximity, and volumetric light.
 */

import { useState, useEffect, useRef } from 'react';
import { Reveal } from '../components/design-system/Reveal';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, timing, glow, glaze, layer } from '../components/design-system/surface-tokens';
import {
  universalLaws, forbiddenRules,
  shellModel, controlVocabulary, controlPhysics, compositionOrder,
  failureStates, antifragilityPrinciple,
  sequenceThermodynamics,
  transitionSequence, copyOwnership, controlQuality,
  roomBehaviorModel, antiPatterns,
} from '../components/design-system/doctrine';

const BREATH_DURATION = 10.9;

const sectionLabel = {
  fontSize: typeSize.caption,
  fontWeight: weight.medium,
  letterSpacing: tracking.tight,
  textTransform: 'uppercase' as const,
  color: room.gray2,
};

function LawCard({ law, index }: { law: typeof universalLaws[number]; index: number }) {
  return (
    <Reveal delay={index * 0.06}>
      <div className="mb-20">
        <div className="flex items-center gap-3">
          {/* Semantic particle — not a badge or pill */}
          <span
            className="rounded-full shrink-0"
            style={{
              width: 4, height: 4,
              background: glass(colors.brand.purple.primary, 0.35),
              boxShadow: glow.cast(glass(colors.brand.purple.primary, 0.15), 8),
            }}
          />
          <span style={{ fontSize: typeSize.detail, fontWeight: weight.semibold, letterSpacing: tracking.spread, textTransform: 'uppercase' as const, color: glass(colors.brand.purple.primary, 0.35) }}>
            Law {index + 1}
            {'alias' in law && (law as any).alias ? ` — ${(law as any).alias}` : ''}
          </span>
        </div>
        <p className="mt-3" style={{ fontFamily: font.serif, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: weight.regular, color: room.fg, opacity: opacity.clear, letterSpacing: '-0.01em', lineHeight: leading.snug }}>
          {law.label}
        </p>
        <p className="mt-4" style={{ fontFamily: font.serif, fontSize: 'clamp(15px, 2vw, 18px)', fontStyle: 'italic', fontWeight: weight.regular, color: colors.brand.purple.light, lineHeight: leading.relaxed, maxWidth: '32rem' }}>
          {law.decree}
        </p>
        <p className="mt-3" style={{ fontSize: typeSize.reading, lineHeight: leading.generous, color: room.gray3, maxWidth: '30rem' }}>
          {law.detail}
        </p>
        {'steps' in law && law.steps && (
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {(law.steps as string[]).map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                {/* No pill. Just a semantic particle + typography */}
                <span
                  className="rounded-full"
                  style={{
                    width: 3, height: 3,
                    background: glass(colors.brand.purple.primary, 0.3),
                    boxShadow: glow.cast(glass(colors.brand.purple.primary, 0.15), 6),
                  }}
                />
                <span style={{ fontSize: typeSize.note, fontWeight: weight.medium, color: colors.brand.purple.light, letterSpacing: tracking.code }}>
                  {step}
                </span>
                {i < (law.steps as string[]).length - 1 && (
                  <span style={{ color: glass(colors.brand.purple.primary, 0.15), fontSize: typeSize.caption }}>→</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}

function EnergyBudgetDemo() {
  const [breath, setBreath] = useState(0);
  const [fgWeight, setFgWeight] = useState(0.3);
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

  const bgEnergy = 1 - fgWeight;
  const bgOpacity = bgEnergy * (0.6 + breath * 0.4);

  return (
    <div className="mt-8">
      {/* No border-radius card. Refractive field with sub-surface glow. */}
      <div className="relative overflow-hidden" style={{ height: 200, background: room.deep }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 40% 35%, ${glass(colors.brand.purple.primary, bgOpacity * 0.25)} 0%, transparent 70%)`, filter: `blur(${fgWeight * 24}px)`, transform: `scale(${1 + breath * 0.03 * bgEnergy})`, transition: timing.t.fadeSettle }} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: fgWeight }}>
          {/* No card wrapper. Just floating text with refractive depth. */}
          <div className="px-6 py-4" style={{ background: `radial-gradient(ellipse at center, ${glaze.thin} 0%, transparent 70%)` }}>
            <p style={{ fontFamily: font.serif, fontSize: typeSize.body, color: room.fg, opacity: opacity.clear }}>Content payload</p>
          </div>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex justify-between">
          <span style={{ fontSize: typeSize.detail, color: glass(colors.brand.purple.primary, 0.5) }}>Canvas {Math.round(bgEnergy * 100)}%</span>
          <span style={{ fontSize: typeSize.detail, color: glaze.silver }}>Content {Math.round(fgWeight * 100)}%</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span style={{ fontSize: typeSize.caption, color: room.gray2, whiteSpace: 'nowrap' }}>Canvas</span>
        <input type="range" min="0" max="100" value={fgWeight * 100}
          onChange={(e) => setFgWeight(Number(e.target.value) / 100)}
          className="flex-1 h-1 appearance-none cursor-pointer"
          style={{ background: `linear-gradient(90deg, ${glass(colors.brand.purple.primary, 0.3)} ${fgWeight * 100}%, ${glaze.frost} ${fgWeight * 100}%)`, accentColor: colors.brand.purple.primary }}
        />
        <span style={{ fontSize: typeSize.caption, color: room.gray2, whiteSpace: 'nowrap' }}>Content</span>
      </div>
    </div>
  );
}

export function DoctrinePage() {
  return (
    <div className="relative" style={{ zIndex: layer.base }}>
      <div className="h-[30vh]" />

      <div className="px-6 sm:px-10 max-w-4xl mx-auto">
        {/* ─── Title ─── */}
        <Reveal>
          <p style={{ fontFamily: font.serif, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: weight.regular, color: room.fg, opacity: opacity.clear, letterSpacing: '-0.02em', lineHeight: leading.tight }}>
            The doctrine
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            One living operating system. Not a set of beautiful surfaces. These are the non-negotiable truths
            that govern every surface, every room, every variable.
          </p>
        </Reveal>

        {/* ─── What Frontend Believes ─── */}
        <div className="mt-24">
          <Reveal>
            <span className="block mb-8" style={sectionLabel}>What frontend believes</span>
          </Reveal>
          <div className="space-y-4">
            {[
              'Atmosphere before explanation.',
              'Pressure before buttons.',
              'Geometry before labels.',
              'Route before instruction.',
              'Proof before analytics.',
              'Support before orchestration.',
              'Memory before navigation.',
            ].map((belief, i) => (
              <Reveal key={belief} delay={i * 0.03}>
                <p style={{ fontFamily: font.serif, fontSize: typeSize.body, fontStyle: 'italic', color: room.gray4, lineHeight: leading.body }}>
                  {belief}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── The Universal Laws ─── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-12" style={sectionLabel}>The Universal Laws</span>
          </Reveal>
          {universalLaws.map((law, i) => (
            <LawCard key={law.id} law={law} index={i} />
          ))}
        </div>

        {/* ─── Energy Budget Demo ─── */}
        <div className="mt-16">
          <Reveal>
            <span className="block mb-4" style={sectionLabel}>Total Energy Equation — Live</span>
            <p className="mb-2" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body }}>
              Drag to trade energy between canvas and content.
            </p>
          </Reveal>
          <Reveal><EnergyBudgetDemo /></Reveal>
        </div>

        {/* ─── Five-Step Transition Sequence ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>The Five-Step Transition Sequence</span>
            <p className="mb-10" style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontStyle: 'italic', color: colors.brand.purple.light, lineHeight: leading.relaxed, maxWidth: '30rem' }}>
              Nothing should feel like a cut to a new page. Every meaningful surface change moves through five steps.
            </p>
          </Reveal>
          <div className="space-y-10">
            {transitionSequence.map((step, i) => (
              <Reveal key={step.id} delay={i * 0.05}>
                <div className="relative pl-8">
                  {/* Vertical luminous thread — no border line */}
                  {i < transitionSequence.length - 1 && (
                    <div
                      className="absolute left-[5px] top-6 w-px"
                      style={{
                        height: '100%',
                        background: `linear-gradient(to bottom, ${glass(colors.brand.purple.primary, 0.12)}, transparent)`,
                      }}
                    />
                  )}
                  {/* Step marker — semantic particle, not numbered badge */}
                  <div className="absolute left-0 top-1.5 flex items-center">
                    <span
                      className="rounded-full"
                      style={{
                        width: step.id === 'seal' ? 6 : 4,
                        height: step.id === 'seal' ? 6 : 4,
                        background: step.id === 'seal'
                          ? glass(colors.status.green.bright, 0.5)
                          : glass(colors.brand.purple.primary, 0.3),
                        boxShadow: step.id === 'seal'
                          ? glow.cast(glass(colors.status.green.bright, 0.2), 8)
                          : glow.cast(glass(colors.brand.purple.primary, 0.1), 6),
                      }}
                    />
                  </div>
                  <p style={{ fontFamily: font.serif, fontSize: typeSize.elevated, color: room.fg, opacity: opacity.clear }}>
                    {step.label}
                    {step.timingMs >= 0 && (
                      <span style={{ fontSize: typeSize.caption, color: room.gray2, marginLeft: 8 }}>{step.timingMs}ms</span>
                    )}
                  </p>
                  <p className="mt-1" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: colors.brand.purple.light, opacity: opacity.strong, lineHeight: leading.body }}>
                    {step.description}
                  </p>
                  <div className="mt-2 flex flex-col sm:flex-row gap-4">
                    <div>
                      <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase', color: room.gray2 }}>Shell</span>
                      <p className="mt-1" style={{ fontSize: typeSize.note, color: room.gray3, lineHeight: leading.body }}>{step.shellBehavior}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase', color: room.gray2 }}>Room</span>
                      <p className="mt-1" style={{ fontSize: typeSize.note, color: room.gray3, lineHeight: leading.body }}>{step.roomBehavior}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Copy Ownership ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>Copy Ownership</span>
            <p className="mb-10" style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontStyle: 'italic', color: colors.brand.purple.light, lineHeight: leading.relaxed, maxWidth: '30rem' }}>
              {copyOwnership.standard}
            </p>
          </Reveal>
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-16">
            <div>
              <Reveal>
                <span className="block mb-5" style={{ ...sectionLabel, color: glass(colors.status.green.bright, 0.5) }}>Player-Owned</span>
              </Reveal>
              {copyOwnership.playerOwned.map((layer, i) => (
                <Reveal key={layer.id} delay={i * 0.04}>
                  <div className="mb-4 flex items-start gap-3">
                    <span className="rounded-full mt-1.5 shrink-0" style={{ width: 3, height: 3, background: glass(colors.status.green.bright, 0.4), boxShadow: glow.cast(glass(colors.status.green.bright, 0.15), 6) }} />
                    <div>
                      <p style={{ fontFamily: font.serif, fontSize: typeSize.lede, color: room.fg, opacity: opacity.clear }}>{layer.label}</p>
                      <p className="mt-1" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.firm }}>
                        {layer.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div>
              <Reveal>
                <span className="block mb-5" style={{ ...sectionLabel, color: glass(colors.brand.purple.primary, 0.5) }}>Room-Owned</span>
              </Reveal>
              {copyOwnership.roomOwned.map((layer, i) => (
                <Reveal key={layer.id} delay={i * 0.04}>
                  <div className="mb-4 flex items-start gap-3">
                    <span className="rounded-full mt-1.5 shrink-0" style={{ width: 3, height: 3, background: glass(colors.brand.purple.primary, 0.4), boxShadow: glow.cast(glass(colors.brand.purple.primary, 0.15), 6) }} />
                    <div>
                      <p style={{ fontFamily: font.serif, fontSize: typeSize.lede, color: room.fg, opacity: opacity.clear }}>{layer.label}</p>
                      <p className="mt-1" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.firm }}>
                        {layer.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* ─── The Shell ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>The Shell</span>
            <p className="mb-10" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body }}>
              The permanent operating frame of the system. It has only three real pieces.
            </p>
          </Reveal>
          {/* No cards. Refractive fields with typographic proximity. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {shellModel.map((piece, i) => (
              <Reveal key={piece.id} delay={i * 0.06}>
                <div className="relative py-5">
                  {/* Sub-surface refractive glow — not a card */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 30%, ${glaze.trace} 0%, transparent 70%)`,
                    }}
                  />
                  <p style={{ fontFamily: font.serif, fontSize: typeSize.pull, color: room.fg, opacity: opacity.clear }}>
                    {piece.label}
                  </p>
                  <p className="mt-2" style={{ fontSize: typeSize.small, color: room.gray3, lineHeight: leading.relaxed }}>
                    {piece.description}
                  </p>
                  <p className="mt-3" style={{ fontFamily: font.serif, fontSize: typeSize.small, fontStyle: 'italic', color: colors.brand.purple.light, lineHeight: leading.body, opacity: opacity.strong }}>
                    {piece.feel}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Control Vocabulary ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>Control Vocabulary</span>
            <p className="mb-10" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body }}>
              Very few primitives. A magical control appears late, feels physical, says almost nothing,
              and inherits the room's emotional law.
            </p>
          </Reveal>
          <div className="space-y-6">
            {controlVocabulary.map((ctrl, i) => (
              <Reveal key={ctrl.id} delay={i * 0.04}>
                <div className="flex gap-6 items-start">
                  <p className="shrink-0 w-24" style={{ fontFamily: font.serif, fontSize: typeSize.elevated, color: room.fg, opacity: opacity.clear }}>
                    {ctrl.label}
                  </p>
                  <div>
                    {/* No pills. Semantic particles + tracked typography. */}
                    <div className="flex flex-wrap gap-4 mb-2">
                      {ctrl.uses.map(u => (
                        <span key={u} className="flex items-center gap-1.5">
                          <span className="rounded-full" style={{ width: 2, height: 2, background: glaze.muted }} />
                          <span style={{ fontSize: typeSize.note, color: room.gray4, letterSpacing: tracking.body }}>{u}</span>
                        </span>
                      ))}
                    </div>
                    <p style={{ fontFamily: font.serif, fontSize: typeSize.small, fontStyle: 'italic', color: glass(colors.brand.purple.light, 0.6) }}>
                      {ctrl.feel}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Controls Without Containers (§6.X) ─── */}
        <div className="mt-24">
          <Reveal>
            <span className="block mb-3" style={{ ...sectionLabel, color: glass(colors.accent.cyan.primary, 0.5) }}>Controls Without Containers</span>
            <p className="mb-10" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body }}>
              Because we ban traditional buttons and pills, controls must be defined by material physics.
            </p>
          </Reveal>
          <div className="space-y-10">
            {controlPhysics.map((cp, i) => (
              <Reveal key={cp.id} delay={i * 0.06}>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5">
                    <span className="rounded-full" style={{ width: 4, height: 4, display: 'block', background: glass(colors.accent.cyan.primary, 0.35), boxShadow: glow.cast(glass(colors.accent.cyan.primary, 0.15), 8) }} />
                  </div>
                  <p style={{ fontFamily: font.serif, fontSize: typeSize.body, color: room.fg, opacity: opacity.clear }}>{cp.label}</p>
                  <p className="mt-2" style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: colors.brand.purple.light, opacity: opacity.strong, lineHeight: leading.body }}>{cp.description}</p>
                  <p className="mt-2" style={{ fontSize: typeSize.note, color: room.gray3, lineHeight: leading.body, maxWidth: '30rem' }}>{cp.mechanism}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Control Quality ─── */}
        <div className="mt-24">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>Control Quality</span>
          </Reveal>
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-16">
            <div>
              <Reveal>
                <span className="block mb-4" style={{ ...sectionLabel, color: glass(colors.status.green.bright, 0.5) }}>A magical control</span>
              </Reveal>
              {controlQuality.magical.map((q, i) => (
                <Reveal key={q} delay={i * 0.03}>
                  <p style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: glass(colors.status.green.bright, 0.5), lineHeight: leading.open }}>{q}</p>
                </Reveal>
              ))}
            </div>
            <div>
              <Reveal>
                <span className="block mb-4" style={{ ...sectionLabel, color: glass(colors.status.amber.mid, 0.5) }}>A weak control</span>
              </Reveal>
              {controlQuality.weak.map((q, i) => (
                <Reveal key={q} delay={i * 0.03}>
                  <p style={{ fontFamily: font.serif, fontSize: typeSize.reading, fontStyle: 'italic', color: glass(colors.status.amber.mid, 0.35), lineHeight: leading.open }}>{q}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Room Behavior Model ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>Room Behavior Model</span>
            <p className="mb-10" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body }}>
              What a magical room does — not just what it looks like.
            </p>
          </Reveal>
          <div className="space-y-3">
            {roomBehaviorModel.aRoomShould.map((behavior, i) => (
              <Reveal key={behavior} delay={i * 0.04}>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 rounded-full shrink-0" style={{ width: 3, height: 3, background: glass(colors.brand.purple.primary, 0.3), boxShadow: glow.cast(glass(colors.brand.purple.primary, 0.1), 6) }} />
                  <p style={{ fontSize: typeSize.reading, color: room.gray4, lineHeight: leading.body }}>{behavior}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-8">
              {[
                { label: 'Under engagement', value: roomBehaviorModel.underEngagement },
                { label: 'Under pressure', value: roomBehaviorModel.underPressure },
                { label: 'After commitment', value: roomBehaviorModel.afterCommitment },
                { label: 'After completion', value: roomBehaviorModel.afterCompletion },
              ].map(item => (
                <div key={item.label}>
                  <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.label, textTransform: 'uppercase', color: room.gray2 }}>{item.label}</span>
                  <p className="mt-1" style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontStyle: 'italic', color: colors.brand.purple.light, opacity: opacity.strong }}>{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ─── Yield Model ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>The Yield Model</span>
            <p className="mb-4" style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontStyle: 'italic', color: colors.brand.purple.light, lineHeight: leading.relaxed, maxWidth: '30rem' }}>
              {yieldModel.principle}
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-6 mt-6">
            {yieldModel.operations.map((op, i) => (
              <Reveal key={op} delay={i * 0.04}>
                <div className="flex items-center gap-2">
                  <span className="rounded-full" style={{ width: 3, height: 3, background: glass(colors.accent.cyan.primary, 0.3), boxShadow: glow.cast(glass(colors.accent.cyan.primary, 0.12), 6) }} />
                  <span style={{ fontSize: typeSize.small, fontWeight: weight.medium, letterSpacing: tracking.data, color: room.gray4 }}>{op}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Composition Order ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>How to compose a room</span>
            <p className="mb-10" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body }}>
              If the answer starts with "which visual treatment should I use?", the order is already wrong.
            </p>
          </Reveal>
          <div className="space-y-4">
            {compositionOrder.map((step, i) => (
              <Reveal key={step} delay={i * 0.04}>
                <div className="flex items-start gap-4">
                  {/* No numbered badge. Semantic particle + position implies order. */}
                  <span className="shrink-0 mt-1.5 flex items-center gap-1.5">
                    <span className="rounded-full" style={{ width: 4, height: 4, background: glass(colors.brand.purple.primary, 0.15 + i * 0.05), boxShadow: glow.cast(glass(colors.brand.purple.primary, 0.05 + i * 0.02), 6) }} />
                    <span style={{ fontSize: typeSize.detail, color: room.gray2, fontWeight: weight.medium, minWidth: 10, textAlign: 'right' as const }}>{i + 1}</span>
                  </span>
                  <p style={{ fontFamily: font.serif, fontSize: typeSize.prose, color: room.gray4, lineHeight: leading.body }}>
                    {step}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Sequence Thermodynamics ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>Sequence Thermodynamics</span>
            <p className="mb-4" style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontStyle: 'italic', color: colors.brand.purple.light, lineHeight: leading.relaxed, maxWidth: '30rem' }}>
              {sequenceThermodynamics.lawOfCooldown}
            </p>
          </Reveal>
          {/* No cards. Refractive fields. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-8">
            {sequenceThermodynamics.arcPatterns.map((arc, i) => (
              <Reveal key={arc.id} delay={i * 0.06}>
                <div className="relative py-4">
                  <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 30%, ${glaze.trace} 0%, transparent 70%)` }} />
                  <p style={{ fontFamily: font.serif, fontSize: typeSize.prose, color: room.fg, opacity: opacity.clear }}>{arc.label}</p>
                  <p className="mt-2" style={{ fontSize: typeSize.small, color: room.gray3, lineHeight: leading.body }}>{arc.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-6" style={{ fontSize: typeSize.reading, color: room.gray3, lineHeight: leading.relaxed, maxWidth: '30rem' }}>
              {sequenceThermodynamics.carry}
            </p>
          </Reveal>
        </div>

        {/* ─── Anti-Patterns ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>Anti-Patterns</span>
            <p className="mb-4" style={{ fontSize: typeSize.small, color: room.gray2, lineHeight: leading.body }}>
              Do not design {antiPatterns.doNotDesign}. Instead design:
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-6 mb-8">
            {antiPatterns.insteadDesign.map((d, i) => (
              <Reveal key={d} delay={i * 0.04}>
                <span style={{ fontFamily: font.serif, fontSize: typeSize.lede, fontStyle: 'italic', color: glass(colors.status.green.bright, 0.5) }}>{d}</span>
              </Reveal>
            ))}
          </div>
          <div className="space-y-2">
            {antiPatterns.doNotTreatAs.map((item, i) => (
              <Reveal key={item} delay={i * 0.03}>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 rounded-full shrink-0" style={{ width: 2, height: 2, background: glass(colors.status.amber.mid, 0.35) }} />
                  <p style={{ fontSize: typeSize.small, color: glass(colors.status.amber.mid, 0.35), lineHeight: leading.body }}>Do not treat as {item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Failure & Resilience ─── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-3" style={sectionLabel}>Failure & Resilience</span>
            <p className="mb-10" style={{ fontFamily: font.serif, fontSize: typeSize.prose, fontStyle: 'italic', color: colors.brand.purple.light, lineHeight: leading.relaxed, maxWidth: '30rem' }}>
              {antifragilityPrinciple.premise}
            </p>
          </Reveal>
          <div className="space-y-5">
            {failureStates.map((state, i) => (
              <Reveal key={state.id} delay={i * 0.04}>
                <div className="flex items-start gap-4">
                  <span className="mt-1.5 rounded-full shrink-0" style={{ width: 3, height: 3, background: glass(colors.accent.cyan.primary, 0.3), boxShadow: glow.cast(glass(colors.accent.cyan.primary, 0.1), 6) }} />
                  <div>
                    <p style={{ fontFamily: font.serif, fontSize: typeSize.prose, color: room.fg, opacity: opacity.clear }}>{state.label}</p>
                    <p className="mt-1" style={{ fontSize: typeSize.small, color: room.gray3, lineHeight: leading.body }}>{state.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Forbidden ─── */}
        <div className="mt-40">
          <Reveal>
            {/* Amber, not red — red has no place in recovery */}
            <span className="block mb-3" style={{ ...sectionLabel, color: glass(colors.status.amber.mid, 0.5) }}>Forbidden</span>
            <p className="mb-8" style={{ fontSize: typeSize.small, color: room.gray1 }}>
              Rejection criteria. If any of these are present, the design fails review.
            </p>
          </Reveal>
          <div className="space-y-3">
            {forbiddenRules.map((rule, i) => (
              <Reveal key={rule} delay={i * 0.02}>
                <div className="flex items-start gap-3">
                  {/* Amber semantic particle — never red */}
                  <span className="mt-1.5 rounded-full shrink-0" style={{ width: 2, height: 2, background: glass(colors.status.amber.mid, 0.35) }} />
                  <p style={{ fontSize: typeSize.reading, color: room.gray3, lineHeight: leading.body }}>{rule}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── The User Should Feel ─── */}
        <div className="mt-40">
          <Reveal>
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
              <div>
                <span className="block mb-4" style={sectionLabel}>The user should feel</span>
                {['Invoked', 'Carried', 'Held', 'Resumed', 'Changed'].map((w, i) => (
                  <Reveal key={w} delay={i * 0.04}>
                    <p style={{ fontFamily: font.serif, fontSize: typeSize.elevated, fontStyle: 'italic', color: glass(colors.status.green.bright, 0.6), lineHeight: leading.double }}>{w}</p>
                  </Reveal>
                ))}
              </div>
              <div>
                <span className="block mb-4" style={sectionLabel}>The user should not feel</span>
                {['Switched', 'Launched', 'Navigated', 'Briefed', 'Managed'].map((w, i) => (
                  <Reveal key={w} delay={i * 0.04}>
                    {/* Amber for caution, not red for danger */}
                    <p style={{ fontFamily: font.serif, fontSize: typeSize.elevated, fontStyle: 'italic', color: glass(colors.status.amber.mid, 0.35), lineHeight: leading.double, textDecoration: 'line-through', textDecorationColor: glass(colors.status.amber.mid, 0.15) }}>{w}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="h-[20vh]" />
    </div>
  );
}