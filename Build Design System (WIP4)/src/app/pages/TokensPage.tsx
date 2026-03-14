import { useState } from 'react';
import { room, font, colors, glass, tracking, typeSize, leading, weight, opacity, radii, glow, glaze, layer } from '../components/design-system/surface-tokens';
import { Reveal } from '../components/design-system/Reveal';
import { Check, Copy } from 'lucide-react';

/**
 * TOKENS — The Language of Light
 *
 * A scroll through the colour system.
 * Each family breathes in its own space.
 */

function Hex({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="group inline-flex items-center gap-1.5"
    >
      <span style={{ fontSize: typeSize.note, fontFamily: font.mono, color: room.gray2 }}>{value}</span>
      {copied ? <Check size={9} color={colors.accent.green.primary} /> : <Copy size={9} className="opacity-0 group-hover:opacity-30 transition-opacity duration-500" color={room.gray3} />}
    </button>
  );
}

function ColorRow({ name, hex }: { name: string; hex: string }) {
  const isDark = [room.base, room.elevated, room.gray1].includes(hex);
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-full shrink-0"
        style={{
          background: hex,
          boxShadow: isDark
            ? `0 0 20px ${hex}20, ${glow.ringCast(glaze.frost)}`
            : `0 0 20px ${hex}20`,
        }}
      />
      <div className="flex flex-col">
        <span style={{ fontSize: typeSize.reading, fontWeight: weight.medium, color: room.gray5 }}>{name}</span>
        <Hex value={hex} />
      </div>
    </div>
  );
}

function ColorFamily({ label, colors: colorList, delay = 0 }: { label: string; colors: { name: string; hex: string }[]; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <span
        className="block mb-6"
        style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-x-10 gap-y-5">
        {colorList.map(c => <ColorRow key={c.name + c.hex} {...c} />)}
      </div>
    </Reveal>
  );
}

export function TokensPage() {
  return (
    <div className="relative" style={{ zIndex: layer.base }}>
      {/* Opening breath */}
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
            The language of light
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-md" style={{ fontSize: typeSize.lede, lineHeight: leading.generous, color: room.gray3 }}>
            Every value in the system exists once. If it appears twice, it has a name and a reason.
          </p>
        </Reveal>

        {/* Neutrals */}
        <div className="mt-28">
          <ColorFamily
            label="Neutral"
            colors={Object.entries(colors.neutral.gray).map(([k, v]) => ({ name: k, hex: v }))}
          />
        </div>

        {/* Purple */}
        <div className="mt-24">
          <ColorFamily
            label="Brand"
            colors={Object.entries(colors.brand.purple).map(([k, v]) => ({ name: k, hex: v }))}
          />
        </div>

        {/* Cyan + Green */}
        <div className="mt-24">
          <ColorFamily
            label="Accent — Cyan"
            colors={Object.entries(colors.accent.cyan).map(([k, v]) => ({ name: k, hex: v }))}
          />
        </div>

        <div className="mt-16">
          <ColorFamily
            label="Accent — Green"
            colors={Object.entries(colors.accent.green).map(([k, v]) => ({ name: k, hex: v }))}
          />
        </div>

        {/* Status */}
        <div className="mt-24">
          <ColorFamily
            label="Status"
            colors={[
              ...Object.entries(colors.status.green).map(([k, v]) => ({ name: `green ${k}`, hex: v })),
              ...Object.entries(colors.status.amber).map(([k, v]) => ({ name: `amber ${k}`, hex: v })),
              ...Object.entries(colors.status.purple).map(([k, v]) => ({ name: `purple ${k}`, hex: v })),
            ]}
          />
        </div>

        {/* Emotion Signatures */}
        <div className="mt-24">
          <ColorFamily
            label="Emotion Signatures"
            colors={Object.entries(colors.signature).map(([k, v]) => ({
              name: k.replace(/([A-Z])/g, ' $1').trim().toLowerCase(),
              hex: v,
            }))}
          />
        </div>

        {/* Pipeline — internal */}
        <div className="mt-24">
          <Reveal>
            <span className="block mb-2" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Pipeline
            </span>
            <p className="mb-5" style={{ fontSize: typeSize.note, color: room.gray1 }}>Internal only. Never user-facing.</p>
            <div className="flex flex-wrap gap-x-10 gap-y-5">
              {Object.entries(colors.kbe).map(([, val]) => (
                <ColorRow key={val.tag} name={val.label} hex={val.color} />
              ))}
            </div>
          </Reveal>
        </div>

        {/* Spacing */}
        <div className="mt-32">
          <Reveal>
            <span className="block mb-8" style={{ fontSize: typeSize.caption, fontWeight: weight.medium, letterSpacing: tracking.tight, textTransform: 'uppercase', color: room.gray2 }}>
              Space
            </span>
            <div className="flex items-end gap-6">
              {[
                { label: 'xxs', px: 2 }, { label: 'xs', px: 4 }, { label: 'sm', px: 8 },
                { label: 'md', px: 16 }, { label: 'lg', px: 24 }, { label: 'xl', px: 32 },
                { label: '2xl', px: 48 }, { label: '3xl', px: 64 },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div
                    style={{
                      width: Math.max(s.px, 4),
                      height: Math.max(s.px, 4),
                      borderRadius: radii.pill,
                      background: glass(colors.brand.purple.primary, 0.15 + (s.px / 64) * 0.25),
                    }}
                  />
                  <span style={{ fontSize: typeSize.caption, color: room.gray2 }}>{s.label}</span>
                  <span style={{ fontSize: typeSize.detail, fontFamily: font.mono, color: room.gray1 }}>{s.px}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Closing breath */}
      <div className="h-[20vh]" />
    </div>
  );
}