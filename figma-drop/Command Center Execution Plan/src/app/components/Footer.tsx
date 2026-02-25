import { colors, surfaces, spacing, typography, mobile } from '@/design-tokens';
import { useState, useEffect } from 'react';

export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobile.breakpoints.mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <footer
      className={className}
      style={{
        backgroundColor: surfaces.solid.base,
        borderTop: `1px solid ${colors.neutral.gray[800]}40`,
        padding: isMobile 
          ? `${spacing.md} ${spacing.lg}` 
          : `${spacing.lg} ${spacing.xl}`,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? spacing.sm : spacing.md,
        }}
      >
        {/* Left: Legal Links */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: spacing.md,
            alignItems: 'center',
          }}
        >
          <a
            href="#privacy"
            style={{
              fontSize: '13px',
              color: colors.neutral.gray[500],
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.neutral.gray[300];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.neutral.gray[500];
            }}
          >
            Privacy
          </a>
          <a
            href="#terms"
            style={{
              fontSize: '13px',
              color: colors.neutral.gray[500],
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.neutral.gray[300];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.neutral.gray[500];
            }}
          >
            Terms
          </a>
          <a
            href="#cookies"
            style={{
              fontSize: '13px',
              color: colors.neutral.gray[500],
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.neutral.gray[300];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.neutral.gray[500];
            }}
          >
            Cookies
          </a>
        </div>

        {/* Right: Copyright */}
        <div
          style={{
            fontSize: '13px',
            color: colors.neutral.gray[500],
            textAlign: isMobile ? 'center' : 'right',
          }}
        >
          © 2025 Recoverlution
        </div>
      </div>
    </footer>
  );
}