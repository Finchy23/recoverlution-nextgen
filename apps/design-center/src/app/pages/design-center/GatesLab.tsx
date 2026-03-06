/**
 * GATES LAB
 * ═════════
 * Validation studio. The 4 gates + 12-item delivery checklist.
 * Live specimen validator. Anti-pattern scanner.
 *
 * DEPENDENCIES:
 *   - dc-tokens (GATES, DELIVERY_CHECKLIST, sectionAccents)
 *   - design-tokens (colors, fonts, surfaces)
 *   - LabShell + DeviceMirror (shared components)
 *
 * ZERO DUPLICATION: Gate and checklist data from dc-tokens.
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import { GATES, DELIVERY_CHECKLIST, sectionAccents } from './dc-tokens';
import { LabShell } from './components/LabShell';
import { useDeviceMirror } from './components/DeviceMirror';

// ─── Main Export ─────────────────────────────────────────────

export default function GatesLab() {
  const [passStates, setPassStates] = useState<Record<string, boolean | null>>(
    Object.fromEntries(DELIVERY_CHECKLIST.map(c => [c.id, null]))
  );
  const { setContent } = useDeviceMirror();

  useEffect(() => {
    setContent({
      copy: 'Four thresholds.',
      follow: 'Zero drift.',
      accent: `rgba(255, 107, 138, 0.3)`,
      glow: `rgba(255, 107, 138, 0.08)`,
    });
  }, [setContent]);

  const toggleCheck = (id: string) => {
    setPassStates(prev => ({
      ...prev,
      [id]: prev[id] === null ? true : prev[id] === true ? false : null,
    }));
  };

  const passCount = Object.values(passStates).filter(v => v === true).length;
  const failCount = Object.values(passStates).filter(v => v === false).length;

  return (
    <LabShell
      eyebrow="gates"
      headline="Four thresholds. Zero drift."
      subline="Every specimen passes 4 gates and a 12-item delivery checklist before it ships."
    >
      {/* The 4 Gates */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 20 }}>the four gates</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {GATES.map((gate, i) => (
            <motion.div
              key={gate.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              style={{
                position: 'relative',
                padding: '24px 20px',
                borderRadius: 16,
                background: surfaces.glass.subtle,
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: `1px solid rgba(255, 255, 255, 0.04)`, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${gate.accent}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: gate.accent }} />
                <span style={{ fontFamily: fonts.primary, fontSize: 13, color: colors.neutral.white, opacity: 0.6 }}>{gate.name}</span>
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.2, marginBottom: 12, letterSpacing: '0.04em' }}>{gate.alias}</div>
              <div style={{ fontFamily: fonts.secondary, fontSize: 14, color: colors.neutral.white, opacity: 0.4, lineHeight: 1.5, marginBottom: 8 }}>{gate.question}</div>
              <div style={{ fontFamily: fonts.primary, fontSize: 11, color: colors.neutral.white, opacity: 0.2, lineHeight: 1.5 }}>{gate.rule}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 12-Item Checklist */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2 }}>delivery checklist</div>
          {(passCount > 0 || failCount > 0) && (
            <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.2 }}>
              {passCount}/{DELIVERY_CHECKLIST.length} pass
              {failCount > 0 && ` -- ${failCount} flagged`}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DELIVERY_CHECKLIST.map(item => {
            const state = passStates[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: state === true
                    ? `rgba(37, 212, 148, 0.04)`
                    : state === false
                    ? `rgba(255, 182, 119, 0.04)`
                    : surfaces.glass.subtle,
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: state === true
                    ? `rgba(37, 212, 148, 0.3)`
                    : state === false
                    ? `rgba(255, 182, 119, 0.3)`
                    : surfaces.glass.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.3s',
                }}>
                  {state === true && <span style={{ fontSize: 10, color: colors.accent.green.primary }}>&#10003;</span>}
                  {state === false && <span style={{ fontSize: 10, color: sectionAccents.motion }}>&#10005;</span>}
                </div>

                <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.2, minWidth: 36, letterSpacing: '0.04em' }}>{item.id}</span>
                <span style={{ fontFamily: fonts.primary, fontSize: 12, color: colors.neutral.white, opacity: 0.5, flex: 1 }}>{item.check}</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.15, letterSpacing: '0.03em' }}>{item.rule}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LabShell>
  );
}
