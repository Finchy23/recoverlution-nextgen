/**
 * WONDERER #9 — The Mystery Door
 * "Comfort is a coma. Certainty is a prison. Open the third door."
 * ARCHETYPE: Pattern A (Tap) — Three doors: Comfort, Certainty, Mystery
 * ENTRY: Scene-first — three doors
 * STEALTH KBE: Door 3 = Growth-Oriented mindset / Risk Appetite (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Probe');
type Stage = 'arriving' | 'choosing' | 'opened' | 'resonant' | 'afterglow';

const DOORS = [
  { label: 'Comfort', color: themeColor([38, 10, 15], 0.05, 2), description: 'You know this room. Warm. Safe. Small.' },
  { label: 'Certainty', color: themeColor([38, 10, 15], 0.05, 2), description: 'You know what\'s behind this one. No surprises. No growth.' },
  { label: 'Mystery', color: themeColor([275, 16, 40], 0.06, 3), description: 'You have no idea. And that\'s exactly the point.', glows: true },
];

export default function Wonderer_MysteryDoor({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('choosing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const open = (idx: number) => {
    if (stage !== 'choosing') return;
    setChoice(idx);
    const isMystery = idx === 2;
    console.log(`[KBE:B] MysteryDoor choice="${DOORS[idx].label}" growthOriented=${isMystery} riskAppetite=${isMystery}`);
    setStage('opened');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '16px', height: '24px', borderRadius: '3px 3px 0 0',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'choosing' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Three doors. Choose.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {DOORS.map((d, i) => (
                <motion.div key={d.label} whileTap={{ scale: 0.93, y: 2 }} onClick={() => open(i)}
                  animate={d.glows ? { boxShadow: [
                    `0 0 4px ${themeColor(TH.accentHSL, 0.02, 3)}`,
                    `0 0 10px ${themeColor(TH.accentHSL, 0.04, 5)}`,
                    `0 0 4px ${themeColor(TH.accentHSL, 0.02, 3)}`,
                  ] } : {}}
                  transition={d.glows ? { duration: 2.5, repeat: Infinity } : {}}
                  style={{ width: '60px', height: '80px', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                    padding: '8px 4px', gap: '4px',
                    background: d.color,
                    border: `1px solid ${d.glows ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                  {/* Door knob */}
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                    background: d.glows ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.06, 4),
                    alignSelf: 'flex-end', marginRight: '6px', marginBottom: '16px' }} />
                  <span style={{ fontSize: '11px', letterSpacing: '0.06em',
                    color: d.glows ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint }}>{d.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'opened' && choice !== null && (
          <motion.div key="op" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.texture, color: choice === 2
              ? themeColor(TH.accentHSL, 0.4, 14)
              : palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
              {DOORS[choice].description}
            </div>
            {choice === 2 && (
              <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                The unknown is the only door that leads somewhere new. Comfort is a coma. Certainty is a prison. Mystery is alive.
              </div>
            )}
            {choice < 2 && (
              <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                Safe choice. The room is familiar. But Door 3 is still glowing. It always will be. The unknown waits patiently.
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Risk appetite and growth mindset. Carol Dweck{"'"}s research shows that people who choose uncertainty over comfort demonstrate a fundamental belief that they can handle what comes. Door 3, the mystery, is where growth lives. Not because it{"'"}s safe, but because the unknown is the only territory that teaches you something new.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Chosen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}