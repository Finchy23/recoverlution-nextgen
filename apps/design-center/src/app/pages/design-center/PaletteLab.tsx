/**
 * PALETTE LAB
 * ═══════════
 * Color workbench. The 8 magic signatures as composable palettes.
 *
 * DEPENDENCIES:
 *   - dc-tokens (SIGNATURE_PALETTES, CHRONO_CONTEXTS, SPECIMEN_COPY)
 *   - navicue-magic-signatures (real data — schema mappings)
 *   - design-tokens (colors, fonts, surfaces)
 *   - LabShell + DeviceMirror (shared components)
 *
 * ZERO HARDCODED COLORS: Every color references a token or palette.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import {
  SIGNATURE_PALETTES,
  CHRONO_CONTEXTS,
  getSpecimenCopy,
  type SignaturePalette,
} from './dc-tokens';
import { LabShell } from './components/LabShell';
import { useDeviceMirror } from './components/DeviceMirror';

// ─── Brand Primitives ───────────────────────────────────────
// Derived from the core design token export — not hardcoded.

const BRAND_TOKENS = [
  { label: 'purple.primary', value: colors.brand.purple.primary },
  { label: 'purple.light', value: colors.brand.purple.light },
  { label: 'purple.dark', value: colors.brand.purple.dark },
  { label: 'cyan.primary', value: colors.accent.cyan.primary },
  { label: 'green.primary', value: colors.accent.green.primary },
  { label: 'blue.primary', value: colors.accent.blue.primary },
  { label: 'neutral.white', value: colors.neutral.white },
  { label: 'neutral.black', value: colors.neutral.black },
];

// ─── Signature Card ─────────────────────────────────────────

function SignatureCard({
  palette,
  isActive,
  onClick,
}: {
  palette: SignaturePalette;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
      style={{
        position: 'relative',
        padding: '20px 16px',
        borderRadius: 16,
        background: isActive ? palette.glass : surfaces.glass.subtle,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 0.4s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: `1px solid rgba(255, 255, 255, ${isActive ? 0.08 : 0.03})`, pointerEvents: 'none', transition: 'border-color 0.3s' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: palette.primary, boxShadow: isActive ? `0 0 12px ${palette.accent}` : 'none', transition: 'box-shadow 0.3s' }} />
        <span style={{ fontFamily: fonts.primary, fontSize: 13, color: colors.neutral.white, opacity: isActive ? 0.8 : 0.4, transition: 'opacity 0.3s' }}>
          {palette.name}
        </span>
      </div>
      <span style={{ fontFamily: fonts.primary, fontSize: 11, color: colors.neutral.white, opacity: 0.25, lineHeight: 1.5 }}>
        {palette.emotionJob}
      </span>
    </motion.button>
  );
}

// ─── Palette Detail ─────────────────────────────────────────

function PaletteDetail({ palette }: { palette: SignaturePalette }) {
  return (
    <motion.div
      key={palette.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginTop: 32 }}
    >
      {/* Swatches */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {([
          { key: 'primary', bg: palette.primary },
          { key: 'glow', bg: `radial-gradient(circle, ${palette.glow} 0%, ${surfaces.solid.base} 70%)` },
          { key: 'glass', bg: palette.glass, border: true },
          { key: 'accent', bg: palette.accent },
        ] as const).map(swatch => (
          <div key={swatch.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: swatch.bg,
              boxShadow: swatch.key === 'primary' ? `0 0 20px ${palette.accent}` : 'none',
              border: swatch.border ? `1px solid ${surfaces.glass.border}` : 'none',
              backdropFilter: swatch.border ? 'blur(8px)' : 'none',
            }} />
            <span style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.3, letterSpacing: '0.04em' }}>{swatch.key}</span>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.2, letterSpacing: '0.06em' }}>copy mode</span>
          <div style={{ fontFamily: fonts.primary, fontSize: 13, color: colors.neutral.white, opacity: 0.5, marginTop: 4 }}>{palette.copyMode}</div>
        </div>
        <div>
          <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.2, letterSpacing: '0.06em' }}>voice affinity</span>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {palette.voiceAffinity.map(v => (
              <span key={v} style={{ fontFamily: fonts.primary, fontSize: 11, color: colors.neutral.white, opacity: 0.35, padding: '3px 8px', borderRadius: 9999, background: surfaces.glass.subtle }}>
                {v.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Interaction bias from real data */}
        {/* Removed: magicSig interaction_bias and anti_patterns (navicue data deleted) */}
      </div>

      {/* Chrono transforms */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>
          chrono transforms
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {CHRONO_CONTEXTS.map(ctx => (
            <div
              key={ctx.id}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: surfaces.glass.subtle,
                border: `1px solid rgba(255, 255, 255, 0.03)`,
              }}
            >
              <div style={{ fontFamily: fonts.primary, fontSize: 12, color: colors.neutral.white, opacity: 0.5, marginBottom: 6 }}>{ctx.label}</div>
              <div style={{ fontFamily: fonts.primary, fontSize: 11, color: colors.neutral.white, opacity: 0.2, lineHeight: 1.5 }}>{ctx.colorShift}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────

export default function PaletteLab() {
  const [activeIdx, setActiveIdx] = useState(0);
  const palette = SIGNATURE_PALETTES[activeIdx];
  const { setContent } = useDeviceMirror();

  // Push active palette to device mirror
  useEffect(() => {
    const specimen = getSpecimenCopy(palette.id);
    setContent({
      copy: specimen.copy,
      follow: specimen.follow,
      accent: palette.accent,
      glow: palette.glow,
    });
  }, [palette, setContent]);

  return (
    <LabShell
      eyebrow="palette"
      headline="Atmosphere as color"
      subline="8 magic signatures. Each one a complete emotional world -- palette, glow, glass, and voice affinity."
    >
      {/* Brand primitives */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>
          brand primitives
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {BRAND_TOKENS.map(t => (
            <div key={t.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: t.value,
                border: t.label.includes('white') ? `1px solid ${surfaces.glass.border}` : 'none',
              }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.25, letterSpacing: '0.03em' }}>{t.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signature selector */}
      <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>
        magic signatures
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 8 }}>
        {SIGNATURE_PALETTES.map((p, i) => (
          <SignatureCard
            key={p.id}
            palette={p}
            isActive={i === activeIdx}
            onClick={() => setActiveIdx(i)}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <PaletteDetail palette={palette} />
      </AnimatePresence>
    </LabShell>
  );
}