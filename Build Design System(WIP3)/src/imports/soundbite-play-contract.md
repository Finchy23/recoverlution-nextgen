# Soundbite / Play Call Contract

Date:
- 2026-03-11

Owner:
- `@backend`

Purpose:
- give frontend an unambiguous backend-owned contract for soundbite playback and PLAY session compilation
- separate `library track playback` from `compiled PLAY orchestration`

## Core rule
There are **two valid modes**.

### Mode A — Library track playback
Use this when frontend is intentionally opening a specific soundbite/track.

Backend source:
- `content-runtime`

### Mode B — Compiled PLAY session
Use this when the user presses Play and the system should compile the moment.

Backend source:
- `play-runtime`

Do **not** mix these modes.

---

## Base runtimes

### Content runtime
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime`

### Play runtime
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/play-runtime`

---

## Mode A — Library soundbite playback

Use this when frontend wants:
- a Sparks rail
- a Flames rail
- an Embers rail
- a specific track detail page
- a direct selected track player

### 1. Soundbite rails / browse

All soundbites:
```http
GET /functions/v1/content-runtime/items?kind=soundbites&limit=24
```

Sparks only:
```http
GET /functions/v1/content-runtime/items?kind=soundbites&type=spark&limit=24
```

Flames only:
```http
GET /functions/v1/content-runtime/items?kind=soundbites&type=flame&limit=24
```

Embers only:
```http
GET /functions/v1/content-runtime/items?kind=soundbites&type=ember&limit=24
```

Optional filters:
```http
GET /functions/v1/content-runtime/items?kind=soundbites&type=spark&pillar_id=CR&theme_id=A&limit=24
```

### What rail items are for
Use returned list items for:
- card title
- type label (`spark | flame | ember`)
- subtitle/angle if present
- grouping by `code`

Do **not** boot the player from rail payload alone.

---

### 2. Single track detail / player boot

Use when the user taps a specific soundbite track.

```http
GET /functions/v1/content-runtime/item/soundbites/:trackId
```

Example:
```http
GET /functions/v1/content-runtime/item/soundbites/CR-A-11_E
```

Use returned fields:
- `track_id`
- `sound_bite_id`
- `code`
- `type`
- `title`
- `pillar_id`
- `theme_id`
- `tag`
- `angle`
- `duration_ms`
- `audio_url`

### Canonical audio element boot

```ts
export async function bootSoundbiteTrack(trackId: string) {
  const base = 'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime';

  const res = await fetch(`${base}/item/soundbites/${encodeURIComponent(trackId)}`);
  if (!res.ok) throw new Error(`Soundbite detail failed: ${res.status}`);

  const data = await res.json();
  const track = data.item;

  const audio = new Audio(track.audio_url);
  audio.preload = 'metadata';

  return {
    audio,
    track: {
      trackId: track.track_id,
      code: track.code,
      type: track.type,
      title: track.title,
      angle: track.angle ?? '',
      durationMs: track.duration_ms ?? null,
    },
  };
}
```

### Current library truth
- `track_id` = playable object
- `code` = family/grouping key
- `type` = `spark | flame | ember`

If frontend wants a family switcher, group rail items by `code`.

Do **not** invent a separate playlist API for library playback.

---

## Mode B — Compiled PLAY session

Use this when frontend wants:
- user presses Play
- system chooses the right audio sequence
- system compiles intent, duration, state, beat, voice, and transitions

### 1. Read PLAY profiles

```http
GET /functions/v1/play-runtime/profiles
```

Use this for:
- allowed intents
- duration targets
- beat profile choices
- voice lane choices
- environment mode choices

---

### 2. Create PLAY session

```http
POST /functions/v1/play-runtime/session
Content-Type: application/json
Authorization: Bearer <jwt>
```

Canonical request:
```json
{
  "intent": "uplift",
  "duration_target": "5m",
  "state_band": "amber",
  "chrono_context": "morning",
  "environment_mode": "commute",
  "beat_enabled": true,
  "voice_lane": "warm_grounded"
}
```

### Response use
Expect:
- `session_id`
- `session_shape`
- `queue[]`
- `voice_profile`
- `beat_profile`
- `mix_profile`
- `transition_profile`
- `semantic_provenance`

### Important rule
The `queue[]` is the playback truth.
Do **not** rebuild or reshuffle it locally.

---

### 3. Read compiled session

```http
GET /functions/v1/play-runtime/session/:id
Authorization: Bearer <jwt>
```

Use this when:
- restoring an existing compiled session
- rehydrating the player after refresh/navigation

---

### 4. Send session feedback

```http
POST /functions/v1/play-runtime/session/:id/feedback
Content-Type: application/json
Authorization: Bearer <jwt>
```

Canonical feedback example:
```json
{
  "completed": true,
  "skipped": false,
  "calming": true,
  "energizing": false,
  "wrong_tone": false,
  "wrong_beat": false,
  "wrong_voice": false
}
```

Use this to improve future session compilation.

---

## Canonical compiled queue handling

Each queue item should be treated as a backend-authored playback unit.

Frontend should read fields like:
- `track_id`
- `type`
- `role`
- `audio_url`
- `voice_profile`
- `beat_profile`
- `playback_rate`
- `pause_window_ms`
- `transition_after_ms`
- `ducking_profile`
- `energy_curve`
- `schema_targets`

### Canonical player loop

```ts
export async function createPlaySession(input: {
  intent: string;
  durationTarget: string;
  stateBand?: string;
  chronoContext?: string;
  environmentMode?: string;
  beatEnabled?: boolean;
  voiceLane?: string;
}, jwt: string) {
  const base = 'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/play-runtime';

  const res = await fetch(`${base}/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      intent: input.intent,
      duration_target: input.durationTarget,
      state_band: input.stateBand,
      chrono_context: input.chronoContext,
      environment_mode: input.environmentMode,
      beat_enabled: input.beatEnabled,
      voice_lane: input.voiceLane,
    }),
  });

  if (!res.ok) throw new Error(`Play session failed: ${res.status}`);
  return await res.json();
}
```

### Playback rule
- play queue items in the backend-returned order
- honor backend pause/transition metadata
- do not locally infer the next item from `code` or `type` once in session mode

---

## When to use each mode

### Use library mode when:
- user selects a visible soundbite track
- user is browsing Sparks / Flames / Embers
- user opens a specific soundbite detail
- you want direct deterministic playback of one chosen item

### Use compiled PLAY mode when:
- user presses Play without selecting a track
- user chooses a mood/intent/duration
- system should compile the right moment
- beat/voice/transition orchestration matters

---

## What frontend must not do

Do **not**:
- use `content-runtime` rails and then try to simulate `play-runtime` behavior locally
- call `play-runtime` and then regroup the queue by `code`
- construct audio URLs manually
- infer playlist/family behavior from missing metadata when detail payload already exists
- treat `track_id` browse and compiled session queue as the same product mode

---

## Minimal decision tree

### If the user taps a visible soundbite card
Use:
- `content-runtime /item/soundbites/:trackId`

### If the user presses a generic Play button
Use:
- `play-runtime /profiles`
- `play-runtime /session`
- `play-runtime /session/:id`
- `play-runtime /session/:id/feedback`

---

## Backend-owned references
- `/Users/daniel/Documents/integration/backend/40-frontend-runtime-call-index.md`
- `/Users/daniel/Documents/integration/backend/01-runtime-contracts.md`
