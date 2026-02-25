/**
 * CONSTRUCT #8 — The Workbench / The Skills (Resource Priming)
 * "You are not broken. You just need the right tool."
 * ARCHETYPE: Pattern A (Tap) — Tap a tool to take it off the wall
 * ENTRY: Reverse reveal — pegboard with tools appears, then prompt unfolds
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'selected' | 'resonant' | 'afterglow';

const TOOLS = [
  { id: 'breath', label: 'Breathing', icon: '\u2727' },
  { id: 'ground', label: 'Grounding', icon: '\u25ce' },
  { id: 'reframe', label: 'Reframing', icon: '\u21c4' },
  { id: 'move', label: 'Movement', icon: '\u2609' },
  { id: 'connect', label: 'Connection', icon: '\u2764' },
  { id: 'write', label: 'Writing', icon: '\u270e' },
];

export default function Construct_Workbench({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [picked, setPicked] = useState<string | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const pickTool = (id: string) => {
    if (picked) return;
    setPicked(id);
    setStage('selected');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {TOOLS.map((tool) => (
                <div key={tool.id} style={{ width: '50px', height: '50px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.05, 4)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px', opacity: 0.15 }}>{tool.icon}</span>
                </div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.25 }}>the pegboard</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are not broken. You just need the right tool. Don't use a hammer for a screw.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {TOOLS.map((tool) => (
                <motion.div key={tool.id} onClick={() => pickTool(tool.id)} whileTap={{ scale: 0.94 }}
                  style={{ width: '70px', height: '60px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.08, 4),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px', opacity: 0.3 }}>{tool.icon}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, letterSpacing: '0.04em' }}>
                    {tool.label}
                  </span>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>pick the tool you need</div>
          </motion.div>
        )}
        {stage === 'selected' && picked && (
          <motion.div key="sel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '80px', height: '80px', borderRadius: radius.lg,
                background: themeColor(TH.accentHSL, 0.12, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.14, 10)}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontSize: '22px', opacity: 0.4 }}>{TOOLS.find(t => t.id === picked)?.icon}</span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace',
                color: themeColor(TH.accentHSL, 0.35, 12) }}>
                {TOOLS.find(t => t.id === picked)?.label}
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>in your hand now</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Resource Priming. Visualizing coping mechanisms as external tools to be selected and used reduces helplessness. You are not broken {'\u2014'} you just needed to pick the right instrument.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Equipped.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}