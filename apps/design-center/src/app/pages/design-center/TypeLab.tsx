/**
 * TYPE LAB
 * ════════
 * Typography workbench. Voice-driven type specimens.
 * Materialization modes, pacing playground, font stacks.
 *
 * DEPENDENCIES:
 *   - design-tokens (colors, fonts, typography — the canonical source)
 *   - dc-tokens (sectionAccents)
 *   - LabShell + DeviceMirror (shared components)
 *
 * ZERO DUPLICATION: Font families reference `fonts.*` directly.
 * Type scale entries reference `typography.*` directly.
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, fonts, typography } from '@/design-tokens';
import { SPECIMEN_COPY } from './dc-tokens';
import { LabShell } from './components/LabShell';
import { useDeviceMirror } from './components/DeviceMirror';

// ─── Type Scale (derived from tokens) ───────────────────────

const TYPE_SCALE = [
  { label: 'display.hero', family: fonts.secondary, ...typography.display.hero, sample: 'Becoming' },
  { label: 'heading.h1', family: fonts.secondary, ...typography.heading.h1, sample: SPECIMEN_COPY[1].copy },
  { label: 'heading.h3', family: fonts.secondary, ...typography.heading.h3, sample: SPECIMEN_COPY[1].follow },
  { label: 'body.large', family: fonts.primary, ...typography.body.large, sample: 'Recovery stabilises the same way anything stabilises: by building new pathways until the brain predicts something new by default.' },
  { label: 'body.default', family: fonts.primary, ...typography.body.default, sample: 'Every behaviour is a neural pattern. Every pattern is a pathway.' },
  { label: 'label.medium', family: fonts.primary, ...typography.label.medium, sample: 'NEUROADAPTIVE PRECISION' },
  { label: 'ui.caption', family: fonts.mono, ...typography.ui.caption, sample: 'somatic_entrainment -- friction_design -- prediction_bet' },
];

// ─── Font Stacks (derived from tokens) ──────────────────────

const FONT_STACKS = [
  { name: 'Primary', family: fonts.primary, purpose: 'Interface, body copy, labels', token: 'fonts.primary' },
  { name: 'Secondary', family: fonts.secondary, purpose: 'Headlines, NaviCue prompts, emotional weight', token: 'fonts.secondary' },
  { name: 'Mono', family: fonts.mono, purpose: 'System labels, data, tokens', token: 'fonts.mono' },
];

// ─── Materialization Modes ──────────────────────────────────

const MATERIALIZATION_MODES = [
  { id: 'emerge', label: 'Emerge', description: 'Rise from behind the surface. The default. Trust the gravity.' },
  { id: 'dissolve', label: 'Dissolve', description: 'Resolve from noise. Good for work context -- fast, non-interruptive.' },
  { id: 'inscribe', label: 'Inscribe', description: 'Typewriter arrival. One letter at a time. For moments that earn weight.' },
  { id: 'burn_in', label: 'Burn In', description: 'Slow sear, widened spacing. Night context. Contemplative.' },
  { id: 'immediate', label: 'Immediate', description: 'No animation. For high heat bands when the amygdala has the wheel.' },
];

// ─── Main Export ─────────────────────────────────────────────

export default function TypeLab() {
  const [activeMode, setActiveMode] = useState(0);
  const { setContent } = useDeviceMirror();

  useEffect(() => {
    setContent({
      copy: 'You already know.',
      follow: 'You just forgot you know.',
      accent: `rgba(249, 248, 255, 0.2)`,
      glow: `rgba(249, 248, 255, 0.06)`,
    });
  }, [setContent]);

  return (
    <LabShell
      eyebrow="typography"
      headline="Voice shapes the word"
      subline="Three font stacks. Five materialization modes. Timing shapes the meaning."
    >
      {/* Font stacks */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>font stacks</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {FONT_STACKS.map(fs => (
            <div key={fs.name} style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.03)`, flex: '1 1 200px' }}>
              <div style={{ fontFamily: fs.family, fontSize: 20, color: colors.neutral.white, opacity: 0.7, marginBottom: 8 }}>{fs.name}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.2, lineHeight: 1.6, marginBottom: 4 }}>{fs.purpose}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.12, letterSpacing: '0.04em' }}>{fs.token}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Type scale */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 20 }}>type scale</div>
        {TYPE_SCALE.map((spec, i) => (
          <motion.div
            key={spec.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid rgba(255,255,255,0.03)` }}
          >
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.15, marginBottom: 8, letterSpacing: '0.04em' }}>
              {spec.label}
              <span style={{ opacity: 0.5, marginLeft: 12 }}>{spec.fontSize}</span>
            </div>
            <div style={{ fontFamily: spec.family, fontSize: spec.fontSize, color: colors.neutral.white, opacity: 0.6, lineHeight: spec.lineHeight, letterSpacing: spec.letterSpacing ?? '-0.01em', maxWidth: 600 }}>
              {spec.sample}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Materialization modes */}
      <div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>materialization modes</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MATERIALIZATION_MODES.map((mode, i) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(i)}
              style={{
                background: i === activeMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(255,255,255,0.04)`,
                borderRadius: 9999,
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <span style={{ fontFamily: fonts.primary, fontSize: 12, color: colors.neutral.white, opacity: i === activeMode ? 0.7 : 0.3 }}>{mode.label}</span>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: fonts.primary, fontSize: 13, color: colors.neutral.white, opacity: 0.3, marginTop: 12, lineHeight: 1.5 }}>
          {MATERIALIZATION_MODES[activeMode].description}
        </div>
      </div>
    </LabShell>
  );
}
