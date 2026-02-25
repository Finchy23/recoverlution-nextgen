/**
 * ADAPTIVE #6 -- The Compost Bin
 * "Nothing is wasted. The worst days are the best fertilizer."
 * ARCHETYPE: Pattern A (Tap) -- Choose "Recycle" vs "Delete" for bad memories
 * ENTRY: Scene-first -- rotten items
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'blooming' | 'resonant' | 'afterglow';

export default function Adaptive_CompostBin({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'recycle' | 'delete' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const act = (c: 'recycle' | 'delete') => {
    if (stage !== 'active') return;
    setChoice(c);
    console.log(`[KBE:B] CompostBin action=${c} postTraumaticGrowth=${c === 'recycle'}`);
    setStage('blooming');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '8px', borderRadius: radius.sm, border: `1px dashed ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>rotten days</span>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The bad day. What do you do with it?
            </div>
            <div style={{ padding: '10px 14px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px dashed ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>rotten days</span>
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => act('delete')}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: 'hsla(0, 18%, 28%, 0.05)', border: '1px solid hsla(0, 18%, 35%, 0.1)' }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 25%, 40%, 0.4)' }}>Delete</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => act('recycle')}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Recycle</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'blooming' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'recycle' ? (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}
                style={{ width: '30px', height: '30px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px' }}>{'\u2727'}</span>
              </motion.div>
            ) : null}
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'recycle'
                ? 'Composted. Time sped up. Flowers bloomed from the rot. Nothing was wasted.'
                : 'Deleted. Gone forever. But the soil stays barren. No growth from nothing.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Post-traumatic growth. Nothing is wasted. The worst days are the best fertilizer, if you recycle them instead of deleting them. Composting transforms the rotten into the nutritious. Let it rot. It feeds the next season.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Composted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}