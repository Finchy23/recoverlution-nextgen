import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { colors, surfaces, spacing, radius, typography, mobile, glassNav } from '@/design-tokens';
import { navigation } from '@/content-tokens';

export interface NavLink {
  href: string;
  label: string;
}

export interface NavigationProps {
  logoUrl?: string;
  logoText?: string;
  links?: NavLink[];
  className?: string;
}

export function Navigation({
  logoUrl = navigation.logoUrl,
  logoText = navigation.logoText,
  links = navigation.links,
  className = '',
}: NavigationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobile.breakpoints.mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) setIsDropdownOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <nav
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: 'clamp(12px, 3vw, 20px) clamp(20px, 5vw, 48px)', // Single level of padding
        backgroundColor: isScrolled 
          ? glassNav.background.default
          : 'transparent',
        backdropFilter: isScrolled ? glassNav.backdropFilter : 'none',
        WebkitBackdropFilter: isScrolled ? glassNav.backdropFilter : 'none',
        borderBottom: isScrolled 
          ? `1px solid ${glassNav.border.scrolled}` 
          : '1px solid transparent',
        transition: glassNav.transition,
      }}
    >
      <div
        style={{
          maxWidth: '1400px', // Wider max-width
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            textDecoration: 'none',
            color: colors.neutral.white,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={logoText}
              style={{
                height: isMobile ? '24px' : '28px',
                width: 'auto',
              }}
            />
          ) : (
            <div
              style={{
                ...typography.heading.h6,
                fontWeight: '600',
                letterSpacing: '-0.01em',
                color: colors.neutral.white,
              }}
            >
              {logoText}
            </div>
          )}
        </a>

        {/* Desktop: Start Dropdown */}
        {!isMobile && (
          <div style={{ position: 'relative' }}>
            {/* Start Button as Dropdown */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                padding: '0',
                backgroundColor: 'transparent',
                color: colors.accent.cyan.primary,
                border: 'none',
                ...typography.body.small,
                fontSize: 'clamp(10px, 2vw, 12px)',
                fontWeight: '600',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                opacity: 0.9,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
            >
              Start
              <ChevronDown 
                size={14} 
                style={{
                  transition: 'transform 0.2s ease',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: spacing.xs,
                    minWidth: '200px',
                    backgroundColor: surfaces.glass.strong,
                    backdropFilter: 'blur(24px) saturate(180%)',
                    borderRadius: radius.md,
                    border: `1px solid ${colors.neutral.gray[800]}60`,
                    padding: spacing.sm,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.xs,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: radius.sm,
                        color: colors.neutral.gray[300],
                        ...typography.body.small,
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.neutral.white;
                        e.currentTarget.style.backgroundColor = `${colors.neutral.gray[800]}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.neutral.gray[300];
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile: Same as Desktop Dropdown */}
        {isMobile && (
          <div style={{ position: 'relative' }}>
            {/* Start Button as Dropdown */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                padding: '0',
                backgroundColor: 'transparent',
                color: colors.accent.cyan.primary,
                border: 'none',
                ...typography.body.small,
                fontSize: 'clamp(10px, 2vw, 12px)',
                fontWeight: '600',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                opacity: 0.9,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
            >
              Start
              <ChevronDown 
                size={14} 
                style={{
                  transition: 'transform 0.2s ease',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: spacing.xs,
                    minWidth: '200px',
                    backgroundColor: surfaces.glass.strong,
                    backdropFilter: 'blur(24px) saturate(180%)',
                    borderRadius: radius.md,
                    border: `1px solid ${colors.neutral.gray[800]}60`,
                    padding: spacing.sm,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.xs,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: radius.sm,
                        color: colors.neutral.gray[300],
                        ...typography.body.small,
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.neutral.white;
                        e.currentTarget.style.backgroundColor = `${colors.neutral.gray[800]}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.neutral.gray[300];
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
}