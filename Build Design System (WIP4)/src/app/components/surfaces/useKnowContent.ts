/**
 * useKnowContent — The Infinite Book Engine
 *
 * Fetches, hydrates, and curates article content for the READ surface.
 * This is NOT a library browser — it is a book that always has a current page.
 *
 * Architecture:
 *   1. Boot: fetch article list → pick the opening page
 *   2. Hydrate: fetch detail for the current article → render
 *   3. Thread: when the user reaches the end, unspool the next page
 *      (from related_content, or same pillar/theme, or next in list)
 *   4. Translate: all backend metadata flows through know-taxonomy
 *
 * The hook owns the "book state" — which page you're on, what's next.
 * The ReadSurface owns the rendering and scroll mechanics.
 *
 * Respects the toolkit contract:
 *   - List call for discovery: GET /items?kind=articles
 *   - Detail call for reading: GET /item/articles/:slug
 *   - NEVER uses list payload as full article detail
 *   - NEVER invents audio/narration mode
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { items as fetchItems, articleDetail } from '../runtime/content-runtime';
import {
  hydrateArticle,
  chapterFromPillar,
  type HydratedArticle,
  type BookThread,
} from './know-taxonomy';

// ─── Types ───

interface ListItem {
  key: string;
  title: string;
  subtitle?: string;
  summary?: string;
  pillar_id?: string;
  theme_id?: string;
  duration_minutes?: number;
  detail_path?: string;
}

export interface UseKnowContentResult {
  /** The currently hydrated article (null during loading) */
  article: HydratedArticle | null;
  /** The book thread state */
  thread: BookThread;
  /** Loading state */
  loading: boolean;
  /** Error message if something failed */
  error: string | null;
  /** Turn to the next page in the thread */
  nextPage: () => void;
  /** Turn to the previous page */
  prevPage: () => void;
  /** Whether there's a next page available */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
  /** The thread items (list-level, not detail) for lookahead */
  threadItems: ListItem[];
}

// ─── The Hook ───

export function useKnowContent(): UseKnowContentResult {
  const [threadItems, setThreadItems] = useState<ListItem[]>([]);
  const [position, setPosition] = useState(0);
  const [article, setArticle] = useState<HydratedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bootedRef = useRef(false);

  // ── Step 1: Boot — fetch the article list ──
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await fetchItems({
        kind: 'articles',
        limit: 24,
      });

      if (fetchError || !data) {
        console.error('[useKnowContent] Article list fetch failed:', fetchError);
        setError(fetchError || 'Failed to load articles');
        setLoading(false);
        return;
      }

      // The runtime returns items in various shapes — normalize
      const raw = data as Record<string, unknown>;
      const list: ListItem[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.items)
          ? raw.items
          : Array.isArray(raw.data)
            ? raw.data
            : [];

      if (list.length === 0) {
        setError('No articles available');
        setLoading(false);
        return;
      }

      setThreadItems(list);
      setPosition(0);
    })();
  }, []);

  // ── Step 2: Hydrate — fetch detail for current position ──
  useEffect(() => {
    if (threadItems.length === 0) return;

    const item = threadItems[position];
    if (!item?.key) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await articleDetail(item.key);

      if (cancelled) return;

      if (fetchError || !data) {
        console.error('[useKnowContent] Article detail fetch failed:', fetchError, 'key:', item.key);
        setError(fetchError || 'Failed to load article');
        setLoading(false);
        return;
      }

      // Detail response shape: { item: {...} } or direct object
      const rawDetail = (data as Record<string, unknown>).item || data;
      const hydrated = hydrateArticle(rawDetail as Record<string, unknown>);

      setArticle(hydrated);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [threadItems, position]);

  // ── Step 3: Thread navigation ──
  const hasNext = position < threadItems.length - 1;
  const hasPrev = position > 0;

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPosition(p => p + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPosition(p => p - 1);
    }
  }, [hasPrev]);

  // ── Thread state ──
  const currentItem = threadItems[position];
  const chapter = currentItem
    ? chapterFromPillar(currentItem.pillar_id)
    : chapterFromPillar(null);

  const thread: BookThread = {
    position,
    total: threadItems.length,
    chapter: chapter.word,
  };

  return {
    article,
    thread,
    loading,
    error,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
    threadItems,
  };
}
