/**
 * REGISTRY DASHBOARD
 *
 * Visualizes the 1,000-specimen NaviCue registry:
 *   - Generation breakdown (Gen 1/2/3 + Reference) with Recharts
 *   - Structural traits heatmap
 *   - Color authority audit
 *   - Migration progress (dual -> single authority)
 *   - Series Explorer with century grouping, color configs, specimens
 *   - Signature distribution chart
 *
 * Powered by navicue-registry.ts data layer.
 * Apple-grade UX: glass surfaces, spring animations, clean typography.
 */

import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getRegistryStats,
  auditDualAuthorityDependencies,
  SERIES_QUICKSTART_PARAMS,
  SLUG_TO_SERIES,
  LAB_SPECIMENS,
  getUnifiedColorConfig,
  getSeriesMetadata,
  type Generation,
} from '@/app/data/navicue-registry';
import {
  SERIES_REGISTRY,
  registryThemeColor,
  type SeriesRegistryEntry,
} from '@/app/design-system/navicue-blueprint';
import {
  ALL_SERIES,
  getCenturyMetadata,
  getSignatureDistribution,
  SIGNATURE_DISPLAY,
  type SeriesMeta,
} from '@/app/data/atlas-series-metadata';
import {
  Layers,
  Shield,
  Palette,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Zap,
  Eye,
  Target,
  Search,
} from 'lucide-react';

// ── View modes ──────────────────────────────────────────────────
type ViewMode = 'overview' | 'generations' | 'colors' | 'migration' | 'explorer';

interface RegistryDashboardProps {
  mounted: boolean;
}

export function RegistryDashboard({ mounted }: RegistryDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const stats = useMemo(() => getRegistryStats(), []);
  const audit = useMemo(() => auditDualAuthorityDependencies(), []);

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
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        style={{ marginBottom: '48px', textAlign: 'center' }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'hsla(200, 40%, 55%, 0.7)',
            marginBottom: '12px',
          }}
        >
          NAVICUE REGISTRY
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
          {stats.totalSpecimens.toLocaleString()}
          <span style={{ fontSize: '18px', opacity: 0.4, marginLeft: '8px', fontWeight: '400' }}>
            indexed specimens
          </span>
        </div>
        <div
          style={{
            fontSize: '14px',
            color: colors.neutral.gray[400],
            fontWeight: '400',
          }}
        >
          3 generations &middot; {stats.totalSeries} series &middot; {Object.keys(SERIES_REGISTRY).length} theme entries &middot; {stats.totalSeriesSlugs} slugs
        </div>
      </motion.div>

      {/* Stat Cards + Mini Chart Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 280px',
          gap: '16px',
          marginBottom: '40px',
          alignItems: 'stretch',
        }}
      >
        {[
          {
            label: 'Gen 1',
            sublabel: 'Clinical',
            value: stats.byGeneration.find(g => g.gen === 1)?.count ?? 0,
            pct: stats.byGeneration.find(g => g.gen === 1)?.percentage ?? 0,
            icon: Shield,
            color: 'hsla(42, 50%, 55%, 0.6)',
          },
          {
            label: 'Gen 2',
            sublabel: 'Foundation',
            value: stats.byGeneration.find(g => g.gen === 2)?.count ?? 0,
            pct: stats.byGeneration.find(g => g.gen === 2)?.percentage ?? 0,
            icon: Layers,
            color: 'hsla(200, 40%, 50%, 0.6)',
          },
          {
            label: 'Gen 3',
            sublabel: 'Extended',
            value: stats.byGeneration.find(g => g.gen === 3)?.count ?? 0,
            pct: stats.byGeneration.find(g => g.gen === 3)?.percentage ?? 0,
            icon: Palette,
            color: 'hsla(270, 35%, 55%, 0.6)',
          },
          {
            label: 'Reference',
            sublabel: 'TranscendenceSeal',
            value: 1,
            pct: 0,
            icon: Target,
            color: 'hsla(160, 40%, 45%, 0.6)',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
            style={{
              padding: '20px',
              borderRadius: '12px',
              background: surfaces.glass.light,
              border: `1px solid ${colors.neutral.gray[100]}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <stat.icon size={14} style={{ color: stat.color }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: colors.neutral.gray[500], letterSpacing: '1px', textTransform: 'uppercase' }}>
                {stat.label}
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '300', color: colors.neutral.white, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: colors.neutral.gray[600] }}>
              {stat.sublabel}
              {stat.pct > 0 && <span style={{ marginLeft: '8px', opacity: 0.5 }}>{stat.pct}%</span>}
            </div>
          </motion.div>
        ))}

        {/* Mini donut chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GenerationDonut stats={stats} />
          <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Generation mix
          </div>
        </motion.div>
      </div>

      {/* View Mode Tabs */}
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
        {([
          { key: 'overview' as const, label: 'Structural Traits' },
          { key: 'generations' as const, label: 'Generations' },
          { key: 'colors' as const, label: 'Color Authority' },
          { key: 'migration' as const, label: 'Migration' },
          { key: 'explorer' as const, label: 'Series Explorer' },
        ]).map(tab => (
          <motion.button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '8px 20px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: viewMode === tab.key ? '500' : '400',
              fontFamily: fonts.primary,
              color: viewMode === tab.key ? colors.neutral.white : colors.neutral.gray[500],
              background: viewMode === tab.key ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && <TraitsView key="traits" stats={stats} />}
        {viewMode === 'generations' && <GenerationView key="generations" stats={stats} />}
        {viewMode === 'colors' && <ColorAuthorityView key="colors" />}
        {viewMode === 'migration' && <MigrationView key="migration" audit={audit} />}
        {viewMode === 'explorer' && <SeriesExplorer key="explorer" stats={stats} />}
      </AnimatePresence>
    </motion.div>
  );
}

