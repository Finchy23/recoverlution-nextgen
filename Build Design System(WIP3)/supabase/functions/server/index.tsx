import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-99d14421/health", (c) => {
  return c.json({ status: "ok" });
});

// ═══════════════════════════════════════════════════
// TELEMETRY — Silent measurement data pipeline
// ═══════════════════════════════════════════════════
//
// Three telemetry domains:
//   SEEK  — cinematic arc interaction (entry friction, pacing, KBE signals)
//   FORM  — clinical practice interaction (hold durations, pendulation, wash)
//   SYNC  — ambient interaction (atom engagement, breath correlation)
//
// Key schema:
//   telemetry:seek:{userId}:{insightId}:{timestamp}  — single arc session
//   telemetry:form:{userId}:{practiceId}:{timestamp}  — single practice session
//   telemetry:sync:{userId}:{timestamp}               — ambient session
//   profile:somatic:{userId}                          — aggregated somatic profile
//   profile:kbe:{userId}:{insightId}                  — per-insight KBE trajectory

// ── SEEK Telemetry: Ingest ──
app.post("/make-server-99d14421/telemetry/seek", async (c) => {
  try {
    const body = await c.req.json();
    const {
      userId = 'anon',
      insightId,
      entryFrictionMs,
      sectionPacingMs,
      knowingScore,
      believingScore,
      embodyingLocation,
      rippleRadius,
      totalDurationMs,
      timestamp,
      // Extended fields for future wiring
      sceneInteractions,
      atomEngagement,
    } = body;

    if (!insightId) {
      return c.json({ error: 'Missing insightId in SEEK telemetry payload' }, 400);
    }

    const ts = timestamp || Date.now();
    const key = `telemetry:seek:${userId}:${insightId}:${ts}`;

    const payload = {
      userId,
      insightId,
      entryFrictionMs,
      sectionPacingMs,
      knowingScore,
      believingScore,
      embodyingLocation,
      rippleRadius,
      totalDurationMs,
      timestamp: ts,
      sceneInteractions: sceneInteractions || [],
      atomEngagement: atomEngagement || null,
    };

    await kv.set(key, payload);

    // Also update the per-insight KBE trajectory (append-style)
    const kbeKey = `profile:kbe:${userId}:${insightId}`;
    const existing = await kv.get(kbeKey) || { sessions: [] };
    existing.sessions.push({
      timestamp: ts,
      knowing: knowingScore,
      believing: believingScore,
      rippleRadius,
      embodyingLocation,
      totalDurationMs,
    });
    // Keep last 50 sessions per insight
    if (existing.sessions.length > 50) {
      existing.sessions = existing.sessions.slice(-50);
    }
    await kv.set(kbeKey, existing);

    console.log(`[SEEK telemetry] Stored ${key} — K:${knowingScore} B:${believingScore} R:${rippleRadius}`);
    return c.json({ stored: true, key });
  } catch (err) {
    console.log(`[SEEK telemetry] Error: ${err}`);
    return c.json({ error: `SEEK telemetry ingest failed: ${err}` }, 500);
  }
});

// ── SEEK Telemetry: Read history for an insight ──
app.get("/make-server-99d14421/telemetry/seek/:userId/:insightId", async (c) => {
  try {
    const { userId, insightId } = c.req.param();
    const prefix = `telemetry:seek:${userId}:${insightId}:`;
    const sessions = await kv.getByPrefix(prefix);
    return c.json({ sessions, count: sessions.length });
  } catch (err) {
    console.log(`[SEEK telemetry read] Error: ${err}`);
    return c.json({ error: `SEEK telemetry read failed: ${err}` }, 500);
  }
});

// ── KBE Trajectory: Read cumulative profile ──
app.get("/make-server-99d14421/profile/kbe/:userId/:insightId", async (c) => {
  try {
    const { userId, insightId } = c.req.param();
    const kbeKey = `profile:kbe:${userId}:${insightId}`;
    const profile = await kv.get(kbeKey);
    return c.json({ profile: profile || { sessions: [] } });
  } catch (err) {
    console.log(`[KBE profile read] Error: ${err}`);
    return c.json({ error: `KBE profile read failed: ${err}` }, 500);
  }
});

// ── KBE Trajectory: Read all insights for a user ──
app.get("/make-server-99d14421/profile/kbe/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const prefix = `profile:kbe:${userId}:`;
    const profiles = await kv.getByPrefix(prefix);
    return c.json({ profiles, count: profiles.length });
  } catch (err) {
    console.log(`[KBE profile read all] Error: ${err}`);
    return c.json({ error: `KBE profile read all failed: ${err}` }, 500);
  }
});

// ── FORM Telemetry: Ingest ──
app.post("/make-server-99d14421/telemetry/form", async (c) => {
  try {
    const body = await c.req.json();
    const {
      userId = 'anon',
      practiceId,
      protocol,
      schema,
      containerSequence,
      holdDurations,
      pendulationOscillations,
      washProgress,
      totalDurationMs,
      timestamp,
      atomId,
      bilateralEngagement,
    } = body;

    if (!practiceId) {
      return c.json({ error: 'Missing practiceId in FORM telemetry payload' }, 400);
    }

    const ts = timestamp || Date.now();
    const key = `telemetry:form:${userId}:${practiceId}:${ts}`;

    const payload = {
      userId,
      practiceId,
      protocol,
      schema,
      containerSequence: containerSequence || [],
      holdDurations: holdDurations || [],
      pendulationOscillations: pendulationOscillations || 0,
      washProgress: washProgress || 0,
      totalDurationMs,
      timestamp: ts,
      atomId: atomId || null,
      bilateralEngagement: bilateralEngagement || null,
    };

    await kv.set(key, payload);

    // Update somatic profile
    const somaticKey = `profile:somatic:${userId}`;
    const somatic = await kv.get(somaticKey) || { sessions: [], lastPractice: null };
    somatic.sessions.push({
      timestamp: ts,
      practiceId,
      protocol,
      totalDurationMs,
      containerSequence: containerSequence || [],
    });
    if (somatic.sessions.length > 100) {
      somatic.sessions = somatic.sessions.slice(-100);
    }
    somatic.lastPractice = { practiceId, protocol, timestamp: ts };
    await kv.set(somaticKey, somatic);

    console.log(`[FORM telemetry] Stored ${key} — practice:${practiceId} protocol:${protocol}`);
    return c.json({ stored: true, key });
  } catch (err) {
    console.log(`[FORM telemetry] Error: ${err}`);
    return c.json({ error: `FORM telemetry ingest failed: ${err}` }, 500);
  }
});

// ── FORM Telemetry: Read history ──
app.get("/make-server-99d14421/telemetry/form/:userId/:practiceId", async (c) => {
  try {
    const { userId, practiceId } = c.req.param();
    const prefix = `telemetry:form:${userId}:${practiceId}:`;
    const sessions = await kv.getByPrefix(prefix);
    return c.json({ sessions, count: sessions.length });
  } catch (err) {
    console.log(`[FORM telemetry read] Error: ${err}`);
    return c.json({ error: `FORM telemetry read failed: ${err}` }, 500);
  }
});

// ── Somatic Profile: Read aggregated user profile ──
app.get("/make-server-99d14421/profile/somatic/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const somaticKey = `profile:somatic:${userId}`;
    const profile = await kv.get(somaticKey);
    return c.json({ profile: profile || { sessions: [], lastPractice: null } });
  } catch (err) {
    console.log(`[Somatic profile read] Error: ${err}`);
    return c.json({ error: `Somatic profile read failed: ${err}` }, 500);
  }
});

