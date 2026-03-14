# Frontend Runtime Call Index

Date:
- 2026-03-11

Owner:
- `@backend`

Purpose:
- give frontend one backend-owned reference for how to call live runtime surfaces
- keep invocation, auth posture, and route boundaries explicit
- avoid mixing design, copy, or modality doctrine into runtime guidance

## Core rule
Use one frontend integration layer, backed by multiple purpose-built runtimes.

Do **not** build one giant backend API for everything.

Recommended frontend client split:
- `contentRuntime`
- `navicueRuntime`
- `talkRuntime`
- `playRuntime`
- `signalRuntime`
- `navigateRuntime`

---

## Runtime map

| Surface | Runtime | Status | Auth posture now | Notes |
| --- | --- | --- | --- | --- |
| videos / articles / insights / practices / journeys / assets | `content-runtime` | live | public | canonical content/library read API |
| navicues / sync surface | `navicue-read-bundle` | live | JWT-required internal | usable for frontend buildout, but still a controlled runtime surface |
| talk / prompt discovery | `talk-runtime` | live | public preview-only | safe while stateless and non-person-bound |
| play / audio orchestration | `play-runtime` | live | JWT-required but identity-incomplete | session compiler, not library browse |
| map / plot / proof | `signal-runtime` | live | public preview-only | requires explicit `individual_id` on dev |
| professional/org sync / support / rescue / inbox / integrations | `navigate-runtime` | live | public preview-only | requires explicit `individual_id` on dev |

Base project host:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1`

---

## 1. Content Runtime

Base:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime`

Use for:
- `videos`
- `articles`
- `insights`
- `practices`
- `journeys`
- `assets`

### Health / manifest
- `GET /health`
- `GET /manifest`
- `GET /catalog`

### Feed
- `GET /feed`

### Lists
- `GET /items?kind=articles&limit=12`
- `GET /items?kind=insights&limit=12`
- `GET /items?kind=practices&limit=12`
- `GET /items?kind=videos&limit=12&channel=preview`
- `GET /items?kind=soundbites&limit=24`

### Detail
- `GET /item/articles/:key`
- `GET /item/insights/:key`
- `GET /item/practices/:key`
- `GET /item/videos/:jwMediaId?channel=preview`
- `GET /item/soundbites/:trackId`

### Journeys
- `GET /journeys`
- `GET /journeys/:key/scenes`

### Video series / playlist
- `GET /videos/series/:seriesKey`
- `GET /items?kind=videos&series_key=:seriesKey&limit=100&channel=preview`

### Assets
- `GET /assets`
- `GET /assets/:assetId`

### Notifications catalog
- `GET /notifications/catalog`

### Current frontend rule
Use `content-runtime` for browse, rails, card payloads, detail hydration, journeys, and asset lookup.

Do **not** construct storage paths or media URLs yourself.

---

## 2. NaviCue Runtime

Base:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/navicue-read-bundle`

Use for:
- runtime-ready navicue bundle reads
- sync/somatic surface compilation
- matrix/work-queue inspection during buildout

### Routes
- `GET /health`
- `GET /bundle/:navicue_id`
- `POST /bundle`
- `GET /compile/:navicue_id`
- `POST /compile`
- `POST /dispatch`
- `GET /matrix`
- `GET /work-queue`

### Current frontend rule
Use this for navicue/SYNC runtime reads.
Do **not** try to force navicues into `content-runtime`.

### Boundary
This surface is authenticated/internal and may still use controlled preview fallback when fully publishable runtime candidates are missing.

---

## 3. Talk Runtime

Base:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/talk-runtime`

Use for:
- prompt-led discovery corridor
- guidance selection
- route dispatch to next surface

### Routes
- `GET /health`
- `GET /manifest`
- `POST /session`
- `POST /dispatch`

### Session request
```json
{
  "objective": "open_talk_corridor",
  "state_band": "amber",
  "surface": "talk",
  "time_horizon": null,
  "limit": 5
}
```

### Session response use
- render `primary`
- keep `candidates` for fallback/debug
- use `gaps` for internal validation only

### Dispatch request
```json
{
  "target_kind": "practice",
  "pillar_id": "ER",
  "theme_id": "A",
  "state_band": "amber",
  "time_horizon": "immediate"
}
```

### Dispatch response use
- navigate with `dispatch.route`
- hydrate destination with `dispatch.detail_api_path`
- inspect `dispatch.semantic_provenance` only for debug/validation, not for route override

### Current frontend rule
Talk is already real as prompt discovery.
Do **not** build it as chat.
Do **not** guess routes locally.

---

## 4. Play Runtime

Base:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/play-runtime`

Use for:
- `PLAY` session compilation
- queue generation
- audio orchestration
- feedback on compiled sessions

### Routes
- `GET /health`
- `GET /manifest`
- `GET /profiles`
- `POST /session`
- `GET /session/:id`
- `POST /session/:id/feedback`

### Create session
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
- `session_shape`
- `queue[]`
- `voice_profile`
- `beat_profile`
- `mix_profile`
- `transition_profile`
- `semantic_provenance`

### Library browse
Continue to use `content-runtime` for `soundbites` browse/detail.
Use `play-runtime` only when compiling the moment.

---

## 5. Signal Runtime

Base:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/signal-runtime`

