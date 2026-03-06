import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, type LucideIcon } from 'lucide-react';
import { colors, radius, spacing, typography, withAlpha } from '@/design-tokens';
import { alwaysRunningContent } from '@/content-tokens';
import { getSectionAsset } from '@/marketing-tokens';
import {
  ImmersiveSection,
  getImmersivePanelStyle,
  immersiveContentPadding,
  immersiveSectionPadding,
} from '@/app/components/marketing/ImmersiveSection';
import { useIsMobile } from '@/app/components/ui/use-mobile';

interface TargetBuildReceiptProps {
  mounted: boolean;
}

type Stage = (typeof alwaysRunningContent.phases)[number];

const flowStops = {
  desktop: ['14%', '50%', '86%'],
  mobile: ['14%', '50%', '86%'],
} as const;

function StageSignal({ stage, isActive, isMobile }: { stage: Stage; isActive: boolean; isMobile: boolean }) {
  const Icon = stage.icon as LucideIcon;

  return (
    <motion.div
      animate={{
        scale: isActive ? [1, 1.06, 1] : 1,
        opacity: isActive ? 1 : 0.65,
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: isMobile ? '56px' : '64px',
        height: isMobile ? '56px' : '64px',
        borderRadius: radius.full,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 50% 50%, ${withAlpha(stage.color, 0.24)} 0%, ${withAlpha(stage.color, 0.08)} 58%, transparent 100%)`,
        border: `1px solid ${withAlpha(stage.color, isActive ? 0.45 : 0.22)}`,
        boxShadow: `0 0 40px ${withAlpha(stage.color, isActive ? 0.2 : 0.08)}`,
      }}
    >
      <Icon size={isMobile ? 22 : 26} style={{ color: stage.color }} />
    </motion.div>
  );
}

export function TargetBuildReceipt({ mounted }: TargetBuildReceiptProps) {
  const isMobile = useIsMobile();
  const stages = alwaysRunningContent.phases;
  const [activeStageId, setActiveStageId] = useState<Stage['id']>(stages[0].id);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setActiveStageId((previous) => {
        const currentIndex = stages.findIndex((stage) => stage.id === previous);
        return stages[(currentIndex + 1) % stages.length]?.id ?? previous;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [mounted, stages]);

  const activeStageIndex = stages.findIndex((stage) => stage.id === activeStageId);
  const activeStage = stages[activeStageIndex] ?? stages[0];
  const assetUrl = getSectionAsset('alwaysRunning', isMobile);

  return (
    <ImmersiveSection
      assetUrl={assetUrl}
      assetAlt="Always running atmosphere"
      accentColor={activeStage.color}
      minHeight="100vh"
      style={{
        padding: isMobile ? immersiveSectionPadding.mobile : immersiveSectionPadding.desktop,
      }}
    >
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: isMobile ? immersiveContentPadding.mobile : immersiveContentPadding.desktop,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24, scale: mounted ? 1 : 0.98 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            ...getImmersivePanelStyle({
              accentColor: activeStage.color,
              borderAlpha: 0.2,
              glowAlpha: 0.16,
              radiusValue: radius['3xl'],
              variant: 'ultraLight',
            }),
            padding: isMobile ? spacing.xl : spacing['2xl'],
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at 50% 50%, ${withAlpha(activeStage.color, 0.14)} 0%, transparent 62%)`,
              opacity: 0.9,
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? spacing.xl : spacing['2xl'],
            }}
          >
            <div
              style={{
                maxWidth: '620px',
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.sm,
              }}
            >
              <div
                style={{
                  color: activeStage.color,
                  fontSize: typography.label.default.fontSize,
                  fontWeight: typography.label.default.fontWeight,
                  letterSpacing: typography.label.default.letterSpacing,
                  textTransform: typography.label.default.textTransform,
                }}
              >
                {alwaysRunningContent.sectionTitle}
              </div>
              <div
                style={{
                  color: colors.neutral.white,
                  fontSize: typography.heading.h2.fontSize,
                  fontWeight: typography.heading.h2.fontWeight,
                  lineHeight: typography.heading.h2.lineHeight,
                  letterSpacing: typography.heading.h2.letterSpacing,
                }}
              >
                {alwaysRunningContent.sectionSubtitle}
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                gap: isMobile ? spacing.lg : spacing.xl,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: isMobile ? '50%' : '14%',
                  right: isMobile ? 'auto' : '14%',
                  top: isMobile ? '14%' : '50%',
                  bottom: isMobile ? '14%' : 'auto',
                  width: isMobile ? '1px' : 'auto',
                  height: isMobile ? 'auto' : '1px',
                  transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
                  background: isMobile
                    ? `linear-gradient(180deg, transparent 0%, ${withAlpha(activeStage.color, 0.22)} 16%, ${withAlpha(activeStage.color, 0.22)} 84%, transparent 100%)`
                    : `linear-gradient(90deg, transparent 0%, ${withAlpha(activeStage.color, 0.22)} 16%, ${withAlpha(activeStage.color, 0.22)} 84%, transparent 100%)`,
                  opacity: 0.9,
                }}
              />

              <motion.div
                animate={
                  isMobile
                    ? { top: flowStops.mobile[activeStageIndex], left: '50%' }
                    : { left: flowStops.desktop[activeStageIndex], top: '50%' }
                }
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  width: isMobile ? '18px' : '20px',
                  height: isMobile ? '18px' : '20px',
                  borderRadius: radius.full,
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle at 50% 50%, ${activeStage.color} 0%, ${withAlpha(activeStage.color, 0.22)} 60%, transparent 100%)`,
                  boxShadow: `0 0 34px ${withAlpha(activeStage.color, 0.35)}`,
                  zIndex: 2,
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: radius.full,
                    border: `1px solid ${withAlpha(activeStage.color, 0.45)}`,
                  }}
                />
              </motion.div>

              {stages.map((stage, index) => {
                const isActive = stage.id === activeStageId;

                return (
                  <div
                    key={stage.id}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing.md,
                    }}
                  >
                    <motion.button
                      onClick={() => setActiveStageId(stage.id)}
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      animate={{
                        scale: isActive ? 1 : 0.97,
                        opacity: isActive ? 1 : 0.78,
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: spacing.lg,
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: isMobile ? spacing.lg : spacing.xl,
                        ...getImmersivePanelStyle({
                          accentColor: stage.color,
                          borderAlpha: isActive ? 0.36 : 0.16,
                          glowAlpha: isActive ? 0.16 : 0.06,
                          radiusValue: isMobile ? radius.xl : radius['2xl'],
                          variant: isActive ? 'card' : 'ultraLight',
                        }),
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `radial-gradient(circle at 50% 0%, ${withAlpha(stage.color, isActive ? 0.18 : 0.08)} 0%, transparent 68%)`,
                          opacity: 0.95,
                        }}
                      />

                      <div
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: spacing.md,
                        }}
                      >
                        <StageSignal stage={stage} isActive={isActive} isMobile={isMobile} />
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: spacing.xs,
                          }}
                        >
                          <div
                            style={{
                              color: stage.color,
                              fontSize: typography.label.small.fontSize,
                              fontWeight: typography.label.small.fontWeight,
                              letterSpacing: typography.label.small.letterSpacing,
                              textTransform: typography.label.small.textTransform,
                            }}
                          >
                            {stage.title}
                          </div>
                          <div
                            style={{
                              color: colors.neutral.white,
                              fontSize: typography.heading.h4.fontSize,
                              fontWeight: typography.heading.h4.fontWeight,
                              lineHeight: typography.heading.h4.lineHeight,
                            }}
                          >
                            {stage.subtitle}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          color: colors.neutral.gray[300],
                          fontSize: typography.body.small.fontSize,
                          fontWeight: typography.body.small.fontWeight,
                          lineHeight: typography.body.small.lineHeight,
                        }}
                      >
                        {stage.description}
                      </div>

                      <div
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                          gap: spacing.sm,
                        }}
                      >
                        {stage.items.map((item, itemIndex) => {
                          const ItemIcon = item.icon;
                          return (
                            <motion.div
                              key={item.text}
                              animate={{
                                opacity: isActive ? [0.62, 1, 0.62] : 0.52,
                                y: isActive ? [0, -2, 0] : 0,
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay: itemIndex * 0.18,
                                ease: 'easeInOut',
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing.xs,
                                padding: `${spacing.sm} ${spacing.sm}`,
                                borderRadius: radius.lg,
                                background: withAlpha(colors.neutral.black, 0.18),
                                border: `1px solid ${withAlpha(stage.color, isActive ? 0.22 : 0.12)}`,
                                color: colors.neutral.gray[300],
                                fontSize: typography.ui.caption.fontSize,
                                fontWeight: '500',
                                letterSpacing: typography.ui.caption.letterSpacing,
                              }}
                            >
                              <ItemIcon size={14} style={{ color: stage.color }} />
                              <span>{item.text}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.button>

                    {index < stages.length - 1 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing.xs,
                          color: stage.color,
                          fontSize: typography.ui.caption.fontSize,
                          letterSpacing: typography.ui.caption.letterSpacing,
                          opacity: stage.id === activeStageId ? 0.82 : 0.42,
                        }}
                      >
                        {isMobile ? <ArrowDown size={14} /> : <ArrowRight size={14} />}
                        <span>{stage.nextTransition}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </ImmersiveSection>
  );
}
