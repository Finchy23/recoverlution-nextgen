import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  colors,
  radius,
  spacing,
  surfaces,
  typography,
  withAlpha,
} from '@/design-tokens';
import { sectionAssets } from '@/marketing-tokens';
import {
  clinicalLayers,
  clinicalVertebrae,
  operatingTruthExperienceScenes,
  operatingTruthFeatures,
  operatingTruthFinalCard,
} from '@/content-tokens';
import {
  ImmersiveSection,
  getImmersivePanelStyle,
  immersiveContentPadding,
  immersiveSectionPadding,
} from '@/app/components/marketing/ImmersiveSection';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { buildComposition } from '@/app/data/composition-engine';
import { ATOM_CONTENT_PROFILES } from '@/app/data/atom-content-profiles';
import { NaviCueCompositor } from '@/app/components/NaviCueCompositor';
import { usePhaseOrchestrator } from '@/app/hooks/usePhaseOrchestrator';
import { ENTRANCES, EXITS } from '@/navicue-data';

interface OperatingTruthGridProps {
  mounted: boolean;
}

const featureById = new Map(operatingTruthFeatures.map((feature) => [feature.id, feature]));
const vertebraLayers = clinicalVertebrae.map((vertebra) => ({
  vertebra,
  layers: clinicalLayers.filter((layer) => vertebra.layerIds.includes(layer.id)),
}));

function getGesturePrompt(gesture: string) {
  switch (gesture) {
    case 'tap':
      return 'Tap through the glass to complete the proof.';
    case 'drag':
      return 'Drag the glass until the geometry resolves.';
    case 'hold':
      return 'Hold steady and let the atmosphere reorganize.';
    default:
      return 'Complete the glass to trigger the next remap.';
  }
}

