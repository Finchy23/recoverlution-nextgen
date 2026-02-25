/**
 * ATLAS DASHBOARD
 * 
 * The capstone view for the completed 1000-specimen NaviCue system.
 * Visual overview of all 94 narrative acts across 9 centuries,
 * with signature distributions, KBE breakdowns, and series cards.
 * 
 * Apple-grade UX — glass surfaces, spring animations, clean typography.
 */

import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import {
  ALL_SERIES,
  TOTAL_SPECIMENS,
  TOTAL_ACTS,
  TOTAL_CENTURIES,
  getCenturyMetadata,
  getSignatureDistribution,
  SIGNATURE_DISPLAY,
  VALID_SIGNATURES,
  type SeriesMeta,
  type CenturyMeta,
} from '@/app/data/atlas-series-metadata';
import {
  Sparkles,
  Eye,
  PenTool,
  Atom,
  Infinity,
  Zap,
  Film,
  Users,
  ChevronDown,
  ChevronUp,
  Crown,
  Layers,
  Globe,
  BarChart3,
} from 'lucide-react';

// ── Signature icon mapping ──────────────────────────────────────
const SIGNATURE_ICONS: Record<string, React.ComponentType<any>> = {
  sacred_ordinary: Sparkles,
  witness_ritual: Eye,
  poetic_precision: PenTool,
  science_x_soul: Atom,
  koan_paradox: Infinity,
  pattern_glitch: Zap,
  sensory_cinema: Film,
  relational_ghost: Users,
};

interface AtlasDashboardProps {
  mounted: boolean;
}

