/**
 * CONSTRUCT #6 — The Council Table (Internal Family Systems)
 * "They are not enemies. They are a committee. Give them seats."
 * ARCHETYPE: Pattern A (Tap) — Tap chairs to assign inner parts
 * ENTRY: Reverse reveal — seats appear first, then meaning unfolds
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'seated' | 'resonant' | 'afterglow';

const PARTS = [
  { id: 'critic', label: 'The Critic', emoji: '\u2694' },
  { id: 'child', label: 'The Child', emoji: '\u2728' },
  { id: 'protector', label: 'The Protector', emoji: '\u26e1' },
  { id: 'rebel', label: 'The Rebel', emoji: '\u26a1' },
  { id: 'dreamer', label: 'The Dreamer', emoji: '\u2601' },
];

export default function Construct_CouncilTable({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [seated, setSeated] = useState<Set<string>>(new Set());
  const [speakToday, setSpeakToday] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const seatPart = (id: string) => {
    const next = new Set(seated);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSeated(next);
    if (next.size >= 3 && !speakToday) {
      setSpeakToday(id);
    }
  };

  const confirm = () => {
    setStage('seated');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const chairPositions = [
    { top: '10px', left: '50%', transform: 'translateX(-50%)' },
    { top: '35px', left: '12%' },
    { top: '35px', right: '12%' },
    { bottom: '10px', left: '20%' },
    { bottom: '10px', right: '20%' },
  ];

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '180px', height: '120px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '70px', height: '50px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`,
                background: themeColor(TH.primaryHSL, 0.08, 4) }} />
              {chairPositions.map((pos, i) => (
                <div key={i} style={{ position: 'absolute', ...pos, width: '18px', height: '18px', borderRadius: '50%',
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`,
                  background: themeColor(TH.primaryHSL, 0.05, 3) }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.25 }}>five empty chairs</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              They are not enemies. They are a committee. Give them seats so they stop shouting.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {PARTS.map((p) => (
                <motion.div key={p.id} onClick={() => seatPart(p.id)} whileTap={{ scale: 0.95 }}
                  style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                    background: seated.has(p.id) ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.06, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, seated.has(p.id) ? 0.14 : 0.06, 6)}`,
                    display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px' }}>{p.emoji}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.04em',
                    color: seated.has(p.id) ? themeColor(TH.accentHSL, 0.4, 15) : palette.textFaint }}>
                    {p.label}
                  </span>
                </motion.div>
              ))}
            </div>
            {seated.size >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={confirm}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>who speaks today?</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'seated' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {PARTS.filter(p => seated.has(p.id)).map(p => (
                <motion.div key={p.id} initial={{ scale: 0.8 }} animate={{ scale: p.id === speakToday ? 1.1 : 1 }}
                  style={{ padding: '8px 12px', borderRadius: radius.md,
                    background: themeColor(TH.accentHSL, p.id === speakToday ? 0.15 : 0.08, 6),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace',
                    color: themeColor(TH.accentHSL, 0.35, 12) }}>{p.label}</span>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>they sit here always</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Internal Family Systems. Visualizing the psyche as distinct parts with permanent seats at a table fosters self-leadership and reduces internal polarization. The committee has a chair now.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Seated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}