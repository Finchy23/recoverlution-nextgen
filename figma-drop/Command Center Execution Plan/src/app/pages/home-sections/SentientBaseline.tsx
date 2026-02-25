import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, surfaces, typography, radius, spacing } from '@/design-tokens';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { buildAssetUrl, assetOpacity, frostedGlass, reelOverlay } from '@/marketing-tokens';

interface SentientBaselineProps {
  mounted: boolean;
}

interface Principle {
  id: number;
  icon: typeof Shield;
  title: string;
  statement: string;
  supporting: string;
  proof: string;
  color: string;
  assetFamily: 'mindblock' | 'neuralflow' | 'flowstate';
  assetVariant: string;
  assetMode: 'light' | 'dark';
}

const principles: Principle[] = [
  {
    id: 0,
    icon: Shield,
    title: 'Autonomy',
    statement: 'Control stays with the person',
    supporting: 'Trust requires agency. Always.',
    proof: 'Trust is designed.',
    color: colors.status.amber.bright,
    assetFamily: 'mindblock',
    assetVariant: 'integration',
    assetMode: 'light',
  },
  {
    id: 1,
    icon: Lock,
    title: 'Infrastructure',
    statement: 'Consent. Cadence. Protocol.',
    supporting: 'Quietly holding the gaps.',
    proof: 'Proof is default.',
    color: colors.accent.cyan.primary,
    assetFamily: 'neuralflow',
    assetVariant: 'flourish',
    assetMode: 'light',
  },
  {
    id: 2,
    icon: CheckCircle2,
    title: 'Continuity',
    statement: 'A baseline you can stand behind',
    supporting: 'Because showing up builds certainty.',
    proof: 'Sentient by design.',
    color: colors.status.green.bright,
    assetFamily: 'flowstate',
    assetVariant: 'blossoming',
    assetMode: 'light',
  },
];

export function SentientBaseline({ mounted }: SentientBaselineProps) {
  const [activePrinciple, setActivePrinciple] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-cycle through principles
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setActivePrinciple((prev) => (prev + 1) % principles.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [mounted]);

  const currentPrinciple = principles[activePrinciple];

  return (
    <section 
      className="relative w-full"
      style={{
        position: 'relative', // Required for scroll offset calculations with whileInView
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? `${spacing.xl} 0` : `${spacing['3xl']} 0`,
      }}
    >
      {/* Background Assets with Crossfade - FULL WIDTH at section level */}
      <div className="absolute inset-0">
        {principles.map((principle, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: activePrinciple === i ? 1 : 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <img 
              src={buildAssetUrl(principle.assetFamily, principle.assetVariant, principle.assetMode)} 
              alt="" 
              className="w-full h-full object-cover"
              style={{
                opacity: assetOpacity.section,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Reel Overlay - Magic Layer for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: reelOverlay.background,
        }}
      />

      {/* Main Container - Content floats on top */}
      <div 
        className="relative w-full h-full z-10"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div 
          className="w-full max-w-5xl mx-auto"
          style={{
            minHeight: isMobile ? '500px' : '600px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? `0 ${spacing.md}` : `0 ${spacing.xl}`,
            background: frostedGlass.ultraLight.background,
            backdropFilter: frostedGlass.ultraLight.backdropFilter,
            WebkitBackdropFilter: frostedGlass.ultraLight.backdropFilter,
          }}
        >
          {/* Three Principles - Cards */}
          <div 
            className="grid w-full gap-4 mb-12"
            style={{
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              maxWidth: isMobile ? '100%' : '1100px',
            }}
          >
            {principles.map((principle, idx) => {
              const Icon = principle.icon;
              const isActive = activePrinciple === idx;

              return (
                <motion.button
                  key={principle.id}
                  onClick={() => setActivePrinciple(idx)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isActive ? (isMobile ? 1 : 1.02) : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: idx * 0.1,
                  }}
                  whileHover={{ scale: isActive ? (isMobile ? 1 : 1.02) : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                  style={{
                    padding: isMobile ? spacing.section.content.tight.mobile : spacing.section.content.tight.desktop,
                    borderRadius: isMobile ? radius.lg : radius.xl,
                    border: `2px solid ${isActive ? principle.color : `${principle.color}30`}`,
                    background: isActive 
                      ? frostedGlass.card.background
                      : `${colors.neutral.gray[900]}50`,
                    backdropFilter: isActive ? frostedGlass.card.backdropFilter : 'blur(8px)',
                    WebkitBackdropFilter: isActive ? frostedGlass.card.backdropFilter : 'blur(8px)',
                    boxShadow: isActive ? frostedGlass.card.shadow : 'none',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.4s ease-out',
                    textAlign: 'left',
                  }}
                >
                  {/* Active glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        opacity: [0.2, 0.35, 0.2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        background: `radial-gradient(circle at center, ${principle.color}25, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative">
                    {/* Icon */}
                    <motion.div
                      animate={{
                        scale: isActive ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isActive ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                      style={{
                        width: isMobile ? '44px' : '52px',
                        height: isMobile ? '44px' : '52px',
                        borderRadius: radius.md,
                        backgroundColor: `${principle.color}18`,
                        border: `1.5px solid ${principle.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: isMobile ? '16px' : '20px',
                      }}
                    >
                      <Icon 
                        size={isMobile ? 22 : 26} 
                        style={{ color: principle.color }} 
                      />
                    </motion.div>

                    {/* Title */}
                    <div
                      style={{
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: '700',
                        color: principle.color,
                        marginBottom: '8px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {principle.title}
                    </div>

                    {/* Statement */}
                    <div
                      style={{
                        fontSize: isMobile ? '13px' : '14px',
                        color: colors.neutral.gray[300],
                        lineHeight: '1.5',
                        marginBottom: '6px',
                        fontWeight: '500',
                      }}
                    >
                      {principle.statement}
                    </div>

                    {/* Supporting */}
                    <div
                      style={{
                        fontSize: isMobile ? '12px' : '13px',
                        color: colors.neutral.gray[500],
                        lineHeight: '1.5',
                        fontStyle: 'italic',
                      }}
                    >
                      {principle.supporting}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Active Principle Proof - Expands Below */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePrinciple}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-center w-full"
              style={{
                padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.lg}`,
                background: `${currentPrinciple.color}10`,
                border: `1px solid ${currentPrinciple.color}30`,
                borderRadius: radius.lg,
                backdropFilter: 'blur(20px)',
                marginBottom: isMobile ? '40px' : '56px',
                maxWidth: isMobile ? '100%' : '600px',
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  fontSize: isMobile ? '16px' : '18px',
                  color: currentPrinciple.color,
                  fontWeight: '600',
                  fontStyle: 'italic',
                  letterSpacing: '0.005em',
                }}
              >
                {currentPrinciple.proof}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <div 
            className="flex items-center justify-center gap-2"
          >
            {principles.map((_, idx) => (
              <motion.div
                key={idx}
                onClick={() => setActivePrinciple(idx)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: activePrinciple === idx ? (isMobile ? '28px' : '36px') : (isMobile ? '8px' : '10px'),
                  height: isMobile ? '8px' : '10px',
                  borderRadius: radius.xs,
                  backgroundColor: activePrinciple === idx 
                    ? principles[idx].color 
                    : colors.neutral.gray[700],
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-out',
                  opacity: activePrinciple === idx ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}