export function AtlasDashboard({ mounted }: AtlasDashboardProps) {
  const [expandedCentury, setExpandedCentury] = useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesMeta | null>(null);
  const [viewMode, setViewMode] = useState<'centuries' | 'signatures' | 'grid'>('centuries');

  const centuries = useMemo(() => getCenturyMetadata(), []);
  const signatureDistribution = useMemo(() => getSignatureDistribution(), []);
  const foundationSeries = useMemo(() => ALL_SERIES.filter(s => s.century === 0), []);
  const numberedSeries = useMemo(() => ALL_SERIES.filter(s => s.century > 0), []);

  // Total completion percentage (all 1000 of target 1000)
  const completionPct = 100;

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: fonts.primary,
      }}
    >
      {/* ── Hero Stats ────────────────────────────────────── */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'hsla(42, 50%, 60%, 0.7)',
              marginBottom: '12px',
            }}
          >
            THE COMPLETE ATLAS
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: '200',
              color: colors.neutral.white,
              letterSpacing: '-1px',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            {TOTAL_SPECIMENS.toLocaleString()}
            <span style={{ fontSize: '18px', opacity: 0.4, marginLeft: '8px', fontWeight: '400' }}>
              specimens
            </span>
          </div>
          <div
            style={{
              fontSize: '14px',
              color: colors.neutral.gray[400],
              fontWeight: '400',
            }}
          >
            {TOTAL_ACTS} narrative acts &middot; {TOTAL_CENTURIES} centuries &middot; 8 magic signatures
          </div>
        </motion.div>

        {/* Completion bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          style={{
            maxWidth: '400px',
            margin: '24px auto 0',
            height: '3px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${completionPct}%` }}
            transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, hsla(42, 50%, 55%, 0.6), hsla(42, 60%, 65%, 0.8))',
            }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            fontSize: '11px',
            color: 'hsla(42, 50%, 60%, 0.5)',
            marginTop: '8px',
            fontWeight: '500',
          }}
        >
          SYSTEM COMPLETE
        </motion.div>
      </div>

      {/* ── Stat Cards Row ────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        {[
          { label: 'Foundation', value: foundationSeries.reduce((s, f) => s + f.specimenCount, 0).toString(), icon: Crown, color: 'hsla(42, 50%, 55%, 0.6)' },
          { label: 'Centuries', value: TOTAL_CENTURIES.toString(), icon: Layers, color: 'hsla(200, 35%, 50%, 0.6)' },
          { label: 'Acts', value: TOTAL_ACTS.toString(), icon: Globe, color: 'hsla(260, 35%, 55%, 0.6)' },
          { label: 'Signatures', value: '8', icon: BarChart3, color: 'hsla(340, 30%, 50%, 0.6)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
            style={{
              padding: '20px',
              borderRadius: '12px',
              background: surfaces.glass.light,
              border: `1px solid ${colors.neutral.gray[100]}`,
              textAlign: 'center',
            }}
          >
            <stat.icon size={18} style={{ color: stat.color, marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '300', color: colors.neutral.white }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: colors.neutral.gray[500], letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── View Mode Tabs ────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '32px',
          padding: '4px',
          background: surfaces.glass.medium,
          borderRadius: '10px',
          border: `1px solid ${colors.neutral.gray[100]}`,
          width: 'fit-content',
        }}
      >
        {(['centuries', 'signatures', 'grid'] as const).map(mode => (
          <motion.button
            key={mode}
            onClick={() => setViewMode(mode)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '8px 20px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: viewMode === mode ? '500' : '400',
              fontFamily: fonts.primary,
              color: viewMode === mode ? colors.neutral.white : colors.neutral.gray[500],
              background: viewMode === mode ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {mode === 'centuries' ? 'Centuries' : mode === 'signatures' ? 'Signatures' : 'Full Grid'}
          </motion.button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'centuries' && (
          <CenturyView
            key="centuries"
            centuries={centuries}
            foundationSeries={foundationSeries}
            numberedSeries={numberedSeries}
            expandedCentury={expandedCentury}
            onToggleCentury={(c) => setExpandedCentury(expandedCentury === c ? null : c)}
            selectedSeries={selectedSeries}
            onSelectSeries={setSelectedSeries}
          />
        )}
        {viewMode === 'signatures' && (
          <SignatureView
            key="signatures"
            distribution={signatureDistribution}
            allSeries={ALL_SERIES}
          />
        )}
        {viewMode === 'grid' && (
          <FullGridView
            key="grid"
            allSeries={numberedSeries}
            selectedSeries={selectedSeries}
            onSelectSeries={setSelectedSeries}
          />
        )}
      </AnimatePresence>

      {/* ── Series Detail Panel ────────────────────────────── */}
      <AnimatePresence>
        {selectedSeries && (
          <SeriesDetailPanel
            series={selectedSeries}
            onClose={() => setSelectedSeries(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CENTURY VIEW
// ═══════════════════════════════════════════════════════════════

function CenturyView({
  centuries,
  foundationSeries,
  numberedSeries,
  expandedCentury,
  onToggleCentury,
  selectedSeries,
  onSelectSeries,
}: {
  centuries: CenturyMeta[];
  foundationSeries: SeriesMeta[];
  numberedSeries: SeriesMeta[];
  expandedCentury: number | null;
  onToggleCentury: (c: number) => void;
  selectedSeries: SeriesMeta | null;
  onSelectSeries: (s: SeriesMeta | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Foundation */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'hsla(42, 50%, 60%, 0.5)',
            marginBottom: '12px',
          }}
        >
          Foundation
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {foundationSeries.map((s, i) => (
            <motion.button
              key={s.seriesNumber + '-' + i}
              onClick={() => onSelectSeries(selectedSeries?.actLabel === s.actLabel ? null : s)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              style={{
                padding: '8px 14px',
                borderRadius: radius.sm,
                border: `1px solid ${selectedSeries?.actLabel === s.actLabel ? s.accentHue : colors.neutral.gray[100]}`,
                background: selectedSeries?.actLabel === s.actLabel ? s.accentHue.replace(/[\d.]+\)$/, '0.15)') : surfaces.glass.light,
                cursor: 'pointer',
                fontFamily: fonts.primary,
                fontSize: '12px',
                fontWeight: '400',
                color: colors.neutral.gray[400],
              }}
            >
              <span style={{ fontSize: '10px', opacity: 0.5 }}>{s.actLabel}</span>
              <span style={{ marginLeft: '6px', color: s.accentHue, fontWeight: '500' }}>{s.specimenCount}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Centuries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {centuries.map((century, ci) => {
          const isExpanded = expandedCentury === century.number;
          const centurySeries = numberedSeries.filter(s => s.century === century.number);

          return (
            <motion.div
              key={century.number}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * ci, duration: 0.4 }}
              style={{
                borderRadius: '12px',
                border: `1px solid ${isExpanded ? 'rgba(255, 255, 255, 0.08)' : colors.neutral.gray[100]}`,
                background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : surfaces.glass.light,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Century Header */}
              <motion.button
                onClick={() => onToggleCentury(century.number)}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: 'none',
                  backgroundColor: 'rgba(0,0,0,0)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: fonts.primary,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Century indicator dots */}
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {centurySeries.slice(0, 10).map((s, i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: s.accentHue,
                        }}
                      />
                    ))}
                    {centurySeries.length > 10 && (
                      <>
                        {centurySeries.slice(10).map((s, i) => (
                          <div
                            key={i + 10}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: s.accentHue,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: colors.neutral.white }}>
                      {century.name}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '2px' }}>
                      {century.seriesRange} &middot; {century.actRange}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '18px', fontWeight: '300', color: colors.neutral.white }}>
                      {century.specimenCount}
                    </span>
                    <span style={{ fontSize: '11px', color: colors.neutral.gray[500], marginLeft: '6px' }}>
                      specimens
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} style={{ color: colors.neutral.gray[500] }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: colors.neutral.gray[500] }} />
                  )}
                </div>
              </motion.button>

              {/* Expanded Series Grid */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        padding: '0 20px 20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '10px',
                      }}
                    >
                      {centurySeries.map((series, si) => (
                        <SeriesCard
                          key={series.seriesNumber}
                          series={series}
                          index={si}
                          isSelected={selectedSeries?.seriesNumber === series.seriesNumber}
                          onSelect={() => onSelectSeries(
                            selectedSeries?.seriesNumber === series.seriesNumber ? null : series
                          )}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SERIES CARD
// ═══════════════════════════════════════════════════════════════

function SeriesCard({
  series,
  index,
  isSelected,
  onSelect,
}: {
  series: SeriesMeta;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const sigInfo = SIGNATURE_DISPLAY[series.magicSignature];
  const SigIcon = SIGNATURE_ICONS[series.magicSignature] || Sparkles;

  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        border: `1px solid ${isSelected ? series.accentHue : 'rgba(255, 255, 255, 0.04)'}`,
        background: isSelected
          ? series.accentHue.replace(/[\d.]+\)$/, '0.1)')
          : 'rgba(255, 255, 255, 0.015)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: fonts.primary,
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginBottom: '4px' }}>
            S{series.seriesNumber} &middot; {series.actLabel}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white, marginBottom: '4px' }}>
            {series.name}
          </div>
          <div style={{ fontSize: '11px', color: colors.neutral.gray[500] }}>
            {series.collection}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            background: series.accentHue.replace(/[\d.]+\)$/, '0.15)'),
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '400', color: series.accentHue.replace(/[\d.]+\)$/, '1)') }}>
            {series.specimenCount}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        }}
      >
        <SigIcon size={10} style={{ color: sigInfo?.color || series.accentHue, opacity: 0.7 }} />
        <span style={{ fontSize: '10px', color: colors.neutral.gray[600] }}>
          {sigInfo?.label || series.magicSignature}
        </span>
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIGNATURE VIEW
// ═══════════════════════════════════════════════════════════════