function useMeasuredViewport() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 320, height: 690 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      setViewport({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return { ref, viewport };
}

export function OperatingTruthGrid({ mounted }: OperatingTruthGridProps) {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion() ?? false;
  const [sceneIndex, setSceneIndex] = useState(0);
  const activeScene = operatingTruthExperienceScenes[sceneIndex] ?? operatingTruthExperienceScenes[0];
  const accentColor = operatingTruthFeatures.find((feature) => feature.id === activeScene.featureIds[0])?.accentColor
    ?? colors.accent.cyan.primary;
  const activeLayers = useMemo(() => new Set(activeScene.activeLayerIds), [activeScene.activeLayerIds]);
  const sceneFeatures = useMemo(
    () => activeScene.featureIds.map((id) => featureById.get(id)).filter(Boolean),
    [activeScene.featureIds],
  );

  const composition = useMemo(() => {
    const profile = ATOM_CONTENT_PROFILES[activeScene.atomId];
    const exitMaterialization =
      activeScene.exit === 'burn-in'
        ? 'burn-in'
        : activeScene.exit === 'immediate'
          ? 'immediate'
          : activeScene.exit === 'emerge'
            ? 'emerge'
            : 'dissolve';

    return buildComposition({
      schemaTarget: activeScene.schemaTarget,
      heatBand: activeScene.heatBand,
      chronoContext: activeScene.chronoContext,
      colorSignature: activeScene.colorSignature,
      visualEngine: activeScene.visualEngine,
      engineParams: {
        density: 0.56,
        speed: 0.38,
        complexity: 0.64,
        reactivity: 0.58,
        depth: 0.7,
      },
      responseProfile: activeScene.responseProfile,
      breathPattern: activeScene.breathPattern,
      arrivalCurve: 'arrival',
      departureCurve: 'departure',
      voiceLane: activeScene.voiceLane,
      entranceMaterialization: 'emerge',
      exitMaterialization,
      entrance: activeScene.entrance,
      exit: activeScene.exit,
      atomId: activeScene.atomId,
      primaryGesture: profile.primaryGesture,
      useResolutionMatrix: false,
      narrativeDensity: activeScene.narrativeDensity,
    });
  }, [activeScene]);

  const entranceSpec = ENTRANCES[activeScene.entrance];
  const exitSpec = EXITS[activeScene.exit];
  const [
    {
      phase,
      atomPhase,
      atmosphereSettled,
      textVisible,
      phaseElapsed,
    },
    {
      start,
      reset,
      signalResolution,
      completeEntranceAction,
    },
  ] = usePhaseOrchestrator({
    entranceDurationMs: entranceSpec.durationMs,
    exitDurationMs: exitSpec.durationMs,
    entranceRequiresAction: entranceSpec.requiresUserAction,
  });

  const { ref: deviceViewportRef, viewport: deviceViewport } = useMeasuredViewport();
  const completionHandledRef = useRef<string | null>(null);
  const interactionPrompt = getGesturePrompt(ATOM_CONTENT_PROFILES[activeScene.atomId].primaryGesture);

  useEffect(() => {
    if (!mounted) return;

    reset();
    const timer = window.setTimeout(() => {
      start();
    }, reducedMotion ? 120 : 420);

    return () => window.clearTimeout(timer);
  }, [activeScene.id, mounted, reducedMotion, reset, start]);

  useEffect(() => {
    if (phase !== 'entering' || !entranceSpec.requiresUserAction) return;

    const timer = window.setTimeout(() => {
      completeEntranceAction();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [completeEntranceAction, entranceSpec.requiresUserAction, phase]);

  useEffect(() => {
    if (phase !== 'complete') {
      completionHandledRef.current = null;
      return;
    }

    if (completionHandledRef.current === composition.id) return;
    completionHandledRef.current = composition.id;

    const timer = window.setTimeout(() => {
      setSceneIndex((previous) => (previous + 1) % operatingTruthExperienceScenes.length);
    }, 1250);

    return () => window.clearTimeout(timer);
  }, [composition.id, phase]);

  const deviceShellRadius = isMobile ? '34px' : '42px';
  const activeStepLabel = `${sceneIndex + 1} / ${operatingTruthExperienceScenes.length}`;

  return (
    <ImmersiveSection
      assetUrl={sectionAssets.operatingTruth.finalCard.url}
      assetAlt="Operating truth proof surface"
      accentColor={accentColor}
      style={{
        padding: isMobile ? immersiveSectionPadding.mobile : immersiveSectionPadding.desktop,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? immersiveContentPadding.mobile : immersiveContentPadding.desktop,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.04fr) minmax(360px, 0.96fr)',
            gap: isMobile ? spacing.lg : spacing.xl,
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'grid', gap: spacing.lg }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
              transition={{ duration: 0.72, ease: [0.22, 0, 0, 1] }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: isMobile ? spacing.lg : spacing.xl,
                ...getImmersivePanelStyle({
                  accentColor,
                  borderAlpha: 0.24,
                  glowAlpha: 0.14,
                  radiusValue: radius['2xl'],
                  variant: 'card',
                }),
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${withAlpha(accentColor, 0.18)} 0%, transparent 58%)`,
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: spacing.md }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ ...typography.label.default, color: withAlpha(accentColor, 0.92) }}>
                      {operatingTruthFinalCard.eyebrow}
                    </div>
                    <h2
                      style={{
                        ...typography.display.medium,
                        color: colors.neutral.white,
                        margin: 0,
                        fontFamily: typography.fontFamily.secondary,
                      }}
                    >
                      {operatingTruthFinalCard.headline} {operatingTruthFinalCard.subheadline}
                    </h2>
                  </div>

                  <div
                    style={{
                      ...typography.ui.caption,
                      color: colors.neutral.gray[300],
                      padding: `8px ${spacing.sm}`,
                      borderRadius: radius.full,
                      border: `1px solid ${withAlpha(accentColor, 0.18)}`,
                      background: withAlpha(accentColor, 0.08),
                    }}
                  >
                    {activeStepLabel}
                  </div>
                </div>

                <p
                  style={{
                    ...typography.body.large,
                    color: colors.neutral.gray[200],
                    margin: 0,
                    maxWidth: '48rem',
                  }}
                >
                  {operatingTruthFinalCard.body}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: spacing.xs,
                  }}
                >
                  {sceneFeatures.map((feature) => {
                    if (!feature) return null;

                    return (
                      <div
                        key={feature.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: `8px ${spacing.sm}`,
                          borderRadius: radius.full,
                          border: `1px solid ${withAlpha(feature.accentColor, 0.16)}`,
                          background: withAlpha(feature.accentColor, 0.08),
                        }}
                      >
                        <feature.icon size={14} strokeWidth={2.2} color={feature.accentColor} />
                        <span style={{ ...typography.ui.caption, color: colors.neutral.gray[100] }}>
                          {feature.shortName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <div style={{ position: 'relative', display: 'grid', gap: spacing.lg }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: spacing.md,
                  bottom: spacing.md,
                  left: isMobile ? '18px' : '22px',
                  width: '1px',
                  background: `linear-gradient(180deg, transparent 0%, ${withAlpha(accentColor, 0.35)} 16%, ${withAlpha(accentColor, 0.14)} 84%, transparent 100%)`,
                }}
              />

              <motion.div
                aria-hidden="true"
                key={activeScene.id}
                initial={{ top: '8%', opacity: 0 }}
                animate={{ top: ['8%', '92%'], opacity: [0, 1, 0] }}
                transition={{ duration: reducedMotion ? 0 : 2.8, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  left: isMobile ? '18px' : '22px',
                  width: '14px',
                  height: '14px',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${withAlpha(accentColor, 0.8)} 0%, ${withAlpha(accentColor, 0.18)} 48%, transparent 76%)`,
                  filter: 'blur(0.5px)',
                }}
              />

              {vertebraLayers.map(({ vertebra, layers }, index) => {
                const highlightedLayers = layers.filter((layer) => activeLayers.has(layer.id));
                const isActiveVertebra = highlightedLayers.length > 0;

                return (
                  <motion.article
                    key={vertebra.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 28 }}
                    transition={{ duration: 0.68, delay: index * 0.1, ease: [0.22, 0, 0, 1] }}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      padding: isMobile ? spacing.lg : spacing.xl,
                      ...getImmersivePanelStyle({
                        accentColor: vertebra.color,
                        borderAlpha: isActiveVertebra ? 0.26 : 0.12,
                        glowAlpha: isActiveVertebra ? 0.14 : 0.05,
                        radiusValue: radius['2xl'],
                        variant: isActiveVertebra ? 'card' : 'ultraLight',
                      }),
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(135deg, ${withAlpha(vertebra.color, isActiveVertebra ? 0.18 : 0.08)} 0%, transparent 56%)`,
                        pointerEvents: 'none',
                      }}
                    />

                    <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: spacing.md }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto',
                          gap: spacing.sm,
                          alignItems: isMobile ? 'start' : 'center',
                        }}
                      >
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: vertebra.color,
                            boxShadow: `0 0 18px ${withAlpha(vertebra.color, isActiveVertebra ? 0.35 : 0.14)}`,
                            marginTop: isMobile ? '6px' : 0,
                          }}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...typography.label.default, color: withAlpha(vertebra.color, 0.94) }}>
                            {vertebra.displayName}
                          </div>
                          <div
                            style={{
                              ...typography.heading.h4,
                              color: colors.neutral.white,
                              marginTop: '4px',
                              fontFamily: typography.fontFamily.secondary,
                            }}
                          >
                            {vertebra.subtitle}
                          </div>
                          <p
                            style={{
                              ...typography.body.small,
                              color: colors.neutral.gray[300],
                              margin: '8px 0 0',
                              maxWidth: '42rem',
                            }}
                          >
                            {vertebra.description}
                          </p>
                        </div>

                        <div
                          style={{
                            ...typography.ui.caption,
                            color: isActiveVertebra ? vertebra.color : colors.neutral.gray[500],
                            padding: `8px ${spacing.sm}`,
                            borderRadius: radius.full,
                            border: `1px solid ${withAlpha(vertebra.color, isActiveVertebra ? 0.22 : 0.08)}`,
                            background: withAlpha(vertebra.color, isActiveVertebra ? 0.1 : 0.04),
                            justifySelf: isMobile ? 'start' : 'end',
                          }}
                        >
                          {highlightedLayers.length}/{layers.length} live
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                          gap: spacing.sm,
                        }}
                      >
                        {layers.map((layer) => {
                          const isLive = activeLayers.has(layer.id);
                          const Icon = layer.icon;

                          return (
                            <motion.div
                              key={layer.id}
                              animate={{
                                y: isLive && !reducedMotion ? [0, -2, 0] : 0,
                                boxShadow: isLive
                                  ? `0 0 0 1px ${withAlpha(layer.color, 0.18)}, 0 0 24px ${withAlpha(layer.color, 0.16)}`
                                  : 'none',
                              }}
                              transition={{
                                duration: 2.8,
                                repeat: isLive && !reducedMotion ? Infinity : 0,
                                ease: 'easeInOut',
                              }}
                              style={{
                                display: 'grid',
                                gap: '10px',
                                padding: spacing.md,
                                borderRadius: radius.xl,
                                border: `1px solid ${withAlpha(layer.color, isLive ? 0.24 : 0.08)}`,
                                background: isLive
                                  ? `linear-gradient(135deg, ${withAlpha(layer.color, 0.16)} 0%, ${withAlpha(surfaces.solid.base, 0.88)} 100%)`
                                  : withAlpha(colors.neutral.white, 0.02),
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
                                <div
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: radius.md,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: withAlpha(layer.color, isLive ? 0.18 : 0.08),
                                    color: layer.color,
                                  }}
                                >
                                  <Icon size={15} strokeWidth={2.2} />
                                </div>
                                <div style={{ ...typography.ui.caption, color: withAlpha(layer.color, 0.85) }}>
                                  L{layer.id}
                                </div>
                              </div>

                              <div style={{ display: 'grid', gap: '4px' }}>
                                <div style={{ ...typography.heading.h5, color: colors.neutral.white }}>
                                  {layer.name}
                                </div>
                                <div
                                  style={{
                                    ...typography.ui.caption,
                                    color: colors.neutral.gray[400],
                                  }}
                                >
                                  {layer.tag}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
            transition={{ duration: 0.76, delay: 0.08, ease: [0.22, 0, 0, 1] }}
            style={{
              display: 'grid',
              gap: spacing.lg,
              alignContent: 'start',
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: isMobile ? spacing.lg : spacing.xl,
                ...getImmersivePanelStyle({
                  accentColor,
                  borderAlpha: 0.24,
                  glowAlpha: 0.16,
                  radiusValue: radius['3xl'],
                  variant: 'card',
                }),
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at 50% 18%, ${withAlpha(accentColor, 0.22)} 0%, transparent 58%)`,
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: spacing.lg }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: spacing.md }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ ...typography.label.default, color: withAlpha(accentColor, 0.94) }}>
                      {activeScene.eyebrow}
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeScene.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.36, ease: [0.22, 0, 0, 1] }}
                        style={{ display: 'grid', gap: spacing.sm }}
                      >
                        <h3
                          style={{
                            ...typography.display.small,
                            color: colors.neutral.white,
                            margin: 0,
                            fontFamily: typography.fontFamily.secondary,
                          }}
                        >
                          {activeScene.title}
                        </h3>
                        <p
                          style={{
                            ...typography.body.large,
                            color: colors.neutral.gray[200],
                            margin: 0,
                          }}
                        >
                          {activeScene.body}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div
                    style={{
                      ...typography.ui.caption,
                      color: colors.neutral.gray[400],
                      padding: `8px ${spacing.sm}`,
                      borderRadius: radius.full,
                      border: `1px solid ${withAlpha(accentColor, 0.14)}`,
                      background: withAlpha(accentColor, 0.06),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phase.toUpperCase()}
                  </div>
                </div>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: isMobile ? '100%' : '420px',
                    margin: '0 auto',
                  }}
                >
                  <motion.div
                    animate={{
                      scale: phase === 'active' && !reducedMotion ? [0.98, 1.02, 0.98] : 1,
                      opacity: phase === 'complete' ? 0.82 : 1,
                    }}
                    transition={{
                      duration: 3.4,
                      repeat: phase === 'active' && !reducedMotion ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      inset: '-8%',
                      borderRadius: '38%',
                      background: `radial-gradient(circle, ${withAlpha(accentColor, 0.22)} 0%, transparent 68%)`,
                      filter: 'blur(20px)',
                      pointerEvents: 'none',
                    }}
                  />

                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '390 / 844',
                      padding: '10px',
                      borderRadius: deviceShellRadius,
                      background: `linear-gradient(180deg, ${withAlpha(colors.neutral.white, 0.1)} 0%, ${withAlpha(colors.neutral.white, 0.04)} 100%)`,
                      border: `1px solid ${withAlpha(accentColor, 0.18)}`,
                      boxShadow: `0 0 0 1px ${withAlpha(accentColor, 0.12)}, 0 24px 80px rgba(0, 0, 0, 0.45), 0 0 56px ${withAlpha(accentColor, 0.16)}`,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: '10px',
                        borderRadius: isMobile ? '26px' : '32px',
                        overflow: 'hidden',
                        background: surfaces.solid.base,
                      }}
                    >
                      <div ref={deviceViewportRef} style={{ position: 'absolute', inset: 0 }}>
                        {deviceViewport.width > 0 ? (
                          <NaviCueCompositor
                            composition={composition}
                            phase={phase}
                            atomPhase={atomPhase}
                            atmosphereSettled={atmosphereSettled}
                            textVisible={textVisible}
                            phaseElapsed={phaseElapsed}
                            width={deviceViewport.width}
                            height={deviceViewport.height}
                            reducedMotion={reducedMotion}
                            onAtomResolve={() => signalResolution()}
                            onAtomStateChange={() => {}}
                            onHaptic={() => {}}
                          />
                        ) : null}
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          top: isMobile ? '14px' : '16px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: isMobile ? '96px' : '112px',
                          height: isMobile ? '24px' : '28px',
                          borderRadius: '999px',
                          background: colors.neutral.black,
                          zIndex: 10,
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          left: '18px',
                          right: '18px',
                          bottom: '18px',
                          zIndex: 10,
                          display: 'grid',
                          gap: spacing.xs,
                          padding: spacing.sm,
                          borderRadius: radius.xl,
                          background: 'linear-gradient(180deg, rgba(9, 13, 17, 0.18) 0%, rgba(9, 13, 17, 0.78) 100%)',
                          border: `1px solid ${withAlpha(colors.neutral.white, 0.08)}`,
                          backdropFilter: 'blur(14px)',
                          WebkitBackdropFilter: 'blur(14px)',
                        }}
                      >
                        <div style={{ ...typography.ui.caption, color: withAlpha(accentColor, 0.88) }}>
                          {activeScene.receipt}
                        </div>
                        <div style={{ ...typography.body.small, color: colors.neutral.gray[200] }}>
                          {activeScene.remapLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: spacing.md }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                    {operatingTruthExperienceScenes.map((scene, index) => {
                      const selected = index === sceneIndex;

                      return (
                        <button
                          key={scene.id}
                          type="button"
                          onClick={() => setSceneIndex(index)}
                          style={{
                            cursor: 'pointer',
                            padding: `10px ${spacing.md}`,
                            borderRadius: radius.full,
                            border: `1px solid ${withAlpha(selected ? accentColor : colors.neutral.white, selected ? 0.26 : 0.08)}`,
                            background: selected ? withAlpha(accentColor, 0.12) : withAlpha(colors.neutral.white, 0.02),
                            color: selected ? colors.neutral.white : colors.neutral.gray[400],
                            ...typography.ui.caption,
                          }}
                        >
                          {scene.eyebrow}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
                      gap: spacing.sm,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        padding: spacing.md,
                        borderRadius: radius.xl,
                        border: `1px solid ${withAlpha(accentColor, 0.12)}`,
                        background: withAlpha(colors.neutral.white, 0.03),
                      }}
                    >
                      <div style={{ ...typography.ui.caption, color: withAlpha(accentColor, 0.88), marginBottom: '6px' }}>
                        LIVE ORCHESTRATION
                      </div>
                      <div style={{ ...typography.body.small, color: colors.neutral.gray[200] }}>
                        {interactionPrompt}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSceneIndex((previous) => (previous + 1) % operatingTruthExperienceScenes.length)}
                      style={{
                        cursor: 'pointer',
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: radius.full,
                        border: `1px solid ${withAlpha(accentColor, 0.24)}`,
                        background: withAlpha(accentColor, 0.12),
                        color: colors.neutral.white,
                        ...typography.ui.caption,
                        minHeight: '44px',
                      }}
                    >
                      Load next NaviCue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ImmersiveSection>
  );
}
