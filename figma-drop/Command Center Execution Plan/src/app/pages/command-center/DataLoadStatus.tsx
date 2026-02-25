/**
 * DATA LOAD STATUS
 * 
 * Shows summary of loaded data at bottom of Command Center
 */

import { colors, fonts } from '@/design-tokens';
import { useCommandCenterStore } from '@/app/stores/commandCenterStore';
import { Check, AlertCircle } from 'lucide-react';

export function DataLoadStatus() {
  const { journeyScenes, allNavicueTypes } = useCommandCenterStore();
  
  // Expected counts (can be updated based on actual database)
  const EXPECTED_JOURNEYS = 13; // 13 scenes per journey template
  const EXPECTED_NAVICUES_MIN = 1400;
  
  const journeysOk = journeyScenes.length >= EXPECTED_JOURNEYS;
  const navicuesOk = allNavicueTypes.length >= EXPECTED_NAVICUES_MIN;
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        backgroundColor: 'rgba(11, 11, 12, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        padding: '12px 20px',
        border: `1px solid ${colors.neutral.gray[100]}`,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        fontFamily: fonts.mono,
        fontSize: '11px',
      }}
    >
      <StatusItem
        label="Journeys"
        count={journeyScenes.length}
        ok={journeysOk}
      />
      
      <div style={{ 
        width: '1px', 
        height: '16px', 
        backgroundColor: colors.neutral.gray[200],
        opacity: 0.3 
      }} />
      
      <StatusItem
        label="NaviCues"
        count={allNavicueTypes.length}
        ok={navicuesOk}
        expected={EXPECTED_NAVICUES_MIN}
      />
    </div>
  );
}

function StatusItem({ 
  label, 
  count, 
  ok, 
  expected 
}: { 
  label: string; 
  count: number; 
  ok: boolean; 
  expected?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {ok ? (
        <Check size={14} style={{ color: colors.status.green.bright }} />
      ) : (
        <AlertCircle size={14} style={{ color: colors.status.amber.bright }} />
      )}
      
      <span style={{ color: colors.neutral.gray[400] }}>
        {label}:
      </span>
      
      <span style={{ 
        color: ok ? colors.neutral.white : colors.status.amber.bright,
        fontWeight: '500'
      }}>
        {count.toLocaleString()}
      </span>
      
      {expected && !ok && (
        <span style={{ 
          color: colors.neutral.gray[500],
          fontSize: '10px'
        }}>
          (expected {expected}+)
        </span>
      )}
    </div>
  );
}