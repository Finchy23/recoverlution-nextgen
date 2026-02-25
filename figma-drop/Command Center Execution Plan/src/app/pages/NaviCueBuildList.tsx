import { useState, useEffect } from 'react';
import { fetchNaviCueRange } from '@/app/utils/fetchSupabaseData';
import { colors, surfaces, fonts } from '@/design-tokens';

/**
 * NAVICUE BUILD LIST
 * 
 * Displays the next 9 NaviCues to build (items 2-10)
 * Uses the new deterministic range RPC endpoint
 */

export default function NaviCueBuildList() {
  const [navicues, setNavicues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRange = async () => {
      try {
        console.log('🎯 Fetching NaviCues 2-10...');
        const result = await fetchNaviCueRange(2, 10);
        
        console.log('✅ Received range data:', result);
        console.log('📋 IDs:', result.ids);
        console.log('📦 Items:', result.items);
        
        setNavicues(result.items || []);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching range:', err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    loadRange();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: surfaces.solid.base,
          color: colors.neutral.white,
          fontFamily: fonts.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>Loading NaviCues 2-10...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: surfaces.solid.base,
          color: colors.status.red.bright,
          fontFamily: fonts.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>Error</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: surfaces.solid.base,
        color: colors.neutral.white,
        fontFamily: fonts.primary,
        padding: '32px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600, 
          marginBottom: '24px',
          fontFamily: fonts.heading,
        }}>
          Next 9 NaviCues to Build (2-10)
        </h1>

        {navicues.length === 0 ? (
          <div style={{ opacity: 0.5 }}>No NaviCues found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {navicues.map((nc, index) => (
              <div
                key={nc.navicue_type_id || index}
                style={{
                  backgroundColor: surfaces.glass.subtle,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colors.neutral.gray[100]}`,
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  gap: '16px',
                  alignItems: 'flex-start',
                }}>
                  {/* Index */}
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: colors.brand.purple.bright,
                    minWidth: '40px',
                  }}>
                    {index + 2}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    {/* ID */}
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: colors.neutral.gray[400],
                      marginBottom: '8px',
                    }}>
                      {nc.navicue_type_id}
                    </div>

                    {/* Name */}
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '12px',
                      color: colors.neutral.white,
                    }}>
                      {nc.navicue_type_name}
                    </div>

                    {/* Metadata Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '13px',
                    }}>
                      <div>
                        <span style={{ opacity: 0.5 }}>Form: </span>
                        <span style={{ color: colors.brand.blue.bright }}>{nc.form}</span>
                      </div>
                      <div>
                        <span style={{ opacity: 0.5 }}>Intent: </span>
                        <span>{nc.intent}</span>
                      </div>
                      <div>
                        <span style={{ opacity: 0.5 }}>Mechanism: </span>
                        <span>{nc.mechanism}</span>
                      </div>
                      <div>
                        <span style={{ opacity: 0.5 }}>KBE: </span>
                        <span style={{ 
                          color: nc.kbe_layer === 'K' ? colors.status.red.bright : 
                                nc.kbe_layer === 'B' ? colors.status.amber.bright : 
                                colors.status.green.bright 
                        }}>
                          {nc.kbe_layer}
                        </span>
                      </div>
                      {nc.container_type && (
                        <div>
                          <span style={{ opacity: 0.5 }}>Container: </span>
                          <span>{nc.container_type}</span>
                        </div>
                      )}
                      {nc.magic_signature && (
                        <div>
                          <span style={{ opacity: 0.5 }}>Magic: </span>
                          <span style={{ color: colors.brand.purple.bright }}>{nc.magic_signature}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
