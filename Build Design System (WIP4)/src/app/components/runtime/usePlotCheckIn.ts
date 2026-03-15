import { useCallback, useEffect, useState } from 'react';
import { useIndividualId } from './session-seam';
import { useResilience } from './resilience-seam';
import * as events from './event-seam';
import {
  DEFAULT_BATTERIES,
  type Battery,
} from './plot-model';
import {
  hydrateBatteriesFromPlot,
  loadPlotCoordinates,
  savePlotCoordinates,
} from './plot-runtime';

export interface PlotCheckInState {
  batteries: Battery[];
  lastCheckIn: number | null;
  hydrated: boolean;
}

export interface PlotCheckInActions {
  setBatteryValue: (idx: number, value: number) => void;
  sealCheckIn: () => Promise<boolean>;
}

export function usePlotCheckIn(): [PlotCheckInState, PlotCheckInActions] {
  const individualId = useIndividualId();
  const { setRuntimeAvailable } = useResilience();
  const [batteries, setBatteries] = useState<Battery[]>(DEFAULT_BATTERIES);
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadPlotCoordinates(individualId)
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          console.warn('[plot-runtime] hydrate failed:', error);
          setRuntimeAvailable('plot', false);
          setHydrated(true);
          return;
        }

        setBatteries(hydrateBatteriesFromPlot(data?.coordinates));
        setLastCheckIn(data?.timestamp ?? null);
        setRuntimeAvailable('plot', true);
        setHydrated(true);
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('[plot-runtime] hydrate failed:', error);
        setRuntimeAvailable('plot', false);
        setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [individualId, setRuntimeAvailable]);

  const setBatteryValue = useCallback((idx: number, value: number) => {
    setBatteries((current) => current.map((battery, currentIdx) => (
      currentIdx === idx ? { ...battery, value } : battery
    )));
  }, []);

  const sealCheckIn = useCallback(async () => {
    const { data, error } = await savePlotCoordinates(individualId, batteries);
    if (error || !data?.stored) {
      console.warn('[plot-runtime] save failed:', error);
      setRuntimeAvailable('plot', false);
      return false;
    }

    setLastCheckIn(data.timestamp ?? Date.now());
    setRuntimeAvailable('plot', true);

    const energy = batteries.find((battery) => battery.id === 'energy')?.value ?? 0.5;
    const clarity = batteries.find((battery) => battery.id === 'clarity')?.value ?? 0.5;
    const anchorage = batteries.find((battery) => battery.id === 'balance')?.value ?? 0.5;

    events.signal.checkIn(energy, clarity, anchorage);
    return true;
  }, [batteries, individualId, setRuntimeAvailable]);

  return [
    {
      batteries,
      lastCheckIn,
      hydrated,
    },
    {
      setBatteryValue,
      sealCheckIn,
    },
  ];
}