// =================================================================
// GENERATION DONUT (Recharts)
// =================================================================

function GenerationDonut({ stats }: { stats: ReturnType<typeof getRegistryStats> }) {
  const data = [
    { name: 'Gen 1', value: stats.byGeneration.find(g => g.gen === 1)?.count ?? 0 },
    { name: 'Gen 2', value: stats.byGeneration.find(g => g.gen === 2)?.count ?? 0 },
    { name: 'Gen 3', value: stats.byGeneration.find(g => g.gen === 3)?.count ?? 0 },
    { name: 'Ref', value: 1 },
  ];
  const GEN_COLORS = ['hsla(42, 50%, 55%, 0.8)', 'hsla(200, 40%, 50%, 0.8)', 'hsla(270, 35%, 55%, 0.8)', 'hsla(160, 40%, 45%, 0.8)'];

  return (
    <ResponsiveContainer width="100%" height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={28}
          outerRadius={44}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={GEN_COLORS[i]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(20, 20, 22, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            fontFamily: fonts.primary,
            fontSize: '12px',
            color: colors.neutral.white,
          }}
          itemStyle={{ color: colors.neutral.gray[400] }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// =================================================================
// STRUCTURAL TRAITS VIEW
// =================================================================

function TraitsView({ stats }: { stats: ReturnType<typeof getRegistryStats> }) {
  const signatureDistribution = useMemo(() => getSignatureDistribution(), []);

  const traits = [
    {
      label: 'NaviCueShell',
      description: 'Uses the shared container component',
      count: stats.traits.usesNaviCueShell,
      total: stats.totalSpecimens,
      icon: Layers,
      color: 'hsla(200, 40%, 50%, 0.8)',
      generations: 'Gen 2, 3',
    },
    {
      label: 'navicueQuickstart()',
      description: 'Uses palette/atmosphere/motion quickstart',
      count: stats.traits.usesQuickstart,
      total: stats.totalSpecimens,
      icon: Zap,
      color: 'hsla(42, 50%, 55%, 0.8)',
      generations: 'Gen 2, 3',
    },
    {
      label: 'seriesThemes',
      description: 'Dual color authority (migration target)',
      count: stats.traits.usesSeriesThemes,
      total: stats.totalSpecimens,
      icon: Palette,
      color: 'hsla(270, 35%, 55%, 0.8)',
      generations: 'Gen 3',
    },
    {
      label: 'composeMechanics()',
      description: 'New delivery primitive composition',
      count: stats.traits.usesComposeMechanics,
      total: stats.totalSpecimens,
      icon: Cpu,
      color: 'hsla(160, 40%, 45%, 0.8)',
      generations: 'Reference only',
    },
    {
      label: 'New Primitives',
      description: 'useBreathEngine + useTextMaterializer + useReceiptCeremony',
      count: stats.traits.usesNewPrimitives,
      total: stats.totalSpecimens,
      icon: GitBranch,
      color: 'hsla(340, 35%, 50%, 0.8)',
      generations: 'Reference only',
    },
  ];

  // Signature bar chart data
  const sigChartData = signatureDistribution
    .sort((a, b) => b.count - a.count)
    .map(s => ({
      name: SIGNATURE_DISPLAY[s.signature]?.label ?? s.signature,
      value: s.count,
      fill: SIGNATURE_DISPLAY[s.signature]?.color ?? 'hsla(0,0%,40%,0.5)',
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Traits list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
        {traits.map((trait, i) => {
          const pct = Math.round((trait.count / trait.total) * 100);
          return (
            <motion.div
              key={trait.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: surfaces.glass.light,
                border: `1px solid ${colors.neutral.gray[100]}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: trait.color.replace(/[\d.]+\)$/, '0.12)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <trait.icon size={16} style={{ color: trait.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: colors.neutral.white }}>
                      {trait.label}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.neutral.gray[500], marginTop: '2px' }}>
                      {trait.description}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '300', color: colors.neutral.white }}>
                      {trait.count}
                    </span>
                    <span style={{ fontSize: '12px', color: colors.neutral.gray[500] }}>
                      / {trait.total}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '2px' }}>
                    {trait.generations}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
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
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: '2px',
                    background: trait.color,
                  }}
                />
              </div>
              <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '6px', textAlign: 'right' }}>
                {pct}% adoption
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Signature Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{
          padding: '24px',
          borderRadius: '12px',
          background: surfaces.glass.light,
          border: `1px solid ${colors.neutral.gray[100]}`,
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '16px' }}>
          MAGIC SIGNATURE DISTRIBUTION
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={sigChartData} layout="vertical" margin={{ left: 110, right: 24, top: 4, bottom: 4 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: colors.neutral.gray[600] }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: colors.neutral.gray[400] }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(20, 20, 22, 0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                fontFamily: fonts.primary,
                fontSize: '12px',
                color: colors.neutral.white,
              }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              formatter={(value: number) => [`${value} specimens`, 'Count']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
              {sigChartData.map((entry, i) => (
                <Cell key={`bar-${i}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}

// =================================================================
// GENERATION VIEW
// =================================================================

function GenerationView({ stats }: { stats: ReturnType<typeof getRegistryStats> }) {
  const [expanded, setExpanded] = useState<Generation | null>(null);

  // Century bar chart data
  const centuryData = stats.byCentury.map(c => ({
    name: c.century === 0 ? 'Found.' : `C${c.century}`,
    value: c.count,
  }));

  const genConfigs: {
    gen: Generation;
    label: string;
    description: string;
    color: string;
    traits: string[];
    outliers: string[];
  }[] = [
    {
      gen: 1,
      label: 'Gen 1: Clinical Integrations',
      description: '33 files without NaviCueShell. Direct design-tokens imports. Props: { primary_prompt, cta_primary, onComplete }.',
      color: 'hsla(42, 50%, 55%, 0.7)',
      traits: ['No NaviCueShell', 'No quickstart', 'No seriesThemes', 'Direct token imports'],
      outliers: ['Novice_PatternGlitch (Gen 1 in Gen 2 series S6)'],
    },
    {
      gen: 2,
      label: 'Gen 2: Foundation Series',
      description: '~316 files with NaviCueShell + navicueQuickstart. Single color authority via palette. Clean, self-contained.',
      color: 'hsla(200, 40%, 50%, 0.7)',
      traits: ['NaviCueShell', 'navicueQuickstart()', 'Palette-only color', 'Self-contained'],
      outliers: ['S6-S34 (minus Novice outlier)', 'S100 Ouroboros (Gen 2 despite being last)'],
    },
    {
      gen: 3,
      label: 'Gen 3: Extended Series',
      description: '~651 files with full Gen 2 pattern PLUS seriesThemes. Dual color authority via themeColor(TH.accentHSL, alpha, offset).',
      color: 'hsla(270, 35%, 55%, 0.7)',
      traits: ['NaviCueShell', 'navicueQuickstart()', 'seriesThemes (dual color)', 'S35-S99 range'],
      outliers: ['Mystic_MysticSeal (Gen 3 outlier in Gen 2 series S33)'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Century distribution chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        style={{
          padding: '24px',
          borderRadius: '12px',
          background: surfaces.glass.light,
          border: `1px solid ${colors.neutral.gray[100]}`,
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '16px' }}>
          SPECIMENS BY CENTURY
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={centuryData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: colors.neutral.gray[500] }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: colors.neutral.gray[600] }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(20, 20, 22, 0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                fontFamily: fonts.primary,
                fontSize: '12px',
                color: colors.neutral.white,
              }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              formatter={(value: number) => [`${value} specimens`, 'Count']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32} fill="hsla(200, 30%, 40%, 0.5)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Generation cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {genConfigs.map((config, i) => {
          const genStat = stats.byGeneration.find(g => g.gen === config.gen);
          const isExpanded = expanded === config.gen;

          return (
            <motion.div
              key={config.gen}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{
                borderRadius: '12px',
                border: `1px solid ${isExpanded ? config.color.replace(/[\d.]+\)$/, '0.3)') : colors.neutral.gray[100]}`,
                background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : surfaces.glass.light,
                overflow: 'hidden',
                transition: 'border-color 0.3s ease',
              }}
            >
              <motion.button
                onClick={() => setExpanded(isExpanded ? null : config.gen)}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  border: 'none',
                  backgroundColor: 'rgba(0,0,0,0)',
                  cursor: 'pointer',
                  fontFamily: fonts.primary,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: config.color.replace(/[\d.]+\)$/, '0.12)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: config.color.replace(/[\d.]+\)$/, '1)'),
                      }}
                    >
                      G{config.gen}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: colors.neutral.white }}>
                        {config.label}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.neutral.gray[500], marginTop: '2px', maxWidth: '500px' }}>
                        {config.description}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '24px', fontWeight: '300', color: colors.neutral.white }}>
                        {genStat?.count ?? 0}
                      </span>
                      <span style={{ fontSize: '12px', color: colors.neutral.gray[500], marginLeft: '6px' }}>
                        {genStat?.percentage ?? 0}%
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} style={{ color: colors.neutral.gray[500] }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: colors.neutral.gray[500] }} />
                    )}
                  </div>
                </div>

                {/* Inline bar */}
                <div
                  style={{
                    height: '3px',
                    borderRadius: '2px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    marginTop: '16px',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${genStat?.percentage ?? 0}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: '2px',
                      background: config.color,
                    }}
                  />
                </div>
              </motion.button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 24px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '8px' }}>
                            STRUCTURAL TRAITS
                          </div>
                          {config.traits.map(trait => (
                            <div
                              key={trait}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 0',
                                fontSize: '12px',
                                color: colors.neutral.gray[400],
                              }}
                            >
                              <CheckCircle2 size={12} style={{ color: config.color }} />
                              {trait}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '8px' }}>
                            OUTLIERS
                          </div>
                          {config.outliers.map(outlier => (
                            <div
                              key={outlier}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 0',
                                fontSize: '12px',
                                color: colors.neutral.gray[400],
                              }}
                            >
                              <AlertCircle size={12} style={{ color: 'hsla(42, 50%, 55%, 0.6)' }} />
                              {outlier}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Reference Specimen */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            padding: '20px 24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(160, 200, 180, 0.04) 0%, rgba(160, 180, 220, 0.04) 100%)',
            border: '1px solid hsla(160, 40%, 45%, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Target size={16} style={{ color: 'hsla(160, 40%, 45%, 0.8)' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: colors.neutral.white }}>
              Reference Specimen: Mystic_TranscendenceSeal
            </span>
          </div>
          <div style={{ fontSize: '12px', color: colors.neutral.gray[400], lineHeight: 1.6 }}>
            The canonical template for all future specimens. Uses the complete new stack: navicueQuickstart + composeMechanics + useBreathEngine + useTextMaterializer + useReceiptCeremony + useNaviCueStages. Single color authority. No seriesThemes import. Tagged as Gen 3 by series placement (S92) but structurally pioneering.
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// =================================================================
// COLOR AUTHORITY VIEW
// =================================================================

function ColorAuthorityView() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const registrySlugs = Object.keys(SERIES_REGISTRY);

  const hueGroups = useMemo(() => {
    const groups: { label: string; range: string; entries: { slug: string; entry: SeriesRegistryEntry }[] }[] = [
      { label: 'Warm Earth', range: '0-60', entries: [] },
      { label: 'Green/Teal', range: '90-200', entries: [] },
      { label: 'Cool Blue', range: '200-240', entries: [] },
      { label: 'Violet/Purple', range: '240-300', entries: [] },
      { label: 'Achromatic', range: 'S<5', entries: [] },
    ];

    for (const slug of registrySlugs) {
      const entry = SERIES_REGISTRY[slug];
      const [h, s] = entry.primaryHSL;

      if (s < 5) {
        groups[4].entries.push({ slug, entry });
      } else if (h < 60 || h >= 340) {
        groups[0].entries.push({ slug, entry });
      } else if (h < 200) {
        groups[1].entries.push({ slug, entry });
      } else if (h < 240) {
        groups[2].entries.push({ slug, entry });
      } else {
        groups[3].entries.push({ slug, entry });
      }
    }

    return groups.filter(g => g.entries.length > 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Registry stats */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
            fontSize: '13px',
            color: colors.neutral.gray[400],
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: '300', color: colors.neutral.white, marginRight: '8px' }}>
            {registrySlugs.length}
          </span>
          registered themes
        </div>
        <div
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
            fontSize: '13px',
            color: colors.neutral.gray[400],
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: '300', color: colors.neutral.white, marginRight: '8px' }}>
            {Object.keys(SERIES_QUICKSTART_PARAMS).length}
          </span>
          quickstart mappings
        </div>
        <div
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
            fontSize: '13px',
            color: colors.neutral.gray[400],
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: '300', color: colors.neutral.white, marginRight: '8px' }}>
            {hueGroups.length}
          </span>
          hue families
        </div>
      </div>

      {/* Hue groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hueGroups.map((group, gi) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: gi * 0.05, duration: 0.4 }}
            style={{
              borderRadius: '12px',
              background: surfaces.glass.light,
              border: `1px solid ${colors.neutral.gray[100]}`,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white }}>
                  {group.label}
                  <span style={{ fontSize: '11px', color: colors.neutral.gray[500], marginLeft: '8px' }}>
                    H: {group.range}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: colors.neutral.gray[500] }}>
                  {group.entries.length} themes
                </span>
              </div>

              {/* Color swatches */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {group.entries.map(({ slug, entry }) => {
                  const isExpanded = expandedSlug === slug;
                  return (
                    <motion.button
                      key={slug}
                      onClick={() => setExpandedSlug(isExpanded ? null : slug)}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        border: isExpanded
                          ? `1px solid ${registryThemeColor(entry.accentHSL, 0.5)}`
                          : '1px solid transparent',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: fonts.primary,
                        transition: 'border-color 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: registryThemeColor(entry.primaryHSL, 1),
                          }}
                        />
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: registryThemeColor(entry.accentHSL, 1),
                          }}
                        />
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: registryThemeColor(entry.voidHSL, 1),
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '9px', color: colors.neutral.gray[600], whiteSpace: 'nowrap' }}>
                        {slug}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Expanded swatch detail */}
            <AnimatePresence>
              {group.entries.some(e => expandedSlug === e.slug) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.entries
                    .filter(e => expandedSlug === e.slug)
                    .map(({ slug, entry }) => (
                      <div
                        key={slug}
                        style={{
                          padding: '12px 20px 16px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white, marginBottom: '8px' }}>
                          {entry.name}
                          <span style={{ fontSize: '11px', color: colors.neutral.gray[500], marginLeft: '8px' }}>
                            {slug}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          {[
                            { label: 'Primary', hsl: entry.primaryHSL },
                            { label: 'Accent', hsl: entry.accentHSL },
                            { label: 'Void', hsl: entry.voidHSL },
                          ].map(ch => (
                            <div key={ch.label}>
                              <div
                                style={{
                                  height: '32px',
                                  borderRadius: '6px',
                                  background: registryThemeColor(ch.hsl, 1),
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  marginBottom: '4px',
                                }}
                              />
                              <div style={{ fontSize: '10px', color: colors.neutral.gray[500] }}>
                                {ch.label}: H{ch.hsl[0]} S{ch.hsl[1]} L{ch.hsl[2]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// =================================================================
// MIGRATION VIEW
// =================================================================

function MigrationView({ audit }: { audit: ReturnType<typeof auditDualAuthorityDependencies> }) {
  const migrationPct = audit.migrationPct;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Migration hero */}
      <div
        style={{
          padding: '32px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(200, 160, 100, 0.04) 0%, rgba(160, 120, 200, 0.04) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'hsla(42, 50%, 55%, 0.6)', marginBottom: '12px' }}>
          DUAL AUTHORITY MIGRATION
        </div>
        <div style={{ fontSize: '56px', fontWeight: '200', color: colors.neutral.white, lineHeight: 1.1 }}>
          {audit.migrated}
          <span style={{ fontSize: '18px', opacity: 0.4, marginLeft: '4px' }}>/ {audit.totalGen3}</span>
        </div>
        <div style={{ fontSize: '14px', color: colors.neutral.gray[400], marginTop: '8px' }}>
          specimens migrated to single palette authority
        </div>

        {/* Progress bar */}
        <div
          style={{
            maxWidth: '400px',
            margin: '20px auto 0',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.04)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(migrationPct, 1)}%` }}
            transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, hsla(160, 40%, 45%, 0.6), hsla(160, 50%, 55%, 0.8))',
            }}
          />
        </div>
        <div style={{ fontSize: '12px', color: 'hsla(160, 40%, 45%, 0.6)', marginTop: '8px' }}>
          {migrationPct}% complete
        </div>
      </div>

      {/* Breakdown cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
            textAlign: 'center',
          }}
        >
          <AlertCircle size={16} style={{ color: 'hsla(42, 50%, 55%, 0.6)', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '300', color: colors.neutral.white }}>
            {audit.shimDependents}
          </div>
          <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Shim Dependents
          </div>
          <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '2px' }}>
            Still importing seriesThemes
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
            textAlign: 'center',
          }}
        >
          <CheckCircle2 size={16} style={{ color: 'hsla(160, 40%, 45%, 0.6)', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '300', color: colors.neutral.white }}>
            {audit.migrated}
          </div>
          <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Migrated
          </div>
          <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '2px' }}>
            Palette-only pattern
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
            textAlign: 'center',
          }}
        >
          <Eye size={16} style={{ color: 'hsla(200, 40%, 50%, 0.6)', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '300', color: colors.neutral.white }}>
            {audit.registeredSlugs.length}
          </div>
          <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Registered Themes
          </div>
          <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '2px' }}>
            In SERIES_REGISTRY
          </div>
        </div>
      </div>

      {/* Reference pattern */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: '12px',
          background: 'rgba(160, 200, 180, 0.04)',
          border: '1px solid hsla(160, 40%, 45%, 0.12)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Target size={14} style={{ color: 'hsla(160, 40%, 45%, 0.7)' }} />
          <span style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white }}>
            Target Pattern: {audit.referenceSpecimen}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: colors.neutral.gray[400], lineHeight: 1.6, marginBottom: '12px' }}>
          Each migrated specimen removes the seriesThemes import and derives all colors from the palette returned by navicueQuickstart(). The SERIES_REGISTRY provides the canonical HSL tuples; the quickstart system generates the full palette, atmosphere, and motion config.
        </div>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.2)',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'hsla(160, 30%, 65%, 0.8)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: colors.neutral.gray[600] }}>// Before (dual authority):</div>
          <div>import {'{'} MYSTIC_THEME, themeColor {'}'} from './seriesThemes';</div>
          <div style={{ color: colors.neutral.gray[600], marginTop: '8px' }}>// After (single authority):</div>
          <div>const {'{'} palette {'}'} = navicueQuickstart('sacred_ordinary', ...);</div>
          <div style={{ color: colors.neutral.gray[600] }}>// palette.primary, palette.accent, palette.primaryGlow...</div>
        </div>
      </div>

      {/* Unregistered slugs (if any) */}
      {audit.unregisteredGen3Slugs.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: surfaces.glass.light,
            border: `1px solid ${colors.neutral.gray[100]}`,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'hsla(42, 50%, 55%, 0.5)', marginBottom: '10px' }}>
            UNREGISTERED GEN 3 SLUGS ({audit.unregisteredGen3Slugs.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {audit.unregisteredGen3Slugs.map(slug => (
              <span
                key={slug}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '11px',
                  color: colors.neutral.gray[400],
                }}
              >
                {slug}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// =================================================================
// SERIES EXPLORER VIEW (new)
// =================================================================

function SeriesExplorer({ stats }: { stats: ReturnType<typeof getRegistryStats> }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCentury, setExpandedCentury] = useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  const centuries = useMemo(() => getCenturyMetadata(), []);

  // Group series by century for explorer
  const centuryGroups = useMemo(() => {
    const groups: { century: number; name: string; series: { slug: string; meta: SeriesMeta; specimens: string[]; hasTheme: boolean }[] }[] = [];

    for (const cm of centuries) {
      const centurySeries: { slug: string; meta: SeriesMeta; specimens: string[]; hasTheme: boolean }[] = [];
      const seriesInCentury = ALL_SERIES.filter(s => s.century === cm.number).sort((a, b) => a.seriesNumber - b.seriesNumber);

      for (const meta of seriesInCentury) {
        // Find the slug for this series
        let matchSlug = '';
        for (const [slug, nums] of Object.entries(SLUG_TO_SERIES)) {
          if (nums.includes(meta.seriesNumber)) {
            matchSlug = slug;
            break;
          }
        }
        if (!matchSlug) continue;

        const specimens = LAB_SPECIMENS[matchSlug] ?? [];
        const hasTheme = matchSlug in SERIES_REGISTRY;

        // For dual-series slugs, only show specimens for this specific series number
        let filteredSpecimens = specimens;
        if (matchSlug === 'sage') {
          filteredSpecimens = meta.seriesNumber === 10 ? specimens.slice(0, 10) : specimens.slice(10, 20);
        } else if (matchSlug === 'mystic') {
          filteredSpecimens = meta.seriesNumber === 33 ? specimens.slice(0, 10) : specimens.slice(10, 20);
        }

        centurySeries.push({ slug: matchSlug, meta, specimens: filteredSpecimens, hasTheme });
      }

      groups.push({ century: cm.number, name: cm.name, series: centurySeries });
    }

    return groups;
  }, [centuries]);

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return centuryGroups;
    const q = searchQuery.toLowerCase();
    return centuryGroups.map(g => ({
      ...g,
      series: g.series.filter(s =>
        s.slug.includes(q) ||
        s.meta.name.toLowerCase().includes(q) ||
        s.meta.collection.toLowerCase().includes(q) ||
        s.specimens.some(sp => sp.includes(q))
      ),
    })).filter(g => g.series.length > 0);
  }, [centuryGroups, searchQuery]);

  // Selected series detail
  const selectedDetail = useMemo(() => {
    if (!selectedSeries) return null;
    const slug = selectedSeries;
    const colorConfig = getUnifiedColorConfig(slug);
    const metas = getSeriesMetadata(slug);
    const specimens = LAB_SPECIMENS[slug] ?? [];
    const quickstart = SERIES_QUICKSTART_PARAMS[slug];
    return { slug, colorConfig, metas, specimens, quickstart };
  }, [selectedSeries]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: surfaces.glass.light,
          border: `1px solid ${colors.neutral.gray[100]}`,
          marginBottom: '24px',
        }}
      >
        <Search size={16} style={{ color: colors.neutral.gray[500], flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search series, collections, or specimens..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: colors.neutral.white,
            fontFamily: fonts.primary,
          }}
        />
        {searchQuery && (
          <motion.button
            onClick={() => setSearchQuery('')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              color: colors.neutral.gray[500],
              fontFamily: fonts.primary,
              padding: '4px 8px',
            }}
          >
            Clear
          </motion.button>
        )}
      </div>

      {/* Explorer content: split view */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDetail ? '1fr 380px' : '1fr', gap: '24px' }}>
        {/* Left: Century accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredGroups.map((group, gi) => {
            const isOpen = expandedCentury === group.century || searchQuery.trim().length > 0;
            return (
              <motion.div
                key={group.century}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.04, duration: 0.3 }}
                style={{
                  borderRadius: '12px',
                  background: surfaces.glass.light,
                  border: `1px solid ${colors.neutral.gray[100]}`,
                  overflow: 'hidden',
                }}
              >
                {/* Century header */}
                <button
                  onClick={() => setExpandedCentury(isOpen && !searchQuery ? null : group.century)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: fonts.primary,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: colors.neutral.gray[400],
                      }}
                    >
                      {group.century}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral.white }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.neutral.gray[600] }}>
                        {group.series.length} series
                      </div>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={14} style={{ color: colors.neutral.gray[500] }} />
                  ) : (
                    <ChevronDown size={14} style={{ color: colors.neutral.gray[500] }} />
                  )}
                </button>

                {/* Series cards */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {group.series.map(s => {
                          const isSelected = selectedSeries === s.slug;
                          const themeEntry = SERIES_REGISTRY[s.slug];
                          return (
                            <motion.button
                              key={`${s.slug}-${s.meta.seriesNumber}`}
                              onClick={() => setSelectedSeries(isSelected ? null : s.slug)}
                              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: isSelected ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.04)',
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0)',
                                cursor: 'pointer',
                                fontFamily: fonts.primary,
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {/* Color dots */}
                              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                {themeEntry ? (
                                  <>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: registryThemeColor(themeEntry.primaryHSL, 1) }} />
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: registryThemeColor(themeEntry.accentHSL, 1) }} />
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: registryThemeColor(themeEntry.voidHSL, 1), border: '1px solid rgba(255,255,255,0.06)' }} />
                                  </>
                                ) : (
                                  <div style={{ width: '26px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }} />
                                )}
                              </div>

                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '500', color: colors.neutral.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {s.meta.name}
                                  </span>
                                  <span style={{ fontSize: '10px', color: colors.neutral.gray[600], flexShrink: 0 }}>
                                    S{s.meta.seriesNumber}
                                  </span>
                                </div>
                                <div style={{ fontSize: '10px', color: colors.neutral.gray[600], marginTop: '2px' }}>
                                  {s.slug} / {s.specimens.length} specimens / {s.meta.magicSignature.replace(/_/g, ' ')}
                                </div>
                              </div>

                              {/* Status indicators */}
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {s.hasTheme && (
                                  <div
                                    title="Has SERIES_REGISTRY theme"
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '4px',
                                      background: 'hsla(160, 40%, 45%, 0.1)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Palette size={10} style={{ color: 'hsla(160, 40%, 45%, 0.6)' }} />
                                  </div>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Series detail panel */}
        <AnimatePresence mode="wait">
          {selectedDetail && (
            <motion.div
              key={selectedDetail.slug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'sticky',
                top: '100px',
                alignSelf: 'start',
                borderRadius: '12px',
                background: surfaces.glass.light,
                border: `1px solid ${colors.neutral.gray[100]}`,
                overflow: 'hidden',
              }}
            >
              {/* Color header strip */}
              <div
                style={{
                  height: '48px',
                  display: 'flex',
                }}
              >
                <div style={{ flex: 1, background: selectedDetail.colorConfig.primary, opacity: 0.6 }} />
                <div style={{ flex: 1, background: selectedDetail.colorConfig.accent, opacity: 0.6 }} />
                <div style={{ flex: 1, background: selectedDetail.colorConfig.void, borderLeft: '1px solid rgba(255,255,255,0.06)' }} />
              </div>

              <div style={{ padding: '20px' }}>
                {/* Series name */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: colors.neutral.white }}>
                    {selectedDetail.metas[0]?.name ?? selectedDetail.slug}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '4px' }}>
                    {selectedDetail.metas[0]?.collection}
                  </div>
                </div>

                {/* Meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Slug', value: selectedDetail.slug },
                    { label: 'Series', value: selectedDetail.metas.map(m => `S${m.seriesNumber}`).join(', ') },
                    { label: 'Signature', value: selectedDetail.colorConfig.signatureKey.replace(/_/g, ' ') },
                    { label: 'Atmosphere', value: selectedDetail.colorConfig.atmosphere },
                    { label: 'Theme', value: selectedDetail.colorConfig.hasRegistryTheme ? 'Registered' : 'Fallback' },
                    { label: 'Specimens', value: String(selectedDetail.specimens.length) },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '2px' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.neutral.gray[400] }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color channels */}
                {selectedDetail.colorConfig.theme && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '8px' }}>
                      HSL CHANNELS
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { label: 'Primary', hsl: selectedDetail.colorConfig.theme.primaryHSL },
                        { label: 'Accent', hsl: selectedDetail.colorConfig.theme.accentHSL },
                        { label: 'Void', hsl: selectedDetail.colorConfig.theme.voidHSL },
                      ].map(ch => (
                        <div key={ch.label} style={{ flex: 1 }}>
                          <div
                            style={{
                              height: '24px',
                              borderRadius: '4px',
                              background: registryThemeColor(ch.hsl, 1),
                              border: '1px solid rgba(255,255,255,0.06)',
                              marginBottom: '4px',
                            }}
                          />
                          <div style={{ fontSize: '9px', color: colors.neutral.gray[600], textAlign: 'center' }}>
                            {ch.label}
                          </div>
                          <div style={{ fontSize: '9px', color: colors.neutral.gray[500], textAlign: 'center' }}>
                            {ch.hsl[0]}/{ch.hsl[1]}/{ch.hsl[2]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quickstart params */}
                {selectedDetail.quickstart && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '6px' }}>
                      QUICKSTART
                    </div>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0, 0, 0, 0.15)',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: 'hsla(200, 30%, 65%, 0.8)',
                        lineHeight: 1.5,
                        wordBreak: 'break-all',
                      }}
                    >
                      navicueQuickstart('{selectedDetail.quickstart[0]}', ..., '{selectedDetail.colorConfig.atmosphere}')
                    </div>
                  </div>
                )}

                {/* Specimen list */}
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.neutral.gray[600], marginBottom: '8px' }}>
                    SPECIMENS ({selectedDetail.specimens.length})
                  </div>
                  <div
                    style={{
                      maxHeight: '280px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    {selectedDetail.specimens.map((spec, i) => (
                      <div
                        key={spec}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          background: spec === 'transcendence_seal' ? 'hsla(160, 40%, 45%, 0.08)' : 'transparent',
                        }}
                      >
                        <span style={{ fontSize: '10px', color: colors.neutral.gray[600], width: '16px', textAlign: 'right', flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: spec === 'transcendence_seal' ? 'hsla(160, 40%, 55%, 0.8)' : colors.neutral.gray[400],
                            fontWeight: spec === 'transcendence_seal' ? '500' : '400',
                          }}
                        >
                          {spec.replace(/_/g, ' ')}
                        </span>
                        {spec === 'transcendence_seal' && (
                          <Target size={10} style={{ color: 'hsla(160, 40%, 45%, 0.5)', marginLeft: 'auto', flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
