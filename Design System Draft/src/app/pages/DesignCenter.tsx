/**
 * DESIGN CENTER — LAYOUT SHELL
 * ═════════════════════════════
 * The root layout for the entire Design Center platform.
 * Provides:
 *   - Top bar with branding
 *   - Glass side nav (desktop) / bottom tab bar (mobile)
 *   - DeviceMirror context provider
 *   - Outlet for child routes (overview, labs)
 *
 * DEPENDENCIES:
 *   - dc-tokens (layout dimensions, glass chrome)
 *   - design-tokens (colors, fonts, surfaces)
 *   - GlassNav (side/bottom navigation)
 *   - DeviceMirrorProvider (context for device preview)
 *
 * ROUTE STRUCTURE:
 *   /design-center              → Overview (cinematic river)
 *   /design-center/palette      → Color workbench
 *   /design-center/type         → Typography lab
 *   /design-center/glass        → Surface physics
 *   /design-center/motion       → Breath & motion
 *   /design-center/gates        → Validation studio
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Outlet, Link } from 'react-router';
import { colors, fonts, surfaces } from '@/design-tokens';
import { layout, glass, composerLayout, withAlpha, workspaceNavAccents, sectionAccents, TRANSPARENT } from './design-center/dc-tokens';
import { GlassNav } from './design-center/components/GlassNav';
import { DeviceMirrorProvider } from './design-center/components/DeviceMirror';

// ─── Top Bar ────────────────────────────────────────────────

function TopBar({ isMobile }: { isMobile: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      style={{
        position: 'fixed',
        top: 0,
        left: isMobile ? 0 : layout.navRailWidth,
        right: 0,
        height: layout.topBarHeight,
        zIndex: 50,
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? glass.chrome.topBarScrolled : TRANSPARENT,
        backdropFilter: scrolled ? glass.chrome.navBackdrop : 'none',
        borderBottom: scrolled
          ? `1px solid ${surfaces.glass.subtle}`
          : '1px solid transparent',
        transition: 'background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Logo mark */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            background: composerLayout.logoGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: colors.brand.purple.primary,
              boxShadow: `0 0 8px ${composerLayout.brandPill.bgHover}`,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: fonts.primary,
            fontSize: 13,
            color: colors.neutral.white,
            opacity: 0.6,
            letterSpacing: '0.02em',
          }}
        >
          design center
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          to="/atoms"
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: workspaceNavAccents.atoms,
            opacity: 0.35,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s, background 0.3s',
            padding: '4px 12px',
            borderRadius: 6,
            background: withAlpha(workspaceNavAccents.atoms, 0.06),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.atoms, 0.1);
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.atoms, 0.06);
          }}
        >
          atoms
        </Link>
        <Link
          to="/surfaces"
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: workspaceNavAccents.surfaces,
            opacity: 0.35,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s, background 0.3s',
            padding: '4px 12px',
            borderRadius: 6,
            background: withAlpha(workspaceNavAccents.surfaces, 0.06),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.surfaces, 0.1);
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.surfaces, 0.06);
          }}
        >
          surfaces
        </Link>
        <Link
          to="/motion"
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: workspaceNavAccents.motion,
            opacity: 0.35,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s, background 0.3s',
            padding: '4px 12px',
            borderRadius: 6,
            background: withAlpha(workspaceNavAccents.motion, 0.06),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.motion, 0.1);
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.motion, 0.06);
          }}
        >
          motion
        </Link>
        <Link
          to="/voice"
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: workspaceNavAccents.voice,
            opacity: 0.35,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s, background 0.3s',
            padding: '4px 12px',
            borderRadius: 6,
            background: withAlpha(workspaceNavAccents.voice, 0.06),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.voice, 0.1);
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.voice, 0.06);
          }}
        >
          voice
        </Link>
        <Link
          to="/delivery"
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: workspaceNavAccents.delivery,
            opacity: 0.35,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s, background 0.3s',
            padding: '4px 12px',
            borderRadius: 6,
            background: withAlpha(workspaceNavAccents.delivery, 0.06),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.delivery, 0.1);
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.delivery, 0.06);
          }}
        >
          delivery
        </Link>
        <Link
          to="/player"
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: workspaceNavAccents.player,
            opacity: 0.35,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s, background 0.3s',
            padding: '4px 12px',
            borderRadius: 6,
            background: withAlpha(workspaceNavAccents.player, 0.06),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.player, 0.1);
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.player, 0.06);
          }}
        >
          player
        </Link>
        <Link
          to="/showcase"
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: workspaceNavAccents.showcase,
            opacity: 0.35,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s, background 0.3s',
            padding: '4px 12px',
            borderRadius: 6,
            background: withAlpha(workspaceNavAccents.showcase, 0.06),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.showcase, 0.1);
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.background = withAlpha(workspaceNavAccents.showcase, 0.06);
          }}
        >
          showcase
        </Link>
        <Link
          to="/home"
          style={{
            fontFamily: fonts.primary,
            fontSize: 12,
            color: colors.neutral.white,
            opacity: 0.25,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 0.3s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.25')}
        >
          home
        </Link>
      </div>
    </motion.header>
  );
}

// ─── Main Layout ────────────────────────────────────────────

export default function DesignCenter() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < layout.mobileBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <DeviceMirrorProvider>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: surfaces.solid.base,
          color: colors.neutral.white,
          fontFamily: fonts.primary,
          position: 'relative',
        }}
      >
        <TopBar isMobile={isMobile} />
        <GlassNav />

        {/* Content area — offset by nav rail on desktop */}
        <div
          style={{
            marginLeft: isMobile ? 0 : layout.navRailWidth,
            paddingTop: layout.topBarHeight + 16,
            paddingLeft: isMobile ? 16 : 28,
            paddingRight: isMobile ? 16 : 28,
            paddingBottom: isMobile ? layout.mobileTabHeight + 16 : 40,
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </div>
      </div>
    </DeviceMirrorProvider>
  );
}