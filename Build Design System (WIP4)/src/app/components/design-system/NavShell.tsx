import { NavLink, Outlet, useLocation } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BreathingOrb } from './BreathingOrb';
import { LivingAtmosphere } from './LivingAtmosphere';
import { GlobalSurfaceAtmosphereRuntime } from '../runtime/GlobalSurfaceAtmosphereRuntime';
import { colors, surfaces } from './tokens';
import { room, font, tracking, typeSize, weight, opacity, timing, glow, glaze, refract, layer, glass } from './surface-tokens';
import { TemperatureProvider, useTemperature } from './TemperatureGovernor';
import { useHardwareSymbiosis } from './HardwareSymbiosis';
import logoSvg from '../../../imports/2.svg';

/**
 * NAV SHELL
 *
 * The permanent operating frame of the system.
 * Structured as an ecosystem: Philosophy → System → Language → Experience.
 * The orb is the constant. The sections are the territory.
 *
 * Now wraps the entire app in a global TemperatureProvider
 * with Hardware Symbiosis feeding the hardware floor.
 */

// ─── Route sections ───

interface NavRoom {
  to: string;
  label: string;
  key: string;
  color: string;
  subtitle: string;
}

interface NavSection {
  label: string;
  rooms: NavRoom[];
}

const sections: NavSection[] = [
  {
    label: 'Philosophy',
    rooms: [
      { to: '/', label: 'Sanctuary', key: 'sanctuary', color: colors.brand.purple.primary, subtitle: 'the landing' },
      { to: '/doctrine', label: 'Doctrine', key: 'doctrine', color: colors.brand.purple.light, subtitle: 'the universal laws' },
    ],
  },
  {
    label: 'System',
    rooms: [
      { to: '/governors', label: 'Governors', key: 'governors', color: colors.brand.purple.mid, subtitle: 'the five runtime layers' },
      { to: '/compatibility', label: 'Compatibility', key: 'compatibility', color: colors.accent.cyan.primary, subtitle: 'the matrix' },
    ],
  },
  {
    label: 'Language',
    rooms: [
      { to: '/tokens', label: 'Tokens', key: 'tokens', color: colors.brand.purple.light, subtitle: 'the visual primitives' },
      { to: '/surfaces', label: 'Surfaces', key: 'surfaces', color: colors.accent.cyan.primary, subtitle: 'the universal player' },
      { to: '/typography', label: 'Typography', key: 'typography', color: colors.brand.purple.mid, subtitle: 'the calm line' },
      { to: '/copy', label: 'Copy', key: 'copy', color: colors.brand.purple.mid, subtitle: 'text cut into glass' },
      { to: '/motion', label: 'Motion', key: 'motion', color: colors.accent.cyan.primary, subtitle: 'the breath of the system' },
    ],
  },
  {
    label: 'Experience',
    rooms: [
      { to: '/base', label: 'Canvas', key: 'base', color: colors.accent.cyan.primary, subtitle: 'the living surface' },
      { to: '/components', label: 'Components', key: 'components', color: colors.brand.purple.primary, subtitle: 'the instruments' },
      { to: '/atoms', label: 'Atoms', key: 'atoms', color: colors.accent.green.primary, subtitle: 'the seed pack' },
      { to: '/rooms', label: 'Rooms', key: 'rooms', color: colors.accent.green.primary, subtitle: 'the modalities' },
      { to: '/voice', label: 'Voice', key: 'voice', color: colors.brand.purple.mid, subtitle: 'how we speak' },
      { to: '/cues', label: 'Cues', key: 'cues', color: colors.accent.cyan.primary, subtitle: 'the rhythmic scale' },
      { to: '/form', label: 'Hone', key: 'form', color: colors.accent.green.primary, subtitle: 'the practice surface' },
    ],
  },
];

const allRooms = sections.flatMap(s => s.rooms);

function getCurrentRoom(pathname: string) {
  if (pathname === '/') return allRooms[0];
  return allRooms.find(r => r.to !== '/' && pathname.startsWith(r.to)) || allRooms[0];
}

function getCurrentSection(pathname: string): NavSection {
  for (const section of sections) {
    for (const room of section.rooms) {
      if (room.to === '/' && pathname === '/') return section;
      if (room.to !== '/' && pathname.startsWith(room.to)) return section;
    }
  }
  return sections[0];
}

// ─── Hardware-aware wrapper ───

