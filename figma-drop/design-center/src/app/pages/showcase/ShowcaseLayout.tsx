/**
 * SHOWCASE LAYOUT
 * ================
 *
 * Shell for the Showcase workspace — the full ecosystem gallery
 * that renders every atom through the 7-layer composition stack.
 *
 * ROUTE: /showcase
 */

import { Outlet, Link } from 'react-router';
import { colors, fonts, surfaces, withAlpha } from '@/design-tokens';
import { workspaceNavAccents } from '../design-center/dc-tokens';

const ACCENT = workspaceNavAccents.showcase;

function ShowcaseTopBar() {
  const navLinks = [
    { to: '/atoms', label: 'atoms', color: workspaceNavAccents.atoms },
    { to: '/surfaces', label: 'surfaces', color: workspaceNavAccents.surfaces },
    { to: '/motion', label: 'motion', color: workspaceNavAccents.motion },
    { to: '/voice', label: 'voice', color: workspaceNavAccents.voice },
    { to: '/delivery', label: 'delivery', color: workspaceNavAccents.delivery },
    { to: '/player', label: 'player', color: workspaceNavAccents.player },
  ];

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: `1px solid ${withAlpha(colors.neutral.white, 0.04)}`,
        background: withAlpha(surfaces.solid.base, 0.9),
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: ACCENT,
            opacity: 0.6,
          }}
        />
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: ACCENT,
            opacity: 0.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
          }}
        >
          showcase
        </span>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 7,
            color: colors.neutral.white,
            opacity: 0.12,
            letterSpacing: '0.08em',
          }}
        >
          200 ATOMS × 7 LAYERS
        </span>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: link.color,
              opacity: 0.3,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              padding: '4px 8px',
              borderRadius: 4,
              background: withAlpha(link.color, 0.04),
              transition: 'opacity 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.background = withAlpha(link.color, 0.08);
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '0.3';
              e.currentTarget.style.background = withAlpha(link.color, 0.04);
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ShowcaseLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: surfaces.solid.base,
        color: colors.neutral.white,
      }}
    >
      <ShowcaseTopBar />
      <Outlet />
    </div>
  );
}