// ── SYNC Telemetry: Ingest (ambient session) ──
app.post("/make-server-99d14421/telemetry/sync", async (c) => {
  try {
    const body = await c.req.json();
    const {
      userId = 'anon',
      atomId,
      duration,
      breathCorrelation,
      holdEvents,
      modeTransitions,
      timestamp,
    } = body;

    const ts = timestamp || Date.now();
    const key = `telemetry:sync:${userId}:${ts}`;

    const payload = {
      userId,
      atomId: atomId || null,
      duration: duration || 0,
      breathCorrelation: breathCorrelation || 0,
      holdEvents: holdEvents || 0,
      modeTransitions: modeTransitions || [],
      timestamp: ts,
    };

    await kv.set(key, payload);

    console.log(`[SYNC telemetry] Stored ${key} — atom:${atomId} duration:${duration}ms`);
    return c.json({ stored: true, key });
  } catch (err) {
    console.log(`[SYNC telemetry] Error: ${err}`);
    return c.json({ error: `SYNC telemetry ingest failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// TALK — The Guided Corridor Backend
// ═══════════════════════════════════════════════════
//
// Three capabilities:
//   1. Entry persistence — save/load sealed journal entries
//   2. Prompt evolution — LLM-generated contextual prompts
//   3. Schema detection — identify patterns for SEEK bridge
//
// Key schema:
//   talk:entries:{userId}        — current constellation (all entries)
//   talk:session:{userId}:{ts}   — individual session snapshot

// ── TALK: Save entries (constellation persistence) ──
app.post("/make-server-99d14421/talk/entries", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', entries, sessionDepth } = body;

    if (!entries || !Array.isArray(entries)) {
      return c.json({ error: 'Missing entries array in TALK persistence payload' }, 400);
    }

    const key = `talk:entries:${userId}`;
    const payload = {
      userId,
      entries,
      sessionDepth: sessionDepth || entries.length,
      lastUpdated: Date.now(),
      entryCount: entries.length,
    };

    await kv.set(key, payload);

    // Also snapshot the session
    const sessionKey = `talk:session:${userId}:${Date.now()}`;
    await kv.set(sessionKey, {
      ...payload,
      snapshotTimestamp: Date.now(),
    });

    console.log(`[TALK entries] Stored ${key} — ${entries.length} entries, depth ${sessionDepth}`);
    return c.json({ stored: true, key, entryCount: entries.length });
  } catch (err) {
    console.log(`[TALK entries] Error storing entries: ${err}`);
    return c.json({ error: `TALK entry persistence failed: ${err}` }, 500);
  }
});

// ── TALK: Load entries (constellation restore) ──
app.get("/make-server-99d14421/talk/entries/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `talk:entries:${userId}`;
    const data = await kv.get(key);

    if (!data) {
      return c.json({ entries: [], sessionDepth: 0, found: false });
    }

    console.log(`[TALK entries] Loaded ${key} — ${data.entryCount} entries`);
    return c.json({
      entries: data.entries || [],
      sessionDepth: data.sessionDepth || 0,
      lastUpdated: data.lastUpdated,
      found: true,
    });
  } catch (err) {
    console.log(`[TALK entries] Error loading entries: ${err}`);
    return c.json({ error: `TALK entry load failed: ${err}` }, 500);
  }
});

// ── TALK: Evolve prompts via LLM ──
app.post("/make-server-99d14421/talk/evolve", async (c) => {
  try {
    const body = await c.req.json();
    const { entries, sessionDepth, currentLane } = body;

    if (!entries || !Array.isArray(entries)) {
      return c.json({ error: 'Missing entries array in TALK evolve payload' }, 400);
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.log('[TALK evolve] No GEMINI_API_KEY — returning fallback');
      return c.json({ prompts: null, fallback: true });
    }

    // Build conversation context from entries
    const entryContext = entries.slice(-5).map((e: any) => (
      `Prompt: "${e.promptText}"\nResponse: "${e.response}"\nLane: ${e.lane}`
    )).join('\n\n');

    const systemPrompt = `You are the therapeutic conductor of a guided self-discovery journal called TALK. You are Ram Dass meeting Alan Watts — warm, spacious, unhurried, profoundly wise without being didactic.

RULES:
- Generate exactly 2-3 precision prompts as JSON
- Each prompt is a single question/invitation — never longer than 20 words
- Never assume. Never diagnose. Never rank difficulty.
- Questions are invitations, not interrogations
- NEVER use motivational language, time words, or difficulty labels
- Feel like you're sitting on the floor with someone, listening
- Each prompt should open a different therapeutic lane
- Progress naturally deeper based on what was shared
- Use second person ("you") — intimate, direct

THERAPEUTIC LANES (pick a different one for each prompt):
- origin: where it began (childhood, family, memory)
- present: what is here now (current friction)
- pattern: what keeps repeating (the loop, the schema)
- relationship: who is in the room (relational architecture)
- body: where it lives in the body (somatic map)
- fear: the shadow beneath (catastrophe, worst case)
- desire: what is waiting (the unlived life, permission)
- mirror: reflection/witnessing (what they already know)

DEPTH TIERS (current depth: ${sessionDepth}):
1-2: Surface — safe, present, low cognitive load
3-4: Narrative — story-opening, who/what/when
5-6: Pattern — recognizing repetition, the loop
7-8: Root — origin, the first time, the architect
9+:  Integration — what this means now, the rewrite

Return ONLY a JSON array of objects with fields: id (string), text (string), lane (string), depth (number).
Example: [{"id":"evolved-1","text":"What did the silence teach you?","lane":"origin","depth":4}]`;

    const userMessage = entries.length > 0
      ? `The user has sealed ${entries.length} journal entries so far. Here are the most recent:\n\n${entryContext}\n\nGenerate the next 2-3 prompts that naturally deepen the exploration. Current session depth: ${sessionDepth}. Previous lane: ${currentLane || 'none'}.`
      : `This is the beginning of a new session. Generate 3 opening prompts — warm, safe, surface-level. The user just arrived in the corridor.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userMessage}`,
          }],
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.log(`[TALK evolve] Gemini API error: ${geminiRes.status} ${errText}`);
      return c.json({ prompts: null, fallback: true, error: `Gemini API ${geminiRes.status}` });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.log('[TALK evolve] No content from Gemini');
      return c.json({ prompts: null, fallback: true });
    }

    // Parse JSON from response
    let prompts;
    try {
      prompts = JSON.parse(rawText);
    } catch {
      // Try to extract JSON array from text
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        prompts = JSON.parse(match[0]);
      } else {
        console.log('[TALK evolve] Could not parse Gemini response as JSON:', rawText);
        return c.json({ prompts: null, fallback: true });
      }
    }

    // Validate structure
    if (!Array.isArray(prompts) || prompts.length === 0) {
      return c.json({ prompts: null, fallback: true });
    }

    // Ensure each prompt has required fields
    const validPrompts = prompts
      .filter((p: any) => p.text && p.lane)
      .map((p: any, i: number) => ({
        id: p.id || `evolved-${Date.now()}-${i}`,
        text: p.text,
        lane: p.lane,
        depth: p.depth || sessionDepth + 1,
      }));

    console.log(`[TALK evolve] Generated ${validPrompts.length} evolved prompts at depth ${sessionDepth}`);
    return c.json({ prompts: validPrompts, fallback: false });

  } catch (err) {
    console.log(`[TALK evolve] Error: ${err}`);
    return c.json({ prompts: null, fallback: true, error: `TALK evolve failed: ${err}` });
  }
});

// ── TALK: Schema detection for SEEK bridge ──
app.post("/make-server-99d14421/talk/detect-schema", async (c) => {
  try {
    const body = await c.req.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries) || entries.length < 2) {
      return c.json({ schemas: [], detected: false });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.log('[TALK schema-detect] No GEMINI_API_KEY — returning empty');
      return c.json({ schemas: [], detected: false });
    }

    // Build context from all entries
    const entryContext = entries.map((e: any) => (
      `"${e.promptText}" → "${e.response}"`
    )).join('\n');

    const systemPrompt = `You are a clinical pattern recognition engine. Analyze the following journal entries and detect if they reveal any of these known psychological schemas/patterns:

KNOWN SCHEMAS (each has an insightId for the SEEK engine):
- "inner-critic" — self-judgment, unworthiness, imposter syndrome, harsh internal voice, perfectionism
- "enmeshment" — absorbing others' emotions, poor boundaries, people-pleasing, losing self in relationships, HSP overwhelm

RULES:
- Only detect schemas with STRONG evidence (multiple entries pointing to the same pattern)
- Return confidence 0-1 (only return schemas with confidence > 0.6)
- Include a brief "signal" — the specific phrase or pattern from their entries that triggered detection
- Do NOT diagnose. This is pattern recognition, not clinical assessment.

Return ONLY a JSON array of objects: [{"insightId":"inner-critic","confidence":0.8,"signal":"multiple references to self-judgment"}]
Return an empty array [] if no strong patterns detected.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nJOURNAL ENTRIES:\n${entryContext}`,
          }],
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.log(`[TALK schema-detect] Gemini API error: ${geminiRes.status} ${errText}`);
      return c.json({ schemas: [], detected: false });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return c.json({ schemas: [], detected: false });
    }

    let schemas;
    try {
      schemas = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        schemas = JSON.parse(match[0]);
      } else {
        return c.json({ schemas: [], detected: false });
      }
    }

    if (!Array.isArray(schemas)) {
      return c.json({ schemas: [], detected: false });
    }

    const validSchemas = schemas
      .filter((s: any) => s.insightId && s.confidence > 0.6)
      .map((s: any) => ({
        insightId: s.insightId,
        confidence: Math.min(1, s.confidence),
        signal: s.signal || '',
      }));

    console.log(`[TALK schema-detect] Detected ${validSchemas.length} schemas: ${validSchemas.map((s: any) => s.insightId).join(', ')}`);
    return c.json({ schemas: validSchemas, detected: validSchemas.length > 0 });

  } catch (err) {
    console.log(`[TALK schema-detect] Error: ${err}`);
    return c.json({ schemas: [], detected: false, error: `Schema detection failed: ${err}` });
  }
});

// ── TALK: Deep Thread Mining — Second-pass analysis at 10+ entries ──
// When the journal constellation reaches critical mass, this route
// performs a deeper LLM analysis to identify recurring emotional themes
// and surfaces them as potential new SEEK insight candidates.
app.post("/make-server-99d14421/talk/deep-mine", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', entries } = body;

    if (!entries || !Array.isArray(entries) || entries.length < 10) {
      return c.json({ themes: [], mined: false, reason: 'Insufficient entries (need 10+)' });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.log('[TALK deep-mine] No GEMINI_API_KEY — returning empty');
      return c.json({ themes: [], mined: false });
    }

    // Build full constellation context
    const entryContext = entries.map((e: any, i: number) => (
      `[${i + 1}] Prompt: "${e.promptText}" → Response: "${e.response}" (Lane: ${e.lane})`
    )).join('\n');

    const systemPrompt = `You are a clinical pattern analysis engine performing deep thread mining on a journal constellation. The user has written ${entries.length} sealed journal entries across multiple therapeutic lanes.

YOUR TASK: Identify 2-4 recurring emotional themes that thread through multiple entries. These are NOT diagnoses — they are structural patterns in the user's inner architecture.

ANALYSIS FRAMEWORK:
1. REPETITION — What words, phrases, or emotional textures appear across multiple entries?
2. AVOIDANCE — What is conspicuously absent? What lanes does the user never explore?
3. CONTRADICTION — Where does the user say one thing but imply another?
4. SOMATIC ECHO — Where does the user mention body sensations, tension, or physical experiences?
5. RELATIONAL ARCHITECTURE — Who keeps appearing? What power dynamics emerge?

OUTPUT FORMAT — Return a JSON array of theme objects:
[{
  "id": "theme-{slug}",
  "name": "The [Theme Name]",
  "description": "A 15-word max description of the pattern",
  "evidence": ["Entry 3 mentions X", "Entry 7 echoes Y"],
  "lane": "pattern|origin|relationship|body|fear|desire",
  "intensity": 0.0-1.0,
  "insightCandidate": true|false,
  "suggestedInsightTitle": "Optional: if this could become a SEEK insight, what would it be called?"
}]

RULES:
- Maximum 4 themes
- Only include themes with intensity > 0.5
- Each theme must cite at least 2 entries as evidence
- Never pathologize. Describe structure, not dysfunction.
- If a theme maps to an existing schema (inner-critic, enmeshment), note it but also name the user's specific version of it
- "insightCandidate" should be true only if the theme is strong enough to warrant its own SEEK exploration module`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nFULL JOURNAL CONSTELLATION (${entries.length} entries):\n${entryContext}`,
          }],
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.log(`[TALK deep-mine] Gemini API error: ${geminiRes.status} ${errText}`);
      return c.json({ themes: [], mined: false, error: `Gemini API ${geminiRes.status}` });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return c.json({ themes: [], mined: false });
    }

    let themes;
    try {
      themes = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        themes = JSON.parse(match[0]);
      } else {
        console.log('[TALK deep-mine] Could not parse response:', rawText);
        return c.json({ themes: [], mined: false });
      }
    }

    if (!Array.isArray(themes)) {
      return c.json({ themes: [], mined: false });
    }

    // Validate and clean
    const validThemes = themes
      .filter((t: any) => t.name && t.intensity > 0.5)
      .map((t: any) => ({
        id: t.id || `theme-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: t.name,
        description: t.description || '',
        evidence: Array.isArray(t.evidence) ? t.evidence.slice(0, 4) : [],
        lane: t.lane || 'pattern',
        intensity: Math.min(1, t.intensity),
        insightCandidate: !!t.insightCandidate,
        suggestedInsightTitle: t.suggestedInsightTitle || null,
      }));

    // Persist mining results
    const mineKey = `talk:deep-mine:${userId}:${Date.now()}`;
    await kv.set(mineKey, {
      themes: validThemes,
      entryCount: entries.length,
      minedAt: Date.now(),
    });

    // Also store latest mining result for easy access
    const latestKey = `talk:deep-mine:${userId}:latest`;
    await kv.set(latestKey, {
      themes: validThemes,
      entryCount: entries.length,
      minedAt: Date.now(),
    });

    console.log(`[TALK deep-mine] Mined ${validThemes.length} themes from ${entries.length} entries — candidates: ${validThemes.filter((t: any) => t.insightCandidate).length}`);
    return c.json({ themes: validThemes, mined: true, entryCount: entries.length });

  } catch (err) {
    console.log(`[TALK deep-mine] Error: ${err}`);
    return c.json({ themes: [], mined: false, error: `Deep mine failed: ${err}` });
  }
});

// ── TALK: Read latest deep mine results ──
app.get("/make-server-99d14421/talk/deep-mine/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `talk:deep-mine:${userId}:latest`;
    const data = await kv.get(key);
    return c.json({ result: data || null, found: !!data });
  } catch (err) {
    console.log(`[TALK deep-mine read] Error: ${err}`);
    return c.json({ error: `Deep mine read failed: ${err}` }, 500);
  }
});

// ── TALK → ∞MAP: Promote mined theme to constellation node ──
// When a deep-mined theme has insightCandidate: true,
// the user (or system) can promote it to a real constellation node.
app.post("/make-server-99d14421/talk/promote-insight", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', themeId, name, description, lane, suggestedTitle, intensity } = body;

    if (!themeId || !name) {
      return c.json({ error: 'Missing themeId or name in promote payload' }, 400);
    }

    // Store as a user-generated insight node
    const insightKey = `user-insight:${userId}:${themeId}`;
    const insight = {
      id: themeId,
      title: suggestedTitle || name,
      schema: description || name,
      lane: lane || 'pattern',
      intensity: intensity || 0.7,
      source: 'journal-mining',
      createdAt: Date.now(),
      color: lane === 'body' ? '#FFB088' : lane === 'relationship' ? '#A8B5FF' : lane === 'fear' ? '#FF6B6B' : '#B0A0E0',
    };

    await kv.set(insightKey, insight);

    // Initialize an empty KBE profile for this new insight
    const kbeKey = `profile:kbe:${userId}:${themeId}`;
    const existingProfile = await kv.get(kbeKey);
    if (!existingProfile) {
      await kv.set(kbeKey, {
        sessions: [{
          timestamp: Date.now(),
          knowing: intensity * 0.3, // Journal mining = partial knowing
          believing: 0,
          rippleRadius: 0,
          embodyingLocation: null,
          totalDurationMs: 0,
          source: 'journal-mining',
        }],
      });
    }

    console.log(`[TALK→MAP] Promoted theme to insight: ${suggestedTitle || name} (${themeId})`);
    return c.json({ promoted: true, insightId: themeId });
  } catch (err) {
    console.log(`[TALK→MAP promote] Error: ${err}`);
    return c.json({ error: `Promote failed: ${err}` }, 500);
  }
});

// ── ∞MAP: Read user-generated insights ──
app.get("/make-server-99d14421/map/user-insights/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const prefix = `user-insight:${userId}:`;
    const insights = await kv.getByPrefix(prefix);
    return c.json({ insights: insights || [], count: (insights || []).length });
  } catch (err) {
    console.log(`[MAP user-insights] Error: ${err}`);
    return c.json({ error: `User insights read failed: ${err}` }, 500);
  }
});

// ── ∞MAP → TALK: Store/Read Talk Seed ──
// When a user taps a constellation node and chooses "TALK → EXPLORE THIS",
// this route stores the schema/node context for TalkSurface to read.
app.post("/make-server-99d14421/map/talk-seed", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', nodeId, schema, label, integration, timestamp } = body;

    if (!nodeId || !schema) {
      return c.json({ error: 'Missing nodeId or schema in talk seed payload' }, 400);
    }

    const key = `map:talk-seed:${userId}`;
    await kv.set(key, {
      nodeId,
      schema,
      label,
      integration,
      timestamp: timestamp || Date.now(),
    });

    console.log(`[∞MAP→TALK] Talk seed stored: ${label} (${nodeId})`);
    return c.json({ stored: true, nodeId });
  } catch (err) {
    console.log(`[∞MAP→TALK] Talk seed store failed: ${err}`);
    return c.json({ error: `Talk seed store failed: ${err}` }, 500);
  }
});

// ── ∞MAP → TALK: Read talk seed (TalkSurface reads on mount) ──
app.get("/make-server-99d14421/map/talk-seed/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `map:talk-seed:${userId}`;
    const data = await kv.get(key);

    if (data) {
      // Clear after reading (one-shot seed)
      await kv.del(key);
    }

    return c.json({ seed: data || null, found: !!data });
  } catch (err) {
    console.log(`[∞MAP→TALK] Talk seed read failed: ${err}`);
    return c.json({ error: `Talk seed read failed: ${err}` }, 500);
  }
});

// ── TALK → ∞MAP: KBE Nudge from Journal ──
app.post("/make-server-99d14421/talk/kbe-nudge", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', insightId, confidence = 0.5 } = body;

    if (!insightId) {
      return c.json({ error: 'Missing insightId in KBE nudge payload' }, 400);
    }

    const kbeKey = `profile:kbe:${userId}:${insightId}`;
    const profile = await kv.get(kbeKey) || { sessions: [] };

    // Calculate nudge amount — higher confidence = bigger nudge
    const nudgeAmount = 0.03 + confidence * 0.07; // 0.03–0.10 per journal entry
    const lastSession = profile.sessions[profile.sessions.length - 1];

    if (lastSession) {
      // Bump the last session's knowing score
      lastSession.knowing = Math.min(1, (lastSession.knowing || 0) + nudgeAmount);
      lastSession.journalNudges = (lastSession.journalNudges || 0) + 1;
      lastSession.lastJournalNudge = Date.now();
    } else {
      // Create a new session from journal activity alone
      profile.sessions.push({
        timestamp: Date.now(),
        knowing: nudgeAmount,
        believing: 0,
        rippleRadius: 0,
        embodyingLocation: null,
        totalDurationMs: 0,
        source: 'journal',
        journalNudges: 1,
        lastJournalNudge: Date.now(),
      });
    }

    await kv.set(kbeKey, profile);

    console.log(`[TALK→MAP] KBE nudge for ${insightId}: knowing +${nudgeAmount.toFixed(3)} (confidence: ${confidence})`);
    return c.json({ nudged: true, insightId, nudgeAmount });
  } catch (err) {
    console.log(`[TALK→MAP] KBE nudge failed: ${err}`);
    return c.json({ error: `KBE nudge failed: ${err}` }, 500);
  }
});

// ── FORM → ∞MAP: K.B.E. Believing Nudge from Practice Completion ──
// When a practice completes, the schema it worked on gets a Believing bump.
// The body did the work. The constellation reflects it.
app.post("/make-server-99d14421/form/kbe-believing-nudge", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', insightId, practiceId, protocol, pillar, durationMs } = body;

    if (!insightId) {
      return c.json({ error: 'Missing insightId in FORM believing nudge payload' }, 400);
    }

    const kbeKey = `profile:kbe:${userId}:${insightId}`;
    const profile = await kv.get(kbeKey) || { sessions: [] };

    // Calculate believing nudge — longer practice = bigger nudge, max 0.15 per completion
    const durationFactor = Math.min(1, (durationMs || 30000) / 120000); // normalize to 2min max
    const nudgeAmount = 0.05 + durationFactor * 0.10; // 0.05–0.15

    const lastSession = profile.sessions[profile.sessions.length - 1];

    if (lastSession) {
      // Bump the last session's believing score
      lastSession.believing = Math.min(1, (lastSession.believing || 0) + nudgeAmount);
      lastSession.formCompletions = (lastSession.formCompletions || 0) + 1;
      lastSession.lastFormCompletion = Date.now();
      lastSession.lastPracticeId = practiceId;
      lastSession.lastProtocol = protocol;
      lastSession.lastPillar = pillar;
    } else {
      // Create a new session from FORM activity alone
      profile.sessions.push({
        timestamp: Date.now(),
        knowing: 0,
        believing: nudgeAmount,
        rippleRadius: 0,
        embodyingLocation: null,
        totalDurationMs: durationMs || 0,
        source: 'form-practice',
        formCompletions: 1,
        lastFormCompletion: Date.now(),
        lastPracticeId: practiceId,
        lastProtocol: protocol,
        lastPillar: pillar,
      });
    }

    await kv.set(kbeKey, profile);

    console.log(`[FORM→MAP] KBE believing nudge for ${insightId}: believing +${nudgeAmount.toFixed(3)} (practice: ${practiceId}, pillar: ${pillar})`);
    return c.json({ nudged: true, insightId, nudgeAmount, believing: lastSession?.believing || nudgeAmount });
  } catch (err) {
    console.log(`[FORM→MAP] KBE believing nudge failed: ${err}`);
    return c.json({ error: `FORM KBE believing nudge failed: ${err}` }, 500);
  }
});

// ── TALK → FORM: Schema Handoff Persistence ──
// When the SchemaBridge in TALK is tapped, this route stores
// the detected schema so FORM can read it on mount.
app.post("/make-server-99d14421/talk/form-handoff", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', insightId, schema, source, timestamp } = body;

    if (!insightId || !schema) {
      return c.json({ error: 'Missing insightId or schema in handoff payload' }, 400);
    }

    const key = `talk:form-handoff:${userId}`;
    await kv.set(key, {
      insightId,
      schema,
      source: source || 'talk-schema-bridge',
      timestamp: timestamp || Date.now(),
    });

    console.log(`[TALK→FORM] Handoff stored: ${schema} (insight: ${insightId})`);
    return c.json({ stored: true, insightId });
  } catch (err) {
    console.log(`[TALK→FORM] Handoff store failed: ${err}`);
    return c.json({ error: `Handoff store failed: ${err}` }, 500);
  }
});

// ── TALK → FORM: Read handoff (FORM reads on mount) ──
app.get("/make-server-99d14421/talk/form-handoff/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `talk:form-handoff:${userId}`;
    const data = await kv.get(key);

    if (data) {
      // Clear after reading (one-shot handoff)
      await kv.del(key);
    }

    return c.json({ handoff: data || null, found: !!data });
  } catch (err) {
    console.log(`[TALK→FORM] Handoff read failed: ${err}`);
    return c.json({ error: `Handoff read failed: ${err}` }, 500);
  }
});

// ── SYNC → FORM: Store/Read Practice Recommendation ──
// Based on PLOT coordinates + ∞MAP friction analysis,
// the system recommends the most therapeutically relevant practice.
app.post("/make-server-99d14421/sync/recommendation", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', practiceId, practiceName, reason, plotState, frictionInsights } = body;

    if (!practiceId) {
      return c.json({ error: 'Missing practiceId in recommendation payload' }, 400);
    }

    const key = `sync:recommendation:${userId}`;
    await kv.set(key, {
      practiceId,
      practiceName,
      reason,
      plotState,
      frictionInsights,
      timestamp: Date.now(),
    });

    console.log(`[SYNC→FORM] Recommendation stored: ${practiceName} for ${userId}`);
    return c.json({ stored: true, practiceId });
  } catch (err) {
    console.log(`[SYNC→FORM] Recommendation store failed: ${err}`);
    return c.json({ error: `Recommendation store failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/sync/recommendation/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `sync:recommendation:${userId}`;
    const data = await kv.get(key);
    return c.json({ recommendation: data || null, found: !!data });
  } catch (err) {
    console.log(`[SYNC→FORM] Recommendation read failed: ${err}`);
    return c.json({ error: `Recommendation read failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// PLOT — The Coordinates Backend
// ═══════════════════════════════════════════════════
//
// Subjective check-in persistence:
//   plot:current:{userId}  — latest coordinates
//   plot:history:{userId}  — chronological readings

// ── PLOT: Save coordinates ──
app.post("/make-server-99d14421/plot/coordinates", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', coordinates } = body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return c.json({ error: 'Missing coordinates array in PLOT payload' }, 400);
    }

    const ts = Date.now();

    // Save current reading
    const currentKey = `plot:current:${userId}`;
    await kv.set(currentKey, { coordinates, timestamp: ts });

    // Append to history (keep last 50)
    const historyKey = `plot:history:${userId}`;
    const history = await kv.get(historyKey) || { readings: [] };
    history.readings.push({ coordinates, timestamp: ts });
    if (history.readings.length > 50) {
      history.readings = history.readings.slice(-50);
    }
    await kv.set(historyKey, history);

    console.log(`[PLOT] Stored coordinates for ${userId} — ${coordinates.length} dimensions`);
    return c.json({ stored: true, timestamp: ts });
  } catch (err) {
    console.log(`[PLOT] Error storing coordinates: ${err}`);
    return c.json({ error: `PLOT persistence failed: ${err}` }, 500);
  }
});

// ── PLOT: Load coordinates ──
app.get("/make-server-99d14421/plot/coordinates/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const currentKey = `plot:current:${userId}`;
    const data = await kv.get(currentKey);

    if (!data) {
      return c.json({ coordinates: null, found: false });
    }

    return c.json({
      coordinates: data.coordinates,
      timestamp: data.timestamp,
      found: true,
    });
  } catch (err) {
    console.log(`[PLOT] Error loading coordinates: ${err}`);
    return c.json({ error: `PLOT load failed: ${err}` }, 500);
  }
});

// ── PLOT: Load history trajectory ──
app.get("/make-server-99d14421/plot/history/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const historyKey = `plot:history:${userId}`;
    const data = await kv.get(historyKey);

    if (!data || !data.readings) {
      return c.json({ readings: [], count: 0 });
    }

    return c.json({
      readings: data.readings,
      count: data.readings.length,
    });
  } catch (err) {
    console.log(`[PLOT] Error loading history: ${err}`);
    return c.json({ error: `PLOT history load failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// LINK — The Infrastructure Backend
// ═══════════════════════════════════════════════════
//
// Therapist invitation flow:
//   link:invite:{code}     — invitation object
//   link:therapist:{userId} — therapist connection status
//   link:emergency:{userId} — emergency contact
//   link:wearable:{userId}  — wearable connection metadata

// ── LINK: Create therapist invitation ──
app.post("/make-server-99d14421/link/invite", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', therapistEmail, therapistName } = body;

    if (!therapistEmail) {
      return c.json({ error: 'Missing therapistEmail in LINK invite payload' }, 400);
    }

    // Generate a 6-character invite code
    const code = Array.from({ length: 6 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');

    const invite = {
      code,
      userId,
      therapistEmail,
      therapistName: therapistName || null,
      createdAt: Date.now(),
      status: 'pending', // pending | accepted | revoked
      sharedSurfaces: ['plot', 'map', 'talk'], // What the therapist can see
    };

    const inviteKey = `link:invite:${code}`;
    await kv.set(inviteKey, invite);

    // Store reference on the user's therapist connection
    const therapistKey = `link:therapist:${userId}`;
    await kv.set(therapistKey, {
      inviteCode: code,
      therapistEmail,
      therapistName: therapistName || null,
      status: 'pending',
      connectedAt: null,
    });

    console.log(`[LINK] Invitation ${code} created for therapist ${therapistEmail} by ${userId}`);
    return c.json({ code, status: 'pending' });
  } catch (err) {
    console.log(`[LINK] Error creating invite: ${err}`);
    return c.json({ error: `LINK invite failed: ${err}` }, 500);
  }
});

// ── LINK: Get therapist connection status ──
app.get("/make-server-99d14421/link/therapist/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `link:therapist:${userId}`;
    const data = await kv.get(key);
    return c.json({ connection: data || null, found: !!data });
  } catch (err) {
    console.log(`[LINK] Error reading therapist connection: ${err}`);
    return c.json({ error: `LINK therapist read failed: ${err}` }, 500);
  }
});

// ── LINK: Revoke invitation ──
app.post("/make-server-99d14421/link/revoke", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon' } = body;

    const therapistKey = `link:therapist:${userId}`;
    const connection = await kv.get(therapistKey);
    if (connection?.inviteCode) {
      const inviteKey = `link:invite:${connection.inviteCode}`;
      const invite = await kv.get(inviteKey);
      if (invite) {
        invite.status = 'revoked';
        await kv.set(inviteKey, invite);
      }
    }
    await kv.del(therapistKey);

    console.log(`[LINK] Therapist connection revoked for ${userId}`);
    return c.json({ revoked: true });
  } catch (err) {
    console.log(`[LINK] Error revoking: ${err}`);
    return c.json({ error: `LINK revoke failed: ${err}` }, 500);
  }
});

// ── LINK: Save emergency contact ──
app.post("/make-server-99d14421/link/emergency", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', name, phone, relationship } = body;

    if (!name || !phone) {
      return c.json({ error: 'Missing name or phone in emergency contact' }, 400);
    }

    const key = `link:emergency:${userId}`;
    await kv.set(key, {
      name,
      phone,
      relationship: relationship || null,
      updatedAt: Date.now(),
    });

    console.log(`[LINK] Emergency contact saved for ${userId}`);
    return c.json({ stored: true });
  } catch (err) {
    console.log(`[LINK] Error saving emergency contact: ${err}`);
    return c.json({ error: `LINK emergency save failed: ${err}` }, 500);
  }
});

