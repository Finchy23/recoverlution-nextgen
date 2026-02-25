import { Navigation } from '@/app/components/Navigation';
import { Hero } from '@/app/components/Hero';
import { Bridge } from '@/app/components/Bridge';
import { Footer } from '@/app/components/Footer';
import React, { useState, useEffect, Suspense } from 'react';
import { 
  colors, 
  surfaces, 
  mobile, 
} from '@/design-tokens';
import { fonts } from '@/design-tokens';
import { bridges } from '@/content-tokens';

// ── Lazy-load heavy home sections as separate Vite chunks ──────────
// Each section pulls in motion/react, lucide-react, marketing-tokens,
// and large data structures. Splitting them prevents the entire
// ~5,000+ line import graph from loading in a single chunk.
const LazyReelScrollytelling = React.lazy(() =>
  import('@/app/pages/home-sections/ReelScrollytelling').then(m => ({ default: m.ReelScrollytelling }))
);
const LazyRadialPhaseStage = React.lazy(() =>
  import('@/app/pages/home-sections/RadialPhaseStage').then(m => ({ default: m.RadialPhaseStage }))
);
const LazyOneOperatingTruth = React.lazy(() =>
  import('@/app/pages/home-sections/OneOperatingTruthScrollytelling').then(m => ({ default: m.ComponentOneOperatingTruthSection4 }))
);
const LazyThreeAltitudes = React.lazy(() =>
  import('@/app/components/ThreeAltitudes').then(m => ({ default: m.ThreeAltitudes }))
);
const LazyTargetBuildReceipt = React.lazy(() =>
  import('@/app/pages/home-sections/TargetBuildReceipt').then(m => ({ default: m.TargetBuildReceipt }))
);
const LazySentientBaseline = React.lazy(() =>
  import('@/app/pages/home-sections/SentientBaseline').then(m => ({ default: m.SentientBaseline }))
);
const LazyClinicalSpine = React.lazy(() =>
  import('@/app/pages/home-sections/ClinicalSpine').then(m => ({ default: m.ClinicalSpine }))
);
const LazyOperatingTruthGrid = React.lazy(() =>
  import('@/app/pages/home-sections/OperatingTruthGrid').then(m => ({ default: m.OperatingTruthGrid }))
);

// ── Section loading fallback ───────────────────────────────────────
function SectionLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        color: colors.neutral.white,
        fontFamily: fonts.primary,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255,255,255,0.06)',
            borderTopColor: colors.accent.cyan.primary,
            borderRadius: '50%',
            animation: 'hp-section-spin 0.7s linear infinite',
            margin: '0 auto 12px',
          }}
        />
        <div style={{ fontSize: '11px', opacity: 0.25, letterSpacing: '0.04em' }}>Loading section...</div>
        <style>{`@keyframes hp-section-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Per-section error boundary ─────────────────────────────────────
// Isolates chunk-load failures so one broken section doesn't take
// down the entire HomePage. Shows a compact retry/reload UI inline.
class SectionErrorBoundary extends React.Component<
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
    console.error(`[SectionErrorBoundary:${this.props.name}]`, error, info);
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
            minHeight: '30vh',
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

// ── Lazy section wrapper ───────────────────────────────────────────
function LazySection({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <SectionErrorBoundary name={name}>
      <Suspense fallback={<SectionLoadingFallback />}>
        {children}
      </Suspense>
    </SectionErrorBoundary>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        position: 'relative', // Required for scroll offset calculations
        minHeight: mobile.viewport.height.full,
        backgroundColor: surfaces.solid.base,
        color: colors.neutral.white,
      }}
    >
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main style={{ position: 'relative' }}> {/* Required for scroll-based components */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* SECTION 00 | HERO → Recovery. Redefined.                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Hero />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 01 | BRIDGE → New default (Purple)                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Bridge
          eyebrow={bridges.installation.eyebrow}
          headline={bridges.installation.headline}
          subtext={bridges.installation.subtext}
          theme={bridges.installation.theme}
        />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* REEL SCROLLYTELLING → Interactive narrative journey                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <LazySection name="ReelScrollytelling">
          <LazyReelScrollytelling />
        </LazySection>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 02 | BRIDGE → Neuroadaptive precision (Green)              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Bridge
          eyebrow={bridges.deliverySystem.eyebrow}
          headline={bridges.deliverySystem.headline}
          subtext={bridges.deliverySystem.subtext}
          theme={bridges.deliverySystem.theme}
        />

        {/* Radial Phase Stage - Interactive 4-Phase Demo */}
        <LazySection name="RadialPhaseStage">
          <LazyRadialPhaseStage mounted={mounted} />
        </LazySection>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 03 | BRIDGE → Nervous system (Purple)                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Bridge
          eyebrow={bridges.framework.eyebrow}
          headline={bridges.framework.headline}
          subtext={bridges.framework.subtext}
          theme={bridges.framework.theme}
        />

        {/* Clinical Spine - 13 Layer Framework */}
        <LazySection name="ClinicalSpine">
          <LazyClinicalSpine mounted={mounted} />
        </LazySection>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 04 | BRIDGE → Operating truth (Green)                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Bridge
          eyebrow={bridges.operatingTruth.eyebrow}
          headline={bridges.operatingTruth.headline}
          subtext={bridges.operatingTruth.subtext}
          theme={bridges.operatingTruth.theme}
        />

        {/* COMPONENT 04 PLACEHOLDER */}
        {/* Operating Truth Section */}
        <LazySection name="OneOperatingTruth">
          <LazyOneOperatingTruth mounted={mounted} />
        </LazySection>

        {/* Operating Truth Grid */}
        <LazySection name="OperatingTruthGrid">
          <LazyOperatingTruthGrid mounted={mounted} />
        </LazySection>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 05 | BRIDGE → Three altitudes (Purple)                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Bridge
          eyebrow={bridges.threeAltitudes.eyebrow}
          headline={bridges.threeAltitudes.headline}
          subtext={bridges.threeAltitudes.subtext}
          theme={bridges.threeAltitudes.theme}
        />

        {/* COMPONENT 05 PLACEHOLDER */}
        {/* Three Altitudes Section */}
        <LazySection name="ThreeAltitudes">
          <LazyThreeAltitudes mounted={mounted} />
        </LazySection>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 06 | BRIDGE → Many expressions (Green)                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Bridge
          eyebrow={bridges.alwaysRunning.eyebrow}
          headline={bridges.alwaysRunning.headline}
          subtext={bridges.alwaysRunning.subtext}
          theme={bridges.alwaysRunning.theme}
        />

        {/* COMPONENT 06 PLACEHOLDER */}
        {/* Target Build Seal Section */}
        <LazySection name="TargetBuildReceipt">
          <LazyTargetBuildReceipt mounted={mounted} />
        </LazySection>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 07 | BRIDGE → Sentient baseline (Amber)                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Bridge
          eyebrow={bridges.sentientBaseline.eyebrow}
          headline={bridges.sentientBaseline.headline}
          subtext={bridges.sentientBaseline.subtext}
          theme={bridges.sentientBaseline.theme}
        />

        {/* COMPONENT 07 PLACEHOLDER */}
        {/* Sentient Baseline Section */}
        <LazySection name="SentientBaseline">
          <LazySentientBaseline mounted={mounted} />
        </LazySection>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}