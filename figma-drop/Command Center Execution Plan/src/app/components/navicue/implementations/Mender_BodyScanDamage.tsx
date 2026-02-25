/**
 * MENDER #9 — The Body Scan (Damage Report)
 * "Your body keeps the score. Ask it what it's holding."
 * INTERACTION: A simple silhouette. Tap body regions to scan them.
 * Each region reveals where tension, grief, or guarding lives.
 * The scan doesn't fix — it witnesses.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('koan_paradox', 'Somatic Regulation', 'embodying', 'Probe');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const BODY_REGIONS = [
  { id: 'head', cx: 50, cy: 10, r: 8, label: 'Head', finding: 'Thoughts circling. Wanting control.' },
  { id: 'throat', cx: 50, cy: 22, r: 5, label: 'Throat', finding: 'Words held back. Things unsaid.' },
  { id: 'chest', cx: 50, cy: 35, r: 10, label: 'Chest', finding: 'Grief or longing. A heaviness.' },
  { id: 'gut', cx: 50, cy: 52, r: 9, label: 'Gut', finding: 'Instinct. Something it already knows.' },
  { id: 'hands', cx: 28, cy: 55, r: 6, label: 'Hands', finding: 'Gripping. Holding on too tight.' },
  { id: 'legs', cx: 50, cy: 75, r: 8, label: 'Legs', finding: 'The urge to run. Or to stay planted.' },
];

export default function Mender_BodyScanDamage({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [scanned, setScanned] = useState<string[]>([]);
  const [activeFinding, setActiveFinding] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleScan = (region: typeof BODY_REGIONS[0]) => {
    if (stage !== 'active' || scanned.includes(region.id)) return;
    const next = [...scanned, region.id];
    setScanned(next);
    setActiveFinding(region.finding);
    if (next.length >= BODY_REGIONS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Somatic Regulation" kbe="embodying" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Your body is speaking.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Ask your body what it's holding.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each region to scan</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Body silhouette as abstract regions */}
            <svg width="180" height="260" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Spine line */}
              <line x1="50" y1="18" x2="50" y2="68" stroke={palette.primaryFaint} strokeWidth="0.5" opacity="0.15" />
              {/* Body regions */}
              {BODY_REGIONS.map(region => {
                const isScanned = scanned.includes(region.id);
                const isLatest = scanned[scanned.length - 1] === region.id;
                return (
                  <g key={region.id} onClick={() => handleScan(region)} style={{ cursor: isScanned ? 'default' : 'pointer' }}>
                    <motion.circle
                      cx={region.cx} cy={region.cy} r={region.r}
                      fill={isScanned ? palette.accentGlow : 'transparent'}
                      stroke={isScanned ? palette.accent : palette.primaryFaint}
                      strokeWidth={isLatest ? 1 : 0.5}
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: isScanned ? 0.5 : 0.2 }}
                      whileHover={!isScanned ? { opacity: 0.4 } : undefined}
                    />
                    <text x={region.cx} y={region.cy + 1} textAnchor="middle" dominantBaseline="middle"
                      fill={isScanned ? palette.text : palette.textFaint}
                      fontSize="3" opacity={isScanned ? 0.6 : 0.25}>
                      {region.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            {/* Active finding */}
            {activeFinding && (
              <motion.div key={activeFinding} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '240px', fontSize: '12px', fontStyle: 'italic' }}>
                {activeFinding}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {scanned.length} of {BODY_REGIONS.length} scanned
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The scan doesn't fix. It witnesses.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Your body keeps the score. Now you've listened.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            What is witnessed can begin to release.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}