function HardwareAwareShell({ children }: { children: React.ReactNode }) {
  const { hardwareConstraints } = useHardwareSymbiosis();
  const { setHardwareFloor } = useTemperature();

  // Push hardware floor into the global temperature provider
  useEffect(() => {
    setHardwareFloor(hardwareConstraints.minBandFloor);
  }, [hardwareConstraints.minBandFloor, setHardwareFloor]);

  return <>{children}</>;
}

// ─── Inner Shell (consumes TemperatureContext) ───

function NavShellInner() {
  const location = useLocation();
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const currentRoom = useMemo(() => getCurrentRoom(location.pathname), [location.pathname]);
  const currentSection = useMemo(() => getCurrentSection(location.pathname), [location.pathname]);
  const isSanctuary = location.pathname === '/';
  const isSurface = location.pathname === '/base' || location.pathname === '/copy' || location.pathname === '/surfaces';

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setScrollY(y);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight || 1 : 1;
  const sanctuaryNavOpacity = isSanctuary ? Math.max(0.06, 1 - scrollY / (viewportHeight * 0.6)) : 1;
  const navOpacity = isSurface ? 0.4 : sanctuaryNavOpacity;

  useEffect(() => { setThresholdOpen(false); }, [location.pathname]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = thresholdOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [thresholdOpen]);

  return (
    <div className="min-h-screen" style={{ background: room.base }}>
      <GlobalSurfaceAtmosphereRuntime />

      {/* Living Atmosphere */}
      {!isSanctuary && !isSurface && <LivingAtmosphere room={currentRoom.key} />}

      {/* Top Bar */}
      <nav
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-5 sm:px-8 transition-all duration-700"
        style={{
          zIndex: layer.nav,
          height: '56px',
          background: isSanctuary
            ? 'transparent'
            : scrolled ? glass(room.base, 0.7) : 'transparent',
          backdropFilter: isSanctuary
            ? 'none'
            : scrolled ? refract.nav : 'none',
          WebkitBackdropFilter: isSanctuary
            ? 'none'
            : scrolled ? refract.nav : 'none',
          /* Death of the Box: replaced 1px solid border with a gradient edge */
          opacity: navOpacity,
          pointerEvents: navOpacity < 0.15 ? 'none' : 'auto',
          transition: isSanctuary
            ? timing.t.fade
            : 'background 0.7s, backdrop-filter 0.7s',
        }}
      >
        {/* Bottom edge — refractive gradient instead of 1px solid border */}
        {!isSanctuary && scrolled && (
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent 5%, ${glaze.veil} 30%, ${glaze.frost} 50%, ${glaze.veil} 70%, transparent 95%)`,
            }}
          />
        )}

        {/* Orb + Wordmark */}
        <button
          onClick={() => setThresholdOpen(true)}
          className="flex items-center gap-3 group"
          aria-label="Open navigation"
        >
          <BreathingOrb size={20} color={currentRoom.color} />
          <span
            className="opacity-50 group-hover:opacity-80 transition-opacity duration-500"
            style={{
              fontFamily: font.sans,
              fontSize: typeSize.caption,
              fontWeight: weight.semibold,
              letterSpacing: tracking.spread,
              textTransform: 'uppercase' as const,
              color: colors.neutral.white,
            }}
          >
            Recoverlution
          </span>
        </button>

        {/* Section + Room */}
        {!isSanctuary && (
          <div className="flex items-center gap-3">
            <motion.span
              key={currentSection.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: opacity.present }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: typeSize.detail,
                fontWeight: weight.medium,
                letterSpacing: tracking.label,
                textTransform: 'uppercase' as const,
                color: colors.neutral.gray[500],
              }}
            >
              {currentSection.label}
            </motion.span>
            <span style={{ fontSize: typeSize.detail, color: glaze.glint }}>/</span>
            <motion.span
              key={currentRoom.label}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: opacity.voice, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: typeSize.caption,
                fontWeight: weight.medium,
                letterSpacing: tracking.tight,
                textTransform: 'uppercase' as const,
                color: currentRoom.color,
              }}
            >
              {currentRoom.label}
            </motion.span>
          </div>
        )}
      </nav>

      {/* Glass Etch — the mark is in the glass, not on it */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: 72,
          left: 20,
          width: 26,
          height: 26,
          zIndex: layer.base,
          opacity: 0.04,
          mixBlendMode: 'soft-light' as const,
          filter: 'blur(0.3px)',
          transition: 'opacity 1.2s ease-out',
        }}
      >
        <img
          src={logoSvg}
          alt=""
          className="w-full h-full"
          style={{ display: 'block' }}
          draggable={false}
        />
      </div>

      {/* Threshold Overlay */}
      <AnimatePresence>
        {thresholdOpen && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: layer.navOverlay }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 80% 70% at 50% 38%, ${colors.brand.purple.deep}50 0%, ${room.base} 85%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            />

            {/* Close area */}
            <button
              className="absolute inset-0 cursor-default"
              onClick={() => setThresholdOpen(false)}
              aria-label="Close navigation"
            />

            {/* Orb */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <BreathingOrb size={32} color={colors.brand.purple.primary} />
            </motion.div>

            {/* Structured Navigation */}
            <div className="relative w-full max-w-xs px-6 overflow-y-auto" style={{ maxHeight: '65vh' }}>
              {sections.map((section, si) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.1 + si * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={si > 0 ? 'mt-5' : ''}
                >
                  {/* Section Header */}
                  <span
                    className="block px-7 mb-1"
                    style={{
                      fontSize: typeSize.label,
                      fontWeight: weight.semibold,
                      letterSpacing: tracking.shelf,
                      textTransform: 'uppercase' as const,
                      color: colors.neutral.gray[700],
                    }}
                  >
                    {section.label}
                  </span>

                  {/* Section divider */}
                  <div
                    className="mx-7 mb-1.5"
                    style={{
                      height: 1,
                      background: glaze.thin,
                    }}
                  />

                  {/* Rooms */}
                  {section.rooms.map((room, ri) => (
                    <motion.div
                      key={room.to}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.15 + si * 0.06 + ri * 0.03,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <NavLink
                        to={room.to}
                        end={room.to === '/'}
                        className="group relative flex items-center gap-3 px-7 py-2 rounded-xl transition-all duration-400"
                        style={({ isActive }) => ({
                          background: isActive ? `${room.color}08` : 'transparent',
                        })}
                      >
                        {({ isActive }) => (
                          <>
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: room.color,
                                boxShadow: isActive ? glow.mid(room.color, '50') : 'none',
                                opacity: isActive ? 1 : 0.25,
                              }}
                              whileHover={{ opacity: opacity.clear, scale: 1.3 }}
                              transition={{ duration: 0.3 }}
                            />
                            <span
                              className="transition-all duration-400"
                              style={{
                                fontFamily: font.serif,
                                fontSize: 'clamp(18px, 4.5vw, 26px)',
                                fontWeight: isActive ? weight.medium : weight.regular,
                                color: isActive ? colors.neutral.white : colors.neutral.gray[600],
                                letterSpacing: '-0.01em',
                              }}
                            >
                              {room.label}
                            </span>
                            {room.subtitle && (
                              <span
                                className="hidden sm:inline"
                                style={{
                                  fontFamily: font.serif,
                                  fontSize: 'clamp(10px, 2.5vw, 13px)',
                                  fontStyle: 'italic',
                                  fontWeight: weight.regular,
                                  color: colors.neutral.gray[700],
                                  opacity: isActive ? 0.5 : 0.2,
                                }}
                              >
                                {room.subtitle}
                              </span>
                            )}
                            {/* Death of the Box: replaced 1px solid border with refractive glow */}
                            {isActive && (
                              <motion.div
                                layoutId="room-active"
                                className="absolute inset-0 rounded-xl pointer-events-none"
                                style={{
                                  background: `radial-gradient(ellipse 90% 80% at 50% 50%, ${room.color}08 0%, transparent 70%)`,
                                  boxShadow: glow.inset(room.color, 12, '06'),
                                }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Close hint */}
            <motion.span
              className="relative mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: opacity.quiet }}
              transition={{ delay: 0.9 }}
              style={{
                fontSize: typeSize.detail,
                letterSpacing: tracking.tight,
                textTransform: 'uppercase' as const,
                color: colors.neutral.gray[600],
              }}
            >
              tap to close
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="relative" style={{ zIndex: layer.base }}>
        <Outlet />
      </main>
    </div>
  );
}

// ─── Public export: wraps inner shell with global providers ───

export function NavShell() {
  return (
    <TemperatureProvider initialBand={0}>
      <HardwareAwareShell>
        <NavShellInner />
      </HardwareAwareShell>
    </TemperatureProvider>
  );
}
