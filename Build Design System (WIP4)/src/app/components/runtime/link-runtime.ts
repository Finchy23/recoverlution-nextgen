/**
 * LINK RUNTIME — Transitional infrastructure adapter
 *
 * Keeps LINK shell code clean while the canonical navigate/LINK substrate
 * continues to mature. Today this adapter talks to the legacy make-server
 * seam. Later it can be swapped for reviewed LINK endpoints without the
 * surface carrying fetch/auth logic.
 */

import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken } from './session-seam';

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

async function linkFetch<T>(
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

export interface LinkTherapistConnection {
  inviteCode: string;
  therapistEmail: string;
  therapistName: string | null;
  status: 'pending' | 'accepted' | 'revoked';
}

export interface LinkEmergencyContact {
  name: string;
  phone: string;
  relationship: string | null;
}

export interface LinkWearableSimulation {
  heartRate: number;
  hrv: number;
  movement: number;
  coordinates: Array<{ id: string; value: number }>;
  source: string;
}

export interface LinkSnapshot {
  therapistConnection: LinkTherapistConnection | null;
  emergencyContact: LinkEmergencyContact | null;
  wearableStatus: Record<string, boolean>;
}

export interface LinkExportPayload {
  exportedAt: string;
  platform: string;
  version: string;
  userId: string;
  plot: {
    current: unknown;
    lastTimestamp: string | null;
    history: unknown[];
    historyCount: number;
  };
  constellation: {
    kbeProfiles: unknown[];
    profileCount: number;
  };
  infrastructure: {
    therapist: LinkTherapistConnection | null;
    emergencyContact: LinkEmergencyContact | null;
  };
}

export function therapist(individualId: string) {
  return linkFetch<{ found?: boolean; connection?: LinkTherapistConnection }>(
    `/link/therapist/${encodeURIComponent(individualId)}`,
  );
}

export function emergency(individualId: string) {
  return linkFetch<{ found?: boolean; contact?: LinkEmergencyContact }>(
    `/link/emergency/${encodeURIComponent(individualId)}`,
  );
}

export function wearables(individualId: string) {
  return linkFetch<{ wearables?: Array<{ value?: { deviceType?: string; connected?: boolean } }> }>(
    `/link/wearables/${encodeURIComponent(individualId)}`,
  );
}

export async function loadSnapshot(individualId: string) {
  const [therapistRes, emergencyRes, wearablesRes] = await Promise.all([
    therapist(individualId),
    emergency(individualId),
    wearables(individualId),
  ]);

  const wearableStatus: Record<string, boolean> = {};
  for (const row of wearablesRes.data?.wearables ?? []) {
    const deviceType = row.value?.deviceType;
    if (deviceType) {
      wearableStatus[deviceType] = !!row.value?.connected;
    }
  }

  const errors = [therapistRes.error, emergencyRes.error, wearablesRes.error].filter(Boolean);

  return {
    data: {
      therapistConnection: therapistRes.data?.found ? therapistRes.data.connection ?? null : null,
      emergencyContact: emergencyRes.data?.found ? emergencyRes.data.contact ?? null : null,
      wearableStatus,
    } satisfies LinkSnapshot,
    error: errors.length > 0 ? errors.join(' | ') : null,
  };
}

export function inviteTherapist(payload: {
  individualId: string;
  therapistEmail: string;
  therapistName?: string | null;
}) {
  return linkFetch<{ code?: string }>('/link/invite', {
    method: 'POST',
    body: JSON.stringify({
      userId: payload.individualId,
      therapistEmail: payload.therapistEmail,
      therapistName: payload.therapistName ?? null,
    }),
  });
}

export function revokeTherapist(individualId: string) {
  return linkFetch<{ revoked?: boolean }>('/link/revoke', {
    method: 'POST',
    body: JSON.stringify({ userId: individualId }),
  });
}

export function saveEmergencyContact(payload: {
  individualId: string;
  name: string;
  phone: string;
  relationship?: string | null;
}) {
  return linkFetch<{ stored?: boolean }>('/link/emergency', {
    method: 'POST',
    body: JSON.stringify({
      userId: payload.individualId,
      name: payload.name,
      phone: payload.phone,
      relationship: payload.relationship ?? null,
    }),
  });
}

export function setWearableConnection(payload: {
  individualId: string;
  deviceType: string;
  deviceName: string;
  connected: boolean;
}) {
  return linkFetch<{ stored?: boolean }>('/link/wearable', {
    method: 'POST',
    body: JSON.stringify({
      userId: payload.individualId,
      deviceType: payload.deviceType,
      deviceName: payload.deviceName,
      connected: payload.connected,
    }),
  });
}

export function wearableSimulation(individualId: string) {
  return linkFetch<{ connected?: boolean; simulation?: LinkWearableSimulation }>(
    `/link/wearable-sim/${encodeURIComponent(individualId)}`,
  );
}

export function pushPlotCoordinates(payload: {
  individualId: string;
  coordinates: Array<{ id: string; value: number; label: string; whisper: string; color: string }>;
}) {
  return linkFetch<{ stored?: boolean }>('/plot/coordinates', {
    method: 'POST',
    body: JSON.stringify({
      userId: payload.individualId,
      coordinates: payload.coordinates,
    }),
  });
}

export async function buildExportPayload(individualId: string) {
  const [plotRes, historyRes, kbeRes, therapistRes, emergencyRes] = await Promise.all([
    linkFetch<{ found?: boolean; coordinates?: unknown; timestamp?: string | null }>(
      `/plot/coordinates/${encodeURIComponent(individualId)}`,
    ),
    linkFetch<{ readings?: unknown[]; count?: number }>(
      `/plot/history/${encodeURIComponent(individualId)}`,
    ),
    linkFetch<{ profiles?: unknown[]; count?: number }>(
      `/profile/kbe/${encodeURIComponent(individualId)}`,
    ),
    therapist(individualId),
    emergency(individualId),
  ]);

  const errors = [plotRes.error, historyRes.error, kbeRes.error, therapistRes.error, emergencyRes.error].filter(Boolean);

  const payload: LinkExportPayload = {
    exportedAt: new Date().toISOString(),
    platform: 'Recoverlution',
    version: '1.0.0',
    userId: individualId,
    plot: {
      current: plotRes.data?.found ? plotRes.data.coordinates ?? null : null,
      lastTimestamp: plotRes.data?.timestamp ?? null,
      history: historyRes.data?.readings ?? [],
      historyCount: historyRes.data?.count ?? 0,
    },
    constellation: {
      kbeProfiles: kbeRes.data?.profiles ?? [],
      profileCount: kbeRes.data?.count ?? 0,
    },
    infrastructure: {
      therapist: therapistRes.data?.found ? therapistRes.data.connection ?? null : null,
      emergencyContact: emergencyRes.data?.found ? emergencyRes.data.contact ?? null : null,
    },
  };

  return {
    data: payload,
    error: errors.length > 0 ? errors.join(' | ') : null,
  };
}

export function downloadExport(payload: LinkExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recoverlution-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
