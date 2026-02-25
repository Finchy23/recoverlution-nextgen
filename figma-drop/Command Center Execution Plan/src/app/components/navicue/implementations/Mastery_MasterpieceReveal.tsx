/**
 * MAGNUM OPUS II #4 — The Masterpiece Reveal
 * "You thought you were painting a picture. You were painting yourself."
 * Pattern A (Type) — Pull cloth from canvas/mirror; sign your name
 * STEALTH KBE: Signing confirms Ownership of Self (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'covered' | 'revealed' | 'signed' | 'resonant' | 'afterglow';

export default function Mastery_MasterpieceReveal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [name, setName] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('covered'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pullCloth = () => {
    if (stage !== 'covered') return;
    setStage('revealed');
  };

  const sign = () => {
    if (!name.trim() || stage !== 'revealed') return;
    console.log(`[KBE:K] MasterpieceReveal signed="${name.trim()}" ownershipOfSelf=true integration=true`);
    setStage('signed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  const typeInt = useTypeInteraction({ onAccept: sign, onChange: (v: string) => setName(v) });

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '40px', borderRadius: '3px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'covered' && (
          <motion.div key="cov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '120px', height: '140px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '8px', color: palette.textFaint, fontStyle: 'italic' }}>covered</div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              A canvas, draped in cloth. Tap to reveal.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={pullCloth}
              style={{ padding: '8px 20px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Pull the cloth</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }}
              style={{ width: '120px', height: '140px', borderRadius: radius.xs,
                background: `linear-gradient(135deg, ${themeColor(TH.primaryHSL, 0.03, 2)}, ${themeColor(TH.accentHSL, 0.04, 3)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `inset 0 0 30px ${themeColor(TH.accentHSL, 0.04, 3)}` }}>
              <div style={{ fontSize: '9px', color: themeColor(TH.accentHSL, 0.3, 10), fontStyle: 'italic' }}>It{"'"}s a mirror.</div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The canvas is a mirror. The art is the life. Sign it.
            </div>
            <input type="text" value={name} onChange={e => typeInt.onChange(e.target.value)} placeholder="Your signature..."
              style={{ background: 'transparent', border: `1px solid ${themeColor(TH.accentHSL, 0.1, 4)}`,
                borderRadius: radius.md, padding: '8px 16px', color: palette.text, fontSize: '12px',
                textAlign: 'center', outline: 'none', width: '160px', fontStyle: 'italic' }} />
            {name.trim() && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }} onClick={sign}
                style={{ padding: '8px 20px', borderRadius: '9999px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Sign</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'signed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Signed: <em>{name.trim()}</em>. You thought you were painting a picture. You were painting yourself. The masterpiece was never the canvas — it was the transformation of the artist. Every brushstroke was a choice. Every choice was self-creation.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Narrative Identity (McAdams): we construct ourselves through the stories we tell about our lives. The act of signing — claiming authorship — transforms passive experience into active creation. You are both the art and the artist.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Authored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}