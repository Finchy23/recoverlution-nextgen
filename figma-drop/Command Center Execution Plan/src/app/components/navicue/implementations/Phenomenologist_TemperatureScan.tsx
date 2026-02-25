/**
 * PHENOMENOLOGIST #5 — The Temperature Scan
 * "Temperature is data. It is not 'good' or 'bad.' It is just physics."
 * INTERACTION: A thermal-camera-style body overlay. Tap regions to
 * read temperature — warm/cool zones mapped without judgment. Pure
 * interoceptive data collection.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Somatic Regulation', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZONES = [
  { id: 'head', label: 'Head', x: 100, y: 25, r: 18, temp: 'warm', reading: '36.8°', color: 'hsla(15, 60%, 50%, 0.5)' },
  { id: 'chest', label: 'Chest', x: 100, y: 60, r: 22, temp: 'hot', reading: '37.2°', color: 'hsla(5, 70%, 50%, 0.5)' },
  { id: 'hands', label: 'Hands', x: 55, y: 90, r: 12, temp: 'cool', reading: '31.4°', color: 'hsla(210, 40%, 50%, 0.5)' },
  { id: 'gut', label: 'Gut', x: 100, y: 95, r: 18, temp: 'warm', reading: '36.5°', color: 'hsla(25, 50%, 50%, 0.5)' },
  { id: 'feet', label: 'Feet', x: 100, y: 150, r: 14, temp: 'cold', reading: '28.7°', color: 'hsla(220, 50%, 55%, 0.5)' },
];

export default function Phenomenologist_TemperatureScan({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [scanned, setScanned] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const scanZone = (id: string) => {
    if (stage !== 'active' || scanned.includes(id)) return;
    const next = [...scanned, id];
    setScanned(next);
    if (next.length >= ZONES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Somatic Regulation" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Calibrating thermal scan...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Where is the heat in your body? Where is the cold? Temperature is data. Just physics.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each zone to read the map</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Thermal body map */}
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 15%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Body silhouette — minimal wireframe */}
                <ellipse cx="100" cy="25" rx="14" ry="16" fill="none" stroke="hsla(0, 0%, 30%, 0.15)" strokeWidth="0.5" />
                <line x1="100" y1="41" x2="100" y2="110" stroke="hsla(0, 0%, 30%, 0.12)" strokeWidth="0.5" />
                <line x1="100" y1="55" x2="55" y2="90" stroke="hsla(0, 0%, 30%, 0.12)" strokeWidth="0.5" />
                <line x1="100" y1="55" x2="145" y2="90" stroke="hsla(0, 0%, 30%, 0.12)" strokeWidth="0.5" />
                <line x1="100" y1="110" x2="80" y2="155" stroke="hsla(0, 0%, 30%, 0.12)" strokeWidth="0.5" />
                <line x1="100" y1="110" x2="120" y2="155" stroke="hsla(0, 0%, 30%, 0.12)" strokeWidth="0.5" />
                {/* Thermal zones */}
                {ZONES.map(zone => {
                  const isScanned = scanned.includes(zone.id);
                  return (
                    <g key={zone.id} onClick={() => scanZone(zone.id)} style={{ cursor: isScanned ? 'default' : 'pointer' }}>
                      <motion.circle cx={zone.x} cy={zone.y} r={zone.r}
                        fill={isScanned ? zone.color : 'hsla(0, 0%, 25%, 0.15)'}
                        stroke={isScanned ? zone.color : 'hsla(0, 0%, 30%, 0.2)'}
                        strokeWidth="0.5"
                        animate={{ opacity: isScanned ? 0.6 : 0.2 }}
                        whileHover={{ opacity: 0.4 }}
                      />
                      {/* Temperature reading */}
                      {isScanned && (
                        <motion.text x={zone.x} y={zone.y + 3}
                          textAnchor="middle" fontSize="11" fontFamily="monospace"
                          fill="hsla(0, 0%, 90%, 0.6)"
                          initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}>
                          {zone.reading}
                        </motion.text>
                      )}
                      {/* Zone label */}
                      {!isScanned && (
                        <text x={zone.x} y={zone.y + 3}
                          textAnchor="middle" fontSize="11" fontFamily="monospace"
                          fill="hsla(0, 0%, 50%, 0.2)">
                          ?
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              {/* Scan line effect */}
              <motion.div
                animate={{ y: [0, 170, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'hsla(180, 40%, 50%, 0.06)', pointerEvents: 'none' }}
              />
            </div>
            {/* Last scanned readout */}
            {scanned.length > 0 && (
              <motion.div key={scanned[scanned.length - 1]} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                <div style={{ fontSize: '11px', color: ZONES.find(z => z.id === scanned[scanned.length - 1])?.color, opacity: 0.6 }}>
                  {ZONES.find(z => z.id === scanned[scanned.length - 1])?.label}: {ZONES.find(z => z.id === scanned[scanned.length - 1])?.temp}
                </div>
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {scanned.length}/{ZONES.length} zones mapped
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The map is read. Temperature is data. Not good or bad. Just physics.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Interoceptive accuracy improved. Internal signals clearer. Regulation follows awareness.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Warm. Cool. Data. Physics.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}