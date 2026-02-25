/**
 * ARCHITECT II #1 — The Memory Palace Repair
 * "You cannot delete the room, but you can renovate it."
 * Pattern A (Tap) — Patch cracked wall, choose new color (meaning)
 * STEALTH KBE: Choosing new frame = Narrative Plasticity / Reconsolidation (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'believing', 'Circuit');
type Stage = 'arriving' | 'cracked' | 'repaired' | 'resonant' | 'afterglow';

const COLORS = [
  { name: 'Warm Gold', desc: 'Wisdom gained', hue: '42, 25%, 38%' },
  { name: 'Cool Blue', desc: 'Acceptance', hue: '210, 18%, 38%' },
  { name: 'Soft Green', desc: 'Growth', hue: '145, 16%, 34%' },
];

export default function Cognitive_MemoryPalaceRepair({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [color, setColor] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('cracked'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const paint = (c: typeof COLORS[0]) => {
    if (stage !== 'cracked') return;
    setColor(c.name);
    console.log(`[KBE:B] MemoryPalaceRepair color="${c.name}" narrativePlasticity=confirmed reconsolidation=true`);
    setStage('repaired');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '24px', borderRadius: '2px',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'cracked' && (
          <motion.div key="cr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A room in your mind with a cracked wall — a bad memory. You cannot delete the room. Renovate it. Choose a new color.
            </div>
            {/* Room with crack */}
            <div style={{ width: '80px', height: '60px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.025, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="30" viewBox="0 0 20 30">
                <path d="M10,0 L8,8 L12,14 L9,22 L11,30" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {COLORS.map(c => (
                <motion.div key={c.name} whileTap={{ scale: 0.9 }} onClick={() => paint(c)}
                  style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                    background: `hsla(${c.hue}, 0.06)`,
                    border: `1px solid hsla(${c.hue}, 0.1)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                    background: `hsla(${c.hue}, 0.08)` }} />
                  <span style={{ fontSize: '11px', color: `hsla(${c.hue}, 0.3)` }}>{c.name}</span>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>{c.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'repaired' && (
          <motion.div key="rp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Repainted: {color}. You cannot delete the room, but you can renovate it. Change the lighting. Hang a new picture. Reclaim the space. The memory stays — but the meaning transforms. The crack becomes a feature, not a flaw. This is not denial; it{"'"}s reconsolidation.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Memory reconsolidation. Karim Nader{"'"}s research: when a memory is recalled, it enters a labile state where it can be modified before being re-stored. This is literally neural renovation — the memory doesn{"'"}t change, but its emotional valence and narrative frame can be updated. EMDR, cognitive processing therapy, and narrative therapy all leverage this window. The palace is always under construction.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Renovated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}