/**
 * PLOT RUNTIME — Transitional signal check-in adapter
 *
 * Keeps PLOT transport, auth, and persistence outside the glass while the
 * canonical signal runtime continues to mature. The surface should only deal
 * with motion and atmospheric response.
 */

import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken } from './session-seam';
import { DEFAULT_BATTERIES, getPlotWhisper, type Battery } from './plot-model';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;

function authToken(): string {
  return getAccessToken() ?? publicAnonKey;
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken()}`,
  };
}

async function plotFetch<T>(
  path: string,
  opts?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        Accept: 'application/json',
        ...headers(),
        ...opts?.headers,
      },
      ...opts,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return { data: null, error: `${res.status}: ${text}` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export interface PlotCoordinatesResponse {
  found?: boolean;
  coordinates?: Array<{ id: string; value: number }>;
  timestamp?: number | null;
}

export function loadPlotCoordinates(individualId: string) {
  return plotFetch<PlotCoordinatesResponse>(
    `/plot/coordinates/${encodeURIComponent(individualId)}`,
  );
}

export function hydrateBatteriesFromPlot(
  coordinates?: Array<{ id: string; value: number }> | null,
): Battery[] {
  if (!coordinates || coordinates.length === 0) {
    return DEFAULT_BATTERIES;
  }

  const mapped = coordinates.map((coordinate) => {
    const id = coordinate.id === 'anchorage' ? 'balance' : coordinate.id;
    const fallback = DEFAULT_BATTERIES.find((battery) => battery.id === id);

    return {
      id,
      label: fallback?.label ?? id.toUpperCase(),
      color: fallback?.color ?? DEFAULT_BATTERIES[2].color,
      value: coordinate.value ?? 0.5,
    } satisfies Battery;
  });

  return mapped.length === DEFAULT_BATTERIES.length ? mapped : DEFAULT_BATTERIES;
}

export function savePlotCoordinates(individualId: string, batteries: Battery[]) {
  const coordinates = batteries.map((battery) => ({
    id: battery.id === 'balance' ? 'anchorage' : battery.id,
    label: battery.label,
    color: battery.color,
    value: battery.value,
    whisper: getPlotWhisper(battery.id, battery.value),
  }));

  return plotFetch<{ stored?: boolean; timestamp?: number | null }>('/plot/coordinates', {
    method: 'POST',
    body: JSON.stringify({
      userId: individualId,
      coordinates,
    }),
  });
}
