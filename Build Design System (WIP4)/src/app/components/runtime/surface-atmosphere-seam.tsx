import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_SURFACE_ATMOSPHERE_SETTINGS,
  type SurfaceAtmosphereSettings,
} from './surface-atmosphere';

const STORAGE_KEY = 'recoverlution_wip4_surface_atmosphere_settings_v1';

interface SurfaceAtmosphereContextValue {
  settings: SurfaceAtmosphereSettings;
  updateSettings: (next: Partial<SurfaceAtmosphereSettings>) => void;
  activeModeId: string | null;
  setActiveModeId: (modeId: string | null) => void;
}

const SurfaceAtmosphereContext =
  createContext<SurfaceAtmosphereContextValue | null>(null);

function readInitialSettings(): SurfaceAtmosphereSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SURFACE_ATMOSPHERE_SETTINGS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SURFACE_ATMOSPHERE_SETTINGS;

    const parsed = JSON.parse(stored) as Partial<SurfaceAtmosphereSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULT_SURFACE_ATMOSPHERE_SETTINGS.enabled,
      intensity: parsed.intensity ?? DEFAULT_SURFACE_ATMOSPHERE_SETTINGS.intensity,
      adaptToSurface:
        parsed.adaptToSurface ?? DEFAULT_SURFACE_ATMOSPHERE_SETTINGS.adaptToSurface,
      rememberPreference:
        parsed.rememberPreference ?? DEFAULT_SURFACE_ATMOSPHERE_SETTINGS.rememberPreference,
      spatialHeadphonesMode:
        parsed.spatialHeadphonesMode ??
        DEFAULT_SURFACE_ATMOSPHERE_SETTINGS.spatialHeadphonesMode,
    };
  } catch {
    return DEFAULT_SURFACE_ATMOSPHERE_SETTINGS;
  }
}

export function SurfaceAtmosphereProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SurfaceAtmosphereSettings>(readInitialSettings);
  const [activeModeId, setActiveModeId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (settings.rememberPreference) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Best-effort persistence for the shell seam.
    }
  }, [settings]);

  const updateSettings = useCallback((next: Partial<SurfaceAtmosphereSettings>) => {
    setSettings((current) => ({
      ...current,
      ...next,
    }));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      activeModeId,
      setActiveModeId,
    }),
    [activeModeId, settings, updateSettings],
  );

  return (
    <SurfaceAtmosphereContext.Provider value={value}>
      {children}
    </SurfaceAtmosphereContext.Provider>
  );
}

export function useSurfaceAtmosphereSeam() {
  const context = useContext(SurfaceAtmosphereContext);
  if (!context) {
    throw new Error(
      'useSurfaceAtmosphereSeam must be used inside SurfaceAtmosphereProvider',
    );
  }
  return context;
}
