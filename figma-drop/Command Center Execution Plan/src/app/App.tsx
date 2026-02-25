import './utils/errorSuppression';
import React, { Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { colors, surfaces, fonts } from '@/design-tokens';

// ── Lazy-load route components ─────────────────────────────────
// Forces Vite to treat each route as a separate chunk.
// If one fails to load, only that route breaks — not the entire app.
// Also busts stale HMR module graph cache on re-save.
const HomePage = React.lazy(() => import('./pages/HomePage'));
const CommandCenter = React.lazy(() => import('./pages/CommandCenter'));
const AnalysisPage = React.lazy(() => import('./pages/AnalysisPage'));
const NaviCueBuildList = React.lazy(() => import('./pages/NaviCueBuildList'));
const ProofPreview = React.lazy(() => import('./pages/ProofPreview'));

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
            width: '24px',
            height: '24px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: colors.accent.cyan.primary,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <div style={{ fontSize: '13px', opacity: 0.4 }}>Loading...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Lazy route wrapper ─────────────────────────────────────────
function LazyRoute({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary name={name}>
      <Suspense fallback={<RouteLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LazyRoute name="HomePage">
        <HomePage />
      </LazyRoute>
    ),
  },
  {
    path: '/command-center',
    element: (
      <LazyRoute name="CommandCenter">
        <CommandCenter />
      </LazyRoute>
    ),
  },
  {
    path: '/analysis',
    element: (
      <LazyRoute name="AnalysisPage">
        <AnalysisPage />
      </LazyRoute>
    ),
  },
  {
    path: '/navicue-build-list',
    element: (
      <LazyRoute name="NaviCueBuildList">
        <NaviCueBuildList />
      </LazyRoute>
    ),
  },
  {
    path: '/proof-preview',
    element: (
      <LazyRoute name="ProofPreview">
        <ProofPreview />
      </LazyRoute>
    ),
  },
]);

export default function App() {
  // Error suppression is handled globally by errorSuppression.ts (imported above).
  // Figma devtools worker "Failed to fetch" errors originate inside a Web Worker
  // context and cannot be intercepted from the main thread — they are harmless.
  return (
    <ErrorBoundary name="AppRoot">
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}