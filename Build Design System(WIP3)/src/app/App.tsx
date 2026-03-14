import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ResilienceProvider } from './components/runtime/resilience-seam';
import { SessionContext, setCurrentSession } from './components/runtime/session-seam';
import { SurfaceAtmosphereProvider } from './components/runtime/surface-atmosphere-seam';
import type { SessionIdentity } from './components/runtime/session-seam';

/** Preview persona — the default identity in dev/preview mode.
 *  When auth arrives, this will be replaced by a real session provider. */
const PREVIEW_SESSION: SessionIdentity = {
  individualId: 'anon',
  displayName: 'Preview',
  mode: 'preview',
  accessToken: null,
};

// Sync the non-hook accessor so runtime clients outside React can read the session
setCurrentSession(PREVIEW_SESSION);

export default function App() {
  return (
    <SessionContext.Provider value={PREVIEW_SESSION}>
      <ResilienceProvider>
        <SurfaceAtmosphereProvider>
          <RouterProvider router={router} />
        </SurfaceAtmosphereProvider>
      </ResilienceProvider>
    </SessionContext.Provider>
  );
}
