/**
 * MAP RUNTIME — Transitional constellation adapter
 *
 * Keeps MAP data loading and TALK seeding off the surface while the reviewed
 * signal/map contracts continue to harden.
 */

import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken } from './session-seam';
import { buildClusterDots, CLUSTERS, type MindblockDot } from './map-model';

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

async function mapFetch<T>(
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

interface KBEProfileRow {
  key?: string;
  value?: {
    sessions?: Array<{
      knowing?: number;
      believing?: number;
    }>;
  };
}

export function loadKBEProfiles(individualId: string) {
  return mapFetch<{ profiles?: KBEProfileRow[] }>(
    `/profile/kbe/${encodeURIComponent(individualId)}`,
  );
}

export function loadUserInsights(individualId: string) {
  return mapFetch<{ insights?: any[] }>(
    `/map/user-insights/${encodeURIComponent(individualId)}`,
  );
}

function buildKBEIndex(profiles: KBEProfileRow[] | undefined) {
  const kbeMap = new Map<string, { knowing: number; believing: number; sessions: number }>();

  for (const profile of profiles ?? []) {
    const sessions = profile?.value?.sessions ?? [];
    const lastSession = sessions[sessions.length - 1];
    const keyParts = (profile.key || '').split(':');
    const insightId = keyParts[keyParts.length - 1];

    if (!insightId) continue;

    kbeMap.set(insightId, {
      knowing: lastSession?.knowing || 0,
      believing: lastSession?.believing || 0,
      sessions: sessions.length,
    });
  }

  return kbeMap;
}

export async function loadClusterDots(individualId: string) {
  const [profilesRes, insightsRes] = await Promise.all([
    loadKBEProfiles(individualId),
    loadUserInsights(individualId),
  ]);

  const kbeMap = buildKBEIndex(profilesRes.data?.profiles);
  const userInsights = insightsRes.data?.insights ?? [];

  const clusterDots = new Map<string, MindblockDot[]>();
  for (const cluster of CLUSTERS) {
    clusterDots.set(cluster.id, buildClusterDots(cluster, kbeMap, userInsights));
  }

  const errors = [profilesRes.error, insightsRes.error].filter(Boolean);

  return {
    data: clusterDots,
    error: errors.length > 0 ? errors.join(' | ') : null,
  };
}

export function seedTalkThread(payload: {
  individualId: string;
  nodeId: string;
  schema: string;
  label: string;
  integration: number;
  timestamp?: number;
}) {
  return mapFetch<{ stored?: boolean }>('/map/talk-seed', {
    method: 'POST',
    body: JSON.stringify({
      userId: payload.individualId,
      nodeId: payload.nodeId,
      schema: payload.schema,
      label: payload.label,
      integration: payload.integration,
      timestamp: payload.timestamp ?? Date.now(),
    }),
  });
}
