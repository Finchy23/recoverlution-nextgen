import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import {
  colors,
  radius,
  spacing,
  typography,
  withAlpha,
} from '@/design-tokens';
import { clinicalLayers, clinicalVertebrae } from '@/content-tokens';
import { getSectionAsset } from '@/marketing-tokens';
import {
  ImmersiveSection,
  getImmersivePanelStyle,
  immersiveContentPadding,
  immersiveSectionPadding,
} from '@/app/components/marketing/ImmersiveSection';
import { useIsMobile } from '@/app/components/ui/use-mobile';

function HelixGlyph({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice">
      <motion.path
        d="M 128 0 Q 152 60 128 120 T 128 240"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray="10 8"
        animate={{ strokeDashoffset: [0, -72] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ opacity: 0.35 }}
      />
      <motion.path
        d="M 192 0 Q 168 60 192 120 T 192 240"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray="10 8"
        animate={{ strokeDashoffset: [0, 72] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ opacity: 0.28 }}
      />
      {[48, 96, 144, 192].map((y, index) => (
        <motion.line
          key={y}
          x1={136}
          y1={y}
          x2={184}
          y2={y}
          stroke={color}
          strokeWidth="1"
          strokeDasharray="5 5"
          animate={{ opacity: [0.14, 0.4, 0.14] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.2, ease: 'easeInOut' }}
        />
      ))}
      {[66, 114, 162].map((y, index) => (
        <motion.circle
          key={y}
          cx={index % 2 === 0 ? 128 : 192}
          cy={y}
          r="3.5"
          fill={color}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.25, 0.8, 0.25] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.35, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

function NetworkGlyph({ color }: { color: string }) {
  const nodes = [
    { x: 64, y: 60 },
    { x: 160, y: 32 },
    { x: 256, y: 64 },
    { x: 96, y: 128 },
    { x: 160, y: 136 },
    { x: 224, y: 128 },
    { x: 64, y: 192 },
    { x: 160, y: 208 },
    { x: 256, y: 188 },
  ];
  const edges = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
    [3, 4], [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8],
  ] as const;

  return (
    <svg width="100%" height="100%" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice">
      {edges.map(([start, end], index) => (
        <motion.line
          key={`${start}-${end}`}
          x1={nodes[start].x}
          y1={nodes[start].y}
          x2={nodes[end].x}
          y2={nodes[end].y}
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="8 6"
          animate={{ strokeDashoffset: [0, -56], opacity: [0.12, 0.32, 0.12] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.12, ease: 'linear' }}
        />
      ))}
      {nodes.map((node, index) => (
        <motion.circle
          key={`${node.x}-${node.y}`}
          cx={node.x}
          cy={node.y}
          r="3.5"
          fill={color}
          animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.22, 0.72, 0.22] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

function OrbitGlyph({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice">
      {[42, 72, 102].map((radiusValue, index) => (
        <motion.circle
          key={radiusValue}
          cx="160"
          cy="120"
          r={radiusValue}
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          strokeDasharray="8 8"
          animate={{ rotate: 360, opacity: [0.12, 0.28, 0.12] }}
          transition={{
            rotate: { duration: 8 + index * 2, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 2.4, repeat: Infinity, delay: index * 0.25, ease: 'easeInOut' },
          }}
          style={{ transformOrigin: '160px 120px' }}
        />
      ))}
      {[0, 120, 240].map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        const x = 160 + 88 * Math.cos(radians);
        const y = 120 + 88 * Math.sin(radians);
        return (
          <motion.circle
            key={angle}
            cx={x}
            cy={y}
            r="3.5"
            fill={color}
            animate={{ scale: [0.85, 1.35, 0.85], opacity: [0.22, 0.82, 0.22] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.32, ease: 'easeInOut' }}
          />
        );
      })}
      <motion.circle
        cx="160"
        cy="120"
        r="6"
        fill={color}
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

const glyphByPattern = {
  helix: HelixGlyph,
  network: NetworkGlyph,
  orbit: OrbitGlyph,
} as const;

export function ClinicalSpine({ mounted }: { mounted: boolean }) {
  const isMobile = useIsMobile();
  const [activeVertebraId, setActiveVertebraId] = useState(clinicalVertebrae[0]?.id ?? '');
  const [expandedVertebraId, setExpandedVertebraId] = useState<string | null>(clinicalVertebrae[0]?.id ?? null);
  const [rotationIndexById, setRotationIndexById] = useState<Record<string, number>>(
    () => Object.fromEntries(clinicalVertebrae.map((vertebra) => [vertebra.id, 0])),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationIndexById((previous) =>
        Object.fromEntries(
          clinicalVertebrae.map((vertebra) => {
            const count = vertebra.layerIds.length;
            return [vertebra.id, ((previous[vertebra.id] ?? 0) + 1) % count];
          }),
        ),
      );
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setActiveVertebraId((previous) => {
        const currentIndex = clinicalVertebrae.findIndex((vertebra) => vertebra.id === previous);
        const next = clinicalVertebrae[(currentIndex + 1) % clinicalVertebrae.length];
        return next?.id ?? previous;
      });
    }, 5200);

    return () => clearInterval(interval);
  }, [mounted]);

  const activeVertebra =
    clinicalVertebrae.find((vertebra) => vertebra.id === activeVertebraId) ?? clinicalVertebrae[0];

  const vertebraCards = useMemo(
    () =>
      clinicalVertebrae.map((vertebra) => ({
        vertebra,
        layers: clinicalLayers.filter((layer) => vertebra.layerIds.includes(layer.id)),
      })),
    [],
  );

  const assetUrl = getSectionAsset('nervousSystem', isMobile);

  return (
    <ImmersiveSection
      assetUrl={assetUrl}
      assetAlt="Clinical spine atmosphere"
      accentColor={activeVertebra.color}
      minHeight="100vh"
      style={{
        padding: isMobile ? immersiveSectionPadding.mobile : immersiveSectionPadding.desktop,
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: isMobile ? immersiveContentPadding.mobile : immersiveContentPadding.desktop,
        }}
      >
        <div style={{ position: 'relative' }}>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: isMobile ? '120px' : '132px',
              bottom: isMobile ? '120px' : '132px',
              left: '50%',
              width: '1px',
              transform: 'translateX(-50%)',
              background: `linear-gradient(180deg, transparent 0%, ${withAlpha(activeVertebra.color, 0.3)} 20%, ${withAlpha(activeVertebra.color, 0.4)} 50%, ${withAlpha(activeVertebra.color, 0.3)} 80%, transparent 100%)`,
              opacity: 0.9,
            }}
          />
          <motion.div
            aria-hidden="true"
            animate={{ top: ['14%', '86%'], opacity: [0, 1, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: '50%',
              width: isMobile ? '30px' : '42px',
              height: isMobile ? '30px' : '42px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha(activeVertebra.color, 0.45)} 0%, ${withAlpha(activeVertebra.color, 0.12)} 38%, transparent 74%)`,
              filter: 'blur(3px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'grid', gap: isMobile ? spacing.lg : spacing.xl }}>
            {vertebraCards.map(({ vertebra, layers }, index) => {
              const isActive = vertebra.id === activeVertebraId;
              const isExpanded = vertebra.id === expandedVertebraId;
              const rotationIndex = rotationIndexById[vertebra.id] ?? 0;
              const rotatingLayer = layers[rotationIndex % layers.length];
              const Glyph = glyphByPattern[vertebra.motionPattern];

              return (
                <motion.article
                  key={vertebra.id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 32 }}
                  transition={{ duration: 0.72, delay: index * 0.12, ease: [0.22, 0, 0, 1] }}
                  style={{
                    position: 'relative',
                    ...getImmersivePanelStyle({
                      accentColor: vertebra.color,
                      borderAlpha: isActive ? 0.3 : 0.14,
                      glowAlpha: isActive ? 0.14 : 0.06,
                      radiusValue: radius['2xl'],
                      variant: isActive ? 'card' : 'ultraLight',
                    }),
                  }}
                >
                  <motion.div
                    animate={{ opacity: isActive ? [0.3, 0.7, 0.3] : 0.18 }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '10%',
                      right: '10%',
                      height: '1.5px',
                      background: `linear-gradient(90deg, transparent 0%, ${vertebra.color} 50%, transparent 100%)`,
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      overflow: 'hidden',
                      opacity: isActive ? 0.38 : 0.2,
                    }}
                  >
                    <Glyph color={vertebra.color} />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveVertebraId(vertebra.id);
                      setExpandedVertebraId((previous) => (previous === vertebra.id ? null : vertebra.id));
                    }}
                    onMouseEnter={() => setActiveVertebraId(vertebra.id)}
                    style={{
                      width: '100%',
                      position: 'relative',
                      zIndex: 2,
                      background: 'transparent',
                      border: 'none',
                      color: colors.neutral.white,
                      cursor: 'pointer',
                      padding: isMobile ? `${spacing.xl} ${spacing.lg}` : `${spacing['2xl']} ${spacing.xl}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: spacing.md,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        ...typography.label.default,
                        color: withAlpha(vertebra.color, 0.9),
                      }}
                    >
                      {vertebra.name}
                    </div>

                    <div
                      style={{
                        ...typography.body.small,
                        color: colors.neutral.gray[400],
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                      }}
                    >
                      {vertebra.subtitle}
                    </div>

                    <h3
                      style={{
                        ...typography.display.large,
                        fontSize: isMobile ? 'clamp(40px, 11vw, 52px)' : 'clamp(52px, 7vw, 72px)',
                        fontFamily: typography.fontFamily.secondary,
                        fontWeight: '600',
                        color: colors.neutral.white,
                        margin: 0,
                      }}
                    >
                      {vertebra.displayName}
                    </h3>

                    <div style={{ minHeight: isMobile ? '46px' : '54px', display: 'flex', alignItems: 'center' }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${vertebra.id}-${rotationIndex}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.32, ease: [0.22, 0, 0, 1] }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              ...typography.heading.h5,
                              color: colors.neutral.white,
                            }}
                          >
                            {rotatingLayer.name}
                          </div>
                          <div
                            style={{
                              ...typography.ui.caption,
                              color: withAlpha(vertebra.color, 0.8),
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {rotatingLayer.tag}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <p
                      style={{
                        ...typography.body.small,
                        color: colors.neutral.gray[300],
                        maxWidth: '38rem',
                        margin: 0,
                      }}
                    >
                      {vertebra.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs }}>
                      {layers.slice(0, isMobile ? 3 : 4).map((layer) => (
                        <span
                          key={layer.id}
                          style={{
                            ...typography.ui.caption,
                            color: colors.neutral.gray[200],
                            padding: `6px ${spacing.sm}`,
                            borderRadius: radius.full,
                            border: `1px solid ${withAlpha(vertebra.color, 0.16)}`,
                            background: withAlpha(vertebra.color, 0.08),
                          }}
                        >
                          {layer.name}
                        </span>
                      ))}
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 0, 0, 1] }}
                      style={{ color: vertebra.color }}
                    >
                      <ChevronDown size={18} strokeWidth={2.4} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        key={`${vertebra.id}-expanded`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.22, 0, 0, 1] }}
                        style={{ overflow: 'hidden', position: 'relative', zIndex: 2 }}
                      >
                        <div
                          style={{
                            padding: isMobile ? `0 ${spacing.lg} ${spacing.xl}` : `0 ${spacing.xl} ${spacing['2xl']}`,
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                            gap: spacing.lg,
                          }}
                        >
                          {layers.map((layer, layerIndex) => {
                            const Icon = layer.icon;

                            return (
                              <motion.div
                                key={layer.id}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.28, delay: layerIndex * 0.06, ease: [0.22, 0, 0, 1] }}
                                whileHover={{ y: -4, scale: 1.01 }}
                                style={{
                                  position: 'relative',
                                  padding: isMobile ? spacing.lg : spacing.xl,
                                  ...getImmersivePanelStyle({
                                    accentColor: vertebra.color,
                                    borderAlpha: 0.18,
                                    glowAlpha: 0.08,
                                    radiusValue: radius.xl,
                                    variant: 'card',
                                  }),
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                                  <div
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: radius.md,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: withAlpha(vertebra.color, 0.12),
                                      border: `1px solid ${withAlpha(vertebra.color, 0.18)}`,
                                      color: vertebra.color,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Icon size={16} strokeWidth={2.2} />
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ ...typography.ui.caption, color: withAlpha(vertebra.color, 0.82) }}>
                                      Layer {layer.id}
                                    </div>
                                    <div style={{ ...typography.heading.h5, color: colors.neutral.white }}>
                                      {layer.name}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ ...typography.body.small, color: colors.neutral.gray[300], marginBottom: spacing.sm }}>
                                  {layer.tagline}
                                </div>

                                <div style={{ ...typography.ui.caption, color: colors.neutral.gray[500], marginBottom: spacing.md }}>
                                  {layer.question}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                                  {layer.contents.map((content) => (
                                    <span
                                      key={`${layer.id}-${content}`}
                                      style={{
                                        ...typography.ui.caption,
                                        color: colors.neutral.gray[200],
                                        padding: `5px ${spacing.sm}`,
                                        borderRadius: radius.full,
                                        background: withAlpha(layer.color, 0.12),
                                        border: `1px solid ${withAlpha(layer.color, 0.16)}`,
                                      }}
                                    >
                                      {content}
                                    </span>
                                  ))}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </ImmersiveSection>
  );
}
