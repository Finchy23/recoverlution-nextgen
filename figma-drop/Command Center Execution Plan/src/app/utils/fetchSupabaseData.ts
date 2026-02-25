// Temporary utility to fetch Supabase data for design exploration
import { projectId, publicAnonKey } from '@/utils/supabaseInfo';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-83873f76`;

// Safe fetch wrapper that NEVER throws
async function safeFetch(url: string, options?: RequestInit): Promise<Response | null> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.warn(`⚠️ Network unavailable for ${url}`);
    return null;
  }
}

export async function fetchJourneyTemplateScenes() {
  try {
    const response = await safeFetch(`${API_BASE}/journeys/template-scenes`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.scenes || [];
  } catch (error) {
    console.warn('fetchJourneyTemplateScenes failed:', error);
    return [];
  }
}

// ==========================================
// NAVICUE RPC FUNCTIONS (Source of Truth)
// ==========================================

/**
 * Get filter facets for NaviCue matrix
 * Returns: { intents, mechanisms, kbe_layers, magic_signatures, form_archetypes }
 */
export async function fetchNaviCueFacets() {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/facets`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response || !response.ok) {
      return { intents: [], mechanisms: [], kbe_layers: [], magic_signatures: [], form_archetypes: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.warn('fetchNaviCueFacets failed:', error);
    return { intents: [], mechanisms: [], kbe_layers: [], magic_signatures: [], form_archetypes: [] };
  }
}

/**
 * Get paginated NaviCue matrix with optional filters
 * Max p_limit: 200
 */
export async function fetchNaviCuePage(params: {
  p_limit?: number;
  p_offset?: number;
  p_intent?: string | null;
  p_mechanism?: string | null;
  p_kbe_layer?: string | null;
  p_magic_signature?: string | null;
  p_form_archetype?: string | null;
  p_search?: string | null;
}) {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/page`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response || !response.ok) {
      return { rows: [], paging: { total: 0, has_more: false } };
    }
    
    const result = await response.json();
    return {
      rows: result.rows || [],
      paging: result.paging || { total: 0, has_more: false },
    };
  } catch (error) {
    console.warn('fetchNaviCuePage failed:', error);
    return { rows: [], paging: { total: 0, has_more: false } };
  }
}

/**
 * Get single NaviCue detail by exact type ID
 */
export async function fetchNaviCueDetail(navicueTypeId: string) {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/detail`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_navicue_type_id: navicueTypeId }),
    });
    
    if (!response || !response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.warn('fetchNaviCueDetail failed:', error);
    return null;
  }
}

/**
 * Get NaviCue batch (e.g., batch 1 = items 1-10)
 */
export async function fetchNaviCueBatch(batchNumber: number, batchSize: number = 10) {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/batch`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        p_batch_number: batchNumber,
        p_batch_size: batchSize,
      }),
    });
    
    if (!response || !response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.warn('fetchNaviCueBatch failed:', error);
    return [];
  }
}

/**
 * Get NaviCue range (e.g., items 2-10)
 */
export async function fetchNaviCueRange(startSeq: number, endSeq: number) {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/range`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        p_start_seq: startSeq,
        p_end_seq: endSeq,
      }),
    });
    
    if (!response || !response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.warn('fetchNaviCueRange failed:', error);
    return [];
  }
}

/**
 * Helper: Load ALL NaviCues with automatic pagination
 * Uses RPC endpoints under the hood
 */
export async function fetchNaviCueTypeMatrix() {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/all`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    
    if (!response || !response.ok) {
      console.warn('⚠️ fetchNaviCueTypeMatrix: Network unavailable, returning empty array');
      return [];
    }
    
    const result = await response.json();
    console.log('📦 Received NaviCue data:', { total: result.total, rowCount: result.rows?.length });
    return result.rows || [];
  } catch (error) {
    console.warn('fetchNaviCueTypeMatrix failed:', error);
    return [];
  }
}

// ==========================================
// DEPRECATED - Legacy endpoints
// ==========================================

export async function fetchNaviCueTypeCatalog() {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/type-catalog`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.catalog || [];
  } catch (error) {
    console.warn('fetchNaviCueTypeCatalog failed:', error);
    return [];
  }
}

export async function fetchVoiceDefaults() {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/voice-defaults`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.voiceDefaults || [];
  } catch (error) {
    console.warn('fetchVoiceDefaults failed:', error);
    return [];
  }
}

export async function fetchMagicsDefaults() {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/magics-defaults`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.magicsDefaults || [];
  } catch (error) {
    console.warn('fetchMagicsDefaults failed:', error);
    return [];
  }
}

export async function fetchSingleNaviCue(identifier: string) {
  try {
    const response = await safeFetch(`${API_BASE}/navicues/spine-matrix/${encodeURIComponent(identifier)}`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    
    if (!response || !response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.warn('fetchSingleNaviCue failed:', error);
    return null;
  }
}

export async function fetchDiagnosticTables() {
  try {
    const response = await safeFetch(`${API_BASE}/diagnostic/tables`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    if (!response || !response.ok) return {};
    return await response.json();
  } catch (error) {
    console.warn('fetchDiagnosticTables failed:', error);
    return {};
  }
}