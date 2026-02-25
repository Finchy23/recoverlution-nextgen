import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '@/utils/supabaseInfo';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-83873f76`;

interface DataExplorerProps {
  onDataLoaded?: (data: {
    journeyScenes: any[];
    navicueTypes: any[];
    voiceDefaults: any[];
    magicsDefaults: any[];
  }) => void;
}

export function DataExplorer({ onDataLoaded }: DataExplorerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Safe fetch wrapper
        const safeFetch = async (url: string, options?: RequestInit) => {
          try {
            return await fetch(url, options);
          } catch (error) {
            console.warn(`Network unavailable for ${url}`);
            return null;
          }
        };
        
        // Fetch all data in parallel
        const [journeyRes, navicueRes, voiceRes, magicsRes] = await Promise.all([
          safeFetch(`${API_BASE}/journeys/template-scenes`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }),
          safeFetch(`${API_BASE}/navicues/type-catalog`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }),
          safeFetch(`${API_BASE}/navicues/voice-defaults`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }),
          safeFetch(`${API_BASE}/navicues/magics-defaults`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }),
        ]);

        const journeyData = journeyRes && journeyRes.ok ? await journeyRes.json() : { scenes: [] };
        const navicueData = navicueRes && navicueRes.ok ? await navicueRes.json() : { catalog: [] };
        const voiceData = voiceRes && voiceRes.ok ? await voiceRes.json() : { voiceDefaults: [] };
        const magicsData = magicsRes && magicsRes.ok ? await magicsRes.json() : { magicsDefaults: [] };

        const loadedData = {
          journeyScenes: journeyData.scenes || [],
          navicueTypes: navicueData.catalog || [],
          voiceDefaults: voiceData.voiceDefaults || [],
          magicsDefaults: magicsData.magicsDefaults || [],
        };

        setData(loadedData);
        
        // Pass data to parent if callback provided
        if (onDataLoaded) {
          onDataLoaded(loadedData);
        }

        console.log('=== JOURNEY TEMPLATE SCENES ===');
        console.log(loadedData.journeyScenes);
        console.log('\n=== NAVICUE TYPE CATALOG ===');
        console.log(loadedData.navicueTypes);
        console.log('\n=== VOICE DEFAULTS ===');
        console.log(loadedData.voiceDefaults);
        console.log('\n=== MAGICS DEFAULTS ===');
        console.log(loadedData.magicsDefaults);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [onDataLoaded]);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
        Loading data from Supabase...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#ff4444', fontFamily: 'monospace' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}>
      <h3>✅ Data Loaded - Check Console</h3>
      <div style={{ marginTop: '10px', opacity: 0.7 }}>
        <div>Journey Scenes: {data?.journeyScenes?.length || 0}</div>
        <div>NaviCue Types: {data?.navicueTypes?.length || 0}</div>
        <div>Voice Defaults: {data?.voiceDefaults?.length || 0}</div>
        <div>Magics Defaults: {data?.magicsDefaults?.length || 0}</div>
      </div>
    </div>
  );
}