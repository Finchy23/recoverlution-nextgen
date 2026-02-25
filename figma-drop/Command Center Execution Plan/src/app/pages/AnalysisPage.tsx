/**
 * NAVICUE CATALOG ANALYSIS PAGE
 * 
 * Run the acid test: Can our 300 mechanisms beautifully serve all 1400 NaviCues?
 */

import { useState } from 'react';
import { analyzeNaviCueCatalog, printAnalysisReport } from '@/app/utils/analyzeNaviCueCatalog';
import { colors, surfaces, typography, radius } from '@/design-tokens';

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const analysisReport = await analyzeNaviCueCatalog();
      setReport(analysisReport);
      
      // Also print to console
      printAnalysisReport(analysisReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: surfaces.solid.base,
        color: colors.neutral.white,
        padding: '3rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              ...typography.h1,
              color: colors.neutral.white,
              marginBottom: '0.5rem',
            }}
          >
            NaviCue Catalog Analysis
          </h1>
          <p style={{ ...typography.body, color: colors.neutral.gray[400] }}>
            The Acid Test: Can our 300 mechanisms beautifully serve all 1400 NaviCues?
          </p>
        </div>
        
        {/* Run Button */}
        <button
          onClick={runAnalysis}
          disabled={isLoading}
          style={{
            padding: '1rem 2rem',
            backgroundColor: colors.brand.purple.dark,
            color: colors.neutral.white,
            border: 'none',
            borderRadius: radius.sm,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            marginBottom: '2rem',
          }}
        >
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
        
        {/* Error */}
        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: colors.status.red.dark,
              color: colors.neutral.white,
              borderRadius: radius.sm,
              marginBottom: '2rem',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {/* Report */}
        {report && (
          <div>
            {/* Summary */}
            <div
              style={{
                padding: '2rem',
                backgroundColor: surfaces.glass.medium,
                borderRadius: '12px',
                marginBottom: '2rem',
              }}
            >
              <h2
                style={{
                  ...typography.h2,
                  color: colors.neutral.white,
                  marginBottom: '1rem',
                }}
              >
                Summary
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard label="Total NaviCues" value={report.totalNaviCues} />
                <StatCard label="With Mechanism" value={report.navicuesWithMechanism} color={colors.status.green.bright} />
                <StatCard label="Without Mechanism" value={report.navicuesWithoutMechanism} color={colors.status.red.bright} />
                <StatCard label="Coverage" value={`${report.coveragePercentage.toFixed(1)}%`} color={colors.accent.cyan.primary} />
                <StatCard label="Unique Mechanisms" value={report.uniqueMechanisms.length} color={colors.brand.purple.light} />
              </div>
            </div>
            
            {/* Recommendations */}
            <div
              style={{
                padding: '2rem',
                backgroundColor: surfaces.glass.medium,
                borderRadius: '12px',
                marginBottom: '2rem',
              }}
            >
              <h2
                style={{
                  ...typography.h2,
                  color: colors.neutral.white,
                  marginBottom: '1rem',
                }}
              >
                Recommendations
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {report.recommendations.map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: surfaces.glass.light,
                      borderRadius: radius.sm,
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                    }}
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Breakdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <BreakdownCard title="By Family" data={report.byFamily} />
              <BreakdownCard title="By Form" data={report.byForm} />
              <BreakdownCard title="By KBE Layer" data={report.byKBELayer} />
              <BreakdownCard title="By Intent" data={report.byIntent} />
            </div>
            
            {/* Combinations */}
            <div style={{ marginTop: '2rem' }}>
              <div
                style={{
                  padding: '2rem',
                  backgroundColor: surfaces.glass.medium,
                  borderRadius: '12px',
                }}
              >
                <h2
                  style={{
                    ...typography.h2,
                    color: colors.neutral.white,
                    marginBottom: '1rem',
                  }}
                >
                  Top Form + Intent Combinations
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(report.formIntentCombinations)
                    .sort((a: any, b: any) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([combo, count]: any) => (
                      <div
                        key={combo}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          backgroundColor: surfaces.glass.light,
                          borderRadius: '6px',
                        }}
                      >
                        <span style={{ fontSize: '0.875rem' }}>{combo}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.accent.cyan.primary }}>
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: surfaces.glass.light,
        borderRadius: radius.sm,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: colors.neutral.gray[400], marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || colors.neutral.white }}>
        {value}
      </div>
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: surfaces.glass.medium,
        borderRadius: '12px',
      }}
    >
      <h3
        style={{
          ...typography.h3,
          color: colors.neutral.white,
          marginBottom: '1rem',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([key, count]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                backgroundColor: surfaces.glass.light,
                borderRadius: '6px',
              }}
            >
              <span style={{ fontSize: '0.875rem' }}>{key}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.brand.purple.light }}>
                {count}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}