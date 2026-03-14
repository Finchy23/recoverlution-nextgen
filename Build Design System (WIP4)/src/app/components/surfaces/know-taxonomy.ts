/**
 * KNOW TAXONOMY — The Curation Language
 *
 * Rosetta Stone between backend metadata (pillar_id, theme_id)
 * and the Recoverlution front-end language.
 *
 * Every backend concept becomes a 4-letter word.
 * Every clinical pillar becomes a chapter of the infinite book.
 * The user never sees "CR-C01-T001" — they see "WIRE".
 *
 * ─── CHAPTERS (from pillar_id) ───
 *
 *   CALM — Nervous system regulation, somatic baseline
 *   WIRE — Cognitive reframing, attention, belief work
 *   BOND — Attachment, relational patterns, connection
 *   ROOT — Developmental origins, childhood architecture
 *   EDGE — Boundaries, energetic protection, enmeshment
 *   SELF — Identity, ego structure, inner critic
 *
 * ─── CONTENT KINDS ───
 *
 *   READ — Articles (calm reading surface)
 *   KNOW — Insights (tangible understanding)
 *   HONE — Practices (somatic instruments)
 *
 * This file is the ONLY place pillar/theme translation lives.
 * Surfaces import from here — they never decode raw IDs.
 */

// ─── Chapter: the 4-letter word for a clinical pillar ───

export interface Chapter {
  /** The 4-letter display word */
  word: string;
  /** The clinical pillar_id from the backend */
  pillarId: string;
  /** One-breath whisper — what this chapter is about */
  whisper: string;
  /** Tint color for this chapter's glass treatment */
  color: string;
}

/**
 * Known pillar → chapter mappings.
 * Extended as backend data surfaces new pillar_ids.
 */
export const CHAPTERS: Chapter[] = [
  {
    word: 'CALM',
    pillarId: 'NS',
    whisper: 'The architecture of the breath',
    color: '#A8B5FF',
  },
  {
    word: 'WIRE',
    pillarId: 'CR',
    whisper: 'The geometry of thought',
    color: '#FFB088',
  },
  {
    word: 'BOND',
    pillarId: 'AT',
    whisper: 'The physics of connection',
    color: '#FF8EC4',
  },
  {
    word: 'ROOT',
    pillarId: 'DM',
    whisper: 'The archaeology of the self',
    color: '#B8A0FF',
  },
  {
    word: 'EDGE',
    pillarId: 'BD',
    whisper: 'The membrane between you and the noise',
    color: '#2FE6A6',
  },
  {
    word: 'SELF',
    pillarId: 'ID',
    whisper: 'The voice beneath the voice',
    color: '#00CCE0',
  },
];

/**
 * Fallback chapter for unknown pillar_ids.
 * The glass doesn't break — it just dims.
 */
const UNKNOWN_CHAPTER: Chapter = {
  word: 'DEEP',
  pillarId: '__unknown__',
  whisper: 'The territory beneath',
  color: '#F9F8FF',
};

// ─── Lookup ───

const pillarMap = new Map(CHAPTERS.map(c => [c.pillarId, c]));

/** Resolve a pillar_id to its 4-letter chapter */
export function chapterFromPillar(pillarId: string | undefined | null): Chapter {
  if (!pillarId) return UNKNOWN_CHAPTER;
  // Try exact match first
  if (pillarMap.has(pillarId)) return pillarMap.get(pillarId)!;
  // Try prefix match (pillar_id might be "CR" inside "CR-C01-...")
  const prefix = pillarId.split('-')[0]?.toUpperCase();
  if (prefix && pillarMap.has(prefix)) return pillarMap.get(prefix)!;
  return UNKNOWN_CHAPTER;
}

/** Get the 4-letter chapter word for a pillar_id */
export function chapterWord(pillarId: string | undefined | null): string {
  return chapterFromPillar(pillarId).word;
}

// ─── Content Kind: the surface instrument ───

export type ContentKind = 'articles' | 'insights' | 'practices';

export interface KindMeta {
  /** Backend kind name */
  kind: ContentKind;
  /** 4-letter surface instrument */
  word: string;
  /** Mode id in surface-modes */
  modeId: string;
  /** One-breath description */
  whisper: string;
}

export const KINDS: KindMeta[] = [
  { kind: 'articles',  word: 'READ', modeId: 'read',    whisper: 'The calm line through the noise' },
  { kind: 'insights',  word: 'KNOW', modeId: 'know',    whisper: 'The anatomy of truth' },
  { kind: 'practices', word: 'HONE', modeId: 'hone',    whisper: 'The body takes over' },
];

const kindMap = new Map(KINDS.map(k => [k.kind, k]));

/** Get instrument metadata for a content kind */
export function instrumentFromKind(kind: ContentKind): KindMeta {
  return kindMap.get(kind) || KINDS[0];
}

// ─── Hydrated Article — the front-end shape after translation ───

export interface HydratedArticle {
  /** Backend key / slug */
  key: string;
  /** Article title (clamped to copy guardrails) */
  title: string;
  /** Subtitle */
  subtitle: string;
  /** Chapter — the 4-letter pillar word */
  chapter: Chapter;
  /** Theme id (raw, for thread continuity) */
  themeId: string;
  /** Summary markdown */
  summaryMd: string;
  /** Body markdown — the actual reading content */
  bodyMd: string;
  /** Sections array (if provided) */
  sections: Array<{ heading: string; body: string }>;
  /** Hero image URL (if provided) */
  heroImage: string | null;
  /** Thought leader attribution */
  thoughtLeader: string | null;
  /** Related content keys — for the infinite thread */
  relatedContent: string[];
  /** Raw detail for anything we didn't map */
  _raw: Record<string, unknown>;
}

/**
 * Translate a raw article detail response into the hydrated front-end shape.
 * This is the ONLY function that touches raw backend article data.
 */
export function hydrateArticle(raw: Record<string, unknown>): HydratedArticle {
  return {
    key: String(raw.key || raw.slug || ''),
    title: String(raw.title || ''),
    subtitle: String(raw.subtitle || ''),
    chapter: chapterFromPillar(raw.pillar_id as string),
    themeId: String(raw.theme_id || ''),
    summaryMd: String(raw.summary_md || raw.summary || ''),
    bodyMd: String(raw.body_md || ''),
    sections: Array.isArray(raw.sections)
      ? raw.sections.map((s: Record<string, unknown>) => ({
          heading: String(s.heading || s.title || ''),
          body: String(s.body || s.content || s.body_md || ''),
        }))
      : [],
    heroImage: raw.hero_image ? String(raw.hero_image) : null,
    thoughtLeader: raw.thought_leader ? String(raw.thought_leader) : null,
    relatedContent: Array.isArray(raw.related_content)
      ? raw.related_content.map(String)
      : [],
    _raw: raw,
  };
}

// ─── Thread / Curation ───

export interface BookThread {
  /** Current article index in the thread */
  position: number;
  /** Total articles loaded in this thread */
  total: number;
  /** Chapter word for the current thread */
  chapter: string;
}