Use for:
- `PLOT`
- `MAP`
- focus zones
- proof

### Current auth rule
On dev, requires explicit `individual_id`.

### Routes
- `GET /health`
- `GET /manifest?individual_id=...`
- `GET /now?individual_id=...`
- `GET /map?individual_id=...&group_by=schema|pillar|concept|theme|node&stage=...&limit=...`
- `GET /focus-zones?individual_id=...`
- `POST /focus-zones`
- `GET /proof?individual_id=...&limit=...`

### Recommended call order
1. `manifest`
2. `now`
3. `map` with `group_by=schema`
4. `proof`
5. `focus-zones`
6. deeper cluster/node calls on interaction only

### Good default map mode
Start with `group_by=schema`.
Treat `group_by=node` as drill-in only.

### Useful dev individuals
Current-state example:
- `2c3e1c19-e3fc-406d-b17a-164611eb9cb0`

Map example:
- `647fdb75-f5dd-435f-9554-0f4dc5399fd2`

---

## 6. Navigate Runtime

Base:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/navigate-runtime`

Use for:
- professional/org sync
- support group / support contacts
- rescue / SOS
- inbox
- context / integrations
- shared room
- likely calendar/wearable sync context via `context`

### Current auth rule
On dev, requires explicit `individual_id` for reads and writes.

### Routes
- `GET /health`
- `GET /manifest?individual_id=...`
- `GET /compass?individual_id=...&limit=12`
- `GET /context?individual_id=...`
- `GET /network?individual_id=...`
- `GET /shared-room?individual_id=...`
- `GET /inbox?individual_id=...&limit=20&offset=0`
- `GET /rescue?individual_id=...`
- `POST /support/ping`
- `POST /sos`

### What each route is for
- `manifest` -> boot the shell and module counts
- `compass` -> queue/next surfaces
- `context` -> integrations, sync health, consent state, pressure hints
- `network` -> support contacts, professionals, organizations
- `shared-room` -> professional continuity and org-linked surfaces
- `inbox` -> continuity notifications
- `rescue` -> rescue/back-on-track/SOS context
- `support/ping` -> targeted support contact action
- `sos` -> explicit SOS action

### Current dev individual
- `2c3e1c19-e3fc-406d-b17a-164611eb9cb0`

### Current frontend rule
Use `navigate-runtime` for infrastructure, sync, support, inbox, and SOS.
Do **not** invent a separate settings/runtime truth if the data belongs here.

---

## 7. MAP Guidance

For the `MAP` surface, backend recommendation is:
- show schema-cluster/KBE state first
- then allow drill into pillar/concept/theme
- then allow node-level density only when explicitly exploring

Use:
- `signal-runtime /map?group_by=schema`
- `signal-runtime /map?group_by=pillar`
- `signal-runtime /map?group_by=concept`
- `signal-runtime /map?group_by=theme`
- `signal-runtime /map?group_by=node`

For synthetic-user or seeded-cohort testing, use:
- the live dev individuals above for current Signal/Navigate validation
- the production-test seed pack and UAT matrix documented in:
  - `/Users/daniel/Documents/integration/backend/35-rec-105-production-access-model-review.md`
  - `/Users/daniel/Documents/integration/backend/36-rec-106-test-profile-seed-pack-review.md`
  - `/Users/daniel/Documents/integration/backend/37-rec-107-entitlement-test-matrix-review.md`
  - `/Users/daniel/Documents/integration/backend/38-rec-108-live-cohort-observability-review.md`
  - `/Users/daniel/Documents/integration/backend/39-rec-109-profile-based-uat-review.md`

---

## 8. What is not a single runtime today

### Settings
There is no dedicated `settings-runtime` today.
Current settings-adjacent data is spread across:
- `navigate-runtime /context`
- `navigate-runtime /network`
- `navigate-runtime /manifest`
- auth/session layer outside these runtimes

### Calendar sync
Treat calendar/wearable/provider sync as part of:
- `navigate-runtime /context`

### Notifications
Use:
- `content-runtime /notifications/catalog` for static catalog/reference
- `navigate-runtime /inbox` for person-bound continuity inbox

---

## 9. Recommendation to frontend

Build one frontend runtime gateway that routes calls to the correct backend runtime.

Do **not** request one giant backend API.

The right frontend abstraction is:
- one client layer
- one docs set
- multiple backend runtimes

That keeps:
- auth posture clear
- payload shapes narrow
- person-bound and public content separated
- deployment risk localized

---

## 10. Backend-owned references

- `/Users/daniel/Documents/integration/backend/01-runtime-contracts.md`
- `/Users/daniel/Documents/integration/backend/13-auth-and-identity-matrix.md`
- `/Users/daniel/Documents/integration/backend/14-edge-function-exposure-classification.md`
- `/Users/daniel/Documents/integration/backend/15-backend-continuity-truth-boundary.md`
