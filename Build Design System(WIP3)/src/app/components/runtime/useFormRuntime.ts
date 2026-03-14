/**
 * FORM RUNTIME — SEEK→FORM Handoff & Practice Resolution
 *
 * This hook is the bridge between SEEK (the insight documentary)
 * and FORM (the clinical practice surface).
 *
 * SEEK surfaces an insight — a schema like "I am fundamentally broken."
 * FORM receives that schema and resolves it to a practice protocol
 * that can process the thought clinically.
 *
 * The handoff works three ways:
 *   1. SEEK→FORM navigation: schema text flows as URL state
 *   2. Content-runtime practices: fetched and mapped to local protocols
 *   3. Schema injection: raw text placed into schemaReceiver slots
 *
 * The runtime also handles practice matching — given a schema string,
 * which protocol and atom best serve this thought?
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { items, practiceDetail, type ContentKind } from './content-runtime';
import type { Practice, PracticeProtocol, ClinicalContainer } from '../form/form-types';
import { FORM_PRACTICES } from '../form/form-practices';

// ═══════════════════════════════════════════════════
// SCHEMA ANALYSIS — Clinical heuristics for matching
// ═══════════════════════════════════════════════════

/** Schema shape — what kind of thought is this? */
type SchemaShape =
  | 'identity'       // "I am..." — self-concept schema
  | 'prediction'     // "I will never..." — catastrophic forecasting
  | 'somatic'        // "The tightness in..." — body-referenced
  | 'relational'     // "They always..." — interpersonal schema
  | 'existential';   // "Nothing matters..." — meaning/purpose

