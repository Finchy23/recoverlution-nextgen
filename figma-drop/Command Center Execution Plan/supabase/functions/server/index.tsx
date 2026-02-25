import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
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
app.get("/make-server-83873f76/health", (c) => {
  return c.json({ status: "ok" });
});

// List all storage buckets
app.get("/make-server-83873f76/storage/buckets", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error listing buckets:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ buckets: data });
  } catch (error) {
    console.error('Storage buckets list error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// List files in a bucket
app.get("/make-server-83873f76/storage/:bucket/list", async (c) => {
  try {
    const bucket = c.req.param('bucket');
    const path = c.req.query('path') || '';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('Error listing files:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ files: data });
  } catch (error) {
    console.error('Storage list error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get signed URL for a file
app.get("/make-server-83873f76/storage/:bucket/signed-url", async (c) => {
  try {
    const bucket = c.req.param('bucket');
    const path = c.req.query('path');

    if (!path) {
      return c.json({ error: 'Path parameter is required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Signed URL error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Query storage_assets table for enhanced metadata
app.get("/make-server-83873f76/storage/metadata/assets", async (c) => {
  try {
    const bucket = c.req.query('bucket');
    const path = c.req.query('path');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Query the storage_assets table
    let query = supabase
      .from('storage_assets')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by bucket if provided
    if (bucket) {
      query = query.eq('bucket_id', bucket);
    }
    
    // Filter by path if provided (use path_tokens for folder matching)
    if (path && path !== '') {
      query = query.contains('path_tokens', [path]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error querying storage_assets table:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ assets: data || [] });
  } catch (error) {
    console.error('Storage metadata query error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single asset metadata by ID
app.get("/make-server-83873f76/storage/metadata/asset/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase
      .from('storage_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching asset metadata:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ asset: data });
  } catch (error) {
    console.error('Asset metadata error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Query journey_template_scenes table
app.get("/make-server-83873f76/journeys/template-scenes", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase
      .from('journey_template_scenes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error querying journey_template_scenes:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ scenes: data || [] });
  } catch (error) {
    console.error('Journey template scenes error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Query v_navicue_type_catalog view
app.get("/make-server-83873f76/navicues/type-catalog", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get total count first
    const { count: totalCount, error: countError } = await supabase
      .from('v_navicue_type_catalog')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting v_navicue_type_catalog:', countError);
      return c.json({ error: countError.message }, 500);
    }

    console.log(`📊 Total NaviCues in database: ${totalCount}`);

    // Fetch ALL records using pagination if needed
    const pageSize = 1000; // Supabase default max
    const totalPages = Math.ceil((totalCount || 0) / pageSize);
    
    let allData: any[] = [];
    
    for (let page = 0; page < totalPages; page++) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('v_navicue_type_catalog')
        .select('*')
        .range(from, to);

      if (error) {
        console.error(`Error fetching page ${page + 1}:`, error);
        return c.json({ error: error.message }, 500);
      }

      allData = [...allData, ...(data || [])];
      console.log(`📥 Fetched page ${page + 1}/${totalPages}: ${data?.length || 0} records (Total so far: ${allData.length})`);
    }

    console.log(`✅ Successfully fetched all ${allData.length} NaviCues`);

    return c.json({ 
      catalog: allData, 
      totalCount: totalCount,
      fetchedCount: allData.length,
    });
  } catch (error) {
    console.error('NaviCue type catalog error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==========================================
// NAVICUE RPC ENDPOINTS (Source of Truth)
// ==========================================

// 1. Get filter facets
app.post("/make-server-83873f76/navicues/facets", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log('🎨 Fetching NaviCue filter facets...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/rpc_figma_navicue_type_matrix_facets`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RPC facets error:', response.status, errorText);
      return c.json({ error: `RPC failed: ${response.status}`, details: errorText }, 500);
    }

    const facets = await response.json();
    console.log('✅ Loaded facets:', {
      intents: facets.intents?.length,
      mechanisms: facets.mechanisms?.length,
      kbe_layers: facets.kbe_layers?.length,
      magic_signatures: facets.magic_signatures?.length,
      form_archetypes: facets.form_archetypes?.length,
    });

    return c.json(facets);
  } catch (error) {
    console.error('❌ Facets endpoint error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 2. Get paginated NaviCue matrix (with optional filters)
app.post("/make-server-83873f76/navicues/page", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const body = await c.req.json();
    const {
      p_limit = 100,
      p_offset = 0,
      p_intent = null,
      p_mechanism = null,
      p_kbe_layer = null,
      p_magic_signature = null,
      p_form_archetype = null,
      p_search = null,
    } = body;

    // Enforce max limit of 200
    const limit = Math.min(p_limit, 200);

    console.log(`📥 Fetching NaviCue page: limit=${limit}, offset=${p_offset}`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/rpc_figma_navicue_type_matrix_page`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_limit: limit,
        p_offset,
        p_intent,
        p_mechanism,
        p_kbe_layer,
        p_magic_signature,
        p_form_archetype,
        p_search,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RPC page error:', response.status, errorText);
      return c.json({ error: `RPC failed: ${response.status}`, details: errorText }, 500);
    }

    const result = await response.json();
    console.log(`✅ Page loaded: ${result.rows?.length || 0} rows, has_more=${result.paging?.has_more}`);

    return c.json(result);
  } catch (error) {
    console.error('❌ Page endpoint error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 3. Get single NaviCue detail by exact type ID
app.post("/make-server-83873f76/navicues/detail", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const body = await c.req.json();
    const { p_navicue_type_id } = body;

    if (!p_navicue_type_id) {
      return c.json({ error: 'p_navicue_type_id is required' }, 400);
    }

    console.log(`🔍 Fetching NaviCue detail: ${p_navicue_type_id}`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/rpc_figma_navicue_type_detail`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_navicue_type_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RPC detail error:', response.status, errorText);
      return c.json({ error: `RPC failed: ${response.status}`, details: errorText }, 500);
    }

    const detail = await response.json();
    console.log(`✅ Detail loaded for: ${p_navicue_type_id}`);

    return c.json(detail);
  } catch (error) {
    console.error('❌ Detail endpoint error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 4. Get NaviCue batch (e.g., batch 1 = items 1-10, batch 2 = items 11-20)
app.post("/make-server-83873f76/navicues/batch", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const body = await c.req.json();
    const { p_batch_number, p_batch_size = 10 } = body;

    console.log(`📦 Fetching batch ${p_batch_number} (size ${p_batch_size})...`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/rpc_figma_navicue_type_batch`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        p_batch_number,
        p_batch_size,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RPC batch error:', response.status, errorText);
      return c.json({ error: `RPC failed: ${response.status}`, details: errorText }, 500);
    }

    const result = await response.json();
    console.log(`✅ Batch ${p_batch_number} loaded: ${result.ids?.length || 0} items`);

    return c.json(result);
  } catch (error) {
    console.error('❌ Batch endpoint error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 5. Get NaviCue range (e.g., items 2-10)
app.post("/make-server-83873f76/navicues/range", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const body = await c.req.json();
    const { p_start_seq, p_end_seq } = body;

    console.log(`🎯 Fetching range ${p_start_seq}-${p_end_seq}...`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/rpc_figma_navicue_type_range`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        p_start_seq,
        p_end_seq,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RPC range error:', response.status, errorText);
      return c.json({ error: `RPC failed: ${response.status}`, details: errorText }, 500);
    }

    const result = await response.json();
    console.log(`✅ Range ${p_start_seq}-${p_end_seq} loaded: ${result.ids?.length || 0} items`);

    return c.json(result);
  } catch (error) {
    console.error('❌ Range endpoint error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Helper: Load ALL NaviCues with automatic pagination
app.get("/make-server-83873f76/navicues/all", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    console.log('🎨 Loading ALL NaviCues from v_figma_navicue_type_matrix...');
    
    // Get total count first
    const { count: totalCount, error: countError } = await supabase
      .from('v_figma_navicue_type_matrix')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting v_figma_navicue_type_matrix:', countError);
      return c.json({ error: countError.message }, 500);
    }

    console.log(`📊 Total NaviCues in database: ${totalCount}`);

    // Fetch ALL records using pagination
    const pageSize = 1000; // Supabase default max
    const totalPages = Math.ceil((totalCount || 0) / pageSize);
    
    let allRows: any[] = [];
    
    for (let page = 0; page < totalPages; page++) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('v_figma_navicue_type_matrix')
        .select('*')
        .range(from, to);

      if (error) {
        console.error(`❌ Error fetching page ${page + 1}:`, error);
        return c.json({ error: error.message }, 500);
      }

      allRows = [...allRows, ...(data || [])];
      console.log(`📥 Fetched page ${page + 1}/${totalPages}: ${data?.length || 0} records (Total so far: ${allRows.length})`);
    }

    console.log(`✅ Successfully loaded all ${allRows.length} NaviCues`);
    
    return c.json({
      total: allRows.length,
      rows: allRows,
    });
  } catch (error) {
    console.error('❌ Load all error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Atlas Spine Bundle Matrix - Load the mindblock matrix
app.get("/make-server-83873f76/atlas/spine-bundle", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('🧬 Querying atlas_spine_bundle_v2...');

    // Load all records from the spine bundle matrix
    const { data: matrix, error } = await supabase
      .from('atlas_spine_bundle_v2')
      .select('*');

    if (error) {
      console.error('❌ Error loading atlas_spine_bundle_v2:', error);
      return c.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }, 500);
    }

    console.log(`✅ Loaded ${matrix.length} mindblocks from atlas_spine_bundle_v2`);
    
    // Log first item to see what columns are available
    if (matrix.length > 0) {
      console.log('📊 Sample columns:', Object.keys(matrix[0]));
    }
    
    return c.json({
      total: matrix.length,
      matrix: matrix,
    });
  } catch (error) {
    console.error('❌ Atlas spine bundle error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// DIAGNOSTIC: Get first 10 NaviCues to identify what to build
app.get("/make-server-83873f76/diagnostic/first-10-navicues", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log('🔍 DIAGNOSTIC: Fetching first 10 NaviCues...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/rpc_figma_navicue_type_matrix_page`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_limit: 10,
        p_offset: 0,
        p_intent: null,
        p_mechanism: null,
        p_kbe_layer: null,
        p_magic_signature: null,
        p_form_archetype: null,
        p_search: null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RPC error:', response.status, errorText);
      return c.json({ error: `RPC failed: ${response.status}`, details: errorText }, 500);
    }

    const result = await response.json();
    const rows = result.rows || [];
    
    console.log(`✅ Fetched ${rows.length} NaviCues`);
    
    // Format the list
    const list = rows.map((nc: any, i: number) => ({
      index: i + 1,
      navicue_type_id: nc.navicue_type_id,
      navicue_type_name: nc.navicue_type_name,
      form: nc.form,
      intent: nc.intent,
      mechanism: nc.mechanism,
      kbe_layer: nc.kbe_layer,
      container_type: nc.container_type,
      magic_signature: nc.magic_signature,
    }));
    
    console.log('📋 FIRST 10 NAVICUES:', JSON.stringify(list, null, 2));
    
    return c.json({ 
      count: rows.length,
      list: list,
      raw_first: rows[0], // Full first record for inspection
    });
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);