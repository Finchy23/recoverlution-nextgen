import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// ── Supabase client factory ──────────────────────────────────
const supabase = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const PREFIX = "/make-server-7054af08";

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

// ═══════════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════════

app.get(`${PREFIX}/health`, (c) => {
  return c.json({ status: "ok", ts: Date.now() });
});

// ═══════════════════════════════════════════════════════════════
// ATLAS SPINE BUNDLE — Mindblock matrix
// ═══════════════════════════════════════════════════════════════

app.get(`${PREFIX}/atlas/spine-bundle`, async (c) => {
  try {
    const sb = supabase();

    console.log('Loading atlas_spine_bundle_v2...');

    const { data: matrix, error } = await sb
      .from('atlas_spine_bundle_v2')
      .select('*');

    if (error) {
      console.error('atlas_spine_bundle_v2 error:', error);
      return c.json({
        error: `atlas_spine_bundle_v2 query failed: ${error.message}`,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }, 500);
    }

    console.log(`Loaded ${matrix.length} mindblocks from atlas_spine_bundle_v2`);
    if (matrix.length > 0) {
      console.log('Sample columns:', Object.keys(matrix[0]));
    }

    return c.json({ total: matrix.length, matrix });
  } catch (error) {
    console.error('/atlas/spine-bundle error:', error);
    return c.json({ error: `Atlas spine bundle error: ${String(error)}` }, 500);
  }
});

Deno.serve(app.fetch);