// ── LINK: Get emergency contact ──
app.get("/make-server-99d14421/link/emergency/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `link:emergency:${userId}`;
    const data = await kv.get(key);
    return c.json({ contact: data || null, found: !!data });
  } catch (err) {
    console.log(`[LINK] Error reading emergency contact: ${err}`);
    return c.json({ error: `LINK emergency read failed: ${err}` }, 500);
  }
});

// ── LINK: Wearable connection — save/load ──
app.post("/make-server-99d14421/link/wearable", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', deviceType, deviceName, connected } = body;

    if (!deviceType) {
      return c.json({ error: 'Missing deviceType in wearable payload' }, 400);
    }

    const key = `link:wearable:${userId}:${deviceType}`;
    await kv.set(key, {
      deviceType,
      deviceName: deviceName || deviceType,
      connected: !!connected,
      connectedAt: connected ? Date.now() : null,
      updatedAt: Date.now(),
    });

    console.log(`[LINK] Wearable ${deviceType} ${connected ? 'connected' : 'disconnected'} for ${userId}`);
    return c.json({ stored: true, connected: !!connected });
  } catch (err) {
    console.log(`[LINK] Error saving wearable: ${err}`);
    return c.json({ error: `LINK wearable save failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/link/wearables/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const prefix = `link:wearable:${userId}:`;
    const wearables = await kv.getByPrefix(prefix);
    return c.json({ wearables, count: wearables.length });
  } catch (err) {
    console.log(`[LINK] Error reading wearables: ${err}`);
    return c.json({ error: `LINK wearables read failed: ${err}` }, 500);
  }
});

// ── LINK: Wearable simulation — mock biometric data ──
// Generates realistic-looking heart rate, HRV, and movement data
// that feeds into PLOT coordinates automatically
app.get("/make-server-99d14421/link/wearable-sim/:userId", async (c) => {
  try {
    const { userId } = c.req.param();

    // Check if any wearable is connected
    const prefix = `link:wearable:${userId}:`;
    const wearables = await kv.getByPrefix(prefix);
    const connected = wearables.filter((w: any) => w.value?.connected);

    if (connected.length === 0) {
      return c.json({ simulation: null, connected: false });
    }

    // Generate simulated biometric data
    const now = Date.now();
    const hourOfDay = new Date(now).getHours();
    const isNight = hourOfDay < 7 || hourOfDay > 22;
    const isMorning = hourOfDay >= 7 && hourOfDay <= 10;

    // Circadian rhythm modulation
    const circadianBase = isNight ? 0.3 : isMorning ? 0.6 : 0.5;
    const jitter = () => (Math.random() - 0.5) * 0.15;

    const heartRate = Math.round(55 + circadianBase * 30 + Math.random() * 15);
    const hrv = Math.round(30 + (1 - circadianBase) * 40 + Math.random() * 20);
    const movement = isNight ? 0 : Math.round(circadianBase * 100 + Math.random() * 50);

    // Map to PLOT coordinates
    const clarity = Math.max(0, Math.min(1, (hrv - 20) / 80 + jitter())); // HRV → clarity (higher HRV = clearer thinking)
    const energy = Math.max(0, Math.min(1, circadianBase + jitter())); // Circadian → energy
    const anchorage = Math.max(0, Math.min(1, 1 - (heartRate - 55) / 50 + jitter())); // Low HR → more grounded

    const simulation = {
      heartRate,
      hrv,
      movement,
      coordinates: [
        { id: 'clarity', value: Math.round(clarity * 100) / 100 },
        { id: 'energy', value: Math.round(energy * 100) / 100 },
        { id: 'anchorage', value: Math.round(anchorage * 100) / 100 },
      ],
      timestamp: now,
      source: connected.map((w: any) => w.value?.deviceName).join(', '),
    };

    return c.json({ simulation, connected: true });
  } catch (err) {
    console.log(`[LINK] Error generating wearable simulation: ${err}`);
    return c.json({ error: `Wearable simulation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// JOURNEYS — The E.R.A. Cycle State Persistence
// ═══════════════════════════════════════════════════

// ── Save/update journey state ──
app.post("/make-server-99d14421/journey/state", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', state } = body;

    if (!state || !state.journeyId) {
      return c.json({ error: 'Missing journey state in payload' }, 400);
    }

    const key = `journey:state:${userId}`;
    await kv.set(key, state);

    console.log(`[JOURNEY] State saved: journey=${state.journeyId}, scene=${state.currentScene}, sealed=${state.sealed}`);
    return c.json({ stored: true, journeyId: state.journeyId, scene: state.currentScene });
  } catch (err) {
    console.log(`[JOURNEY] State save failed: ${err}`);
    return c.json({ error: `Journey state save failed: ${err}` }, 500);
  }
});

// ── Read journey state ──
app.get("/make-server-99d14421/journey/state/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `journey:state:${userId}`;
    const data = await kv.get(key);

    return c.json({ state: data || null, found: !!data });
  } catch (err) {
    console.log(`[JOURNEY] State read failed: ${err}`);
    return c.json({ error: `Journey state read failed: ${err}` }, 500);
  }
});

