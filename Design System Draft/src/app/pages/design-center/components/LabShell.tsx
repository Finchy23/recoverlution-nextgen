/**
 * LAB SHELL
 * ═════════
 * Common layout wrapper for all Design Center lab pages.
 * Provides the split-pane layout:
 *   Left: Canvas workspace (scrollable)
 *   Right: Device mirror (sticky, desktop only)
 *
 * DEPENDENCIES:
 *   - dc-tokens (layout dimensions)
 *   - design-tokens (colors, fonts)
 *   - DeviceMirror (device preview component)
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, fonts } from '@/design-tokens';
import { layout } from '../dc-tokens';
import { DeviceMirror } from './DeviceMirror';

interface LabShellProps {
  /** Lab eyebrow label (e.g., "palette", "anatomy") */
  eyebrow: string;
  /** Lab headline */
  headline: string;
  /** Optional subline */
  subline?: string;
  /** Show device mirror (default true) */
  showDevice?: boolean;
  /** Lab workspace content */
  children: React.ReactNode;
}

export function LabShell({
  eyebrow,
  headline,
  subline,
  showDevice = true,
  children,
}: LabShellProps) {
  const [showDevicePanel, setShowDevicePanel] = useState(false);

  useEffect(() => {
    const check = () => setShowDevicePanel(window.innerWidth >= layout.deviceBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isMobile = !showDevicePanel;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        gap: 0,
      }}
    >
      {/* ─── Canvas workspace ─── */}
      <div
        style={{
          flex: 1,
          padding: isMobile
            ? `${layout.topBarHeight + 28}px 20px ${layout.mobileTabHeight + 40}px`
            : `${layout.topBarHeight + 28}px 48px 80px 0`,
          maxWidth: showDevice && showDevicePanel
            ? `calc(100% - ${layout.devicePanelWidth}px)`
            : '100%',
          overflowY: 'auto',
        }}
      >
        {/* Lab header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 56 }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: colors.neutral.white,
              opacity: 0.25,
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: fonts.secondary,
              fontSize: 'clamp(24px, 4vw, 36px)',
              color: colors.neutral.white,
              opacity: 0.8,
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
              maxWidth: 480,
            }}
          >
            {headline}
          </div>
          {subline && (
            <div
              style={{
                fontFamily: fonts.primary,
                fontSize: 14,
                color: colors.neutral.white,
                opacity: 0.3,
                marginTop: 12,
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              {subline}
            </div>
          )}
        </motion.div>

        {/* Lab content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>

      {/* ─── Device mirror (desktop only) ─── */}
      {showDevice && showDevicePanel && (
        <div
          style={{
            width: layout.devicePanelWidth,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: `1px solid rgba(255, 255, 255, 0.03)`,
          }}
        >
          <DeviceMirror />
        </div>
      )}
    </div>
  );
}
