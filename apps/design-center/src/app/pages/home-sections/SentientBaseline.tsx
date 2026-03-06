import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, radius, spacing, typography, withAlpha } from '@/design-tokens';
import { assetOpacity, getSentientPrincipleAsset } from '@/marketing-tokens';
import { sentientBaselinePrinciples } from '@/content-tokens';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import {
  ImmersiveSection,
  getImmersivePanelStyle,
  immersiveContentPadding,
  immersiveSectionPadding,
} from '@/app/components/marketing/ImmersiveSection';

interface SentientBaselineProps {
  mounted: boolean;
}

export function SentientBaseline({ mounted }: SentientBaselineProps) {
  const isMobile = useIsMobile();
  const [activePrinciple, setActivePrinciple] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setActivePrinciple((prev) => (prev + 1) % sentientBaselinePrinciples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [mounted]);

  const currentPrinciple = sentientBaselinePrinciples[activePrinciple];

  return (
    <ImmersiveSection
      accentColor={currentPrinciple.color}
      style={{
        padding: isMobile ? immersiveSectionPadding.mobile : immersiveSectionPadding.desktop,
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {sentientBaselinePrinciples.map((principle, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: activePrinciple === i ? 1 : 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <img src={getSentientPrincipleAsset(i, isMobile)} alt="" className="w-full h-full object-cover" style={{ opacity: assetOpacity.section }} />
          </motion.div>
        ))}
      </div>

      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: isMobile ? immersiveContentPadding.mobile : immersiveContentPadding.desktop,
        }}
      >
        <div
          className="w-full mx-auto"
          style={{
            position: 'relative',
            minHeight: isMobile ? '500px' : '600px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? spacing.xl : spacing['2xl'],
            ...getImmersivePanelStyle({
              accentColor: currentPrinciple.color,
              borderAlpha: 0.18,
              glowAlpha: 0.14,
              radiusValue: radius['3xl'],
              variant: 'ultraLight',
            }),
            padding: isMobile ? spacing.xl : spacing['2xl'],
          }}
        >
          <div className="grid w-full gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', maxWidth: isMobile ? '100%' : '1100px' }}>
            {sentientBaselinePrinciples.map((principle, idx) => {
              const Icon = principle.icon;
              const isActive = activePrinciple === idx;
              return (
                <motion.button
                  key={principle.id}
                  onClick={() => setActivePrinciple(idx)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, scale: isActive ? (isMobile ? 1 : 1.02) : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25, delay: idx * 0.1 }}
                  whileHover={{ scale: isActive ? (isMobile ? 1 : 1.02) : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                  style={{
                    padding: isMobile ? spacing.section.content.mobile : spacing.section.content.desktop,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.4s ease-out',
                    textAlign: 'left',
                    ...getImmersivePanelStyle({
                      accentColor: principle.color,
                      borderAlpha: isActive ? 0.34 : 0.14,
                      glowAlpha: isActive ? 0.12 : 0.04,
                      radiusValue: isMobile ? radius.lg : radius.xl,
                      variant: isActive ? 'card' : 'ultraLight',
                    }),
                  }}
                >
                  {isActive && (
                    <motion.div className="absolute inset-0" animate={{ opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ background: `radial-gradient(circle at center, ${withAlpha(principle.color, 0.16)}, transparent 70%)` }}
                    />
                  )}
                  <div className="relative">
                    <motion.div
                      animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                      style={{
                        width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px',
                        borderRadius: radius.md, backgroundColor: `${principle.color}18`,
                        border: `1.5px solid ${principle.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: isMobile ? '16px' : '20px',
                      }}
                    >
                      <Icon size={isMobile ? 22 : 26} style={{ color: principle.color }} />
                    </motion.div>
                    <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: principle.color, marginBottom: '8px', letterSpacing: '-0.01em' }}>
                      {principle.title}
                    </div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', color: colors.neutral.gray[300], lineHeight: '1.5', marginBottom: '6px', fontWeight: '500' }}>
                      {principle.statement}
                    </div>
                    <div style={{ fontSize: isMobile ? '12px' : '13px', color: colors.neutral.gray[500], lineHeight: '1.5', fontStyle: 'italic' }}>
                      {principle.supporting}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePrinciple}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-center w-full"
              style={{
                padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.lg}`,
                marginBottom: isMobile ? spacing.md : spacing.xl,
                maxWidth: isMobile ? '100%' : '600px',
                ...getImmersivePanelStyle({
                  accentColor: currentPrinciple.color,
                  borderAlpha: 0.24,
                  glowAlpha: 0.1,
                  radiusValue: radius.lg,
                  variant: 'card',
                }),
              }}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                style={{ fontSize: isMobile ? '16px' : '18px', color: currentPrinciple.color, fontWeight: '600', fontStyle: 'italic', letterSpacing: '0.005em' }}
              >
                {currentPrinciple.proof}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2">
            {sentientBaselinePrinciples.map((_, idx) => (
              <motion.div
                key={idx}
                onClick={() => setActivePrinciple(idx)}
                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                style={{
                  width: activePrinciple === idx ? (isMobile ? '28px' : '36px') : (isMobile ? '8px' : '10px'),
                  height: isMobile ? '8px' : '10px', borderRadius: radius.xs,
                  backgroundColor: activePrinciple === idx ? sentientBaselinePrinciples[idx].color : colors.neutral.gray[700],
                  cursor: 'pointer', transition: 'all 0.3s ease-out',
                  opacity: activePrinciple === idx ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </ImmersiveSection>
  );
}
