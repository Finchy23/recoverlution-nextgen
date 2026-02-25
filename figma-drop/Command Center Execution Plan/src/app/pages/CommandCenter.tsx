import { NaviCueDataLogger } from '@/app/components/debug/NaviCueDataLogger';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import { Monitor, Smartphone, Database, FlaskConical, Globe } from 'lucide-react';
import { naviCueCatalog } from '@/app/data/navicue-catalog-first10';
import { useNaviCueEngineStore } from '@/app/stores/navicueEngineStore';
import { DataLoadStatus } from '@/app/pages/command-center/DataLoadStatus';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCommandCenterStore } from '@/app/stores/commandCenterStore';
import { 
  fetchJourneyTemplateScenes, 
  fetchNaviCueTypeMatrix,
  fetchDiagnosticTables 
} from '@/app/utils/fetchSupabaseData';
import { LAB_SPECIMEN_TOTAL } from '@/app/data/lab/labMetadata';

// ── Lazy-load each tab as a separate Vite chunk ────────────────────
// This prevents the entire ~1,000 implementation file tree from
// loading in a single chunk. Each tab resolves independently.
const LazyJourneyViewer = React.lazy(() =>
  import('@/app/pages/command-center/JourneyViewer').then(m => ({ default: m.JourneyViewer }))
);
const LazyNaviCueViewer = React.lazy(() =>
  import('@/app/pages/command-center/NaviCueViewer').then(m => ({ default: m.NaviCueViewer }))
);
const LazyNaviCueFilters = React.lazy(() =>
  import('@/app/pages/command-center/NaviCueFilters').then(m => ({ default: m.NaviCueFilters }))
);
const LazyLabViewer = React.lazy(() =>
  import('@/app/pages/command-center/LabViewer').then(m => ({ default: m.LabViewer }))
);
const LazyAtlasDashboard = React.lazy(() =>
  import('@/app/pages/command-center/AtlasDashboard').then(m => ({ default: m.AtlasDashboard }))
);
const LazyRegistryDashboard = React.lazy(() =>
  import('@/app/pages/command-center/RegistryDashboard').then(m => ({ default: m.RegistryDashboard }))
);
const LazySpecimenAudit = React.lazy(() =>
  import('@/app/pages/command-center/SpecimenAudit').then(m => ({ default: m.SpecimenAudit }))
);

// ── Per-tab loading fallback ───────────────────────────────────────
function TabLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: colors.neutral.white,
        fontFamily: fonts.primary,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255,255,255,0.08)',
            borderTopColor: colors.accent.cyan.primary,
            borderRadius: '50%',
            animation: 'cc-tab-spin 0.7s linear infinite',
            margin: '0 auto 12px',
          }}
        />
        <div style={{ fontSize: '12px', opacity: 0.3, letterSpacing: '0.04em' }}>Loading tab...</div>
        <style>{`@keyframes cc-tab-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Per-tab error boundary ─────────────────────────────────────────
// Isolates chunk-load failures so one broken tab doesn't take down
// the entire Command Center. Shows a compact retry/reload UI.
class TabErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; name: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[TabErrorBoundary:${this.props.name}]`, error, info);
  }
  handleRetry = () => this.setState({ hasError: false, error: null });
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: colors.neutral.white,
            fontFamily: fonts.primary,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: colors.status?.amber?.bright ?? '#f0a030' }}>
              Failed to load {this.props.name}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: fonts.mono, marginBottom: '20px', wordBreak: 'break-word', lineHeight: 1.6 }}>
              {this.state.error?.message ?? 'Unknown error'}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  color: colors.neutral.white,
                  fontFamily: fonts.primary,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: colors.accent.cyan.primary,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  color: colors.neutral.black,
                  fontFamily: fonts.primary,
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Hard Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * COMMAND CENTER
 * 
 * Ontology & Build Studio
 * - Preview Journeys & NaviCues
 * - Instagram-style single-view experience
 * - Mobile & Desktop preview modes
 * - Interaction-driven progression
 */

