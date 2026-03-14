/**
 * usePlayPersistence — Station Memory
 *
 * Owns ALL persistence for PLAY:
 *   - User preferences (volume, depth, frequency/thread/beat indices)
 *   - Saved stations (load, save, list)
 *
 * PlaySurface does NOT import projectId, publicAnonKey, or call fetch
 * for preferences or stations. This hook handles that boundary.
 *
 * Fire-and-forget saves. Graceful degradation on load failure.
 * The glass never blocks on network.
 *
 * Contract gap: When the live play-runtime delivers saved-station truth,
 * this hook should be replaced by the canonical runtime adapter.
 * Until then, it works against KV in mock mode.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useIndividualId } from './session-seam';
import type { PlaySavedStation } from './play-contracts';
import * as events from './event-seam';

const MAKE_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
const makeHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

// ─── Types ───

export interface PlayPreferences {
  volume: number;
  depth: number;
  frequencyIndex: number;
  threadIndex: number;
  beatIndex: number;
}

const DEFAULT_PREFS: PlayPreferences = {
  volume: 0.7,
  depth: 0.5,
  frequencyIndex: 1,   // FOCUS default
  threadIndex: 0,       // GRIT default
  beatIndex: 0,         // PULSE default
};

// ─── Fetch helpers (fire-and-forget) ───

async function fetchPreferences(userId: string): Promise<PlayPreferences> {
  try {
    const res = await fetch(`${MAKE_BASE}/play/preferences/${userId}`, {
      headers: makeHeaders(),
    });
    if (!res.ok) return { ...DEFAULT_PREFS };
    return await res.json() as PlayPreferences;
  } catch (err) {
    console.warn(`[play-persist] Preferences load failed: ${err}`);
    return { ...DEFAULT_PREFS };
  }
}

async function storePreferences(
  userId: string,
  prefs: Partial<PlayPreferences>,
): Promise<void> {
  try {
    await fetch(`${MAKE_BASE}/play/preferences`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify({ userId, ...prefs }),
    });
  } catch (err) {
    console.warn(`[play-persist] Preferences save failed: ${err}`);
  }
}

async function fetchStations(userId: string): Promise<PlaySavedStation[]> {
  try {
    const res = await fetch(`${MAKE_BASE}/play/stations/${userId}`, {
      headers: makeHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.stations || []) as PlaySavedStation[];
  } catch (err) {
    console.warn(`[play-persist] Station load failed: ${err}`);
    return [];
  }
}

async function storeStation(station: PlaySavedStation, userId: string): Promise<void> {
  try {
    await fetch(`${MAKE_BASE}/play/stations`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify({ userId, station }),
    });
    console.info(`[play-persist] Station persisted: ${station.name}`);
  } catch (err) {
    console.warn(`[play-persist] Station persist failed: ${err}`);
  }
}

// ═══════════════════════════════════════════════════
// THE HOOK
// ═══════════════════════════════════════════════════

export interface PlayPersistenceState {
  /** Saved stations loaded from KV */
  savedStations: PlaySavedStation[];
  /** Whether initial hydration is complete */
  hydrated: boolean;
}

export interface PlayPersistenceActions {
  /** Save a new station (fire-and-forget KV persist) */
  saveStation: (station: PlaySavedStation) => void;
  /** Load a saved station (returns the station for the shell to apply) */
  loadStation: (station: PlaySavedStation) => PlaySavedStation;
  /** Save current preferences (debounced, fire-and-forget) */
  savePreferences: (prefs: Partial<PlayPreferences>) => void;
  /** Load preferences (called once on mount, returns prefs for shell to apply) */
  loadPreferences: () => Promise<PlayPreferences>;
}

export function usePlayPersistence(): [PlayPersistenceState, PlayPersistenceActions] {
  const userId = useIndividualId();
  const [savedStations, setSavedStations] = useState<PlaySavedStation[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const stationsLoaded = useRef(false);
  const prefsSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load stations on mount ───
  useEffect(() => {
    if (stationsLoaded.current) return;
    stationsLoaded.current = true;
    fetchStations(userId).then((loaded) => {
      if (loaded.length > 0) {
        setSavedStations(loaded);
        console.info(`[play-persist] Loaded ${loaded.length} saved stations`);
      }
      setHydrated(true);
    });
  }, [userId]);

  // ─── Actions ───

  const saveStation = useCallback((station: PlaySavedStation) => {
    setSavedStations(prev => [...prev.slice(-4), station]);
    events.play.stationSaved(station.stationId, station.name);
    storeStation(station, userId);
  }, [userId]);

  const loadStation = useCallback((station: PlaySavedStation): PlaySavedStation => {
    return station;
  }, []);

  const savePreferences = useCallback((prefs: Partial<PlayPreferences>) => {
    if (prefsSaveTimer.current) clearTimeout(prefsSaveTimer.current);
    prefsSaveTimer.current = setTimeout(() => {
      storePreferences(userId, prefs);
      prefsSaveTimer.current = null;
    }, 2000);
  }, [userId]);

  const loadPreferences = useCallback(async (): Promise<PlayPreferences> => {
    return fetchPreferences(userId);
  }, [userId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (prefsSaveTimer.current) clearTimeout(prefsSaveTimer.current);
    };
  }, []);

  return [
    { savedStations, hydrated },
    { saveStation, loadStation, savePreferences, loadPreferences },
  ];
}
