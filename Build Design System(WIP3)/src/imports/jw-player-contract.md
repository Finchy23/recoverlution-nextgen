# JW Player Call Contract

Date:
- 2026-03-11

Owner:
- `@backend`

Purpose:
- give frontend an unambiguous backend-owned contract for using video data with JW Player
- remove confusion about what to call, when to call it, and what to pass into the player

## Core rule
Frontend should **not** call JW APIs or construct media URLs itself.

Frontend should:
1. fetch rail/list data from `content-runtime`
2. fetch video detail from `content-runtime` on interaction
3. pass backend-returned media URLs into the player
4. fetch series metadata and series episode list only when playlist behavior is needed

---

## Base runtime

Use:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime`

For dev/internal builds use:
- `channel=preview`

For strict live-only published media later use:
- `channel=published`

---

## What to call

### 1. Video rail / browse
Use for cards only.

```http
GET /functions/v1/content-runtime/items?kind=videos&limit=12&channel=preview
```

Use returned fields for card rendering only:
- `key`
- `title`
- `summary`
- `duration_minutes`
- `series_key`
- `hero.poster_url`

Do **not** boot the player from rail payload alone.

---

### 2. Video detail / player boot
Use when the user taps a card.

```http
GET /functions/v1/content-runtime/item/videos/:jwMediaId?channel=preview
```

Example:
```http
GET /functions/v1/content-runtime/item/videos/V3Ji6C8K?channel=preview
```

Use returned fields:
- `jw_media_id`
- `title`
- `description`
- `poster_url`
- `hls_url`
- `mp4_url`
- `embed_url`
- `series_key`
- `series_name`
- `episode_number`
- `duration_minutes`

---

### 3. Series metadata
Use only if the video belongs to a series and you need playlist framing.

```http
GET /functions/v1/content-runtime/videos/series/:seriesKey
```

Example:
```http
GET /functions/v1/content-runtime/videos/series/conditioning
```

Use returned fields for:
- playlist title
- playlist description
- series context

---

### 4. Series episodes / playlist items
Use only if the video belongs to a series and you need episode selection or next-up.

```http
GET /functions/v1/content-runtime/items?kind=videos&series_key=:seriesKey&limit=100&channel=preview
```

Example:
```http
GET /functions/v1/content-runtime/items?kind=videos&series_key=conditioning&limit=100&channel=preview
```

Use returned items to build:
- playlist tray
- episode picker
- next-up queue
- autoplay order

Do **not** repeatedly call the detail endpoint to discover adjacency.

---

## What to pass to JW Player

## Preferred source order
1. `hls_url`
2. `mp4_url`
3. `embed_url` only as fallback/reference, not as the primary integration path

## Why
- `hls_url` gives adaptive playback
- `mp4_url` is the fallback
- `embed_url` is not the right primary path for an integrated app-shell player

---

## Canonical player payload

After calling video detail, construct the JW playlist item like this:

```ts
const jwPlaylistItem = {
  title: video.title,
  description: video.description ?? '',
  image: video.poster_url,
  mediaid: video.jw_media_id,
  sources: [
    ...(video.hls_url ? [{ file: video.hls_url, type: 'hls' }] : []),
    ...(video.mp4_url ? [{ file: video.mp4_url, type: 'mp4' }] : []),
  ],
};
```

Then pass that into JW Player setup.

---

## Canonical JW Player setup

```ts
import jwplayer from 'jwplayer';

export async function bootStudioPlayer(containerId: string, jwMediaId: string) {
  const base = 'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime';

  const res = await fetch(`${base}/item/videos/${jwMediaId}?channel=preview`);
  if (!res.ok) throw new Error(`Video detail failed: ${res.status}`);

  const data = await res.json();
  const video = data.item;

  const playlistItem = {
    title: video.title,
    description: video.description ?? '',
    image: video.poster_url,
    mediaid: video.jw_media_id,
    sources: [
      ...(video.hls_url ? [{ file: video.hls_url, type: 'hls' }] : []),
      ...(video.mp4_url ? [{ file: video.mp4_url, type: 'mp4' }] : []),
    ],
  };

  return jwplayer(containerId).setup({
    playlist: [playlistItem],
    width: '100%',
    aspectratio: '16:9',
    autostart: false,
    controls: true,
    stretching: 'uniform',
    preload: 'metadata',
  });
}
```

---

## Canonical playlist boot

If `series_key` exists, fetch both series metadata and episodes after the detail call resolves.

```ts
import jwplayer from 'jwplayer';

export async function bootStudioSeriesPlayer(containerId: string, jwMediaId: string) {
  const base = 'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime';

  const detailRes = await fetch(`${base}/item/videos/${jwMediaId}?channel=preview`);
  if (!detailRes.ok) throw new Error(`Video detail failed: ${detailRes.status}`);
  const detailData = await detailRes.json();
  const video = detailData.item;

  let playlist = [
    {
      title: video.title,
      description: video.description ?? '',
      image: video.poster_url,
      mediaid: video.jw_media_id,
      sources: [
        ...(video.hls_url ? [{ file: video.hls_url, type: 'hls' }] : []),
        ...(video.mp4_url ? [{ file: video.mp4_url, type: 'mp4' }] : []),
      ],
    },
  ];

  if (video.series_key) {
    const episodesRes = await fetch(
      `${base}/items?kind=videos&series_key=${encodeURIComponent(video.series_key)}&limit=100&channel=preview`
    );
    if (episodesRes.ok) {
      const episodesData = await episodesRes.json();
      playlist = (episodesData.items ?? []).map((item: any) => ({
        title: item.title,
        description: item.summary ?? '',
        image: item.hero?.poster_url,
        mediaid: item.key,
        sources: [
          ...(item.hero?.hls_url ? [{ file: item.hero.hls_url, type: 'hls' }] : []),
          ...(item.hero?.mp4_url ? [{ file: item.hero.mp4_url, type: 'mp4' }] : []),
        ],
      }));
    }
  }

  return jwplayer(containerId).setup({
    playlist,
    width: '100%',
    aspectratio: '16:9',
    autostart: false,
    controls: true,
    stretching: 'uniform',
    preload: 'metadata',
  });
}
```

---

## What frontend must not do

Do **not**:
- call raw Supabase tables for videos
- call JW backend APIs directly for metadata
- construct JW/media URLs manually
- use `embed_url` as the default in-app player path
- preload the actual video for an entire rail
- fetch every detail record in a rail before the user interacts

---

## Required call order

## Single video
1. rail:
   - `GET /items?kind=videos&limit=12&channel=preview`
2. on tap:
   - `GET /item/videos/:jwMediaId?channel=preview`
3. build JW playlist item from detail
4. boot player

## Series / playlist
1. rail:
   - `GET /items?kind=videos&limit=12&channel=preview`
2. on tap:
   - `GET /item/videos/:jwMediaId?channel=preview`
3. if `series_key` exists:
   - `GET /videos/series/:seriesKey`
   - `GET /items?kind=videos&series_key=:seriesKey&limit=100&channel=preview`
4. build playlist from returned episode items
5. boot player with that playlist

---

## If frontend is not using JW Player library
Then the same backend rule still applies:
- use `hls_url` as primary
- use `mp4_url` as fallback
- use `poster_url` for pre-mount/loading state

The backend contract stays the same.

---

## Backend-owned references
- `/Users/daniel/Documents/integration/backend/40-frontend-runtime-call-index.md`
- `/Users/daniel/Documents/New project/Command Center Execution Plan/guidelines/FRONTEND_STUDIO_VIDEO_RUNTIME_NOTE_2026-03-06.md`
