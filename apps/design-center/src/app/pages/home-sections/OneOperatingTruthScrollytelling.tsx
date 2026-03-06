import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLazyBackground } from '@/hooks/useLazyBackground';
import { getOperatingTruthFeatureAsset, sectionAssets } from '@/marketing-tokens';
import { operatingTruthFeatures } from '@/content-tokens';
import { colors, surfaces, spacing, radius } from '@/design-tokens';
import {
  ImmersiveSection,
  immersiveContentPadding,
  immersiveSectionPadding,
} from '@/app/components/marketing/ImmersiveSection';
import { useIsMobile } from '@/app/components/ui/use-mobile';

interface ComponentOneOperatingTruthSection4Props {
  mounted: boolean;
}

const features = operatingTruthFeatures.slice(0, 8);

export function ComponentOneOperatingTruthSection4({ mounted }: ComponentOneOperatingTruthSection4Props) {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [subFeaturePage, setSubFeaturePage] = useState(0);
  const focusFeature = features[expandedFeature ?? hoveredCard ?? 0] ?? features[0];

  // Lazy background hooks for all 8 features
  const bg1 = useLazyBackground(getOperatingTruthFeatureAsset(0, isMobile), features[0].backgroundAsset.collection, features[0].backgroundAsset.name);
  const bg2 = useLazyBackground(getOperatingTruthFeatureAsset(1, isMobile), features[1].backgroundAsset.collection, features[1].backgroundAsset.name);
  const bg3 = useLazyBackground(getOperatingTruthFeatureAsset(2, isMobile), features[2].backgroundAsset.collection, features[2].backgroundAsset.name);
  const bg4 = useLazyBackground(getOperatingTruthFeatureAsset(3, isMobile), features[3].backgroundAsset.collection, features[3].backgroundAsset.name);
  const bg5 = useLazyBackground(getOperatingTruthFeatureAsset(4, isMobile), features[4].backgroundAsset.collection, features[4].backgroundAsset.name);
  const bg6 = useLazyBackground(getOperatingTruthFeatureAsset(5, isMobile), features[5].backgroundAsset.collection, features[5].backgroundAsset.name);
  const bg7 = useLazyBackground(getOperatingTruthFeatureAsset(6, isMobile), features[6].backgroundAsset.collection, features[6].backgroundAsset.name);
  const bg8 = useLazyBackground(getOperatingTruthFeatureAsset(7, isMobile), features[7].backgroundAsset.collection, features[7].backgroundAsset.name);
  const featureBgs = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8];

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedFeature !== null) setExpandedFeature(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted, expandedFeature]);

  useEffect(() => { setSubFeaturePage(0); }, [expandedFeature]);

  return (
    <ImmersiveSection
      assetUrl={sectionAssets.operatingTruth.finalCard.url}
      assetAlt="Operating truth atmosphere"
      accentColor={focusFeature.accentColor}
      style={{
        padding: isMobile ? immersiveSectionPadding.mobile : immersiveSectionPadding.desktop,
      }}
    >
      {/* Feature Grid */}
      <div
        className="grid mx-auto relative z-10"
        style={{
          width: '100%',
          padding: isMobile ? immersiveContentPadding.mobile : immersiveContentPadding.desktop,
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '16px' : '20px',
          maxWidth: isMobile ? '100%' : '1200px',
        }}
      >
        {features.map((feature, i) => {
          const Icon = feature.icon;
          const bg = featureBgs[i];
          const isHovered = hoveredCard === i;

          return (
            <motion.button
              key={feature.id}
              onClick={() => setExpandedFeature(i)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative overflow-hidden group"
              style={{
                aspectRatio: isMobile ? '1 / 1.25' : '1 / 1.1',
                borderRadius: isMobile ? radius.lg : radius.xl,
                border: `1px solid ${feature.accentColor}${isHovered ? '60' : '30'}`,
                backgroundColor: 'rgba(17, 23, 30, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.3s ease-out',
              }}
              aria-label={`Explore ${feature.name}`}
            >
              {/* Background Asset Preview */}
              <div
                ref={bg.ref}
                className="absolute inset-0 transition-all duration-500"
                style={{ ...bg.style, opacity: 0.4 }}
                role={bg.role}
                aria-label={bg.ariaLabel}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-between text-center" style={{
                padding: isMobile ? '16px' : '20px',
              }}>
                <motion.div animate={{ rotate: isHovered ? [0, 5, -5, 0] : 0 }} transition={{ duration: 0.5 }}>
                  <Icon size={isMobile ? 32 : 36} style={{ color: feature.accentColor, opacity: 0.9 }} />
                </motion.div>

                <div className="w-full">
                  <div style={{
                    fontSize: isMobile ? '9px' : '10px', color: feature.accentColor,
                    letterSpacing: '0.15em', textTransform: 'lowercase', fontWeight: '600',
                    marginBottom: '8px', opacity: 0.8,
                  }}>
                    {feature.layer}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '16px' : '18px', fontWeight: '700',
                    color: colors.neutral.white, marginBottom: '6px', letterSpacing: '-0.01em',
                  }}>
                    {feature.name}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '10px' : '11px', color: colors.neutral.gray[500], fontStyle: 'italic',
                  }}>
                    {feature.label}
                  </div>
                </div>
              </div>

              {/* Hover Glow */}
              {isHovered && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: `radial-gradient(circle at center, ${feature.accentColor}20, transparent 70%)` }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Feature Modal */}
      <AnimatePresence>
        {expandedFeature !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: `${surfaces.solid.base}CC`,
              backdropFilter: 'blur(20px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
              padding: isMobile ? spacing.sm : spacing.xl,
            }}
            onClick={() => setExpandedFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full overflow-hidden"
              style={{
                maxWidth: isMobile ? '100%' : '1000px',
                maxHeight: isMobile ? '90vh' : '80vh',
                borderRadius: isMobile ? radius['2xl'] : radius['3xl'],
                border: `2px solid ${features[expandedFeature].accentColor}60`,
                backgroundColor: 'rgba(17, 23, 30, 0.98)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Asset */}
              <div
                ref={featureBgs[expandedFeature].ref}
                className="absolute inset-0"
                style={{ ...featureBgs[expandedFeature].style, opacity: 0.5, pointerEvents: 'none' }}
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to bottom, rgba(17, 23, 30, 0.5) 0%, rgba(17, 23, 30, 0.95) 100%)',
                pointerEvents: 'none',
              }} />

              {/* Close Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedFeature(null); }}
                className="absolute z-10"
                style={{
                  top: isMobile ? spacing.sm : spacing.md,
                  right: isMobile ? spacing.sm : spacing.md,
                  width: isMobile ? '44px' : '40px', height: isMobile ? '44px' : '40px',
                  borderRadius: radius.lg,
                  backgroundColor: 'rgba(236, 239, 229, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease-out',
                  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(236, 239, 229, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(236, 239, 229, 0.1)'; }}
                aria-label="Close"
              >
                <X size={isMobile ? 22 : 20} style={{ color: colors.neutral.white }} />
              </button>

              {/* Scrollable Content */}
              <div
                className="relative z-10 h-full overflow-y-auto"
                style={{ padding: isMobile ? spacing.section.content.mobile : `${spacing['3xl']} ${spacing['2xl']}` }}
              >
                <div className="text-center max-w-3xl mx-auto">
                  {/* Icon */}
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex justify-center"
                    style={{ marginBottom: isMobile ? '16px' : '24px' }}
                  >
                    {(() => {
                      const Icon = features[expandedFeature].icon;
                      return <Icon size={isMobile ? 48 : 64} style={{ color: features[expandedFeature].accentColor, opacity: 0.9 }} />;
                    })()}
                  </motion.div>

                  {/* Layer Tag */}
                  <div style={{
                    fontSize: isMobile ? '10px' : '11px', color: features[expandedFeature].accentColor,
                    letterSpacing: '0.2em', textTransform: 'lowercase', fontWeight: '600',
                    marginBottom: isMobile ? '12px' : '16px', opacity: 0.7,
                  }}>
                    {features[expandedFeature].layer}
                  </div>

                  {/* Feature Name */}
                  <h2 style={{
                    fontSize: isMobile ? 'clamp(36px, 10vw, 56px)' : 'clamp(56px, 7vw, 72px)',
                    fontWeight: '700', color: colors.neutral.white, lineHeight: '1.1',
                    marginBottom: isMobile ? '12px' : '16px', letterSpacing: '-0.02em',
                  }}>
                    {features[expandedFeature].name}
                  </h2>

                  <div style={{
                    fontSize: isMobile ? '14px' : '16px', color: colors.neutral.gray[500],
                    fontStyle: 'italic', marginBottom: isMobile ? '24px' : '32px',
                  }}>
                    {features[expandedFeature].label}
                  </div>

                  {/* Promise */}
                  <div style={{
                    fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : 'clamp(24px, 3vw, 32px)',
                    color: features[expandedFeature].accentColor,
                    fontStyle: 'italic', lineHeight: '1.4',
                    marginBottom: isMobile ? '16px' : '20px',
                  }}>
                    {features[expandedFeature].promise}
                  </div>

                  <div style={{
                    fontSize: isMobile ? '12px' : '14px', color: colors.neutral.gray[600],
                    fontStyle: 'italic', marginBottom: isMobile ? '32px' : '48px',
                  }}>
                    {features[expandedFeature].whyItMatters}
                  </div>

                  {/* Sub-features with Pagination */}
                  {(() => {
                    const currentFeature = features[expandedFeature];
                    const totalSubFeatures = currentFeature.subFeatures.length;
                    const itemsPerPage = 4;
                    const totalPages = Math.ceil(totalSubFeatures / itemsPerPage);
                    const startIndex = subFeaturePage * itemsPerPage;
                    const endIndex = Math.min(startIndex + itemsPerPage, totalSubFeatures);
                    const visibleSubFeatures = currentFeature.subFeatures.slice(startIndex, endIndex);
                    const showPagination = totalSubFeatures > itemsPerPage;

                    return (
                      <>
                        <div className="grid gap-3" style={{
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        }}>
                          {visibleSubFeatures.map((sub, i) => (
                            <motion.div
                              key={`expanded-sub-${startIndex + i}`}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 + (i * 0.05) }}
                              style={{
                                padding: `${spacing.sm} ${spacing.sm}`,
                                background: `${colors.neutral.gray[900]}50`,
                                border: `1px solid ${currentFeature.accentColor}30`,
                                borderRadius: radius.lg,
                                backdropFilter: 'blur(10px)',
                                textAlign: 'left',
                              }}
                            >
                              <div style={{
                                fontSize: isMobile ? '13px' : '14px', fontWeight: '600',
                                color: colors.neutral.gray[300], marginBottom: '4px',
                              }}>
                                {sub.name}
                              </div>
                              <div style={{
                                fontSize: isMobile ? '11px' : '12px', color: colors.neutral.gray[600], lineHeight: '1.5',
                              }}>
                                {sub.description}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {showPagination && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center gap-4"
                            style={{ marginTop: isMobile ? '24px' : '32px' }}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); setSubFeaturePage(Math.max(0, subFeaturePage - 1)); }}
                              disabled={subFeaturePage === 0}
                              style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: subFeaturePage === 0 ? 'rgba(236, 239, 229, 0.05)' : 'rgba(236, 239, 229, 0.1)',
                                border: `1px solid ${subFeaturePage === 0 ? 'rgba(255, 255, 255, 0.1)' : currentFeature.accentColor + '40'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: subFeaturePage === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease-out',
                                opacity: subFeaturePage === 0 ? 0.3 : 1,
                              }}
                              aria-label="Previous page"
                            >
                              <ChevronLeft size={20} style={{ color: colors.neutral.white }} />
                            </button>
                            <div style={{
                              fontSize: isMobile ? '11px' : '12px', color: currentFeature.accentColor,
                              fontWeight: '600', letterSpacing: '0.05em', minWidth: '60px', textAlign: 'center',
                            }}>
                              {subFeaturePage + 1} / {totalPages}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSubFeaturePage(Math.min(totalPages - 1, subFeaturePage + 1)); }}
                              disabled={subFeaturePage === totalPages - 1}
                              style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: subFeaturePage === totalPages - 1 ? 'rgba(236, 239, 229, 0.05)' : 'rgba(236, 239, 229, 0.1)',
                                border: `1px solid ${subFeaturePage === totalPages - 1 ? 'rgba(255, 255, 255, 0.1)' : currentFeature.accentColor + '40'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: subFeaturePage === totalPages - 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease-out',
                                opacity: subFeaturePage === totalPages - 1 ? 0.3 : 1,
                              }}
                              aria-label="Next page"
                            >
                              <ChevronRight size={20} style={{ color: colors.neutral.white }} />
                            </button>
                          </motion.div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ImmersiveSection>
  );
}
