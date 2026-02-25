/**
 * GRANDMASTER #2 — The Second Order (The Domino)
 * "Watch the chain fall before you push."
 * ARCHETYPE: Pattern A (Tap) — Tap first domino, watch chain, then confirm
 * ENTRY: Cold open — single domino
 * STEALTH KBE: Watching full animation vs skipping = Consequence Awareness (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'ready' | 'falling' | 'confirm' | 'resonant' | 'afterglow';

export default function Grandmaster_SecondOrder({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [fallenCount, setFallenCount] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const DOMINOS = 5;
  const pushTime = useRef(0);

  useEffect(() => {
    t(() => setStage('ready'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const push = () => {
    if (stage !== 'ready') return;
    pushTime.current = Date.now();
    setStage('falling');
    // Chain falls over 5 seconds
    for (let i = 0; i < DOMINOS; i++) {
      t(() => setFallenCount(c => c + 1), (i + 1) * 1000);
    }
    t(() => setCanConfirm(true), 5000);
  };

  const confirm = () => {
    if (!canConfirm) return;
    const watchTime = Date.now() - pushTime.current;
    console.log(`[KBE:B] SecondOrder watchTimeMs=${watchTime} consequenceAwareness=${watchTime >= 4500}`);
    setStage('confirm');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ width: '8px', height: '20px', background: themeColor(TH.accentHSL, 0.12, 6), borderRadius: '2px' }} />
          </motion.div>
        )}
        {stage === 'ready' && (
          <motion.div key="rdy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Watch the chain fall before you push.
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
              {Array.from({ length: DOMINOS }).map((_, i) => (
                <div key={i} style={{ width: '8px', height: `${20 + i * 8}px`, borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.08 + i * 0.02, 4) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={push}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Push</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'falling' && (
          <motion.div key="fall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
              {Array.from({ length: DOMINOS }).map((_, i) => {
                const fallen = i < fallenCount;
                const label = i === DOMINOS - 1 ? 'The Future' : i === 0 ? 'Action' : '';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <motion.div animate={{ rotate: fallen ? 60 : 0, opacity: fallen ? 0.4 : 1 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: '8px', height: `${20 + i * 8}px`, borderRadius: '2px',
                        background: fallen ? themeColor(TH.accentHSL, 0.15, 6)
                          : themeColor(TH.primaryHSL, 0.08 + i * 0.02, 4),
                        transformOrigin: 'bottom center' }} />
                    {label && <span style={{ fontSize: '11px', color: palette.textFaint }}>{label}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              chain reaction... {fallenCount}/{DOMINOS}
            </div>
            <motion.div animate={{ opacity: canConfirm ? 1 : 0.3 }}
              onClick={confirm}
              style={{ padding: '14px 24px', borderRadius: '9999px',
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                background: canConfirm ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.03, 2),
                border: `1px solid ${canConfirm ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <div style={{ ...navicueType.choice, color: canConfirm ? themeColor(TH.accentHSL, 0.4, 15) : palette.textFaint }}>
                {canConfirm ? 'Confirm' : 'watching...'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'confirm' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              You watched the whole chain fall. Second-order thinking: seeing the consequence of the consequence.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Consequence awareness. First-order thinking is "I{"'"}m hungry, I eat." Second-order is "If I eat this, I sleep poorly, I miss the deadline." The patience to watch the full chain fall before pushing is the mark of strategic depth.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Simulated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}