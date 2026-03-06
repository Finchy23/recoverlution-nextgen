/**
 * SURFACES LAYOUT
 * ===============
 * Shell for the Surfaces Composition Workspace (Layer 2: Living Atmosphere).
 * Tests color signatures, visual engines, response profiles, atmosphere presets.
 * Same pattern as AtomsLayout — top bar + Outlet.
 */

import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router';
import { motion } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import { glass, layout, withAlpha, workspaceNavAccents, TRANSPARENT } from '../design-center/dc-tokens';
import { DeviceMirrorProvider } from '../design-center/components/DeviceMirror';

const ACCENT = workspaceNavAccents.surfaces;

function SurfacesTopBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinkStyle: React.CSSProperties = {
    fontFamily: fonts.primary,
    fontSize: 12,
    color: colors.neutral.white,
    opacity: 0.25,
    textDecoration: 'none',
    letterSpacing: '0.02em',
    transition: 'opacity 0.3s',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
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
      {/* Left: Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${withAlpha(ACCENT, 0.15)}, ${withAlpha(ACCENT, 0.05)})`,
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
              background: withAlpha(ACCENT, 0.5),
              boxShadow: `0 0 8px ${withAlpha(ACCENT, 0.3)}`,
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
          surfaces
        </span>
      </div>

      {/* Right: Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link
          to="/surfaces"
          style={{
            ...navLinkStyle,
            opacity: 0.4,
            color: ACCENT,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
        >
          compose
        </Link>
        <Link
          to="/atoms"
          style={{
            ...navLinkStyle,
            opacity: 0.3,
            color: workspaceNavAccents.atoms,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
        >
          atoms
        </Link>
        <Link
          to="/motion"
          style={{
            ...navLinkStyle,
            opacity: 0.3,
            color: workspaceNavAccents.motion,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
        >
          motion
        </Link>
        <Link
          to="/voice"
          style={{
            ...navLinkStyle,
            opacity: 0.3,
            color: workspaceNavAccents.voice,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
        >
          voice
        </Link>
        <Link
          to="/delivery"
          style={{
            ...navLinkStyle,
            opacity: 0.3,
            color: workspaceNavAccents.delivery,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
        >
          delivery
        </Link>
        <Link
          to="/player"
          style={{
            ...navLinkStyle,
            opacity: 0.3,
            color: workspaceNavAccents.player,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
        >
          player
        </Link>
        <Link
          to="/showcase"
          style={{
            ...navLinkStyle,
            opacity: 0.3,
            color: workspaceNavAccents.showcase,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
        >
          showcase
        </Link>
        <Link
          to="/design-center"
          style={navLinkStyle}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.25')}
        >
          design center
        </Link>
      </div>
    </motion.header>
  );
}

export default function SurfacesLayout() {
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
        <SurfacesTopBar />
        <div style={{ paddingTop: layout.topBarHeight }}>
          <Outlet />
        </div>
      </div>
    </DeviceMirrorProvider>
  );
}