/**
 * OVERVIEW — THE RIVER
 * ════════════════════
 * The cinematic scroll. The keynote.
 * Shows the essence of each design domain in a flowing,
 * experiential sequence. Each card links to its lab.
 *
 * DEPENDENCIES:
 *   - useBreathEngine (shared hook)
 *   - Particles (shared component)
 *   - dc-tokens (device frame, signature palettes, section accents, specimen copy)
 *   - design-tokens (colors, fonts, surfaces)
 *   - motion/react (scroll, spring, animations)
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import { useNavigate } from 'react-router';
import {
  deviceFrame,
  SIGNATURE_PALETTES,
  SPECIMEN_COPY,
  sectionAccents,
  layout,
} from './dc-tokens';
import { useBreathEngine } from './hooks/useBreathEngine';
import { Particles } from './components/Particles';
import { parseColor, rgba, px, GLOW, PARTICLE_SIZE } from '@/universal-canvas';

// ─── Specimen cycle for device hero ─────────────────────────

const HERO_SPECIMENS = SPECIMEN_COPY.slice(0, 4).map((spec, i) => ({
  ...spec,
  palette: SIGNATURE_PALETTES.find(p => p.id === spec.signatureId) ?? SIGNATURE_PALETTES[i],
}));

// ─── Hero Device ────────────────────────────────────────────

function HeroDevice() {
  const { amplitude, phase } = useBreathEngine('calm');
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [followVisible, setFollowVisible] = useState(false);
  const specimen = HERO_SPECIMENS[current];
  const { hero, heroIsland } = deviceFrame;
  const heroMinDim = Math.min(hero.width, hero.height);
  const accentRgb = parseColor(specimen.palette.accent);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextVisible(false);
      setFollowVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % HERO_SPECIMENS.length);
        setTimeout(() => setTextVisible(true), 600);
        setTimeout(() => setFollowVisible(true), 1800);
      }, 800);
    }, 9000);
    setTimeout(() => setTextVisible(true), 1200);
    setTimeout(() => setFollowVisible(true), 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '80px 24px',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500 + amplitude * 80,
          height: 500 + amplitude * 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${specimen.palette.glow} 0%, transparent 65%)`,
          transition: 'all 2s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Device */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{
          position: 'relative',
          width: hero.width,
          height: hero.height,
          borderRadius: hero.borderRadius,
          overflow: 'hidden',
          boxShadow: `
            0 0 ${px(0.121 + amplitude * 0.062, heroMinDim)}px ${rgba(accentRgb, 0.07 + amplitude * 0.05)},
            0 0 ${px(0.241 + amplitude * 0.121, heroMinDim)}px ${rgba(accentRgb, 0.03 + amplitude * 0.02)},
            0 ${px(0.121, heroMinDim)}px ${px(0.241, heroMinDim)}px rgba(0, 0, 0, 0.45)
          `,
        }}
      >
        {/* Bezel */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: hero.borderRadius, border: `1px solid ${surfaces.glass.border}`, pointerEvents: 'none', zIndex: 10 }} />
        {/* Dynamic Island */}
        <div style={{ position: 'absolute', top: heroIsland.top, left: '50%', transform: 'translateX(-50%)', width: heroIsland.width, height: heroIsland.height, borderRadius: heroIsland.borderRadius, background: colors.neutral.black, zIndex: 10 }} />
        {/* Screen */}
        <div style={{ position: 'absolute', inset: 0, background: surfaces.solid.base }}>
          <Particles count={16} color={specimen.palette.accent} viewport={{ width: hero.width, height: hero.height }} />

          {/* Glow orb — minDim-relative */}
          <div style={{
            position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%, -50%)',
            width: px(GLOW.sm + amplitude * 0.12, heroMinDim),
            height: px(GLOW.sm + amplitude * 0.12, heroMinDim),
            borderRadius: '50%',
            background: `radial-gradient(circle, ${specimen.palette.accent} 0%, transparent 70%)`,
            opacity: 0.35 + amplitude * 0.3,
            transition: 'width 1.5s ease, height 1.5s ease, opacity 1.5s ease',
          }} />

          {/* Content */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 24px', zIndex: 5 }}>
            <motion.div
              animate={{ opacity: textVisible ? 1 : 0, y: textVisible ? 0 : 10 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: fonts.secondary, fontSize: 20, color: colors.neutral.white, textAlign: 'center', lineHeight: 1.4, letterSpacing: '-0.01em', maxWidth: 220 }}
            >
              {specimen.copy}
            </motion.div>
            <motion.div
              animate={{ opacity: followVisible ? 0.5 : 0, y: followVisible ? 0 : 6 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: fonts.primary, fontSize: 12, color: colors.neutral.white, textAlign: 'center', marginTop: 16 }}
            >
              {specimen.follow}
            </motion.div>

            {/* Breath pulse — minDim-relative */}
            <div style={{ position: 'absolute', bottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <motion.div
                animate={{ scale: 0.7 + amplitude * 0.5, opacity: 0.2 + amplitude * 0.4 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  width: px(PARTICLE_SIZE.xl * 5.4, heroMinDim),
                  height: px(PARTICLE_SIZE.xl * 5.4, heroMinDim),
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${specimen.palette.accent}, transparent)`,
                }}
              />
              <span style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.2, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>{phase}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sub-device tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
        style={{ marginTop: 48, textAlign: 'center', maxWidth: 400 }}
      >
        <div style={{ fontFamily: fonts.secondary, fontSize: 'clamp(20px, 3vw, 28px)', color: colors.neutral.white, opacity: 0.8, lineHeight: 1.35, letterSpacing: '-0.015em' }}>
          A living layer that meets the moment
        </div>
        <div style={{ fontFamily: fonts.primary, fontSize: 13, color: colors.neutral.white, opacity: 0.25, marginTop: 14, letterSpacing: '0.03em' }}>
          neuroadaptive precision -- in the moment cognitive transformation
        </div>
      </motion.div>
    </section>
  );
}

// ─── River Card ─────────────────────────────────────────────

interface RiverCardProps {
  eyebrow: string;
  headline: string;
  accent: string;
  path: string;
  index: number;
  children?: React.ReactNode;
}

function RiverCard({ eyebrow, headline, accent, path, index, children }: RiverCardProps) {
  const navigate = useNavigate();
  const accentRgb = parseColor(accent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      onClick={() => navigate(path)}
      whileHover={{ scale: 1.01 }}
      style={{
        position: 'relative',
        padding: '56px 32px',
        borderRadius: 20,
        background: surfaces.glass.subtle,
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        overflow: 'hidden',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Glass edge */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, border: `1px solid rgba(255, 255, 255, 0.04)`, pointerEvents: 'none' }} />

      {/* Accent glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(accentRgb, 0.13)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {children}

      <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: colors.neutral.white, opacity: 0.2, marginBottom: 8 }}>
        {eyebrow}
      </div>
      <div style={{ fontFamily: fonts.secondary, fontSize: 'clamp(18px, 2.5vw, 24px)', color: colors.neutral.white, opacity: 0.65, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        {headline}
      </div>
    </motion.div>
  );
}

// ─── Signature Orbs ─────────────────────────────────────────

function SignatureOrbs() {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      {SIGNATURE_PALETTES.map((sig, i) => {
        const sigRgb = parseColor(sig.primary);
        return (
          <motion.div
            key={sig.id}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: sig.primary,
              boxShadow: `0 0 8px ${rgba(sigRgb, 0.27)}`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Scroll Progress ────────────────────────────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: layout.navRailWidth,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${colors.brand.purple.primary}, ${colors.accent.cyan.primary})`,
        transformOrigin: '0%',
        scaleX,
        zIndex: 55,
        opacity: 0.5,
      }}
    />
  );
}

