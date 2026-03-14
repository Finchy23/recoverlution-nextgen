/**
 * SESSION / IDENTITY SEAM — Preview Persona Context
 *
 * One identity provider for the entire organism.
 * Person-bound rooms should NOT invent their own identity assumptions.
 *
 * Currently: dev preview mode with explicit individual_id.
 * Later: Supabase auth with real user identity.
 *
 * Rule: Do NOT hardcode 'anon' everywhere.
 * Import this seam and use getIndividualId() so when auth arrives,
 * it's a single switch — not a 66-file migration.
 */

import { createContext, useContext } from 'react';

// ─── Identity Types ───

export type SessionMode = 'preview' | 'authenticated';

export interface SessionIdentity {
  /** The active individual_id for runtime calls */
  individualId: string;
  /** Display name for the preview persona */
  displayName: string;
  /** Session mode */
  mode: SessionMode;
  /** Supabase access token (null in preview mode) */
  accessToken: string | null;
}

// ─── Default preview persona ───

const PREVIEW_PERSONA: SessionIdentity = {
  individualId: 'anon',
  displayName: 'Preview',
  mode: 'preview',
  accessToken: null,
};

// ─── React Context ───

export const SessionContext = createContext<SessionIdentity>(PREVIEW_PERSONA);

/** Use the current session identity */
export function useSession(): SessionIdentity {
  return useContext(SessionContext);
}

/** Get the individual_id for runtime calls */
export function useIndividualId(): string {
  const session = useSession();
  return session.individualId;
}

// ─── Non-hook accessor (for runtime clients outside React) ───

let _currentSession: SessionIdentity = PREVIEW_PERSONA;

/** Set the current session (called by SessionProvider on mount/auth change) */
export function setCurrentSession(session: SessionIdentity): void {
  _currentSession = session;
}

/** Get the current individual_id without hooks (for runtime clients) */
export function getIndividualId(): string {
  return _currentSession.individualId;
}

/** Get the current access token without hooks */
export function getAccessToken(): string | null {
  return _currentSession.accessToken;
}

/** Check if we're in preview mode */
export function isPreview(): boolean {
  return _currentSession.mode === 'preview';
}