export default function CommandCenter() {
  const {
    journeyScenes,
    navicueTypes,
    allNavicueTypes,
    currentTab,
    previewMode,
    showDataInspector,
    isLoading,
    error,
    navicueFilters,
    setJourneyScenes,
    setNavicueTypes,
    setCurrentTab,
    setPreviewMode,
    setShowDataInspector,
    setLoading,
    setError,
    setNavicueFilter,
    clearNavicueFilters,
    applyNavicueFilters,
  } = useCommandCenterStore();
  
  // Initialize NaviCue engine
  const {
    initializeUser,
    loadNaviCueCatalog,
  } = useNaviCueEngineStore();

  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  // Lazy data loader — only fetches when a data-dependent tab is activated
  const loadDataIfNeeded = useCallback(async () => {
    if (dataReady || isLoading) return; // Already loaded or in-progress
    setLoading(true);
    try {
      console.log('📥 Loading Command Center data from v_figma_navicue_type_matrix...');
      
      const [scenes, navicueMatrix] = await Promise.all([
        fetchJourneyTemplateScenes(),
        fetchNaviCueTypeMatrix(),
      ]);
      
      console.log(`✅ Loaded ${scenes.length} Journey Scenes`);
      console.log(`✅ Loaded ${navicueMatrix.length} NaviCues from design matrix`);
      
      setJourneyScenes(scenes);
      setNavicueTypes(navicueMatrix);
      
      initializeUser();
      loadNaviCueCatalog(naviCueCatalog);
      
      setError(null);
      setDataReady(true);
    } catch (err) {
      console.error('❌ Error loading Command Center data:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [dataReady, isLoading]);

  // Mount immediately so Lab can render without waiting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data only when a data-dependent tab is selected
  useEffect(() => {
    if (currentTab === 'journeys' || currentTab === 'navicues') {
      loadDataIfNeeded();
    }
  }, [currentTab, loadDataIfNeeded]);

  // Determine if current tab needs data (Lab doesn't)
  const tabNeedsData = currentTab === 'journeys' || currentTab === 'navicues';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: surfaces.solid.base,
        color: colors.neutral.white,
        fontFamily: fonts.primary,
        position: 'relative',
      }}
    >
      {/* Debug Logger */}
      <NaviCueDataLogger />
      
      {/* Tab Navigation - Top (always visible) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'rgba(11, 11, 12, 0.6)',
          backdropFilter: 'blur(40px) saturate(200%)',
          borderBottom: `1px solid ${colors.neutral.gray[100]}`,
        }}
      >
        <div
          style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '32px' }}>
            <TabButton
              active={currentTab === 'journeys'}
              onClick={() => setCurrentTab('journeys')}
              label="Journeys"
              count={journeyScenes.length}
            />
            <TabButton
              active={currentTab === 'navicues'}
              onClick={() => setCurrentTab('navicues')}
              label="NaviCues"
              count={allNavicueTypes.length}
            />
            <TabButton
              active={currentTab === 'lab'}
              onClick={() => setCurrentTab('lab')}
              label="Lab"
              count={LAB_SPECIMEN_TOTAL}
            />
            <TabButton
              active={currentTab === 'atlas'}
              onClick={() => setCurrentTab('atlas')}
              label="Atlas"
              count={1000}
            />
            <TabButton
              active={currentTab === 'registry'}
              onClick={() => setCurrentTab('registry')}
              label="Registry"
              count={69}
            />
            <TabButton
              active={currentTab === 'audit'}
              onClick={() => setCurrentTab('audit')}
              label="Audit"
              count={9}
            />
          </div>

          {/* Preview Mode Toggle */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Preview Mode */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '4px',
                backgroundColor: surfaces.glass.medium,
                borderRadius: radius.sm,
                border: `1px solid ${colors.neutral.gray[100]}`,
              }}
            >
              <PreviewButton
                active={previewMode === 'mobile'}
                onClick={() => setPreviewMode('mobile')}
                icon={Smartphone}
              />
              <PreviewButton
                active={previewMode === 'desktop'}
                onClick={() => setPreviewMode('desktop')}
                icon={Monitor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* NaviCue Filters - Show when on NaviCues tab */}
      {currentTab === 'navicues' && (
        <Suspense fallback={null}>
          <LazyNaviCueFilters />
        </Suspense>
      )}

      {/* Main Content - Full Screen Viewer */}
      <div
        style={{
          paddingTop: currentTab === 'navicues' ? '140px' : '80px',
          minHeight: '100vh',
        }}
      >
        <AnimatePresence mode="wait">
          {currentTab === 'journeys' ? (
            <TabErrorBoundary key="journeys" name="Journeys">
              <Suspense fallback={<TabLoadingFallback />}>
                <LazyJourneyViewer mounted={mounted} previewMode={previewMode} />
              </Suspense>
            </TabErrorBoundary>
          ) : currentTab === 'lab' ? (
            <TabErrorBoundary key="lab" name="Lab">
              <Suspense fallback={<TabLoadingFallback />}>
                <LazyLabViewer previewMode={previewMode} />
              </Suspense>
            </TabErrorBoundary>
          ) : currentTab === 'atlas' ? (
            <TabErrorBoundary key="atlas" name="Atlas">
              <Suspense fallback={<TabLoadingFallback />}>
                <LazyAtlasDashboard mounted={mounted} />
              </Suspense>
            </TabErrorBoundary>
          ) : currentTab === 'registry' ? (
            <TabErrorBoundary key="registry" name="Registry">
              <Suspense fallback={<TabLoadingFallback />}>
                <LazyRegistryDashboard mounted={mounted} />
              </Suspense>
            </TabErrorBoundary>
          ) : currentTab === 'audit' ? (
            <TabErrorBoundary key="audit" name="Audit">
              <Suspense fallback={<TabLoadingFallback />}>
                <LazySpecimenAudit mounted={mounted} />
              </Suspense>
            </TabErrorBoundary>
          ) : (
            <TabErrorBoundary key="navicues" name="NaviCues">
              <Suspense fallback={<TabLoadingFallback />}>
                <LazyNaviCueViewer mounted={mounted} previewMode={previewMode} />
              </Suspense>
            </TabErrorBoundary>
          )}
        </AnimatePresence>
      </div>
      
      {/* Data Load Status - Bottom */}
      {mounted && <DataLoadStatus />}
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

function TabButton({ active, onClick, label, count }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 0',
        position: 'relative',
        fontFamily: fonts.primary,
        fontSize: '15px',
        fontWeight: active ? '500' : '400',
        color: active ? colors.neutral.white : colors.neutral.gray[500],
        transition: 'color 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{label}</span>
        <span
          style={{
            fontSize: '12px',
            opacity: 0.5,
            fontWeight: '400',
          }}
        >
          {count}
        </span>
      </div>
      
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="activeTab"
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: colors.accent.cyan.primary,
            borderRadius: '2px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

// Preview Mode Button Component
interface PreviewButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

function PreviewButton({ active, onClick, icon: Icon }: PreviewButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: active ? colors.neutral.gray[100] : 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s ease',
      }}
    >
      <Icon
        size={18}
        style={{
          color: active ? colors.neutral.white : colors.neutral.gray[400],
        }}
      />
    </motion.button>
  );
}