// ─── Main Export ─────────────────────────────────────────────

export default function Overview() {
  return (
    <>
      <ScrollProgress />
      <HeroDevice />

      <div
        style={{
          padding: '0 clamp(20px, 4vw, 48px) 120px',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          <RiverCard eyebrow="palette" headline="8 magic signatures. Atmosphere as color." accent={sectionAccents.palette} path="/design-center/palette" index={0}>
            <SignatureOrbs />
          </RiverCard>

          <RiverCard eyebrow="typography" headline="Voice shapes the word. Timing shapes the meaning." accent={sectionAccents.type} path="/design-center/type" index={1} />

          <RiverCard eyebrow="surfaces" headline="Glass breathes. Frost responds. Depth layers." accent={sectionAccents.glass} path="/design-center/glass" index={2} />

          <RiverCard eyebrow="motion & breath" headline="The pulse everything syncs to." accent={sectionAccents.motion} path="/design-center/motion" index={3} />

          <RiverCard eyebrow="atmosphere" headline="Particles, glow, the living sky." accent={sectionAccents.atmosphere} path="/design-center/atmosphere" index={4} />

          <RiverCard eyebrow="voice & tone" headline="Each archetype speaks through glass." accent={sectionAccents.voice} path="/design-center/voice" index={5} />

          <RiverCard eyebrow="anatomy" headline="Every moment is a stack of living layers." accent={sectionAccents.anatomy} path="/design-center/anatomy" index={6} />

          <RiverCard eyebrow="gestures" headline="Receipts are reps. Not cures." accent={sectionAccents.interaction} path="/design-center/interaction" index={7} />

          <RiverCard eyebrow="gates" headline="Four thresholds. Twelve checks. Zero drift." accent={sectionAccents.gates} path="/design-center/gates" index={8} />
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          style={{ textAlign: 'center', marginTop: 120 }}
        >
          <div style={{ fontFamily: fonts.secondary, fontSize: 'clamp(20px, 3vw, 32px)', color: colors.neutral.white, opacity: 0.4, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            infinite / exponential / sentient
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginTop: 16 }}>
            recoverlution design system
          </div>
        </motion.div>
      </div>
    </>
  );
}