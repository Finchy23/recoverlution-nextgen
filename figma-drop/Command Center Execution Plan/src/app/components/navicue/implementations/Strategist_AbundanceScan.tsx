/**
 * STRATEGIST #6 — The Abundance Scan
 * "You are not poor. You are resource-blind."
 * INTERACTION: A dark room view. Each tap highlights an "asset" —
 * a glowing outline appears around: Books, Tools, Time, Skills,
 * Network. AR-style tags float beside each. 5 assets found.
 * You were rich all along.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ASSETS = [
  { name: 'Books', icon: '▯', x: 35, y: 45, desc: 'knowledge capital' },
  { name: 'Tools', icon: '◇', x: 145, y: 55, desc: 'leverage capital' },
  { name: 'Time', icon: '◷', x: 90, y: 30, desc: 'attention capital' },
  { name: 'Skills', icon: '✦', x: 55, y: 95, desc: 'human capital' },
  { name: 'Network', icon: '◈', x: 135, y: 100, desc: 'social capital' },
];

export default function Strategist_AbundanceScan({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [scanned, setScanned] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const scan = () => {
    if (stage !== 'active' || scanned >= ASSETS.length) return;
    const next = scanned + 1;
    setScanned(next);
    if (next >= ASSETS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = scanned / ASSETS.length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scanning the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not poor. You are resource-blind. Wealth is not money. Wealth is tools plus knowledge. Count your tools.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to scan for assets</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={scan}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: scanned >= ASSETS.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(180, ${4 + t * 5}%, ${6 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Scan lines — AR feel */}
                {t > 0 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.04 }}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <line key={i} x1="0" y1={i * 20} x2="200" y2={i * 20}
                        stroke="hsla(180, 15%, 40%, 0.03)" strokeWidth="0.3" />
                    ))}
                    {Array.from({ length: 10 }, (_, i) => (
                      <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="160"
                        stroke="hsla(180, 15%, 40%, 0.02)" strokeWidth="0.3" />
                    ))}
                  </motion.g>
                )}

                {/* Corner brackets — AR overlay */}
                <g stroke="hsla(180, 12%, 35%, 0.06)" strokeWidth="0.5" fill="none">
                  <path d="M 10 10 L 10 20 M 10 10 L 20 10" />
                  <path d="M 190 10 L 190 20 M 190 10 L 180 10" />
                  <path d="M 10 150 L 10 140 M 10 150 L 20 150" />
                  <path d="M 190 150 L 190 140 M 190 150 L 180 150" />
                </g>

                {/* Assets — revealed one by one */}
                {ASSETS.map((asset, i) => {
                  const revealed = i < scanned;
                  return (
                    <motion.g key={asset.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: revealed ? 1 : 0.02 }}
                      transition={{ duration: revealed ? 0.8 : 0 }}>
                      {/* Highlight box */}
                      <rect x={asset.x - 15} y={asset.y - 10} width="30" height="20" rx="2"
                        fill="none"
                        stroke={revealed ? `hsla(${180 + i * 20}, 18%, 42%, 0.12)` : 'transparent'}
                        strokeWidth="0.5"
                        strokeDasharray={revealed ? 'none' : '2 2'} />
                      {/* Icon */}
                      <text x={asset.x} y={asset.y + 2} textAnchor="middle" fontSize="11"
                        fill={revealed ? `hsla(${180 + i * 20}, 18%, 45%, 0.15)` : 'hsla(0, 0%, 15%, 0.02)'}>
                        {asset.icon}
                      </text>
                      {/* Label tag */}
                      {revealed && (
                        <motion.g initial={{ opacity: 0, x: -5 }} animate={{ opacity: 0.12, x: 0 }} transition={{ delay: 0.2 }}>
                          <text x={asset.x + 20} y={asset.y - 3} fontSize="11" fontFamily="monospace"
                            fill={`hsla(${180 + i * 20}, 15%, 45%, 0.12)`} fontWeight="500">
                            {asset.name}
                          </text>
                          <text x={asset.x + 20} y={asset.y + 4} fontSize="11" fontFamily="monospace"
                            fill={`hsla(${180 + i * 20}, 10%, 38%, 0.08)`}>
                            {asset.desc}
                          </text>
                          {/* Connector line */}
                          <line x1={asset.x + 15} y1={asset.y} x2={asset.x + 18} y2={asset.y - 1}
                            stroke={`hsla(${180 + i * 20}, 12%, 40%, 0.06)`} strokeWidth="0.3" />
                        </motion.g>
                      )}
                    </motion.g>
                  );
                })}

                {/* Asset count */}
                <text x="100" y="145" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(180, ${10 + t * 10}%, ${30 + t * 10}%, ${0.08 + t * 0.06})`}>
                  {scanned === 0 ? 'scan: 0 assets' : `${scanned} asset${scanned > 1 ? 's' : ''} found`}
                </text>

                {/* Rich label */}
                {t >= 1 && (
                  <motion.text x="100" y="14" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 18%, 48%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    ABUNDANT
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={scanned} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {scanned === 0 ? 'Dark room. Feels empty.' : scanned < ASSETS.length ? `${ASSETS[scanned - 1].name} found. ${ASSETS[scanned - 1].desc}.` : 'Five assets. You were rich all along.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ASSETS.length }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < scanned ? `hsla(${180 + i * 20}, 18%, 45%, 0.5)` : palette.primaryFaint, opacity: i < scanned ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Books, tools, time, skills, network: five assets were always there. You were not poor. You were resource-blind. The scanner lit up what was hiding in plain sight.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Asset-based thinking. Shifting the cognitive bias from deficit to capital increases agency and creative problem-solving. Count the tools. Abundance was always the reality.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Blind. Scan. Abundant.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}