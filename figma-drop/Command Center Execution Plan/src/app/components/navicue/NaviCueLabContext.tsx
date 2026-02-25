/**
 * NAVICUE LAB CONTEXT
 *
 * When a NaviCue renders inside the Lab viewer (or any preview context),
 * the full entry choreography (arriving -> present -> active) is compressed
 * so browsing is quicker while keeping each stage READABLE:
 *
 *   Arrival:   1200ms  (vs production entry duration)
 *   Prompt:    2000ms  (presentAt=1200, activeAt=3200)
 *   Active:    up to 8s safety auto-advance (observe specimens)
 *   Resonant:  0.4s fade-in (vs 2s production)
 *   Afterglow: 0.4s fade-in (vs 2s production)
 *
 * Usage in Lab/ProofPreview:
 *   <NaviCueLabProvider>
 *     <NaviCueMasterRenderer ... />
 *   </NaviCueLabProvider>
 *
 * NaviCueVerse reads this automatically -- no changes to implementations.
 */
import { createContext, useContext, type ReactNode } from 'react';

interface NaviCueLabContextValue {
  /** true when inside Lab/ProofPreview -- collapse stage timing */
  isLabMode: boolean;
}

const NaviCueLabCtx = createContext<NaviCueLabContextValue>({
  isLabMode: false,
});

export function NaviCueLabProvider({ children }: { children: ReactNode }) {
  return (
    <NaviCueLabCtx.Provider value={{ isLabMode: true }}>
      {children}
    </NaviCueLabCtx.Provider>
  );
}

export function useNaviCueLabContext(): NaviCueLabContextValue {
  return useContext(NaviCueLabCtx);
}