/** Analyse a schema string and return its shape */
function analyseSchema(schema: string): SchemaShape {
  const lower = schema.toLowerCase();

  // Identity schemas — "I am", "I'm"
  if (/\bi\s+(am|'m)\b/.test(lower)) return 'identity';

  // Prediction schemas — "I will", "I'll never", "always", "never"
  if (/\b(will\s+never|i'll\s+never|always\s+be|never\s+be|won't\s+ever)\b/.test(lower)) return 'prediction';

  // Somatic schemas — body references
  if (/\b(tight|chest|stomach|throat|heart|body|breath|pain|ache|numb)\b/.test(lower)) return 'somatic';

  // Relational schemas — "they", "everyone", "nobody", "trust"
  if (/\b(they|everyone|nobody|trust|alone|abandon|reject|love)\b/.test(lower)) return 'relational';

  // Existential schemas
  if (/\b(nothing|meaning|point|purpose|worth|matter)\b/.test(lower)) return 'existential';

  return 'identity'; // default
}

/** Map schema shape to recommended protocol */
function recommendProtocol(shape: SchemaShape): PracticeProtocol {
  switch (shape) {
    case 'identity':     return 'act-defusion';
    case 'prediction':   return 'schema-rescripting';
    case 'somatic':      return 'somatic-titration';
    case 'relational':   return 'parts-unburdening';
    case 'existential':  return 'act-defusion';
  }
}

/** Map schema shape to recommended atom */
function recommendAtom(shape: SchemaShape): string {
  switch (shape) {
    case 'identity':     return 'wave-collapse';
    case 'prediction':   return 'future-memory';
    case 'somatic':      return 'somatic-resonance';
    case 'relational':   return 'mycelial-routing';
    case 'existential':  return 'dark-matter';
  }
}

// ═══════════════════════════════════════════════════
// SCHEMA INJECTION — Rewrite practice with user's schema
// ═══════════════════════════════════════════════════

/**
 * Take a seed practice and inject the user's schema into it.
 * The titration step always contains the raw schema.
 * The defusion step contains the reframe.
 * The resource and wash steps stay generic.
 */
function injectSchema(practice: Practice, schema: string): Practice {
  return {
    ...practice,
    schema,
    steps: practice.steps.map(step => {
      if (step.container === 'titration') {
        return {
          ...step,
          copy: schema,
          subCopy: 'Observe the shape of this thought. It is contained here.',
          instruction: 'Read. Do not react. The pulse continues.',
        };
      }
      return step;
    }),
  };
}

// ═══════════════════════════════════════════════════
// THE HOOK
// ═══════════════════════════════════════════════════

export interface FormRuntimeOptions {
  /** Initial schema (e.g. from SEEK navigation) */
  initialSchema?: string;
  /** Whether to fetch remote practices from content-runtime */
  fetchRemote?: boolean;
}

export interface FormRuntimeResult {
  /** The resolved practice to render */
  practice: Practice;
  /** All available practices (local + remote) */
  allPractices: Practice[];
  /** The current schema being processed */
  schema: string;
  /** Analysis of the schema */
  schemaShape: SchemaShape;
  /** Recommended protocol for the schema */
  recommendedProtocol: PracticeProtocol;
  /** Inject a new schema and re-resolve */
  setSchema: (schema: string) => void;
  /** Select a specific practice by ID */
  selectPractice: (id: string) => void;
  /** Whether remote practices are loading */
  loading: boolean;
  /** Whether the practice was auto-resolved from schema */
  autoResolved: boolean;
}

export function useFormRuntime(opts: FormRuntimeOptions = {}): FormRuntimeResult {
  const { initialSchema, fetchRemote = false } = opts;

  const [schema, setSchemaRaw] = useState(initialSchema || '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remotePractices, setRemotePractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoResolved, setAutoResolved] = useState(false);

  // ── Fetch remote practices from content-runtime ──
  useEffect(() => {
    if (!fetchRemote) return;
    let cancelled = false;
    setLoading(true);

    items({ kind: 'practices' as ContentKind, limit: 20 }).then(({ data, error }) => {
      if (cancelled) return;
      setLoading(false);
      if (error || !data) {
        console.info('[form-runtime] No remote practices available:', error);
        return;
      }
      // Map runtime practices to our Practice type
      // The runtime returns whatever shape the server sends —
      // we gracefully degrade if the shape doesn't match
      try {
        const items = Array.isArray(data) ? data : (data as any).items || [];
        const mapped: Practice[] = items
          .filter((item: any) => item && item.key)
          .map((item: any) => ({
            id: `remote-${item.key}`,
            name: item.title || item.key,
            schema: item.schema || item.description || '',
            protocol: mapRemoteProtocol(item.category),
            atomId: recommendAtom(analyseSchema(item.schema || '')),
            essence: item.description || '',
            steps: buildRemoteSteps(item),
          }));
        setRemotePractices(mapped);
      } catch (e) {
        console.warn('[form-runtime] Failed to map remote practices:', e);
      }
    });

    return () => { cancelled = true; };
  }, [fetchRemote]);

  // ── All practices (local + remote) ──
  const allPractices = useMemo(
    () => [...FORM_PRACTICES, ...remotePractices],
    [remotePractices],
  );

  // ── Schema analysis ──
  const schemaShape = useMemo(
    () => schema ? analyseSchema(schema) : 'identity' as SchemaShape,
    [schema],
  );

  const recommendedProtocol = useMemo(
    () => recommendProtocol(schemaShape),
    [schemaShape],
  );

  // ── Practice resolution ──
  const practice = useMemo(() => {
    // If a specific practice is selected, use it
    if (selectedId) {
      const found = allPractices.find(p => p.id === selectedId);
      if (found) {
        // If there's a schema, inject it
        return schema ? injectSchema(found, schema) : found;
      }
    }

    // If there's a schema, auto-resolve
    if (schema) {
      // Find a practice matching the recommended protocol
      const match = allPractices.find(p => p.protocol === recommendedProtocol);
      if (match) {
        return injectSchema(match, schema);
      }
    }

    // Default: first practice
    return allPractices[0];
  }, [selectedId, schema, recommendedProtocol, allPractices]);

  // ── Public setters ──
  const setSchema = useCallback((s: string) => {
    setSchemaRaw(s);
    setSelectedId(null);
    setAutoResolved(true);
  }, []);

  const selectPractice = useCallback((id: string) => {
    setSelectedId(id);
    setAutoResolved(false);
  }, []);

  return {
    practice,
    allPractices,
    schema,
    schemaShape,
    recommendedProtocol,
    setSchema,
    selectPractice,
    loading,
    autoResolved,
  };
}

// ═══════════════════════════════════════════════════
// HELPERS — Remote practice mapping
// ═══════════════════════════════════════════════════

function mapRemoteProtocol(category?: string): PracticeProtocol {
  if (!category) return 'act-defusion';
  const lower = category.toLowerCase();
  if (lower.includes('somatic')) return 'somatic-titration';
  if (lower.includes('bilateral') || lower.includes('emdr')) return 'bilateral-processing';
  if (lower.includes('schema') || lower.includes('rescript')) return 'schema-rescripting';
  if (lower.includes('ifs') || lower.includes('parts')) return 'parts-unburdening';
  return 'act-defusion';
}

function buildRemoteSteps(item: any): Practice['steps'] {
  // Generate a minimal 3-step protocol from remote data
  const schema = item.schema || item.description || 'Observe this thought.';
  return [
    {
      container: 'resource' as ClinicalContainer,
      copy: 'Notice the weight of the device in your hand.',
      subCopy: 'Feel the rhythm. Nothing else is required.',
      minDurationHint: 8,
    },
    {
      container: 'titration' as ClinicalContainer,
      copy: schema,
      subCopy: 'Observe the shape of this thought.',
      instruction: 'Read. Do not react.',
      minDurationHint: 10,
    },
    {
      container: 'wash' as ClinicalContainer,
      copy: 'The signal was received. The body integrates.',
      minDurationHint: 8,
    },
  ];
}
