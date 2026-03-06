import { projectId, publicAnonKey } from '@/utils/supabaseInfo';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/content-runtime`;

type ReleaseChannel = 'preview' | 'published';
type FeedKind = 'articles' | 'practices' | 'insights' | 'videos' | 'journeys';
type ItemKind = FeedKind | 'soundbites';

type RuntimeFetchOptions = {
  path: string;
  query?: Record<string, string | number | null | undefined>;
};

function buildUrl({ path, query }: RuntimeFetchOptions): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function runtimeFetch<T>(options: RuntimeFetchOptions): Promise<T> {
  const response = await fetch(buildUrl(options), {
    headers: {
      apikey: publicAnonKey,
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  const data = await response.json();
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error ?? `content-runtime request failed: ${response.status}`);
  }
  return data as T;
}

export type RuntimeManifest = {
  ok: true;
  service: 'content-runtime';
  version: string;
  defaults: {
    video_channel: ReleaseChannel;
    list_limit: number;
    max_limit: number;
  };
  counts: Record<string, number>;
  routes: Record<string, string>;
};

export type FeedCard = {
  kind: FeedKind;
  key: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  pillar_id: string | null;
  pillar_name?: string | null;
  theme_id: string | null;
  theme_name?: string | null;
  duration_minutes?: number | null;
  duration_days?: number | null;
  difficulty?: string | null;
  arousal_fit?: string | null;
  allowed_state_bands: string[];
  hero?: { image_url: string } | null;
  series_key?: string | null;
  channel?: ReleaseChannel;
  detail_path: string;
  updated_at?: string | null;
};

export type JourneyCard = {
  kind: 'journeys';
  key: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  pillar_id: string | null;
  pillar_name: string | null;
  duration_days: number | null;
  primary_mantra: string | null;
  has_audio: boolean | null;
  audio_voice_id: string | null;
  scene_count: number;
  audio_scene_count: number;
  mindblock_targets: unknown[];
  schema_targets: unknown[];
  updated_at?: string | null;
};

export type JourneyScene = {
  scene_number: number;
  scene_key: string;
  phase: string | null;
  scene_type: string | null;
  headline: string | null;
  narration_text: string | null;
  prompt: string | null;
  input_type: string | null;
  has_audio: boolean | null;
  audio_track_type: string | null;
  audio_object_path: string | null;
  audio_url: string | null;
  requires_real_world_trigger: boolean | null;
  requires_resistance_check: boolean | null;
  response_contract: unknown;
  state_band: string | null;
  guidance_mode_key: string | null;
  receipt_type_keys: string[];
  real_life_check_keys: string[];
};

export type AssetFamily = {
  asset_id: string;
  style: string;
  dimension: string;
  variant_count: number;
  available_types: string[];
  preview_url: string | null;
  bucket_id: string;
  updated_at: string | null;
};

export type AssetDetail = AssetFamily & {
  preferred_variant: {
    type: string;
    url: string;
    object_name: string;
    bucket_id: string;
  } | null;
  variants: Array<{
    type: string;
    size_bytes: number | null;
    url: string;
    bucket_id: string;
    object_name: string;
    updated_at: string | null;
    description: string | null;
  }>;
};

export type NotificationCategory = {
  category: string;
  label: string;
  description: string | null;
  priority_default: string | null;
  cooldown_minutes: number | null;
  max_per_day_override: number | null;
  quiet_hours_policy: string | null;
  requires_consent: boolean | null;
  delivery_window_start_local: string | null;
  delivery_window_end_local: string | null;
  allowed_channels: string[];
  in_app_template_key: string | null;
  in_app_title_template: string | null;
  in_app_body_template: string | null;
  in_app_deep_link_template: string | null;
  in_app_template_version: number | null;
  in_app_template_meta: unknown;
};

export const contentRuntime = {
  getManifest() {
    return runtimeFetch<RuntimeManifest>({ path: '/manifest' });
  },

  listFeed(params: {
    limit?: number;
    offset?: number;
    pillar_id?: string | null;
    theme_id?: string | null;
    q?: string | null;
    channel?: ReleaseChannel;
    kinds?: FeedKind[] | null;
  } = {}) {
    return runtimeFetch<{
      ok: true;
      total: number;
      items: FeedCard[];
    }>({
      path: '/feed',
      query: {
        ...params,
        kinds: params.kinds?.join(',') ?? null,
      },
    });
  },

  listItems(params: {
    kind: ItemKind;
    limit?: number;
    offset?: number;
    pillar_id?: string | null;
    theme_id?: string | null;
    state_band?: string | null;
    channel?: ReleaseChannel;
    q?: string | null;
    series_key?: string | null;
    media_type?: string | null;
    type?: string | null;
  }) {
    return runtimeFetch<{ ok: true; kind: ItemKind; total: number; items: unknown[] }>({
      path: '/items',
      query: params,
    });
  },

  getItem(kind: ItemKind, key: string, channel: ReleaseChannel = 'preview') {
    return runtimeFetch<{ ok: true; kind: ItemKind; key: string; item: unknown }>({
      path: `/item/${kind}/${encodeURIComponent(key)}`,
      query: { channel },
    });
  },

  listJourneys(params: {
    limit?: number;
    offset?: number;
    pillar_id?: string | null;
    q?: string | null;
  } = {}) {
    return runtimeFetch<{ ok: true; kind: 'journeys'; total: number; items: JourneyCard[] }>({
      path: '/journeys',
      query: params,
    });
  },

  getJourney(key: string) {
    return runtimeFetch<{ ok: true; kind: 'journeys'; key: string; item: unknown }>({
      path: `/item/journeys/${encodeURIComponent(key)}`,
    });
  },

  getJourneyScenes(key: string) {
    return runtimeFetch<{
      ok: true;
      journey_id: string;
      slug: string;
      title: string;
      scenes: JourneyScene[];
    }>({
      path: `/journeys/${encodeURIComponent(key)}/scenes`,
    });
  },

  listAssets(params: {
    limit?: number;
    offset?: number;
    style?: string | null;
    dimension?: string | null;
    type?: string | null;
    q?: string | null;
  } = {}) {
    return runtimeFetch<{ ok: true; total: number; items: AssetFamily[] }>({
      path: '/assets',
      query: params,
    });
  },

  getAsset(assetId: string) {
    return runtimeFetch<{ ok: true; asset: AssetDetail }>({
      path: `/assets/${encodeURIComponent(assetId)}`,
    });
  },

  listNotificationCatalog() {
    return runtimeFetch<{ ok: true; categories: NotificationCategory[] }>({
      path: '/notifications/catalog',
    });
  },
};

export { BASE_URL as contentRuntimeBaseUrl };
