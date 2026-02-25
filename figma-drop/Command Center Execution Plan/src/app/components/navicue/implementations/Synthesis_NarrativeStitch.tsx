/**
 * SYNTHESIS #5 — The Narrative Stitch
 * "You cannot rip out the sad chapters without ruining the book."
 * ARCHETYPE: Pattern A (Tap) — Stitch torn pages with gold thread
 * ENTRY: Scene-first — torn book pages
 * STEALTH KBE: Connecting disparate parts = Narrative Coherence (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'torn' | 'stitched' | 'resonant' | 'afterglow';

const CHAPTERS = [
  { title: 'Chapter 1: The Victim', tone: 'dark' },
  { title: 'Chapter 2: The Survivor', tone: 'warm' },
  { title: 'Chapter 3: The Thriver', tone: 'gold' },
];

export default function Synthesis_NarrativeStitch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stitched, setStitched] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('torn'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const stitch = () => {
    if (stage !== 'torn') return;
    const next = stitched + 1;
    setStitched(next);
    if (next >= CHAPTERS.length - 1) {
      console.log(`[KBE:B] NarrativeStitch coherence=confirmed stitches=${next}`);
      setStage('stitched');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '8px' }}>
            {CHAPTERS.map((_, i) => (
              <div key={i} style={{ width: '20px', height: '28px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
                transform: `rotate(${(i - 1) * 5}deg)` }} />
            ))}
          </motion.div>
        )}
        {stage === 'torn' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Torn pages. Stitch them together with gold thread.
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {CHAPTERS.map((ch, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ padding: '8px 10px', borderRadius: radius.xs,
                    background: themeColor(i === 0 ? TH.primaryHSL : TH.accentHSL, 0.03 + i * 0.01, 1 + i),
                    border: `1px solid ${themeColor(i === 0 ? TH.primaryHSL : TH.accentHSL, 0.05 + i * 0.02, 3 + i)}` }}>
                    <div style={{ fontSize: '11px', color: i === 0 ? palette.textFaint : themeColor(TH.accentHSL, 0.2 + i * 0.05, 6 + i * 2) }}>
                      {ch.title}
                    </div>
                  </div>
                  {i < CHAPTERS.length - 1 && (
                    <div style={{ width: '12px', height: '2px', borderRadius: '1px',
                      background: i < stitched
                        ? themeColor(TH.accentHSL, 0.2, 8)
                        : themeColor(TH.primaryHSL, 0.04, 2),
                      transition: 'background 0.3s' }} />
                  )}
                </div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={stitch}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>
                Stitch ({stitched}/{CHAPTERS.length - 1})
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'stitched' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            One book. Gold thread between the chapters. Kintsugi for narratives: the scars are the plot points. You cannot rip out the sad chapters without ruining the book. It{"'"}s one story, and it{"'"}s yours.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Narrative coherence. Dan McAdams{"'"} life story model shows that psychological health depends on the ability to construct a coherent narrative from disparate life events, especially painful ones. The kintsugi of autobiography: the gold thread connecting victim, survivor, and thriver isn{"'"}t editing; it{"'"}s authoring. Stitch them in.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Stitched.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}