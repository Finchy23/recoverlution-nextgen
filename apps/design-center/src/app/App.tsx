/**
 * APP ROOT
 * ════════
 * Routing configuration for Recoverlution.
 *
 * Route structure:
 *   /                       → Design Center (redirect)
 *   /design-center          → Overview (cinematic river)
 *   /design-center/palette  → Color workbench
 *   /design-center/type     → Typography lab
 *   /design-center/glass    → Surface physics
 *   /design-center/motion   → Breath & motion
 *   /design-center/gates    → Validation studio
 *   /atoms                  → 100-atom visual primitives library
 *   /surfaces               → Layer 2 color signatures / engines / atmosphere workspace
 *   /motion                 → Layer 5 entrance/exit/materialization workspace
 *   /voice                  → Layer 4+7 voice lanes & atomic voice workspace
 *   /delivery               → Content mapping (atom → voice slot profiles + vocal families + composition engine)
 *   /player                 → NaviCue 7-layer composition player (full immersive)
 *   /showcase               → Full ecosystem gallery (every atom × 7 layers, live)
 *   /home                   → Marketing home page
 */

import './utils/errorSuppression';
import React, { Suspense } from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { colors, surfaces, fonts, withAlpha, TRANSPARENT } from '@/design-tokens';

// ── Lazy-load route components ─────────────────────────────────
const DesignCenter = React.lazy(() => import('./pages/DesignCenter'));
const Overview = React.lazy(() => import('./pages/design-center/Overview'));
const PaletteLab = React.lazy(() => import('./pages/design-center/PaletteLab'));
const TypeLab = React.lazy(() => import('./pages/design-center/TypeLab'));
const GlassLab = React.lazy(() => import('./pages/design-center/GlassLab'));
const MotionLab = React.lazy(() => import('./pages/design-center/MotionLab'));
const GatesLab = React.lazy(() => import('./pages/design-center/GatesLab'));

// Atoms (Visual Primitives Library)
const AtomsLayout = React.lazy(() => import('./pages/atoms/AtomsLayout'));
const AtomsLibrary = React.lazy(() => import('./pages/atoms/AtomsLibrary'));

// Surfaces (Layer 2: Living Atmosphere)
const SurfacesLayout = React.lazy(() => import('./pages/surfaces/SurfacesLayout'));
const SurfacesWorkspace = React.lazy(() => import('./pages/surfaces/SurfacesWorkspace'));

// Motion (Layer 5: Temporal Bookends)
const MotionLayout = React.lazy(() => import('./pages/motion/MotionLayout'));
const MotionWorkspace = React.lazy(() => import('./pages/motion/MotionWorkspace'));

// Voice (Layer 4: Persona + Layer 7: Atomic Voice)
const VoiceLayout = React.lazy(() => import('./pages/voice/VoiceLayout'));
const VoiceWorkspace = React.lazy(() => import('./pages/voice/VoiceWorkspace'));

// NaviCue Player
const PlayerPage = React.lazy(() => import('./pages/PlayerPage'));

// Delivery (Content Mapping)
const DeliveryLayout = React.lazy(() => import('./pages/delivery/DeliveryLayout'));
const DeliveryWorkspace = React.lazy(() => import('./pages/delivery/DeliveryWorkspace'));

// Showcase (Full Ecosystem Gallery)
const ShowcaseLayout = React.lazy(() => import('./pages/showcase/ShowcaseLayout'));
const ShowcasePage = React.lazy(() => import('./pages/showcase/ShowcasePage'));

// Marketing home
const HomePage = React.lazy(() => import('./pages/HomePage'));

// ── Route loading fallback ─────────────────────────────────────
function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: surfaces.solid.base,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.neutral.white,
        fontFamily: fonts.primary,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(colors.brand.purple.primary, 0.3)} 0%, ${TRANSPARENT} 70%)`,
            margin: '0 auto',
            animation: 'breathPulse 3s ease-in-out infinite',
          }}
        />
        <style>{`@keyframes breathPulse { 0%, 100% { transform: scale(0.8); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.6; } }`}</style>
      </div>
    </div>
  );
}

// ── Lazy route wrapper ────────────────────────────────────────
function LazyRoute({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary name={name}>
      <Suspense fallback={<RouteLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// ── Lab route wrapper (lighter fallback) ───────────────────────
function LabRoute({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary name={name}>
      <Suspense
        fallback={
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(colors.brand.purple.primary, 0.2)} 0%, ${TRANSPARENT} 70%)`, animation: 'breathPulse 3s ease-in-out infinite' }} />
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/design-center" replace />,
  },
  {
    path: '/design-center',
    element: (
      <LazyRoute name="DesignCenter">
        <DesignCenter />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: <LabRoute name="Overview"><Overview /></LabRoute>,
      },
      {
        path: 'palette',
        element: <LabRoute name="PaletteLab"><PaletteLab /></LabRoute>,
      },
      {
        path: 'type',
        element: <LabRoute name="TypeLab"><TypeLab /></LabRoute>,
      },
      {
        path: 'glass',
        element: <LabRoute name="GlassLab"><GlassLab /></LabRoute>,
      },
      {
        path: 'motion',
        element: <LabRoute name="MotionLab"><MotionLab /></LabRoute>,
      },
      {
        path: 'gates',
        element: <LabRoute name="GatesLab"><GatesLab /></LabRoute>,
      },
    ],
  },
  {
    path: '/home',
    element: (
      <LazyRoute name="HomePage">
        <HomePage />
      </LazyRoute>
    ),
  },
  {
    path: '/atoms',
    element: (
      <LazyRoute name="AtomsLayout">
        <AtomsLayout />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: <LabRoute name="AtomsLibrary"><AtomsLibrary /></LabRoute>,
      },
    ],
  },
  {
    path: '/surfaces',
    element: (
      <LazyRoute name="SurfacesLayout">
        <SurfacesLayout />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: <LabRoute name="SurfacesWorkspace"><SurfacesWorkspace /></LabRoute>,
      },
    ],
  },
  {
    path: '/motion',
    element: (
      <LazyRoute name="MotionLayout">
        <MotionLayout />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: <LabRoute name="MotionWorkspace"><MotionWorkspace /></LabRoute>,
      },
    ],
  },
  {
    path: '/voice',
    element: (
      <LazyRoute name="VoiceLayout">
        <VoiceLayout />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: <LabRoute name="VoiceWorkspace"><VoiceWorkspace /></LabRoute>,
      },
    ],
  },
  {
    path: '/player',
    element: (
      <LazyRoute name="PlayerPage">
        <PlayerPage />
      </LazyRoute>
    ),
  },
  {
    path: '/delivery',
    element: (
      <LazyRoute name="DeliveryLayout">
        <DeliveryLayout />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: <LabRoute name="DeliveryWorkspace"><DeliveryWorkspace /></LabRoute>,
      },
    ],
  },
  {
    path: '/showcase',
    element: (
      <LazyRoute name="ShowcaseLayout">
        <ShowcaseLayout />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: <LabRoute name="ShowcasePage"><ShowcasePage /></LabRoute>,
      },
    ],
  },
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}