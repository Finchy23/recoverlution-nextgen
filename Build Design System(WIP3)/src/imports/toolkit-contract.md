# Toolkit Call Contract

Date:
- 2026-03-11

Owner:
- `@backend`

Purpose:
- give frontend an unambiguous backend-owned contract for Articles, Practices, and Insights
- separate list/card calls from detail hydration
- make the current backend limits explicit

## Core rule
Use `content-runtime` for all three surfaces.

Base:
- `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime`

Do **not**:
- call raw tables
- build content joins in frontend
- invent local “next article” logic as if it were backend truth
- invent article narration or insight documentary structure if the backend has not provided it

---

## 1. Articles

Use Articles for:
- library/rail cards
- article detail
- calm reading surface

### Article rail / list

```http
GET /functions/v1/content-runtime/items?kind=articles&limit=12
```

Use returned list fields for cards only:
- `key`
- `title`
- `subtitle`
- `summary`
- `pillar_id`
- `theme_id`
- `duration_minutes`
- `detail_path`

Do **not** boot the full reading surface from list payload alone.

---

### Article detail

```http
GET /functions/v1/content-runtime/item/articles/:slug
```

Example:
```http
GET /functions/v1/content-runtime/item/articles/ar-dm-c09-t001-k-0354
```

Use returned detail fields:
- `title`
- `subtitle`
- `summary_md`
- `body_md`
- `sections`
- `hero_image`
- `thought_leader`
- `related_content`
- `pillar_id`
- `theme_id`
- `duration_minutes`

### Canonical article boot

```ts
export async function bootArticle(slug: string) {
  const base = 'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime';

  const res = await fetch(`${base}/item/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Article detail failed: ${res.status}`);

  const data = await res.json();
  return data.item;
}
```

### Important backend truth
Articles are ready as a reading surface.
Backend does **not** yet expose article narration/audio as a first-class runtime contract.

Do **not** invent read/listen mode as if backend already supports it.

---

## 2. Practices

Use Practices for:
- practice rails/cards
- direct practice detail
- guided standalone execution surfaces

### Practice rail / list

```http
GET /functions/v1/content-runtime/items?kind=practices&limit=12
```

Use returned list fields for cards only:
- `key`
- `title`
- `subtitle`
- `summary`
- `pillar_id`
- `theme_id`
- `difficulty`
- `duration_minutes`
- `detail_path`

---

### Practice detail

```http
GET /functions/v1/content-runtime/item/practices/:practiceId
```

Example:
```http
GET /functions/v1/content-runtime/item/practices/mbf_cognitive_reframing__attention_orienting__attention_reset__belief_work_b:practice
```

Use returned detail fields:
- `title`
- `summary`
- `steps`
- `duration_minutes`
- `difficulty`
- `pillar_id`
- `theme_id`
- `related_content`

### Canonical practice boot

```ts
export async function bootPractice(practiceId: string) {
  const base = 'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime';

  const res = await fetch(`${base}/item/practices/${encodeURIComponent(practiceId)}`);
  if (!res.ok) throw new Error(`Practice detail failed: ${res.status}`);

  const data = await res.json();
  return data.item;
}
```

### Important backend truth
Practices are available as stable content/detail payloads.
Backend does **not** yet impose a richer execution shell beyond the returned practice content itself.

Frontend can build the guided practice surface, but should not pretend backend has already defined advanced practice-state choreography if it has not.

---

## 3. Insights

Use Insights for:
- insight rails/cards
- deep-dive detail
- concept/theme/schema reading surfaces

### Insight rail / list

```http
GET /functions/v1/content-runtime/items?kind=insights&limit=12
```

Use returned list fields for cards only:
- `key`
- `title`
- `subtitle`
- `summary`
- `pillar_id`
- `theme_id`
- `duration_minutes`
- `detail_path`

---

### Insight detail

```http
GET /functions/v1/content-runtime/item/insights/:slug
```

Example:
```http
GET /functions/v1/content-runtime/item/insights/in-cr-c01-t001-b-0002-insight
```

Use returned detail fields:
- `title`
- `summary_md`
- `body_md`
- `sections`
- `pillar_id`
- `theme_id`
- `duration_minutes`
- `related_content`

### Canonical insight boot

```ts
export async function bootInsight(slug: string) {
  const base = 'https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/content-runtime';

  const res = await fetch(`${base}/item/insights/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Insight detail failed: ${res.status}`);

  const data = await res.json();
  return data.item;
}
```

### Important backend truth
Insights are content-ready, not documentary-runtime-complete.

Backend currently gives:
- the content
- the sections
- the semantic metadata

Backend does **not** yet give:
- a compiled scrollytelling documentary contract
- somatic-anchor sequencing
- documentary scene/state structure

Frontend should build against the current content truth, not assume those deeper runtime layers exist yet.

---

## 4. Recommended frontend call order

### Articles
1. `GET /items?kind=articles&limit=...`
2. on tap: `GET /item/articles/:slug`

### Practices
1. `GET /items?kind=practices&limit=...`
2. on tap: `GET /item/practices/:practiceId`

### Insights
1. `GET /items?kind=insights&limit=...`
2. on tap: `GET /item/insights/:slug`

### Optional mixed rails
If frontend needs mixed Toolkit rails/cards, use:
```http
GET /functions/v1/content-runtime/feed?kinds=articles,practices,insights&limit=24
```

Use this only for mixed card surfaces.
Do detail hydration through the specific item endpoint.

---

## 5. What frontend must not do

Do **not**:
- use article list payload as if it were full article detail
- use insight list payload as if it were a compiled documentary runtime
- use practice list payload as if it were a full guided state machine
- assume article audio mode exists in runtime today
- assume insight scrollytelling/anchor structure exists in runtime today
- bypass `content-runtime` and query raw tables directly

---

## 6. Minimal decision tree

### If the user is browsing cards/rails
Use:
- `GET /items?kind=articles|practices|insights`
or
- `GET /feed?kinds=articles,practices,insights`

### If the user opens a specific item
Use:
- `GET /item/articles/:slug`
- `GET /item/practices/:practiceId`
- `GET /item/insights/:slug`

### If frontend wants richer reading/player behavior
That is a frontend shell decision **unless** backend later exposes a dedicated compiled runtime contract.

---

## Backend-owned references
- `/Users/daniel/Documents/integration/backend/40-frontend-runtime-call-index.md`
- `/Users/daniel/Documents/integration/backend/01-runtime-contracts.md`
- `/Users/daniel/Documents/integration/backend/03-surface-readiness.md`
