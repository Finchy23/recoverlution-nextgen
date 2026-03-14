import { Reveal } from '../components/design-system/Reveal';
import { room, font, tracking, typeSize, leading, weight, opacity, layer } from '../components/design-system/surface-tokens';

/**
 * TYPOGRAPHY — The Calm Line
 *
 * Text floats up from darkness, delivers a truth, and dissolves.
 * This page demonstrates type by being type.
 */

export function TypographyPage() {
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
            The calm line
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-md" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            Text does not clutter. It floats up from the darkness, delivers a truth, and dissolves.
          </p>
        </Reveal>

        {/* ── Font Families ── */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Families
            </span>
          </Reveal>

          <div className="space-y-16">
            {[
              { name: 'Inter', family: "'Inter', sans-serif", role: 'Primary — UI, body, labels', sample: 'The space between stimulus and response.' },
              { name: 'Crimson Pro', family: font.serif, role: 'Secondary — display, titles, verses', sample: 'Welcome home.' },
              { name: 'SF Mono', family: font.mono, role: 'Monospace — code, values, tokens', sample: 'rgba(255, 255, 255, 0.06)' },
            ].map((f, i) => (
              <Reveal key={f.name} delay={i * 0.06}>
                <p
                  style={{
                    fontFamily: f.family,
                    fontSize: 'clamp(22px, 3.5vw, 36px)',
                    fontWeight: weight.regular,
                    color: room.fg,
                    opacity: opacity.lucid,
                    lineHeight: leading.compact,
                  }}
                >
                  {f.sample}
                </p>
                <div className="flex items-baseline gap-3 mt-3">
                  <span style={{ fontSize: typeSize.small, fontWeight: weight.medium, color: room.gray3 }}>{f.name}</span>
                  <span style={{ fontSize: typeSize.caption, color: room.gray1 }}>{f.role}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Heading Scale ── */}
        <div className="mt-36">
          <Reveal>
            <span className="block mb-12" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Heading Scale
            </span>
          </Reveal>

          <div className="space-y-12">
            {[
              { label: 'Display', size: 'clamp(40px, 7vw, 72px)', weight: weight.semibold, tracking: '-0.025em', family: font.serif, sample: 'Welcome home.' },
              { label: 'H1', size: 'clamp(32px, 5vw, 56px)', weight: weight.semibold, tracking: '-0.02em', family: font.serif, sample: 'State before story.' },
              { label: 'H2', size: 'clamp(24px, 4vw, 40px)', weight: weight.semibold, tracking: '-0.015em', family: font.serif, sample: 'The body remembers.' },
              { label: 'H3', size: 'clamp(20px, 3vw, 32px)', weight: weight.medium, tracking: '-0.01em', family: "'Inter', sans-serif", sample: 'Right dose. Right moment.' },
              { label: 'H4', size: 'clamp(18px, 2.5vw, 24px)', weight: weight.medium, tracking: '0', family: "'Inter', sans-serif", sample: 'The quiet shift.' },
            ].map((h, i) => (
              <Reveal key={h.label} delay={i * 0.04}>
                <p
                  style={{
                    fontFamily: h.family,
                    fontSize: h.size,
                    fontWeight: h.weight,
                    letterSpacing: h.tracking,
                    lineHeight: leading.tight,
                    color: room.fg,
                    opacity: opacity.clear,
                  }}
                >
                  {h.sample}
                </p>
                <span className="block mt-2" style={{ fontSize: typeSize.caption, color: room.gray1 }}>{h.label}</span>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Body Scale ── */}
        <div className="mt-36">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Body Scale
            </span>
          </Reveal>

          <div className="space-y-10">
            {[
              { label: 'Large — 18px', size: '18px', sample: 'Recovery is not a destination. It is a relationship with your own nervous system.' },
              { label: 'Default — 15px', size: '15px', sample: 'The space between stimulus and response is where freedom lives. We hold that space open.' },
              { label: 'Small — 13px', size: '13px', sample: 'Right dose. Right primitive. Right timing. Always aligned to the moment.' },
              { label: 'XS — 11px', size: '11px', sample: 'Internal reference. Metadata. Timestamps.' },
            ].map((b, i) => (
              <Reveal key={b.label} delay={i * 0.04}>
                <p className="max-w-lg" style={{ fontSize: b.size, lineHeight: leading.reading, color: room.gray4 }}>
                  {b.sample}
                </p>
                <span className="block mt-2" style={{ fontSize: typeSize.caption, color: room.gray1 }}>{b.label}</span>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Labels ── */}
        <div className="mt-36">
          <Reveal>
            <span className="block mb-10" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Labels
            </span>
          </Reveal>

          <div className="space-y-6">
            {[
              { label: 'Label L', size: '14px', tracking: '0.06em' },
              { label: 'Label M', size: '12px', tracking: '0.08em' },
              { label: 'Label S', size: '10px', tracking: '0.1em' },
            ].map((l, i) => (
              <Reveal key={l.label} delay={i * 0.04}>
                <span
                  style={{
                    fontSize: l.size,
                    fontWeight: weight.semibold,
                    letterSpacing: l.tracking,
                    textTransform: 'uppercase',
                    color: room.gray3,
                  }}
                >
                  {l.label}
                </span>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Lexicon ── */}
        <div className="mt-40">
          <Reveal>
            <span className="block mb-6" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Words we own
            </span>
            <p className="max-w-lg" style={{ fontSize: typeSize.prose, lineHeight: leading.open, color: room.gray3 }}>
              {['Architecture', 'Gravity', 'Friction', 'Resonance', 'Glass', 'Biological', 'Somatic', 'Momentum', 'Constellation'].join(' · ')}
            </p>
          </Reveal>
        </div>

        <div className="mt-16">
          <Reveal>
            <span className="block mb-6" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Words we never use
            </span>
            <p className="max-w-lg" style={{ fontSize: typeSize.lede, lineHeight: leading.open, color: room.gray1, textDecoration: 'line-through', textDecorationColor: room.gray1 }}>
              {['Users', 'Hacks', 'Tips', 'Tricks', 'Streaks', 'Points', 'Gamify', 'Content', 'Consumption'].join(' · ')}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="h-[20vh]" />
    </div>
  );
}