// ── Seal a journey scene (advance state + persist entry) ──
app.post("/make-server-99d14421/journey/seal", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', journeyId, sceneIndex, entry } = body;

    const stateKey = `journey:state:${userId}`;
    const state = await kv.get(stateKey) || {
      journeyId,
      currentScene: 0,
      sealed: false,
      sceneTimestamps: {},
      entries: [],
      startedAt: Date.now(),
      completedAt: null,
    };

    // Record the seal
    const sceneKey = `${journeyId}-${sceneIndex}`;
    state.sealed = true;
    state.sceneTimestamps[sceneKey] = state.sceneTimestamps[sceneKey] || Date.now();

    // Add entry if provided (introspection scenes)
    if (entry && entry.text) {
      state.entries.push({
        sceneId: entry.sceneId,
        text: entry.text,
        timestamp: entry.timestamp || Date.now(),
      });
    }

    // Check if journey is complete (scene 7 = last / anchor)
    if (sceneIndex >= 7) {
      state.completedAt = Date.now();

      // ── JOURNEY Anchor → K.B.E. constellation integration ──
      // When the anchor scene seals, bump the matched insight's KBE scores.
      // The journey's insightId maps to a SEEK insight's KBE profile.
      const insightId = body.insightId || null;
      if (insightId) {
        const kbeKey = `profile:kbe:${userId}:${insightId}`;
        const existing = await kv.get(kbeKey) || { sessions: [] };

        // Compute journey-based KBE bump from introspection depth
        const introspectionEntries = state.entries || [];
        const totalWords = introspectionEntries.reduce(
          (sum: number, e: any) => sum + (e.text ? e.text.split(/\s+/).length : 0), 0
        );
        // Scale: 0.05 base + 0.01 per 20 words of introspection, max 0.15
        const journeyKnowingBump = Math.min(0.15, 0.05 + (totalWords / 20) * 0.01);
        const journeyBelievingBump = Math.min(0.20, 0.08 + (totalWords / 15) * 0.01);

        // Get last session values or default
        const lastSession = existing.sessions.length > 0
          ? existing.sessions[existing.sessions.length - 1]
          : { knowing: 0, believing: 0, rippleRadius: 0, embodyingLocation: null, totalDurationMs: 0 };

        existing.sessions.push({
          timestamp: Date.now(),
          knowing: Math.min(1, (lastSession.knowing || 0) + journeyKnowingBump),
          believing: Math.min(1, (lastSession.believing || 0) + journeyBelievingBump),
          rippleRadius: lastSession.rippleRadius || 0,
          embodyingLocation: lastSession.embodyingLocation || null,
          totalDurationMs: Date.now() - (state.startedAt || Date.now()),
          source: 'journey',
        });

        // Keep last 50
        if (existing.sessions.length > 50) {
          existing.sessions = existing.sessions.slice(-50);
        }
        await kv.set(kbeKey, existing);

        console.log(`[JOURNEY→∞MAP] K.B.E. bump for ${insightId}: K+${journeyKnowingBump.toFixed(2)} B+${journeyBelievingBump.toFixed(2)} (${totalWords} words introspected)`);
      }
    }

    await kv.set(stateKey, state);

    console.log(`[JOURNEY] Scene sealed: journey=${journeyId}, scene=${sceneIndex}, hasEntry=${!!entry?.text}`);
    return c.json({ sealed: true, journeyId, scene: sceneIndex, completed: !!state.completedAt });
  } catch (err) {
    console.log(`[JOURNEY] Seal failed: ${err}`);
    return c.json({ error: `Journey seal failed: ${err}` }, 500);
  }
});