function SignatureView({
  distribution,
  allSeries,
}: {
  distribution: { signature: string; count: number; percentage: number }[];
  allSeries: SeriesMeta[];
}) {
  const [expandedSig, setExpandedSig] = useState<string | null>(null);
  const sorted = [...distribution].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...sorted.map(d => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      {sorted.map((item, i) => {
        const sigInfo = SIGNATURE_DISPLAY[item.signature];
        const SigIcon = SIGNATURE_ICONS[item.signature] || Sparkles;
        const isExpanded = expandedSig === item.signature;
        const matchingSeries = allSeries.filter(s => s.magicSignature === item.signature);

        return (
          <motion.div
            key={item.signature}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            style={{
              borderRadius: '12px',
              border: `1px solid ${isExpanded ? 'rgba(255, 255, 255, 0.08)' : colors.neutral.gray[100]}`,
              background: surfaces.glass.light,
              overflow: 'hidden',
            }}
          >
            <motion.button
              onClick={() => setExpandedSig(isExpanded ? null : item.signature)}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: 'none',
                backgroundColor: 'rgba(0,0,0,0)',
                cursor: 'pointer',
                fontFamily: fonts.primary,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: radius.sm,
                      background: (sigInfo?.color || 'hsla(0,0%,50%,0.5)').replace(/[\d.]+\)$/, '0.15)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SigIcon size={14} style={{ color: sigInfo?.color || 'white' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: colors.neutral.white }}>
                      {sigInfo?.label || item.signature}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.neutral.gray[500] }}>
                      {matchingSeries.length} series
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '300', color: colors.neutral.white }}>
                    {item.count}
                  </span>
                  <span style={{ fontSize: '12px', color: colors.neutral.gray[500] }}>
                    {item.percentage}%
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={14} style={{ color: colors.neutral.gray[500] }} />
                  ) : (
                    <ChevronDown size={14} style={{ color: colors.neutral.gray[500] }} />
                  )}
                </div>
              </div>

              {/* Bar */}
              <div
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: '2px',
                    background: sigInfo?.color || 'hsla(0,0%,50%,0.5)',
                  }}
                />
              </div>
            </motion.button>

            {/* Expanded series list */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {matchingSeries.map(s => (
                      <div
                        key={s.seriesNumber + '-' + s.actLabel}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid rgba(255, 255, 255, 0.04)`,
                          fontSize: '11px',
                          color: colors.neutral.gray[400],
                        }}
                      >
                        <span style={{ opacity: 0.5 }}>S{s.seriesNumber}</span>{' '}
                        {s.name}
                        <span style={{ marginLeft: '6px', opacity: 0.4 }}>{s.specimenCount}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FULL GRID VIEW
// ═══════════════════════════════════════════════════════════════

function FullGridView({
  allSeries,
  selectedSeries,
  onSelectSeries,
}: {
  allSeries: SeriesMeta[];
  selectedSeries: SeriesMeta | null;
  onSelectSeries: (s: SeriesMeta | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Visual heatmap-style grid */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: colors.neutral.gray[500],
            marginBottom: '16px',
          }}
        >
          ALL {allSeries.length} SERIES
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))',
            gap: '4px',
            marginBottom: '32px',
          }}
        >
          {allSeries.map((s, i) => (
            <motion.button
              key={s.seriesNumber}
              onClick={() => onSelectSeries(selectedSeries?.seriesNumber === s.seriesNumber ? null : s)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005, duration: 0.3 }}
              whileHover={{ scale: 1.4, zIndex: 10 }}
              whileTap={{ scale: 0.9 }}
              title={`S${s.seriesNumber} · ${s.name} (${s.specimenCount})`}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: radius.xs,
                border: selectedSeries?.seriesNumber === s.seriesNumber
                  ? '2px solid rgba(255,255,255,0.5)'
                  : '1px solid rgba(255, 255, 255, 0.03)',
                background: s.accentHue,
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
              }}
            />
          ))}
        </div>
      </div>

      {/* Detailed list */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '10px',
        }}
      >
        {allSeries.map((series, i) => (
          <SeriesCard
            key={series.seriesNumber}
            series={series}
            index={i}
            isSelected={selectedSeries?.seriesNumber === series.seriesNumber}
            onSelect={() => onSelectSeries(
              selectedSeries?.seriesNumber === series.seriesNumber ? null : series
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SERIES DETAIL PANEL
// ═══════════════════════════════════════════════════════════════

function SeriesDetailPanel({
  series,
  onClose,
}: {
  series: SeriesMeta;
  onClose: () => void;
}) {
  const sigInfo = SIGNATURE_DISPLAY[series.magicSignature];
  const SigIcon = SIGNATURE_ICONS[series.magicSignature] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '600px',
        width: 'calc(100% - 48px)',
        padding: '24px',
        borderRadius: '16px',
        background: 'rgba(20, 20, 22, 0.95)',
        backdropFilter: 'blur(40px) saturate(200%)',
        border: `1px solid ${series.accentHue.replace(/[\d.]+\)$/, '0.3)')}`,
        zIndex: 100,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: series.accentHue,
              }}
            />
            <span style={{ fontSize: '11px', color: colors.neutral.gray[500], letterSpacing: '1px' }}>
              SERIES {series.seriesNumber} &middot; {series.actLabel} &middot; CENTURY {series.century || 'F'}
            </span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '400', color: colors.neutral.white, marginBottom: '6px' }}>
            {series.name}
          </div>
          <div style={{ fontSize: '13px', color: colors.neutral.gray[400] }}>
            {series.collection}
          </div>
        </div>

        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: radius.sm,
            border: `1px solid ${colors.neutral.gray[100]}`,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.neutral.gray[500],
            fontSize: '14px',
            fontFamily: fonts.primary,
          }}
        >
          &times;
        </motion.button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: `1px solid rgba(255, 255, 255, 0.04)`,
        }}
      >
        <div>
          <div style={{ fontSize: '24px', fontWeight: '300', color: series.accentHue.replace(/[\d.]+\)$/, '1)') }}>
            {series.specimenCount}
          </div>
          <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '2px' }}>
            specimens
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SigIcon size={16} style={{ color: sigInfo?.color || series.accentHue }} />
            <span style={{ fontSize: '13px', color: colors.neutral.white }}>
              {sigInfo?.label || series.magicSignature}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '4px' }}>
            magic signature
          </div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: colors.neutral.white, fontFamily: fonts.mono }}>
            {series.prefix}*
          </div>
          <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '4px' }}>
            component prefix
          </div>
        </div>
      </div>

      {/* Specimen dots visualization */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {Array.from({ length: series.specimenCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 * i, duration: 0.3, type: 'spring', stiffness: 500 }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: series.accentHue,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}