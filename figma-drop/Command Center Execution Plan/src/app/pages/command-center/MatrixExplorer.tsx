import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import { projectId, publicAnonKey } from '@/utils/supabaseInfo';
import { Database, Activity, Grid3x3, Layers } from 'lucide-react';

/**
 * MATRIX EXPLORER
 * 
 * Visualize and understand atlas_spine_bundle_v2
 * - The mindblock matrix that drives NaviCue selection
 * - Understand the TARGET → BUILD → RECEIPT flow
 * - Map mindblock IDs to NaviCue types
 */

interface MindblockMatrix {
  [key: string]: any; // Will populate after we see the data structure
}

export function MatrixExplorer() {
  const [matrix, setMatrix] = useState<MindblockMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<MindblockMatrix | null>(null);

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      try {
        response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-83873f76/atlas/spine-bundle`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
      } catch (fetchError) {
        console.warn('Network unavailable:', fetchError);
        setLoading(false);
        setError('Network unavailable');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load matrix: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🧬 Atlas Spine Bundle Matrix loaded:', data);
      
      setMatrix(data.matrix || []);
    } catch (err) {
      console.error('Error loading matrix:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for analysis
  const getUniqueValues = (key: string) => {
    const values = new Set<string>();
    matrix.forEach(block => {
      const value = block[key];
      if (value !== null && value !== undefined) {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };

  // Get matrix dimensions
  const matrixStats = {
    totalBlocks: matrix.length,
    phases: getUniqueValues('phase'),
    layers: getUniqueValues('layer'),
    kbeStates: getUniqueValues('kbe_state'),
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: surfaces.solid.base,
        overflow: 'auto',
        padding: '32px',
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.accent.cyan.primary}, ${colors.brand.purple.light})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={24} color={colors.neutral.white} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: fonts.primary,
                  fontSize: '32px',
                  fontWeight: '700',
                  color: colors.neutral.white,
                  margin: 0,
                }}
              >
                Matrix Explorer
              </h1>
              <p
                style={{
                  fontFamily: fonts.mono,
                  fontSize: '13px',
                  color: colors.neutral.gray[400],
                  margin: 0,
                }}
              >
                atlas_spine_bundle_v2 • The Mindblock Matrix
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px',
              color: colors.neutral.gray[400],
              fontFamily: fonts.primary,
            }}
          >
            Loading matrix...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: '24px',
              backgroundColor: colors.status.red.dim,
              border: `1px solid ${colors.status.red.bright}`,
              borderRadius: '12px',
              color: colors.status.red.bright,
              fontFamily: fonts.primary,
            }}
          >
            Error: {error}
          </div>
        )}

        {/* Matrix Data */}
        {!loading && !error && matrix.length > 0 && (
          <>
            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              <StatCard
                icon={Grid3x3}
                label="Total Mindblocks"
                value={matrixStats.totalBlocks.toLocaleString()}
                color={colors.accent.cyan.primary}
              />
              <StatCard
                icon={Layers}
                label="Phases"
                value={matrixStats.phases.length.toString()}
                color={colors.brand.purple.light}
                sublabel={matrixStats.phases.join(', ')}
              />
              <StatCard
                icon={Activity}
                label="Layers"
                value={matrixStats.layers.length.toString()}
                color={colors.status.green.bright}
                sublabel={`${matrixStats.layers.length} dimensional layers`}
              />
              <StatCard
                icon={Database}
                label="KBE States"
                value={matrixStats.kbeStates.length.toString()}
                color={colors.status.amber.bright}
                sublabel={matrixStats.kbeStates.join(', ')}
              />
            </div>

            {/* Matrix Structure Analysis */}
            <div
              style={{
                backgroundColor: surfaces.solid.elevated,
                border: `1px solid ${colors.neutral.gray[800]}`,
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
              }}
            >
              <h2
                style={{
                  fontFamily: fonts.primary,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: colors.neutral.white,
                  marginBottom: '16px',
                }}
              >
                Matrix Structure
              </h2>
              
              {/* Show first item's keys */}
              {matrix[0] && (
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: '12px',
                    color: colors.neutral.gray[400],
                  }}
                >
                  <div style={{ marginBottom: '12px', color: colors.neutral.gray[500] }}>
                    Columns in atlas_spine_bundle_v2:
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {Object.keys(matrix[0]).map((key) => (
                      <div
                        key={key}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: colors.neutral.gray[900],
                          borderRadius: '6px',
                          color: colors.accent.cyan.primary,
                        }}
                      >
                        {key}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sample Data */}
            <div
              style={{
                backgroundColor: surfaces.solid.elevated,
                border: `1px solid ${colors.neutral.gray[800]}`,
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <h2
                style={{
                  fontFamily: fonts.primary,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: colors.neutral.white,
                  marginBottom: '16px',
                }}
              >
                Sample Mindblocks (First 10)
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {matrix.slice(0, 10).map((block, index) => (
                  <motion.div
                    key={index}
                    onClick={() => setSelectedBlock(block)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      padding: '16px',
                      backgroundColor: selectedBlock === block 
                        ? colors.neutral.gray[800]
                        : colors.neutral.gray[900],
                      border: `1px solid ${
                        selectedBlock === block 
                          ? colors.accent.cyan.primary 
                          : colors.neutral.gray[800]
                      }`,
                      borderRadius: radius.sm,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <pre
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: '11px',
                        color: colors.neutral.gray[300],
                        margin: 0,
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(block, null, 2)}
                    </pre>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected Block Details */}
            {selectedBlock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '32px',
                  backgroundColor: surfaces.solid.elevated,
                  border: `2px solid ${colors.accent.cyan.primary}`,
                  borderRadius: '16px',
                  padding: '24px',
                }}
              >
                <h2
                  style={{
                    fontFamily: fonts.primary,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: colors.neutral.white,
                    marginBottom: '16px',
                  }}
                >
                  Selected Mindblock Details
                </h2>
                <pre
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: '12px',
                    color: colors.neutral.gray[300],
                    margin: 0,
                    overflow: 'auto',
                    backgroundColor: colors.neutral.gray[900],
                    padding: '16px',
                    borderRadius: radius.sm,
                  }}
                >
                  {JSON.stringify(selectedBlock, null, 2)}
                </pre>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  color: string;
  sublabel?: string;
}

function StatCard({ icon: Icon, label, value, color, sublabel }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      style={{
        padding: '20px',
        backgroundColor: surfaces.solid.elevated,
        border: `1px solid ${colors.neutral.gray[800]}`,
        borderRadius: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}
      >
        <Icon size={20} color={color} />
        <div
          style={{
            fontFamily: fonts.primary,
            fontSize: '12px',
            fontWeight: '500',
            color: colors.neutral.gray[400],
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontFamily: fonts.primary,
          fontSize: '32px',
          fontWeight: '700',
          color: colors.neutral.white,
          marginBottom: sublabel ? '4px' : 0,
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: '11px',
            color: colors.neutral.gray[500],
          }}
        >
          {sublabel}
        </div>
      )}
    </motion.div>
  );
}