// ── Advance to next scene (called when cadence allows) ──
app.post("/make-server-99d14421/journey/advance", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon' } = body;

    const stateKey = `journey:state:${userId}`;
    const state = await kv.get(stateKey);

    if (!state) {
      return c.json({ error: 'No journey state found' }, 404);
    }

    if (state.completedAt) {
      return c.json({ advanced: false, reason: 'Journey already completed' });
    }

    if (!state.sealed) {
      return c.json({ advanced: false, reason: 'Current scene not yet sealed' });
    }

    // Advance
    state.currentScene = Math.min(7, state.currentScene + 1);
    state.sealed = false;

    // Record timestamp for new scene
    const newSceneKey = `${state.journeyId}-${state.currentScene}`;
    state.sceneTimestamps[newSceneKey] = Date.now();

    await kv.set(stateKey, state);

    console.log(`[JOURNEY] Advanced to scene ${state.currentScene} of ${state.journeyId}`);
    return c.json({ advanced: true, scene: state.currentScene });
  } catch (err) {
    console.log(`[JOURNEY] Advance failed: ${err}`);
    return c.json({ error: `Journey advance failed: ${err}` }, 500);
  }
});

// ── Journey Queue: Auto-select next journey based on ∞MAP friction ──
// When a journey completes, this route computes which insight has the
// highest friction and assigns the corresponding journey.
app.post("/make-server-99d14421/journey/next", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', completedJourneyId, availableJourneyIds } = body;

    if (!availableJourneyIds || availableJourneyIds.length === 0) {
      return c.json({ nextJourneyId: null, reason: 'No journeys available' });
    }

    // Load all KBE profiles to find friction
    const kbePrefix = `profile:kbe:${userId}:`;
    const profiles = await kv.getByPrefix(kbePrefix);

    // Build friction map: insightId → integration score
    const frictionMap: { insightId: string; integration: number }[] = [];

    if (Array.isArray(profiles)) {
      for (const p of profiles as any[]) {
        const sessions = p?.value?.sessions;
        if (sessions && sessions.length > 0) {
          const last = sessions[sessions.length - 1];
          const keyParts = (p.key || '').split(':');
          const insightId = keyParts[keyParts.length - 1];
          if (insightId) {
            const integration = (last.knowing || 0) * 0.3 + (last.believing || 0) * 0.5 +
              Math.min(sessions.length / 10, 1) * 0.2;
            frictionMap.push({ insightId, integration });
          }
        }
      }
    }

    // Sort by friction (lowest integration = most friction)
    frictionMap.sort((a, b) => a.integration - b.integration);

    // Find an available journey whose insightId matches the highest-friction insight
    let nextJourneyId: string | null = null;
    let reason = 'No matching journey found.';

    for (const friction of frictionMap) {
      const match = availableJourneyIds.find(
        (j: any) => j.insightId === friction.insightId && j.id !== completedJourneyId
      );
      if (match) {
        nextJourneyId = match.id;
        reason = `Highest friction: ${friction.insightId} (integration: ${friction.integration.toFixed(2)})`;
        break;
      }
    }

    // Fallback: pick the first non-completed journey
    if (!nextJourneyId) {
      const fallback = availableJourneyIds.find((j: any) => j.id !== completedJourneyId);
      if (fallback) {
        nextJourneyId = fallback.id;
        reason = 'Fallback: next available journey (no friction data)';
      }
    }

    if (nextJourneyId) {
      // Initialize the new journey state
      const stateKey = `journey:state:${userId}`;
      const newState = {
        journeyId: nextJourneyId,
        currentScene: 0,
        sealed: false,
        sceneTimestamps: { [`${nextJourneyId}-0`]: Date.now() },
        entries: [],
        startedAt: Date.now(),
        completedAt: null,
      };
      await kv.set(stateKey, newState);
      console.log(`[JOURNEY Queue] Next journey assigned: ${nextJourneyId} — ${reason}`);
    }

    return c.json({ nextJourneyId, reason });
  } catch (err) {
    console.log(`[JOURNEY Queue] Next journey selection failed: ${err}`);
    return c.json({ error: `Journey queue failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// PLAY — Saved Station Persistence
// ═══════════════════════════════════════════════════

app.post("/make-server-99d14421/play/stations", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', station } = body;
    if (!station || !station.stationId) {
      return c.json({ error: 'Missing station in PLAY save payload' }, 400);
    }
    const key = `play:stations:${userId}`;
    const existing = await kv.get(key) || { stations: [] };
    existing.stations.push(station);
    if (existing.stations.length > 10) existing.stations = existing.stations.slice(-10);
    await kv.set(key, existing);
    console.log(`[PLAY] Station saved: ${station.name} for ${userId}`);
    return c.json({ stored: true, stationId: station.stationId });
  } catch (err) {
    console.log(`[PLAY] Station save failed: ${err}`);
    return c.json({ error: `PLAY station save failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/play/stations/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `play:stations:${userId}`;
    const data = await kv.get(key);
    return c.json({ stations: data?.stations || [], count: (data?.stations || []).length });
  } catch (err) {
    console.log(`[PLAY] Station load failed: ${err}`);
    return c.json({ error: `PLAY station load failed: ${err}` }, 500);
  }
});

