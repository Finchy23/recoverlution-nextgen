/**
 * GLASS NAV
 * ═════════
 * Persistent side navigation for the Design Center.
 * Desktop: glass rail on the left edge.
 * Mobile: bottom tab bar.
 *
 * DEPENDENCIES:
 *   - dc-tokens (layout dimensions, section accents)
 *   - design-tokens (colors, fonts)
 *   - lucide-react (icons)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts } from '@/design-tokens';
import { useNavigate, useLocation } from 'react-router';
import { layout, glass, sectionAccents } from '../dc-tokens';
import {
  Palette,
  Type,
  Layers,
  Wind,
  ShieldCheck,
  LayoutDashboard,
  Atom,
} from 'lucide-react';

// ─── Section Definitions ────────────────────────────────────

export interface NavSection {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  accent: string;
}

export const NAV_SECTIONS: NavSection[] = [
  { id: 'overview',    label: 'overview',    path: '/design-center',             icon: LayoutDashboard, accent: sectionAccents.overview },
  { id: 'palette',     label: 'palette',     path: '/design-center/palette',     icon: Palette,         accent: sectionAccents.palette },
  { id: 'type',        label: 'typography',  path: '/design-center/type',        icon: Type,            accent: sectionAccents.type },
  { id: 'glass',       label: 'surfaces',    path: '/design-center/glass',       icon: Layers,          accent: sectionAccents.glass },
  { id: 'motion',      label: 'motion',      path: '/design-center/motion',      icon: Wind,            accent: sectionAccents.motion },
  { id: 'gates',       label: 'gates',       path: '/design-center/gates',       icon: ShieldCheck,     accent: sectionAccents.gates },
  { id: 'atoms',       label: 'atoms',       path: '/atoms',                     icon: Atom,            accent: sectionAccents.atoms },
];

// ─── Active section resolver ────────────────────────────────

function resolveActiveSection(pathname: string): string {
  const section = NAV_SECTIONS.find(s => {
    if (s.path === '/design-center') return pathname === '/design-center' || pathname === '/';
    return pathname.startsWith(s.path);
  });
  return section?.id ?? 'overview';
}

// ─── Desktop Nav ────────────────────────────────────────────

function DesktopNav({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeSection = resolveActiveSection(currentPath);

  return (
    <motion.nav
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: layout.navRailWidth,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '80px 0',
        background: glass.chrome.navBackground,
        backdropFilter: glass.chrome.navBackdrop,
        borderRight: `1px solid rgba(255, 255, 255, 0.03)`,
      }}
    >
      {NAV_SECTIONS.map(section => {
        const isActive = section.id === activeSection;
        const isHovered = section.id === hoveredId;
        const Icon = section.icon;

        return (
          <motion.button
            key={section.id}
            onClick={() => navigate(section.path)}
            onMouseEnter={() => setHoveredId(section.id)}
            onMouseLeave={() => setHoveredId(null)}
            whileTap={{ scale: 0.92 }}
            style={{
              position: 'relative',
              width: 44,
              height: 44,
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `rgba(249, 248, 255, ${isActive ? 0.8 : isHovered ? 0.5 : 0.3})`,
              background: isActive
                ? glass.bg('light')
                : isHovered
                ? glass.bg('subtle')
                : 'rgba(0,0,0,0)',
              transition: 'background 0.3s ease, color 0.3s ease',
            }}
          >
            {/* Active indicator bar */}
            {isActive && (
              <motion.div
                layoutId="nav-active"
                style={{
                  position: 'absolute',
                  left: -1,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 2,
                  height: 20,
                  borderRadius: 1,
                  background: section.accent,
                  boxShadow: `0 0 8px ${section.accent}`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    left: layout.navRailWidth - 12,
                    whiteSpace: 'nowrap',
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(15, 13, 26, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${glass.border}`,
                    fontFamily: fonts.primary,
                    fontSize: 11,
                    color: colors.neutral.white,
                    opacity: 0.7,
                    letterSpacing: '0.02em',
                    pointerEvents: 'none',
                  }}
                >
                  {section.label}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

// ─── Mobile Nav ─────────────────────────────────────────────

function MobileNav({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();
  const activeSection = resolveActiveSection(currentPath);

  /** Show a curated subset on mobile — room for all icons */
  const mobileItems = [
    NAV_SECTIONS[0], // overview
    NAV_SECTIONS[1], // palette
    NAV_SECTIONS[4], // motion
    NAV_SECTIONS[5], // gates
    NAV_SECTIONS[6], // atoms
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: layout.mobileTabHeight,
        padding: '0 8px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: glass.chrome.mobileNav,
        backdropFilter: glass.chrome.navBackdrop,
        borderTop: `1px solid rgba(255, 255, 255, 0.04)`,
      }}
    >
      {mobileItems.map(section => {
        const isActive = section.id === activeSection;
        const Icon = section.icon;
        return (
          <button
            key={section.id}
            onClick={() => navigate(section.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 12px',
              color: isActive ? section.accent : 'rgba(249, 248, 255, 0.3)',
              transition: 'color 0.3s',
            }}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 8,
                letterSpacing: '0.06em',
                opacity: isActive ? 0.8 : 0.4,
              }}
            >
              {section.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
}

// ─── Main Export ─────────────────────────────────────────────

export function GlassNav() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < layout.mobileBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return <MobileNav currentPath={location.pathname} />;
  return <DesktopNav currentPath={location.pathname} />;
}