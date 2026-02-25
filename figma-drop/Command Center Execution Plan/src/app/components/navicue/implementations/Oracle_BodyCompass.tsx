/**
 * ORACLE #2 — The Body Compass
 * "Your body knew before your mind did. It always does."
 * ARCHETYPE: Pattern B (Drag) — A human silhouette with a compass needle at gut.
 * Drag to rotate the needle. Body zones light up: gut=gold, chest=blue, throat=red.
 * Somatic Marker Hypothesis.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZONES = [
  { cy: 105, label: 'gut', color: [42, 25, 40], desc: 'tightness, something is wrong' },
  { cy: 75, label: 'chest', color: [210, 20, 40], desc: 'expansion, this is right' },
  { cy: 52, label: 'throat', color: [0, 20, 38], desc: 'constriction, speak the truth' },
];

export default function Oracle_BodyCompass({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const drag = useDragInteraction({
    axis: 'y', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  const zoneIdx = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
  const zone = ZONES[zoneIdx];
  const needleAngle = t * 180 - 90; // -90 → 90

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The body speaks first...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your body knew before your mind did. It always does. The gut tightens. The chest expands. The throat constricts. Listen to the body compass.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward and scan from gut to throat</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '160px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 160 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Silhouette */}
                <ellipse cx="80" cy="35" rx="14" ry="16"
                  fill={themeColor(TH.primaryHSL, 0.04, 8)} />
                <rect x="66" y="50" width="28" height="50" rx="8"
                  fill={themeColor(TH.primaryHSL, 0.035, 8)} />
                <rect x="60" y="100" width="12" height="40" rx="4"
                  fill={themeColor(TH.primaryHSL, 0.03, 8)} />
                <rect x="88" y="100" width="12" height="40" rx="4"
                  fill={themeColor(TH.primaryHSL, 0.03, 8)} />

                {/* Body zones — light up when scanned */}
                {ZONES.map((z, i) => {
                  const active = i === zoneIdx;
                  return (
                    <motion.ellipse key={i} cx="80" cy={z.cy} rx="20" ry="10"
                      fill={`hsla(${z.color[0]}, ${z.color[1]}%, ${z.color[2]}%, ${active ? 0.06 + t * 0.04 : 0.015})`}
                      stroke={`hsla(${z.color[0]}, ${z.color[1]}%, ${z.color[2]}%, ${active ? 0.08 : 0.02})`}
                      strokeWidth={active ? 0.5 : 0.2}
                      animate={{ opacity: active ? 1 : 0.4 }}
                      transition={{ duration: 0.5 }}
                    />
                  );
                })}

                {/* Compass needle at current zone */}
                <motion.g style={{ transformOrigin: '80px 80px' }}
                  animate={{ rotate: needleAngle }}>
                  <line x1="80" y1={zone.cy - 12} x2="80" y2={zone.cy + 12}
                    stroke={`hsla(${zone.color[0]}, ${zone.color[1]}%, ${zone.color[2] + 10}%, 0.12)`}
                    strokeWidth="1" strokeLinecap="round" />
                  <circle cx="80" cy={zone.cy - 12} r="2"
                    fill={`hsla(${zone.color[0]}, ${zone.color[1]}%, ${zone.color[2] + 10}%, 0.15)`} />
                </motion.g>

                {/* Zone label */}
                <motion.text key={zoneIdx} x="80" y="160" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${zone.color[0]}, ${zone.color[1]}%, ${zone.color[2]}%, 0.1)`}
                  initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}>
                  {zone.label}: {zone.desc}
                </motion.text>

                <text x="80" y="174" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 0.95 ? 'FULL SCAN. the body knows' : `scanning: ${zone.label}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'A silhouette. Three signal zones. Start at the gut.' : `Zone: ${zone.label}. ${zone.desc}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You scanned from gut to throat. Three zones, three signals: gut tightness, something is wrong. Chest expansion, this is right. Throat constriction, speak the truth. Your body knew before your mind did. It always does. Listen to the compass.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The somatic marker hypothesis. The body generates affective signals before conscious awareness, integrating vast pattern-matching data into a gut feeling. Trust the compass.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Gut. Chest. Throat.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}