app.post("/make-server-99d14421/play/stations/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', stationId } = body;
    if (!stationId) return c.json({ error: 'Missing stationId' }, 400);
    const key = `play:stations:${userId}`;
    const data = await kv.get(key) || { stations: [] };
    data.stations = data.stations.filter((s: any) => s.stationId !== stationId);
    await kv.set(key, data);
    console.log(`[PLAY] Station deleted: ${stationId} for ${userId}`);
    return c.json({ deleted: true, stationId });
  } catch (err) {
    console.log(`[PLAY] Station delete failed: ${err}`);
    return c.json({ error: `PLAY station delete failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// PLAY — User Preferences Persistence (volume, depth)
// ═══════════════════════════════════════════════════

app.post("/make-server-99d14421/play/preferences", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = 'anon', volume, depth, frequencyIndex, threadIndex, beatIndex } = body;
    const key = `play:prefs:${userId}`;
    const existing = await kv.get(key) || {};
    const updated = {
      ...existing,
      ...(volume !== undefined ? { volume } : {}),
      ...(depth !== undefined ? { depth } : {}),
      ...(frequencyIndex !== undefined ? { frequencyIndex } : {}),
      ...(threadIndex !== undefined ? { threadIndex } : {}),
      ...(beatIndex !== undefined ? { beatIndex } : {}),
      updatedAt: Date.now(),
    };
    await kv.set(key, updated);
    console.log(`[PLAY] Preferences saved for ${userId}: vol=${volume}, depth=${depth}, freq=${frequencyIndex}, thread=${threadIndex}, beat=${beatIndex}`);
    return c.json({ ok: true });
  } catch (err) {
    console.log(`[PLAY] Preferences save failed: ${err}`);
    return c.json({ error: `PLAY preferences save failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/play/preferences/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `play:prefs:${userId}`;
    const data = await kv.get(key);
    return c.json({
      volume: data?.volume ?? 0.7,
      depth: data?.depth ?? 0.5,
      frequencyIndex: data?.frequencyIndex ?? 0,
      threadIndex: data?.threadIndex ?? 0,
      beatIndex: data?.beatIndex ?? 0,
    });
  } catch (err) {
    console.log(`[PLAY] Preferences load failed: ${err}`);
    return c.json({ error: `PLAY preferences load failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// SIGNAL MOCK — Fallback when signal-runtime is down
// ═══════════════════════════════════════════════════

app.get("/make-server-99d14421/signal/now/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const plotKey = `plot:current:${userId}`;
    const plotData = await kv.get(plotKey);
    if (!plotData?.coordinates) {
      return c.json({ energy: 0.5, clarity: 0.5, anchorage: 0.5, timestamp: new Date().toISOString(), confidence: 0, source: 'mock-baseline' });
    }
    const coords = plotData.coordinates;
    return c.json({
      energy: coords.find((co: any) => co.dimension === 'energy')?.value ?? 0.5,
      clarity: coords.find((co: any) => co.dimension === 'clarity')?.value ?? 0.5,
      anchorage: coords.find((co: any) => co.dimension === 'anchorage')?.value ?? 0.5,
      timestamp: new Date(plotData.timestamp).toISOString(),
      confidence: 0.6,
      source: 'mock-plot-derived',
    });
  } catch (err) {
    console.log(`[SIGNAL mock now] Error: ${err}`);
    return c.json({ error: `Signal now mock failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/signal/map/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const prefix = `profile:kbe:${userId}:`;
    const profiles = await kv.getByPrefix(prefix);
    const nodes = (profiles || []).map((p: any, idx: number) => {
      const sessions = p.value?.sessions || [];
      const last = sessions[sessions.length - 1] || {};
      const insightId = (p.key || '').split(':').pop() || `node-${idx}`;
      return {
        id: insightId, label: insightId, schema_id: insightId, group: 'kbe',
        integration: (last.knowing || 0) * 0.3 + (last.believing || 0) * 0.5 + Math.min(sessions.length / 10, 1) * 0.2,
        x: 0.5 + Math.cos(idx * 2.4) * 0.3, y: 0.5 + Math.sin(idx * 2.4) * 0.3,
        kbe: { knowing: last.knowing || 0, believing: last.believing || 0, embodying: last.rippleRadius || 0 },
      };
    });
    return c.json({ nodes, groups: [], source: 'mock-kbe-derived' });
  } catch (err) {
    console.log(`[SIGNAL mock map] Error: ${err}`);
    return c.json({ error: `Signal map mock failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/signal/focus-zones/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const key = `signal:focus-zones:${userId}`;
    const data = await kv.get(key);
    return c.json({ zones: data?.zones || [], source: 'mock-kv' });
  } catch (err) {
    console.log(`[SIGNAL mock focus-zones] Error: ${err}`);
    return c.json({ error: `Signal focus-zones mock failed: ${err}` }, 500);
  }
});

app.post("/make-server-99d14421/signal/focus-zones", async (c) => {
  try {
    const body = await c.req.json();
    const { individual_id: userId = 'anon', schema_id, label, priority } = body;
    const key = `signal:focus-zones:${userId}`;
    const data = await kv.get(key) || { zones: [] };
    data.zones.push({ id: `fz-${Date.now()}`, schema_id: schema_id || '', label: label || '', priority: priority || 0, created_at: new Date().toISOString() });
    if (data.zones.length > 5) data.zones = data.zones.slice(-5);
    await kv.set(key, data);
    return c.json({ stored: true });
  } catch (err) {
    console.log(`[SIGNAL mock focus-zones save] Error: ${err}`);
    return c.json({ error: `Signal focus-zone save mock failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/signal/proof/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const limit = parseInt(c.req.query('limit') || '20');
    const seekPrefix = `telemetry:seek:${userId}:`;
    const formPrefix = `telemetry:form:${userId}:`;
    const [seekSessions, formSessions] = await Promise.all([kv.getByPrefix(seekPrefix), kv.getByPrefix(formPrefix)]);
    const receipts: any[] = [];
    (seekSessions || []).slice(-limit / 2).forEach((s: any) => {
      receipts.push({ id: `proof-seek-${s.value?.timestamp || Date.now()}`, type: 'seek_session', label: `SEEK: ${s.value?.insightId || 'Unknown'}`, timestamp: new Date(s.value?.timestamp || Date.now()).toISOString(), schema_id: s.value?.insightId, detail: `K:${(s.value?.knowingScore || 0).toFixed(2)} B:${(s.value?.believingScore || 0).toFixed(2)}` });
    });
    (formSessions || []).slice(-limit / 2).forEach((s: any) => {
      receipts.push({ id: `proof-form-${s.value?.timestamp || Date.now()}`, type: 'form_session', label: `FORM: ${s.value?.practiceId || 'Unknown'}`, timestamp: new Date(s.value?.timestamp || Date.now()).toISOString(), detail: `${s.value?.protocol || 'Unknown'} · ${Math.round((s.value?.totalDurationMs || 0) / 1000)}s` });
    });
    receipts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ receipts: receipts.slice(0, limit), source: 'mock-telemetry-derived' });
  } catch (err) {
    console.log(`[SIGNAL mock proof] Error: ${err}`);
    return c.json({ error: `Signal proof mock failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════
// NAVIGATE MOCK — Fallback when navigate-runtime is down
// ═══════════════════════════════════════════════════

app.get("/make-server-99d14421/navigate/compass/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const therapistKey = `link:therapist:${userId}`;
    const therapist = await kv.get(therapistKey);
    return c.json({ active_domains: ['plot', 'map', 'play', 'talk', 'seek', 'form'], support_level: therapist ? 'connected' : 'solo', last_check_in: null, source: 'mock-link-derived' });
  } catch (err) {
    console.log(`[NAVIGATE mock compass] Error: ${err}`);
    return c.json({ error: `Navigate compass mock failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/navigate/network/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const [therapist, emergency] = await Promise.all([kv.get(`link:therapist:${userId}`), kv.get(`link:emergency:${userId}`)]);
    const contacts: any[] = [];
    if (therapist?.therapistEmail) contacts.push({ id: 'therapist-primary', name: therapist.therapistName || therapist.therapistEmail, role: 'therapist', channel: 'invite', available: therapist.status === 'accepted' });
    if (emergency?.name) contacts.push({ id: 'emergency-primary', name: emergency.name, role: 'emergency', channel: 'phone', available: true });
    return c.json({ contacts, organizations: [], source: 'mock-link-derived' });
  } catch (err) {
    console.log(`[NAVIGATE mock network] Error: ${err}`);
    return c.json({ error: `Navigate network mock failed: ${err}` }, 500);
  }
});

app.get("/make-server-99d14421/navigate/rescue/:userId", async (c) => {
  try {
    const { userId } = c.req.param();
    const emergency = await kv.get(`link:emergency:${userId}`);
    const contacts: any[] = [];
    if (emergency?.name) contacts.push({ id: 'emergency-primary', name: emergency.name, channel: 'phone' });
    return c.json({ sos_available: contacts.length > 0, escalation_level: 'standard', emergency_contacts: contacts, guardrail_copy: 'If you are in immediate danger, please call emergency services.', source: 'mock-link-derived' });
  } catch (err) {
    console.log(`[NAVIGATE mock rescue] Error: ${err}`);
    return c.json({ error: `Navigate rescue mock failed: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);