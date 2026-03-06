import { Navigation } from '@/app/components/Navigation';
import { Hero } from '@/app/components/Hero';
import { Bridge } from '@/app/components/Bridge';
import { Footer } from '@/app/components/Footer';
import React, { useState, useEffect } from 'react';
import { 
  colors, 
  surfaces, 
  mobile, 
} from '@/design-tokens';
import { bridges } from '@/content-tokens';

// ── Direct imports — HomePage is already lazy-loaded at route level, ──────
// so nested lazy-loading only creates complex chunk splitting that
// can cause "Failed to fetch dynamically imported module" in preview.
import { ReelScrollytelling } from '@/app/pages/home-sections/ReelScrollytelling';
import { RadialPhaseStage } from '@/app/pages/home-sections/RadialPhaseStage';
import { TargetBuildReceipt } from '@/app/pages/home-sections/TargetBuildReceipt';
import { SentientBaseline } from '@/app/pages/home-sections/SentientBaseline';
import { ClinicalSpine } from '@/app/pages/home-sections/ClinicalSpine';
import { OperatingTruthGrid } from '@/app/pages/home-sections/OperatingTruthGrid';

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
        {/* SECTION 00 | HERO */}
        <Hero />

        {/* SECTION 01 | BRIDGE → New default (Purple) */}
        <Bridge
          eyebrow={bridges.installation.eyebrow}
          headline={bridges.installation.headline}
          subtext={bridges.installation.subtext}
          theme={bridges.installation.theme}
        />

        {/* REEL SCROLLYTELLING */}
        <ReelScrollytelling />

        {/* SECTION 02 | BRIDGE → Neuroadaptive precision (Green) */}
        <Bridge
          eyebrow={bridges.deliverySystem.eyebrow}
          headline={bridges.deliverySystem.headline}
          subtext={bridges.deliverySystem.subtext}
          theme={bridges.deliverySystem.theme}
        />

        {/* Radial Phase Stage - Interactive 4-Phase Demo */}
        <RadialPhaseStage mounted={mounted} />

        {/* SECTION 03 | BRIDGE → Nervous system (Purple) */}
        <Bridge
          eyebrow={bridges.framework.eyebrow}
          headline={bridges.framework.headline}
          subtext={bridges.framework.subtext}
          theme={bridges.framework.theme}
        />

        {/* Clinical Spine - 13 Layer Framework */}
        <ClinicalSpine mounted={mounted} />

        {/* SECTION 04 | BRIDGE → Operating truth (Green) */}
        <Bridge
          eyebrow={bridges.operatingTruth.eyebrow}
          headline={bridges.operatingTruth.headline}
          subtext={bridges.operatingTruth.subtext}
          theme={bridges.operatingTruth.theme}
        />

        {/* Operating Truth Proof Surface */}
        <OperatingTruthGrid mounted={mounted} />

        {/* SECTION 06 | BRIDGE → Many expressions (Green) */}
        <Bridge
          eyebrow={bridges.alwaysRunning.eyebrow}
          headline={bridges.alwaysRunning.headline}
          subtext={bridges.alwaysRunning.subtext}
          theme={bridges.alwaysRunning.theme}
        />

        {/* Target Build Seal Section */}
        <TargetBuildReceipt mounted={mounted} />

        {/* SECTION 07 | BRIDGE → Sentient baseline (Amber) */}
        <Bridge
          eyebrow={bridges.sentientBaseline.eyebrow}
          headline={bridges.sentientBaseline.headline}
          subtext={bridges.sentientBaseline.subtext}
          theme={bridges.sentientBaseline.theme}
        />

        {/* Sentient Baseline Section */}
        <SentientBaseline mounted={mounted} />

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
