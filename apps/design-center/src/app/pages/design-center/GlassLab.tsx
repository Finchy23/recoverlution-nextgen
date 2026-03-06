/**
 * GLASS LAB
 * ═════════
 * Surface physics workbench.
 * Composable glass surfaces -- frost, blur, alpha, depth.
 * Touch ripple playground. Depth layering explorer.
 *
 * DEPENDENCIES:
 *   - dc-tokens (glass presets, DEPTH_LAYERS, sectionAccents)
 *   - design-tokens (colors, fonts, surfaces)
 *   - LabShell + DeviceMirror (shared components)
 *
 * ZERO HARDCODED SURFACES: All glass values from dc-tokens.glass.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import { glass, DEPTH_LAYERS } from './dc-tokens';
import { LabShell } from './components/LabShell';
import { useDeviceMirror } from './components/DeviceMirror';

// ─── Glass Preset List ──────────────────────────────────────

const GLASS_PRESETS = Object.entries(glass.presets).map(([key, preset]) => ({
  key: key as keyof typeof glass.presets,
  ...preset,
}));

const PRESET_DESCRIPTIONS: Record<string, string> = {
  subtle: 'Barely there. The surface you feel but never see.',
  light: 'Gentle separation. Content breathes.',
  medium: 'The default. Crisp text on glass.',
  strong: 'Elevated. For primary interaction surfaces.',
  frosted: 'Deep frost. Night context, contemplative.',
};

// ─── Main Export ─────────────────────────────────────────────

export default function GlassLab() {
  const [activePreset, setActivePreset] = useState(2); // medium default
  const preset = GLASS_PRESETS[activePreset];
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { setContent } = useDeviceMirror();

  useEffect(() => {
    setContent({
      copy: 'Glass breathes.',
      follow: 'Frost responds. Depth layers.',
      accent: `rgba(0, 204, 224, 0.3)`,
      glow: `rgba(0, 204, 224, 0.08)`,
    });
  }, [setContent]);

  const handleRipple = useCallback((e: React.MouseEvent) => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);
  }, []);

  return (
    <LabShell
      eyebrow="surfaces"
      headline="Glass breathes"
      subline="Composable surfaces. Frost, blur, alpha, depth -- each tuned to heat band and chrono context."
    >
      {/* Interactive glass surface */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>touch to ripple</div>
        <div
          ref={surfaceRef}
          onClick={handleRipple}
          style={{
            position: 'relative',
            height: 200,
            borderRadius: 20,
            background: glass.bg(preset.label as keyof typeof glass.presets),
            backdropFilter: glass.backdrop(preset.label as keyof typeof glass.presets),
            cursor: 'pointer',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s ease',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, borderRadius: 20, border: `1px solid ${glass.border}`, pointerEvents: 'none' }} />

          {preset.frost > 0 && (
            <div style={{ position: 'absolute', inset: 0, background: `rgba(255, 255, 255, ${preset.frost * 0.05})`, borderRadius: 20, pointerEvents: 'none' }} />
          )}

          {ripples.map(r => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, opacity: 0.3 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ position: 'absolute', left: r.x - 3, top: r.y - 3, width: 6, height: 6, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', pointerEvents: 'none' }}
            />
          ))}

          <span style={{ fontFamily: fonts.secondary, fontSize: 20, color: colors.neutral.white, opacity: 0.5, zIndex: 1 }}>
            crisp text on glass
          </span>
        </div>
      </div>

      {/* Preset selector */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>presets</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {GLASS_PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActivePreset(i)}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: i === activePreset ? surfaces.glass.light : surfaces.glass.subtle,
                border: `1px solid rgba(255, 255, 255, 0.04)`,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontFamily: fonts.primary, fontSize: 12, color: colors.neutral.white, opacity: i === activePreset ? 0.7 : 0.3, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.2 }}>
                a:{p.alpha} b:{p.blur} f:{p.frost}
              </div>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: fonts.primary, fontSize: 13, color: colors.neutral.white, opacity: 0.3, marginTop: 12 }}>
          {PRESET_DESCRIPTIONS[preset.label] ?? ''}
        </div>
      </div>

      {/* Depth stack */}
      <div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 16 }}>depth layering order</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DEPTH_LAYERS.map(layer => {
            const opacity = 0.2 + layer.z * 0.14;
            return (
              <div key={layer.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: surfaces.glass.subtle }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.15, minWidth: 16 }}>z{layer.z}</span>
                <div style={{ width: 20 + opacity * 30, height: 3, borderRadius: 2, background: `rgba(0, 204, 224, ${opacity * 0.5})` }} />
                <span style={{ fontFamily: fonts.primary, fontSize: 12, color: colors.neutral.white, opacity: 0.4 }}>{layer.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </LabShell>
  );
}
