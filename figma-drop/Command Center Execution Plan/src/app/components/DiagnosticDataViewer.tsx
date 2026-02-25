import { useEffect, useState } from 'react';
import { 
  fetchJourneyTemplateScenes, 
  fetchNaviCueTypeCatalog, 
  fetchVoiceDefaults, 
  fetchMagicsDefaults 
} from '@/app/utils/fetchSupabaseData';
import { radius } from '@/design-tokens';

export function DiagnosticDataViewer() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scenes, catalog, voices, magics] = await Promise.all([
          fetchJourneyTemplateScenes(),
          fetchNaviCueTypeCatalog(),
          fetchVoiceDefaults(),
          fetchMagicsDefaults(),
        ]);

        setData({ scenes, catalog, voices, magics });
        setLoading(false);

        // Log everything for analysis
        console.log('=== JOURNEY TEMPLATE SCENES ===');
        console.table(scenes.slice(0, 5));
        console.log('Full scenes data:', scenes);
        
        console.log('\n=== NAVICUE TYPE CATALOG ===');
        console.table(catalog.slice(0, 10));
        console.log('Full catalog data:', catalog);
        
        console.log('\n=== VOICE DEFAULTS ===');
        console.table(voices.slice(0, 5));
        console.log('Full voice data:', voices);
        
        console.log('\n=== MAGICS DEFAULTS ===');
        console.table(magics.slice(0, 5));
        console.log('Full magics data:', magics);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        fontFamily: 'monospace', 
        color: '#4ade80',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        Loading Supabase data for analysis...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ 
        padding: '40px', 
        fontFamily: 'monospace', 
        color: '#f87171',
        fontSize: '14px'
      }}>
        Failed to load data. Check console for errors.
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'monospace', 
      color: '#fff',
      fontSize: '12px',
      background: 'rgba(0,0,0,0.5)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#4ade80' }}>
        ✅ Data Loaded - Analysis Ready
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3 style={{ color: '#a78bfa', marginBottom: '10px' }}>Journey Template Scenes</h3>
          <div style={{ opacity: 0.7 }}>
            <div>Count: {data.scenes?.length || 0}</div>
            <div>Sample Fields: {data.scenes?.[0] ? Object.keys(data.scenes[0]).join(', ') : 'N/A'}</div>
          </div>
        </div>
        
        <div>
          <h3 style={{ color: '#a78bfa', marginBottom: '10px' }}>NaviCue Type Catalog</h3>
          <div style={{ opacity: 0.7 }}>
            <div>Count: {data.catalog?.length || 0}</div>
            <div>Sample Fields: {data.catalog?.[0] ? Object.keys(data.catalog[0]).join(', ') : 'N/A'}</div>
          </div>
        </div>
        
        <div>
          <h3 style={{ color: '#a78bfa', marginBottom: '10px' }}>Voice Defaults</h3>
          <div style={{ opacity: 0.7 }}>
            <div>Count: {data.voices?.length || 0}</div>
            <div>Sample Fields: {data.voices?.[0] ? Object.keys(data.voices[0]).join(', ') : 'N/A'}</div>
          </div>
        </div>
        
        <div>
          <h3 style={{ color: '#a78bfa', marginBottom: '10px' }}>Magics Defaults</h3>
          <div style={{ opacity: 0.7 }}>
            <div>Count: {data.magics?.length || 0}</div>
            <div>Sample Fields: {data.magics?.[0] ? Object.keys(data.magics[0]).join(', ') : 'N/A'}</div>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: 'rgba(74, 222, 128, 0.1)',
        borderRadius: radius.sm,
        border: '1px solid rgba(74, 222, 128, 0.3)'
      }}>
        <div style={{ color: '#4ade80', marginBottom: '10px' }}>📊 Check browser console for detailed tables and full data</div>
        <div style={{ opacity: 0.6, fontSize: '11px' }}>
          Use console.table() output to analyze structure and relationships
        </div>
      </div>
    </div>
  );
}